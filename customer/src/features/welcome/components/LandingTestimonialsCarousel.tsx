import { CarouselItem } from '@/components/ui/carousel';
import { LandingCarouselShell } from '@/features/welcome/components/LandingCarouselShell';
import {
  fallbackTestimonials,
  type LandingTestimonial,
} from '@/features/welcome/lib/landing-content';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import type { Review } from '@mit-salon/shared/types';
import { Quote, Star } from 'lucide-react';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
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
  const meta = [item.service_title, item.branch_name, item.employee_name].filter(Boolean).join(' · ');

  return (
    <Card className="landing-showcase-card landing-testimonial-card h-full">
      <CardContent className="flex h-full flex-col p-5 sm:p-8 md:p-9">
        <Quote className="h-9 w-9 text-primary/20" />
        <Stars rating={item.rating} />
        <p className="mt-5 flex-1 text-base leading-[1.7] text-foreground/90 md:text-[1.05rem]">
          &ldquo;{item.comment}&rdquo;
        </p>
        <div className="mt-7 border-t border-border/50 pt-5">
          <p className="font-heading text-base font-semibold">{item.customer_name}</p>
          {meta ? <p className="mt-1 text-sm text-muted-foreground">{meta}</p> : null}
        </div>
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
    >
      {items.map((item) => (
        <CarouselItem key={item.id} className="basis-full pl-0 sm:basis-1/2 sm:pl-4 lg:basis-1/3">
          <TestimonialCard item={item} />
        </CarouselItem>
      ))}
    </LandingCarouselShell>
  );
}
