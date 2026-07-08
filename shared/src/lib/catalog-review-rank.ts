import type { Review } from '../types';

/** Count approved reviews per service or package id (`reviews.service_id`). */
export function countApprovedReviewsByOfferingId(reviews: Review[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const review of reviews) {
    if (review.status !== 'approved') continue;
    const offeringId = review.service_id?.trim();
    if (!offeringId) continue;
    counts.set(offeringId, (counts.get(offeringId) ?? 0) + 1);
  }
  return counts;
}

/** Sort reviews so offerings with more reviews appear first (4 before 3, etc.). */
export function sortReviewsByOfferingReviewCount(reviews: Review[]): Review[] {
  const counts = countApprovedReviewsByOfferingId(reviews);
  return [...reviews].sort((a, b) => {
    const aCount = a.service_id?.trim() ? (counts.get(a.service_id.trim()) ?? 0) : 0;
    const bCount = b.service_id?.trim() ? (counts.get(b.service_id.trim()) ?? 0) : 0;
    if (bCount !== aCount) return bCount - aCount;
    const aTime = Date.parse(a.created_at ?? '') || 0;
    const bTime = Date.parse(b.created_at ?? '') || 0;
    return bTime - aTime;
  });
}

export type CatalogReviewRankStats = {
  review_count: number;
  avg_rating: number;
  score: number;
  booking_count: number;
};

export type CatalogReviewRankItem = {
  id: string;
  label: string;
  featured: boolean;
  sort_order: number | null;
  stats: CatalogReviewRankStats;
};

/** Featured first; within each group order by review count (desc), then score, then name. */
export function compareCatalogItemsByReviewPopularity(
  a: CatalogReviewRankItem,
  b: CatalogReviewRankItem,
): number {
  if (a.featured && b.featured) {
    const reviewDiff = b.stats.review_count - a.stats.review_count;
    if (reviewDiff !== 0) return reviewDiff;
    const order = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (order !== 0) return order;
  } else if (a.featured !== b.featured) {
    return a.featured ? -1 : 1;
  }

  const reviewDiff = b.stats.review_count - a.stats.review_count;
  if (reviewDiff !== 0) return reviewDiff;

  const scoreDiff = b.stats.score - a.stats.score;
  if (scoreDiff !== 0) return scoreDiff;

  return a.label.localeCompare(b.label);
}
