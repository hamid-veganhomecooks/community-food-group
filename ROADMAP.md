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

Two tracks were independent and ran in parallel:

- **Track A (complete):** Tasks 001-004, 004b and 004c. Purely structural. Required no owner
  facts - 004b centralized the identity values without filling them.
- **Track B:** Tasks 005-007. **Task 005 is complete.** Task 006 is blocked; Task 007 is
  partly pulled forward as 007a.

**Every task 001 through 005 is merged to `main` and the working tree is clean.**

## The current order

**[2026-07-31] Revised by owner decision.** The owner wants friends looking at a real URL before
the copy is finished, which reorders the tail of the backlog:

| # | Task | Why here |
| --- | --- | --- |
| 1 | **005b** - zero user-visible copy in `.astro`, fill the domain | **ACTIVE.** Structure settles before copy is rewritten, so the copy is touched once. Also fills `GROUP_DOMAIN`, which is what actually unblocks the preview. **Scope widened 2026-07-31** to include the home page, header and footer |
| 2 | **008a** - preview deployment | Friends need something to look at. Needs the domain fill, an output token scan, and a `noindex` mechanism |
| 3 | *(the feedback round)* | Not a task. See `PROJECT_CONTEXT.md` section 4 for who is asked and what is not open for comment |
| 4 | **005c** - copy register pass | **Must wait for the feedback rather than pre-empt it.** One pass, over already-consolidated files |

**Recommended but not scheduled: 007a** (favicon and OG image) ahead of step 2, so shared links
do not render broken preview cards. It needs an owner input that is still deferred.

**The competing argument, recorded because it was real.** Splitting first and deploying second
means friends see the current copy, including the `Our Community Garden Plot` heading and a
garbled `/locations` meta description. Deploying first would have let feedback inform 005c
without the split intervening, at the cost of one extra pass over the prose. **The owner chose
split-then-deploy-then-copy knowingly**, and separately decided the heading is fine as it
stands.

Tasks 008 and 009 close out the release.

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

**Status: COMPLETE**, 2026-07-31. Merged to `main` as `15dd164`.

Removed the application-menu ARIA pattern from both navigation lists, completed the mobile
menu's keyboard contract (Escape, focus return, close-on-focus-leaving, four close paths
sharing one function, **no focus trap**), added a single project `:focus-visible` rule on the
existing `--color-focus` role, resolved both dead footer links, closed a WCAG 2.5.3 Label in
Name failure by deleting three redundant `aria-label`s, added a preventive
`prefers-reduced-motion` block, and wired `npm run check:contrast` into the uncached half of
`npm run verify`.

The dated decisions and the full verification record are in `PROJECT_CONTEXT.md` section 4,
which is their only copy.

**Carries one durable lesson.** The task spec asserted the Playwright harness already had
"focus-visible traversal groundwork". It had none. The claim was inherited from an earlier
document rather than checked, and it was checked rather than trusted only because the
acceptance criteria demanded executed evidence. Constraint 3.4 applies to a project's own
notes about itself, not just to the repository - a correction is logged in
`docs/ENVIRONMENT.md`.

---

## Task 004b - Site config and the fork-and-adopt surface

**Status: COMPLETE**, 2026-07-31. Merged to `main` as `0fd7d5e`. Verification record in
`docs/DECISIONS_ARCHIVE.md` under `## Verification history`.

Collapsed this group's identity constants into one typed `site.config.ts`, replaced all eight
in-scope hardcoded occurrences of the invented organization name with config reads, tokenized
the invented tagline out of `og:description`, and shipped zero-dependency
`scripts/check-config.mjs` wired into the **uncached** half of `npm run verify`.

**It ships with `npm run check:config` deliberately red**, because `GROUP_NAME`,
`GROUP_TAGLINE`, `GROUP_DOMAIN` and the two Mastodon tokens were genuinely unknown owner
inputs. That is the guard the task exists to build, not a regression.

The dated decisions are in `PROJECT_CONTEXT.md` section 4, which is their only copy.

**Three things changed at promotion, from grepping the repository rather than trusting this
entry:**

