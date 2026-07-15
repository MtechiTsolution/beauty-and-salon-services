import { CatalogPopularBadge } from '@/features/catalog/components/CatalogPopularBadge';
import { OfferingBookDialog } from '@/features/booking/components/OfferingBookDialog';
import { LandingCenteredShowcase } from '@/features/welcome/components/LandingCenteredShowcase';
import { LandingCoverImage } from '@/features/welcome/components/LandingCoverImage';
import { ServiceCardReviews } from '@/features/reviews/components/ServiceCardReviews';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { useFormatMoney } from '@mit-salon/shared/hooks/useCurrency';
import type { Review, Service } from '@mit-salon/shared/types';
import { Clock, Scissors } from 'lucide-react';
import { useState } from 'react';

const bookButtonClass =
  'mt-2.5 h-8 w-full rounded-full text-xs font-semibold max-md:mt-2 sm:mt-auto sm:h-9 sm:text-sm';

type LandingServicesCarouselProps = {
  services: Service[];
  reviews?: Review[];
};

export function LandingServicesCarousel({ services, reviews = [] }: LandingServicesCarouselProps) {
  const formatMoney = useFormatMoney();
  const [bookingService, setBookingService] = useState<Service | null>(null);

  if (services.length === 0) return null;

  return (
    <>
      <LandingCenteredShowcase
        id="services"
        wide
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
      >
        {services.map((service) => (
          <Card
            key={service.id}
            className="landing-showcase-card landing-showcase-card--media landing-showcase-card--compact flex h-full w-full flex-col overflow-hidden"
          >
            <div className="landing-showcase-card__media-wrap landing-media-frame landing-media-frame--compact aspect-[2/1] shrink-0 overflow-hidden">
              <LandingCoverImage
                src={service.image_url}
                alt={service.title}
                kind="service"
                entityId={service.id}
                entityName={service.title}
                entityDescription={service.description}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
              <CatalogPopularBadge
                entityType="service"
                entityId={service.id}
                isFeatured={service.is_featured}
                variant="overlay"
                className="landing-showcase-card__popular-badge"
              />
            </div>
            <CardContent className="flex flex-col p-3 text-center sm:flex-1 sm:p-3.5">
              <h3 className="font-heading line-clamp-2 text-base font-semibold leading-snug tracking-tight">
                {service.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                {service.description?.trim() || '\u00A0'}
              </p>
              <div className="mt-auto border-t border-border/50 pt-2.5">
                <div className="flex items-center justify-center gap-2.5">
                  <p className="text-base font-bold tracking-tight text-primary">{formatMoney(service.price)}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                    {service.duration_minutes} min
                  </p>
                </div>
                <ServiceCardReviews
                  service={service}
                  reviews={reviews}
                  className="mt-1.5 [&>div:first-child]:justify-center"
                />
                <Button
                  type="button"
                  className={bookButtonClass}
                  onClick={() => setBookingService(service)}
                >
                  Book this service
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </LandingCenteredShowcase>

      <OfferingBookDialog
        service={bookingService}
        open={bookingService != null}
        onOpenChange={(open) => {
          if (!open) setBookingService(null);
        }}
      />
    </>
  );
}
