# Contributing

Thanks for considering a contribution.

## Contributions are dedicated under CC0 1.0

This repository is dedicated to the public domain under
[CC0 1.0 Universal](LICENSE). **By offering a contribution, you dedicate it to the public
domain under the same terms**, waiving copyright and related rights in it to the extent
allowed by law.

This file exists because CC0 covers only what the project owner holds. A contribution stays
the contributor's until it is dedicated too, so without this statement the repository could
not honestly claim to be public domain once outside patches landed.

Only contribute work you are entitled to dedicate this way. If you do not hold the rights to
something - code copied from a differently licensed project, a photograph you did not take, a
typeface - do not include it.

## Three things CC0 does not cover

These are the same three carve-outs [`README.md`](README.md#licence) documents. They are worth
reading before you start, because contributions run into them first.

- **The group's name and identity are not waived.** CC0 waives copyright, not trademark. A
  fork publishes under its own name rather than this one.
- **The Inter typeface is SIL OFL 1.1**, not CC0. It is fetched at build time and emitted into
  `dist/`, so every deployed build redistributes it. Bundling is expressly permitted, the OFL
  notice travels with the build, and a modified font may not keep the reserved name "Inter".
  **A change of typeface means re-checking the new font's licence** - this is not a one-time
  clearance.
- **The truthfulness of the page copy.** The prose in `src/content/pages/` describes a real
  group, including a rented plot at a garden operated by a separate organization. It is freely
  copyable and would be false if republished unchanged.

## Prose is rewritten, not tokenized

This repository is a template plus one group's instance of it, and the adoption model is
fork-and-self-host. An adopting group **rewrites the prose** rather than filling placeholders
into these sentences.

That is a deliberate design decision, not a gap waiting to be closed. A different group has a
different model, different programs, and different places; interpolating a name or a city into
this group's sentences produces copy that is grammatically brittle and confidently wrong.
**A sentence that needs a token to make sense belongs to the adopting group, not to the
template.**

So please do not add configuration interpolation into the MDX documents. The four surfaces an
adopter edits, and what belongs in each, are documented in
[Rebranding this site](README.md#rebranding-this-site) - that section is the authority and
this one deliberately does not restate it.

## Facts in public copy

The one rule worth stating outright, because it is the easiest to break in good faith:
**do not add invented facts to anything the site publishes.** No invented addresses, phone
numbers, email addresses, social accounts, dates, statistics, or organizational history. If a
real value is not known, leave it out or leave the existing owner-fill token standing - a
visible `SCREAMING_SNAKE_CASE` token is honest absence, while a plausible invented value reads
as genuine and is not.

## Checks

The repository has no CI. These are the checks it does have, and they run locally:

```bash
npm run verify
```

That runs the type check, the contrast audit, the token scans and the build. The individual
commands are listed in [`README.md`](README.md#commands).
