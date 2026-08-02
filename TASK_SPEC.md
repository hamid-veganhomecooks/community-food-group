# TASK SPECIFICATION

## Task 006a : Fix the Mastodon feed, no account required

### Role

`IMPLEMENTER`

### Status

**ACTIVE.** Promoted 2026-08-01 by an `ARCHITECT` session. This document is the only authority
on scope and acceptance. The scope was **cut** from `ROADMAP.md`, whose entry now points here.

**Nothing of Task 004d, 009a or the 008a remainder survives in this file.** All three are complete,
committed as `a0433d5`, and their verification record is in `docs/DECISIONS_ARCHIVE.md` under
`## Verification history`.

### Why this task needs no Mastodon account

Every correctness problem below is verifiable against a **seeded cache**. That is not a workaround
- it is how the rendering defect was *proven* in the first place, on 2026-07-30, by writing one
fake post into `src/data/mastodon-posts.json` and building.

`src/data/mastodon-posts.json` is `[]` today and `MASTODON_ACCOUNT` is unset, **so every claim ever
made about this feature has been made against an empty array.** The render path has never run.

**The account is not coming soon and that is deliberate.** A name change is anticipated, and a
Mastodon handle is the one identifier in this project that is *not* a one-line config edit.
Registering one now locks in the thing the owner expects to change. Wiring the real account is
Task 006b.

---

## Verified starting conditions

Confirmed by execution on 2026-08-01, Node v22.23.2, at `a0433d5` on branch
`task/005b-content-consolidation`, working tree clean. **If any has changed, stop and report
rather than adapting.**

| Check | Observed |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings, **1 hint** - `z.string().url()` at `src/content.config.ts:61`. **Not 21.** The 21-hint baseline is dead |
| `npm run check:contrast` | exits 0, all **sixteen** role pairs pass |
| `npm run check:config` | **exits 1**, naming **exactly 2** tokens - `MASTODON_HANDLE`, `MASTODON_URL`, both `site.config.ts:99` |
| `npm run check:dist` | **exits 0.** Scans 7 files in `dist/`, skips 2 binary assets |
| `npm run build` | **6** routes, exactly one `h1` each |
| `npm run verify` | **reaches `build`, runs `check:dist`, exits 0**, and says plainly that `check:config` is red |

**Grep-confirmed facts, established at promotion rather than taken from `ROADMAP.md`:**

- **`MastodonFeed.astro` is consumed in three places**: `src/pages/posts.astro:35`
  (`limit={20}`), `src/content/pages/home.mdx:27` (`limit={6}`), and it is handed to the home
  document from `src/pages/index.astro:27` via `<Content components={{ ... }} />`. **A prop or
  signature change touches all three.**
- **The cache is `[]`** and `MASTODON_ACCOUNT` is unset, so **the empty-state branch at
  `MastodonFeed.astro:104-106` is what renders on `/` and `/posts` right now.**
- **`ultrahtml@1.7.0` is on disk as a child of `astro@7.1.6`**, is not in `package.json`, has
  **zero dependencies of its own**, and ships an allowlist sanitizer at
  `ultrahtml/transformers/sanitize` with `allowElements` and `allowAttributes` options. See Part A.
- **`scripts/fetch-mastodon.ts` already narrows every untrusted field** through `asString` /
  `asCount` / `asMediaType`, drops malformed statuses rather than failing the build, and treats an
  unset `MASTODON_ACCOUNT` as success without overwriting an existing cache. **Preserve all three
  behaviours.**
- **`src/types/mastodon.ts` has no `emojis` field**, and `fetch-mastodon.ts` does not store one.
  See "Custom emoji" below - this is deliberate and stays that way in this task.
- `public/` **does not exist.**

---

# Part A - The HTML rendering defect

`src/components/MastodonFeed.astro:61` interpolates `post.content` - an HTML string - into a text
node. **Confirmed empirically on 2026-07-30, not predicted:** a seeded post containing `<p>` tags
built to `...not erased&lt;/p&gt;` in `dist/index.html`. Visitors would see literal `</p>`.

**[2026-08-01] The approach is DECIDED by the owner: sanitize to an allowlist, keeping links.**
The posts are image-first and carry links; plain-text conversion would discard them.

### Required

1. **Sanitize at build time, never in the browser.** Constraint 3.9 forbids browser-side Mastodon
   calls and constraint 3.8 forbids `set:html` on unsanitized input. Sanitized-at-build-time HTML
   rendered with `set:html` is the approved strategy constraint 3.8 refers to.
