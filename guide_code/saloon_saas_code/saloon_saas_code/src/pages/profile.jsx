import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setPhone(u.phone || '');
      setAddress(u.address || '');
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ phone, address });
    toast.success('Profile updated!');
    setSaving(false);
  };

  if (!user) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-8">My Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              {user.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4" /> Email</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><User className="w-4 h-4" /> Full Name</Label>
              <Input value={user.full_name} disabled className="bg-muted" />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><Phone className="w-4 h-4" /> Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" /> Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Your address" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2 w-full">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}