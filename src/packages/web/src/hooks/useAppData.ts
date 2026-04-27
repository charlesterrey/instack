import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppDataPayload {
  columns: unknown[];
  rows: Record<string, unknown>[];
  total: number;
  syncedAt: string;
}

interface UseAppDataOptions {
  appId: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, string>;
  pollingInterval?: number; // ms, 0 to disable, default 30000
}

interface UseAppDataResult {
  data: AppDataPayload | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_POLLING_INTERVAL = 30_000;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAppData(options: UseAppDataOptions): UseAppDataResult {
  const {
    appId,
    page = 1,
    limit = 50,
    sort,
    order,
    filters,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
  } = options;

  const [data, setData] = useState<AppDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track the latest abort controller for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stable serialization of filters for dependency tracking
  const filtersKey = filters ? JSON.stringify(filters) : '';

  const fetchData = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (sort) params.set('sort', sort);
      if (order) params.set('order', order);

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          params.set(`filter[${key}]`, value);
        }
      }

      try {
        const res = await fetch(
          `/api/apps/${encodeURIComponent(appId)}/data?${params.toString()}`,
          { signal },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Erreur ${res.status}`);
        }

        const json = (await res.json()) as AppDataPayload;
        setData(json);
      } catch (err: unknown) {
        // Ignore abort errors (component unmounted or params changed)
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filtersKey is a stable serialization
    [appId, page, limit, sort, order, filtersKey],
  );

  // Public refetch (non-abortable from outside)
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  // Initial fetch + re-fetch on param change
  useEffect(() => {
    // Abort any in-flight request from the previous render
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    void fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchData]);

  // Polling
  useEffect(() => {
    if (pollingInterval <= 0) return;

    const intervalId = setInterval(() => {
      void fetchData();
    }, pollingInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData, pollingInterval]);

  return { data, isLoading, error, refetch };
}
