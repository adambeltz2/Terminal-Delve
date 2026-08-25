import { ROOM_ASCII, rollEnemy, rollEnemyPack, rollLoot } from "./data";
import type { Enemy, RoomData, RoomType } from "./types";

export const BOSS_INTERVAL = 5;

export type Tier = 1 | 2 | 3 | 4;

/**
 * The Python concepts a room leans on, by depth:
 *   1 (depth 1-3):  variables, if/elif, a single dict
 *   2 (depth 4-6):  while/for loops, still a single dict
 *   3 (depth 7-9):  lists of dicts (packs of enemies, multiple runes)
 *   4 (depth 10+):  same lists, but sized to make a reusable function
 *                   worth writing instead of copy-pasting a fight 4 times
 */
export function tierForDepth(depth: number): Tier {
  if (depth <= 3) return 1;
  if (depth <= 6) return 2;
  if (depth <= 9) return 3;
  return 4;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Procedural generation only ever rolls these — "tutorial" rooms are a
 * fixed, hand-authored sequence built separately (see tutorial.ts). */
type DungeonRoomType = Exclude<RoomType, "tutorial">;

function rollRoomType(depth: number): DungeonRoomType {
  if (depth > 0 && depth % BOSS_INTERVAL === 0) return "boss";
  const roll = Math.random();
  if (roll < 0.55) return "combat";
  if (roll < 0.8) return "loot";
  return "rest";
}

const GEAR_REMINDER =
  "\n\nCarrying something better? equip(inventory[-1]) swaps it in before you fight.";

function combatHint(tier: Tier): string {
  if (tier === 1) {
    return [
      "The enemy dict has a 'weakness' key. Your player dict has 'element'.",
      "If they match, doubling your damage before you subtract it from",
      "enemy['hp'] is usually enough to end the fight in one blow.",
      "",
      ">>> if player['element'] == enemy['weakness']:",
      "...     dmg = player['base_attack'] * 2",
    ].join("\n") + GEAR_REMINDER;
  }
  if (tier === 2) {
    return [
      "This one won't drop in a single hit. Loop while both sides are",
      "alive, mutate enemy['hp'] and player['hp'] each pass, and break",
      "out (or let the loop condition catch it) once someone hits 0.",
      "",
      ">>> while enemy['hp'] > 0 and player['hp'] > 0:",
      "...     dmg = player['base_attack']",
      "...     if player['element'] == enemy['weakness']:",
      "...         dmg *= 2",
      "...     enemy['hp'] -= dmg",
      "...     if enemy['hp'] <= 0: break",
      "...     player['hp'] -= enemy['attack']",
    ].join("\n") + GEAR_REMINDER;
  }
  if (tier === 3) {
    return [
      "A pack. `enemies` is now a LIST of dicts, not one dict — loop over",
      "it, and run the same fight-until-dead logic against each member.",
      "",
      ">>> for foe in enemies:",
      "...     while foe['hp'] > 0 and player['hp'] > 0:",
      "...         dmg = player['base_attack']",
      "...         if player['element'] == foe['weakness']:",
      "...             dmg *= 2",
      "...         foe['hp'] -= dmg",
      "...         if foe['hp'] <= 0: break",
      "...         player['hp'] -= foe['attack']",
    ].join("\n") + GEAR_REMINDER;
  }
  return [
    "Several foes, each wanting the same fight loop. Writing that loop",
    "body out per enemy gets old fast — pull it into a function that",
    "takes one enemy dict, then call it once per entry in `enemies`.",
    "",
    ">>> def fight(foe):",
    "...     while foe['hp'] > 0 and player['hp'] > 0:",
    "...         dmg = player['base_attack']",
    "...         if player['element'] == foe['weakness']:",
    "...             dmg *= 2",
    "...         foe['hp'] -= dmg",
    "...         if foe['hp'] <= 0: break",
    "...         player['hp'] -= foe['attack']",
    "...",
    ">>> for foe in enemies:",
    "...     fight(foe)",
  ].join("\n") + GEAR_REMINDER;
}

function lootHint(tier: Tier, runeCount: number): string {
  if (runeCount <= 1) {
    return [
      "base_item and rune are both plain dicts. Write a function that",
      "takes them and returns a NEW dict combining their properties,",
      "then assign the result to a variable named crafted_item.",
      "",
      ">>> def forge_item(base, rune):",
      "...     item = dict(base)",
      "...     item['modifier'] = rune['modifier']",
      "...     item['value'] = rune['value']",
      "...     item['sockets'] = base['sockets'] - 1",
      "...     item['name'] = 'runed_' + base['name']",
      "...     return item",
      "...",
      ">>> crafted_item = forge_item(base_item, rune)",
      "",
      "door.open() drops crafted_item into your inventory — it does NOT",
      "auto-equip. Wield it later with equip(inventory[-1]).",
    ].join("\n");
  }
  return [
    `runes is now a LIST of ${runeCount} dicts — this weapon has ${runeCount} sockets to fill.`,
    "Build crafted_item from base_item, then loop over runes and record",
    "each one you socket into a list under the 'applied_runes' key.",
    tier >= 4 ? "(A list comprehension works here too, not just a loop.)" : "",
    "",
    ">>> crafted_item = dict(base_item)",
    ">>> crafted_item['applied_runes'] = []",
    ">>> for rune in runes:",
    "...     crafted_item['applied_runes'].append(rune)",
    ">>> crafted_item['modifier'] = runes[0]['modifier']",
    ">>> crafted_item['value'] = sum(r['value'] for r in runes)",
    "",
    "door.open() drops crafted_item into your inventory — it does NOT",
    "auto-equip. Wield it later with equip(inventory[-1]).",
  ]
    .filter(Boolean)
    .join("\n");
}

function restHint(): string {
  return [
    "Nothing to fight here. player['hp'] can't exceed player['max_hp'] —",
    "the room resolves once you've topped it off (or decided not to).",
    "",
    ">>> player['hp'] = min(player['max_hp'], player['hp'] + heal_amount)",
  ].join("\n");
}

function packSize(tier: Tier): number {
  if (tier === 3) return Math.random() < 0.5 ? 2 : 3;
  return Math.random() < 0.5 ? 3 : 4;
}

/** Lays enemy ascii blocks side by side (row by row), not stacked end to end. */
function combineAscii(enemies: Enemy[]): string {
  const blocks = enemies.map((e) => e.ascii.split("\n"));
  const widths = blocks.map((lines) => Math.max(...lines.map((l) => l.length)));
  const rowCount = Math.max(...blocks.map((lines) => lines.length));
  const rows: string[] = [];
  for (let row = 0; row < rowCount; row++) {
    rows.push(
      blocks
        .map((lines, i) => (lines[row] ?? "").padEnd(widths[i]))
        .join("   ")
        .trimEnd(),
    );
  }
  return rows.join("\n");
}

function combatRoom(depth: number, tier: Tier, boss: boolean): RoomData {
  let enemies: Enemy[];
  if (boss) {
    enemies = [rollEnemy(depth, true)];
  } else if (tier >= 3) {
    enemies = rollEnemyPack(depth, packSize(tier), tier >= 4);
  } else {
    enemies = [rollEnemy(depth, false)];
  }

  const names = enemies.map((e) => e.name);
  const isPack = enemies.length > 1;
  const title = boss
    ? `${names[0]} awaits`
    : isPack
      ? `${enemies.length} foes block the way: ${names.join(", ")}`
      : `${names[0]} blocks the way`;
  const flavor = boss
    ? `${names[0]} rises to full height. ${enemies[0].hp} HP, ${enemies[0].attack} attack. This is the depth's guardian.`
    : isPack
      ? `${enemies.length} enemies square off against you: ${enemies
          .map((e) => `${e.name} (${e.hp} hp, weak to ${e.weakness})`)
          .join("; ")}.`
      : `A ${names[0]} snarls from the dark. It has ${enemies[0].hp} HP and hits for ${enemies[0].attack}.`;
  const ascii = boss ? `${ROOM_ASCII.boss_gate}\n\n${enemies[0].ascii}` : combineAscii(enemies);

  return {
    id: uid(),
    depth,
    type: boss ? "boss" : "combat",
    title,
    ascii,
    flavor,
    hint: combatHint(tier),
    data: { enemies },
    resolved: false,
  };
}

function lootRoom(depth: number, tier: Tier): RoomData {
  const runeCount = tier >= 3 ? 2 : 1;
  const { base_item, runes } = rollLoot(depth, runeCount);
  const flavor =
    runes.length > 1
      ? `You find ${base_item.name} (base_damage ${base_item.base_damage}, ${base_item.sockets} sockets) and ${runes.length} runes: ${runes
          .map((r) => `${r.name} (+${r.value} ${r.modifier})`)
          .join(", ")}.`
      : `You find ${base_item.name} (base_damage ${base_item.base_damage}, ${base_item.sockets} socket(s)) and ${runes[0].name} (+${runes[0].value} ${runes[0].modifier}).`;

  return {
    id: uid(),
    depth,
    type: "loot",
    title: "A glint in the rubble",
    ascii: ROOM_ASCII.entry,
    flavor,
    hint: lootHint(tier, runes.length),
    data: { base_item, runes },
    resolved: false,
  };
}

export function rollRoom(depth: number): RoomData {
  const tier = tierForDepth(depth);
  const type = rollRoomType(depth);

  switch (type) {
    case "combat":
      return combatRoom(depth, tier, false);
    case "boss":
      return combatRoom(depth, tier, true);
    case "loot":
      return lootRoom(depth, tier);
    case "rest": {
      const heal_amount = 8 + depth;
      return {
        id: uid(),
        depth,
        type,
        title: "A quiet alcove",
        ascii: ROOM_ASCII.rest,
        flavor: `A dying campfire still holds some warmth. heal_amount is ${heal_amount}.`,
        hint: restHint(),
        data: { heal_amount },
        resolved: false,
      };
    }
  }
}
