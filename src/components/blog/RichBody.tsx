import Image from "next/image";
import type { ReactNode } from "react";

import type { RichDoc, RichNode } from "@/lib/blog";

/** Renders the editor's document. */

const measure = "mx-auto max-w-[38rem]";

/** Bold, italic, strikethrough, inline code and links, innermost first. */
function withMarks(text: string, marks: RichNode["marks"], key: number): ReactNode {
  let node: ReactNode = text;

  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        node = <strong className="text-brand-900 font-semibold">{node}</strong>;
        break;
      case "italic":
        node = <em>{node}</em>;
        break;
      case "strike":
        node = <s className="text-brand-900/45">{node}</s>;
        break;
      case "code":
        node = (
          <code className="bg-brand-900/8 rounded px-1.5 py-0.5 font-mono text-[0.88em]">
            {node}
          </code>
        );
        break;
      case "link": {
        const href = String(mark.attrs?.href ?? "");
        // Anything off site opens away and carries the usual protections.
        const external = /^https?:\/\//i.test(href);

        node = (
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="decoration-ember-500/50 hover:decoration-ember-500 underline underline-offset-[3px] transition-colors"
          >
            {node}
          </a>
        );
        break;
      }
    }
  }

  return <span key={key}>{node}</span>;
}

const inline = (nodes: RichNode[] | undefined): ReactNode =>
  (nodes ?? []).map((node, index) =>
    node.type === "hardBreak" ? <br key={index} /> : withMarks(node.text ?? "", node.marks, index),
  );

/** Alignment is stored on the node; left is the default and needs no class. */
const align = (node: RichNode) => {
  const value = node.attrs?.textAlign;
  return value === "center" ? "text-center" : value === "right" ? "text-right" : "";
};

/** Code blocks hold plain text, marks and all, so they are read flat. */
const plain = (node: RichNode): string =>
  (node.content ?? []).map((child) => child.text ?? "").join("");

function Figure({ node }: { node: RichNode }) {
  const src = String(node.attrs?.src ?? "");
  if (!src) return null;

  const width = Number(node.attrs?.width ?? 100);
  const placement = String(node.attrs?.align ?? "center");

  return (
    <figure
      className={`my-12 max-w-[52rem] ${
        placement === "center" ? "mx-auto" : placement === "right" ? "ml-auto" : "mr-auto"
      }`}
      style={{ width: `${width}%` }}
    >
      <div className="bg-brand-100 relative aspect-[16/10] overflow-hidden rounded-[20px]">
        <Image
          src={src}
          alt={String(node.attrs?.alt ?? "")}
          fill
          sizes="(max-width: 1023px) 92vw, 832px"
          className="object-cover"
        />
      </div>
    </figure>
  );
}

function Callout({ node }: { node: RichNode }) {
  const [title, body] = node.content ?? [];

  return (
    <aside className="bg-cream-100 mx-auto my-12 max-w-[42rem] rounded-[20px] p-6 sm:p-7">
      <p className="text-ember-600 text-[10.5px] font-bold tracking-[0.18em] uppercase">
        {inline(title?.content)}
      </p>
      <p className="text-brand-900/75 mt-3 text-[15px] leading-[1.8] text-pretty">
        {inline(body?.content)}
      </p>
    </aside>
  );
}

function Cells({ row }: { row: RichNode }) {
  return (
    <tr className="border-brand-900/10 border-b last:border-0">
      {(row.content ?? []).map((cell, index) => {
        const Tag = cell.type === "tableHeader" ? "th" : "td";

        return (
          <Tag
            key={index}
            colSpan={Number(cell.attrs?.colspan ?? 1)}
            rowSpan={Number(cell.attrs?.rowspan ?? 1)}
            className={`border-brand-900/10 border-r px-3.5 py-2.5 align-top last:border-0 ${
              Tag === "th" ? "bg-brand-900/5 text-brand-900 font-semibold" : "text-brand-900/75"
            }`}
          >
            <Block nodes={cell.content} nested />
          </Tag>
        );
      })}
    </tr>
  );
}

/** `nested` marks content inside a cell or a list item, where the column rules do not apply: the cell is already the column. */
function Block({ nodes, nested = false }: { nodes: RichNode[] | undefined; nested?: boolean }) {
  return (
    <>
      {(nodes ?? []).map((node, index) => {
        switch (node.type) {
          case "paragraph":
            return (
              <p
                key={index}
                className={
                  nested
                    ? "text-[14.5px] leading-[1.7]"
                    : `${measure} text-brand-900/75 text-[16px] leading-[1.85] text-pretty sm:text-[17px] ${align(node)}`
                }
              >
                {inline(node.content)}
              </p>
            );

          case "heading": {
            const level = Number(node.attrs?.level ?? 2);

            return level === 2 ? (
              <h2
                key={index}
                className={`font-display ${measure} text-brand-900 mt-14 text-[clamp(1.4rem,2.6vw,1.95rem)] leading-[1.15] font-extrabold tracking-[-0.03em] text-balance first:mt-0 ${align(node)}`}
              >
                {inline(node.content)}
              </h2>
            ) : (
              <h3
                key={index}
                className={`font-display ${measure} text-brand-900 mt-10 text-[17px] leading-tight font-bold tracking-[-0.02em] sm:text-[19px] ${align(node)}`}
              >
                {inline(node.content)}
              </h3>
            );
          }

          case "bulletList":
          case "orderedList":
            return (
              <ul key={index} className={`${measure} space-y-3`}>
                {(node.content ?? []).map((item, position) => (
                  <li
                    key={position}
                    className="text-brand-900/75 flex gap-3.5 text-[15.5px] leading-[1.8] sm:text-[16px]"
                  >
                    {node.type === "orderedList" ? (
                      <span className="text-ember-600 shrink-0 font-semibold tabular-nums">
                        {position + 1}.
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="bg-ember-500 mt-[0.7em] size-1.5 shrink-0 rounded-full"
                      />
                    )}
                    <span className="min-w-0">
                      <Block nodes={item.content} nested />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-ember-500 mx-auto my-12 max-w-[44rem] border-l-2 pl-6 sm:pl-8"
              >
                <div className="font-display text-brand-900 text-[clamp(1.25rem,2.6vw,1.75rem)] leading-[1.35] font-bold tracking-[-0.025em] text-balance">
                  <Block nodes={node.content} nested />
                </div>
              </blockquote>
            );

          case "codeBlock":
            return (
              <pre
                key={index}
                className="bg-brand-950 text-cream-100 mx-auto my-10 max-w-[44rem] overflow-x-auto rounded-[16px] p-5 text-[13px] leading-[1.7]"
              >
                <code>{plain(node)}</code>
              </pre>
            );

          case "horizontalRule":
            return <hr key={index} className={`${measure} border-brand-900/12 my-12`} />;

          case "image":
            return <Figure key={index} node={node} />;

          case "callout":
            return <Callout key={index} node={node} />;

          case "table":
            return (
              <div key={index} className="mx-auto my-12 max-w-[52rem] overflow-x-auto">
                <table className="w-full border-collapse text-left text-[14.5px]">
                  <tbody>
                    {(node.content ?? []).map((row, position) => (
                      <Cells key={position} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return node.content ? <Block key={index} nodes={node.content} nested={nested} /> : null;
        }
      })}
    </>
  );
}

export function RichBody({ doc }: { doc: RichDoc | null | undefined }) {
  return (
    <div className="space-y-7">
      <Block nodes={doc?.content} />
    </div>
  );
}
