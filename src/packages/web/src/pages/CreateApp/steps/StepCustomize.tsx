/**
 * StepCustomize — Step 4: "Personnalisez"
 * @PRISM owns this file.
 *
 * App name input, description textarea, visibility selector, and publish/draft buttons.
 * On save: POST /api/apps then navigate to /apps/:id.
 */

import type { WizardState, WizardActions } from '../hooks/useWizardState';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

interface VisibilityOption {
  value: 'private' | 'team' | 'public';
  label: string;
  description: string;
  icon: 'lock' | 'users' | 'globe';
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'private',
    label: 'Prive',
    description: 'Visible uniquement par vous',
    icon: 'lock',
  },
  {
    value: 'team',
    label: 'Equipe',
    description: 'Visible par votre equipe',
    icon: 'users',
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Visible par toute l\'organisation',
    icon: 'globe',
  },
];

// ═══════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="16"
      height="16"
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

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M5.333 7.333V5.333a2.667 2.667 0 015.334 0v2M4.533 14h6.934c.746 0 1.12 0 1.405-.145.25-.128.455-.334.583-.584.145-.284.145-.658.145-1.404V8.8c0-.747 0-1.12-.145-1.405a1.333 1.333 0 00-.583-.584c-.286-.145-.659-.145-1.405-.145H4.533c-.746 0-1.12 0-1.405.145-.25.129-.455.334-.583.584C2.4 7.68 2.4 8.053 2.4 8.8v3.067c0 .746 0 1.12.145 1.404.128.25.334.456.583.584.286.145.659.145 1.405.145z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10.667 14v-1.333A2.667 2.667 0 008 10H4a2.667 2.667 0 00-2.667 2.667V14M14.667 14v-1.333a2.667 2.667 0 00-2-2.58M10 2.087a2.667 2.667 0 010 5.16M6 7.333A2.667 2.667 0 106 2a2.667 2.667 0 000 5.333z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 14.667A6.667 6.667 0 108 1.333a6.667 6.667 0 000 13.334zM1.333 8h13.334M8 1.333A10.2 10.2 0 0110.667 8 10.2 10.2 0 018 14.667 10.2 10.2 0 015.333 8 10.2 10.2 0 018 1.333z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICON_MAP = {
  lock: LockIcon,
  users: UsersIcon,
  globe: GlobeIcon,
} as const;

// ═══════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════

interface StepCustomizeProps {
  wizard: WizardState & WizardActions;
}

export function StepCustomize({ wizard }: StepCustomizeProps) {
  const isSandbox = wizard.selectedDatasetId?.startsWith('demo-') ?? false;
  const canPublish = wizard.appName.trim().length > 0;

  const handleSave = async (asDraft: boolean) => {
    const appId = await wizard.saveApp(asDraft);
    if (appId) {
      window.location.href = `/apps/${appId}`;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-display-xs font-semibold text-text-primary sm:text-display-sm">
          Personnalisez
        </h2>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Donnez un nom a votre application et choisissez qui peut y acceder.
        </p>
      </div>

      {/* Form */}
      <div className="mx-auto mt-8 w-full max-w-lg space-y-6">
        {/* App name */}
        <div>
          <label
            htmlFor="app-name"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Nom de l'application <span className="text-utility-red-500">*</span>
          </label>
          <input
            id="app-name"
            type="text"
            value={wizard.appName}
            onChange={(e) => wizard.setAppName(e.target.value)}
            placeholder="Mon application"
            className={cx(
              'w-full rounded-lg border px-3.5 py-2.5 text-sm text-text-primary',
              'placeholder:text-text-placeholder',
              'shadow-xs transition',
              'border-border-primary bg-bg-primary',
              'focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100',
            )}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="app-description"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Description
          </label>
          <textarea
            id="app-description"
            value={wizard.appDescription}
            onChange={(e) => wizard.setAppDescription(e.target.value)}
            placeholder="Decrivez brievement votre application..."
            rows={3}
            className={cx(
              'w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-text-primary',
              'placeholder:text-text-placeholder',
              'shadow-xs transition',
              'border-border-primary bg-bg-primary',
              'focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100',
            )}
          />
        </div>

        {/* Visibility selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Visibilite
          </label>
          <div className="grid grid-cols-3 gap-3">
            {VISIBILITY_OPTIONS.map((option) => {
              const isSelected = wizard.appVisibility === option.value;
              const isDisabled = isSandbox && option.value !== 'private';
              const IconComponent = ICON_MAP[option.icon];

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      wizard.setAppVisibility(option.value);
                    }
                  }}
                  disabled={isDisabled}
                  className={cx(
                    'flex flex-col items-center rounded-lg border p-3 text-center transition',
                    isDisabled && 'cursor-not-allowed opacity-50',
                    isSelected && !isDisabled
                      ? 'border-brand-300 bg-brand-25 ring-2 ring-brand-100'
                      : 'border-border-secondary bg-bg-primary hover:border-border-primary',
                    !isSelected && !isDisabled && 'hover:bg-bg-secondary',
                  )}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cx(
                      'mb-1.5',
                      isSelected ? 'text-brand-600' : 'text-text-tertiary',
                    )}
                  >
                    <IconComponent />
                  </div>
                  <span
                    className={cx(
                      'text-sm font-medium',
                      isSelected ? 'text-brand-700' : 'text-text-primary',
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="mt-0.5 text-xs text-text-tertiary">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
          {isSandbox && (
            <p className="mt-2 text-xs text-text-tertiary">
              Le mode sandbox limite la visibilite au mode prive.
            </p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="mx-auto mt-auto w-full max-w-lg pt-8">
        <div className="flex items-center justify-between border-t border-border-secondary pt-6">
          <button
            type="button"
            onClick={wizard.goBack}
            className="text-sm font-semibold text-text-tertiary transition hover:text-text-secondary"
          >
            &larr; Retour
          </button>
          <div className="flex items-center gap-3">
            {/* Draft button */}
            <button
              type="button"
              onClick={() => void handleSave(true)}
              disabled={!canPublish || wizard.isSaving}
              className={cx(
                'rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-xs transition',
                canPublish && !wizard.isSaving
                  ? 'border-border-primary bg-bg-primary text-text-secondary hover:bg-bg-secondary'
                  : 'cursor-not-allowed border-border-secondary bg-bg-disabled text-text-disabled',
              )}
            >
              Brouillon
            </button>

            {/* Publish button */}
            <button
              type="button"
              onClick={() => void handleSave(false)}
              disabled={!canPublish || wizard.isSaving}
              className={cx(
                'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-xs transition',
                canPublish && !wizard.isSaving
                  ? 'bg-brand-solid text-white hover:bg-brand-solid_hover'
                  : 'cursor-not-allowed bg-bg-disabled text-text-disabled',
              )}
            >
              {wizard.isSaving && <Spinner />}
              Publier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
