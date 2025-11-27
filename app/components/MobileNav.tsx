'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSearch } from '@/app/contexts/SearchContext';
import { ProfileImage } from './ProfileImage';
import { LoginForm } from './LoginForm';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { clearSearchResults, searchResults } = useSearch();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const menuItems = [
    { icon: 'home', label: '홈', href: '/' },
    { icon: 'search', label: '검색', href: '/search', isButton: true },
    { icon: 'heart', label: '좋아요', href: '/liked' },
  ];

  const getIcon = (iconName: string) => {
    const iconClass = "w-6 h-6";
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
      case 'heart':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/20 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const isSearchItem = item.icon === 'search';
          
          // 검색 버튼은 이벤트로 처리
          if (item.isButton || isSearchItem) {
            return (
              <button
                key={item.href}
                onClick={() => {
                  // 검색 패널 열기 이벤트 발생
                  clearSearchResults(); // 검색 결과 초기화
                  window.dispatchEvent(new CustomEvent('openSearchPanel'));
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  searchResults
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                {getIcon(item.icon)}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
            >
              {getIcon(item.icon)}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        
        {/* 프로필 */}
        {isAuthenticated && user ? (
          <>
            <Link
              href={`/profile/${user.username}`}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                pathname?.startsWith(`/profile/${user.username}`)
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
            >
              <ProfileImage
                src={user.profileImageUrl || undefined}
                alt={user.username}
                size="sm"
                className="w-6 h-6"
              />
              <span className="text-xs mt-1">프로필</span>
            </Link>
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
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-white transition-colors"
              title="로그아웃"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">로그아웃</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">로그인</span>
          </button>
        )}
      </div>

      {/* 로그인 오버레이 */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            // 배경 클릭 시 닫기
            if (e.target === e.currentTarget) {
              setIsLoginOpen(false);
            }
          }}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl border border-white/20 shadow-2xl px-6 md:px-12 py-16 md:py-20 max-w-4xl w-full max-h-[95vh] overflow-y-auto"
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
    </nav>
  );
};

