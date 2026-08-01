# AI COLLABORATION PROTOCOL & PROJECT CONTEXT

## 1. OPERATIONAL ROLE & SESSION CONTEXT

You are participating in a modular, multi-session software-development workflow.

- Every session is isolated and stateless.
- Treat this file as the project-level single source of truth.
- Treat `TASK_SPEC.md` as the single source of truth for the active task.
- `ROADMAP.md` is the ordered backlog. It is planning material, not authorization to change code, and an `IMPLEMENTER` **does not need to load it** - everything binding on the active task is here or in `TASK_SPEC.md`. It is an `ARCHITECT` and owner document.
- Do not rely on conversational memory, inferred files, or an earlier task embedded in a prompt.
- Before changing code, compare the task's relevant-file list with the repository. If they disagree, stop and report the mismatch.
- The session role will be one of `ARCHITECT`, `IMPLEMENTER`, `REVIEWER`, or `DEBUGGER`.

### One owner per fact

Every fact lives in exactly one file. Other files **point** to it rather than restating it.

| Fact | Owner | Written by |
| --- | --- | --- |
| Durable rules, decisions, current state, open defects, owner inputs | `PROJECT_CONTEXT.md` | `MEMORY SYNC` |
| Order, blocking relationships, files each queued task touches | `ROADMAP.md` | `ARCHITECT` at promotion time only |
| Full scope and acceptance for the **one** active task | `TASK_SPEC.md` | `ARCHITECT` at promotion time |

Promotion **moves** detail, it does not copy it: a task's scope is cut from `ROADMAP.md`
into `TASK_SPEC.md`, and on completion cut into `PROJECT_CONTEXT.md` as dated decisions
while its roadmap entry collapses to a status line. A queued entry that survives promotion
becomes a second, stale spec competing with the real one. This has already happened once,
on 2026-07-30, to both the owner-inputs list and the Task 003 entry.

An `IMPLEMENTER` never writes `ROADMAP.md`, so it cannot drift mid-task.

### Files you do not need to read

Two files exist so this one can stay small. **Do not load them by default.**

- `docs/DECISIONS_ARCHIVE.md` - superseded decisions, resolved defects, the rationale behind
  rules that are already stated here, and the **per-task verification records** for completed
  work. Read it only when a rule here looks arbitrary, when you are about to propose reversing
  one, or to settle a question about how a finished task was confirmed. Never treat it as
  current authorization.
- `docs/ENVIRONMENT.md` - workstation setup: Node selection, the cached baseline
  verification, and the persistent Playwright/Chromium install. Read it only when a task
  needs a browser or the baseline behaves unexpectedly.

---

## 2. CORE SYSTEM & TECH STACK

- **Project:** Community Food Group public information site
- **Repository:** `hamid-veganhomecooks/community-food-group`
- **Framework / language:** Astro 7, TypeScript, Astro components, MDX
- **Rendering:** Static output only; no application server or database
- **Hosting target:** Cloudflare Pages, output directory `dist/`
- **Content:** Astro content collection for editorial MDX pages
- **Structured data:** JSON for distribution/meetup sites and the generated Mastodon cache
- **Styling / UI:** Tailwind CSS 4 through `@tailwindcss/vite`, with `@tailwindcss/typography` supplying `prose` for the editorial routes; `lucide-astro` icons. Configured in CSS via an `@theme` block in `src/styles/global.css`, which holds the palette, the type scale, the spacing rhythm and the measure. There is no `tailwind.config.mjs`.
- **External data:** Optional Mastodon account feed fetched by a Node build-time utility
- **Architecture:** Static-first Jamstack. JavaScript is used only where interaction requires it, currently the mobile navigation toggle.
- **Package manager:** npm with a committed `package-lock.json`
- **Node contract:** Node 22 LTS (>= 22.18), pinned in `.nvmrc` at 22.23.2. Required so
  `node scripts/fetch-mastodon.ts` runs through native erasable-TypeScript stripping without
  a runner dependency. Cloudflare Pages must set `NODE_VERSION` to match.

### Dependencies

Ranges are in `package.json`; run `npm ls` for installed versions rather than trusting a
table here. As of 2026-07-30, installed versions match the ranges exactly and `npm audit`
reports **0 vulnerabilities**.

`@astrojs/tailwind` has been **removed and must not be reintroduced**: its latest release
(6.0.2) peer-depends on `astro: ^3 || ^4 || ^5` and is incompatible with Astro 7.

### Organizational model

The site represents a local mutual aid affinity group. The group's core activity is
gathering to **cook food together and then distribute it directly to people in town**,
including at street locations such as bus stops. The group also intends to expand into
**cooking classes focused on cheap, healthy meals**, **cultural events**, and other
activities typical of a local affinity group.

This model matters for content architecture:

- The group is **not** a food bank, a farm-surplus redistributor, or a pantry network.
- The group has **no storefronts, staffed sites, or per-location phone numbers**.
- Activity is organized around a **recurring rhythm** (cook, then distribute), not around
  building hours.
- Programs beyond food distribution are **planned or emerging**, and must not be described
  as established until the owner confirms they have happened.
- **The group operates in Tucson, Arizona.** Confirmed 2026-07-31. This is a published fact,
  not a token; see the retirement of `CITY` in section 4.
- **One exception to "no fixed places": the group maintains a rented garden plot.** Confirmed
  by the group executive on 2026-07-31. It is established rather than emerging and may be
  written in the present tense. It is **not** a staffed site and does not get a phone number
  or a per-site email.
  **The group does not own or run a garden.** It rents a large plot at Presidio Garden, which
  is operated by a separate organization, Community Gardens of Tucson. Copy must never say
  "our community garden" or otherwise imply the group runs the site, partners with CGT, or is
  affiliated with it beyond holding a plot. See section 4 for the verified details and the
  exact permitted framing.
- **The garden feeds the distribution effort.** Produce from the plot is either incorporated
  into the food the group cooks and distributes, or given directly to people in the group and
  to neighbors who need it. This is a real, publishable link between the two activities.

Any scaffold content describing farm pickups, multiple staffed locations, membership tiers,
or donation-efficiency statistics is off-model and must be replaced, not merely renamed.

Important distinction: this is a separate Astro project. It is not the Hugo-based
`veganhomecooks` site and must not inherit that repository's Hugo theme, recipes, Worker,
R2, or deployment assumptions.

### Reuse model

**[2026-07-31] This repository is a template plus one group's instance of it.** Owner
decision. The accessibility, verification and token work has value beyond this group, and the
repository is deliberately shaped so another mutual aid group in another city can adopt it.

**The model is fork-and-self-host. It is explicitly not multi-tenant.** Each adopting group
forks the repository, edits four documented surfaces, and deploys its own build. There is no
tenant routing, no per-group runtime data, no shared deployment, and no service operated on
behalf of other groups. Constraint 3.11 continues to forbid the Worker, database and
request-time infrastructure that multi-tenancy would require, and this decision does **not**
relax it. A future session proposing "support multiple groups from one deployment" is
proposing to reverse this decision and needs a new one.

**The four adoption surfaces**, and nothing else:

| Surface | What an adopter edits | Status |
| --- | --- | --- |
| `site.config.ts` | Identity constants - name, tagline, city, contact, social - **plus the nav list and every header and footer label** | Shipped, Task 004b; **labels added by Task 005b** |
| `:root` brand inputs in `src/styles/global.css` | Fourteen colour values | Shipped, Task 003 |
| `src/data/locations.json` | Replaces the records wholesale | Shipped, Task 005 |
| `src/content/pages/*.mdx` | **All prose on every route, including the home page** | Shipped, Task 005; **widened to every route by Task 005b** |

**[2026-07-31] Surface 4 now means what it says. Task 005b closed the gap and this table has
been corrected to match.** It previously overstated the surface: an adopting group rewrote
`about.mdx`, `join.mdx` and `help.mdx`, then discovered that the **home page**, `/locations`,
`/posts`, the header nav and the footer still carried this group's sentences inside `.astro`
files - about forty strings. "Rewrite the prose wholesale" was never the whole job.

**The fork-and-adopt promise is only real when copy has one location.** That was the whole
argument for the consolidation, and it is why the home page was **in** scope after the owner
overruled the first, narrower ruling. See the content-architecture entries in section 4.

**`README.md` and this table are the two places that describe where prose lives, and both go
stale when it moves.** Task 005b updated `README.md`; this `MEMORY SYNC` updated the table.
**Both halves are now current** - the flag that stood here is discharged. Keep them in step: a
half-updated pair is exactly the drift this project keeps rediscovering.

**[2026-07-31] The repository is dedicated to the public domain under CC0 1.0 Universal.**
Owner decision; `LICENSE` holds the canonical text. No attribution is required and no use is
restricted. CC0 was chosen over `0BSD` because it covers this repository's substantial prose
and documentation as well as its code; the accepted tradeoff is that CC0 is not OSI-approved
and does not waive patent rights, which a static site has no meaningful surface for.

**CC0 does not cover three things, and copy must not imply otherwise:**

- **Trademark is not waived.** An adopting fork publishes under its own name. This is the
  legal half of the problem that Task 004b solves mechanically by extracting the name into
  `site.config.ts`.
- **Inter is SIL OFL 1.1**, verified at source. It is fetched at build time and emitted into
  `dist/`, so every deployed fork redistributes it. Bundling is expressly permitted, the OFL
  notice travels with the build, and a modified font may not use the reserved name "Inter".
  **A future task that changes the typeface must re-check the new font's licence** - this is
  not a one-time clearance.
- **The truthfulness of the page copy.** The prose describes a real group in Tucson and a
  rented plot at a garden run by another organization. It is freely copyable and would be
  false if republished unchanged. This is constraint 1 reaching an adopter rather than an
  implementer, and it is why the reuse model says prose is rewritten, not interpolated.

**Open:** contributor guidance. CC0 covers only what the owner holds, so a `CONTRIBUTING.md`
dedicating contributions under CC0 is needed before outside patches are accepted.

**The load-bearing distinction is between chrome and prose.** Config drives chrome - header,
footer, `<title>`, OG and Twitter metadata, the copyright line, the content-collection author
default. Prose is **replaced, not interpolated**. A group in another city does not need this
group's sentences with their city injected into them; they have a different model, different
programs, and no garden plot at Presidio. Templating prose produces grammatically brittle copy
that is confidently wrong, which is the exact failure mode constraint 1 exists to prevent.
**Do not add config interpolation into the MDX documents.** If a sentence needs a token to
make sense, that sentence belongs to the adopting group, not to the template.

---

## 3. NON-NEGOTIABLE DEVELOPMENT CONSTRAINTS

