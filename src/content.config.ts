import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { file, glob } from 'astro/loaders';
import siteConfig from '../site.config';

/**
 * Editorial pages rendered by `src/pages/{about,join,help}.astro`.
 *
 * Entry ids come from the filename relative to `base`, so `about.mdx` has the id
 * `about`. The routes look entries up by that id.
 */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    heroTitle: z.string().optional(),
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

/**
 * Named places, validated as a discriminated union on `kind`.
 *
 * Different kinds of place carry genuinely different facts, and a single flat shape
 * forces one of them to publish a falsehood or to render a dead field. A garden plot
 * has a real address and a real cadence but no map link, because access needs a plot
 * fee and a membership with the garden's operator; a distribution stop would have the
 * opposite shape. The discriminator keeps those apart at the type level.
 *
 * **Exactly one variant is defined today, and that is deliberate.** The group names no
 * cook or distribution site publicly, so any other branch would ship with zero records
 * and an unexercised render path. Adding the next kind is additive - a new member of
 * the union and a new branch in the template - which is the whole point of the
 * discriminator.
 *
 * `z` is the re-export from `astro:content`, not a direct `zod` import: zod is only a
 * transitive dependency of astro today, so importing it directly would rely on npm
 * hoisting. Taking it as a direct dependency is a separate, still-open decision.
 */
const locations = defineCollection({
  loader: file('src/data/locations.json'),
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('garden'),
      id: z.string(),
      name: z.string(),
      address: z.string(),
      cadence: z.string(),
      description: z.string(),
      // Honest attribution for a site the group does not run, and a way for a reader
      // to check the plot is real. Rendered with rel="noopener noreferrer".
      operatorName: z.string(),
      operatorUrl: z.string().url(),
    }),
  ]),
});

export const collections = { pages, locations };