1. **This entry's own inventory was wrong.** It claimed 9 hardcoded occurrences of
   `"Community Food Group"` and then enumerated 7, in 6 files. The true count is 9 across
   **7** files; the two it missed were `Header.astro`'s `aria-label` and an MDX heading -
   which is exactly the `aria-label`-and-not-an-`h1` failure mode its own rationale described.
2. **One of the 9 cannot be fixed by this task.** `about.mdx:9` is MDX prose, and section 2
   forbids interpolating config into prose. It is **Task 005's**, and the promoted spec
   requires it to *survive* rather than treating its survival as a failure.
3. **A second constraint 1 violation was found and added:** the invented tagline "Building
   food security through community action", which feeds `<meta name="description">`,
   `og:description` and `twitter:description` from `BaseLayout.astro`. Section 2 lists OG and
   Twitter metadata as config-driven chrome, so it belongs here - but the same words also open
   a footer *prose* blurb, which does not. This raises a new owner input, recorded in
   `PROJECT_CONTEXT.md` section 4.

The promoted spec also resolved two ambiguities this entry left open: the project's **two**
incompatible token spellings (`GROUP NAME` with a space, `GROUP_DOMAIN` with an underscore)
were normalized to one greppable pattern, and the `SocialAccount | null` type was given an
explicit rule for *unknown* versus *deliberately absent* - the Mastodon handle is unknown, so
it carries a token rather than the `null` this entry's wording would have suggested.

**Carries one durable lesson.** A validator that scans source text for a pattern cannot tell
"this string is a token" from "this comment describes tokens". The first draft of
`site.config.ts`'s own doc comments spelled out token-shaped strings and would have made
`check:config` permanently unpassable. Caught by **running** the validator and reading its
output, not by inspecting the diff - which is the behaviour constraint 3.10 exists to force.

---

## Task 004c - Licence

**Status: COMPLETE**, 2026-07-31. Merged to `main` as `bcef6db`. Unplanned; inserted on an
owner decision to make the repository a public resource. Executed directly rather than queued,
on explicit owner authorization, because it touches no source file and therefore could not
collide with the then-active Task 004. Recorded here rather than done silently, following the
Task 003 precedent for owner-approved scope grants.

*(Corrected 2026-07-31 at Task 004b promotion: this entry read "not yet committed", which was
true when written and stale by the time it was read. `PROJECT_CONTEXT.md` flagged the drift
for whoever next wrote this ARCHITECT-owned file. **Verify commit state against `git log`, not
against a status word in any of these documents.**)*

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

**Status: COMPLETE**, 2026-07-31. Merged to `main` as `375d860`, followed by two owner copy
commits, `0f7aff2` and `83838b8`. Verification record in `docs/DECISIONS_ARCHIVE.md` under
`## Verification history`.

Replaced every invented public fact in `src/` with owner-approved content describing the real
group, and migrated `src/data/locations.json` from a flat storefront shape to a validated,
`kind`-discriminated Astro data collection holding one record: the rented garden plot. Renamed
`/donate` to `/help` across the route, the content file, both nav lists and the footer. **The
site now describes the real group.**

The dated decisions are in `PROJECT_CONTEXT.md` section 4, which is their only copy.

**Carries two durable lessons**, both found by executing rather than reading, and both now
governing every future task: the shell's `grep` is a wrapper that honours `.gitignore`, so a
criterion grepping `dist/` passes **vacuously** unless it says `/usr/bin/grep`; and Astro's HTML
compressor strips whitespace-only text nodes around inline elements, gluing prose to link text
in a way that is invisible in the source and the diff.

**Two of its rulings have since been changed by the owner** and this entry is not the authority
on either - see `PROJECT_CONTEXT.md` section 4. The traps table is retired, and the garden's
facts are consolidating to one owner.

---

## Task 005b - Zero user-visible copy in `.astro`, and fill the domain

**Status: ACTIVE**, promoted 2026-07-31, **scope widened the same day by owner decision.**
**Specified in `TASK_SPEC.md`, which is the only authority on its scope and acceptance.**
**Blocked on:** nothing.

The planned scope that stood here has been **cut into `TASK_SPEC.md`**, not copied.

