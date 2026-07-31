# TASK SPECIFICATION

## Task 004 : Accessibility and shell correctness

### Role

`IMPLEMENTER`

### Status

**COMPLETE.** Promoted 2026-07-31, implemented and verified the same day. **Implemented in
the working tree; not yet committed to `main`.** All eleven acceptance criteria below passed
by execution, including the browser-driven keyboard and focus-visible checks. The full
verification record is the dated decision in `PROJECT_CONTEXT.md` section 4, which is now
the authoritative summary - this file's body below is retained as the historical scope and
acceptance record, not as live authorization for further work.

**This file is not yet re-promoted.** The next task to occupy it is Task 004b (site config
and the fork-and-adopt surface), per `ROADMAP.md`. Promoting it is an `ARCHITECT` action, not
performed in this session; nothing below authorizes starting Task 004b or Task 005 against
this document.

Task 003 is complete and merged to `main` as `faf489e`; its dated decisions are in
`PROJECT_CONTEXT.md` section 4 and its roadmap entry is a status line. Task 004c (`LICENSE`)
is also complete and merged, as `bcef6db`.

### Goal

Make the site shell correct for keyboard and screen reader users: remove the
application-menu ARIA pattern from `Header.astro`, complete the mobile menu's keyboard
contract, give every interactive element a visible project-defined focus indicator, resolve
the two dead footer links, and honour `prefers-reduced-motion`.

This task does **not** rewrite page copy (Task 005), does **not** touch the colour tokens or
the type scale (Task 003, complete), and does **not** replace the emoji logo (Task 007), even
though it edits the same components.

---

## Why this is not a cosmetic task

Constraint 3.7 makes WCAG 2.2 AA a release requirement and specifically forbids
application-menu ARIA patterns for ordinary site navigation. Four defects here are
**Level A or AA failures**, measured against the current `main`, not predicted:

| Defect | Where | Criterion |
| --- | --- | --- |
| `role="menubar"` / `role="menuitem"` on site nav | `Header.astro`, both nav lists | 4.1.2 Name, Role, Value |
| `aria-label` shorter than the visible link text | `Footer.astro`, two links | 2.5.3 Label in Name (A) |
| No project focus indicator on links | `global.css` base `a` rule | 2.4.11 Focus Appearance / 1.4.11 |
| Two `href="#"` dead links | `Footer.astro` | Trust, not a WCAG failure |

The `menubar` pattern is the load-bearing one. It tells a screen reader that the header is
an application menu, which changes the interaction contract: users are told to expect arrow
key navigation, a roving tabindex, and Home/End support, none of which exist here. A `nav`
containing a list of links is both correct and what users expect on a website.

---

## Verified starting conditions

Confirmed by reading the repository on 2026-07-31. If any has changed, stop and report the
mismatch rather than adapting silently.

- `Header.astro` carries `role="menubar"` on **two** `ul` elements (desktop and mobile),
  `role="none"` on **ten** `li` elements, and `role="menuitem"` on **ten** `a` elements.
- `<header>` also carries `role="banner"` **and** `aria-label="Main navigation"`. The role is
  redundant on `<header>` but harmless; the label is wrong - it names the banner landmark
  after the navigation it contains, so a landmark list shows a banner called "Main
  navigation". The inner `<nav>` is already correctly labelled "Primary navigation".
- **The mobile toggle's `aria-expanded` logic is already correct and the variable is already
  renamed to `isHidden`, with a comment explaining the inversion.** An earlier roadmap entry
  asked for that rename; it landed before this promotion. **Do not "fix" the logic and do not
  redo the rename.** What is genuinely missing is Escape-to-close, focus return, and
  close-on-focus-leaving.
- `BaseLayout.astro` **already has a working skip link** to `#main-content`, styled with
  `sr-only focus:not-sr-only`. Do not add a second one.
- `global.css` has **no `outline: none` reset**, so browser default focus rings currently
  survive. It also has **no `:focus-visible` rule of its own**: `.btn-primary` and
  `.btn-secondary` define `focus:ring-*`, and the mobile toggle defines its own, but the base
  `a` rule at line 171 styles hover only. Link focus therefore depends entirely on the UA
  default against the new Direction B surfaces.
- `--color-focus` already exists as a semantic role and `npm run check:contrast` already
  validates two focus-ring pairs at the 3.0:1 threshold. Use the role; do not introduce a new
  colour.
- **There is no `prefers-reduced-motion` block anywhere in `src/`.** All 21 motion utilities
  are `transition-colors` / `transition-shadow` at `duration-200`, in `Header.astro`,
  `Footer.astro` and `global.css`. **There is no transform, translate, or keyframe animation
  in the project.** State that honestly: this change is preventive hygiene, not the removal
  of a vestibular trigger. Do not describe it as fixing a motion defect.
