import "server-only";

import { unstable_cache } from "next/cache";

import { createClient } from "@supabase/supabase-js";

import { CATALOGUE_TAG } from "@/lib/catalogue";

/** The blocks of the about page, in the order they appear on it. */
export const TEAM_GROUPS = [
  "lead",
  "leadership",
  "website",
  "brand",
  "technical",
  "ground",
  "office",
  "medical",
] as const;

export type TeamGroupKey = (typeof TEAM_GROUPS)[number];

export type CrewMember = {
  id: string;
  name: string;
  group_key: TeamGroupKey;
  /** A role the site translates. Null when `role_label` says it instead. */
  role_key: string | null;
  /** Written out by the office, for a role there is no translation for. */
  role_label: string | null;
  photo_path: string | null;
  certificate_path: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  position: number;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const client = () =>
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

/**
 * Where a photograph or a certificate actually lives.
 *
 * A path beginning with a slash is a file this site serves out of its own
 * public folder, which is where the crew photographs have always been and
 * still are. Anything else is a key in the team bucket, which is where
 * everything uploaded from the panel goes. One column, two homes, because
 * moving twenty five images to make a point would have been work for nothing.
 */
export const crewMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;

  return url ? `${url}/storage/v1/object/public/team/${path}` : null;
};

/**
 * Everybody on the about page, in the order the office put them.
 *
 * Read through the same tag as the tours, so a change saved in the panel clears
 * this with everything else rather than waiting a day on its own.
 */
export const listCrew = unstable_cache(
  async (): Promise<CrewMember[]> => {
    const supabase = client();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("team")
      .select(
        "id, name, group_key, role_key, role_label, photo_path, certificate_path, linkedin_url, instagram_url, position",
      )
      .eq("status", "published")
      .order("position")
      .order("created_at");

    // A database that has not run patch-team.sql yet answers with nothing,
    // which the page reads as a team with nobody on it and says so, rather
    // than failing to render at all.
    return error ? [] : ((data ?? []) as CrewMember[]);
  },
  ["team"],
  { tags: [CATALOGUE_TAG], revalidate: 60 * 60 * 24 },
);

/** The crew, split into the blocks the about page draws. */
export const crewByGroup = async () => {
  const crew = await listCrew();
  const grouped = new Map<TeamGroupKey, CrewMember[]>();

  for (const member of crew) {
    if (!TEAM_GROUPS.includes(member.group_key)) continue;

    const existing = grouped.get(member.group_key);
    if (existing) existing.push(member);
    else grouped.set(member.group_key, [member]);
  }

  return grouped;
};

/**
 * How many people are on the crew, for the figure on the home page.
 *
 * Counted rather than written down, so hiring somebody changes the number on
 * the site without anybody remembering to. A database that has not been
 * migrated yet counts nobody, and a home page announcing a crew of zero would
 * be worse than one slightly out of date, so it falls back to the figure the
 * site shipped with.
 */
export const crewCount = async () => {
  const crew = await listCrew();

  return crew.length > 0 ? crew.length : 36;
};
