# TASK SPECIFICATION

## Task 004b : Site config and the fork-and-adopt surface

### Role

`IMPLEMENTER`

### Status

**ACTIVE.** Promoted 2026-07-31 by an `ARCHITECT` session. This document is the only
authority on this task's scope and acceptance. Its planned scope has been **cut** from
`ROADMAP.md`, whose entry is now a status line pointing here.

Task 004 is complete and merged to `main` as `15dd164`; the working tree is clean. Tasks 001,
001b, 001c, 002, 003 and 004c are also complete and merged. Nothing in Task 004's former spec
body survives in this file - see `PROJECT_CONTEXT.md` section 4 for its verification record.

### Goal

Collapse this group's identity constants into one typed config file, replace every hardcoded
occurrence with a config read, and ship a zero-dependency validator that fails the build while
any owner-fill token remains unfilled.

This is the first of the four adoption surfaces in `PROJECT_CONTEXT.md` section 2, and it is
also a **live constraint 1 fix**: the site currently ships a plausible-sounding invented
organization name in its `<title>`, its copyright notice, and its Open Graph metadata.

---

## Why this is not a refactor

Constraint 1 permits owner-fill tokens as the *one* exception to zero invented facts, and
draws the line precisely: a visible `GROUP_NAME` token is **honest absence**, a plausible
invented name is **dishonest presence**. Only the first is ever acceptable.

The repository currently sits on the wrong side of that line. `"Community Food Group"` is not
a token and was never an owner input - it is scaffold text that reads as a real decision. It
is in the `<title>` of all six routes, in the copyright line, and in `og:description`.

**Why config rather than hardcoding real values and rebranding later.** Find-and-replace
rebranding is *unverifiable*. There is no build-time assertion that every occurrence was
caught, and the missed one will be in an `og:description` or an `aria-label` rather than in an
`h1` where someone would notice.

That is not hypothetical. **The `ROADMAP.md` entry this task was promoted from enumerated
seven occurrences in six files while claiming a total of nine, and the two it missed were an
`aria-label` and an MDX heading** - exactly the failure mode it was describing. The correct
inventory is below, derived by grep rather than from that entry.

---

## Verified starting conditions

Confirmed by reading the repository on 2026-07-31, after Task 004 was merged. If any has
changed, stop and report the mismatch rather than adapting silently.

### The real inventory: 9 occurrences across 7 files

`grep -rn 'Community Food Group' src/`:

| File | Line | Occurrence | In scope? |
| --- | --- | --- | --- |
| `src/components/Header.astro` | 8 | `aria-label="Community Food Group Home"` | Yes |
| `src/components/Header.astro` | 10 | Visible wordmark `<span>` | Yes |
| `src/components/Footer.astro` | 6 | `<h3>` footer heading | Yes |
| `src/components/Footer.astro` | 52 | Copyright line | Yes |
| `src/layouts/BaseLayout.astro` | 15 | `const siteTitle` | Yes |
| `src/content.config.ts` | 18 | `author` schema default | Yes |
| `src/pages/index.astro` | 9 | `description` prop | Yes |
| `src/components/MastodonFeed.astro` | 47 | Display-name fallback | Yes |
| `src/content/pages/about.mdx` | 9 | `# About Our Community Food Group` | **No - Task 005** |

**Eight of the nine are in scope. The ninth is MDX prose and must be left alone** - see the
scope fence below. `GROUP NAME` appears zero times anywhere.

### The invented tagline is a second constraint 1 violation, and it is metadata

Surfaced at promotion, not present in the roadmap entry. `"Building food security through
community action"` appears three times:

- `src/layouts/BaseLayout.astro:17` - the `metaDescription` default, which feeds
  `<meta name="description">`, `og:description` and `twitter:description` on every route that
  does not override it. **Chrome. In scope.**
- `src/pages/index.astro:9` - concatenated with the group name in the `description` prop.
  **Chrome. In scope.**
- `src/components/Footer.astro:8` - the opening clause of a two-sentence footer blurb.
  **Prose. Out of scope, Task 005.**

Section 2 lists "OG and Twitter metadata" as config-driven chrome explicitly. An adopting fork
inheriting this group's positioning statement in its social cards is the same defect as
inheriting its name.

**The trap:** the same words appear in a file this task edits (`Footer.astro`) in a role this
task must not touch. Tokenize the metadata; leave the footer sentence exactly as it is.

### Other verified facts

