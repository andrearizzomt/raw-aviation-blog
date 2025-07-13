import { fetchAPI } from './strapi';
import { 
  StrapiArticleSchema,
  StrapiArticleResponseSchema,
  StrapiReportSchema,
  StrapiGallerySchema,
  StrapiGalleryResponseSchema,
  StrapiReportResponseSchema
} from '../schemas/strapi';
import type { 
  StrapiArticle,
  StrapiReport,
  StrapiGallery 
} from '../types/strapi';

/**
 * Fetch all articles with optional pagination
 */
export async function getArticles(page = 1, pageSize = 10) {
  const response = await fetchAPI<StrapiArticle[]>(
    `articles?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=Date:desc&populate=*`
  );
  
  // Debug log
  console.log('Raw Strapi response:', JSON.stringify(response, null, 2));
  
  // Validate the entire response
  const validatedResponse = StrapiArticleResponseSchema.parse(response);
  
  // The data is already validated as an array of articles
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
  
  // Debug log
  console.log('Raw Strapi Report response:', JSON.stringify(response, null, 2));
  
  // Validate the entire response
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
  
  // Debug log
  console.log('Raw Strapi Report response:', JSON.stringify(response, null, 2));
  
  // Validate response data - single report response
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
  
  // Detailed debug logs
  console.log('Raw Strapi Gallery response:', JSON.stringify(response, null, 2));
  const galleries = response.data as StrapiGallery[];
  if (galleries.length > 0) {
    console.log('First gallery Images:', JSON.stringify(galleries[0].Images, null, 2));
    if (galleries[0].Images?.length > 0) {
      console.log('First image structure:', JSON.stringify(galleries[0].Images[0], null, 2));
    }
  }
  
  // Validate the entire response
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
  
  // Debug log
  console.log('Raw Strapi Gallery response:', JSON.stringify(response, null, 2));
  
  if (!response.data.length) {
    throw new Error('Gallery not found');
  }

  // Validate response data - single gallery response
  const validatedResponse = StrapiGallerySchema.parse(response.data[0]);
  
  return validatedResponse;
} 