import { getPublicAuthorProfiles } from '@/lib/api/content';
import { StrapiAuthorProfile } from '@/lib/types/strapi';

export const metadata = {
  title: 'About Us - RAW Aviation',
  description: 'Meet our team of aviation enthusiasts, contributors, and guest writers who bring you the latest in aviation news and photography.',
};

export default async function AboutPage() {
  // Fetch all public author profiles
  const authorProfiles = await getPublicAuthorProfiles();
  
  // Group authors by type
  const founders = authorProfiles.filter(author => author.authorType === 'founder');
  const externalContributors = authorProfiles.filter(author => author.authorType === 'external_contributor');
  const guests = authorProfiles.filter(author => author.authorType === 'guest');

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">About RAW Aviation</h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-muted-foreground mb-6">
            Your premier destination for aviation news, airshow reports, and stunning aircraft photography. 
            We bring together aviation enthusiasts, industry experts, and photographers to share their passion 
            for flight with the world.
          </p>
          <p className="text-lg text-muted-foreground">
            From military air displays to civilian aviation, our team covers the skies with expertise, 
            dedication, and an unwavering love for all things aviation.
          </p>
        </div>
      </section>

      {/* About Us Section - Founders */}
      {founders.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">The Team Behind RAW Aviation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                          Meet the founding team behind RAW Aviation - aviation professionals and enthusiasts 
            dedicated to bringing you the best in aviation content.
            </p>
          </div>
          <div className={`flex flex-wrap justify-center gap-8 ${founders.length === 1 ? 'justify-center' : founders.length === 2 ? 'justify-center' : ''}`}>
            {founders.map((founder) => (
              <div key={founder.id} className="bg-card rounded-lg shadow-sm border border-border p-6 w-full max-w-sm flex flex-col">
                <div className="flex flex-col items-center text-center space-y-4">
                  {founder.profilePhoto && (
                    <div className="w-52 h-52 relative rounded-full overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${founder.profilePhoto.url}`}
                        alt={founder.profilePhoto.alternativeText || founder.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-foreground mb-2">
                      {founder.displayName}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {founder.position}
                    </div>
                    {founder.bio && (
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {typeof founder.bio === 'string' 
                          ? founder.bio.slice(0, 120) + (founder.bio.length > 120 ? '...' : '')
                          : founder.bio[0]?.children[0]?.text?.slice(0, 120) + '...'
                        }
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    {founder.instagram && (
                      <a 
                        href={founder.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-600 transition-colors text-2xl"
                        title="Instagram"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {founder.facebook && (
                      <a 
                        href={founder.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors text-2xl"
                        title="Facebook"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    <a 
                      href={`mailto:${founder.user?.email}`}
                      className="text-gray-600 hover:text-gray-700 transition-colors text-2xl"
                      title="Contact via Email"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contributors & Guests Section */}
      {(externalContributors.length > 0 || guests.length > 0) && (
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Contributors & Guests</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our talented network of aviation experts, photographers, and writers who contribute 
              their expertise and unique perspectives to our content.
            </p>
          </div>

          {/* External Contributors */}
          {externalContributors.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 text-center text-foreground">Regular Contributors</h3>
              <div className={`flex flex-wrap justify-center gap-6 ${externalContributors.length === 1 ? 'justify-center' : externalContributors.length === 2 ? 'justify-center' : ''}`}>
                {externalContributors.map((contributor) => (
                  <div key={contributor.id} className="bg-card rounded-lg shadow-sm border border-border p-4 w-full max-w-xs flex flex-col">
                    <div className="flex flex-col items-center text-center space-y-3">
                      {contributor.profilePhoto && (
                        <div className="w-32 h-32 relative rounded-full overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${contributor.profilePhoto.url}`}
                            alt={contributor.profilePhoto.alternativeText || contributor.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="text-lg font-semibold text-foreground mb-1">
                          {contributor.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {contributor.position}
                        </div>
                        {contributor.bio && (
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {typeof contributor.bio === 'string' 
                              ? contributor.bio.slice(0, 80) + (contributor.bio.length > 80 ? '...' : '')
                              : contributor.bio[0]?.children[0]?.text?.slice(0, 80) + '...'
                            }
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center space-x-3 mt-2">
                        {contributor.instagram && (
                          <a 
                            href={contributor.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-600 transition-colors"
                            title="Instagram"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                        {contributor.facebook && (
                          <a 
                            href={contributor.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Facebook"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        <a 
                          href={`mailto:${contributor.user?.email}`}
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                          title="Contact via Email"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guest Contributors */}
          {guests.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-center text-foreground">Guest Contributors</h3>
              <div className={`flex flex-wrap justify-center gap-6 ${guests.length === 1 ? 'justify-center' : guests.length === 2 ? 'justify-center' : ''}`}>
                {guests.map((guest) => (
                  <div key={guest.id} className="bg-card rounded-lg shadow-sm border border-border p-4 w-full max-w-xs flex flex-col">
                    <div className="flex flex-col items-center text-center space-y-3">
                      {guest.profilePhoto && (
                        <div className="w-32 h-32 relative rounded-full overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${guest.profilePhoto.url}`}
                            alt={guest.profilePhoto.alternativeText || guest.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="text-lg font-semibold text-foreground mb-1">
                          {guest.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {guest.position}
                        </div>
                        {guest.bio && (
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {typeof guest.bio === 'string' 
                              ? guest.bio.slice(0, 80) + (guest.bio.length > 80 ? '...' : '')
                              : guest.bio[0]?.children[0]?.text?.slice(0, 80) + '...'
                            }
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center space-x-3 mt-2">
                        {guest.instagram && (
                          <a 
                            href={guest.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-600 transition-colors"
                            title="Instagram"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                        {guest.facebook && (
                          <a 
                            href={guest.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Facebook"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        <a 
                          href={`mailto:${guest.user?.email}`}
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                          title="Contact via Email"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}



      {/* Empty State */}
      {authorProfiles.length === 0 && (
        <section className="text-center py-16">
          <div className="bg-muted rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">No Authors Found</h2>
            <p className="text-muted-foreground">
              Author profiles will appear here once they are marked as public in the CMS.
            </p>
          </div>
        </section>
      )}
    </main>
  );
} 