# TASK SPECIFICATION

## Task 005b : Zero user-visible copy in `.astro`, and fill the domain

### Role

`IMPLEMENTER`

### Status

**ACTIVE.** Promoted 2026-07-31 by an `ARCHITECT` session, **scope widened the same day by owner
decision** before any implementation began. This document is the only authority on this task's
scope and acceptance. Its planned scope has been **cut** from `ROADMAP.md`, whose entry is now a
status line pointing here.

**Nothing of Task 005's spec survives in this file.** Task 005 is complete, merged as `375d860`,
and its verification record is in `docs/DECISIONS_ARCHIVE.md` under `## Verification history`.

### Goal

**After this task, changing any sentence on the site means opening a file under
`src/content/` or `site.config.ts` - never a `.astro` file.**

That is the whole task. Everything below serves it.

Plus one thing bundled because it touches the same files: **fill `GROUP_DOMAIN`**, which removes
five of the seven tokens and in particular removes **the only token that reaches `dist/`** -
which is what unblocks the preview deployment in Task 008a.

### Why the scope was widened, stated so it is not re-narrowed later

As first promoted, this task moved only `/posts` and the `/locations` page copy and left the
home page as "the one genuine template, structured layout rather than linear prose." **The owner
rejected that.** The count is why - measured, not estimated:

| File | User-visible strings it would have kept |
| --- | --- |
| `index.astro` | **~17** - the `h1`, hero lede, **four full paragraphs**, three section headings, six button labels |
| `Header.astro` | **~12** - five nav labels **duplicated across the desktop and mobile lists** |
| `Footer.astro` | **~12** - the blurb, four quick-link labels, two column headings, `Volunteer`, the copyright line |

**About forty strings, including the entire home page**, which is roughly 60% prose by volume.
"Structured layout, not prose" was an architectural rationalization and it does not survive
contact with the file.

**A future session must not re-derive that argument.** The home page is in scope. It stays in
scope.

---

## Verified starting conditions

Confirmed by reading and executing against the repository on 2026-07-31 at `83838b8`, on Node
v22.23.2. **If any has changed, stop and report the mismatch rather than adapting silently.**

| Check | Observed |
| --- | --- |
| `git status` | clean |
| `npm run check` | 0 errors, 0 warnings, **21 hints** (the zod deprecation) |
| `npm run check:contrast` | exits 0, all **sixteen** role pairs pass |
| `npm run check:config` | **exits 1**, naming **7** tokens |
| `npm run build` | **6** routes: `/`, `/about`, `/help`, `/join`, `/locations`, `/posts` |

**The seven tokens, by file and line, confirmed by running `check:config`:**

```
site.config.ts:34                  GROUP_DOMAIN     (domain)
site.config.ts:38                  GROUP_DOMAIN     (contactEmail)
site.config.ts:41                  MASTODON_HANDLE
site.config.ts:41                  MASTODON_URL
src/content/pages/about.mdx:18     GROUP_DOMAIN
src/content/pages/help.mdx:12      GROUP_DOMAIN
src/content/pages/join.mdx:12      GROUP_DOMAIN
```

### Facts confirmed by grep at promotion, not inherited

Three roadmap entries in this project have shipped a wrong file inventory. These were checked.

1. **`src/pages/index.astro` does NOT import `locations.json`.** Task 005 removed that import.
   The only files referencing the collection or the content entries are `src/content.config.ts`,
   `locations.astro`, and the three MDX wrappers.
2. **`src/content.config.ts` needs no change.** The `pages` glob is
   `{ base: './src/content/pages', pattern: '**/*.{md,mdx}' }`, so it picks up new documents
   automatically, and every new document below uses the existing `pages` schema unchanged.
   **Nothing enumerates the `pages` collection** - every consumer calls `getEntry` by id - so
   adding non-route documents to it is safe.
3. **`pageTitle` never renders a visible heading.** `BaseLayout.astro:17` uses it only to build
   `<title>`. Every route has exactly one `h1` today, confirmed against `dist/`.
4. **The three existing MDX wrappers are byte-identical apart from the entry id.**
   `about.astro`, `join.astro` and `help.astro` are 27-28 lines each. That is the proven pattern.
5. **`Header.astro` holds two separate hardcoded label lists** - desktop at lines 15-41 and
   mobile at lines 59-88 - carrying the same five labels. **`Footer.astro`'s labels disagree with
   both**: `About Us` vs `About`, `Join Us` vs `Join`.

---

## Owner decisions this task implements

Recorded in `PROJECT_CONTEXT.md` section 4, which remains their authority. **Do not re-ask them
and do not soften them.**

