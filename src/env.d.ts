/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MASTODON_ACCOUNT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}