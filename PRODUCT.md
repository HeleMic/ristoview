# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Svelte 5 + Vite + TypeScript, Tailwind CSS, PWA (vite-plugin-pwa), hosted on GitHub Pages. Package manager/runtime: Bun. Data lives in a separate private GitHub repo (`data.json`) read and written from the browser through the GitHub Contents API with a fine-grained token stored per device; IndexedDB is the offline cache. 100% client-side, no server of our own.

## Users

Two people, a couple. The primary user is his girlfriend: she opens the site mostly on her phone, after (or during) a dinner out, to log the restaurant and write the review. He configures the site, sets her token, and uses it occasionally. The site addresses her by a nickname stored in the data file (`settings.nickname`), never hard-coded in source (the site repo is public).

## Product Purpose

A private, gift-shaped diary of the restaurants the couple has been to. Two jobs:

1. **Monthly gift**: once per calendar month, she "receives" a dinner out and picks what she wants to eat (sushi, hamburger, pesce, carne, …). The choice can be changed until the gift is marked "sfruttata" (the dinner happened). If the month ends without redemption, that month's gift expires; gifts never accumulate.
2. **Review log**: a 360° review of every restaurant: what we ate, how it went, waiters/service, welcome, bill, ambience, value. Only the restaurant name is required. Everything stays browsable over time.

Success: she enjoys opening it, the gift feels like a gift, and logging a dinner is fast on a phone.

## Positioning

Not a restaurant app; a love letter that happens to have forms. It belongs to two people and their two dogs.

## Operating Context

- First-ever open shows only an easter egg: "Vuoi venire a cena con me?" with Sì / No. "Sì" is disabled for 60 seconds; "No" flees from the pointer (pushed away as the cursor approaches) so it can never be clicked. After "Sì", she is taken to the gift choice. Shown once in total (flag stored in shared data), not once per device.
- Used mostly on phone, sometimes desktop; installable as a PWA.
- Dates and month boundaries computed on the client; clock manipulation can bypass them (accepted).

## Capabilities and Constraints

- Gift: one per calendar month; category chosen from a list; changeable until redeemed; expires at month end if not redeemed; history of past gifts.
- Restaurants + reviews: name required; optional cuisine, address/Maps link, date, dishes, per-aspect ratings (food, service, welcome, ambience, value), bill, notes, "would we return?". Wishlist of places to try.
- Sync: GitHub Contents API with SHA-based optimistic concurrency; on conflict re-fetch, merge by id, retry. Works offline from cache.
- No photos in v1 (repo size); may come later compressed.
- UI language: Italian.

## Brand Commitments

- Primary color: pink.
- Mascots: two real dogs, **Lilla** (Norfolk terrier) and **Momo** (miniature pinscher), named in the UI — a Norfolk terrier (small, wiry red/wheaten coat, folded drop ears, short legs) and a brown, medium (not dark) chocolate-and-tan miniature pinscher (sleek, upright pointed ears, slender legs). They should appear more or less randomly across the site.
- Third mascot: **Pachino**, a cobalt-blue Fischer's lovebird (agapornis) with a pale grey-white face, white eye ring and pale pink beak; perches on the gift lid (at random), on the easter-egg card and in the settings credits.
- Name of the site: "ristoview" (working name).

## Evidence on Hand

No photos, logos or real content yet. The dogs must be drawn (no photos supplied). Nickname and data come from the user's data repo at runtime; nothing personal is committed to source.

## Product Principles

1. It's a gift first: the gift and easter egg moments get the most care.
2. Fast on a phone: logging a dinner should take under a minute, with every field optional except the name.
3. Nothing personal in the public repo.
4. Never lose data: local cache, conflict merge, JSON export.
