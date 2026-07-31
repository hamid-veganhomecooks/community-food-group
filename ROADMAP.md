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
- **Track B (blocked on owner input):** Tasks 005-007. Cannot start until the inputs table
  in `PROJECT_CONTEXT.md` section 4 is filled in.

Tasks 008-009 close out the release and depend on both tracks.

---

## Owner inputs still required

Track B is blocked until these are supplied. Nothing in this roadmap authorizes inventing
them, and a session that cannot obtain them must stop rather than substitute plausible text.

1. Final public organization name.
2. Town or geographic scope, and how precisely the group wants it stated publicly.
3. The cook-and-distribute rhythm: which days, roughly what times, how often.
4. Where cooking happens and where food is distributed. For each: a name, whether the
   address should be public, and whether a map link is wanted.
5. One contact route the group actually monitors.
6. Mastodon handle in `user@instance` form, or confirmation that no account exists yet.
7. Which activities are **real today** versus **aspirational**. Specifically: have cooking
   classes or cultural events actually happened, or are they intentions? Copy must not
   describe an intention as an established program.
8. Anything the group does **not** want published: exact addresses, organizer names,
   distribution times that could attract harassment.
9. Logo or wordmark, if one exists.
10. Whether a Cloudflare Pages project exists yet, and any intended domain.

---

## Task 001 - Truthful, deterministic baseline

**Status:** active, specified in `TASK_SPEC.md`. Not started.
**Blocked on:** nothing except a local Node 22.18+ runtime.

Fixes the build contract: Node version, `check` script, Astro 5 content-collection
migration, honest and optional Mastodon configuration, removal of the unverified deployment
URL, and a repaired README. Full specification lives in `TASK_SPEC.md`.

---

## Task 002 - Typographic system and content spacing

**Status:** queued. This is the fix for the reported "everything is compressed" problem.
**Blocked on:** Task 001 (touches `package.json` and `tailwind.config.mjs`, which 001 also
edits; sequencing avoids a lockfile conflict).

### Why

The editorial pages are not under-styled by degree, they are unstyled by mechanism. The
routes ask for `prose prose-lg`, no plugin supplies those classes, and preflight has already
stripped every default margin. The result is a solid block of text with no paragraph
separation and no list markers. See the verified findings in `PROJECT_CONTEXT.md` section 4.

Note that the defect has **two independent halves**, and fixing only the first will leave
half the site still cramped:

- `/about`, `/join`, `/donate` render MDX and depend entirely on `prose`.
- `/`, `/locations`, `/posts` are hand-authored Astro markup whose rhythm comes from
  section, container, and stack spacing. The typography plugin does nothing for them.

### Planned scope

- Add `@tailwindcss/typography` (authorized in `PROJECT_CONTEXT.md`, 2026-07-30) and
  register it in `tailwind.config.mjs`.
- Define an explicit type scale rather than accepting per-page ad hoc sizes. Current pages
  hardcode `text-4xl md:text-5xl lg:text-6xl` in three places with no shared definition.
- Set a **measure**: body copy constrained to roughly 65-75 characters. The editorial pages
  currently allow `max-w-4xl` of full-width prose, which is too wide to read comfortably
  even once spacing is fixed.
- Customize the `prose` theme so it inherits the project palette instead of Tailwind's
  default gray, and so heading spacing is deliberate: generous space **above** a heading,
  tight space below it, so headings group with the text they introduce.
- Establish vertical rhythm tokens for section padding, and fix the `.section` helper.
- Restructure `src/styles/global.css`: `.btn-primary`, `.btn-secondary`, `.card`,
  `.section`, and `.container` are currently declared in `@layer base`, where component
  classes do not belong.
- **Fix the `.container` collision.** The custom `.container` in the base layer is
  overridden by Tailwind's own `.container` from the components layer, so the intended
  1280px max-width silently becomes 1536px at large viewports. Verified in the compiled
  stylesheet. Either disable Tailwind's `container` core plugin or rename the custom class.
- Decide a **heading case convention** and document it: title case for page and section
  headings, sentence case for sub-headings and UI labels. Apply consistently, since the
  current content mixes both.

### Acceptance

- Compiled CSS contains `prose` rules; paragraph and list spacing is non-zero on all three
  editorial routes.
- Lists in `about.mdx` render with visible markers.
- Exactly one `.container` definition wins at every breakpoint, verified in the built CSS.
- No page hardcodes a heading size outside the shared scale.
- Type scale and spacing tokens are documented in the README or a short `docs/` note.

---

## Task 003 - Brand system and palette selection

**Status:** queued. Owner chose a new palette plus a full type system on 2026-07-30.
**Blocked on:** Task 002 for the type scale; the palette portion needs an owner decision
between proposed directions, but not the content facts.

### Why

The terracotta/sage/cream direction was generated, never chosen. Reopening it is cheap now
and expensive after real content and imagery exist.

### Planned scope

- Propose **two or three complete palette directions**, each as a token set rather than a
  list of swatches: surface, raised surface, primary text, secondary text, brand, brand
  hover, accent, border, focus ring, and inverse-surface pairings.
- Validate every foreground/background pair against WCAG 2.2 AA (4.5:1 body, 3:1 large text
  and UI boundaries) **before** presenting, and state the measured ratios. Several current
  combinations are unverified; `text-cream/90` on the terracotta gradient and the
  `sage-light/20` feature chips are the likeliest failures.
- Present the directions to the owner and record the chosen one as a dated decision.
- Implement the winner as semantic Tailwind tokens (`surface`, `ink`, `brand`) rather than
  literal color names, so a future palette change does not require editing every template.
- Decide font strategy. `BaseLayout.astro` currently loads Inter from the Google Fonts CDN,
  which adds two preconnects and a render-blocking request, and sends visitor IPs to a
  third party. Self-hosting is the likely recommendation and requires an explicit
  dependency decision.
- Define the "room for design" the current pages lack: an editorial page template with a
  real header zone, and a home page with distinct section rhythm rather than four
  near-identical stacked bands.

### Acceptance

- Chosen palette recorded as a dated decision in `PROJECT_CONTEXT.md`.
- Every text/background pair in the shipped design has a recorded contrast ratio meeting AA.
- No literal palette hex values remain in component markup.

---

## Task 004 - Accessibility and shell correctness

**Status:** queued.
**Blocked on:** nothing; may run in parallel with 002 and 003 if scoped to different files.

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
- Remove the React-style `key={...}` props in `locations.astro` and `MastodonFeed.astro`,
  which Astro emits as invalid DOM attributes.
- Replace the two `href="#"` dead links in `Footer.astro` with real destinations or remove
  them. Dead links in a footer are a trust problem for a mutual aid group.
- Audit focus-visible styling across all interactive elements.
- Verify heading order on every route: `/` currently opens with an `h1` inside the hero but
  several sections jump levels.
- Respect `prefers-reduced-motion` for the transition utilities used throughout.

### Acceptance

- Keyboard-only traversal of every route, including opening and closing the mobile menu,
  completes without a trap.
- No invalid attributes in built HTML.
- No `href="#"` remains.

---

## Task 005 - Real content, on-model

**Status:** queued. **Track B.**
**Blocked on:** owner inputs 1-8 above. Do not start otherwise.

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
**Blocked on:** owner input 6, and Task 001 for the runtime and the honest-config work.

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
**Blocked on:** Task 003 palette, owner input 9.

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
**Blocked on:** owner input 10, and Tasks 001-007 for anything publishable.

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

- CI running `npm ci`, `npm run check`, and `npm run build` on pull requests.
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
