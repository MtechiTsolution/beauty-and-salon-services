import { useAuth } from '@/features/auth/context/AuthContext';
import { ThemeToggle } from '@mit-salon/shared/components/ThemeToggle';
import { authApi } from '@mit-salon/shared/api';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';
import { Input } from '@mit-salon/shared/components/ui/input';
import { Label } from '@mit-salon/shared/components/ui/label';
import { useLogoutConfirm } from '@mit-salon/shared/hooks/useLogoutConfirm';
import { Moon, User, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function ProfilePage() {
  const { user, updateProfile, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    phone: user?.phone ?? '',
  });
  const [newEmail, setNewEmail] = useState(user?.email ?? '');
  const [otp, setOtp] = useState('');
  const [changeToken, setChangeToken] = useState('');
  const [codeSentTo, setCodeSentTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const { requestLogout, loading: loggingOut, logoutDialog } = useLogoutConfirm(logout, {
    onSuccess: () => navigate('/landing'),
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name,
        phone: user.phone ?? '',
      });
      setNewEmail(user.email);
      setOtp('');
      setChangeToken('');
      setCodeSentTo('');
    }
  }, [user]);

  const emailChanged = user ? normalizeEmail(newEmail) !== normalizeEmail(user.email) : false;
  const codeTargetChanged = codeSentTo.length > 0 && normalizeEmail(newEmail) !== codeSentTo;

  const resetEmailVerification = () => {
    setOtp('');
    setChangeToken('');
    setCodeSentTo('');
  };

  const handleNewEmailChange = (value: string) => {
    setNewEmail(value);
    if (codeSentTo && normalizeEmail(value) !== codeSentTo) {
      resetEmailVerification();
    }
  };

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

  const sendEmailCode = async () => {
    if (!emailChanged) {
      toast.error('Enter a new email address first');
      return;
    }
    setEmailLoading(true);
    try {
      const result = await authApi.requestEmailChange(newEmail.trim());
      setCodeSentTo(normalizeEmail(newEmail));
      setOtp('');
      setChangeToken('');
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send verification code');
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyAndSaveEmail = async () => {
    if (!emailChanged) return;
    if (codeTargetChanged) {
      toast.error('You changed the email. Send a new verification code first.');
      return;
    }
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit verification code');
      return;
    }

    setEmailLoading(true);
    try {
      let token = changeToken;
      if (!token) {
        const verified = await authApi.verifyEmailChange(newEmail.trim(), otp.trim());
        token = verified.changeToken;
        setChangeToken(token);
      }
      const result = await authApi.confirmEmailChange(newEmail.trim(), token);
      await refresh();
      setNewEmail(result.user.email);
      resetEmailVerification();
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update email');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="customer-page">
      {logoutDialog}
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
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="space-y-4 border-t border-border/60 pt-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Change your sign-in email. We&apos;ll send a verification code to the new address
                    before updating it.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => handleNewEmailChange(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                {emailChanged && (
                  <>
                    {codeTargetChanged && (
                      <p className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
                        You changed the email. Send a new verification code to this address.
                      </p>
                    )}
                    {!codeTargetChanged && codeSentTo && (
                      <div className="space-y-2">
                        <Label htmlFor="profile-otp">Verification code</Label>
                        <Input
                          id="profile-otp"
                          type="text"
                          inputMode="numeric"
                          pattern="\d{6}"
                          maxLength={6}
                          className="text-center text-lg tracking-[0.35em]"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                            setChangeToken('');
                          }}
                          placeholder="000000"
                          autoComplete="one-time-code"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        disabled={emailLoading}
                        onClick={() => void sendEmailCode()}
                      >
                        {emailLoading ? 'Sending…' : 'Send verification code'}
                      </Button>
                      {!codeTargetChanged && codeSentTo && (
                        <Button
                          type="button"
                          className="rounded-full"
                          disabled={emailLoading || otp.length !== 6}
                          onClick={() => void verifyAndSaveEmail()}
                        >
                          {emailLoading ? 'Updating…' : 'Verify and update email'}
                        </Button>
                      )}
                    </div>
                  </>
                )}
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

        <Card className="border-0 shadow-md lg:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl text-destructive">
              <LogOut className="h-5 w-5" />
              Sign out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Sign out of your account on this device.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={loggingOut}
              onClick={requestLogout}
            >
              {loggingOut ? 'Signing out…' : 'Logout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
