import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * The journal, read from Supabase.
 *
 * Read only and unauthenticated. Row level security only ever returns posts
 * whose status is published, so a draft cannot reach the site even if its
 * address is guessed.
 *
 * The document is stored as the editor's node tree rather than HTML, so nothing
 * an author types can inject markup into the page: every node is rendered by a
 * component that decides what it is allowed to be.
 */

export type RichNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

export type RichDoc = { type: "doc"; content?: RichNode[] };

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: RichDoc;
  cover_path: string | null;
  cover_alt: string | null;
  published_at: string | null;
  updated_at: string;
};

const BUCKET = "blog";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Public URL for a stored image. Rows keep the path, never the address. */
export const imageUrl = (path: string | null | undefined) =>
  path && url ? `${url}/storage/v1/object/public/${BUCKET}/${path}` : null;

/**
 * Returns null rather than throwing when Supabase is not configured.
 *
 * The journal is one section of a site that is otherwise static, and a missing
 * environment variable should cost the journal, not every page.
 */
function client() {
  if (!url || !key) return null;

  return createClient(url, key, { auth: { persistSession: false } });
}

const FIELDS = "id, slug, title, excerpt, body, cover_path, cover_alt, published_at, updated_at";

export async function listPosts(): Promise<Post[]> {
  const supabase = client();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(FIELDS)
    .eq("status", "published")
    // Newest first, and a post published before the column existed still sorts.
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  return error ? [] : ((data ?? []) as Post[]);
}

export async function getPost(slug: string): Promise<Post | null> {
  const supabase = client();
  if (!supabase) return null;

  const { data } = await supabase
    .from("posts")
    .select(FIELDS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  return (data as Post) ?? null;
}

/** Every text run in the document, for word counts and descriptions. */
export function plainText(node: RichNode | RichDoc | null | undefined): string {
  if (!node) return "";

  const parts: string[] = [];
  const walk = (current: RichNode) => {
    if (current.text) parts.push(current.text);
    current.content?.forEach(walk);
  };

  walk(node as RichNode);
  return parts.join(" ");
}

export const wordCount = (doc: RichDoc | null | undefined): number => {
  const text = plainText(doc).trim();
  return text ? text.split(/\s+/).length : 0;
};

/** 200 words a minute, the figure most publishers use for prose. */
export const readingMinutes = (doc: RichDoc | null | undefined): number =>
  Math.max(1, Math.round(wordCount(doc) / 200));
