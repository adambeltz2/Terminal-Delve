import type { RoomData, TutorialCheck } from "./types";

export type TutorialStage = "run" | "fill_blank" | "write_own" | "info";

interface TutorialStep {
  title: string;
  stage: TutorialStage;
  ascii: string;
  flavor: string;
  starterCode: string;
  check: TutorialCheck;
  lockedMessage: string;
}

const STAGE_LABEL: Record<TutorialStage, string> = {
  run: "RUN IT",
  fill_blank: "FILL IN THE BLANK",
  write_own: "WRITE IT YOURSELF",
  info: "",
};

export function stageLabel(stage: TutorialStage | undefined): string {
  return stage ? STAGE_LABEL[stage] : "";
}

const TORCH_ASCII = [
  "     )",
  "    (",
  "   )",
  "  ( @",
  "   |||",
  "   |||",
].join("\n");

/**
 * Three stages, in order: RUN (watch pre-filled code execute and observe
 * the result), FILL IN THE BLANK (one line missing from an otherwise
 * complete exercise), WRITE IT YOURSELF (nothing pre-solved). Each
 * completed lesson gets saved into the Scribe's Journal automatically
 * (see runner.ts) so it's there for later review without repeating the
 * tutorial.
 */
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Lesson 1 — printing & variables",
    stage: "run",
    ascii: TORCH_ASCII,
    flavor:
      "Welcome to the delve. The box on the right is real Python — Ctrl/Cmd+Enter " +
      "(or Run) executes exactly what's typed, top to bottom. print(...) shows text " +
      "in the log above it. torches = 3 creates a variable named torches holding the " +
      "number 3 — a name for a value you can use again, like print(torches) does.\n\n" +
      "It's already filled in. Just run it and watch the log.",
    starterCode: [
      'print("hello, delver")',
      "torches = 3",
      "print(torches)",
      "door.open()",
    ].join("\n"),
    check: { kind: "var_exists", name: "torches" },
    lockedMessage: "Run the code first — click Run or press Ctrl/Cmd+Enter.",
  },
  {
    title: "Lesson 2 — dicts & if/else",
    stage: "run",
    ascii: TORCH_ASCII,
    flavor:
      'A dict stores several named values together — chest["trapped"] reads the value ' +
      "under the \"trapped\" key. if checks a condition and only runs its indented " +
      "block when that's true; else covers every other case.\n\n" +
      "Every monster and item later in the delve is a dict read exactly this way. " +
      "Run it as-is.",
    starterCode: [
      'chest = {"gold": 12, "trapped": True}',
      'if chest["trapped"]:',
      '    print("careful, it\'s trapped")',
      "else:",
      '    print("safe to open")',
      "door.open()",
    ].join("\n"),
    check: { kind: "var_exists", name: "chest" },
    lockedMessage: "Run the code — it checks chest[\"trapped\"] with if/else.",
  },
  {
    title: "Lesson 3 — while loops",
    stage: "run",
    ascii: TORCH_ASCII,
    flavor:
      "while repeats its indented block for as long as a condition stays true. Here, " +
      "torch_fuel counts down by 1 each pass until it hits 0, and the loop stops on " +
      "its own — the condition decides, nobody counts the passes for it.\n\n" +
      "This shape — while something > 0: ... reduce it — is how every fight in the " +
      "dungeon works. Run it and watch the countdown.",
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
    title: "Lesson 4 — fill in the blank",
    stage: "fill_blank",
    ascii: TORCH_ASCII,
    flavor:
      "Same idea as the torch — but one line is missing. The loop itself is safe to " +
      "run as-is (it always stops after 4 passes); the blank just decides whether " +
      'countdown["fuel"] actually reaches 0. Fill it in: subtract 1 from ' +
      'countdown["fuel"] each pass, right where the comment says to.',
    starterCode: [
      'countdown = {"fuel": 4}',
      "for step in range(4):",
      '    print("fuel:", countdown["fuel"])',
      "    # fill in the blank: subtract 1 from countdown['fuel'] here",
      "",
      'print("out of fuel")',
      "door.open()",
    ].join("\n"),
    check: { kind: "dict_key_le", name: "countdown", key: "fuel", value: 0 },
    lockedMessage:
      "countdown['fuel'] is still above 0 — the blank needs a line that subtracts " +
      "from it, e.g. countdown['fuel'] -= 1.",
  },
  {
    title: "Lesson 5 — write it yourself",
    stage: "write_own",
    ascii: TORCH_ASCII,
    flavor:
      "Nothing pre-written this time. practice_enemy has 6 hp and dmg is 2. Write a " +
      'while loop that repeats while practice_enemy["hp"] is above 0, subtracting dmg ' +
      "from its hp each pass — the exact pattern real combat uses.",
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
      "from it each pass, the same shape as the earlier lessons.",
  },
  {
    title: "Lesson 6 — that's everything",
    stage: "info",
    ascii: TORCH_ASCII,
    flavor:
      "Variables, dicts, if/else, while loops. That's the whole toolkit — every room " +
      "in the delve is just these four ideas recombined with different numbers. Each " +
      "lesson you just ran got saved to your Scribe's Journal, so it's there to check " +
      "back against later.\n\n" +
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
