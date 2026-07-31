# AI COLLABORATION PROTOCOL & PROJECT CONTEXT

## 1. OPERATIONAL ROLE & SESSION CONTEXT

You are participating in a modular, multi-session software-development workflow.

- Every session is isolated and stateless.
- Treat this file as the project-level single source of truth.
- Treat `TASK_SPEC.md` as the single source of truth for the active task.
- Treat `ROADMAP.md` as the ordered backlog. It is planning material, not authorization to change code.
- Do not rely on conversational memory, inferred files, or an earlier task embedded in a prompt.
- Before changing code, compare the task's relevant-file list with the repository. If they disagree, stop and report the mismatch.
- The session role will be one of `ARCHITECT`, `IMPLEMENTER`, `REVIEWER`, or `DEBUGGER`.

### Files you do not need to read

Two files exist so this one can stay small. **Do not load them by default.**

- `docs/DECISIONS_ARCHIVE.md` - superseded decisions, resolved defects, and the rationale
  behind rules that are already stated here. Read it only when a rule here looks arbitrary
  or you are about to propose reversing one. Never treat it as current authorization.
- `docs/ENVIRONMENT.md` - workstation setup: Node selection, the cached baseline
  verification, and the persistent Playwright/Chromium install. Read it only when a task
  needs a browser or the baseline behaves unexpectedly.

---

## 2. CORE SYSTEM & TECH STACK

- **Project:** Community Food Group public information site
- **Repository:** `hamid-veganhomecooks/community-food-group`
- **Framework / language:** Astro 7, TypeScript, Astro components, MDX
- **Rendering:** Static output only; no application server or database
- **Hosting target:** Cloudflare Pages, output directory `dist/`
- **Content:** Astro content collection for editorial MDX pages
- **Structured data:** JSON for distribution/meetup sites and the generated Mastodon cache
- **Styling / UI:** Tailwind CSS 4 through `@tailwindcss/vite`, with `@tailwindcss/typography` supplying `prose` for the editorial routes; `lucide-astro` icons. Configured in CSS via an `@theme` block in `src/styles/global.css`, which holds the palette, the type scale, the spacing rhythm and the measure. There is no `tailwind.config.mjs`.
- **External data:** Optional Mastodon account feed fetched by a Node build-time utility
- **Architecture:** Static-first Jamstack. JavaScript is used only where interaction requires it, currently the mobile navigation toggle.
- **Package manager:** npm with a committed `package-lock.json`
- **Node contract:** Node 22 LTS (>= 22.18), pinned in `.nvmrc` at 22.23.2. Required so
  `node scripts/fetch-mastodon.ts` runs through native erasable-TypeScript stripping without
  a runner dependency. Cloudflare Pages must set `NODE_VERSION` to match.

### Dependencies

Ranges are in `package.json`; run `npm ls` for installed versions rather than trusting a
table here. As of 2026-07-30, installed versions match the ranges exactly and `npm audit`
reports **0 vulnerabilities**.

`@astrojs/tailwind` has been **removed and must not be reintroduced**: its latest release
(6.0.2) peer-depends on `astro: ^3 || ^4 || ^5` and is incompatible with Astro 7.

### Organizational model

The site represents a local mutual aid affinity group. The group's core activity is
gathering to **cook food together and then distribute it directly to people in town**,
including at street locations such as bus stops. The group also intends to expand into
**cooking classes focused on cheap, healthy meals**, **cultural events**, and other
activities typical of a local affinity group.

This model matters for content architecture:

- The group is **not** a food bank, a farm-surplus redistributor, or a pantry network.
- The group has **no storefronts, staffed sites, or per-location phone numbers**.
- Activity is organized around a **recurring rhythm** (cook, then distribute), not around
  building hours.
- Programs beyond food distribution are **planned or emerging**, and must not be described
  as established until the owner confirms they have happened.

Any scaffold content describing farm pickups, multiple staffed locations, membership tiers,
or donation-efficiency statistics is off-model and must be replaced, not merely renamed.

