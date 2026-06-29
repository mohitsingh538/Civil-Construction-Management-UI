import { WebPlugin } from '@capacitor/core';
import type {
  FaceRecognitionPluginDefinition,
  FaceRegisteredEvent,
  ProcessFrameOptions,
  ProcessFrameResult,
  RegisterFaceOptions,
} from './FaceRecognitionPlugin';
import type { PluginListenerHandle } from '@capacitor/core';

/**
 * Browser / web fallback for FaceRecognitionPlugin.
 *
 * processFrame returns an empty result so the camera feed renders normally
 * in a browser (without ML processing). Real inference runs on Android.
 * Accepts Uint8Array (binary) matching the updated plugin interface.
 */
export class FaceRecognitionPluginWeb
  extends WebPlugin
  implements FaceRecognitionPluginDefinition
{
  async processFrame(_options: ProcessFrameOptions): Promise<ProcessFrameResult> {
    // No ML processing in browser — return empty faces array
    return { faces: [] };
  }

  async registerFace(_options: RegisterFaceOptions): Promise<{ queued: boolean; name: string }> {
    console.warn('[FaceRecognition] registerFace is not available on web.');
    return { queued: false, name: _options.name };
  }

  addListener(
    eventName: 'faceRegistered',
    listenerFunc: (event: FaceRegisteredEvent) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: string,
    listenerFunc: (event: unknown) => void,
  ): Promise<PluginListenerHandle> {
    return super.addListener(eventName, listenerFunc);
  }
}