| Decision | What it means here |
| --- | --- |
| **Zero user-visible copy in `.astro`** | The goal above. Supersedes the narrower "home page stays a template" ruling taken earlier the same day. |
| **The domain is `vegansagainstfascism.org`** | **The spelling was confirmed explicitly** after the owner first wrote `veganagainstfasism.org` - singular, missing a `c`. Use the confirmed value verbatim; do not "correct" it in either direction. |
| **Prose stays markdown, never YAML** | A multi-paragraph block in a frontmatter scalar is indentation-sensitive and breaks the build when an editor gets it wrong. Short labels are not prose and may live in frontmatter or config. |
| **The garden gets one home: `locations.json`** | `about.mdx` links to `/locations` instead of restating the garden's facts. |
| **The Task 005 traps table is retired** | `Our Community Garden Plot` is **owner copy and stays**. Move it; do not reword it. |

---

## Allowed scope

**New files:**

- `src/content/pages/home.mdx`
- `src/content/pages/locations.mdx`
- `src/content/pages/posts.mdx`
- `src/content/pages/footer.mdx`
- **Up to three** new components for the home page bands, under `src/components/home/`.

**Modified files**, all confirmed present at `83838b8`:

- `site.config.ts`
- `src/content/pages/about.mdx`, `join.mdx`, `help.mdx`
- `src/pages/index.astro`, `locations.astro`, `posts.astro`
- `src/components/Header.astro`, `Footer.astro`
- `src/data/locations.json` - **the `description` field only**
- `README.md`

**Explicitly out of scope:**

- **`src/content.config.ts`.** Confirmed above to need no change. If you believe it does, **stop
  and report** rather than editing.
- **Any copy rewrite.** Register, tone, warmth. **Task 005c**, after the feedback round. This
  includes the garbled `/locations` meta description at `locations.astro:12` - **move it
  verbatim.** Three narrow exceptions are named in the required changes below.
- **`social.mastodon`.** Both tokens stay. The handle came back "undecided", which is not a
  decision that there is no account. **Writing `null` would convert an open question into a
  settled one.**
- **`src/components/MastodonFeed.astro`'s internals.** Its raw-markup defect is **Task 006's**.
  You will reference the component from MDX; do not change how it renders.
- **`public/` assets, favicon, OG image.** Task 007 / 007a.
- **The `🌯` logo emoji and the `💪` in the hero heading.** Move them; do not change them.
- **Taking `zod` as a direct dependency, the 21 zod hints.** Task 009.
- Any colour token, the type scale, the spacing rhythm, the **unlayered** `.container` and
  `.prose`. **`src/styles/global.css` must not be touched.**
- `tsconfig.json`, `astro.config.mjs`, `package.json`, `scripts/`.
- **`PROJECT_CONTEXT.md`.** Section 1 gives it to `MEMORY SYNC`. Report changes; do not write it.

**No new dependencies.** Constraint 3.6. Everything here is Astro, MDX and existing packages.

---

## Required changes

### 1. Fill the domain

In `site.config.ts`:

- `domain: 'vegansagainstfascism.org'`
- `contactEmail: 'info@vegansagainstfascism.org'`

**Do not derive `contactEmail` from `domain`.** The comment at line 35 explains why: a computed
template string would construct the token at runtime and hide it from a source-text scan. Write
both literals.

Then replace the literal `info@GROUP_DOMAIN` with `info@vegansagainstfascism.org` in
`about.mdx:18`, `help.mdx:12`, `join.mdx:12`. **These stay literals in the MDX** - section 2
forbids interpolating config into prose, and that has not changed now the value is known.

`check:config` must drop from **7** tokens to **2**. **It still exits non-zero. That is correct.**

### 2. Move the home page into `home.mdx`

This is the largest change and the one the task exists for.

- **All home-page prose moves into the body of `src/content/pages/home.mdx` as markdown** - the
  `h1`, the hero lede, the four paragraphs, the three section headings.
- **Button labels and their hrefs may live in frontmatter**, since they are labels, not prose.
- `index.astro` reduces to the wrapper pattern - `getEntry('pages', 'home')`, the `if (!page)
  throw` guard with a matching message, `render()` - **and holds no strings of its own.**

**The band structure is preserved.** The page keeps its gradient hero, the updates section, the
"How It Works" section and the accent CTA band. Do not flatten the design into one prose column;
that is a redesign and it was not asked for.

**Up to three small components are authorized** to express those bands from MDX - a hero, a
section band with a background variant, and a row of action buttons is the expected shape. **This
is a fixed vocabulary, not a design system.** Do not add a fourth without stopping to report.

