// Identity constants for this fork's instance of the site. See the project
// context document, section 2, "The four adoption surfaces" - this is the
// first of the four. An adopting group edits only this file to fork-and-adopt.
//
// A field holding a screaming-snake-case token (matching
// /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/) is an owner input that is genuinely
// unknown, not a placeholder chosen for convenience. `npm run check:config`
// fails the build while any remain. `null` is reserved for a field the group
// has deliberately decided against - it must never stand in for "unknown".

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

const siteConfig = {
  groupName: 'Vegans Against Fascism',
  tagline: 'a counter-cultural, total liberation collective',
  city: 'Tucson',
  region: 'Arizona',
  domain: 'GROUP_DOMAIN',
  // The local part is a real decision; the domain is the blank. Never derive
  // this from `domain` above - a computed template string would construct
  // the token at runtime and hide it from a source-text scan.
  contactEmail: 'info@GROUP_DOMAIN',
  social: {
    // Handle is a required, still-unknown owner input - tokens, not null.
    mastodon: { handle: 'MASTODON_HANDLE', url: 'MASTODON_URL' },
    // Signal invite withdrawn by owner decision, 2026-07-30 (see the project
    // context document, section 4). This is a settled decision, not an
    // unknown, so it is `null` rather than a token.
    signal: null,
  },
} as const satisfies SiteConfig;

export default siteConfig;
