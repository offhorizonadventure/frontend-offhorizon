/**
 * Photographs for Tibet and the Everest expedition.
 *
 * Run: node scripts/fetch-tibet-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

import { download, find } from "./find-images.mjs";

const WANTED = [
  {
    file: "public/destinations/pages/tibet-plateau.webp",
    term: "Friendship Highway Tibet",
    must: ["friendship highway"],
    width: 1600,
    height: 900,
  },
];

const credits = [];

for (const item of WANTED) {
  const hits = (await find(item.term, item.must, 8))
    .map((hit) => ({ ...hit, w: +hit.size.split("x")[0], h: +hit.size.split("x")[1] }))
    .filter((hit) => hit.w / hit.h >= 1.3)
    .sort((a, b) => b.w - a.w);

  const pick = hits[0];
  if (!pick) {
    console.log(`nothing for ${item.file}`);
    continue;
  }

  await mkdir(item.file.split("/").slice(0, -1).join("/"), { recursive: true });
  const bytes = await download(pick.url);
  const resized = sharp(bytes).resize(item.width, item.height, {
    fit: "cover",
    position: "attention",
  });

  await (
    item.file.endsWith(".webp")
      ? resized.webp({ quality: 82, effort: 6 })
      : resized.jpeg({ quality: 84, mozjpeg: true })
  ).toFile(item.file);

  credits.push({ file: item.file, ...pick });
  console.log(`${item.file.padEnd(46)} ${pick.title.slice(5, 60)}`);
}

await writeFile("scripts/tibet-image-credits.json", JSON.stringify(credits, null, 2));
