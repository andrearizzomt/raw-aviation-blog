import { getStrapiMedia } from '@/lib/api/strapi';
import { StrapiAuthorProfile } from '@/lib/types/strapi';
import Image from 'next/image';

interface AuthorDisplayProps {
  authors?: StrapiAuthorProfile[];
  showPhoto?: boolean;
  showBio?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export function AuthorDisplay({ 
  authors = [], 
  showPhoto = false, 
  showBio = false,
  layout = 'horizontal',
  size = 'sm'
}: AuthorDisplayProps) {
  if (!authors || authors.length === 0) {
    return <span className="text-muted-foreground">Unknown Author</span>;
  }

  const sizeClasses = {
    sm: { photo: 'w-6 h-6', text: 'text-sm' },
    md: { photo: 'w-8 h-8', text: 'text-base' },
    lg: { photo: 'w-12 h-12', text: 'text-lg' }
  };

  const currentSize = sizeClasses[size];

  if (layout === 'vertical') {
    return (
      <div className="space-y-4">
        {authors.map((author) => (
          <div key={author.id} className="flex flex-col items-center text-center space-y-2">
            {showPhoto && author.profilePhoto && (
              <div className={`${currentSize.photo} relative rounded-full overflow-hidden`}>
                <Image
                  src={getStrapiMedia(author.profilePhoto.url)}
                  alt={author.profilePhoto.alternativeText || author.displayName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className={`font-medium ${currentSize.text}`}>
                {author.displayName}
              </div>
              <div className="text-xs text-muted-foreground">
                {author.position}
              </div>
              {showBio && author.bio && (
                <div className="text-sm text-muted-foreground mt-2 max-w-xs">
                  {typeof author.bio === 'string' 
                    ? author.bio.slice(0, 100) + (author.bio.length > 100 ? '...' : '')
                    : author.bio[0]?.children[0]?.text?.slice(0, 100) + '...'
                  }
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <span className="inline-flex items-center space-x-2">
      {showPhoto && authors[0].profilePhoto && (
        <span className={`${currentSize.photo} relative rounded-full overflow-hidden flex-shrink-0 inline-block`}>
          <Image
            src={getStrapiMedia(authors[0].profilePhoto.url)}
            alt={authors[0].profilePhoto.alternativeText || authors[0].displayName}
            fill
            className="object-cover"
          />
        </span>
      )}
      <span className={currentSize.text}>
        {authors.length === 1 ? (
          authors[0].displayName
        ) : (
          <>
            {authors.slice(0, -1).map(author => author.displayName).join(', ')}
            {authors.length > 1 && ` & ${authors[authors.length - 1].displayName}`}
          </>
        )}
      </span>
    </span>
  );
} 