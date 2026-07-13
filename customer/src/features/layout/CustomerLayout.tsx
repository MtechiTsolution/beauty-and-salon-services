import { BookingBranchProvider } from '@/features/booking/context/BookingBranchContext';
import { cn } from '@mit-salon/shared/lib/utils';
import { Outlet, useMatch } from 'react-router-dom';
import { CustomerFooter } from './CustomerFooter';
import { CustomerNavbar } from './CustomerNavbar';

export function CustomerLayout() {
  const isChatThread = useMatch('/messages/:chatId');

  return (
    <BookingBranchProvider>
      <div
        className={cn(
          'customer-app-shell flex min-h-screen min-h-[100dvh] w-full min-w-0 max-w-full flex-col overflow-x-hidden',
          isChatThread && 'h-dvh max-h-dvh overflow-hidden',
        )}
      >
        <CustomerNavbar />
        <main
          className={cn(
            'customer-main-canvas flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden',
            isChatThread && 'overflow-hidden',
          )}
        >
          <Outlet />
        </main>
        {!isChatThread && <CustomerFooter />}
      </div>
    </BookingBranchProvider>
  );
}
