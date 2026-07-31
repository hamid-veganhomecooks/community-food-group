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
- **Node contract:** Node 22 LTS (>= 22.18). Decided 2026-07-30. See section 4.

### Installed versions verified on 2026-07-30, after Task 002

Read from `npm ls` in the working tree, not from the `package.json` ranges.

| Package | Range in `package.json` | Installed |
| --- | --- | --- |
| `astro` | `^7.1.6` | 7.1.6 |
| `@astrojs/mdx` | `^7.0.5` | 7.0.5 |
| `tailwindcss` | `^4.3.3` | 4.3.3 |
| `@tailwindcss/vite` | `^4.3.3` | 4.3.3 |
| `@tailwindcss/typography` | `^0.5.20` | 0.5.20 |
| `@astrojs/check` | `^0.9.4` | 0.9.x |
| `lucide-astro` | `^0.468.0` | 0.468.0 |

`@astrojs/tailwind` has been **removed** and must not be reintroduced: its latest
release (6.0.2) peer-depends on `astro: ^3 || ^4 || ^5` and is incompatible with Astro 7.

`npm audit` reports **0 vulnerabilities** as of 2026-07-30.

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

1. **Zero invented facts in production output:** Never invent addresses, phone numbers, email addresses, social accounts, donation claims, operating statistics, dates, or organizational history. Unknown public content must be omitted, clearly modeled as draft data, or supplied by the project owner. **Owner-fill placeholder tokens are the one permitted exception**, under the strict conditions in the 2026-07-30 placeholder decision in section 4. The distinction is deliberate: a visible `GROUP NAME` token is honest absence, while a plausible invented name is dishonest presence. Only the former is ever acceptable, and never in a deployed build.
2. **No incomplete code:** Never output `TODO`, ellipses, truncated functions, fake links, or copy-paste-incomplete blocks unless the task explicitly requests a sketch.
3. **Strict scope compliance:** Only change files listed in `TASK_SPEC.md`. Do not refactor adjacent code unless the task identifies it as required.
4. **Observed state beats planned state:** Never claim a file, dependency, build hook, component, route, deployment, or test exists until verified in the repository.
5. **Type safety:** Keep Astro's strict TypeScript configuration. Avoid `any`; validate external API data before using it.
6. **Minimal dependencies:** Prefer the platform, Astro, and existing packages. A new package requires an explicit architectural decision in this file and authorization in `TASK_SPEC.md`.
7. **Accessibility:** Target WCAG 2.2 AA. Use semantic website navigation, keyboard-operable controls, visible focus styles, meaningful alternative text, and reduced-motion-safe behavior. Do not use application-menu ARIA patterns for ordinary site navigation.
8. **External HTML is untrusted:** Mastodon status HTML must never be rendered with `set:html` unless it is sanitized by an explicitly approved strategy. Escaped plain text is safer than unsanitized HTML, but escaping raw HTML into a text node is a rendering defect in its own right; see the Mastodon note in section 4.
9. **No browser-side Mastodon API calls:** Mastodon data is retrieved before rendering and stored in `src/data/mastodon-posts.json`.
10. **Deterministic verification:** Every implementation task must run the checks named in its acceptance criteria. Do not report success from inspection alone.
11. **Static boundary:** Do not add a Cloudflare Worker, database, form handler, authentication, or other server runtime without a new architectural decision.
12. **No secrets in Git:** Environment-specific values belong in local or Cloudflare environment settings. Commit only documented examples.
13. **Files stay UTF-8 clean:** Do not reintroduce double-encoded characters. Prefer ASCII punctuation in Markdown; if a box-drawing or typographic character is used, verify the committed bytes.

---

## 4. CURRENT ARCHITECTURAL DECISIONS & MEMORY STATE

### Accepted decisions

