import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Bounding box in relative coordinates.
 * All values are in [0, 1] as a fraction of the frame dimensions.
 */
export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A single face returned by processFrame. */
export interface ProcessedFace {
  /** Bounding box in relative coordinates (0–1). */
  box: FaceBox;
  /** Display name if recognised; null if unknown. */
  name: string | null;
  /** Cosine similarity score in [0, 1]. */
  confidence: number;
}

/** Return value of processFrame. */
export interface ProcessFrameResult {
  faces: ProcessedFace[];
}

/** Input to processFrame. */
export interface ProcessFrameOptions {
  /**
   * Raw JPEG bytes encoded as a base64 string.
   * Capacitor's JSON bridge doesn't support Uint8Array directly;
   * the hook encodes the blob and the plugin decodes it on the native side.
   */
  data: string;
}

export interface RegisterFaceOptions {
  /** Unique employee identifier, e.g. "emp_123". */
  employeeId: string;
  /** Human-readable name stored alongside the embedding. */
  name: string;
}

/** Payload emitted when a face registration completes. */
export interface FaceRegisteredEvent {
  registered: boolean;
  name: string;
}

// ─── Plugin interface ─────────────────────────────────────────────────────────

export interface FaceRecognitionPluginDefinition {
  /**
   * Process a single camera frame captured in the WebView.
   *
   * Decodes the base64 JPEG, runs ML Kit face detection + MobileFaceNet
   * embeddings on native, and returns bounding boxes + identities.
   * Bounding boxes are in relative coordinates (0–1).
   */
  processFrame(options: ProcessFrameOptions): Promise<ProcessFrameResult>;

  /**
   * Queue a one-shot face registration.  The next frame containing exactly
   * one face will be enrolled as [employeeId] / [name].
   */
  registerFace(options: RegisterFaceOptions): Promise<{ queued: boolean; name: string }>;

  /** Subscribe to face-registration completion events. */
  addListener(
    eventName: 'faceRegistered',
    listenerFunc: (event: FaceRegisteredEvent) => void,
  ): Promise<PluginListenerHandle>;

  /** Remove all event listeners attached to this plugin. */
  removeAllListeners(): Promise<void>;
}

// ─── Plugin registration ──────────────────────────────────────────────────────

/**
 * Registered Capacitor plugin instance.
 *
 * On Android this resolves to `FaceRecognitionPlugin.kt`.
 * On web it falls back to `FaceRecognitionPluginWeb` (no-op stub) so the
 * app can still be developed / demoed in a browser.
 */
export const FaceRecognitionPlugin = registerPlugin<FaceRecognitionPluginDefinition>(
  'FaceRecognition',
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – Vite resolves this correctly at build time
    web: () =>
      import('./FaceRecognitionPluginWeb.ts').then((m) => new m.FaceRecognitionPluginWeb()),
  },
);