2. **The allowlist is `p`, `br`, `a`, `em`, `strong`.** Everything else is dropped. Elements not on
   the list should have their text content kept where that is the sanitizer's natural behaviour -
   losing a paragraph's words because it was wrapped in an unexpected tag is worse than losing the
   tag.
3. **`href` must be scheme-checked separately, and this is not optional.** An allowlist that
   permits the `href` attribute still permits `href="javascript:..."`. **Allow `http:`, `https:`
   and `mailto:` only; drop the whole attribute otherwise.** Verify this with a seeded post
   carrying a `javascript:` href and paste the result.
4. **Outbound links get `rel="noopener noreferrer"`** and, if they open in a new tab,
   `target="_blank"` - matching what `locations.astro:68-74` already does for the CGT link.

### The dependency

Constraint 3.6 requires an explicit architectural decision for a new package. **The owner approved
"a sanitizer dependency" on 2026-08-01**; the package itself was left open, and this is where it
gets chosen.

**Evaluate `ultrahtml` first.** It is already installed as a child of `astro@7.1.6`, has zero
dependencies of its own, and its `transformers/sanitize` export is an allowlist sanitizer.
Declaring it would **download nothing and ship no new code** - exactly the situation Task 009a
handled for `zod`, and the same reasoning applies.

- **If you use it, declare it**, with the range aligned to what Astro pulls, and confirm with
  `npm ls ultrahtml` that exactly one version resolves. **Never import from a package you have not
  declared** - that works only because npm happens to hoist it, and leaving that state is the
  whole point of the zod precedent.
- **If it turns out not to do the job, say exactly why, then use `sanitize-html`.** That is a
  genuine new package rather than a redeclared one; it is covered by the owner's 2026-08-01
  approval of a sanitizer, but **report the size and dependency count** so the tradeoff constraint
  3.6 exists to surface is actually visible.

### Custom emoji and mentions

- **Mentions arrive as `<a>` and are handled by the allowlist.** Nothing extra to do.
- **Custom emoji are OUT OF SCOPE, deliberately.** They arrive as `:shortcode:` text plus an
  `emojis[]` array on the status - and `src/types/mastodon.ts` has no such field, `fetch-mastodon.ts`
  does not store one, and **no real payload from this group's instance has ever been seen.**
  Building shortcode replacement now means building against a guessed payload shape, which is this
  project's most reliable way of shipping something wrong.

  **Leave shortcodes as literal text.** `:heart:` is readable; a broken `<img>` is not. **Task
  006b runs the first real ingestion** and is where the actual payload gets inspected against what
  this task assumed. Note it in your report.

---

# Part B - Stop hot-linking media, and stop hot-linking the avatar

**Every visitor's browser currently fetches images from the Mastodon instance.** That is precisely
what Task 003 eliminated when it moved Inter off the Google Fonts CDN so that **no visitor IP
reaches a third party**. Hot-linked media reintroduces it, and the owner's posts are image-first,
so it is most posts rather than an edge case. Hot-linked images also die when a post is deleted
upstream.

**There are TWO hot-links, not one.** `ROADMAP.md` named only the first:

| Line | What it is |
| --- | --- |
| `MastodonFeed.astro:68` | `src={media.preview_url \|\| media.url}` - the media attachments, up to four per post |
| **`MastodonFeed.astro:38`** | **`src={post.account.avatar}` - the account avatar, on EVERY post** |

**Fixing one and not the other leaves the privacy property broken on every post rather than on
some.** Both are in scope.

### Required

Fetch both at build time and serve them from this site's own origin. `scripts/fetch-mastodon.ts`
already runs at build time through the `prebuild` hook, which is the natural place.

**Four constraints, all of them hard:**

1. **A build with no network, no account, or an empty cache must still succeed.** That is the
   state the repository is in today and the state CI will be in. The media step must be inert when
   there is nothing to fetch.
2. **An image that cannot be fetched must fail honestly, not silently fall back to the third-party
   URL.** A fallback that hot-links under failure is the defect, still present, with a longer code
   path in front of it.
3. **Never fetch at request time and never from the browser.** Constraint 3.9.
4. **`public/` does not exist.** If you create it, say so - and **be explicit in your report that
   this does NOT resolve Task 007a.** The favicon and OG image are still absent and still need an
   owner input. A future session must not read "`public/` exists now" as that gap being closed.

