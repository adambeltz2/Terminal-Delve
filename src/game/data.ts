import type { Enemy, Item } from "./types";

export const ELEMENTS = ["fire", "cold", "lightning", "holy"] as const;

const ENEMY_ASCII: Record<string, string> = {
  rat_swarm: String.raw`
   /\_/\  /\_/\
  ( o.o )( o.o )
   > ^ <  > ^ <`,
  cave_bat: String.raw`
     /\   /\
    ( \\ // )
     \ \ / /
      \_'_/`,
  skeleton_archer: String.raw`
     .-.
    (o o)
    | > |--->
     \_/`,
  slime_ooze: String.raw`
    .-""-.
   /      \
  |  o  o  |
   \  ~~  /
    '----'`,
  iron_golem: String.raw`
    [######]
    [ O  O ]
    [  --  ]
    []    []`,
  shade_wraith: String.raw`
     ,-.
    ((*))
   ((( )))
    '-----'`,
  warden_of_rust: String.raw`
  __/\_____/\__
 [  RUSTED WARDEN ]
  \  O      O  /
   \   ====   /
    \________/`,
  ashbound_chimera: String.raw`
   /^\   /^\   /^\
  ( o )-( o )-( o )
   \_/   \_/   \_/
    ASHBOUND CHIMERA`,
};

interface EnemyTemplate {
  key: keyof typeof ENEMY_ASCII;
  name: string;
  hp: number;
  attack: number;
  weakness: string;
  minDepth: number;
  maxDepth: number;
  boss?: boolean;
}

const ENEMY_TEMPLATES: EnemyTemplate[] = [
  { key: "rat_swarm", name: "Rat Swarm", hp: 12, attack: 2, weakness: "fire", minDepth: 1, maxDepth: 3 },
  { key: "cave_bat", name: "Cave Bat", hp: 10, attack: 3, weakness: "lightning", minDepth: 1, maxDepth: 4 },
  { key: "skeleton_archer", name: "Skeleton Archer", hp: 18, attack: 4, weakness: "holy", minDepth: 3, maxDepth: 7 },
  { key: "slime_ooze", name: "Slime Ooze", hp: 22, attack: 3, weakness: "cold", minDepth: 3, maxDepth: 7 },
  { key: "iron_golem", name: "Iron Golem", hp: 30, attack: 5, weakness: "lightning", minDepth: 6, maxDepth: 10 },
  { key: "shade_wraith", name: "Shade Wraith", hp: 26, attack: 6, weakness: "holy", minDepth: 6, maxDepth: 10 },
  { key: "warden_of_rust", name: "The Warden of Rust", hp: 60, attack: 7, weakness: "lightning", minDepth: 5, maxDepth: 100, boss: true },
  { key: "ashbound_chimera", name: "The Ashbound Chimera", hp: 90, attack: 9, weakness: "cold", minDepth: 10, maxDepth: 100, boss: true },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function instantiate(template: EnemyTemplate, depth: number): Enemy {
  const scale = Math.floor(depth / 2);
  return {
    name: template.name,
    hp: template.hp + scale * 3,
    max_hp: template.hp + scale * 3,
    attack: template.attack + Math.floor(scale / 2),
    weakness: template.weakness,
    ascii: ENEMY_ASCII[template.key].trim(),
  };
}

export function rollEnemy(depth: number, boss: boolean): Enemy {
  const pool = ENEMY_TEMPLATES.filter(
    (t) => !!t.boss === boss && depth >= t.minDepth && depth <= t.maxDepth,
  );
  const template = pick(pool.length ? pool : ENEMY_TEMPLATES.filter((t) => !!t.boss === boss));
  return instantiate(template, depth);
}

/** A simultaneous pack of `count` regular enemies. `varied` biases toward
 * distinct weaknesses so a single if/elif can't cover the whole pack —
 * that's what pushes players toward a loop instead of copy-pasted branches. */
export function rollEnemyPack(depth: number, count: number, varied: boolean): Enemy[] {
  const pool = ENEMY_TEMPLATES.filter((t) => !t.boss && depth >= t.minDepth && depth <= t.maxDepth);
  const source = pool.length ? pool : ENEMY_TEMPLATES.filter((t) => !t.boss);
  const chosen: EnemyTemplate[] = [];
  for (let i = 0; i < count; i++) {
    if (varied) {
      const usedWeaknesses = new Set(chosen.map((t) => t.weakness));
      const fresh = source.filter((t) => !usedWeaknesses.has(t.weakness));
      chosen.push(pick(fresh.length ? fresh : source));
    } else {
      chosen.push(pick(source));
    }
  }
  return chosen.map((t) => instantiate(t, depth));
}

interface BaseItemTemplate {
  name: string;
  base_damage: number;
  sockets: number;
}

const BASE_ITEMS: BaseItemTemplate[] = [
  { name: "dull_sword", base_damage: 6, sockets: 1 },
  { name: "rusty_axe", base_damage: 8, sockets: 1 },
  { name: "bent_dagger", base_damage: 4, sockets: 2 },
  { name: "worn_warhammer", base_damage: 10, sockets: 1 },
];

interface RuneTemplate {
  name: string;
  modifier: string;
  value: number;
}

const RUNES: RuneTemplate[] = [
  { name: "rune_of_ember", modifier: "fire", value: 5 },
  { name: "rune_of_frost", modifier: "cold", value: 5 },
  { name: "rune_of_storm", modifier: "lightning", value: 6 },
  { name: "rune_of_light", modifier: "holy", value: 7 },
];

export function rollLoot(depth: number, runeCount: number): { base_item: Item; runes: Item[] } {
  const eligible = BASE_ITEMS.filter((b) => b.sockets >= runeCount);
  const base = pick(eligible.length ? eligible : BASE_ITEMS);
  const scale = Math.floor(depth / 3);
  const usedModifiers = new Set<string>();
  const runes: Item[] = [];
  for (let i = 0; i < runeCount; i++) {
    const fresh = RUNES.filter((r) => !usedModifiers.has(r.modifier));
    const rune = pick(fresh.length ? fresh : RUNES);
    usedModifiers.add(rune.modifier);
    runes.push({ name: rune.name, modifier: rune.modifier, value: rune.value + scale });
  }
  return {
    base_item: { name: base.name, base_damage: base.base_damage + scale, sockets: base.sockets },
    runes,
  };
}

export const ROOM_ASCII = {
  entry: String.raw`
+--------------------------+
|                          |
|      you enter...       |
|                          |
+--------------------------+`.trim(),
  rest: String.raw`
      .  .  .
     (  campfire  )
      \  |  |  /
    ~~~~~~~~~~~~~~
    a quiet alcove`.trim(),
  boss_gate: String.raw`
   #====================#
   #   MASSIVE DOORS     #
   #   ||            ||  #
   #   ||   B O S S  ||  #
   #====================#`.trim(),
};
