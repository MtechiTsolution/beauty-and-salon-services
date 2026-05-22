import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const emptyBranch = { name: '', address: '', city: '', phone: '', email: '', description: '', status: 'active' };

export default function AdminBranches() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBranch);
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({ queryKey: ['admin-branches'], queryFn: () => base44.entities.Branch.list('-created_date') });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Branch.update(editing.id, data) : base44.entities.Branch.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-branches'] }); setDialogOpen(false); toast.success(editing ? 'Branch updated' : 'Branch created'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Branch.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-branches'] }); toast.success('Branch deleted'); },
  });

  const openCreate = () => { setEditing(null); setForm(emptyBranch); setDialogOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, address: b.address, city: b.city || '', phone: b.phone || '', email: b.email || '', description: b.description || '', status: b.status || 'active' }); setDialogOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Branches</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage salon locations</p>
        </div>
        <Button onClick={openCreate} className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add Branch</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(b => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-primary" /></div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-semibold">{b.name}</h3><Badge variant={b.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">{b.status}</Badge></div>
                      <p className="text-sm text-muted-foreground mt-1">{b.address}{b.city ? `, ${b.city}` : ''}</p>
                      {b.phone && <p className="text-sm text-muted-foreground">{b.phone}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(b.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {branches.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No branches yet. Create your first branch.</p>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Branch' : 'Create Branch'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Branch name" /></div>
            <div><Label>Address *</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.address || saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}