**Two mechanisms exist for using components inside MDX** - importing them at the top of the MDX
document, or passing them through `<Content components={{ ... }} />` from the route. **The second
keeps import lines out of the file the owner edits and is preferred for that reason. Verify which
actually works by building - do not assume either.** Report which you used and why.

**`MastodonFeed` is referenced from `home.mdx`** so the updates band sits in the content file
with everything else. Its internals stay untouched.

### 3. Move `/locations` and `/posts` copy into MDX

Same wrapper pattern, one dynamic element each.

- `posts.mdx` carries the `h1` and the lede, **moved verbatim**. `posts.astro` becomes the
  wrapper plus `<MastodonFeed limit={20} />`.
- `locations.mdx` carries the `h1`, the lede paragraph and the `## Our Community Garden Plot`
  heading, **all moved verbatim**. `locations.astro` becomes the wrapper plus the
  `getCollection('locations')` card render, which stays in the template - it is structured layout
  over data, not prose.
- **Move the meta `description` strings into frontmatter verbatim**, including the grammatically
  broken `/locations` one. That is a known defect and it is 005c's.
- **The `/locations` lede's inline `mailto:` becomes literal prose**, not
  `siteConfig.contactEmail`. Config interpolation into MDX is forbidden, and after change 1 the
  address is a known literal.

**One presentation decision to make and report.** The three existing MDX routes render inside
`<article class="prose-card"><div class="prose prose-lg">`; `/locations` and `/posts` currently
use a centred `max-w-3xl mx-auto text-center` treatment. **Choose one deliberately and say which
and why.** Silently changing how two routes look is not acceptable.

### 4. Consolidate nav and footer strings

- **`site.config.ts` gains one navigation list** - label and href per item - **and both
  `Header.astro` lists read it.** The desktop and mobile lists stop being two hardcoded copies.
  Extend the `SiteConfig` interface accordingly; the file is typed with
  `as const satisfies SiteConfig` and must stay that way.
- **`Footer.astro`'s quick links read the same list**, which resolves the `About` / `About Us`
  and `Join` / `Join Us` disagreement. **Move the labels verbatim; where the two lists disagree,
  the header's shorter form wins.** Report any label whose wording you changed.
- **The footer blurb is prose, so it goes to `src/content/pages/footer.mdx`** and `Footer.astro`
  renders it. It is a fragment, not a route - no page reads it by id, and nothing enumerates the
  `pages` collection.
- **Column headings, `Email us`, and the remaining labels move to config.**

**Two named exceptions where you may change wording**, because both are factual defects rather
than register, and both are recorded in `PROJECT_CONTEXT.md`'s open-defects list:

1. **`Footer.astro:56` says `All rights reserved`, which contradicts the repository's CC0
   dedication.** `LICENSE` waives copyright as far as law allows. Write a copyright line that
   does not assert reserved rights. Keep it minimal and report the exact wording.
2. **`Footer.astro:46`'s `Volunteer` quick link** is volunteer-program framing that Task 005
   removed from `join.mdx` and everywhere else. Replace it with a label consistent with the rest
   of the site's navigation.

**Accessibility strings** - `aria-label`s and any `alt` text - **are user-visible to screen
reader users.** Move them to config where it is trivial. **Any you leave in a template must be
listed and justified in your report.** The mobile toggle's `aria-label` and the header's
`aria-label={...groupName...}` are the known cases.

### 5. Give the garden one home

- **In `about.mdx`, the `## The Garden Plot` section stops restating the garden's facts and links
  to `/locations`.** Keep the sentences that belong to the *about* page - that produce from the
  plot is cooked into the food the group hands out or given directly to people in the group and
  to neighbors. **That connection is the about page's point and stays.** What goes is the
  restatement of where the garden is, who operates it, and the outbound CGT link.
- **Reconcile the CGT URL.** `about.mdx:22` links to `https://www.communitygardensoftucson.org/`
  while `locations.json:10` links to `.../garden-locations`. **The listing URL is the verified
  one** - `PROJECT_CONTEXT.md` section 4 records it as checked against the operator's own site on
  2026-07-31. It survives, in `locations.json`, as the single outbound link.
- **`locations.json`'s `description` is missing its terminal full stop.** You may add it. **Do
  not otherwise reword the field** - that is 005c's. *(Third named exception.)*

**Do not re-verify the CGT listing here** - that is a publication gate and belongs to Task 008a.
**But if you notice the link is dead or the listing has changed, stop and report it.**

### 6. Reconcile `README.md`

