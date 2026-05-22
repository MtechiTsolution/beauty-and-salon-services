import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type CrudApi<T> = {
  list: () => Promise<T[]>;
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
};

export function useEntityCrud<T extends { id: string }>(
  queryKey: string,
  api: CrudApi<T>,
) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: [queryKey], queryFn: () => api.list() });

  const save = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: Partial<T> }) =>
      id ? api.update(id, data) : api.create(data as Omit<T, 'id' | 'created_at' | 'updated_at'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Saved');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Deleted');
    },
  });

  return { ...query, save, remove };
}
