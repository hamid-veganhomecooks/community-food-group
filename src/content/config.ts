import { defineCollection, z } from 'astro:content';

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    heroTitle: z.string().optional(),
    heroDescription: z.string().optional(),
    author: z.string().default('Community Food Group'),
    pubDate: z.date().optional(),
    lastModified: z.date().optional(),
    ogImage: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  pages: pagesCollection,
};