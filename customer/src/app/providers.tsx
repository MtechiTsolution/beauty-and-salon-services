import { AuthProvider } from '@/features/auth/context/AuthContext';
import { FeaturedCatalogProvider } from '@/features/catalog/context/FeaturedCatalogContext';
import { CustomerLocationProvider } from '@/features/location/context/CustomerLocationContext';
import { CustomerChatSocket } from '@/features/messages/components/CustomerChatSocket';
import { LiveCatalogSync } from '@mit-salon/shared/components/LiveCatalogSync';
import { ThemeProvider } from '@mit-salon/shared/components/ThemeProvider';
import { CurrencyProvider } from '@mit-salon/shared/hooks/useCurrency';
import { createAppQueryClient } from '@mit-salon/shared/lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

const queryClient = createAppQueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <LiveCatalogSync />
          <AuthProvider>
            <CustomerLocationProvider>
              <FeaturedCatalogProvider>
                <CustomerChatSocket>
                  {children}
                </CustomerChatSocket>
              </FeaturedCatalogProvider>
            </CustomerLocationProvider>
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
