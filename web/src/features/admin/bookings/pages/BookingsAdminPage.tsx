import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { SimpleListPage, StatusBadge } from '@/features/admin/shared/SimpleListPage';
import { bookingsApi } from '@/services/api';

export default function BookingsAdminPage() {
  const { data = [], isLoading, remove } = useEntityCrud('admin-bookings-list', bookingsApi);

  return (
    <SimpleListPage
      title="Bookings"
      description="All appointments"
      items={data}
      isLoading={isLoading}
      onDelete={(id) => remove.mutate(id)}
      renderItem={(b) => (
        <>
          <p className="font-semibold">{b.customer_name} — {b.service_title}</p>
          <p className="text-sm text-muted-foreground">{b.branch_name} · {b.date} {b.time_slot} · ${b.final_price}</p>
          <div className="flex gap-2 mt-1">
            <StatusBadge status={b.status} />
            <StatusBadge status={b.payment_status} />
          </div>
        </>
      )}
    />
  );
}
