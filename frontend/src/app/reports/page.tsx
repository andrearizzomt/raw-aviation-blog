import { getReports } from '@/lib/api/content';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Reports - Aviation Blog',
  description: 'Aviation reports, analysis, and technical documents',
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 6;

  const { reports, pagination } = await getReports(currentPage, pageSize);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Reports</h1>
      
      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report) => (
          <article key={report.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            {/* Main Image */}
            {report.MainImage && (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${report.MainImage.url}`}
                  alt={report.MainImage.alternativeText || report.Title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link 
                  href={`/reports/${report.Slug}`}
                  className="text-card-foreground hover:text-primary/80 transition-colors"
                >
                  {report.Title}
                </Link>
              </h2>
              <div className="text-sm text-muted-foreground mb-4">
                <time dateTime={report.Date}>
                  {new Date(report.Date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="text-muted-foreground">
                {report.Content[0]?.children[0]?.text?.slice(0, 150)}...
              </div>
              <Link
                href={`/reports/${report.Slug}`}
                className="inline-block mt-4 text-primary hover:text-primary/80 font-medium"
              >
                Read Report →
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
              href={`/reports?page=${page}`}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Reports Available</h3>
          <p className="text-muted-foreground">Check back later for new aviation reports and analysis.</p>
        </div>
      )}
    </main>
  );
} 