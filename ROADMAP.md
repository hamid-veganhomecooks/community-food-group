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

**[2026-08-01] Restructured. Tasks 005b and 008a are done; the site is live on `pages.dev` and
the feedback round is running.**

### The DNS framing is retired, and it was wrong

Earlier drafts of this file treated the production domain as a gate on Tasks 007, 008 and the
release generally. **It is not, and the repository was already built so that it isn't.**

`astro.config.mjs` reads `site` from `process.env.SITE_URL` rather than hardcoding it, with a
comment at the point of use explaining why. **Set `SITE_URL` to the `pages.dev` URL and canonical
URLs, `og:url` and a sitemap all work correctly today.** When the domain arrives it is one
environment variable and a rebuild.

**The only things that genuinely require DNS are pointing DNS and the mailbox.** Nothing else in
this backlog is stalled on it, and a future session must not reintroduce "blocked on the domain"
against work that is not.

### What is actually unblocked

Ready to start now, in no forced order:

| Task | Why it is ready |
| --- | --- |
| **008a remainder** | The `dist/` token scan, confirming the Pages build ran on Node 22, and the **overdue** CGT re-verification |
| **006a** | The feed's correctness problems need no account - they are verifiable against a seeded cache |
| **007** | Metadata, canonical URLs and sitemap all work against `SITE_URL`. Only the brand *assets* are blocked |
| **009** | No blocker at all, and it is the task that would have caught most of what went wrong in 001-005 |
| **004d** | `CONTRIBUTING.md`. Open since 004c and never tracked until now |

### What waits on an owner input

| Task | Waiting on |
| --- | --- |
| **005c** | The feedback round to finish |
| **007a** | Logo, favicon, social image |
| **006b** | A Mastodon handle - **and the anticipated name change, which is the real constraint** |
| **008** | DNS, and a working mailbox |

**The largest lever is not sequencing, it is closing owner inputs**, because three of them each
unblock a whole task and one of them (Mastodon) can *delete* work rather than enable it.

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

## Task 004d - Contributor guidance

**Status:** queued. **Unblocked. Small.**
**Blocked on:** nothing.

**[2026-08-01] Promoted from a loose note to a tracked task.** Task 004c flagged this on
2026-07-31 and nothing ever carried it: "CC0 only covers what the owner holds, so if
contributors arrive, a `CONTRIBUTING.md` stating that contributions are dedicated under CC0 is
needed. Cheap now, painful to retrofit once patches have landed."

The repository is public and deliberately shaped for reuse, so the gap is real rather than
theoretical.

### Planned scope

- `CONTRIBUTING.md` dedicating contributions under CC0 1.0, matching `LICENSE`.
- State the three carve-outs `README.md` already documents, since a contributor hits them
  first: the group's name and identity are **not** waived by CC0 (trademark), Inter is **SIL OFL
  1.1**, and the page copy describes a real group and would be false if republished unchanged.
- Note that prose is **rewritten, not tokenized**, by an adopting fork - the reuse model in
  `PROJECT_CONTEXT.md` section 2.

**Do not invent a code of conduct, a review process, or a maintainer list.** None exist, and
constraint 3.1 covers process claims as much as it covers addresses.

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

**Status: LARGELY DONE BY THE OWNER, 2026-08-01, outside a task session.** The preview is
deployed from `task/005b-content-consolidation` and the link has been shared with friends. Alias
`https://2889d153.community-food-group.pages.dev/`. **The feedback round has started.**
**Blocked on:** nothing.

**Nothing was bypassed.** The deployed build contains zero tokens - Task 005b filled
`GROUP_DOMAIN`, the only one that ever reached `dist/`. Verified 2026-08-01 against both
`check:config` and the live page.

**[2026-08-01] The owner relaxed the domain-related gates for the preview and only for the
preview**, judging them disproportionate for a friends-only look at a `noindex` URL. Recorded in
full in `PROJECT_CONTEXT.md` section 4, which is the authority. Summary of what is left:

