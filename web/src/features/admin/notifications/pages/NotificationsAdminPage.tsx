import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { SimpleListPage } from '@/features/admin/shared/SimpleListPage';
import { notificationsApi } from '@/services/api';
import { Badge } from '@/shared/components/ui/badge';

export default function NotificationsAdminPage() {
  const { data = [], isLoading, save, remove } = useEntityCrud('admin-notifications', notificationsApi);

  return (
    <SimpleListPage
      title="Notifications"
      description="System and user notifications"
      items={data}
      isLoading={isLoading}
      onAdd={() => save.mutate({ data: { title: 'New alert', message: 'System message', type: 'system', read: false } })}
      onDelete={(id) => remove.mutate(id)}
      renderItem={(n) => (
        <>
          <p className="font-semibold flex items-center gap-2">{n.title} {!n.read && <Badge variant="secondary">Unread</Badge>}</p>
          <p className="text-sm text-muted-foreground">{n.message}</p>
          <p className="text-xs text-muted-foreground capitalize mt-1">{n.type}</p>
        </>
      )}
    />
  );
}