Important distinction: this is a separate Astro project. It is not the Hugo-based
`veganhomecooks` site and must not inherit that repository's Hugo theme, recipes, Worker,
R2, or deployment assumptions.

---

## 3. NON-NEGOTIABLE DEVELOPMENT CONSTRAINTS

1. **Zero invented facts in production output:** Never invent addresses, phone numbers, email addresses, social accounts, donation claims, operating statistics, dates, or organizational history. Unknown public content must be omitted, clearly modeled as draft data, or supplied by the project owner. **Owner-fill placeholder tokens are the one permitted exception**, under the strict conditions in section 4. The distinction is deliberate: a visible `GROUP NAME` token is honest absence, while a plausible invented name is dishonest presence. Only the former is ever acceptable, and never in a deployed build.
2. **No incomplete code:** Never output `TODO`, ellipses, truncated functions, fake links, or copy-paste-incomplete blocks unless the task explicitly requests a sketch.
3. **Strict scope compliance:** Only change files listed in `TASK_SPEC.md`. Do not refactor adjacent code unless the task identifies it as required.
4. **Observed state beats planned state:** Never claim a file, dependency, build hook, component, route, deployment, or test exists until verified in the repository.
5. **Type safety:** Keep Astro's strict TypeScript configuration. Avoid `any`; validate external API data before using it.
6. **Minimal dependencies:** Prefer the platform, Astro, and existing packages. A new package requires an explicit architectural decision in this file and authorization in `TASK_SPEC.md`.
7. **Accessibility:** Target WCAG 2.2 AA. Use semantic website navigation, keyboard-operable controls, visible focus styles, meaningful alternative text, and reduced-motion-safe behavior. Do not use application-menu ARIA patterns for ordinary site navigation.
8. **External HTML is untrusted:** Mastodon status HTML must never be rendered with `set:html` unless it is sanitized by an explicitly approved strategy. Escaped plain text is safer than unsanitized HTML, but escaping raw HTML into a text node is a rendering defect in its own right; see the open Mastodon defect in section 4.
9. **No browser-side Mastodon API calls:** Mastodon data is retrieved before rendering and stored in `src/data/mastodon-posts.json`.
10. **Deterministic verification:** Every implementation task must run the checks named in its acceptance criteria. Do not report success from inspection alone. `npm run verify` runs them; it caches only the lockfile-dependent half. See `docs/ENVIRONMENT.md`.
11. **Static boundary:** Do not add a Cloudflare Worker, database, form handler, authentication, or other server runtime without a new architectural decision.
12. **No secrets in Git:** Environment-specific values belong in local or Cloudflare environment settings. Commit only documented examples.
13. **Files stay UTF-8 clean:** Do not reintroduce double-encoded characters. Prefer ASCII punctuation in Markdown; if a box-drawing or typographic character is used, verify the committed bytes.

---

## 4. CURRENT ARCHITECTURAL DECISIONS & MEMORY STATE

Entries are the rules in force. Rationale that is no longer needed to do the work has moved
to `docs/DECISIONS_ARCHIVE.md`.

### Product and content

- Editorial pages are MDX; site records are structured JSON.
- Mastodon ingestion is build-side only. The cache is `src/data/mastodon-posts.json`.
- No Worker, database, account system, or client-side Mastodon fetch is part of the MVP.
- Accessibility is a release requirement, not a later enhancement.
- **`/locations` is a distribution-and-meetup page.** It presents where the group cooks and
  where it hands out food, with day/time and an optional map destination. Per-site phone
  numbers and per-site email addresses are removed from the data model, because they do not
  exist.
- **`/donate` is a "Ways to Help" page.** It presents concrete material and time needs
  rather than a donation-platform flow. The invented "90% of all donations" transparency
  claim is withdrawn and must not reappear in any form.
- **Distribution cadence is monthly; precise scheduling happens off-site.** The site states
  the monthly rhythm and directs people to get in touch to join a Signal chat. Present the
  chat as the way to get current details, never as a gate or a screening step.
