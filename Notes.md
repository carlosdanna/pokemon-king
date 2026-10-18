# Notes

What I would fix, improve or add with more time. Decision numbers (D-0xx) point to [docs/decisions.md](docs/decisions.md).

## Problems it would have been nice to fix

- **No zoom morph under `next dev`.** The pocket-to-zoom morph only plays when the card page is already prefetched, which `next dev` doesn't do; production builds animate. Development and production behave differently, which makes animation bugs slower to chase.
- **No reverse morph on Back.** Closing the card with the browser's Back button commits synchronously, so the card disappears instead of flying back into its pocket.
- **A stray `react-parallax-tilt` error.** `can't access property "style", e is null` appeared 25 times in one dev log (the wording suggests Firefox) and never reproduced in Chromium or Firefox. It may be the tilt touching an element that unmounted mid-transition.
- **Safari never tested.** `<ViewTransition>` and the 3D page flip were checked in Chromium and Firefox only; Safari may animate differently or not at all (the app still works without the animation).
- **Cards are smaller than planned.** 126 px wide at 1024×768 against the planned 140–200 px, and about 106 px on a phone, because a whole page has to fit on screen (D-031). Zoom is the way to read a card; a 2x3 phone layout was the fallback I didn't take.
- **4 owned cards have basic facts only.** TCGdex has no entry for them, so they keep their original Pokémon TCG API data and show no attacks or legality (D-023, D-032).
- **The preset's grey text failed contrast.** Muted text was 3.76:1 on the binder desk; M7 darkened the token to pass AA (D-055). New colour tokens should be checked against the desk and paper colours, not only white.
- **Card images are hot-linked from TCGdex.** If their host is slow or down, pockets fall back to the committed card back with the name and number (D-028), but nothing is cached on our side.

## Improvements

- `[` / `]` could cross page edges and turn the album under the open card, instead of stopping (D-046).
- Favourites per device or per person, with a timestamp so the homepage can show recent pins first (D-041 keeps one plain set).
- A scheduled job to refresh the set lists when new sets are released, instead of running `scripts/fetch-sets.ts` by hand.
- A dark theme: the tokens exist from the shadcn preset, but the binder colours were only designed for light.
- End-to-end tests (Playwright) for login, page turns, zoom and the keyboard walkthrough; today they are checked by hand in a browser each milestone, with unit tests for the pure logic.
- Image optimisation if TCGdex's sizes ever change (D-025 turned it off because their WebP files are already small).

## Ideas

- A realistic page curl for desktop (react-pageflip or a custom shader), kept off for keyboard and reduced-motion users (D-014).
- Charts and data exploration of Ash's collection and the sets: owned cards by type, rarity and era, completion per set over release years, his most-duplicated cards, and how his collection compares with each set's full list. `/browse` only shows counts today.
- Set completion on `/album`: a progress bar per set and a "closest to complete" sort.
- A wishlist made from greyed cards, shareable as a link for birthdays.
- Price data per card and a collection value.
- An offline mode (PWA) so the album opens without a connection.
- A terminal-style theme to go with the keyboard model.
