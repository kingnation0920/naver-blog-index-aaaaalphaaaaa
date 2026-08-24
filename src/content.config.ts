import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    category: z.enum(['work', 'relationships', 'family', 'notes']),
    title: z.string().min(1),
    summary: z.string().min(1),
    readingTime: z.string().min(1),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
    temporary: z.boolean().default(false),
    relatedSlugs: z.array(z.string()).default([]),
    seoTitle: z.string().min(1),
    seoDescription: z.string().min(1),
    shareImage: z.string().optional()
  })
});

export const collections = { articles };