- **Cooking classes get a real section now**, written as forming or upcoming, never as an
  established program with a history. Cultural events and other activities are deferred
  until they are real.
- **Heading case:** Title Case for `h1` and `h2`; sentence case for `h3` and below, UI
  labels, buttons and links. Headings inside the MDX documents still mix both and are
  corrected in Task 005, which rewrites that copy anyway.
- **Owner-fill placeholder tokens are permitted in content, under conditions.** Content work
  may use literal uppercase tokens such as `GROUP NAME`, `CITY`, and `CONTACT`. All
  conditions are mandatory:
  - Tokens are `SCREAMING_CASE` or spaced uppercase so they are unmistakably unfilled to any
    reader, including a non-technical one reviewing a preview.
  - Every token is greppable by a single documented pattern, and the pre-publication check
    in Task 009 fails the build while any remain.
  - Tokens stand in only for **identifiers the owner will supply**: name, city, contact
    handles. Never for a claim that may turn out to be false - a statistic, a founding date,
    a program that may not exist, or a schedule.
  - No deployed build may contain one. This unblocks drafting; it does not unblock
    publishing.

### Styling and design system

- **Tailwind is configured in CSS.** The theme lives in an `@theme` block in
  `src/styles/global.css`. Do not recreate `tailwind.config.mjs`; Tailwind 4 does not read
  one by default.
- **Cascade layers before specificity.** `@tailwindcss/typography` emits `prose` inside
  `@layer utilities`, which begins after `@layer components` ends, so a `.prose` override
  written inside `@layer components` loses on **layer order regardless of specificity** - it
  compiles without error, ships, and does nothing. The project's `.prose` theme and its
  custom `.container` are therefore **unlayered**. Preserve that; moving either into a layer
  silently reintroduces a shipped bug. This has been the shape of two separate defects here:
  treat "my Tailwind override is being ignored" as a layer question first.
- **Palette Direction B ("Garden") is chosen.** Owner decision. Green leads, clay supports.
  All sixteen role pairs validated against AA before selection. Values are in `TASK_SPEC.md`.
  The terracotta/sage/cream direction is retired and its tokens are to be **deleted, not
  renamed**.
- **Colour is a two-layer token system.** Layer 1 is a **brand-inputs block**, the only block
  a reusing group edits. Layer 2 is **semantic roles** (`--color-surface`, `--color-ink`,
  `--color-brand`, `--color-brand-ink`, ...), the only thing templates consume.
  **`--color-brand` (fills) and `--color-brand-ink` (text on light) must stay separate
  roles.**
- **A contrast validation script is authorized and required**, as `npm run check:contrast`,
  in plain Node with **zero dependencies**. It must parse the tokens out of
  `src/styles/global.css` rather than carry a duplicate list, or it will silently drift from
  what ships.
- **The type scale is semantic and fluid.** Steps are named for role, not size:
  `--text-display`, `--text-title`, `--text-heading`, `--text-subheading`, `--text-lead`,
  `--text-body`, `--text-label`. Each is a `clamp()`, so one class replaces a breakpoint
  chain and `text-title` supersedes `text-4xl md:text-5xl lg:text-6xl`. A template that
  needs `md:text-*` on a heading is evidence the scale is wrong, not that the page is
  special. Line height and letter spacing travel with each step; **font weight deliberately
  does not**.
- **The measure is `--container-measure`, 39rem**, about 69 characters at the `prose-lg`
  size, measured in a browser at 1440px. `.prose-card` sizes itself to
  `measure + 2 * gutter`, so reading width stays constant however the padding scales.
- **Section rhythm is three mutually exclusive steps:** `.section-lg`, `.section`,
  `.section-tight`, so consecutive bands can differ rather than stacking identically.
- **Fonts are self-hosted; the Google Fonts CDN is removed.**
  **`@fontsource-variable/inter` is authorized as a dependency**, satisfying constraint 3.6
  for that package only - but first check whether Astro 7.1.6 ships a **stable** built-in
  Fonts API and prefer that, since it needs no dependency at all. Inter stays as the single
  family; pairing a display face is a separate decision and is not part of Task 003.

