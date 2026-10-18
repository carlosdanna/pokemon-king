"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PinToggle } from "@/components/pin-toggle";
import { Typography } from "@/components/ui/typography";
import type { AlbumCard, SetInfo, TypeModifier } from "@/lib/album";

const TABS = ["attacks", "weaknesses", "legal"] as const;
const NONE = "none listed";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b py-1.5 last:border-0">
      <Typography as="dt" variant="small" color="muted" weight="normal">
        {label}
      </Typography>
      <Typography as="dd" variant="small" className="text-right">
        {children ?? NONE}
      </Typography>
    </div>
  );
}

function Empty() {
  return (
    <Typography variant="small" color="muted" weight="normal">
      {NONE}
    </Typography>
  );
}

const modifiers = (list?: TypeModifier[]) =>
  list?.length
    ? list.map((m) => [m.type, m.value].filter(Boolean).join(" ")).join(", ")
    : null;

const legality = (legal: boolean) => (legal ? "Legal" : "Not legal");

function SetLink({ set }: { set: SetInfo }) {
  return (
    <Link
      href={`/album/${set.id}`}
      className="rounded-sm underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {set.name}
    </Link>
  );
}

export function CardPanel({ card, set }: { card: AlbumCard; set: SetInfo }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const tab = TABS.find((t) => t === raw) ?? TABS[0];
  const selectTab = (value: unknown) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", String(value));
    // No server round trip per tab; Next keeps useSearchParams in sync (D-034).
    window.history.replaceState(null, "", `?${params}`);
  };
  const pokemon = card.category === "Pokemon";

  return (
    <div className="flex flex-col gap-4">
      {/* Pin on the left, as on tiles; the overlay's close button owns the top right. */}
      <div className="flex items-start gap-3">
        <PinToggle id={card.id} name={card.name} className="mt-0.5 shrink-0" />
        <div>
          <Typography variant="h3" as="h2">
            {card.name}
          </Typography>
          <Typography variant="caption" as="p">
            <SetLink set={set} /> · #{card.number}
          </Typography>
        </div>
      </div>

      <dl>
        <Fact label="Set">
          <SetLink set={set} />
        </Fact>
        <Fact label="Number">{card.number}</Fact>
        <Fact label="Rarity">{card.rarity}</Fact>
        <Fact label="Copies owned">{card.quantity}</Fact>
        {pokemon && (
          <>
            <Fact label="HP">{card.hp}</Fact>
            <Fact label="Types">{card.types?.join(", ")}</Fact>
            <Fact label="Stage">
              {card.stage &&
                [card.stage, card.evolveFrom && `from ${card.evolveFrom}`]
                  .filter(Boolean)
                  .join(", ")}
            </Fact>
          </>
        )}
        {card.category === "Trainer" && (
          <Fact label="Trainer type">{card.trainerType}</Fact>
        )}
        {card.category === "Energy" && (
          <Fact label="Energy type">{card.energyType}</Fact>
        )}
      </dl>

      {pokemon ? (
        <Tabs value={tab} onValueChange={selectTab}>
          <TabsList className="w-full">
            <TabsTrigger value="attacks">Attacks</TabsTrigger>
            <TabsTrigger value="weaknesses">
              Weaknesses & resistances
            </TabsTrigger>
            <TabsTrigger value="legal">Legalities</TabsTrigger>
          </TabsList>
          <TabsContent value="attacks" className="flex flex-col gap-3 pt-2">
            {!card.abilities?.length && !card.attacks?.length && <Empty />}
            {card.abilities?.map((a) => (
              <div key={a.name}>
                <Typography variant="small" as="p">
                  {a.type}: {a.name}
                </Typography>
                <Typography variant="caption" as="p">
                  {a.effect}
                </Typography>
              </div>
            ))}
            {card.attacks?.map((a, i) => (
              <div key={`${a.name}-${i}`}>
                <div className="flex justify-between gap-4">
                  <Typography variant="small" as="p">
                    {a.name}
                  </Typography>
                  {a.damage && (
                    <Typography variant="small" as="p">
                      {a.damage}
                    </Typography>
                  )}
                </div>
                <Typography variant="caption" as="p">
                  Cost: {a.cost?.join(", ") || NONE}
                </Typography>
                {a.effect && (
                  <Typography variant="caption" as="p" color="default">
                    {a.effect}
                  </Typography>
                )}
              </div>
            ))}
          </TabsContent>
          <TabsContent value="weaknesses">
            <dl>
              <Fact label="Weaknesses">{modifiers(card.weaknesses)}</Fact>
              <Fact label="Resistances">{modifiers(card.resistances)}</Fact>
              <Fact label="Retreat cost">{card.retreat}</Fact>
            </dl>
          </TabsContent>
          <TabsContent value="legal">
            <dl>
              <Fact label="Standard">
                {card.legal && legality(card.legal.standard)}
              </Fact>
              <Fact label="Expanded">
                {card.legal && legality(card.legal.expanded)}
              </Fact>
            </dl>
          </TabsContent>
        </Tabs>
      ) : (
        <section aria-label="Rules" className="flex flex-col gap-1">
          <Typography variant="overline" as="h3" color="muted">
            Rules
          </Typography>
          {card.effect ? (
            <Typography variant="small" as="p" weight="normal">
              {card.effect}
            </Typography>
          ) : (
            <Empty />
          )}
        </section>
      )}
    </div>
  );
}