- **Root-level `.ts` files are type-checked.** `tsconfig.json` extends
  `astro/tsconfigs/strict`, whose base sets `"include": ["${configDir}/.astro/types.d.ts",
  "${configDir}/**/*"]` and excludes only `dist`. A `site.config.ts` at the repository root is
  therefore covered by `npm run check` with no `tsconfig.json` edit. **Do not edit
  `tsconfig.json`.**
- **`verbatimModuleSyntax` is `true`.** Importing the interface requires
  `import type { SiteConfig } from '...'`. A value-position import of a type will fail
  `npm run check`. This is the most likely way to spend an hour on this task.
- `scripts/verify-baseline.sh` has an **uncached** half that now runs `npm run check`,
  `npm run check:contrast`, and `npm run build`, in that order. Task 004 wired
  `check:contrast` in. The cache key is `package-lock.json` + `package.json` + the Node
  version; read the comment at the top of the script before editing it.
- `scripts/check-contrast.mjs` is the zero-dependency precedent to copy in shape: it parses
  the real tokens out of source rather than duplicating a list.
- `README.md` has **exactly one** `## Rebranding this site` section, at line 115, with three
  `###` subsections (`Layer 1 - brand inputs`, `Layer 2 - semantic roles`, `Checking your
  rebrand`). It documents colour only.
- **`README.md:1` is `# Community Food Group`** - the invented name titling the template's own
  documentation. In scope; see required change 6.
- `package.json` already carries `check:contrast`. Add `check:config` beside it.
- The owner inputs relevant here are all still open: the organization name and the domain are
  deferred, the Mastodon handle is required before Task 006. **The city and region are
  answered** - Tucson, Arizona - and the `CITY` token is retired.

---

## Allowed scope

- `site.config.ts` - **new**, at the repository root
- `scripts/check-config.mjs` - **new**
- `scripts/verify-baseline.sh` - **to add `check:config` to the uncached half only**
- `package.json` - **to add the `check:config` script only**
- `src/components/Header.astro`
- `src/components/Footer.astro` - **the two name occurrences and the mailto only**
- `src/layouts/BaseLayout.astro`
- `src/content.config.ts` - **the `author` default only**
- `src/pages/index.astro` - **the `description` prop only**
- `src/components/MastodonFeed.astro` - **the display-name fallback only**
- `README.md` - **the title, the intro sentence, and the rebranding section only**

**Explicitly out of scope**, despite touching some of the same files:

- **`src/content/pages/*.mdx`, including `about.mdx:9`.** Section 2 forbids interpolating
  config into prose. The invented name in that heading is **Task 005's**, and it is the one
  occurrence this task deliberately leaves behind.
- **The `Footer.astro:8` blurb.** Prose. Task 005.
- `src/data/locations.json` and every other page copy. **Task 005.**
- Any colour token, the type scale, the spacing rhythm, the unlayered `.container` / `.prose`.
- The accessibility work from Task 004. Do not re-derive it, do not "improve" it.
- `tsconfig.json`, `astro.config.mjs`.
- Filling `GROUP_NAME`, `GROUP_DOMAIN`, `GROUP_TAGLINE` or `MASTODON_HANDLE` with real values.
  **All are open owner inputs.**
- The zod deprecation and CI. **Task 009.**
- `CONTRIBUTING.md`. A real gap, recorded in section 2, but not this task.

---

## Required changes

### 1. Normalize the token vocabulary to `SCREAMING_SNAKE_CASE`

The project currently uses **two** token spellings: `GROUP NAME` with a space, and
`GROUP_DOMAIN` with an underscore. Section 4 requires that every token be greppable by **one**
documented pattern, and no single sane regex matches both.

**`GROUP NAME` becomes `GROUP_NAME`.** The documented pattern is:

```
/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g
```

One uppercase run, at least one underscore, no spaces. `GROUP_DOMAIN` already conforms.
This pattern is the contract between the tokens and `check-config.mjs`; state it in `README.md`
and use the same literal in the script.

### 2. Create `site.config.ts`

At the repository root, holding **only** identity constants. Typed with an exported interface
and `as const satisfies SiteConfig`, so `npm run check` validates it at build with **zero new
dependencies**. This deliberately avoids the zod decision still open in Task 009.

The shape, which you may adjust in detail but not in kind:

```ts
export interface SocialAccount {
  handle: string;
  url: string;
}

export interface SiteConfig {
  groupName: string;
  tagline: string | null;
  city: string;
  region: string;
  domain: string;
  contactEmail: string;
  social: {
    mastodon: SocialAccount | null;
    signal: SocialAccount | null;
  };
}
```

