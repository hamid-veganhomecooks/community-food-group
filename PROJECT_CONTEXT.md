# AI COLLABORATION PROTOCOL & PROJECT CONTEXT

## 1. OPERATIONAL ROLE & SESSION CONTEXT

You are participating in a modular, multi-session software-development workflow.

- Every session is isolated and stateless.
- Treat this file as the project-level single source of truth.
- Treat `TASK_SPEC.md` as the single source of truth for the active task.
- `ROADMAP.md` is the ordered backlog. It is planning material, not authorization to change code, and an `IMPLEMENTER` **does not need to load it** - everything binding on the active task is here or in `TASK_SPEC.md`. It is an `ARCHITECT` and owner document.
- Do not rely on conversational memory, inferred files, or an earlier task embedded in a prompt.
- Before changing code, compare the task's relevant-file list with the repository. If they disagree, stop and report the mismatch.
- The session role will be one of `ARCHITECT`, `IMPLEMENTER`, `REVIEWER`, or `DEBUGGER`.

### One owner per fact

Every fact lives in exactly one file. Other files **point** to it rather than restating it.

| Fact | Owner | Written by |
| --- | --- | --- |
| Durable rules, decisions, current state, open defects, owner inputs | `PROJECT_CONTEXT.md` | `MEMORY SYNC` |
| Order, blocking relationships, files each queued task touches | `ROADMAP.md` | `ARCHITECT` at promotion time only |
| Full scope and acceptance for the **one** active task | `TASK_SPEC.md` | `ARCHITECT` at promotion time |

Promotion **moves** detail, it does not copy it: a task's scope is cut from `ROADMAP.md`
into `TASK_SPEC.md`, and on completion cut into `PROJECT_CONTEXT.md` as dated decisions
while its roadmap entry collapses to a status line. A queued entry that survives promotion
becomes a second, stale spec competing with the real one. This has already happened once,
on 2026-07-30, to both the owner-inputs list and the Task 003 entry.

An `IMPLEMENTER` never writes `ROADMAP.md`, so it cannot drift mid-task.

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
  the monthly rhythm and nothing more precise. The exact schedule is set close to the date
  and genuinely changes, so publishing a time in advance would be **inaccurate**, not merely
  a safety tradeoff.
- **[2026-07-30] The single public contact route is email, and no chat link appears on the
  site.** Owner decision, superseding the earlier plan to publish a Signal invite. People
  write to `info@GROUP_DOMAIN`; a person replies and handles onboarding off-site.
  Consequences for copy, all binding on Tasks 004-007:
  - **No Signal, WhatsApp, Telegram or other chat link may appear anywhere on the site.**
    This is a deliberate owner choice, not a missing asset awaiting a value. A future session
    must not "helpfully" add a join-the-chat button.
  - Invite people to write in, and say plainly that a person will get back to them.
  - Do **not** frame the reply step as an application, a screening, or a vetting process -
    and do not imply it is instant or automatic either. It is a person answering an email.
    Both exaggerations are constraint 1 problems in opposite directions.
  - What happens after someone writes in is **internal** and is not site content.
- **Cooking classes get a real section now**, written as forming or upcoming, never as an
  established program with a history. Cultural events and other activities are deferred
  until they are real.
- **Heading case:** Title Case for `h1` and `h2`; sentence case for `h3` and below, UI
  labels, buttons and links. Headings inside the MDX documents still mix both and are
  corrected in Task 005, which rewrites that copy anyway.
- **Owner-fill placeholder tokens are permitted in content, under conditions.** Content work
  may use literal uppercase tokens such as `GROUP NAME`, `CITY`, and `GROUP_DOMAIN`. All
  conditions are mandatory:
  - Tokens are `SCREAMING_CASE` or spaced uppercase so they are unmistakably unfilled to any
    reader, including a non-technical one reviewing a preview.
  - **A token must never be spelled as a plausible real value.** The contact address is
    written `info@GROUP_DOMAIN`, never `info@domain.com` or `info@example.com`: the local
    part is a real decision, the domain is the blank. A plausible-looking address reads as
    genuine to a reviewer, and `domain.com` is a real registered domain belonging to someone
    else, so a `mailto:` pointing at it would be both dishonest presence and a live link to
    a third party.
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
- **[2026-07-31] Palette Direction B ("Garden") is implemented.** Green leads, clay supports.
  The terracotta/sage/cream/earthy tokens are **deleted** (not renamed) from
  `src/styles/global.css` and from every component and page; confirmed by grep across `src/`.
  All sixteen role pairs pass AA; figures are in `docs/DECISIONS_ARCHIVE.md` and reproduced
  live by `npm run check:contrast`.
