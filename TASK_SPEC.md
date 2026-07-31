# TASK SPECIFICATION

## Task 005 : Real content, on-model

### Role

`IMPLEMENTER`

### Status

**ACTIVE.** Promoted 2026-07-31 by an `ARCHITECT` session. This document is the only authority
on this task's scope and acceptance. Its planned scope has been **cut** from `ROADMAP.md`,
whose entry is now a status line pointing here.

Every Track A task is complete and merged to `main`. `HEAD` is `00ca0c7` and the working tree
is clean. Nothing of Task 004b's spec survives in this file - see `docs/DECISIONS_ARCHIVE.md`
under `## Verification history` for its record.

### Goal

Replace every invented public fact in `src/` with owner-approved content describing the real
group, and change `src/data/locations.json` from a flat storefront shape into a validated,
`kind`-discriminated data collection so the garden plot can be described truthfully without
forcing a falsehood or a dead field.

This is the task that makes the site honest. Until it lands, the repository ships a
description of an organization that does not exist.

---

## Why this is a rewrite, not a find-and-replace

Every MDX page describes a different organization than the real one: farm-surplus collection,
three staffed storefronts with phone numbers and opening hours, membership tiers with
"member-only" benefits, a founding date, and a fabricated "90% of all donations" statistic.
None of it is a naming problem. Renaming it produces the same false site with better nouns.

The real model, from `PROJECT_CONTEXT.md` section 2: people in Tucson gather, **cook food
together, and hand it directly to people in town**, including at street locations such as bus
stops. Cooking classes are forming. There is one named place - a rented garden plot - and no
storefronts, no staffed sites, and no per-location phone numbers, because none exist.

---

## Owner inputs answered at promotion, 2026-07-31

All six were supplied by the owner in the promoting session. **These are verified owner input,
not inference. Do not re-ask them, and do not soften them.**

| Input | Answer |
| --- | --- |
| **Organization name** | **`Vegans Against Fascism`.** Fills `GROUP_NAME`. See the naming ruling below - it is filled in config and **must not appear in prose**. |
| **Tagline** | **`a counter-cultural, total liberation collective`.** Fills `GROUP_TAGLINE`. |
| **Are cook and distribution sites named publicly?** | **No. None are named.** The garden is the only record. |
| **Is the food vegan, and may the site say so?** | **Yes - say so plainly.** Confirmed owner input; state it directly. |
| **`/donate` route** | **Renamed to `/help`**, label "Ways to help", per the 2026-07-30 Ways-to-Help decision. |
| **Food-safety language** | **Omitted for now.** Still an open owner input; write none. Do not invent a practices statement. |

---

## The naming ruling, which is the subtlest thing in this task

**A name change is anticipated.** The group is always evaluating new ways of presenting
itself, and its funding sources are dynamic, so the owner wants the site to stay rebrandable
as a standing property of the codebase rather than a one-off migration. Treat a name change
as expected; the timing is unknown. The group's internal circumstances are deliberately not
recorded here - the ruling below does not depend on them.

Two consequences, and they pull in opposite directions unless you follow both:

1. **Fill `groupName` in `site.config.ts` with the real name.** `PROJECT_CONTEXT.md` section 4
   is explicit that a token means *unknown, awaiting owner input*. The name is known. Leaving
   `GROUP_NAME` unfilled would misrepresent the world state exactly as writing `null` for an
   unknown would.

2. **The literal name must not appear anywhere in `src/`.** Not in MDX prose, not in a page
   heading, not in an `aria-label`, not in a comment. Write "the group", "we", "us". Task 004b
   collapsed the name into one config field precisely so a rebrand is a **one-line edit**; a
   name written into prose reintroduces the unverifiable find-and-replace that 004b exists to
   prevent, and `PROJECT_CONTEXT.md` section 2 forbids interpolating config into prose as a
   fix. A sentence that needs the group's name to work is a sentence to rewrite.

This is enforced by acceptance criterion 8. `site.config.ts` is the only file in the
repository that may contain the string.

---

## Verified starting conditions

Confirmed by reading the repository on 2026-07-31 at `00ca0c7`, and by executing every check
below on Node v22.23.2. **If any has changed, stop and report the mismatch rather than
adapting silently.**

