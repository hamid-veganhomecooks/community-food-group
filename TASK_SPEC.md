# TASK SPECIFICATION

## Task 002 : Typographic system and content spacing

### Role

`IMPLEMENTER`

### Status

**COMPLETE**, 2026-07-30. Committed as `e2f1dc5`, merged to `main` as `8ad91ad`.

> **No task is currently promoted.** This file is a completion record. It does **not**
> authorize code changes. See "Next task" at the end before starting work.

### Goal, as specified

Fix the reported problem that the content pages are "all compressed, with no space between
the paragraphs, no title case, and no room for design", by installing the missing typography
plugin and establishing a shared type and spacing system.

The task did not rewrite copy and did not choose a palette. Those remain Tasks 005 and 003.

---

## What was done

1. **Installed and registered the plugin.** `@tailwindcss/typography@0.5.20`, registered
   with `@plugin '@tailwindcss/typography';` in `src/styles/global.css`. This was the whole
   of the missing-dependency defect: the compiled stylesheet went from **zero** `prose`
   occurrences to 661.

2. **Discovered and worked around a cascade-layer trap.** The plugin registers `prose` in
   the **utilities** layer, not components. The first `.prose` customization was written
   inside `@layer components`, compiled without error, and **silently did nothing** - both
   the palette inheritance and the heading spacing were discarded. The prose theme is now
   declared **outside any cascade layer**, next to `.container`, and must stay there. This
   is the second defect of this shape in the repository and is recorded as a dated decision
   in `PROJECT_CONTEXT.md`.

3. **Fixed the editorial pages.** The card and the measure were separated: `.prose-card`
   sizes itself to `measure + 2 * gutter`, so reading width is constant however padding
   scales. `max-w-4xl` was removed from the article.

4. **Fixed the hand-authored pages.** `/`, `/locations` and `/posts` get nothing from
   `prose`, so they were addressed through section and stack spacing. The home page now
   uses three distinct band paddings instead of four identical ones.

5. **Established the type scale** as fluid `@theme` tokens, replacing the
   `text-4xl md:text-5xl lg:text-6xl` strings in `index.astro`, `locations.astro` and
   `posts.astro`.

6. **Documented** the scale, the rhythm tokens, the measure, the unlayered-prose rule and
   the heading case convention in `README.md`.

### Files changed

`package.json`, `package-lock.json`, `src/styles/global.css`,
`src/pages/{index,about,join,donate,locations,posts}.astro`, `README.md`.

`src/layouts/BaseLayout.astro` was in the allowed scope but needed no change.

---

## Verification record

Run from a clean `rm -rf node_modules dist` on Node v22.23.2.

| Acceptance criterion | Result |
| --- | --- |
| 1. `npm ci` succeeds, `npm run check` reports 0 errors | **Pass.** exit 0; 0 errors, 0 warnings, 12 expected zod hints |
| 2. `npm audit` reports 0 vulnerabilities | **Pass.** 0 vulnerabilities |
| 3. `npm run build` emits the same six routes | **Pass.** 6 pages |
| 4. Compiled stylesheet contains `prose` rules | **Pass.** 661 occurrences in `dist/_astro/*.css`, previously 0 |
| 5. Paragraph spacing non-zero and list markers visible on the three editorial routes | **Pass**, measured in a browser |
| 6. Exactly one `.container` definition wins at every breakpoint | **Pass.** Resolves to 1280px at 375px and 1440px |
| 7. No heading size hardcoded outside the shared scale | **Pass.** Every heading in scope uses a scale token |
| 8. Scale, spacing tokens and case convention documented | **Pass.** `README.md` |
| 9. Reviewed in a browser at mobile and desktop width | **Pass.** 375px and 1440px, screenshots read |

No criterion failed.

### How criteria 5, 6 and 9 were measured

Spacing cannot be signed off from a CSS diff, and no browser was installed. Playwright and
Chromium were installed **outside the repository**, in a scratch directory, with a missing
`libasound2` extracted locally because there is no sudo. `package.json` therefore gained
only `@tailwindcss/typography`. **Repeat this pattern; do not add a browser to the project.**

Measured across all six routes at both widths: paragraph spacing non-zero on every
non-terminal paragraph, `list-style-type: disc` with sage markers, headings rendering
`rgb(168, 85, 59)` rather than Tailwind's default gray, prose `h2` margins 66px above and
16.5px below, measure 69.2 characters, `.container` at 1280px, one `h1` per route, no
skipped heading levels.

One correction worth recording: the first version of that check reported paragraphs with
`margin-bottom: 0`. That was a **false positive in the check**, not a defect - the plugin's
`> :last-child` rule. The assertion was narrowed to non-terminal paragraphs rather than
weakened.

---

## Deviations from the specification

Both were reported at the time and are recorded here so they are not mistaken for drift.

1. **Two README edits went beyond "type scale documentation only."** The stack line said
   "Astro 5, Tailwind CSS 3" and was corrected to "Astro 7, Tailwind CSS 4"; the Known-gaps
   entry for the content-spacing defect was removed. Both were statements that had become
   false.
2. **`--container-measure` was widened from 37rem to 39rem** after the first browser
   measurement returned 65.7 characters, the floor of the 65-75 target. The final value
   measures about 69.

---

## Next task

Nothing is promoted. Two candidates, both recorded in `ROADMAP.md`:

- **Task 003 - Brand system and palette selection.** Structurally unblocked now that the
  type scale exists, but **blocked on an owner decision** between palette directions. Do not
  invent one. Do not redesign the type scale.
- **Task 004 - Accessibility and shell correctness.** Fully unblocked, needs no owner input,
  and touches different files than 003, so the two can run in parallel.

Promoting one means replacing this file with a specification carrying an explicit
allowed-scope list, per `PROJECT_CONTEXT.md` section 1.
