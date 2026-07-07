import { OfferingBookDialog } from '@/features/booking/components/OfferingBookDialog';
import { getBranchesForPackage } from '@/features/packages/lib/package-branches';
import { LandingCenteredShowcase } from '@/features/welcome/components/LandingCenteredShowcase';
import { LandingCoverImage } from '@/features/welcome/components/LandingCoverImage';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import type { Branch, Package, Service } from '@mit-salon/shared/types';
import { CalendarDays, Gift, Layers, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

const bookButtonClass =
  'mt-3 h-9 w-full rounded-full text-sm font-semibold max-md:mt-2.5 sm:mt-auto sm:h-10';

type LandingPackagesCarouselProps = {
  packages: Package[];
  branches: Branch[];
  services: Service[];
};

export function LandingPackagesCarousel({ packages, branches, services }: LandingPackagesCarouselProps) {
  const [bookingPackage, setBookingPackage] = useState<Package | null>(null);

  const visiblePackages = useMemo(
    () =>
      packages.filter((pkg) => getBranchesForPackage(pkg, branches, services).length > 0),
    [packages, branches, services],
  );

  return (
    <>
      <LandingCenteredShowcase
        id="packages"
        wide
        compact
        className="landing-section--muted"
        eyebrow={
          <span className="landing-eyebrow landing-eyebrow--accent">
            <Gift className="h-4 w-4" />
            Special offers
          </span>
        }
        title="Packages & bundles"
        description={
          visiblePackages.length === 0
            ? 'Packages appear here once offers are linked to a salon — check back soon.'
            : 'Curated multi-session bundles designed for value — ideal for regular visits and complete care routines.'
        }
      >
        {visiblePackages.length > 0 ? (
          visiblePackages.map((pkg) => {
            const available = getBranchesForPackage(pkg, branches, services);
            const locationLabel =
              available.length > 0
                ? `Available at ${available.length} salon${available.length === 1 ? '' : 's'}`
                : null;

            return (
              <Card
                key={pkg.id}
                className="landing-showcase-card landing-showcase-card--media landing-showcase-card--compact flex h-full w-full flex-col overflow-hidden"
              >
                <div className="landing-media-frame landing-media-frame--compact aspect-[5/3] shrink-0 overflow-hidden">
                  <LandingCoverImage
                    src={pkg.image_url}
                    alt={pkg.name}
                    kind="package"
                    entityId={pkg.id}
                    entityName={pkg.name}
                    entityDescription={pkg.description}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>
                <CardContent className="flex flex-col p-4 text-center sm:flex-1 sm:p-5">
                  <h3 className="font-heading line-clamp-2 text-lg font-semibold leading-snug tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      {pkg.total_sessions} session{pkg.total_sessions === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {pkg.validity_days} days
                    </span>
                  </p>
                  <p className="mt-2 text-lg font-bold tracking-tight text-primary">${pkg.price.toFixed(0)}</p>
                  {pkg.description?.trim() ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {pkg.description.trim()}
                    </p>
                  ) : null}
                  {locationLabel ? (
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="line-clamp-1">{locationLabel}</span>
                    </p>
                  ) : null}
                  <Button type="button" className={bookButtonClass} onClick={() => setBookingPackage(pkg)}>
                    Book package
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="landing-showcase-card col-span-full mx-auto w-full max-w-lg border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Packages appear here once offers are live and linked to a salon.
            </CardContent>
          </Card>
        )}
      </LandingCenteredShowcase>

      <OfferingBookDialog
        pkg={bookingPackage}
        open={bookingPackage != null}
        onOpenChange={(open) => {
          if (!open) setBookingPackage(null);
        }}
      />
    </>
  );
}