| Item | Status |
| --- | --- |
| `noindex` on the preview | **Done manually by the owner.** Mechanism deferred to production, where the preview/production distinction becomes real |
| Cloudflare Pages project | **Done.** Note it is named `community-food-group` - the retired invented scaffold name, now baked into the `*.pages.dev` hostname. Rename before the real domain goes live |
| Output scan over `dist/` | **Still wanted, and now the main practical annoyance** - see below |
| `NODE_VERSION` = `22.23.2` | **Still required.** Confirm the Pages build actually ran on Node 22 |
| Re-verify the CGT listing | **Still required. Not relaxed** - unrelated to the domain, and a published claim about a third party |
| Confirm the mailbox | **Downgraded to a production gate.** Accepted risk for the preview |
| `SITE_URL` / canonical | **Deferred to production** |

**The output scan is the piece worth doing next.** `check:config` exits non-zero on the two
Mastodon tokens and `verify` uses `set -e`, so the local loop never reaches `build`. The fix is
the split below - **not** weakening `check:config`.

### Why this moved ahead of Tasks 006 and 007

**Stated explicitly rather than left to drift.** The owner wants the site on `pages.dev` before
go-live so friends can look and comment, with the real domain wired later. That reorders the
backlog: a preview-only slice of Task 008 now runs ahead of Mastodon integration and the full
brand-asset pass.

The reorder was cheap because the thing that was supposed to block it did not. **The preview
never needed the production URL**, and in the event it did not need the domain at all - Task
005b filled `GROUP_DOMAIN` from a registered domain the owner does not yet have DNS access to,
and the site has been running on `pages.dev` since 2026-08-01. What remains for production is
Task 008, which blocks nothing.

### Planned scope

- **An output scan that enforces the rule the project actually has.** `scripts/check-config.mjs`
  scans `site.config.ts` and `src/`; nothing scans `dist/`. Add a check that greps build output
  for the documented token pattern, **reading files through Node's `fs`** rather than the shell,
  because the shell's `grep` honours `.gitignore` and `dist/` is git-ignored. This is the check
  that gates publishing. `check:config` keeps gating source. **Do not merge the two.**
- ~~A `noindex` mechanism that distinguishes preview from production.~~ **Owner set it manually.
  Deferred to production**, where a `public/_headers` file would ship to both and the
  distinction stops being a remembered rule. **Cloudflare's default behaviour for preview
  aliases has never been verified from this workstation - confirm it against the dashboard
  rather than assuming it.**
- ~~Create or confirm the Cloudflare Pages project.~~ **Done.** **Confirm the Pages build
  actually ran on `NODE_VERSION` `22.23.2`** - a mismatch fails the `prebuild` Mastodon step.
  ~~Set `SITE_URL`~~ - deferred to production; `astro.config.mjs` is evaluated before `.env`
  loads, so it must be a real environment variable when it is set.
- **Re-verify the Community Gardens of Tucson listing. STILL REQUIRED.**
  `PROJECT_CONTEXT.md` records this as a standing dependency: facts about a third party and
  about a rental that can lapse. **Not covered by the domain relaxation** - it has nothing to do
  with the domain, and the claim is published to whoever holds the link.
- ~~Confirm `info@vegansagainstfascism.org` is receiving mail.~~ **Downgraded to a production
  gate by owner decision.** The address is live on all six routes and may bounce; accepted risk
  for a friends preview. **Cost to close: one test email.**

### Acceptance, for what remains

- `npm run verify` reaches `build` - the source scan reports unanswered owner inputs without
  blocking, and a `dist/` scan blocks publishing instead.
- The `dist/` scan is **proven to fail**, not merely to pass, by temporarily reintroducing a
  token.
- The Pages build is confirmed to have run on Node 22.
- The CGT listing is re-verified against the operator's own site.

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

## Task 006 - Mastodon: SPLIT into 006a and 006b

**[2026-08-01] Task 006 was one task blocked on one owner input, and most of it never needed
that input.** The owner wants the feed to exist eventually and is some way off having an
account. Splitting converts a fully blocked task into a mostly unblocked one.

**The reason not to register a stub account now, recorded because it is the whole argument:**
**a name change is anticipated**, and a Mastodon handle is the one identifier in this project
that is *not* a one-line config edit. Handles can be migrated, but it is messy, the old handle
is burned, and `rel="me"` verification has to be redone. **Registering a handle before the name
settles locks in the thing the owner expects to change.**

