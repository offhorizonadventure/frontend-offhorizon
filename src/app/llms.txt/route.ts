import { listPosts } from "@/lib/blog";
import { listTours, tourPath } from "@/lib/catalogue";
import { siteName, siteUrl } from "@/lib/seo";

/** llms.txt: what this site is, for a model reading it rather than a crawler. */
export const revalidate = 3600;

export async function GET() {
  const [tours, posts] = await Promise.all([listTours(), listPosts()]);

  const body = [
    `# ${siteName}`,
    "",
    "> Guided motorcycle and self-drive 4x4 expeditions across the Himalayas and Central Asia.",
    "> Small groups, prepared machines, a mechanic on every departure. Based in Manali,",
    "> India, running expeditions in India, Nepal, Bhutan, Sri Lanka and Mongolia.",
    "",
    "The site is published in English, French, German, Italian and Spanish. Every path",
    "below is prefixed with a language code, for example /en/adventure-tours.",
    "",
    "## Expeditions",
    "",
    ...tours.map((tour) => {
      const summary = tour.lead?.split(". ")[0] ?? "";
      return `- [${tour.title}](${siteUrl}/en${tourPath(tour)}): ${summary}`;
    }),
    "",
    "## Journal",
    "",
    ...posts
      .slice(0, 20)
      .map((post) => `- [${post.title}](${siteUrl}/en/blog/${post.slug}): ${post.excerpt ?? ""}`),
    "",
    "## Pages",
    "",
    `- [Destinations](${siteUrl}/en/destinations): the five countries, and which are running`,
    `- [All expeditions](${siteUrl}/en/adventure-tours): every dated departure`,
    `- [Custom expeditions](${siteUrl}/en/custom-expeditions): trips built to order`,
    `- [How booking works](${siteUrl}/en/how-booking-works): paying in full or with a 20 percent deposit, instalments, the 14 day balance deadline, group invites`,
    `- [Terms of service](${siteUrl}/en/terms-of-service): booking, payment, cancellation and liability`,
    `- [Privacy policy](${siteUrl}/en/privacy-policy): what is collected, who sees it, how long it is kept`,
    `- [About us](${siteUrl}/en/about-us): who runs these`,
    `- [Contact](${siteUrl}/en/contact-us)`,
    "",
    "## Notes",
    "",
    "- Prices are quoted per person and converted into the visitor's currency at",
    "  the daily rate, so figures on a page are not fixed amounts.",
    "- A tour with no dated departure is marked planned rather than bookable.",
    "- Places come off sale 30 days before departure, and the balance on a booking",
    "  is due 14 days before it. Nothing paid is refundable.",
    "- A motorcycle expedition counts riders and pillions; a 4x4 expedition is",
    "  priced per person and the vehicle is chosen separately.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
