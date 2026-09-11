# Changelog

Reverse-chronological, one entry per merged PR.

## Unreleased

- **Restructure the tutorial into Run / Fill-in-the-blank / Write-it-yourself
  stages.** Consolidated 7 flat lessons into 6 with an explicit progression:
  three "run it" lessons (print+variables, dict+if/else combined into one
  worked example each, then a while loop), one new "fill in the blank"
  lesson, then "write it yourself" (unchanged in spirit — nothing
  pre-solved). While building the fill-in-the-blank lesson, caught a real
  bug in its own starter code: a `while` loop whose only exit condition was
  the blank the player was meant to fill in would hang the tab in a true
  infinite loop if run unedited (Pyodide executes on the main thread with
  no interrupt). Fixed by rebuilding it on a `for step in range(4):` loop
  that always terminates regardless of the blank, so an unedited run stays
  safely locked instead of freezing the page. Logged the general version of
  this risk (any player-written infinite loop, anywhere) in `backlog.md`.
- **Auto-capture completed lessons into the Scribe's Journal.** Each
  resolved lesson (except the wrap-up) now saves the actual code that
  solved it as a journal entry, deduped by title so replaying the tutorial
  updates the existing note instead of duplicating it.
- **Expandable split-view Journal.** Added an "expand view" toggle that
  grows the modal to near-fullscreen with a two-column layout — entries
  and scripts on the left, a full-size editor on the right — for longer
  review or writing sessions, alongside the existing compact view.
## PR #7 — Persist run state across a page refresh

A refresh used to silently reset any in-progress run back to the title
screen. `phase`, `depth`, `player`, `currentRoom`, and a capped `log` now
persist to `localStorage` too. Enemy hp is synced back from the live
Pyodide globals into the persisted room after every code run (not just on
`door.open()`), so a refresh mid-fight resumes with the enemy still
damaged instead of re-priming it at full health. Verified with a real
mid-combat reload (partial damage survives exactly) and a mid-tutorial
reload (same lesson index restored).

## PR #6 — Add CHANGELOG.md and backlog.md; fix a README doc drift

`backlog.md`, required by `CLAUDE.md` section 4, never existed until now —
populated with the known gaps at the time. Added this changelog,
reconstructing the shipped history from the merged PRs so far. Fixed a
`localStorage`-persisted-fields doc drift in the README (missing
`tutorialDone`) found while auditing docs against source.

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
