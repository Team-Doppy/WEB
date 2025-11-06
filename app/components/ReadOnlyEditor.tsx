'use client';

import React, { useRef, useCallback } from 'react';
import { Post } from '@/app/types/post.types';
import { BlockRenderer } from './BlockRenderer';
import { DrawingOverlay } from './DrawingOverlay';
import { formatNumber } from '@/app/utils/format';
import { GooglePlayBadge } from './GooglePlayBadge';

interface ReadOnlyEditorProps {
  post: Post;
}

export const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ post }) => {
  const nodeRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const contentRef = useRef<HTMLDivElement>(null);

  // 노드 ref 등록 (useCallback으로 메모이제이션)
  const registerNodeRef = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      nodeRefsMap.current.set(id, element);
    } else {
      nodeRefsMap.current.delete(id);
    }
  }, []);

  return (
    <article className="max-w-4xl mx-auto relative">
      {/* 헤더 */}
      <header className="mb-12">
        {/* 제목은 첫 번째 node에서 렌더링됨 */}
      </header>

      {/* 콘텐츠 */}
      <div ref={contentRef} className="relative">
        {post.content.nodes.map((node, index) => (
          <div
            key={node.id}
            ref={(el) => registerNodeRef(node.id, el)}
            data-node-id={node.id}
          >
            <BlockRenderer 
              node={node} 
              authorInfo={index === 0 ? {
                author: post.author,
                authorProfileImageUrl: post.authorProfileImageUrl,
                createdAt: post.createdAt,
              } : undefined}
              viewCount={index === 0 ? post.viewCount : undefined}
            />
          </div>
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
            마지막 수정: {' '}
            {new Date(post.updatedAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
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

