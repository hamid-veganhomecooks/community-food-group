# Community Food Group

Public information site for a local mutual aid group that cooks together and distributes
food directly to neighbours.

Built with Astro 5, Tailwind CSS 3, and MDX. Static output, intended for Cloudflare Pages.

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
src/content.config.ts       Content collection definition
src/content/pages/          Editorial MDX: about, join, donate
src/data/                   Location records and the generated Mastodon cache
src/pages/                  Routes
src/components/             Header, Footer, MastodonFeed
src/layouts/BaseLayout.astro
src/styles/global.css
```

## Known gaps

Recorded so they are not mistaken for finished work. Details and sequencing are in
`ROADMAP.md`.

- **Editorial pages render with no spacing.** The routes reference `prose` classes but
  `@tailwindcss/typography` is not installed, so paragraphs and headings have no margins and
  lists have no markers. Tracked as Task 002.
- `public/` is empty, so the favicon and social preview image referenced by the layout
  return 404.
- `MastodonFeed.astro` renders post HTML as escaped text, which would display literal markup
  once the cache is populated. Tracked as Task 006.
- Accessibility is a project **target**, not a verified state. No audit has been run and no
  conformance is claimed.
- There is no CI, test suite, linter, or formatter.
- No deployment exists. Cloudflare Pages has not been configured.

## Licence

Not yet chosen.
