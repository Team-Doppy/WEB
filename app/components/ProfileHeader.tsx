'use client';

import React, { useState, useEffect } from 'react';
import { ProfileImage } from './ProfileImage';
import { LoginForm } from './LoginForm';
import { ProfileEditModal } from './ProfileEditModal';
import { OpenInAppButton } from './OpenInAppButton';
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
  const [isLinksExpanded, setIsLinksExpanded] = useState(false);

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
    <div className="mb-8 lg:mb-16 pb-6 lg:pb-10 border-b border-white/10 px-4 md:px-6 lg:px-8">
      {/* 프로필 헤더 - 모바일: 이미지 옆에 설명, 그 밑에 버튼 | 데스크톱: 가로 레이아웃 */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 lg:gap-12 items-start">
        {/* 모바일: 이미지 옆에 설명들 */}
        <div className="flex flex-row lg:flex-row gap-4 md:gap-8 lg:gap-12 w-full lg:w-auto items-start">
          {/* 왼쪽: 프로필 이미지 - 고정 크기로 설정 */}
          <div className="flex-shrink-0 mt-2 lg:mt-0">
            <div className="w-[100px] h-[100px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] flex items-center justify-center rounded-full border border-white/20">
              <ProfileImage
                src={profileImageUrl || undefined}
                alt={username}
                size="xl"
                className="!w-full !h-full max-w-full max-h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* 오른쪽: 사용자 정보 - 이미지 높이만큼 최소 높이 설정 */}
          <div className="flex-1 min-w-0 flex flex-col min-h-[100px] md:min-h-[180px] lg:min-h-[220px]">
            {/* 사용자명과 별칭 */}
            <div className="mb-1 lg:mb-3">
              <h2 className="text-white text-xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold mb-1">
                {username}
              </h2>
              {alias && alias !== username && (
                <p className="text-white text-base md:text-xl lg:text-2xl xl:text-3xl">
                  {alias}
                </p>
              )}
            </div>

            {/* 소개글 (BIO) */}
            {selfIntroduction && (
              <p className="text-gray-300 text-sm md:text-base lg:text-lg xl:text-xl mb-2 lg:mb-4 leading-relaxed whitespace-pre-line">
                {selfIntroduction}
              </p>
            )}

            {/* 링크 */}
            {links && links.length > 0 && (
              <div className="mb-2 lg:mb-6">
                <div className="flex flex-col gap-y-0 lg:gap-y-2">
                  {(links.length > 2 && !isLinksExpanded ? links.slice(0, 2) : links).map((link, index) => {
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
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs md:text-sm lg:text-base font-medium transition-colors w-full min-w-0"
                    >
                      {faviconUrl && (
                        <img
                          src={faviconUrl}
                          alt=""
                            className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 rounded"
                          onError={(e) => {
                            // 파비콘 로드 실패 시 이미지 숨기기
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                        <span className="truncate">{displayText}</span>
                    </a>
                  );
                })}
                </div>
              </div>
            )}

            {/* 데스크톱: 버튼 영역 - 이미지 하단에 고정 */}
            <div className="mt-auto hidden lg:block">
              {/* 데스크톱: 링크 확장 버튼 */}
              {links.length > 2 && (
                <button
                  onClick={() => setIsLinksExpanded(!isLinksExpanded)}
                  className="flex mt-2 text-gray-400 hover:text-white text-sm font-medium transition-colors items-center gap-1"
                >
                  {isLinksExpanded ? (
                    <>
                      <span>접기</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>{links.length - 2}개 더 보기</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
              
              {/* 데스크톱: 팔로우/프로필 편집 버튼 - 고정 너비 */}
              <div className={`w-[500px] ${links.length > 2 ? 'mt-4' : ''}`}>
                {!isOwnProfile ? (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowingLoading}
                    className={`w-full py-3 px-10 rounded-2xl text-base font-semibold transition-all ${
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
                    className="w-full py-3 px-10 rounded-2xl text-base font-semibold bg-white/10 text-white hover:bg-white/15 transition-all border border-white/20"
                  >
                    프로필 편집
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 모바일: 버튼 영역 - 이미지/설명 아래 전체 너비 */}
        <div className="lg:hidden w-full flex gap-1 px-0">
          {links.length > 2 && (
            <button
              onClick={() => setIsLinksExpanded(!isLinksExpanded)}
              className="flex-1 py-2.5 px-6 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all flex items-center justify-center gap-1"
            >
              {isLinksExpanded ? (
                <>
                  <span>접기</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>펼치기</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
          {isOwnProfile && (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className={`${links.length > 2 ? 'flex-1' : 'flex-1'} py-2.5 px-6 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all`}
            >
              프로필 편집
            </button>
          )}
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={isFollowingLoading}
              className={`${links.length > 2 ? 'flex-1' : 'flex-1'} py-2.5 px-6 rounded-xl text-xs font-semibold transition-all ${
                friendStatus?.status === 'ACCEPTED' || friendStatus?.status === 'REQUESTED'
                  ? 'bg-white/10 text-white hover:bg-white/15'
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
          )}
        </div>
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
      
      {/* 앱에서 열기 버튼 (모바일 전용) */}
      <OpenInAppButton 
        type="profile" 
        username={username}
        profileImageUrl={profileImageUrl}
        displayName={alias || username}
      />
    </div>
  );
};

