# Terminal Delve

A web-based, turn-based roguelike dungeon crawler with retro ASCII graphics
that teaches real Python by making you write it. Every room is a puzzle you
solve with actual code, executed instantly in your browser.

## Core loop

- The dungeon is a sequence of procedurally rolled rooms (combat, loot,
  rest, boss) — no open world, just one deliberate encounter at a time.
- Room state (`player`, `enemy`, loot dicts, etc.) is exposed as live Python
  globals in an in-browser terminal.
- You write and run Python against that state. When the room's state says
  it's resolved (enemy defeated, item forged, ...), calling `door.open()`
  rolls the next room. Any code that gets you there legitimately counts —
  there's no single "correct" script.
- Permadeath resets your character on death, but your **Scribe's Journal**
  (markdown notes) and any scripts you saved survive into the next run.
- Forged loot lands in a real `inventory` list — it never auto-equips.
  Swapping gear is its own explicit action: `equip(inventory[i])` pulls an
  item out of the bag, wields it, and puts whatever was equipped back in
  the bag. `inventory` is a plain Python list the whole time, so filtering
  it ("give me anything with a fire modifier") is just a list comprehension,
  not a special API.

## Curriculum ladder

Depth gates which Python shape a room hands you — not by blocking other
code, but by making the "obvious" solution require more:

| Tier | Depth | Python surface | What it pushes toward |
| --- | --- | --- | --- |
| 1 | 1–3  | single `enemy` dict, small HP | variables, `if`/`elif` |
| 2 | 4–6  | single `enemy` dict, big HP | `while`/`for` loops |
| 3 | 7–9  | `enemies` — a **list** of dicts; loot rooms hand a `runes` list | looping over a list of dicts |
| 4 | 10+  | bigger `enemies` list, varied weaknesses | writing a reusable `def fight(foe): ...` instead of copy-pasting the loop body |

The gating is soft by design (state-based resolution, decided early on):
a tier-4 player can still brute-force a pack one enemy at a time instead
of writing a function — nothing inspects *how* you got `enemy['hp'] <= 0`,
only that you did. The room shapes and hint text just make the "next"
concept the path of least resistance.

## Tech stack

Fully local-first and serverless:

- **React + TypeScript + Vite** for the UI.
- **Pyodide** (Python compiled to WebAssembly) executes player code
  directly in the browser — no backend. Its runtime assets are copied out
  of `node_modules` into the build output at build time (see
  `vite.config.ts`), so the game never depends on a CDN to run.
- **Zustand** for game/UI state, with journal entries and saved scripts
  persisted to `localStorage` (`zustand/middleware persist`).
- Ships as a static site — works from GitHub Pages or a plain `dist/`
  folder opened locally.

## Getting started

```bash
npm install
npm run dev       # dev server
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/` on every push
to `main` (also runnable manually via the Actions tab). One-time setup on
the repo, if it hasn't been done: **Settings → Pages → Build and
deployment → Source: "GitHub Actions"**. After that the live site tracks
`main` automatically — no manual `dist/` pushes needed.

## Project layout

```
src/
  game/
    types.ts     room/player/item/enemy shapes
    data.ts      enemy templates, item/rune tables, ascii art
    dungeon.ts   the room roll table + hint text per room type
    store.ts     zustand store: run state, journal, saved scripts
    runner.ts    Pyodide bootstrapping, globals bridging, door.open()/equip()
    hooks.ts     usePyodideBoot — loads the runtime when a run starts
  components/    CRT-styled UI (terminal, room view, journal, inventory)
```

## Current scope (MVP)

- One starting weapon, 8 enemies (6 regular + 2 bosses) across a rolling
  difficulty curve, 4 forgeable rune types.
- Room types: combat (single enemy or a pack, tier-dependent), loot
  (dict-merge forging, single or multi-rune), rest, boss (every 5th depth).
- Full reset on death except the Scribe's Journal and saved scripts —
  gear, gold, and depth do not carry over between runs.
- Run state (current room, HP, inventory) lives in memory only; a page
  refresh mid-run currently starts a fresh delve. Journal/scripts/death
  count are the only things persisted to `localStorage`.

- Inventory is a single equipped slot plus an unbounded carried list —
  no weight/capacity limits, no selling/dropping items yet.

Not yet built: Dropbox (or any) cross-device sync — local storage only
for now, by design, for this MVP.
