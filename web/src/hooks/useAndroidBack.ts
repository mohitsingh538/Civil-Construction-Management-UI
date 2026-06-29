/**
 * useAndroidBack
 *
 * Centralised Android hardware back-button handler.
 * Behaviour:
 *   - Modal open → close modal
 *   - On /dashboard → go to /companies
 *   - On /companies → go to /
 *   - On / (Login) → double-tap within 2 s to exit
 *   - Anywhere else → navigate(-1)
 *
 * Register once per page that shows a modal.
 * Pass `isModalOpen` and `onCloseModal` props from the screen component.
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface AndroidBackOptions {
  /** Pass true while any modal / bottom-sheet is open */
  isModalOpen?: boolean;
  /** Called when back is pressed while a modal is open */
  onCloseModal?: () => void;
  /** Optional toast callback for "Press again to exit" message */
  onShowExitToast?: () => void;
}

export function useAndroidBack({
  isModalOpen = false,
  onCloseModal,
  onShowExitToast,
}: AndroidBackOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener('backButton', () => {
      // 1. Close any open modal first
      if (isModalOpen && onCloseModal) {
        onCloseModal();
        return;
      }

      const path = location.pathname;

      // 2. Route-aware back navigation
      if (path === '/dashboard') {
        navigate('/companies');
        return;
      }

      if (path === '/companies') {
        navigate('/');
        return;
      }

      if (path === '/') {
        const now = Date.now();
        if (now - lastBackTimestampRef.current < 2000) {
          App.exitApp();
        } else {
          lastBackTimestampRef.current = now;
          if (onShowExitToast) {
            onShowExitToast();
          }
        }
        return;
      }

      // 3. Default: go back in history
      navigate(-1);
    });

    return () => {
      listenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, onCloseModal, location.pathname]);
}
