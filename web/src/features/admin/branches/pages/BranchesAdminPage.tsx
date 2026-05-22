import { useEntityCrud } from '@/features/admin/shared/useEntityCrud';
import { branchesApi } from '@/services/api';
import { LoadingGrid } from '@/shared/components/LoadingGrid';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import type { Branch } from '@/shared/types';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const empty: Omit<Branch, 'id' | 'created_at' | 'updated_at'> = {
  name: '', address: '', city: '', phone: '', email: '', description: '', status: 'active',
};

export default function BranchesAdminPage() {
  const { data: branches = [], isLoading, save, remove } = useEntityCrud('admin-branches', branchesApi);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const openCreate = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (b: Branch) => {
    setEditingId(b.id);
    setForm({
      name: b.name, address: b.address, city: b.city ?? '', phone: b.phone ?? '',
      email: b.email ?? '', description: b.description ?? '', status: b.status,
    });
    setOpen(true);
  };

  const handleSave = () => {
    save.mutate({ id: editingId ?? undefined, data: form }, { onSuccess: () => setOpen(false) });
  };

  return (
    <div>
      <PageHeader title="Branches" description="Manage salon locations" actionLabel="Add Branch" onAction={openCreate} />
      {isLoading ? <LoadingGrid /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{b.name}</h3>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{b.address}{b.city ? `, ${b.city}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} branch</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            {(['name', 'address', 'city', 'phone', 'email'] as const).map((f) => (
              <div key={f} className="space-y-2">
                <Label className="capitalize">{f}</Label>
                <Input value={form[f] ?? ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Branch['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
