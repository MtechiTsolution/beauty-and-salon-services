import { bookBranchUrl } from '@/features/booking/lib/booking-links';
import { BranchNearYouLabel } from '@/features/location/components/BranchNearYouLabel';
import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import { CustomerPackageCard } from '@/features/packages/components/CustomerPackageCard';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { SalonProfileServiceRow } from '@/features/salons/components/SalonProfileServiceRow';
import { formatSalonHours, getSalonOpenStatus, personInitials } from '@/features/salons/lib/salon-profile';
import { branchesApi, employeesApi, reviewsApi, servicesApi } from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { StarRating } from '@mit-salon/shared/components/StarRating';
import { Button } from '@mit-salon/shared/components/ui/button';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { haversineDistanceKm } from '@mit-salon/shared/lib/branch-distance';
import { formatBranchRatingSummary } from '@mit-salon/shared/lib/salon-review-stats';
import { filterCustomerServices } from '@mit-salon/shared/lib/customer-catalog';
import { filterPackagesForSalon, filterServicesForSalon } from '@mit-salon/shared/lib/salon-scope';
import type { Branch, Review } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gift,
  Mail,
  MapPin,
  Phone,
  Quote,
  Scissors,
  Star,
  User,
} from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';

function salonReviewStats(reviews: Review[]) {
  const approved = reviews.filter((review) => review.status === 'approved');
  if (!approved.length) return null;
  const total = approved.reduce((sum, review) => sum + review.rating, 0);
  return {
    averageRating: total / approved.length,
    reviewCount: approved.length,
  };
}

type ProfileSectionNavProps = {
  serviceCount: number;
  packageCount: number;
  reviewCount: number;
};

