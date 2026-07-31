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

- `docs/DECISIONS_ARCHIVE.md` - superseded decisions, resolved defects, and the rationale
  behind rules that are already stated here. Read it only when a rule here looks arbitrary
  or you are about to propose reversing one. Never treat it as current authorization.
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

| Surface | What an adopter does | Status |
| --- | --- | --- |
| `site.config.ts` | Fills identity constants: name, tagline, city, contact, social | **Task 004b, active** |
| `:root` brand inputs in `src/styles/global.css` | Edits fourteen colour values | Shipped, Task 003 |
| `src/data/locations.json` | Replaces the records wholesale | Task 005 |
| `src/content/pages/*.mdx` | **Rewrites the prose wholesale** | Task 005 |

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
  - **The existing `community-garden` record in `src/data/locations.json` is scaffold and is
    replaced, not edited.** `789 Garden Lane, Springfield`, `(555) 456-7890`,
    `garden@communityfood.org` and its seven days of 8:00-6:00 hours are all invented. What
    survives is the **card affordance**, not the row. A future session must not read "keep the
    community garden card" as authorization to leave that data in place.
  - **This is a schema change.** A distribution point deliberately publishes no time; the
    garden has a real cadence and a real address but no map link. One flat shape forces one of
    them to carry a falsehood or a dead field. `locations.json` gets a `kind` discriminator and
    a Zod discriminated union. Recorded on the Task 005 entry in `ROADMAP.md`.
  - The garden does **not** reopen the "staffed sites" question. It has no phone number and no
    per-site email; the single contact route is still email to `info@GROUP_DOMAIN`.
  - **Standing dependency:** these are facts about a third party and about a rental that can
    lapse. If the plot is given up, the card and the about-page claim both go stale. Re-verify
    the CGT listing before publication rather than assuming this entry still holds.
- **`/donate` is a "Ways to Help" page.** It presents concrete material and time needs
  rather than a donation-platform flow. The invented "90% of all donations" transparency
  claim is withdrawn and must not reappear in any form.
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
  labels, buttons and links. Headings inside the MDX documents still mix both and are
  corrected in Task 005, which rewrites that copy anyway.
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
  The terracotta/sage/cream/earthy tokens are **deleted** (not renamed) from
  `src/styles/global.css` and from every component and page; confirmed by grep across `src/`.
  All sixteen role pairs pass AA; figures are in `docs/DECISIONS_ARCHIVE.md` and reproduced
  live by `npm run check:contrast`.
- **Colour is a two-layer token system, implemented in `src/styles/global.css`.** Layer 1 is a
  `:root` block of fourteen **brand-input** values, six brand/accent (`--brand-green`,
  `--brand-green-hover`, `--brand-green-ink`, `--brand-clay`, `--brand-clay-ink`,
  `--brand-clay-soft`) and eight neutrals (`--neutral-paper`, `--neutral-white`,
  `--neutral-mist`, `--neutral-charcoal`, `--neutral-slate`, `--neutral-fog`, `--neutral-haze`,
  `--neutral-line`). These are named **outside** the `--color-*` namespace on purpose, so
  Tailwind never turns them into utility classes - a reusing group edits only this block.
  Layer 2 is sixteen **semantic roles** in the `@theme` block (`--color-surface`,
  `--color-ink`, `--color-brand`, `--color-brand-ink`, `--color-accent`, `--color-accent-ink`,
  `--color-focus`, ...), each a `var()` reference into Layer 1. Templates consume only Layer 2.
  **`--color-brand` (fills) and `--color-brand-ink` (text on light) stay separate roles**, as
  do `--color-accent`/`--color-accent-ink`; collapsing either pair is how the previous palette
  failed nine measured pairs.
