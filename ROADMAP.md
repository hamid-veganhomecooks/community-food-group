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

- **Track A (complete):** Tasks 001-004, 004b, 004c and 004d. Purely structural. Required no owner
  facts - 004b centralized the identity values without filling them.
- **Track B:** Tasks 005-007. **Tasks 005 and 005b are complete.** Task 006 has been split -
  **006a is active**, 006b is blocked on an owner input. Task 007 is partly pulled forward as
  007a.

**Tasks 001 through 005 are merged to `main`. Tasks 005b, 004d, 009a and the 008a remainder are
committed on `task/005b-content-consolidation` and are NOT merged**, and `a0433d5` is not yet
pushed. See the open-owner-items table below. **Verify this against `git log` rather than against
this paragraph** - that is the correction this project has had to make five times.

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

**[2026-08-01] This table was wrong and has been corrected.** It listed **004d** and the **008a
remainder** as ready to start after both had been completed and verified. That is the fifth time a
document in this project has gone stale on completion state, which is why the rule below the table
exists.

**Task 006a is now ACTIVE**, promoted 2026-08-01. Its scope has been **cut into `TASK_SPEC.md`**,
which is the only authority on it.

Ready to start after 006a, in no forced order:

| Task | Why it is ready |
| --- | --- |
| **007** | Metadata, canonical URLs and sitemap all work against `SITE_URL`. Only the brand *assets* are blocked. **Settle 006b's fate first if convenient** - if there is never an account, `/posts` may be deleted, and per-page metadata for a route that disappears is wasted work |
| **009** (the rest) | CI, link checker, automated accessibility, dependency updates. No blocker at all, and it is the task that would have caught most of what went wrong in 001-005 |

**Completed, and no longer in this table:** **004d** (`CONTRIBUTING.md`) and the **008a remainder**
(the `dist/` output scan and the `verify` rewiring), both 2026-08-01, both in `a0433d5`.
Verification record in `docs/DECISIONS_ARCHIVE.md`.

**Do not read a completion claim in this file as a commit.** Check `git log`.

### What waits on an owner input

| Task | Waiting on |
| --- | --- |
| **005c** | The feedback round. **[2026-08-01] Confirmed by the owner: no comments have arrived yet**, so 005c stays blocked. A round that has started is not a round that has returned anything |
| **007a** | Logo, favicon, social image |
| **006b** | A Mastodon handle - **and the anticipated name change, which is the real constraint** |
| **008** | DNS, and a working mailbox |

### Open owner items that are not tasks

Neither of these can be closed by any session, and both are easy to lose because they live outside
the repository.

| Item | State on 2026-08-01 |
| --- | --- |
| **`NODE_VERSION` = `22.23.2` on Cloudflare Pages** | **Still open.** Owner dashboard check. Without it the `prebuild` Mastodon step fails in the Pages build - which starts to matter as soon as Task 006a lands, because that task makes the prebuild step do real work |
| **Merging `task/005b-content-consolidation` into `main`** | **Open, and the owner will run it.** Five tasks now sit on this branch. **`a0433d5` is not pushed** - `origin` is one commit behind, so the live Pages preview does **not** include the close-out bundle. Git operations in this project are owner-driven; no session runs a git network command or `gh` |

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

**Status: COMPLETE**, 2026-08-01. Committed as `a0433d5` on `task/005b-content-consolidation`,
as **Part A** of the three-part close-out bundle. Verification record in
`docs/DECISIONS_ARCHIVE.md` under `## Verification history`.

`CONTRIBUTING.md` states that contributions are dedicated under CC0 1.0 - which is what lets the
repository keep claiming public domain once outside patches land - names the three carve-outs, and
points at `README.md` rather than restating it.

**It deliberately contains no code of conduct, review process, maintainer list, response-time
promise or CLA. None of them exist**, and constraint 3.1 covers a fabricated process exactly as it
covers a fabricated address. **A future session must not "complete" the file by adding them.**

Flagged open by Task 004c on 2026-07-31 - "CC0 only covers what the owner holds" - and carried by
no task until this one.

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

**Status: COMPLETE**, 2026-08-01. Merged as `716ddd3` on `task/005b-content-consolidation`;
`MEMORY SYNC` as `3ea2583`. **Verification record in `docs/DECISIONS_ARCHIVE.md` under
`## Verification history`.**

Moved every user-visible string out of `.astro`: four new MDX documents (`home`, `locations`,
`posts`, `footer`), three capped home-page components, one nav list in `site.config.ts` read by
three consumers, and the domain filled. **Six routes, one `h1` each, zero tokens in `dist/`** -
re-confirmed at archive time.

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

