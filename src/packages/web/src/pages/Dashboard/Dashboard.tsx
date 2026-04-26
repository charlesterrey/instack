import { useAuth } from '../../hooks/useAuth';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-secondary">
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-lg font-semibold text-text-primary">instack</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user?.name}</span>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm text-text-tertiary hover:text-text-primary"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-display-xs font-semibold text-text-primary">
          Mes applications
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Creez votre premiere application en decrivant ce dont vous avez besoin.
        </p>
      </main>
    </div>
  );
}