1. **Zero invented facts in production output:** Never invent addresses, phone numbers, email addresses, social accounts, donation claims, operating statistics, dates, or organizational history. Unknown public content must be omitted, clearly modeled as draft data, or supplied by the project owner. **Owner-fill placeholder tokens are the one permitted exception**, under the strict conditions in section 4. The distinction is deliberate: a visible `GROUP_NAME` token is honest absence, while a plausible invented name is dishonest presence. Only the former is ever acceptable, and never in a deployed build. Tokens are `SCREAMING_SNAKE_CASE` and must match the single documented pattern in section 4.
2. **No incomplete code:** Never output `TODO`, ellipses, truncated functions, fake links, or copy-paste-incomplete blocks unless the task explicitly requests a sketch.
3. **Strict scope compliance:** Only change files listed in `TASK_SPEC.md`. Do not refactor adjacent code unless the task identifies it as required.
4. **Observed state beats planned state:** Never claim a file, dependency, build hook, component, route, deployment, or test exists until verified in the repository.
5. **Type safety:** Keep Astro's strict TypeScript configuration. Avoid `any`; validate external API data before using it.
6. **Minimal dependencies:** Prefer the platform, Astro, and existing packages. A new package requires an explicit architectural decision in this file and authorization in `TASK_SPEC.md`.
7. **Accessibility:** Target WCAG 2.2 AA. Use semantic website navigation, keyboard-operable controls, visible focus styles, meaningful alternative text, and reduced-motion-safe behavior. Do not use application-menu ARIA patterns for ordinary site navigation.
8. **External HTML is untrusted:** Mastodon status HTML must never be rendered with `set:html` unless it is sanitized by an explicitly approved strategy. Escaped plain text is safer than unsanitized HTML, but escaping raw HTML into a text node is a rendering defect in its own right; see the open Mastodon defect in section 4.
9. **No browser-side Mastodon API calls:** Mastodon data is retrieved before rendering and stored in `src/data/mastodon-posts.json`.
10. **Deterministic verification:** Every implementation task must run the checks named in its acceptance criteria. Do not report success from inspection alone. `npm run verify` runs them; it caches only the lockfile-dependent half. See `docs/ENVIRONMENT.md`.
11. **Static boundary:** Do not add a Cloudflare Worker, database, form handler, authentication, or other server runtime without a new architectural decision.
12. **No secrets in Git:** Environment-specific values belong in local or Cloudflare environment settings. Commit only documented examples.
13. **Files stay UTF-8 clean:** Do not reintroduce double-encoded characters. Prefer ASCII punctuation in Markdown; if a box-drawing or typographic character is used, verify the committed bytes.

---

## 4. CURRENT ARCHITECTURAL DECISIONS & MEMORY STATE

Entries are the rules in force. Rationale that is no longer needed to do the work has moved
to `docs/DECISIONS_ARCHIVE.md`.

### Product and content

- Editorial pages are MDX; site records are structured JSON.
- Mastodon ingestion is build-side only. The cache is `src/data/mastodon-posts.json`.
- No Worker, database, account system, or client-side Mastodon fetch is part of the MVP.
- Accessibility is a release requirement, not a later enhancement.
- **`/locations` is a distribution-and-meetup page.** It presents where the group cooks and
  where it hands out food, with day/time and an optional map destination. Per-site phone
  numbers and per-site email addresses are removed from the data model, because they do not
  exist.
- **[2026-07-31] The group rents a garden plot, and it is published as a real place.** Owner
  input from the group executive, amending the organizational model in section 2. **The
  third-party details below were verified against the operator's own site on 2026-07-31, not
  taken on trust**, because publishing another organization's name and address is exactly the
  case constraint 1 governs.

  **Verified facts.** `Presidio Garden`, `3440 E Presidio Rd`, listed under that exact name and
  address as one of eighteen gardens operated by **Community Gardens of Tucson**
  (`https://www.communitygardensoftucson.org/garden-locations`). CGT is at 5049 E Broadway
  Blvd, Suite 300, Tucson AZ. Its stated model is that a person pays a plot fee and becomes a
  member of CGT, which grants access to the garden.

  **Owner-supplied facts.** The group rents a **large plot** there, meets **every other week
  during the growing season** to maintain it - sometimes more often, sometimes less - and the
  produce is either incorporated into the cooking-and-distribution effort or given directly to
  people in the group and to neighbors who need it.

  Rulings, all binding on Task 005:
  - **Never "our community garden."** The permitted framing is that the group maintains a plot
    at Presidio Garden, one of the Community Gardens of Tucson. The group does not run the
    garden, is not a partner of CGT, and is not affiliated with it beyond renting a plot. This
    is the single most likely sentence for a future session to smooth into something false,
    because the short phrase is more natural English than the true one.
  - **Name CGT and link to them**, with `rel="noopener noreferrer"`. Honest attribution, and it
    lets a reader verify the plot is real.
  - **Publish the address; do not publish a map link.** Access requires a CGT membership and a
    plot fee, so a `Get Directions` affordance is a promise the site cannot keep - it would
    route neighbors to a garden they cannot enter. This is why the card's directions link is
    conditional on `kind` rather than rendered for every record. Involvement routes through
    email, as everywhere else on the site.
  - **Cadence is "every other week during the growing season," with the variability stated.**
    The owner's original word was "bi-weekly", which means both *twice a week* and *every two
    weeks* in English and therefore cannot ship under constraint 1. **Do not name months or a
    date range for the growing season** - that was not supplied, and Tucson's is not the
    single-summer season most writers would assume.
  - **Beware the word "member".** It now carries three incompatible senses: a CGT plot-holder,
    a person in the group, and the scaffold's invented membership tiers that Task 005 is under
    orders to delete. Prefer "people in the group" and "neighbors". Copy saying food goes to
    "members" will be read as the third sense.
  - **The scaffold `community-garden` record was replaced wholesale, not edited**, by Task 005.
    `789 Garden Lane, Springfield`, `(555) 456-7890`, `garden@communityfood.org` and its seven
    days of 8:00-6:00 hours were all invented and are gone. What survived is the **card
    affordance**, not the row. A future session must not read "keep the community garden card"
    as authorization to reinstate that data.
  - **This was a schema change, and it shipped.** A distribution point deliberately publishes
    no time; the garden has a real cadence and a real address but no map link. One flat shape
    forces one of them to carry a falsehood or a dead field. `src/data/locations.json` is now
    an Astro data collection with a `kind` discriminator and a discriminated union, defined in
    `src/content.config.ts` - see the Task 005 decision below.
  - The garden does **not** reopen the "staffed sites" question. It has no phone number and no
    per-site email; the single contact route is still email to `info@GROUP_DOMAIN`.
  - **Standing dependency:** these are facts about a third party and about a rental that can
    lapse. If the plot is given up, the card and the about-page claim both go stale. Re-verify
    the CGT listing before publication rather than assuming this entry still holds.
- **The route is `/help`, labelled "Ways to help".** Renamed from `/donate` by Task 005. It
  presents concrete material and time needs - vegan ingredients, containers, kitchen time,
  transport - rather than a donation-platform flow. The invented "90% of all donations"
  transparency claim is withdrawn and must not reappear in any form. There is deliberately
  **no money section**: no bank route, no platform, no drop-off address, because none exist.
- **Distribution cadence is monthly; precise scheduling happens off-site.** The site states
  the monthly rhythm and nothing more precise. The exact schedule is set close to the date
  and genuinely changes, so publishing a time in advance would be **inaccurate**, not merely
  a safety tradeoff.
- **[2026-07-30] The single public contact route is email, and no chat link appears on the
  site.** Owner decision, superseding the earlier plan to publish a Signal invite. People
  write to `info@GROUP_DOMAIN`; a person replies and handles onboarding off-site.
  Consequences for copy, all binding on Tasks 004-007:
  - **No Signal, WhatsApp, Telegram or other chat link may appear anywhere on the site.**
    This is a deliberate owner choice, not a missing asset awaiting a value. A future session
    must not "helpfully" add a join-the-chat button.
  - Invite people to write in, and say plainly that a person will get back to them.
  - Do **not** frame the reply step as an application, a screening, or a vetting process -
    and do not imply it is instant or automatic either. It is a person answering an email.
    Both exaggerations are constraint 1 problems in opposite directions.
  - What happens after someone writes in is **internal** and is not site content.
- **Cooking classes get a real section now**, written as forming or upcoming, never as an
  established program with a history. Cultural events and other activities are deferred
  until they are real.
- **Heading case:** Title Case for `h1` and `h2`; sentence case for `h3` and below, UI
  labels, buttons and links. The MDX documents were brought into line by Task 005.
- **Owner-fill placeholder tokens are permitted in content, under conditions.** Content work
  may use literal `SCREAMING_SNAKE_CASE` tokens matching the single documented pattern below.
  Still unfilled as of 2026-07-31: **`GROUP_NAME`**, **`GROUP_TAGLINE`**, **`GROUP_DOMAIN`**,
  and the Mastodon account tokens. (`GROUP NAME`, spelled with a space, is retired - see the
  token-spelling note in the owner-inputs subsection.)

  **On `CITY`, which two entries here could be read as contradicting.** A token and a config
  field are different things, and the distinction is the whole point of this rule:
  - **`CITY` as an unfilled placeholder is retired**, on 2026-07-31. This group's city is
    Tucson, Arizona. Once the garden card publishes a Tucson street address, a `CITY` token
    elsewhere on the site is not honest absence, it is theatre. **Do not reintroduce it as a
    placeholder in this instance's content.**
  - **`city` survives as a config field** in the `site.config.ts` that Task 004b creates,
    holding the filled value `'Tucson'`. That is data, not a placeholder. An adopting group
    forking this template edits that field; see the reuse model in section 2.

  A filled config field is honest presence. An unfilled token is honest absence. A token left
  standing next to a fact that gives it away is neither. All conditions are mandatory:
  - Tokens are `SCREAMING_CASE` or spaced uppercase so they are unmistakably unfilled to any
    reader, including a non-technical one reviewing a preview.
  - **A token must never be spelled as a plausible real value.** The contact address is
    written `info@GROUP_DOMAIN`, never `info@domain.com` or `info@example.com`: the local
    part is a real decision, the domain is the blank. A plausible-looking address reads as
    genuine to a reviewer, and `domain.com` is a real registered domain belonging to someone
    else, so a `mailto:` pointing at it would be both dishonest presence and a live link to
    a third party.
  - Every token is greppable by a single documented pattern, and the pre-publication check
    in Task 009 fails the build while any remain.
  - Tokens stand in only for **identifiers the owner will supply**: name, city, contact
    handles. Never for a claim that may turn out to be false - a statistic, a founding date,
    a program that may not exist, or a schedule.
  - No deployed build may contain one. This unblocks drafting; it does not unblock
    publishing.

