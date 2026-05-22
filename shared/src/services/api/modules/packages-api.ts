import { USE_MOCK_API, apiRequest } from '../client';
import { createCrudApi } from './crud';
import type { Package } from '../../../types';

function normalize(pkg: Package): Package {
  return { ...pkg, service_ids: pkg.service_ids ?? [], branch_ids: pkg.branch_ids ?? [] };
}

const mock = createCrudApi<Package>('packages');

export const packagesApi = USE_MOCK_API
  ? mock
  : {
      async list(): Promise<Package[]> {
        return (await apiRequest<Package[]>('/packages')).map(normalize);
      },
      async get(id: string): Promise<Package | undefined> {
        try {
          return normalize(await apiRequest<Package>(`/packages/${id}`));
        } catch {
          return undefined;
        }
      },
      async create(data: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Promise<Package> {
        return normalize(await apiRequest<Package>('/packages', { method: 'POST', body: JSON.stringify(data) }));
      },
      async update(id: string, data: Partial<Package>): Promise<Package> {
        return normalize(
          await apiRequest<Package>(`/packages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        );
      },
      async delete(id: string): Promise<void> {
        await apiRequest<void>(`/packages/${id}`, { method: 'DELETE' });
      },
    };
