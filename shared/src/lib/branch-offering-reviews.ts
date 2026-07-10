import { averageRating } from './booking-reviews';
import { parseCoordinate } from './branch-distance';
import { resolveReviewBranchId, type BranchReviewStats } from './salon-review-stats';
import type { Branch, Package, Review, Service } from '../types';

export function packageReviewOfferingIds(pkg: Pick<Package, 'id' | 'service_ids'>): string[] {
  return [pkg.id, ...pkg.service_ids];
}

export function offeringRatingSummaryAtBranch(
  reviews: Review[],
  branchId: string,
  offeringIds: string[],
): BranchReviewStats | null {
  const idSet = new Set(offeringIds.filter(Boolean));
  if (!idSet.size) return null;

  const matched = reviews.filter((review) => {
    if (review.status !== 'approved') return false;
    if (resolveReviewBranchId(review) !== branchId) return false;
    const offeringId = review.service_id?.trim();
    return offeringId ? idSet.has(offeringId) : false;
  });

  if (matched.length === 0) return null;
  return {
    averageRating: averageRating(matched),
    reviewCount: matched.length,
  };
}

export function serviceRatingAtBranch(
  reviews: Review[],
  branchId: string,
  service: Pick<Service, 'id'>,
): BranchReviewStats | null {
  return offeringRatingSummaryAtBranch(reviews, branchId, [service.id]);
}

export function packageRatingAtBranch(
  reviews: Review[],
  branchId: string,
  pkg: Pick<Package, 'id' | 'service_ids'>,
): BranchReviewStats | null {
  return offeringRatingSummaryAtBranch(reviews, branchId, packageReviewOfferingIds(pkg));
}

function compareRatingStats(
  a: BranchReviewStats | null | undefined,
  b: BranchReviewStats | null | undefined,
): number {
  const aHas = (a?.reviewCount ?? 0) > 0;
  const bHas = (b?.reviewCount ?? 0) > 0;
  if (aHas !== bHas) return aHas ? -1 : 1;
  if (!aHas || !bHas || !a || !b) return 0;

  const ratingDiff = b.averageRating - a.averageRating;
  if (ratingDiff !== 0) return ratingDiff;

  return b.reviewCount - a.reviewCount;
}

/** Salons with reviews first, then higher average rating, then distance when available. */
export function sortBranchesForBookingRating<T extends Branch>(
  branches: T[],
  statsForBranch: (branchId: string) => BranchReviewStats | null | undefined,
): T[] {
  return [...branches].sort((a, b) => {
    const ratingOrder = compareRatingStats(statsForBranch(a.id), statsForBranch(b.id));
    if (ratingOrder !== 0) return ratingOrder;

    const aDist = parseCoordinate(a.distance_km);
    const bDist = parseCoordinate(b.distance_km);
    if (aDist != null && bDist != null) {
      const diff = aDist - bDist;
      if (diff !== 0) return diff;
    } else if (aDist != null) {
      return -1;
    } else if (bDist != null) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });
}

/** Services or packages at a salon — rated offerings first, then higher average. */
export function sortOfferingsByBranchRating<T>(
  items: T[],
  branchId: string,
  reviews: Review[],
  getOfferingIds: (item: T) => string[],
  getLabel: (item: T) => string,
): T[] {
  return [...items].sort((a, b) => {
    const aStats = offeringRatingSummaryAtBranch(reviews, branchId, getOfferingIds(a));
    const bStats = offeringRatingSummaryAtBranch(reviews, branchId, getOfferingIds(b));
    const ratingOrder = compareRatingStats(aStats, bStats);
    if (ratingOrder !== 0) return ratingOrder;
    return getLabel(a).localeCompare(getLabel(b));
  });
}

export function branchRatingForBookingChoice(
  reviews: Review[],
  branchId: string,
  options: {
    branchStats: Map<string, BranchReviewStats>;
    prefilledService?: Pick<Service, 'id'> | null;
    prefilledPackage?: Pick<Package, 'id' | 'service_ids'> | null;
  },
): BranchReviewStats | null {
  if (options.prefilledPackage) {
    return packageRatingAtBranch(reviews, branchId, options.prefilledPackage);
  }
  if (options.prefilledService) {
    return serviceRatingAtBranch(reviews, branchId, options.prefilledService);
  }
  return options.branchStats.get(branchId) ?? null;
}
