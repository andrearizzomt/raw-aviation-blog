import { getGalleryBySlug } from '@/lib/api/content';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const gallery = await getGalleryBySlug(slug);
    if (!gallery) return notFound();

    return (
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-6xl mx-auto bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4 text-card-foreground">{gallery.Title}</h1>
            <div className="text-sm text-muted-foreground mb-6">
              <time dateTime={gallery.Date}>
                {new Date(gallery.Date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="prose max-w-none mb-8">
              <p className="text-lg leading-relaxed text-muted-foreground">{gallery.Description}</p>
            </div>

            {/* Gallery Images */}
            {gallery.Images && gallery.Images.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6 text-card-foreground">Gallery Images ({gallery.Images.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {gallery.Images.map((image, index) => (
                    <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border border-border group">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.url}`}
                        alt={image.alternativeText || `${gallery.Title} - Image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/75 text-primary-foreground p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
    console.error('Error in GalleryDetailPage:', error);
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-accent text-accent-foreground p-6 rounded border border-border">
          <h1 className="text-2xl font-bold mb-2">Gallery Not Found</h1>
          <p>The gallery you are looking for does not exist or an error occurred.</p>
        </div>
      </main>
    );
  }
} 