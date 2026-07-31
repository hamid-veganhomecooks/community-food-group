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

- **Track A (unblocked today):** Tasks 001-004 and 004b. Purely structural. Requires no owner
  facts - 004b centralizes the identity values without filling them.
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

**Status: COMPLETE**, 2026-07-31. Merged to `main` as `faf489e`.

Replaced the scaffold palette with a two-layer token system - fourteen brand inputs feeding
sixteen semantic roles - and implemented Direction B (Garden). Closed **nine measured WCAG AA
failures**, including `text-terracotta` at 3.39:1, which was the most-used colour class in the
codebase and covered every link and card heading. This roadmap had predicted two, so the task
was a correctness fix rather than the design preference it was queued as. Also shipped
`scripts/check-contrast.mjs`, zero-dependency and parsing the real tokens rather than a
duplicate list, and moved Inter off the Google Fonts CDN to Astro's built-in Fonts API, so no
visitor IP reaches a third party.

The dated decisions are in `PROJECT_CONTEXT.md` section 4, which is their only copy.

**Carries one durable lesson.** `astro.config.mjs` turned out to be part of the design-system
surface, not just deployment config, because self-hosting fonts is configured there. The
task's allowed-scope list did not include it. That gap was hit mid-task and resolved by an
explicit owner-approved scope expansion rather than a silent edit - which is the behaviour the
protocol wants when scope and repository disagree.

---

## Task 004 - Accessibility and shell correctness

**Status: ACTIVE**, promoted 2026-07-31. **Specified in `TASK_SPEC.md`, which is the only
authority on its scope and acceptance.**
**Blocked on:** nothing. Task 003 is merged.
**Touches:** `Header.astro`, `Footer.astro`, `global.css` (focus and reduced-motion only), and
`scripts/verify-baseline.sh`.

The planned scope that stood here has been **cut into `TASK_SPEC.md`**, not copied. Two of its
items had already been overtaken by the repository before promotion: the mobile toggle's
`isExpanded` variable was renamed in a prior commit, and the roadmap still asked for it. The
promoted spec records both as already-done so a stateless session does not redo them.

Two items were also **added** at promotion, from reading the current files rather than this
entry: a WCAG 2.5.3 Label in Name failure on the footer's social links, and wiring
`npm run check:contrast` into `npm run verify`, which Task 003 shipped but could not wire
because `verify-baseline.sh` was outside its scope.

---

## Task 004b - Site config and the fork-and-adopt surface

**Status:** queued, and next after Task 004. Unplanned; inserted 2026-07-31 on an owner
decision to shape the repository for reuse by other groups. **Track A** - it needs no owner
facts, because the values it centralizes may stay as tokens.
**Blocked on:** Task 004. Both edit `Header.astro` and `Footer.astro`; this is the same
collision that forced 003 and 004 into sequence. Do not run them in parallel.
**Sequenced before Task 005** so that content work is not written and then immediately
refactored into config.

### Why

The reuse model is recorded in `PROJECT_CONTEXT.md` section 2 and is the authority on it: this
repository is a **template plus one group's instance**, adopted by forking, never
multi-tenant.

There is also a live defect to fix. **`"Community Food Group"` is hardcoded in 9 places across
`src/`** - the header wordmark, the footer heading and copyright line, `siteTitle` in
`BaseLayout.astro`, the `author` default in `content.config.ts`, the `index.astro`
description, and a `MastodonFeed.astro` fallback - while `GROUP NAME` appears **zero** times.
The owner input is still deferred, so the site is currently shipping a plausible-sounding
invented organization name in its `<title>` and its copyright notice. That is precisely the
"dishonest presence" that section 4 contrasts against an honest token: it is
`info@example.com` wearing a different hat.

**Why config rather than hardcoding real values and rebranding later with an editor or an AI.**
Find-and-replace rebranding is *unverifiable*. There is no build-time assertion that every
occurrence was caught, and the missed one will be in an `og:description` or an `aria-label`
rather than in an `h1` where someone would notice. Section 4 already requires that every token
be greppable by one documented pattern and that Task 009 fail the build while any remain;
collapsing the identity constants into one object makes that check a validation of a single
file instead of a regex fight across the tree. This is the same argument that produced
`check-contrast.mjs`: a guard that reads the real source of truth beats a duplicate list and
beats human vigilance.

### Planned scope

- **Create `site.config.ts`** at the repository root, holding only identity constants: group
  name, city, region, domain, contact email, and social accounts. Typed with an exported
  interface and `as const satisfies SiteConfig`, so `npm run check` validates it at build with
  **zero new dependencies**. This deliberately avoids the zod decision still open in Task 009.
- **Model deliberate absence in the type, not in a comment.** A social account is
  `{ handle: string } | null`, where `null` means *this group has chosen not to have one* -
  not *unknown, awaiting a value*. Section 4 warns that a future session must not "helpfully"
  add a chat link; a type with no third state makes that structural rather than advisory. The
  withdrawn Signal link is the precedent.
