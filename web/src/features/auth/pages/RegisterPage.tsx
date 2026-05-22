import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(['full_name', 'email', 'phone', 'password'] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{field === 'full_name' ? 'Full name' : field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Input
                  id={field}
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  required={field !== 'phone'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={loading}>Register</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Have an account? <Link to="/login" className="text-primary underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