**The tokens stay until a real handle exists.** `social.mastodon` must not be set to `null` -
that would mean *decided against*, and the owner has decided *for*, just not yet.

---

## Task 006a - Fix the feed, no account required

**Status:** queued. **Unblocked.**
**Blocked on:** nothing.

### Why it needs no account

Every correctness problem below is verifiable against a **seeded cache**. That is not a
workaround - it is how the rendering defect was *proven* in the first place, on 2026-07-30, by
writing one fake post into `src/data/mastodon-posts.json` and building. The cache is currently
`[]`, so the feature has only ever been claimed against an empty array.

### Planned scope

- **Resolve the HTML rendering defect.** `src/components/MastodonFeed.astro:61` interpolates
  `post.content` - an HTML string - into a text node, so visitors would see literal `<p>` tags.
  **Confirmed empirically, not predicted.**

  **[2026-08-01] DECIDED: sanitize to an allowlist** (`p`, `br`, `a`, `em`, `strong`), not
  plain-text stripping. Owner input - the posts carry links and plain text would discard them.
  **This authorizes a sanitizer dependency** under constraint 3.6. Sanitize at **build time**,
  never in the browser; constraint 3.8 still forbids `set:html` on unsanitized input.
- Handle custom emoji and mentions, which arrive as markup and will otherwise look broken.
- **Stop hot-linking media, and fetch it at build time instead.**
  `MastodonFeed.astro:68` uses `src={media.preview_url || media.url}`, pointing at the Mastodon
  instance. **Every visitor's browser then contacts a third party - precisely what Task 003
  removed** when it took Inter off the Google Fonts CDN so no visitor IP reaches one. The owner's
  posts are image-first, so this is most posts, not an edge case. Hot-linked images also die if a
  post is deleted upstream. The fetch script already runs at build time.
- **Fix the alt-text fallback.** `MastodonFeed.astro:69` falls back to `'Post attachment'`, which
  describes nothing, and **the information in these posts lives in the image** - announcements,
  community notices, garden pictures. Accessibility is a release requirement here.
  **Half this fix is not code:** Mastodon only supplies `media.description` when the poster wrote
  alt text, and the site must not invent one (constraint 3.1). Handle a missing description
  honestly rather than papering over it, and flag to the owner that alt text needs writing at
  post time.

**Images are already implemented and this task does not add them.** `src/types/mastodon.ts`,
`scripts/fetch-mastodon.ts` and `MastodonFeed.astro:64-75` all handle `media_attachments`
today, rendering up to four per post. The two items above are corrections to existing behaviour.
- **Distinguish the two empty states.** "No updates available at the moment" is shown today for
  both *the group has not posted* and *no account is configured*. With the account genuinely
  unconfigured, the second is the state that actually ships - and it is the one a visitor sees
  right now on `/` and `/posts`.
- Decide a cache-staleness policy. A static site shows whatever was cached at build time, so a
  feed can silently go months stale.

### Acceptance

- With a seeded cache containing markup, the rendered page shows readable text and **no visible
  tags** - verified in `dist/`, with `/usr/bin/grep`.
- The unconfigured state renders distinctly from the empty state.
- Build succeeds with the cache seeded and with it `[]`.
- No client-side request to any Mastodon instance.
- **The seeded fixture is removed before completion**, or is clearly a fixture. Do not ship
  invented posts - constraint 3.1.

---

## Task 006b - Wire the real account

**Status:** queued. **Blocked on an owner input.**
**Blocked on:** a Mastodon handle, which in turn waits on the name settling.

Small once the handle exists - roughly a config edit plus a verification pass.

- Fill `social.mastodon`; the two remaining tokens disappear and `check:config` goes green.
- Run a real ingestion and inspect the actual payload against what 006a assumed.
- Add the Mastodon link with `rel="me"` so the account can verify the site back.
- Decide whether media attachments are proxied or hot-linked.

**If the answer ever becomes "there is no account" instead:** `social.mastodon` becomes `null`,
and `/posts` plus `MastodonFeed.astro` need a decision about whether they have any reason to
exist. That is a route deletion, not a config change - worth settling before Task 007 does
metadata work on a page that might go.

---

## Task 007a - Favicon and OG image

**Status:** queued. **Blocked on an owner input.**
**Blocked on:** the logo/favicon/social-image row in `PROJECT_CONTEXT.md` section 4.

