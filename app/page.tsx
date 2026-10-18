import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { PinnedCards } from "@/components/pinned-cards";
import { RecentSearches } from "@/components/recent-searches";
import { SearchBox } from "@/components/search-box";
import { Typography } from "@/components/ui/typography";
import { getSetSummaries } from "@/lib/collection";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <Typography variant="h4" as="h2">
        {title}
      </Typography>
      {children}
    </section>
  );
}

const tile =
  "binder-paper flex h-full items-center gap-3 rounded-md p-3 shadow-sm outline-none transition hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5";

export default function Home() {
  const sets = getSetSummaries()
    .toSorted((a, b) => b.owned - a.owned)
    .slice(0, 6);
  return (
    <main className="binder-desk flex-1 px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <Typography variant="h1">Ash&apos;s Card Album</Typography>
        <Section title="Pinned">
          <PinnedCards />
        </Section>
        <Section title="Search">
          <Suspense>
            <SearchBox />
          </Suspense>
          <RecentSearches />
        </Section>
        <Section title="Sets">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sets.map((set) => (
              <li key={set.id}>
                <Link href={`/album/${set.id}`} className={tile}>
                  <div className="relative h-10 w-16 shrink-0">
                    {set.logo && (
                      <Image
                        src={`${set.logo}.webp`}
                        alt=""
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Typography variant="small" className="leading-tight">
                      {set.name}
                    </Typography>
                    <Typography variant="caption">
                      {set.owned} / {set.total} owned
                    </Typography>
                  </div>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/album" className={tile}>
                <Typography variant="small">All sets →</Typography>
              </Link>
            </li>
          </ul>
        </Section>
      </div>
    </main>
  );
}