### Two decisions this task makes, and must report with reasons

**Neither has an obviously right answer, so decide them from what you observe and state the
tradeoff. Do not guess quietly.**

- **Where downloaded media lands**, and whether it is committed or git-ignored.
  `src/data/mastodon-posts.json` **is** committed today, so committing media is the consistent
  choice - at the cost of repository size on an image-first feed. Git-ignoring is smaller, but
  then a clone that builds without network has a cache full of posts whose images are gone, which
  interacts directly with constraint 2 above. **Say which you chose and why.**
- **How a downloaded file is named.** It must be stable across builds - a name that changes every
  build makes every deploy a full asset re-upload - and it must not be attacker-controlled. The
  media `id` and `url` both come from an untrusted API response. **Do not interpolate a remote
  string into a filesystem path without constraining it.**

### Note for `check:dist`

`scripts/check-dist.mjs` **denylists** binary formats rather than allowlisting text ones,
deliberately, so anything new is scanned by default. `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`,
`.avif` are already on the denylist. **If you emit an image format that is not** - or any
sidecar text file - **`check:dist` will scan it, and that is the intended behaviour.** Do not add
to the denylist to make a scan quiet; report it instead.

---

# Part C - The alt-text fallback

`MastodonFeed.astro:69` falls back to `'Post attachment'`, which describes nothing. **Because the
information in these posts lives in the image** - announcements, community notices, garden
pictures - a screen-reader user gets a bare "Post attachment" where a sighted user gets the whole
announcement. Accessibility is a release requirement in this project, not an enhancement
(constraint 3.7).

**Half of this fix is not code.** Mastodon supplies `media.description` only when the poster wrote
alt text. **The site must not invent a description for an image it has never seen** - that is
constraint 3.1, and it is the same rule that governs addresses and phone numbers.

### Required

- **Where a description exists, use it.** Unchanged.
- **Where it does not, handle the absence honestly rather than papering over it with a generic
  string.** `alt=""` marks an image decorative, which is a *claim* - and one that is false for an
  image carrying an announcement. A non-empty generic string is equally false in the other
  direction. **Choose, and defend the choice in your report against both failure modes.**
- **Flag to the owner that alt text has to be written at post time on Mastodon.** No code change
  substitutes for it. Say so plainly in your report; it is the other half of the fix and it
  belongs to whoever posts.

---

# Part D - The two empty states

`MastodonFeed.astro:104-106` shows `No updates available at the moment. Please check back later!`
for **two different situations**: *the group has not posted*, and *no account is configured*. With
the account genuinely unconfigured, the second is the one that ships - **and it is what a visitor
sees on `/` and `/posts` right now.** The message tells them to check back for updates from an
account that does not exist.

`scripts/fetch-mastodon.ts` already knows the difference - it logs `MASTODON_ACCOUNT is not set;
skipping the Mastodon feed` - **but the component cannot see it**, because both situations arrive
as `[]`.

### Required

Render the two distinctly. **How you carry the signal is yours to decide**, and it is a real
design choice, not a formality.

### One trap, and it will look like a clean solution

**Do not write a literal token string into `src/` to test whether the handle is filled.**
`scripts/check-config.mjs` scans `src/` for the documented token pattern and **cannot tell "this
string is a token" from "this string is code comparing against a token."** A literal
`MASTODON_HANDLE` in `MastodonFeed.astro` would be reported as an unfilled owner input in a new
file, permanently.

**This exact trap has already bitten this project once**, on `site.config.ts`'s own doc comments
during Task 004b, and it was caught only by running the validator rather than reading the diff.

**Whatever you choose, run `npm run check:config` afterwards and confirm it still names exactly
two tokens, both in `site.config.ts`.** Three tokens means you hit it.

---

# Part E - The two `src/content.config.ts` residuals

**These are folded in here as a named, two-line exception to scope**, because both were left by
Task 009a - which was confined to line 1 of that file - and neither justifies a task of its own.
They are one edit in one file.

### Required

1. **`src/content.config.ts:61`**: `z.string().url()` -> `z.url()`. Clears the last `astro check`
   hint. **`z.url()` is the zod-v4 replacement; confirm it against the installed `zod@4.4.3`
   rather than assuming the spelling.**
