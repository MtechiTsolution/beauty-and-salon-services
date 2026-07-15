import { bookServiceUrl } from '@/features/booking/lib/booking-links';
import { CatalogPopularBadge } from '@/features/catalog/components/CatalogPopularBadge';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Button } from '@mit-salon/shared/components/ui/button';
import { useFormatMoney } from '@mit-salon/shared/hooks/useCurrency';
import type { Service } from '@mit-salon/shared/types';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

type SalonProfileServiceRowProps = {
  service: Service;
  branchId: string;
};

export function SalonProfileServiceRow({ service, branchId }: SalonProfileServiceRowProps) {
  const formatMoney = useFormatMoney();
  return (
    <article
      className={`customer-salon-service-row group${service.is_featured ? ' customer-salon-service-row--featured' : ''}`}
    >
      <Link to={bookServiceUrl(service.id, branchId)} className="customer-salon-service-row__media">
        <CoverImage
          src={service.image_url}
          alt={service.title}
          kind="service"
          entityId={service.id}
          entityName={service.title}
          entityDescription={service.description}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <CatalogPopularBadge
          entityType="service"
          entityId={service.id}
          isFeatured={service.is_featured}
          variant="overlay"
        />
      </Link>

      <div className="customer-salon-service-row__body">
        <div className="customer-salon-service-row__copy">
          <h3 className="customer-salon-service-row__title font-heading">{service.title}</h3>
          <p className="customer-salon-service-row__desc">
            {service.description?.trim() || 'Professional treatment at this salon.'}
          </p>
          <p className="customer-salon-service-row__meta">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {service.duration_minutes} min
          </p>
        </div>
        <div className="customer-salon-service-row__actions">
          <p className="customer-salon-service-row__price">{formatMoney(service.price)}</p>
          <Button asChild size="sm" className="h-8 rounded-full px-4 text-xs">
            <Link to={bookServiceUrl(service.id, branchId)}>Book</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
