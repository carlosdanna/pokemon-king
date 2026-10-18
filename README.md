# Ash's Card Album

A binder-style album for Ash's Pokémon TCG collection. Every set is a section of the binder, with nine cards to a page in card-number order; the cards Ash owns are in colour and the ones he is missing are greyed out, so each page shows what is left to collect. Any card zooms out of its pocket into a large view with its details, any card can be pinned to the homepage, and pins sync between devices. Everything can be done from the keyboard, and every view (page, search, filters, open card, info tab) has its own URL.

- **Live:** https://pokemon-king.vercel.app (the password is sent separately)
- **Repo:** https://github.com/carlosdanna/pokemon-king

## Features

- **Album:** 121 sets, one binder section each, as 3x3 pages; two-page spreads from 1280 px wide, one page below. Page turns flip in 3D (a short slide on phones) and can be swiped on touch screens.
- **Owned and missing:** Ash's 2,138 entries group into 1,644 unique cards with a ×N badge for copies; the other (about 13,000) cards of his sets are greyed out.
- **Card zoom:** the card morphs out of its pocket into a tilting, glaring large view with an info panel (attacks, abilities, weaknesses, resistances, legal formats, rules text), a drawer on phones. `/cards/<id>` is also a full page.
- **Search:** per-word matching over card name, set name, set code and number, ignoring case and accents, with a one-letter typo fallback (`charzard` finds Charizard). Filters for set, kind, type, rarity, legal format and owned / all; sort by set, name, number or rarity. Results are album pages too.
- **Browse:** counts of Ash's cards by type, rarity and set, each linking to a filtered search.
- **Favourites:** pin from a tile, the zoomed card or the `f` key; pins show on the homepage and `/pinned`, and sync through Redis.
- **Keyboard:** roving focus over the grid, page turns that keep your place, global shortcuts, a `Ctrl/Cmd + K` command palette and a `?` overlay (table below).
- **Login:** one shared password; signed-out visitors only see the login page.

## Setup

Needs Node 22 or later (built on 24) and pnpm.

```sh
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev                     # http://localhost:3000
```

| Variable                                              | What it is                                                                                                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_PASSWORD`                                        | The shared login password                                                                                                                                            |
| `SESSION_SECRET`                                      | Any long random string; signs the session cookie (`openssl rand -base64 32`)                                                                                         |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`  | Upstash Redis for synced favourites. The Vercel Marketplace integration sets `KV_REST_API_URL` / `KV_REST_API_TOKEN` instead; either pair works                      |

Without the Redis variables the app still runs: pins are kept in the browser only, and a toast says so once.

Other scripts: `pnpm build` and `pnpm start` for a production build, `pnpm test` (Vitest), and `pnpm check` (lint, typecheck, Prettier and tests), which also runs as the git pre-commit hook.

### Card data

The set lists, card details and set metadata are already committed under `data/`, so nothing needs fetching to run the app. To refresh them from TCGdex:

```sh
pnpm dlx tsx scripts/fetch-sets.ts
```

It reads `data/ash_collection.json`, maps Ash's Pokémon TCG API ids to TCGdex ids (`data/id-map.json`), and writes `data/sets.json` plus one file per set. It takes about a minute and needs no API key.

## Approach

- **Data stays on the server.** The collection is 2.6 MB and the full set lists 11 MB, so pages are server components that load one set file at a time; the browser only gets the cards on screen. Card data is committed JSON, not a database: it is read-only and changes only when the script reruns.
- **TCGdex instead of the Pokémon TCG API.** The API the collection came from was returning errors and is being retired, so set lists, details and images come from TCGdex, fetched once. 1,640 of the 1,644 owned cards map automatically; the other 4 keep their original data.
- **The URL is the state.** Page, search text, filters, sort, the open card and the info tab are all in the URL, so a copied link opens the same view.
- **Animation is progressive.** Zoom and page turns use React `<ViewTransition>`; browsers without it, and anyone with reduced motion on, get instant changes.
- **Keyboard first, mouse equal.** One tab stop for the whole binder (arrow keys inside), single-key shortcuts that stay quiet while typing, focus returned to the card you came from.
- **Small and checked.** Login, search matching and URL state are a few dozen hand-written lines each instead of libraries; pure logic has unit tests (70), and each milestone was walked through in a real browser.

## Library choices

