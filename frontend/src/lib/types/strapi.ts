/**
 * Base types for Strapi content
 */

// Internal types (not exported)
interface ContentBlock {
  type: string;
  children: Array<{
    type: string;
    text: string;
  }>;
}

interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

interface FeaturedImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: ImageFormat;
    large: ImageFormat;
    medium: ImageFormat;
    small: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Exported types for content
export interface StrapiArticle {
  id: number;
  documentId: string;
  Title: string;
  Slug: string;
  Content: ContentBlock[];
  Date: string;
  Author: string;
  Featured_Image?: FeaturedImage;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiReport {
  id: number;
  documentId: string;
  Title: string;
  Date: string;
  Summary: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiGallery {
  id: number;
  documentId: string;
  Title: string;
  Date: string;
  Description: string;
  Images: Array<{
    id: number;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats?: {
      thumbnail: ImageFormat;
      large: ImageFormat;
      medium: ImageFormat;
      small: ImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
} 