- **[2026-07-29]** Astro 5 static output and Cloudflare Pages were selected for the MVP.
- **[2026-07-29]** Editorial pages are MDX; site records are structured JSON.
- **[2026-07-29]** Mastodon ingestion is build-side only. The intended cache is `src/data/mastodon-posts.json`.
- **[2026-07-29]** No Worker, database, account system, or client-side Mastodon fetch is part of the MVP.
- **[2026-07-29]** Accessibility is a release requirement, not a later enhancement.
- **[2026-07-30]** The organizational model is a cook-and-distribute mutual aid affinity group, expanding toward cooking classes and cultural events. Recorded in section 2.
- **[2026-07-30]** **Node 22 LTS (>= 22.18) is the standard runtime.** This keeps `node scripts/fetch-mastodon.ts` runnable through native erasable-TypeScript stripping without adding a runner dependency. Cloudflare Pages must set `NODE_VERSION` to match. Supersedes the README's Node 18+ claim.
- **[2026-07-30]** **`/locations` becomes a distribution-and-meetup page.** It presents where the group cooks and where it hands out food, with day/time and an optional map destination. Per-site phone numbers and per-site email addresses are removed from the data model, because they do not exist.
- **[2026-07-30]** **`/donate` becomes a "Ways to Help" page.** It presents concrete material and time needs rather than a donation-platform flow. The invented "90% of all donations" transparency claim is withdrawn and must not reappear in any form.
- **[2026-07-30]** **The visual direction is reopened.** The 2026-07-29 terracotta/sage/cream direction is no longer fixed. A palette selection and a full typographic scale will be proposed and chosen before the design pass. Warm, approachable, high-contrast and mobile-first remain the goals.
- **[2026-07-30]** **Owner-fill placeholder tokens are permitted in content, under conditions.** Content work may use literal uppercase tokens such as `GROUP NAME`, `CITY`, and `CONTACT` where a human will supply the real value later. Conditions, all mandatory:
  - Tokens are `SCREAMING_CASE` or spaced uppercase so they are unmistakably unfilled to any reader, including a non-technical one reviewing a preview.
  - Every token is greppable by a single documented pattern, and the pre-publication check in Task 009 fails the build while any remain.
  - Tokens stand in only for **identifiers the owner will supply**: name, city, contact handles. They must never stand in for a claim that may turn out to be false, such as a statistic, a founding date, a program that may not exist, or a schedule.
  - No deployed build may contain one. This unblocks drafting; it does not unblock publishing.
