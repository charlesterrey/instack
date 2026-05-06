import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  if (isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  async function handleSandboxLogin(): Promise<void> {
    setSandboxLoading(true);
    setSandboxError(null);

    try {
      const res = await fetch('/api/sandbox', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Erreur ${res.status}`);
      }

      window.location.href = '/create';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setSandboxError(msg);
    } finally {
      setSandboxLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary">
      <div className="w-full max-w-sm rounded-xl border border-border-secondary bg-bg-primary p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-display-xs font-semibold text-text-primary">instack</h1>
          <p className="mt-2 text-sm text-text-secondary">
            L'App Store Interne Gouverne
          </p>
        </div>

        <button
          type="button"
          onClick={() => login()}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border-primary bg-bg-primary px-4 py-2.5 text-sm font-semibold text-text-primary shadow-xs transition-colors hover:bg-bg-secondary"
        >
          <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          Se connecter avec Microsoft
        </button>

        {/* Sandbox / demo button */}
        <button
          type="button"
          onClick={() => void handleSandboxLogin()}
          disabled={sandboxLoading}
          className="mt-3 flex w-full items-center justify-center rounded-lg border border-border-secondary bg-bg-primary px-4 py-2.5 text-sm font-semibold text-text-secondary shadow-xs transition-colors hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sandboxLoading ? 'Chargement...' : 'Tester sans compte Microsoft'}
        </button>

        {sandboxError && (
          <p className="mt-3 text-center text-xs text-utility-red-600">
            {sandboxError}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-text-tertiary">
          Connectez-vous avec votre compte Microsoft 365 professionnel.
        </p>
      </div>
    </div>
  );
}