- **[2026-07-31] The group is `Vegans Against Fascism`, a name change is anticipated, and the
  name must never be written into prose.** Owner input at the Task 005 promotion, and the
  single most consequential naming rule in this project.

  **The facts.** The public name today is `Vegans Against Fascism` and the current tagline is
  `a counter-cultural, total liberation collective`. The group is always evaluating new ways
  of presenting itself, and its funding sources are dynamic, so the owner wants the site to
  stay rebrandable as a **standing property of the codebase** rather than a one-off migration.
  **Treat a name change as expected. The timing is unknown.**

  **This entry is deliberately non-specific about the group's internal circumstances**, by
  owner decision on 2026-07-31, and should stay that way. The repository is public and the
  reasons behind a name change are not the codebase's business. What a future session needs is
  the *engineering* consequence below, which does not depend on the reasons at all - so do not
  "restore context" here by writing them back in.

  Rulings, all binding:
  - **`groupName` and `tagline` are filled with the real values, not left as tokens.** The
    state table below is explicit that a token means *unknown, awaiting owner input*. These are
    known. A token here would misrepresent the world state exactly as `null` for an unknown
    would - it would also permanently mislead the next session into re-asking a settled
    question.
  - **The literal name must not appear anywhere in `src/`** - not in prose, a heading, an
    `aria-label`, a comment, or a meta tag. Write "the group", "we", "us". Task 004b collapsed
    the name into one config field precisely so a rebrand is a **one-line edit**; a name written
    into prose reintroduces the unverifiable find-and-replace that 004b exists to prevent.
  - **Interpolating config into prose is not the escape hatch.** Section 2 forbids it, and it
    would produce exactly the mad-libs copy the reuse model warns about. **A sentence that needs
    the group's name to work is a sentence to rewrite.**
  - This is the same discipline the template needs for an adopting fork, arriving early because
    this instance happens to need it first. It is not a workaround.
  - **When the new name lands it is a two-field edit to `site.config.ts`** - provided the rule
    above held. If the name is ever found in prose, that edit becomes a prose rewrite and the
    rule has failed. A future session should grep before assuming it holds.
  - **Verified holding as of Task 005**: zero occurrences in `src/`, the one occurrence in
    `site.config.ts`, and the expected renders in `dist/`.

- **[2026-07-31] The group's internal circumstances are not recorded in any tracked file.**
  Owner decision. The repository is public and volunteers read it; the funding position, any
  organizational strain, and the reasons behind a name change are not the codebase's business
  and would leave a reader with a false impression of the group.

  **Record the engineering consequence, never the motivation behind it.** The naming rule above
  is fully binding without a reason attached, which is why removing the reasons cost nothing.
  The approved register is neutral and forward-looking - "always evaluating new ways of
  presenting itself", "funding sources are dynamic".

  This applies to `PROJECT_CONTEXT.md`, `TASK_SPEC.md`, `ROADMAP.md` and
  `docs/DECISIONS_ARCHIVE.md` alike. **A future session offering to "restore the missing
  context" is proposing to reverse this decision.** Two documents carried such wording between
  the Task 005 promotion and its `MEMORY SYNC`; it was removed from the working tree while the
  only commit containing it was still unpushed.

### Preview deployment, and what the token rule actually forbids

- **[2026-07-31] The domain is answered: `vegansagainstfascism.org`.** Owner input. It is
  registered but **not yet pointed at Cloudflare**, and whether `info@` is receiving mail has
  **not been confirmed**.

  **The spelling was confirmed explicitly rather than inferred.** The owner first wrote it as
  `veganagainstfasism.org` - singular, and missing the second `c`. That is one character away
  from a dead `mailto:` on every route, and the address is the site's only contact channel, so
  it was put back to the owner rather than silently normalized. The confirmed value is
  **`vegansagainstfascism.org`**, plural, `fascism` spelled in full. A future session must not
  "correct" it in either direction.

  This closes the domain row in the owner-inputs table. **`GROUP_DOMAIN` was filled by Task
  005b (`716ddd3`)** - both `site.config.ts` fields as literals, and the three `info@` literals
  in `about.mdx`, `help.mdx` and `join.mdx`. `contactEmail` is written out in full rather than
  derived from `domain`, deliberately: a computed template string would construct the token at
  runtime and hide it from a source-text scan. **Verified: zero `GROUP_DOMAIN` occurrences in
  `src/` or `site.config.ts`; `vegansagainstfascism.org` renders on all six routes.**

- **[2026-07-31] The unfilled-token rule is about deployed output, not about source. A preview
  exception was considered and is not needed.** Owner decision, taken against three options.

  **The rule in this section reads "no deployed build may contain one."** That was being read
  as "`check:config` must exit 0 before anything ships", which is a stricter and different
  claim, and it is what appeared to block a preview deploy. The two came apart once the
  publishing surface was actually measured rather than estimated:

  | Token | Reached `dist/`? | Verified how |
  | --- | --- | --- |
  | `GROUP_DOMAIN` | **Did, on all six routes. FILLED by Task 005b, so no longer applicable** | `/usr/bin/grep -rc GROUP_DOMAIN dist/` |
  | `MASTODON_HANDLE`, `MASTODON_URL` | **No. Never.** `siteConfig.social` is consumed by **no template** - Task 004 removed the footer link and `MastodonFeed` reads only the JSON cache | `/usr/bin/grep -rn 'MASTODON_HANDLE\|MASTODON_URL' dist/` returns nothing |

  **This has now happened: filling the domain removed every token that was actually
  published.** The Mastodon pair stays red in `check:config` - correctly, because the handle is
  genuinely unknown - while publishing nothing. **No token reaches `dist/` today**, so a
  `pages.dev` build violates no rule in this document on token grounds.

  **The mechanism gap this exposes is real and must be closed, not remembered.**
  `scripts/check-config.mjs` scans `site.config.ts` and `src/` - it has never looked at build
  output, so nothing in the project actually enforces the sentence "no deployed build may
  contain one." **Task 008a adds an output scan** over `dist/` using the same documented token
  pattern, reading files through Node's `fs` rather than the shell, which sidesteps the
  git-ignored-`dist/` wrapper problem recorded below. That scan is what gates publishing.
  `check:config` keeps gating "source contains an unanswered owner input." **Two different
  questions, two different checks. Do not merge them, and do not weaken either.**

- **[2026-07-31] The preview is `noindex`, and the link is shared directly.** Owner decision.
  A `pages.dev` URL is public and indexable by default, and "only friends have the link" is not
  access control - the group's real name is in every `<title>`.

  **The enforcement problem is the same shape as the token one and is Task 008a's to solve:** a
  `public/_headers` file ships to production as readily as to a preview, so "production must not
  carry `noindex`" cannot be a remembered rule either. **Cloudflare's own default behaviour for
  preview aliases has not been verified from this workstation and must not be assumed** - 008a
  confirms it against the dashboard before relying on it.

- **Two mechanical items the deploy needs:**
  - **`NODE_VERSION` on Pages must be set to `22.23.2`** to match `.nvmrc` and the Node 22
    contract. Without it the `prebuild` Mastodon step fails in CI.
  - **`SITE_URL` must be a real environment variable**, set in the Pages environment. It cannot
    live in `.env`: `astro.config.mjs` is evaluated before Astro loads `.env` files, and the
    file says so in a comment at the point of use.

- **[2026-08-01] THE PREVIEW IS LIVE AND THE FRIENDS ROUND HAS STARTED.** Owner deployed
  Cloudflare Pages from the `task/005b-content-consolidation` branch and shared the link.
  Deployment alias: `https://2889d153.community-food-group.pages.dev/`.

  **Nothing was bypassed to get there, and that is the point worth recording.** The rule is
  "no deployed build may contain a token", and the deployed build contains **zero**. Task 005b
  filled `GROUP_DOMAIN`, which was the only token that ever reached `dist/`; the two remaining
  tokens are the Mastodon pair, consumed by no template. **Verified twice on 2026-08-01** -
  `check:config` reports exactly those two, and the live page renders
  `info@vegansagainstfascism.org` with no token text. The guard did its job and then got out of
  the way. **A future session must not read this entry as a precedent for shipping tokens.**

  **[2026-08-01] Owner decision: the domain-related gates are relaxed for the preview, and only
  for the preview.** The owner's judgement is that these guardrails would be required in a
  corporate setting and are disproportionate for a friends-only look at a `noindex` URL. That is
  the owner's risk call to make and it is taken knowingly.

  | Gate | Status |
  | --- | --- |
  | No token in a deployed build | **Stands, and is satisfied.** Nothing to relax |
  | `noindex` on the preview | **Mechanism dropped.** Owner set it manually on Pages. Re-mechanize only when a production target exists, where the preview/production distinction becomes real |
  | Mailbox confirmed before sharing | **RELAXED.** Downgraded from a sharing gate to a **production** gate - see the owner-inputs table |
  | `SITE_URL` / canonical URL | **Deferred.** Cosmetic on a friends preview; required for production |
  | `NODE_VERSION` on Pages | **Still required** - the build must run on Node 22, not only locally |
  | Re-verify the CGT listing | **STANDS. Not relaxed.** It is unrelated to the domain and it is a published claim about a third party, which constraint 1 governs regardless of who is looking |

  **The one live consequence, recorded because it is easy to miss.** Task 005b published
  `info@vegansagainstfascism.org` on all six routes as the site's only call to action, and the
  domain is not yet wired for mail. **A real-looking address that silently bounces is a worse
  failure than a visible token was** - a token reads as "not real yet", a plausible address reads
  as genuine and fails invisibly. This is constraint 1's own logic pointing the opposite way to
  the usual case. **The fix is not a rule change, it is one test email**, plus telling the
  friends round that site email may not be live yet.

### Copy register

