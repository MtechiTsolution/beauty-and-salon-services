import { describe, expect, it } from 'vitest';
import {
  branchToDirectionsQuery,
  buildBranchDirectionsUrl,
  canOpenBranchDirections,
} from './maps-directions';

describe('maps-directions', () => {
  it('uses coordinates when available', () => {
    const branch = {
      latitude: 31.418,
      longitude: 73.079,
      name: 'Test Salon',
      address: 'Sant Pura',
      city: 'Faisalabad',
    };

    expect(branchToDirectionsQuery(branch)).toBe('31.418,73.079');
    expect(canOpenBranchDirections(branch)).toBe(true);
    expect(buildBranchDirectionsUrl(branch)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=31.418%2C73.079&travelmode=driving',
    );
  });

  it('falls back to address when coordinates are missing', () => {
    const branch = {
      latitude: undefined,
      longitude: undefined,
      name: 'Test Salon',
      address: 'Sant Pura',
      city: 'Faisalabad',
    };

    expect(branchToDirectionsQuery(branch)).toBe('Sant Pura, Faisalabad');
    expect(buildBranchDirectionsUrl(branch, { latitude: 31.4, longitude: 73.0 })).toContain(
      'origin=31.4%2C73',
    );
  });

  it('returns null when no destination can be resolved', () => {
    const branch = {
      latitude: undefined,
      longitude: undefined,
      name: 'Test Salon',
      address: '',
      city: '',
    };

    expect(branchToDirectionsQuery(branch)).toBeNull();
    expect(buildBranchDirectionsUrl(branch)).toBeNull();
  });
});
