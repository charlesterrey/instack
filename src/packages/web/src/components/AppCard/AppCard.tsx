import type { ReactNode } from 'react';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AppCardApp {
  id: string;
  name: string;
  archetype: string;
  status: string;
  description: string | null;
  updatedAt: string;
}

export interface AppCardProps {
  app: AppCardApp;
  sandbox?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ARCHETYPE_ICONS: Record<string, string> = {
  crud_form: '\u{1F4DD}',
  dashboard: '\u{1F4CA}',
  tracker: '\u{1F4CB}',
  report: '\u{1F4C4}',
  approval: '\u2705',
  checklist: '\u2611\uFE0F',
  gallery: '\u{1F5BC}\uFE0F',
  multi_view: '\u{1F532}',
};

interface StatusBadgeConfig {
  bg: string;
  text: string;
  label: string;
}

const STATUS_BADGES: Record<string, StatusBadgeConfig> = {
  draft: {
    bg: 'bg-utility-neutral-50 ring-utility-neutral-200',
    text: 'text-utility-neutral-700',
    label: 'Brouillon',
  },
  active: {
    bg: 'bg-utility-green-50 ring-utility-green-200',
    text: 'text-utility-green-700',
    label: 'Actif',
  },
  archived: {
    bg: 'bg-utility-neutral-50 ring-utility-neutral-200',
    text: 'text-utility-neutral-700',
    label: 'Archive',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  if (Number.isNaN(diffMs) || diffMs < 0) return "a l'instant";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "a l'instant";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `il y a ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays} j`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AppCard({ app, sandbox = false }: AppCardProps): ReactNode {
  const icon = ARCHETYPE_ICONS[app.archetype] ?? '\u{1F4E6}';
  const defaultBadge = { bg: 'bg-utility-neutral-50', text: 'text-utility-neutral-700', label: 'Brouillon' };
  const badge = STATUS_BADGES[app.status] ?? defaultBadge;

  function handleClick(): void {
    window.location.href = `/apps/${app.id}`;
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="relative rounded-xl bg-bg-primary shadow-xs ring-1 ring-border-secondary hover:shadow-md transition-shadow cursor-pointer p-5"
    >
      {/* Sandbox demo pill */}
      {sandbox && (
        <span className="absolute top-3 right-3 rounded-full bg-utility-yellow-50 px-2 py-0.5 text-xs font-medium text-utility-yellow-700 ring-1 ring-inset ring-utility-yellow-200">
          Demo
        </span>
      )}

      {/* Archetype icon */}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-bg-secondary text-xl">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-md font-semibold text-text-primary truncate">{app.name}</h3>

      {/* Description */}
      {app.description ? (
        <p className="mt-1 text-sm text-text-tertiary line-clamp-2">{app.description}</p>
      ) : (
        <p className="mt-1 text-sm text-text-tertiary italic">Aucune description</p>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span
          className={cx(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
            badge.bg,
            badge.text,
          )}
        >
          {badge.label}
        </span>
        <span className="text-xs text-text-tertiary">{formatRelativeTime(app.updatedAt)}</span>
      </div>
    </div>
  );
}
