import { cn } from "cn";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { BinderPage } from "@/components/album/binder-page";
import { PageNav } from "@/components/album/page-nav";
import { SwipeTurn } from "@/components/album/swipe-turn";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { turnTargets } from "@/lib/album";
import { getAlbumPage, getSet } from "@/lib/collection";

const turn = {
  "page-forward": "page-forward",
  "page-back": "page-back",
  default: "none",
};

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
  const current = set && getAlbumPage(setId, page);
  if (!set || !current) notFound();

  const turns = turnTargets(page, current.pageCount);
  const spread = [turns.left, turns.left + 1]
    .map((n) => (n === page ? current : getAlbumPage(setId, n)))
    .filter((p) => p !== null);

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
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <SwipeTurn setId={setId} turns={turns}>
          <ViewTransition key={page} enter={turn} exit={turn} default="none">
            <div className="binder-spread">
              {spread.map((album) => (
                <BinderPage
                  key={album.page}
                  set={set}
                  album={album}
                  className={cn(
                    album.page !== page && "hidden xl:flex",
                    album.page % 2
                      ? "xl:rounded-r-none xl:spine-left"
                      : "xl:rounded-l-none xl:spine-right",
                  )}
                />
              ))}
            </div>
          </ViewTransition>
        </SwipeTurn>
        <PageNav setId={setId} turns={turns} />
      </div>
    </>
  );
}
