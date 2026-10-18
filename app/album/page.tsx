import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import { getSetSummaries } from "@/lib/collection";

export const metadata: Metadata = { title: "Sets · Ash's Card Album" };

export default function AlbumIndex() {
  const sets = getSetSummaries();
  return (
    <main className="binder-desk flex-1 px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Typography variant="h1">Ash&apos;s Card Album</Typography>
        <Typography variant="lead" className="mt-1">
          {sets.length} sets, one binder section each
        </Typography>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sets.map((set) => (
            <li key={set.id}>
              <Link
                href={`/album/${set.id}`}
                className="binder-paper flex h-full flex-col gap-2 rounded-md p-3 shadow-sm outline-none transition hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5"
              >
                <div className="relative h-14">
                  {set.logo && (
                    <Image
                      src={`${set.logo}.webp`}
                      alt=""
                      fill
                      unoptimized
                      sizes="200px"
                      className="object-contain"
                    />
                  )}
                </div>
                <Typography variant="small" className="leading-tight">
                  {set.name}
                </Typography>
                <Typography variant="caption">{set.series}</Typography>
                <Typography
                  variant="caption"
                  color="default"
                  className="mt-auto"
                >
                  {set.owned} / {set.total} owned
                </Typography>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