- **[2026-07-31] The Task 005 traps table is RETIRED, in full, by owner decision.** The owner's
  judgement on the Task 005 copy: it meets every constraint to the letter but reads like a
  doctor's office rather than a group of friends who garden and hand out food. Offered the
  choice between retiring the garden phrasing rulings only and retiring the whole table, the
  owner chose the whole table, having been shown the itemized consequences.

  **What that reaches.** Every entry in that table is withdrawn as a *phrasing* rule: the
  "our community garden" ban, "the one place we can name", "bi-weekly", "members",
  "apply/screening/instantly", the CGT-affiliation wording ban, and the group-name-in-prose
  ruling. **Task 005's acceptance criterion 7 is retired with it** - `locations.astro`'s
  `Our Community Garden Plot` heading stands, and is not to be reverted. The substring grep was
  the wrong instrument anyway: `our community garden plot` parses as *our plot at a community
  garden*, which is true and is the permitted framing, and a substring match cannot tell that
  reading from the false one.

  **What it does not reach, and why this is not a hedge.** The question put to the owner was
  about the traps table, which is section-4 implementation guidance for one task. **Constraint
  3.1 is in section 3 and was not in scope.** It stands unchanged. The practical effect is
  narrower than the list looks, because for four of those entries there is no truthful warmer
  copy waiting to be written:

  - There is **no efficiency figure**. The "90% of all donations" number was invented by the
    scaffold; no real number exists to replace it with.
  - There is **no distribution time** known in advance. The schedule is settled close to the
    date - that is why it is unpublished, and it has not changed.
  - There is **no chat**. The owner decided on 2026-07-30 that no chat link goes on the site;
    that decision is untouched by this one.
  - **CGT is a real third party.** The group may describe its own plot however it likes; a
    sentence asserting that CGT partners with or endorses the group would be a claim about
    someone else, and constraint 3.1 covers it.

  So what this decision actually unlocks is **register**: rhythm, contractions, concrete nouns,
  speaking as people rather than as an organization, and headings that sound like a person
  wrote them. That was the real complaint and it is a fair one.

- **[2026-07-31] OPEN CONFLICT, for the owner to settle: the group name in prose.** Retiring
  the traps table retires the ban on writing `Vegans Against Fascism` into `src/`. But the owner
  separately decided, the same day, that **a name change is anticipated and rebrandability is a
  standing property of the codebase** - and the entire reason the name lives in one config field
  is so that change is a one-line edit.

  **These two owner decisions pull against each other and this document is not going to pick a
  winner silently.** Recorded state: the ban is retired, so Task 005c *may* write the name into
  prose where it genuinely improves a sentence, and each time it does the anticipated rebrand
  becomes that much more of a prose rewrite. **005c must report every occurrence it introduces**
  so the cost is visible rather than discovered later. The name currently appears **zero** times
  in `src/`, verified 2026-07-31.

### Content architecture

- **[2026-07-31] Editorial prose consolidates into MDX. ~~The home page stays a template.~~
  PARTLY SUPERSEDED - read the entry below this one before acting on this one.** The
  consolidation stands; the home-page carve-out does not. Owner decision. The current boundary
  was inherited from the scaffold, not chosen, and the owner finds it confusing and expects to
  edit copy far more often than that boundary assumes.

  **Verified current state**, by reading the repository rather than trusting a table:

  | Route | Where its words live |
  | --- | --- |
  | `/about`, `/join`, `/help` | MDX; the three `.astro` files are 27-28 line wrappers, **byte-identical apart from the entry id**, holding no copy |
  | `/` | `index.astro`, 107 lines - hero, "How It Works", CTA band |
  | `/locations` | **split** - page copy in `locations.astro`, garden facts in `locations.json` |
  | `/posts` | `posts.astro`, 24 lines - an `h1` and one sentence |

  Plus the `Footer.astro` blurb and the `Header.astro` nav labels.

  **The real distinction underneath is linear prose versus structured layout**, and the home
  page is genuinely the second kind. The current boundary does not follow it: `/posts` is one
  heading and one sentence sitting in a template for no reason. **Nothing here is an Astro
  limitation** - Astro supports the everything-in-markdown model directly.

  The ruling:
  - **`/posts` and the `/locations` page copy move into MDX.** Both routes keep their one
    dynamic element - the feed, and the garden cards from the collection.
  - **`pageTitle` is metadata-only**, verified in `BaseLayout.astro` - it feeds `<title>` and
    never renders a visible heading. So an MDX route's `h1` comes from the document's own `#`,
    and the split does not create a duplicate heading. Every route has exactly one `h1` today.

- **[2026-07-31, SUPERSEDING the ruling above the same day] The home page moves too. The target
  is ZERO user-visible copy in any `.astro` file.** Owner decision, taken after the first
  ruling was put to them.

  **The first ruling said the home page stays a template**, on the grounds that it is structured
  layout rather than linear prose and that moving it needs a component vocabulary for MDX. **The
  owner rejected that, and was right to.** What the earlier ruling would have left outside
  content files, counted rather than estimated:

  | File | User-visible strings |
  | --- | --- |
  | `index.astro` | **~17** - the `h1`, the hero lede, **four full paragraphs**, three section headings, six button labels |
  | `Header.astro` | **~12** - five nav labels, **duplicated across the desktop and mobile lists**, so one label change means two edits |
  | `Footer.astro` | **~12** - the blurb, four quick-link labels, two column headings, `Volunteer`, the copyright line |

  **About forty strings, including the entire home page**, which is the most-visited route and is
  roughly 60% prose by volume. Calling it "structured layout" was an architectural
  rationalization, not a description.

  **The expectation this failed was set by Task 004b and was reasonable.** 004b centralized
  *identity* - name, tagline, city, contact - and never touched *copy*. But the four-surfaces
  table has promised "rewrite the prose wholesale" against `src/content/pages/*.mdx` since it
  was written, and that has never been true while the home page's prose sat in a template.
  **The document overstated what the architecture delivered.** Constraint 3.4 again, and again
  against this project's notes about itself.

  The revised ruling:
  - **No `.astro` file contains a user-visible string.** Prose lives in MDX bodies; short labels
    live in `site.config.ts`; structured facts live in `src/data/`.
  - **Prose stays markdown, never YAML.** A multi-paragraph block in a frontmatter scalar is
    indentation-sensitive and breaks the build when an editor gets it wrong. Short labels -
    button text, nav labels - are not prose and may be frontmatter or config.
  - **A small, fixed set of MDX components is authorized** for the home page's bands. This is
    the "component vocabulary" the first ruling deferred; it is now in scope, deliberately
    capped, and it is not a design system.
  - **Nav labels get one home and both lists read it.** The header and footer currently disagree
    - `About` vs `About Us`, `Join` vs `Join Us` - which is what happens when a label lives in
    three places.

  **The test that matters is not a grep, it is an edit.** Changing any sentence on the site must
  mean opening a file under `src/content/` or `site.config.ts`, and never a `.astro` file.

- **[2026-07-31] DELIVERED by Task 005b, committed as `716ddd3` (on a published branch, not yet
  merged to `main`). The edit test was executed on all six routes and passed.** For each of `/`, `/about`, `/help`, `/join`, `/locations`, `/posts`,
  one visible sentence was changed by editing **only** a file under `src/content/`, rebuilt,
  confirmed changed in `dist/`, and reverted. This is a verified property of the repository
  now, not an aspiration - **and a future task that puts a string back into a `.astro` file
  breaks it.** What shipped:

  | Route | Its words now live in |
  | --- | --- |
  | `/` | `src/content/pages/home.mdx` |
  | `/about`, `/join`, `/help` | `about.mdx`, `join.mdx`, `help.mdx` (unchanged by 005b apart from the domain fill and the garden section) |
  | `/locations` | `locations.mdx` + `src/data/locations.json` for the card facts |
  | `/posts` | `posts.mdx` |
  | Footer blurb | `footer.mdx` - a **fragment, not a route**; nothing looks it up by id and nothing enumerates the collection |
  | Nav labels, header and footer labels | `site.config.ts` |

  - **The home page kept its bands.** Gradient hero, updates, "How It Works" and the accent CTA
    band all survive, expressed by **exactly three** components under `src/components/home/` -
    `Hero`, `Band`, `Actions`. That is the authorized vocabulary and it is capped: **a fourth
    component needs a new decision.** Confirmed in a browser at 375px and 1440px with the four
    backgrounds and the section rhythm intact.
  - **Components are passed in from the route, not imported in the document.**
    `index.astro` renders `<Content components={{ Hero, Band, Actions, MastodonFeed }} />`, so
    `home.mdx` carries no import lines and the owner opens it to find only copy. **This
    mechanism was verified by building, not assumed** - both mechanisms exist in Astro and the
    task required checking which actually works.
  - **Because markdown emits bare elements, the bands style their own children** with Tailwind
    child variants (`[&>h2]:text-heading` and similar) rather than asking the content file to
    carry classes. See the attribute-escaping fact below before writing tooling that reads
    `dist/`.
  - **`/locations` and `/posts` kept their existing centred treatment** rather than taking the
    `prose-card` the three long-form routes use. Deliberate: 005b was a move, and both pages
    are a short standfirst introducing a data-driven block, not editorial documents. **Changing
    this is a design decision for a later task, not a cleanup.**
  - **One nav list, three consumers.** `site.config.ts` holds `nav`; the header's desktop and
    mobile lists and the footer's quick links all read it, which retired the `About`/`About Us`
    and `Join`/`Join Us` disagreement. The footer filters out the home entry, as it always did.
    Each item carries a **required** `cta: boolean` rather than an optional one, so `as const`
    narrowing keeps the property present on every union member and `astro check` stays clean.
  - **The mobile menu's keyboard contract survived the `Header.astro` rewrite**, verified in a
    browser: Escape from a link inside, Escape from the toggle, focus return, tab-out close,
    and an explicit assertion that focus is never trapped.

- **[2026-07-31] The garden gets exactly one home: `src/data/locations.json`.** It is currently
  described in three places - `locations.json`, `locations.astro` and `about.mdx` - and **that
  duplication produced a factual drift within an hour of being created**: `about.mdx` links to
  the operator's site root while `locations.json` links to
  `https://www.communitygardensoftucson.org/garden-locations`, which is the listing this
  document records as actually verified on 2026-07-31.

  `locations.json` owns the garden's facts. **`about.mdx` links to `/locations` rather than
  restating them.** The verified listing URL is the one that survives. This is the same
  one-owner-per-fact rule section 1 applies to the project's documents, applied to its content.

  **[2026-07-31] DONE by Task 005b.** `about.mdx`'s `## The Garden Plot` section no longer
  states where the garden is, who operates it, or links to CGT; it reads "We rent a plot at a
  community garden - see [where we are](/locations) for the address and who runs it." The
  sentences that belong to the *about* page - that the produce is cooked into the food handed
  out or given to people in the group and to neighbors - were kept, as was the cadence
  sentence, which the ruling did not name for removal. **Verified: `/usr/bin/grep -rni
  'presidio' src/` returns hits in `src/data/locations.json` only, and the bare
  `communitygardensoftucson.org/` site-root form appears nowhere - the `/garden-locations`
  listing URL is the single outbound link.** The drift is closed.

  **The standing dependency is unchanged:** these are facts about a third party and about a
  rental that can lapse. Re-verify the CGT listing against the operator's own site rather than
  assuming this entry still holds.

  **[2026-08-01] This was supposed to happen before the preview went up, and it did not.** The
  preview is live and shared, so the Presidio address, the operator's name and the outbound link
  are published to whoever holds the link, **last verified 2026-07-31 and not since.** It is
  **overdue rather than pending**, and it is **explicitly not covered by the owner's relaxation
  of the domain-related gates** - it has nothing to do with the domain, and constraint 1 governs
  a published claim about a third party regardless of how small the audience is.

