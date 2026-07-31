# LOCAL ENVIRONMENT

Machine-specific setup for this workstation. Read this **only** when a task needs a browser
or when the baseline verification behaves unexpectedly. It is not project architecture and
is not part of the standard session payload.

Constraints of this machine: **no sudo, no system package installation, no system browser.**
Everything below is user-local and survives across sessions.

---

## 1. Node

Two versions are installed under nvm. The project requires **22.18+**; the shell default is
Node 20, which **cannot** run `scripts/fetch-mastodon.ts` (`ERR_UNKNOWN_FILE_EXTENSION`).

Select the pinned version before any npm work:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use
```

`nvm use` with no argument reads `.nvmrc` (22.23.2).

---

## 2. Baseline verification, and why it is usually cheap

```bash
npm run verify              # cached dependency check, then check + build
npm run verify -- --force   # ignore the cache, re-run everything
npm run verify -- --deps    # dependency half only
```

`scripts/verify-baseline.sh` splits the baseline in two:

- **Dependency half** (`npm ci`, `npm audit`) is cached. The key is
  `package-lock.json` + `package.json` + the Node version, stored in `.verify-cache/`
  (git-ignored). Source edits deliberately do not invalidate it, because `npm ci` and
  `npm audit` only ever depend on the lockfile - re-running them after an `.astro` edit
  proves nothing and costs a minute.
- **Code half** (`astro check`, `astro build`) is **never** cached. These are the checks
  that actually depend on what a task changed.

The stamp is written only after every dependency check passes, so an interrupted run never
leaves a cache entry falsely claiming a green baseline. A missing `node_modules` forces a
full run regardless of the stamp.

This does not weaken constraint 3.10. `npm run verify` still executes every check the
acceptance criteria name; it just declines to re-prove a lockfile that has not moved.

---

## 3. Browser verification (Playwright)

Some acceptance criteria - anything about spacing, layout, computed colour or contrast -
cannot be signed off from a CSS diff and must be measured in a real browser.

### One-time setup

Run once, by hand. Verified state as of 2026-07-30: the Chromium binaries persist, and the
npm driver plus the Task 002 harness survive in a **previous session's scratchpad** under
`/tmp`, which does not survive a reboot or `wsl --shutdown`. Step 2 rescues them. Only
`libasound.so.2` (step 3) genuinely has to be rebuilt.

**Chromium binaries** live in `~/.cache/ms-playwright/` (chromium-1234,
chromium_headless_shell-1234, ffmpeg-1011). These persist and are already installed.

**Step 2 - the `playwright` npm driver and the harness.** They live in their own directory,
deliberately outside the project and outside any nvm version directory so that switching
Node does not lose them. Move rather than reinstall - the existing copy is complete, and
this needs no network:

```bash
mkdir -p ~/.local/share
mv /tmp/claude-1000/-home-mbenhuri-github-community-food-group/56be5e55-*/scratchpad/browser \
   ~/.local/share/playwright-runner
```

If that scratchpad is already gone, rebuild it instead - but `verify.mjs` is not
recoverable this way and would have to be rewritten:

```bash
mkdir -p ~/.local/share/playwright-runner && cd ~/.local/share/playwright-runner
npm init -y && npm i playwright
```

The directory then holds `playwright@1.62.1`, `verify.mjs` (the Task 002 layout harness) and
`shot.mjs` (screenshots at 1440px and 390px into `$SHOTS`).

**Step 3 - `libasound.so.2`.** It is missing system-wide and cannot be apt-installed without sudo.
Chromium will not start without it. Extract it into a user-local directory:

```bash
mkdir -p ~/.local/lib/playwright-deps
cd /tmp
apt-get download libasound2
dpkg-deb -x libasound2_*.deb /tmp/asound-x
cp -a /tmp/asound-x/usr/lib/x86_64-linux-gnu/libasound.so.2* ~/.local/lib/playwright-deps/
rm -rf /tmp/asound-x /tmp/libasound2_*.deb
```

`apt-get download` needs no root. Only the shared object is required - Chromium loads it
but never opens an audio device, so `libasound2-data` is unnecessary.

Then make the loader find it, once, in `~/.bashrc`:

```bash
export LD_LIBRARY_PATH="$HOME/.local/lib/playwright-deps${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
```

### Per-session use

Nothing to install. Confirm and go:

```bash
ldd ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | grep 'not found'   # expect no output
```

If that prints `libasound.so.2 => not found`, `LD_LIBRARY_PATH` was not inherited; export
the line above in the current shell and continue. Do not re-extract, and do not fall back
to a scratch-directory install.

Serve the built site, then drive the harness from the runner directory so the project's
`node_modules` stays untouched:

```bash
npm run build && npm run preview &                       # serves on :4321
cd ~/.local/share/playwright-runner && node verify.mjs   # exits non-zero on any failure
SHOTS=/some/dir node shot.mjs                            # screenshots, optional
```

`verify.mjs` takes `BASE` (default `http://localhost:4321`).

### `verify.mjs` and Task 003

The harness asserts against the **pre-Direction-B** palette: it fails an `h2` whose colour
is Tailwind's default gray (`rgb(55, 65, 81)` / `rgb(17, 24, 39)`) and fails body text at
`gray-700`. Those checks stay valid after the repalette - they detect "the theme did not
apply at all", not a specific hue - but any new colour assertion belongs in
`npm run check:contrast`, which parses the tokens, rather than here.

The layout assertions (measure in 60-80ch, `h2` margin-top > margin-bottom, exactly one
`h1` per route, no skipped heading levels, `.container` at 1280px, at least three distinct
section paddings on the home page) are palette-independent and should keep passing
throughout Task 003. Treat a regression in those as a real defect, not as harness drift.

Whether this script moves into the repository under `scripts/` is an open decision: it is
project-specific and would benefit from version control alongside the CSS it asserts
against, but it imports `playwright`, which is deliberately not a project dependency.
Running it from the repo would need `NODE_PATH=~/.local/share/playwright-runner/node_modules`.
Raise it as a `TASK_SPEC.md` scope question rather than deciding it silently.

### Rules

- **Never add Playwright, or any browser, to this project's `package.json`.** It is a
  verification tool for this workstation, not a project dependency, and adding it would
  need an architectural decision under constraint 3.6.
- Serve the built site with `npm run preview` and point the browser at that, rather than
  loading `dist/` over `file://`.
