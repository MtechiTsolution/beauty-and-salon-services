import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { SimpleListPage, StatusBadge } from '@/features/admin/shared/SimpleListPage';
import { couponsApi } from '@/services/api';

export default function CouponsAdminPage() {
  const { data = [], isLoading, save, remove } = useEntityCrud('admin-coupons', couponsApi);

  return (
    <SimpleListPage
      title="Coupons"
      description="Promotional codes"
      items={data}
      isLoading={isLoading}
      onAdd={() => save.mutate({ data: { code: 'SAVE10', discount_type: 'percentage', discount_value: 10, min_order: 0, used_count: 0, status: 'active' } })}
      onDelete={(id) => remove.mutate(id)}
      renderItem={(c) => (
        <>
          <p className="font-semibold">{c.code}</p>
          <p className="text-sm text-muted-foreground">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`} off</p>
          <StatusBadge status={c.status} />
        </>
      )}
    />
  );
}
