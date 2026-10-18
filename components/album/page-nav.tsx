import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/** `base` is a path that may already carry a query, e.g. a search. */
export function pageHref(base: string, page: number) {
  const [path, query] = base.split("?");
  const params = new URLSearchParams(query);
  params.set("page", String(page));
  return `${path}?${params}`;
}

export type Turns = {
  prev: number | null;
  next: number | null;
  spreadPrev: number | null;
  spreadNext: number | null;
};

function TurnLink({
  base,
  target,
  forward,
  className,
}: {
  base: string;
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
      href={pageHref(base, target)}
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
export function PageNav({ base, turns }: { base: string; turns: Turns }) {
  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-center gap-4 sm:contents"
    >
      <TurnLink
        base={base}
        target={turns.prev}
        forward={false}
        className="sm:order-first xl:hidden"
      />
      <TurnLink
        base={base}
        target={turns.spreadPrev}
        forward={false}
        className="hidden sm:order-first xl:inline-flex"
      />
      <TurnLink base={base} target={turns.next} forward className="xl:hidden" />
      <TurnLink
        base={base}
        target={turns.spreadNext}
        forward
        className="hidden xl:inline-flex"
      />
    </nav>
  );
}
