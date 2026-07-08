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



  return (

    <div className="customer-page">

      <section className="customer-explore-hero">

        <div className="customer-container-wide">

          <div className="customer-package-page-header customer-explore-hero-card rounded-2xl border border-border/70 bg-card shadow-sm">

            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-14 md:w-14">

                <MapPinned className="h-6 w-6 md:h-7 md:w-7" />

              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">Salon profiles</p>

              <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-tight">

                Explore our salons

              </h1>

              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base lg:mt-3 lg:text-lg">

                Browse every active salon on the platform — view services, packages, hours, and book your next visit.

              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">

                {activeSalons.length > 0 ? (

                  <div className="customer-package-count-pill">

                    <MapPin className="h-4 w-4 text-primary" />

                    <span>

                      {activeSalons.length} salon{activeSalons.length === 1 ? '' : 's'} available

                    </span>

                  </div>

                ) : null}

              </div>

            </div>

          </div>

        </div>

      </section>



      <div className="customer-container-wide pb-12 md:pb-16">

        <EnableLocationBanner className="customer-location-banner mt-8" />



        {!isLoading && activeSalons.length > 0 ? (

          <SalonFiltersPanel

            className="mt-8"

            filters={filters}

            onChange={setFilters}

            hasLocation={hasLocation}

            isLocating={isLocating}

            resultCount={filteredSalons.length}

            totalCount={activeSalons.length}

          />

        ) : null}



        <section className="mt-12 md:mt-16">

          <h2 className="font-heading text-2xl font-bold md:text-3xl">

            {usingDeviceLocation ? 'Salons near you' : 'All salons'}

          </h2>

          <p className="mt-2 text-muted-foreground">

            {filtersActive

              ? 'Showing salons that match your distance and rating filters.'

              : usingDeviceLocation

                ? 'Sorted by distance from your device — open a profile to see what each salon offers.'

                : 'Enable location to sort by distance, or use filters to find salons by rating.'}

          </p>



          {isLoading ? (

            <p className="py-16 text-center text-muted-foreground">Loading salons…</p>

          ) : activeSalons.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">

              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/60" />

              <p className="mt-4 font-medium">No salons are live yet</p>

              <p className="mt-1 text-sm text-muted-foreground">

                Check back soon — new salon locations are added regularly.

              </p>

              <Button asChild className="mt-6 rounded-full">

                <Link to="/book">Start booking</Link>

              </Button>

            </div>

          ) : filteredSalons.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">

              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/60" />

              <p className="mt-4 font-medium">No salons match your filters</p>

              <p className="mt-1 text-sm text-muted-foreground">

                Try a wider distance, a lower minimum rating, or clear filters to see all salons.

              </p>

              <Button type="button" variant="outline" className="mt-6 rounded-full" onClick={() => setFilters(DEFAULT_SALON_LIST_FILTERS)}>

                Clear filters

              </Button>

            </div>

          ) : (

            <div className="customer-explore-grid mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

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


