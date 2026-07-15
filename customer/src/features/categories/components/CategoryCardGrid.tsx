import { CustomerCategoryCard } from '@/features/categories/components/CustomerCategoryCard';
import type { Service, ServiceCategory } from '@mit-salon/shared/types';
import { Grid3X3 } from 'lucide-react';
import { useMemo } from 'react';

type CategoryCardGridProps = {
  categories: ServiceCategory[];
  services: Service[];
  bookHref?: string;
  emptyMessage?: string;
};

export function CategoryCardGrid({
  categories,
  services,
  bookHref = '/book',
  emptyMessage = 'No categories available yet. Check back soon — our team organizes new treatments regularly.',
}: CategoryCardGridProps) {
  const serviceCountByCategoryId = useMemo(() => {
    const map = new Map<string, number>();
    for (const service of services) {
      if (service.status !== 'active') continue;
      map.set(service.category_id, (map.get(service.category_id) ?? 0) + 1);
    }
    return map;
  }, [services]);

  if (categories.length === 0) {
    return (
      <div className="customer-package-empty rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
        <Grid3X3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {categories.map((category) => (
        <CustomerCategoryCard
          key={category.id}
          category={category}
          serviceCount={serviceCountByCategoryId.get(category.id) ?? 0}
          bookHref={bookHref}
        />
      ))}
    </div>
  );
}
