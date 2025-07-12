import { getArticleBySlug } from '@/lib/api/content';
import { getStrapiMedia } from '@/lib/api/strapi';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article) return notFound();

    return (
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          {article.Featured_Image && (
            <div className="relative h-64 w-full mb-6">
              <Image
                src={getStrapiMedia(article.Featured_Image.url)}
                alt={article.Featured_Image.alternativeText || article.Title}
                fill
                className="object-cover rounded"
                priority
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4">{article.Title}</h1>
          <div className="text-sm text-gray-600 mb-6">
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
          <div className="prose max-w-none">
            {article.Content.map((block, i) => (
              <p key={i}>
                {block.children.map((child, j) => (
                  <span key={j}>{child.text}</span>
                ))}
              </p>
            ))}
          </div>
        </article>
      </main>
    );
  } catch {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-red-50 text-red-700 p-6 rounded">
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p>The article you are looking for does not exist or an error occurred.</p>
        </div>
      </main>
    );
  }
} 