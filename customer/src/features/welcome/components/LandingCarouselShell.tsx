import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { LandingSectionHeader } from '@/features/welcome/components/LandingSectionHeader';
import { cn } from '@mit-salon/shared/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import type { EmblaOptionsType } from 'embla-carousel';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

type LandingCarouselShellProps = {
  id?: string;
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  opts?: EmblaOptionsType;
  showDots?: boolean;
  showArrows?: boolean;
  /** Center slides in the viewport — best for staff & salon showcases */
  centered?: boolean;
  /** Tighter header, carousel, and dot spacing */
  compact?: boolean;
  /** When false, slides size to content instead of stretching to the tallest slide */
  stretchSlides?: boolean;
  contentClassName?: string;
};

export function LandingCarouselShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  innerClassName,
  autoplay = true,
  autoplayDelay = 5000,
  opts,
  showDots = true,
  showArrows = true,
  centered = false,
  compact = false,
  stretchSlides = true,
  contentClassName,
}: LandingCarouselShellProps) {
  const plugins = useMemo(
    () =>
      autoplay
        ? [
            Autoplay({
              delay: autoplayDelay,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]
        : [],
    [autoplay, autoplayDelay],
  );

  return (
    <section
      id={id}
      className={cn('landing-section scroll-mt-20 md:scroll-mt-24', compact && 'landing-section--dense', className)}
    >
      <div className={cn('mx-auto min-w-0 w-full px-4 sm:px-6', compact ? 'max-w-6xl' : 'max-w-7xl')}>
        <LandingSectionHeader compact={compact} eyebrow={eyebrow} title={title} description={description} />

        <div
          className={cn(
            'landing-carousel-shell relative min-w-0 max-w-full overflow-x-clip md:overflow-x-visible',
            compact ? 'landing-carousel-shell--tight' : 'mt-8 sm:mt-12 md:mt-14',
            centered ? 'md:px-6 lg:px-10' : compact ? 'md:px-6 lg:px-8' : 'md:px-10 lg:px-14',
            innerClassName,
          )}
        >
          <Carousel
            opts={{ align: centered ? 'center' : 'start', loop: true, ...opts }}
            plugins={plugins}
            className={cn('w-full', centered && 'landing-carousel--centered')}
          >
            <CarouselContent
              className={cn(
                centered ? 'ml-0' : 'ml-0 sm:-ml-4',
                stretchSlides ? 'items-stretch' : 'items-start',
                contentClassName,
              )}
            >
              {children}
            </CarouselContent>
            {showArrows ? (
              <>
                <CarouselPrevious className="landing-carousel-arrow landing-carousel-arrow--prev hidden md:flex" />
                <CarouselNext className="landing-carousel-arrow landing-carousel-arrow--next hidden md:flex" />
              </>
            ) : null}
            {showDots ? (
              <CarouselDots
                className={cn('landing-carousel-dots', compact ? 'landing-carousel-dots--tight' : 'mt-8')}
              />
            ) : null}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