- **[2026-07-30]** **Distribution cadence is monthly, with precise scheduling handled off-site.** The public site states the monthly rhythm and directs people to get in touch to join a Signal chat where timing is coordinated. Rationale recorded because it affects copy tone: the exact schedule is set by committee close to the date and genuinely changes, so publishing a specific time in advance would be **inaccurate**, not merely a safety tradeoff. Copy should therefore present the chat as the way to get current details, not as a gate or a screening step, since framing it as security would misrepresent an ordinary coordination problem.
- **[2026-07-30]** **Cooking classes get a real section now.** They are the most likely near-term expansion and the site should be ready. The section is written as forming or upcoming, never as an established program with a history. Cultural events and other activities are deferred until they are real.
- **[2026-07-30]** **`@tailwindcss/typography` is authorized as a dependency.** It is the official Tailwind plugin supplying the `prose` classes the editorial routes already reference, and adding it is the correct fix for the content-spacing defect described below. This entry satisfies constraint 3.6 for that package only. Under Tailwind 4 it is registered with `@plugin` in CSS, not in a JS config.
- **[2026-07-30]** **Migrated to Astro 7 and Tailwind 4.** Driven by 8 security advisories against astro 5.18.2. None of the affected features (`define:vars`, server islands, view transitions, spread props) were in use, so there was no live exposure, but nothing is deployed and this was the cheapest moment to move. The upgrade **forced** dropping `@astrojs/tailwind`, which does not support Astro 7, so Tailwind 4 via `@tailwindcss/vite` came with it. Secondary benefit: the typography and palette work in Tasks 002-003 is now built on Tailwind 4 once rather than twice.
- **[2026-07-30]** **Tailwind is configured in CSS.** `tailwind.config.mjs` is deleted. The theme lives in an `@theme` block in `src/styles/global.css`. Do not recreate a JS config; Tailwind 4 does not read one by default.
- **[2026-07-30]** **The `.container` collision is fixed.** The custom `.container` is declared **outside any cascade layer** so it beats Tailwind's own layered `.container` utility. Preserve that. Moving it into `@layer components` would silently reintroduce the bug where the intended `max-w-7xl` was overridden to 96rem at the 2xl breakpoint.
- **[2026-07-30]** **Task 002 is complete.** `@tailwindcss/typography` is installed and registered with `@plugin '@tailwindcss/typography';` in `src/styles/global.css`. This closed the content-spacing defect, which was a missing dependency rather than a matter of tuning margins.
- **[2026-07-30]** **`prose` lives in the UTILITIES layer, so `.prose` customization must be declared outside any cascade layer.** Verified against the compiled stylesheet, not assumed: the plugin emits its rules inside `@layer utilities`, which begins after `@layer components` ends. A `.prose` override written inside `@layer components` therefore loses on **layer order regardless of specificity** - it compiles without error, ships, and does nothing at all. The first attempt at this task did exactly that, and both the palette inheritance and the heading spacing were silently discarded. The project's prose theme is consequently unlayered, next to `.container`. This is the **second** defect of this exact shape; treat "my Tailwind override is being ignored" as a cascade-layer question before a specificity one. The same fact is why a single `.prose` block also governs `prose-lg`.
- **[2026-07-30]** **The type scale is semantic and fluid.** Steps are named for role, not size: `--text-display`, `--text-title`, `--text-heading`, `--text-subheading`, `--text-lead`, `--text-body`, `--text-label`. Each is a `clamp()`, so one class replaces a breakpoint chain and `text-title` supersedes `text-4xl md:text-5xl lg:text-6xl`. A template that needs `md:text-*` on a heading is evidence the scale is wrong, not that the page is special. Line height and letter spacing travel with each step; **font weight deliberately does not**, so a heading can be re-weighted without leaving the scale.
- **[2026-07-30]** **The measure is `--container-measure`, 39rem, about 69 characters at the `prose-lg` size.** Measured in a browser at 1440px rather than estimated; an initial 37rem measured 65.7ch and was widened to sit mid-range. The card and the measure are separate concerns: `.prose-card` sizes itself to `measure + 2 * gutter`, so reading width stays constant however the padding scales.
- **[2026-07-30]** **Section rhythm is three mutually exclusive steps:** `.section-lg`, `.section`, `.section-tight`. They exist so consecutive bands can differ rather than stacking identically, which was the specific complaint about the home page.
- **[2026-07-30]** **The current palette fails WCAG 2.2 AA on nine measured pairs.** Measured against every foreground/background pair actually used in the templates, not estimated. Worst: CTA lede at 2.50:1, hero lede at 3.04:1, `btn-secondary` at 3.09:1. **`text-terracotta`, the most-used colour class in the codebase at 23 occurrences, reaches only 3.39:1 on cream and 3.84:1 on white**, so every link and card heading fails. Both button styles fail. This contradicts constraint 3.7, which lists AA as a release requirement. The `gray-200` divider at 1.24:1 is **not** counted: WCAG 1.4.11 governs boundaries needed to identify a control, and a decorative rule is exempt.
- **[2026-07-30]** **Palette Direction B ("Garden") is chosen.** Owner decision. Green leads, clay supports. All sixteen role pairs validated against AA before selection: link 7.54:1, button 6.50:1, chip 5.85:1, body 14.59:1, focus ring 6.56:1. Values are in `TASK_SPEC.md`. The terracotta/sage/cream direction is retired and its tokens are to be deleted, not renamed.
- **[2026-07-30]** **Colour is a two-layer token system.** Layer 1 is a **brand-inputs block**, the only block a reusing group edits. Layer 2 is **semantic roles** (`--color-surface`, `--color-ink`, `--color-brand`, `--color-brand-ink`, ...) which are the only thing templates consume. Rationale: the templates currently name colours literally about 119 times across 10 files, so a rebrand today means editing every template. **`--color-brand` (fills) and `--color-brand-ink` (text on light) must stay separate roles.** A brand colour that works as a fill usually fails as text; collapsing the two is precisely how the current palette came to fail.
- **[2026-07-30]** **A contrast validation script is authorized and required**, as `npm run check:contrast`, in plain Node with **zero dependencies**. It must parse the tokens out of `src/styles/global.css` rather than carry a duplicate list, or it will silently drift from what ships. Rationale: documenting a rebrand without giving reusers a way to verify it merely relocates the accessibility failure downstream. It is also the standing guard against this project drifting back into the state measured above.
- **[2026-07-30]** **Fonts are self-hosted; the Google Fonts CDN is removed.** It render-blocks and sends visitor IP addresses to a third party, which a mutual aid site has good reason to avoid. **`@fontsource-variable/inter` is authorized as a dependency**, satisfying constraint 3.6 for that package only - but the implementer must first check whether Astro 7.1.6 ships a **stable** built-in Fonts API and prefer that, since it needs no dependency at all. Inter stays as the single family; pairing a display face is a separate decision and is not part of Task 003.
- **[2026-07-30]** **Task 004 must follow Task 003, not run alongside it.** Both edit `Header.astro` and `Footer.astro`. The earlier roadmap note that they could run in parallel was wrong and has been corrected.
- **[2026-07-30]** **Heading case convention.** Title Case for page titles (`h1`) and section headings (`h2`); sentence case for sub-headings (`h3` and below), UI labels, buttons and links. Applied to the files in Task 002's scope. Headings inside the MDX documents still mix both and are corrected in Task 005, which rewrites that copy anyway.

