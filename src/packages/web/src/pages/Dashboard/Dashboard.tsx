import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AppCard } from '../../components/AppCard/AppCard';
import { track, EVENTS } from '../../lib/analytics';

// ─── Helpers ───────────────────────────────────────────────────────────────────

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AppSummary {
  id: string;
  name: string;
  archetype: string;
  status: string;
  description: string | null;
  updatedAt: string;
}

interface AppsResponse {
  data?: AppSummary[];
  pagination?: { page: number; limit: number; total: number };
  error?: { message: string };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SandboxBanner(): React.ReactNode {
  return (
    <div className="border-b border-utility-yellow-200 bg-utility-yellow-50 px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p className="text-sm font-medium text-utility-yellow-700">
          Mode demo — Les donnees sont fictives et seront reintialisees.
        </p>
        <button
          type="button"
          onClick={() => { window.location.href = '/login'; }}
          className="shrink-0 rounded-lg bg-bg-primary px-3 py-1.5 text-xs font-semibold text-text-primary shadow-xs ring-1 ring-inset ring-border-secondary hover:bg-bg-secondary transition-colors"
        >
          Connecter Microsoft
        </button>
      </div>
    </div>
  );
}

function EmptyState(): React.ReactNode {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-secondary bg-bg-primary px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary text-2xl">
        {'\u{1F680}'}
      </div>
      <h3 className="text-lg font-semibold text-text-primary">
        Aucune application
      </h3>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        Creez votre premiere app en 90 secondes. Decrivez simplement ce dont vous avez besoin.
      </p>
      <button
        type="button"
        onClick={() => { window.location.href = '/create'; }}
        className="mt-6 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-solid-hover transition-colors"
      >
        Creer une app
      </button>
    </div>
  );
}

function DashboardSkeleton(): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl bg-bg-primary p-5 shadow-xs ring-1 ring-border-secondary"
        >
          <div className="mb-3 h-10 w-10 rounded-lg bg-bg-secondary" />
          <div className="h-5 w-2/3 rounded bg-bg-secondary" />
          <div className="mt-2 h-4 w-full rounded bg-bg-secondary" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-5 w-16 rounded-full bg-bg-secondary" />
            <div className="h-4 w-20 rounded bg-bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DashboardPage(): React.ReactNode {
  const { user, logout } = useAuth();
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isSandbox = user?.email === 'demo@sandbox.instack.io';

  const firstName = user?.name?.split(' ')[0] ?? 'utilisateur';

  useEffect(() => {
    track(EVENTS.PAGE_VIEWED, { page_name: 'dashboard' });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchApps = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          '/api/apps?page=1&limit=50&sort=updated_at&order=desc',
          { credentials: 'include', signal: controller.signal },
        );

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/login';
            return;
          }
          throw new Error(`Erreur ${res.status}`);
        }

        const json = (await res.json()) as AppsResponse;
        setApps(json.data ?? []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchApps();

    return () => { controller.abort(); };
  }, []);

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Sandbox banner */}
      {isSandbox && <SandboxBanner />}

      {/* Top nav */}
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-lg font-semibold text-text-primary">instack</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user?.name}</span>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-display-xs font-semibold text-text-primary">
              Bonjour {firstName}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Vos applications
            </p>
          </div>
          <button
            type="button"
            onClick={() => { window.location.href = '/create'; }}
            className="shrink-0 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-solid-hover transition-colors"
          >
            Creer une app
          </button>
        </div>

        {/* Content area */}
        <div className="mt-8">
          {isLoading && <DashboardSkeleton />}

          {!isLoading && error && (
            <div className="rounded-xl bg-utility-red-50 p-6 text-center ring-1 ring-inset ring-utility-red-200">
              <p className="text-sm font-medium text-utility-red-700">{error}</p>
              <button
                type="button"
                onClick={() => { window.location.reload(); }}
                className="mt-3 text-sm font-semibold text-utility-red-700 underline hover:no-underline"
              >
                Reessayer
              </button>
            </div>
          )}

          {!isLoading && !error && apps.length === 0 && <EmptyState />}

          {!isLoading && !error && apps.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => { track(EVENTS.APP_VIEWED, { app_id: app.id, archetype: app.archetype }); }}
                  onKeyDown={() => undefined}
                  role="presentation"
                >
                  <AppCard app={app} sandbox={isSandbox} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
