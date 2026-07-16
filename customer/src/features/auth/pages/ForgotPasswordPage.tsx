import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { FormPasswordField, FormTextField } from '@mit-salon/shared/components/FormField';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import {
  type FieldErrors,
  hasFieldErrors,
  normalizeEmail,
  validateEmail,
  validateOtp,
  validatePassword,
  MIN_PASSWORD_LENGTH,
} from '@mit-salon/shared/lib/form-validation';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { authApi } from '@mit-salon/shared/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type Step = 'email' | 'otp' | 'password' | 'done';
type ForgotFields = 'email' | 'otp' | 'password' | 'confirmPassword';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${local.length > 2 ? '•••' : ''}@${domain}`;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ForgotFields>>({});

  const clearFieldError = (field: ForgotFields) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errors: FieldErrors<ForgotFields> = { email: validateEmail(email) };
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setLoading(true);
    try {
      const result = await authApi.forgotPassword(normalizeEmail(email), 'customer');
      setStep('otp');
      setOtp('');
      setFieldErrors({});
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors<ForgotFields> = { otp: validateOtp(otp) };
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setLoading(true);
    try {
      const result = await authApi.verifyPasswordResetOtp(normalizeEmail(email), otp.trim(), 'customer');
      setResetToken(result.resetToken);
      setStep('password');
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    const errors: FieldErrors<ForgotFields> = {};
    if (passwordError) {
      errors.password = passwordError;
    } else if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errors.password = 'Passwords do not match';
      errors.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setLoading(true);
    try {
      const result = await authApi.resetPasswordWithToken(
        normalizeEmail(email),
        resetToken,
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
    step === 'email'
      ? 'Enter your email and we will send a 6-digit verification code.'
      : step === 'otp'
        ? 'Check your inbox for the verification code we sent.'
        : step === 'password'
          ? 'Choose a new password for your account.'
          : 'Your password has been updated successfully.';

  return (
    <div className="grid min-h-screen min-w-0 max-w-full overflow-x-clip lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <CoverImage src={IMAGES.hero} alt="Salon" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-heading text-4xl font-bold">Forgot your password?</h2>
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
              {step === 'email' && 'Reset password'}
              {step === 'otp' && 'Verify your email'}
              {step === 'password' && 'Create new password'}
              {step === 'done' && 'All set'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'email' && (
              <form onSubmit={sendOtp} className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Enter the email for your {APP_NAME} customer account. We&apos;ll send a one-time code to
                  verify it&apos;s you.
                </p>
                <FormTextField
                  id="email"
                  label="Email"
                  type="email"
                  className="h-11"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  error={fieldErrors.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  className="customer-primary-btn customer-btn-glow h-11 w-full rounded-full"
                  disabled={loading}
                >
                  {loading ? 'Sending code...' : 'Send verification code'}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={verifyOtp} className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-foreground">{maskEmail(email)}</span>.
                </p>
                <FormTextField
                  id="otp"
                  label="Verification code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-11 text-center text-lg tracking-[0.35em]"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    clearFieldError('otp');
                  }}
                  error={fieldErrors.otp}
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
                <Button
                  type="submit"
                  className="customer-primary-btn customer-btn-glow h-11 w-full rounded-full"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify code'}
                </Button>
                <div className="flex flex-col gap-2 text-center text-sm">
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    disabled={loading}
                    onClick={() => void sendOtp()}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                    }}
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={updatePassword} className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Email verified. Choose a new password for your account.
                </p>
                <FormPasswordField
                  id="password"
                  label="New password"
                  className="h-11"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  error={fieldErrors.password}
                  autoComplete="new-password"
                />
                <FormPasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  className="h-11"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  error={fieldErrors.confirmPassword}
                  autoComplete="new-password"
                />
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

            {step === 'email' && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-primary underline">Sign in</Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