### The green baseline this task starts from

| Check | Observed |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings, **12 hints** (the zod deprecation) |
| `npm run check:contrast` | exits 0, all sixteen role pairs pass |
| `npm run check:config` | **exits 1**, naming **6** token occurrences |
| `npm run build` | **6** routes: `/`, `/about`, `/donate`, `/join`, `/locations`, `/posts` |

### The invented facts to be removed, by grep

- `src/data/locations.json` - all three records. `123 Main Street, Springfield`,
  `456 Oak Avenue, Springfield`, `789 Garden Lane, Springfield`; `(555) 123-4567`,
  `(555) 987-6543`, `(555) 456-7890`; `main@`, `south@`, `garden@communityfood.org`; three
  sets of invented opening hours; invented `coordinates`; and the invented `features`
  vocabulary ("Workshop Space", "Learning Center", "Community Outreach").
- `src/content/pages/about.mdx:9` - `# About Our Community Food Group`, the one occurrence
  Task 004b deliberately left behind.
- `src/content/pages/about.mdx:11` - `Founded in 2024`.
- `src/content/pages/donate.mdx:55` - `**90% of all donations**`.
- `src/content/pages/join.mdx:18,25,32` - invented time commitments; `:36-44` invented
  membership tiers and "member-only" benefits.
- `src/pages/posts.astro:18` - "our community food group", a **lowercase** echo of the invented
  name that Task 004b's case-sensitive grep did not catch.
- `src/pages/locations.astro:16,19` - `Find Us` and "Visit any of our locations to get
  involved, pick up food" - storefront framing.
- `src/components/Footer.astro:12` - the prose blurb opening "Building food security through
  community action", left by Task 004b on purpose.

### Four repository facts the `ROADMAP.md` entry for this task did not have

Found by grep at promotion, not inherited. This entry's own inventory has been wrong before.

1. **`src/pages/index.astro` imports `locations.json` directly** at line 4 and renders
   `location.name`, `.address` and `.description` over `locations.slice(0, 3)`. The data
   migration below **breaks this file**; it is not optional scope. Independently, its prose is
   off-model scaffold: line 57 reads "Visit us at any of our community locations. We're here to
   serve you," which is the identical storefront framing the roadmap flags in `locations.astro`
   and puts in scope, and line 19 is a variant of the withdrawn tagline.
2. **With one location record, the homepage's three-up grid is wrong.** `slice(0, 3)` over a
   single record renders one lone card in a three-column grid under the heading "Our
   Locations". This needs a deliberate replacement, not a data swap. See required change 8.
3. **`README.md` contradicts itself, and one half is currently false.** Line 209 claims "This
   group's records describe real places in Tucson, Arizona and are not sample data" - while
   lines 11-14 of the same file say every record is invented scaffold. Line 209 was written by
   Task 004b in anticipation of this task and becomes true only when it lands.
4. **`heroDescription` and `heroImage` are declared in `src/content.config.ts:16,18` but
   consumed by no page.** `about.astro`, `join.astro` and `donate.astro` read only `title`,
   `description` and `heroTitle`. Dead frontmatter; this task rewrites that frontmatter anyway.

### One invariant this task deliberately breaks

Task 004b's acceptance criterion 7 read "`site.config.ts` is the only file in the repository
containing an unfilled identity token." **That was scoped to 004b's end state and this task
ends it**, because the contact route is `info@GROUP_DOMAIN` and the domain is genuinely
unpurchased, so the literal token belongs in the join and help copy.

This is permitted and correct. Constraint 1 allows owner-fill tokens **in content**; what
section 2 forbids is config *interpolation* (`{siteConfig.contactEmail}`) into MDX, which is a
different thing. Writing the literal token stays verifiable because `check:config` scans `src/`
and will fail the build until every occurrence is filled.

**`npm run check:config` reporting `GROUP_DOMAIN` inside `src/content/pages/*.mdx` after this
task is the expected, correct result. It is not a regression, and it must not be "fixed" by
inventing a domain or by deriving the address from config.**

---

## Allowed scope

- `site.config.ts` - **`groupName` and `tagline` only.** Do not touch `domain`,
  `contactEmail`, or `social`.
