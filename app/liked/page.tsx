'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoginForm } from '@/app/components/LoginForm';
import { FeedPost } from '@/app/components/FeedPost';
import { getLikedPosts } from '@/app/lib/clientApi';
import { Post } from '@/app/types/post.types';

export default function LikedPostsPage() {
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<{
    totalElements?: number;
    totalPages?: number;
    size?: number;
    number?: number;
    first?: boolean;
    last?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      setIsLoading(false);
      return;
    }

    loadLikedPosts(0);
  }, [isAuthenticated]);

  const loadLikedPosts = async (page: number) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const result = await getLikedPosts(page, 20);
      if (result.pagination) {
        setPagination(result.pagination);
        setHasMore(!result.pagination.last);
        
        if (page === 0) {
          setPosts(result.posts);
        } else {
          setPosts(prev => [...prev, ...result.posts]);
        }
      } else {
        setPosts(result.posts);
        setHasMore(false);
      }
    } catch (error) {
      console.error('좋아요한 포스트 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore && isAuthenticated) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadLikedPosts(nextPage);
    }
  };

  // 무한 스크롤을 위한 Intersection Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, isAuthenticated, currentPage]);

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black">
        <div className="ml-0 lg:ml-64 transition-all duration-150">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-16 pb-12 px-4 lg:px-8">
            <div className="text-center py-20">
              <h1 className="text-white text-3xl font-bold mb-4">좋아요한 포스트</h1>
              <p className="text-gray-400 mb-8">좋아요한 포스트를 보려면 로그인이 필요합니다.</p>
            </div>
          </div>
        </div>
        {isLoginOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/20 shadow-2xl px-10 md:px-12 py-16 md:py-20 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <LoginForm
                onSuccess={() => {
                  setIsLoginOpen(false);
                }}
                onClose={() => setIsLoginOpen(false)}
              />
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="ml-0 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-16 pb-12 px-4 lg:px-8">
          {/* 제목 */}
          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold">좋아요한 포스트</h1>
            {pagination && pagination.totalElements !== undefined && (
              <p className="text-gray-400 text-sm mt-2">
                총 {pagination.totalElements}개의 포스트
              </p>
            )}
          </div>

          {/* 포스트 목록 */}
          {isLoading && posts.length === 0 ? (
            <div className="space-y-2 lg:space-y-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`mb-2 lg:mb-12 pb-2 lg:pb-12 relative bg-black ${i === 0 ? 'pt-4 lg:pt-0' : ''}`}>
                  {/* 작성자 정보 스켈레톤 */}
                  <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-6">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#1a1a1a] animate-shimmer flex-shrink-0"></div>
                    <div className="h-4 bg-[#1a1a1a] rounded animate-shimmer w-20 flex-1"></div>
                    <div className="h-4 bg-[#1a1a1a] rounded animate-shimmer w-24"></div>
                  </div>

                  {/* 모바일: 가로 배치 (이미지 옆에 세로 제목), 데스크톱: 가로 배치 */}
                  <div className="flex flex-row lg:flex-row gap-3 lg:gap-12 items-start mb-3 lg:mb-6">
                    {/* 썸네일 스켈레톤 - 모바일: 가변 너비, 데스크톱: 큰 크기 */}
                    <div className="flex-1 lg:flex-shrink-0">
                      <div className="relative w-full lg:w-[500px] xl:w-[600px] aspect-[4/5] bg-[#1a1a1a] rounded-lg animate-shimmer overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
                      </div>
                    </div>
                    
                    {/* 텍스트 콘텐츠 스켈레톤 - 모바일: 세로 제목, 데스크톱: 가로 제목 + summary */}
                    <div className="flex-shrink-0 flex items-center lg:items-start lg:flex-col lg:justify-start">
                      {/* 제목 스켈레톤 - 모바일: 세로, 데스크톱: 가로 */}
                      <div className="bg-[#1a1a1a] rounded animate-shimmer w-6 h-[120px] lg:w-[200px] lg:h-12" 
                        data-mobile-vertical="true"
                      ></div>
                      {/* 데스크톱 summary 스켈레톤 */}
                      <div className="hidden lg:block space-y-2 mt-4">
                        <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                        <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-4/5"></div>
                      </div>
                    </div>
                  </div>

                  {/* 하트 버튼 스켈레톤 */}
                  <div className="absolute bottom-0 right-0 mr-2 lg:mr-4 mb-2 lg:mb-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#1a1a1a] rounded animate-shimmer"></div>
                      <div className="h-4 bg-[#1a1a1a] rounded animate-shimmer w-8"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <svg className="w-20 h-20 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-gray-400 text-lg">좋아요한 포스트가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {posts.map((post) => (
                  <FeedPost key={post.id} post={post} username={post.author} />
                ))}
              </div>

              {/* 무한 스크롤 감지 요소 */}
              {hasMore && (
                <div ref={observerTarget} className="h-20" />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