function ProfileSectionNav({ serviceCount, packageCount, reviewCount }: ProfileSectionNavProps) {
  const links = [
    { href: '#salon-services', label: 'Services', count: serviceCount },
    ...(packageCount > 0 ? [{ href: '#salon-packages', label: 'Packages', count: packageCount }] : []),
    ...(reviewCount > 0 ? [{ href: '#salon-reviews', label: 'Reviews', count: reviewCount }] : []),
  ];

  if (links.length < 2) return null;

  return (
    <nav className="customer-salon-profile__nav" aria-label="Salon profile sections">
      <div className="customer-container-wide customer-salon-profile__nav-inner">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="customer-salon-profile__nav-link">
            {link.label}
            <span className="customer-salon-profile__nav-count">{link.count}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

type ProfileSectionHeaderProps = {
  id?: string;
  title: string;
  description: string;
  count?: number;
};

function ProfileSectionHeader({ id, title, description, count }: ProfileSectionHeaderProps) {
  return (
    <header id={id} className="customer-salon-profile__block-head scroll-mt-28">
      <div className="customer-salon-profile__block-head-main">
        <div className="customer-salon-profile__block-title-row">
          <h2 className="customer-salon-profile__block-title font-heading">{title}</h2>
          {count != null ? (
            <span className="customer-salon-profile__block-count">{count}</span>
          ) : null}
        </div>
        <p className="customer-salon-profile__block-desc">{description}</p>
      </div>
    </header>
  );
}

export default function SalonProfilePage() {
  const { branchId = '' } = useParams();
  const { coords } = useCustomerLocation();

  const { data: salon, isLoading, isError } = useQuery({
    queryKey: ['salon-profile', branchId, coords?.latitude ?? null, coords?.longitude ?? null],
    queryFn: async () => {
      const rows = await branchesApi.list(
        coords ? { branch_id: branchId, latitude: coords.latitude, longitude: coords.longitude } : { branch_id: branchId },
      );
      return rows[0] as Branch | undefined;
    },
    enabled: !!branchId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['salon-profile-services', branchId],
    queryFn: () => servicesApi.list(),
    enabled: !!branchId && !!salon,
  });

  const { data: packages = [] } = useActivePackages(!!branchId && !!salon);
  const { data: employees = [] } = useQuery({
    queryKey: ['salon-profile-staff', branchId],
    queryFn: () => employeesApi.list(),
    enabled: !!branchId && !!salon,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['salon-profile-reviews', branchId],
    queryFn: () => reviewsApi.list({ branch_id: branchId }),
    enabled: !!branchId && !!salon,
  });

  const salonServices = useMemo(() => {
    if (!salon) return [];
    return filterCustomerServices(
      filterServicesForSalon(services.filter((s) => s.status === 'active'), salon.id),
      [salon],
    );
  }, [services, salon]);

  const salonPackages = useMemo(() => {
    if (!salon) return [];
    return filterPackagesForSalon(packages.filter((p) => p.status === 'active'), salon.id);
  }, [packages, salon]);

  const salonStaff = useMemo(
    () => employees.filter((e) => e.status === 'active' && e.branch_id === branchId),
    [employees, branchId],
  );

  const approvedReviews = useMemo(
    () => reviews.filter((review) => review.status === 'approved').slice(0, 6),
    [reviews],
  );

  const reviewStats = useMemo(() => salonReviewStats(reviews), [reviews]);
  const ratingLabel = formatBranchRatingSummary(reviewStats);

  const distanceKm = useMemo(() => {
    if (salon?.distance_km != null) return salon.distance_km;
    if (!coords || salon?.latitude == null || salon?.longitude == null) return null;
    return haversineDistanceKm(coords, { latitude: salon.latitude, longitude: salon.longitude });
  }, [salon, coords]);

  if (!branchId) return <Navigate to="/salons" replace />;
  if (!isLoading && (isError || !salon || salon.status !== 'active')) {
    return <Navigate to="/salons" replace />;
  }

  const hours = salon ? formatSalonHours(salon.opening_time, salon.closing_time) : null;
  const openStatus = salon ? getSalonOpenStatus(salon.opening_time, salon.closing_time) : null;
  const phoneHref = salon?.phone ? `tel:${salon.phone.replace(/[^\d+]/g, '')}` : undefined;
  const locationLine = salon ? [salon.address, salon.city].filter(Boolean).join(', ') : '';

  return (
    <div className="customer-page customer-salon-profile">
      <div className="customer-salon-profile__topbar">
        <div className="customer-container-wide customer-salon-profile__topbar-inner">
          <Link to="/salons" className="customer-salon-profile__back">
            <ArrowLeft className="h-4 w-4" />
            All salons
          </Link>
          {salon ? (
            <span className="customer-salon-profile__topbar-name">{salon.name}</span>
          ) : null}
        </div>
      </div>

      {isLoading || !salon ? (
        <p className="customer-container-wide py-24 text-center text-muted-foreground">Loading salon profile…</p>
      ) : (
        <>
          <section className="customer-salon-profile__shell">
            <div className="customer-container-wide">
              <div className="customer-salon-profile__hero">
                <div className="customer-salon-profile__hero-panel">
                  <div className="customer-salon-profile__hero-card">
                    <p className="customer-salon-profile__eyebrow">Salon profile</p>
                    <h1 className="customer-salon-profile__title font-heading">{salon.name}</h1>

                    {locationLine ? (
                      <p className="customer-salon-profile__location">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <span>{locationLine}</span>
                      </p>
                    ) : null}

                    <div className="customer-salon-profile__badges">
                      <BranchNearYouLabel distanceKm={distanceKm} variant="compact" branch={salon} />
                      {openStatus ? (
                        <span
                          className={`customer-salon-profile__badge customer-salon-profile__badge--${openStatus}`}
                        >
                          <span className="customer-salon-profile__status-dot" aria-hidden />
                          {openStatus === 'open' ? 'Open now' : 'Closed now'}
                        </span>
                      ) : null}
                      {ratingLabel ? (
                        <span className="customer-salon-profile__badge">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          {ratingLabel}
                        </span>
                      ) : null}
                    </div>

                    {reviewStats ? (
                      <div className="customer-salon-profile__rating-spotlight">
                        <div className="customer-salon-profile__rating-score">
                          <span className="customer-salon-profile__rating-value font-heading">
                            {reviewStats.averageRating.toFixed(1)}
                          </span>
                          <StarRating value={Math.round(reviewStats.averageRating)} size="sm" />
                        </div>
                        <p className="customer-salon-profile__rating-caption">
                          Average from {reviewStats.reviewCount}{' '}
                          {reviewStats.reviewCount === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                    ) : null}

                    {salon.description?.trim() ? (
                      <blockquote className="customer-salon-profile__about">
                        <Quote className="customer-salon-profile__about-icon" aria-hidden />
                        <p>{salon.description.trim()}</p>
                      </blockquote>
                    ) : null}

                    <div className="customer-salon-profile__metrics">
                      <div className="customer-salon-profile__metric">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <span className="customer-salon-profile__metric-label">Hours</span>
                          <span className="customer-salon-profile__metric-value">{hours || '—'}</span>
                        </div>
                      </div>
                      <div className="customer-salon-profile__metric">
                        <Scissors className="h-4 w-4 text-primary" />
                        <div>
                          <span className="customer-salon-profile__metric-label">Services</span>
                          <span className="customer-salon-profile__metric-value">{salonServices.length}</span>
                        </div>
                      </div>
                      <div className="customer-salon-profile__metric">
                        <Gift className="h-4 w-4 text-primary" />
                        <div>
                          <span className="customer-salon-profile__metric-label">Packages</span>
                          <span className="customer-salon-profile__metric-value">{salonPackages.length}</span>
                        </div>
                      </div>
                      <div className="customer-salon-profile__metric">
                        <Star className="h-4 w-4 text-primary" />
                        <div>
                          <span className="customer-salon-profile__metric-label">Reviews</span>
                          <span className="customer-salon-profile__metric-value">{reviewStats?.reviewCount ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="customer-salon-profile__contact">
                      {salon.phone ? (
                        <a href={phoneHref} className="customer-salon-profile__contact-item">
                          <Phone className="h-4 w-4" />
                          <span>{salon.phone}</span>
                        </a>
                      ) : null}
                      {salon.email ? (
                        <a href={`mailto:${salon.email}`} className="customer-salon-profile__contact-item">
                          <Mail className="h-4 w-4" />
                          <span>{salon.email}</span>
                        </a>
                      ) : null}
                    </div>

                    {salonStaff.length > 0 ? (
                      <div className="customer-salon-profile__team">
                        <p className="customer-salon-profile__team-label">
                          <User className="h-4 w-4" />
                          Our team
                        </p>
                        <div className="customer-salon-profile__team-grid">
                          {salonStaff.slice(0, 6).map((member) => (
                            <div key={member.id} className="customer-salon-profile__team-member">
                              <span className="customer-salon-profile__team-avatar" aria-hidden>
                                {personInitials(member.name)}
                              </span>
                              <div className="customer-salon-profile__team-copy">
                                <span className="customer-salon-profile__team-name">{member.name}</span>
                                {member.rating != null ? (
                                  <span className="customer-salon-profile__team-rating">
                                    <Star className="h-3 w-3 fill-accent text-accent" />
                                    {member.rating.toFixed(1)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="customer-salon-profile__cta-row">
                      <Button
                        asChild
                        size="lg"
                        className="customer-salon-profile__cta customer-btn-glow inline-flex w-full items-center justify-center gap-2 rounded-full sm:w-auto"
                      >
                        <Link to={bookBranchUrl(salon.id)}>
                          <CalendarCheck className="h-4 w-4" />
                          Book at this salon
                        </Link>
                      </Button>
                      {salonServices.length > 0 ? (
                        <Button asChild variant="outline" size="lg" className="rounded-full sm:w-auto">
                          <a href="#salon-services">
                            View services
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="customer-salon-profile__hero-media">
                  <CoverImage
                    src={salon.image_url}
                    alt={salon.name}
                    kind="branch"
                    entityId={salon.id}
                    entityName={salon.name}
                    entityDescription={branchImageHints(salon)}
                    className="customer-salon-profile__hero-image"
                  />
                  <div className="customer-salon-profile__hero-media-badge">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified salon
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ProfileSectionNav
            serviceCount={salonServices.length}
            packageCount={salonPackages.length}
            reviewCount={approvedReviews.length}
          />

          <div className="customer-salon-profile__highlights">
            <div className="customer-container-wide customer-salon-profile__highlights-inner">
              <div className="customer-salon-profile__highlight">
                <Scissors className="h-4 w-4 text-primary" />
                <span>{salonServices.length} treatments available</span>
              </div>
              {hours ? (
                <div className="customer-salon-profile__highlight">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{hours}</span>
                </div>
              ) : null}
              {salonStaff.length > 0 ? (
                <div className="customer-salon-profile__highlight">
                  <User className="h-4 w-4 text-primary" />
                  <span>{salonStaff.length} team {salonStaff.length === 1 ? 'member' : 'members'}</span>
                </div>
              ) : null}
              {reviewStats ? (
                <div className="customer-salon-profile__highlight">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span>{reviewStats.averageRating.toFixed(1)} client rating</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="customer-container-wide customer-salon-profile__content pb-16 pt-10 md:pb-20 md:pt-14">
            <section className="customer-salon-profile__block customer-salon-profile__block-card">
              <ProfileSectionHeader
                id="salon-services"
                title="Services"
                description="Choose a treatment and book your visit."
                count={salonServices.length}
              />

              {salonServices.length === 0 ? (
                <div className="customer-salon-profile__empty">
                  <Scissors className="h-7 w-7" />
                  <p>No services listed for this salon yet.</p>
                </div>
              ) : (
                <div className="customer-salon-profile__service-list">
                  {salonServices.map((service) => (
                    <SalonProfileServiceRow
                      key={service.id}
                      service={service}
                      branchId={salon.id}
                    />
                  ))}
                </div>
              )}
            </section>

            {salonPackages.length > 0 ? (
              <section className="customer-salon-profile__block customer-salon-profile__block-card">
                <ProfileSectionHeader
                  id="salon-packages"
                  title="Packages"
                  description="Save with bundled sessions at this location."
                  count={salonPackages.length}
                />
                <div className="customer-salon-profile__package-grid">
                  {salonPackages.map((pkg) => (
                    <CustomerPackageCard
                      key={pkg.id}
                      pkg={pkg}
                      compact
                      showBookButton
                      bookHref={`/book?package=${encodeURIComponent(pkg.id)}&branch=${encodeURIComponent(salon.id)}`}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {approvedReviews.length > 0 ? (
              <section className="customer-salon-profile__block customer-salon-profile__block-card">
                <ProfileSectionHeader
                  id="salon-reviews"
                  title="Client reviews"
                  description="Recent feedback from verified visits."
                  count={approvedReviews.length}
                />
                <div className="customer-salon-profile__review-grid">
                  {approvedReviews.map((review) => (
                    <article key={review.id} className="customer-salon-profile__review">
                      <Quote className="customer-salon-profile__review-quote" aria-hidden />
                      <div className="customer-salon-profile__review-head">
                        <div className="customer-salon-profile__review-author">
                          <span className="customer-salon-profile__review-avatar" aria-hidden>
                            {personInitials(review.customer_name)}
                          </span>
                          <div>
                            <p className="customer-salon-profile__review-name">{review.customer_name}</p>
                            {review.service_title ? (
                              <p className="customer-salon-profile__review-service">{review.service_title}</p>
                            ) : null}
                          </div>
                        </div>
                        <StarRating value={review.rating} size="sm" />
                      </div>
                      {review.comment ? (
                        <p className="customer-salon-profile__review-text">{review.comment}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="customer-salon-profile__book-band hidden lg:block">
              <div className="customer-salon-profile__book-band-inner">
                <div>
                  <p className="customer-salon-profile__book-band-eyebrow">Ready when you are</p>
                  <h2 className="customer-salon-profile__book-band-title font-heading">
                    Book your visit at {salon.name}
                  </h2>
                  <p className="customer-salon-profile__book-band-desc">
                    Pick a service above or start with a general appointment.
                  </p>
                </div>
                <Button asChild size="lg" className="customer-btn-glow rounded-full px-8">
                  <Link to={bookBranchUrl(salon.id)}>
                    <CalendarCheck className="h-4 w-4" />
                    Book appointment
                  </Link>
                </Button>
              </div>
            </section>
          </div>

          <div className="customer-salon-profile__mobile-bar lg:hidden">
            <Button asChild className="customer-btn-glow w-full rounded-full">
              <Link to={bookBranchUrl(salon.id)}>Book at this salon</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
