import { useCallback } from 'react';

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Types ───────────────────────────────────────────────────────────────────

type SyncState = 'pending' | 'syncing' | 'synced' | 'error' | 'disconnected';

interface SyncStatusProps {
  status: SyncState;
  lastSyncedAt: string | null;
  onResync?: () => void;
  compact?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Status configurations ───────────────────────────────────────────────────

interface StatusConfig {
  dotClass: string;
  bgClass: string;
  textClass: string;
  label: string;
  showResync: boolean;
  animated: boolean;
}

const STATUS_CONFIGS: Record<SyncState, StatusConfig> = {
  synced: {
    dotClass: 'bg-utility-green-500',
    bgClass: 'bg-utility-green-50 ring-utility-green-200',
    textClass: 'text-utility-green-700',
    label: 'Synchronisé',
    showResync: true,
    animated: false,
  },
  syncing: {
    dotClass: 'bg-utility-brand-500',
    bgClass: 'bg-utility-brand-50 ring-utility-brand-200',
    textClass: 'text-utility-brand-700',
    label: 'Synchronisation...',
    showResync: false,
    animated: true,
  },
  error: {
    dotClass: 'bg-utility-red-500',
    bgClass: 'bg-utility-red-50 ring-utility-red-200',
    textClass: 'text-utility-red-700',
    label: 'Erreur de sync',
    showResync: true,
    animated: false,
  },
  pending: {
    dotClass: 'bg-utility-neutral-400',
    bgClass: 'bg-utility-neutral-50 ring-utility-neutral-200',
    textClass: 'text-utility-neutral-700',
    label: 'En attente',
    showResync: false,
    animated: false,
  },
  disconnected: {
    dotClass: 'bg-utility-neutral-400',
    bgClass: 'bg-utility-neutral-50 ring-utility-neutral-200',
    textClass: 'text-utility-neutral-700',
    label: 'Déconnecté',
    showResync: false,
    animated: false,
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SyncSpinner() {
  return (
    <svg
      className="size-3 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="12"
      height="12"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function StatusDot({ className, animated }: { className: string; animated: boolean }) {
  return (
    <span className="relative flex size-2">
      {animated && (
        <span className={cx('absolute inline-flex size-full animate-ping rounded-full opacity-75', className)} />
      )}
      <span className={cx('relative inline-flex size-2 rounded-full', className)} />
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SyncStatus({ status, lastSyncedAt, onResync, compact = false }: SyncStatusProps) {
  const config = STATUS_CONFIGS[status];

  const handleResync = useCallback(() => {
    if (onResync) onResync();
  }, [onResync]);

  // Build the time label
  const timeLabel =
    status === 'synced' && lastSyncedAt
      ? `Synchronisé ${formatRelativeTime(lastSyncedAt)}`
      : config.label;

  // ── Compact variant (just a dot + short text) ────────────────────────────

  if (compact) {
    return (
      <span
        className={cx(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
          config.bgClass,
          config.textClass,
        )}
      >
        {status === 'syncing' ? <SyncSpinner /> : <StatusDot className={config.dotClass} animated={config.animated} />}
        <span className="truncate">{status === 'synced' ? 'Sync' : config.label}</span>
      </span>
    );
  }

  // ── Full variant ─────────────────────────────────────────────────────────

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cx(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
          config.bgClass,
          config.textClass,
        )}
      >
        {status === 'syncing' ? <SyncSpinner /> : <StatusDot className={config.dotClass} animated={config.animated} />}
        <span>{timeLabel}</span>
      </span>

      {config.showResync && onResync && (
        <button
          type="button"
          onClick={handleResync}
          className="text-tertiary hover:text-secondary text-xs font-medium transition"
        >
          Re-sync
        </button>
      )}
    </div>
  );
}