- **Colour is a two-layer token system, implemented in `src/styles/global.css`.** Layer 1 is a
  `:root` block of fourteen **brand-input** values, six brand/accent (`--brand-green`,
  `--brand-green-hover`, `--brand-green-ink`, `--brand-clay`, `--brand-clay-ink`,
  `--brand-clay-soft`) and eight neutrals (`--neutral-paper`, `--neutral-white`,
  `--neutral-mist`, `--neutral-charcoal`, `--neutral-slate`, `--neutral-fog`, `--neutral-haze`,
  `--neutral-line`). These are named **outside** the `--color-*` namespace on purpose, so
  Tailwind never turns them into utility classes - a reusing group edits only this block.
  Layer 2 is sixteen **semantic roles** in the `@theme` block (`--color-surface`,
  `--color-ink`, `--color-brand`, `--color-brand-ink`, `--color-accent`, `--color-accent-ink`,
  `--color-focus`, ...), each a `var()` reference into Layer 1. Templates consume only Layer 2.
  **`--color-brand` (fills) and `--color-brand-ink` (text on light) stay separate roles**, as
  do `--color-accent`/`--color-accent-ink`; collapsing either pair is how the previous palette
  failed nine measured pairs.
- **A contrast validation script exists**: `scripts/check-contrast.mjs`, wired as
  `npm run check:contrast`, plain Node with **zero dependencies**. It parses the token values
  directly out of `src/styles/global.css` (no duplicate list to drift), resolves `var()` chains
  from role to brand input to hex, and checks sixteen named role pairs actually used by the
  templates against WCAG 2.2 AA (4.5:1 text, 3.0:1 for the two focus-ring pairs). Confirmed to
  fail loudly: a deliberately weakened token dropped two pairs to ~2.8:1 and the script exited
  non-zero, naming both. **Not yet part of `npm run verify`** - `scripts/verify-baseline.sh`
  was outside Task 003's scope and was not edited, so contrast checking is currently a separate
  manual step.
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
- **[2026-07-31] Fonts are self-hosted via Astro's built-in Fonts API, not
  `@fontsource-variable/inter`.** Verified that Astro 7.1.6's `fonts` config key sits at the
  config top level, not under `experimental` (only `experimental_getFontFileURL` carries that
  prefix), so it is stable and needs no new dependency. `astro.config.mjs` now configures
  `fontProviders.google()` for Inter with `display: 'swap'`; the provider fetches the font file
  at **build time** and Astro serves it from the site's own origin with a metrics-matched
  local fallback, so the browser never contacts Google and no visitor IP is sent to a third
  party. Confirmed in `dist/`: zero matches for `fonts.googleapis.com` or `fonts.gstatic.com`,
  two self-hosted `.woff2` files under `dist/_astro/fonts/`. `@fontsource-variable/inter` was
  never installed and is **not** a dependency of this project.
  **Consequence for the repository map:** `astro.config.mjs` is now part of the design-system
  surface, not just deployment config - a future palette or type-system task may need to touch
  it for font reasons even though Task 003's original allowed-scope list did not include it.
  (That gap was hit live during Task 003 and resolved by an explicit owner-approved scope
  expansion rather than a silent edit.) Inter stays the single family; pairing a display face
  is a separate, still-open decision.

### Verified repository state on 2026-07-31

**Tasks 001, 001b, 001c and 002 are complete** and merged to `main` (`8ad91ad`).

**Task 003 (brand system, palette, self-hosted fonts) is implemented and fully verified in
the working tree, but not yet committed or merged** - `git status` still shows it as
uncommitted changes as of this entry. Verified by execution on Node v22.23.2:

- `npm ci` exits 0, `npm audit` reports **0 vulnerabilities**.
- `npm run check` reports **0 errors, 0 warnings**, 12 hints (the zod deprecation below).
- `npm run build` emits the same six routes; fonts are self-hosted (`Copying fonts (2 files)`).
- `npm run check:contrast` passes all sixteen role pairs, with ratios matching the audited
  Direction B figures, and was proven to fail (and correctly name the broken pairs) when a
  token was deliberately weakened.
- No literal palette name (`terracotta`/`sage`/`cream`/`earthy`) or hex value remains in
  `src/`; no `fonts.googleapis.com`/`fonts.gstatic.com` reference remains in `dist/`.
- `.container` and `.prose` remain unlayered; the Task 002 type scale and spacing tokens are
  byte-for-byte unchanged (confirmed by targeted diff).
- Browser-verified with the Playwright harness (`docs/ENVIRONMENT.md`) at 375px and 1440px
  across all six routes: `verify.mjs` passes, and the new theme's computed colours were
  confirmed applied (e.g. `h2` renders `rgb(40,88,61)` = `--color-brand-ink`). Focus rings
  were separately confirmed visible (white 2px offset + green 4px ring) via computed
  `box-shadow` on a focused button.

Green baseline, reproducible with `npm run verify`: unchanged mechanics from the note above;
`scripts/verify-baseline.sh` was not edited in Task 003 and does not yet run
`check:contrast` (see the styling notes above).

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
- `Footer.astro` contains two `href="#"` dead links, for Mastodon and for email. The email
  one now has a destination: `mailto:info@GROUP_DOMAIN`. The Mastodon one is still blocked
  on the handle, and must be removed rather than left dead if there is no account.