### Verified repository state on 2026-07-30

**Tasks 001, 001b, 001c and 002 are complete** and merged to `main` (`8ad91ad`). All were
verified by execution on Node v22.23.2, not by inspection.

Current green baseline, reproducible from a clean `npm ci`:

- `npm ci` exits 0.
- `npm run check` reports **0 errors, 0 warnings**, and 12 hints (all the same zod
  deprecation, below).
- `npm run build` emits the same six routes.
- `npm audit` reports **0 vulnerabilities**.
- The compiled stylesheet contains `prose` rules: 661 occurrences in `dist/_astro/*.css`,
  previously zero.

Task 002 was **additionally verified in a real browser** at 375px and 1440px across all six
routes, because spacing cannot be signed off from a CSS diff. Measured rather than asserted:
paragraph spacing non-zero on every non-terminal paragraph, `list-style-type: disc` with
sage markers, headings rendering `rgb(168, 85, 59)` rather than Tailwind's default gray,
prose `h2` margins of 66px above and 16.5px below, `.container` resolving to 1280px at both
widths, exactly one `h1` per route, and no skipped heading levels.

No browser is installed in this environment and there is no sudo. That check was run with
Playwright and Chromium installed **outside the repository**, in a scratch directory, with a
missing `libasound2` extracted locally; `package.json` gained only `@tailwindcss/typography`.
A session repeating this verification must keep the browser out of the project the same way.

### Defects resolved

- **Node runtime.** `node scripts/fetch-mastodon.ts` used to fail on Node 20 with
  `ERR_UNKNOWN_FILE_EXTENSION`, making Mastodon ingestion impossible to run. Node 22.23.2
  is now installed and pinned in `.nvmrc`.
- **The `.container` collision.** Fixed during the Tailwind 4 migration by declaring the
  rule outside any cascade layer. See the dated decision above; do not undo it.
- **React `key={...}` props** removed from `locations.astro` and `MastodonFeed.astro` in
  Task 001b.
- **`aria-expanded` type error** in `Header.astro`, fixed in Task 001b. The emitted value
  was always correct; only the type error and a misleading variable name were wrong.
- **Double-encoded UTF-8** in the context files.
- **Content spacing.** The editorial routes asked for `prose prose-lg` while
  `@tailwindcss/typography` was not installed, so the compiled stylesheet contained zero
  `prose` rules and preflight's margin reset stood unopposed. Fixed in Task 002 by
  installing and registering the plugin. Note that the *first* fix attempt customized
  `.prose` inside `@layer components` and silently had no effect; see the cascade-layer
  decision above before touching prose styles.

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

The palette audit changed this task's character: the scaffold palette is **not accessible**,
failing AA on nine measured pairs, so Task 003 is a correctness fix as much as a design pass.
`TASK_SPEC.md` carries the full specification and the chosen Direction B values.

**Task 004 follows Task 003**, not in parallel: both edit `Header.astro` and `Footer.astro`.
`ROADMAP.md` holds the ordered sequence through launch.

### Open owner inputs

These are product-content decisions and must not be invented by an implementation model.
Work that depends on them is blocked, not deferrable by guessing.

