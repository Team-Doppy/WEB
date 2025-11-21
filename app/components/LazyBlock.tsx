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
  const [hasRendered, setHasRendered] = useState(index < initialRenderCount);
  const blockRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 초기 블록은 즉시 렌더링
  useEffect(() => {
    if (index < initialRenderCount) {
      setHasRendered(true);
      renderStateMap.set(index, true);
      onRendered?.(index);
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

    // IntersectionObserver로 스크롤 기반 렌더링
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasRendered(true);
            renderStateMap.set(index, true);
            onRendered?.(index);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // 뷰포트 200px 전에 미리 로드
        threshold: 0.01,
      }
    );

    if (blockRef.current) {
      observerRef.current.observe(blockRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [index, hasRendered, canRender, onRendered, initialRenderCount]);

  return (
    <div ref={blockRef} className="relative">
      {/* 실제 콘텐츠 */}
      {hasRendered && (
        <div className="relative z-10">
          {children}
        </div>
      )}
      {/* Placeholder - 렌더링 전에만 표시 */}
      {!hasRendered && (
        <div className="relative z-0">
          <SkeletonBlock node={node} />
        </div>
      )}
    </div>
  );
};

