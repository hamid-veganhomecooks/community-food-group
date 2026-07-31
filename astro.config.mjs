import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// No production domain has been confirmed for this project, so the canonical
// site URL is not hardcoded. Set SITE_URL in the deployment environment to
// enable absolute URLs in generated output.
//
// SITE_URL must come from the real process environment. This config file is
// evaluated before Astro loads .env files, so putting SITE_URL in .env will not
// work. Use `SITE_URL=... npm run build` locally, or a Cloudflare Pages
// environment variable in deployment.
const site = process.env.SITE_URL?.trim() || undefined;

export default defineConfig({
  output: 'static',
  site,
  integrations: [mdx()],
  // Tailwind 4 ships as a Vite plugin. The former @astrojs/tailwind
  // integration does not support Astro 7 and has been removed.
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: '_astro',
  },
});
