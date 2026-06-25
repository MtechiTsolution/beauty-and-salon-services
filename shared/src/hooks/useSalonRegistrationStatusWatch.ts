import { authApi } from '../services/api/modules/auth';
import { useEffect, useRef } from 'react';

const POLL_MS = 2000;

type SalonRegistrationStatusWatchOptions = {
  email: string;
  enabled?: boolean;
  onApproved?: (salonName?: string) => void;
  onRejected?: (salonName?: string) => void;
  onBlocked?: (salonName?: string) => void;
};

/**
 * Polls salon registration / activation status so UIs update when super admin approves.
 */
export function useSalonRegistrationStatusWatch({
  email,
  enabled = true,
  onApproved,
  onRejected,
  onBlocked,
}: SalonRegistrationStatusWatchOptions) {
  const callbacksRef = useRef({ onApproved, onRejected, onBlocked });
  callbacksRef.current = { onApproved, onRejected, onBlocked };

  useEffect(() => {
    const trimmed = email.trim();
    if (!enabled || !trimmed) return;

    let disposed = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let lastStatus: string | null = null;

    const poll = async () => {
      if (disposed) return;
      try {
        const result = await authApi.getSalonRegistrationStatus(trimmed);
        if (disposed) return;
        if (result.status === lastStatus) return;
        lastStatus = result.status;

        if (result.status === 'approved') {
          callbacksRef.current.onApproved?.(result.salon_name);
        } else if (result.status === 'rejected' || result.status === 'cancelled') {
          callbacksRef.current.onRejected?.(result.salon_name);
        } else if (result.status === 'blocked') {
          callbacksRef.current.onBlocked?.(result.salon_name);
        }
      } catch {
        /* API offline */
      }
    };

    void poll();
    timer = setInterval(() => void poll(), POLL_MS);

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
    };
  }, [email, enabled]);
}
