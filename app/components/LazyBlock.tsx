'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { SkeletonBlock } from './SkeletonBlock';
import { ContentNode } from '@/app/types/post.types';

interface LazyBlockProps {
  node: ContentNode;
  children: ReactNode;
  index: number;
  initialRenderCount?: number; // 초기에 즉시 렌더링할 블록 수
  onRendered?: (index: number) => void; // 렌더링 완료 콜백
  canRender?: boolean; // 렌더링 가능 여부 (이전 블록이 완료되었는지)
}

// 전역으로 렌더링 상태 관리 (각 블록의 렌더링 완료 상태)
const renderStateMap = new Map<number, boolean>();

export const LazyBlock: React.FC<LazyBlockProps> = ({ 
  node, 
  children, 
  index,
  initialRenderCount = 3,
  onRendered,
  canRender = true
}) => {
  const [isVisible, setIsVisible] = useState(index < initialRenderCount);
  const [hasRendered, setHasRendered] = useState(index < initialRenderCount);
  const [shouldFade, setShouldFade] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 초기 렌더링인 경우 순차적으로 나타나도록
  useEffect(() => {
    if (index < initialRenderCount) {
      // 각 블록마다 150ms씩 딜레이를 두어 순차적으로 나타나게
      const delay = index * 150;
      timeoutRef.current = setTimeout(() => {
        setShouldFade(true);
        renderStateMap.set(index, true);
        onRendered?.(index);
      }, delay);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [index, initialRenderCount, onRendered]);

  // 스크롤 기반 렌더링 (초기 블록이 아닌 경우)
  useEffect(() => {
    if (index < initialRenderCount || hasRendered) {
      return;
    }

    // canRender가 false면 렌더링하지 않음 (이전 블록이 완료될 때까지 대기)
    if (!canRender) {
      return;
    }

    // 이전 블록이 완료되었으면 IntersectionObserver 시작
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // 자연스러운 딜레이 (300-400ms)
            const delay = 300 + Math.random() * 100;
            timeoutRef.current = setTimeout(() => {
              setHasRendered(true);
              // fade-in 애니메이션을 위한 약간의 추가 딜레이
              setTimeout(() => {
                setShouldFade(true);
                renderStateMap.set(index, true);
                onRendered?.(index);
              }, 100);
            }, delay);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '150px', // 뷰포트 150px 전에 미리 로드
        threshold: 0.1,
      }
    );

    if (blockRef.current) {
      observer.observe(blockRef.current);
    }

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [index, hasRendered, canRender, onRendered, initialRenderCount]);

  return (
    <div ref={blockRef} className="relative">
      {/* 실제 콘텐츠 - fade-in 효과 */}
      {isVisible && hasRendered && (
        <div
          className={`transition-opacity duration-500 ${
            shouldFade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {children}
        </div>
      )}
      {/* Placeholder - 항상 렌더링하여 크기 확보 */}
      <div className={isVisible && hasRendered && shouldFade ? 'hidden' : ''}>
        <SkeletonBlock node={node} />
      </div>
    </div>
  );
};

