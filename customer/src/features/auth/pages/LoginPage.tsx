import { useAuth } from '@/features/auth/context/AuthContext';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Input } from '@mit-salon/shared/components/ui/input';
import { Label } from '@mit-salon/shared/components/ui/label';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:5174';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/book';

  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.role === 'admin') {
        window.location.href = ADMIN_APP_URL;
        return;
      }
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
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
