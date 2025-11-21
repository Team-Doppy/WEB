'use client';

import React, { useState, useEffect } from 'react';
import { ProfileImage } from './ProfileImage';
import { LoginForm } from './LoginForm';
import { ProfileEditModal } from './ProfileEditModal';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatDate } from '@/app/utils/date';
import { toggleFollow, getFriendStatus } from '@/app/lib/clientApi';

interface ProfileHeaderProps {
  username: string;
  alias: string;
  profileImageUrl: string | null;
  selfIntroduction: string | null;
  links: string[];
  linkTitles: Record<string, string>;
  createdAt: string;
  totalPosts?: number;
  followersCount?: number;
  followingCount?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  alias,
  profileImageUrl,
  selfIntroduction,
  links,
  linkTitles,
  createdAt,
  totalPosts = 0,
  followersCount = 0,
  followingCount = 0,
}) => {
  const { user, isAuthenticated } = useAuth();
  const isOwnProfile = user?.username === username;
  const [friendStatus, setFriendStatus] = useState<{
    status: 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'BLOCKED' | 'SELF';
    isSentByMe: boolean;
  } | null>(null);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 초기 친구 상태 확인
  useEffect(() => {
    const checkFriendStatus = async () => {
      if (isAuthenticated && !isOwnProfile) {
        const status = await getFriendStatus(username);
        if (status) {
          setFriendStatus({
            status: status.status,
            isSentByMe: status.isSentByMe || false,
          });
        }
      }
    };
    checkFriendStatus();
  }, [username, isAuthenticated, isOwnProfile]);

  const isFollowing = friendStatus?.status === 'ACCEPTED' || friendStatus?.status === 'REQUESTED';

  const handleFollow = async () => {
    // 로그인이 안 되어 있으면 로그인 오버레이 띄우기
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }

    if (isOwnProfile || isFollowingLoading) return;

    setIsFollowingLoading(true);
    const previousStatus = friendStatus;

    try {
      const result = await toggleFollow(username, friendStatus || undefined);
      if (result) {
        setFriendStatus(result);
      } else {
        // 실패 시 롤백
        if (previousStatus) {
          setFriendStatus(previousStatus);
        }
      }
    } catch (error) {
      // 실패 시 롤백
      if (previousStatus) {
        setFriendStatus(previousStatus);
      }
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const getFaviconUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Google의 파비콘 서비스 사용
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return '';
    }
  };

  return (
    <div className="mb-16 pb-10 border-b border-white/10 px-6 md:px-8">
      {/* 프로필 헤더 - 가로 레이아웃 */}
      <div className="flex gap-8 md:gap-12 items-start">
        {/* 왼쪽: 프로필 이미지 - 고정 크기로 설정 */}
        <div className="flex-shrink-0">
          <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] lg:w-[240px] lg:h-[240px] flex items-center justify-center">
            <ProfileImage
              src={profileImageUrl || undefined}
              alt={username}
              size="xl"
              className="!w-full !h-full max-w-full max-h-full object-cover"
            />
          </div>
        </div>

        {/* 오른쪽: 사용자 정보 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 사용자명과 별칭 */}
          <div className="mb-3">
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-1">
              {username}
            </h2>
            {alias && alias !== username && (
              <p className="text-white text-xl md:text-2xl lg:text-3xl">
                {alias}
              </p>
            )}
          </div>

          {/* 소개글 (BIO) */}
          {selfIntroduction && (
            <p className="text-gray-300 text-base md:text-lg lg:text-xl mb-4 leading-relaxed whitespace-pre-line">
              {selfIntroduction}
            </p>
          )}

          {/* 링크 */}
          {links && links.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
              {links.map((link, index) => {
                let displayText = linkTitles[link] || link;
                try {
                  const url = new URL(link);
                  if (!linkTitles[link]) {
                    // 호스트명만 표시 (www 제거)
                    displayText = url.hostname.replace(/^www\./, '');
                  }
                } catch {
                  // URL 파싱 실패 시 원본 링크 표시
                }
                
                const faviconUrl = getFaviconUrl(link);
                
                return (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-base md:text-lg font-medium transition-colors"
                  >
                    {faviconUrl && (
                      <img
                        src={faviconUrl}
                        alt=""
                        className="w-5 h-5 rounded"
                        onError={(e) => {
                          // 파비콘 로드 실패 시 이미지 숨기기
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span>{displayText}</span>
                  </a>
                );
              })}
            </div>
          )}

          {/* 팔로우 버튼 - 가장 아래, 길게 */}
          <div className="mt-auto">
            {!isOwnProfile ? (
              <button
                onClick={handleFollow}
                disabled={isFollowingLoading}
                className={`w-full max-w-lg py-3 px-10 rounded-2xl text-base font-semibold transition-all ${
                  friendStatus?.status === 'ACCEPTED' || friendStatus?.status === 'REQUESTED'
                    ? 'bg-white/10 text-white hover:bg-white/15 border border-white/20'
                    : 'bg-white text-black hover:bg-gray-100'
                } ${isFollowingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isFollowingLoading 
                  ? '처리 중...' 
                  : friendStatus?.status === 'ACCEPTED' 
                    ? '내 글' 
                    : friendStatus?.status === 'REQUESTED'
                      ? (friendStatus.isSentByMe ? '요청됨' : '수락')
                      : '팔로우'}
              </button>
            ) : (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full max-w-lg py-3 px-10 rounded-2xl text-base font-semibold bg-white/10 text-white hover:bg-white/15 transition-all border border-white/20"
              >
                프로필 편집
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 로그인 오버레이 */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-[#1a1a1a] rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto py-16 md:py-20 px-8 md:px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsLoginOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <LoginForm
              onSuccess={() => {
                setIsLoginOpen(false);
              }}
              onClose={() => setIsLoginOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 프로필 편집 모달 */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          // 페이지 새로고침하여 변경사항 반영
          window.location.reload();
        }}
        initialData={{
          username,
          alias,
          profileImageUrl,
          selfIntroduction,
          links,
          linkTitles,
        }}
      />
    </div>
  );
};

