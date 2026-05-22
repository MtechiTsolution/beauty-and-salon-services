import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { SimpleListPage } from '@/features/admin/shared/SimpleListPage';
import { categoriesApi } from '@/services/api';
import { StatusBadge } from '@/shared/components/StatusBadge';

export default function CategoriesAdminPage() {
  const { data = [], isLoading, save, remove } = useEntityCrud('admin-categories', categoriesApi);

  return (
    <SimpleListPage
      title="Categories"
      description="Service categories"
      items={data}
      isLoading={isLoading}
      onAdd={() => save.mutate({ data: { name: 'New Category', status: 'active' } })}
      onDelete={(id) => remove.mutate(id)}
      renderItem={(c) => (
        <>
          <p className="font-semibold">{c.name}</p>
          <p className="text-sm text-muted-foreground">{c.description}</p>
          <StatusBadge status={c.status} />
        </>
      )}
    />
  );
}
