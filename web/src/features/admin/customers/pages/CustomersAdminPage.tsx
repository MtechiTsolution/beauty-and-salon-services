import { customersApi } from '@/services/api';
import { SimpleListPage } from '@/features/admin/shared/SimpleListPage';
import { useQuery } from '@tanstack/react-query';

export default function CustomersAdminPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['admin-customers'], queryFn: () => customersApi.list() });

  return (
    <SimpleListPage
      title="Customers"
      description="Registered customers"
      items={data}
      isLoading={isLoading}
      renderItem={(u) => (
        <>
          <p className="font-semibold">{u.full_name}</p>
          <p className="text-sm text-muted-foreground">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
        </>
      )}
    />
  );
}