- `src/content/pages/about.mdx`
- `src/content/pages/join.mdx`
- `src/content/pages/donate.mdx` - **renamed to `help.mdx`**
- `src/pages/donate.astro` - **renamed to `help.astro`**
- `src/pages/index.astro`
- `src/pages/locations.astro`
- `src/pages/posts.astro` - **the lede sentence at line 18 only**
- `src/components/Header.astro` - **the two `/donate` nav links only**
- `src/components/Footer.astro` - **the line 12 blurb and the `/donate` quick link only**
- `src/data/locations.json`
- `src/content.config.ts` - **to add the locations collection, and to drop the two dead
  frontmatter fields**
- `README.md` - **the locations section and the line 209 contradiction only**

**Explicitly out of scope**, despite adjacency:

- **`src/components/MastodonFeed.astro`.** Its raw-markup defect is real and is **Task 006's**.
  Do not fix it here.
- **`public/` assets, the emoji logo in `Header.astro:10`, favicon and OG image.** **Task 007.**
- **Taking `zod` as a direct dependency, and the 12 zod hints.** **Task 009.** Use the `z`
  re-exported from `astro:content`, as `content.config.ts` already does.
- **CI, a link checker, the pre-publication judgement check.** **Task 009.**
- Any colour token, the type scale, the spacing rhythm, the **unlayered** `.container` and
  `.prose`. `src/styles/global.css` must not be touched.
- The Task 004 accessibility work. Do not re-derive it, do not "improve" it.
- `tsconfig.json`, `astro.config.mjs`, `package.json`, `scripts/`, `scripts/verify-baseline.sh`.
- Filling `GROUP_DOMAIN` or the Mastodon tokens. **Both remain open owner inputs.**
- Food-safety language. **Open owner input; write none.**

---

## Required changes

### 1. Fill the two answered identity fields

In `site.config.ts`, and nothing else in that file:

- `groupName: 'Vegans Against Fascism'`
- `tagline: 'a counter-cultural, total liberation collective'`

`check:config` must drop from **6** token occurrences to **4** in that file
(`GROUP_DOMAIN` twice, `MASTODON_HANDLE`, `MASTODON_URL`), plus whatever `GROUP_DOMAIN`
occurrences the new MDX copy legitimately introduces.

### 2. Rewrite `about.mdx`

Around the actual model. Required substance:

- People in Tucson gather, cook together, and hand food directly to neighbors.
- **The food is vegan. Say so plainly** - confirmed owner input.
- **Distribution cadence is monthly, and no precise time is published.** Per the 2026-07-30
  decision this is an *accuracy* choice, not a safety one: the schedule is set close to the
  date and genuinely changes.
- **Cooking classes are forming or upcoming** - never an established program with a history.
  Cultural events and other activities are deferred; do not describe them.
- **The garden belongs on this page, not only on the locations card.** Produce from the plot is
  either cooked into the food the group distributes or given directly to people in the group
  and to neighbors who need it. This is the one place the two activities connect, and it is a
  real, publishable link.
- Delete the founding date, the farm-surplus collection, the "food justice policy advocacy"
  claim, and the four-verb mission list.
- Fix the `h1`, which currently carries the invented name.

### 3. Rewrite `join.mdx`

For an affinity group, not a volunteer program.

- How someone actually shows up for a cook session.
- **The call to action is to email `info@GROUP_DOMAIN`**, written as that literal token, and a
  person replies.
- Delete every invented time commitment, role tier, and member-only benefit.
- **No chat link of any kind** - no Signal, WhatsApp, Telegram. Owner decision, 2026-07-30.
- **Do not frame the reply as an application, a screening, or a vetting step - and do not imply
  it is instant or automatic either.** Both exaggerations are constraint 1 problems in opposite
  directions. It is a person answering an email.
- What happens after someone writes in is internal and is not site content.

### 4. Replace `donate.mdx` with `help.mdx`, and rename the route

- `src/content/pages/donate.mdx` -> `src/content/pages/help.mdx`. The glob loader derives the
  entry id from the filename, so the id becomes `help`.
