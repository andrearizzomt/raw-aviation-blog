import { fetchAPI } from './strapi';
import { 
  StrapiArticleSchema,
  StrapiArticleResponseSchema,
  StrapiReportSchema,
  StrapiGallerySchema,
  StrapiGalleryResponseSchema,
  StrapiReportResponseSchema,
  StrapiAuthorProfileSchema,
  StrapiAuthorProfileResponseSchema
} from '../schemas/strapi';
import type { 
  StrapiArticle,
  StrapiReport,
  StrapiGallery,
  StrapiAuthorProfile
} from '../types/strapi';

/**
 * Fetch all articles with optional pagination
 */
export async function getArticles(page = 1, pageSize = 10) {
  const response = await fetchAPI<StrapiArticle[]>(
    `articles?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=Date:desc&populate=*`
  );

  const validatedResponse = StrapiArticleResponseSchema.parse(response);

  return {
    articles: validatedResponse.data,
    pagination: validatedResponse.meta.pagination
  };
}

/**
 * Fetch a single article by slug
 */
export async function getArticleBySlug(slug: string) {
  const data = await fetchAPI<StrapiArticle[]>(
    `articles?filters[Slug][$eq]=${slug}&populate=*`
  );
  
  if (!data.data.length) {
    throw new Error('Article not found');
  }

  // Validate response data
  const article = StrapiArticleSchema.parse(data.data[0]);
  return article;
}

/**
 * Fetch all reports with optional pagination
 */
export async function getReports(page = 1, pageSize = 10) {
  const response = await fetchAPI<StrapiReport[]>(
    `reports?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=Date:desc&populate=*`
  );

  const validatedResponse = StrapiReportResponseSchema.parse(response);

  return {
    reports: validatedResponse.data,
    pagination: validatedResponse.meta.pagination
  };
}

/**
 * Fetch a single report by slug
 */
export async function getReportBySlug(slug: string) {
  const response = await fetchAPI<StrapiReport[]>(
    `reports?filters[Slug][$eq]=${slug}&populate=*`
  );

  if (!response.data.length) {
    throw new Error('Report not found');
  }

  const validatedResponse = StrapiReportSchema.parse(response.data[0]);

  return validatedResponse;
}

/**
 * Fetch all galleries with optional pagination
 */
export async function getGalleries(page = 1, pageSize = 10) {
  const response = await fetchAPI<StrapiGallery[]>(
    `galleries?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=Date:desc&populate=*`
  );

  const validatedResponse = StrapiGalleryResponseSchema.parse(response);

  return {
    galleries: validatedResponse.data,
    pagination: validatedResponse.meta.pagination
  };
}

/**
 * Fetch a single gallery by slug
 */
export async function getGalleryBySlug(slug: string) {
  const response = await fetchAPI<StrapiGallery[]>(
    `galleries?filters[slug][$eq]=${slug}&populate=*`
  );

  if (!response.data.length) {
    throw new Error('Gallery not found');
  }

  const validatedResponse = StrapiGallerySchema.parse(response.data[0]);

  return validatedResponse;
}

/**
 * Fetch all author profiles
 */
export async function getAuthorProfiles(page = 1, pageSize = 50) {
  const response = await fetchAPI<StrapiAuthorProfile[]>(
    `author-profiles?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&sort=orderWeight:asc,displayName:asc`
  );

  const validatedResponse = StrapiAuthorProfileResponseSchema.parse(response);

  return {
    authorProfiles: validatedResponse.data,
    pagination: validatedResponse.meta.pagination
  };
}

/**
 * Fetch public author profiles for About page
 */
export async function getPublicAuthorProfiles() {
  const response = await fetchAPI<StrapiAuthorProfile[]>(
    `author-profiles?filters[isPublicAuthor][$eq]=true&populate=*&sort=orderWeight:asc,authorType:asc,displayName:asc`
  );

  const validatedResponse = StrapiAuthorProfileResponseSchema.parse(response);

  return validatedResponse.data;
} 