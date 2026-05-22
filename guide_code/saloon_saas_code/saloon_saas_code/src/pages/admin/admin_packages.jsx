import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { name: '', description: '', price: '', total_sessions: '', validity_days: '', status: 'active' };

export default function AdminPackages() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data: packages = [] } = useQuery({ queryKey: ['admin-packages'], queryFn: () => base44.entities.Package.list('-created_date') });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, price: Number(data.price), total_sessions: Number(data.total_sessions), validity_days: data.validity_days ? Number(data.validity_days) : undefined };
      return editing ? base44.entities.Package.update(editing.id, payload) : base44.entities.Package.create(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-packages'] }); setDialogOpen(false); toast.success('Saved'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Package.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-packages'] }); toast.success('Deleted'); },
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, description: p.description || '', price: p.price, total_sessions: p.total_sessions, validity_days: p.validity_days || '', status: p.status || 'active' }); setDialogOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-heading text-2xl font-bold">Packages</h1><p className="text-sm text-muted-foreground mt-1">Manage service bundles</p></div>
        <Button onClick={openCreate} className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add Package</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(p => (
          <Card key={p.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center"><Package className="w-5 h-5 text-accent" /></div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{p.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{p.description || 'Service package'}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">${p.price}</span>
                <Badge variant="secondary">{p.total_sessions} sessions</Badge>
              </div>
              {p.validity_days && <p className="text-xs text-muted-foreground mt-2">Valid for {p.validity_days} days</p>}
              <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="mt-3 capitalize text-xs">{p.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {packages.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No packages yet</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Package' : 'Create Package'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Price *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              <div><Label>Sessions *</Label><Input type="number" value={form.total_sessions} onChange={e => setForm({...form, total_sessions: e.target.value})} /></div>
              <div><Label>Validity (days)</Label><Input type="number" value={form.validity_days} onChange={e => setForm({...form, validity_days: e.target.value})} /></div>
            </div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.price || !form.total_sessions || saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}