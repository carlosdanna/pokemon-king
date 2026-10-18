import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CardOverlay } from "@/components/card/card-overlay";
import { loadCard } from "@/lib/collection";

// Opened from the album: the card zooms over the page (intercepted /cards/[id]).
export default function CardModal(props: PageProps<"/cards/[id]">) {
  return (
    <Suspense fallback={null}>
      <Overlay {...props} />
    </Suspense>
  );
}

async function Overlay({ params }: PageProps<"/cards/[id]">) {
  const found = await loadCard((await params).id);
  if (!found) notFound();
  return <CardOverlay card={found.card} set={found.set} />;
}
