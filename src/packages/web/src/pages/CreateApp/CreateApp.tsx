/**
 * CreateAppPage — 4-step app creation wizard container.
 * @PRISM owns this file.
 *
 * Renders the step indicator and current step component.
 * State is managed by useWizardState hook.
 */

import { useWizardState } from './hooks/useWizardState';
import { StepPrompt } from './steps/StepPrompt';
import { StepData } from './steps/StepData';
import { StepGenerate } from './steps/StepGenerate';
import { StepCustomize } from './steps/StepCustomize';
import type { WizardStep } from './hooks/useWizardState';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// Step Indicator
// ═══════════════════════════════════════════════════════════════════

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Besoin',
  2: 'Donnees',
  3: 'Generation',
  4: 'Publication',
};

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.667 3.5L5.25 9.917 2.333 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StepIndicatorProps {
  currentStep: WizardStep;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps: WizardStep[] = [1, 2, 3, 4];

  return (
    <nav aria-label="Etapes de creation" className="flex items-center justify-center gap-0">
      {steps.map((step, idx) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cx(
                  'flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isCompleted && 'bg-brand-solid text-white',
                  isCurrent && 'bg-brand-solid text-white ring-4 ring-brand-100',
                  !isCompleted && !isCurrent && 'bg-bg-tertiary text-text-quaternary',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <CheckIcon /> : step}
              </div>
              <span
                className={cx(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-text-primary' : 'text-text-tertiary',
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cx(
                  'mx-2 mt-[-18px] h-0.5 w-12 sm:w-16 md:w-20 rounded-full transition-colors',
                  isCompleted ? 'bg-brand-solid' : 'bg-border-secondary',
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export function CreateAppPage() {
  const wizard = useWizardState();

  return (
    <div className="flex min-h-screen flex-col bg-bg-secondary">
      {/* Header */}
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <a
            href="/"
            className="text-lg font-semibold text-text-primary hover:text-text-secondary transition"
          >
            instack
          </a>
          <div className="hidden sm:block">
            <StepIndicator currentStep={wizard.step} />
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Mobile step indicator */}
      <div className="border-b border-border-secondary bg-bg-primary px-6 py-3 sm:hidden">
        <StepIndicator currentStep={wizard.step} />
      </div>

      {/* Step content */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
        {wizard.step === 1 && <StepPrompt wizard={wizard} />}
        {wizard.step === 2 && <StepData wizard={wizard} />}
        {wizard.step === 3 && <StepGenerate wizard={wizard} />}
        {wizard.step === 4 && <StepCustomize wizard={wizard} />}
      </main>
    </div>
  );
}
