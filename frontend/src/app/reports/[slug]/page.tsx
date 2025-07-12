import { getReportBySlug } from '@/lib/api/content';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const report = await getReportBySlug(slug);
    if (!report) return notFound();

    return (
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Main Image */}
          {report.MainImage && (
            <div className="relative h-96 overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${report.MainImage.url}`}
                alt={report.MainImage.alternativeText || report.Title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
            </div>
          )}
          
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{report.Title}</h1>
            <div className="text-sm text-gray-600 mb-6">
              <time dateTime={report.Date}>
                {new Date(report.Date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="prose max-w-none mb-8">
              <p className="text-lg leading-relaxed">{report.Summary}</p>
            </div>

            {/* Additional Images Gallery */}
            {report.Images && report.Images.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Report Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {report.Images.map((image, index) => (
                    <div key={image.id} className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.url}`}
                        alt={image.alternativeText || `${report.Title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
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
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p>The report you are looking for does not exist or an error occurred.</p>
        </div>
      </main>
    );
  }
} 