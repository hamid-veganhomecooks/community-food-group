# AI COLLABORATION PROTOCOL & PROJECT CONTEXT

## 1. OPERATIONAL ROLE & SESSION CONTEXT

You are participating in a modular, multi-session software-development workflow.

- Every session is isolated and stateless.
- Treat this file as the project-level single source of truth.
- Treat `TASK_SPEC.md` as the single source of truth for the active task.
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
- **Structured data:** JSON for locations and the generated Mastodon cache
- **Styling / UI:** Tailwind CSS 3.4 through `@astrojs/tailwind` 5.1; `lucide-astro` icons
- **External data:** Optional Mastodon account feed fetched by a Node build-time utility
- **Architecture:** Static-first Jamstack. JavaScript is used only where interaction requires it, currently the mobile navigation toggle.
- **Package manager:** npm with a committed `package-lock.json`
- **Current Node contract:** Not yet consistently defined. The README says Node 18+, while direct execution of the TypeScript ingestion script requires Node 22.18+ or a TypeScript runner.

Important distinction: this is a separate Astro project. It is not the Hugo-based `veganhomecooks` site and must not inherit that repository's Hugo theme, recipes, Worker, R2, or deployment assumptions.

---

## 3. NON-NEGOTIABLE DEVELOPMENT CONSTRAINTS

1. **Zero placeholders in production output:** Never invent addresses, phone numbers, email addresses, social accounts, donation claims, operating statistics, dates, or organizational history. Unknown public content must be omitted, clearly modeled as draft data, or supplied by the project owner.
2. **No incomplete code:** Never output `TODO`, ellipses, truncated functions, fake links, or copy-paste-incomplete blocks unless the task explicitly requests a sketch.
3. **Strict scope compliance:** Only change files listed in `TASK_SPEC.md`. Do not refactor adjacent code unless the task identifies it as required.
4. **Observed state beats planned state:** Never claim a file, dependency, build hook, component, route, deployment, or test exists until verified in the repository.
5. **Type safety:** Keep Astro's strict TypeScript configuration. Avoid `any`; validate external API data before using it.
6. **Minimal dependencies:** Prefer the platform, Astro, and existing packages. A new package requires an explicit architectural decision in this file and authorization in `TASK_SPEC.md`.
7. **Accessibility:** Target WCAG 2.2 AA. Use semantic website navigation, keyboard-operable controls, visible focus styles, meaningful alternative text, and reduced-motion-safe behavior. Do not use application-menu ARIA patterns for ordinary site navigation.
8. **External HTML is untrusted:** Mastodon status HTML must never be rendered with `set:html` unless it is sanitized by an explicitly approved strategy. Escaped plain text is safer than unsanitized HTML.
9. **No browser-side Mastodon API calls:** Mastodon data is retrieved before rendering and stored in `src/data/mastodon-posts.json`.
10. **Deterministic verification:** Every implementation task must run the checks named in its acceptance criteria. Do not report success from inspection alone.
11. **Static boundary:** Do not add a Cloudflare Worker, database, form handler, authentication, or other server runtime without a new architectural decision.
12. **No secrets in Git:** Environment-specific values belong in local or Cloudflare environment settings. Commit only documented examples.

---

## 4. CURRENT ARCHITECTURAL DECISIONS & MEMORY STATE

### Accepted decisions

- **[2026-07-29]** Astro 5 static output and Cloudflare Pages were selected for the MVP.
- **[2026-07-29]** Editorial pages are MDX; locations are structured JSON.
- **[2026-07-29]** The visual direction is warm, approachable, high-contrast, mobile-first, using terracotta, sage, and cream.
- **[2026-07-29]** Mastodon ingestion is build-side only. The intended cache is `src/data/mastodon-posts.json`.
- **[2026-07-29]** No Worker, database, account system, or client-side Mastodon fetch is part of the MVP.
- **[2026-07-29]** Accessibility is a release requirement, not a later enhancement.

### Repository baseline observed on `main`

The repository was inspected at commit `7394fbe52888f5edce1682d4009c5e0b7f3420cd` (`Initial Astro site`, 2026-07-29).