Numbered `005b` by the precedent 004b and 004c set: work that follows a completed task on the
same material takes a letter suffix rather than a new number.

**Why it was widened.** As first promoted, this task moved only `/posts` and the `/locations`
page copy, leaving the home page as "the one genuine template". **The owner rejected that**, and
the count is why: the narrower version would have left about forty user-visible strings in
`.astro` files, including the entire home page - four paragraphs, three section headings, six
button labels - plus five nav labels duplicated across two lists and twelve footer strings.

**The owner's stated expectation from Task 004b was that editing the site would mean editing
content files.** That expectation was reasonable and the four-surfaces table has been promising
it since 004b wrote it. It was not true. **The goal is now the promise: no `.astro` file
contains a user-visible string.**

This entry records the reversal rather than quietly replacing the earlier plan, because "the
home page is structured layout, not prose" is a rationalization a future session could easily
re-derive. It was measured and it is wrong: the home page is roughly 60% prose by volume.

---

## Task 008a - Preview deployment

**Status:** queued. **Next after 005b.**
**Blocked on:** Task 005b (the domain fill), and an owner-side Cloudflare Pages project.

### Why this moved ahead of Tasks 006 and 007

**Stated explicitly rather than left to drift.** The owner wants the site on `pages.dev` before
go-live so friends can look and comment, with the real domain wired later. That reorders the
backlog: a preview-only slice of Task 008 now runs ahead of Mastodon integration and the full
brand-asset pass.

The reorder is cheap because the thing that was supposed to block it does not. **Task 008 as
written is blocked on the domain purchase and a confirmed Pages URL**; the domain is now
answered, and a preview does not need the production URL. The remaining Task 008 scope -
security headers, the canonical `site` value, real-device verification against the production
domain - stays queued as Task 008.

### Planned scope

- **An output scan that enforces the rule the project actually has.** `scripts/check-config.mjs`
  scans `site.config.ts` and `src/`; nothing scans `dist/`. Add a check that greps build output
  for the documented token pattern, **reading files through Node's `fs`** rather than the shell,
  because the shell's `grep` honours `.gitignore` and `dist/` is git-ignored. This is the check
  that gates publishing. `check:config` keeps gating source. **Do not merge the two.**
- **A `noindex` mechanism that distinguishes preview from production.** The owner's decision is
  `noindex` on the preview with the link shared directly. A `public/_headers` file ships to
  production as readily as to a preview, so this needs a real mechanism, not a remembered rule.
  **Cloudflare's default behaviour for preview aliases has not been verified from this
  workstation - confirm it against the dashboard rather than assuming it.**
- Create or confirm the Cloudflare Pages project. **Set `NODE_VERSION` to `22.23.2`** to match
  `.nvmrc`, or the `prebuild` Mastodon step fails in CI. **Set `SITE_URL` as a real environment
  variable** - `astro.config.mjs` is evaluated before `.env` loads.
- **Re-verify the Community Gardens of Tucson listing before the preview goes up.**
  `PROJECT_CONTEXT.md` records this as a standing dependency: they are facts about a third party
  and about a rental that can lapse.
- **Confirm `info@vegansagainstfascism.org` is actually receiving mail.** It is the site's only
  call to action on all six routes.

### Acceptance

- The preview build carries **zero** tokens in `dist/`, proven by the new output scan run with
  the shell wrapper problem accounted for.
- The preview responds with `noindex`, and production provably does not inherit it.
- The build runs on Node 22 in Pages, not only locally.

---

## Task 005c - Copy register pass

**Status:** queued. **Runs after the feedback round.**
**Blocked on:** Task 005b (so the copy is in one place before it is rewritten), Task 008a, and
the friends' feedback itself.

### Why it is last

Rewriting copy across six files and then moving it does the work twice, and that duplication is
exactly what produced the CGT link drift within an hour of being created. 005b moves; 005c
writes. **One pass, over consolidated files.**

The owner chose to have friends see the current copy first, so **005c must wait for the feedback
rather than pre-empt it.** A session that starts 005c before the round has happened is doing the
task the order was designed to avoid.

### Planned scope

