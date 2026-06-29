import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import type { InferenceStage, ParsedInvoice } from '@core/ai-invoice';

interface AiInvoiceState {
  showReaderFlow: boolean;
  stage: InferenceStage;
  error: string | null;
  previewFileName: string | null;
  parsedInvoice: ParsedInvoice | null;
  inferenceMs: number | null;
  provider: string | null;
}

const initialReader: AiInvoiceState = {
  showReaderFlow: false,
  stage: 'idle',
  error: null,
  previewFileName: null,
  parsedInvoice: null,
  inferenceMs: null,
  provider: null,
};

let state: AiInvoiceState = { ...initialReader };

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function setState(partial: Partial<AiInvoiceState>): void {
  state = { ...state, ...partial };
  emit();
}

export const aiInvoiceStore = {
  getState: () => state,
  setState,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setShowReaderFlow: (v: boolean) => setState({ showReaderFlow: v }),
  setStage: (s: InferenceStage) => setState({ stage: s }),
  setError: (e: string | null) => setState({ error: e }),
  setReaderResult: (payload: {
    previewFileName: string;
    invoice: ParsedInvoice;
    inferenceMs: number;
    provider: string;
  }) =>
    setState({
      previewFileName: payload.previewFileName,
      parsedInvoice: payload.invoice,
      inferenceMs: payload.inferenceMs,
      provider: payload.provider,
      stage: 'complete',
      error: null,
    }),
  updateParsedField: <K extends keyof ParsedInvoice>(key: K, value: ParsedInvoice[K]) => {
    if (!state.parsedInvoice) return;
    setState({ parsedInvoice: { ...state.parsedInvoice, [key]: value } });
  },
  resetReader: () => setState({ ...initialReader }),
};

// ---- React bindings -------------------------------------------------------

type Snapshot = AiInvoiceState;

function getSnapshot(): Snapshot {
  return state;
}

function subscribe(listener: () => void): () => void {
  return aiInvoiceStore.subscribe(listener);
}

export function useAiInvoiceStore(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useAiInvoiceStoreSelector<T>(selector: (s: Snapshot) => T): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const getSelected = useCallback(() => selectorRef.current(getSnapshot()), []);

  return useSyncExternalStore(
    subscribe,
    getSelected,
    getSelected,
  );
}
