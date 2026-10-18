import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlbumBinder } from "@/components/album/album-binder";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getAlbumPage, getSet, getSetCards } from "@/lib/collection";

export async function generateMetadata({
  params,
}: PageProps<"/album/[set]">): Promise<Metadata> {
  const set = getSet((await params).set);
  return { title: set ? `${set.name} · Ash's Card Album` : "Set not found" };
}

export default function SetPage(props: PageProps<"/album/[set]">) {
  return (
    <main className="binder-desk flex flex-1 flex-col items-center gap-4 px-4 py-4 sm:py-6">
      <Suspense
        fallback={<Skeleton className="h-[70dvh] w-full max-w-md rounded-md" />}
      >
        <Binder {...props} />
      </Suspense>
    </main>
  );
}

async function Binder({ params, searchParams }: PageProps<"/album/[set]">) {
  const { set: setId } = await params;
  const { page: raw } = await searchParams;
  const page = raw === undefined ? 1 : Number(raw);
  const set = getSet(setId);
  const cards = getSetCards(setId);
  if (!set || !cards || !getAlbumPage(setId, page)) notFound();

  return (
    <>
      <header className="flex w-full max-w-6xl items-center gap-3">
        <Link
          href="/album"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronLeft aria-hidden className="size-4" />
          <Typography as="span" variant="small">
            All sets
          </Typography>
        </Link>
        <div className="min-w-0">
          <Typography variant="h4" as="h1" className="truncate">
            {set.name}
          </Typography>
          <Typography variant="caption" as="p">
            {set.series}
          </Typography>
        </div>
      </header>
      <AlbumBinder
        cards={cards}
        page={page}
        base={`/album/${setId}`}
        title={set.name}
        logo={set.logo}
      />
    </>
  );
}
