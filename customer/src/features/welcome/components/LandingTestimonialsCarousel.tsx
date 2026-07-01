import { CarouselItem } from '@/components/ui/carousel';
import { LandingCarouselShell } from '@/features/welcome/components/LandingCarouselShell';
import {
  fallbackTestimonials,
  type LandingTestimonial,
} from '@/features/welcome/lib/landing-content';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import type { Review } from '@mit-salon/shared/types';
import { Star } from 'lucide-react';

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

function TestimonialCard({ item }: { item: LandingTestimonial }) {
  const initials = item.customer_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const metaItems = [
    item.service_title ? { label: 'Service', value: item.service_title } : null,
    item.branch_name ? { label: 'Salon', value: item.branch_name } : null,
    item.employee_name ? { label: 'Stylist', value: item.employee_name } : null,
  ].filter((entry): entry is { label: string; value: string } => entry != null);

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

        {metaItems.length > 0 ? (
          <div className="landing-testimonial-card__meta">
            {metaItems.map((entry) => (
              <div key={entry.label} className="landing-testimonial-card__meta-item">
                <span className="landing-testimonial-card__meta-label">{entry.label}</span>
                <span className="landing-testimonial-card__meta-value">{entry.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function mapReviewToTestimonial(review: Review): LandingTestimonial | null {
  if (review.status !== 'approved' || !review.comment?.trim()) return null;
  return {
    id: review.id,
    customer_name: review.customer_name,
    rating: review.rating,
    comment: review.comment,
    service_title: review.service_title,
    branch_name: review.branch_name,
    employee_name: review.employee_name,
  };
}

type LandingTestimonialsCarouselProps = {
  reviews: Review[];
};

export function LandingTestimonialsCarousel({ reviews }: LandingTestimonialsCarouselProps) {
  const items =
    reviews.map(mapReviewToTestimonial).filter((item): item is LandingTestimonial => item != null).length > 0
      ? reviews
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