- **A contrast validation script exists**: `scripts/check-contrast.mjs`, wired as
  `npm run check:contrast`, plain Node with **zero dependencies**. It parses the token values
  directly out of `src/styles/global.css` (no duplicate list to drift), resolves `var()` chains
  from role to brand input to hex, and checks sixteen named role pairs actually used by the
  templates against WCAG 2.2 AA (4.5:1 text, 3.0:1 for the two focus-ring pairs). Confirmed to
  fail loudly: a deliberately weakened token dropped two pairs to ~2.8:1 and the script exited
  non-zero, naming both. **Not yet part of `npm run verify`** - `scripts/verify-baseline.sh`
  was outside Task 003's scope and was not edited, so contrast checking is currently a separate
  manual step.
- **The type scale is semantic and fluid.** Steps are named for role, not size:
  `--text-display`, `--text-title`, `--text-heading`, `--text-subheading`, `--text-lead`,
  `--text-body`, `--text-label`. Each is a `clamp()`, so one class replaces a breakpoint
  chain and `text-title` supersedes `text-4xl md:text-5xl lg:text-6xl`. A template that
  needs `md:text-*` on a heading is evidence the scale is wrong, not that the page is
  special. Line height and letter spacing travel with each step; **font weight deliberately
  does not**.
- **The measure is `--container-measure`, 39rem**, about 69 characters at the `prose-lg`
  size, measured in a browser at 1440px. `.prose-card` sizes itself to
  `measure + 2 * gutter`, so reading width stays constant however the padding scales.
- **Section rhythm is three mutually exclusive steps:** `.section-lg`, `.section`,
  `.section-tight`, so consecutive bands can differ rather than stacking identically.
- **[2026-07-31] Fonts are self-hosted via Astro's built-in Fonts API, not
  `@fontsource-variable/inter`.** Verified that Astro 7.1.6's `fonts` config key sits at the
  config top level, not under `experimental` (only `experimental_getFontFileURL` carries that
  prefix), so it is stable and needs no new dependency. `astro.config.mjs` now configures
  `fontProviders.google()` for Inter with `display: 'swap'`; the provider fetches the font file
  at **build time** and Astro serves it from the site's own origin with a metrics-matched
  local fallback, so the browser never contacts Google and no visitor IP is sent to a third
  party. Confirmed in `dist/`: zero matches for `fonts.googleapis.com` or `fonts.gstatic.com`,
  two self-hosted `.woff2` files under `dist/_astro/fonts/`. `@fontsource-variable/inter` was
  never installed and is **not** a dependency of this project.
  **Consequence for the repository map:** `astro.config.mjs` is now part of the design-system
  surface, not just deployment config - a future palette or type-system task may need to touch
  it for font reasons even though Task 003's original allowed-scope list did not include it.
  (That gap was hit live during Task 003 and resolved by an explicit owner-approved scope
  expansion rather than a silent edit.) Inter stays the single family; pairing a display face
  is a separate, still-open decision.

### Verified repository state on 2026-07-31

**Tasks 001, 001b, 001c and 002 are complete** and merged to `main` (`8ad91ad`).

**Task 003 (brand system, palette, self-hosted fonts) is complete and merged to `main` as
`faf489e`.** The working tree is clean. *(Corrected 2026-07-31 at Task 004 promotion: this
paragraph previously said the work was uncommitted, which was true when written and stale by
the time it was read. Verify commit state against `git log`, not against this file.)* Verified
by execution on Node v22.23.2:

- `npm ci` exits 0, `npm audit` reports **0 vulnerabilities**.
- `npm run check` reports **0 errors, 0 warnings**, 12 hints (the zod deprecation below).
- `npm run build` emits the same six routes; fonts are self-hosted (`Copying fonts (2 files)`).
- `npm run check:contrast` passes all sixteen role pairs, with ratios matching the audited
  Direction B figures, and was proven to fail (and correctly name the broken pairs) when a
  token was deliberately weakened.
- No literal palette name (`terracotta`/`sage`/`cream`/`earthy`) or hex value remains in
  `src/`; no `fonts.googleapis.com`/`fonts.gstatic.com` reference remains in `dist/`.
