import { PackageCardGrid } from '@/features/packages/components/PackageCardGrid';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Gift, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PackagesPage() {
  const { data: packages = [], isLoading, isError, refetch, isFetching } = useActivePackages();

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="customer-package-page-header rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Special offers</p>
                <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight md:text-4xl">Packages & bundles</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Multi-session bundles at a better rate — pick a package, choose your salon, and book your first visit.
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
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Need a single service instead?{' '}
            <Link to="/services" className="font-medium text-primary underline-offset-4 hover:underline">
              Browse our services
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
