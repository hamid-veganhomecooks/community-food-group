# TASK SPECIFICATION

## Task 003 : Brand system, palette, and self-hosted fonts

### Role

`IMPLEMENTER`

### Status

**ACTIVE.** Specified 2026-07-30. Task 002 is complete and merged; see its completion record
in git history and the dated decisions in `PROJECT_CONTEXT.md`.

### Goal

Replace the scaffold palette with a **two-layer semantic token system**, implement the
owner-chosen **Direction B (Garden)**, commit a **contrast validation script**, and **remove
the Google Fonts CDN dependency** by self-hosting the typeface.

This task does **not** rewrite page copy (Task 005) and does **not** fix the ARIA roles or
the mobile menu behaviour (Task 004), even though it edits the same two components.

---

## Why this is not a cosmetic task

The current palette **fails WCAG 2.2 AA on nine measured pairs**. This was measured, not
estimated, on 2026-07-30 against every foreground/background pair actually used in the
templates:

| Pair, as used today | Measured | Needs |
| --- | --- | --- |
| CTA lede `cream/90` on sage | 2.50:1 | 4.5 |
| Hero lede `cream/90` on terracotta | 3.04:1 | 4.5 |
| `btn-secondary`, white on sage | 3.09:1 | 4.5 |
| Link `text-terracotta` on cream | 3.39:1 | 4.5 |
| Footer `gray-500` on `gray-900` | 3.67:1 | 4.5 |
| `btn-primary`, white on terracotta | 3.84:1 | 4.5 |
| Link `text-terracotta` on white card | 3.84:1 | 4.5 |
| Hero lede on gradient end | 4.05:1 | 4.5 |
| Feature chip, `sage-dark` on `sage-light/20` | 4.16:1 | 4.5 |

`text-terracotta` is the **most-used colour class in the codebase**, 23 occurrences. Constraint
3.7 lists WCAG 2.2 AA as a release requirement, so the palette currently contradicts a stated
project constraint.

Note for the record: the `gray-200` divider measures 1.24:1 but is **not** counted as a
failure. WCAG 1.4.11 governs boundaries required to identify a control; a decorative rule is
exempt. Do not "fix" it.

---

## Verified starting conditions

Confirm before starting. If any has changed, stop and report the mismatch.

- Astro 7.1.6, Tailwind 4.3.3, `@tailwindcss/typography` 0.5.20. **There is no
  `tailwind.config.mjs`**; Tailwind 4 is configured in CSS.
- `npm run check` reports 0 errors, 0 warnings, 12 expected zod hints.
- `npm audit` reports 0 vulnerabilities.
- `.container` **and** `.prose` are declared **outside any cascade layer** in
  `src/styles/global.css`. Moving either into a layer reintroduces a fixed bug. The
  typography plugin registers `prose` in the **utilities** layer, which is why a
  components-layer override silently does nothing.
- The type scale, spacing rhythm and measure tokens added in Task 002 live in the same
  `@theme` block as the colours. **Do not modify them.** This task changes colour only.

---

## Allowed scope

- `package.json`, `package-lock.json`
- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`
- `src/components/Header.astro` - **colour classes and font loading only**
- `src/components/Footer.astro` - **colour classes only**
- `src/components/MastodonFeed.astro` - **colour classes only**
- `src/pages/index.astro`, `about.astro`, `join.astro`, `donate.astro`, `locations.astro`,
  `posts.astro` - **colour classes only**
- `scripts/check-contrast.mjs` - **new file**
- `README.md` - palette and rebranding documentation

**Explicitly out of scope**, despite touching the same files:

- `role="menubar"` / `role="menuitem"` in `Header.astro`, the mobile toggle behaviour, and
  the two `href="#"` dead links in `Footer.astro`. **All of that is Task 004.** Change only
  colour-bearing classes in those two components.
- Page copy, the MDX documents, `src/data/locations.json`.
- The type scale and spacing tokens from Task 002.

---

## Required changes

### 1. Two-layer token architecture

The templates currently name colours literally (`text-terracotta`, `bg-sage`, `bg-cream`)
about 119 times across 10 files. Replace this with two layers.

**Layer 1 - brand inputs.** A single clearly commented block at the top of the `@theme`
declaration. This is the **only** block a reusing group edits. Fourteen values in two groups:
six brand/accent values that a rebrand actually changes, and eight neutrals that most groups
will leave alone.

**Layer 2 - semantic roles.** Every role references an input. Templates consume **only**
these:

| Role | Direction B value |
| --- | --- |
| `--color-surface` | `#f7f5ef` |
| `--color-surface-raised` | `#ffffff` |
| `--color-surface-sunken` | `#ece9df` |
| `--color-surface-inverse` | `#1c241e` |
| `--color-ink` | `#1c241e` |
| `--color-ink-muted` | `#4d564f` |
| `--color-ink-inverse` | `#f2f5f0` |
| `--color-ink-inverse-muted` | `#bcc7bd` |
| `--color-brand` | `#2c6244` |
| `--color-brand-hover` | `#224e35` |
| `--color-brand-ink` | `#28583d` |
| `--color-accent` | `#a8481f` |
| `--color-accent-ink` | `#8f3d1a` |
| `--color-accent-soft` | `#f3e2d6` |
| `--color-border` | `#ddd8ca` |
| `--color-focus` | `#2c6244` |

