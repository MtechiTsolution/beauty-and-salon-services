import { useAuth } from '@/features/auth/context/AuthContext';
import { CustomerPackageCard } from '@/features/packages/components/CustomerPackageCard';
import { getBranchesForPackage } from '@/features/packages/lib/package-branches';
import { CarouselItem } from '@/components/ui/carousel';
import { LandingCarouselShell } from '@/features/welcome/components/LandingCarouselShell';
import { LandingSectionHeader } from '@/features/welcome/components/LandingSectionHeader';
import type { Branch, Package, Service } from '@mit-salon/shared/types';
import { Gift } from 'lucide-react';

type LandingPackagesCarouselProps = {
  packages: Package[];
  branches: Branch[];
  services: Service[];
};

export function LandingPackagesCarousel({ packages, branches, services }: LandingPackagesCarouselProps) {
  const { isAuthenticated } = useAuth();
  const bookHref = isAuthenticated ? '/packages' : '/register';

  if (packages.length === 0) {
    return (
      <section id="packages" className="landing-section landing-section--muted landing-section--dense scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <LandingSectionHeader
            compact
            eyebrow={
              <span className="landing-eyebrow landing-eyebrow--accent">
                <Gift className="h-4 w-4" />
                Special offers
              </span>
            }
            title="Packages & bundles"
            description="Packages are available after you create an account — browse and book from the Packages section."
          />
        </div>
      </section>
    );
  }

  return (
    <LandingCarouselShell
      id="packages"
      compact
      className="landing-section--muted"
      eyebrow={
        <span className="landing-eyebrow landing-eyebrow--accent">
          <Gift className="h-4 w-4" />
          Special offers
        </span>
      }
      title="Packages & bundles"
      description="Curated multi-session bundles designed for value — ideal for regular visits and complete care routines."
      autoplayDelay={6500}
    >
      {packages.map((pkg) => {
        const available = getBranchesForPackage(pkg, branches, services);
        const locationLabel =
          available.length > 0
            ? `Available at ${available.length} salon${available.length === 1 ? '' : 's'}`
            : null;

        return (
          <CarouselItem key={pkg.id} className="flex basis-full pl-0 sm:basis-1/2 sm:pl-4 lg:basis-1/3">
            <CustomerPackageCard
              className="w-full"
              pkg={pkg}
              locationLabel={locationLabel}
              bookHref={bookHref}
              compact
            />
          </CarouselItem>
        );
      })}
    </LandingCarouselShell>
  );
}
