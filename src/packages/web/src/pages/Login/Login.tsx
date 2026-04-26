import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = '/';
    return null;
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

        <p className="mt-6 text-center text-xs text-text-tertiary">
          Connectez-vous avec votre compte Microsoft 365 professionnel.
        </p>
      </div>
    </div>
  );
}
