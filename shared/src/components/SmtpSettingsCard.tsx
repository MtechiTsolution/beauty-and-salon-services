import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { SmtpSettingsInput, SmtpSettingsPublic } from '../types/smtp-settings';
import { cn } from '../lib/utils';
import { Loader2, Mail, Save, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SmtpSettingsCardProps = {
  title?: string;
  description: string;
  settings: SmtpSettingsPublic | undefined;
  isLoading?: boolean;
  defaultTestEmail?: string;
  onSave: (input: SmtpSettingsInput) => Promise<SmtpSettingsPublic>;
  onTest: (testEmail: string) => Promise<{ ok: true; message: string }>;
  className?: string;
};

const SOURCE_LABELS: Record<SmtpSettingsPublic['source'], string> = {
  database: 'Saved in settings',
  environment: 'Loaded from server .env',
  none: 'Not configured',
};

export function SmtpSettingsCard({
  title = 'SMTP configuration',
  description,
  settings,
  isLoading,
  defaultTestEmail = '',
  onSave,
  onTest,
  className,
}: SmtpSettingsCardProps) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [from, setFrom] = useState('');
  const [appName, setAppName] = useState('');
  const [testEmail, setTestEmail] = useState(defaultTestEmail);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setHost(settings.host);
    setPort(String(settings.port || 587));
    setSecure(settings.secure);
    setUser(settings.user);
    setFrom(settings.from);
    setAppName(settings.app_name);
    setPassword(settings.password ?? '');
  }, [settings]);

  useEffect(() => {
    if (defaultTestEmail) setTestEmail(defaultTestEmail);
  }, [defaultTestEmail]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await onSave({
        host: host.trim(),
        port: Number(port) || 587,
        secure,
        user: user.trim(),
        password: password.trim() || undefined,
        from: from.trim() || undefined,
        app_name: appName.trim() || undefined,
      });
      setPassword('');
      toast.success('SMTP settings saved');
      return updated;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const email = testEmail.trim();
    if (!email) {
      toast.error('Enter a test email address');
      return;
    }
    setTesting(true);
    try {
      const result = await onTest(email);
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'SMTP test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className={cn('border-border/80 shadow-sm', className)}>
      <CardHeader className="max-md:px-4 max-md:py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg max-md:text-base">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              {title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground max-md:text-xs">{description}</p>
          </div>
          {settings && (
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={settings.configured ? 'default' : 'secondary'} className="text-[10px]">
                {settings.configured ? 'Active' : 'Incomplete'}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-normal">
                {SOURCE_LABELS[settings.source]}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-md:px-4 max-md:pb-4">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading SMTP settings…
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="smtp-host">SMTP host</Label>
                <Input
                  id="smtp-host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  min={1}
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-secure">Use SSL/TLS (port 465)</Label>
                <label className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
                  <input
                    id="smtp-secure"
                    type="checkbox"
                    checked={secure}
                    onChange={(e) => setSecure(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-muted-foreground">Secure connection</span>
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">Username / email</Label>
                <Input
                  id="smtp-user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="your@gmail.com"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">
                  Password {settings?.password_set ? '(leave blank to keep current)' : ''}
                </Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={settings?.password_set ? '••••••••' : 'App password'}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="smtp-from">From address</Label>
                <Input
                  id="smtp-from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder='MIT Salon <your@gmail.com>'
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="smtp-app-name">App name (email branding)</Label>
                <Input
                  id="smtp-app-name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="MIT Salon"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 md:p-4">
              <p className="text-sm font-medium text-foreground">Send test email</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Save settings first, then verify delivery to an inbox you can check.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="sm:flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 shrink-0"
                  disabled={testing || saving}
                  onClick={() => void handleTest()}
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Test SMTP
                </Button>
              </div>
            </div>

            <div className="flex justify-end border-t border-border/60 pt-4 max-md:justify-stretch">
              <Button
                type="button"
                className="gap-2 max-md:w-full"
                disabled={saving || testing}
                onClick={() => void handleSave()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save SMTP settings
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
