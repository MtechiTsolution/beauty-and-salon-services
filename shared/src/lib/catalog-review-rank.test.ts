import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareCatalogItemsByReviewPopularity,
  countApprovedReviewsByOfferingId,
  sortReviewsByOfferingReviewCount,
} from './catalog-review-rank';
import type { Review } from '../types';

function review(partial: Partial<Review> & Pick<Review, 'id' | 'service_id'>): Review {
  return {
    id: partial.id,
    service_id: partial.service_id,
    customer_email: partial.customer_email ?? 'a@b.com',
    customer_name: partial.customer_name ?? 'Test',
    rating: partial.rating ?? 5,
    status: partial.status ?? 'approved',
    created_at: partial.created_at ?? '2026-01-01T00:00:00.000Z',
    updated_at: partial.updated_at ?? '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('countApprovedReviewsByOfferingId', () => {
  it('counts only approved reviews with service_id', () => {
    const counts = countApprovedReviewsByOfferingId([
      review({ id: '1', service_id: 'svc-a' }),
      review({ id: '2', service_id: 'svc-a' }),
      review({ id: '3', service_id: 'svc-b' }),
      review({ id: '4', service_id: 'svc-a', status: 'pending' }),
      review({ id: '5', service_id: '' }),
    ]);
    assert.equal(counts.get('svc-a'), 2);
    assert.equal(counts.get('svc-b'), 1);
  });
});

describe('sortReviewsByOfferingReviewCount', () => {
  it('orders reviews by offering review count descending', () => {
    const sorted = sortReviewsByOfferingReviewCount([
      review({ id: 'r1', service_id: 'svc-low', created_at: '2026-01-03T00:00:00.000Z' }),
      review({ id: 'r2', service_id: 'svc-high', created_at: '2026-01-01T00:00:00.000Z' }),
      review({ id: 'r3', service_id: 'svc-high', created_at: '2026-01-02T00:00:00.000Z' }),
      review({ id: 'r4', service_id: 'svc-high', created_at: '2026-01-04T00:00:00.000Z' }),
      review({ id: 'r5', service_id: 'svc-high', created_at: '2026-01-05T00:00:00.000Z' }),
    ]);
    assert.deepEqual(
      sorted.map((r) => r.id),
      ['r5', 'r4', 'r3', 'r2', 'r1'],
    );
  });
});

describe('compareCatalogItemsByReviewPopularity', () => {
  const item = (
    id: string,
    featured: boolean,
    review_count: number,
    sort_order: number | null = null,
  ) => ({
    id,
    label: id,
    featured,
    sort_order,
    stats: { review_count, avg_rating: 0, score: 0, booking_count: 0 },
  });

  it('sorts featured items by review count before manual sort order', () => {
    const a = item('a', true, 3, 0);
    const b = item('b', true, 4, 1);
    assert.ok(compareCatalogItemsByReviewPopularity(a, b) > 0);
    assert.ok(compareCatalogItemsByReviewPopularity(b, a) < 0);
  });

  it('keeps featured items before non-featured', () => {
    const featured = item('f', true, 0);
    const regular = item('r', false, 10);
    assert.ok(compareCatalogItemsByReviewPopularity(featured, regular) < 0);
  });
});
