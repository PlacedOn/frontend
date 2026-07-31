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

/**
 * Any OTHER saturated hue. This exists because the violet test above has a
 * blind spot that cost real quality: rgba(120,178,255) blue and
 * rgba(255,196,132) peach sat inside the always-on page-background wash — the
 * single most visible layer on the site — across six components, and no check
 * could see them, because neither satisfies b > r > g. The palette audit kept
 * reporting "clean" while the ground was tinted blue-and-orange.
 *
 * Greys and near-greys are exempt (spread <= 30): text, borders, shadows and
 * dark grounds are all legitimately neutral. So are pure blacks and whites.
 */
const isOtherHue = (r, g, b) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max - min <= 30) return false;      // neutral
  return !isViolet(r, g, b);
};

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".tsx", ".ts", ".css"].includes(extname(p))) files.push(p);
  }
})("src");

/** Semantic status colours + their tints are the only sanctioned non-violet hues. */
const ALLOWED_HUES = new Set([
  "#047857", "4,120,87", "#ECFDF5", "236,253,245",
  "#B45309", "180,83,9",  "#FFFBEB", "255,251,235",
  "#B91C1C", "185,28,28", "#FEF2F2", "254,242,242",
  "#E5484D", "229,72,77", "#F5860B", "245,134,11", "#FFB454", "255,180,84",
]);

const violations = [];
const offHue = [];
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
      else if (isOtherHue(r, g, b) && !ALLOWED_HUES.has(u))
        offHue.push(`${f}:${i + 1}  ${m[0]}  saturated non-violet hue`);
    }
    for (const m of line.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g)) {
      const [r, g, b] = [m[1], m[2], m[3]].map(Number);
      if (isViolet(r, g, b) && !RAMP_RGB.has(`${r},${g},${b}`))
        violations.push(`${f}:${i + 1}  rgb(${r},${g},${b})  not in the violet ramp`);
      else if (isOtherHue(r, g, b) && !ALLOWED_HUES.has(`${r},${g},${b}`))
        offHue.push(`${f}:${i + 1}  rgb(${r},${g},${b})  saturated non-violet hue`);
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
      "  --v-800 deepest ink (employer accent-ink)\n" +
      "  --v-900 dark ground · --brand-mark logo only\n"
  );
  process.exit(1);
}
if (offHue.length) {
  // Warn, don't fail: the status/signal palette is legitimate and this rule is
  // new. Escalate to a hard failure once the existing list is triaged.
  console.warn(`\ncolor-lint: ${offHue.length} saturated non-violet hue(s) — review, not yet blocking\n`);
  offHue.slice(0, 25).forEach((v) => console.warn("  " + v));
  if (offHue.length > 25) console.warn(`  … and ${offHue.length - 25} more`);
}
console.log(`color-lint: clean — ${files.length} files, every violet on the ramp`);
