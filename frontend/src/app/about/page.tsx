import { getAboutAuthorProfiles } from '@/lib/api/content';
import { StrapiAuthorProfile } from '@/lib/types/strapi';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us - RAW Aviation',
  description: 'Meet the RAW Aviation team — co-founders and contributors who bring you aviation news, airshow reports, and photography.',
};

function truncateBio(bio: StrapiAuthorProfile['bio'], maxLength: number) {
  if (!bio) {
    return null;
  }

  if (typeof bio === 'string') {
    return bio.slice(0, maxLength) + (bio.length > maxLength ? '...' : '');
  }

  const text = bio[0]?.children[0]?.text ?? '';
  return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
}

function AuthorCard({
  author,
  size = 'lg',
}: {
  author: StrapiAuthorProfile;
  size?: 'lg' | 'md';
}) {
  const isLarge = size === 'lg';
  const photoSize = isLarge ? 'w-52 h-52' : 'w-32 h-32';
  const cardWidth = isLarge ? 'max-w-sm' : 'max-w-xs';
  const padding = isLarge ? 'p-6' : 'p-4';
  const nameClass = isLarge ? 'text-xl' : 'text-lg';
  const positionClass = isLarge ? 'text-sm mb-3' : 'text-xs mb-2';
  const bioClass = isLarge ? 'text-sm' : 'text-xs';
  const iconClass = isLarge ? 'w-6 h-6' : 'w-5 h-5';
  const bioLength = isLarge ? 120 : 80;

  return (
    <div className={`bg-card rounded-lg shadow-sm border border-border ${padding} w-full ${cardWidth} flex flex-col`}>
      <div className="flex flex-col items-center text-center space-y-4">
        {author.profilePhoto && (
          <div className={`${photoSize} relative rounded-full overflow-hidden`}>
            <img
              src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${author.profilePhoto.url}`}
              alt={author.profilePhoto.alternativeText || author.displayName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col">
          <div className={`${nameClass} font-semibold text-foreground mb-2`}>
            {author.displayName}
          </div>
          <div className={`${positionClass} text-muted-foreground`}>
            {author.position}
          </div>
          {author.bio && (
            <div className={`${bioClass} text-muted-foreground leading-relaxed`}>
              {truncateBio(author.bio, bioLength)}
            </div>
          )}
        </div>
        <div className={`flex justify-center ${isLarge ? 'space-x-4 mt-4' : 'space-x-3 mt-2'}`}>
          {author.instagram && (
            <a
              href={author.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600 transition-colors"
              title="Instagram"
            >
              <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {author.facebook && (
            <a
              href={author.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
              title="Facebook"
            >
              <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          )}
          {author.email && (
            <a
              href={`mailto:${author.email}`}
              className="text-gray-600 hover:text-gray-700 transition-colors"
              title="Contact via Email"
            >
              <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const authorProfiles = (await getAboutAuthorProfiles()).filter(
    (author) => author.teamMemberType && author.email
  );

  const coFounders = authorProfiles.filter((author) => author.teamMemberType === 'co_founder');
  const contributors = authorProfiles.filter((author) => author.teamMemberType === 'contributor');

  return (
    <main className="container mx-auto px-4 py-8">
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

      {coFounders.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Co-Founders</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The founding team behind RAW Aviation — aviation professionals and enthusiasts
              dedicated to bringing you the best in aviation content.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {coFounders.map((author) => (
              <AuthorCard key={author.id} author={author} size="lg" />
            ))}
          </div>
        </section>
      )}

      {contributors.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Contributors</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our talented network of aviation experts, photographers, and writers who contribute
              their expertise and unique perspectives to our content.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {contributors.map((author) => (
              <AuthorCard key={author.id} author={author} size="md" />
            ))}
          </div>
        </section>
      )}

      {authorProfiles.length === 0 && (
        <section className="text-center py-16">
          <div className="bg-muted rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">No Authors Found</h2>
            <p className="text-muted-foreground">
              Author profiles will appear here once they are created and published in the CMS.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
