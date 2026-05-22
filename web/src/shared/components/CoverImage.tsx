import { DEFAULT_BRANCH_IMAGE, DEFAULT_SERVICE_IMAGE } from '@/shared/lib/images';
import { cn } from '@/shared/lib/utils';

type CoverImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: 'service' | 'branch';
};

export function CoverImage({ src, alt, className, fallback = 'service' }: CoverImageProps) {
  const defaultSrc = fallback === 'branch' ? DEFAULT_BRANCH_IMAGE : DEFAULT_SERVICE_IMAGE;

  return (
    <img
      src={src || defaultSrc}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      loading="lazy"
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== defaultSrc) img.src = defaultSrc;
      }}
    />
  );
}
