import Image from "next/image";
import Link from "next/link";
import { getArticles, getReports, getGalleries } from "@/lib/api/content";
import { AuthorDisplay } from "@/components/ui/author-display";

export default async function HomePage() {
  // Fetch latest content from all content types
  const { articles } = await getArticles(1, 3);
  const { reports } = await getReports(1, 3);
  const { galleries } = await getGalleries(1, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              RAW Aviation
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80">
              Your premier destination for aviation news, airshow reports, and stunning aircraft photography
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/articles"
                className="bg-background text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Read Articles
              </Link>
              <Link
                href="/reports"
                className="border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground hover:text-primary transition-colors"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Articles */}
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <h2 className="text-xl font-bold">Latest Articles</h2>
            </div>
            <div className="p-6">
              {articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border-b border-border pb-4 last:border-b-0">
                      <Link href={`/articles/${article.Slug}`} className="group">
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary/80 transition-colors">
                          {article.Title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {article.Content[0]?.children[0]?.text?.slice(0, 100)}...
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-2">
                          <span>{new Date(article.Date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}</span>
                          <span>•</span>
                          <AuthorDisplay authors={article.authors} />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No articles available</p>
              )}
              <div className="mt-6">
                <Link
                  href="/articles"
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  View all articles →
                </Link>
              </div>
            </div>
          </div>

          {/* Latest Reports */}
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <h2 className="text-xl font-bold">Latest Reports</h2>
            </div>
            <div className="p-6">
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border-b border-border pb-4 last:border-b-0">
                      <Link href={`/reports/${report.Slug}`} className="group">
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary/80 transition-colors">
                          {report.Title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.Content[0]?.children[0]?.text?.slice(0, 100)}...
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-2">
                          <span>{new Date(report.Date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}</span>
                          <span>•</span>
                          <AuthorDisplay authors={report.authors} />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reports available</p>
              )}
              <div className="mt-6">
                <Link
                  href="/reports"
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  View all reports →
                </Link>
              </div>
            </div>
          </div>

          {/* Latest Galleries */}
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <h2 className="text-xl font-bold">Latest Galleries</h2>
            </div>
            <div className="p-6">
              {galleries.length > 0 ? (
                <div className="space-y-4">
                  {galleries.map((gallery) => (
                    <div key={gallery.id} className="border-b border-border pb-4 last:border-b-0">
                      <Link href={`/galleries/${gallery.slug}`} className="group">
                        <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                          {gallery.Images && gallery.Images.length > 0 ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${gallery.Images[0].url}`}
                              alt={gallery.Images[0].alternativeText || gallery.Title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary/80 transition-colors">
                          {gallery.Title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {gallery.Description?.slice(0, 80)}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <div className="flex items-center space-x-2">
                            <span>{gallery.Images?.length || 0} photos</span>
                            <span>•</span>
                            <span>{new Date(gallery.Date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}</span>
                            <span>•</span>
                            <AuthorDisplay authors={gallery.authors} />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No galleries available</p>
              )}
              <div className="mt-6">
                <Link
                  href="/galleries"
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  View all galleries →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-card-foreground mb-4">
                              Welcome to RAW Aviation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the latest in aviation news, comprehensive airshow reports, and stunning aircraft photography. 
              From military displays to civilian aviation, we bring you the best of the aviation world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Aviation Articles</h3>
              <p className="text-muted-foreground">
                In-depth articles covering the latest aviation news, technology, and industry developments.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Airshow Reports</h3>
              <p className="text-muted-foreground">
                Comprehensive coverage of airshows around the world with detailed analysis and highlights.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Photo Galleries</h3>
              <p className="text-muted-foreground">
                Stunning photography showcasing aircraft, airshows, and aviation events from around the globe.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
