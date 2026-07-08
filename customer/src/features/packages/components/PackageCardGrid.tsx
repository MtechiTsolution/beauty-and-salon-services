import { CustomerPackageCard } from '@/features/packages/components/CustomerPackageCard';
import { PackageBookDialog } from '@/features/packages/components/PackageBookDialog';
import { getBranchesForPackage } from '@/features/packages/lib/package-branches';
import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { servicesApi } from '@mit-salon/shared/api';
import { formatBranchLocationsLabel } from '@mit-salon/shared/lib/branch-location-sort';
import { filterCustomerPackages } from '@mit-salon/shared/lib/customer-catalog';
import type { Branch, Package, Service } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import { useMemo, useState } from 'react';

type PackageCardGridProps = {
  packages: Package[];
  showBookButton?: boolean;
  bookHref?: string;
  emptyMessage?: string;
  columns?: '2' | '3';
};

function packageLocationLabel(pkg: Package, branches: Branch[], services: Service[]): string | null {
  const available = getBranchesForPackage(pkg, branches, services);
  return formatBranchLocationsLabel(available);
}

export function PackageCardGrid({
  packages,
  showBookButton = true,
  bookHref,
  emptyMessage = 'No packages available yet. Check back soon — our team adds new offers regularly.',
  columns = '3',
}: PackageCardGridProps) {
  const [bookingPackage, setBookingPackage] = useState<Package | null>(null);

  const { data: branches = [] } = useCustomerBranches({ queryKeyPrefix: 'branches-package-grid' });

  const { data: services = [] } = useQuery({
    queryKey: ['services-package-grid'],
    queryFn: () => servicesApi.list(),
  });

  const activeBranches = useMemo(
    () => branches.filter((branch) => branch.status === 'active'),
    [branches],
  );

  const visiblePackages = useMemo(
    () => filterCustomerPackages(packages, activeBranches),
    [packages, activeBranches],
  );

  const availabilityByPackageId = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const pkg of visiblePackages) {
      map.set(pkg.id, packageLocationLabel(pkg, activeBranches, services));
    }
    return map;
  }, [visiblePackages, activeBranches, services]);

  if (visiblePackages.length === 0) {
    return (
      <div className="customer-package-empty rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
        <Gift className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const gridClass =
    columns === '2'
      ? 'grid grid-cols-1 gap-6 md:grid-cols-2'
      : 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <>
      <div className={gridClass}>
        {visiblePackages.map((pkg) => (
          <CustomerPackageCard
            key={pkg.id}
            pkg={pkg}
            locationLabel={availabilityByPackageId.get(pkg.id)}
            showBookButton={showBookButton}
            bookHref={bookHref}
            onBook={() => setBookingPackage(pkg)}
          />
        ))}
      </div>

      {bookHref == null && (
        <PackageBookDialog
          pkg={bookingPackage}
          open={bookingPackage != null}
          onOpenChange={(next) => {
            if (!next) setBookingPackage(null);
          }}
        />
      )}
    </>
  );
}
