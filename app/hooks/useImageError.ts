import { useState, useCallback } from 'react';

export function useImageError(fallbackSrc: string = '/fallback.png') {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  const handleError = useCallback(() => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
  }, [fallbackSrc]);

  const initSrc = useCallback((src: string) => {
    setCurrentSrc(src);
    setHasError(false);
  }, []);

  return {
    hasError,
    currentSrc,
    handleError,
    initSrc,
  };
}