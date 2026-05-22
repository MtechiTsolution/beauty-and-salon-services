import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { SimpleListPage, StatusBadge } from '@/features/admin/shared/SimpleListPage';
import { employeesApi } from '@/services/api';

export default function StaffAdminPage() {
  const { data = [], isLoading, save, remove } = useEntityCrud('admin-staff', employeesApi);

  return (
    <SimpleListPage
      title="Staff"
      description="Manage employees and stylists"
      items={data}
      isLoading={isLoading}
      onAdd={() => save.mutate({ data: { name: 'New Staff', email: 'staff@mitsalon.com', role: 'stylist', branch_id: '', service_ids: [], status: 'active' } })}
      onDelete={(id) => remove.mutate(id)}
      renderItem={(e) => (
        <>
          <p className="font-semibold">{e.name}</p>
          <p className="text-sm text-muted-foreground capitalize">{e.role} · {e.email}</p>
          <StatusBadge status={e.status} />
        </>
      )}
    />
  );
}