- `.container` and `.prose` remain unlayered; the Task 002 type scale and spacing tokens are
  byte-for-byte unchanged (confirmed by targeted diff).
- Browser-verified with the Playwright harness (`docs/ENVIRONMENT.md`) at 375px and 1440px
  across all six routes: `verify.mjs` passes, and the new theme's computed colours were
  confirmed applied (e.g. `h2` renders `rgb(40,88,61)` = `--color-brand-ink`). Focus rings
  were separately confirmed visible (white 2px offset + green 4px ring) via computed
  `box-shadow` on a focused button.

Green baseline, reproducible with `npm run verify`: unchanged mechanics from the note above.
`scripts/verify-baseline.sh` was not edited in Task 003, so `check:contrast` was a manual step
until **Task 004 wired it into the uncached half**; it now runs inside `npm run verify`.

**[2026-07-31] Task 004 (accessibility and shell correctness) is complete and merged to `main`
as `15dd164`.** The working tree is clean. Verified by execution on Node v22.23.2:

- `npm run check` reports **0 errors**, 0 warnings, 12 hints (the zod deprecation, unchanged).
- `npm run verify` exits 0. `npm run check:contrast` now runs inside it, in the **uncached**
  half alongside `astro check` and `astro build` - confirmed to re-run after touching only
  `global.css` even when the dependency half is a cache hit. All sixteen role pairs still
  pass; no colour moved.
- `npm run build` emits the same six routes.
- `grep -rn 'role="menubar"\|role="menuitem"\|role="none"' src/` returns nothing. The
  application-menu ARIA pattern is gone from both navigation lists in `Header.astro`, and the
  `aria-label="Main navigation"` that mis-named the `<header>` landmark is removed. The mobile
  menu is now a labelled `<nav>`, not a labelled `<ul>` with an inert label.
- `grep -rn 'href="#"' src/` returns nothing. The footer email link now points at
  `mailto:info@GROUP_DOMAIN` (owner-fill token, deliberately still unfilled); the Mastodon
  link is **removed entirely** rather than pointed at a guessed instance - it returns in Task
  006 or 007 with `rel="me"` once the handle exists.
- The footer's three redundant `aria-label`s (`"Mastodon"` against "Follow us on Mastodon",
  `"Email"` against "Email us", `"Volunteer"` against "Volunteer") are deleted rather than
  lengthened, closing the WCAG 2.5.3 failure; decorative emoji are wrapped `aria-hidden`.
- A single `:focus-visible` rule in `global.css` (`a, button, [tabindex]`, using the existing
  `--color-focus` role) supplies the project's focus indicator. `.btn-primary` /
  `.btn-secondary` keep their own rings, which win on specificity, so nothing double-rings.
- The mobile menu's keyboard contract is complete: Escape closes it from a link inside or from
  the toggle and returns focus to the toggle; tabbing past the last link closes it without
  stranding focus; all four close paths (toggle click, link click, Escape, focus-leaving)
  share one `closeMenu()` function. **No focus trap was added.** The pre-existing, already-
  correct `isHidden` `aria-expanded` inversion was left untouched, as instructed.
- A `prefers-reduced-motion: reduce` block was added to `global.css` as preventive hygiene -
  the project animates only colour and shadow today, so this closes no observed defect and is
  reported as such, not as a fix.
- The Task 002 type scale, the spacing tokens, and the **unlayered** `.container` / `.prose`
  blocks are confirmed byte-for-byte unchanged by targeted diff.
- Browser-verified with the Playwright harness (`docs/ENVIRONMENT.md`). **The harness's own
  claim to already have "focus-visible traversal groundwork" did not hold up** - it had none -
  so it was extended rather than trusted; see the correction logged in `docs/ENVIRONMENT.md`.
  It now tabs through every focusable element on all six routes at both 375px and 1440px,
  asserting a visible `outline` or `box-shadow` from computed style, and separately drives the
  mobile menu's full keyboard contract (Escape from inside, Escape from the toggle,
  tab-past-last-link, focus return, and an explicit no-trap assertion). All checks pass.

