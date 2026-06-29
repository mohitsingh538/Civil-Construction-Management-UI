/**
 * NavigationContext
 *
 * Tracks whether the most recent navigation was "forward", "back", or "modal"
 * by watching window.history.state.idx (populated by React Router).
 *
 * Consumed by the Layout component to drive the correct slide direction.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router';

export type NavDirection = 'forward' | 'back' | 'modal';

const NavigationContext = createContext<NavDirection>('forward');

/** Routes that should animate as modals (slide up from bottom) */
const MODAL_ROUTES: string[] = [];

export function NavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [direction, setDirection] = useState<NavDirection>('forward');
  const prevIdxRef = useRef<number>(
    (window.history.state as { idx?: number } | null)?.idx ?? 0,
  );

  useEffect(() => {
    const currentIdx =
      (window.history.state as { idx?: number } | null)?.idx ?? 0;

    if (MODAL_ROUTES.includes(location.pathname)) {
      setDirection('modal');
    } else if (currentIdx < prevIdxRef.current) {
      setDirection('back');
    } else {
      setDirection('forward');
    }

    prevIdxRef.current = currentIdx;
  }, [location]);

  return (
    <NavigationContext.Provider value={direction}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavDirection(): NavDirection {
  return useContext(NavigationContext);
}
