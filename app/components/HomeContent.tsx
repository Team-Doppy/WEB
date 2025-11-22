'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '@/app/contexts/SearchContext';
import { FeedPost } from './FeedPost';
import { SearchResultsHeader } from './SearchResultsHeader';
import { getHomeFeedPosts, semanticSearch } from '@/app/lib/clientApi';
import { Post } from '@/app/types/post.types';

interface HomeContentProps {
  initialPosts: Array<Post & { username: string }>;
}

export const HomeContent: React.FC<HomeContentProps> = ({ initialPosts }) => {
  const { searchResults, searchQuery, searchPagination, setSearchResults } = useSearch();
  const [posts, setPosts] = useState<Array<Post & { username: string }>>(initialPosts);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(0);
  const [searchHasMore, setSearchHasMore] = useState(false);

  // 검색 결과가 변경되면 검색 페이지네이션 상태 업데이트
  useEffect(() => {
    if (searchPagination) {
      setSearchHasMore(!searchPagination.last);
      setSearchPage(0);
    }
  }, [searchPagination]);

  // 무한 스크롤을 위한 Intersection Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          if (searchResults && searchHasMore) {
            loadMoreSearchResults();
          } else if (!searchResults && hasMore) {
            loadMoreHomePosts();
          }
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
  }, [hasMore, searchHasMore, isLoading, searchResults]);

  // 검색 패널 열기 함수
  const handleOpenSearch = () => {
    // 커스텀 이벤트로 검색 패널 열기
    window.dispatchEvent(new CustomEvent('openSearchPanel'));
  };

  // 홈 피드 더보기
  const loadMoreHomePosts = async () => {
    if (isLoading || !hasMore || searchResults) return;

    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const result = await getHomeFeedPosts(nextPage, 20);
      
      if (result.posts.length > 0) {
        const postsWithUsername = result.posts.map(post => ({ ...post, username: post.author }));
        setPosts(prev => [...prev, ...postsWithUsername]);
        setCurrentPage(nextPage);
        setHasMore(!result.pagination?.last);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('홈 피드 로드 실패:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 결과 더보기
  const loadMoreSearchResults = async () => {
    if (isLoading || !searchHasMore || !searchQuery) return;

    setIsLoading(true);
    try {
      const nextPage = searchPage + 1;
      const result = await semanticSearch(searchQuery, nextPage, 20);
      
      if (result.posts.length > 0 && searchResults) {
        setSearchResults([...searchResults, ...result.posts], searchQuery, result.pagination);
        setSearchPage(nextPage);
        setSearchHasMore(!result.pagination?.last);
      } else {
        setSearchHasMore(false);
      }
    } catch (error) {
      console.error('검색 결과 로드 실패:', error);
      setSearchHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 결과가 있으면 검색 결과를 표시, 없으면 일반 포스트 표시
  const displayPosts = searchResults || posts;
  const showLoadMore = searchResults ? searchHasMore : hasMore;

  return (
    <>
      {/* 검색 결과 헤더 */}
      {searchResults && searchQuery && (
        <SearchResultsHeader onOpenSearch={handleOpenSearch} />
      )}

      {/* 피드 게시글 목록 */}
      <div>
        {displayPosts.length > 0 ? (
          <>
            <div className="space-y-4 lg:space-y-12">
              {displayPosts.map((post, index) => {
                const username = 'username' in post ? (post.username as string) : post.author;
                return (
                  <FeedPost key={`${username}-${post.id}`} post={post} username={username} isFirst={index === 0} />
                );
              })}
            </div>

            {/* 무한 스크롤 감지 요소 */}
            {showLoadMore && (
              <div ref={observerTarget} className="h-20" />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">
              {searchResults ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

