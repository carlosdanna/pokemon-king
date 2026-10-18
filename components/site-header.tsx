import Link from "next/link";
import { Suspense } from "react";
import { Typography } from "@/components/ui/typography";
import { SearchBox } from "./search-box";

const link =
  "rounded-md px-2 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

export function SiteHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 sm:gap-4">
      <Link href="/" className={link}>
        <Typography as="span" variant="small" weight="semibold">
          <span className="sm:hidden">Ash</span>
          <span className="hidden sm:inline">Ash&apos;s Card Album</span>
        </Typography>
      </Link>
      <nav aria-label="Main" className="flex">
        <Link href="/album" className={link}>
          <Typography as="span" variant="small">
            Album
          </Typography>
        </Link>
        <Link href="/browse" className={link}>
          <Typography as="span" variant="small">
            Browse
          </Typography>
        </Link>
      </nav>
      <div className="ml-auto flex flex-1 justify-end">
        {/* useSearchParams needs a Suspense boundary under cacheComponents. */}
        <Suspense>
          <SearchBox />
        </Suspense>
      </div>
    </header>
  );
}