### The feedback round

**[2026-07-31] Friends are asked for opinions on the preview. This is deliberately not a UAT.**
Owner decision. The point is that comments land somewhere that can act on them, rather than
becoming a pile of contradictory prose with no owner. The minimum that achieves that, and no
more process than that:

- **Who is asked:** people the owner picks and contacts directly. The preview is `noindex` and
  the link is not posted anywhere public.
- **What they are asked to look at:** whether the site sounds like the group, and whether
  anything reads as confusing, off-putting, or wrong. **Not** a page-by-page review, and not a
  bug hunt - the accessibility and verification work has its own checks.
- **How comments come back:** to the owner, in whatever form the person finds easy. No form, no
  tracker, no account. Consistent with the rest of the site's contact model.
- **Who turns comments into tasks: the owner, via an `ARCHITECT` session.** Feedback is input to
  a promotion decision, never authorization to change code. A comment does not become work until
  it is written into `ROADMAP.md` or a promoted `TASK_SPEC.md`.

**What is explicitly not open for comment.** These are owner decisions already taken, not
opinions to be relitigated, and a future session must not reopen one because a friend disliked
it:

- **The constraint-1 facts** - the monthly cadence with no published time, that the food is
  vegan, that cooking classes are forming rather than running, and the absence of any
  efficiency figure, drop-off address, donation platform or chat link. There is no truthful
  alternative copy for these; a comment asking for one is asking for an invented fact.
- **The garden framing** - that the group rents a plot at a site operated by Community Gardens
  of Tucson, address published, no map link.
- **The naming ruling**, as it now stands after the register decision above.

Everything else - tone, structure, wording, what the site leads with - is fair game, and that is
most of what the round is for.

### Styling and design system

- **Tailwind is configured in CSS.** The theme lives in an `@theme` block in
  `src/styles/global.css`. Do not recreate `tailwind.config.mjs`; Tailwind 4 does not read
  one by default.
- **Cascade layers before specificity.** `@tailwindcss/typography` emits `prose` inside
  `@layer utilities`, which begins after `@layer components` ends, so a `.prose` override
  written inside `@layer components` loses on **layer order regardless of specificity** - it
  compiles without error, ships, and does nothing. The project's `.prose` theme and its
  custom `.container` are therefore **unlayered**. Preserve that; moving either into a layer
  silently reintroduces a shipped bug. This has been the shape of two separate defects here:
  treat "my Tailwind override is being ignored" as a layer question first.
- **[2026-07-31] Palette Direction B ("Garden") is implemented.** Green leads, clay supports.
  The terracotta/sage/cream/earthy tokens are **deleted** (not renamed) from `src/` entirely.
  All sixteen role pairs pass AA; the audited figures are in `docs/DECISIONS_ARCHIVE.md` and
  are reproduced live by `npm run check:contrast`.
- **Colour is a two-layer token system in `src/styles/global.css`**, and that file is the only
  authority on the token names - **they are deliberately not enumerated here**, because a
  duplicate list in a document drifts from the source. `README.md` documents them for adopters.
  The contract, which is what binds a task:
  - **Layer 1** is a `:root` block of fourteen **brand inputs**, named *outside* the
    `--color-*` namespace on purpose (`--brand-*`, `--neutral-*`) so Tailwind never generates
    utility classes from them. A reusing group edits only this block.
  - **Layer 2** is sixteen **semantic roles** in the `@theme` block (`--color-*`), each a
    `var()` reference into Layer 1. **Templates consume only Layer 2.** A literal hex or a
    colour name like `terracotta` in a component is the bug this system exists to prevent.
  - **Fill roles and text roles stay separate** - `--color-brand` (fills) vs
    `--color-brand-ink` (text on light), and likewise for `accent`. Collapsing either pair is
    exactly how the previous palette failed nine measured pairs.
- **A contrast validation script exists**: `scripts/check-contrast.mjs`, wired as
  `npm run check:contrast`, plain Node with **zero dependencies**. It parses the token values
  directly out of `src/styles/global.css` (no duplicate list to drift), resolves `var()` chains
  from role to brand input to hex, and checks sixteen named role pairs actually used by the
  templates against WCAG 2.2 AA (4.5:1 text, 3.0:1 for the two focus-ring pairs). It has been
  **proven to fail**, not merely to pass. **Task 004 wired it into the uncached half of
  `npm run verify`**; it is no longer a manual step. It is the shape to copy for
  `check-config.mjs` in Task 004b.
- **The type scale is semantic and fluid.** Steps are named for **role, not size**
  (`--text-display`, `--text-title`, ... `--text-label`) and each is a `clamp()`, so one class
  replaces a breakpoint chain: `text-title` supersedes `text-4xl md:text-5xl lg:text-6xl`.
  **A template that needs `md:text-*` on a heading is evidence the scale is wrong, not that
  the page is special.** Line height and letter spacing travel with each step; **font weight
  deliberately does not**. The steps, the 39rem measure (~69 characters, measured in a browser
  rather than estimated) and the three mutually exclusive section-rhythm classes
  (`.section-lg` / `.section` / `.section-tight`) are defined in `src/styles/global.css` and
  documented for adopters in `README.md`. Same rule as the colour tokens: **the source is the
  authority, not a list here.**
- **[2026-07-31] Fonts are self-hosted via Astro's built-in Fonts API**, configured in
  `astro.config.mjs`, with **no font dependency in `package.json`**. The font file is fetched
  at **build time** and served from the site's own origin, so the browser never contacts Google
  and no visitor IP reaches a third party. Inter is the single family; pairing a display face is
  a separate, still-open decision. Implementation and verification detail is in
  `docs/DECISIONS_ARCHIVE.md`.
  **Consequence that stays live:** `astro.config.mjs` is part of the **design-system** surface,
  not just deployment config, because self-hosting fonts is configured there. A future palette
  or type task may legitimately need it in scope. Task 003's allowed-scope list omitted it, hit
  the gap mid-task, and resolved it by an explicit owner-approved scope expansion rather than a
  silent edit - which is the behaviour the protocol wants when scope and repository disagree.

### Verified repository state on 2026-07-31

**Tasks 001, 001b, 001c, 002, 003, 004, 004b, 004c and 005 are complete and merged to `main`.**
Task 002 as `8ad91ad`, Task 003 as `faf489e`, Task 004c as `bcef6db`, Task 004 as `15dd164`,
Task 004b as `0fd7d5e`, **Task 005 as `375d860`**.

**[2026-07-31] Task 005b is COMPLETE, committed as `716ddd3` on the branch
`task/005b-content-consolidation`, which is published to `origin`. It is NOT yet merged to
`main`.** Eighteen files, all inside the allowed scope: eleven modified, seven new. The working
tree is clean at `716ddd3`. `16ddb2c` ("Project Management for Task 005b") sits between it and
`83838b8` and changed only the four project documents. **Check `git log` rather than trusting
this paragraph.**

**[2026-07-31] Task 005's commit split is closed.** The working tree is clean at `83838b8`.
The previous draft of this entry described Task 005 as split across a commit boundary with the
bulk uncommitted; that was true when written and is now stale. What actually happened: two file
operations (the `donate.mdx` deletion and the `donate.astro` -> `help.astro` rename) went into
the docs commit `54f5442` because they were staged when it was amended, and the remainder
landed as `375d860`. **Both halves are on `main`. `HEAD` builds.** Do not carry forward any
instruction about "committing the remainder" or about `HEAD` not being a working tree.

