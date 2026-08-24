import { create } from "zustand";
import { persist } from "zustand/middleware";
import { rollRoom } from "./dungeon";
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

type Phase = "title" | "running" | "dead" | "cleared";

interface GameState {
  phase: Phase;
  player: PlayerState;
  depth: number;
  currentRoom: RoomData | null;
  log: RunLogLine[];
  journal: JournalEntry[];
  scripts: SavedScript[];
  deathCount: number;

  startRun: () => void;
  restartAfterDeath: () => void;
  appendLog: (kind: RunLogLine["kind"], text: string) => void;
  syncPlayer: (patch: Partial<PlayerState>) => void;
  applyCraftedItem: (item: Item) => void;
  markRoomResolved: () => void;
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

      appendLog: (kind, text) =>
        set((s) => ({ log: [...s.log, { id: uid(), kind, text }] })),

      syncPlayer: (patch) =>
        set((s) => ({ player: { ...s.player, ...patch } })),

      applyCraftedItem: (item) =>
        set((s) => {
          const inventory = s.player.equipped
            ? [...s.player.inventory, s.player.equipped]
            : [...s.player.inventory];
          return {
            player: {
              ...s.player,
              equipped: item,
              inventory,
              base_attack: (item.base_damage ?? s.player.base_attack) + (item.value ?? 0),
              element: (item.modifier as string) ?? null,
            },
          };
        }),

      markRoomResolved: () =>
        set((s) => (s.currentRoom ? { currentRoom: { ...s.currentRoom, resolved: true } } : {})),

      advanceRoom: () => {
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
      }),
    },
  ),
);