Fill it with today's truth, not with placeholders everywhere: **`city` is `'Tucson'` and
`region` is `'Arizona'`**, because those are answered. The rest carry tokens.

**`contactEmail` is an explicit field, not derived from `domain`.** A computed
`` `info@${domain}` `` would construct the token at runtime and hide it from a source-text
scan, which is precisely the guard this task exists to build. Write the literal
`'info@GROUP_DOMAIN'`.

### 3. Model absence in the type, and distinguish it from unknown

This is the part most likely to be got subtly wrong, and the roadmap entry left it unresolved.

A social account is `SocialAccount | null`. **`null` means *this group has chosen not to have
one*. It does not mean *unknown, awaiting a value*.** Section 4 warns that a future session
must not "helpfully" add a chat link; a type with no third state makes that structural rather
than advisory.

The two states of the type carry three real states of the world, and the token system supplies
the third:

| World state | Representation | Caught by `check:config`? |
| --- | --- | --- |
| Known and present | `{ handle: '@group@instance', url: 'https://...' }` | No |
| **Unknown, awaiting owner input** | `{ handle: 'MASTODON_HANDLE', url: 'MASTODON_URL' }` | **Yes** |
| Deliberately absent, by decision | `null` | No |

So today: **`mastodon` carries tokens** - the handle is an open owner input, and writing `null`
there would encode a decision the owner has not made. **`signal` is `null`** - the owner
withdrew the chat link on 2026-07-30, and that is a decision. Comment the `signal: null` with
its date so the next session reads it as settled rather than missing.

Apply the same rule to `tagline`: it is `'GROUP_TAGLINE'` today because it is unknown. If the
owner later answers "the group name alone, no tagline", it becomes `null`.

### 4. Replace all eight in-scope occurrences with config reads

In `Header.astro` (both the `aria-label` and the wordmark), `Footer.astro` (heading and
copyright), `BaseLayout.astro` (`siteTitle` and `metaDescription`), `content.config.ts`
(`author` default), `index.astro` (`description`), and `MastodonFeed.astro` (fallback).

The name becomes the `GROUP_NAME` token **in one place**.

Two notes:

- `BaseLayout.astro`'s `metaDescription` default becomes the tagline from config. Handle
  `tagline: null` without emitting the string `"null"` into a `<meta>` tag - fall back to the
  group name, or omit the tag.
- `index.astro`'s description duplicates what `BaseLayout` can now derive. Prefer deleting the
  prop over rebuilding the same string at the call site.

### 5. Create `scripts/check-config.mjs`

Wired as `npm run check:config`, added to the **uncached** half of `verify-baseline.sh`
alongside `check:contrast`, and to `package.json`. Zero dependencies, same shape as the
contrast script.

- Scan the **source text** of `site.config.ts` for tokens matching the pattern in change 1.
- Also scan `src/` for the same pattern, to catch a token that leaked back into a component.
  Cheap, and it is what makes the "only file with an unfilled token" invariant enforceable
  rather than aspirational.
- Print each hit with its file, line, and the field it sits in. Exit non-zero if any remain.
- **Prove it fails before declaring it works.** A validator never seen to fail is not yet a
  validator. Also prove it *passes*: temporarily fill every token, watch it exit 0, then revert.
  Both directions, or you have tested nothing.

Guard against the obvious false positive: the pattern will match ordinary uppercase constants
if you point it at the wrong files. Scanning `site.config.ts` plus `src/` keeps the surface
small; if a legitimate identifier trips it, narrow the scan, do not weaken the pattern.

### 6. Retitle `README.md` and broaden the rebranding section

`README.md:1` currently reads `# Community Food Group`, which titles the *template's*
documentation after one group. Retitle it to describe what the repository is - a mutual aid
group's site, template plus one instance - and say in one sentence that it is adopted by
forking. **Do not put a token in the `<h1>` of the README**; the README describes the
repository, and the repository is not the group.

**Broaden the existing `## Rebranding this site` section** into the four adoption surfaces
from section 2. Colour becomes one of four, not a competing section - **do not add a second
rebranding heading**, and do not delete the Layer 1 / Layer 2 material, which is correct and
was verified in Task 003.

State plainly which surfaces an adopter edits, document the token pattern from change 1, and
state that **prose is rewritten rather than tokenized**, so a forking group does not try to
parameterize the MDX and ship mad-libs.

---

## Acceptance criteria

Every criterion is executed, not inspected. Constraint 3.10 forbids reporting success from a
diff.

