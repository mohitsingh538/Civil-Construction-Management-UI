/**
 * Haptic feedback helpers using @capacitor/haptics.
 * All calls are no-ops on web / non-native platforms.
 *
 * Usage policy:
 *   lightImpact   → navigation taps, selection changes
 *   mediumImpact  → confirmations, important actions
 *   success       → completed async operations
 *   selection     → picker / list item selection
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

/** Light tap — navigation, bottom nav taps, company selection */
export async function lightImpact(): Promise<void> {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // silently swallow on devices without haptic engine
  }
}

/** Medium tap — modal open/dismiss, confirmations */
export async function mediumImpact(): Promise<void> {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}

/** Success notification — completed payroll, invoice generated, report saved */
export async function successFeedback(): Promise<void> {
  if (!isNative()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

/** Selection change — picker rows, stock adjustments */
export async function selectionFeedback(): Promise<void> {
  if (!isNative()) return;
  try {
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch {}
}