- `src/pages/donate.astro` -> `src/pages/help.astro`, and its `getEntry('pages', 'donate')`
  becomes `getEntry('pages', 'help')`. Its `throw new Error` message must be updated to match.
- Content is **Ways to Help**: concrete material and time needs - ingredients, containers,
  kitchen time, transport. **Ingredient donations must be vegan; say so.**
- **The 90% transparency claim is withdrawn and must not reappear in any form**, including
  softened ("most of", "the vast majority of").
- Do not invent a bank transfer route, a donation platform, or a drop-off address. There are
  no staffed sites and no published hours to drop off during. Route material offers through
  the same email.
- Update the internal link at the old `donate.mdx:45` to `/join`, which is unchanged.
- In `Header.astro` (both nav lists) and `Footer.astro` (quick links), `/donate` -> `/help` and
  the label "Donate" -> **"Ways to help"** (sentence case, per the heading-case convention for
  UI labels and links).

### 5. Replace `src/data/locations.json`

**One record. The garden.** The owner has answered that no cook or distribution site is named
publicly, so there is nothing else to write.

The verified and owner-supplied facts, from `PROJECT_CONTEXT.md` section 4, which is their only
copy - **read it before writing this copy**:

- `Presidio Garden`, `3440 E Presidio Rd`, Tucson, Arizona.
- One of eighteen gardens operated by **Community Gardens of Tucson**. Name them and link to
  `https://www.communitygardensoftucson.org/garden-locations` with
  `rel="noopener noreferrer"`.
- The group rents a **large plot** there.
- Cadence: **every other week during the growing season**, sometimes more often, sometimes
  less. State the variability.
- **Publish the address. Do not publish a map link or a directions affordance.** Access
  requires a CGT membership and a plot fee, so directions are a promise the site cannot keep.
- **No phone number and no per-site email.** They do not exist. The single contact route is
  email.

**Standing dependency:** these are facts about a third party and a rental that can lapse.
`PROJECT_CONTEXT.md` requires the CGT listing to be **re-verified before publication** rather
than assumed still current. This task is drafting, not publishing, so re-verification is a
Task 008 gate - but if you find the listing has changed, stop and report it.

### 6. Validate it as an Astro data collection

Owner decision at promotion: **use the content layer's `file()` loader**, per constraint 3.6's
preference for the platform over a new dependency.

- In `src/content.config.ts`, add a `locations` collection with
  `loader: file('src/data/locations.json')` and a schema built with the `z` already imported
  from `astro:content`. **Do not import `zod` directly** - it is only a transitive dependency
  of astro today, so a direct import would rely on npm hoisting. That decision is Task 009's.
- The schema is a **discriminated union on `kind`**, via `z.discriminatedUnion('kind', [...])`.
- **Define exactly one variant today: `garden`.** The roadmap sketched three kinds
  (garden, distribution, cook-session) on the assumption that distribution sites would be
  named. The owner has since answered that none are, which collapses the other two to zero
  records. Shipping unexercised union branches and unexercised render paths would violate
  constraints 3.2 and 3.4. A discriminated union with one member is valid, makes the extension
  point explicit, and makes adding the next variant **additive rather than a refactor** - which
  is the whole reason for the discriminator.
- The `garden` variant carries: `id`, `name`, `address`, `cadence`, `description`, and the
  operator attribution (`operatorName`, `operatorUrl`). It carries **no** `coordinates`, `hours`,
  `phone`, `email`, or `features`. Every one of those was invented, and three of them are
  forbidden by the rulings above.
- Note in your report the new `npm run check` hint count. Adding a second `z` usage will change
  it from 12. **The new number is the new baseline, not a regression** - it is the same
  documented zod deprecation, counted in one more place.

### 7. Update `src/pages/locations.astro` to the new shape

- Read via `getCollection('locations')`, not the raw JSON import.
- **Delete the `Object.entries(location.hours)` block, the `phone` block, the `email` block,
  the `features` chips, and the Google Maps directions link.** With the new schema they have no
  data behind them; leaving any of them renders a dead field.
- The `MapPin`, `Clock`, `Phone` and `Mail` icon imports must be pruned to what still renders.
- The `h1` "Find Us" and the lede "Visit any of our locations to get involved, pick up food, or
  learn more about our programs" are storefront framing and both go. Replace with copy that
  explains the real model: distribution happens monthly around town, the schedule is arranged
  close to the date, and involvement routes through email.
