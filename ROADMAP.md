# ROADMAP

Ordered backlog from the current baseline through launch. This file is planning material.
It is **not** authorization to change code. Work begins only when a task is promoted into
`TASK_SPEC.md` with an explicit allowed-scope list.

Established on 2026-07-30. Sequencing rationale and blocking inputs are stated per task so
a stateless session can tell what it may start without asking.

---

## Sequencing principle

Tasks are ordered so that **structural defects are fixed before content is written, and
content is settled before visual polish is applied**. Writing real copy into pages whose
paragraphs have `margin: 0` would hide the spacing defect behind new prose, and designing
a palette around placeholder copy would tune the design to text that is about to be
deleted.

Two tracks are independent and can proceed in parallel:

- **Track A (unblocked today):** Tasks 001-004. Purely structural. Requires no owner facts.
- **Track B (blocked on owner input):** Tasks 005-007.

Tasks 008-009 close out the release and depend on both tracks.

---

## Owner inputs

**The single copy of this list is the table in `PROJECT_CONTEXT.md` section 4.** This file
used to carry a second one; the two drifted - the roadmap went on blocking Track B for two
questions the owner had already answered, while omitting the contact route entirely. Read
the status from `PROJECT_CONTEXT.md` and do not restate it here.

Nothing in this roadmap authorizes inventing an owner fact. A session that cannot obtain one
must stop rather than substitute plausible text.

---

## Task 001 - Truthful, deterministic baseline

**Status: COMPLETE**, 2026-07-30.

Fixed the build contract: Node 22 pinned, `check` script added, content collection migrated
to the loader API, Mastodon configuration made honest and optional, the unverified
deployment URL removed, and the README repaired.

## Task 001b - Clear the type errors blocking `npm run check`

**Status: COMPLETE**, 2026-07-30.

Task 001 introduced `npm run check`, which immediately failed on four errors in files
outside its allowed scope. Split out rather than absorbed, to keep the scope boundary
honest. Removed three React-style `key={...}` props and fixed one `setAttribute` type
error.

## Task 001c - Astro 7 and Tailwind 4 migration

**Status: COMPLETE**, 2026-07-30. Unplanned; inserted after `npm audit` surfaced 8
advisories against astro 5.18.2 during Task 001 verification.

The upgrade forced dropping `@astrojs/tailwind`, which does not support Astro 7, so
Tailwind 4 came with it. Deleted `tailwind.config.mjs` in favour of an `@theme` block,
moved component classes out of `@layer base`, fixed the `.container` collision, and renamed
the utilities Tailwind 4 removed. `npm audit` now reports 0 vulnerabilities.

**This invalidates the Tailwind 3 assumptions in the tasks below.** They have been updated.

---

## Task 002 - Typographic system and content spacing

**Status: COMPLETE**, 2026-07-30. Merged to `main` as `8ad91ad`.

Installed `@tailwindcss/typography` and registered it with `@plugin`, which closed the
content-spacing defect. Added a fluid, semantic type scale, a 39rem measure (about 69
characters, measured in a browser rather than estimated), three mutually exclusive
section-rhythm steps, and a documented heading case convention. Both halves of the defect
were addressed: the MDX routes through `prose`, and `/`, `/locations` and `/posts` through
section and stack spacing.

Verified in a real browser at 375px and 1440px across all six routes, not from the CSS diff.
The scale and tokens are documented in `README.md`.

**Carries one durable lesson.** The plugin registers `prose` in the **utilities** layer, so
the first `.prose` customization - written inside `@layer components` - compiled cleanly and
did nothing whatever. The project's prose theme is now unlayered, next to `.container`. That
is the second bug of this exact shape in this repository. Recorded as a dated decision in
`PROJECT_CONTEXT.md`.

---

## Task 003 - Brand system, palette, and self-hosted fonts

**Status: ACTIVE**, promoted 2026-07-30. **Specified in `TASK_SPEC.md`, which is the only
authority on its scope and acceptance.**
**Blocked on:** nothing. All three owner decisions were answered on 2026-07-30.
**Touches:** `global.css`, `BaseLayout.astro`, `Header.astro`, `Footer.astro`,
`MastodonFeed.astro`, all six pages, `README.md`, plus a new `scripts/check-contrast.mjs`.

**This turned out to be a correctness fix, not a design preference.** An audit of every
foreground/background pair actually used in the templates found **nine WCAG AA failures**,
including `text-terracotta` at 3.39:1 - the most-used colour class in the codebase, covering
every link and card heading - and both button styles. This roadmap had predicted two.

The planned scope that stood here has been **cut into `TASK_SPEC.md`**, not copied. It was
still written as forward-looking - "propose two or three directions", "present to the
owner", "self-hosting is the likely recommendation" - after all of it had been decided, and
it also called for home-page section rhythm that **Task 002 already shipped**. A queued
entry that survives promotion becomes a stale second spec; promote by moving.

