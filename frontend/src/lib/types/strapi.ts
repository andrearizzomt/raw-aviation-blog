/**
 * Base types for Strapi content
 */

export interface StrapiImage {
  data: {
    id: number;
    attributes: {
      url: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
    };
  } | null;
}

export interface StrapiArticle {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string;
    date: string;
    author: string;
    featuredImage: StrapiImage;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiReport {
  id: number;
  attributes: {
    title: string;
    date: string;
    summary: string;
    pdf: {
      data: {
        id: number;
        attributes: {
          url: string;
          name: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiGallery {
  id: number;
  attributes: {
    title: string;
    eventDate: string;
    description: string;
    images: {
      data: Array<{
        id: number;
        attributes: {
          url: string;
          alternativeText: string | null;
          caption: string | null;
          width: number;
          height: number;
        };
      }>;
    };
    createdAt: string;
    updatedAt: string;
  };
} 