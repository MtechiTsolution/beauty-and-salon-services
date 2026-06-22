import { CategoryCardGrid } from '@/features/categories/components/CategoryCardGrid';
import { categoriesApi, servicesApi } from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Clock, Grid3X3, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const {
    data: services = [],
    isLoading: servicesLoading,
    isError: servicesError,
    refetch: refetchServices,
    isFetching: servicesFetching,
  } = useQuery({ queryKey: ['services'], queryFn: () => servicesApi.list() });
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
    isFetching: categoriesFetching,
  } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() });

  const active = services.filter((s) => s.status === 'active');
  const activeCategories = categories.filter((c) => c.status === 'active');
  const isLoading = servicesLoading || categoriesLoading;
  const isError = servicesError || categoriesError;
  const isFetching = servicesFetching || categoriesFetching;

  const refetch = () => {
    refetchServices();
    refetchCategories();
  };

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="customer-package-page-header rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Browse treatments</p>
                <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight md:text-4xl">Service categories</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Explore our salon treatments by category — find the right service and book your visit in minutes.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isLoading && activeCategories.length > 0 ? (
                <div className="customer-package-count-pill">
                  <Grid3X3 className="h-4 w-4 text-primary" />
                  <span>
                    {activeCategories.length} active categor{activeCategories.length === 1 ? 'y' : 'ies'}
                  </span>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={isFetching}
                onClick={() => refetch()}
                className="h-9 gap-2 rounded-full px-5 shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="customer-package-skeleton h-[22rem] animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Could not load services. Make sure the API is running.</p>
            <Button type="button" variant="outline" className="mt-4 rounded-full px-5" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="mt-10">
            <CategoryCardGrid
              categories={activeCategories}
              services={services}
              emptyMessage="No active categories yet. Ask your salon to add categories in the admin panel (status: Active)."
            />
          </div>
        )}

        {active.length > 0 && (
          <section id="all-services" className="mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">All services</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {active.length} treatment{active.length === 1 ? '' : 's'} available to book.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((service) => {
                const cat = categories.find((c) => c.id === service.category_id);
                return (
                  <Card key={service.id} className="customer-card-hover overflow-hidden border-border/70 shadow-md">
                    <div className="aspect-[5/3] overflow-hidden">
                      <CoverImage
                        src={service.image_url}
                        alt={service.title}
                        kind="service"
                        entityId={service.id}
                        entityName={service.title}
                        entityDescription={service.description}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </div>
                    <CardContent className="p-5 sm:p-6">
                      {cat && (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 overflow-hidden rounded-md border border-border/60">
                            <CoverImage
                              src={cat.image_url}
                              alt={cat.name}
                              kind="category"
                              entityId={cat.id}
                              entityName={cat.name}
                              entityDescription={cat.description}
                              className="h-6 w-6"
                            />
                          </div>
                          <span className="text-xs font-medium text-primary">{cat.name}</span>
                        </div>
                      )}
                      <h3 className="mt-2 font-heading text-lg font-semibold">{service.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                      <div className="mt-4 flex justify-between text-sm">
                        <span className="font-bold text-primary">${service.price}</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {service.duration_minutes}m
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {activeCategories.length > 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Want a bundle instead?{' '}
            <Link to="/packages" className="font-medium text-primary underline-offset-4 hover:underline">
              View packages
            </Link>
            {' · '}
            <Link to="/explore" className="font-medium text-primary underline-offset-4 hover:underline">
              Find a location
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
