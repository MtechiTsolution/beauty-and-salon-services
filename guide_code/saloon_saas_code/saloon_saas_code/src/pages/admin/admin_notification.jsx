import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const typeColors = {
  booking: 'bg-blue-100 text-blue-800',
  payment: 'bg-green-100 text-green-800',
  reminder: 'bg-amber-100 text-amber-800',
  system: 'bg-gray-100 text-gray-800',
};

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({ queryKey: ['admin-notifs'], queryFn: () => base44.entities.Notification.list('-created_date', 100) });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifs'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-notifs'] }); toast.success('Deleted'); },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <Card key={n.id} className={!n.read ? 'border-primary/30 bg-primary/5' : ''}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{n.title}</h3>
                    <Badge className={`${typeColors[n.type] || 'bg-muted'} border-0 capitalize text-[10px]`}>{n.type}</Badge>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.created_date?.split('T')[0]}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.read && <Button variant="ghost" size="icon" onClick={() => markReadMutation.mutate(n.id)}><Check className="w-4 h-4" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(n.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </Card>
        )}
      </div>
    </div>
  );
}