- `Footer.astro`, the MDX documents, and `src/data/locations.json` contain invented contact
  information, locations, social links, history, schedules, and impact claims. They are
  scaffold content and are not approved public facts.
- There is no CI workflow, automated test suite, formatter, or lint command.
- Cloudflare Pages configuration and a production URL have not been verified.

### Current phase

**Task 003 is complete** (implemented and verified as above; not yet committed). The palette
now passes AA on every checked pair instead of failing nine, the toolchain is current, and
the routes share one type scale, one measure, one set of rhythm tokens, and one colour token
system. The repository is still a prototype whose public copy is invented scaffold data, and
**it must not be deployed.**

`TASK_SPEC.md` still describes Task 003 as active; promoting Task 004 into it, and collapsing
Task 003's `ROADMAP.md` entry to a status line, is an `ARCHITECT` action at promotion time and
was **not** performed by this `MEMORY SYNC` - only this file was updated, on request. Until
that promotion happens, `TASK_SPEC.md` is stale and should not be treated as the active task
by a future session; this section is the authority on what is actually done.

**Task 004 follows Task 003**, not in parallel: both edit `Header.astro` and `Footer.astro`.
`ROADMAP.md` holds the ordered sequence through launch.

### Open owner inputs

**This table is the only copy of this list.** `ROADMAP.md` used to carry a second one; it
drifted and has been removed in favour of a pointer here. Do not reintroduce a duplicate in
any other file.

These are product-content decisions and must not be invented by an implementation model.
Work that depends on them is blocked, not deferrable by guessing.

| Input | Status | Blocks |
| --- | --- | --- |
| Final public organization name | Deferred; use `GROUP NAME` token | Branding, page copy, metadata |
| Town / geographic scope | Deferred; use `CITY` token | About copy, metadata |
| Domain name; not yet purchased | Deferred; use `GROUP_DOMAIN` token | Contact address, canonical URLs, deployment |
| Whether cook-session and distribution places are named publicly at all | **Required.** May be "none are named" | `src/data/locations.json` replacement |
| Mastodon account handle, or confirmation there is none | **Required before Task 006** | Mastodon ingestion, feed routes, footer |
| Approved food-safety language, if any is wanted | Open | About or ways-to-help content |
| Logo, favicon, social image | Deferred | `public/` assets, brand pass |
| Confirmed Cloudflare Pages project URL | Deferred | `astro.config.mjs`, deployment |

Answered on 2026-07-30 and recorded above. **Do not re-ask, and do not treat any of these as
still open:**

- Cadence: monthly; no precise time is published.
- **Contact route: email to `info@GROUP_DOMAIN`. The Signal invite link is withdrawn** - the
  owner decided no chat link goes on the site at all. This was previously the one blocker
  marked non-tokenizable; it is now resolved, and the token covers only the unpurchased
  domain.
- Which programs are real: cooking classes forming; other activities deferred.
- Palette Direction B; commit the contrast script; self-host the fonts.

Nothing on the remaining list blocks Task 003 or Task 004. Track B (Tasks 005-007) needs the
organization name, the geographic scope, the locations answer and the Mastodon handle.

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
|-- astro.config.mjs                  # Static output; site from SITE_URL; Tailwind Vite
|                                      # plugin; a fonts[] entry self-hosts Inter (Task 003)
|-- package.json                      # engines.node >=22.18.0; check, prebuild, verify
|-- tsconfig.json                     # Astro strict TypeScript
|-- docs/
|   |-- DECISIONS_ARCHIVE.md          # Historical; not part of the session payload
|   `-- ENVIRONMENT.md                # Workstation setup; not part of the session payload
|-- public/                           # Empty; referenced favicon and OG image are absent
|-- scripts/
|   |-- fetch-mastodon.ts             # Run by the prebuild hook; needs Node 22.18+
|   |-- check-contrast.mjs            # npm run check:contrast; zero deps; not yet in verify
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
    |   `-- global.css                # tailwindcss import, @plugin typography; a :root
    |                                 # brand-inputs block feeding @theme's semantic colour
    |                                 # roles, type scale and rhythm tokens; and the
    |                                 # UNLAYERED .container and .prose
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

**Task 003 - Brand system, palette, and self-hosted fonts - is complete**, verified in the
working tree (see section 4). `TASK_SPEC.md` still describes it as active; it has not been
re-promoted for Task 004 because that is an `ARCHITECT` action at promotion time, out of
scope for the `MEMORY SYNC` that produced this entry. A session that loads `TASK_SPEC.md`
before an `ARCHITECT` has promoted Task 004 into it is looking at a stale spec - trust this
section instead. Tasks 001, 001b, 001c and 002 are complete and merged to `main`.

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