- Task 002 verified in a browser at two widths that every route has exactly one `h1` and no
  route skips a heading level. **Heading order is settled. Do not re-derive it.** Re-check
  only if this task adds new headings, which it should not.
- Task 001b already removed the React-style `key={...}` props from `locations.astro` and
  `MastodonFeed.astro`. **Do not look for them again.**

---

## Allowed scope

- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/styles/global.css` - **focus-visible and reduced-motion only.** The colour tokens, the
  type scale, the spacing rhythm, and the unlayered `.container` / `.prose` blocks are
  untouchable.
- `scripts/verify-baseline.sh` - **to add the contrast check only** (see required change 6)

**Explicitly out of scope**, despite touching the same files:

- Page copy, the MDX documents, `src/data/locations.json`. **All Task 005.**
- Any colour token value, any type-scale or spacing token. **Task 003, complete.**
- The emoji logo in `Header.astro` and the missing `favicon.svg` / OG image. **Task 007.**
- Supplying a Mastodon URL. The handle is still an open owner input; see change 4.
- The zod deprecation and CI. **Task 009.**

---

## Required changes

### 1. Remove the application-menu pattern from `Header.astro`

Delete every `role="menubar"`, `role="none"` and `role="menuitem"` from both the desktop and
the mobile navigation lists. A `<nav>` wrapping a `<ul>` of `<a>` elements needs no ARIA at
all - the implicit semantics are already correct, and adding roles back is a regression.

Remove `aria-label="Main navigation"` from the `<header>` element. Keep `role="banner"`;
it is redundant but not incorrect, and removing it is a separate judgement call not worth
bundling here.

The mobile list carries `aria-label="Mobile navigation"`. Once `role="menubar"` is gone that
label sits on a plain `ul`, where it is inert. Move the labelling to a `<nav>` element
wrapping the mobile menu, or drop it - **do not leave a label on an element that cannot
carry one.**

### 2. Complete the mobile menu keyboard contract

The toggle currently opens and closes on click and closes when a link is activated. Three
behaviours are missing:

- **Escape closes the menu** while focus is anywhere inside it, or on the toggle.
- **Focus returns to the toggle** when the menu closes via Escape. Do not move focus on the
  link-click close path - the browser is navigating away.
- **The menu closes when focus leaves it**, so a user tabbing past the last link does not
  leave an open menu behind them with focus somewhere unrelated.

All three close paths must keep `aria-expanded`, the `hidden` class, and the two icon states
in sync. Factor the close behaviour into one function rather than repeating the four-line
reset at each call site; it is currently duplicated once already and this task would make it
four copies.

**Do not add a focus trap.** This is a disclosure menu, not a modal dialog. Trapping focus in
site navigation is itself an accessibility defect, and criterion 1 below tests for exactly
that.

### 3. Define a project focus indicator

Add a `:focus-visible` rule so every interactive element - links, buttons, the skip link, the
mobile toggle - shows a visible indicator against every surface the site uses. Use
`--color-focus`, which is already validated by `npm run check:contrast`.

Prefer one rule that covers `a`, `button`, and `[tabindex]` over per-component styles, so a
future component inherits the indicator instead of forgetting it. Use `:focus-visible`, not
`:focus`, so pointer users do not get a ring on click.

Keep the existing `.btn-primary` / `.btn-secondary` rings if they already satisfy the
indicator; do not end up with two competing rings on one element.

### 4. Resolve the two dead footer links

Owner decision, 2026-07-31:

- **The email link gets its real destination:** `mailto:info@GROUP_DOMAIN`. This is a
  sanctioned owner-fill token under section 4 of `PROJECT_CONTEXT.md`. **Do not substitute a
  plausible domain.** `GROUP_DOMAIN` stays literal until the domain is purchased, and Task
  009's pre-publication check fails the build while it remains.
- **The Mastodon link is removed entirely**, markup and all. The handle is still an open owner
  input, and `PROJECT_CONTEXT.md` is explicit that a dead social link must be removed rather
  than left dangling. **Task 006 or 007 re-adds it with `rel="me"` once the handle exists.**
  Do not leave a commented-out placeholder and do not invent an instance URL.

### 5. Fix Label in Name in `Footer.astro`

Both remaining social links violate WCAG 2.5.3: `aria-label="Mastodon"` against visible text
"Follow us on Mastodon", and `aria-label="Email"` against "Email us". The accessible name must
**contain** the visible label text, and neither does. Speech-input users saying the words they
can see will fail to activate the link.

The visible text is already descriptive, so the correct fix is to **delete the redundant
`aria-label` attributes**, not to lengthen them. The `aria-label="Volunteer"` on the third link
matches its visible text and is merely redundant; removing it is consistent and safe.

Wrap the decorative emoji (`🐘`, `📧`, `🤝`) in `aria-hidden="true"` spans or remove them, so
a screen reader does not announce "elephant" as part of a link name. The header's `🍲` is
**out of scope** - Task 007 replaces it with a real wordmark.

### 6. Honour `prefers-reduced-motion`

Add a `@media (prefers-reduced-motion: reduce)` block to `global.css` that neutralizes
transition and animation duration site-wide. Because the project currently animates only
colour and shadow, this is preventive: it guarantees the next component that adds a transform
is covered by default. **Report it as such.** Do not claim it fixed an observed motion
problem.

### 7. Wire the contrast check into `npm run verify`

`scripts/check-contrast.mjs` shipped in Task 003 but `scripts/verify-baseline.sh` was outside
that task's scope, so the guard is currently a manual step. Add `npm run check:contrast` to
the **uncached** half of the baseline, alongside `astro check` and `astro build`.

The cache key is `package-lock.json` + `package.json` + the Node version, and the script's
result depends on `src/styles/global.css`, which is source. Putting it in the cached
dependency half would let a palette regression pass a stale stamp. Read the comment at the
top of the script before editing it.

---

## Acceptance criteria

Every criterion is executed, not inspected. Constraint 3.10 forbids reporting success from a
diff.

1. `npm run verify` exits 0, and its output shows `check:contrast` running as part of the
   uncached half. Confirm it re-runs after touching only `global.css`.
2. `npm run check` reports **0 errors** (12 zod hints remain expected).
3. `npm run build` emits the same **six** routes.
4. `grep -rn 'role="menubar"\|role="menuitem"\|role="none"' src/` returns **nothing**. Paste
   the result.
5. `grep -rn 'href="#"' src/` returns **nothing**. Paste the result.
6. `grep -rn 'GROUP_DOMAIN' src/` shows the footer `mailto:` and no plausible-domain
   substitute anywhere.
7. **Keyboard-only traversal of every route completes without a trap**, including opening the
   mobile menu, tabbing through it, closing it with Escape, and confirming focus lands back
   on the toggle. Tabbing past the last item closes the menu rather than stranding focus.
8. **A visible focus indicator appears on every interactive element** on every route, at both
   widths, against every surface. Confirm by computed style, not by eye alone - the Task 003
   precedent is reading `box-shadow` / `outline` off the focused element.
9. No invalid or redundant-and-misleading ARIA in the built HTML.
10. `npm run check:contrast` still exits 0 with all sixteen pairs passing. This task must not
    move a colour.
11. The Task 002 type scale, the spacing tokens, and the **unlayered** `.container` and
    `.prose` blocks are byte-for-byte unchanged. Confirm by targeted diff.

### How to run criteria 7 and 8

The Playwright and Chromium setup is **already installed, persistent, and outside the
repository**. Do not rebuild it in a scratch directory and **do not add a browser to
`package.json`**. See `docs/ENVIRONMENT.md`; in short, build and preview, then run
`verify.mjs` from `~/.local/share/playwright-runner`.

That harness already covers heading order, the measure, and `.container` resolution at both
widths, plus focus-visible traversal groundwork. Extend it for the Escape and focus-return
assertions if it does not already reach them.

---

## Reviewer focus

- Whether any ARIA was **added back** in the process of removing the menubar pattern. The
  correct end state for site navigation is no ARIA at all.
- Whether the mobile menu grew a focus trap. It must not.
- Whether the toggle's already-correct `aria-expanded` logic was "fixed" into a bug.
- Whether the four close paths share one function or duplicate the reset.
- Whether `mailto:info@GROUP_DOMAIN` survived intact, or a plausible domain was substituted.
- Whether the Mastodon link was removed rather than pointed at a guessed instance.
- Whether `check:contrast` landed in the uncached half of `verify-baseline.sh`.
- Whether any colour, type-scale or spacing token moved. None should have.

---

## Out of scope / queued work

**Task 005 follows this task.** It is Track B and is now blocked on **only** the organization
name in `PROJECT_CONTEXT.md` section 4.

Two owner inputs landed on 2026-07-31, after this task was promoted: **the geographic scope is
Tucson, Arizona** and the `CITY` token is retired, and **the garden is settled in full** - a
rented plot at Presidio Garden, operated by Community Gardens of Tucson. The garden decision
changes the `locations.json` **schema**, not just its values. Both are recorded in
`PROJECT_CONTEXT.md` section 4, with the consequences on the Task 005 entry in `ROADMAP.md`.

**Nothing about either is in scope here.** This task does not touch `locations.json`,
`locations.astro`, or any MDX document. If you find yourself writing the word "Tucson", you
have left the task.