**Two owner commits follow Task 005** and are part of current state: `0f7aff2` ("Updated some
language") and `83838b8` ("Copy clarification"). These are the owner's own edits to
`about.mdx`, `join.mdx`, `help.mdx`, `index.astro`, `Header.astro`, `locations.astro` and
`locations.json`. **They are owner copy decisions, not defects, and must not be reverted.** Two
of their consequences are tracked as work - the retired phrasing ban and the CGT link drift,
both below.

**Do not infer commit state from a status word in this file - check `git log` / `git status`.**
These documents have gone stale on exactly this point five times now: Task 003, Task 004c, Task
004b's `ACTIVE` status line, the Task 005 entry that stood here, and the `ROADMAP.md` Task 005
status line. The warning is not historical. Check the log.

**The green baseline, on Node v22.23.2.** These are the numbers a task compares against; a
change to any of them is a finding, not noise. **As of Task 004b, `npm run verify` no longer
exits 0 - that is the correct, honest state**, not a regression to chase:

| Check | Expected result |
| --- | --- |
| `npm ci` / `npm audit` | exits 0 / **0 vulnerabilities** |
| `npm run check` | **0 errors, 0 warnings, 21 hints.** Was 12 before Task 005. The rise is the **same** zod deprecation counted in one more place - the new `locations` schema in `src/content.config.ts`. **21 is the baseline; it is not a regression.** Task 005b added seven files and moved the count not at all, but the file count `astro check` reports rose from 19 to **22**. |
| `npm run build` | the same **six** routes, `/`, `/about`, `/help`, `/join`, `/locations`, `/posts`. **`/donate` no longer exists** |
| `npm run check:contrast` | all **sixteen** role pairs pass |
| `npm run check:config` | **exits non-zero, naming exactly 2 tokens** - `MASTODON_HANDLE` and `MASTODON_URL`, both on one line of `site.config.ts`. **Was 7 before Task 005b**, which filled `GROUP_DOMAIN` in both config fields and all three MDX documents. `GROUP_NAME` and `GROUP_TAGLINE` were filled by Task 005. Do not weaken this check, do not fill a token with a guess, and **do not write `null`**, to turn it green. |
| `npm run verify` | **exits non-zero**, at the `check:config` step only |

**Task 005 deliberately ended Task 004b's "`site.config.ts` is the only file carrying a
token" invariant, and Task 005b happens to have restored it by filling the domain.** Do not
read that as the invariant coming back: tokens in *content* are permitted by constraint 1, and
what section 2 forbids is config *interpolation* into MDX, which is a different thing. If a
future owner input turns up in prose, a token there is correct and `check:config` naming it is
the expected result.

**The contact address stays a literal in the three MDX documents**, written out as
`info@vegansagainstfascism.org` rather than `{siteConfig.contactEmail}`. Task 005b was
explicit about this and a reviewer flagged it as the natural mistake: interpolating config
into prose is forbidden by section 2, and that did not change when the value became known.

**One consequence of the fill worth knowing, because it changed rendered output without
changing a word.** `info@GROUP_DOMAIN` was not a valid email address, so markdown left it as
plain text on `/about`, `/help` and `/join`. `info@vegansagainstfascism.org` **is** valid, so
**GFM autolinking now turns it into a `mailto:` link on those three routes.** The copy is
byte-identical; the address is simply clickable now, matching `/` and `/locations`. This is
markdown behaviour, not something Task 005b authored, and suppressing it would need escaping.
Spacing was checked - no glued link text.

`npm run verify` runs `check`, `check:contrast`, `check:config` and `build`, in that order, in
its **uncached** half, so a source edit always re-runs them; only `npm ci` / `npm audit` are
cached, keyed on the lockfile and Node version. Task 004 wired `check:contrast` in; Task 004b
wired `check:config` in, before `build`. Because the script uses `set -e`, a failing
`check:config` currently stops `verify` before `build` runs - run `npm run build` directly to
confirm it still emits six routes while tokens remain unfilled.

**The per-task execution records for Tasks 002, 003, 004 and 004b are in
`docs/DECISIONS_ARCHIVE.md` under `## Verification history`.** They are evidence that finished
work was verified, not input to the next task. Read them only to settle a question about how
something was confirmed. **Task 005's record is not yet there** - the next `ARCHITECT` cuts it
in at archive time.

### Three verification facts found in Task 005b that outlive it

All three were found by executing rather than by reading, and the first one directly changes
how **Task 008a** must be built.

- **[2026-07-31] Astro emits `>` UNESCAPED inside a computed attribute value, so naive
  tag-stripping over `dist/` mis-parses those elements.** A static literal `class="..."` is
  escaped to `&gt;`, but a value produced by `class:list={...}` *or* by `class={expr}` is not -
  only `&` is escaped. The home page's band components use Tailwind child variants
  (`[&>p]:text-ink` and similar), so **three `class` attributes in `dist/index.html` contain a
  raw `>`**. This is legal HTML - an attribute value terminates on the quote, not on `>` - and
  it renders correctly, confirmed in a browser.

  **The trap:** a regex like `<[^>]+>` terminates the tag early at the `>` inside the attribute
  and emits the rest of the class list **as page text**. Task 005b's own copy-comparison
  extractor hit this and briefly appeared to show class names rendering on the page; the
  browser's `innerText` disproved it. **Task 008a's `dist/` output scan must use a real HTML
  parser or a quote-aware regex, not `<[^>]+>`.** Switching the components to `class={...}` was
  tried and does **not** help; the idiomatic `class:list` was kept.

- **[2026-07-31] Components can be passed into an MDX document from the route**, via
  `<Content components={{ Hero, Band, Actions, MastodonFeed }} />`. Verified by building, not
  assumed. This is the mechanism that keeps import lines out of the file the owner edits, and
  it is what makes `home.mdx` readable as pure copy. Prefer it over importing components inside
  the MDX document.

- **[2026-07-31] Playwright `fullPage` screenshots of this site produce a stitching artifact** -
  footer text ghosts faintly into the hero band on the home page. It is not a render defect:
  `document.elementsFromPoint()` and a viewport-only screenshot both show clean markup. Do not
  file it as a bug, and do not "fix" a layout that is already correct. Related: any new harness
  script added to `~/.local/share/playwright-runner/` must be **ESM** (`import`, not `require`)
  to match `verify.mjs`.

### Two verification facts found in Task 005 that outlive it

Both are recorded here rather than in a task file because they change how **any** future task
verifies, and both were found by executing rather than by reading.

- **[2026-07-31] Grep-based acceptance criteria must be run with `/usr/bin/grep`.** In the
  agent shell, `grep` is a **wrapper function, not GNU grep**, and it honours `.gitignore` -
  including when an ignored directory is named as an explicit argument. `dist/` and `.astro/`
  are git-ignored, so **every criterion that greps `dist/` passes vacuously under the wrapper**,
  reporting "no output" whether or not the string is there. This defeats constraint 3.10 while
  looking exactly like a pass. Task 005 caught it only because a criterion returned no `dist/`
  hits for a string that provably renders there. Mechanism in `docs/ENVIRONMENT.md` section 4.
  **A criterion that greps `dist/` should also say `--exclude-dir=dist --exclude-dir=.astro`
  when it greps the repository root**, or it will report generated artifacts as violations.

- **[2026-07-31] Astro's HTML compressor strips whitespace-only text nodes around inline
  elements.** An inline `<a>` written across several source lines inside a paragraph ships with
  the surrounding words **glued to the link text** - `write to<a>…</a>and a person` renders as
  one run-on string. It is invisible in the source, invisible in a diff, and visible only in
  `dist/` or a browser. Task 005 shipped it into two pages and caught it during the required
  browser pass. **Fix: explicit `{' '}` on both sides of the link.** Any template with an
  inline link in wrapped prose is exposed; this is a good candidate for an automated check when
  Task 009 builds one.

### Open defects

- **`MastodonFeed` prints raw markup. Confirmed empirically on 2026-07-30**, not merely
  predicted: seeding the cache with one post containing `<p>` tags and building produced
  `...not erased&lt;/p&gt;` in `dist/index.html`. Visitors would see literal `</p>` on the
  page. Safe handling requires sanitization or an explicit HTML-to-text conversion at build
  time; it does not mean leaving the escape in place. Tracked as Task 006.
- **zod deprecation.** Astro 7 moved to zod v4 and deprecated the `z` re-export from
  `astro:content`, producing **21** non-blocking hints in `src/content.config.ts` since Task
  005 added the `locations` schema (was 12). Resolving it means taking `zod` as a direct
  dependency, which needs an owner decision under constraint 3.6. `zod@4.4.3` is currently
  present only as a transitive dependency of astro, so importing it directly today would rely
  on hoisting and is not safe. Tracked as Task 009.
- `public/` contains no files. `BaseLayout.astro` references `/favicon.svg` and
  `/images/og-default.jpg`, so both 404 on every route. Tracked as Task 007, and **now on the
  critical path** because it makes every shared preview link render a broken card - see the
  pulled-forward `007a` recommendation.
- **[2026-07-31] The garbled `/locations` meta description is still open, and it has MOVED.**
  It reads `Community garden information. Explanation of cooking and distribution move around
  town.` and ships as `<meta name="description">`, `og:description` and `twitter:description` on
  `/locations` - so it is what a pasted link renders as. Introduced by owner commit `83838b8`.
  **Task 005b moved it verbatim, as instructed**, so it now lives in
  **`src/content/pages/locations.mdx:3`** (frontmatter), *not* `locations.astro:12`. **Still
  tracked as Task 005c**, and it will be visible in the 008a preview, which the owner accepted
  knowingly.
- **[2026-07-31] Two `.astro` files still carry user-visible strings, and this is the one place
  the "zero copy in `.astro`" property is incomplete.** Both were **outside Task 005b's allowed
  file list**, so the implementer left them and reported rather than expanding scope:
  - **`src/components/MastodonFeed.astro`** - `No updates available at the moment. Please check
    back later!` (which **renders today** on `/` and `/posts`, because the cache is empty),
    `View on Mastodon ->`, the `aria-label`s `Replies` / `Re-posts` / `Favorites` / `View
    original post on Mastodon`, the `alt` fallback `Post attachment`, and three emoji.
  - **`src/layouts/BaseLayout.astro`** - `Skip to main content`.

  Both are one-line lifts into `site.config.ts` whenever a task puts them in scope. **Sequencing
  note: `MastodonFeed.astro` is also Task 006's file** (the raw-markup defect), so doing the
  string lift there separately would touch it twice - a candidate to fold into 006, or into a
  small follow-up alongside `BaseLayout`. This is a real gap in the adoption promise, not a
  cosmetic one: an adopting group editing the empty-feed message must open a template.
- **[2026-07-31] Resolved by Task 004, removed from this list:** the `role="menubar"` /
  `role="menuitem"` / `role="none"` application-menu pattern in `Header.astro`, the
  `aria-label="Main navigation"` mismatch on `<header>`, both `Footer.astro` dead `href="#"`
  links, and the three redundant `aria-label`s that failed WCAG 2.5.3. See the dated decision
  above for the verification record.
- **[2026-07-31] Resolved by Task 005, removed from this list:** the invented public copy. The
  MDX documents and `src/data/locations.json` no longer contain invented locations, history,
  schedules or impact claims. Springfield addresses, `(555)` numbers, `communityfood.org`
  addresses, the 2024 founding date, the "90% of all donations" claim, the membership tiers and
  the storefront framing are all gone, confirmed by executed grep over `src/` **and** `dist/`.
  The `Footer.astro` prose blurb and `about.mdx`'s heading - the two occurrences Task 004b left
  behind on purpose - are resolved. **This defect is the reason the repository could not be
  deployed on grounds of truthfulness; that reason is now discharged.**
- **[2026-07-31] Resolved by Task 004b, removed from this list:** the invented organization
  name and tagline shipping in metadata. `"Community Food Group"` no longer appears in
  `<title>`, the copyright line, `og:description`, `twitter:description`, the `author` schema
  default, the header wordmark/`aria-label`, or the `MastodonFeed` display-name fallback - all
  eight in-scope occurrences now read `site.config.ts`, which carries the `GROUP_NAME` and
  `GROUP_TAGLINE` tokens because those facts are still genuinely unknown. Two occurrences
  remain by design, not oversight: `about.mdx:9` and the `Footer.astro:8` blurb are MDX prose,
  which section 2 forbids interpolating config into, and both are Task 005's. See the dated
  decision below and `docs/DECISIONS_ARCHIVE.md`'s verification history for the record.
- **[2026-07-31] Resolved by Task 005b, removed from this list:** the two `Footer.astro`
  defects. **`All rights reserved` is gone** - the copyright line now reads
  `(c) {year} {groupName}. No rights reserved.`, which no longer contradicts the CC0
  dedication. **The `Volunteer` quick link is gone** - it now reads **`Get involved`**, which is
  not new copy but the site's existing label for `/join` (the home CTA button and `about.mdx`'s
  own link text). Both were the named wording exceptions in 005b's spec. **These two were listed
  here as Task 005c's and out of 005b's scope; `TASK_SPEC.md` overrode that and assigned them to
  005b, which is the correct resolution - this list was the stale half.**