- The Astro scaffold, six routes, layout, navigation, footer, MDX pages, locations JSON, Mastodon component, type definition, fetch script, and Tailwind styles exist.
- Installed styling is Tailwind **3.4**, not Tailwind 4.
- Icons come from `lucide-astro`, not React.
- `src/components/LocationCard.astro`, `DonateSection.astro`, and `JoinCTA.astro` do not exist. Earlier repository maps that list them describe an unrealized design, not current files.
- `npm run build` runs only `astro build`; it does not run `scripts/fetch-mastodon.ts`.
- `npm run fetch-mastodon` invokes `node scripts/fetch-mastodon.ts`. This is not compatible with the README's broad Node 18+ claim without a runner or transpilation step. Native type stripping is available without a flag only on Node 22.18+.
- `src/content/config.ts` uses the legacy content-collection location and `type: 'content'`. The routes look up entries by `page.slug`. The current Astro 5 content-loader API uses `src/content.config.ts`, a loader, and `entry.id`; this area requires migration and build verification.
- `README.md` ends in the middle of setup instructions and contains a clone placeholder.
- `BaseLayout.astro` references `/favicon.svg` and `/images/og-default.jpg`; those assets were not found.
- `Footer.astro`, `.env.example`, the MDX documents, and `src/data/locations.json` contain invented contact information, locations, social links, history, schedules, and impact claims. They are scaffold content and are not approved public facts.
- The default Mastodon handle `@communityfood@mastodon.social` is unverified scaffold data.
- The Mastodon component currently renders status HTML as escaped text. Do not switch to raw HTML without sanitization.
- There is no CI workflow, automated test suite, formatter, lint command, or explicit type-check command.
- Cloudflare Pages configuration and a production URL have not been verified. `astro.config.mjs` currently names `https://community-food-group.pages.dev`, which must be treated as unconfirmed.

### Current phase

**Recovery / baseline stabilization.** The repository is a generated prototype, not a production-ready public site. The next work must make the build contract truthful and deterministic before visual expansion or publication of organizational content.

### Open owner inputs

These are product-content decisions and must not be invented by an implementation model:

- Final public project/organization name
- Geographic scope
- Approved about, join, donation, and food-safety language
- Real locations, schedules, contact details, and map destinations
- Mastodon account URL/handle and any other approved external links
- Confirmed Cloudflare Pages project URL and production domain
- Approved favicon, logo, social image, and other brand assets

---

## 5. REPOSITORY MAP (OBSERVED PATHS)

```text
/
├── .env.example                     # Scaffold Mastodon variables; values unverified
├── .gitignore
├── README.md                        # Present but incomplete
├── PROJECT_CONTEXT.md               # Project-level SSOT
├── TASK_SPEC.md                     # Active task-level SSOT
├── astro.config.mjs                 # Static output; site URL unverified
├── package.json
├── package-lock.json
├── tailwind.config.mjs              # Tailwind 3 configuration
├── tsconfig.json                    # Astro strict TypeScript
├── scripts/
│   └── fetch-mastodon.ts            # Standalone fetch/cache utility; not a build hook
└── src/
    ├── components/
    │   ├── Footer.astro
    │   ├── Header.astro
    │   └── MastodonFeed.astro
    ├── content/
    │   ├── config.ts                # Legacy content collection definition
    │   └── pages/
    │       ├── about.mdx
    │       ├── donate.mdx
    │       └── join.mdx
    ├── data/
    │   ├── locations.json           # Unapproved scaffold records
    │   └── mastodon-posts.json      # Generated cache; currently an empty array
    ├── env.d.ts
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/
    │   ├── about.astro
    │   ├── donate.astro
    │   ├── index.astro
    │   ├── join.astro
    │   ├── locations.astro
    │   └── posts.astro
    ├── styles/
    │   └── global.css
    └── types/
        └── mastodon.ts
```

Files named in an earlier plan but absent from the repository are not part of the current architecture unless a future task explicitly creates them.

---

## 6. ACTIVE SESSION TASK PAYLOAD

### Session role

`IMPLEMENTER`

### Active task

Execute `TASK_SPEC.md`. The current task is **Task 001 — Establish a truthful, deterministic baseline**.

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
