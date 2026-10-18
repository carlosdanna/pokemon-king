# Worklog

One row per session. Times are Stockholm time (CET/CEST). Planning rows record when each request was made, and their end times are approximate. From the bootstrap session on, start and end times come from the shell clock (`date '+%Y-%m-%d %H:%M %Z'`).

## Summary

| Phase | Planned | Actual |
| --- | --- | --- |
| Planning | — | about 1 h 30 min |
| Build (M0–M7) | about 7 h | — |
| Total | — | — |

## Sessions

| Date | Start | End | Duration | Milestone | Outcome | Commit |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-17 | 10:50 | ~11:50 | ~1 h | Planning | Requirements plan drafted from the brief; collection JSON analysed (2,138 entries, 1,644 unique cards, no set names); Pokémon TCG API found deprecated; submission set to Vercel + public repo + video; favourites sync via Upstash Redis; shared-password login | — |
| 2026-10-18 | 09:39 | ~10:10 | ~30 min | Planning | Implementation plan: binder album, 3x3 pages and spreads, greyed unowned cards, card zoom with side panel, 8 milestones of about 7 h; Claude Code prompts prepared | — |
| 2026-10-18 | 10:28 | 10:28 | <1 min | Bootstrap | CLAUDE.md with working rules; milestone list restored in the implementation plan; D-016 added; .gitignore for Next.js keeping private/ out; first commit | 2f8118d |
| 2026-10-18 | 10:40 | 10:56 | 16 min | M0 | Done (marked by Carlos at 10:56; deploy URL not recorded): Next.js 16.4 + React 19.3 scaffold, shadcn on Base UI (D-018), motion and react-parallax-tilt, Vitest smoke test; GitHub Actions replaced by a pre-commit `pnpm check` with Prettier (D-019); `<Typography>` component (D-020); repo pushed to GitHub | 8bb017b |
| 2026-10-18 | 14:56 | 15:13 | 17 min | M1 | Done: Pokémon TCG API down (500/502) and being retired, so set lists come from the legacy `PokemonTCG/pokemon-tcg-data` repo pinned at `39a26a1` (D-021); `scripts/fetch-sets.ts` wrote `data/sets.json` and 121 set lists (14,702 cards, 122 requests, 59 s, 0 owned ids missing); `lib/album.ts` (grouping, natural sort, merge, pages of 9) and server-only `lib/collection.ts` (`getAlbumPage`, `getSetSummaries`, D-022); 15 tests pass | `feat: data pipeline and set lists (M1)` |
| 2026-10-18 | 15:26 | 15:37 | 11 min | M1 follow-up (TCGdex) | Done: set lists, set metadata and images switched to TCGdex v2 (D-023); `data/id-map.json` converts 1,640 of 1,644 owned pokemontcg ids (4 kept as-is); 14,625 cards in 121 sets, 226 requests in 70 s; card data stays committed JSON, no database (D-024); images `unoptimized` (D-025); card back committed as `public/card-back/{low,high}.webp` placeholder (D-026); 19 tests pass | `feat(data): switch set lists and images to tcgdex` |
