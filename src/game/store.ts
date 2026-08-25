import { create } from "zustand";
import { persist } from "zustand/middleware";
import { rollRoom } from "./dungeon";
import { buildTutorialRoom, TUTORIAL_STEPS } from "./tutorial";
import type {
  Item,
  JournalEntry,
  PlayerState,
  RoomData,
  RunLogLine,
  SavedScript,
} from "./types";

const STARTER_WEAPON: Item = { name: "training_dagger", base_damage: 5, sockets: 1 };

function freshPlayer(): PlayerState {
  return {
    name: "Delver",
    hp: 30,
    max_hp: 30,
    base_attack: STARTER_WEAPON.base_damage ?? 5,
    element: null,
    gold: 0,
    inventory: [],
    equipped: STARTER_WEAPON,
  };
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** base_attack/element are always derived from whatever is equipped —
 * recomputed any time equipped gear changes, whether through the equip()
 * bridge or the player mutating the `equipped` dict directly in Python. */
function deriveStats(equipped: Item | null): { base_attack: number; element: string | null } {
  if (!equipped) return { base_attack: 5, element: null };
  const appliedRunes = Array.isArray(equipped.applied_runes)
    ? (equipped.applied_runes as Item[])
    : null;
  const bonusValue =
    equipped.value ?? appliedRunes?.reduce((sum, r) => sum + (Number(r.value) || 0), 0) ?? 0;
  const element =
    (equipped.modifier as string) ?? (appliedRunes?.[0]?.modifier as string) ?? null;
  return { base_attack: (equipped.base_damage ?? 5) + bonusValue, element };
}

type Phase = "title" | "tutorial" | "running" | "dead" | "cleared";

interface GameState {
  phase: Phase;
  player: PlayerState;
  depth: number;
  currentRoom: RoomData | null;
  log: RunLogLine[];
  journal: JournalEntry[];
  scripts: SavedScript[];
  deathCount: number;
  tutorialIndex: number;
  tutorialDone: boolean;

  startRun: () => void;
  restartAfterDeath: () => void;
  startTutorial: () => void;
  skipTutorial: () => void;
  appendLog: (kind: RunLogLine["kind"], text: string) => void;
  syncPlayer: (patch: Partial<PlayerState>) => void;
  addToInventory: (item: Item) => void;
  setGear: (inventory: Item[], equipped: Item | null) => void;
  markRoomResolved: () => void;
  /** Advances to the next tutorial lesson while phase is "tutorial", or
   * rolls the next dungeon room otherwise — same call site either way. */
  advanceRoom: () => RoomData;
  playerDied: () => void;

  upsertJournalEntry: (id: string | null, title: string, body: string) => void;
  deleteJournalEntry: (id: string) => void;
  saveScript: (name: string, code: string) => void;
  deleteScript: (id: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: "title",
      player: freshPlayer(),
      depth: 0,
      currentRoom: null,
      log: [],
      journal: [],
      scripts: [],
      deathCount: 0,
      tutorialIndex: 0,
      tutorialDone: false,

      startRun: () => {
        const depth = 1;
        const room = rollRoom(depth);
        set({
          phase: "running",
          player: freshPlayer(),
          depth,
          currentRoom: room,
          log: [
            {
              id: uid(),
              kind: "system",
              text: "You descend into the delve. Type door.open() once a room is clear.",
            },
          ],
        });
      },

      restartAfterDeath: () => {
        get().startRun();
      },

      startTutorial: () => {
        set({
          phase: "tutorial",
          tutorialIndex: 0,
          currentRoom: buildTutorialRoom(0),
          log: [
            {
              id: uid(),
              kind: "system",
              text: "A short walkthrough before the real delve — 7 quick lessons.",
            },
          ],
        });
      },

      skipTutorial: () => {
        set({ tutorialDone: true });
        get().startRun();
      },

      appendLog: (kind, text) =>
        set((s) => ({ log: [...s.log, { id: uid(), kind, text }] })),

      syncPlayer: (patch) =>
        set((s) => ({ player: { ...s.player, ...patch } })),

      addToInventory: (item) =>
        set((s) => ({ player: { ...s.player, inventory: [...s.player.inventory, item] } })),

      setGear: (inventory, equipped) =>
        set((s) => ({
          player: { ...s.player, inventory, equipped, ...deriveStats(equipped) },
        })),

      markRoomResolved: () =>
        set((s) => (s.currentRoom ? { currentRoom: { ...s.currentRoom, resolved: true } } : {})),

      advanceRoom: () => {
        if (get().phase === "tutorial") {
          const nextIndex = get().tutorialIndex + 1;
          if (nextIndex < TUTORIAL_STEPS.length) {
            const room = buildTutorialRoom(nextIndex);
            set({ tutorialIndex: nextIndex, currentRoom: room });
            return room;
          }
          set({ tutorialDone: true });
          get().startRun();
          return get().currentRoom as RoomData;
        }
        const depth = get().depth + 1;
        const room = rollRoom(depth);
        set({ depth, currentRoom: room });
        return room;
      },

      playerDied: () =>
        set((s) => ({ phase: "dead", deathCount: s.deathCount + 1 })),

      upsertJournalEntry: (id, title, body) =>
        set((s) => {
          if (id) {
            return {
              journal: s.journal.map((e) =>
                e.id === id ? { ...e, title, body, updatedAt: Date.now() } : e,
              ),
            };
          }
          return {
            journal: [
              ...s.journal,
              { id: uid(), title, body, updatedAt: Date.now() },
            ],
          };
        }),

      deleteJournalEntry: (id) =>
        set((s) => ({ journal: s.journal.filter((e) => e.id !== id) })),

      saveScript: (name, code) =>
        set((s) => ({ scripts: [...s.scripts, { id: uid(), name, code }] })),

      deleteScript: (id) =>
        set((s) => ({ scripts: s.scripts.filter((sc) => sc.id !== id) })),
    }),
    {
      name: "terminal-delve-save",
      partialize: (s) => ({
        journal: s.journal,
        scripts: s.scripts,
        deathCount: s.deathCount,
        tutorialDone: s.tutorialDone,
      }),
    },
  ),
);
