import { LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { SearchTrigger } from "./search-trigger";
import { ShortcutsButton } from "./shortcuts-button";

// One size for every header control (D-052).
const link = buttonVariants({ variant: "ghost", size: "lg" });

export function SiteHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b bg-background px-2 sm:gap-2 sm:px-4">
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
      <div className="ml-auto flex min-w-0 flex-1 justify-end">
        <SearchTrigger />
      </div>
      <ShortcutsButton />
      {/* A POST, so no prefetch can log Ash out (D-043). */}
      <form action={logout}>
        <button
          type="submit"
          aria-label="Log out"
          className={buttonVariants({
            variant: "ghost",
            size: "lg",
            className: "max-sm:w-9 max-sm:px-0",
          })}
        >
          <LogOut aria-hidden className="sm:hidden" />
          <Typography as="span" variant="small" className="max-sm:hidden">
            Log out
          </Typography>
        </button>
      </form>
    </header>
  );
}
