/**
 * useAppBootstrap
 *
 * Controls the splash screen lifecycle.
 * Waits for fonts + theme to be applied, then hides the native splash.
 *
 * Usage:
 *   Call inside App.tsx or root layout — runs only once.
 */

import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export function useAppBootstrap() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const hideSplash = async () => {
      // Yield to allow React to paint the first frame with correct theme/fonts.
      // requestAnimationFrame fires after paint; a second one ensures the GPU
      // has composited the layer before we remove the splash.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      // Short additional delay to ensure fonts are loaded (FontFace API)
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await SplashScreen.hide({ fadeOutDuration: 300 });
    };

    hideSplash().catch(() => {
      // Fallback: hide immediately if something fails
      SplashScreen.hide().catch(() => {});
    });
  }, []);
}
