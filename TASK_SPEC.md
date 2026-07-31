# TASK SPECIFICATION

## Task 002 : Typographic system and content spacing

### Role

`IMPLEMENTER`

### Status

Not started. Specified 2026-07-30, immediately after Tasks 001, 001b and 001c closed.

### Goal

Fix the reported problem that the content pages are "all compressed, with no space between
the paragraphs, no title case, and no room for design", by installing the missing
typography plugin and establishing a shared type and spacing system.

This task does **not** rewrite copy and does **not** choose a new palette. Those are Tasks
005 and 003.

### Verified starting conditions

Confirm before starting; if any has changed, stop and report the mismatch.

- The stack is Astro 7.1.6 and Tailwind 4.3.3. **There is no `tailwind.config.mjs`**, and
  recreating one is wrong: Tailwind 4 is configured in CSS. The theme is an `@theme` block
  in `src/styles/global.css`.
- `npm run check` reports 0 errors and 0 warnings. 12 hints from the `astro:content` zod
  deprecation are expected and out of scope.
- `npm audit` reports 0 vulnerabilities. Keep it that way.
- The compiled stylesheet contains **zero** `prose` rules. That is the defect.
- `.container` is declared outside any cascade layer, deliberately. Moving it into a layer
  reintroduces a fixed bug.

### Allowed scope

- `package.json`
- `package-lock.json`
- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`
- `src/pages/about.astro`
- `src/pages/join.astro`
- `src/pages/donate.astro`
- `src/pages/index.astro`
- `src/pages/locations.astro`
- `src/pages/posts.astro`
- `README.md` (type scale documentation only)

Do **not** edit the MDX documents, `src/data/locations.json`, `Header.astro`,
`Footer.astro`, or `MastodonFeed.astro` in this task.

### Required changes

1. **Install and register the typography plugin**
   - Add `@tailwindcss/typography`, authorized in `PROJECT_CONTEXT.md` on 2026-07-30.
   - Register it with `@plugin '@tailwindcss/typography';` in `src/styles/global.css`.

2. **Fix the editorial pages**
   - Paragraphs, headings and lists must have real vertical spacing, and lists must show
     markers.
   - Constrain body copy to a readable measure of roughly 65-75 characters. The current
     `max-w-4xl` is too wide for prose. Note that the card wrapper and the measure are
     different concerns and may need different widths.
   - Customize the `prose` theme so it inherits the project's colours rather than
     Tailwind's default gray.
   - Space headings deliberately: generous space above, tighter below, so a heading groups
     with the text it introduces rather than floating between blocks.

3. **Fix the hand-authored pages**
   - `/`, `/locations` and `/posts` are not MDX and get nothing from `prose`. Their rhythm
     comes from section and stack spacing, and they must be addressed separately. Fixing
     only the editorial pages leaves half the site cramped.

4. **Establish a shared type scale**
   - Define the scale as `@theme` custom properties, consistent with how the palette is
     declared.
   - Replace the ad hoc `text-4xl md:text-5xl lg:text-6xl` strings currently repeated
     across `index.astro`, `locations.astro` and `posts.astro`.
   - Verify heading order on every route; do not skip levels to obtain a size.

5. **Establish vertical rhythm**
   - Define section spacing tokens and apply them through the `.section` helper.
   - Give the pages room to breathe: the current home page is four near-identical stacked
     bands with the same padding.

6. **Document a heading case convention**
   - Decide and document it: title case for page and section headings, sentence case for
     sub-headings and UI labels, or another explicit rule.
   - Apply it to headings **in the files in scope**. Headings inside the MDX documents are
     out of scope here and will be brought into line during Task 005.

### Implementation constraints

- Do not choose a new palette. Task 003 owns that. Keep the existing colours.
- Do not rewrite page copy.
- Do not recreate `tailwind.config.mjs`.
- Do not move `.container` into a cascade layer.
- Do not add any dependency other than `@tailwindcss/typography`.
- Do not change routes, navigation or the Mastodon component.

### Acceptance criteria

1. `npm ci` succeeds and `npm run check` reports 0 errors.
2. `npm audit` reports 0 vulnerabilities.
3. `npm run build` emits the same six routes.
4. The compiled stylesheet contains `prose` rules, verified by grepping `dist/_astro/`.
5. On `/about`, `/join` and `/donate`, paragraph spacing is non-zero and list markers are
   visible, verified in the built output rather than asserted.
6. Exactly one `.container` definition wins at every breakpoint.
7. No heading size is hardcoded outside the shared scale in any file in scope.
8. The type scale, spacing tokens and heading case convention are documented.
9. The result is reviewed in a browser at a mobile and a desktop width. Spacing is a visual
   problem and cannot be signed off from a CSS diff alone.

### Reviewer focus

- Whether the hand-authored pages actually improved, or only the MDX ones.
- Whether the measure is genuinely readable rather than merely narrower.
- Heading hierarchy and case consistency.
- Any reintroduction of the `.container` layering bug.

### Out of scope / queued work

See `ROADMAP.md`. Next up: Task 003 (palette and brand system), Task 004 (accessibility and
shell correctness), then the content tasks once the owner inputs land.
