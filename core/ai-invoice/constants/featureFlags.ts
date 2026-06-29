import type { AiInvoiceFeatureFlags } from '../types';

/** Default flags — AI reader disabled until user opts in; remotely overridable. */
export const DEFAULT_AI_INVOICE_FLAGS: AiInvoiceFeatureFlags = {
  enabled: true,
  minSupportedModelVersion: '1.5.0-int8',
};

/** Remote config endpoint (optional). Returns flags JSON; failures keep defaults. */
export const AI_INVOICE_FLAGS_URL =
  'https://cdn.example.com/config/ai-invoice-flags.json';
