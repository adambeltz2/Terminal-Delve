import { loadPyodide, type PyodideInterface } from "pyodide";
import { useGameStore } from "./store";
import type { Enemy, Item, PlayerState, RoomData } from "./types";

let pyodidePromise: Promise<PyodideInterface> | null = null;
let stdoutSink: (line: string) => void = () => {};
let stderrSink: (line: string) => void = () => {};

const DOOR_BOOTSTRAP = `
class _Door:
    def open(self):
        return _open_door_bridge()
door = _Door()
`;

function doorLockedMessage(room: RoomData): string {
  switch (room.type) {
    case "combat":
    case "boss":
      return "The door won't budge — something is still standing between you and it. (enemy['hp'] is still above 0)";
    case "loot":
      return "The door won't budge — you haven't forged anything yet. Assign your merged dict to crafted_item.";
    case "rest":
      return "The door won't budge. Something about this room still feels unfinished.";
  }
}

function checkResolved(room: RoomData, pyodide: PyodideInterface): boolean {
  switch (room.type) {
    case "combat":
    case "boss": {
      const enemy = pyodide.globals.get("enemy");
      if (!enemy) return false;
      const hp = enemy.get("hp");
      enemy.destroy();
      return typeof hp === "number" && hp <= 0;
    }
    case "loot": {
      const crafted = pyodide.globals.get("crafted_item");
      if (!crafted) return false;
      const hasModifier = crafted.get("modifier") != null;
      const hasValue = crafted.get("value") != null;
      const hasDamage = crafted.get("base_damage") != null;
      crafted.destroy();
      return hasModifier && hasValue && hasDamage;
    }
    case "rest":
      return true;
  }
}

function playerToPy(pyodide: PyodideInterface, player: PlayerState) {
  return pyodide.toPy({
    name: player.name,
    hp: player.hp,
    max_hp: player.max_hp,
    base_attack: player.base_attack,
    element: player.element,
    gold: player.gold,
  });
}

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    const indexURL = new URL("pyodide/", document.baseURI).href;
    pyodidePromise = loadPyodide({
      indexURL,
      stdout: (msg: string) => stdoutSink(msg),
      stderr: (msg: string) => stderrSink(msg),
    }).then((pyodide) => {
      pyodide.globals.set("_open_door_bridge", () => handleDoorOpen(pyodide));
      pyodide.runPython(DOOR_BOOTSTRAP);
      return pyodide;
    });
  }
  return pyodidePromise;
}

function handleDoorOpen(pyodide: PyodideInterface) {
  const store = useGameStore.getState();
  const room = store.currentRoom;
  if (!room) throw new Error("There is no door here.");
  if (!checkResolved(room, pyodide)) {
    throw new Error(doorLockedMessage(room));
  }
  syncPlayerFromGlobals(pyodide);
  if (room.type === "loot") {
    const crafted = pyodide.globals.get("crafted_item");
    const item = crafted.toJs({ dict_converter: Object.fromEntries }) as Item;
    crafted.destroy();
    store.applyCraftedItem(item);
  }
  store.markRoomResolved();
  store.appendLog("system", "The door creaks open...");
  const next = store.advanceRoom();
  primeRoomGlobals(pyodide, next);
  return pyodide.toPy({
    title: next.title,
    type: next.type,
    depth: next.depth,
    flavor: next.flavor,
  });
}

function syncPlayerFromGlobals(pyodide: PyodideInterface) {
  const player = pyodide.globals.get("player");
  if (!player) return;
  const hp = player.get("hp");
  const gold = player.get("gold");
  player.destroy();
  useGameStore.getState().syncPlayer({
    hp: typeof hp === "number" ? hp : useGameStore.getState().player.hp,
    gold: typeof gold === "number" ? gold : useGameStore.getState().player.gold,
  });
}

function safeDeleteGlobal(pyodide: PyodideInterface, name: string) {
  try {
    if (pyodide.globals.has(name)) pyodide.globals.delete(name);
  } catch {
    // best-effort cleanup only
  }
}

function primeRoomGlobals(pyodide: PyodideInterface, room: RoomData) {
  const player = useGameStore.getState().player;
  pyodide.globals.set("player", playerToPy(pyodide, player));
  pyodide.runPython("crafted_item = None");

  if (room.type === "combat" || room.type === "boss") {
    const enemy = (room.data as { enemy: Enemy }).enemy;
    pyodide.globals.set("enemy", pyodide.toPy(enemy));
  } else {
    safeDeleteGlobal(pyodide, "enemy");
  }

  if (room.type === "loot") {
    const { base_item, rune } = room.data as { base_item: Item; rune: Item };
    pyodide.globals.set("base_item", pyodide.toPy(base_item));
    pyodide.globals.set("rune", pyodide.toPy(rune));
  } else {
    safeDeleteGlobal(pyodide, "base_item");
    safeDeleteGlobal(pyodide, "rune");
  }

  if (room.type === "rest") {
    const { heal_amount } = room.data as { heal_amount: number };
    pyodide.globals.set("heal_amount", heal_amount);
  } else {
    safeDeleteGlobal(pyodide, "heal_amount");
  }
}

export async function initRunner(): Promise<void> {
  const pyodide = await getPyodide();
  const room = useGameStore.getState().currentRoom;
  if (room) primeRoomGlobals(pyodide, room);
}

export async function executeCode(code: string): Promise<void> {
  const pyodide = await getPyodide();
  const store = useGameStore.getState();

  stdoutSink = (line) => store.appendLog("stdout", line);
  stderrSink = (line) => store.appendLog("stderr", line);

  store.appendLog("input", code);
  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    for (const line of message.split("\n").filter(Boolean)) {
      store.appendLog("stderr", line);
    }
  }

  syncPlayerFromGlobals(pyodide);

  const latestPlayer = useGameStore.getState().player;
  if (latestPlayer.hp <= 0) {
    store.appendLog("system", "You have fallen. The delve claims another.");
    store.playerDied();
    return;
  }

  const room = useGameStore.getState().currentRoom;
  if (room && !room.resolved && checkResolved(room, pyodide)) {
    store.appendLog(
      "system",
      "The way forward feels clear now. Try door.open() when you're ready.",
    );
  }
}
