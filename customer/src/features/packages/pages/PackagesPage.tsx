import { PackageCardGrid } from '@/features/packages/components/PackageCardGrid';
import { usePopularPackages } from '@/features/packages/hooks/usePopularPackages';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Gift, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PackagesPage() {
  const { data: packages = [], isLoading, isError, refetch, isFetching } = usePopularPackages(50);

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-8 md:py-16">
        <div className="customer-package-page-header rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12 sm:rounded-2xl">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-primary sm:text-xs">
                  Special offers
                </p>
                <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight sm:mt-1 sm:text-3xl md:text-4xl">
                  <span className="md:hidden">Packages</span>
                  <span className="hidden md:inline">Packages & bundles</span>
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-snug text-muted-foreground sm:mt-2 sm:leading-relaxed md:text-base">
                  <span className="md:hidden">Multi-session bundles at better rates.</span>
                  <span className="hidden md:inline">
                    Multi-session bundles at a better rate — pick a package, choose your salon, and book your first
                    visit.
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isLoading && packages.length > 0 ? (
                <div className="customer-package-count-pill">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>
                    {packages.length} active offer{packages.length === 1 ? '' : 's'}
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
            <p className="text-destructive">Could not load packages. Make sure the API is running.</p>
            <Button type="button" variant="outline" className="mt-4 rounded-full px-5" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="mt-10">
            <PackageCardGrid
              packages={packages}
              emptyMessage="No active packages yet. Ask your salon to add packages in the admin panel (status: Active)."
            />
          </div>
        )}

        {packages.length > 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground sm:mt-12">
            <span className="md:hidden">
              Single service?{' '}
              <Link to="/services" className="font-medium text-primary underline-offset-4 hover:underline">
                Browse services
              </Link>
            </span>
            <span className="hidden md:inline">
              Need a single service instead?{' '}
              <Link to="/services" className="font-medium text-primary underline-offset-4 hover:underline">
                Browse our services
              </Link>
              {' · '}
              <Link to="/explore" className="font-medium text-primary underline-offset-4 hover:underline">
                Find a location
              </Link>
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
