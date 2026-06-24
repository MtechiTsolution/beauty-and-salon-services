import { CarouselItem } from '@/components/ui/carousel';
import { LandingCarouselShell } from '@/features/welcome/components/LandingCarouselShell';
import { LandingCoverImage } from '@/features/welcome/components/LandingCoverImage';
import { ServiceCardReviews } from '@/features/reviews/components/ServiceCardReviews';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import type { Review, Service } from '@mit-salon/shared/types';
import { Clock, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

type LandingServicesCarouselProps = {
  services: Service[];
  reviews?: Review[];
};

export function LandingServicesCarousel({ services, reviews = [] }: LandingServicesCarouselProps) {
  const activeServices = services.filter((s) => s.status === 'active').slice(0, 12);
  const bookHref = '/book';

  if (activeServices.length === 0) return null;

  return (
    <LandingCarouselShell
      id="services"
      compact
      className="landing-section--panel"
      eyebrow={
        <span className="landing-eyebrow">
          <Scissors className="h-4 w-4 text-primary" />
          Treatments
        </span>
      }
      title="Popular services"
      description="From precision cuts to restorative spa treatments — explore our menu and reserve your preferred time in minutes."
      autoplayDelay={5000}
    >
      {activeServices.map((service) => (
        <CarouselItem key={service.id} className="flex basis-[90%] pl-2 sm:basis-1/2 sm:pl-4 lg:basis-1/3">
          <Card className="landing-showcase-card landing-showcase-card--media flex h-full w-full flex-col overflow-hidden">
            <div className="landing-media-frame aspect-[16/10] shrink-0 overflow-hidden">
              <LandingCoverImage
                src={service.image_url}
                alt={service.title}
                kind="service"
                entityId={service.id}
                entityName={service.title}
                entityDescription={service.description}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
              <h3 className="font-heading line-clamp-2 min-h-[3.25rem] text-xl font-semibold leading-snug tracking-tight">
                {service.title}
              </h3>
              <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground">
                {service.description?.trim() || '\u00A0'}
              </p>
              <div className="mt-auto border-t border-border/50 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-2xl font-bold tracking-tight text-primary">${service.price}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary/70" />
                    {service.duration_minutes} min
                  </p>
                </div>
                <ServiceCardReviews service={service} reviews={reviews} className="mt-3" />
                <Button asChild className="mt-3 h-10 w-full rounded-full text-sm font-semibold shadow-sm sm:h-11 sm:text-base">
                  <Link to={bookHref}>Book this service</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </CarouselItem>
      ))}
    </LandingCarouselShell>
  );
}
