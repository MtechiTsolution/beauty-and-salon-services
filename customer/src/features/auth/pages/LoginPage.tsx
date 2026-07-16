import { useAuth } from '@/features/auth/context/AuthContext';
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
  validatePassword,
} from '@mit-salon/shared/lib/form-validation';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

type LoginFields = 'email' | 'password';

export default function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/book';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginFields>>({});
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: LoginFields) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors<LoginFields> = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setLoading(true);
    try {
      const user = await login(normalizeEmail(email), password);
      if (user?.role !== 'customer') {
        await logout();
        toast.error(
          'This account uses salon admin (5174) or platform admin (5175) — open that port manually.',
        );
        return;
      }
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen min-w-0 max-w-full overflow-x-clip lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <CoverImage src={IMAGES.hero} alt="Salon" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-heading text-4xl font-bold">Welcome back</h2>
          <p className="mt-3 text-lg text-white/85">Book your next visit in under a minute.</p>
        </div>
      </div>
      <div className="customer-auth-panel customer-page flex items-center justify-center p-6 md:p-12">
        <Card className="customer-auth-card w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <AppLogo size="lg" className="justify-center" />
            </div>
            <CardTitle className="font-heading text-2xl">Sign in to {APP_NAME}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="email"
              />
              <FormPasswordField
                id="password"
                label="Password"
                className="h-11"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                error={fieldErrors.password}
                labelExtra={
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                }
                autoComplete="current-password"
              />
              <Button type="submit" className="customer-primary-btn customer-btn-glow h-11 w-full rounded-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account? <Link to="/register" className="font-medium text-primary underline">Create account</Link>
            </p>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Own a salon?{' '}
              <Link to="/register-salon" className="font-medium text-primary underline">
                Register your salon
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
