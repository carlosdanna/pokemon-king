import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { pageHref } from "@/components/album/page-nav";
import { CardView } from "@/components/card/card-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { loadCard } from "@/lib/collection";

export async function generateMetadata({
  params,
}: PageProps<"/cards/[id]">): Promise<Metadata> {
  const found = await loadCard((await params).id);
  return {
    title: found ? `${found.card.name} · Ash's Card Album` : "Card not found",
  };
}

export default function CardPage(props: PageProps<"/cards/[id]">) {
  return (
    <main className="binder-desk flex flex-1 flex-col items-center gap-4 px-4 py-4 sm:py-6">
      <Suspense
        fallback={<Skeleton className="h-[70dvh] w-full max-w-md rounded-md" />}
      >
        <Card {...props} />
      </Suspense>
    </main>
  );
}

async function Card({ params }: PageProps<"/cards/[id]">) {
  const found = await loadCard((await params).id);
  if (!found) notFound();
  const { card, set, page } = found;

  return (
    <>
      <header className="flex w-full max-w-5xl">
        <Link
          href={pageHref(set.id, page)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronLeft aria-hidden className="size-4" />
          <Typography as="span" variant="small">
            {set.name}, page {page}
          </Typography>
        </Link>
      </header>
      <CardView card={card} set={set} />
    </>
  );
}
