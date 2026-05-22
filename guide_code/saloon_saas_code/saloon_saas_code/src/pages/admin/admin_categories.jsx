import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({ queryKey: ['admin-categories'], queryFn: () => base44.entities.ServiceCategory.list('-created_date') });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.ServiceCategory.update(editing.id, data) : base44.entities.ServiceCategory.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setDialogOpen(false); toast.success('Saved'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceCategory.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Deleted'); },
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', status: 'active' }); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', status: c.status || 'active' }); setDialogOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-heading text-2xl font-bold">Categories</h1><p className="text-sm text-muted-foreground mt-1">Organize your services</p></div>
        <Button onClick={openCreate} className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {categories.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.description || '-'}</TableCell>
                <TableCell><Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">{c.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No categories yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Create Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}