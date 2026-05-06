/**
 * StepPrompt — Step 1: "Decrivez votre besoin"
 * @PRISM owns this file.
 *
 * Large textarea with suggestion chips from demo datasets.
 * Clicking a chip fills the prompt AND pre-selects the dataset.
 */

import { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import type { WizardState, WizardActions, DemoDataset } from '../hooks/useWizardState';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// Fallback chips when API is unavailable
// ═══════════════════════════════════════════════════════════════════

const FALLBACK_CHIPS: DemoDataset[] = [
  {
    id: 'demo-suivi-projets',
    name: 'Suivi de projets',
    description: 'Tableau de bord pour suivre les projets en cours',
    persona: 'Chef de projet',
    suggestedPrompt: 'Je veux suivre mes projets en cours avec leur statut, budget et echeances',
  },
  {
    id: 'demo-gestion-conges',
    name: 'Gestion des conges',
    description: 'Formulaire de demande et suivi des conges',
    persona: 'RH',
    suggestedPrompt: 'Je veux un formulaire de demande de conges avec validation manager',
  },
  {
    id: 'demo-inventaire',
    name: 'Inventaire materiel',
    description: 'Suivi du materiel informatique',
    persona: 'DSI',
    suggestedPrompt: 'Je veux gerer l\'inventaire du materiel informatique de mon equipe',
  },
  {
    id: 'demo-budget',
    name: 'Suivi budgetaire',
    description: 'Tableau de bord financier',
    persona: 'DAF',
    suggestedPrompt: 'Je veux un dashboard de suivi budgetaire par departement',
  },
  {
    id: 'demo-tickets',
    name: 'Support tickets',
    description: 'Gestion des tickets de support interne',
    persona: 'Support IT',
    suggestedPrompt: 'Je veux gerer les tickets de support IT avec priorite et assignation',
  },
];

// ═══════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════

interface StepPromptProps {
  wizard: WizardState & WizardActions;
}

export function StepPrompt({ wizard }: StepPromptProps) {
  const [datasets, setDatasets] = useState<DemoDataset[]>(FALLBACK_CHIPS);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchDatasets = async () => {
      setIsLoadingDatasets(true);
      try {
        const response = await api.get<DemoDataset[]>('/api/sandbox/datasets');
        if (!cancelled && response.data && response.data.length > 0) {
          setDatasets(response.data);
        }
      } catch {
        // Keep fallback chips
      } finally {
        if (!cancelled) {
          setIsLoadingDatasets(false);
        }
      }
    };

    void fetchDatasets();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChipClick = (dataset: DemoDataset) => {
    wizard.setPrompt(dataset.suggestedPrompt);
    wizard.selectDataset(dataset.id);
  };

  const handleSubmit = () => {
    if (wizard.prompt.length > 5) {
      wizard.goToStep(2);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <h2 className="text-center text-display-xs font-semibold text-text-primary sm:text-display-sm">
          Decrivez votre besoin
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary sm:text-base">
          En quelques mots, expliquez ce que votre app doit faire. Notre IA s'occupe du reste.
        </p>

        {/* Textarea */}
        <div className="mt-8">
          <textarea
            value={wizard.prompt}
            onChange={(e) => wizard.setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Decrivez ce dont vous avez besoin en quelques mots..."
            rows={4}
            className={cx(
              'w-full resize-none rounded-xl border bg-bg-primary px-4 py-3',
              'text-text-primary text-base placeholder:text-text-placeholder',
              'shadow-xs transition',
              'min-h-[120px]',
              'border-border-primary',
              'focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100',
            )}
            autoFocus
          />
          <p className="mt-1.5 text-right text-xs text-text-tertiary">
            {wizard.prompt.length > 0 ? `${wizard.prompt.length} caracteres` : 'Ctrl+Entree pour continuer'}
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="mt-6">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Ou essayez un exemple
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {isLoadingDatasets ? (
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-32 animate-pulse rounded-full bg-bg-tertiary"
                  />
                ))}
              </div>
            ) : (
              datasets.slice(0, 5).map((dataset) => (
                <button
                  key={dataset.id}
                  type="button"
                  onClick={() => handleChipClick(dataset)}
                  className={cx(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                    wizard.selectedDatasetId === dataset.id
                      ? 'border-brand-300 bg-brand-50 text-brand-700'
                      : 'border-border-secondary bg-bg-primary text-text-secondary hover:border-border-primary hover:bg-bg-secondary',
                  )}
                >
                  {dataset.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={wizard.prompt.length <= 5}
            className={cx(
              'w-full rounded-lg px-6 py-3 text-base font-semibold shadow-xs transition sm:w-auto sm:min-w-[240px]',
              wizard.prompt.length > 5
                ? 'bg-brand-solid text-white hover:bg-brand-solid_hover'
                : 'cursor-not-allowed bg-bg-disabled text-text-disabled',
            )}
          >
            Creer mon app &rarr;
          </button>
          <a
            href="/"
            className="text-sm font-medium text-text-tertiary transition hover:text-text-secondary"
          >
            &larr; Retour au dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
