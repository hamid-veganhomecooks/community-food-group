#!/usr/bin/env node
// Validates every semantic colour-role pair actually used in the templates
// against WCAG 2.2 AA. Zero dependencies: parses the real tokens out of
// src/styles/global.css instead of carrying a second, driftable copy.
//
// Direction B's sixteen role pairs were all checked against AA before the
// palette was chosen (see TASK_SPEC.md); this script re-derives the same
// check from the tokens that actually ship, so a future edit to a token
// cannot silently reintroduce a failure.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, '..', 'src', 'styles', 'global.css');

const BODY_TEXT_THRESHOLD = 4.5;
const UI_BOUNDARY_THRESHOLD = 3.0;

// [label, foreground role, background role, threshold]
const PAIRS = [
  ['Body text on surface', 'ink', 'surface', BODY_TEXT_THRESHOLD],
  ['Body text on raised surface (card)', 'ink', 'surface-raised', BODY_TEXT_THRESHOLD],
  ['Muted text on surface', 'ink-muted', 'surface', BODY_TEXT_THRESHOLD],
  ['Muted text on raised surface (card)', 'ink-muted', 'surface-raised', BODY_TEXT_THRESHOLD],
  ['Muted text on sunken surface', 'ink-muted', 'surface-sunken', BODY_TEXT_THRESHOLD],
  ['Heading/link, brand-ink on surface', 'brand-ink', 'surface', BODY_TEXT_THRESHOLD],
  ['Heading/link, brand-ink on raised surface', 'brand-ink', 'surface-raised', BODY_TEXT_THRESHOLD],
  ['Accent text on surface', 'accent-ink', 'surface', BODY_TEXT_THRESHOLD],
  ['Accent text on raised surface', 'accent-ink', 'surface-raised', BODY_TEXT_THRESHOLD],
  ['Chip, accent-ink on accent-soft', 'accent-ink', 'accent-soft', BODY_TEXT_THRESHOLD],
  ['Button text, ink-inverse on brand fill', 'ink-inverse', 'brand', BODY_TEXT_THRESHOLD],
  ['Button text, ink-inverse on accent fill', 'ink-inverse', 'accent', BODY_TEXT_THRESHOLD],
  ['Footer body, ink-inverse on surface-inverse', 'ink-inverse', 'surface-inverse', BODY_TEXT_THRESHOLD],
  ['Footer muted, ink-inverse-muted on surface-inverse', 'ink-inverse-muted', 'surface-inverse', BODY_TEXT_THRESHOLD],
  ['Focus ring against surface', 'focus', 'surface', UI_BOUNDARY_THRESHOLD],
  ['Focus ring against raised surface', 'focus', 'surface-raised', UI_BOUNDARY_THRESHOLD],
];

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// Every `--name: value;` declaration in the file, flattened into one map.
// Brand-input names (--brand-*, --neutral-*) and semantic role names
// (--color-*) don't collide, so a flat map is sufficient - we only ever look
// up the handful of names a pair references.
function parseCustomProperties(css) {
  const map = new Map();
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(css))) {
    map.set(match[1], match[2].trim());
  }
  return map;
}

// A role value is either a literal hex colour or a var(--other) reference,
// possibly chained (semantic role -> brand input -> hex).
function resolveHex(name, map, seen = new Set()) {
  if (seen.has(name)) {
    throw new Error(`Circular token reference detected at --${name}`);
  }
  seen.add(name);

  const raw = map.get(name);
  if (raw === undefined) {
    throw new Error(`Token --${name} is not defined in global.css`);
  }

  const hexMatch = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) return normalizeHex(raw);

  const varMatch = raw.match(/^var\(\s*--([a-zA-Z0-9-]+)\s*\)$/);
  if (varMatch) return resolveHex(varMatch[1], map, seen);

  throw new Error(`Token --${name} has an unresolvable value: "${raw}"`);
}

function normalizeHex(hex) {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return '#' + [...h].map((c) => c + c).join('');
  }
  return '#' + h;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// WCAG 2.2 relative luminance: sRGB gamma expansion, then the standard
// luminance-weighted sum.
function relativeLuminance([r, g, b]) {
  const expand = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [r, g, b].map(expand);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

// None of the checked pairs below carry a translucent role today (the one
// alpha modifier left in the templates, the footer's decorative divider, is
// exempt under WCAG 1.4.11 the same way the old gray-200 divider was), so
// this only needs to compare solid colours. A future pair that reintroduces
// an opacity modifier would need sRGB alpha compositing added here first.
function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

function main() {
  const css = stripComments(readFileSync(cssPath, 'utf-8'));
  const tokens = parseCustomProperties(css);

  let failed = false;
  const rows = [];

  for (const [label, fgRole, bgRole, threshold] of PAIRS) {
    let fgHex, bgHex, ratio, ok, error;
    try {
      fgHex = resolveHex(`color-${fgRole}`, tokens);
      bgHex = resolveHex(`color-${bgRole}`, tokens);
      ratio = contrastRatio(fgHex, bgHex);
      ok = ratio >= threshold;
    } catch (e) {
      error = e.message;
      ok = false;
    }
    if (!ok) failed = true;
    rows.push({ label, fgRole, bgRole, threshold, ratio, ok, error });
  }

  console.log('Contrast check (WCAG 2.2 AA)\n');
  for (const row of rows) {
    const status = row.error ? 'ERROR' : row.ok ? 'PASS' : 'FAIL';
    const ratioText = row.error ? row.error : `${row.ratio.toFixed(2)}:1 (needs ${row.threshold}:1)`;
    console.log(
      `[${status}] ${row.label} — text-${row.fgRole} on bg-${row.bgRole}: ${ratioText}`,
    );
  }

  console.log('');
  if (failed) {
    console.log('Contrast check FAILED. See the pairs marked FAIL/ERROR above.');
    process.exit(1);
  }

  console.log(`All ${rows.length} role pairs pass WCAG 2.2 AA.`);
}

main();
