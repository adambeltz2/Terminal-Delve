# Changelog

Reverse-chronological, one entry per merged PR.

## Unreleased

- Fixed a `localStorage`-persisted-fields doc drift in the README (missing
  `tutorialDone`); added this changelog and `backlog.md`.

## PR #5 — Update CLAUDE.md section 5 with Terminal Delve's actual tech stack

Replaced the generic template defaults (Docker/LXC/Proxmox, n8n, Metabase, a
Python+Node backend) with the real stack. Sections 1-4 and 6 unchanged.

## PR #4 — Link the live GitHub Pages build from the README

Added a "Play it now" link to the deployed site at the top of the README.

## PR #3 — Add a skippable Python basics tutorial before the first real room

7-lesson walkthrough (print, variables, dict access, if/else, a worked
while-loop example, then a from-scratch while-loop lesson with nothing
pre-solved) that runs before depth 1. Reuses the same `door.open()` /
state-based resolution the real game uses. Skippable from the start screen
or mid-lesson; `tutorialDone` persists so it only shows by default once.

## PR #2 — Curriculum tiers, real inventory, and GitHub Pages deploy

- **Curriculum-gated depth tiers**: room generation shapes the Python
  surface by depth instead of just scaling numbers — tier 1 (depth 1-3) a
  single `enemy` dict sized for if/elif, tier 2 (4-6) sized for a while
  loop, tier 3 (7-9) an `enemies` list (packs) and a `runes` list on loot
  rooms, tier 4 (10+) a bigger varied-weakness pack that rewards writing a
  `fight()` function. Resolution stays state-based throughout.
- **Real inventory system**: forged loot lands in a plain `inventory` list
  instead of auto-equipping; `equip(item)` is an explicit Python action that
  swaps gear and returns the old item to the bag.
- **GitHub Pages deployment**: `.github/workflows/deploy.yml` builds and
  publishes `dist/` via `actions/deploy-pages` on every push to `main`.

## PR #1 — Scaffold Terminal Delve: playable local-first Python RPG MVP

Initial Vite + React + TypeScript + Pyodide scaffold. Procedurally rolled
rooms (combat/loot/rest/boss), `door.open()` as the state-based advance
mechanic, dict-merge loot forging, permadeath with a persistent Scribe's
Journal and saved-script library, CRT-styled terminal UI. Ships fully
static — Pyodide's runtime assets are bundled at build time, no CDN
dependency.
