import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type BookingBranchInfo = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  image_url?: string | null;
} | null;

type BookingBranchContextValue = {
  bookingBranch: BookingBranchInfo;
  setBookingBranch: (branch: BookingBranchInfo) => void;
};

const BookingBranchContext = createContext<BookingBranchContextValue | null>(null);

export function BookingBranchProvider({ children }: { children: ReactNode }) {
  const [bookingBranch, setBookingBranchState] = useState<BookingBranchInfo>(null);

  const setBookingBranch = useCallback((branch: BookingBranchInfo) => {
    setBookingBranchState(branch);
  }, []);

  const value = useMemo(
    () => ({ bookingBranch, setBookingBranch }),
    [bookingBranch, setBookingBranch],
  );

  return (
    <BookingBranchContext.Provider value={value}>{children}</BookingBranchContext.Provider>
  );
}

export function useBookingBranch() {
  const ctx = useContext(BookingBranchContext);
  if (!ctx) {
    return {
      bookingBranch: null as BookingBranchInfo,
      setBookingBranch: (_branch: BookingBranchInfo) => {},
    };
  }
  return ctx;
}

export function contactPathForBranch(branchId?: string | null) {
  if (!branchId) return '/contact';
  return `/contact?branch=${encodeURIComponent(branchId)}`;
}
