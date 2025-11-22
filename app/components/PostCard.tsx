'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/app/types/post.types';
import { createPostSlug } from '@/app/lib/slug';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';
import { toggleLike as toggleLikeApi } from '@/app/lib/clientApi';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLikeState } from '@/app/contexts/LikeStateContext';
import { LoginForm } from './LoginForm';
import { ProfileImage } from './ProfileImage';

interface ThumbnailImageWithErrorProps {
  src: string;
  alt: string;
}

const ThumbnailImageWithError: React.FC<ThumbnailImageWithErrorProps> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gray-800 flex flex-col items-center justify-center gap-3 border border-gray-700 rounded-lg">
        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
};

interface PostCardProps {
  post: Post;
  username: string;
  isProfile?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, username, isProfile = false }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getLikeState, initializeLikeState, toggleLike: toggleLikeState, syncWithServer } = useLikeState();
  const postSlug = createPostSlug(post.title, post.id);
  const postUrl = `/${post.id}/${postSlug}`;
  
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

  const handlePostClick = (e: React.MouseEvent) => {
    // 작성자 정보 영역 클릭 시에는 이벤트 전파 중단 (프로필로 이동)
    const target = e.target as HTMLElement;
    if (target.closest('[data-author-section]') || target.closest('[data-like-button]')) {
      return;
    }
    router.push(postUrl);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  // 프로필 페이지용 크기 조정 (FeedPost와 동일하게)
  const imageWidth = isProfile ? 'w-full lg:w-[500px] xl:w-[600px]' : 'w-full lg:w-[500px] xl:w-[600px]';
  const titleSize = isProfile ? 'text-xl lg:text-5xl xl:text-6xl' : 'text-xl lg:text-4xl xl:text-5xl';
  const summarySize = isProfile ? 'text-lg lg:text-2xl' : 'text-lg lg:text-2xl';
  const metaSize = isProfile ? 'text-lg' : 'text-2xl';
  const iconSize = isProfile ? 'w-7 h-7' : 'w-10 h-10';
  const gapSize = isProfile ? 'gap-0.5 lg:gap-12' : 'gap-2 lg:gap-12';
  const metaGap = isProfile ? 'gap-8' : 'gap-12';
  const metaIconGap = isProfile ? 'gap-3' : 'gap-4';
  const mbSize = isProfile ? 'mb-0.5 lg:mb-0.5' : 'mb-2 lg:mb-12';
  const pbSize = isProfile ? 'pb-0.5 lg:pb-0.5' : 'pb-2 lg:pb-12';

  return (
    <article 
      className={`${mbSize} ${pbSize} cursor-pointer relative`}
      onClick={handlePostClick}
      style={{ position: 'relative' }}
    >
      {/* 작성자 정보 - 프로필 페이지에서는 숨김 */}
      {!isProfile && (
      <div className={`flex items-center gap-3 ${mbSize}`} data-author-section>
        <Link 
          href={`/profile/${username}`} 
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ProfileImage
            src={post.authorProfileImageUrl || undefined}
            alt={post.author}
            size="sm"
            className="!w-10 !h-10"
            isProfile={isProfile}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            href={`/profile/${username}`} 
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white font-semibold text-sm hover:underline">
              {post.author}
            </span>
          </Link>
        </div>
        <span className="text-gray-500 text-sm">
          {formatDate(post.createdAt, 'medium')}
        </span>
      </div>
      )}

      {/* 프로필 피드 카드뷰: 가로 레이아웃 (이미지 왼쪽, 텍스트 오른쪽) */}
      {isProfile ? (
        <>
          <div className="flex flex-row gap-3 lg:gap-6 items-start">
            {/* 이미지 영역 - 왼쪽 (데스크톱에서 더 크게) */}
            <div className="relative flex-shrink-0 w-[150px] md:w-[180px] lg:w-[300px] xl:w-[350px] aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden">
              <ThumbnailImageWithError
                src={post.thumbnailImageUrl}
                alt={post.title}
              />
              {/* 뷰카운트 - 이미지 좌측 하단 */}
              <div className="absolute bottom-0 left-0 pl-1 pb-1 lg:pl-2 lg:pb-2 z-10">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-black/70 flex items-center justify-center">
                  <span className="text-white text-xs lg:text-sm font-medium">{formatNumber(post.viewCount)}</span>
                </div>
              </div>
            </div>
            
            {/* 텍스트 콘텐츠 영역 - 오른쪽 */}
            <div className="flex-1 min-w-0 flex flex-col gap-2 lg:gap-3">
              {/* 제목 - 가로로 (데스크톱에서 더 크게) */}
              <h2 className="text-white font-bold text-base md:text-lg lg:text-2xl xl:text-3xl group-hover:text-gray-300 transition-colors leading-tight">
                {post.title}
              </h2>
              
              {/* 타임스탬프 */}
              <span className="text-gray-500 text-xs md:text-sm lg:text-base">
                {formatDate(post.createdAt, 'medium')}
              </span>
              
              {/* 써머리 */}
              {post.summary && (
                <p className="text-gray-400 text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed line-clamp-3 break-words overflow-wrap-anywhere">
                  {post.summary}
                </p>
              )}
            </div>
          </div>
          
          {/* 하트 버튼 - 카드 전체(article) 기준 우측 하단 */}
          <button
            data-like-button
            onClick={handleLikeClick}
            disabled={isLiking}
            style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 20 }}
            className={`flex items-center gap-1.5 lg:gap-2 transition-colors cursor-pointer hover:opacity-80 ${
              isLiked ? 'text-red-600' : 'text-gray-500'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLiked ? (
              <svg 
                className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg 
                className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            )}
            <span className="text-gray-500 text-sm lg:text-base font-medium">{formatNumber(likeCount)}</span>
          </button>
        </>
      ) : (
        /* 검색 결과 등: 기존 레이아웃 유지 */
        <div className={`flex flex-row lg:flex-row ${gapSize} items-start mb-2 lg:mb-6`}>
          {/* 썸네일 이미지 */}
          <div className="flex-1 lg:flex-shrink-0">
            <div className={`relative ${imageWidth} aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden`}>
              <ThumbnailImageWithError
                src={post.thumbnailImageUrl}
                alt={post.title}
              />
              {/* 메타 정보 */}
              <div className={`absolute bottom-0 right-0 flex items-center text-gray-500 ${metaSize} pr-4 pb-4`}>
                <button
                  data-like-button
                  onClick={handleLikeClick}
                  disabled={isLiking}
                  className={`flex items-center ${metaIconGap} transition-colors cursor-pointer hover:opacity-80 ${
                    isLiked ? 'text-red-500' : 'text-gray-500'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLiked ? (
                    <svg 
                      className={`${iconSize} text-red-500`} 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg 
                      className={`${iconSize} text-gray-500`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  )}
                  <span className="text-gray-500 font-medium">{formatNumber(likeCount)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 텍스트 콘텐츠 */}
          <div className="flex-1 min-w-0 flex flex-col items-start">
            <h2 className={`text-white font-bold ${titleSize} mb-3 lg:mb-6 group-hover:text-gray-300 transition-colors leading-tight`}>
              {post.title}
            </h2>
            {post.summary && (
              <p className={`text-gray-400 ${summarySize} leading-relaxed line-clamp-3 break-words overflow-wrap-anywhere`}>
                {post.summary}
              </p>
            )}
          </div>
        </div>
      )}


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

