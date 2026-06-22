import { useAuth } from '@/features/auth/context/AuthContext';
import { ThemeToggle } from '@mit-salon/shared/components/ThemeToggle';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';
import { Input } from '@mit-salon/shared/components/ui/input';
import { Label } from '@mit-salon/shared/components/ui/label';
import { Moon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone ?? '',
      });
    }
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || undefined,
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="customer-page">
      <div className="customer-container-wide max-w-2xl py-10 md:py-14">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Card className="mb-6 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mb-6 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <Moon className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Choose light or dark theme for the customer app.
            </p>
            <ThemeToggle />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
