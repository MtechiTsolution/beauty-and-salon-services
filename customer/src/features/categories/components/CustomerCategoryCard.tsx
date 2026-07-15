import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card } from '@mit-salon/shared/components/ui/card';
import { cn } from '@mit-salon/shared/lib/utils';
import type { ServiceCategory } from '@mit-salon/shared/types';
import { Layers, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

type CustomerCategoryCardProps = {
  category: ServiceCategory;
  serviceCount?: number;
  bookHref?: string;
  className?: string;
};

export function CustomerCategoryCard({
  category,
  serviceCount = 0,
  bookHref = '/book',
  className,
}: CustomerCategoryCardProps) {
  return (
    <Card
      className={cn(
        'customer-package-card group flex h-full flex-col overflow-hidden border-border/70 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
    >
      <div className="relative aspect-[2/1] shrink-0 overflow-hidden">
        <CoverImage
          src={category.image_url}
          alt={category.name}
          kind="category"
          entityId={category.id}
          entityName={category.name}
          entityDescription={category.description}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent sm:from-black/75 sm:via-black/20" />
        <div className="absolute left-3 top-3">
          <span className="customer-package-price-badge">
            {serviceCount} service{serviceCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
          <h3 className="font-heading text-sm font-semibold tracking-tight text-white drop-shadow-sm sm:text-base">
            {category.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          <span className="customer-package-chip">
            <Layers className="h-3 w-3" />
            {serviceCount} treatment{serviceCount === 1 ? '' : 's'}
          </span>
          <span className="customer-package-chip customer-package-chip--accent">
            <Scissors className="h-3 w-3" />
            Category
          </span>
        </div>

        <p className="mt-1.5 line-clamp-2 min-h-[2rem] text-xs leading-snug text-muted-foreground">
          {category.description?.trim() || '\u00A0'}
        </p>

        <Button asChild size="sm" className="mt-auto h-8 w-full rounded-full text-xs font-semibold shadow-sm sm:h-9 sm:text-sm">
          <Link to={bookHref}>Book now</Link>
        </Button>
      </div>
    </Card>
  );
}
