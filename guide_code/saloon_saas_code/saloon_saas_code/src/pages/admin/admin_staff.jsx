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
import { Plus, Pencil, Trash2, User, Star } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { name: '', email: '', phone: '', role: 'stylist', branch_id: '', bio: '', status: 'active' };

export default function AdminStaff() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({ queryKey: ['admin-staff'], queryFn: () => base44.entities.Employee.list('-created_date') });
  const { data: branches = [] } = useQuery({ queryKey: ['admin-branches-staff'], queryFn: () => base44.entities.Branch.list() });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Employee.update(editing.id, data) : base44.entities.Employee.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-staff'] }); setDialogOpen(false); toast.success('Saved'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-staff'] }); toast.success('Deleted'); },
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (e) => { setEditing(e); setForm({ name: e.name, email: e.email, phone: e.phone || '', role: e.role || 'stylist', branch_id: e.branch_id || '', bio: e.bio || '', status: e.status || 'active' }); setDialogOpen(true); };
  const getBranchName = (id) => branches.find(b => b.id === id)?.name || '-';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-heading text-2xl font-bold">Staff</h1><p className="text-sm text-muted-foreground mt-1">Manage employees</p></div>
        <Button onClick={openCreate} className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add Staff</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(e => (
          <Card key={e.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {e.image_url ? <img src={e.image_url} alt={e.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{e.name}</h3>
                    <Badge variant="secondary" className="capitalize text-xs">{e.role}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(e.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{e.email}</p>
                {e.phone && <p>{e.phone}</p>}
                <p>Branch: {getBranchName(e.branch_id)}</p>
                {e.rating && <p className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-accent text-accent" />{e.rating.toFixed(1)}</p>}
              </div>
              <Badge variant={e.status === 'active' ? 'default' : e.status === 'blocked' ? 'destructive' : 'secondary'} className="mt-3 capitalize text-xs">{e.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {employees.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No staff members yet</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email *</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Role</Label><Select value={form.role} onValueChange={v => setForm({...form, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="stylist">Stylist</SelectItem><SelectItem value="receptionist">Receptionist</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent></Select></div>
              <div><Label>Branch</Label><Select value={form.branch_id} onValueChange={v => setForm({...form, branch_id: v})}><SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger><SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} /></div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="blocked">Blocked</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.email || saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}