// One-Line Office Joke Laugh-Off
// make.fun bounty: u-suzy-one-line-office-joke-laugh-off-f574ac73
//
// Writes a single original one-line office joke to /output/entry.txt.
// The program holds four hand-written jokes, grades each one against the
// judge's own rubric in the judge's own order, and writes the best.
//
// Judge rubric (most important first):
//   1. It really is a one-line joke about office life.
//   2. The punchline is sharp and surprising, not a mild observation.
//   3. It lands on one read, with no setup that needs explaining.
//   4. It is fresh: no office cliche everyone has heard before.
//   5. Every word earns its place; tight wording, no filler.
//
// Deterministic, stdlib only, no network. Run: node main.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Joke = {
  line: string;
  // Hand-scored 0-5 per rubric item, in the judge's order, with a short
  // note so the pick can be checked instead of trusted blindly.
  rubric: {
    office: number;
    punch: number;
    instant: number;
    fresh: number;
    tight: number;
  };
  note: string;
};

const JOKES: Joke[] = [
  {
    line: "I told HR my work-life balance was off, so they moved my desk next to the window — now I can watch the life I'm missing.",
    rubric: { office: 5, punch: 5, instant: 5, fresh: 5, tight: 5 },
    note: "HR 'solves' the complaint literally: a window onto the life outside. 'Watch' makes the punch active — the desk move is the punchline, and no word is spare.",
  },
  {
    line: "My manager asked what motivates me, so I said 'payday', and now my performance review just says 'transactional' in bold.",
    rubric: { office: 5, punch: 5, instant: 5, fresh: 4, tight: 4 },
    note: "'Transactional in bold' is the sharp part, but honest-about-payday is a familiar setup, and 'just says' carries a little slack.",
  },
  {
    line: "HR's wellness email told me to drink more water, so I cried at my desk — hydration and emotional release in one.",
    rubric: { office: 5, punch: 4, instant: 4, fresh: 4, tight: 4 },
    note: "Crying as hydration is a surprising turn, but the laugh leans on the reader picturing the tears, and the second half explains the joke a touch.",
  },
  {
    line: "My calendar blocked out 'focus time', so my manager booked a meeting called 'quick sync about focus time'.",
    rubric: { office: 5, punch: 4, instant: 5, fresh: 3, tight: 5 },
    note: "Instantly relatable and tight, but the meeting-about-focus-time irony is a joke the internet has already told.",
  },
];

// The judge weighs its criteria in order, so the weights fall in that order.
const WEIGHTS = { office: 5, punch: 4, instant: 3, fresh: 2, tight: 1 };

function score(j: Joke): number {
  const r = j.rubric;
  return (
    r.office * WEIGHTS.office +
    r.punch * WEIGHTS.punch +
    r.instant * WEIGHTS.instant +
    r.fresh * WEIGHTS.fresh +
    r.tight * WEIGHTS.tight
  );
}

function best(): Joke {
  // Best weighted score wins. A tie goes to the shorter line in bytes,
  // which is also how the bounty itself breaks exact ties.
  return [...JOKES].sort(
    (a, b) =>
      score(b) - score(a) ||
      Buffer.byteLength(a.line, "utf8") - Buffer.byteLength(b.line, "utf8"),
  )[0];
}

const winner = best();
const line = winner.line;
// Count code points, not UTF-16 units, so the count matches the gate.
const length = [...line].length;

// Gate (from the bounty rules): UTF-8 text of 1 to 200 characters, not
// only white space, and a single line.
if (length < 1 || length > 200 || line.trim().length === 0) {
  throw new Error(`Gate failed: entry is ${length} characters`);
}
if (line.includes("\n") || line.includes("\r")) {
  throw new Error("Gate failed: entry must be a single line");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", line, "utf8");

// Read back what was written: the file the judge reads must be exactly
// the line that passed the gate, byte for byte.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== line) {
  throw new Error("Gate failed: written file differs from the entry line");
}

console.log(`Winner (${score(winner)} pts): ${winner.note}`);
console.log(`Wrote /output/entry.txt (${length} chars):`);
console.log(line);
