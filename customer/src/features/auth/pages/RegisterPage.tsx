import { useAuth } from '@/features/auth/context/AuthContext';
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
  validateFullName,
  validatePassword,
  validatePhone,
  MIN_PASSWORD_LENGTH,
} from '@mit-salon/shared/lib/form-validation';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type RegisterFields = 'full_name' | 'email' | 'phone' | 'password';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', full_name: '', password: '', phone: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterFields>>({});
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: RegisterFields) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors<RegisterFields> = {
      full_name: validateFullName(form.full_name),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone, { required: true }),
      password: validatePassword(form.password),
    };
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setLoading(true);
    try {
      await register({
        ...form,
        email: normalizeEmail(form.email),
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      });
      toast.success('Account created!');
      navigate('/book');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen min-w-0 max-w-full overflow-x-clip lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <CoverImage src={IMAGES.branches.uptown} alt="Salon interior" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-heading text-4xl font-bold">Join {APP_NAME}</h2>
          <p className="mt-3 text-lg text-white/85">Create your account and book at any of our locations.</p>
        </div>
      </div>
      <div className="customer-auth-panel customer-page flex items-center justify-center p-6 md:p-12">
        <Card className="customer-auth-card w-full max-w-md border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-heading text-center text-2xl">Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormTextField
                id="full_name"
                label="Full name"
                className="h-11"
                value={form.full_name}
                onChange={(e) => {
                  setForm({ ...form, full_name: e.target.value });
                  clearFieldError('full_name');
                }}
                error={fieldErrors.full_name}
                autoComplete="name"
              />
              <FormTextField
                id="email"
                label="Email"
                type="email"
                className="h-11"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  clearFieldError('email');
                }}
                error={fieldErrors.email}
                autoComplete="email"
              />
              <FormTextField
                id="phone"
                label="Phone"
                type="tel"
                className="h-11"
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value });
                  clearFieldError('phone');
                }}
                error={fieldErrors.phone}
                autoComplete="tel"
              />
              <FormPasswordField
                id="password"
                label="Password"
                className="h-11"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  clearFieldError('password');
                }}
                error={fieldErrors.password}
                hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
                autoComplete="new-password"
              />
              <Button type="submit" className="customer-primary-btn customer-btn-glow h-11 w-full rounded-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Have an account? <Link to="/login" className="font-medium text-primary underline">Sign in</Link>
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
