import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlbumBinder } from "@/components/album/album-binder";
import { SearchBox } from "@/components/search-box";
import { SearchFilters } from "@/components/search-filters";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { paginate } from "@/lib/album";
import { getAllCards, getSetSummaries } from "@/lib/collection";
import {
  clearFiltersHref,
  filterCards,
  hasFilters,
  parseSearch,
  RARITY_ORDER,
  searchHref,
  sortCards,
} from "@/lib/search";

export const metadata: Metadata = { title: "Search · Ash's Card Album" };

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <main className="binder-desk search-desk flex flex-1 flex-col items-center gap-4 px-4 py-4 sm:py-6">
      {/* Outside the results' boundary, so it keeps focus while results load. */}
      <div className="w-full max-w-6xl">
        <Suspense>
          <SearchBox />
        </Suspense>
      </div>
      <Suspense
        fallback={<Skeleton className="h-[70dvh] w-full max-w-md rounded-md" />}
      >
        <Results {...props} />
      </Suspense>
    </main>
  );
}

async function Results({ searchParams }: PageProps<"/search">) {
  const state = parseSearch(await searchParams);
  const all = getAllCards();
  const results = sortCards(filterCards(all, state), state.sort);
  if (results.length && !paginate(results, state.page)) notFound();

  const options = {
    sets: getSetSummaries().map(({ id, name }) => ({ id, name })),
    types: [...new Set(all.flatMap((c) => c.types ?? []))].sort(),
    rarities: RARITY_ORDER.filter((r) => all.some((c) => c.rarity === r)),
  };
  const title = state.q
    ? `“${state.q}”`
    : state.owned
      ? "Ash's cards"
      : "All cards";

  return (
    <>
      <header className="w-full max-w-6xl">
        <Typography variant="h4" as="h1">
          {state.q ? `Results for “${state.q}”` : "Search"}
        </Typography>
        <Typography variant="caption" as="p" aria-live="polite">
          {results.length.toLocaleString("en")}{" "}
          {results.length === 1 ? "card" : "cards"}
          {state.owned ? " in Ash's collection" : ""}
        </Typography>
      </header>
      <SearchFilters state={state} options={options} />
      {results.length ? (
        <AlbumBinder
          cards={results}
          page={state.page}
          base={searchHref(state, {})}
          title={title}
        />
      ) : (
        <div className="binder-paper flex flex-col items-center gap-3 rounded-md p-8 text-center shadow-sm">
          <Typography variant="body" as="p">
            {state.q
              ? `No cards match “${state.q}”${hasFilters(state) ? " with these filters" : ""}.`
              : "No cards match these filters."}
          </Typography>
          <Link
            href={
              hasFilters(state)
                ? clearFiltersHref(state)
                : searchHref(state, { owned: false })
            }
            className={buttonVariants({ variant: "outline" })}
          >
            <Typography as="span" variant="small" color="inherit">
              {hasFilters(state)
                ? "Clear filters"
                : "Search all cards, not just Ash's"}
            </Typography>
          </Link>
        </div>
      )}
    </>
  );
}