- One register pass over the consolidated MDX. **The traps table is retired** - see
  `PROJECT_CONTEXT.md` section 4. Warmth comes from sentence rhythm, contractions, concrete
  nouns and speaking as people rather than as an organization.
- **Constraint 3.1 is untouched and was never in scope of that retirement.** For the four
  retired entries that were truth rules rather than tone rules, there is no truthful warmer copy
  available: no efficiency figure exists, no distribution time is known in advance, there is no
  chat, and CGT is a real third party.
- Fold in the friends' feedback, minus what section 4 records as not open for comment.
- **Report every occurrence of the group name it introduces into `src/`**, so the cost to the
  anticipated rebrand is visible rather than discovered later. Currently zero.

---

## Task 006 - Mastodon integration, wired end to end

**Status:** queued and **BLOCKED. Out of the current order.**
**Blocked on:** the Mastodon handle in `PROJECT_CONTEXT.md` section 4.

**[2026-07-31] The handle question was put to the owner and came back "undecided."** That is
neither a handle nor a decision that there is no account, so the tokens stay and this task
cannot be specified. It **keeps its number but yields its position** to 005b, 008a and 005c.

**It no longer blocks anything else.** `MASTODON_HANDLE` and `MASTODON_URL` are consumed by no
template and never reach `dist/` - verified 2026-07-31 - so they do not stand between the
project and the preview deploy.

**If the answer turns out to be "there is no account", this task shrinks or vanishes:**
`social.mastodon` becomes `null`, `check:config` goes fully green, and `/posts` plus
`MastodonFeed.astro` need a decision about whether they have any reason to exist. **Do not
pre-empt that by writing `null` for an undecided input.**

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

## Task 007a - Favicon and OG image, ahead of the preview

**Status:** queued, **recommended before Task 008a. Not yet an owner decision.**
**Blocked on:** the logo/favicon/social-image owner input in `PROJECT_CONTEXT.md` section 4.

`public/` is empty and `BaseLayout.astro` references `/favicon.svg` and
`/images/og-default.jpg`, so both 404 on every route. That has been a cosmetic gap so far.
**Once a preview link is shared with friends it stops being cosmetic:** every browser tab shows
a default icon and every link anyone pastes into a chat renders a broken preview card. The
first impression the feedback round is meant to gather would be partly an impression of missing
assets.

**An implementer cannot resolve this** - the assets are a deferred owner input, not a technical
gap. The owner needs to supply them or approve a deliberate placeholder. Flagged rather than
scheduled, because the answer is theirs.

The rest of Task 007 stays queued below.

---

## Task 007 - Brand assets and metadata

**Status:** queued. **Track B.**
**Blocked on:** Task 003 palette, and the logo/wordmark in `PROJECT_CONTEXT.md` section 4.

### Planned scope

- Create `public/favicon.svg` and the OG image at `/images/og-default.jpg`, if 007a has not
  already. Both are referenced by `BaseLayout.astro` today and both 404 on every route.
- Replace the emoji logo in `Header.astro` with a real wordmark or a deliberate typographic
  treatment.
- Complete metadata: canonical URLs, `og:url`, `og:site_name`, `og:locale`, and per-page
  descriptions. Several pages currently inherit the generic default.
- Add `sitemap` and `robots.txt`.

---

## Task 008 - Production deployment

**Status:** queued. **The preview slice has been cut out as Task 008a**, above; what remains
here is production.
**Blocked on:** Task 008a, and pointing `vegansagainstfascism.org` at Cloudflare.

### Planned scope

- Wire the real domain and record the production URL as a dated decision.
- Set the canonical `site` in `astro.config.mjs` only once the URL is confirmed.
- Confirm production does **not** inherit the preview's `noindex`. This is the enforcement half
  of the owner's preview decision and it is easy to get backwards in exactly the direction that
  hurts.
- Configure `MASTODON_ACCOUNT` in the Pages environment, if Task 006 ever unblocks.
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
  and therefore cannot be caught by a pattern. `about.mdx`'s hardcoded organization name is
  the worked example - a pattern-based check cannot distinguish it from legitimate prose,
  which is why it needs a human rewrite (Task 005) rather than a validator.

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
