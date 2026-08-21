/**
 * Downloads one photograph per menu entry and writes the credit table.
 *
 * Landscape only, because every one of these is shown in a 4:3 or wider frame
 * and a portrait crop of a mountain is a picture of a rock.
 *
 * 900px wide: the largest any of them is drawn is a 360px card on a country
 * page, so this is twice that and nothing more. At 1400px the eleven came to
 * 3.6MB between them, which is a lot of bandwidth for a menu thumbnail.
 *
 * Run: node scripts/fetch-menu-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

import { find } from "./find-images.mjs";

const WANTED = [
  { file: "great-himalayan-traverse", term: "Zanskar valley road", must: ["zanskar"] },
  { file: "himalayan-expedition", term: "Spiti valley Himachal", must: ["spiti"] },
  { file: "ladakh-circuit", term: "Umling La pass Ladakh", must: ["umling"] },
  { file: "indian-himalayas-4x4", term: "Chandratal Spiti", must: ["spiti"] },
  { file: "upper-mustang", term: "Lo Manthang Mustang Nepal", must: ["manthang"] },
  { file: "lower-mustang", term: "Muktinath Nepal", must: ["muktinath"] },
  { file: "nepal-4x4", term: "Annapurna circuit Nepal", must: ["annapurna"] },
  { file: "bhutan-motorcycle", term: "Paro Taktsang Bhutan", must: ["taktsang"] },
  { file: "sri-lanka-motorcycle", term: "Sigiriya Sri Lanka", must: ["sigiriya"] },
  { file: "mongolia-motorcycle", term: "Gobi desert Mongolia", must: ["gobi"] },
  { file: "mongolia-4x4", term: "Altai Tavan Bogd Mongolia", must: ["altai"] },
];

const OUT = "public/tours/menu";
await mkdir(OUT, { recursive: true });

const credits = [];

for (const item of WANTED) {
  const hits = await find(item.term, item.must, 6);

  // Landscape, and the widest of what came back: these are shown in a wide
  // frame and cropped to fill it.
  const landscape = hits
    .map((hit) => ({
      ...hit,
      w: Number(hit.size.split("x")[0]),
      h: Number(hit.size.split("x")[1]),
    }))
    .filter((hit) => hit.w / hit.h >= 1.3)
    .sort((a, b) => b.w - a.w);

  const pick = landscape[0];
  if (!pick) {
    console.log(`no landscape image for ${item.file}`);
    continue;
  }

  const bytes = Buffer.from(await (await fetch(pick.url)).arrayBuffer());
  await sharp(bytes)
    .resize(900, 675, { fit: "cover", position: "attention" })
    .webp({ quality: 80, effort: 6 })
    .toFile(`${OUT}/${item.file}.webp`);

  credits.push({ file: `${OUT}/${item.file}.webp`, ...pick });
  console.log(`${item.file.padEnd(26)} ${pick.title.slice(5, 52)}`);
}

await writeFile("scripts/menu-image-credits.json", JSON.stringify(credits, null, 2));
console.log(`\n${credits.length} images written`);
