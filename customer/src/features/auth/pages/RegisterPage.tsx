import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Input } from '@mit-salon/shared/components/ui/input';
import { PasswordInput } from '@mit-salon/shared/components/ui/password-input';
import { Label } from '@mit-salon/shared/components/ui/label';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', full_name: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
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
              {(['full_name', 'email', 'phone'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field === 'full_name' ? 'Full name' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    id={field}
                    className="h-11"
                    type={field === 'email' ? 'email' : 'text'}
                    required={field !== 'phone'}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  className="h-11"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
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
