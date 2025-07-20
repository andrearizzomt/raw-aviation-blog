import { z } from 'zod';

// Schema for rich text content blocks
const ContentBlockSchema = z.object({
  type: z.string(),
  children: z.array(
    z.object({
      type: z.string(),
      text: z.string(),
    })
  ),
});

// Schema for image formats
const ImageFormatSchema = z.object({
  name: z.string(),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  path: z.null(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
  sizeInBytes: z.number(),
  url: z.string(),
});

// Schema for Featured Image
const FeaturedImageSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  alternativeText: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  formats: z.object({
    thumbnail: ImageFormatSchema.optional(),
    large: ImageFormatSchema.optional(),
    medium: ImageFormatSchema.optional(),
    small: ImageFormatSchema.optional(),
  }),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  url: z.string(),
  previewUrl: z.string().nullable(),
  provider: z.string(),
  provider_metadata: z.null(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
});

// Schema for Author Profile
const AuthorProfileSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  displayName: z.string(),
  bio: z.union([z.array(ContentBlockSchema), z.string()]).optional(),
  profilePhoto: FeaturedImageSchema.optional(),
  position: z.string(),
  isPublicAuthor: z.boolean(),
  authorType: z.enum(['founder', 'external_contributor', 'guest']),
  authorSlug: z.string(),
  showContributionCount: z.boolean(),
  socialLinks: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
});

export const StrapiAuthorProfileSchema = AuthorProfileSchema;

// Schema for Author Profile response
export const StrapiAuthorProfileResponseSchema = z.object({
  data: z.array(AuthorProfileSchema),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }),
});

const BaseStrapiArticleSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  Title: z.string(),
  Slug: z.string(),
  Content: z.array(ContentBlockSchema),
  Date: z.string(),
  authors: z.array(AuthorProfileSchema).optional(),
  Featured_Image: FeaturedImageSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
});

export const StrapiArticleSchema = BaseStrapiArticleSchema;

// Schema for the full Strapi response
export const StrapiArticleResponseSchema = z.object({
  data: z.array(BaseStrapiArticleSchema),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }),
});

export const StrapiImageSchema = z.object({
  data: z.object({
    id: z.number(),
    attributes: z.object({
      url: z.string(),
      alternativeText: z.string().nullable(),
      caption: z.string().nullable(),
      width: z.number(),
      height: z.number(),
    }),
  }).nullable(),
});

const BaseStrapiReportSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  Title: z.string(),
  Slug: z.string(),
  Date: z.string(),
  Content: z.array(ContentBlockSchema),
  authors: z.array(AuthorProfileSchema).optional(),
  MainImage: FeaturedImageSchema.optional(),
  Images: z.array(FeaturedImageSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
});

export const StrapiReportSchema = BaseStrapiReportSchema;

// Schema for the full Strapi Report response
export const StrapiReportResponseSchema = z.object({
  data: z.array(BaseStrapiReportSchema),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }),
});

const BaseStrapiGallerySchema = z.object({
  id: z.number(),
  documentId: z.string(),
  Title: z.string(),
  slug: z.string(),
  Date: z.string(),
  Description: z.string(),
  authors: z.array(AuthorProfileSchema).optional(),
  Images: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      alternativeText: z.string().nullable(),
      caption: z.string().nullable(),
      width: z.number(),
      height: z.number(),
      formats: z.object({
        thumbnail: ImageFormatSchema.optional(),
        large: ImageFormatSchema.optional(),
        medium: ImageFormatSchema.optional(),
        small: ImageFormatSchema.optional(),
      }).optional(),
      hash: z.string(),
      ext: z.string(),
      mime: z.string(),
      size: z.number(),
      url: z.string(),
      previewUrl: z.string().nullable(),
      provider: z.string(),
      provider_metadata: z.null(),
      createdAt: z.string(),
      updatedAt: z.string(),
      publishedAt: z.string().nullable(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
});

export const StrapiGallerySchema = BaseStrapiGallerySchema;

// Schema for the full Strapi Gallery response
export const StrapiGalleryResponseSchema = z.object({
  data: z.array(BaseStrapiGallerySchema),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }),
}); 