import { cn } from "cn";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import { PAGE_SIZE, type AlbumPage } from "@/lib/album";
import { CardTile } from "./card-tile";

export function BinderPage({
  title,
  logo,
  album,
  className,
}: {
  title: string;
  /** TCGdex logo base URL, for a set's own pages. */
  logo?: string;
  album: AlbumPage;
  className?: string;
}) {
  return (
    <section
      aria-label={`Page ${album.page}`}
      className={cn(
        "binder-paper flex flex-col gap-3 rounded-md p-3 shadow-md sm:p-4",
        className,
      )}
    >
      <header className="flex h-8 items-center gap-3">
        {logo && (
          <div className="relative h-full w-20 shrink-0">
            <Image
              src={`${logo}.webp`}
              alt=""
              fill
              unoptimized
              sizes="80px"
              className="object-contain object-left"
            />
          </div>
        )}
        <Typography variant="small" color="muted" className="truncate">
          {title}
        </Typography>
      </header>
      <ol className="grid grid-cols-[repeat(3,var(--card-w))] gap-2 sm:gap-3">
        {album.cards.map((card) => (
          <li key={card.id}>
            <CardTile card={card} />
          </li>
        ))}
        {Array.from({ length: PAGE_SIZE - album.cards.length }, (_, i) => (
          <li key={`empty-${i}`} aria-hidden>
            <div className="binder-pocket" />
          </li>
        ))}
      </ol>
      <footer className="text-center">
        <Typography variant="caption">
          Page {album.page} of {album.pageCount}
        </Typography>
      </footer>
    </section>
  );
}
