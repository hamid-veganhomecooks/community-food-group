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
- **Framework / language:** Astro 5, TypeScript, Astro components, MDX
- **Rendering:** Static output only; no application server or database
- **Hosting target:** Cloudflare Pages, output directory `dist/`
- **Content:** Astro content collection for editorial MDX pages
- **Structured data:** JSON for distribution/meetup sites and the generated Mastodon cache
- **Styling / UI:** Tailwind CSS 3.4 through `@astrojs/tailwind` 5.1; `lucide-astro` icons
- **External data:** Optional Mastodon account feed fetched by a Node build-time utility
- **Architecture:** Static-first Jamstack. JavaScript is used only where interaction requires it, currently the mobile navigation toggle.
- **Package manager:** npm with a committed `package-lock.json`
- **Node contract:** Node 22 LTS (>= 22.18). Decided 2026-07-30. See section 4.

### Installed versions verified on 2026-07-30

Read from `npm ls` in the working tree, not from the `package.json` ranges.

| Package | Range in `package.json` | Installed |
| --- | --- | --- |
| `astro` | `^5.0.0` | 5.18.2 |
| `@astrojs/mdx` | `^4.0.0` | 4.3.14 |
| `@astrojs/tailwind` | `^5.1.0` | 5.1.5 |
| `tailwindcss` | `^3.4.0` | 3.4.19 |
| `lucide-astro` | `^0.468.0` | 0.468.0 |

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
- **[2026-07-30]** **`@tailwindcss/typography` is authorized as a dependency.** It is the official Tailwind plugin supplying the `prose` classes the editorial routes already reference, and adding it is the correct fix for the content-spacing defect described below. This entry satisfies constraint 3.6 for that package only.

### Verified repository state on 2026-07-30

`HEAD` is `b33fa7032d1099359c8b73d8b5ce4e3252199df2` (`Update context files`). That commit
changed only `PROJECT_CONTEXT.md` and `TASK_SPEC.md`. The last commit to touch application
code is still `7394fbe52888f5edce1682d4009c5e0b7f3420cd` (`Initial Astro site`).

**Task 001 has not been started.** Verified by direct inspection: `.nvmrc` does not exist,
`package.json` has no `check` script and no `engines` field, `src/content/config.ts` is
still the legacy definition, `src/content.config.ts` does not exist, `.env.example` still
contains the invented handle, `astro.config.mjs` still hardcodes the unconfirmed Pages URL,
`README.md` still terminates mid-instruction inside an unclosed fence at line 31, and
`scripts/fetch-mastodon.ts` still carries the invented default account.

Facts confirmed by execution rather than reading:

- `npx astro build` **succeeds** on Node 20.20.2 and emits all six routes in about 7.6s.
  The legacy content collection still resolves under Astro 5.18.2, so the migration is a
  modernization and correctness task, not a build blocker.
- `node scripts/fetch-mastodon.ts` **fails on Node 20** with
  `ERR_UNKNOWN_FILE_EXTENSION: Unknown file extension ".ts"`. Mastodon ingestion is
  therefore non-functional on any runtime below 22.18. The local development machine was
  observed at Node 20.20.2, so this must be resolved before the feature can be tested at all.
- **Content spacing defect, root cause identified.** `src/pages/about.astro`,
  `join.astro`, and `donate.astro` wrap rendered MDX in `class="prose prose-lg"`, but
  `@tailwindcss/typography` is not installed and `tailwind.config.mjs` declares
  `plugins: []`. The compiled stylesheet in `dist/_astro/` contains **zero** `prose` rules.
  Because `@tailwind base` still applies preflight, every paragraph, heading, and list has
  `margin: 0` and lists lose their markers. The editorial pages therefore render as an
  undifferentiated block of text. This is a missing-dependency defect, not a matter of
  tuning margin values, and no amount of per-element margin tweaking is the correct fix.
- `src/components/MastodonFeed.astro` renders `post.content` as an escaped text node. That
  field is an HTML string from the Mastodon API, so visitors would see literal `<p>` markup
  on the page. The current cache is an empty array, which is why the defect has not yet been
  visible. Safe handling requires either sanitization or an explicit HTML-to-text
  conversion; it does not mean leaving the escape in place.
- `public/` contains no files. `BaseLayout.astro` references `/favicon.svg` and
  `/images/og-default.jpg`, so both 404 on every route.
- `src/pages/locations.astro` and `src/components/MastodonFeed.astro` pass React-style
  `key={...}` props inside `.map()` calls. Astro forwards these to the DOM as invalid
  attributes.
- `Header.astro` applies `role="menubar"` and `role="menuitem"` to ordinary site
  navigation, which contradicts constraint 3.7.
- `Footer.astro` contains two `href="#"` dead links, for Mastodon and for email.
- `Footer.astro`, `.env.example`, the MDX documents, and `src/data/locations.json` contain
  invented contact information, locations, social links, history, schedules, and impact
  claims. They are scaffold content and are not approved public facts.
- The default Mastodon handle `@communityfood@mastodon.social` is unverified scaffold data.
- There is no CI workflow, automated test suite, formatter, lint command, or explicit
  type-check command.
- Cloudflare Pages configuration and a production URL have not been verified.
- Both context Markdown files previously contained double-encoded UTF-8 sequences in the
  repository-map tree and in typographic quotes. Corrected on 2026-07-30; see constraint 3.13.

### Current phase

**Recovery / baseline stabilization.** The repository is a generated prototype, not a
production-ready public site. Task 001 must make the build contract truthful and
deterministic before organizational content is published or the design pass begins.
`ROADMAP.md` holds the ordered sequence from that baseline through launch.

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
|-- README.md                         # Incomplete; truncated mid-instruction
|-- PROJECT_CONTEXT.md                # Project-level SSOT
|-- TASK_SPEC.md                      # Active task-level SSOT
|-- ROADMAP.md                        # Ordered backlog beyond the active task
|-- PRE-CONTXT-GENERATOR-PROTOCOL.md  # Workflow bootstrap protocol
|-- astro.config.mjs                  # Static output; site URL unverified
|-- package.json                      # No engines field; no check script
|-- package-lock.json
|-- tailwind.config.mjs               # Tailwind 3 configuration; plugins: []
|-- tsconfig.json                     # Astro strict TypeScript
|-- public/                           # Empty; referenced favicon and OG image are absent
|-- scripts/
|   `-- fetch-mastodon.ts             # Standalone utility; not a build hook; needs Node 22.18+
`-- src/
    |-- components/
    |   |-- Footer.astro
    |   |-- Header.astro
    |   `-- MastodonFeed.astro
    |-- content/
    |   |-- config.ts                 # Legacy content collection definition
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
    |   `-- global.css
    `-- types/
        `-- mastodon.ts
```

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

Execute `TASK_SPEC.md`. The current task is **Task 001 - Establish a truthful,
deterministic baseline**.

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
