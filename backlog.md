# Backlog

Deferred ideas, edge cases, and non-critical gaps surfaced during development
but not implemented on the fly, per `CLAUDE.md` section 4.

- [DEBT] No committed automated test suite. Every feature to date has been
  verified with ad-hoc Playwright smoke tests run manually each session (not
  checked into the repo), so there's no repeatable regression check on
  `npm run build`/CI. Affected: whole `src/game/` + `src/components/`.
- [FEATURE] Inventory has no capacity limit, and no way to drop or sell a
  carried item — it only ever grows. Affected: `src/game/store.ts`
  (`addToInventory`, `setGear`), `src/components/InventoryPanel.tsx`.
- [FEATURE] Only 8 enemy templates (6 regular + 2 bosses) and 4 rune
  modifiers total; past depth 10 the same two boss templates repeat
  indefinitely with only stat scaling, which will feel repetitive on a long
  run. Affected: `src/game/data.ts`.
- [FEATURE] Dropbox (or any) cross-device save sync — discussed early on and
  deliberately deferred in favor of `localStorage`-only for the MVP. Affected:
  `src/game/store.ts` if picked up.
- [FEATURE] No way to inspect/replay the Scribe's Journal's saved scripts
  against the *current* room's live globals without manually retyping them
  — "load into console" (`JournalPanel.tsx`) requires clicking, pasting is
  manual. Low priority; current flow works, just not frictionless.
