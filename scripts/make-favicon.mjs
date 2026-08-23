/**
 * The H from the logo, cropped and set on the brand cream, as every icon the
 * site needs. The mark is a 546px square at the origin of the horizontal logo.
 *
 * Run: node scripts/make-favicon.mjs
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const LOGO = "public/logo/logo-horizontal.png";
const MARK = { left: 0, top: 0, width: 546, height: 546 };
const CREAM = "#eaebdb";

const BROWN = { r: 0x56, g: 0x21, b: 0x01 };

/** A separable box blur over one channel, run twice for a smooth enough falloff. */
function blur(source, width, height, radius) {
  let input = source;
  let output = Buffer.alloc(source.length);

  for (let pass = 0; pass < 2; pass++) {
    // Horizontal.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const sx = x + k;
          if (sx < 0 || sx >= width) continue;
          sum += input[y * width + sx];
          count++;
        }
        output[y * width + x] = sum / count;
      }
    }

    [input, output] = [output, Buffer.alloc(source.length)];

    // Vertical.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const sy = y + k;
          if (sy < 0 || sy >= height) continue;
          sum += input[sy * width + x];
          count++;
        }
        output[y * width + x] = sum / count;
      }
    }

    [input, output] = [output, Buffer.alloc(source.length)];
  }

  return input;
}

/**
 * A solid version of the mark.
 *
 * The logo is one flat brown and every contour is carried in the alpha
 * channel, so the shape lives there rather than in the colour. The lines
 * inside each form are thin and the gaps between the four forms are wide: a
 * blur closes the first and leaves the second, and a threshold afterwards
 * gives a clean letterform. At 16px the detailed mark is mud; this reads as
 * an H.
 *
 * Done on the raw pixels because sharp's own channel operations premultiply
 * and change channel counts underneath this, which produced a filled square.
 */
async function solidMark(size) {
  const { data, info } = await sharp(LOGO)
    .extract(MARK)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const coverage = Buffer.alloc(width * height);
  for (let i = 0; i < coverage.length; i++) {
    coverage[i] = data[i * channels + 3] > 128 ? 255 : 0;
  }

  const closed = blur(coverage, width, height, 7);

  // Brown everywhere, visible only where the closed mask says so.
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = BROWN.r;
    rgba[i * 4 + 1] = BROWN.g;
    rgba[i * 4 + 2] = BROWN.b;
    rgba[i * 4 + 3] = closed[i] > 110 ? 255 : 0;
  }

  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(size, size)
    .png()
    .toBuffer();
}

/** The mark on a cream tile, with room around it so it is not cramped at 16px. */
async function tile(size, { solid = false } = {}) {
  // A tab icon is 16px, so the small ones give the mark more of the tile.
  const inset = Math.round(size * (solid ? 0.08 : 0.16));
  const inner = size - inset * 2;

  const mark = solid
    ? await solidMark(inner)
    : await sharp(LOGO)
        .extract(MARK)
        .resize(inner, inner, { fit: "contain", background: "#00000000" })
        .png()
        .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: CREAM },
  })
    .composite([{ input: mark, top: inset, left: inset }])
    .png()
    .toBuffer();
}

/**
 * An ICO holding PNG frames.
 *
 * Six byte header, one sixteen byte directory entry per frame, then the frames
 * themselves. Windows has read PNG inside ICO since Vista, and every browser
 * that matters does too.
 */
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  let offset = 6 + frames.length * 16;
  const entries = [];
  for (const frame of frames) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 0);
    entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(frame.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += frame.data.length;
  }

  return Buffer.concat([header, ...entries, ...frames.map((frame) => frame.data)]);
}

// Solid where the detail would turn to mud, detailed where it can be seen.
const frames = await Promise.all(
  [
    { size: 16, solid: true },
    { size: 32, solid: true },
    { size: 48, solid: false },
  ].map(async ({ size, solid }) => ({ size, data: await tile(size, { solid }) })),
);

await writeFile("src/app/favicon.ico", ico(frames));
await writeFile("src/app/icon.png", await tile(512));
await writeFile("src/app/apple-icon.png", await tile(180));

console.log("favicon.ico (16, 32, 48), icon.png (512), apple-icon.png (180)");