- There is no CI workflow, automated test suite, formatter, or lint command.
- Cloudflare Pages configuration and a production URL have not been verified.

### Current phase

**Tasks 001 through 005 are all merged to `main`**, including 001b, 001c, 004b and 004c;
**Task 005b is committed on a published branch and is not yet merged.** Their narratives and
verification records are in `docs/DECISIONS_ARCHIVE.md` and are not repeated here. The palette
passes AA on every checked pair, the routes share one type scale and one colour token system,
the accessibility work is in place, `site.config.ts` plus `scripts/check-config.mjs` guard the
identity surface, **the site describes the real group**, and **every route's copy is editable
from a content file without opening a template**.

**[2026-07-31] Task 005 is COMPLETE and archived**, merged as `375d860`, followed by two owner
copy commits `0f7aff2` and `83838b8`. Its verification record is in `docs/DECISIONS_ARCHIVE.md`
under `## Verification history`. The working tree is clean.

**[2026-07-31] Task 005b is COMPLETE and committed as `716ddd3`, on a published branch, not yet
merged to `main`. Its verification record has NOT yet been cut into
`docs/DECISIONS_ARCHIVE.md`** - that is the next `ARCHITECT`'s job at archive time, along with
Task 005's roadmap status line. This `MEMORY SYNC` wrote `PROJECT_CONTEXT.md` only; it did not
touch `ROADMAP.md` (an `ARCHITECT` document, written at promotion time) or
`DECISIONS_ARCHIVE.md`.

**[2026-08-01] THE DEPLOYMENT BLOCK IS FULLY DISCHARGED AND THE PREVIEW IS LIVE.** Until Task
005 the repository could not be deployed because its copy was *untrue*; that reason went first.
The narrower token reason went with Task 005b, which filled the domain, so **no token reaches
`dist/` at all.** The preview is deployed and shared - see the dated deployment entry in this
section for the URL, what was verified, and which gates the owner relaxed.

**What genuinely remains is smaller than the earlier draft of this paragraph claimed**, and it
splits by whether it is preview work or production work:

- **Still wanted, and now the main practical annoyance:** an **output scan over `dist/`**.
  `check:config` exits non-zero on the two Mastodon tokens, and because `verify` uses `set -e`,
  it never reaches `build`. The fix is the split already recorded above - source scan reports
  unanswered owner inputs and does not block; a `dist/` scan blocks publishing. **That is the
  check the project never had, not a weakening of the one it has.** The attribute-escaping fact
  above constrains how it may be written.
- **Still required:** `NODE_VERSION` on Pages, and re-verifying the CGT listing.
- **Deferred to production:** `SITE_URL` and the canonical URL, a re-mechanized `noindex`, and
  confirming the mailbox. The owner set `noindex` manually and accepted the mailbox risk for a
  friends-only preview.

**The current order was 005b, then 008a, then a feedback round, then 005c.** 005b is complete
and **the preview and feedback round are underway**, so what is left of 008a is production work
rather than a gate on anything. **Task 006 is blocked and out of the order. Task 007 is unblocked
in part** - see the brand-asset note below. **The owner has flagged that the task order and its
blocking relationships will be revisited** after the feedback round; treat `ROADMAP.md`'s
sequence as provisional until that happens.

**[2026-07-31] `public/` is still empty and this now has a consequence it did not have before.**
`BaseLayout.astro` references `/favicon.svg` and `/images/og-default.jpg`; both 404 on every
route. **Sharing a preview link with friends means every preview card and every browser tab is
broken.** The logo/favicon/social-image row is still a deferred owner input, so this cannot be
resolved by an implementer choosing assets. **Recommendation, not yet an owner decision: pull a
minimal favicon-and-OG slice of Task 007 forward as `007a`, ahead of the preview.** Flagged as
open below.

Four repository facts were found at the Task 005 promotion by grepping rather than trusting the
roadmap entry. **All four were acted on and are recorded here because the pattern outlives the
task:**