**`public/` does not exist as a directory** - git does not track empty directories, so it is
absent rather than empty. `BaseLayout.astro:37` references `/favicon.svg` and line 19 defaults
`ogImage` to `/images/og-default.jpg`; both 404 on every route. **The preview is live and shared,
so every browser tab shows a default icon and every pasted link renders a broken card right
now.**

**An implementer cannot resolve this** - the assets are an owner input, not a technical gap. The
owner supplies them or approves a deliberate placeholder.

---

## Task 007 - Metadata, sitemap and the wordmark

**Status:** queued. **Unblocked, except for the wordmark.**
**Blocked on:** nothing for the metadata half. The wordmark waits on the same owner input
as 007a.

**[2026-08-01] This task is no longer blocked on the production domain.** Earlier drafts said it
was. `astro.config.mjs` reads `site` from `process.env.SITE_URL`, so **setting that to the
`pages.dev` URL makes canonical URLs, `og:url` and a sitemap correct today.** Swapping in the
real domain later is one environment variable and a rebuild.

### Planned scope

- **Set `SITE_URL` in the Pages environment.** It must be a real environment variable -
  `astro.config.mjs` is evaluated before Astro loads `.env` files, and says so at the point of
  use.
- Complete metadata: canonical URLs, `og:url`, `og:site_name`, `og:locale`, and per-page
  descriptions. Several routes still inherit the generic default.
- Add a sitemap and `robots.txt`. **[2026-08-01] `@astrojs/sitemap` is approved by the owner** -
  a genuine new dependency under constraint 3.6, first-party Astro. **Note the `robots.txt` must
  not fight the preview's manual `noindex`** - see the deployment decision in
  `PROJECT_CONTEXT.md` section 4.
- Replace the `🌯` emoji logo in `Header.astro` with a real wordmark or a deliberate typographic
  treatment. *(This part waits on the owner input.)*

**Settle Task 006b's fate first if convenient** - if the answer becomes "there is no account",
`/posts` may be deleted, and doing per-page metadata for a route that disappears is wasted work.

---

## Task 008 - Production launch

**Status:** queued. **Blocked on owner-side infrastructure, and blocking nothing.**
**Blocked on:** DNS access for `vegansagainstfascism.org`, and a working mailbox.

**[2026-08-01] This is a launch step, not a gate.** The owner does not have domain access yet
and the site works fine on `pages.dev`. **Nothing else in this backlog waits on it.** The plan
is to gather feedback on `pages.dev`, take the preview down, and add the domain whenever it
becomes available.

### Planned scope

- Point the domain at Cloudflare and record the production URL as a dated decision.
- **Change `SITE_URL` to the real origin.** If Task 007 has run, that is the whole canonical-URL
  change.
- **Confirm `info@vegansagainstfascism.org` actually receives mail.** It is live on all six
  routes as the site's only call to action, and a plausible address that silently bounces is
  worse than a visible placeholder was. **Cost to close: one test email.**
- **Rename the Cloudflare Pages project.** It is currently `community-food-group` - the retired
  invented scaffold name - which is baked into the `*.pages.dev` hostname and persists as the
  fallback origin after the domain is attached.
- **Confirm production does not inherit the preview's `noindex`.** The preview's was set
  manually, so this is now a dashboard check rather than a code one, and it is easy to get
  backwards in exactly the direction that hurts.
- Add security headers.
- Verify the deployed build on a real mobile device, not only a narrow viewport.

---

## Task 009 - Verification and maintenance

**Status:** queued.
**Blocked on:** Task 001.

### Planned scope

- CI running `npm ci`, `npm run check`, `npm run build`, and `npm audit` on pull requests.
- **Resolve the zod deprecation. [2026-08-01] DECIDED and no longer an open question.** Add
  `"zod": "^4.4.3"` to `package.json` with the range aligned to whatever Astro pulls, and change
  `src/content.config.ts` to `import { z } from 'zod'`. **This declares a dependency that is
  already installed** - `zod@4.4.3` is on disk as a child of `astro@7.1.6` and every schema
  already runs it. **21** hints go to zero. **Never import from `'zod'` without declaring it** -
  that works only via npm's flattening and is the fragile state this fixes.
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
