import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { LandingSectionHeader } from '@/features/welcome/components/LandingSectionHeader';
import { landingBookingSteps } from '@/features/welcome/lib/landing-content';
import Autoplay from 'embla-carousel-autoplay';
import { ListOrdered } from 'lucide-react';
import { useMemo } from 'react';

export function LandingHowItWorks() {
  const plugins = useMemo(
    () => [Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true })],
    [],
  );

  return (
    <section id="how-it-works" className="landing-section landing-section--contrast landing-section--dense scroll-mt-20 md:scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <LandingSectionHeader
          compact
          eyebrow={
            <span className="landing-eyebrow">
              <ListOrdered className="h-4 w-4 text-primary" />
              Simple process
            </span>
          }
          title="How booking works"
          description="Six refined steps from salon selection to confirmation — with flexible payment, offers, and instant chat support."
        />

        <div className="landing-carousel-shell landing-carousel-shell--tight relative md:px-10 lg:px-14">
          <Carousel opts={{ align: 'start', loop: true }} plugins={plugins} className="w-full">
            <CarouselContent className="-ml-2 sm:-ml-4 items-stretch">
              {landingBookingSteps.map((item) => (
                <CarouselItem key={item.step} className="basis-[88%] pl-2 sm:basis-1/2 sm:pl-4 lg:basis-1/3">
                  <div className="landing-step-card h-full">
                    <span className="landing-step-card__number">{item.step}</span>
                    <h3 className="font-heading mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="landing-carousel-arrow landing-carousel-arrow--prev hidden md:flex" />
            <CarouselNext className="landing-carousel-arrow landing-carousel-arrow--next hidden md:flex" />
            <CarouselDots className="landing-carousel-dots landing-carousel-dots--tight" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
