import { EnableLocationBanner } from '@/features/location/components/EnableLocationBanner';
import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import { useNearbyBranches } from '@/features/location/hooks/useNearbyBranches';
import { SalonCard } from '@/features/salons/components/SalonCard';
import { isSalonVisibleToCustomer } from '@/features/salons/lib/salon-profile';
import { CatalogPopularBadge } from '@/features/catalog/components/CatalogPopularBadge';
import { OfferingBookDialog } from '@/features/booking/components/OfferingBookDialog';
import { PackageCardGrid } from '@/features/packages/components/PackageCardGrid';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { usePopularPackages } from '@/features/packages/hooks/usePopularPackages';
import { usePopularServices } from '@/features/services/hooks/usePopularServices';
import { ServiceCardReviews } from '@/features/reviews/components/ServiceCardReviews';
import { reviewsApi, servicesApi } from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { filterCustomerServices } from '@mit-salon/shared/lib/customer-catalog';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import type { Service } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, MapPinned, Scissors } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ExplorePage() {
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const { data: branches = [] } = useCustomerBranches({ queryKeyPrefix: 'branches-explore' });
  const { data: services = [] } = useQuery({
    queryKey: ['services-explore'],
    queryFn: () => servicesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: activePackages = [] } = useActivePackages();
  const { data: popularPackages = [] } = usePopularPackages(50);
  const { data: popularServices = [] } = usePopularServices(50);
  const { data: reviews = [] } = useQuery({
    queryKey: ['service-reviews'],
    queryFn: () => reviewsApi.list(),
    refetchOnMount: 'always',
  });

  const activeBranches = branches.filter((b) => isSalonVisibleToCustomer(b));
  const activeServices = filterCustomerServices(
    services.filter((s) => s.status === 'active'),
    activeBranches,
  );
  const { usingDeviceLocation } = useCustomerLocation();
  const { branches: sortedSalons, nearest } = useNearbyBranches(activeBranches);

  return (
    <div className="customer-page">
      <section className="customer-explore-hero">
        <div className="customer-container-wide">
          <div className="customer-package-page-header customer-explore-hero-card rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-14 md:w-14">
                <MapPinned className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">Explore MIT Salon</p>
              <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Locations & services
              </h1>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base lg:mt-3 lg:text-lg">
                Browse every salon location and treatment we offer — choose your favourite spot and book your visit
                in minutes.
              </p>
              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
                <div className="flex flex-wrap justify-center gap-2">
                  {sortedSalons.length > 0 && (
                    <div className="customer-package-count-pill">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>
                        {sortedSalons.length} location{sortedSalons.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}
                  {activeServices.length > 0 && (
                    <div className="customer-package-count-pill">
                      <Scissors className="h-4 w-4 text-primary" />
                      <span>
                        {activeServices.length} treatment{activeServices.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}
                </div>
                <Button asChild size="lg" className="shrink-0 rounded-full px-8 shadow-sm">
                  <Link to="/book">Start booking</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="customer-container-wide pb-12 md:pb-16">
      <EnableLocationBanner className="customer-location-banner mt-8" />
      <section className="mt-12 md:mt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">
              {usingDeviceLocation ? 'Salons near you' : 'All locations'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {usingDeviceLocation
                ? 'Sorted by distance from your device — the nearest salon is listed first.'
                : 'Choose a salon to view its profile, services, and packages.'}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-full">
            <Link to="/salons">View all salons</Link>
          </Button>
        </div>
        <div className="customer-explore-grid mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedSalons.map((b) => (
            <SalonCard key={b.id} salon={b} isNearest={nearest?.id === b.id} />
          ))}
        </div>
        {sortedSalons.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No salons available yet.</p>
        )}
      </section>

      <section className="mt-12 md:mt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Value packages</h2>
            <p className="mt-2 text-muted-foreground">
              Offers added in admin — {activePackages.length} active package
              {activePackages.length === 1 ? '' : 's'} available.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full shrink-0">
            <Link to="/packages">View all packages</Link>
          </Button>
        </div>
        <div className="mt-8">
          <PackageCardGrid packages={popularPackages.length > 0 ? popularPackages : activePackages} />
        </div>
      </section>

      <section className="mt-8 border-t border-border/60 pt-6 md:mt-10 md:pt-8">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">Popular services</h2>
        <p className="mt-2 text-muted-foreground">Expert care tailored to your style.</p>
        <div className="customer-explore-grid mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularServices.map((s) => (
            <Card key={s.id} className="customer-explore-card customer-card-hover overflow-hidden border-0 shadow-md">
              <div className="customer-service-card-media customer-explore-card__media aspect-[4/3] shrink-0 overflow-hidden">
                <CoverImage
                  src={s.image_url}
                  alt={s.title}
                  kind="service"
                  entityId={s.id}
                  entityName={s.title}
                  entityDescription={s.description}
                  className="h-full w-full"
                />
                <CatalogPopularBadge
                  entityType="service"
                  entityId={s.id}
                  isFeatured={s.is_featured}
                  variant="overlay"
                />
              </div>
              <CardContent className="customer-explore-card__body p-6">
                <h3 className="customer-explore-card__title font-heading text-lg font-semibold leading-snug">
                  {s.title}
                </h3>
                <p className="customer-explore-card__description mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {s.description?.trim() || '\u00A0'}
                </p>
                <div className="customer-explore-card__meta mt-4 flex shrink-0 items-center justify-between">
                  <span className="text-xl font-bold text-primary">${s.price}</span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {s.duration_minutes} min
                  </span>
                </div>
                <ServiceCardReviews
                  service={s}
                  reviews={reviews}
                  className="customer-explore-card__reviews mt-4"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="customer-explore-card__cta mt-4 w-full rounded-full"
                  onClick={() => setBookingService(s)}
                >
                  Book this service
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      </div>

      <OfferingBookDialog
        service={bookingService}
        open={bookingService != null}
        onOpenChange={(open) => {
          if (!open) setBookingService(null);
        }}
      />
    </div>
  );
}
