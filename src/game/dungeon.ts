import { ROOM_ASCII, rollEnemy, rollLoot } from "./data";
import type { RoomData, RoomType } from "./types";

export const BOSS_INTERVAL = 5;

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Weighted roll table, à la a solo-crawler room deck — combat is the most
 * common draw, loot and rest are rarer breathers. */
function rollRoomType(depth: number): RoomType {
  if (depth > 0 && depth % BOSS_INTERVAL === 0) return "boss";
  const roll = Math.random();
  if (roll < 0.55) return "combat";
  if (roll < 0.8) return "loot";
  return "rest";
}

function combatHint(depth: number): string {
  if (depth <= 3) {
    return [
      "The enemy dict has a 'weakness' key. Your player dict has 'element'.",
      "If they match, doubling your damage before you subtract it from",
      "enemy['hp'] is usually enough to end the fight in one blow.",
      "",
      ">>> if player['element'] == enemy['weakness']:",
      "...     dmg = player['base_attack'] * 2",
    ].join("\n");
  }
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
  ].join("\n");
}

function lootHint(): string {
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
  ].join("\n");
}

function restHint(): string {
  return [
    "Nothing to fight here. player['hp'] can't exceed player['max_hp'] —",
    "the room resolves once you've topped it off (or decided not to).",
    "",
    ">>> player['hp'] = min(player['max_hp'], player['hp'] + heal_amount)",
  ].join("\n");
}

export function rollRoom(depth: number): RoomData {
  const type = rollRoomType(depth);

  switch (type) {
    case "combat": {
      const enemy = rollEnemy(depth, false);
      return {
        id: uid(),
        depth,
        type,
        title: `A ${enemy.name} blocks the way`,
        ascii: enemy.ascii,
        flavor: `A ${enemy.name} snarls from the dark. It has ${enemy.hp} HP and hits for ${enemy.attack}.`,
        hint: combatHint(depth),
        data: { enemy },
        resolved: false,
      };
    }
    case "boss": {
      const enemy = rollEnemy(depth, true);
      return {
        id: uid(),
        depth,
        type,
        title: `${enemy.name} awaits`,
        ascii: `${ROOM_ASCII.boss_gate}\n\n${enemy.ascii}`,
        flavor: `${enemy.name} rises to full height. ${enemy.hp} HP, ${enemy.attack} attack. This is the depth's guardian.`,
        hint: combatHint(depth),
        data: { enemy },
        resolved: false,
      };
    }
    case "loot": {
      const { base_item, rune } = rollLoot(depth);
      return {
        id: uid(),
        depth,
        type,
        title: "A glint in the rubble",
        ascii: ROOM_ASCII.entry,
        flavor: `You find ${base_item.name} (base_damage ${base_item.base_damage}, ${base_item.sockets} socket(s)) and ${rune.name} (+${rune.value} ${rune.modifier}).`,
        hint: lootHint(),
        data: { base_item, rune },
        resolved: false,
      };
    }
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
