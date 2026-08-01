# TASK SPECIFICATION

## Task 004d + 009a + 008a-remainder : Three small close-outs

### Role

`IMPLEMENTER`

### Status

**ACTIVE.** Promoted 2026-08-01 by an `ARCHITECT` session. This document is the only authority
on scope and acceptance. The three parts were **cut** from `ROADMAP.md`, whose entries now point
here.

**Nothing of Task 005b survives in this file.** Task 005b is complete, merged as `716ddd3`, and
its verification record is in `docs/DECISIONS_ARCHIVE.md` under `## Verification history`.

### Why three parts in one task

Each is small, self-contained, and **independently completable**. They are bundled because the
owner is away for a week and wants the repository left in a coherent state rather than
mid-task. They share no files except `package.json` and `README.md`.

**If you cannot finish all three, finish whole parts.** A completed Part A and Part B with Part C
untouched is a good outcome. Three half-done parts is the outcome this bundling exists to avoid.
**Report exactly which parts are complete.**

---

## Verified starting conditions

Confirmed by execution on 2026-08-01, Node v22.23.2, on branch
`task/005b-content-consolidation`. **If any has changed, stop and report rather than adapting.**

| Check | Observed |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings, **21 hints** (all `ts(6385)`, the zod deprecation) |
| `npm run check:contrast` | exits 0, all **sixteen** role pairs pass |
| `npm run check:config` | **exits 1**, naming **2** tokens - `MASTODON_HANDLE`, `MASTODON_URL`, both `site.config.ts:99` |
| `npm run build` | **6** routes, exactly one `h1` each |
| Tokens in `dist/` | **none** |
| `npm run verify` | **stops at `check:config` and never reaches `build`** - this is Part C's problem |

**Grep-confirmed facts:**

- **`zod@4.4.3` is installed as a child of `astro@7.1.6`** and is **not** in `package.json`.
- **`src/content.config.ts:1` is the only file importing `z`.** Seven other files import
  `getEntry` / `render` / `getCollection` / `defineCollection` from `astro:content`; **those
  stay exactly as they are.**
- **`CONTRIBUTING.md` does not exist.** Neither does `.github/`.
- `scripts/` holds `fetch-mastodon.ts`, `check-contrast.mjs`, `check-config.mjs`,
  `verify-baseline.sh`.

---

# Part A - `CONTRIBUTING.md` (Task 004d)

Flagged open by Task 004c on 2026-07-31 and never carried by any task since. The repository is
public and deliberately shaped for reuse, so the gap is real.

### Required

Create `CONTRIBUTING.md`:

- **Contributions are dedicated under CC0 1.0**, matching `LICENSE`. CC0 covers only what the
  owner holds, which is why this file has to exist before outside patches land.
- **State the three carve-outs** `README.md` already documents, because a contributor meets them
  first: the group's name and identity are **not** waived (CC0 does not cover trademark); Inter
  is **SIL OFL 1.1**; and the page copy describes a real group and would be false if republished
  unchanged.
- **Note that prose is rewritten, not tokenized** by an adopting fork, and point at
  `README.md`'s rebranding section rather than restating it.
- Link it from `README.md`.

### Forbidden

**Do not invent a code of conduct, a review process, a maintainer list, a response-time promise,
or a CLA.** None of them exist. Constraint 3.1 covers process claims exactly as it covers
addresses - a fabricated review process is a fabricated fact about how this project operates.

---

# Part B - Declare zod (Task 009a)

**[2026-08-01] Owner decision, recorded in `PROJECT_CONTEXT.md` section 4.** This **declares a
dependency that is already installed**; it downloads nothing new and ships no new code.

### Required

1. Add `"zod": "^4.4.3"` to `dependencies` in `package.json`. **The range must match what Astro
   pulls** so npm dedupes to a single copy - Astro passes these schemas into its own zod
   internals, so a major-version skew is not cosmetic. **Confirm with `npm ls zod` that exactly
   one version resolves after installing.**
2. In `src/content.config.ts`, change line 1 so `z` comes from `zod`:
   - `import { defineCollection } from 'astro:content';`
   - `import { z } from 'zod';`
   - **`defineCollection` stays from `astro:content`.** Only `z` moves.
3. Commit the resulting `package-lock.json` change.

### Forbidden

- **Do not import from `'zod'` without declaring it.** That works only because npm happens to
  flatten the package to the top of `node_modules`, and leaving that state is the entire point.
