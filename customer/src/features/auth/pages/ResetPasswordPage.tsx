import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Input } from '@mit-salon/shared/components/ui/input';
import { PasswordInput } from '@mit-salon/shared/components/ui/password-input';
import { Label } from '@mit-salon/shared/components/ui/label';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { authApi } from '@mit-salon/shared/api';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

type Step = 'loading' | 'invalid' | 'password' | 'done';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const token = searchParams.get('token')?.trim() ?? '';

  const [step, setStep] = useState<Step>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function validateLink() {
      if (!email || !token) {
        setErrorMessage('This reset link is invalid or incomplete. Request a new one from the login page.');
        setStep('invalid');
        return;
      }

      try {
        const result = await authApi.validatePasswordResetLink(email, token, 'customer');
        if (cancelled) return;
        if (!result.valid) {
          setErrorMessage(result.message || 'This reset link is invalid or has expired.');
          setStep('invalid');
          return;
        }
        setAccountName(result.account?.full_name?.trim() || '');
        setAccountEmail(result.account?.email?.trim() || email);
        setStep('password');
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : 'This reset link is invalid or has expired.');
        setStep('invalid');
      }
    }

    void validateLink();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.resetPasswordWithToken(
        accountEmail || email,
        token,
        password.trim(),
        'customer',
      );
      setStep('done');
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  const heroCopy =
    step === 'password'
      ? 'Choose a new password for your account.'
      : step === 'done'
        ? 'Your password has been updated successfully.'
        : step === 'invalid'
          ? 'This reset link cannot be used.'
          : 'Verifying your reset link…';

  return (
    <div className="grid min-h-screen min-w-0 max-w-full overflow-x-clip lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <CoverImage src={IMAGES.hero} alt="Salon" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-heading text-4xl font-bold">Set a new password</h2>
          <p className="mt-3 text-lg text-white/85">{heroCopy}</p>
        </div>
      </div>
      <div className="customer-auth-panel customer-page flex items-center justify-center p-6 md:p-12">
        <Card className="customer-auth-card w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <AppLogo size="lg" className="justify-center" />
            </div>
            <CardTitle className="font-heading text-2xl">
              {step === 'loading' && 'Checking reset link'}
              {step === 'invalid' && 'Link expired'}
              {step === 'password' && 'Create new password'}
              {step === 'done' && 'All set'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'loading' && (
              <p className="text-center text-sm text-muted-foreground">Please wait while we verify your link…</p>
            )}

            {step === 'invalid' && (
              <div className="space-y-5 text-center">
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button asChild className="customer-primary-btn customer-btn-glow h-11 w-full rounded-full">
                  <Link to="/forgot-password">Request a new reset link</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="font-medium text-primary underline">
                    Back to sign in
                  </Link>
                </p>
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={updatePassword} className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  {accountName ? (
                    <>
                      Set a new password for <span className="font-medium text-foreground">{accountName}</span>
                      {' '}({accountEmail || email}).
                    </>
                  ) : (
                    <>Set a new password for your {APP_NAME} account ({accountEmail || email}).</>
                  )}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <PasswordInput
                    id="password"
                    className="h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    className="h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="customer-primary-btn customer-btn-glow h-11 w-full rounded-full"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update password'}
                </Button>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <Button asChild className="customer-primary-btn customer-btn-glow h-11 w-full rounded-full">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
