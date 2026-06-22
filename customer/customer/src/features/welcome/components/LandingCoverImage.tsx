import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { mobileImageUrl } from '@mit-salon/shared/lib/salon-image-pool';
import { cn } from '@mit-salon/shared/lib/utils';
import type { ComponentProps } from 'react';
type LandingCoverImageProps = Omit<ComponentProps<typeof CoverImage>, 'loading' | 'fetchPriority' | 'src'> & {
  src?: string | null;
  priority?: boolean;
};

/** Landing images load eagerly with absolute fill — lazy loading breaks carousels and mobile hero slides. */
export function LandingCoverImage({ priority = false, className, src, ...props }: LandingCoverImageProps) {
  const optimizedSrc = src?.trim().startsWith('http') ? mobileImageUrl(src.trim(), { fullBleed: priority }) : src;

  return (
    <CoverImage
      {...props}
      src={optimizedSrc}
      loading="eager"
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={cn('absolute inset-0 h-full w-full object-cover object-center', className)}
    />
  );
}
