# LOCAL ENVIRONMENT

Machine-specific setup for this workstation. Read this **only** when a task needs a browser
or when the baseline verification behaves unexpectedly. It is not project architecture and
is not part of the standard session payload.

Constraints of this machine: **no sudo, no system package installation, no system browser.**
Everything below is user-local and survives across sessions.

---

## 1. Node

Two versions are installed under nvm, 20.20.2 and 22.23.2. The project requires **22.18+**.
Node 20 **cannot** run `scripts/fetch-mastodon.ts` (`ERR_UNKNOWN_FILE_EXTENSION`) and
`astro check` refuses to start on it outright.

**[2026-07-31] The nvm default alias now points at 22** (`~/.nvm/alias/default` contains
`22`, resolving to v22.23.2). It previously pointed at 20, which is why sessions kept
tripping over this. **A newly opened terminal is on 22 and needs no action.**

Verify with a genuinely clean shell, because an inherited `PATH` will lie:

```bash
env -i HOME="$HOME" TERM=xterm bash -ic 'node -v'
```

Once an nvm version directory is on `PATH`, sourcing `nvm.sh` again does **not** override it,
so a shell started before the alias change - or any subshell of one - keeps reporting the old
version however many times nvm is reloaded. That is stale `PATH`, not a broken alias. Checking
with `bash -ic 'node -v'` from such a shell reproduces the false negative.

**[2026-07-31] The default alias cannot rescue an agent or tool shell, for a second and
independent reason: nvm never loads there at all.** Ubuntu's stock `~/.bashrc` returns early
for non-interactive shells (the `case $- in *i*) ;; *) return;; esac` guard near the top), and
the nvm loader sits *below* it, around line 125. A tool-driven shell has no `i` in `$-`, so
`.bashrc` returns before nvm is sourced and `~/.nvm/alias/default` is never consulted. This is
the same placement trap documented for `LD_LIBRARY_PATH` in section 3.

The two causes compound and look identical from inside the shell. Tell them apart:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
node -v            # what this shell is actually using
nvm version default # what the alias resolves to
```

If they disagree, it is stale inherited `PATH` and the alias is fine. Observed on 2026-07-31:
`node -v` reported v20.20.2 while `nvm version default` reported v22.23.2, in a session whose
`PATH` predated the alias change.

**Practical consequence.** An agent session inherits `PATH` from the terminal it was launched
from, so one launched from a *fresh* terminal is on 22 and every subshell it spawns is too.
One launched from a pre-alias terminal is stuck on 20 for its whole lifetime and cannot fix
itself by reloading nvm. **Relaunching from a new terminal is the durable fix; the command
below is the per-session workaround.**

If a session does land on the wrong version, select the pinned one explicitly - and note this
must be repeated in **every** command, since shell state does not persist between tool calls:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use
```

`nvm use` with no argument reads `.nvmrc` (22.23.2). The default alias tracks the `22` line
rather than an exact patch, so installing a newer 22.x moves the shell default while `.nvmrc`
keeps the project pinned; that drift is intentional and harmless under `engines.node >=22.18`.

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

### Setup state, verified 2026-07-31

| Component | Location | Status |
| --- | --- | --- |
| Chromium binaries | `~/.cache/ms-playwright/` | Installed |
| `playwright` driver + harness | `~/.local/share/playwright-runner/` | Installed |
| `libasound.so.2` | `~/.local/lib/playwright-deps/` | **MISSING - do this first** |

All three are user-local and sit outside both the project and any nvm version directory, so
switching Node does not lose them. `~/.local/share/playwright-runner/` holds
`playwright@1.62.1`, `verify.mjs` (the Task 002 layout harness, **extended in Task 004** -
see below) and `shot.mjs` (screenshots at 1440px and 390px into `$SHOTS`). It was rescued out
of a session scratchpad under `/tmp`; do not let it drift back there. Reinstalling the npm
package would **not** reproduce `verify.mjs` - that file exists only here.

**[2026-07-31] `verify.mjs` now also covers accessibility, not just layout.** A prior version
of `TASK_SPEC.md` claimed it already had "focus-visible traversal groundwork" going into Task
004; reading the file on that date showed it did not - it was layout- and heading-only, with
zero keyboard or focus assertions. It was extended in place rather than trusted: it now runs
a focus-visible sweep (tabs through every focusable element on all six routes at both 375px
and 1440px, asserting a visible `outline` or `box-shadow` from computed style) and a full
mobile-menu keyboard-contract check (Escape from a link inside the menu, Escape from the
toggle, tabbing past the last link, focus return to the toggle, and an explicit assertion
that focus is never stranded inside a closed menu). All of it passed against Task 004's
implementation. A future task changing the header/footer markup or the focus styles should
expect this harness to catch a regression, not just the layout assertions below.

