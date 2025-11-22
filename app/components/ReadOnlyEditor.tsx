'use client';

import React, { useRef, useCallback, useState } from 'react';
import { Post } from '@/app/types/post.types';
import { BlockRenderer } from './BlockRenderer';
import { DrawingOverlay } from './DrawingOverlay';
import { LazyBlock } from './LazyBlock';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';
import { toggleLike } from '@/app/lib/clientApi';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoginForm } from './LoginForm';

interface ReadOnlyEditorProps {
  post: Post;
}

export const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ post }) => {
  const { isAuthenticated } = useAuth();
  const nodeRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const contentRef = useRef<HTMLDivElement>(null);
  const INITIAL_RENDER_COUNT = 3; // 상단 3개 블록은 즉시 렌더링
  const [renderedIndices, setRenderedIndices] = useState<Set<number>>(new Set());
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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

  const handleLikeClick = async () => {
    // 로그인이 안 되어 있으면 로그인 오버레이 띄우기
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;
    const newIsLiked = !isLiked;

    // 낙관적 업데이트
    setIsLiked(newIsLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      // 토글 전 상태(isLiked)를 전달하여 서버에서 반대 상태로 변경
      const result = await toggleLike(post.id, isLiked);
      if (result) {
        setIsLiked(result.isLiked);
        setLikeCount(result.likeCount);
      } else {
        // 실패 시 롤백
        setIsLiked(previousIsLiked);
        setLikeCount(previousLikeCount);
      }
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto relative bg-black">
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


      {/* 로그인 오버레이 */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-[#1a1a1a] rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto py-16 md:py-20 px-8 md:px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <LoginForm
              onSuccess={() => {
                setIsLoginOpen(false);
              }}
              onClose={() => setIsLoginOpen(false)}
            />
          </div>
        </div>
      )}
    </article>
  );
};

