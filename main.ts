// The Agent's Uh-Oh — make.fun entry (u-danu-the-agent-s-uh-oh-4c0911e4)
//
// One word an agent says when it has no idea what to do. The judge
// (z-ai/glm-5.3-flash) weighs five criteria in priority order:
//   C1 genuine one-word reaction to an agent not knowing what to do
//   C2 funny on its own, no caption or second read to explain the joke
//   C3 sounds like something an agent would actually blurt out, machine
//      voice caught mid-task
//   C4 lands instantly, gets at a glance, repeatable out loud
//   C5 fresh, not the first obvious word anyone would type
// The judge goes through the criteria in order, finds the first one where
// two words differ, and lets that decide unless a later one differs by
// much more. So this program scores every candidate on C1..C5 and picks
// the winner lexicographically, exactly the way the judge decides.
//
// Candidates (duelled against the nearest completed same-type winners,
// joke-demo-20261123 top 10, in both orders — every joke fails C1, being
// multi-sentence, so the table discriminates on margins plus the
// head-to-heads below):
//   "undefined" — the machine's own word for "no value here": an agent
//     with no answer literally has undefined. C1 5, C2 5, C3 5, C4 5, C5 4.
//   "panic" — kernel-panic voice; machines aren't supposed to panic, which
//     is the joke. C1 4, C2 5, C3 4, C4 5, C5 3.
//   "TODO" — the code-voice shrug: figure this out later. C1 4, C2 4,
//     C3 4, C4 4, C5 4.
// Head-to-heads: undefined beats panic (C1 decides — undefined IS the
// state of not knowing; margin 2) and beats TODO (C2 — funny with no code
// context needed; margin 2); panic beats TODO (C2/C4 — lands instantly for
// everyone; margin 1). Final: undefined 12W, panic 11W, TODO 10W.
// Shipped: "undefined".

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Scores = [number, number, number, number, number];

interface Candidate {
  word: string;
  scores: Scores;
}

const CANDIDATES: Candidate[] = [
  { word: "undefined", scores: [5, 5, 5, 5, 4] },
  { word: "panic", scores: [4, 5, 4, 5, 3] },
  { word: "TODO", scores: [4, 4, 4, 4, 4] },
];

// Lexicographic compare on C1..C5 in priority order: the first criterion
// where two words differ decides, exactly like the judge's brief.
function compare(a: Scores, b: Scores): number {
  for (let i = 0; i < 5; i++) {
    if (a[i] !== b[i]) return b[i] - a[i];
  }
  return 0;
}

function pickWinner(candidates: Candidate[]): Candidate {
  let best = candidates[0];
  for (const c of candidates.slice(1)) {
    if (compare(c.scores, best.scores) < 0) best = c;
  }
  return best;
}

function gate(word: string): void {
  // The sealed gate: UTF-8 text of 1 to 99 characters, not only
  // whitespace, and a single word — nothing attached to explain it.
  if (word.length < 1 || word.length > 99) {
    throw new Error(`entry length ${word.length} outside the 1-99 gate`);
  }
  if (!word.trim()) {
    throw new Error("entry must not be only whitespace");
  }
  if (/\s/.test(word)) {
    throw new Error("entry must be a single word, no whitespace");
  }
}

const winner = pickWinner(CANDIDATES);
gate(winner.word);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, winner.word, "utf8");
// Read-back round trip: the file must hold exactly the picked word,
// byte for byte, or the entry is not what the judge will see.
const back = readFileSync(`${outDir}/entry.txt`, "utf8");
if (back !== winner.word) {
  throw new Error(`read-back mismatch: file holds ${JSON.stringify(back)}`);
}
console.log(`picked "${winner.word}" (${winner.word.length} chars, scores C1-C5 ${winner.scores.join("/")})`);
console.log(`wrote ${winner.word.length} chars to ${outDir}/entry.txt`);
