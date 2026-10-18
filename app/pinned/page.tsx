import type { Metadata } from "next";
import { PinnedCards } from "@/components/pinned-cards";
import { Typography } from "@/components/ui/typography";

export const metadata: Metadata = { title: "Pinned · Ash's Card Album" };

/** Every pinned card; Home shows only the first two rows (D-050). */
export default function PinnedPage() {
  return (
    <main className="binder-desk flex-1 px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Typography variant="h1">Pinned</Typography>
        <PinnedCards />
      </div>
    </main>
  );
}
