export function AppDetailPage() {
  const appId = window.location.pathname.split('/apps/')[1] ?? '';

  return (
    <div className="min-h-screen bg-bg-secondary">
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <a href="/apps" className="text-sm text-text-tertiary hover:text-text-primary">
            &larr; Retour
          </a>
          <h1 className="text-lg font-semibold text-text-primary">Application</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-sm text-text-secondary">
          Chargement de l'application {appId}...
        </p>
      </main>
    </div>
  );
}
