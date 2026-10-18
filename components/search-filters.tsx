"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import {
  clearFiltersHref,
  hasFilters,
  KINDS,
  LEGAL_FORMATS,
  searchHref,
  SORTS,
  type Kind,
  type LegalFormat,
  type SearchState,
  type Sort,
} from "@/lib/search";

export type FilterOptions = {
  sets: { id: string; name: string }[];
  types: string[];
  rarities: string[];
};

const KIND_LABELS: Record<Kind, string> = {
  pokemon: "Pokémon",
  trainer: "Trainer",
  energy: "Energy",
};
const capitalise = (s: string) => s[0].toUpperCase() + s.slice(1);

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Typography
      as="label"
      variant="caption"
      color="default"
      className="flex flex-col gap-1"
    >
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </Typography>
  );
}

/** Pick any number of values (D-049); the input filters the list as you type. */
function MultiSelect({
  label,
  items,
  value,
  onChange,
  itemLabel = (v) => v,
}: {
  label: string;
  items: string[];
  value: string[];
  onChange: (value: string[]) => void;
  itemLabel?: (value: string) => string;
}) {
  const id = useId();
  const anchor = useComboboxAnchor();
  return (
    <div className="flex flex-col gap-1">
      <Typography as="label" variant="caption" color="default" htmlFor={id}>
        {label}
      </Typography>
      <Combobox
        multiple
        items={items}
        value={value}
        onValueChange={onChange}
        itemToStringLabel={itemLabel}
      >
        <ComboboxChips ref={anchor} className="min-h-9 bg-background">
          <ComboboxValue>
            {(selected: string[]) => (
              <>
                {selected.map((v) => (
                  <ComboboxChip key={v} aria-label={itemLabel(v)}>
                    {itemLabel(v)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={
                    selected.length ? "" : `Any ${label.toLowerCase()}`
                  }
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>
            <Typography as="span" variant="small" color="muted" weight="normal">
              No matches
            </Typography>
          </ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                <Typography
                  as="span"
                  variant="small"
                  weight="normal"
                  color="inherit"
                >
                  {itemLabel(item)}
                </Typography>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function SearchFilters({
  state,
  options,
}: {
  state: SearchState;
  options: FilterOptions;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const go = (href: string) =>
    startTransition(() => router.replace(href, { scroll: false }));
  const update = (patch: Partial<SearchState>) => go(searchHref(state, patch));
  // "" in a select means "any"; the toggles fall back to "any" when emptied.
  const any = <T,>(value: string) => (value || undefined) as T | undefined;
  const setNames = new Map(options.sets.map((s) => [s.id, s.name]));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MultiSelect
          label="Set"
          items={options.sets.map((s) => s.id)}
          itemLabel={(id) => setNames.get(id) ?? id}
          value={state.set}
          onChange={(set) => update({ set })}
        />
        <MultiSelect
          label="Type"
          items={options.types}
          value={state.type}
          onChange={(type) => update({ type })}
        />
        <MultiSelect
          label="Rarity"
          items={options.rarities}
          value={state.rarity}
          onChange={(rarity) => update({ rarity })}
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Select
          label="Legal in"
          value={state.legal ?? ""}
          onChange={(v) => update({ legal: any<LegalFormat>(v) })}
        >
          <option value="">Any format</option>
          {LEGAL_FORMATS.map((f) => (
            <option key={f} value={f}>
              {capitalise(f)}
            </option>
          ))}
        </Select>
        <Select
          label="Sort by"
          value={state.sort}
          onChange={(v) => update({ sort: v as Sort })}
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {capitalise(s)}
            </option>
          ))}
        </Select>
        <ToggleGroup
          aria-label="Kind"
          variant="outline"
          size="lg"
          spacing={0}
          value={[state.kind ?? "any"]}
          onValueChange={([v]) =>
            update({ kind: v && v !== "any" ? (v as Kind) : undefined })
          }
        >
          <ToggleGroupItem value="any">
            <Typography as="span" variant="small" color="inherit">
              All kinds
            </Typography>
          </ToggleGroupItem>
          {(Object.keys(KINDS) as Kind[]).map((k) => (
            <ToggleGroupItem key={k} value={k}>
              <Typography as="span" variant="small" color="inherit">
                {KIND_LABELS[k]}
              </Typography>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          aria-label="Cards to show"
          variant="outline"
          size="lg"
          spacing={0}
          value={[state.owned ? "owned" : "all"]}
          onValueChange={([v]) => v && update({ owned: v === "owned" })}
        >
          <ToggleGroupItem value="owned">
            <Typography as="span" variant="small" color="inherit">
              Owned
            </Typography>
          </ToggleGroupItem>
          <ToggleGroupItem value="all">
            <Typography as="span" variant="small" color="inherit">
              All
            </Typography>
          </ToggleGroupItem>
        </ToggleGroup>
        {hasFilters(state) && (
          <Button
            variant="ghost"
            size="lg"
            onClick={() => go(clearFiltersHref(state))}
          >
            <Typography as="span" variant="small" color="inherit">
              Clear filters
            </Typography>
          </Button>
        )}
      </div>
    </div>
  );
}
