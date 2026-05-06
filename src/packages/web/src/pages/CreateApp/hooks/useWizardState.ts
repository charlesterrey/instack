/**
 * useWizardState — State machine hook for the 4-step app creation wizard.
 * @PRISM owns this file.
 *
 * Steps:
 *   1. Prompt — describe the need
 *   2. Data — choose data source
 *   3. Generate — AI pipeline runs
 *   4. Customize — name, description, visibility, publish
 */

import { useState, useCallback, useRef } from 'react';
import { api } from '../../../api/client';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type WizardStep = 1 | 2 | 3 | 4;

export interface DatasetPreview {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export interface DemoDataset {
  id: string;
  name: string;
  description: string;
  persona: string;
  suggestedPrompt: string;
}

export interface PipelineResult {
  appSchema: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface WizardState {
  step: WizardStep;
  prompt: string;
  selectedDatasetId: string | null;
  datasetPreview: DatasetPreview | null;
  pipelineResult: PipelineResult | null;
  pipelineError: string | null;
  pipelineStage: number;
  isGenerating: boolean;
  appName: string;
  appDescription: string;
  appVisibility: 'private' | 'team' | 'public';
  isSaving: boolean;
}

export interface WizardActions {
  setPrompt: (prompt: string) => void;
  selectDataset: (datasetId: string | null, preview?: DatasetPreview | null) => void;
  goToStep: (step: WizardStep) => void;
  goBack: () => void;
  runPipeline: () => Promise<void>;
  retryPipeline: () => Promise<void>;
  saveApp: (asDraft: boolean) => Promise<string | null>;
  setAppName: (name: string) => void;
  setAppDescription: (description: string) => void;
  setAppVisibility: (visibility: 'private' | 'team' | 'public') => void;
}

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

const INITIAL_STATE: WizardState = {
  step: 1,
  prompt: '',
  selectedDatasetId: null,
  datasetPreview: null,
  pipelineResult: null,
  pipelineError: null,
  pipelineStage: 0,
  isGenerating: false,
  appName: '',
  appDescription: '',
  appVisibility: 'private',
  isSaving: false,
};

const STAGE_INTERVAL_MS = 800;
const POST_SUCCESS_DELAY_MS = 600;

// ═══════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════

export function useWizardState(): WizardState & WizardActions {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────

  const clearStageTimer = useCallback(() => {
    if (stageTimerRef.current !== null) {
      clearInterval(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  }, []);

  // ── Actions ─────────────────────────────────────────────────────

  const setPrompt = useCallback((prompt: string) => {
    setState((prev) => ({ ...prev, prompt }));
  }, []);

  const selectDataset = useCallback((datasetId: string | null, preview?: DatasetPreview | null) => {
    setState((prev) => ({
      ...prev,
      selectedDatasetId: datasetId,
      datasetPreview: preview ?? prev.datasetPreview,
    }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      const prevStep = Math.max(1, prev.step - 1) as WizardStep;
      return { ...prev, step: prevStep };
    });
  }, []);

  const setAppName = useCallback((appName: string) => {
    setState((prev) => ({ ...prev, appName }));
  }, []);

  const setAppDescription = useCallback((appDescription: string) => {
    setState((prev) => ({ ...prev, appDescription }));
  }, []);

  const setAppVisibility = useCallback((appVisibility: 'private' | 'team' | 'public') => {
    setState((prev) => ({ ...prev, appVisibility }));
  }, []);

  const runPipeline = useCallback(async () => {
    clearStageTimer();

    setState((prev) => ({
      ...prev,
      step: 3,
      isGenerating: true,
      pipelineStage: 0,
      pipelineError: null,
      pipelineResult: null,
    }));

    // Start simulated progress timer
    stageTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.pipelineStage < 3) {
          return { ...prev, pipelineStage: prev.pipelineStage + 1 };
        }
        return prev;
      });
    }, STAGE_INTERVAL_MS);

    try {
      const body: Record<string, unknown> = { prompt: state.prompt };
      if (state.selectedDatasetId) {
        body['demoDatasetId'] = state.selectedDatasetId;
      }

      const response = await api.post<PipelineResult>('/api/generate/full', body);

      clearStageTimer();

      if (response.error) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          pipelineError: response.error?.message ?? 'Une erreur est survenue lors de la generation.',
          pipelineStage: 4,
        }));
        return;
      }

      const result = response.data ?? null;

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        pipelineResult: result,
        pipelineStage: 4,
        appName: (result?.appSchema?.['name'] as string) ?? '',
        appDescription: (result?.appSchema?.['description'] as string) ?? '',
      }));

      // Transition to step 4 after a short delay
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: 4 }));
      }, POST_SUCCESS_DELAY_MS);
    } catch {
      clearStageTimer();
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        pipelineError: 'Erreur reseau. Verifiez votre connexion et reessayez.',
        pipelineStage: 4,
      }));
    }
  }, [state.prompt, state.selectedDatasetId, clearStageTimer]);

  const retryPipeline = useCallback(async () => {
    await runPipeline();
  }, [runPipeline]);

  const saveApp = useCallback(async (asDraft: boolean): Promise<string | null> => {
    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      const archetype = (state.pipelineResult?.appSchema?.['archetype'] as string) ?? 'dashboard';

      const body = {
        name: state.appName,
        description: state.appDescription,
        archetype,
        visibility: state.appVisibility,
        status: asDraft ? 'draft' : 'published',
        schema: state.pipelineResult?.appSchema,
      };

      const response = await api.post<{ id: string }>('/api/apps', body);

      setState((prev) => ({ ...prev, isSaving: false }));

      if (response.error) {
        return null;
      }

      return response.data?.id ?? null;
    } catch {
      setState((prev) => ({ ...prev, isSaving: false }));
      return null;
    }
  }, [state.appName, state.appDescription, state.appVisibility, state.pipelineResult]);

  return {
    ...state,
    setPrompt,
    selectDataset,
    goToStep,
    goBack,
    runPipeline,
    retryPipeline,
    saveApp,
    setAppName,
    setAppDescription,
    setAppVisibility,
  };
}
