#!/usr/bin/env node
// Fails the build while any owner-fill identity token remains unfilled.
// Zero dependencies, same shape as check-contrast.mjs: no duplicate list of
// tokens to drift, it scans the real source text.
//
// A token is `SCREAMING_SNAKE_CASE`: one uppercase run, at least one
// underscore, no spaces. This is the single documented pattern - see
// PROJECT_CONTEXT.md section 4 and README.md's rebranding section.
const TOKEN_PATTERN = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g;

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Only file kinds that can actually carry identity content. `.css` is
// excluded because the design-token file's doc comments reference other
// project documents by name (e.g. "see TASK_SPEC.md"), which is not a
// content token and would be a permanent false positive.
const SCAN_EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.mdx', '.md', '.json']);

// Vite's ambient environment typing file. `MASTODON_ACCOUNT` there is a
// fixed TypeScript interface member name (an env var identifier that will
// always look like this), not an owner-fill token - excluding this one file
// is narrowing the scan, not weakening the pattern.
const EXCLUDED_FILES = new Set([path.join(ROOT, 'src', 'env.d.ts')]);

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listFiles(full));
    } else if (SCAN_EXTENSIONS.has(path.extname(full)) && !EXCLUDED_FILES.has(full)) {
      out.push(full);
    }
  }
  return out;
}

function findTokens(file) {
  const text = readFileSync(file, 'utf-8');
  const lines = text.split('\n');
  const hits = [];
  lines.forEach((line, index) => {
    for (const match of line.matchAll(TOKEN_PATTERN)) {
      hits.push({ file, line: index + 1, token: match[0], context: line.trim() });
    }
  });
  return hits;
}

function main() {
  const targets = [path.join(ROOT, 'site.config.ts'), ...listFiles(path.join(ROOT, 'src'))];

  const hits = targets.flatMap(findTokens);

  console.log('Config check (owner-fill tokens)\n');

  if (hits.length === 0) {
    console.log('No unfilled tokens found.');
    return;
  }

  for (const hit of hits) {
    const relFile = path.relative(ROOT, hit.file);
    console.log(`[TOKEN] ${relFile}:${hit.line} ${hit.token} - ${hit.context}`);
  }

  console.log(`\n${hits.length} unfilled token(s) found. See PROJECT_CONTEXT.md section 4 for the owner-inputs table.`);
  process.exit(1);
}

main();
