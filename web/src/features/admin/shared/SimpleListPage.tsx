import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

type SimpleListPageProps<T extends { id: string }> = {
  title: string;
  description: string;
  items: T[];
  isLoading?: boolean;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  renderItem: (item: T) => ReactNode;
};

export function SimpleListPage<T extends { id: string }>({
  title,
  description,
  items,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  renderItem,
}: SimpleListPageProps<T>) {
  return (
    <div>
      <PageHeader title={title} description={description} actionLabel={onAdd ? `Add ${title.slice(0, -1)}` : undefined} onAction={onAdd} />
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">{renderItem(item)}</div>
                {(onEdit || onDelete) && (
                  <div className="flex gap-1 shrink-0">
                    {onEdit && <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Pencil className="w-4 h-4" /></Button>}
                    {onDelete && <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <p className="text-muted-foreground text-center py-12">No records yet</p>}
        </div>
      )}
    </div>
  );
}

export { StatusBadge };
