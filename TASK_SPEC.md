# TASK SPECIFICATION

## Task 001 : Establish a truthful, deterministic baseline

### Role

`IMPLEMENTER`

### Status

**Not started.** Verified 2026-07-30 against `HEAD` = `b33fa70`. None of the required
changes below are present in the working tree.

### Goal

Make the existing Astro scaffold install, type-check, and build deterministically without
publishing invented organization data or requiring an unconfigured Mastodon account.

This task stabilizes the generated baseline. It does not redesign the site, does not fix
the content-spacing defect, and does not add real organizational content. Those are Tasks
002 and later in `ROADMAP.md`.

### Verified starting conditions

Confirm these before starting; if any has changed, stop and report the mismatch.

- `npx astro build` already **succeeds** and emits all six routes. The legacy content
  collection still resolves under Astro 5.18.2. The migration in step 3 is a correctness
  and modernization change, not a repair of a broken build. Do not report the migration as
  fixing a build failure.
- `node scripts/fetch-mastodon.ts` **fails** with `ERR_UNKNOWN_FILE_EXTENSION` on Node 20.
  The development machine was observed at Node 20.20.2 on 2026-07-30. **Acceptance criteria
  4, 5, and 6 cannot be executed until the runtime is Node 22.18 or newer.** Upgrading the
  local runtime is a prerequisite of this task, not an optional step.

### Allowed scope

The implementer may modify only:

- `package.json`
- `package-lock.json`
- `.nvmrc`
- `.env.example`
- `astro.config.mjs`
- `src/content/config.ts` (remove after migration)
- `src/content.config.ts` (create)
- `src/pages/about.astro`
- `src/pages/join.astro`
- `src/pages/donate.astro`
- `scripts/fetch-mastodon.ts`
- `README.md`

No other file may be changed in this task. In particular, do not touch
`tailwind.config.mjs`, `src/styles/global.css`, `src/data/locations.json`, the MDX
documents, or any component.

### Required changes

1. **Define the Node runtime**
   - Standardize on Node 22.18 or newer so `node scripts/fetch-mastodon.ts` can use native
     erasable-TypeScript stripping without another dependency.
   - Add an `engines.node` constraint to `package.json`.
   - Add `.nvmrc`.
   - Document the requirement accurately in `README.md`, including that Cloudflare Pages
     needs a matching `NODE_VERSION`.

2. **Add deterministic checks**
   - Add a package script named `check` that runs Astro's project check/type validation.
   - If Astro's check command requires an official Astro package that is not already
     installed, adding that official package as a development dependency is authorized.
   - Do not add a general linting or formatting framework in this task.

3. **Modernize the Astro 5 content collection**
   - Replace legacy `src/content/config.ts` with `src/content.config.ts`.
   - Use Astro's built-in `glob()` loader for `src/content/pages/**/*.{md,mdx}`.
   - Preserve the existing schema behavior and defaults.
   - Update the three editorial routes to select entries by `entry.id`, not the legacy
     `entry.slug`.
   - Keep the collection name `pages`.
   - Do not change the routes' markup, layout wrappers, or CSS classes while editing them.

4. **Make Mastodon configuration honest and optional**
   - Remove the invented default account handle.
   - Treat a missing or blank `MASTODON_ACCOUNT` as "feed not configured".
   - In the unconfigured case, exit successfully without overwriting a valid existing cache.
   - Validate `MASTODON_POST_LIMIT` as an integer in the inclusive range 1-40. Use 20 when
     it is omitted; fail with a clear message when it is invalid.
   - Validate the limit **before** any network request, so criteria 5 and 6 fail fast and
     do not depend on network availability.
   - Add an HTTP timeout so a stalled Mastodon instance cannot hang a deployment
     indefinitely. Clear the timer on every exit path.
   - Keep account lookup and status retrieval server/build-side only.
   - Do not add authentication or secrets.

5. **Define build behavior**
   - Add a `prebuild` hook that runs the Mastodon utility.
   - The default fresh clone must still build when no Mastodon account is configured.
   - A configured but failed Mastodon request must fail clearly rather than overwrite the
     cache with invalid data.

6. **Remove unverified deployment claims**
   - Do not encode an unconfirmed Cloudflare Pages URL as Astro's canonical `site`.
   - Make the canonical site configurable from a documented environment variable, or omit
     it until confirmed.
   - Do not invent a production domain.

7. **Repair the README**
   - Replace the clone placeholder with the actual repository URL.
   - Complete all Markdown fences and setup instructions. The file currently ends inside an
     unclosed fence.
   - Document install, development, check, build, preview, and optional Mastodon
     configuration.
   - Explicitly label the current public-facing content and location records as scaffold
     data that must be replaced before deployment.
   - Do not claim WCAG conformance, a working deployment, or completed build-time ingestion
     unless verified by this task. The existing "WCAG 2.1 AA compliance" feature bullet is
     an unverified claim and must be removed or restated as a target.

### Implementation constraints

- Do not change Tailwind versions.
- Do not add `@tailwindcss/typography` in this task. It is authorized in
  `PROJECT_CONTEXT.md` but belongs to Task 003.
- Do not migrate to another framework.
- Do not add a Worker, database, CMS, form service, or client-side API request.
- Do not fabricate content or contact information.
- Do not render Mastodon HTML with `set:html`.
- Do not change design, routes, layout markup, navigation, or location rendering in this task.
- Preserve npm and commit the regenerated `package-lock.json`.

### Acceptance criteria

From a clean checkout using Node 22.18+:

1. `npm ci` succeeds.
2. `npm run check` succeeds with no errors.
3. With `MASTODON_ACCOUNT` unset, `npm run build` succeeds and does not erase an existing
   valid `src/data/mastodon-posts.json`.
4. `npm run fetch-mastodon` with an invalid handle exits nonzero with a concise validation
   error.
5. `npm run fetch-mastodon` with `MASTODON_POST_LIMIT=0` exits nonzero with a range error.
6. `npm run fetch-mastodon` with `MASTODON_POST_LIMIT=41` exits nonzero with a range error.
7. No client-side Mastodon request is introduced.
8. `rg -n "communityfood@mastodon.social|<your-repo-url>" . --glob '!PROJECT_CONTEXT.md' --glob '!TASK_SPEC.md' --glob '!ROADMAP.md'` returns no matches.
9. `src/content/config.ts` no longer exists and `src/content.config.ts` does.
10. The resulting build still emits the same six routes.
11. `node --version` reported in the task output is 22.18 or newer, demonstrating that
    criteria 4 through 6 were actually executed rather than reasoned about.

### Reviewer focus

After implementation, run a separate `REVIEWER` session focused on:

- Fresh-clone reproducibility
- Node/runtime claims versus actual package behavior
- Content collection IDs and MDX rendering
- Cache preservation on skipped or failed Mastodon fetches
- Timeout cleanup and error paths
- Accidental publication of invented organization details

### Out of scope / queued work

Tracked in `ROADMAP.md` as Tasks 002 and later:

- The content-spacing defect and the typographic system
- Replacing scaffold organization content with approved facts
- Removing the fabricated locations and contact details
- Rebranding, palette selection, and the design pass
- Semantic navigation ARIA and mobile-menu behavior
- Missing favicon and social preview assets
- Safe presentation of Mastodon HTML
- Component extraction
- CI, dependency-update automation, and deployment configuration
- Cloudflare Pages project setup
