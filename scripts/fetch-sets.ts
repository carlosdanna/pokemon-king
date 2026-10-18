// One-off: fetch set metadata and full set lists for Ash's sets from TCGdex,
// plus the pokemontcg → TCGdex id map for his collection (D-023).
// Run: pnpm dlx tsx scripts/fetch-sets.ts
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  numberKey,
  setCodeOf,
  tcgdexSetId,
  type SetCard,
  type SetInfo,
} from "../lib/album";

const GRAPHQL = "https://api.tcgdex.net/v2/graphql";
const DATA = join(process.cwd(), "data");
const SETS_DIR = join(DATA, "sets");
const EXPECTED_SETS = 121;
const PAGE = 100; // TCGdex caps GraphQL pages at 100

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let requests = 0;

async function query(q: string): Promise<Record<string, unknown>> {
  for (let attempt = 0; ; attempt++) {
    requests++;
    const res = await fetch(GRAPHQL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    if (res.ok) {
      const body = (await res.json()) as {
        data?: Record<string, unknown>;
        errors?: unknown;
      };
      if (!body.data || body.errors)
        throw new Error(`GraphQL error: ${JSON.stringify(body.errors)}`);
      return body.data;
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === 4)
      throw new Error(`${res.status} ${res.statusText} for ${q}`);
    const wait = 1000 * 2 ** attempt;
    console.warn(`  ${res.status}, retrying in ${wait / 1000} s`);
    await sleep(wait);
  }
}

type Raw = Record<string, unknown>;
const asArray = (value: unknown, what: string): Raw[] => {
  if (!Array.isArray(value)) throw new Error(`${what} is not an array`);
  return value as Raw[];
};

async function fetchSetCards(setId: string): Promise<SetCard[]> {
  const cards: SetCard[] = [];
  for (let page = 1; ; page++) {
    await sleep(200);
    const data = await query(
      `{ cards(filters:{id:"${setId}-"}, pagination:{page:${page},count:${PAGE}}) { id localId name rarity category types image set { id } } }`,
    );
    const batch = asArray(data.cards, `cards of ${setId}`);
    // The id filter is a substring match, so keep only this set's cards.
    for (const c of batch) {
      if ((c.set as Raw).id !== setId) continue;
      cards.push({
        id: String(c.id),
        name: String(c.name),
        number: String(c.localId),
        rarity: String(c.rarity),
        category: String(c.category),
        ...(Array.isArray(c.types) && { types: c.types.map(String) }),
        ...(typeof c.image === "string" && { image: c.image }),
      });
    }
    if (batch.length < PAGE) return cards;
  }
}

async function main() {
  const collection = asArray(
    JSON.parse(await readFile(join(DATA, "ash_collection.json"), "utf8")),
    "ash_collection.json",
  );
  const owned = new Map(collection.map((c) => [String(c.id), c]));
  const codes = [...new Set([...owned.keys()].map(setCodeOf))].sort();
  if (codes.length !== EXPECTED_SETS)
    throw new Error(
      `expected ${EXPECTED_SETS} set codes, found ${codes.length}`,
    );
  const setIds = codes.map(tcgdexSetId);

  const allSets = asArray(
    (
      await query(
        "{ sets { id name releaseDate logo symbol serie { name } cardCount { official total } } }",
      )
    ).sets,
    "sets",
  );
  const sets: SetInfo[] = setIds.map((id) => {
    const s = allSets.find((x) => x.id === id);
    if (!s) throw new Error(`TCGdex has no set ${id}`);
    const count = s.cardCount as { official: number; total: number };
    return {
      id,
      name: String(s.name),
      series: String((s.serie as Raw).name),
      releaseDate: String(s.releaseDate),
      total: count.total,
      printedTotal: count.official,
      ...(typeof s.logo === "string" && { logo: s.logo }),
      ...(typeof s.symbol === "string" && { symbol: s.symbol }),
    };
  });
  sets.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  await writeFile(
    join(DATA, "sets.json"),
    JSON.stringify(sets, null, 1) + "\n",
  );

  await mkdir(SETS_DIR, { recursive: true });
  // Drop set files that are not TCGdex sets of Ash's (e.g. old pokemontcg names).
  for (const file of await readdir(SETS_DIR))
    if (!setIds.includes(file.replace(/\.json$/, "")))
      await rm(join(SETS_DIR, file));

  let written = 0;
  let skipped = 0;
  const setCards = new Map<string, SetCard[]>();
  for (const id of setIds) {
    const file = join(SETS_DIR, `${id}.json`);
    if (existsSync(file)) {
      skipped++;
      setCards.set(id, JSON.parse(await readFile(file, "utf8")) as SetCard[]);
      continue;
    }
    const cards = await fetchSetCards(id);
    // Write each set as soon as it arrives, so a rerun resumes from here.
    await writeFile(file, JSON.stringify(cards, null, 1) + "\n");
    setCards.set(id, cards);
    written++;
    console.log(`${id}: ${cards.length} cards`);
  }

  const idMap: Record<string, string> = {};
  const unmapped: string[] = [];
  for (const [id, card] of owned) {
    const cards = setCards.get(tcgdexSetId(setCodeOf(id))) ?? [];
    const key = numberKey(String(card.number));
    const match = cards.find((c) => numberKey(c.number) === key);
    if (match) idMap[id] = match.id;
    else unmapped.push(id);
  }
  await writeFile(
    join(DATA, "id-map.json"),
    JSON.stringify(idMap, Object.keys(idMap).sort(), 1) + "\n",
  );

  const total = [...setCards.values()].reduce((n, c) => n + c.length, 0);
  console.log(
    `\n${requests} requests; ${sets.length} sets; set lists written ${written}, skipped ${skipped}; ${total} cards`,
  );
  console.log(
    `id map: ${Object.keys(idMap).length} of ${owned.size} owned cards mapped; unmapped: ${unmapped.join(", ") || "none"}`,
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
