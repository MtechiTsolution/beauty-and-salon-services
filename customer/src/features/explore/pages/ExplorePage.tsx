import { PackageCardGrid } from '@/features/packages/components/PackageCardGrid';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { ServiceCardReviews } from '@/features/reviews/components/ServiceCardReviews';
import { branchesApi, reviewsApi, servicesApi } from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, Sparkles } from 'lucide-react';
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
      <section className="border-b bg-card/60 backdrop-blur-sm">
        <div className="customer-container-wide py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent">
            <Sparkles className="h-4 w-4" /> Discover MIT Salon
          </span>
          <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Our locations & services
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {activeBranches.length} premium locations and {activeServices.length} treatments — book your visit in minutes.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full px-8">
            <Link to="/book">Start booking</Link>
          </Button>
        </div>
      </section>

      <section className="customer-container-wide py-12 md:py-16">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">All locations</h2>
        <p className="mt-2 text-muted-foreground">Choose the salon nearest to you when you book.</p>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activeBranches.map((b) => (
            <Card key={b.id} className="customer-card-hover overflow-hidden border-0 shadow-md">
              <div className="aspect-[16/10] overflow-hidden">
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
              <CardContent className="p-6">
                <h3 className="font-heading text-xl font-semibold">{b.name}</h3>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {b.address}
                    {b.city ? `, ${b.city}` : ''}
                  </span>
                </p>
                {b.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
                )}
                <Button asChild variant="outline" className="mt-5 w-full rounded-full">
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

      <section className="customer-container-wide py-12 md:py-16">
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

      <section className="border-t bg-muted/30 py-12 md:py-16">
        <div className="customer-container-wide">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Popular services</h2>
          <p className="mt-2 text-muted-foreground">Expert care tailored to your style.</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeServices.map((s) => (
              <Card key={s.id} className="customer-card-hover overflow-hidden border-0 shadow-md">
                <div className="aspect-[4/3] overflow-hidden">
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
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">${s.price}</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {s.duration_minutes} min
                    </span>
                  </div>
                  <ServiceCardReviews service={s} reviews={reviews} className="mt-4" />
                  <Button asChild variant="outline" className="mt-4 w-full rounded-full">
                    <Link to="/book">Book this service</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