**Stale preview servers can steal port 4321.** A `astro preview` process left running (even
suspended, job-control state `T`) from an earlier session still holds the port. `npm run
preview` then silently falls back to 4322 and prints which port it actually bound - read that
line rather than assuming 4321, and pass the real port to `verify.mjs` via `BASE=`. Observed
again in Task 005, which ran the whole browser pass against `BASE=http://localhost:4322`.

**[2026-07-31] `verify.mjs` hardcodes the route list in three places** - lines 19, 113 and 178
- and it is **not** in the repository, so a route rename in the project does not reach it. Task
005 renamed `/donate` to `/help` and had to update all three by hand or the harness would have
driven a 404 and failed on a route that no longer exists. **A route rename is a two-repository
change.** Check the harness's route lists whenever `src/pages/` gains or loses a file.

**Outstanding - `libasound.so.2`.** Missing system-wide and not apt-installable without sudo.
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

**Both** browser binaries need it: the full `chrome` **and** `chrome-headless-shell`.
`chromium.launch()` with no channel resolves to `chrome-headless-shell`, so this blocks
`verify.mjs` outright, not just headed runs.

Then make the loader find it. **Placement matters:** Ubuntu's stock `~/.bashrc` returns
early for non-interactive shells, so a line appended to the end never runs under a
tool-driven or scripted shell. Put the export **above** that guard, near the top of the
file:

```bash
export LD_LIBRARY_PATH="$HOME/.local/lib/playwright-deps${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
```

Belt and braces, and independent of shell startup entirely - a wrapper in the runner
directory:

```bash
cat > ~/.local/share/playwright-runner/run.sh <<'EOF'
#!/usr/bin/env bash
export LD_LIBRARY_PATH="$HOME/.local/lib/playwright-deps${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
cd "$(dirname "$0")"
exec node "$@"
EOF
chmod +x ~/.local/share/playwright-runner/run.sh
```

### Per-session use

Nothing to install. Confirm with an **actual launch** - `ldd` alone is not sufficient
evidence, and an empty `ldd` result usually means the path was wrong rather than that
nothing is missing:

```bash
~/.local/share/playwright-runner/run.sh -e "
  const { chromium } = require('playwright');
  chromium.launch().then(b => b.close()).then(() => console.log('browser OK'));
"
```

If that fails with `libasound.so.2: cannot open shared object file`, the library or the
`LD_LIBRARY_PATH` is missing. Do not fall back to a scratch-directory install.

Serve the built site, then drive the harness through the wrapper so the project's
`node_modules` stays untouched and `LD_LIBRARY_PATH` is guaranteed set:

```bash
npm run build && npm run preview &                            # serves on :4321
~/.local/share/playwright-runner/run.sh verify.mjs            # non-zero on any failure
SHOTS=/some/dir ~/.local/share/playwright-runner/run.sh shot.mjs   # optional
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

---

## 4. `grep` in the agent shell is not GNU grep

**[2026-07-31] Discovered during Task 005, and it silently invalidates grep-based acceptance
criteria.** `PROJECT_CONTEXT.md` section 4 carries the operational rule; this is the mechanism.

In the agent shell, `grep` resolves to a **shell function**, not `/usr/bin/grep`:

```bash
type grep      # => "grep is a function"
which -a grep  # => /usr/bin/grep, /bin/grep   (misleading - `which` does not see functions)
```

The function delegates to a `ugrep`-style binary with `--ignore-files` set, which makes it
**honour `.gitignore`**. In this repository that means `dist/`, `.astro/` and `.verify-cache/`
are skipped - **even when named as an explicit path argument**. It also prints paths without
the `./` prefix that `grep -r … .` would produce, which is the tell.

**Why this matters more here than in most projects.** This project's acceptance criteria are
largely greps, several of them explicitly over `dist/` - the built output is where a copy
defect actually becomes visible. Under the wrapper those criteria report "no output" whether or
not the string is present, so a criterion designed to catch a shipped falsehood **passes
without testing anything**. That is a direct constraint 3.10 failure that looks exactly like a
pass.

**How Task 005 caught it.** Criterion 8 greps the whole repository for the group's name and
expects hits outside `src/`. It returned no `dist/` hits - but criterion 12 requires the name to
render into `<title>` in `dist/`, and both cannot be true. Re-running with `/usr/bin/grep`
showed the `dist/` hits immediately.

**The rule:**

```bash
/usr/bin/grep -rn 'pattern' src/ dist/      # verification: always the absolute path
```

Use the absolute path for **any** grep whose result is being reported as evidence. The wrapper
is fine for ordinary code search, where skipping build output is what you want. When a
repository-root grep is used as a criterion, pair it with
`--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.astro`, since
real grep will otherwise report generated artifacts as violations.

The project's own tooling is unaffected: `scripts/check-contrast.mjs` and
`scripts/check-config.mjs` read files through Node, not through the shell.
