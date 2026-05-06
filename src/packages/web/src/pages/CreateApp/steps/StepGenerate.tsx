/**
 * StepGenerate — Step 3: "Votre app est prete!"
 * @PRISM owns this file.
 *
 * Displays pipeline progress with 4 stage labels and animated transitions.
 * On success, shows AppRenderer preview. On error, shows retry button.
 */

import type { WizardState, WizardActions } from '../hooks/useWizardState';
import { AppRenderer } from '../../../components/AppRenderer/AppRenderer';
import type { AppSchema } from '@instack/shared';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

const PIPELINE_STAGES = [
  { label: 'Classification de votre besoin...', icon: 'classify' },
  { label: 'Analyse de vos donnees...', icon: 'analyze' },
  { label: 'Creation de votre app...', icon: 'create' },
  { label: 'Verification finale...', icon: 'verify' },
] as const;

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
      width="20"
      height="20"
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

function CheckCircle() {
  return (
    <div className="flex size-5 items-center justify-center rounded-full bg-utility-green-100 text-utility-green-600">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M10 3L4.5 8.5 2 6"
          stroke="currentColor"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PendingDot() {
  return (
    <div className="flex size-5 items-center justify-center">
      <div className="size-2 rounded-full bg-border-secondary" />
    </div>
  );
}

interface StageRowProps {
  label: string;
  status: 'pending' | 'active' | 'done';
}

function StageRow({ label, status }: StageRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      {status === 'done' && <CheckCircle />}
      {status === 'active' && <Spinner className="size-5 text-brand-600" />}
      {status === 'pending' && <PendingDot />}
      <span
        className={cx(
          'text-sm',
          status === 'done' && 'font-medium text-text-primary',
          status === 'active' && 'font-medium text-brand-700',
          status === 'pending' && 'text-text-quaternary',
        )}
      >
        {label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════

interface StepGenerateProps {
  wizard: WizardState & WizardActions;
}

export function StepGenerate({ wizard }: StepGenerateProps) {
  const { pipelineStage, isGenerating, pipelineResult, pipelineError } = wizard;
  const isSuccess = !isGenerating && pipelineResult !== null && pipelineError === null;
  const isError = !isGenerating && pipelineError !== null;

  // Compute progress percentage for the bar
  const progressPercent = isGenerating
    ? Math.min((pipelineStage / 4) * 100, 95)
    : isSuccess
      ? 100
      : 0;

  return (
    <div className="flex flex-1 flex-col items-center">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-display-xs font-semibold text-text-primary sm:text-display-sm">
          {isSuccess ? 'Votre app est prete !' : isError ? 'Erreur de generation' : 'Generation en cours...'}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {isSuccess
            ? 'Votre application a ete generee avec succes. Verifiez l\'apercu ci-dessous.'
            : isError
              ? 'Une erreur est survenue pendant la generation de votre application.'
              : 'Notre IA construit votre application. Cela ne prend que quelques secondes.'}
        </p>
      </div>

      {/* Pipeline stages */}
      <div className="mt-8 w-full max-w-sm">
        <div className="rounded-xl border border-border-secondary bg-bg-primary p-4 shadow-xs">
          {PIPELINE_STAGES.map((stage, idx) => {
            let status: 'pending' | 'active' | 'done';
            if (idx < pipelineStage) {
              status = 'done';
            } else if (idx === pipelineStage && isGenerating) {
              status = 'active';
            } else if (isSuccess) {
              status = 'done';
            } else {
              status = 'pending';
            }

            return (
              <StageRow
                key={stage.label}
                label={stage.label}
                status={status}
              />
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
          <div
            className={cx(
              'h-full rounded-full transition-all duration-700 ease-out',
              isError ? 'bg-utility-red-500' : 'bg-brand-solid',
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {isError && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-utility-red-200 bg-utility-red-50 px-4 py-3">
            <svg
              className="mt-0.5 shrink-0 text-utility-red-600"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 5.333v2.667M8 10.667h.007M14.667 8A6.667 6.667 0 111.333 8a6.667 6.667 0 0113.334 0z"
                stroke="currentColor"
                strokeWidth="1.33"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-utility-red-700">{pipelineError}</p>
          </div>
          <button
            type="button"
            onClick={() => void wizard.retryPipeline()}
            className="rounded-lg bg-brand-solid px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover"
          >
            Reessayer
          </button>
        </div>
      )}

      {/* Success: AppRenderer preview */}
      {isSuccess && pipelineResult && (
        <div className="mt-8 w-full">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Apercu</h3>
            <span className="rounded-full bg-utility-green-50 px-2 py-0.5 text-xs font-medium text-utility-green-700">
              Genere
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border-secondary bg-bg-primary p-4 shadow-xs">
            <AppRenderer
              schema={pipelineResult.appSchema as unknown as AppSchema}
              className="min-h-[200px]"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => wizard.goToStep(4)}
              className="rounded-lg bg-brand-solid px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover"
            >
              Personnaliser &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
