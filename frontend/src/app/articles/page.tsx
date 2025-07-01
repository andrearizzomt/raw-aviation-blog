import { getArticles } from '@/lib/api/content';
import { getStrapiMedia } from '@/lib/api/strapi';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Articles - Aviation Blog',
  description: 'Latest articles about aviation, flight reviews, and industry news',
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 6;

  const { articles, pagination } = await getArticles(currentPage, pageSize);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Articles</h1>
      
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {article.Featured_Image && (
              <div className="relative h-48 w-full">
                <Image
                  src={getStrapiMedia(article.Featured_Image.url)}
                  alt={article.Featured_Image.alternativeText || article.Title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link 
                  href={`/articles/${article.Slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.Title}
                </Link>
              </h2>
              <div className="text-sm text-gray-600 mb-4">
                <time dateTime={article.Date}>
                  {new Date(article.Date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span className="mx-2">•</span>
                <span>{article.Author}</span>
              </div>
              <div className="text-gray-700">
                {article.Content[0]?.children[0]?.text?.slice(0, 150)}...
              </div>
              <Link
                href={`/articles/${article.Slug}`}
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pageCount > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/articles?page=${page}`}
              className={`px-4 py-2 rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
} 