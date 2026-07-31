#!/usr/bin/env bash
#
# Reproduce the green baseline, skipping the expensive dependency half when
# nothing about the dependency graph has changed.
#
#   npm run verify              # cached deps check, then check + build
#   npm run verify -- --force   # ignore the cache, re-run everything
#   npm run verify -- --deps    # dependency half only
#
# The cache key is package-lock.json + package.json + the Node version. Source
# changes deliberately do NOT invalidate it: `npm ci` and `npm audit` only ever
# depend on the lockfile, so re-running them after an .astro edit proves nothing.
# `astro check` and `astro build` are never cached, because they are the checks
# that actually depend on the code a task changed.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CACHE_DIR=".verify-cache"
STAMP="$CACHE_DIR/deps.stamp"

FORCE=0
DEPS_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --deps)  DEPS_ONLY=1 ;;
    *) echo "verify: unknown argument '$arg'" >&2; exit 2 ;;
  esac
done

fingerprint() {
  {
    sha256sum package-lock.json package.json
    node -v
  } | sha256sum | cut -d' ' -f1
}

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }

FP="$(fingerprint)"

# node_modules missing means the cache is meaningless whatever it says.
if [[ ! -d node_modules ]]; then
  FORCE=1
fi

if [[ $FORCE -eq 0 && -f "$STAMP" && "$(cat "$STAMP")" == "$FP" ]]; then
  echo "==> deps: unchanged since last clean verification (${FP:0:12}) - skipping npm ci and npm audit"
  echo "    re-run with --force to verify anyway"
else
  # Only stamp after every dependency check has passed, so a failed or
  # interrupted run never leaves a cache entry claiming a green baseline.
  rm -f "$STAMP"

  step "npm ci"
  npm ci

  step "npm audit"
  npm audit

  mkdir -p "$CACHE_DIR"
  printf '%s\n' "$FP" > "$STAMP"
  echo "==> deps: verified and cached (${FP:0:12})"
fi

if [[ $DEPS_ONLY -eq 1 ]]; then
  exit 0
fi

step "npm run check"
npm run check

step "npm run check:contrast"
npm run check:contrast

step "npm run build"
npm run build

printf '\n\033[1mBaseline green.\033[0m\n'
