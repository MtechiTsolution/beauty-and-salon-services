import { EnableLocationBanner } from '@/features/location/components/EnableLocationBanner';
import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import { useNearbyBranches } from '@/features/location/hooks/useNearbyBranches';
import { SalonCard } from '@/features/salons/components/SalonCard';
import { SalonFiltersPanel } from '@/features/salons/components/SalonFiltersPanel';
import { useSalonReviewStats } from '@/features/salons/hooks/useSalonReviewStats';
import { isSalonVisibleToCustomer } from '@/features/salons/lib/salon-profile';
import { Button } from '@mit-salon/shared/components/ui/button';
import {
  DEFAULT_SALON_LIST_FILTERS,
  filterSalonsForList,
  hasActiveSalonFilters,
  type SalonListFilters,
} from '@mit-salon/shared/lib/salon-list-filters';
import { MapPin, MapPinned } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

export default function SalonsPage() {
  const [filters, setFilters] = useState<SalonListFilters>(DEFAULT_SALON_LIST_FILTERS);
  const { data: branches = [], isLoading } = useCustomerBranches({ queryKeyPrefix: 'branches-salons' });
  const { usingDeviceLocation } = useCustomerLocation();
  const { statsByBranchId } = useSalonReviewStats();

  const activeSalons = useMemo(
    () => branches.filter((branch) => isSalonVisibleToCustomer(branch)),
    [branches],
  );
  const { branches: salonsWithDistance, nearest, hasLocation, isLocating } = useNearbyBranches(activeSalons);

  const filteredSalons = useMemo(
    () => filterSalonsForList(salonsWithDistance, filters, statsByBranchId, { hasLocation }),
    [salonsWithDistance, filters, statsByBranchId, hasLocation],
  );

  const filtersActive = hasActiveSalonFilters(filters);
  const showFilters = !isLoading && activeSalons.length > 0;

  return (
    <div className="customer-page">
      <section className="customer-explore-hero">
        <div className="customer-container-wide">
          <div className="customer-salons-hero">
            <div className="customer-package-page-header customer-explore-hero-card customer-salons-hero__intro-card rounded-2xl border border-border/70 bg-card shadow-sm">
              <div className="customer-salons-hero__intro">
                <div className="customer-salons-hero__icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary md:h-10 md:w-10">
                  <MapPinned className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary md:text-xs">
                  Salon profiles
                </p>
                <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight md:text-3xl lg:text-[2rem] lg:leading-tight">
                  Explore our salons
                </h1>
                <p className="mx-auto mt-1.5 max-w-2xl text-pretty text-sm leading-snug text-muted-foreground md:text-[0.9375rem]">
                  Browse every active salon on the platform — view services, packages, hours, and book your next visit.
                </p>
                {activeSalons.length > 0 ? (
                  <div className="mt-3 flex justify-center">
                    <div className="customer-package-count-pill">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {activeSalons.length} salon{activeSalons.length === 1 ? '' : 's'} available
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {showFilters ? (
              <SalonFiltersPanel
                variant="card"
                className="customer-salons-hero__filters-card customer-package-page-header rounded-2xl"
                filters={filters}
                onChange={setFilters}
                hasLocation={hasLocation}
                isLocating={isLocating}
                resultCount={filteredSalons.length}
                totalCount={activeSalons.length}
              />
            ) : null}
          </div>
        </div>
      </section>

      <div className="customer-container-wide pb-12 md:pb-16">
        <EnableLocationBanner className="customer-location-banner mt-5" />

        <section className="mt-8 md:mt-10">
          <h2 className="font-heading text-xl font-bold md:text-2xl">
            {usingDeviceLocation ? 'Salons near you' : 'All salons'}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            {filtersActive
              ? 'Showing salons that match your distance and rating filters.'
              : usingDeviceLocation
                ? 'Sorted by distance from your device — open a profile to see what each salon offers.'
                : 'Enable location to sort by distance, or use filters to find salons by rating.'}
          </p>

          {isLoading ? (
            <p className="py-12 text-center text-muted-foreground">Loading salons…</p>
          ) : activeSalons.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
              <MapPin className="mx-auto h-9 w-9 text-muted-foreground/60" />
              <p className="mt-3 font-medium">No salons are live yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back soon — new salon locations are added regularly.
              </p>
              <Button asChild className="mt-5 rounded-full">
                <Link to="/book">Start booking</Link>
              </Button>
            </div>
          ) : filteredSalons.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
              <MapPin className="mx-auto h-9 w-9 text-muted-foreground/60" />
              <p className="mt-3 font-medium">No salons match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a wider distance, a lower minimum rating, or clear filters to see all salons.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 rounded-full"
                onClick={() => setFilters(DEFAULT_SALON_LIST_FILTERS)}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="customer-explore-grid mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredSalons.map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  isNearest={nearest?.id === salon.id}
                  reviewStats={statsByBranchId.get(salon.id) ?? null}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
