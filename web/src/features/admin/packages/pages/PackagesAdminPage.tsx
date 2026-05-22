import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { SimpleListPage, StatusBadge } from '@/features/admin/shared/SimpleListPage';
import { packagesApi } from '@/services/api';

export default function PackagesAdminPage() {
  const { data = [], isLoading, save, remove } = useEntityCrud('admin-packages', packagesApi);

  return (
    <SimpleListPage
      title="Packages"
      description="Session bundles"
      items={data}
      isLoading={isLoading}
      onAdd={() => save.mutate({ data: { name: 'New Package', price: 99, service_ids: [], total_sessions: 3, validity_days: 60, status: 'active' } })}
      onDelete={(id) => remove.mutate(id)}
      renderItem={(p) => (
        <>
          <p className="font-semibold">{p.name}</p>
          <p className="text-sm text-muted-foreground">${p.price} · {p.total_sessions} sessions</p>
          <StatusBadge status={p.status} />
        </>
      )}
    />
  );
}
