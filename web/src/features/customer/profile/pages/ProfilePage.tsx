import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated (mock — connect MySQL API to persist)');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-8">Profile</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} disabled /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <Button type="submit" className="w-full">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
