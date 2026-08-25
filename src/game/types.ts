export type RoomType = "combat" | "loot" | "rest" | "boss" | "tutorial";

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

/**
 * Always a list, even for a single foe — tier1-2 rooms just always have
 * length 1. The Python surface (singular `enemy` dict vs plural `enemies`
 * list) is decided by the runner off this array's length, which is how
 * "when do lists show up" is gated by depth rather than by room type.
 */
export interface CombatRoomData {
  enemies: Enemy[];
}

/** Same idea as CombatRoomData: runes.length is 1 pre-tier3, 2+ after. */
export interface LootRoomData {
  base_item: Item;
  runes: Item[];
}

export interface RestRoomData {
  heal_amount: number;
}

/** A tutorial lesson's pass condition, checked against the live Pyodide
 * globals after each run — same state-based philosophy as real rooms. */
export type TutorialCheck =
  | { kind: "always" }
  | { kind: "var_exists"; name: string }
  | { kind: "var_equals"; name: string; value: number }
  | { kind: "dict_key_le"; name: string; key: string; value: number };

export interface TutorialRoomData {
  check: TutorialCheck;
}

export type RoomPayload = CombatRoomData | LootRoomData | RestRoomData | TutorialRoomData;

export interface RoomData {
  id: string;
  depth: number;
  type: RoomType;
  title: string;
  ascii: string;
  flavor: string;
  hint: string;
  /** Tutorial rooms prefill the console with this so lessons are
   * observe-and-run, not blank-terminal — real rooms leave it unset. */
  starterCode?: string;
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
