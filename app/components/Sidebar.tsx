'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSearch } from '@/app/contexts/SearchContext';
import { LoginForm } from '@/app/components/LoginForm';
import { ProfileImage } from '@/app/components/ProfileImage';
import { SearchPanel } from '@/app/components/SearchPanel';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { clearSearchResults, searchResults } = useSearch();

  // 검색 패널 열기 이벤트 리스너
  React.useEffect(() => {
    const handleOpenSearchPanel = () => {
      clearSearchResults(); // 검색 결과 초기화
      setIsSearchOpen(true);
    };

    window.addEventListener('openSearchPanel', handleOpenSearchPanel);
    return () => {
      window.removeEventListener('openSearchPanel', handleOpenSearchPanel);
    };
  }, [clearSearchResults]);

  // 검색 실행 함수
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 검색 트리거 이벤트를 dispatch하여 SearchPanel에 알림
      window.dispatchEvent(new CustomEvent('searchTrigger'));
    }
  };

  const menuItems = [
    { icon: 'home', label: '홈', href: '/' },
    { icon: 'search', label: '검색', href: '/search', isButton: true },
    { icon: 'heart', label: '좋아요', href: '/liked' },
    // { icon: 'plus', label: '글쓰기', href: '/create' },
    // { icon: 'settings', label: '설정', href: '/settings' },
  ];

  const getIcon = (iconName: string) => {
    const iconClass = "w-7 h-7";
    switch (iconName) {
      case 'home':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'search':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'compass':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'play':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth={2} />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
          </svg>
        );
      case 'message':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'heart':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'user':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'grid':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'bookmark':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isActive = (href: string) => {
    // 검색이 열려있거나 검색 결과가 있으면 검색 아이템만 활성화
    if (isSearchOpen || searchResults) {
      return href === '/search';
    }
    // 검색이 닫혀있을 때만 다른 탭 활성화 체크
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/search') {
      return false; // 검색 패널이 닫혀있고 검색 결과도 없으면 비활성화
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* 기본 사이드바 - 반응형: 작은 화면은 아이콘만, 큰 화면은 아이콘+텍스트 */}
      <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-black border-r border-white/20 flex flex-col py-4 z-50 transition-all duration-150">
        {/* 로고 */}
        <div className="mb-8 px-3 lg:px-4">
          <Link 
            href="/" 
            onClick={(e) => {
              // 검색 결과가 있으면 검색 결과 초기화
              if (searchResults) {
                clearSearchResults();
              }
              // 로고 클릭 시 검색이 열려있으면 검색 닫기
              if (isSearchOpen) {
                e.preventDefault();
                setIsSearchOpen(false);
                router.push('/');
              }
            }}
            className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Doppy" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // 로고 이미지가 없으면 기본 D 아이콘 표시
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.className = 'w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center border border-gray-700 flex-shrink-0';
                    parent.innerHTML = '<span class="text-white font-bold text-xl">D</span>';
                  }
                }}
              />
            </div>
            <span className="text-white font-bold text-xl hidden lg:inline">Doppy</span>
          </Link>
        </div>

        {/* 메뉴 아이템 */}
        <nav className="flex-1 flex flex-col gap-1 w-full px-3 lg:px-3">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const isSearchItem = item.icon === 'search';
            
            if (item.isButton || isSearchItem) {
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (isSearchItem) {
                      if (!isSearchOpen) {
                        // 검색 패널을 열 때만 검색 결과 초기화
                        clearSearchResults();
                      }
                      setIsSearchOpen(!isSearchOpen);
                    }
                  }}
                  className={`relative flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-3 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#1a1a1a] text-white'
                      : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                  title={item.label}
                >
                  {getIcon(item.icon)}
                  <span className="text-lg font-medium hidden lg:inline whitespace-nowrap">{item.label}</span>
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                </button>
              );
            }

            const isHomeItem = item.href === '/';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  // 검색 결과가 있으면 검색 결과 초기화
                  if (searchResults) {
                    clearSearchResults();
                  }
                  // 검색이 열려있으면 검색 닫기
                  if (isSearchOpen) {
                    setIsSearchOpen(false);
                  }
                  // 홈 아이템을 클릭했고 검색이 열려있으면 검색 닫기
                  if (isHomeItem && isSearchOpen) {
                    e.preventDefault();
                    router.push('/');
                  }
                }}
                  className={`relative flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-3 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-[#1a1a1a] text-white'
                    : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                }`}
                title={item.label}
              >
                {getIcon(item.icon)}
                <span className="text-base font-medium hidden lg:inline whitespace-nowrap">{item.label}</span>
                {('badge' in item) && typeof item.badge === 'number' && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 hidden lg:inline-block">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 로그인/로그아웃 섹션 - 하단에 간격 두고 배치 */}
        <div className="mt-auto pt-4 pb-4 px-3 lg:px-3 border-t border-white/20">
          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              {/* 사용자 프로필 정보 */}
              {user?.username && (
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group"
                >
                  <ProfileImage
                    src={user.profileImageUrl || undefined}
                    alt={user.username}
                    size="sm"
                    className="ring-2 ring-white/20 group-hover:ring-white/30 transition-all"
                  />
                  <div className="flex-1 min-w-0 hidden lg:block">
                    <p className="text-white font-semibold text-base truncate">{user.alias || user.username}</p>
                    <p className="text-gray-400 text-xs">프로필 보기</p>
                  </div>
                </Link>
              )}
              {/* 로그아웃 버튼 */}
              <button
                onClick={async () => {
                  try {
                    await logout();
                    router.push('/');
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-3 py-3 rounded-lg text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                title="로그아웃"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-lg font-medium hidden lg:inline whitespace-nowrap">로그아웃</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-3 py-3 rounded-lg text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors w-full"
              title="로그인"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-lg font-medium hidden lg:inline whitespace-nowrap">로그인</span>
            </button>
          )}
        </div>
      </aside>

      {/* 검색 패널 - 사이드바 오른쪽에 표시 */}
      {isSearchOpen && (
        <>
          <aside className="fixed left-20 lg:left-64 top-0 h-screen w-[calc(100vw-5rem)] lg:w-[500px] bg-black border-r border-white/20 flex flex-col z-40 transition-all duration-150">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 검색 헤더 */}
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-white font-bold text-xl mb-4 text-center">검색</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    className="w-full bg-[#1a1a1a] text-white placeholder-gray-500 rounded-2xl px-4 py-3 pl-10 pr-10 focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-b border-white/20"></div>

              {/* 검색 패널 */}
              <SearchPanel 
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onClose={() => setIsSearchOpen(false)}
              />
            </div>
          </aside>
          
          {/* 배경 오버레이 - 사이드바는 제외 */}
          <div
            className="fixed inset-0 bg-black/50 z-30 transition-all duration-150 left-20 lg:left-64"
            onClick={() => setIsSearchOpen(false)}
          />
        </>
      )}

      {/* 로그인 오버레이 */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // 배경 클릭 시 닫기
            if (e.target === e.currentTarget) {
              setIsLoginOpen(false);
            }
          }}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl border border-white/20 shadow-2xl px-10 md:px-12 py-16 md:py-20 max-w-4xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <LoginForm
              onSuccess={() => {
                setIsLoginOpen(false);
                // 페이지 새로고침 없이 상태만 업데이트
                // AuthContext에서 이미 상태가 업데이트되었으므로 새로고침 불필요
              }}
              onClose={() => setIsLoginOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

