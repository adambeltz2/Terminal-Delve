export type RoomType = "combat" | "loot" | "rest" | "boss";

/** Gear is intentionally loose (dict-like) — players merge/inspect it in Python. */
export interface Item {
  name: string;
  base_damage?: number;
  sockets?: number;
  modifier?: string;
  value?: number;
  [key: string]: unknown;
}

export interface Enemy {
  name: string;
  hp: number;
  max_hp: number;
  attack: number;
  weakness: string;
  ascii: string;
}

export interface PlayerState {
  name: string;
  hp: number;
  max_hp: number;
  base_attack: number;
  element: string | null;
  gold: number;
  inventory: Item[];
  equipped: Item | null;
}

export interface CombatRoomData {
  enemy: Enemy;
}

export interface LootRoomData {
  base_item: Item;
  rune: Item;
}

export interface RestRoomData {
  heal_amount: number;
}

export interface BossRoomData {
  enemy: Enemy;
}

export type RoomPayload =
  | CombatRoomData
  | LootRoomData
  | RestRoomData
  | BossRoomData;

export interface RoomData {
  id: string;
  depth: number;
  type: RoomType;
  title: string;
  ascii: string;
  flavor: string;
  hint: string;
  data: RoomPayload;
  resolved: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

export interface SavedScript {
  id: string;
  name: string;
  code: string;
}

export interface RunLogLine {
  id: string;
  kind: "system" | "input" | "stdout" | "stderr" | "result";
  text: string;
}