- **`src/pages/index.astro` was missing from the roadmap's Task 005 scope and could not stay
  out** - it imported `locations.json` directly, so the data migration broke it. **This was the
  third roadmap entry whose own file inventory was wrong** (Task 004b's was wrong twice).
  Constraint 3.4 governs this project's notes about itself, not only the repository. **An
  `ARCHITECT` must grep the repository before writing any file list into a spec.** Task 005b's
  file list was confirmed this way at promotion on 2026-07-31.
- **A single location record broke the homepage layout.** Resolved by replacing the section
  with copy plus a link to `/locations`, not by shrinking the grid. Verified in a browser at
  both widths: the locations grid resolves to one column with one child, and no route
  overflows horizontally.
- **`README.md` contradicted itself** - resolved; the callout no longer calls the location
  records invented scaffold, and the warning it carries is now the token/deployment one.
- **The roadmap's "add a Zod schema" plan conflicted with the open zod decision.** Resolved by
  using the content layer's `file()` loader with the `z` already re-exported from
  `astro:content` - no new dependency. Taking `zod` directly remains Task 009's.

**One implementation fact worth carrying forward:** the `file()` loader passes the raw item
**including its `id`** to the schema (`parseData({ id, data: rawItem })`), so `id` must be
declared in the Zod object or it is stripped from `entry.data`. Verified by reading
`node_modules/astro/dist/content/loaders/file.js`, not assumed.

**Resolved and removed from this list:** the `ROADMAP.md` staleness flagged here for Task 004c
and for the Tasks 004 / 004b status lines. The general rule stands and is worth keeping:
**do not infer commit state from a status word in any of these documents - check `git log`.**
`ROADMAP.md` holds the ordered sequence through launch.

### Open owner inputs

**This table is the only copy of this list.** `ROADMAP.md` used to carry a second one; it
drifted and has been removed in favour of a pointer here. Do not reintroduce a duplicate in
any other file.

These are product-content decisions and must not be invented by an implementation model.
Work that depends on them is blocked, not deferrable by guessing.

**Token spelling is normalized to `SCREAMING_SNAKE_CASE`**, decided at the Task 004b promotion
on 2026-07-31. The project previously used two incompatible spellings - `GROUP NAME` with a
space and `GROUP_DOMAIN` with an underscore - and no single regex matches both, which defeated
the section-4 requirement that every token be greppable by **one** documented pattern. That
pattern is:

```
/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g
```

`GROUP NAME` is retired in favour of **`GROUP_NAME`**. `npm run check:config` (Task 004b)
enforces this and fails the build while any token remains unfilled.

| Input | Status | Blocks |
| --- | --- | --- |
| Final public organization name | **ANSWERED 2026-07-31: `Vegans Against Fascism`.** **Filled** in `site.config.ts` by Task 005; `GROUP_NAME` no longer appears. **A name change is anticipated - see the dated decision above - so the name lives in config and must never be written into prose.** Verified zero occurrences in `src/`. | *(closed)* |
| Tagline | **ANSWERED 2026-07-31: `a counter-cultural, total liberation collective`.** **Filled** by Task 005; `GROUP_TAGLINE` no longer appears. Carries the same name-change caveat as the name. | *(closed)* |
| Town / geographic scope | **ANSWERED 2026-07-31: Tucson, Arizona.** `CITY` token retired | *(unblocked)* |
| Domain name | **ANSWERED 2026-07-31: `vegansagainstfascism.org`.** Registered; **not yet pointed at Cloudflare**, and `info@` is **not confirmed receiving mail**. Spelling was confirmed explicitly, not inferred - see the dated decision above. **FILLED by Task 005b (`716ddd3`)**, which removed five of the seven tokens and the only one that reached `dist/`. | *(closed)* |
| Whether cook-session and distribution places are named publicly at all | **ANSWERED 2026-07-31: none are named.** The garden plot is the only record in `src/data/locations.json`. Distribution is described as a monthly rhythm around town, with no site and no time published. | *(unblocked)* |
| **Whether the food is vegan, and whether the site says so** | **ANSWERED 2026-07-31: yes, and the site says so plainly.** Raised at the Task 005 promotion - the group's name made it an obvious reader question that no document had settled, and it is material to anyone deciding whether to take food or to offer ingredients. | About and ways-to-help content |
| Mastodon account handle, or confirmation there is none | **STILL OPEN. Put to the owner 2026-07-31; the answer was "undecided", which is neither a handle nor a decision that there is none.** The tokens stay, correctly - a token means *unknown*, `null` would mean *decided against*. **Task 006 stays blocked and is out of the current order.** It no longer blocks deployment: both tokens are consumed by no template and never reach `dist/`, verified. | **Task 006** only |
| Approved food-safety language, if any is wanted | **Open, and deliberately deferred at the Task 005 promotion rather than answered.** Task 005 wrote none, as instructed. Do not invent a practices statement to fill the gap. | About or ways-to-help content |
| Logo, favicon, social image | **Deferred, but now on the critical path.** `public/` is empty, so both referenced assets 404 on every route and **every preview card shared with a friend is broken**. An implementer cannot choose these. **Recommended: a minimal `007a` (favicon + OG image) ahead of the preview** - needs an owner answer or an owner-approved placeholder. | `public/` assets, brand pass, **and the quality of the 008a preview** |
| Confirmed Cloudflare Pages project URL | **ANSWERED 2026-08-01.** A Pages project exists and is deployed from `task/005b-content-consolidation`; alias `https://2889d153.community-food-group.pages.dev/`. **The production domain is still not pointed at Cloudflare.** Note the project is named `community-food-group` - the retired invented scaffold name - which is baked into the `*.pages.dev` hostname and is worth renaming before the real domain goes live. | *(closed for preview; production URL still open)* |
| **Is `info@vegansagainstfascism.org` receiving mail?** | **OPEN. Downgraded 2026-08-01 from a sharing gate to a production gate, by owner decision.** Task 005b published the real address on all six routes as the site's only call to action, and the domain is not yet wired for mail - so it may bounce or blackhole while looking genuine. **Accepted risk for the friends preview**, where feedback returns through channels the owner already has. **Not acceptable once the real domain is live.** Cost to close: one test email. | Production launch, not the preview |

Answered on 2026-07-30 and recorded above. **Do not re-ask, and do not treat any of these as
still open:**

- Cadence: monthly; no precise time is published.
- **Contact route: email to `info@GROUP_DOMAIN`. The Signal invite link is withdrawn** - the
  owner decided no chat link goes on the site at all. This was previously the one blocker
  marked non-tokenizable; it is now resolved, and the token covers only the unpurchased
  domain.
- Which programs are real: cooking classes forming; other activities deferred.
- Palette Direction B; commit the contrast script; self-host the fonts.

Answered on 2026-07-31. **Do not re-ask these either:**

- **Organization name: `Vegans Against Fascism`. Tagline: `a counter-cultural, total
  liberation collective`.** Both tokens filled by Task 005. **Both carry the name-change
  caveat above.**
- **No cook or distribution site is named publicly.** The garden plot is the only location
  record. This closes the last open row that gated `locations.json`.
- **The food is vegan, and the site says so plainly.**
- **`/donate` is renamed to `/help`**, labelled "Ways to help", completing the 2026-07-30
  Ways-to-Help decision at the route and navigation level rather than only in the page body.
- **Food-safety language is deferred, not declined.** Task 005 wrote none. The row stays open.
- **Geographic scope: Tucson, Arizona.** Written out; the `CITY` token is retired.
- **The garden is settled in full** - Presidio Garden, 3440 E Presidio Rd, a rented plot in a
  Community Gardens of Tucson site, every other week through the growing season, address
  published without a map link, CGT named and linked. Details and the exact permitted framing
  are in the dated decision above.
- The Mastodon footer link is **removed** in Task 004 rather than left dead. This does not
  answer the handle question - it defers the link until Task 006 or 007, when the handle
  exists.

**[2026-07-31] The Mastodon handle question was put to the owner and came back "undecided."**
That is not an answer, and it is recorded as such: the tokens stay, `social.mastodon` does
**not** become `null`, and **Task 006 remains blocked and out of the task order.** Writing
`null` here would silently convert an open question into a settled decision.

**Task 006 no longer blocks anything but itself.** Both Mastodon tokens are consumed by no
template and never reach `dist/`, so they do not stand between the project and a preview
deploy - see the deployment decision above.

`npm run check:config` **continues to ship red**, and since Task 005b filled the domain it is
red on `MASTODON_HANDLE` and `MASTODON_URL` alone. **That is the guard working.** Do not fill
either with a guess, and do not write `null`, to turn it green.

**How an unanswered input is represented in `site.config.ts`** (shipped in Task 004b), because
the distinction is load-bearing and easy to get backwards:

| World state | Representation |
| --- | --- |
| Known and present | the real value |
| **Unknown, awaiting owner input** | **a `SCREAMING_SNAKE_CASE` token** - fails `check:config` |
| Deliberately absent, by owner decision | `null` - passes |

So the Mastodon account carries a token today (the handle is *required but unknown*), while
the withdrawn Signal link is `null` (the owner *decided* against it on 2026-07-30). Writing
`null` for an unanswered input silently converts an open question into a settled decision.

---

## 5. REPOSITORY MAP (OBSERVED PATHS)

```text
/
|-- .env.example                      # Scaffold Mastodon variables; values unverified
|-- .nvmrc                            # Pins Node 22.23.2
|-- LICENSE                           # CC0 1.0 Universal, canonical text (Task 004c)
|-- README.md                         # Documents the type system; licence and OFL carve-outs
|-- PROJECT_CONTEXT.md                # Project-level SSOT
|-- TASK_SPEC.md                      # Active task-level SSOT
|-- ROADMAP.md                        # Ordered backlog beyond the active task
|-- PRE-CONTXT-GENERATOR-PROTOCOL.md  # Workflow bootstrap protocol
|-- astro.config.mjs                  # Static output; site from SITE_URL; Tailwind Vite
|                                      # plugin; a fonts[] entry self-hosts Inter (Task 003)
|-- package.json                      # engines.node >=22.18.0; check, prebuild, verify
|-- tsconfig.json                     # Astro strict TypeScript
|-- site.config.ts                    # Identity constants (Task 004b) PLUS the nav list and
|                                      # every header/footer label (Task 005b). groupName,
|                                      # tagline, city, region, domain and contactEmail are
|                                      # FILLED; only the two Mastodon tokens remain unfilled
|-- docs/
|   |-- DECISIONS_ARCHIVE.md          # Historical; not part of the session payload
|   `-- ENVIRONMENT.md                # Workstation setup; not part of the session payload
|-- public/                           # Empty; referenced favicon and OG image are absent
|-- scripts/
|   |-- fetch-mastodon.ts             # Run by the prebuild hook; needs Node 22.18+
|   |-- check-contrast.mjs            # npm run check:contrast; zero deps; wired into the
|   |                                 # UNCACHED half of verify by Task 004
|   |-- check-config.mjs              # npm run check:config; zero deps; wired into the
|   |                                 # UNCACHED half of verify by Task 004b; exits non-zero
|   |                                 # while site.config.ts carries an unfilled token
|   `-- verify-baseline.sh            # npm run verify; caches the lockfile-dependent half
`-- src/
    |-- content.config.ts             # Two collections: `pages` via glob(), and `locations`
    |                                 # via file() with a kind-discriminated union (Task 005)
    |-- components/
    |   |-- Footer.astro              # renders footer.mdx; labels from site.config.ts
    |   |-- Header.astro              # both nav lists loop over site.config.ts `nav`
    |   |-- MastodonFeed.astro        # still holds two user-visible strings; see open defects
    |   `-- home/                     # Task 005b. The CAPPED three-component vocabulary the
    |       |-- Hero.astro            # home page's MDX uses to keep its band layout.
    |       |-- Band.astro            # A fourth component needs a new decision.
    |       `-- Actions.astro
    |-- content/pages/                # EVERY route's prose (Task 005b): home.mdx, about.mdx,
    |                                 # locations.mdx, join.mdx, help.mdx, posts.mdx - plus
    |                                 # footer.mdx, a FRAGMENT rather than a route.
    |                                 # (help.mdx was donate.mdx until Task 005)
    |-- data/
    |   |-- locations.json            # ONE record: the rented garden plot. Owner-approved
    |   |                             # and validated by the `locations` collection
    |   `-- mastodon-posts.json       # Generated cache; currently an empty array
    |-- env.d.ts
    |-- layouts/BaseLayout.astro
    |-- pages/                        # about, help, index, join, locations, posts. Since Task
    |                                 # 005b every one is a thin wrapper that looks up its MDX
    |                                 # document and renders it; NONE holds user-visible copy.
    |                                 # (`donate.astro` was renamed to `help.astro`)
    |-- styles/
    |   `-- global.css                # tailwindcss import, @plugin typography; a :root
    |                                 # brand-inputs block feeding @theme's semantic colour
    |                                 # roles, type scale and rhythm tokens; and the
    |                                 # UNLAYERED .container and .prose
    `-- types/mastodon.ts
```

There is no `tailwind.config.mjs` and no `src/content/config.ts`. Both were removed
deliberately.

`dist/`, `.astro/` and `.verify-cache/` exist locally and are git-ignored.

`site.config.ts` and `scripts/check-config.mjs` were created by Task 004b and are on disk as
of `0fd7d5e`; both are now in the map above.

`src/components/LocationCard.astro`, `DonateSection.astro`, and `JoinCTA.astro` do not
exist. Earlier repository maps that list them describe an unrealized design, not current
files. Files named in a plan but absent from the repository are not part of the current
architecture unless a task explicitly creates them.

---

## 6. ACTIVE SESSION TASK PAYLOAD

### Session role

**`ARCHITECT`, next.** The prior session ran as `IMPLEMENTER` and completed **Task 005b**,
committed as `716ddd3` on the published branch `task/005b-content-consolidation`. A `MEMORY
SYNC` then wrote this document. **`TASK_SPEC.md` still holds the finished Task 005b and is
awaiting promotion of the next task.**

### What the next session is for

**Archiving Task 005b and promoting the next task.** Concretely:

- **Cut Task 005b's verification record into `docs/DECISIONS_ARCHIVE.md`** under
  `## Verification history`. **Task 005's record is already there; Task 005b's is not.**
- **Collapse the `ROADMAP.md` entries** for Tasks 005 and 005b to status lines, and confirm the
  order. `ROADMAP.md` is an `ARCHITECT` document and this `MEMORY SYNC` deliberately did not
  touch it.
- **Promote the next task into `TASK_SPEC.md`**, cutting its scope out of `ROADMAP.md` rather
  than copying it. **Grep the repository before writing any file list into that spec** - four
  roadmap entries in this project have shipped a wrong inventory.

**The order is unchanged: 008a (preview deployment), then the feedback round, then 005c.** Task
006 stays blocked and out of the order. **Task 007a (favicon and OG image) is recommended ahead
of the preview** and needs a still-deferred owner input.

Things to carry into that session:

- **Task 005c inherits two things that MOVED in 005b.** The garbled `/locations` meta
  description is now at **`src/content/pages/locations.mdx:3`**, not `locations.astro:12`. The
  `💪` and `🌯` emoji questions are unchanged. **The two footer defects it used to own -
  `All rights reserved` and `Volunteer` - were fixed by 005b** and must not be re-listed.
- **The traps table is retired.** A session that finds it quoted in an older document is reading
  a superseded rule - see the copy-register decision in section 4. **Constraint 3.1 in section 3
  is not retired.** 005c is the register pass, and it must wait for the feedback round rather
  than pre-empt it.
- **`Our Community Garden Plot` is owner copy and stays.** It now lives in `locations.mdx`.
- **`MastodonFeed.astro`'s raw-markup defect is Task 006's** and is still open and unfixed. That
  component **also** still holds two user-visible strings; see the open defect above for the
  suggestion to fold both into one task rather than touching the file twice.
- **The name-in-prose rule still holds.** Re-verified after 005b: **zero occurrences of the
  group's name in `src/`**, one in `site.config.ts`. A rebrand is still a two-field edit.

**Verification baselines are the ones in section 4, and three of them moved with 005b:**
`npm run check` is **0 errors, 0 warnings, 21 hints** (unchanged, but over 22 files rather than
19), `check:config` now names **exactly 2 tokens** and still exits non-zero, `check:contrast`
passes all sixteen pairs, and `npm run build` emits **six** routes. **A task comparing against
7 tokens, 12 hints, or a `/donate` route is comparing against a stale baseline.**

### Required inputs

- This entire `PROJECT_CONTEXT.md`
- The entire `TASK_SPEC.md`, once a task is promoted
- The current contents of every file listed under the promoted task's allowed scope
- Actual command output from the task's verification commands

`docs/DECISIONS_ARCHIVE.md` and `docs/ENVIRONMENT.md` are **not** required inputs. Load
either only for the narrow reasons stated in section 1.

### Output contract

The implementer must return:

1. A concise summary of changes
2. The exact files changed
3. Verification commands and their results
4. Any acceptance criterion that did not pass
5. Newly discovered repository facts that should be added during `MEMORY SYNC`

This contract is live for whichever task is promoted next. An `IMPLEMENTER` session must still
stop and report rather than start unpromoted work, fill in an owner input, or silently expand
scope.
