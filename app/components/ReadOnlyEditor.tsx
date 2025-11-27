'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Post } from '@/app/types/post.types';
import { BlockRenderer } from './BlockRenderer';
import { DrawingOverlay } from './DrawingOverlay';
import { LazyBlock } from './LazyBlock';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';
import { toggleLike as toggleLikeApi } from '@/app/lib/clientApi';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLikeState } from '@/app/contexts/LikeStateContext';
import { LoginForm } from './LoginForm';

interface ReadOnlyEditorProps {
  post: Post;
}

export const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ post }) => {
  const { isAuthenticated } = useAuth();
  const { getLikeState, initializeLikeState, toggleLike: toggleLikeState, syncWithServer } = useLikeState();
  const nodeRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const contentRef = useRef<HTMLDivElement>(null);
  const INITIAL_RENDER_COUNT = 3; // 상단 3개 블록은 즉시 렌더링
  const [renderedIndices, setRenderedIndices] = useState<Set<number>>(new Set());
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 초기 상태 설정
  useEffect(() => {
    initializeLikeState(post.id, post.isLiked ?? false, post.likeCount);
  }, [post.id, post.isLiked, post.likeCount, initializeLikeState]);

  // 현재 상태 가져오기
  const likeState = getLikeState(post.id);
  const isLiked = likeState?.isLiked ?? (post.isLiked ?? false);
  const likeCount = likeState?.likeCount ?? post.likeCount;
  const isLiking = likeState?.isPending ?? false;

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

    // 낙관적 업데이트: 즉시 로컬 상태 변경
    toggleLikeState(post.id, isLiked);

    // 백그라운드에서 서버 요청 (변경 전 상태로 요청 - 서버가 토글 처리)
    (async () => {
      try {
        // 변경 전 상태를 기준으로 서버에 토글 요청
        // toggleLikeApi 내부에서 에러가 발생해도 서버 상태를 확인하여 반환
        const result = await toggleLikeApi(post.id, isLiked);
        if (result) {
          // 서버 응답과 로컬 상태 비교 후 동기화
          syncWithServer(post.id, result.isLiked, result.likeCount);
        } else {
          // 응답이 없으면 서버 상태를 직접 확인하여 동기화
          try {
            const { getLikeStatus, getLikeCount } = await import('@/app/lib/clientApi');
            const [statusResult, countResult] = await Promise.all([
              getLikeStatus(post.id),
              getLikeCount(post.id),
            ]);
            if (statusResult && countResult) {
              syncWithServer(post.id, statusResult.isLiked, countResult.likeCount);
            }
          } catch (syncError) {
            // 조용히 실패 (이미 에러가 발생한 상황)
          }
        }
      } catch (error) {
        // 에러 발생 시 서버 상태를 확인하여 동기화 (에러는 출력하지 않음)
        try {
          const { getLikeStatus, getLikeCount } = await import('@/app/lib/clientApi');
          const [statusResult, countResult] = await Promise.all([
            getLikeStatus(post.id),
            getLikeCount(post.id),
          ]);
          if (statusResult && countResult) {
            syncWithServer(post.id, statusResult.isLiked, countResult.likeCount);
          }
        } catch (syncError) {
          // 조용히 실패
        }
      }
    })();
  };

  return (
    <article className="max-w-4xl mx-auto relative bg-black">
      {/* 헤더 */}
      <header className="mb-12">
        {/* 제목은 첫 번째 node에서 렌더링됨 */}
      </header>

      {/* 콘텐츠 */}
      <div ref={contentRef} className="relative animate-fade-in">
        {post.content.nodes.map((node, index) => {
          const prevNode = index > 0 ? post.content.nodes[index - 1] : null;
          const nextNode = index < post.content.nodes.length - 1 ? post.content.nodes[index + 1] : null;
          
          // 특수 노드 타입 체크
          const isSpecialNode = node.type === 'image' || node.type === 'video' || node.type === 'link' || node.type === 'imageRow';
          const isParagraphNode = node.type === 'paragraph';
          const prevIsSpecial = prevNode && (prevNode.type === 'image' || prevNode.type === 'video' || prevNode.type === 'link');
          const prevIsParagraph = prevNode && prevNode.type === 'paragraph';
          const nextIsSpecial = nextNode && (nextNode.type === 'image' || nextNode.type === 'video' || nextNode.type === 'link');
          const nextIsParagraph = nextNode && nextNode.type === 'paragraph';
          
          // 특수 노드와 텍스트 노드가 이웃할 때 추가 간격 필요
          const needsExtraSpacingTop = 
            (isSpecialNode && prevIsParagraph) || 
            (isParagraphNode && prevIsSpecial);
          const needsExtraSpacingBottom = 
            (isSpecialNode && nextIsParagraph) || 
            (isParagraphNode && nextIsSpecial);
          
          let spacingClass = '';
          if (needsExtraSpacingTop && needsExtraSpacingBottom) {
            spacingClass = 'my-10';
          } else if (needsExtraSpacingTop) {
            spacingClass = 'mt-10';
          } else if (needsExtraSpacingBottom) {
            spacingClass = 'mb-10';
          }
          
          return (
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
                className={spacingClass}
              >
                <BlockRenderer 
                  node={node} 
                  viewCount={index === 0 ? post.viewCount : undefined}
                />
              </div>
            </LazyBlock>
          );
        })}

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

