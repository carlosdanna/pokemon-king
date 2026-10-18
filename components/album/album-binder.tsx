import { cn } from "cn";
import { ViewTransition } from "react";
import { paginate, turnTargets, type AlbumCard } from "@/lib/album";
import { BinderPage } from "./binder-page";
import { PageNav } from "./page-nav";
import { SwipeTurn } from "./swipe-turn";

const turn = {
  "page-forward": "page-forward",
  "page-back": "page-back",
  default: "none",
};

/**
 * One page, or a two-page spread from 1280 px (D-027), with page turns.
 * Renders nothing when `page` does not exist; callers check first and 404.
 */
export function AlbumBinder({
  cards,
  page,
  base,
  title,
  logo,
}: {
  cards: readonly AlbumCard[];
  page: number;
  /** Path (and query) the page links add `page` to. */
  base: string;
  title: string;
  logo?: string;
}) {
  const current = paginate(cards, page);
  if (!current) return null;

  const turns = turnTargets(page, current.pageCount);
  const spread = [turns.left, turns.left + 1]
    .map((n) => (n === page ? current : paginate(cards, n)))
    .filter((p) => p !== null);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <SwipeTurn
        base={base}
        turns={turns}
        page={page}
        pageCount={current.pageCount}
      >
        <ViewTransition key={page} enter={turn} exit={turn} default="none">
          <div className="binder-spread">
            {spread.map((album) => (
              <BinderPage
                key={album.page}
                title={title}
                logo={logo}
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
      <PageNav base={base} turns={turns} />
    </div>
  );
}
