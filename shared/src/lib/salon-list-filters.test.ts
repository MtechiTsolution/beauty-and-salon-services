import assert from 'node:assert/strict';
import test from 'node:test';
import type { BranchWithDistance } from './branch-distance';
import {
  DEFAULT_SALON_LIST_FILTERS,
  filterSalonsForList,
  resolveMaxDistanceKm,
} from './salon-list-filters';
import type { BranchReviewStats } from './salon-review-stats';

function salon(id: string, name: string, distance_km: number | null = null): BranchWithDistance {
  return {
    id,
    name,
    address: '',
    status: 'active',
    created_at: '',
    updated_at: '',
    distance_km,
  };
}

test('resolveMaxDistanceKm handles presets and custom', () => {
  assert.equal(resolveMaxDistanceKm({ ...DEFAULT_SALON_LIST_FILTERS, distance: 'all' }), null);
  assert.equal(resolveMaxDistanceKm({ ...DEFAULT_SALON_LIST_FILTERS, distance: 5 }), 5);
  assert.equal(
    resolveMaxDistanceKm({ ...DEFAULT_SALON_LIST_FILTERS, distance: 'custom', customDistanceKm: '12.5' }),
    12.5,
  );
});

test('filterSalonsForList applies distance and rating filters', () => {
  const salons = [salon('a', 'Alpha', 2), salon('b', 'Beta', 8), salon('c', 'Gamma', 0.5)];
  const stats = new Map<string, BranchReviewStats>([
    ['a', { averageRating: 4.5, reviewCount: 2 }],
    ['b', { averageRating: 3.2, reviewCount: 1 }],
    ['c', { averageRating: 5, reviewCount: 3 }],
  ]);

  const withinFiveKm = filterSalonsForList(
    salons,
    { ...DEFAULT_SALON_LIST_FILTERS, distance: 5 },
    stats,
    { hasLocation: true },
  );
  assert.deepEqual(
    withinFiveKm.map((s) => s.id),
    ['c', 'a'],
  );

  const ratedFourPlus = filterSalonsForList(
    salons,
    { ...DEFAULT_SALON_LIST_FILTERS, minRating: 4 },
    stats,
    { hasLocation: true },
  );
  assert.deepEqual(
    ratedFourPlus.map((s) => s.id),
    ['c', 'a'],
  );
});
