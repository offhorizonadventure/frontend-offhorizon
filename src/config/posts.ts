import type { StaticImageData } from "next/image";

import moonscape from "../../public/destinations/india.jpg";
import cover from "../../public/tours/ladakh-motorcycle-tour.jpg";
import authorPhoto from "../../public/team/oct-mt.jpg";

/**
 * Body is a block list rather than an HTML string.
 *
 * Every headless CMS worth using returns structured content (portable text,
 * blocks, nodes), so matching that shape now means swapping the source later
 * is a mapping function rather than a rewrite of the renderer.
 */
export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: StaticImageData; alt: string; caption?: string }
  | { type: "callout"; title: string; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO 8601. Drives `datePublished` and the visible date. */
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  author: { name: string; role: string; photo: StaticImageData };
  cover: StaticImageData;
  coverAlt: string;
  body: Block[];
};

const muskan = {
  name: "Muskan Thakur",
  role: "Operations and creative",
  photo: authorPhoto,
};

/**
 * Demo content, English only and deliberately not translated. It exists so the
 * layout can be reviewed and is expected to be deleted once real posts arrive.
 */
export const posts: Post[] = [
  {
    slug: "riding-ladakh-at-altitude",
    title: "Riding Ladakh at altitude: what thin air does to you and the bike",
    excerpt:
      "Above 4,000 metres your body and your engine both lose power, and neither of them tells you politely. Here is what actually changes, and how we build it into the schedule.",
    category: "Field notes",
    publishedAt: "2026-06-18",
    updatedAt: "2026-08-02",
    readingMinutes: 7,
    author: muskan,
    cover,
    coverAlt: "Riders at the Umling La pass sign in Ladakh, 19,024 feet",
    body: [
      {
        type: "paragraph",
        text: "Most riders arrive in Leh expecting the roads to be the hard part. The roads are fine. What catches people out is the air. At 3,500 metres there is roughly a third less oxygen in every breath than at sea level, and by the time you are on Umling La at 5,798 metres it is closer to half. Your body notices before you do.",
      },
      {
        type: "paragraph",
        text: "We have run this terrain since 2014, and almost every problem we have had to solve on the road traces back to altitude rather than to the riding. So it is worth explaining plainly what happens, and why our schedules look slower on paper than they need to be.",
      },
      { type: "heading", text: "What altitude does to a rider" },
      {
        type: "paragraph",
        text: "Acute mountain sickness is not an exotic condition. It is common, it is predictable, and it has very little to do with how fit you are. Strong riders get it. Riders who have been to altitude before get it. The single biggest factor is how fast you gained height.",
      },
      {
        type: "list",
        items: [
          "Headache that does not respond to water or paracetamol",
          "Broken sleep, and waking up short of breath",
          "No appetite, which then leaves you underfuelled for a long riding day",
          "Slower decisions, which is the one that matters most on a mountain road",
        ],
      },
      {
        type: "paragraph",
        text: "That last point is the reason we care. Mild altitude sickness rarely becomes dangerous on its own. It becomes dangerous because a tired rider with a headache misreads a corner, brakes late on gravel, or pushes on when they should stop.",
      },
      {
        type: "callout",
        title: "How we plan around it",
        text: "Two nights in Leh before anyone rides, short first days, and a hard rule that the group descends if a rider is not improving. No summit is worth a bad night at 5,000 metres.",
      },
      { type: "heading", text: "What altitude does to the motorcycle" },
      {
        type: "paragraph",
        text: "Engines breathe the same air you do. A naturally aspirated engine loses roughly three percent of its power for every 300 metres of elevation. On a 400cc single at Umling La, you are working with something close to half the power you had in Manali.",
      },
      {
        type: "image",
        src: moonscape,
        alt: "The lunar landscape near Lamayuru in Ladakh",
        caption: "Lamayuru. Long climbs at low power are normal here, not a fault.",
      },
      { type: "subheading", text: "What that feels like" },
      {
        type: "paragraph",
        text: "Overtakes take longer than you expect. Hills that would be third gear at home become first. The bike feels flat rather than broken, and riders who have not been warned often assume something is wrong and start diagnosing a fault that does not exist.",
      },
      {
        type: "list",
        items: [
          "Carburetted bikes run rich and may need jetting adjusted for the high passes",
          "Fuel injection compensates automatically, but you still lose the power",
          "Brakes work normally, but long descents heat them more than you are used to",
          "Tyre pressures read differently in the cold mornings, so check them warm",
        ],
      },
      {
        type: "quote",
        text: "The mountain decides the pace. Our job is to make sure nobody has to argue with it.",
      },
      { type: "heading", text: "The schedule is the safety equipment" },
      {
        type: "paragraph",
        text: "People assume the important safety items are the backup vehicle and the mechanic. Those matter, and every one of our motorcycle groups has both. But the thing that prevents the most incidents is unglamorous: an itinerary with enough slack in it that nobody feels pressure to ride while unwell.",
      },
      {
        type: "paragraph",
        text: "If you are comparing operators, look past the route map and ask how many nights are spent acclimatising, and what happens if one rider in the group is struggling. The answer tells you more about the trip than the list of passes does.",
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((post) => post.slug === slug);

export const sortedPosts = [...posts].sort(
  (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
);
