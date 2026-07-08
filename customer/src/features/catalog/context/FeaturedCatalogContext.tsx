import { useFeaturedCatalogIds } from '@/features/catalog/hooks/useFeaturedCatalogIds';
import { createContext, useContext, type ReactNode } from 'react';

type FeaturedCatalogContextValue = {
  isFeaturedService: (id: string) => boolean;
  isFeaturedPackage: (id: string) => boolean;
  isFeaturedBranch: (id: string) => boolean;
  isLoading: boolean;
};

const FeaturedCatalogContext = createContext<FeaturedCatalogContextValue>({
  isFeaturedService: () => false,
  isFeaturedPackage: () => false,
  isFeaturedBranch: () => false,
  isLoading: true,
});

export function FeaturedCatalogProvider({ children }: { children: ReactNode }) {
  const { isFeaturedService, isFeaturedPackage, isFeaturedBranch, isLoading } = useFeaturedCatalogIds();

  return (
    <FeaturedCatalogContext.Provider
      value={{ isFeaturedService, isFeaturedPackage, isFeaturedBranch, isLoading }}
    >
      {children}
    </FeaturedCatalogContext.Provider>
  );
}

export function useFeaturedCatalog() {
  return useContext(FeaturedCatalogContext);
}
