/**
 * Base API utilities for interacting with Strapi
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

interface StrapiError {
  status: number;
  name: string;
  message: string;
  details: unknown;
}

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Wrapper for fetch calls to Strapi API
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<StrapiResponse<T>> {
  if (!STRAPI_URL) {
    throw new Error('STRAPI_URL is not defined');
  }

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, mergedOptions);

  if (!response.ok) {
    const error: StrapiError = await response.json();
    throw new Error(error.message || 'An error occurred while fetching the data.');
  }

  const data = await response.json();
  return data;
}

/**
 * Get full URL for Strapi media
 */
export function getStrapiMedia(url: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
} 