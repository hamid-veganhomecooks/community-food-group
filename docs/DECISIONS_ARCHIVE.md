# DECISIONS ARCHIVE

Historical record. **Sessions do not need to read this file.** It exists so that
`PROJECT_CONTEXT.md` can stay small enough to load every session without cost.

Entries here are one of:

- **Superseded** - the decision was reversed or replaced by a later one.
- **Settled** - the decision still holds, but its rationale is no longer needed to do the
  work; the resulting rule already lives in `PROJECT_CONTEXT.md`.

Read this only when you need to know *why* something is the way it is, when a decision
looks arbitrary, or when you are about to propose reversing one. Never treat an entry here
as current authorization.

---

## Superseded decisions

### [2026-07-29] Astro 5 static output selected for the MVP

Superseded on 2026-07-30 by the Astro 7 migration. The Cloudflare Pages / static-output
half of this decision survives and is recorded in `PROJECT_CONTEXT.md` section 2.

### [2026-07-29] Terracotta / sage / cream visual direction

Reopened on 2026-07-30, then retired outright when Palette Direction B ("Garden") was
chosen. Its tokens are to be deleted, not renamed. The measured accessibility failure that
forced the change is summarized below.

### [2026-07-30] Visual direction reopened, palette to be proposed

Closed by the Direction B selection the same day. Kept only to explain the gap between the
2026-07-29 direction and the current one.

### [2026-07-30] Tasks 003 and 004 may run in parallel

Wrong. Both edit `Header.astro` and `Footer.astro`. Corrected the same day; the current
rule is in `PROJECT_CONTEXT.md`.

### README's "Node 18+" claim

Superseded by the Node 22 LTS (>= 22.18) contract.

---

## Settled decisions, rationale retained

### [2026-07-30] Migration to Astro 7 and Tailwind 4

Driven by 8 security advisories against `astro@5.18.2`. None of the affected features
(`define:vars`, server islands, view transitions, spread props) were in use, so there was
no live exposure, but nothing was deployed and this was the cheapest moment to move.

The upgrade **forced** dropping `@astrojs/tailwind`, whose latest release (6.0.2)
peer-depends on `astro: ^3 || ^4 || ^5`. Tailwind 4 via `@tailwindcss/vite` came with it.
Secondary benefit: the typography and palette work in Tasks 002-003 is built on Tailwind 4
once rather than twice.

Consequence that is still live: **`@astrojs/tailwind` must not be reintroduced**, and
Tailwind is configured in CSS via `@theme`, not in a JS config.

### [2026-07-30] The pre-Task-003 palette audit

The scaffold palette failed WCAG 2.2 AA on nine measured pairs. Measured against every
foreground/background pair actually used in the templates, not estimated.

- CTA lede 2.50:1
- Hero lede 3.04:1
- `btn-secondary` 3.09:1
- `text-terracotta` - the most-used colour class at 23 occurrences - 3.39:1 on cream and
  3.84:1 on white, so every link and card heading failed
- Both button styles failed

The `gray-200` divider at 1.24:1 was **not** counted: WCAG 1.4.11 governs boundaries needed
to identify a control, and a decorative rule is exempt.

This is why Task 003 is a correctness fix as much as a design pass, and why the contrast
script is required rather than nice to have. Direction B was validated across all sixteen
role pairs before selection: link 7.54:1, button 6.50:1, chip 5.85:1, body 14.59:1, focus
ring 6.56:1.

### [2026-07-30] Why colour is a two-layer token system

The templates named colours literally about 119 times across 10 files, so a rebrand meant
editing every template. Hence brand inputs (layer 1) and semantic roles (layer 2), with
templates consuming only layer 2.

`--color-brand` (fills) and `--color-brand-ink` (text on light) stay separate roles because
a brand colour that works as a fill usually fails as text. Collapsing the two is precisely
how the retired palette came to fail.

### [2026-07-30] Why the contrast script carries no dependencies and parses the CSS

Documenting a rebrand without giving reusers a way to verify it merely relocates the
accessibility failure downstream. Parsing tokens out of `src/styles/global.css` rather than
carrying a duplicate list prevents the script from silently drifting from what ships.

### [2026-07-30] Why fonts are self-hosted

The Google Fonts CDN render-blocks and sends visitor IP addresses to a third party, which a
mutual aid site has good reason to avoid.

### [2026-07-30] Why the distribution schedule is deliberately unpublished

The exact schedule is set by committee close to the date and genuinely changes, so
publishing a specific time in advance would be **inaccurate**, not merely a safety
tradeoff. That reasoning still holds and is why the site publishes only the monthly rhythm.

**Partly superseded the same day.** The original decision routed people to a Signal chat for
current details. The owner then decided **no chat link appears on the site at all**, and the
single contact route is email. The live rule is in `PROJECT_CONTEXT.md`; the surviving part
of the rationale is the accuracy argument above, not the Signal mechanism.

---

## Defects resolved

Each of these is fixed and verified. They are recorded because a regression here is likely
to be reintroduced by someone who does not know the history.

| Defect | Fixed in | Regression guard |
| --- | --- | --- |
| `node scripts/fetch-mastodon.ts` failed on Node 20 with `ERR_UNKNOWN_FILE_EXTENSION` | Node 22 contract | `.nvmrc`, `engines.node` |
| `.container` collision - Tailwind's layered `.container` overrode the intended `max-w-7xl` to 96rem at `2xl` | Tailwind 4 migration | Rule declared **outside any cascade layer**. Live rule in `PROJECT_CONTEXT.md`. |
| Content spacing - routes asked for `prose prose-lg` while `@tailwindcss/typography` was not installed, so the compiled stylesheet had zero `prose` rules and preflight's margin reset stood unopposed | Task 002 | Plugin registered with `@plugin` in `global.css` |
| First fix attempt customized `.prose` inside `@layer components` and silently did nothing | Task 002 | Prose theme is unlayered. Live rule in `PROJECT_CONTEXT.md`. |
| React `key={...}` props in `locations.astro` and `MastodonFeed.astro` | Task 001b | - |
| `aria-expanded` type error in `Header.astro` (emitted value was always correct; only the type error and a misleading variable name were wrong) | Task 001b | - |
| Double-encoded UTF-8 in the context files | Task 001 | Constraint 3.13 |

### The cascade-layer lesson

`prose` lives in the **utilities** layer, which begins after `@layer components` ends.
An override written inside `@layer components` loses on **layer order regardless of
specificity** - it compiles without error, ships, and does nothing at all.

This has now been the shape of **two** separate defects in this repository. Treat "my
Tailwind override is being ignored" as a cascade-layer question before a specificity one.
The same fact is why a single unlayered `.prose` block also governs `prose-lg`.

---

## Verification history

### Task 002, verified 2026-07-30

Verified by execution on Node v22.23.2, and **additionally in a real browser** at 375px and
1440px across all six routes, because spacing cannot be signed off from a CSS diff.

Measured rather than asserted: paragraph spacing non-zero on every non-terminal paragraph,
`list-style-type: disc` with sage markers, headings rendering `rgb(168, 85, 59)` rather than
Tailwind's default gray, prose `h2` margins of 66px above and 16.5px below, `.container`
resolving to 1280px at both widths, exactly one `h1` per route, no skipped heading levels,
and 661 `prose` occurrences in `dist/_astro/*.css` where there had previously been zero.

Browser tooling setup for this environment is documented in `docs/ENVIRONMENT.md`.
