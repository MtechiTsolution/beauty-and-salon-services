import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';

export type PortalLink = {
  label: string;
  href: string;
  port: string;
};

type WrongPortalNoticeProps = {
  signedInRole: string;
  portalTitle: string;
  portalPort: string;
  otherPortals: PortalLink[];
  onSignOut: () => void | Promise<void>;
  signingOut?: boolean;
};

export function WrongPortalNotice({
  signedInRole,
  portalTitle,
  portalPort,
  otherPortals,
  onSignOut,
  signingOut = false,
}: WrongPortalNoticeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Different app, same browser</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            You are signed in as <span className="font-medium text-foreground">{signedInRole}</span>, but this
            window is the <span className="font-medium text-foreground">{portalTitle}</span> on port{' '}
            <span className="font-mono">{portalPort}</span>.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apps stay on their own port — we will not switch you automatically. Sign out here or open another app
            manually:
          </p>
          <ul className="space-y-2 text-sm">
            {otherPortals.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
                <span className="text-muted-foreground"> · port {link.port}</span>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={signingOut}
            onClick={() => onSignOut()}
          >
            {signingOut ? 'Signing out…' : 'Sign out on this port'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