### Verified repository state on 2026-07-30

**Tasks 001, 001b, 001c and 002 are complete** and merged to `main` (`8ad91ad`), verified by
execution on Node v22.23.2 and, for Task 002, in a real browser at 375px and 1440px across
all six routes. Measurements are in `docs/DECISIONS_ARCHIVE.md`.

Green baseline, reproducible with `npm run verify`: `npm ci` exits 0; `npm run check`
reports **0 errors, 0 warnings** and 12 hints (all the zod deprecation below);
`npm run build` emits the same six routes; `npm audit` reports **0 vulnerabilities**.

### Open defects

- **`MastodonFeed` prints raw markup. Confirmed empirically on 2026-07-30**, not merely
  predicted: seeding the cache with one post containing `<p>` tags and building produced
  `...not erased&lt;/p&gt;` in `dist/index.html`. Visitors would see literal `</p>` on the
  page. Safe handling requires sanitization or an explicit HTML-to-text conversion at build
  time; it does not mean leaving the escape in place. Tracked as Task 006.
- **zod deprecation.** Astro 7 moved to zod v4 and deprecated the `z` re-export from
  `astro:content`, producing 12 non-blocking hints in `src/content.config.ts`. Resolving it
  means taking `zod` as a direct dependency, which needs an owner decision under
  constraint 3.6. `zod@4.4.3` is currently present only as a transitive dependency of astro,
  so importing it directly today would rely on hoisting and is not safe.
- `public/` contains no files. `BaseLayout.astro` references `/favicon.svg` and
  `/images/og-default.jpg`, so both 404 on every route.
- `Header.astro` applies `role="menubar"` and `role="menuitem"` to ordinary site
  navigation, which contradicts constraint 3.7.
- `Footer.astro` contains two `href="#"` dead links, for Mastodon and for email.
- `Footer.astro`, the MDX documents, and `src/data/locations.json` contain invented contact
  information, locations, social links, history, schedules, and impact claims. They are
  scaffold content and are not approved public facts.
- There is no CI workflow, automated test suite, formatter, or lint command.
- Cloudflare Pages configuration and a production URL have not been verified.

### Current phase

**Task 003 is active: brand system, palette and self-hosted fonts.** The build contract is
truthful and deterministic, the toolchain is current, and the routes share one type scale,
one measure and one set of rhythm tokens. The repository is still a prototype whose public
copy is invented scaffold data, and **it must not be deployed.**

The palette audit changed this task's character: the scaffold palette failed AA on nine
measured pairs, so Task 003 is a correctness fix as much as a design pass. `TASK_SPEC.md`
carries the full specification and the chosen Direction B values; the audit figures are in
`docs/DECISIONS_ARCHIVE.md`.

**Task 004 follows Task 003**, not in parallel: both edit `Header.astro` and `Footer.astro`.
`ROADMAP.md` holds the ordered sequence through launch.

### Open owner inputs

These are product-content decisions and must not be invented by an implementation model.
Work that depends on them is blocked, not deferrable by guessing.

| Input | Status | Blocks |
| --- | --- | --- |
| Final public organization name | Deferred; use `GROUP NAME` token | Branding, page copy, metadata |
| Town / geographic scope | Deferred; use `CITY` token | About copy, metadata |
| Signal chat invite link, or how people request it | **Required, not yet supplied.** No token may substitute | Join page, footer, distribution page |
| Whether cook-session and distribution places are named publicly at all | **Required.** May be "none are named" | `src/data/locations.json` replacement |
| One contact route the group actually monitors | Deferred; use `CONTACT` token | Footer, join page |
| Mastodon account handle, or confirmation there is none | **Required before Task 006** | Mastodon ingestion, feed routes, footer |
| Approved food-safety language, if any is wanted | Open | About or ways-to-help content |
| Logo, favicon, social image | Deferred | `public/` assets, brand pass |
| Confirmed Cloudflare Pages project URL and production domain | Deferred | `astro.config.mjs`, deployment |

