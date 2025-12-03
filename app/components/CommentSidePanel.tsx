'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Comment } from '@/app/types/comment.types';
import { getCommentsByPostId, createComment } from '@/app/lib/clientApi';
import { formatDate } from '@/app/utils/date';
import { ProfileImage } from './ProfileImage';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { parseCommentContent } from '@/app/utils/commentParser';
import Image from 'next/image';

interface CommentSidePanelProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 100;

export const CommentSidePanel: React.FC<CommentSidePanelProps> = ({ 
  postId, 
  isOpen, 
  onClose 
}) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadingRef = useRef(false);

  // 댓글 로드 함수
  const loadComments = useCallback(async (pageNum: number, append: boolean = true) => {
    if (loadingRef.current || isLoading) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    
    try {
      const response = await getCommentsByPostId(postId, pageNum, PAGE_SIZE);
      
      if (response?.success && response.data) {
        const newComments = response.data.content || [];
        
        if (append) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }
        
        setTotalComments(response.data.totalElements || 0);
        setHasMore(!response.data.last);
      } else {
        // 응답이 없거나 실패하면 더 이상 로드하지 않음
        setHasError(true);
        setHasMore(false);
      }
    } catch (error) {
      console.error('댓글 로딩 오류:', error);
      setHasError(true);
      setHasMore(false); // 에러 발생 시 무한 로드 방지
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [postId]);

  // 댓글 작성 핸들러
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    // 인증되지 않은 경우 로그인 오버레이 표시
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createComment(postId, newComment.trim());
      
      if (result?.success && result.data) {
        // 새 댓글을 목록 맨 위에 추가
        setComments(prev => [result.data!, ...prev]);
        setTotalComments(prev => prev + 1);
        setNewComment('');
        
        // 스크롤을 맨 위로
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      } else {
        alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enter 키로 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // 패널이 열릴 때 초기 로드
  useEffect(() => {
    if (isOpen && comments.length === 0 && !hasError) {
      setPage(0);
      setHasMore(true); // 초기화
      loadComments(0, false);
    }
  }, [isOpen]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadComments(nextPage, true);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isOpen, hasMore, isLoading, page, loadComments]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // body 스크롤 잠금 및 상태 초기화
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // 패널이 닫힐 때 입력 필드 초기화
      setNewComment('');
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 사이드 패널 */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[600px] md:w-[700px] lg:w-[800px] xl:w-[900px] bg-[#1a1a1a] border-l border-white/5 z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
              aria-label="닫기"
            >
              <svg 
                className="w-5 h-5 text-white/70" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">채팅</h2>
              {totalComments > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {totalComments.toLocaleString()}개의 메시지
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div 
          ref={scrollContainerRef}
          className="h-[calc(100%-64px-80px)] overflow-y-auto px-4 py-4"
        >
          {hasError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-gray-500 text-sm mb-4 text-center">채팅을 불러올 수 없습니다</div>
              <button
                onClick={() => loadComments(0, false)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-full text-sm transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : comments.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-gray-500 text-sm text-center">아직 채팅이 없습니다</div>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div
                  key={`${comment.id}-${index}`}
                  className="flex gap-2.5 animate-fade-in"
                >
                  {/* 프로필 이미지 */}
                  <div className="flex-shrink-0 pt-0.5">
                    <ProfileImage
                      src={comment.authorProfileImageUrl}
                      alt={comment.author}
                      size="sm"
                      className="w-9 h-9 rounded-full ring-2 ring-white/10"
                    />
                  </div>
                  
                  {/* 댓글 말풍선 */}
                  <div className="flex-1 min-w-0 max-w-[calc(100%-60px)]">
                    {/* 작성자 이름 */}
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-white/90 font-medium text-sm">
                        {comment.author}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDate(comment.createdAt, 'short')}
                      </span>
                    </div>
                    
                    {/* 말풍선 */}
                    <div className="relative inline-block max-w-full">
                      <div className="bg-[#2a2a2a] rounded-[20px] rounded-tl-[6px] px-4 py-2.5 shadow-lg">
                        {parseCommentContent(comment.content).map((part, idx) => (
                          <div key={idx}>
                            {part.type === 'text' ? (
                              <p className="text-white/95 text-[15px] whitespace-pre-wrap break-words leading-[1.5]">
                                {part.content}
                              </p>
                            ) : (
                              <div className="mt-2 first:mt-0 mb-2 last:mb-0 rounded-xl overflow-hidden max-w-[200px]">
                                <Image
                                  src={part.content}
                                  alt="댓글 이미지"
                                  width={200}
                                  height={150}
                                  className="w-full h-auto object-cover"
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex justify-center py-6">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    <span>불러오는 중...</span>
                  </div>
                </div>
              )}

              {/* Intersection Observer 센티널 */}
              {hasMore && !isLoading && (
                <div ref={sentinelRef} className="h-4" />
              )}

              {/* 끝 표시 - 여백만 */}
              {!hasMore && comments.length > 0 && (
                <div className="h-8" />
              )}
            </div>
          )}
        </div>

        {/* 댓글 작성 입력 필드 */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/5 p-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAuthenticated ? "채팅 입력..." : "로그인 후 채팅할 수 있습니다"}
                disabled={isSubmitting}
                className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 rounded-[20px] px-4 py-3 pr-12 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 max-h-[120px] min-h-[44px]"
                rows={1}
                style={{
                  height: 'auto',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-white/5 disabled:cursor-not-allowed rounded-full transition-colors"
              aria-label="전송"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 로그인 오버레이 */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div 
            className="bg-[#1a1a1a] rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto py-16 md:py-20 px-8 md:px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <LoginForm
              onSuccess={() => {
                setIsLoginOpen(false);
                // 로그인 성공 후 텍스트 필드에 포커스
                setTimeout(() => {
                  textareaRef.current?.focus();
                }, 100);
              }}
              onClose={() => setIsLoginOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

