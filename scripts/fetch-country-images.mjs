/**
 * Wide photographs for the closing band on the Bhutan, Sri Lanka and Mongolia
 * country pages. Same source and licence rules as the menu images, but drawn
 * full width, so encoded at 1600px rather than 900.
 *
 * Run: node scripts/fetch-country-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

import { find } from "./find-images.mjs";

const WANTED = [
  { file: "bhutan-punakha", term: "Punakha Dzong Bhutan", must: ["punakha"] },
  { file: "sri-lanka-tea", term: "Nuwara Eliya tea plantation", must: ["tea"] },
  { file: "mongolia-steppe", term: "Mongolian steppe", must: ["steppe"] },
];

const OUT = "public/destinations/pages";
await mkdir(OUT, { recursive: true });

const credits = [];

for (const item of WANTED) {
  const hits = await find(item.term, item.must, 6);
  const landscape = hits
    .map((hit) => ({
      ...hit,
      w: Number(hit.size.split("x")[0]),
      h: Number(hit.size.split("x")[1]),
    }))
    .filter((hit) => hit.w / hit.h >= 1.4)
    .sort((a, b) => b.w - a.w);

  const pick = landscape[0];
  if (!pick) {
    console.log(`no landscape image for ${item.file}`);
    continue;
  }

  const bytes = Buffer.from(await (await fetch(pick.url)).arrayBuffer());
  await sharp(bytes)
    .resize(1600, 900, { fit: "cover", position: "attention" })
    .webp({ quality: 82, effort: 6 })
    .toFile(`${OUT}/${item.file}.webp`);

  credits.push({ file: `${OUT}/${item.file}.webp`, ...pick });
  console.log(`${item.file.padEnd(20)} ${pick.title.slice(5, 60)}`);
}

await writeFile("scripts/country-image-credits.json", JSON.stringify(credits, null, 2));
