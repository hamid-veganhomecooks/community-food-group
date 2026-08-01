// Identity constants for this fork's instance of the site. See the project
// context document, section 2, "The four adoption surfaces" - this is the
// first of the four. An adopting group edits only this file to fork-and-adopt.
//
// A field holding a screaming-snake-case token (matching
// /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/) is an owner input that is genuinely
// unknown, not a placeholder chosen for convenience. `npm run check:config`
// fails the build while any remain. `null` is reserved for a field the group
// has deliberately decided against - it must never stand in for "unknown".
//
// Short labels - navigation, buttons, column headings - live here too. Prose
// does not: it lives in `src/content/pages/*.mdx`. The dividing line is that a
// label is a name for a destination or a control, while prose is sentences.

export interface SocialAccount {
  handle: string;
  url: string;
}

export interface NavItem {
  label: string;
  href: string;
  /**
   * Rendered as a button rather than a plain link in the header. Exactly the
   * emphasis the hand-written lists carried before they were consolidated.
   * Required rather than optional so every item declares its own treatment and
   * `as const` narrowing keeps the property present on every union member.
   */
  cta: boolean;
}

export interface HeaderConfig {
  /** Wordmark glyph beside the group name. */
  logoEmoji: string;
  /** Suffix for the wordmark's accessible name, after the group name. */
  homeLabel: string;
  /** Accessible name for the desktop navigation landmark. */
  primaryNavLabel: string;
  /** Accessible name for the mobile navigation landmark. */
  mobileNavLabel: string;
  /** Accessible name for the mobile menu button. */
  menuToggleLabel: string;
}

export interface FooterConfig {
  quickLinksHeading: string;
  connectHeading: string;
  emailEmoji: string;
  emailLabel: string;
  joinEmoji: string;
  joinLabel: string;
  joinHref: string;
  /**
   * Closes the copyright line. The repository is dedicated to the public
   * domain under CC0 1.0, so this must not assert reserved rights.
   */
  rightsNotice: string;
  colophon: string;
}

export interface LocationsConfig {
  /**
   * Precedes the operator's name on a location card. The operator itself is a
   * fact about the place and lives in `src/data/locations.json`; this is the
   * label that introduces it.
   */
  operatedByLabel: string;
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
  nav: readonly NavItem[];
  header: HeaderConfig;
  footer: FooterConfig;
  locations: LocationsConfig;
}

const siteConfig = {
  groupName: 'Vegans Against Fascism',
  tagline: 'a counter-cultural, total liberation collective',
  city: 'Tucson',
  region: 'Arizona',
  domain: 'vegansagainstfascism.org',
  // The local part is a real decision; the domain is the blank. Never derive
  // this from `domain` above - a computed template string would construct
  // the token at runtime and hide it from a source-text scan.
  contactEmail: 'info@vegansagainstfascism.org',
  social: {
    // Handle is a required, still-unknown owner input - tokens, not null.
    mastodon: { handle: 'MASTODON_HANDLE', url: 'MASTODON_URL' },
    // Signal invite withdrawn by owner decision, 2026-07-30 (see the project
    // context document, section 4). This is a settled decision, not an
    // unknown, so it is `null` rather than a token.
    signal: null,
  },
  /**
   * One navigation list. The header's desktop and mobile lists and the
   * footer's quick links all read it, so a label changes in one place. The
   * footer omits the home entry, as it always has - the header wordmark
   * already links there.
   */
  nav: [
    { label: 'Home', href: '/', cta: false },
    { label: 'About', href: '/about', cta: false },
    { label: 'Locations', href: '/locations', cta: false },
    { label: 'Join', href: '/join', cta: false },
    { label: 'Ways to help', href: '/help', cta: true },
  ],
  header: {
    logoEmoji: '🌯',
    homeLabel: 'Home',
    primaryNavLabel: 'Primary navigation',
    mobileNavLabel: 'Mobile navigation',
    menuToggleLabel: 'Toggle navigation menu',
  },
  footer: {
    quickLinksHeading: 'Quick Links',
    connectHeading: 'Connect With Us',
    emailEmoji: '📧',
    emailLabel: 'Email us',
    joinEmoji: '🤝',
    joinLabel: 'Get involved',
    joinHref: '/join',
    rightsNotice: 'No rights reserved.',
    colophon: 'Built with 💚 for our community',
  },
  locations: {
    operatedByLabel: 'Operated by',
  },
} as const satisfies SiteConfig;

export default siteConfig;
