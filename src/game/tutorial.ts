import type { RoomData, TutorialCheck } from "./types";

interface TutorialStep {
  title: string;
  ascii: string;
  flavor: string;
  starterCode: string;
  check: TutorialCheck;
  lockedMessage: string;
}

const TORCH_ASCII = [
  "     )",
  "    (",
  "   )",
  "  ( @",
  "   |||",
  "   |||",
].join("\n");

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Lesson 1 — running code",
    ascii: TORCH_ASCII,
    flavor:
      "Welcome to the delve. The box below the log is real Python — Ctrl/Cmd+Enter " +
      "(or the Run button) executes exactly what's typed, top to bottom.\n\n" +
      "The code on the right is already filled in for this one. Just run it as-is " +
      "and watch what shows up in the log above it.",
    starterCode: ['print("hello, delver")', "door.open()"].join("\n"),
    check: { kind: "always" },
    lockedMessage: "Run the code first — click Run or press Ctrl/Cmd+Enter.",
  },
  {
    title: "Lesson 2 — variables",
    ascii: TORCH_ASCII,
    flavor:
      "torches = 3 creates a variable named torches holding the number 3. A variable " +
      "is just a name for a value you can use again later — print(torches) reads it back.\n\n" +
      "Run it as-is. If you want, change the 3 to another number first and see the " +
      "printed value change — not required, just try it.",
    starterCode: ["torches = 3", "print(torches)", "door.open()"].join("\n"),
    check: { kind: "var_exists", name: "torches" },
    lockedMessage: "Run the code — it defines torches and prints it.",
  },
  {
    title: "Lesson 3 — dictionaries",
    ascii: TORCH_ASCII,
    flavor:
      "A dict stores several named values together, like a labeled chest. " +
      'chest["gold"] reads the value stored under the "gold" key.\n\n' +
      "Every monster and item later in the delve is a dict exactly like this one — " +
      "you'll always reach into it the same way: name[\"key\"].",
    starterCode: [
      'chest = {"gold": 12, "trapped": False}',
      'print(chest["gold"])',
      "door.open()",
    ].join("\n"),
    check: { kind: "var_exists", name: "chest" },
    lockedMessage: "Run the code — it builds the chest dict and reads a key from it.",
  },
  {
    title: "Lesson 4 — if / else",
    ascii: TORCH_ASCII,
    flavor:
      "if checks a condition and only runs its indented block when that condition " +
      "is true; else covers every other case.\n\n" +
      "Run it as-is, then try changing danger to something under 5 and running again " +
      "to see the other branch — not required, just try it.",
    starterCode: [
      "danger = 7",
      "if danger > 5:",
      '    print("that\'s dangerous!")',
      "else:",
      '    print("safe enough")',
      "door.open()",
    ].join("\n"),
    check: { kind: "var_exists", name: "danger" },
    lockedMessage: "Run the code — it checks danger with if/else.",
  },
  {
    title: "Lesson 5 — while loops",
    ascii: TORCH_ASCII,
    flavor:
      "while repeats its indented block for as long as a condition stays true. Here, " +
      "torch_fuel counts down by 1 each pass until it hits 0, and the loop stops " +
      "on its own — nobody tells it how many times to run, the condition decides.\n\n" +
      "This shape — while something > 0: ... reduce it — is exactly how every fight " +
      "in the dungeon works. Run it and watch the countdown.",
    starterCode: [
      "torch_fuel = 5",
      "while torch_fuel > 0:",
      '    print("the torch burns... fuel:", torch_fuel)',
      "    torch_fuel -= 1",
      'print("the torch goes out")',
      "door.open()",
    ].join("\n"),
    check: { kind: "var_equals", name: "torch_fuel", value: 0 },
    lockedMessage: "Run the code and let the loop count torch_fuel all the way down to 0.",
  },
  {
    title: "Lesson 6 — write your own loop",
    ascii: TORCH_ASCII,
    flavor:
      "Your turn — no pre-written loop this time. practice_enemy has 6 hp and dmg is 2. " +
      'Write a while loop that repeats while practice_enemy["hp"] is above 0, subtracting ' +
      "dmg from its hp each pass (copy the shape from the torch lesson).\n\n" +
      "This is the exact pattern real combat uses — get comfortable with it here first.",
    starterCode: [
      'practice_enemy = {"hp": 6, "weakness": "fire"}',
      "dmg = 2",
      "",
      "# write your while loop here:",
      "",
      "",
      'print("practice enemy defeated!")',
      "door.open()",
    ].join("\n"),
    check: { kind: "dict_key_le", name: "practice_enemy", key: "hp", value: 0 },
    lockedMessage:
      'practice_enemy["hp"] is still above 0 — add a while loop that subtracts dmg ' +
      "from it each pass, the same shape as the torch countdown two lessons back.",
  },
  {
    title: "Lesson 7 — that's everything",
    ascii: TORCH_ASCII,
    flavor:
      "Variables, dicts, if/else, while loops. That's the whole toolkit — every room " +
      "in the delve is just these four ideas recombined with different numbers. " +
      "There's no new syntax waiting to ambush you.\n\n" +
      "door.open() one more time to descend for real.",
    starterCode: "door.open()",
    check: { kind: "always" },
    lockedMessage: "Run door.open() to descend.",
  },
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function buildTutorialRoom(index: number): RoomData {
  const step = TUTORIAL_STEPS[index];
  return {
    id: uid(),
    depth: 0,
    type: "tutorial",
    title: step.title,
    ascii: step.ascii,
    flavor: step.flavor,
    hint: "",
    starterCode: step.starterCode,
    data: { check: step.check },
    resolved: false,
  };
}

export function tutorialLockedMessage(index: number): string {
  return TUTORIAL_STEPS[index]?.lockedMessage ?? "Not quite yet — try again.";
}
