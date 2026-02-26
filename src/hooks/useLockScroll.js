import { useEffect } from 'react';

export function useLockScroll(lock) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [lock]);
}