1. `npm run check` reports **0 errors** (12 zod hints remain expected). Then prove the config
   is genuinely type-checked: introduce a deliberately wrong field, watch `npm run check`
   fail, revert. Paste both results.
2. `npm run verify` exits 0 **except** for `check:config`, which must exit non-zero - see
   criterion 4. Confirm `check:config` runs in the uncached half by touching only
   `site.config.ts` and watching it re-run on a dependency-cache hit.
3. `grep -rn 'Community Food Group' src/` returns **exactly one** line:
   `src/content/pages/about.mdx:9`. Paste the result. **Any other survivor is a failure; that
   one is required to survive.**
4. `npm run check:config` **exits non-zero**, and its output names `GROUP_NAME`,
   `GROUP_TAGLINE`, `GROUP_DOMAIN` and the Mastodon tokens with their locations. **This task
   ships with the check failing on purpose**, because those facts genuinely are not known.
   **Do not weaken the check to make it pass, and do not fill a token to make it green.**
5. `npm run check:config` exits **0** when every token is temporarily filled. Paste the result,
   then confirm the revert.
6. `grep -rn 'GROUP NAME' src/ site.config.ts` returns nothing - the space-spelled token is
   retired from all source. It **does** still appear in `PROJECT_CONTEXT.md`, `ROADMAP.md` and
   this file, in prose recording its retirement; that is correct and must not be "fixed".
7. `site.config.ts` is the only file in the repository containing an unfilled identity token,
   apart from documentation that describes the token system itself.
8. `npm run build` emits the same **six** routes, and the rendered `<title>`, `<meta
   name="description">`, `og:description`, header and footer show the **token**, not an
   invented name. Confirm in `dist/`, not in the source.
9. `npm run check:contrast` still exits 0 with all sixteen pairs passing. This task must not
   move a colour.
10. The Task 004 accessibility work is intact: `grep -rn 'role="menubar"\|role="menuitem"\|role="none"' src/`
    and `grep -rn 'href="#"' src/` both still return nothing, and the `:focus-visible` rule and
    `prefers-reduced-motion` block in `global.css` are byte-for-byte unchanged.
11. The Task 002 type scale, the spacing tokens, and the **unlayered** `.container` and
    `.prose` blocks are byte-for-byte unchanged. Confirm by targeted diff.
12. `README.md` has exactly one rebranding section, covering four surfaces, and its `<h1>` no
    longer names this group.

A browser pass is **not** required for this task. It changes no layout, no colour, and no
interactive behaviour. If you find yourself needing one, you have left the scope.

---

## Reviewer focus

- Whether the invented name reached `dist/` anywhere. Grep the built HTML, not the source.
- Whether `about.mdx:9` was "helpfully" fixed. It must survive; fixing it means either
  interpolating config into prose or rewriting Task 005's copy, and both are out of scope.
- Whether the `Footer.astro:8` blurb was rewritten. It must not be.
- Whether `mastodon` was set to `null`. It must carry tokens - `null` would assert a decision
  the owner has not made.
- Whether `contactEmail` was derived from `domain` rather than written literally, which would
  hide the token from the scan.
- Whether `check:config` was ever **seen to fail**, and separately **seen to pass**. A pasted
  green run alone does not establish either.
- Whether the check was weakened, or a token filled with a plausible value, to make `verify`
  fully green. The correct end state is a red `check:config`.
- Whether `check:config` landed in the **uncached** half of `verify-baseline.sh`.
- Whether a second rebranding heading appeared in `README.md`.
- Whether `tsconfig.json` or `astro.config.mjs` were touched. Neither should be.

---

## Out of scope / queued work

**Task 005 follows this task.** It is Track B and remains blocked on **exactly one** owner
input: the organization name, in the `PROJECT_CONTEXT.md` section 4 table. This task does not
resolve that - it moves the name into one config field rather than eight, but Task 005's prose
still has to be written knowing what the group is called.

Nothing else blocks Task 005. The contact route, the geographic scope (Tucson, Arizona) and
the garden are all settled; the garden is a **schema** change to `locations.json`, not a values
change. See `ROADMAP.md`.

**This task surfaces one new owner input**, recorded in `PROJECT_CONTEXT.md` section 4: the
tagline, or a decision that there is none. It does not block Task 005.

**Task 009 inherits `check:config`** as the mechanical half of its pre-publication check. What
remains there is the judgement half - fabricated data that is not a token and therefore cannot
be caught by a pattern. `about.mdx:9` is a live example of exactly that.
