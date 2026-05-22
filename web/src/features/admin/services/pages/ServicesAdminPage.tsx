import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { SimpleListPage, StatusBadge } from '@/features/admin/shared/SimpleListPage';
import { servicesApi } from '@/services/api';

export default function ServicesAdminPage() {
  const { data = [], isLoading, save, remove } = useEntityCrud('admin-services', servicesApi);

  return (
    <SimpleListPage
      title="Services"
      description="Manage salon services"
      items={data}
      isLoading={isLoading}
      onAdd={() => save.mutate({ data: { title: 'New Service', price: 50, duration_minutes: 60, category_id: '', branch_ids: [], employee_ids: [], status: 'active' } })}
      onDelete={(id) => remove.mutate(id)}
      renderItem={(s) => (
        <>
          <p className="font-semibold">{s.title}</p>
          <p className="text-sm text-muted-foreground">${s.price} · {s.duration_minutes} min</p>
          <StatusBadge status={s.status} />
        </>
      )}
    />
  );
}
