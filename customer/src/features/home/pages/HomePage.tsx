import { BranchNearYouLabel } from '@/features/location/components/BranchNearYouLabel';
import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { useNearbyBranches } from '@/features/location/hooks/useNearbyBranches';
import { CatalogPopularBadge } from '@/features/catalog/components/CatalogPopularBadge';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { usePopularPackages } from '@/features/packages/hooks/usePopularPackages';
import { usePopularServices } from '@/features/services/hooks/usePopularServices';
import { getBookableBranches } from '@/features/packages/lib/package-branches';
import { servicesApi } from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { filterCustomerServices } from '@mit-salon/shared/lib/customer-catalog';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export default function HomePage() {
  const { data: services = [] } = useQuery({ queryKey: ['services-home'], queryFn: () => servicesApi.list() });
  const { data: branches = [] } = useCustomerBranches({ queryKeyPrefix: 'branches-home' });
  const { data: activePackages = [] } = useActivePackages();
  const { data: popularServices = [] } = usePopularServices(6);
  const activeBranches = branches.filter((b) => b.status === 'active');
  const activeServices = filterCustomerServices(services, activeBranches);
  const bookableBranchesBase = useMemo(
    () => getBookableBranches(activeBranches, activeServices, activePackages),
    [activeBranches, activeServices, activePackages],
  );
  const { branches: bookableBranches, nearest } = useNearbyBranches(bookableBranchesBase);
  const featuredServices = popularServices;

  return (
    <div>
      <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden">
        <CoverImage src={IMAGES.hero} alt="Luxury salon" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/30 text-sm font-medium mb-6 text-white">
            <Sparkles className="w-4 h-4" /> Premium Salon Experience
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Beauty That <em className="text-accent not-italic">Defines</em> Elegance
          </h1>
          <p className="text-lg text-white/85 mb-8 max-w-xl">
            Expert stylists, luxurious treatments, and an experience crafted just for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">
              <Link to="/book">Book Appointment <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-white/40 text-white hover:bg-white/10">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Happy Clients', value: '5,000+' },
            { label: 'Expert Stylists', value: '50+' },
            { label: 'Locations', value: `${bookableBranches.length}+` },
            { label: 'Services', value: `${activeServices.length}+` },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">Featured Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="customer-service-card-media h-48 overflow-hidden">
                <CoverImage
                  src={service.image_url}
                  alt={service.title}
                  kind="service"
                  entityId={service.id}
                  entityName={service.title}
                  entityDescription={service.description}
                  className="h-48 hover:scale-105 transition-transform duration-500"
                />
                <CatalogPopularBadge
                  entityType="service"
                  entityId={service.id}
                  isFeatured={service.is_featured}
                  variant="overlay"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-semibold">{service.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="font-semibold text-primary">${service.price}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" />{service.duration_minutes} min</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-10">Our Locations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bookableBranches.map((b) => (
              <Card key={b.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="customer-service-card-media h-36 overflow-hidden">
                  <CoverImage
                    src={b.image_url}
                    alt={b.name}
                    kind="branch"
                    entityId={b.id}
                    entityName={b.name}
                    entityDescription={branchImageHints(b)}
                    className="h-36"
                  />
                  <BranchNearYouLabel
                    distanceKm={b.distance_km}
                    isNearest={nearest?.id === b.id}
                    branch={b}
                    className="landing-showcase-card__nearby-badge"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{b.name}</h3>
                  <BranchNearYouLabel
                    distanceKm={b.distance_km}
                    isNearest={nearest?.id === b.id}
                    branch={b}
                    className="mt-1"
                    variant="compact"
                  />
                  <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span>{b.address}, {b.city}</span>
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3 w-full rounded-full">
                    <Link to={`/book?branch=${encodeURIComponent(b.id)}`}>Book here</Link>
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
