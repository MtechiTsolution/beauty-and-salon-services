import { PackageCardGrid } from '@/features/packages/components/PackageCardGrid';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { ServiceCardReviews } from '@/features/reviews/components/ServiceCardReviews';
import { branchesApi, reviewsApi, servicesApi } from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, MapPinned, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExplorePage() {
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-explore'],
    queryFn: () => branchesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services-explore'],
    queryFn: () => servicesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: activePackages = [] } = useActivePackages();
  const { data: reviews = [] } = useQuery({
    queryKey: ['service-reviews'],
    queryFn: () => reviewsApi.list(),
    refetchOnMount: 'always',
  });

  const activeBranches = branches.filter((b) => b.status === 'active');
  const activeServices = services.filter((s) => s.status === 'active');

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
                  {activeBranches.length > 0 && (
                    <div className="customer-package-count-pill">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>
                        {activeBranches.length} location{activeBranches.length === 1 ? '' : 's'}
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
      <section className="mt-12 md:mt-16">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">All locations</h2>
        <p className="mt-2 text-muted-foreground">Choose the salon nearest to you when you book.</p>
        <div className="customer-explore-grid mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activeBranches.map((b) => (
            <Card key={b.id} className="customer-explore-card customer-card-hover overflow-hidden border-0 shadow-md">
              <div className="customer-explore-card__media aspect-[16/10] shrink-0 overflow-hidden">
                <CoverImage
                  src={b.image_url}
                  alt={b.name}
                  kind="branch"
                  entityId={b.id}
                  entityName={b.name}
                  entityDescription={branchImageHints(b)}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="customer-explore-card__body customer-branch-card-body p-6 text-left">
                <div className="grid grid-cols-[1.125rem_minmax(0,1fr)] gap-x-2 gap-y-2">
                  <h3 className="customer-explore-card__title col-start-2 font-heading text-xl font-semibold leading-snug">
                    {b.name}
                  </h3>
                  <MapPin className="col-start-1 row-start-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="customer-explore-card__address col-start-2 row-start-2 min-w-0 text-sm leading-relaxed text-muted-foreground">
                    {b.address}
                    {b.city ? `, ${b.city}` : ''}
                  </p>
                </div>
                <p className="customer-explore-card__description mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {b.description?.trim() || '\u00A0'}
                </p>
                <Button asChild variant="outline" className="customer-explore-card__cta mt-5 w-full rounded-full">
                  <Link to="/book">Book at this location</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {activeBranches.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No locations available yet.</p>
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
          <PackageCardGrid packages={activePackages} />
        </div>
      </section>

      <section className="mt-8 border-t border-border/60 pt-6 md:mt-10 md:pt-8">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">Popular services</h2>
        <p className="mt-2 text-muted-foreground">Expert care tailored to your style.</p>
        <div className="customer-explore-grid mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeServices.map((s) => (
            <Card key={s.id} className="customer-explore-card customer-card-hover overflow-hidden border-0 shadow-md">
              <div className="customer-explore-card__media aspect-[4/3] shrink-0 overflow-hidden">
                <CoverImage
                  src={s.image_url}
                  alt={s.title}
                  kind="service"
                  entityId={s.id}
                  entityName={s.title}
                  entityDescription={s.description}
                  className="h-full w-full"
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
                <Button asChild variant="outline" className="customer-explore-card__cta mt-4 w-full rounded-full">
                  <Link to="/book">Book this service</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
