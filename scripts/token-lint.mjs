#!/usr/bin/env node
/**
 * token-lint — stops the V3 design system from drifting.
 *
 * A design system decays within about a week of normal development unless
 * something mechanical checks it. This is that check.
 *
 * Rules (see docs/DESIGN-SYSTEM-V3.md):
 *   1. brand-colour   ERROR  violet/ink literals outside the token source
 *   2. easing         ERROR  inline cubic-bezier() — use --ease-*
 *   3. duration       WARN   raw ms/s in transition/animation — use --d-*
 *   4. legacy-spring  ERROR  the overshoot curve, deprecated in V3
 *
 * Canvas 2D and WebGL cannot resolve var(), so files using them are exempt
 * from rule 1 only — they still may not invent their own easings.
 *
 * Usage:
 *   node scripts/token-lint.mjs                 # whole src tree
 *   node scripts/token-lint.mjs src/a.tsx …     # specific files (hook mode)
 *
 * Escape hatch, when a literal is genuinely correct:
 *   // token-lint-disable-next-line
 */

import { readFileSync, statSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/** The one file allowed to hold raw values — it defines the tokens. */
const TOKEN_SOURCE = join("src", "app", "globals.css");

/** Canvas/WebGL cannot resolve var(); these get a colour exemption. */
const CANVAS_HINT = /getContext\(|fillStyle|strokeStyle|createGlobe|THREE\./;

/** Violet + ink families. Any of these outside globals.css is drift. */
const BRAND_LITERAL = new RegExp(
  [
    // the retired V2 ramp — must never come back
    "#6922[Ff]5", "#8[Bb]54[Ff][Ff]", "#5314[Cc]9", "#[Bb]79[Bb][Ff][Ff]", "#0[Ee]1020",
    // the current V3 ramp — correct values, but they belong in globals.css
    "#5[Ee]46[Bb][Ff]", "#7462[Dd]5", "#4[Cc]369[Ee]", "#[Aa][Dd][Aa]8[Ee][Dd]",
    // rgb triplets for both ramps
    "rgba?\\(\\s*105\\s*,\\s*34\\s*,\\s*245",
    "rgba?\\(\\s*139\\s*,\\s*84\\s*,\\s*255",
    "rgba?\\(\\s*94\\s*,\\s*70\\s*,\\s*191",
    "rgba?\\(\\s*116\\s*,\\s*98\\s*,\\s*213",
  ].join("|"),
);

const INLINE_EASING = /cubic-bezier\s*\(/;
const LEGACY_SPRING = /cubic-bezier\s*\(\s*0?\.34\s*,\s*1\.45/;
const RAW_DURATION = /(?:transition|animation)(?:-duration)?\s*:\s*[^;{}]*?\b\d+(?:\.\d+)?m?s\b/;

const RULES = [
  { id: "legacy-spring", level: "error", test: LEGACY_SPRING, skipCanvas: false,
    msg: "the deprecated overshoot spring — use var(--ease-out)" },
  { id: "easing",        level: "error", test: INLINE_EASING, skipCanvas: false,
    msg: "inline cubic-bezier() — use var(--ease-out|--ease-in-out|--ease-in|--ease-soft)" },
  { id: "brand-colour",  level: "error", test: BRAND_LITERAL, skipCanvas: true,
    msg: "hardcoded brand colour — use var(--iris|--iris-soft|--iris-ink|--iris-lift|--ink)" },
  { id: "duration",      level: "warn",  test: RAW_DURATION, skipCanvas: false,
    msg: "raw duration — use var(--d-micro|--d-std|--d-sig|--d-reveal|--d-narrate)" },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if ([".ts", ".tsx", ".css"].includes(extname(entry.name))) out.push(p);
  }
  return out;
}

function lint(files) {
  const findings = [];

  for (const abs of files) {
    const rel = relative(ROOT, abs);
    if (rel === TOKEN_SOURCE) continue;

    let src;
    try {
      if (!statSync(abs).isFile()) continue;
      src = readFileSync(abs, "utf8");
    } catch {
      continue; // deleted or unreadable between glob and read
    }

    const isCanvas = CANVAS_HINT.test(src);
    const lines = src.split("\n");

    lines.forEach((line, i) => {
      if (i > 0 && /token-lint-disable-next-line/.test(lines[i - 1])) return;

      for (const rule of RULES) {
        if (rule.skipCanvas && isCanvas) continue;
        if (rule.test.test(line)) {
          findings.push({
            file: rel, line: i + 1, rule: rule.id,
            level: rule.level, msg: rule.msg,
            snippet: line.trim().slice(0, 92),
          });
        }
      }
    });
  }
  return findings;
}

const argFiles = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = argFiles.length
  ? argFiles.map((f) => (f.startsWith("/") ? f : join(ROOT, f)))
             .filter((f) => [".ts", ".tsx", ".css"].includes(extname(f)))
  : walk(SRC);

if (!targets.length) process.exit(0);

const findings = lint(targets);
const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");

for (const f of findings) {
  const tag = f.level === "error" ? "ERROR" : "warn ";
  console.error(`[token-lint] ${tag} ${f.file}:${f.line}  (${f.rule})\n              ${f.msg}\n              ${f.snippet}`);
}

if (findings.length) {
  console.error(`[token-lint] ${errors.length} error(s), ${warns.length} warning(s) — see docs/DESIGN-SYSTEM-V3.md`);
} else if (!argFiles.length) {
  console.log(`[token-lint] clean — ${targets.length} files`);
}

// Only errors gate. Warnings inform.
process.exit(errors.length ? 1 : 0);
