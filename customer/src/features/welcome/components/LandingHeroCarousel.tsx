import { LandingCoverImage } from '@/features/welcome/components/LandingCoverImage';
import { LandingHeroMarqueeSubtitle } from '@/features/welcome/components/LandingHeroMarqueeSubtitle';
import { useLandingHeroPreload } from '@/features/welcome/hooks/useLandingImagePreload';
import { useAuth } from '@/features/auth/context/AuthContext';
import { landingHeroSlides } from '@/features/welcome/lib/landing-content';
import { Button } from '@mit-salon/shared/components/ui/button';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { cn } from '@mit-salon/shared/lib/utils';
import { CalendarDays, LogIn, MessageCircle, Sparkles, Star, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type LandingHeroCarouselProps = {
  locationLabel: string;
};

const HERO_AUTOPLAY_MS = 6500;
const hero = landingHeroSlides[0];

export function LandingHeroCarousel({ locationLabel }: LandingHeroCarouselProps) {
  const { isAuthenticated } = useAuth();
  useLandingHeroPreload();
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = landingHeroSlides.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    const timer = window.setInterval(goNext, HERO_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext]);

  return (
    <section className="landing-hero relative flex min-h-[100svh] min-h-[100dvh] flex-col overflow-hidden max-md:min-h-[88svh] max-md:min-h-[88dvh]">
      {/* Background images only — content stays fixed on top */}
      <div className="landing-hero-bg-stack absolute inset-0 overflow-hidden" aria-hidden>
        {landingHeroSlides.map((slide, index) => (
          <div
            key={slide.eyebrow}
            className={cn(
              'landing-hero-bg-layer absolute inset-0 transition-opacity duration-1000 ease-in-out',
              index === activeIndex ? 'opacity-100' : 'opacity-0 invisible',
            )}
          >
            <div className="landing-hero-slide-image-wrap absolute inset-0">
              <LandingCoverImage
                src={slide.image}
                alt=""
                kind="branch"
                entityId={`hero-${index}`}
                priority={index === 0}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
        <div className="landing-hero-overlay absolute inset-0" />
      </div>

      {/* Fixed hero content */}
      <div className="landing-hero-body relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 pb-6 pt-24 text-center sm:px-6 sm:pt-28 lg:pt-32 max-md:flex-none max-md:justify-start max-md:pb-1 max-md:pt-20">
        <div className="landing-hero-content mx-auto w-full max-w-3xl">
          <span className="landing-eyebrow landing-eyebrow--light mx-auto max-w-full text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            {hero.eyebrow}
          </span>
          <h1 className="font-heading mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-white drop-shadow-md sm:mt-6 sm:text-4xl sm:leading-[1.08] lg:text-7xl">
            {hero.title}{' '}
            <span className="bg-gradient-to-r from-accent to-amber-200 bg-clip-text text-transparent">
              {hero.highlight}
            </span>
          </h1>
          <LandingHeroMarqueeSubtitle
            className="mx-auto mt-4 w-full sm:mt-6"
            line1={`${APP_NAME} brings booking, packages, live chat, notifications, and post-visit reviews`}
            line2={`into one refined customer experience — across ${locationLabel}.`}
          />
          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="customer-accent-btn customer-btn-glow h-12 w-full rounded-full border-0 px-6 text-base font-semibold sm:w-auto sm:px-8"
                >
                  <Link to="/book">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    Book appointment
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-white/35 bg-white/5 px-6 text-base text-white backdrop-blur-sm hover:bg-white/12 sm:w-auto sm:px-8"
                >
                  <Link to="/explore">Explore salons</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="customer-accent-btn customer-btn-glow h-12 w-full rounded-full border-0 px-6 text-base font-semibold sm:w-auto sm:px-8"
                >
                  <Link to="/register">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create free account
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-white/35 bg-white/5 px-6 text-base text-white backdrop-blur-sm hover:bg-white/12 sm:w-auto sm:px-8"
                >
                  <Link to="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in
                  </Link>
                </Button>
              </>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 max-md:mt-4 max-md:mb-0">
            {[
              { icon: CalendarDays, text: '6-step booking' },
              { icon: MessageCircle, text: 'Live salon chat' },
              { icon: Star, text: 'Verified reviews' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="landing-hero-pill">
                <Icon className="h-3.5 w-3.5 text-accent" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero footer — slide controls above stats cards */}
      <div className="landing-hero-footer relative z-30 shrink-0 px-4 pb-8 pt-2 sm:px-6 sm:pb-10 max-md:pb-5 max-md:pt-0">
        <div className="mx-auto flex max-w-7xl justify-center">
          <div className="landing-hero-controls-bar flex items-center gap-3 rounded-full px-4 py-2.5">
              <button
                type="button"
                aria-label="Previous background"
                onClick={goPrev}
                className="landing-hero-bg-control inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <span aria-hidden className="text-lg leading-none">
                  ‹
                </span>
              </button>
              <div className="landing-hero-dots flex items-center gap-2.5">
                {landingHeroSlides.map((slide, index) => (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    aria-label={`Show background ${index + 1}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      index === activeIndex
                        ? 'w-8 bg-accent shadow-[0_0_0_2px_rgb(0_0_0/0.35)]'
                        : 'w-2.5 bg-white/70 shadow-[0_0_0_1px_rgb(0_0_0/0.25)] hover:bg-white',
                    )}
                    onClick={() => goTo(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next background"
                onClick={goNext}
                className="landing-hero-bg-control inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <span aria-hidden className="text-lg leading-none">
                  ›
                </span>
              </button>
            </div>
        </div>
      </div>
    </section>
  );
}
