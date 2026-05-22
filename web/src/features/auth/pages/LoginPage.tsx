import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { APP_NAME } from '@/shared/lib/constants';
import { Scissors } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'customer' | 'admin') => {
    await loginAsDemo(role);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
            <Scissors className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-heading text-2xl">Sign in to {APP_NAME}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => demoLogin('customer')}>
              Demo Customer
            </Button>
            <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => demoLogin('admin')}>
              Demo Admin
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            No account? <Link to="/register" className="text-primary underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
