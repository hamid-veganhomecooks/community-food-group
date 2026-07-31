# Mutual aid group site template

Public information site for a local mutual aid group that cooks together and distributes
food directly to neighbours - a template plus one group's own instance of it, meant to be
forked and adopted by other groups. See [Rebranding this site](#rebranding-this-site).

Built with Astro 7, Tailwind CSS 4, and MDX. Static output, intended for Cloudflare Pages.

> **This site is not ready to publish.**
>
> The public-facing copy and every record in `src/data/locations.json` are generated
> scaffold data: invented addresses, phone numbers, email addresses, opening hours, a
> founding date, and a donation statistic. None of it describes a real organisation. It
> must be replaced with owner-approved content before any deployment.
>
> See `PROJECT_CONTEXT.md` for the project's single source of truth, `TASK_SPEC.md` for the
> active task, and `ROADMAP.md` for the ordered backlog.

## Requirements

- **Node.js 22.18 or newer.** This is a hard requirement, not a recommendation.
  `scripts/fetch-mastodon.ts` is executed directly by Node using native TypeScript type
  stripping, which is unavailable before 22.18. On Node 20 the script fails with
  `ERR_UNKNOWN_FILE_EXTENSION`.
- npm. The repository commits `package-lock.json`; please do not switch package managers.

The repository pins a version in `.nvmrc`:

```bash
nvm use
```

## Setup

```bash
git clone https://github.com/hamid-veganhomecooks/community-food-group.git
cd community-food-group
nvm use
npm ci
```

Optionally, configure the Mastodon feed:

```bash
cp .env.example .env
# then edit .env
```

## Commands

All commands run from the project root.

| Command | Action |
| --- | --- |
| `npm run dev` | Start the development server at `localhost:4321` |
| `npm run check` | Run `astro check` for type and content validation |
| `npm run build` | Fetch Mastodon posts, then build to `dist/` |
| `npm run preview` | Preview the built site locally |
| `npm run fetch-mastodon` | Refresh the Mastodon cache without building |

`npm run build` runs `prebuild` first, which runs `fetch-mastodon`. A build with no Mastodon
account configured succeeds; see below.

## Mastodon feed

Posts are fetched **at build time only** and cached in `src/data/mastodon-posts.json`. The
browser never contacts a Mastodon instance.

Configuration, both optional:

| Variable | Meaning |
| --- | --- |
| `MASTODON_ACCOUNT` | The account in `user@instance` form. A leading `@` is accepted. Blank or unset disables the feed. |
| `MASTODON_POST_LIMIT` | Whole number from 1 to 40. Defaults to 20. |

Behaviour:

- **No account configured** is a supported state, not an error. The fetch step reports that
  it is skipping, leaves any existing cache untouched, and exits successfully. A fresh clone
  with no configuration builds fine.
- **A configured account that fails to fetch** exits non-zero and leaves the existing cache
  untouched, so a network problem cannot silently replace good data with an empty feed.
- Requests time out after 15 seconds so a stalled instance cannot hang a deployment.
- `MASTODON_POST_LIMIT` is validated before anything else, so an invalid value fails loudly
  whether or not an account is configured.

`npm run fetch-mastodon` loads `.env` when present, via `--env-file-if-exists`.

## Canonical site URL

`astro.config.mjs` does not hardcode a domain, because no production URL has been confirmed
for this project. To emit absolute URLs, set `SITE_URL`:

```bash
SITE_URL=https://example.org npm run build
```

`SITE_URL` must come from the process environment. Astro evaluates `astro.config.mjs` before
it loads `.env`, so putting `SITE_URL` in `.env` will not work. In deployment, set it as an
environment variable.

## Project structure

```text
scripts/fetch-mastodon.ts   Build-time Mastodon ingestion
scripts/check-contrast.mjs  WCAG 2.2 AA check for the colour tokens
src/content.config.ts       Content collection definition
src/content/pages/          Editorial MDX: about, join, donate
src/data/                   Location records and the generated Mastodon cache
src/pages/                  Routes
src/components/             Header, Footer, MastodonFeed
src/layouts/BaseLayout.astro
src/styles/global.css
```

## Rebranding this site

This repository is a template plus one group's instance of it. Adopting it for another group
means editing four documented surfaces, and nothing else:

| Surface | What you edit |
| --- | --- |
| `site.config.ts` | Identity constants: group name, tagline, city, contact, social accounts |
| `:root` brand inputs in `src/styles/global.css` | Fourteen colour values (below) |
| `src/data/locations.json` | Replace the records wholesale with your own |
| `src/content/pages/*.mdx` | Rewrite the prose wholesale |

### 1. `site.config.ts` - identity

A typed config file at the repository root holding this group's identity constants: name,
tagline, city, region, domain, contact email, and social accounts. Every template reads it
instead of hardcoding a name, so `npm run check` (TypeScript) catches a missing or
mistyped field.

A field you have not filled in yet holds a placeholder **token** instead of a guess -
`SCREAMING_SNAKE_CASE`, matching `/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/`, e.g. `GROUP_NAME` or
`GROUP_DOMAIN`. A token is unmistakably unfilled, even to a non-technical reader looking at a
preview - never a plausible-looking guess like `example.com`.

```bash
npm run check:config
```

Scans `site.config.ts` and every file under `src/` for that pattern and exits non-zero,
naming each hit's file, line, and surrounding text, while any token remains. Fill every field
with a real value (or `null`, for a field you're deliberately not using - see the comment on
`social.signal` in `site.config.ts` for an example) and it exits 0. It is part of `npm run
verify`.

### 2. Colour

Colour is a two-layer token system in `src/styles/global.css`. A reusing group only ever
edits **Layer 1**; every template consumes only **Layer 2**.

### Layer 1 - brand inputs

A `:root` block near the top of the file, named outside Tailwind's `--color-*` namespace on
purpose (`--brand-*`, `--neutral-*`) so it never generates its own utility classes. Fourteen
values in two groups:

- **Six brand/accent tones** - the colours an actual rebrand changes: the brand hue and its
  hover/text variants, and the accent hue and its text/soft variants.
- **Eight neutrals** - surfaces and ink tones. Most groups reusing this site will leave these
  alone; they exist to be edited only if the whole visual register (not just the brand hue)
  needs to change.

Edit these fourteen values and every semantic role updates with them, because Layer 2 is
built entirely out of `var()` references into Layer 1.

### Layer 2 - semantic roles

The `@theme` block's `--color-*` custom properties. This is the **only** thing a template may
write - `bg-brand`, `text-ink-muted`, `border-focus`, and so on. No component or page file
should ever contain a literal hex value or a colour name like `terracotta` or `sage`; if one
does, that is the bug this token system exists to prevent.

| Role | Purpose |
| --- | --- |
| `surface`, `surface-raised`, `surface-sunken`, `surface-inverse` | Page background, card background, a slightly recessed panel, and the dark footer background |
| `ink`, `ink-muted`, `ink-inverse`, `ink-inverse-muted` | Body text, de-emphasised text, and their counterparts for text on a dark surface |
| `brand`, `brand-hover`, `brand-ink` | The lead colour: fill, its hover/pressed fill, and its text-safe variant |
| `accent`, `accent-ink`, `accent-soft` | The supporting colour: its text-safe variant, and a pale fill for chips |
| `border` | Decorative dividers and input borders |
| `focus` | The visible focus ring on every interactive element |

**Why `brand` and `brand-ink` are separate roles, not one:** `brand` is tuned to look right as
a *fill* - a button background, a gradient. `brand-ink` is tuned to pass AA as *text on a
light surface*. A colour that reads well as a large fill is very often too light to pass 4.5:1
as text, and that gap is exactly how the previous palette failed nine measured contrast pairs
(`text-terracotta` alone accounted for 23 uses, several of them failing). Collapsing the two
roles back into one hex value would silently reintroduce that failure. The same reasoning is
why `accent` and `accent-ink` are kept apart.

### Checking your rebrand

```bash
npm run check:contrast
```

Parses the tokens directly out of `global.css` - it does not carry a second, duplicate colour
list that could drift from what ships - and checks all sixteen role pairs actually used by the
templates against WCAG 2.2 AA (4.5:1 for text, 3.0:1 for the focus ring). It prints a measured
ratio for every pair and exits non-zero, naming the failing pair, if a new brand value drops
below threshold.

### 3. `src/data/locations.json` - locations

Where the group cooks and where it hands out food, plus any other named locations. This
group's records describe real places in Tucson, Arizona and are not sample data - replace the
records wholesale with your own rather than editing them in place.

### 4. `src/content/pages/*.mdx` - editorial prose

`about.mdx`, `join.mdx`, and `donate.mdx`. **This prose is rewritten, not tokenized.** A group
in another city does not need this group's sentences with a name swapped in - they have a
different model, different programs, and no rented garden plot at a specific address. Do not
add config interpolation (`{siteConfig.groupName}` and similar) into these documents: a
sentence that needs a token to make sense belongs to the adopting group, not to the template.
Write your own copy describing your own group.

## Typography and spacing

Tailwind 4 is configured in CSS. There is no `tailwind.config.mjs` and recreating one will
not work. Everything below is declared as `@theme` custom properties in
`src/styles/global.css`, so a template names a token instead of inventing a value.

### Type scale

Steps are semantic, not t-shirt sizes, and each one is fluid: a `clamp()` interpolates
between roughly a 320px and a 1200px viewport. **Write one class, not a breakpoint chain.**
`text-title` replaces `text-4xl md:text-5xl lg:text-6xl`. Reaching for a breakpoint variant
on a step means the scale is wrong, not that the page is special.

| Token | Class | 375px | 1440px | Used for |
| --- | --- | --- | --- | --- |
| `--text-display` | `text-display` | 40px | 64px | The home hero `h1`, once per site |
| `--text-title` | `text-title` | 32px | 48px | Interior page `h1` |
| `--text-heading` | `text-heading` | 26px | 36px | Section `h2` |
| `--text-subheading` | `text-subheading` | 20px | 24px | Card and sub-section headings |
| `--text-lead` | `text-lead` | 18px | 21px | Standfirst paragraph under a heading |
| `--text-body` | `text-body` | 17px | 17px | Body copy; also the `body` default |
| `--text-label` | `text-label` | 14px | 14px | Small UI labels, chips, metadata |

Line height and letter spacing travel with each size. Font weight deliberately does not, so
a heading can be re-weighted without leaving the scale.

### Vertical rhythm

| Token | Class | 375px | 1440px | Used for |
| --- | --- | --- | --- | --- |
| `--spacing-section-lg` | `.section-lg` | 68px | 144px | Hero bands |
| `--spacing-section` | `.section` | 51px | 96px | Standard page bands |
| `--spacing-section-tight` | `.section-tight` | 34px | 56px | Closing or secondary bands |
| `--spacing-stack` | `mt-stack`, `gap-stack` | 24px | 40px | Between blocks in a section |
| `--spacing-stack-sm` | `mt-stack-sm` | 16px | 24px | Between tightly related blocks |
| `--spacing-gutter` | `p-gutter` | 26px | 48px | Card inner padding |

The three `.section*` classes are **mutually exclusive**; a band picks one. They exist so
consecutive sections can differ, rather than stacking as identical bands.

### Measure

`--container-measure` (39rem) is the reading width for running body copy, about **69
characters** at the `prose-lg` size, measured in a browser rather than estimated. It is
deliberately far narrower than `.container`, which is a layout width and not a measure.

The card and the measure are separate concerns. `.prose-card` sizes itself to
`measure + 2 * gutter`, so the reading width stays constant however the padding scales.
`max-w-lede` (42rem) is the slightly wider width for standfirst paragraphs.

### Prose

`@tailwindcss/typography` is registered with `@plugin` in `src/styles/global.css`.

**The `.prose` customization is deliberately declared outside any cascade layer, and must
stay there.** The plugin registers `prose` in the **utilities** layer, not the components
layer, so a `.prose` override placed inside `@layer components` loses on layer order no
matter its specificity, and silently does nothing. This was verified against the compiled
stylesheet. The same fact is why one `.prose` block also governs `prose-lg`.

`.container` is unlayered for the same class of reason. Do not move either into a layer.

Headings inside prose get generous space above and tight space below, so a heading groups
with the text it introduces instead of floating midway between two blocks.

### Heading case convention

- **Title Case** for page titles (`h1`) and section headings (`h2`).
- **Sentence case** for sub-headings (`h3` and below), UI labels, buttons, and links.

Headings inside the MDX documents still mix both. They are brought into line in Task 005,
which rewrites that copy anyway.

## Known gaps

Recorded so they are not mistaken for finished work. Details and sequencing are in
`ROADMAP.md`.

- `public/` is empty, so the favicon and social preview image referenced by the layout
  return 404.
- `MastodonFeed.astro` renders post HTML as escaped text, which would display literal markup
  once the cache is populated. Tracked as Task 006.
- Accessibility is a project **target**, not a verified state. No audit has been run and no
  conformance is claimed. Task 002 did measure heading structure in a browser - every route
  has exactly one `h1` and none skips a level - but that is one check, not an audit.
  `Header.astro` still applies application-menu ARIA roles to ordinary site navigation.
- There is no CI, test suite, linter, or formatter.
- No deployment exists. Cloudflare Pages has not been configured.

## Licence

Dedicated to the public domain under [CC0 1.0 Universal](LICENSE). No attribution is required
and no use is restricted. Fork it, change it, deploy it - nothing is asked in return.

Three things CC0 does not cover, because they were never this project's to give:

- **The group's name and identity.** CC0 waives copyright, not trademark. A fork should
  publish under its own name rather than this one.
- **The Inter typeface.** Inter is licensed under the
  [SIL Open Font License 1.1](https://github.com/rsms/inter). It is fetched at build time and
  emitted into `dist/`, so a deployed fork redistributes it. Bundling and redistributing the
  font with a site is expressly permitted, but the OFL notice travels with it, and a modified
  font may not keep the reserved name "Inter".
- **The truthfulness of the page copy.** The prose in `src/content/pages/` describes a
  specific real group, including a rented plot at a garden operated by another organization.
  You are free to copy it, but publishing it unchanged would make false claims about your own
  group. Rewrite it - see [Rebranding this site](#rebranding-this-site).