### Open defects

- **`MastodonFeed` prints raw markup. Confirmed empirically on 2026-07-30**, not merely
  predicted: seeding the cache with one post containing `<p>` tags and building produced
  `...not erased&lt;/p&gt;` in `dist/index.html`. Visitors would see literal `</p>` on the
  page. Safe handling requires sanitization or an explicit HTML-to-text conversion at build
  time; it does not mean leaving the escape in place. Tracked as Task 006.
- **zod deprecation.** Astro 7 moved to zod v4 and deprecated the `z` re-export from
  `astro:content`, producing 12 non-blocking hints in `src/content.config.ts`. Resolving it
  means taking `zod` as a direct dependency, which needs an owner decision under
  constraint 3.6. `zod@4.4.3` is currently present only as a transitive dependency of astro,
  so importing it directly today would rely on hoisting and is not safe.
- `public/` contains no files. `BaseLayout.astro` references `/favicon.svg` and
  `/images/og-default.jpg`, so both 404 on every route. Tracked as Task 007.
- **[2026-07-31] Resolved by Task 004, removed from this list:** the `role="menubar"` /
  `role="menuitem"` / `role="none"` application-menu pattern in `Header.astro`, the
  `aria-label="Main navigation"` mismatch on `<header>`, both `Footer.astro` dead `href="#"`
  links, and the three redundant `aria-label`s that failed WCAG 2.5.3. See the dated decision
  above for the verification record.
- The MDX documents and `src/data/locations.json` still contain invented locations, history,
  schedules and impact claims - scaffold content, not approved public facts, and the target of
  Task 005. `Footer.astro`'s share of this is resolved: its invented social link and
  mismatched labels are gone. Its hardcoded organization name is a separate thing, tracked in
  the owner-inputs table below and **now being fixed by the active Task 004b**, not by this
  defect.
- **[2026-07-31] The invented organization name and tagline are shipping in metadata.**
  `"Community Food Group"` appears 9 times across 7 files and `"Building food security through
  community action"` 3 times, reaching `<title>`, the copyright line, `og:description` and
  `twitter:description` on every route. Live constraint 1 violations. **Task 004b** removes
  all of the metadata occurrences; two prose occurrences (`about.mdx:9` and the
  `Footer.astro:8` blurb) are deliberately left for **Task 005**, because section 2 forbids
  interpolating config into prose.
- There is no CI workflow, automated test suite, formatter, or lint command.
- Cloudflare Pages configuration and a production URL have not been verified.

### Current phase

**Task 003 is complete and merged** (`faf489e`). The palette now passes AA on every checked
pair instead of failing nine, the toolchain is current, and the routes share one type scale,
one measure, one set of rhythm tokens, and one colour token system.

**[2026-07-31] Task 004 (accessibility and shell correctness) is complete and merged** as
`15dd164` - see the dated decision above for the full verification record. It picked up the
two things Task 003 could not: wiring `npm run check:contrast` into `npm run verify`, and the
two dead footer links.

**Every Track A task through 004 is now merged and the working tree is clean.** Tasks 001,
001b, 001c, 002, 003, 004 and 004c are all on `main`.

The repository is still a prototype whose public copy is invented scaffold data, and **it
must not be deployed.**

**[2026-07-31] Task 004b (site config and the fork-and-adopt surface) is promoted and
ACTIVE.** Its full scope and acceptance are in `TASK_SPEC.md`, which is their only copy; the
`ROADMAP.md` entry is now a status line. The next session's role is `IMPLEMENTER`.

Three things were found at promotion by grepping the repository rather than trusting the
roadmap entry, and they are recorded here because they outlive the task:

- **The roadmap's own inventory of the hardcoded name was wrong** - it claimed 9 occurrences,
  enumerated 7, and named 6 files where there are 7. The two it missed were an `aria-label`
  and an MDX heading, which is precisely the failure mode its own rationale predicted.
  Constraint 3.4 governs this project's notes about itself, not only the repository.
