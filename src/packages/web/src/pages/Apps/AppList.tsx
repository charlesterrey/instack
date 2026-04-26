import { useAuth } from '../../hooks/useAuth';

export function AppListPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg-secondary">
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-lg font-semibold text-text-primary">instack</h1>
          <span className="text-sm text-text-secondary">{user?.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-display-xs font-semibold text-text-primary">
            Mes applications
          </h2>
          <a
            href="/"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Nouvelle app
          </a>
        </div>
        <p className="mt-4 text-sm text-text-tertiary">
          Vos applications apparaitront ici.
        </p>
      </main>
    </div>
  );
}
