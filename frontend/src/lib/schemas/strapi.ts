import { z } from 'zod';

export const StrapiImageSchema = z.object({
  data: z.object({
    id: z.number(),
    attributes: z.object({
      url: z.string().url(),
      alternativeText: z.string().nullable(),
      caption: z.string().nullable(),
      width: z.number(),
      height: z.number(),
    }),
  }).nullable(),
});

export const StrapiArticleSchema = z.object({
  id: z.number(),
  attributes: z.object({
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    date: z.string().datetime(),
    author: z.string(),
    featuredImage: StrapiImageSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
});

export const StrapiReportSchema = z.object({
  id: z.number(),
  attributes: z.object({
    title: z.string(),
    date: z.string().datetime(),
    summary: z.string(),
    pdf: z.object({
      data: z.object({
        id: z.number(),
        attributes: z.object({
          url: z.string(),
          name: z.string(),
        }),
      }),
    }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
});

export const StrapiGallerySchema = z.object({
  id: z.number(),
  attributes: z.object({
    title: z.string(),
    eventDate: z.string().datetime(),
    description: z.string(),
    images: z.object({
      data: z.array(z.object({
        id: z.number(),
        attributes: z.object({
          url: z.string(),
          alternativeText: z.string().nullable(),
          caption: z.string().nullable(),
          width: z.number(),
          height: z.number(),
        }),
      })),
    }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
}); 