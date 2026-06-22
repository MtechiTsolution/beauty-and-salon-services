import { useCallback, useState } from 'react';

export type CustomerViewMode = 'list' | 'grid';

export function useCustomerViewMode(pageKey: string, defaultView: CustomerViewMode = 'grid') {
  const storageKey = `mit-customer-view-${pageKey}`;

  const [view, setViewState] = useState<CustomerViewMode>(() => {
    if (typeof localStorage === 'undefined') return defaultView;
    const saved = localStorage.getItem(storageKey);
    return saved === 'grid' || saved === 'list' ? saved : defaultView;
  });

  const setView = useCallback(
    (mode: CustomerViewMode) => {
      setViewState(mode);
      localStorage.setItem(storageKey, mode);
    },
    [storageKey],
  );

  return [view, setView] as const;
}
