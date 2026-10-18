import type { Metadata } from "next";
import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import { getAllCards, getSetSummaries } from "@/lib/collection";
import {
  DEFAULT_SEARCH,
  RARITY_ORDER,
  searchHref,
  type SearchState,
} from "@/lib/search";

export const metadata: Metadata = { title: "Browse · Ash's Card Album" };

type Row = { label: string; count: number; filter: Partial<SearchState> };

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section aria-labelledby={`browse-${title}`}>
      <Typography variant="h3" as="h2" id={`browse-${title}`}>
        {title}
      </Typography>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {rows.map((row) => (
          <li key={row.label}>
            <Link
              href={searchHref(DEFAULT_SEARCH, row.filter)}
              className="binder-paper flex h-full items-baseline justify-between gap-2 rounded-md p-3 shadow-sm outline-none transition hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5"
            >
              <Typography variant="small" className="leading-tight">
                {row.label}
              </Typography>
              <Typography variant="caption">{row.count}</Typography>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Ash's owned cards by set, type and rarity, each a pre-filtered search (F7). */
export default function BrowsePage() {
  const owned = getAllCards().filter((c) => c.owned);
  const types = countBy(owned.flatMap((c) => c.types ?? []));
  const rarities = countBy(owned.map((c) => c.rarity ?? ""));

  const sets: Row[] = getSetSummaries()
    .filter((s) => s.owned > 0)
    .map((s) => ({ label: s.name, count: s.owned, filter: { set: [s.id] } }));
  const typeRows: Row[] = [...types]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => ({ label: type, count, filter: { type: [type] } }));
  const rarityRows: Row[] = RARITY_ORDER.filter((r) => rarities.has(r)).map(
    (rarity) => ({
      label: rarity,
      count: rarities.get(rarity) ?? 0,
      filter: { rarity: [rarity] },
    }),
  );

  return (
    <main className="binder-desk flex-1 px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div>
          <Typography variant="h1">Browse</Typography>
          <Typography variant="lead" className="mt-1">
            {owned.length.toLocaleString("en")} cards in Ash&apos;s collection
          </Typography>
        </div>
        <Section title="Types" rows={typeRows} />
        <Section title="Rarities" rows={rarityRows} />
        <Section title="Sets" rows={sets} />
      </div>
    </main>
  );
}