- **Replace all 9 hardcoded occurrences** with config reads, in `Header.astro`,
  `Footer.astro`, `BaseLayout.astro`, `content.config.ts`, `index.astro` and
  `MastodonFeed.astro`. The name becomes the `GROUP NAME` token *in one place*.
- **Create `scripts/check-config.mjs`**, wired as `npm run check:config` and added to the
  uncached half of `verify-baseline.sh` alongside `check:contrast`. Zero dependencies, same
  shape as the contrast script: scan for surviving `SCREAMING_CASE` tokens by the single
  documented pattern, print each with its location, exit non-zero if any remain. **Prove it
  fails** before declaring it works - a validator never seen to fail is not yet a validator.
  This becomes the mechanism for Task 009's pre-publication check.
- **Broaden `README.md`'s existing `## Rebranding this site` section** into the four adoption
  surfaces. It currently documents colour only. Colour becomes one of four, not a competing
  section - **do not add a second rebranding heading.** State plainly which surfaces an adopter
  edits and, more importantly, that **prose is rewritten rather than tokenized**, so a forking
  group does not try to parameterize the MDX and ship mad-libs.

### Explicitly out of scope

- **Any interpolation of config into the MDX documents.** Section 2 forbids it. If a sentence
  needs a token to make sense, it belongs to the adopting group.
- Filling `GROUP NAME` or `GROUP_DOMAIN` with real values. Both are still owner inputs.
- `src/data/locations.json` and page copy. **Task 005.**
- Any colour token, the type scale, or the accessibility work from Task 004.
- Licence choice and contributor guidance for adopters. Real questions, but not this task.

### Acceptance

- `grep -rn 'Community Food Group' src/` returns **nothing**. Paste the result.
- `site.config.ts` is the only file in the repository containing an unfilled identity token.
- `npm run check` reports 0 errors; a deliberately wrong config field is proven to fail it.
- `npm run check:config` exits non-zero while `GROUP NAME` is unfilled, and its output names
  the field. This is the expected state today - **the task ships with the check failing on
  purpose**, because the name genuinely is not known. Do not weaken the check to make it pass.
- `npm run build` still emits the same six routes, and the rendered `<title>`, footer and
  header show the token rather than an invented name.
- `README.md` has exactly one rebranding section, covering four surfaces.

---

## Task 004c - Licence

**Status: COMPLETE**, 2026-07-31, implemented in the working tree and **not yet committed**.
Unplanned; inserted on an owner decision to make the repository a public resource. Executed
directly rather than queued, on explicit owner authorization, because it touches no source
file and therefore cannot collide with the active Task 004. Recorded here rather than done
silently, following the Task 003 precedent for owner-approved scope grants.

Dedicated the repository to the public domain under **CC0 1.0 Universal**. The canonical legal
text was fetched from `creativecommons.org` rather than reproduced from memory, and verified
complete (all four sections plus the Statement of Purpose) and pure ASCII, which satisfies
constraint 3.13.

**Why a dedication rather than a permissive licence.** The owner wanted the broadest possible
grant, with no attribution and no use restrictions. A licence grants rights while retaining
copyright; CC0 waives it as far as law allows and carries a fallback unconditional licence for
jurisdictions where copyright cannot be abandoned. CC0 also covers prose and documentation as
well as it covers code, which matters here - `PROJECT_CONTEXT.md`, this file, and the
accessibility reasoning are a large part of what an adopting group gets. The tradeoff accepted
knowingly: CC0 is **not OSI-approved** and expressly does not waive patent rights. `0BSD` was
the alternative considered and rejected, on the grounds that a static site has no patent
surface worth the loss of documentation coverage.

**Three carve-outs are documented in `README.md`**, because CC0 cannot give away what the
project never owned: the group's name and identity (trademark is not waived by CC0), the Inter
typeface (**SIL OFL 1.1**, verified at source - bundling is permitted, the notice travels with
the build, and a modified font may not keep the reserved name), and the truthfulness of the
page copy, which describes a real group and would be false if republished unchanged.

Files: `LICENSE` (new), `package.json` (`"license": "CC0-1.0"`), `README.md` (the `## Licence`
section, previously "Not yet chosen").

**Still open, and deliberately not done here:** contributor guidance. CC0 only covers what the
owner holds, so if contributors arrive, a `CONTRIBUTING.md` stating that contributions are
dedicated under CC0 is needed. Cheap now, painful to retrofit once patches have landed.

---

## Task 005 - Real content, on-model

**Status:** queued. **Track B.** Next after Task 004b.
**Blocked on:** the organization name in `PROJECT_CONTEXT.md` section 4. Do not start
otherwise. *Note: Task 004b reduces this blocker but does not remove it - the name will live
in one config field rather than nine files, but the prose still has to be written knowing what
the group is called.* Three former blockers cleared: the contact route is email to `info@GROUP_DOMAIN`
with no chat link anywhere, the **geographic scope is Tucson, Arizona** and the `CITY` token
is retired, and the **garden is settled in full**. Whether the cook and distribution sites are
named publicly is still open, but that gates only those records - the garden record can be
written today.

