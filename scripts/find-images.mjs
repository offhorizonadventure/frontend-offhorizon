/**
 * Finds freely licensed photographs on Wikimedia Commons.
 *
 * Searches the file namespace, keeps only files whose name contains the words
 * that matter so a fuzzy match cannot return somewhere else entirely, and only
 * those under a CC or public domain licence, because the credit line has to be
 * true.
 *
 * Run: node scripts/find-images.mjs
 */
const API = "https://commons.wikimedia.org/w/api.php";
const AGENT = { "User-Agent": "OffhorizonSiteBuild/1.0 (info@offhorizon.com)" };
/**
 * Licences that allow reuse with a credit.
 *
 * Compared against the licence name with spaces and hyphens stripped, because
 * Commons writes the same licence as "CC BY-SA 3.0", "cc-by-sa-3.0" and
 * "CC BY 2.0" depending on the file.
 */
const FREE = ["ccby", "cc0", "publicdomain", "pd"];
const flatten = (value) => value.toLowerCase().replace(/[\s\-_.]/g, "");

const get = async (params) => {
  const url = `${API}?${new URLSearchParams({ ...params, format: "json" })}`;
  const response = await fetch(url, { headers: AGENT });
  if (!response.ok) throw new Error(`Commons ${response.status}`);
  return response.json();
};

/** Downloads one file. The image host rate limits anonymous clients, so it
 * carries the same user agent as the API calls and backs off on a 429. */
export async function download(url, tries = 4) {
  for (let attempt = 0; attempt < tries; attempt++) {
    const response = await fetch(url, { headers: AGENT });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if (response.status !== 429 && response.status !== 503) {
      throw new Error(`${response.status} for ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  }
  throw new Error(`rate limited: ${url}`);
}

export async function find(term, must, want = 2) {
  const search = await get({
    action: "query",
    list: "search",
    srsearch: `${term} filetype:bitmap`,
    srnamespace: "6",
    srlimit: "30",
  });

  const out = [];

  for (const hit of search.query.search) {
    const name = hit.title.toLowerCase();
    if (!must.every((word) => name.includes(word.toLowerCase()))) continue;

    const info = await get({
      action: "query",
      titles: hit.title,
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "2200",
    });

    const page = Object.values(info.query.pages)[0];
    const image = page.imageinfo?.[0];
    if (!image || image.width < 1500) continue;

    const meta = image.extmetadata ?? {};
    const licence = flatten(meta.LicenseShortName?.value ?? "");
    if (!FREE.some((token) => licence.startsWith(token))) continue;

    out.push({
      title: hit.title,
      url: image.thumburl ?? image.url,
      licence: meta.LicenseShortName?.value ?? "",
      licenceUrl: meta.LicenseUrl?.value ?? "",
      author: (meta.Artist?.value ?? "")
        .replace(/<[^>]+>/g, "")
        .trim()
        .slice(0, 60),
      page: image.descriptionurl,
      size: `${image.width}x${image.height}`,
    });

    if (out.length >= want) break;
  }

  return out;
}

const QUERIES = [
  ["Umling La pass Ladakh", ["umling"]],
  ["Zanskar valley", ["zanskar"]],
  ["Lo Manthang Mustang Nepal", ["manthang"]],
  ["Muktinath Nepal", ["muktinath"]],
  ["Annapurna circuit Nepal", ["annapurna"]],
  ["Paro Taktsang Bhutan", ["taktsang"]],
  ["Ella Sri Lanka", ["ella"]],
  ["Sigiriya Sri Lanka", ["sigiriya"]],
  ["Gobi desert Mongolia", ["gobi"]],
  ["Altai Tavan Bogd Mongolia", ["altai"]],
  ["Orkhon valley Mongolia", ["orkhon"]],
];

if (process.argv[1]?.endsWith("find-images.mjs")) {
  for (const [term, must] of QUERIES) {
    console.log(`\n=== ${term}`);
    try {
      for (const hit of await find(term, must)) {
        console.log(
          `  ${hit.title.slice(5, 60).padEnd(56)} ${hit.licence.padEnd(13)} ${hit.size.padEnd(11)} ${hit.author.slice(0, 22)}`,
        );
      }
    } catch (error) {
      console.log("  failed:", error.message);
    }
  }
}
