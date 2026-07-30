#!/usr/bin/env node
/**
 * color-lint — fails the build if a violet outside the ramp appears in src/.
 *
 * Twenty-six different violets accumulated here over time: hex, lowercase hex,
 * and rgba() decimal forms, several within a few percent of each other. No
 * single change introduced them; each one was a reasonable local decision, and
 * the drift was only visible in aggregate. A hand-kept list of "the bad hexes"
 * missed a third of them, so this derives every violet-ish value from scratch
 * and checks membership in the ramp — the same method that found the ones the
 * list missed.
 *
 * Run: node scripts/color-lint.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

const RAMP_HEX = new Set([
  "#F3F2FF", "#E3DFFF", "#CBC1FF", "#AB95FF",
  "#8E64FF", "#7336FF", "#5E1EDC", "#4914AF", "#340F82",
  "#1A0B3D", "#6922F5", // v-900 ground + the brand mark
]);
const RAMP_RGB = new Set([
  "243,242,255", "227,223,255", "203,193,255", "171,149,255",
  "142,100,255", "115,54,255", "94,30,220", "73,20,175", "52,15,130", "26,11,61",
  "105,34,245",
]);

/** A violet worth policing: blue dominant, red above green, clearly not grey. */
const isViolet = (r, g, b) => b > r && r > g && b - g > 40;

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".tsx", ".ts", ".css"].includes(extname(p))) files.push(p);
  }
})("src");

const violations = [];
for (const f of files) {
  // globals.css is the ramp's definition and documents the old values by name.
  if (basename(f) === "globals.css") continue;
  const src = readFileSync(f, "utf8");
  src.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/#[0-9a-fA-F]{6}/g)) {
      const u = m[0].toUpperCase();
      const [r, g, b] = [1, 3, 5].map((k) => parseInt(u.slice(k, k + 2), 16));
      if (isViolet(r, g, b) && !RAMP_HEX.has(u))
        violations.push(`${f}:${i + 1}  ${m[0]}  not in the violet ramp`);
    }
    for (const m of line.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g)) {
      const [r, g, b] = [m[1], m[2], m[3]].map(Number);
      if (isViolet(r, g, b) && !RAMP_RGB.has(`${r},${g},${b}`))
        violations.push(`${f}:${i + 1}  rgb(${r},${g},${b})  not in the violet ramp`);
    }
  });
}

if (violations.length) {
  console.error(`\ncolor-lint: ${violations.length} off-ramp violet(s)\n`);
  violations.forEach((v) => console.error("  " + v));
  console.error(
    "\nPick a ramp step by role instead:\n" +
      "  --v-50/100 tint bg · --v-200/300 accent on dark · --v-400 accent on dark\n" +
      "  --v-500 primary fill · --v-600 accent text on light · --v-700 pressed\n" +
      "  --v-900 dark ground · --brand-mark logo only\n"
  );
  process.exit(1);
}
console.log(`color-lint: clean — ${files.length} files, every violet on the ramp`);
