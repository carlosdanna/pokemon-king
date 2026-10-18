# Ash's Card Album — Implementation Plan

Oct 18, 2026 · @Carlos Danna

## Summary

The app is built as a binder-style card album in eight milestones, about 7 hours of work. It extends the [requirements plan](https://claude.ai/code/artifact/2c16a812-4ef8-461a-ae01-8b69e2cf7308) with a visual layer: 3x3 binder pages, two-page spreads on large screens, greyed-out cards Ash does not own, a copy counter, page-turn animations and a card zoom with an info panel.

The stack stays Next.js 16 + React + TypeScript on Vercel, with shadcn/ui as the component base. Animations use React's built-in `<ViewTransition>` for page turns and the card zoom, plus Motion for small interactions and a tilt library for a holo shine.

The album design adds about 3 hours to the 4-hour estimate in the requirements plan. Milestones are ordered so a working album exists after milestone 3; later milestones can be trimmed using the cut list in Risks.

## Album design decisions

The album is organised like a real binder: one section per set, cards in set-number order, nine pockets per page. Every page keeps the 3x3 layout at every screen size and only the card size changes, so page numbers, URLs and arrow-key movement stay the same on phone and desktop.

| Screen width | Layout | Cards visible | Card width (approx.) |
| --- | --- | --- | --- |
| Under 640 px (phone) | One 3x3 page, swipe or arrows to turn | 9 | 105–130 px |
| 640–1279 px (tablet, laptop) | One 3x3 page, centred | 9 | 140–200 px |
| 1280 px and up (large desktop) | Two-page spread side by side, like an open binder | 18 | 160–220 px |

On a spread, the URL still names a single page (`?page=3`); the app shows that page with its partner, so links work on every screen size. Spreads always pair odd with even pages (1–2, 3–4), like a real book.

Card states:

| State | Look | Behaviour |
| --- | --- | --- |
| Owned, one copy | Full colour in a sleeve pocket | Click or `Enter` zooms in |
| Owned, several copies | Full colour with a counter badge (×3) in the top-right corner | Counter also shown in the side panel |
| Not owned | Greyscale and dimmed (`grayscale(1)`, about 45% opacity), empty-sleeve feel | Zooms in full colour, with a "Not in collection" label |
| Favourite | Small pin marker in the top-left corner | `f` toggles it |
| Zoomed | Card grows from its pocket to a large view; info panel slides in beside it | `Esc` or click outside returns it to its pocket |

Card zoom and side panel:

- On desktop the card morphs from its pocket to the left half of the screen, tilts with the pointer and shows a holo shine; the panel on the right holds name, set, number, rarity, copies owned, HP and types, plus the Attacks, Weaknesses & resistances and Legalities tabs.
- On phones the card morphs to the top of the screen and the panel becomes a bottom drawer.
- The zoom has its own URL (`/cards/[id]`) through Next.js intercepting routes: clicking in the album opens it as an overlay over the page, while opening the link directly shows a full detail page. Back closes the overlay.
- `[` and `]` move to the previous or next card while zoomed, so Ash can flip through a page without closing it.

Page turns animate as a 3D page flip (`rotateY` around the binder spine) in the direction of travel, and as a short slide on phones. With `prefers-reduced-motion`, all of them become an instant swap.

## Libraries

shadcn/ui is the base: its components are Radix-based, so tabs, dialogs, drawers and the command menu come with correct keyboard behaviour. The album feel comes from three additions: React `<ViewTransition>` for the zoom and page turns, Motion for small interactions, and a tilt library for the holo shine.

| Need | Pick | Alternatives considered | Why |
| --- | --- | --- | --- |
| Base components | [shadcn/ui](https://ui.shadcn.com): Tabs, Sheet, Drawer, Command, Dialog, Toggle Group, Badge, Skeleton, Sonner | — | Copied into the repo, so styles can be bent into a binder look; Radix keyboard handling |
| Card zoom (pocket to large view) | React [`<ViewTransition>`](https://nextjs.org/docs/app/guides/view-transitions) with a shared `name` per card | Motion `layoutId` | Works across the route change to `/cards/[id]` with no config in the App Router; no extra bundle; falls back to no animation in unsupported browsers |
| Page turns | `<ViewTransition>` with `transitionTypes` (`page-forward`, `page-back`) and a CSS `rotateY` page-flip keyframe | [react-pageflip](https://github.com/nodlik/react-pageflip) (StPageFlip wrapper) | react-pageflip gives a realistic curl, but needs `forwardRef` pages, documents no keyboard support and owns its own layout, which fights the responsive 3x3 grid. Keep it as a stretch experiment |
| Micro-interactions (counter pop, pin toggle, panel spring, hover lift) | [Motion](https://motion.dev/docs/react-layout-animations) (`motion/react`) | CSS only | Springs and `AnimatePresence` for things that appear and disappear; used sparingly |
| Holo tilt and shine on the zoomed card | [react-parallax-tilt](https://www.npmjs.com/package/react-parallax-tilt) with glare | [hover-tilt](https://github.com/simeydotme/hover-tilt) (web component, Pokémon card demos) | react-parallax-tilt is a plain React component with built-in glare; hover-tilt looks closer to real holo foil but is used through a web component in React, and its README and sidebar disagree on the licence |
| Holo foil reference | [pokemon-cards-css](https://gittrend.io/repo/simeydotme/pokemon-cards-css) by simeydotme | — | The best-known holo effect (about 8.3k stars), but GPL-3.0 and Svelte-based: use as visual inspiration only, do not copy its CSS into the repo |
| Mobile side panel | shadcn Drawer (built on Vaul) | shadcn Sheet | Drag-to-dismiss bottom drawer feels native on a phone |
| Command palette | shadcn Command (built on cmdk) | — | Ready-made `Ctrl/Cmd + K` palette for the keyboard layer |

Visual direction: binder pages with a faint paper texture, sleeve pockets with a soft inner shadow and highlight, the set logo and series as the page header (logos come from the set data), and page numbers in the footer. Colours stay neutral so the card art carries the page.

## Data changes

Showing cards Ash does not own needs the full card list of every set, which `ash_collection.json` does not contain. A one-off script fetches it and commits the result, so the app still makes no API calls at runtime. The Pokémon TCG API itself is down and being retired, so the script reads the same v2 data from the legacy `PokemonTCG/pokemon-tcg-data` GitHub repo, pinned to one commit (D-021).

1. `sets/en.json` once → `data/sets.json` (name, series, release date, total, logo) for the 121 set codes in the collection.
2. For each set, `cards/en/<code>.json`, slimmed to `id, name, number, rarity, supertype, types, images` → one file per set in `data/sets/<code>.json`. 122 requests in all.
3. Merge with the collection: each card gets `owned` (true or false) and `quantity` (0 to 7).
4. Sort each set by natural card number, then cut it into pages of 9.

The script waits 250 ms between calls, retries 429 and 5xx with backoff, takes about a minute, and skips sets already on disk so it can resume.

The album loads one set file at a time, so a phone never downloads every set. Full detail for owned cards still comes from `ash_collection.json` on the server; unowned cards show the slim fields, plus attacks and other details only if the script also fetched them (a stretch option, as it makes the files larger).

The album shows every printing in a set, while search and filters work across all sets with an Owned / All toggle, defaulting to Owned.

## Milestones

1. M0 · Setup and deploy (30 min)
2. M1 · Data pipeline (45 min)
3. M2 · Album pages (75 min)
4. M3 · Card zoom and side panel (60 min)
5. M4 · Search and filters (45 min)
6. M5 · Login and favourites (60 min)
7. M6 · Keyboard layer (45 min)
8. M7 · Polish and submission (45 min)

Total: 6 h 45 min, about 7 hours.

A basic album exists after M2 and the signature interaction after M3; M4 to M7 complete the requirements plan's features and can be trimmed if time runs out.

## Milestone details

Each milestone ends in a deployed, working state on Vercel, so the build can stop at any point and still be submitted.

### M0 · Setup and deploy (30 min)

- [x] `create-next-app` with TypeScript strict, ESLint and Tailwind; `shadcn init` and add Button, Badge, Tabs, Sheet, Drawer, Dialog, Command, Toggle Group, Skeleton, Sonner
- [x] Install `motion` and `react-parallax-tilt`; configure the `images.pokemontcg.io` remote pattern in `next.config`
- [x] Vitest + Testing Library; a pre-commit check for lint, typecheck, Prettier and tests (D-019)
- [x] Public GitHub repo, linked to Vercel; empty app deployed

Done when: the empty app is live and `pnpm check` passes.

### M1 · Data pipeline (45 min)

- [x] `scripts/fetch-sets.ts`: sets and per-set card lists, rate-limited and resumable (see Data changes)
- [x] `lib/collection.ts`: load the collection, group by `id` into quantities, merge with set lists
- [x] `Card` and `AlbumCard` types; natural sort on `number`; page slicing in 9s
- [x] Unit tests for grouping, sorting and paging

Done when: `getAlbumPage(setCode, page)` returns 9 typed cards with `owned` and `quantity`, covered by tests.

### M2 · Album pages (75 min)

- [ ] Routes: `/album` (set list with owned / total counts) and `/album/[set]?page=N`
- [ ] Binder page component: header with set logo, 3x3 pocket grid, page footer
- [ ] Responsive layout: one page below 1280 px, two-page spread from 1280 px
- [ ] Card tile: greyscale for unowned, ×N counter top right, pin marker top left, skeleton while the image loads, placeholder on error
- [ ] Page turns: previous / next buttons and swipe, tagged `page-forward` / `page-back`, page-flip CSS keyframes, reduced-motion fallback

Done when: Ash can open a set, see owned and unowned cards correctly, and turn pages with an animation on phone and desktop.

### M3 · Card zoom and side panel (60 min)

- [ ] `/cards/[id]` full page plus intercepting route `@modal/(.)cards/[id]` for the overlay
- [ ] Shared `<ViewTransition name="card-<id>">` on the tile and the zoomed card for the morph
- [ ] Zoomed card in full colour with tilt and glare; "Not in collection" label when unowned
- [ ] Side panel (desktop) / bottom drawer (phone): facts, copies owned, tabs for Attacks, Weaknesses & resistances, Legalities; layouts for Trainer and Energy cards
- [ ] Close with `Esc`, click outside or Back; focus returns to the card's pocket

Done when: clicking any card zooms it with a morph, the panel shows correct data, and a copied `/cards/[id]` link opens the full page.

### M4 · Search and filters (45 min)

- [ ] Search box in the header (partial, case-insensitive name match)
- [ ] Results view as album pages, with filters for set, kind, type and rarity and an Owned / All toggle (default Owned)
- [ ] All state in the URL; empty state with the query and a clear-filters button

Done when: a filtered URL, pasted into a new tab, shows the same results.

### M5 · Login and favourites (60 min)

- [ ] `/login` page and server action checking `APP_PASSWORD`; signed httpOnly cookie for 30 days; `proxy.ts` redirect; log-out link
- [ ] Favourites route handler reading and writing a Redis set (Upstash via the Vercel Marketplace), checking the session
- [ ] Pin toggle on tiles and in the side panel; `localStorage` mirror for instant display; fallback when Redis is not configured
- [ ] Homepage: pinned favourites first, then search, recent searches and set shortcuts

Done when: a pin made on the laptop shows on the phone after a refresh, and signed-out visitors only see the login page.

### M6 · Keyboard layer (45 min)

- [ ] Roving focus across the 3x3 grid (and across both pages of a spread); `PageUp` / `PageDown` or `,` / `.` to turn pages
- [ ] `/` to search, `f` to pin, `Enter` to zoom, `[` / `]` while zoomed, `Esc` to close
- [ ] `?` shortcut overlay; `Ctrl/Cmd + K` command palette (stretch)
- [ ] Visible focus ring that survives the greyscale and zoom effects

Done when: the demo video's walkthrough can be done without a mouse.

### M7 · Polish and submission (45 min)

- [ ] Phone check on the Vercel URL; reduced-motion check; contrast of labels on greyed cards
- [ ] README: setup, environment variables, approach, library choices, trade-offs, cut features, shortcut table
- [ ] 2-minute demo video: login, page turns, zoom, a keyboard-only run, favourites syncing to the phone

Done when: the URL, repo and video are ready to send, with the password sent separately.

## Risks

The main risk is time: about 7 hours against a half-day brief. Animation polish is the easiest place to overrun, so each effect has a plain fallback.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| About 7 hours of work against a half-day brief | High | Stop after any milestone and submit; cut list in order: command palette, react-pageflip experiment, holo glare, recent searches, phone swipe |
| Unowned cards need full set lists that the collection lacks; the API is deprecated (no new keys, keys end 1 March 2027, 30 requests a minute without a key) | High | Fetch once with a resumable, rate-limited script and commit the files; if the API is down, show owned cards only and note it in the README |
| `<ViewTransition>` needs React 19.3 and newer browser features; Safari may animate differently | Medium | Pin versions; test on Chrome, Safari and Firefox; without support the app works with no animation |
| The zoom morph only plays when the destination renders in the same commit; a suspending detail page skips it | Medium | Prefetch card links; keep the overlay's data in the already-loaded set file so it renders at once |
| Page-flip and zoom animations clash with keyboard focus and screen readers | Medium | Move focus only after the transition ends; announce page changes in a live region; honour `prefers-reduced-motion` |
| 3x3 on a 360 px phone gives cards about 105 px wide, too small to read | Medium | Tiles are for recognising the art; tapping zooms. If testing shows it is too small, switch phones to 2x3 and map page numbers by first card |
| Greyscale and low opacity can hide the focus ring and fail contrast | Low | Focus ring drawn outside the filtered element; counter and labels kept at full contrast |
| Holo libraries: pokemon-cards-css is GPL-3.0 and hover-tilt's licence is unclear | Low | Use react-parallax-tilt (plain React, with glare); treat pokemon-cards-css as inspiration only |
| Card images hot-linked from the deprecated API's image host | Medium | `next/image` with a placeholder showing name and number on error |
