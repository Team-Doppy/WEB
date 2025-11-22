'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { semanticSearch, searchPostsByTitle, getTrendingKeywords, searchUsers, type TrendingKeyword, type UserSearchResult } from '@/app/lib/clientApi';
import { Post } from '@/app/types/post.types';
import { createPostSlug } from '@/app/lib/slug';
import { formatDate } from '@/app/utils/date';
import { useDebounce } from '@/app/hooks/useDebounce';
import { ProfileImage } from './ProfileImage';
import { useSearch } from '@/app/contexts/SearchContext';

interface SearchPanelProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClose?: () => void; // 검색 패널 닫기 콜백
}

const RECENT_SEARCHES_KEY = 'doppy_recent_searches';
const MAX_RECENT_SEARCHES = 10;

// 로컬 스토리지에서 최근 검색 항목 불러오기
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// 로컬 스토리지에 최근 검색 항목 저장
const saveRecentSearch = (query: string): void => {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const recent = getRecentSearches();
    // 중복 제거 및 최신순으로 정렬
    const filtered = recent.filter((q: string) => q !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('최근 검색 항목 저장 실패:', error);
  }
};

// 최근 검색 항목 삭제
const removeRecentSearch = (query: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((q: string) => q !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('최근 검색 항목 삭제 실패:', error);
  }
};

export const SearchPanel: React.FC<SearchPanelProps> = ({ searchQuery, onSearchQueryChange, onClose }) => {
  const router = useRouter();
  const { setSearchResults: setGlobalSearchResults } = useSearch();
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  // 최근 검색 항목 로드
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // 실시간 검색어 로드
  useEffect(() => {
    const loadTrending = async () => {
      if (!searchQuery) {
        const trending = await getTrendingKeywords(5);
        if (trending) {
          setTrendingKeywords(trending.keywords);
        }
      }
    };
    loadTrending();
  }, [searchQuery]);

  // 실시간 유저 검색
  useEffect(() => {
    const performUserSearch = async () => {
      if (!debouncedQuery.trim()) {
        setUserResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchUsers(debouncedQuery);
        setUserResults(results);
      } catch (error) {
        console.error('유저 검색 실패:', error);
        setUserResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performUserSearch();
  }, [debouncedQuery]);

  // 시맨틱 검색 실행 (검색 버튼 클릭 또는 엔터 키 입력 시)
  const performSemanticSearch = useCallback(async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearchingPosts(false);
      setGlobalSearchResults(null, null, null);
      return;
    }

    // 최근 검색 항목에 저장
    saveRecentSearch(searchTerm);
    setRecentSearches(getRecentSearches());

    setIsSearchingPosts(true);
    setIsLoading(true);
    
    try {
      const result = await semanticSearch(searchTerm, 0, 20);
      
      // 검색 결과가 있으면 전역 상태에 저장하고 검색 패널 즉시 닫기
      if (result.posts.length > 0) {
        setGlobalSearchResults(result.posts, searchTerm, result.pagination);
        // 검색 패널 먼저 닫기 (로딩 상태 유지하면서 닫기)
        if (onClose) {
          onClose();
        }
        // 홈으로 이동
        router.push('/');
        // 상태는 그대로 두고 패널만 닫기 (검색 결과 없음 메시지가 보이지 않도록)
        return;
      } else {
        // 검색 결과가 없을 때만 패널에 표시
        setSearchResults([]);
        setGlobalSearchResults(null, null, null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('시맨틱 검색 실패:', error);
      setSearchResults([]);
      setGlobalSearchResults(null, null, null);
      setIsLoading(false);
    }
  }, [searchQuery, setGlobalSearchResults, router, onClose]);

  // 검색 트리거 이벤트 리스너 (엔터 키 또는 검색 버튼 클릭 시)
  useEffect(() => {
    const handleSearchTrigger = () => {
      performSemanticSearch();
    };

    window.addEventListener('searchTrigger', handleSearchTrigger);
    return () => {
      window.removeEventListener('searchTrigger', handleSearchTrigger);
    };
  }, [performSemanticSearch]);

  const handlePostClick = (post: Post) => {
    const postSlug = createPostSlug(post.title, post.id);
    router.push(`/${post.id}/${postSlug}`);
  };

  const handleKeywordClick = (keyword: string) => {
    onSearchQueryChange(keyword);
    // 실시간 검색어 클릭 시 시맨틱 검색 실행
    performSemanticSearch(keyword);
  };

  const handleRecentSearchClick = (query: string) => {
    onSearchQueryChange(query);
    // 최근 검색 항목 클릭 시 시맨틱 검색 실행
    performSemanticSearch(query);
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  };

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 검색 결과 또는 실시간 검색어 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-20 lg:pb-4">
        {searchQuery ? (
          <>
            {isSearchingPosts ? (
              // 시맨틱 검색 결과 (포스트)
              <>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="text-gray-400 text-sm mt-4">검색 중...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-white text-sm font-semibold mb-4">
                      검색 결과 ({searchResults.length}개)
                    </h3>
                    {searchResults.map((post) => {
                      const postSlug = createPostSlug(post.title, post.id);
                      return (
                        <div
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                          className="p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {post.thumbnailImageUrl && (
                              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={post.thumbnailImageUrl}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-base mb-1 line-clamp-1">
                                {post.title}
                              </h4>
                              {post.summary && (
                                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                                  {post.summary}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-gray-500 text-xs">
                                <span>{post.author}</span>
                                <span>·</span>
                                <span>{formatDate(post.createdAt, 'short')}</span>
                                <span>·</span>
                                <span>조회 {post.viewCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
                  </div>
                )}
              </>
            ) : (
              // 실시간 유저 검색 결과
              <>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="text-gray-400 text-sm mt-4">검색 중...</p>
                  </div>
                ) : userResults.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-semibold mb-4">사용자</h3>
                    {userResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user.username)}
                        className="p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ProfileImage
                            src={user.profileImageUrl || undefined}
                            alt={user.username}
                            size="md"
                            className="w-10 h-10"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm">{user.alias || user.username}</p>
                            <p className="text-gray-400 text-xs">@{user.username}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">사용자를 찾을 수 없습니다.</p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* 실시간 검색어 */}
            {trendingKeywords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white text-sm font-semibold mb-4">실시간 검색어</h3>
                <div className="space-y-2">
                  {trendingKeywords.map((item, index) => (
                    <button
                      key={item.keyword}
                      onClick={() => handleKeywordClick(item.keyword)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm font-bold w-6">{index + 1}</span>
                        <span className="text-white text-sm">{item.keyword}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 최근 검색 항목 */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-4">최근 검색 항목</h3>
              {recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {recentSearches.map((query) => (
                    <div
                      key={query}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] transition-colors group"
                    >
                      <button
                        onClick={() => handleRecentSearchClick(query)}
                        className="flex-1 text-left"
                      >
                        <span className="text-white text-sm">{query}</span>
                      </button>
                      <button
                        onClick={(e) => handleRemoveRecentSearch(e, query)}
                        className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm text-center py-8">
                  최근 검색 내역 없음.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