| Library                                     | Why                                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 16 App Router, React 19, TypeScript | Server components keep the data on the server; intercepting routes give the card overlay and the full card page from one URL; deploys to Vercel    |
| shadcn/ui on Base UI, Tailwind CSS          | Accessible keyboard and focus behaviour, and the components live in the repo so they can be changed; Base UI is shadcn's current default          |
| React `<ViewTransition>`                    | Native morph from pocket to zoom and page flips across route changes, with no animation library in the way                                       |
| Motion                                      | The pin button's press, and `useReducedMotion` to turn the tilt off                                                                                                                          |
| react-parallax-tilt                         | Tilt and glare on the zoomed card in plain React (the well-known holo CSS project is GPL-3.0)                                                     |
| cmdk                                        | The command palette, through shadcn's `Command`                                                                                                    |
| Upstash Redis (Vercel Marketplace)          | Favourites sync across devices; Vercel has no writable filesystem and Vercel KV no longer exists                                                  |
| sonner                                      | Toasts for sync errors                                                                                                                              |
| Vitest + Testing Library, Prettier          | Tests and formatting, run before every commit                                                                                                       |

Left out on purpose: an auth library (one shared password needs about 30 lines with `node:crypto`), nuqs (two small components handle URL state), Fuse.js (weak at matching words spread over several fields), react-pageflip (owns its layout and has no keyboard support).

## Trade-offs

- One shared password and one favourites list: there is only one Ash.
- Cards are sized so a whole page or spread fits on screen without scrolling, which makes them smaller than planned (about 106 px wide on a phone, 158 px at 1440×900); zoom is how you read a card.
- 3x3 on every width keeps page numbers and links the same on every device.
- `[` / `]` step through the cards on the current page and stop at its edge, so the album never has to turn under the open card.
- Images are not run through Vercel's optimiser: TCGdex already serves small WebP files.
- The zoom morph needs the card page prefetched, so it plays on a production build but not under `next dev`; Back closes the card without a reverse morph.

## Features cut

- **A realistic page curl** (react-pageflip): it controls its own layout and has no keyboard support, so turns are a CSS flip instead.
- **Terminal-style theme**: the app borrows only the keyboard model.
- **Price data, deck building, editing the collection, offline mode**: outside the brief.
- **User accounts and password reset**: one shared password is enough for one collector.
- **Full details for 4 owned cards** that TCGdex lacks: they show their basic facts only.

See [Notes.md](Notes.md) for known problems and ideas for later.

## Keyboard shortcuts

Single keys are ignored while you type in a field. Press `?` in the app to see this list.

| Keys                          | Action                                     |
| ----------------------------- | ------------------------------------------ |
| `/`                           | Search: the page's search box, else the palette |
| `Ctrl` / `⌘` `K`              | Jump to a page, set or card                |
| `g h` · `g a`                 | Go to Home · Album                         |
| Arrows · `Home` · `End`       | Move between cards                         |
| `Enter`                       | Zoom the focused card                      |
| `PageUp` · `PageDown` or `,` · `.` | Turn the page                         |
| `f`                           | Pin or unpin the focused or zoomed card    |
| `[` · `]`                     | Previous · next card while zoomed          |
| `Esc`                         | Close the card or this overlay             |
| `?`                           | Show the shortcuts                         |

## Time spent

| Phase | Planned | Actual |
| --- | --- | --- |
| Planning (requirements and implementation plans) | — | about 1 h 30 min |
| M0 · Setup and deploy | 30 min | 16 min |
| M1 · Data pipeline (incl. the TCGdex switch) | 45 min | 34 min |
| M2 · Album pages | 1 h 15 min | 14 min |
| M3 · Card zoom and side panel | 1 h | 34 min |
| M4 · Search and filters | 45 min | 15 min |
| M5 · Login and favourites | 1 h | 18 min |
| M6 · Keyboard layer | 45 min | 33 min |
| Polish, theme and page turns (unplanned) | — | 1 h 1 min |
| M7 · Polish and submission | 45 min | 13 min |
| **Build (M0–M7)** | **6 h 45 min** | **3 h 58 min** |
| **Total** | — | **about 5 h 30 min** |

Times are Claude Code session lengths from the [worklog](docs/worklog.md); time spent reviewing between sessions and recording the video is not included.

## How this was built

Planned first, then built with Claude Code one milestone per session, with every choice logged before the code that depended on it.

- [Requirements plan](docs/requirements.md) and [implementation plan](docs/implementation-plan.md) (the implementation plan wins where they differ)
- [Decision log](docs/decisions.md): 55 numbered decisions with reasons and rejected alternatives
- [Worklog](docs/worklog.md): every session with start and end times, outcome and commit
- [Prompts](docs/prompts.md): the prompts given to Claude Code
- [Transcripts](docs/transcripts.md): the Claude Code sessions, word for word
- [Notes](Notes.md): problems, improvements and ideas left for later