| Input | Status | Blocks |
| --- | --- | --- |
| Final public organization name | Deferred; use `GROUP NAME` token | Branding, page copy, metadata |
| Town / geographic scope | Deferred; use `CITY` token | About copy, metadata |
| Cook and distribution cadence | **Answered 2026-07-30:** monthly, details via Signal | - |
| Which programs are real vs. aspirational | **Answered 2026-07-30:** cooking classes forming; other activities deferred | - |
| Signal chat invite link, or how people request it | **Required, not yet supplied.** No token may substitute | Join page, footer, distribution page |
| Whether cook-session and distribution places are named publicly at all | **Required.** May be "none are named" | `src/data/locations.json` replacement |
| One contact route the group actually monitors | Deferred; use `CONTACT` token | Footer, join page |
| Mastodon account handle, or confirmation there is none | **Required before Task 006** | Mastodon ingestion, feed routes, footer |
| Approved food-safety language, if any is wanted | Open | About or ways-to-help content |
| Logo, favicon, social image | Deferred | `public/` assets, brand pass |
| Confirmed Cloudflare Pages project URL and production domain | Deferred | `astro.config.mjs`, deployment |

The Signal link is called out as non-tokenizable on purpose. It is the site's only real call
to action once distribution times are deliberately unpublished, so a placeholder there would
leave the site with no working way to participate.

---

## 5. REPOSITORY MAP (OBSERVED PATHS)

```text
/
|-- .env.example                      # Scaffold Mastodon variables; values unverified
|-- .gitignore
|-- README.md                         # Repaired in Task 001; documents the type system
|-- PROJECT_CONTEXT.md                # Project-level SSOT
|-- TASK_SPEC.md                      # Active task-level SSOT
|-- ROADMAP.md                        # Ordered backlog beyond the active task
|-- PRE-CONTXT-GENERATOR-PROTOCOL.md  # Workflow bootstrap protocol
|-- .nvmrc                            # Pins Node 22.23.2
|-- astro.config.mjs                  # Static output; site from SITE_URL; Tailwind Vite plugin
|-- package.json                      # engines.node >=22.18.0; check and prebuild scripts
|-- package-lock.json
|-- tsconfig.json                     # Astro strict TypeScript
|-- public/                           # Empty; referenced favicon and OG image are absent
|-- scripts/
|   `-- fetch-mastodon.ts             # Run by the prebuild hook; needs Node 22.18+
`-- src/
    |-- content.config.ts             # Content collection; glob() loader
    |-- components/
    |   |-- Footer.astro
    |   |-- Header.astro
    |   `-- MastodonFeed.astro
    |-- content/
    |   `-- pages/
    |       |-- about.mdx
    |       |-- donate.mdx
    |       `-- join.mdx
    |-- data/
    |   |-- locations.json            # Unapproved scaffold records
    |   `-- mastodon-posts.json       # Generated cache; currently an empty array
    |-- env.d.ts
    |-- layouts/
    |   `-- BaseLayout.astro
    |-- pages/
    |   |-- about.astro
    |   |-- donate.astro
    |   |-- index.astro
    |   |-- join.astro
    |   |-- locations.astro
    |   `-- posts.astro
    |-- styles/
    |   `-- global.css                # tailwindcss import, @plugin typography, @theme
    |                                 # tokens, and the UNLAYERED .container and .prose
    `-- types/
        `-- mastodon.ts
```

There is no `tailwind.config.mjs` and no `src/content/config.ts`. Both were removed
deliberately; see the dated decisions in section 4.

Generated directories `dist/` and `.astro/` exist locally and are git-ignored.

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

All three owner decisions this task needed have been **answered** on 2026-07-30: palette
**Direction B (Garden)**, commit the contrast script, self-host the fonts. Do not re-ask
them; the values and rationale are in `TASK_SPEC.md` and in the dated decisions above.

### Required inputs

- This entire `PROJECT_CONTEXT.md`
- The entire `TASK_SPEC.md`
- The current contents of every file listed under the task's allowed scope
- Actual command output from the task's verification commands

### Output contract

The implementer must return:

1. A concise summary of changes
2. The exact files changed
3. Verification commands and their results
4. Any acceptance criterion that did not pass
5. Newly discovered repository facts that should be added during `MEMORY SYNC`

Do not begin a later task, fill in owner inputs, or silently expand scope.