- **Line 108**, the project-structure block, and **line 126**, the four-surfaces table row, and
  **line 229**, which enumerates `about.mdx`, `join.mdx`, and `help.mdx`. All three describe
  where prose lives and all three go stale.
- **Say plainly that every route's prose is now in MDX**, and that nav and footer labels are in
  `site.config.ts`. That is the adoption promise this task finally makes true.
- **The `## Known gaps` section claims "`Header.astro` still applies application-menu ARIA roles
  to ordinary site navigation." That is false and has been since Task 004.** Confirmed:
  `/usr/bin/grep -rn 'role="menubar"\|role="menuitem"\|role="none"' src/` returns nothing. Delete
  the sentence; keep the rest of the accessibility statement, which is accurate.
- **The "not ready to publish" callout at lines 9-17 stays**, wording updated. `check:config` is
  still red on the two Mastodon tokens, `public/` is still empty, no deployment exists. **Do not
  remove the warning.**

---

## Acceptance criteria

Every criterion is **executed**, not inspected. Constraint 3.10 forbids reporting success from a
diff. Paste real output.

**Every criterion that greps `dist/` must use `/usr/bin/grep`.** In this shell, `grep` is a
wrapper function that honours `.gitignore` - including when an ignored directory is named as an
explicit argument. `dist/` is git-ignored, so **a criterion grepping `dist/` with the wrapper
passes vacuously**, reporting no output whether or not the string is there. See
`PROJECT_CONTEXT.md` section 4.

### The criterion the task exists for

1. **THE EDIT TEST, and it is the one that matters.** For **each** of `/`, `/about`, `/help`,
   `/join`, `/locations`, `/posts`: change one visible sentence by editing **only** a file under
   `src/content/`, rebuild, and show the changed text in `dist/`. Then revert. **Paste the six
   before/after pairs.** A route that cannot be edited this way has failed this task.

2. **The string inventory.** List **every** text string remaining in **every** `.astro` file, and
   classify each as: not user-visible (a class, an id, a `data-` attribute), an accessibility
   string with a stated justification for staying, or a violation. **Violations must be zero.**
   This is a written inventory, not a grep - a grep cannot tell a class name from a button label,
   which is exactly why this is a review criterion.

3. `/usr/bin/grep -rn 'Vegan Mutual Aid\|How It Works\|Come and Cook\|Latest Updates' src/`
   returns hits in `src/content/pages/` **only** - zero in `src/pages/` and zero in
   `src/components/`.

### Correctness

4. `npm run check` reports **0 errors, 0 warnings**. Report the hint count. **21 is the
   baseline**; this task adds no `z` usage, so it should not move. **If it does, explain why
   before reporting success.**

5. `npm run check:config` exits **non-zero**, naming **exactly two** tokens: `MASTODON_HANDLE`
   and `MASTODON_URL`, both in `site.config.ts`. Paste the full output. **Do not fill either, and
   do not write `null`, to make it green.**

6. `/usr/bin/grep -rn 'GROUP_DOMAIN' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.astro`
   returns hits in the **project documents only**. Zero in `src/`, zero in `site.config.ts`.

7. `/usr/bin/grep -rn 'vegansagainstfascism\.org' dist/` returns hits on **all six** routes.
   `/usr/bin/grep -rni 'veganagainstfasism\|veganagainstfascism' . --exclude-dir=node_modules --exclude-dir=.git`
   returns **nothing** - the misspelled forms appear nowhere, including in documents.

8. `npm run build` emits the **same six** routes. None added, none lost.

9. **Exactly one `h1` per route, in `dist/`.** For each of the six built HTML files, run
   `/usr/bin/grep -o '<h1' <file> | wc -l` and paste the six counts. **This is the criterion most
   likely to fail** - moving an `h1` into MDX is precisely the change that produces a duplicate or
   a missing heading.

10. **No glued link text.** `PROJECT_CONTEXT.md` records that Astro's HTML compressor strips
    whitespace-only text nodes around inline elements, so an inline link in wrapped prose ships
    with the surrounding words fused to it - invisible in source and in the diff. The home page
    and `/locations` both have inline `mailto:` links in paragraphs and both are being rewritten.
    **Check the rendered text in `dist/` for `write to<a` and `</a>and` patterns and paste the
    result.**

11. `/usr/bin/grep -rn 'communitygardensoftucson' src/ dist/` shows the **`/garden-locations`
    listing URL only**. The bare site-root form appears nowhere.

12. **The garden is described in one place.** `/usr/bin/grep -rni 'presidio' src/` returns hits in
    `src/data/locations.json` **only**.

