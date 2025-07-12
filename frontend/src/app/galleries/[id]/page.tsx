import { getGalleryById } from '@/lib/api/content';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gallery = await getGalleryById(Number(id));
    if (!gallery) return notFound();

    return (
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{gallery.Title}</h1>
            <div className="text-sm text-gray-600 mb-6">
              <time dateTime={gallery.Date}>
                {new Date(gallery.Date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="prose max-w-none mb-8">
              <p className="text-lg leading-relaxed">{gallery.Description}</p>
            </div>

            {/* Gallery Images */}
            {gallery.Images && gallery.Images.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Gallery Images ({gallery.Images.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {gallery.Images.map((image, index) => (
                    <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg group">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.url}`}
                        alt={image.alternativeText || `${gallery.Title} - Image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
    );
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-red-50 text-red-700 p-6 rounded">
          <h1 className="text-2xl font-bold mb-2">Gallery Not Found</h1>
          <p>The gallery you are looking for does not exist or an error occurred.</p>
        </div>
      </main>
    );
  }
} 