### Why

Every current MDX page describes a different organization than the real one: farm surplus
collection, three staffed locations, membership benefits, and a fabricated "90% of all
donations" statistic. This is a rewrite against a new model, not a find-and-replace.

### The garden changes the data model, not just the copy

Owner input, 2026-07-31. **The full decision, the verified third-party details and the exact
permitted framing live in `PROJECT_CONTEXT.md` section 4, which is their only copy. Read it
before writing garden copy.** Summarized here only insofar as it changes the shape of this
task:

**It is a schema change, not a values change.** This entry previously assumed one flat shape
for every site, with `hours` collapsed into a cook-and-distribute rhythm. That is wrong. A
distribution point deliberately publishes **no** time, because the schedule is set close to
the date and publishing it in advance would be inaccurate. The garden has a real cadence and a
real street address, but must **not** get a directions link, because the site requires a
membership the reader does not have. One flat shape forces one of them to carry a falsehood or
a dead field. Use a `kind` discriminator - garden, distribution, cook-session - make the Zod
schema a discriminated union rather than one optional-heavy object, and make the address, the
map link and the cadence render per `kind`.

**The card affordance survives; the record does not.** The existing `community-garden` entry
in `src/data/locations.json` is scaffold: `789 Garden Lane, Springfield`, `(555) 456-7890`,
`garden@communityfood.org`, and seven days of 8:00-6:00 hours. Every one of those is invented
and every one falls under constraint 1. **"Keep the community garden card" means keep the card
for the real plot, not keep the row.**

**Two phrases will fail review if they reach the page.** "Our community garden" - the group
rents a plot at a garden run by someone else - and "members", which now means three
incompatible things. Section 4 explains both.

**"Community Garden" is currently also a feature chip on `main-hub`.** There is one plot. The
chip vocabulary - "Workshop Space", "Learning Center", "Community Outreach" - is invented
alongside the rest and is not a naming problem to fix in place.

### Planned scope

- Rewrite `about.mdx` around the actual model: people in Tucson gather, cook together, and
  hand food directly to neighbors. Cooking classes and cultural events are described at
  whatever status the owner confirms - as intentions if they are intentions. **The garden
  belongs in this page, not only on the locations card**: produce from the plot feeds the
  distribution effort, which is the one place the two activities connect.
- Rewrite `join.mdx` for an affinity group: how someone actually shows up for a cook
  session. Remove the invented time commitments, role tiers, and "member-only" benefits.
  The call to action is **email `info@GROUP_DOMAIN`**, and a person replies. Per the
  2026-07-30 decision: no chat link anywhere, do not promise an instant join or a published
  schedule, and do not frame the reply as an application or a screening step.
- Replace `donate.mdx` with **Ways to Help**, per the 2026-07-30 decision: concrete needs
  such as ingredients, containers, kitchen time, transport. The 90% claim is withdrawn and
  must not reappear in any form.
- Replace `src/data/locations.json` with a data file matching the real model, per the
  2026-07-30 and 2026-07-31 decisions. The schema changes, not just the values: `phone` and
  `email` per site are removed because they do not exist, staffed `hours` become a
  cook-and-distribute rhythm for distribution sites, and a `kind` discriminator separates the
  garden from them. See the garden note above.
- Add a Zod schema for that data file, as a **discriminated union on `kind`**. It is currently
  imported raw with no validation.
- Update `locations.astro` to the new shape. It currently renders address, a map link,
  `Object.entries(hours)`, `phone` and `email` for every record; under the new schema those
  blocks become conditional on `kind`. Rename the route if the owner prefers different
  language - the page's `h1` is "Find Us" and its lede reads "Visit any of our locations to
  get involved, pick up food", which is storefront framing that outlives a data-only fix.
- Consider a food-safety note, if the owner wants one. Groups handing out home-cooked food
  often want to state their practices plainly.

### Acceptance

- No fabricated address, phone number, email, statistic, or founding date remains anywhere
  in `src/`.
- Every factual claim traces to a specific owner input.
- Aspirational programs are worded as intentions. The garden plot is **not** one of these - it
  is established and is described in the present tense.
- **The garden copy survives the two framing traps**: no "our community garden" anywhere, and
  no use of "member" to describe who receives food.
- **No `CITY` token remains anywhere in `src/`.** Verify by grep. The city is Tucson and is
  written out.
- The garden record has an address and **no** map link; the distribution records have a
  cadence and **no** published time. Confirm both in the built HTML, not in the JSON.

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
- A pre-publication checklist asserting no fabricated data remains. **Task 004b builds the
  mechanical half of this** as `npm run check:config`, which fails while any owner-fill token
  is unfilled. What remains here is the judgement half: fabricated data that is not a token
  and therefore cannot be caught by a pattern.

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
