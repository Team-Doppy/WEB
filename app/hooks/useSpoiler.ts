// 스포일러 상태 관리 hook

import { useState, useRef, useCallback } from 'react';

interface UseSpoilerOptions {
  hasSpoiler: boolean;
  animationDuration?: number; // 기본값 520ms
}

/**
 * 스포일러 상태를 관리하는 hook
 * @param hasSpoiler 스포일러가 있는지 여부
 * @param animationDuration 애니메이션 지속 시간 (ms)
 * @returns { isRevealed, isScattering, toggleSpoiler, scatterStartTimeRef }
 */
export function useSpoiler({ hasSpoiler, animationDuration = 520 }: UseSpoilerOptions) {
  const [isRevealed, setIsRevealed] = useState(!hasSpoiler);
  const [isScattering, setIsScattering] = useState(false);
  const scatterStartTimeRef = useRef<number>(0);

  const toggleSpoiler = useCallback(() => {
    if (hasSpoiler && !isRevealed) {
      setIsRevealed(true); // 즉시 텍스트 표시
      setIsScattering(true);
      scatterStartTimeRef.current = Date.now();
      setTimeout(() => {
        setIsScattering(false);
      }, animationDuration);
    }
  }, [hasSpoiler, isRevealed, animationDuration]);

  return {
    isRevealed,
    isScattering,
    toggleSpoiler,
    scatterStartTimeRef,
  };
}

