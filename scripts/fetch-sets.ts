// One-off: fetch set metadata and full set lists for Ash's sets (D-021).
// Run: pnpm dlx tsx scripts/fetch-sets.ts
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setCodeOf, type SetCard, type SetInfo } from "../lib/album";

const BASE =
  "https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/39a26a144c8b6ef6c2fb17b2c29d0bb7121e3a11";
const DATA = join(process.cwd(), "data");
const SETS_DIR = join(DATA, "sets");
const EXPECTED_SETS = 121;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(path: string): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${BASE}/${path}`);
    if (res.ok) return res.json();
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === 4)
      throw new Error(`${res.status} ${res.statusText} for ${path}`);
    const wait = 1000 * 2 ** attempt;
    console.warn(`  ${res.status} on ${path}, retrying in ${wait / 1000} s`);
    await sleep(wait);
  }
}

function asArray(value: unknown, path: string): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new Error(`${path} is not an array`);
  return value as Record<string, unknown>[];
}

const pick = <K extends string>(o: Record<string, unknown>, keys: K[]) =>
  Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]));

async function main() {
  const collection = asArray(
    JSON.parse(await readFile(join(DATA, "ash_collection.json"), "utf8")),
    "ash_collection.json",
  );
  const ownedIds = new Set(collection.map((c) => String(c.id)));
  const codes = [...new Set([...ownedIds].map(setCodeOf))].sort();
  if (codes.length !== EXPECTED_SETS)
    throw new Error(
      `expected ${EXPECTED_SETS} set codes, found ${codes.length}`,
    );

  let requests = 0;
  const allSets = asArray(await getJson("sets/en.json"), "sets/en.json");
  requests++;
  const sets = allSets
    .filter((s) => codes.includes(String(s.id)))
    .map(
      (s) =>
        pick(s, [
          "id",
          "name",
          "series",
          "printedTotal",
          "total",
          "releaseDate",
          "images",
        ]) as SetInfo,
    );
  const missingSets = codes.filter((c) => !sets.some((s) => s.id === c));
  if (missingSets.length)
    throw new Error(`sets/en.json lacks ${missingSets.join(", ")}`);
  await writeFile(
    join(DATA, "sets.json"),
    JSON.stringify(sets, null, 1) + "\n",
  );

  await mkdir(SETS_DIR, { recursive: true });
  let written = 0;
  let skipped = 0;
  for (const code of codes) {
    const file = join(SETS_DIR, `${code}.json`);
    if (existsSync(file)) {
      skipped++;
      continue;
    }
    await sleep(250);
    const path = `cards/en/${code}.json`;
    const cards = asArray(await getJson(path), path).map(
      (c) =>
        pick(c, [
          "id",
          "name",
          "number",
          "rarity",
          "supertype",
          "types",
          "images",
        ]) as SetCard,
    );
    requests++;
    // Write each set as soon as it arrives, so a rerun resumes from here.
    await writeFile(file, JSON.stringify(cards, null, 1) + "\n");
    written++;
    console.log(`${code}: ${cards.length} cards`);
  }

  const listed = new Set<string>();
  for (const code of codes) {
    const cards = JSON.parse(
      await readFile(join(SETS_DIR, `${code}.json`), "utf8"),
    ) as SetCard[];
    for (const c of cards) listed.add(c.id);
  }
  const unlisted = [...ownedIds].filter((id) => !listed.has(id));

  console.log(
    `\n${requests} requests; ${sets.length} sets in sets.json; set lists written ${written}, skipped ${skipped}; ${listed.size} cards in all`,
  );
  console.log(
    `owned ids missing from set lists: ${unlisted.length}${unlisted.length ? ` (${unlisted.join(", ")})` : ""}`,
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
