import type { AlbumCard, SetInfo } from "@/lib/album";
import { CardPanel } from "./card-panel";
import { ZoomedCard } from "./zoomed-card";

// Height cap keeps the whole card on screen: 245/337 is the card's aspect ratio.
export const zoomedWidth = "w-full max-w-[min(24rem,calc(70dvh*245/337))]";

/** Full-page layout: panel beside the card on desktop, below it on phones (D-033). */
export function CardView({ card, set }: { card: AlbumCard; set: SetInfo }) {
  return (
    <div
      data-card-id={card.id}
      className="grid w-full max-w-5xl items-start gap-6 lg:grid-cols-2 lg:gap-10"
    >
      <ZoomedCard card={card} className={`mx-auto ${zoomedWidth}`} />
      <CardPanel card={card} set={set} />
    </div>
  );
}
