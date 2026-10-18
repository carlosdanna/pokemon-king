import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const pageHref = (setId: string, page: number) =>
  `/album/${setId}?page=${page}`;

export type Turns = {
  prev: number | null;
  next: number | null;
  spreadPrev: number | null;
  spreadNext: number | null;
};

function TurnLink({
  setId,
  target,
  forward,
  className,
}: {
  setId: string;
  target: number | null;
  forward: boolean;
  className: string;
}) {
  const Icon = forward ? ChevronRight : ChevronLeft;
  const classes = cn(
    buttonVariants({ variant: "outline", size: "icon-lg" }),
    "rounded-full",
    className,
  );
  if (target === null)
    return (
      <span aria-hidden className={cn(classes, "opacity-40")}>
        <Icon />
      </span>
    );
  return (
    <Link
      href={pageHref(setId, target)}
      scroll={false}
      transitionTypes={[forward ? "page-forward" : "page-back"]}
      aria-label={`${forward ? "Next" : "Previous"} page (page ${target})`}
      className={classes}
    >
      <Icon />
    </Link>
  );
}

/**
 * One-page buttons below 1280 px, spread buttons from 1280 px (D-027).
 * From 640 px the nav dissolves into its flex parent so the buttons flank the binder.
 */
export function PageNav({ setId, turns }: { setId: string; turns: Turns }) {
  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-center gap-4 sm:contents"
    >
      <TurnLink
        setId={setId}
        target={turns.prev}
        forward={false}
        className="sm:order-first xl:hidden"
      />
      <TurnLink
        setId={setId}
        target={turns.spreadPrev}
        forward={false}
        className="hidden sm:order-first xl:inline-flex"
      />
      <TurnLink
        setId={setId}
        target={turns.next}
        forward
        className="xl:hidden"
      />
      <TurnLink
        setId={setId}
        target={turns.spreadNext}
        forward
        className="hidden xl:inline-flex"
      />
    </nav>
  );
}