Answered on 2026-07-30 and recorded above, do not re-ask: cadence (monthly, details via
Signal), which programs are real (cooking classes forming; others deferred), palette
(Direction B), commit the contrast script, self-host the fonts.

The Signal link is called out as non-tokenizable on purpose. It is the site's only real call
to action once distribution times are deliberately unpublished, so a placeholder there would
leave the site with no working way to participate.

---

## 5. REPOSITORY MAP (OBSERVED PATHS)

```text
/
|-- .env.example                      # Scaffold Mastodon variables; values unverified
|-- .nvmrc                            # Pins Node 22.23.2
|-- README.md                         # Documents the type system
|-- PROJECT_CONTEXT.md                # Project-level SSOT
|-- TASK_SPEC.md                      # Active task-level SSOT
|-- ROADMAP.md                        # Ordered backlog beyond the active task
|-- PRE-CONTXT-GENERATOR-PROTOCOL.md  # Workflow bootstrap protocol
|-- astro.config.mjs                  # Static output; site from SITE_URL; Tailwind Vite plugin
|-- package.json                      # engines.node >=22.18.0; check, prebuild, verify
|-- tsconfig.json                     # Astro strict TypeScript
|-- docs/
|   |-- DECISIONS_ARCHIVE.md          # Historical; not part of the session payload
|   `-- ENVIRONMENT.md                # Workstation setup; not part of the session payload
|-- public/                           # Empty; referenced favicon and OG image are absent
|-- scripts/
|   |-- fetch-mastodon.ts             # Run by the prebuild hook; needs Node 22.18+
|   `-- verify-baseline.sh            # npm run verify; caches the lockfile-dependent half
`-- src/
    |-- content.config.ts             # Content collection; glob() loader
    |-- components/
    |   |-- Footer.astro
    |   |-- Header.astro
    |   `-- MastodonFeed.astro
    |-- content/pages/                # about.mdx, donate.mdx, join.mdx
    |-- data/
    |   |-- locations.json            # Unapproved scaffold records
    |   `-- mastodon-posts.json       # Generated cache; currently an empty array
    |-- env.d.ts
    |-- layouts/BaseLayout.astro
    |-- pages/                        # about, donate, index, join, locations, posts
    |-- styles/
    |   `-- global.css                # tailwindcss import, @plugin typography, @theme
    |                                 # tokens, and the UNLAYERED .container and .prose
    `-- types/mastodon.ts
```

There is no `tailwind.config.mjs` and no `src/content/config.ts`. Both were removed
deliberately.

`dist/`, `.astro/` and `.verify-cache/` exist locally and are git-ignored.

`src/components/LocationCard.astro`, `DonateSection.astro`, and `JoinCTA.astro` do not
exist. Earlier repository maps that list them describe an unrealized design, not current
files. Files named in a plan but absent from the repository are not part of the current
architecture unless a task explicitly creates them.

---

## 6. ACTIVE SESSION TASK PAYLOAD

### Session role

`IMPLEMENTER`

### Active task

Execute `TASK_SPEC.md`. The current task is **Task 003 - Brand system, palette, and
self-hosted fonts**. Tasks 001, 001b, 001c and 002 are complete and merged to `main`.

### Required inputs

- This entire `PROJECT_CONTEXT.md`
- The entire `TASK_SPEC.md`
- The current contents of every file listed under the task's allowed scope
- Actual command output from the task's verification commands

`docs/DECISIONS_ARCHIVE.md` and `docs/ENVIRONMENT.md` are **not** required inputs. Load
either only for the narrow reasons stated in section 1.

### Output contract

The implementer must return:

1. A concise summary of changes
2. The exact files changed
3. Verification commands and their results
4. Any acceptance criterion that did not pass
5. Newly discovered repository facts that should be added during `MEMORY SYNC`

Do not begin a later task, fill in owner inputs, or silently expand scope.