2. **`src/content.config.ts:43-45`**: correct the comment. It currently says `z` "is the re-export
   from `astro:content`, not a direct `zod` import", that zod "is only a transitive dependency of
   astro today", and that taking it directly is "a separate, still-open decision". **All three
   have been untrue since Task 009a shipped.**

   **This is the one that matters.** A future session reading it would conclude the declaration
   was a mistake and revert a shipped owner decision. Replace it with what is true: `z` is
   imported from the declared `zod` dependency, the range is aligned with what Astro pulls so npm
   dedupes to one copy, and the reason is that `astro:content`'s re-export is deprecated and will
   eventually go.

### Forbidden

- **Nothing else in `src/content.config.ts` changes.** Not the schemas, not the `locations`
  discriminated union, not the `file()` loader, not the `author` default. Two edits, both above.
- **Do not "tidy" the surrounding comments.** The rest of that comment block records why exactly
  one union variant exists, and it is still true.

---

## Allowed scope

**New:** a directory for downloaded media, per Part B - path is your decision, report it.

**Modified:**

| File | Why |
| --- | --- |
| `src/components/MastodonFeed.astro` | Parts A, B, C, D - the whole task |
| `scripts/fetch-mastodon.ts` | Build-time sanitization and/or media download |
| `src/types/mastodon.ts` | Only if the cache shape changes |
| `src/data/mastodon-posts.json` | **Seeded fixture during verification only. Must end as `[]`** |
| `package.json`, `package-lock.json` | The sanitizer dependency |
| `src/content.config.ts` | **Lines 43-45 and 61 ONLY** - Part E |
| `.gitignore` | Only if downloaded media is ignored |
| `README.md` | Only if a command or a documented behaviour changed |
| `site.config.ts` | **Conditional - read the restriction below** |

### `site.config.ts` is in scope for ONE reason, under a hard restriction

`MastodonFeed.astro` holds user-visible strings - the empty-feed message, `View on Mastodon →`,
the `aria-label`s `Replies` / `Re-posts` / `Favorites` / `View original post on Mastodon`, the
`alt` fallback, and three emoji. **It is one of only two files where the project's "zero
user-visible copy in `.astro`" property is incomplete**, and an adopting group currently has to
open a template to change the empty-feed message.

**Lifting them into `site.config.ts` is authorized here** precisely because this task already
rewrites that component, and doing the lift separately would touch the file twice.

**The restriction, and it is absolute:**

- **Do not touch `social.mastodon`. Both tokens stay.** The handle is genuinely undecided.
- **Do not fill either token, do not guess a value, and do not write `null`.** `null` means
  *decided against*, which is a different world state and would permanently mislead the next
  session into thinking a settled question was answered.
- **`npm run check:config` must still exit non-zero naming exactly those two tokens** when you are
  done. A run where it went green has failed this task.

**Explicitly out of scope:**

- **`src/layouts/BaseLayout.astro`.** Its `Skip to main content` string is the *other* half of the
  incomplete-copy defect and stays open. It is not this component and folding it in buys nothing.
- **`src/pages/*.astro` and `src/content/pages/*.mdx`**, except that `posts.astro:35`,
  `home.mdx:27` and `index.astro:27` must keep working. **No copy changes** - the register pass is
  Task 005c and it is waiting on the feedback round.
- **`src/styles/global.css`**, the palette, the type scale, the rhythm.
- **`scripts/check-config.mjs`, `scripts/check-dist.mjs`, `scripts/verify-baseline.sh`.** All
  three were just built or rewired and their behaviour does not change.
- **`public/` favicon and OG image.** Task 007a, and it needs an owner input. Creating `public/`
  for media does not close it.
- **Metadata, canonical URLs, sitemap, `robots.txt`, `SITE_URL`.** Task 007.
- **Wiring a real account, `rel="me"`, filling the handle.** Task 006b.
- **A cache-staleness *mechanism*.** A static site shows whatever was cached at build time, so a
  feed can silently go months stale - that is real, and it is a **product** decision about how
  stale is too stale, on an account that does not exist yet. **Recommend a policy in your report;
  do not build one.**
- **`PROJECT_CONTEXT.md` and `ROADMAP.md`.** `ARCHITECT` and `MEMORY SYNC` documents. Report; do
  not write.

---

## Acceptance criteria

