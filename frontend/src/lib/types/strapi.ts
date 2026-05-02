/**
 * TypeScript types derived directly from Zod schemas.
 * The Zod schemas in ../schemas/strapi.ts are the source of truth.
 * Do not hand-edit types here — update the Zod schema instead.
 */
import { z } from 'zod';
import {
  StrapiAuthorProfileSchema,
  StrapiArticleSchema,
  StrapiReportSchema,
  StrapiGallerySchema,
} from '../schemas/strapi';

export type StrapiAuthorProfile = z.infer<typeof StrapiAuthorProfileSchema>;
export type StrapiArticle = z.infer<typeof StrapiArticleSchema>;
export type StrapiReport = z.infer<typeof StrapiReportSchema>;
export type StrapiGallery = z.infer<typeof StrapiGallerySchema>;
