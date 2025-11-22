'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/app/types/post.types';
import { createPostSlug } from '@/app/lib/slug';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';
import { toggleLike } from '@/app/lib/clientApi';
import { useAuth } from '@/app/contexts/AuthContext';
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
  const postSlug = createPostSlug(post.title, post.id);
  const postUrl = `/${post.id}/${postSlug}`;
  
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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

    setIsLiking(true);
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;
    const newIsLiked = !isLiked;

    // 낙관적 업데이트
    setIsLiked(newIsLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      // 토글 전 상태(isLiked)를 전달하여 서버에서 반대 상태로 변경
      const result = await toggleLike(post.id, isLiked);
      if (result) {
        setIsLiked(result.isLiked);
        setLikeCount(result.likeCount);
      } else {
        // 실패 시 롤백
        setIsLiked(previousIsLiked);
        setLikeCount(previousLikeCount);
      }
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  // 프로필 페이지용 크기 조정
  const imageWidth = isProfile ? 'w-[300px] lg:w-[350px] xl:w-[400px]' : 'w-[400px] lg:w-[500px] xl:w-[600px]';
  const titleSize = isProfile ? 'text-2xl lg:text-3xl xl:text-4xl' : 'text-3xl lg:text-4xl xl:text-5xl';
  const summarySize = isProfile ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl';
  const metaSize = isProfile ? 'text-lg' : 'text-2xl';
  const iconSize = isProfile ? 'w-7 h-7' : 'w-10 h-10';
  const gapSize = isProfile ? 'gap-8' : 'gap-12';
  const metaGap = isProfile ? 'gap-8' : 'gap-12';
  const metaIconGap = isProfile ? 'gap-3' : 'gap-4';
  const mbSize = isProfile ? 'mb-0' : 'mb-12';
  const pbSize = isProfile ? 'pb-0' : 'pb-12';

  return (
    <article 
      className={`${mbSize} ${pbSize} cursor-pointer relative`}
      onClick={handlePostClick}
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

      {/* 가로 배치: 이미지 + 텍스트 */}
      <div className={`flex ${gapSize} items-start`}>
        {/* 썸네일 이미지 */}
        <div className="block flex-shrink-0 relative">
          <div className={`relative ${imageWidth} aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden`}>
            <ThumbnailImageWithError
              src={post.thumbnailImageUrl}
              alt={post.title}
            />
            {/* 메타 정보 - 이미지 하단 끝에 정렬 */}
            {!isProfile && (
              <div className={`absolute bottom-0 right-0 flex items-center ${metaGap} text-gray-500 ${metaSize} pr-4 pb-4`}>
                <span className={`flex items-center ${metaIconGap}`}>
                  <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-medium">{formatNumber(post.viewCount)}</span>
                </span>
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
                  <span className="font-medium">{formatNumber(likeCount)}</span>
                </button>
              </div>
            )}
            
            {/* 프로필 페이지용: 조회수만 이미지 하단에 (아이콘 없이 검은색 원형 배경) */}
            {isProfile && (
              <div className="absolute bottom-0 right-0 pr-4 pb-4">
                <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">{formatNumber(post.viewCount)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 텍스트 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 제목 및 요약 */}
          <div className="block group">
            <h2 className={`text-white font-bold ${titleSize} mb-6 group-hover:text-gray-300 transition-colors leading-tight`}>
              {post.title}
            </h2>
            {post.summary && (
              <p className={`text-gray-400 ${summarySize} leading-relaxed line-clamp-3`}>
                {post.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 프로필 페이지용: 하트 버튼 - 카드 오른쪽 하단 */}
      {isProfile && (
        <button
          data-like-button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`absolute bottom-[15px] right-0 flex items-center gap-3 transition-colors cursor-pointer hover:opacity-80 ${
            isLiked ? 'text-red-500' : 'text-gray-500'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''} mr-4`}
        >
          {isLiked ? (
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg 
              className="w-8 h-8 text-gray-500" 
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
          <span className="text-white text-base font-medium">{formatNumber(likeCount)}</span>
        </button>
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

