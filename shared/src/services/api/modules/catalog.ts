import { apiRequest } from '../client';
import type { Branch, Package, Service } from '../../../types';

export type FeaturedCatalogIds = {
  service_ids: string[];
  package_ids: string[];
  branch_ids: string[];
};

export const catalogApi = {
  featuredIds(): Promise<FeaturedCatalogIds> {
    return apiRequest<FeaturedCatalogIds>('/catalog/featured-ids');
  },

  popularServices(limit = 12): Promise<Service[]> {
    return apiRequest<Service[]>(`/catalog/popular/services?limit=${limit}`);
  },

  popularPackages(limit = 50): Promise<Package[]> {
    return apiRequest<Package[]>(`/catalog/popular/packages?limit=${limit}`);
  },

  popularSalons(limit = 12): Promise<Branch[]> {
    return apiRequest<Branch[]>(`/catalog/popular/salons?limit=${limit}`);
  },
};
