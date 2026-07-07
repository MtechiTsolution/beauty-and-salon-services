import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { getBookableBranches } from '@/features/packages/lib/package-branches';
import { useLandingImagePreload } from '@/features/welcome/hooks/useLandingImagePreload';
import { LandingBranchesCarousel } from '@/features/welcome/components/LandingBranchesCarousel';
import { LandingFeatureGrid } from '@/features/welcome/components/LandingFeatureGrid';
import { LandingFooter } from '@/features/welcome/components/LandingFooter';
import { LandingHeroCarousel } from '@/features/welcome/components/LandingHeroCarousel';
import { LandingNavbar } from '@/features/welcome/components/LandingNavbar';
import { LandingPackagesCarousel } from '@/features/welcome/components/LandingPackagesCarousel';
import { LandingServicesCarousel } from '@/features/welcome/components/LandingServicesCarousel';
import { LandingStatsBar } from '@/features/welcome/components/LandingStatsBar';
import { LandingTestimonialsCarousel } from '@/features/welcome/components/LandingTestimonialsCarousel';
import { branchesApi, employeesApi, reviewsApi, servicesApi } from '@mit-salon/shared/api';
import { filterCustomerServices } from '@mit-salon/shared/lib/customer-catalog';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, Scissors, Star } from 'lucide-react';
import { useMemo } from 'react';

export default function LandingPage() {
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-landing'],
    queryFn: () => branchesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services-landing'],
    queryFn: () => servicesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-landing'],
    queryFn: () => employeesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-landing'],
    queryFn: () => reviewsApi.list(),
    refetchOnMount: 'always',
  });
  const { data: activePackages = [] } = useActivePackages(true);

  const activeBranches = useMemo(
    () => branches.filter((b) => b.status === 'active'),
    [branches],
  );
  const bookableServices = useMemo(
    () => filterCustomerServices(services, activeBranches),
    [services, activeBranches],
  );
  const bookableBranches = useMemo(
    () => getBookableBranches(activeBranches, bookableServices, activePackages),
    [activeBranches, bookableServices, activePackages],
  );
  const locationCount = bookableBranches.length;
  const serviceCount = bookableServices.length;
  const staffCount = employees.filter((e) => e.status === 'active').length;
  const locationLabel = locationCount > 0 ? `${locationCount}+ locations` : 'our locations';

  const preloadUrls = useMemo(
    () =>
      [
        ...bookableBranches.map((b) => b.image_url),
        ...bookableServices.map((s) => s.image_url),
        ...employees.map((e) => e.image_url),
        ...activePackages.map((p) => p.image_url),
      ].filter((url): url is string => Boolean(url?.trim())),
    [bookableBranches, bookableServices, employees, activePackages],
  );
  useLandingImagePreload(preloadUrls);

  return (
    <div className="landing-page flex min-h-screen min-w-0 w-full max-w-full flex-col overflow-x-hidden scroll-smooth">
      <LandingNavbar />
      <div className="landing-hero-block">
        <LandingHeroCarousel locationLabel={locationLabel} />

        <LandingStatsBar
          stats={[
            { icon: MapPin, label: 'Salon locations', value: `${Math.max(locationCount, 2)}+` },
            { icon: Star, label: 'Expert stylists', value: `${Math.max(staffCount, 8)}+` },
            { icon: CalendarDays, label: 'Booking flow', value: '6 steps' },
            { icon: Scissors, label: 'Treatments', value: `${Math.max(serviceCount, 10)}+` },
          ]}
        />
      </div>
      <LandingFeatureGrid />
      <LandingServicesCarousel services={bookableServices} reviews={reviews} />
      <LandingPackagesCarousel packages={activePackages} branches={bookableBranches} services={bookableServices} />
      <LandingBranchesCarousel branches={bookableBranches} />
      <LandingTestimonialsCarousel reviews={reviews} />
      <LandingFooter />
    </div>
  );
}
