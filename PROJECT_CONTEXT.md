# AI COLLABORATION PROTOCOL & PROJECT CONTEXT

## 1. OPERATIONAL ROLE & SESSION CONTEXT
You are participating in a modular, multi-session software development workflow. 
* Every session is isolated and stateless. 
* You do not need to manage full historical conversational memory beyond the context provided in this file and the active task payload.
* Your objective for this session will be explicitly defined at the bottom of the prompt (e.g., ARCHITECT, IMPLEMENTER, REVIEWER, or DEBUGGER).

---

## 2. CORE SYSTEM & TECH STACK
* **Framework / Language:** Astro 5.x (Static Site Generator, TypeScript)
* **Hosting / Edge:** Cloudflare Pages (static deployment, zero server runtime)
* **API / Worker:** Cloudflare Worker (only if real-time Mastodon proxy or form handling is needed; otherwise pure static)
* **Database / Storage:** None (Git-based content via MDX; Mastodon posts fetched at build time and cached as JSON)
* **Styling / UI:** Tailwind CSS v4, Lucide React icons
* **Architecture Style:** Static-first, Jamstack, build-time data ingestion

---

## 3. NON-NEGOTIABLE DEVELOPMENT CONSTRAINTS
1. **Zero Placeholders:** Never output code with `// TODO: implement later`, `// ... rest of code`, or truncated functions unless explicitly instructed. Every code block must be copy-paste ready.
2. **Strict Scope Compliance:** Only touch or modify files/functions explicitly assigned in the task. Do not refactor adjacent code unless directly required for the fix.
3. **Type Safety & Clean Code:** Write clean, defensive code with explicit typing. Handle failure modes and edge cases gracefully. All Astro components use `.astro` or `.tsx` with strict TypeScript.
4. **Minimal Dependencies:** Do not import new external npm/pip packages without explicit task authorization. Use Astro built-ins, Tailwind, and Lucide only.
5. **Accessibility First:** All markup must meet WCAG 2.1 AA. Semantic HTML, ARIA labels where needed, keyboard-navigable, color-contrast compliant.
6. **No Client-Side Mastodon Calls:** Mastodon data is fetched exclusively at build time via Astro's `getStaticPaths` or `Astro.glob` / data loaders. No client-side fetch to Mastodon API to avoid CORS and rate-limit issues.

---

## 4. CURRENT ARCHITECTURAL DECISIONS & MEMORY STATE
* **[2026-07-29]:** Astro 5 chosen for static output, native content collections, and Islands architecture. Zero JS shipped by default.
* **[2026-07-29]:** Build-time Mastodon ingestion strategy selected over real-time embeds. A Node script (`scripts/fetch-mastodon.ts`) runs during `astro build` to pull the latest N posts from the group's Mastodon account via public API, writing them to `src/data/mastodon-posts.json`. This JSON is then consumed by Astro components at build time.
* **[2026-07-29]:** Content pages (About, Join, Donate, Locations) authored in MDX under `src/content/pages/` using Astro Content Collections with Zod schema validation.
* **[2026-07-29]:** Locations stored as structured YAML/JSON in `src/data/locations.json` rather than hardcoded in components, enabling non-dev volunteers to PR updates easily.
* **[2026-07-29]:** Cloudflare Pages deployment configured with `astro build` output directory `dist/`. No Worker required for MVP; if contact forms or donations need a backend, a Worker will be added later.
* **[2026-07-29]:** Design direction: warm, approachable, high-contrast, mobile-first. Color palette: earthy tones (terracotta, sage green, cream) to reflect community/food themes.

---

## 5. REPOSITORY MAP (RELEVANT PATHS)
```text
/
├── public/                          # Static assets (images, favicon, fonts)
│   └── images/
├── scripts/                         # Build-time utilities
│   └── fetch-mastodon.ts            # Fetches Mastodon posts, writes to src/data/
├── src/
│   ├── components/                  # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── MastodonFeed.astro       # Displays build-time ingested posts
│   │   ├── LocationCard.astro
│   │   ├── DonateSection.astro
│   │   └── JoinCTA.astro
│   ├── layouts/
│   │   └── BaseLayout.astro         # HTML shell, meta tags, Tailwind import
│   ├── pages/                       # File-based routing
│   │   ├── index.astro              # Landing: hero, latest posts preview, locations teaser
│   │   ├── about.astro              # About the group (pulls from content collection)
│   │   ├── locations.astro          # Full locations list with map links
│   │   ├── join.astro               # How to join / volunteer
│   │   ├── donate.astro             # Donation info
│   │   └── posts.astro              # Full Mastodon post archive
│   ├── content/
│   │   └── pages/                   # MDX content for editorial pages
│   │       ├── about.mdx
│   │       ├── join.mdx
│   │       └── donate.mdx
│   ├── data/
│   │   ├── locations.json           # Structured location data
│   │   └── mastodon-posts.json      # Build-time generated Mastodon cache
│   ├── styles/
│   │   └── global.css               # Tailwind directives + custom properties
│   └── env.d.ts
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── PROJECT_CONTEXT.md
```

---

## 6. ACTIVE SESSION TASK PAYLOAD

### Session Role: IMPLEMENTER

### Task Goal:
Bootstrap the Astro project scaffold with Tailwind CSS configured, set up the content collection schema for MDX pages, create the `BaseLayout.astro` shell with semantic HTML and responsive navigation, and implement the `scripts/fetch-mastodon.ts` build-time ingestion script that pulls the latest 20 posts from a configurable Mastodon account handle and writes them to `src/data/mastodon-posts.json`.

### Input Code / Relevant Files:
*No existing codebase — this is initial project scaffolding.*

### Expected Output Format:
* **If ARCHITECT:** Provide a step-by-step implementation plan and individual task specifications for implementation models.
* **If IMPLEMENTER:** Output production-ready, complete code blocks with file path headers. Create all files needed for the scaffold to be runnable via `npm run build` and `npm run dev`.
* **If REVIEWER:** Audit for logic errors, missing edge cases, and safety. Provide exact diffs or revised blocks.
* **If DEBUGGER:** Identify root cause from error logs and provide the exact corrected code block.
