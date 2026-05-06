/**
 * StepData — Step 2: "Choisissez vos donnees"
 * @PRISM owns this file.
 *
 * Sandbox mode: grid of dataset cards with preview table.
 * Real mode: DataSourcePicker modal for Excel/SharePoint browsing.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../api/client';
import { DataSourcePicker } from '../../../components/DataSourcePicker/DataSourcePicker';
import type { WizardState, WizardActions, DemoDataset, DatasetPreview } from '../hooks/useWizardState';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════

interface StepDataProps {
  wizard: WizardState & WizardActions;
}

export function StepData({ wizard }: StepDataProps) {
  const [datasets, setDatasets] = useState<DemoDataset[]>([]);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean | null>(null);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Fetch datasets ──────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const fetchDatasets = async () => {
      setIsLoadingDatasets(true);
      try {
        const response = await api.get<DemoDataset[]>('/api/sandbox/datasets');
        if (!cancelled) {
          if (response.data && response.data.length > 0) {
            setDatasets(response.data);
            setIsSandboxMode(true);
          } else {
            setIsSandboxMode(false);
          }
        }
      } catch {
        if (!cancelled) {
          setIsSandboxMode(false);
        }
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

  // ── Select dataset + fetch preview ──────────────────────────────

  const handleSelectDataset = useCallback(async (dataset: DemoDataset) => {
    wizard.selectDataset(dataset.id);
    setIsLoadingPreview(true);

    try {
      const response = await api.get<DatasetPreview>(
        `/api/sandbox/datasets/${encodeURIComponent(dataset.id)}/preview`,
      );
      if (response.data) {
        wizard.selectDataset(dataset.id, response.data);
      }
    } catch {
      // Preview unavailable — continue without it
    } finally {
      setIsLoadingPreview(false);
    }
  }, [wizard]);

  // ── Real mode: DataSourcePicker callback ────────────────────────

  const handleDataSourceConnect = useCallback(
    (source: { type: 'excel_file' | 'sharepoint_list'; m365ResourceId: string; name: string }) => {
      wizard.selectDataset(source.m365ResourceId);
      setPickerOpen(false);
    },
    [wizard],
  );

  // ── Submit ──────────────────────────────────────────────────────

  const handleContinue = () => {
    void wizard.runPipeline();
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-display-xs font-semibold text-text-primary sm:text-display-sm">
          Choisissez vos donnees
        </h2>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Selectionnez un jeu de donnees pour alimenter votre application.
        </p>
      </div>

      {/* Content */}
      <div className="mt-8 flex-1">
        {isLoadingDatasets ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="text-text-tertiary" />
          </div>
        ) : isSandboxMode ? (
          <>
            {/* Sandbox: Dataset cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {datasets.map((dataset) => {
                const isSelected = wizard.selectedDatasetId === dataset.id;
                return (
                  <button
                    key={dataset.id}
                    type="button"
                    onClick={() => void handleSelectDataset(dataset)}
                    className={cx(
                      'flex flex-col rounded-xl border p-4 text-left transition',
                      'shadow-xs hover:shadow-sm',
                      isSelected
                        ? 'border-brand-300 bg-brand-25 ring-2 ring-brand-100'
                        : 'border-border-secondary bg-bg-primary hover:border-border-primary',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {dataset.name}
                      </h3>
                      {isSelected && (
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-solid text-white">
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
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {dataset.description}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-text-tertiary">
                      {dataset.persona}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preview table */}
            {wizard.selectedDatasetId && (
              <div className="mt-6 overflow-hidden rounded-xl border border-border-secondary bg-bg-primary shadow-xs">
                <div className="border-b border-border-secondary px-4 py-3">
                  <h3 className="text-sm font-semibold text-text-primary">Apercu des donnees</h3>
                  {wizard.datasetPreview && (
                    <p className="text-xs text-text-tertiary">
                      {wizard.datasetPreview.totalRows} lignes &middot;{' '}
                      {wizard.datasetPreview.headers.length} colonnes
                    </p>
                  )}
                </div>
                <div className="overflow-x-auto">
                  {isLoadingPreview ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="text-text-tertiary" />
                    </div>
                  ) : wizard.datasetPreview ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-bg-secondary">
                        <tr>
                          {wizard.datasetPreview.headers.map((header) => (
                            <th
                              key={header}
                              className="whitespace-nowrap px-3 py-2 text-xs font-medium text-text-tertiary"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-secondary">
                        {wizard.datasetPreview.rows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-bg-secondary transition">
                            {wizard.datasetPreview?.headers.map((header) => (
                              <td
                                key={header}
                                className="max-w-[160px] truncate whitespace-nowrap px-3 py-2 text-text-primary"
                              >
                                {String(row[header] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                      Apercu indisponible
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Real mode: DataSourcePicker */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-xl bg-bg-tertiary p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-tertiary">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-text-primary">
              Connectez vos donnees
            </h3>
            <p className="mt-1 max-w-sm text-center text-sm text-text-secondary">
              Parcourez vos fichiers Excel et SharePoint pour alimenter votre application.
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-4 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover"
            >
              Parcourir mes fichiers
            </button>
            <DataSourcePicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onConnect={handleDataSourceConnect}
            />
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-8 flex items-center justify-between border-t border-border-secondary pt-6">
        <button
          type="button"
          onClick={wizard.goBack}
          className="text-sm font-semibold text-text-tertiary transition hover:text-text-secondary"
        >
          &larr; Retour
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!wizard.selectedDatasetId}
          className={cx(
            'rounded-lg px-6 py-2.5 text-sm font-semibold shadow-xs transition',
            wizard.selectedDatasetId
              ? 'bg-brand-solid text-white hover:bg-brand-solid_hover'
              : 'cursor-not-allowed bg-bg-disabled text-text-disabled',
          )}
        >
          Utiliser ces donnees &rarr;
        </button>
      </div>
    </div>
  );
}

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
