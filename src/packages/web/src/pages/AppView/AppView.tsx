import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AppRenderer } from '../../components/AppRenderer/AppRenderer';
import { useAppData } from '../../hooks/useAppData';
import { SyncStatus } from '../../components/SyncStatus/SyncStatus';
import type { AppSchema } from '@instack/shared';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AppDetails {
  id: string;
  name: string;
  archetype: string;
  status: string;
  description: string | null;
  schemaJson: AppSchema;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error' | 'disconnected';
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AppDetailsResponse {
  data?: AppDetails;
  error?: { message: string };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AppViewSkeleton(): ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded bg-bg-secondary" />
        <div className="h-64 rounded-xl bg-bg-secondary" />
        <div className="h-48 rounded-xl bg-bg-secondary" />
      </div>
    </div>
  );
}

function AppViewError({ message }: { message: string }): ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-utility-red-50 text-2xl">
        {'\u26A0\uFE0F'}
      </div>
      <h2 className="text-lg font-semibold text-text-primary">App non trouvee</h2>
      <p className="mt-2 text-sm text-text-secondary">{message}</p>
      <button
        type="button"
        onClick={() => { window.location.href = '/'; }}
        className="mt-6 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-solid-hover transition-colors"
      >
        Retour au Dashboard
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AppViewPage(): ReactNode {
  // Extract appId from URL
  const pathSegment = window.location.pathname.split('/apps/')[1];
  const appId = pathSegment?.split('/')[0] ?? '';

  const [app, setApp] = useState<AppDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Fetch app details
  useEffect(() => {
    if (!appId) {
      setError('Identifiant d\'application manquant');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchApp = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/apps/${encodeURIComponent(appId)}`,
          { credentials: 'include', signal: controller.signal },
        );

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/login';
            return;
          }
          if (res.status === 404) {
            throw new Error('Cette application n\'existe pas ou a ete supprimee.');
          }
          throw new Error(`Erreur ${res.status}`);
        }

        const json = (await res.json()) as AppDetailsResponse;
        if (json.data) {
          setApp(json.data);
        } else {
          throw new Error('Reponse invalide du serveur');
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchApp();

    return () => { controller.abort(); };
  }, [appId]);

  // Live data via useAppData
  const { data: appData, refetch } = useAppData({
    appId,
    pollingInterval: app ? 30_000 : 0,
  });

  const handleResync = useCallback(() => {
    void refetch();
  }, [refetch]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <div className="h-5 w-24 animate-pulse rounded bg-bg-secondary" />
            <div className="h-5 w-40 animate-pulse rounded bg-bg-secondary" />
          </div>
        </header>
        <AppViewSkeleton />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error || !app) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
            >
              {'\u2190'} Dashboard
            </button>
          </div>
        </header>
        <AppViewError message={error ?? 'Application introuvable'} />
      </div>
    );
  }

  // ── Render app ─────────────────────────────────────────────────────────────

  return (
    <div className={cx('min-h-screen bg-bg-secondary', isFullscreen && 'fixed inset-0 z-50 overflow-auto')}>
      {/* Header bar */}
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: back + app name */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
            >
              {'\u2190'} Dashboard
            </button>
            <span className="h-5 w-px bg-border-secondary" aria-hidden="true" />
            <h1 className="text-md font-semibold text-text-primary truncate max-w-xs sm:max-w-md">
              {app.name}
            </h1>
          </div>

          {/* Right: toolbar */}
          <div className="flex items-center gap-3">
            <SyncStatus
              status={app.syncStatus}
              lastSyncedAt={app.lastSyncedAt}
              onResync={handleResync}
              compact
            />
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-lg p-2 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
              title={isFullscreen ? 'Quitter le plein ecran' : 'Plein ecran'}
            >
              {isFullscreen ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0h5m-5 0v-5m11-6l5-5m0 0h-5m5 0v5" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* App body */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <AppRenderer
          schema={app.schemaJson}
          data={appData?.rows}
          className="min-h-[60vh]"
        />
      </main>
    </div>
  );
}