- **One occurrence is not fixable by 004b.** `about.mdx:9` is MDX prose, and section 2 forbids
  interpolating config into prose, so it is deliberately left for Task 005. The promoted spec
  requires it to *survive* rather than counting its survival as a failure.
- **A second constraint 1 violation was found:** the invented tagline "Building food security
  through community action", feeding `<meta name="description">`, `og:description` and
  `twitter:description`. It is config-driven chrome under section 2 and is in 004b's scope,
  but the same words also open a footer *prose* blurb, which is Task 005's. This raises one
  new owner input, in the table below.

**Track B (Task 005) remains blocked on exactly one input: the organization name**, in the
owner-inputs table below. Task 004b does not resolve this - it moves the name into one config
field (`site.config.ts`) rather than eight, but Task 005's prose still has to be written
knowing what the group is called. Nothing else blocks Task 005: the contact route, the
geographic scope, and the garden are all settled. **Its blockers will be re-confirmed in an
`ARCHITECT` session after 004b lands**, before it is promoted.

**Resolved: the `ROADMAP.md` Task 004c staleness** flagged here previously. That entry read
"not yet committed" while `git log` showed `bcef6db`; it was corrected at the 004b promotion,
which was the next ARCHITECT write to that file. The general rule stands and is worth keeping:
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
| Final public organization name | Deferred; use `GROUP_NAME` token. **Currently hardcoded as the plausible-sounding "Community Food Group" in 9 places across 7 files in `src/`, which is a live constraint 1 violation. Task 004b removes 8 of them; the 9th (`about.mdx:9`) is prose and goes with Task 005.** | Branding, page copy, metadata |
| **Tagline, or a decision that there is none** | **Open; raised 2026-07-31 at the Task 004b promotion.** Use the `GROUP_TAGLINE` token. `"Building food security through community action"` is invented scaffold currently shipping in `og:description` on every route. A decision of "no tagline, the name alone" is a valid answer and is modelled as `null`, not as a token. | `<meta name="description">`, OG and Twitter cards |
| Town / geographic scope | **ANSWERED 2026-07-31: Tucson, Arizona.** `CITY` token retired | *(unblocked)* |
| Domain name; not yet purchased | Deferred; use `GROUP_DOMAIN` token | Contact address, canonical URLs, deployment |
| Whether cook-session and distribution places are named publicly at all | **Required.** May be "none are named". *The garden is settled and is no longer part of this row; this now covers only the cook and distribution sites.* | `src/data/locations.json` replacement |
| Mastodon account handle, or confirmation there is none | **Required before Task 006** | Mastodon ingestion, feed routes, footer |
| Approved food-safety language, if any is wanted | Open | About or ways-to-help content |
| Logo, favicon, social image | Deferred | `public/` assets, brand pass |
| Confirmed Cloudflare Pages project URL | Deferred | `astro.config.mjs`, deployment |

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

- **Geographic scope: Tucson, Arizona.** Written out; the `CITY` token is retired.
- **The garden is settled in full** - Presidio Garden, 3440 E Presidio Rd, a rented plot in a
  Community Gardens of Tucson site, every other week through the growing season, address
  published without a map link, CGT named and linked. Details and the exact permitted framing
  are in the dated decision above.
- The Mastodon footer link is **removed** in Task 004 rather than left dead. This does not
  answer the handle question - it defers the link until Task 006 or 007, when the handle
  exists.

Nothing on the remaining list blocks Task 004b - it centralizes these values without filling
them, and **ships with `npm run check:config` deliberately failing** on the tokens that are
genuinely unknown. **Track B is still down to two blockers:** the organization name, which
gates Task 005, and the Mastodon handle, which gates Task 006. The tagline added above blocks
neither; it is metadata that 004b tokenizes today and the owner can answer at any point. The
locations row still gates the cook and distribution records, but the garden record can be
written today.

