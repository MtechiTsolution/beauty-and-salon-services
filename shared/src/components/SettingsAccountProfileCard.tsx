import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { User } from '../types';
import { User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SettingsAccountProfileCardProps = {
  user: User;
  roleLabel: string;
  description?: string;
  nameInputId?: string;
  onSaveName: (fullName: string) => Promise<void>;
};

export function SettingsAccountProfileCard({
  user,
  roleLabel,
  description = 'Your signed-in account details.',
  nameInputId = 'settings-profile-name',
  onSaveName,
}: SettingsAccountProfileCardProps) {
  const [fullName, setFullName] = useState(user.full_name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user.full_name);
  }, [user.full_name]);

  const trimmedName = fullName.trim();
  const nameChanged = trimmedName !== user.full_name.trim();

  const handleSave = async () => {
    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }
    if (!nameChanged) return;

    setSaving(true);
    try {
      await onSaveName(trimmedName);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="max-md:px-4 max-md:py-3">
        <CardTitle className="flex items-center gap-2 text-lg max-md:text-base">
          <UserIcon className="h-5 w-5" aria-hidden />
          Account
        </CardTitle>
        <p className="text-sm text-muted-foreground max-md:hidden">{description}</p>
      </CardHeader>
      <CardContent className="grid max-w-xl gap-4 max-md:px-4 max-md:pb-4">
        <div className="space-y-2">
          <Label htmlFor={nameInputId}>Name</Label>
          <Input
            id={nameInputId}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${nameInputId}-role`}>Role</Label>
          <Input id={`${nameInputId}-role`} value={roleLabel} readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${nameInputId}-email`}>Email</Label>
          <Input
            id={`${nameInputId}-email`}
            type="email"
            value={user.email}
            readOnly
            disabled
          />
        </div>
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            className="rounded-full"
            disabled={!nameChanged || saving}
            onClick={() => void handleSave()}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
