import type { Review } from '../types';

export type BranchReviewStats = {
  averageRating: number;
  reviewCount: number;
};

export function resolveReviewBranchId(review: Pick<Review, 'branch_id'>): string | null {
  const id = review.branch_id?.trim();
  return id || null;
}

export function buildBranchReviewStats(reviews: Review[]): Map<string, BranchReviewStats> {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const review of reviews) {
    if (review.status !== 'approved') continue;
    const branchId = resolveReviewBranchId(review);
    if (!branchId) continue;
    const rating = Number(review.rating);
    if (!Number.isFinite(rating)) continue;
    const prev = buckets.get(branchId) ?? { total: 0, count: 0 };
    buckets.set(branchId, { total: prev.total + rating, count: prev.count + 1 });
  }

  const stats = new Map<string, BranchReviewStats>();
  for (const [branchId, { total, count }] of buckets) {
    stats.set(branchId, {
      averageRating: total / count,
      reviewCount: count,
    });
  }
  return stats;
}

export function formatBranchRatingSummary(stats: BranchReviewStats | null | undefined): string | null {
  if (!stats || stats.reviewCount <= 0) return null;
  const avg = stats.averageRating.toFixed(1);
  const label = stats.reviewCount === 1 ? '1 review' : `${stats.reviewCount} reviews`;
  return `${avg} · ${label}`;
}
