"use client";

import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import { useRecentSearches } from "@/lib/recent-searches";

export function RecentSearches() {
  const recent = useRecentSearches();
  if (!recent.length)
    return (
      <Typography variant="small" color="muted" weight="normal" as="p">
        Your last searches will show here.
      </Typography>
    );
  return (
    <ul className="flex flex-wrap gap-2">
      {recent.map((q) => (
        <li key={q}>
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className="inline-flex rounded-full border bg-background px-3 py-1.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Typography as="span" variant="small">
              {q}
            </Typography>
          </Link>
        </li>
      ))}
    </ul>
  );
}
