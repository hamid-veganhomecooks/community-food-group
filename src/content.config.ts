import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import siteConfig from '../site.config';

/**
 * Editorial pages rendered by `src/pages/{about,join,donate}.astro`.
 *
 * Entry ids come from the filename relative to `base`, so `about.mdx` has the id
 * `about`. The routes look entries up by that id.
 */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    heroTitle: z.string().optional(),
    heroDescription: z.string().optional(),
    author: z.string().default(siteConfig.groupName),
    // `z.coerce.date()` rather than the previous `z.date()`: the content layer hands
    // frontmatter to Zod as parsed YAML, and the legacy collection API used to coerce
    // date strings on our behalf. Coercing here preserves the old accepted input.
    pubDate: z.coerce.date().optional(),
    lastModified: z.coerce.date().optional(),
    ogImage: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = { pages };