**Status: COMPLETE except for one owner dashboard check**, 2026-08-01. The preview was deployed by
the owner outside a task session, from `task/005b-content-consolidation`; alias
`https://2889d153.community-food-group.pages.dev/`. **The feedback round has started** - and as of
2026-08-01 has returned no comments yet. The remainder was implemented and verified as **Part C**
of the close-out bundle, committed as `a0433d5`. Verification record in
`docs/DECISIONS_ARCHIVE.md` under `## Verification history`.

**The one thing still open is `NODE_VERSION` = `22.23.2` on Pages** - an owner dashboard check that
no session can close. See the open-owner-items table at the top of this file.

**Note the deployed preview is `2081c8c`, not `a0433d5`.** The close-out bundle is committed
locally but not pushed, so the live preview does not contain it. Nothing on the preview is wrong
because of that - the bundle changed no rendered output - but a session inspecting the live site
is inspecting the previous commit.

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
| Output scan over `dist/` | **DONE 2026-08-01.** `scripts/check-dist.mjs`, wired into `verify` after `build` and fatal there; `check:config` is non-fatal inside `verify` only. **Proven to fail as well as to pass** |
| `NODE_VERSION` = `22.23.2` | **STILL OPEN.** The only item left in this task. Owner dashboard check |
| Re-verify the CGT listing | **DONE 2026-08-01, unchanged.** Name, address and operator all as recorded. **Standing, not discharged** - check again before production |
| Confirm the mailbox | **Downgraded to a production gate.** Accepted risk for the preview |
| `SITE_URL` / canonical | **Deferred to production.** Task 007 sets it |

The remainder's scope was **cut into `TASK_SPEC.md`** at promotion and has since been archived; it
is not restated here. **`NODE_VERSION` on Pages stays open** - it is an owner dashboard check, not
implementer work, and it is the one item from this task that no session can close.

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

### What did not ship here, and where it went

Recorded so a future session does not read these as forgotten:

- **A `noindex` mechanism that distinguishes preview from production.** Owner set it manually and
  deferred the mechanism to production, where a `public/_headers` file would ship to both and the
  distinction stops being a remembered rule. **Cloudflare's default behaviour for preview aliases
  has never been verified from this workstation - confirm it against the dashboard rather than
  assuming it.** Task 008.
- **`SITE_URL`.** Deferred to production; `astro.config.mjs` is evaluated before `.env` loads, so
  it must be a real environment variable when it is set. Task 007 sets it for the preview origin,
  Task 008 swaps in the real one.
- **Confirming `info@vegansagainstfascism.org` receives mail.** Downgraded to a production gate by
  owner decision. The address is live on all six routes and may bounce. **Cost to close: one test
  email.** Task 008.

---

## Task 005c - Copy register pass

**Status:** queued. **Runs after the feedback round.**
**Blocked on:** the friends' feedback itself. Tasks 005b and 008a are both complete, so the
feedback is now the only thing standing in front of it.

**[2026-08-01] Confirmed with the owner: the round has started but no comments have arrived yet.**
So 005c stays blocked. A round being open is not the same as a round having returned something,
and this is the distinction that decides whether the task is promotable.

**When comments do arrive they are input to a promotion decision, never authorization to change
code.** They reach an `ARCHITECT`, who writes them into this file or into a promoted
`TASK_SPEC.md`. A comment does not become work before that.

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

**Status: ACTIVE**, promoted 2026-08-01. `TASK_SPEC.md` is the only authority on its scope and
acceptance.
**Blocked on:** nothing.

The planned scope that stood here has been **cut into `TASK_SPEC.md`**, not copied.

**Two things were added to it at promotion, from grepping the repository rather than trusting the
entry that stood here:**

1. **The account avatar at `MastodonFeed.astro:38` is a second hot-link** to the Mastodon
   instance, and this entry named only the media attachment at line 68. Both reach a third party
   from the visitor's browser; fixing one and not the other would leave the privacy property this
   task exists to restore still broken, on every post rather than on some.
2. **The two `src/content.config.ts` residuals from Task 009a are folded in here**, as a named
   two-line exception to scope: `z.string().url()` -> `z.url()` at line 61, and the **false
   comment at lines 43-45** which still describes zod as undeclared. Neither justified a task of
   its own, they are one edit in one file, and the comment would otherwise lead a future session
   to revert a shipped owner decision.

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
- ~~Resolve the zod deprecation.~~ **Split out as Task 009a. COMPLETE 2026-08-01**, committed as
  `a0433d5` as **Part B** of the close-out bundle. `zod` is a declared dependency and
  `src/content.config.ts` imports `z` from `'zod'`. Verification record in
  `docs/DECISIONS_ARCHIVE.md`. **The hints went 21 -> 1, not 21 -> 0** - the survivor is an
  unrelated `z.string().url()` deprecation the old count was masking, and it is folded into Task
  006a. **The rest of Task 009 - CI, link checker, automated accessibility, dependency updates -
  stays queued here.**
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
