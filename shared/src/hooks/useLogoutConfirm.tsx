import { useCallback, useState, type ReactNode } from 'react';
import { LogoutConfirmDialog } from '../components/LogoutConfirmDialog';

type UseLogoutConfirmOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useLogoutConfirm(
  logout: () => Promise<void>,
  options?: UseLogoutConfirmOptions,
) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestLogout = useCallback(() => {
    setOpen(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setLoading(true);
    try {
      await logout();
      setOpen(false);
      await options?.onSuccess?.();
    } finally {
      setLoading(false);
    }
  }, [logout, options?.onSuccess]);

  const logoutDialog: ReactNode = (
    <LogoutConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={confirmLogout}
      loading={loading}
    />
  );

  return { requestLogout, confirmLogout, loading, logoutDialog };
}