13. **`Our Community Garden Plot` still renders on `/locations`**, confirmed in `dist/`. This is
    owner copy. **A run that "helpfully" removed it has failed this task**, not passed it.

14. **The nav lists agree and come from one source.** `/usr/bin/grep -c 'Ways to help' dist/index.html`
    shows it appearing in both the desktop and mobile navs plus the footer, and
    `/usr/bin/grep -rn 'About Us\|Join Us' src/` returns nothing - the disagreeing forms are gone.

15. `npm run check:contrast` exits **0** with all sixteen pairs passing, and
    `git diff HEAD -- src/styles/global.css` is **empty**. This task moves no colour.

16. Task 004's accessibility work intact:
    `/usr/bin/grep -rn 'role="menubar"\|role="menuitem"\|role="none"' src/` and
    `/usr/bin/grep -rn 'href="#"' src/` both return nothing. **The mobile menu's keyboard
    contract still works** - Escape closes it, focus returns to the toggle, and focus leaving
    closes it. `Header.astro` is being rewritten around a loop, so **this is a real regression
    risk, not a formality.** Verify it in the browser.

17. `git diff HEAD --stat` lists **only** files in the allowed scope. Paste it.
    `src/content.config.ts`, `src/styles/global.css`, `astro.config.mjs`, `package.json`,
    `scripts/` and `PROJECT_CONTEXT.md` must **not** appear.

18. **A browser pass is required, at 375px and 1440px, on all six routes.** The home page is
    being rebuilt from components and `Header.astro` from a loop. Confirm: the hero, updates,
    How It Works and CTA bands all render with their backgrounds intact; the mobile menu opens,
    closes and traps no focus; the garden card still shows its address and cadence; no route
    overflows horizontally. See `docs/ENVIRONMENT.md` for the Playwright/Chromium setup and the
    `LD_LIBRARY_PATH` requirement.

19. **The copy is moved, not rewritten.** For each moved block, show the sentences are the same
    ones. The permitted exceptions are exactly three, all named above: the `mailto:` becoming a
    literal link, the `locations.json` full stop, and the two footer defects (`All rights
    reserved`, `Volunteer`). **Report the exact new wording for those two.**

---

## Reviewer focus

- **Can the owner actually edit every route from a content file?** Criterion 1. Everything else
  is secondary to this.
- **How many strings are left in `.astro`?** Criterion 2. "Approximately none" is a fail.
- **Was the domain spelled `vegansagainstfascism.org`?** Plural, `fascism` in full. One character
  makes the site's only call to action dead on all six routes.
- **Was `contactEmail` derived from `domain` rather than written as a literal?** It must not be.
- **Did config interpolation get into MDX?** `{siteConfig.contactEmail}` in `locations.mdx` is the
  natural way to move that lede and it is forbidden.
- **Did the home page get flattened into a prose column?** The bands are meant to survive.
- **Are there more than three new components?** The vocabulary is capped deliberately.
- **Was `Our Community Garden Plot` removed or reworded?** It is owner copy and stays.
- **Was copy rewritten under cover of moving it?** Only three exceptions are permitted and all
  three are named.
- **Did the mobile menu's keyboard contract survive the `Header.astro` rewrite?**
- **Was `social.mastodon` touched** - filled, guessed, or set to `null`? All three are wrong.
- **Were `content.config.ts`, `global.css`, `astro.config.mjs`, `package.json` or `scripts/`
  touched?** None should be.
- **Does every route still have exactly one `h1`?**

---

## Out of scope / queued work

**Task 008a (preview deployment) follows.** It needs the domain fill this task delivers, plus an
output scan over `dist/`, a `noindex` mechanism, `NODE_VERSION=22.23.2`, and `SITE_URL` as a real
environment variable. **It also re-verifies the CGT listing and confirms
`info@vegansagainstfascism.org` actually receives mail** before anything is shared.

**Then the feedback round, then Task 005c** - the copy register pass, which must wait for the
feedback rather than pre-empt it. It inherits the garbled `/locations` meta description and the
`💪`/`🌯` emoji questions.

**Task 006 (Mastodon) is blocked and out of the order.** The handle came back "undecided".

**Task 007a (favicon and OG image) is recommended before the preview** and needs a still-deferred
owner input. `public/` is empty, so every shared preview link currently renders a broken card.

**Open owner inputs after this task:** the Mastodon handle; whether
`info@vegansagainstfascism.org` is receiving mail; the logo/favicon/social image; a confirmed
Cloudflare Pages project; and food-safety language, still deliberately deferred.
