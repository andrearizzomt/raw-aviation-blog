/**
 * Base API utilities for interacting with Strapi
 */

// Internal types for API responses
interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface StrapiResponse<T> {
  data: T | T[];
  meta: {
    pagination?: StrapiPagination;
  };
}

interface StrapiErrorResponse {
  error: {
    status: number;
    name: string;
    message: string;
    details?: unknown;
  };
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

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

  const url = `${STRAPI_URL}/api/${endpoint}`;
  console.log('Fetching from:', url); // Debug log

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = (await response.json()) as StrapiErrorResponse;
      console.error('Strapi API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error
      });
      throw new Error(errorData.error.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Get full URL for Strapi media
 */
export function getStrapiMedia(url: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
} 