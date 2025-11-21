'use client';

import React, { useRef, useCallback, useState } from 'react';
import { Post } from '@/app/types/post.types';
import { BlockRenderer } from './BlockRenderer';
import { DrawingOverlay } from './DrawingOverlay';
import { LazyBlock } from './LazyBlock';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';
import { GooglePlayBadge } from './GooglePlayBadge';

interface ReadOnlyEditorProps {
  post: Post;
}

export const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ post }) => {
  const nodeRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const contentRef = useRef<HTMLDivElement>(null);
  const INITIAL_RENDER_COUNT = 3; // 상단 3개 블록은 즉시 렌더링
  const [renderedIndices, setRenderedIndices] = useState<Set<number>>(new Set());

  // 노드 ref 등록 (useCallback으로 메모이제이션)
  const registerNodeRef = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      nodeRefsMap.current.set(id, element);
    } else {
      nodeRefsMap.current.delete(id);
    }
  }, []);

  // 블록 렌더링 완료 핸들러
  const handleBlockRendered = useCallback((index: number) => {
    setRenderedIndices(prev => new Set(prev).add(index));
  }, []);

  // 특정 인덱스가 렌더링 가능한지 확인 (이전 블록이 모두 완료되었는지)
  const canRenderBlock = useCallback((index: number) => {
    if (index < INITIAL_RENDER_COUNT) {
      return true; // 초기 블록은 항상 렌더링 가능
    }
    // 이전 블록이 모두 렌더링 완료되었는지 확인
    for (let i = INITIAL_RENDER_COUNT; i < index; i++) {
      if (!renderedIndices.has(i)) {
        return false;
      }
    }
    return true;
  }, [renderedIndices, INITIAL_RENDER_COUNT]);

  return (
    <article className="max-w-4xl mx-auto relative">
      {/* 헤더 */}
      <header className="mb-12">
        {/* 제목은 첫 번째 node에서 렌더링됨 */}
      </header>

      {/* 콘텐츠 */}
      <div ref={contentRef} className="relative animate-fade-in">
        {post.content.nodes.map((node, index) => (
          <LazyBlock
            key={node.id}
            node={node}
            index={index}
            initialRenderCount={INITIAL_RENDER_COUNT}
            onRendered={handleBlockRendered}
            canRender={canRenderBlock(index)}
          >
            <div
              ref={(el) => registerNodeRef(node.id, el)}
              data-node-id={node.id}
            >
              <BlockRenderer 
                node={node} 
                viewCount={index === 0 ? post.viewCount : undefined}
              />
            </div>
          </LazyBlock>
        ))}

        {/* 드로잉 오버레이 */}
        {post.content.stickers && post.content.stickers.length > 0 && (
          <DrawingOverlay stickers={post.content.stickers} nodeRefs={nodeRefsMap.current} />
        )}
      </div>

      {/* 푸터 */}
      <footer className="mt-16 pt-8 border-t border-gray-800">
        <div className="flex flex-col items-center gap-6">
          <p className="text-lg text-gray-400">
            마지막 수정: {formatDate(post.updatedAt, 'long')}
          </p>
          
          {/* Google Play 다운로드 버튼 */}
          <a 
            href="https://play.google.com/store" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <GooglePlayBadge />
          </a>
        </div>
      </footer>
    </article>
  );
};

