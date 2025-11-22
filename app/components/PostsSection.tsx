'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PostCard } from '@/app/components/PostCard';
import { PostGrid } from '@/app/components/PostGrid';
import { LoginForm } from '@/app/components/LoginForm';
import { getProfileFeedPosts } from '@/app/lib/clientApi';
import { useAuth } from '@/app/contexts/AuthContext';
import type { ProfileFeedSchemaResponse } from '@/app/types/feed.types';
import type { Post } from '@/app/types/post.types';

interface PostsSectionProps {
  username: string;
  initialPosts: Post[];
  schema?: ProfileFeedSchemaResponse | null;
}

export function PostsSection({ username, initialPosts, schema }: PostsSectionProps) {
  const [viewType, setViewType] = useState<'image' | 'card'>('image');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(true);
  const { user } = useAuth();

  // 초기 포스트가 변경되면 상태 업데이트
  useEffect(() => {
    setPosts(initialPosts);
    setCurrentPage(0);
    setHasMore(true);
  }, [initialPosts]);

  // 스크롤 위치에 따라 로그인 메시지 표시/숨김 (스크롤을 내렸을 때만 표시)
  useEffect(() => {
    if (user || !posts || posts.length === 0) {
      setShowLoginMessage(false);
      return;
    }

    const handleScroll = () => {
      // 스크롤을 내렸을 때(100px 이상) 메시지 표시
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowLoginMessage(scrollY >= 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 체크

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [user, posts]);

  // 더보기 로드
  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const result = await getProfileFeedPosts(username, nextPage, 20);
      
      if (result.posts.length > 0) {
        setPosts(prev => [...prev, ...result.posts]);
        setCurrentPage(nextPage);
        setHasMore(!result.pagination?.last);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('프로필 피드 로드 실패:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 무한 스크롤을 위한 Intersection Observer
  const observerTargetImage = useRef<HTMLDivElement>(null);
  const observerTargetCard = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = viewType === 'image' ? observerTargetImage.current : observerTargetCard.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, currentPage, viewType]);

  // 카테고리별로 포스트 그룹화
  const postsByCategory = useMemo(() => {
    if (!schema || !posts || !posts.length) {
      console.log('[PostsSection] 스키마 또는 포스트 없음:', { hasSchema: !!schema, postsCount: posts?.length || 0 });
      return {};
    }

    const grouped: Record<string, Post[]> = {};
    const usedPostIds = new Set<number>();
    
    console.log('[PostsSection] 카테고리별 그룹화 시작:', {
      totalPosts: posts.length,
      categoriesCount: schema.categories.length,
      postsByCategoryKeys: Object.keys(schema.postsByCategory),
      postsIds: posts.map(p => p.id)
    });
    
    // 스키마의 카테고리 순서대로 정렬
    const sortedCategories = [...schema.categories].sort((a, b) => a.displayOrder - b.displayOrder);
    
    // 각 카테고리별로 포스트 ID 매핑
    sortedCategories.forEach(category => {
      const categoryPosts: Post[] = [];
      // 숫자 키와 문자열 키 모두 시도
      const postOrderInfos = schema.postsByCategory[category.id.toString()] || 
                             schema.postsByCategory[category.id] || 
                             [];
      
      console.log(`[PostsSection] 카테고리 ${category.name} (${category.id}):`, {
        postOrderInfosCount: postOrderInfos.length,
        postOrderIds: postOrderInfos.map((po: any) => po.id),
        postCount: category.postCount,
        keyUsed: category.id.toString()
      });
      
      // postsByCategory의 순서대로 포스트 찾기
      postOrderInfos.forEach((postOrder: any) => {
        const post = posts.find(p => p.id === postOrder.id);
        if (post) {
          categoryPosts.push(post);
          usedPostIds.add(post.id);
        } else {
          console.warn(`[PostsSection] 포스트를 찾을 수 없음: ID ${postOrder.id}`);
        }
      });
      
      console.log(`[PostsSection] 카테고리 ${category.name} 최종 포스트 수:`, categoryPosts.length);
      
      if (categoryPosts.length > 0) {
        grouped[category.id.toString()] = categoryPosts;
      }
    });
    
    // postsByCategory에 포함되지 않은 포스트들을 찾아서 기본 카테고리에 추가
    const unusedPosts = posts.filter(post => !usedPostIds.has(post.id));
    if (unusedPosts.length > 0) {
      console.log('[PostsSection] 카테고리에 포함되지 않은 포스트:', {
        count: unusedPosts.length,
        ids: unusedPosts.map(p => p.id)
      });
      
      // 시스템 카테고리 중 첫 번째에 추가하거나, 별도로 처리
      const systemCategory = sortedCategories.find(c => c.isSystem);
      if (systemCategory) {
        const existingPosts = grouped[systemCategory.id.toString()] || [];
        grouped[systemCategory.id.toString()] = [...existingPosts, ...unusedPosts];
        console.log(`[PostsSection] 미분류 포스트를 시스템 카테고리(${systemCategory.name})에 추가:`, unusedPosts.length);
      } else if (sortedCategories.length > 0) {
        // 시스템 카테고리가 없으면 첫 번째 카테고리에 추가
        const firstCategory = sortedCategories[0];
        const existingPosts = grouped[firstCategory.id.toString()] || [];
        grouped[firstCategory.id.toString()] = [...existingPosts, ...unusedPosts];
        console.log(`[PostsSection] 미분류 포스트를 첫 번째 카테고리(${firstCategory.name})에 추가:`, unusedPosts.length);
      }
    }
    
    console.log('[PostsSection] 그룹화 완료:', {
      groupedKeys: Object.keys(grouped),
      groupedCounts: Object.entries(grouped).map(([k, v]) => ({ 
        categoryId: k, 
        count: v.length,
        categoryName: schema.categories.find(c => c.id.toString() === k)?.name
      })),
      totalGrouped: Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0),
      totalPosts: posts.length
    });
    
    return grouped;
  }, [schema, posts]);

  return (
    <>
      {/* 뷰 타입 선택 네비게이션 */}
      <div className="flex items-center justify-center gap-0 mb-0 mt-8">
        {/* 이미지뷰 버튼 */}
        <button
          onClick={() => setViewType('image')}
          className={`flex-1 flex flex-col lg:flex-col items-center gap-2 lg:gap-3 py-3 lg:py-4 transition-colors relative ${
            viewType === 'image'
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="hidden lg:inline text-xs font-medium">이미지뷰</span>
          {viewType === 'image' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </button>

        {/* 카드뷰 버튼 */}
        <button
          onClick={() => setViewType('card')}
          className={`flex-1 flex flex-col lg:flex-col items-center gap-2 lg:gap-3 py-3 lg:py-4 transition-colors relative ${
            viewType === 'card'
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden lg:inline text-xs font-medium">카드뷰</span>
          {viewType === 'card' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </button>
      </div>

      {/* 구분선 */}
      <div className="border-t border-white/10 mb-1" />

      {/* 포스트 섹션 */}
      <section className="mt-0">
        {viewType === 'image' ? (
          // 이미지뷰 - 카테고리별로 렌더링
          <div className="space-y-12 pt-4">
            {schema && Object.entries(postsByCategory).map(([categoryId, categoryPosts]) => {
              const category = schema.categories.find(c => c.id.toString() === categoryId);
              if (!category || categoryPosts.length === 0) return null;
              
              return (
                <div key={categoryId} className="space-y-3">
                  {/* 카테고리 제목 */}
                  {!category.isSystem && (
                    <h3 className="text-white text-base font-semibold">{category.name}</h3>
                  )}
                  {/* 포스트 그리드 (4:5 비율) */}
                  <div className="grid grid-cols-3 gap-1">
                    {categoryPosts.map((post) => (
                      <PostGrid key={post.id} post={post} username={username} aspectRatio="4:5" />
                    ))}
                  </div>
                </div>
              );
            })}
            {(!schema || Object.keys(postsByCategory).length === 0) && posts && posts.length > 0 && (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <PostGrid key={post.id} post={post} username={username} aspectRatio="4:5" />
                ))}
              </div>
            )}
            {(!posts || posts.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <svg className="w-20 h-20 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-lg">아직 게시물이 없습니다</p>
              </div>
            )}

            {/* 무한 스크롤 감지 요소 (이미지뷰) */}
            {posts && posts.length > 0 && hasMore && (
              <div ref={observerTargetImage} className="h-20" />
            )}
          </div>
        ) : (
          // 카드뷰
          <ul className="pt-4">
            {posts && posts.map((post) => (
              <li key={post.id} className="mb-2 last:mb-0">
                <PostCard post={post} username={username} isProfile={true} />
              </li>
            ))}
            {(!posts || posts.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <svg className="w-20 h-20 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-lg">아직 게시물이 없습니다</p>
              </div>
            )}
            {/* 무한 스크롤 감지 요소 (카드뷰) */}
            {posts && posts.length > 0 && hasMore && (
              <li ref={observerTargetCard} className="h-20" />
            )}
          </ul>
        )}
        
        {/* 로그인하지 않은 경우 메시지 표시 - 스크롤하면 나타남 */}
        {!user && posts && posts.length > 0 && showLoginMessage && (
          <div className="fixed bottom-0 lg:bottom-0 left-0 lg:left-64 right-0 pt-4 lg:pt-8 pb-20 lg:pb-11 text-center border-t border-white/10 bg-black transition-opacity duration-300 z-30">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-gray-400 hover:text-white text-sm lg:text-base transition-colors cursor-pointer px-4"
            >
              로그인 하고 더 많은 컨텐츠를 확인해보세요
            </button>
          </div>
        )}
      </section>
      
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
    </>
  );
}