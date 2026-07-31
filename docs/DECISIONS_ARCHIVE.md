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

### Task 003, verified 2026-07-31

Brand system, palette, self-hosted fonts. Merged to `main` as `faf489e`. Verified by
execution on Node v22.23.2:

- `npm ci` exits 0, `npm audit` reports 0 vulnerabilities.
- `npm run check` reports 0 errors, 0 warnings, 12 hints (the zod deprecation).
- `npm run build` emits the same six routes; fonts self-hosted (`Copying fonts (2 files)`).
- `npm run check:contrast` passes all sixteen role pairs, with ratios matching the audited
  Direction B figures, and was **proven to fail** - correctly naming the broken pairs - when a
  token was deliberately weakened. A deliberately weakened token dropped two pairs to ~2.8:1.
- No literal palette name (`terracotta`/`sage`/`cream`/`earthy`) or hex value remained in
  `src/`; no `fonts.googleapis.com` / `fonts.gstatic.com` reference remained in `dist/`.
- `.container` and `.prose` remained unlayered; the Task 002 type scale and spacing tokens
  byte-for-byte unchanged (targeted diff).
- Browser-verified at 375px and 1440px across all six routes: `verify.mjs` passed, and the new
  theme's computed colours were confirmed applied (`h2` rendering `rgb(40,88,61)` =
  `--color-brand-ink`). Focus rings confirmed visible (white 2px offset + green 4px ring) via
  computed `box-shadow` on a focused button.

**Font self-hosting implementation detail.** Astro 7.1.6's `fonts` config key sits at the
config **top level**, not under `experimental` - only `experimental_getFontFileURL` carries
that prefix - so it is stable and needed no new dependency. `astro.config.mjs` configures
`fontProviders.google()` for Inter with `display: 'swap'`; the provider fetches the file at
build time and Astro serves it from the site's own origin with a metrics-matched local
fallback. Confirmed in `dist/`: zero matches for the Google Fonts hosts, two self-hosted
`.woff2` files under `dist/_astro/fonts/`. **`@fontsource-variable/inter` was never installed
and is not a dependency of this project** - a plausible-looking claim that a future session
should not repeat.

### Task 004, verified 2026-07-31

Accessibility and shell correctness. Merged to `main` as `15dd164`. Verified by execution on
Node v22.23.2:

- `npm run check` reports 0 errors, 0 warnings, 12 hints (unchanged).
- `npm run verify` exits 0. `check:contrast` now runs inside it, in the **uncached** half -
  confirmed to re-run after touching only `global.css` even on a dependency-cache hit. All
  sixteen role pairs still pass; no colour moved.
- `npm run build` emits the same six routes.
- `grep -rn 'role="menubar"\|role="menuitem"\|role="none"' src/` returns nothing. The
  application-menu pattern is gone from both navigation lists, and the
  `aria-label="Main navigation"` that mis-named the `<header>` landmark is removed. The mobile
  menu is a labelled `<nav>`, not a labelled `<ul>` with an inert label.
- `grep -rn 'href="#"' src/` returns nothing. The footer email link points at
  `mailto:info@GROUP_DOMAIN` (token, deliberately unfilled); the Mastodon link is removed
  entirely rather than pointed at a guessed instance.
- The footer's three redundant `aria-label`s (`"Mastodon"` against "Follow us on Mastodon",
  `"Email"` against "Email us", `"Volunteer"` against "Volunteer") are deleted rather than
  lengthened, closing the WCAG 2.5.3 failure; decorative emoji wrapped `aria-hidden`.
- A single `:focus-visible` rule (`a, button, [tabindex]`, using `--color-focus`) supplies the
  project focus indicator. `.btn-primary` / `.btn-secondary` keep their own rings, which win on
  specificity, so nothing double-rings.
- The mobile menu keyboard contract is complete: Escape closes from a link inside or from the
  toggle and returns focus to the toggle; tabbing past the last link closes without stranding
  focus; all four close paths share one `closeMenu()`. **No focus trap was added.** The
  pre-existing, already-correct `isHidden` `aria-expanded` inversion was left untouched.
- The `prefers-reduced-motion: reduce` block is **preventive hygiene** - the project animates
  only colour and shadow, so it closed no observed defect and was reported as such.
- Type scale, spacing tokens, and the unlayered `.container` / `.prose` byte-for-byte
  unchanged (targeted diff).
- Browser-verified: `verify.mjs` tabs every focusable element on all six routes at 375px and
  1440px asserting a visible `outline`/`box-shadow` from computed style, and drives the full
  mobile-menu keyboard contract including an explicit no-trap assertion.

**Durable lesson.** The task spec claimed the Playwright harness already had "focus-visible
traversal groundwork". It had none. The claim was inherited from an earlier document rather
than checked. Constraint 3.4 ("observed state beats planned state") governs this project's
notes about itself, not only the repository. Correction logged in `docs/ENVIRONMENT.md`.
