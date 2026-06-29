import { useEffect, useRef, useState, useCallback } from 'react';

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseQueryOptions<T> {
  /** Unique string key — changing it triggers a fresh fetch, similar to React Query. */
  key: string;
  fetchFn: () => Promise<T>;
  /**
   * Pre-populated data rendered on the first paint before the fetch resolves.
   * Keeps the UI instant while still going async — when the backend lands,
   * just remove initialData and the loading state will be shown instead.
   */
  initialData?: T;
}

/**
 * Generic async data-fetching hook.
 *
 * - Object-based options for forward-compatible API surface.
 * - `key` drives refetch (change key → new request).
 * - `initialData` enables zero-flash first paint with mock data.
 * - Cancellation via `active` flag prevents state updates on unmounted components.
 * - `refetch()` is stable and does not re-create on each render.
 */
export function useQuery<T>({
  key,
  fetchFn,
  initialData,
}: UseQueryOptions<T>): QueryResult<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(initialData === undefined);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  // Keep a stable ref to fetchFn so the effect doesn't re-run if the caller
  // passes a new function reference on each render.
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  useEffect(() => {
    let active = true;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFnRef.current();
        if (active) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, isLoading, error, refetch };
}
