import { CarouselItem } from '@/components/ui/carousel';
import { bookBranchUrl, bookServiceUrl } from '@/features/booking/lib/booking-links';
import { LandingCarouselShell } from '@/features/welcome/components/LandingCarouselShell';
import {
  fallbackTestimonials,
  type LandingTestimonial,
} from '@/features/welcome/lib/landing-content';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { cn } from '@mit-salon/shared/lib/utils';
import { sortReviewsByOfferingReviewCount } from '@mit-salon/shared/lib/catalog-review-rank';
import type { Review } from '@mit-salon/shared/types';
import { Star } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="landing-testimonial-card__stars flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

type TestimonialMetaItem = {
  label: string;
  value: string;
  href?: string;
};

function TestimonialMetaValue({ item }: { item: TestimonialMetaItem }) {
  if (item.href) {
    return (
      <Link
        to={item.href}
        className={cn('landing-testimonial-card__meta-value', 'landing-testimonial-card__meta-link')}
      >
        {item.value}
      </Link>
    );
  }
  return <span className={cn('landing-testimonial-card__meta-value', item.value === '—' && 'text-muted-foreground')}>{item.value}</span>;
}

function TestimonialCard({ item }: { item: LandingTestimonial }) {
  const initials = item.customer_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const metaItems: TestimonialMetaItem[] = [
    {
      label: 'Service',
      value: item.service_title?.trim() || '—',
      href:
        item.service_id && item.service_title?.trim()
          ? bookServiceUrl(item.service_id, item.branch_id)
          : undefined,
    },
    {
      label: 'Salon',
      value: item.branch_name?.trim() || '—',
      href: item.branch_id && item.branch_name?.trim() ? bookBranchUrl(item.branch_id) : undefined,
    },
    {
      label: 'Stylist',
      value: item.employee_name?.trim() || '—',
    },
  ];

  return (
    <Card className="landing-showcase-card landing-testimonial-card">
      <CardContent className="landing-testimonial-card__body flex flex-col p-0">
        <div className="landing-testimonial-card__head">
          <div className="landing-testimonial-card__avatar" aria-hidden>
            {initials || '?'}
          </div>
          <div className="landing-testimonial-card__intro min-w-0 flex-1">
            <p className="landing-testimonial-card__name">{item.customer_name}</p>
            <Stars rating={item.rating} />
          </div>
        </div>

        <blockquote className="landing-testimonial-card__quote">
          <p>{item.comment}</p>
        </blockquote>

        <div className="landing-testimonial-card__meta">
          {metaItems.map((entry) => (
            <div key={entry.label} className="landing-testimonial-card__meta-item">
              <span className="landing-testimonial-card__meta-label">{entry.label}</span>
              <TestimonialMetaValue item={entry} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function mapReviewToTestimonial(review: Review): LandingTestimonial | null {
  if (review.status !== 'approved') return null;
  const comment = review.comment?.trim();
  return {
    id: review.id,
    customer_name: review.customer_name,
    rating: review.rating,
    comment: comment || 'Rated their visit after a completed appointment.',
    service_title: review.service_title,
    service_id: review.service_id,
    branch_name: review.branch_name,
    branch_id: review.branch_id,
    employee_name: review.employee_name,
  };
}

type LandingTestimonialsCarouselProps = {
  reviews: Review[];
};

export function LandingTestimonialsCarousel({ reviews }: LandingTestimonialsCarouselProps) {
  const approvedReviews = useMemo(
    () => sortReviewsByOfferingReviewCount(reviews.filter((review) => review.status === 'approved')),
    [reviews],
  );

  const items =
    approvedReviews.map(mapReviewToTestimonial).filter((item): item is LandingTestimonial => item != null)
      .length > 0
      ? approvedReviews
          .map(mapReviewToTestimonial)
          .filter((item): item is LandingTestimonial => item != null)
          .slice(0, 8)
      : fallbackTestimonials;

  return (
    <LandingCarouselShell
      id="reviews"
      className="landing-section--muted"
      eyebrow={
        <span className="landing-eyebrow landing-eyebrow--accent">
          <Star className="h-4 w-4 fill-current" />
          Client stories
        </span>
      }
      title="Loved by our customers"
      description="Real feedback from completed visits — book with confidence and share your experience after your appointment."
      autoplayDelay={7000}
      compact
      stretchSlides={false}
    >
      {items.map((item) => (
        <CarouselItem
          key={item.id}
          className="basis-full self-start pl-0 sm:basis-1/2 sm:pl-4 lg:basis-1/3"
        >
          <TestimonialCard item={item} />
        </CarouselItem>
      ))}
    </LandingCarouselShell>
  );
}
