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

- **Track A (complete):** Tasks 001-004, 004b and 004c. Purely structural. Required no owner
  facts - 004b centralized the identity values without filling them. **Every Track A task is
  complete and merged to `main`; the working tree is clean.**
- **Track B (blocked on owner input):** Tasks 005-007. **Task 005 is now unblocked and
  active** - see its entry below.

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

**Status: ACTIVE**, promoted 2026-07-31. **Specified in `TASK_SPEC.md`, which is the only
authority on its scope and acceptance.**
**Blocked on:** nothing. Every blocker cleared at promotion - see below.
**Touches:** `site.config.ts`; `about.mdx`, `join.mdx`, `donate.mdx` -> `help.mdx`;
`donate.astro` -> `help.astro`; `index.astro`, `locations.astro`, `posts.astro`;
`Header.astro`, `Footer.astro`; `locations.json`, `content.config.ts`; `README.md`.

The planned scope that stood here has been **cut into `TASK_SPEC.md`**, not copied. The model
it serves is in `PROJECT_CONTEXT.md` section 2 and the garden rulings in section 4, which
remain their authority.

**Six owner inputs were answered at promotion**, all recorded in `PROJECT_CONTEXT.md`
section 4: the organization name, the tagline, that **no cook or distribution site is named
publicly** (so the garden is the only record), that **the food is vegan and the site says so**,
the `/donate` -> `/help` rename, and that food-safety language is deferred rather than written.

**Four things changed at promotion, from grepping the repository rather than trusting this
entry:**

1. **`index.astro` was missing from this entry's scope and could not stay out.** It imports
   `locations.json` directly, so the data migration breaks it - not optional. Its prose is also
   off-model scaffold carrying the same storefront framing this entry flags in `locations.astro`.
2. **The single garden record breaks the homepage layout.** `locations.slice(0, 3)` renders one
   card in a three-column grid. A layout decision, not a data swap.
3. **The union ships with one variant, not three.** This entry sketched garden, distribution
   and cook-session on the assumption distribution sites would be named. The owner answered
   that none are, collapsing two of the three to zero records; shipping unexercised branches
   would violate constraints 3.2 and 3.4.
4. **`README.md` contradicts itself and one half is currently false.** Line 209 claims the
   location records describe real places; lines 11-14 of the same file say they are invented
   scaffold. Task 004b wrote the former in anticipation of this task.

**The promoted spec also resolves a conflict this entry created.** It required "add a Zod
schema" while `PROJECT_CONTEXT.md` records that importing `zod` directly is unsafe today and
needs an owner decision under constraint 3.6. Resolved by using the content layer's `file()`
loader with the `z` already re-exported from `astro:content` - the platform option constraint
3.6 prefers, and no new dependency.

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