---

## Task 004 - Accessibility and shell correctness

**Status:** queued, and next after Task 003.
**Blocked on:** Task 003. **Correction, 2026-07-30:** an earlier version of this file said
004 could run in parallel with 003. That was wrong - both edit `Header.astro` and
`Footer.astro`. Task 003 changes colour classes there; this task changes roles, focus
behaviour and links. Run them in sequence.

Note that Task 002 already verified two things this task would otherwise have to establish:
every route has exactly one `h1` and no route skips a heading level, measured in a browser
at two widths. Heading **order** is therefore sound; what remains here is roles, focus
behaviour and the dead links.

### Planned scope

- Remove `role="menubar"` and `role="menuitem"` from `Header.astro`. These are
  application-menu patterns and contradict constraint 3.7; a `nav` with a list of links is
  correct and is what screen reader users expect on a website.
- Improve the mobile toggle. The `aria-expanded` value it emits is **correct** - this was
  checked by simulating both clicks, not by reading. The variable is merely misnamed:
  `isExpanded` holds the result of `classList.toggle('hidden')`, so it actually means
  "is hidden", and the negation cancels the confusion out. Rename it for the next reader,
  but do not "fix" the logic. What is genuinely missing is Escape-to-close, returning focus
  to the toggle on close, and closing the menu when focus leaves it.
- **Already done in Task 001b, do not redo:** the React-style `key={...}` props were removed
  from `locations.astro` and `MastodonFeed.astro`.
- Replace the two `href="#"` dead links in `Footer.astro` with real destinations or remove
  them. Dead links in a footer are a trust problem for a mutual aid group.
- Audit focus-visible styling across all interactive elements.
- **Heading order is already verified, do not re-derive it.** Task 002 measured every route
  in a browser at two widths: each has exactly one `h1` and none skips a level. The earlier
  claim in this roadmap that "several sections jump levels" was wrong and has been withdrawn.
  Re-check only if new markup is added.
- Respect `prefers-reduced-motion` for the transition utilities used throughout.

### Acceptance

- Keyboard-only traversal of every route, including opening and closing the mobile menu,
  completes without a trap.
- No invalid attributes in built HTML.
- No `href="#"` remains.

Note on verification: this task's acceptance is behavioural and cannot be signed off from a
diff. Playwright and Chromium are installed **outside** the repository so that no browser
dependency enters `package.json`. The setup is now persistent and documented in
`docs/ENVIRONMENT.md`; `verify.mjs` there already covers heading order and focus-visible
traversal groundwork.

---

## Task 005 - Real content, on-model

**Status:** queued. **Track B.**
**Blocked on:** the organization name, the geographic scope, and the locations answer in
`PROJECT_CONTEXT.md` section 4. Do not start otherwise. The contact route is **no longer a
blocker** - it is email to `info@GROUP_DOMAIN`, and no chat link goes on the site.

### Why

Every current MDX page describes a different organization than the real one: farm surplus
collection, three staffed locations, membership benefits, and a fabricated "90% of all
donations" statistic. This is a rewrite against a new model, not a find-and-replace.

### Planned scope

- Rewrite `about.mdx` around the actual model: people gather, cook together, and hand food
  directly to neighbors. Cooking classes and cultural events are described at whatever
  status the owner confirms - as intentions if they are intentions.
- Rewrite `join.mdx` for an affinity group: how someone actually shows up for a cook
  session. Remove the invented time commitments, role tiers, and "member-only" benefits.
  The call to action is **email `info@GROUP_DOMAIN`**, and a person replies. Per the
  2026-07-30 decision: no chat link anywhere, do not promise an instant join or a published
  schedule, and do not frame the reply as an application or a screening step.
- Replace `donate.mdx` with **Ways to Help**, per the 2026-07-30 decision: concrete needs
  such as ingredients, containers, kitchen time, transport. The 90% claim is withdrawn and
  must not reappear in any form.
- Replace `src/data/locations.json` with a data file matching the real model, per the
  2026-07-30 decision. The schema changes, not just the values: `phone` and `email` per site
  are removed because they do not exist, and staffed `hours` become a cook-and-distribute
  rhythm.
- Add a Zod schema for that data file. It is currently imported raw with no validation.
- Update `locations.astro` to the new shape and rename the route if the owner prefers
  different language.
- Consider a food-safety note, if the owner wants one. Groups handing out home-cooked food
  often want to state their practices plainly.

### Acceptance

- No fabricated address, phone number, email, statistic, or founding date remains anywhere
  in `src/`.
- Every factual claim traces to a specific owner input.
- Aspirational programs are worded as intentions.

---

## Task 006 - Mastodon integration, wired end to end

