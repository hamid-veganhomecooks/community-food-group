#!/usr/bin/env node
// Fails the build while any owner-fill token appears in BUILD OUTPUT.
// Zero dependencies, same shape as check-contrast.mjs and check-config.mjs.
//
// This is the check that enforces "no deployed build may contain one"
// (PROJECT_CONTEXT.md section 4). It is deliberately NOT the same question as
// check-config.mjs, which asks "does the source carry an unanswered owner
// input". Source may legitimately carry a token; published output may not.
// Two questions, two checks - do not merge them, and do not weaken either.
//
// A token is `SCREAMING_SNAKE_CASE`: one uppercase run, at least one
// underscore, no spaces. This is the single documented pattern, identical to
// the one in check-config.mjs - see PROJECT_CONTEXT.md section 4.
const TOKEN_PATTERN = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g;

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Read through Node's `fs`, NEVER through the shell.
//
// In the agent shell `grep` is a wrapper that honours `.gitignore`, including
// when an ignored directory is named as an explicit argument. `dist/` is
// git-ignored, so a shell-based scan reports "no matches" whether or not a
// token is there - it passes vacuously and looks exactly like a pass. That is
// the single most important design constraint on this script.

// Binary asset formats, skipped because their bytes are not text.
//
// Chosen from observed output, not guessed: running the raw pattern over every
// file in `dist/` produced matches in exactly two places, both inside the
// self-hosted Inter `.woff2` files (`J_2`, `G_E`), which are font bytes that
// happen to decode as UTF-8 into something shaped like a token. No `.html` or
// `.css` file matched anything.
//
// This is a DENYLIST rather than an allowlist on purpose. An allowlist of known
// text extensions would silently skip any new output format a later task adds -
// a sitemap `.xml`, a `robots.txt` - and a scan that skips a file is the same
// vacuous pass this script exists to prevent. Anything not known to be binary
// is scanned.
const BINARY_EXTENSIONS = new Set([
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp',
  '.mp4', '.webm', '.mp3', '.wav', '.ogg',
  '.pdf', '.zip', '.gz',
]);

// Deliberately no tag-stripping and no attempt to extract visible text.
// A token matters wherever it appears - body copy, a `mailto:` href, a meta
// tag - so the raw file text is both simpler and more correct to scan. It also
// sidesteps a real trap: Astro emits `>` UNESCAPED inside computed attribute
// values, so a naive `<[^>]+>` terminates tags early and spills class lists
// into what looks like page text. Three `class` attributes in dist/index.html
// carry a raw `>` today. Because this scan never parses tags, that trap does
// not apply - keep it that way.

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function findTokens(file) {
  const text = readFileSync(file, 'utf-8');
  const hits = [];
  text.split('\n').forEach((line, index) => {
    for (const match of line.matchAll(TOKEN_PATTERN)) {
      // Built output has very long lines; keep the context readable.
      const context = line.trim();
      hits.push({
        file,
        line: index + 1,
        token: match[0],
        context: context.length > 120 ? `${context.slice(0, 117)}...` : context,
      });
    }
  });
  return hits;
}

function main() {
  console.log('Dist check (owner-fill tokens in build output)\n');

  // A scan that silently passes because there is nothing to scan is worse than
  // no scan at all.
  if (!existsSync(DIST)) {
    console.error('dist/ does not exist. Run `npm run build` first.');
    console.error('Refusing to report a pass over output that was never produced.');
    process.exit(1);
  }

  const all = listFiles(DIST);
  const scanned = all.filter((f) => !BINARY_EXTENSIONS.has(path.extname(f).toLowerCase()));
  const skipped = all.length - scanned.length;

  if (scanned.length === 0) {
    console.error(`dist/ contains no scannable files (${all.length} file(s), all binary).`);
    console.error('Refusing to report a pass over output that was never produced.');
    process.exit(1);
  }

  const hits = scanned.flatMap(findTokens);

  console.log(
    `Scanned ${scanned.length} file(s) in dist/${skipped ? `, skipped ${skipped} binary asset(s)` : ''}.\n`,
  );

  if (hits.length === 0) {
    console.log('No owner-fill tokens found in build output.');
    return;
  }

  for (const hit of hits) {
    const relFile = path.relative(ROOT, hit.file);
    console.log(`[TOKEN] ${relFile}:${hit.line} ${hit.token} - ${hit.context}`);
  }

  console.log(
    `\n${hits.length} token(s) found in build output. This build must not be deployed.`,
  );
  console.log('See PROJECT_CONTEXT.md section 4 for the owner-inputs table.');
  process.exit(1);
}

main();