- **The route stays `/locations`.** Deliberate, not an oversight: it is accurate, and renaming
  two routes in one task is churn. Do not "fix" it.

### 8. Update `src/pages/index.astro`

- Migrate the `locations` import to `getCollection`, or drop it - see below.
- **Replace the three-up "Our Locations" grid.** One record in a three-column grid is a layout
  defect. Either present the garden as a single feature block, or replace the section with copy
  explaining how distribution works and link to `/locations`. Implementer's choice, but not
  `slice(0, 3)` over one record.
- Rewrite the hero (`Nourishing Our Community` / "Building a more food-secure future through
  connection, education, and community action"), the locations lede at line 57, and the
  closing CTA ("Ready to Make a Difference?", "Volunteer today", "Support our mission").
- Both `/donate` CTAs become `/help` / "Ways to help".

### 9. Fix the lowercase name echo in `posts.astro:18`

"...announcements from our community food group" - rewrite the sentence. **The lede text only.**
The `MastodonFeed` component and its defect are Task 006's.

### 10. Rewrite the `Footer.astro:12` blurb

Left by Task 004b on purpose. Two sentences of on-model prose. It opens with the withdrawn
invented tagline today. **Prose, so no config interpolation and no literal group name.**

### 11. Reconcile `README.md`

- The claim at line 209 that the records "describe real places in Tucson, Arizona and are not
  sample data" becomes true with this task - confirm it reads correctly against the single
  garden record and does not imply multiple sites.
- Document the `kind` discriminator in the adopter section, and say that a group with named
  distribution sites adds a variant to the union.
- **The "not ready to publish" callout at lines 9-17 stays.** `GROUP_DOMAIN` and the Mastodon
  handle remain unfilled, `check:config` stays red, and the site still must not be deployed.
  Update its wording so it no longer claims the locations records are invented scaffold, but do
  not remove the warning.

---

## The framing traps, stated so they can be checked

`PROJECT_CONTEXT.md` warns that the most likely failure here is **smoothing a true-but-awkward
sentence into a false-but-natural one.** Each of these has a shorter, more natural, wrong form:

| Never write | Because |
| --- | --- |
| "our community garden" | The group rents a plot at a garden **run by someone else**. Permitted framing: the group maintains a plot at Presidio Garden, one of the Community Gardens of Tucson. |
| anything implying partnership or affiliation with CGT | The relationship is a plot rental. Nothing more. |
| "members" for people who receive food | The word now carries three incompatible senses - a CGT plot-holder, a person in the group, and the scaffold's invented tiers. Use "people in the group" and "neighbors". |
| "bi-weekly" | Means both *twice a week* and *every two weeks*. Cannot ship under constraint 1. |
| any month or date range for the growing season | Not supplied, and Tucson's season is not the one most writers would assume. |
| a directions or map link for the garden | It would route neighbors to a garden they cannot enter. |
| any published distribution time | The schedule is set close to the date. Publishing it in advance would be **inaccurate**. |
| the literal group name, anywhere in `src/` | See the naming ruling. |
| any chat link | Owner decision, 2026-07-30. |
| "apply", "screening", "vetting" - or "instantly", "automatically" | It is a person answering an email. Both directions are constraint 1 problems. |
| "90%", "most donations", or any efficiency figure | Withdrawn in full. |

---

## Acceptance criteria

Every criterion is **executed**, not inspected. Constraint 3.10 forbids reporting success from
a diff. Paste real output.

1. `npm run check` reports **0 errors, 0 warnings**. Report the hint count and state explicitly
   that the change from 12 is the zod deprecation counted in one more place.
2. `npm run check:contrast` still exits **0** with all sixteen pairs passing, and
   `git diff HEAD -- src/styles/global.css` is **empty**. This task moves no colour.
3. `npm run check:config` **still exits non-zero** - correctly. Its output must **no longer
   name `GROUP_NAME` or `GROUP_TAGLINE`**, and must still name `GROUP_DOMAIN` and the two
   Mastodon tokens. **Do not fill a token to make it green.**
4. `npm run build` emits **six** routes: `/`, `/about`, `/help`, `/join`, `/locations`,
   `/posts`. `/donate` is gone and `/help` has replaced it.
5. `grep -rniE 'springfield|\(555\)|communityfood\.org|90%|founded in 2024|community food group' src/`
   returns **nothing**. Paste the empty result.
6. `grep -rn 'CITY' src/` returns **nothing**. The city is Tucson and is written out.
7. `grep -rni 'our community garden' src/ dist/` returns **nothing**.
8. `grep -rn 'Vegans Against Fascism' . --exclude-dir=node_modules --exclude-dir=.git`
   returns hits in `site.config.ts` and in the project documents **only** - and **zero** hits
   in `src/`. This is the naming ruling, and it is the criterion most likely to fail.
9. `grep -rniE 'signal|whatsapp|telegram' src/ dist/` returns nothing that is a chat link.
10. `grep -rn '/donate' src/ dist/` returns **nothing**. The rename is complete.
11. **In `dist/`, not in source:** the garden card shows the street address and has **no**
    directions or maps link; Community Gardens of Tucson is named and linked with
    `rel="noopener noreferrer"`; and no distribution time appears anywhere.
12. **In `dist/`,** `<title>`, `<meta name="description">` and `og:description` show the real
    name and tagline, not a token.
13. Task 004's accessibility work is intact:
    `grep -rn 'role="menubar"\|role="menuitem"\|role="none"' src/` and
    `grep -rn 'href="#"' src/` both still return nothing.
14. **Every factual claim in the new copy traces to a specific owner input.** Provide a short
    table mapping each claim to its source row in this spec or in `PROJECT_CONTEXT.md`
    section 4. A claim you cannot trace is one you invented; remove it.
15. **A browser pass is required for this task** - unlike Task 004b. `/`, `/locations` and
    `/help` change layout materially, and the one-record locations grid is a layout decision
    that cannot be verified from a diff. Check at **375px and 1440px**. See
    `docs/ENVIRONMENT.md` for the persistent Playwright/Chromium setup and the
    `LD_LIBRARY_PATH` requirement.

---

## Reviewer focus

- **Did the literal group name reach `src/`?** Criterion 8. The natural way to write an about
  page is to name the group in the first sentence; this task forbids it.
- **Did "our community garden" survive anywhere**, including in an `alt`, a `title` attribute,
  or a meta description?
- **Is the garden's operator relationship stated as a plot rental**, with no wording that
  implies partnership, affiliation, or that the group runs the site?
- **Does a directions link exist for the garden?** It must not.
- **Is any distribution time published?** It must not be.
- Is "member" used for anyone who receives food?
- Are the cooking classes described as established rather than forming?
- Was a food-safety statement invented? None was authorized.
- Was a domain, drop-off address, or donation platform invented to fill a gap?
- **Was `check:config` weakened, or a token filled, to make `verify` green?** The correct end
  state is still red, on `GROUP_DOMAIN` and the Mastodon tokens.
- Was the `MastodonFeed` markup defect "helpfully" fixed? It is Task 006's.
- Were `global.css`, `astro.config.mjs`, `tsconfig.json`, `package.json` or `scripts/` touched?
  None should be.
- Was `zod` imported directly rather than via `astro:content`?
- Does the homepage still render a three-up grid over a single record?

---

## Out of scope / queued work

**Task 006 (Mastodon) follows.** Still blocked on the Mastodon handle in `PROJECT_CONTEXT.md`
section 4. This task does not touch `MastodonFeed.astro`.

**Task 007 (brand assets)** needs the logo/favicon/OG image, still deferred. Note that the
`🍲` emoji logo and the missing `public/` assets are untouched here by design.

**Two owner inputs remain open after this task:** the domain (`GROUP_DOMAIN`, which gates
deployment and the token check) and the Mastodon handle. **Food-safety language is a third,
deliberately deferred rather than answered.**

**An eventual name change is a live project fact.** When a new name arrives it is a one-field edit to
`site.config.ts` - provided this task's naming ruling held. If a reviewer finds the name in
prose, that edit becomes a prose rewrite instead, and the ruling has failed.