Executed, not inspected. Paste real output. **Every criterion touching `dist/` must use
`/usr/bin/grep`** - the shell wrapper honours `.gitignore` and `dist/` is ignored, so a criterion
that recurses from a non-ignored root passes vacuously otherwise.

**Part A**

1. With a cache seeded with a post containing `<p>`, `<a>`, `<em>` and a `<script>`, the built page
   shows **readable text, no visible tags, a working link, and no `<script>`**. Verified in
   `dist/`. Paste the seeded fixture and the relevant `dist/` output.
2. A seeded `href="javascript:alert(1)"` does **not** survive into `dist/`. Paste it.
3. `npm ls <sanitizer>` resolves exactly one version, and the package is declared in
   `package.json`. Paste it.

**Part B**

4. `/usr/bin/grep -rn 'preview_url\|account.avatar' dist/` returns **no third-party image URL**.
   With the cache seeded, no `<img src>` in `dist/` points at a Mastodon instance. Paste it.
5. **The build still succeeds with the cache `[]` and no network access for the media step.**
   Paste it. This is the state the repository ships in.
6. State where media is written, whether it is committed or ignored, and **how filenames are
   derived from untrusted input**.

**Part C**

7. State how a missing description is handled and defend it against **both** failure modes -
   falsely marking an informative image decorative, and asserting a description that does not
   exist.

**Part D**

8. The unconfigured state renders **distinctly** from the posted-nothing state. Show both.
9. **`npm run check:config` still exits non-zero naming exactly TWO tokens**, both
   `site.config.ts`. Paste it. **Three means you hit the literal-token trap.**

**Part E**

10. `npm run check` reports **0 errors, 0 warnings, 0 hints.** Paste the before and after - before
    is 1 hint, not 21.
11. `src/content.config.ts:43-45` no longer claims zod is undeclared. Paste the new comment.

**All parts**

12. `npm run build` still emits **six** routes with exactly one `h1` each.
13. `npm run check:contrast` still passes **sixteen** pairs.
14. `npm run check:dist` exits 0. If you added a new output format, say whether it was scanned.
15. `npm run verify` reaches `build`, runs `check:dist`, and exits 0, still stating that
    `check:config` is red. Paste the tail.
16. **`src/data/mastodon-posts.json` is `[]` at completion.** Constraint 3.1 - do not ship
    invented posts. Paste the file.
17. `git diff HEAD --stat` lists **only** files in the allowed scope. Paste it.
    `PROJECT_CONTEXT.md` and `ROADMAP.md` must not appear, and `site.config.ts` must appear only
    if you did the string lift.

**A browser pass IS required.** This task changes rendered output on `/` and `/posts` - both empty
states and, with the cache seeded, the whole post card. Check at 375px and 1440px. Note that
`fullPage` screenshots of this site produce a known stitching artifact (footer text ghosting into
the hero band); it is not a render defect and must not be filed as one.

---

## Reviewer focus

- **Is sanitization at build time, or did it end up in the browser?** Constraints 3.8 and 3.9.
- **Was `href` scheme-checked, or does the allowlist keep `javascript:`?** An element allowlist
  alone does not close this.
- **Were BOTH hot-links fixed** - the media at line 68 *and* the avatar at line 38?
- **Does an unfetchable image silently fall back to the third-party URL?** That is the defect
  still present behind a longer code path.
- **Does a build with an empty cache and no network still succeed?**
- **Was a package imported without being declared?**
- **Did `social.mastodon` get filled, guessed, or set to `null`?** All three are wrong, and
  `check:config` going green is the tell.
- **Was a literal token string written into `src/` to detect the unconfigured state?**
- **Did anything in `src/content.config.ts` change beyond lines 43-45 and 61?**
- **Was a filename built by interpolating an untrusted API string into a path?**
- **Is `mastodon-posts.json` back to `[]`?**

---

## Out of scope / queued work

**Blocked on the owner:** Task 005c (the feedback round - **confirmed 2026-08-01 that no comments
have arrived yet**), Task 007a (brand assets), Task 006b (the Mastodon handle, which waits on the
anticipated name change), Task 008 (DNS and a working mailbox).

**Unblocked and untouched by this task:** Task 007 - metadata, canonical URLs, sitemap and the
wordmark. The rest of Task 009 - CI, link checker, automated accessibility, dependency updates.

**Owner items no session can close:** `NODE_VERSION` = `22.23.2` on Cloudflare Pages, and merging
`task/005b-content-consolidation` into `main`.
