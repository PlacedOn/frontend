#!/usr/bin/env node
/**
 * evidence-parity — fails the build if the evidence guard table drifts.
 *
 * The same state machine exists twice: `src/lib/evidence.ts` (greys out buttons)
 * and `app/evidence_state.py` in the backend repo (decides what actually
 * happens). Duplication is deliberate — the client cannot be trusted to decide
 * consent — but two hand-maintained copies of a security-relevant table drift,
 * and the failure is silent and asymmetric:
 *
 *   client stricter than server → a legal action's button is greyed out. Annoying.
 *   client looser than server   → the UI offers a button that 409s. The candidate
 *                                 clicks "share", it fails, and the screen that
 *                                 exists to make consent trustworthy is the one
 *                                 that looks broken.
 *
 * So the tables are compared as data, not eyeballed. Runs in `prebuild`.
 *
 * If the backend repo is not present (CI, a fresh clone of the frontend only),
 * this SKIPS rather than fails — a check that blocks people who cannot possibly
 * fix it gets deleted, and then it protects nothing.
 */

import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const TS_PATH = "src/lib/evidence.ts";
const PY_PATH = join(homedir(), "PlacedOn/Code/PlacedOn/backend/app/evidence_state.py");

/** Pull `key: ["a","b"]` pairs out of the TS ALLOWED literal. */
function parseTs(src) {
  const block = src.match(/const ALLOWED[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error(`could not find ALLOWED in ${TS_PATH}`);
  const out = {};
  for (const m of block[1].matchAll(/(\w+)\s*:\s*\[([^\]]*)\]/g)) {
    out[m[1]] = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]).sort();
  }
  return out;
}

/** Pull `"key": ("a", "b"),` pairs out of the Python ALLOWED dict. */
function parsePy(src) {
  const block = src.match(/ALLOWED[^=]*=\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error("could not find ALLOWED in evidence_state.py");
  const out = {};
  for (const m of block[1].matchAll(/"(\w+)"\s*:\s*\(([^)]*)\)/g)) {
    out[m[1]] = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]).sort();
  }
  return out;
}

if (!existsSync(PY_PATH)) {
  console.log("evidence-parity: backend repo not present — skipped");
  process.exit(0);
}

const ts = parseTs(readFileSync(TS_PATH, "utf8"));
const py = parsePy(readFileSync(PY_PATH, "utf8"));

const problems = [];
const states = new Set([...Object.keys(ts), ...Object.keys(py)]);

for (const s of [...states].sort()) {
  const a = ts[s];
  const b = py[s];
  if (!a) { problems.push(`state "${s}" exists in Python but not in ${TS_PATH}`); continue; }
  if (!b) { problems.push(`state "${s}" exists in ${TS_PATH} but not in Python`); continue; }
  if (a.join(",") !== b.join(",")) {
    problems.push(
      `state "${s}" differs\n      client: [${a.join(", ")}]\n      server: [${b.join(", ")}]`,
    );
  }
}

// The rule the whole machine exists to protect, checked independently of parity:
// exactly one action may ever lead to `shared`, and it must require `approved`.
if (ts.approved && !ts.approved.includes("share")) {
  problems.push("`approved` can no longer `share` — sharing has moved, check why");
}
for (const [state, actions] of Object.entries(ts)) {
  if (state !== "approved" && actions.includes("share")) {
    problems.push(`"${state}" can now "share" — sharing must require an explicit approval`);
  }
}

if (problems.length) {
  console.error(`\nevidence-parity: ${problems.length} problem(s)\n`);
  problems.forEach((p) => console.error("  " + p));
  console.error(
    "\nThe SERVER is the authority. Fix src/lib/evidence.ts to match\n" +
      "app/evidence_state.py, never the other way round.\n",
  );
  process.exit(1);
}

console.log(
  `evidence-parity: clean — ${states.size} states agree across client and server`,
);
