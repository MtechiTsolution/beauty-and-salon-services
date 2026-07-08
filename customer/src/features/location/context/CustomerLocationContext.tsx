import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { GeoCoordinates } from '@mit-salon/shared/lib/branch-distance';

export type CustomerLocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

type CustomerLocationContextValue = {
  coords: GeoCoordinates | null;
  status: CustomerLocationStatus;
  errorMessage: string | null;
  requestLocation: () => void;
  usingDeviceLocation: boolean;
  hasLocation: boolean;
  isLocating: boolean;
};

const CustomerLocationContext = createContext<CustomerLocationContextValue>({
  coords: null,
  status: 'idle',
  errorMessage: null,
  requestLocation: () => {},
  usingDeviceLocation: false,
  hasLocation: false,
  isLocating: false,
});

const STORAGE_KEY = 'mit-salon-customer-location';

function readStoredCoords(): GeoCoordinates | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoCoordinates;
    if (
      typeof parsed.latitude === 'number' &&
      Number.isFinite(parsed.latitude) &&
      typeof parsed.longitude === 'number' &&
      Number.isFinite(parsed.longitude)
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function storeCoords(coords: GeoCoordinates | null) {
  try {
    if (!coords) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    /* ignore */
  }
}

export function CustomerLocationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [coords, setCoords] = useState<GeoCoordinates | null>(() => readStoredCoords());
  const [status, setStatus] = useState<CustomerLocationStatus>(() =>
    readStoredCoords() ? 'granted' : 'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const applyCoords = useCallback(
    (next: GeoCoordinates) => {
      setCoords(next);
      storeCoords(next);
      setStatus('granted');
      setErrorMessage(null);
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('branches'),
      });
    },
    [queryClient],
  );

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      setErrorMessage('Location is not supported in this browser.');
      return;
    }
    setStatus('loading');
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMessage('Location access was denied. Enable it in browser settings to see nearby salons.');
        } else {
          setStatus('error');
          setErrorMessage('Could not detect your location. Try again or pick a salon manually.');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 12_000,
        maximumAge: 5 * 60_000,
      },
    );
  }, [applyCoords]);

  useEffect(() => {
    if (requestedRef.current || readStoredCoords()) return;
    requestedRef.current = true;
    requestLocation();
  }, [requestLocation]);

  const value = useMemo(
    () => ({
      coords,
      status,
      errorMessage,
      requestLocation,
      usingDeviceLocation: coords != null && status === 'granted',
      hasLocation: coords != null,
      isLocating: status === 'loading',
    }),
    [coords, status, errorMessage, requestLocation],
  );

  return (
    <CustomerLocationContext.Provider value={value}>{children}</CustomerLocationContext.Provider>
  );
}

export function useCustomerLocation() {
  return useContext(CustomerLocationContext);
}
