import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Loader2, LogOut } from 'lucide-react';

type LogoutConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!loading) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-2 px-6 pb-4 pt-6 text-left">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LogOut className="h-5 w-5" aria-hidden />
          </div>
          <DialogTitle className="font-heading text-xl">Sign out?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Are you sure you want to sign out? You will need to sign in again to access your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 border-t border-border/80 bg-muted/20 px-6 py-4 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-full sm:flex-none sm:px-6"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 flex-1 rounded-full sm:flex-none sm:px-6"
            disabled={loading}
            onClick={() => void onConfirm()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Signing out…
              </>
            ) : (
              'Sign out'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