**Status:** queued. **Track B.**
**Blocked on:** the Mastodon handle in `PROJECT_CONTEXT.md` section 4, and Task 001 for the
runtime and the honest-config work.

### Why

The integration is currently non-functional on two independent levels: the fetch script
cannot execute on Node 20 at all, and even with a populated cache the feed component would
print raw HTML markup to visitors.

### Planned scope

- Confirm the account, then run a real ingestion and inspect the cached payload. Every claim
  about this feature so far has been made against an empty array.
- **Resolve the HTML rendering defect.** `MastodonFeed.astro` interpolates `post.content`,
  an HTML string, into a text node, so visitors see literal `<p>` tags. Two viable
  approaches, to be decided explicitly:
  - Convert to plain text at **build time** in the fetch script, storing a clean text field
    alongside the original. Simple, no runtime dependency, loses links inside posts.
  - Sanitize to an allowlist of elements (`p`, `br`, `a`, `em`, `strong`) at build time and
    render the sanitized result. Preserves links, requires a sanitizer dependency and an
    explicit architectural decision under constraint 3.6.
  - Either way the transformation happens at build time, never in the browser, and
    constraint 3.8 continues to forbid `set:html` on unsanitized input.
- Handle Mastodon custom emoji and mentions, which arrive as markup and will otherwise look
  broken.
- Design real empty and unconfigured states. "No updates available at the moment" is shown
  today for both "the group has not posted" and "no account is configured", which are very
  different situations.
- Decide a cache-staleness policy: a static site shows whatever was cached at build time,
  so a feed can silently go months stale. Either show the post date prominently or trigger
  periodic rebuilds.
- Add the real Mastodon link with `rel="me"` so the account can verify the site back.
- Consider whether media attachments should be proxied or hot-linked from the instance.

### Acceptance

- A real ingestion produces a non-empty cache, and the rendered page shows readable text
  with no visible markup.
- Build succeeds with the account configured and with it unset.
- No client-side request to any Mastodon instance.

---

## Task 007 - Brand assets and metadata

**Status:** queued. **Track B.**
**Blocked on:** Task 003 palette, and the logo/wordmark in `PROJECT_CONTEXT.md` section 4.

### Planned scope

- Create `public/favicon.svg` and the OG image at `/images/og-default.jpg`. Both are
  referenced by `BaseLayout.astro` today and both 404 on every route.
- Replace the emoji logo in `Header.astro` with a real wordmark or a deliberate typographic
  treatment.
- Complete metadata: canonical URLs, `og:url`, `og:site_name`, `og:locale`, and per-page
  descriptions. Several pages currently inherit the generic default.
- Add `sitemap` and `robots.txt`.

---

## Task 008 - Deployment

**Status:** queued.
**Blocked on:** the domain purchase and the Cloudflare Pages URL in `PROJECT_CONTEXT.md`
section 4, and Tasks 001-007 for anything publishable. The domain also fills the
`GROUP_DOMAIN` token in the contact address, so it gates the pre-publication token check.

### Planned scope

- Create or confirm the Cloudflare Pages project; record the real URL as a dated decision.
- Set `NODE_VERSION` to match `.nvmrc`, or the `prebuild` Mastodon step will fail in CI the
  same way it fails locally on Node 20.
- Configure `MASTODON_ACCOUNT` and the canonical site variable in the Pages environment.
- Set the canonical `site` in `astro.config.mjs` only once the URL is confirmed.
- Add security headers.
- Verify the deployed build against a real mobile device, not only a narrow viewport.

---

## Task 009 - Verification and maintenance

**Status:** queued.
**Blocked on:** Task 001.

### Planned scope

- CI running `npm ci`, `npm run check`, `npm run build`, and `npm audit` on pull requests.
- **Resolve the zod deprecation.** Astro 7 deprecated the `z` re-export from
  `astro:content`, producing 12 hints in `src/content.config.ts`. Fixing it means declaring
  `zod` as a direct dependency, which needs an owner decision under constraint 3.6. It is
  currently present only as a transitive dependency of astro, so importing it directly today
  would depend on npm hoisting and is not safe.
- A link checker, given how many dead and invented links the scaffold shipped with.
- An automated accessibility pass on built HTML.
- Dependency update automation.
- A pre-publication checklist asserting no fabricated data remains.

---

## Deliberately not planned

Recorded so a future session does not treat these as oversights:

- No CMS. Content volume does not justify one, and MDX in git suits a small group.
- No newsletter, forms, or contact backend. Each would breach the static boundary in
  constraint 3.11 and needs a new architectural decision.
- No analytics, unless the owner asks. A mutual aid site has good reasons to avoid tracking
  its visitors.
- No event calendar until cultural events are actually recurring.
- No recipe collection. That belongs to the separate `veganhomecooks` site.
