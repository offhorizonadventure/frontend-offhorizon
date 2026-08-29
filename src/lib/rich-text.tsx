import { Fragment, type ReactNode } from "react";

/**
 * The small amount of formatting the admin panel can put in a description:
 * bold, italic, a link, a line break. Nothing else.
 *
 * The text is parsed into React elements rather than handed to the browser as
 * HTML. Nothing here can put a script or an attribute on the page, whatever
 * ends up in the database, because there is no path from this text to innerHTML
 * at all. Anything that is not on the short list below is shown as the literal
 * characters somebody typed.
 *
 * Descriptions written before this existed are plain text with no tags, and
 * come through unchanged.
 */

export type RichNode = string | { tag: Tag; href?: string; children: RichNode[] };

type Tag = "strong" | "em" | "a" | "br";

const TAGS: Record<string, Tag> = {
  strong: "strong",
  b: "strong",
  em: "em",
  i: "em",
  a: "a",
  br: "br",
};

/**
 * The editor wraps everything in paragraphs. These descriptions are shown
 * inside a paragraph already, so the wrappers are dropped rather than nested,
 * and the breaks between them are kept.
 */
const IGNORED = new Set(["p", "div"]);

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
  nbsp: "\u00a0",
};

const decode = (value: string) =>
  value.replace(/&(#\d+|[a-zA-Z]+);/g, (whole, name: string) => {
    if (Object.hasOwn(ENTITIES, name)) return ENTITIES[name];

    const numeric = /^#(\d+)$/.exec(name);
    if (!numeric) return whole;

    const code = Number(numeric[1]);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });

/**
 * Only somewhere a link can actually go. A `javascript:` address, or anything
 * else clever, is not a link and the text is kept without one.
 */
const safeHref = (value: string) => {
  const href = decode(value).trim();
  if (!href) return null;

  return /^(https?:\/\/|mailto:|tel:|\/)/i.test(href) && !/[\u0000-\u001f]/.test(href)
    ? href
    : null;
};

const TOKEN = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g;
const HREF = /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'<>]+))/i;

export function parseRich(input: string | null | undefined): RichNode[] {
  const text = input ?? "";
  if (!text) return [];

  const root: RichNode[] = [];
  const stack: { tag: Tag; href?: string; children: RichNode[] }[] = [];
  const top = () => (stack.length ? stack[stack.length - 1].children : root);

  let at = 0;
  TOKEN.lastIndex = 0;

  for (let match = TOKEN.exec(text); match; match = TOKEN.exec(text)) {
    const [whole, rawName, attributes] = match;
    const tag = TAGS[rawName.toLowerCase()];

    const lower = rawName.toLowerCase();

    // Dropped outright: the tag goes, the words inside it stay.
    if (IGNORED.has(lower)) {
      if (match.index > at) top().push(decode(text.slice(at, match.index)));
      at = match.index + whole.length;
      continue;
    }

    // Not one of ours. It is text, and React will show the characters.
    if (!tag) continue;

    if (match.index > at) top().push(decode(text.slice(at, match.index)));
    at = match.index + whole.length;

    if (whole.startsWith("</")) {
      const open = stack.findLastIndex((entry) => entry.tag === tag);
      if (open === -1) continue;

      // A tag left open inside this one is closed here too, so the tree cannot
      // be knotted by careless markup.
      while (stack.length > open) {
        const done = stack.pop()!;
        (stack.length ? stack[stack.length - 1].children : root).push(done);
      }

      continue;
    }

    if (tag === "br") {
      top().push({ tag, children: [] });
      continue;
    }

    if (tag === "a") {
      const found = HREF.exec(attributes ?? "");
      const href = found ? safeHref(found[2] ?? found[3] ?? found[4] ?? "") : null;

      // A link with nowhere safe to go keeps its words and loses the link.
      stack.push(href ? { tag, href, children: [] } : { tag: "em", children: [] });
      continue;
    }

    stack.push({ tag, children: [] });
  }

  if (at < text.length) top().push(decode(text.slice(at)));

  while (stack.length) {
    const done = stack.pop()!;
    (stack.length ? stack[stack.length - 1].children : root).push(done);
  }

  return root;
}

/** The words on their own, for counting and for search engines. */
export const richToText = (nodes: RichNode[]): string =>
  nodes
    .map((node) =>
      typeof node === "string" ? node : node.tag === "br" ? "\n" : richToText(node.children),
    )
    .join("");

/**
 * Cuts to a number of words while keeping the formatting around them intact,
 * so a description can be shortened without splitting a link in half.
 */
export function truncateRich(nodes: RichNode[], words: number) {
  let left = words;

  const walk = (list: RichNode[]): RichNode[] => {
    const out: RichNode[] = [];

    for (const node of list) {
      if (left <= 0) break;

      if (typeof node === "string") {
        const parts = node.split(/(\s+)/);
        let taken = "";

        for (const part of parts) {
          if (/^\s*$/.test(part)) {
            taken += part;
            continue;
          }

          if (left <= 0) break;
          taken += part;
          left -= 1;
        }

        out.push(taken);
        continue;
      }

      if (node.tag === "br") {
        out.push(node);
        continue;
      }

      out.push({ ...node, children: walk(node.children) });
    }

    return out;
  };

  const kept = walk(nodes);

  return { nodes: kept, truncated: left <= 0 };
}

export function RichText({ nodes }: { nodes: RichNode[] }): ReactNode {
  return nodes.map((node, index) => {
    if (typeof node === "string") return <Fragment key={index}>{node}</Fragment>;

    const children = <RichText nodes={node.children} />;

    if (node.tag === "br") return <br key={index} />;
    if (node.tag === "strong") return <strong key={index}>{children}</strong>;
    if (node.tag === "em") return <em key={index}>{children}</em>;

    const external = /^https?:\/\//i.test(node.href ?? "");

    return (
      <a
        key={index}
        href={node.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="decoration-ember-500/50 hover:decoration-ember-500 underline underline-offset-[3px] transition-colors"
      >
        {children}
      </a>
    );
  });
}

/** Parse and render in one go, for the places that do not need to count words. */
export const Rich = ({ text }: { text: string | null | undefined }) => (
  <RichText nodes={parseRich(text)} />
);