**How an unanswered input is represented in `site.config.ts`** (Task 004b), because the
distinction is load-bearing and easy to get backwards:

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
|-- docs/
|   |-- DECISIONS_ARCHIVE.md          # Historical; not part of the session payload
|   `-- ENVIRONMENT.md                # Workstation setup; not part of the session payload
|-- public/                           # Empty; referenced favicon and OG image are absent
|-- scripts/
|   |-- fetch-mastodon.ts             # Run by the prebuild hook; needs Node 22.18+
|   |-- check-contrast.mjs            # npm run check:contrast; zero deps; wired into the
|   |                                 # UNCACHED half of verify by Task 004
|   `-- verify-baseline.sh            # npm run verify; caches the lockfile-dependent half
`-- src/
    |-- content.config.ts             # Content collection; glob() loader
    |-- components/
    |   |-- Footer.astro
    |   |-- Header.astro
    |   `-- MastodonFeed.astro
    |-- content/pages/                # about.mdx, donate.mdx, join.mdx
    |-- data/
    |   |-- locations.json            # Unapproved scaffold records
    |   `-- mastodon-posts.json       # Generated cache; currently an empty array
    |-- env.d.ts
    |-- layouts/BaseLayout.astro
    |-- pages/                        # about, donate, index, join, locations, posts
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

`site.config.ts` and `scripts/check-config.mjs` are **absent from this map on purpose**: the
active Task 004b creates them, and they do not exist yet. This map records observed state
(constraint 3.4). Add them here only once they are on disk.

`src/components/LocationCard.astro`, `DonateSection.astro`, and `JoinCTA.astro` do not
exist. Earlier repository maps that list them describe an unrealized design, not current
files. Files named in a plan but absent from the repository are not part of the current
architecture unless a task explicitly creates them.

---

## 6. ACTIVE SESSION TASK PAYLOAD

### Session role

**`IMPLEMENTER`.** The prior session ran as `ARCHITECT` and promoted Task 004b into
`TASK_SPEC.md` on 2026-07-31. The session before that ran as `IMPLEMENTER` for Task 004, now
complete and merged.

### Active task

**Task 004b - Site config and the fork-and-adopt surface.** Promoted 2026-07-31.
**`TASK_SPEC.md` is the only authority on its scope and acceptance**; the `ROADMAP.md` entry
is a status line and the planned scope was cut, not copied.

In short: create `site.config.ts` and `scripts/check-config.mjs`, replace the eight in-scope
hardcoded occurrences of the organization name plus the tagline in metadata, wire
`check:config` into the uncached half of `npm run verify`, and broaden `README.md`'s
rebranding section to the four adoption surfaces.

**Two things about this task are unusual and are not defects:**

1. **It ships with `npm run check:config` deliberately failing.** The organization name, the
   tagline, the domain and the Mastodon handle genuinely are not known. A red check is the
   honest end state. Do not weaken the check and do not fill a token to make `verify` green.
2. **It deliberately leaves one hardcoded name behind**, at `about.mdx:9`. That is prose, and
   section 2 forbids interpolating config into prose. It belongs to Task 005.

Tasks 001, 001b, 001c, 002, 003, 004 and 004c are complete and merged to `main` - 003 as
`faf489e`, 004c as `bcef6db`, 004 as `15dd164` - and the working tree is clean. **Do not infer
commit state from a status word in this file; check `git log` / `git status`.** These
documents have gone stale on exactly this point twice.

**Next after 004b:** an `ARCHITECT` session re-confirms Task 005's blockers and promotes it if
they are clear. Task 005 (Track B) stays blocked until the owner supplies the organization
name - see the owner-inputs table in section 4.

### Required inputs

- This entire `PROJECT_CONTEXT.md`
- The entire `TASK_SPEC.md`
- The current contents of every file listed under the task's allowed scope
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

Task 004b is promoted and this contract is live. An `IMPLEMENTER` session must still stop and
report rather than start Task 005 unpromoted, fill in an owner input, or silently expand
scope - including into the two prose occurrences that `TASK_SPEC.md` explicitly fences off.
