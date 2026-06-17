import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getBranchesForPackage } from './package-branches.js';
import type { Branch, Package, Service } from '../types/index.js';

const branchA: Branch = {
  id: 'b1',
  name: 'Salon A',
  address: 'A St',
  status: 'active',
  created_at: '',
  updated_at: '',
};

const branchB: Branch = {
  id: 'b2',
  name: 'Salon B',
  address: 'B St',
  status: 'active',
  created_at: '',
  updated_at: '',
};

const serviceAtAOnly: Service = {
  id: 's1',
  title: 'Cut',
  price: 30,
  duration_minutes: 60,
  category_id: 'c1',
  branch_ids: ['b1'],
  employee_ids: [],
  status: 'active',
  created_at: '',
  updated_at: '',
};

describe('getBranchesForPackage', () => {
  it('returns all admin-assigned active branches even when services differ per salon', () => {
    const pkg: Package = {
      id: 'p1',
      name: 'Combo',
      price: 100,
      service_ids: ['s1'],
      branch_ids: ['b1', 'b2'],
      total_sessions: 1,
      validity_days: 30,
      status: 'active',
      created_at: '',
      updated_at: '',
    };

    const result = getBranchesForPackage(pkg, [branchA, branchB], [serviceAtAOnly]);
    assert.equal(result.length, 2);
    assert.ok(result.some((b) => b.id === 'b1'));
    assert.ok(result.some((b) => b.id === 'b2'));
  });

  it('falls back to service coverage when package has no branch_ids', () => {
    const pkg: Package = {
      id: 'p2',
      name: 'Open',
      price: 50,
      service_ids: ['s1'],
      branch_ids: [],
      total_sessions: 1,
      validity_days: 30,
      status: 'active',
      created_at: '',
      updated_at: '',
    };

    const result = getBranchesForPackage(pkg, [branchA, branchB], [serviceAtAOnly]);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, 'b1');
  });
});