- **Do not touch the seven files importing `getEntry` / `render` / `getCollection`.**
- **Do not change any schema.** This is an import move, not a validation change.

---

# Part C - The `dist/` output scan (Task 008a remainder)

**The project has never enforced its own publishing rule.** `PROJECT_CONTEXT.md` section 4 says
"no deployed build may contain one", but `check-config.mjs` scans `site.config.ts` and `src/` -
**nothing has ever looked at build output.**

### C1. `scripts/check-dist.mjs`

Zero dependencies, plain Node, in the shape of `check-contrast.mjs` and `check-config.mjs`.

- **Read files through Node's `fs`, never the shell.** The shell's `grep` is a wrapper that
  honours `.gitignore`, and `dist/` is git-ignored, so a shell-based scan **passes vacuously**.
  This is the single most important design constraint on this script.
- Apply the **one documented token pattern**: `/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g`
- Report file, line and the matching text. Exit non-zero on any match.
- Exit non-zero if `dist/` does not exist - a scan that silently passes because there is nothing
  to scan is worse than no scan.

**Do not strip tags, and do not try to extract visible text.** A token matters wherever it
appears - in body copy, in a `mailto:` href, in a meta tag. Scanning the raw file text is both
simpler and more correct.

**This is what sidesteps the trap** recorded in `PROJECT_CONTEXT.md` section 4: Astro emits `>`
**unescaped** inside computed attribute values, so `<[^>]+>` terminates tags early and spills
class lists into what looks like page text. Three `class` attributes in `dist/index.html` carry
a raw `>` today. **Because this scan never parses tags, that trap does not apply - keep it that
way.** If you find yourself writing a tag regex, stop and reconsider.

**Which files to scan is yours to decide, but decide it from observed output, not by guessing.**
Run the raw pattern across all of `dist/` first, look at every match, and choose the file
extensions and any allowlist from what you actually see. Minified bundles under `dist/_astro/`
are the likely source of false positives. **Report what you found and what you excluded, with
the reason.**

### C2. Wire it into `npm run verify`

`scripts/verify-baseline.sh` uses `set -e`, so today a red `check:config` stops the run before
`build`. Restructure so:

- `check`, `check:contrast` run as now - **still fatal**.
- **`check:config` becomes non-fatal inside `verify` only.** Capture its status, print a clear
  warning, and continue. An unanswered owner input is a known project state, not a build failure.
- `build` runs.
- **`check:dist` runs after `build` and is fatal.** This is the publishing gate.
- At the end, if `check:config` was red, say so plainly in the summary - the run must not look
  fully green when a token is outstanding.

**This is not a weakening of `check:config`.** Standalone, `npm run check:config` **must still
exit non-zero** with tokens present. Only `verify`'s fatality changes. Say so in a comment in
the script, because a future reviewer will otherwise read this as the check being softened.

Add `check:dist` to `package.json` scripts and to `README.md`'s Commands table.

### C3. Prove the scan fails

**Constraint 3.10.** A validator that has only ever passed is not known to work - this is the
exact lesson `check-config.mjs` carries in its own archive record.

Temporarily reintroduce a token into a content file, rebuild, confirm `check:dist` **exits
non-zero and names the right file and line**, then revert and confirm it passes again. **Paste
both directions.**

### C4. Re-verify the CGT listing

**Overdue.** `PROJECT_CONTEXT.md` records this as a standing dependency, and it was meant to
happen before the preview went up. The preview is live, so the claim is published.

Confirm against `https://www.communitygardensoftucson.org/garden-locations` that **Presidio
Garden is still listed, at `3440 E Presidio Rd`**, and still operated by Community Gardens of
Tucson.

- **If it still holds:** say so with the date, for the record.
- **If anything has changed:** **stop and report. Do not edit `locations.json`.** The copy is
  owner-approved and a change here is an owner decision.
- **If this session has no network access:** say so plainly and leave it for the owner. **Do not
  report it as verified.**

### Out of Part C's scope

**`NODE_VERSION` on Cloudflare Pages is an owner dashboard check, not an implementer task.**
Note it in your report as outstanding.

---

## Allowed scope

**New:** `CONTRIBUTING.md`, `scripts/check-dist.mjs`

**Modified:** `package.json`, `package-lock.json`, `src/content.config.ts`,
`scripts/verify-baseline.sh`, `README.md`

**Explicitly out of scope:**

- **`site.config.ts`.** In particular **do not touch `social.mastodon`.** Both tokens stay -
  the handle is undecided, and `null` would record *decided against*.
