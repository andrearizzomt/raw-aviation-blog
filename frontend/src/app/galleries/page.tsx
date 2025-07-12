import { getGalleries } from '@/lib/api/content';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Galleries - Aviation Blog',
  description: 'Aviation photo galleries and visual content',
};

export default async function GalleriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 6;

  const { galleries, pagination } = await getGalleries(currentPage, pageSize);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Galleries</h1>
      
      {/* Galleries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {galleries.map((gallery) => (
          <article key={gallery.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Gallery Preview Image */}
            {gallery.Images && gallery.Images.length > 0 && (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${gallery.Images[0].url}`}
                  alt={gallery.Images[0].alternativeText || gallery.Title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {gallery.Images.length} photos
                </div>
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link 
                  href={`/galleries/${gallery.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {gallery.Title}
                </Link>
              </h2>
              <div className="text-sm text-gray-600 mb-4">
                <time dateTime={gallery.Date}>
                  {new Date(gallery.Date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="text-gray-700 mb-4">
                {gallery.Description.length > 150 
                  ? `${gallery.Description.slice(0, 150)}...` 
                  : gallery.Description
                }
              </div>
              <Link
                href={`/galleries/${gallery.id}`}
                className="inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                View Gallery →
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
              href={`/galleries?page=${page}`}
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

      {/* Empty State */}
      {galleries.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Galleries Available</h3>
          <p className="text-gray-500">Check back later for new aviation photo galleries.</p>
        </div>
      )}
    </main>
  );
} 