**The load-bearing distinction:** `--color-brand` is for **fills**, `--color-brand-ink` is
for **text on a light surface**. A brand colour that works as a fill usually fails as text.
Collapsing these two roles is exactly how the current palette came to fail. Keep them
separate even when their values are close.

Delete the `terracotta`, `sage`, `cream` and `earthy-*` tokens. No literal colour name may
survive in any component.

### 2. Direction B (Garden) - the chosen palette

Owner decision, 2026-07-30. Green leads, clay supports. All sixteen role pairs were validated
against AA **before** presentation. Representative measured ratios:

- Link `brand-ink` on surface - **7.54:1**
- Button `ink-inverse` on brand fill - **6.50:1**
- Chip `accent-ink` on `accent-soft` - **5.85:1**
- Body `ink` on surface - **14.59:1**
- Focus ring against surface - **6.56:1**

### 3. Contrast validation script

Create `scripts/check-contrast.mjs`, wired as `npm run check:contrast`.

- **Plain Node, zero dependencies.** Constraint 3.6 is therefore not triggered.
- It must **parse the token values out of `src/styles/global.css`**, not hardcode a second
  copy of them. A script carrying its own duplicate list will silently drift from what ships,
  which defeats the purpose.
- It must compute WCAG 2.2 relative luminance correctly: sRGB gamma expansion, then
  `0.2126R + 0.7152G + 0.0722B`. Handle alpha compositing on the sRGB values if any
  translucent pair remains.
- It must check **every** role pair listed in the acceptance table below and **exit non-zero**
  if any drops below its threshold: 4.5:1 for body text, 3.0:1 for large text and UI
  boundaries.
- Output must name each pair and print the measured ratio, so a failure is actionable.

### 4. Self-hosted fonts

Remove the Google Fonts CDN from `BaseLayout.astro`: the stylesheet link and both
`preconnect` hints. It render-blocks and sends visitor IP addresses to a third party, which a
mutual aid site has good reason to avoid.

**Verify before choosing the mechanism** - do not assume:

1. Check whether Astro 7.1.6 ships a **stable** built-in Fonts API. If it does, prefer it;
   it needs no new dependency.
2. If it is still experimental or absent, use `@fontsource-variable/inter`, authorized as a
   dependency in `PROJECT_CONTEXT.md` on 2026-07-30.

Keep **Inter** as the single family. Pairing a display face is a separate design decision and
is deliberately **not** part of this task.

Ensure `font-display: swap` and that no network request to `fonts.googleapis.com` or
`fonts.gstatic.com` remains in the built output.

### 5. Documentation

Add a **Rebranding this site** section to `README.md` covering: which block to edit, what
each semantic role is for, why `brand` and `brand-ink` are separate, and how to run
`npm run check:contrast`. Explain the roles, not just the values - a group that understands
what `brand-ink` is for will not collapse it.

---

## Acceptance criteria

1. `npm ci` succeeds; `npm run check` reports **0 errors**.
2. `npm audit` reports **0 vulnerabilities**.
3. `npm run build` emits the same **six** routes.
4. `npm run check:contrast` **exits 0**, and prints a measured ratio for every role pair.
5. **The guard is proven to work:** temporarily set one token to a failing value, confirm
   `npm run check:contrast` exits **non-zero** and names that pair, then restore. Report the
   actual failing output. A validator that has never been seen to fail is not yet a validator.
6. No literal palette name (`terracotta`, `sage`, `cream`, `earthy`) remains anywhere in
   `src/`. Verify by grep and paste the result.
7. No hex colour value appears in any component or page file; all colour comes from roles.
8. No request to `fonts.googleapis.com` or `fonts.gstatic.com` in `dist/`. Verify by grep.
9. `.container` and `.prose` remain **outside any cascade layer**, and the Task 002 type
   scale and spacing tokens are unchanged.
10. Reviewed in a browser at a mobile and a desktop width across all six routes. Focus rings
    must be visible on every interactive element against the new surfaces.

### How to run criterion 10

No browser is installed and there is **no sudo**. Task 002 established the working pattern:
install Playwright and Chromium **outside the repository**, in a scratch directory, and
extract the missing `libasound2` locally with `apt-get download` plus `dpkg -x`, setting
`LD_LIBRARY_PATH`. **Do not add a browser to `package.json`.**

---

## Reviewer focus

- Whether any component still carries a literal colour or a raw hex.
- Whether `brand` and `brand-ink` stayed separate roles.
- Whether the contrast script reads the real tokens or a drifting duplicate.
- Whether Task 004's concerns leaked into `Header.astro` or `Footer.astro`.
- Whether the Task 002 type scale survived untouched.

---

## Out of scope / queued work

**Task 004 must follow this task, not run in parallel.** Both edit `Header.astro` and
`Footer.astro`; the earlier roadmap note suggesting they could run concurrently was wrong and
has been corrected.

Then Tasks 005 to 007 once the owner inputs in `PROJECT_CONTEXT.md` section 4 land. The
Signal invite link remains the one blocker that no placeholder token may substitute for.