- **`scripts/check-config.mjs`.** Its behaviour does not change. Only how `verify` treats it.
- **`src/`, other than `content.config.ts` line 1.** No copy, no components, no templates.
- **`src/styles/global.css`**, the palette, the type scale, the rhythm.
- **`src/components/MastodonFeed.astro`.** Task 006a.
- **`public/`, favicon, OG image.** Task 007a - and it needs an owner input.
- **CI, linter, formatter, link checker, automated accessibility.** The rest of Task 009.
- **`PROJECT_CONTEXT.md` and `ROADMAP.md`.** `ARCHITECT` and `MEMORY SYNC` documents. Report;
  do not write.

---

## Acceptance criteria

Executed, not inspected. Paste real output. **Every criterion touching `dist/` must use
`/usr/bin/grep`** - the shell wrapper honours `.gitignore` and `dist/` is ignored, so it passes
vacuously otherwise.

**Part A**

1. `CONTRIBUTING.md` exists, states CC0 dedication for contributions, and names all three
   carve-outs. `README.md` links to it.
2. It contains **no** code of conduct, review process, maintainer list, response-time promise or
   CLA. State this explicitly in your report.

**Part B**

3. `npm run check` reports **0 errors, 0 warnings, and 0 hints.** The 21 `ts(6385)` deprecation
   hints are gone. **This is Part B's whole observable effect** - paste the before and after.
4. `npm ls zod` resolves **exactly one** version. Paste it.
5. `/usr/bin/grep -n "from 'astro:content'" src/` still shows the **seven** untouched files, and
   `src/content.config.ts` now imports `z` from `'zod'` while `defineCollection` still comes from
   `astro:content`.
6. `npm run build` still emits **six** routes, and `npm run check:contrast` still passes sixteen
   pairs.

**Part C**

7. `npm run check:dist` **exits 0** against the current build.
8. **Proven to fail:** with a token temporarily reintroduced, it exits non-zero and names the
   correct file and line. Reverted, it exits 0 again. **Paste both.**
9. `npm run check:config` **standalone still exits non-zero**, naming the two Mastodon tokens.
   Paste it. **A run where this went green has failed the task.**
10. `npm run verify` **reaches `build` and completes**, and its summary states plainly that
    `check:config` is red on outstanding owner inputs. Paste the tail.
11. `check-dist.mjs` contains **no shell invocation** and **no tag-stripping regex.** State how
    you chose which files to scan, and list anything excluded with the reason.
12. The CGT listing is re-verified with the date, **or** reported as not checkable in this
    session. **Not silently skipped.**

**All parts**

13. `git diff HEAD --stat` lists **only** files in the allowed scope. Paste it. `site.config.ts`,
    `PROJECT_CONTEXT.md`, `ROADMAP.md` and anything under `src/` except `content.config.ts` must
    **not** appear.
14. **State which parts are complete.** Partial completion of whole parts is an acceptable
    outcome; a half-finished part is not.

**No browser pass is required.** Nothing here changes rendered output. If something you did
does change it, that is out of scope - stop and report.

---

## Reviewer focus

- **Does `check-dist.mjs` read through `fs` rather than shelling out to `grep`?** A shell-based
  scan passes vacuously over a git-ignored `dist/` and looks exactly like a pass.
- **Was it proven to fail, or only observed to pass?**
- **Did `check:config` get weakened to make `verify` green?** It must still exit non-zero
  standalone. Only `verify`'s fatality changes, and a comment must say so.
- **Does `verify` still look green when a token is outstanding?** It must not.
- **Was `zod` imported without being declared?**
- **Did any schema change?** Part B is an import move only.
- **Did `social.mastodon` get filled, guessed, or set to `null`?** All three are wrong.
- **Does `CONTRIBUTING.md` promise a process that does not exist?**
- **Did anything under `src/` change except `content.config.ts` line 1?**

---

## Out of scope / queued work

**Blocked on the owner:** Task 005c (the feedback round), Task 007a (brand assets), Task 006b
(the Mastodon handle, which waits on the anticipated name change), Task 008 (DNS and a working
mailbox).

**Unblocked and untouched by this task:** Task 006a - the Mastodon feed's rendering defect,
hot-linked media, and the useless alt-text fallback. Task 007 - metadata, sitemap and the
wordmark. The rest of Task 009 - CI, link checker, automated accessibility, dependency updates.
