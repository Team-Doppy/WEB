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

interface FeedPostProps {
  post: Post;
  username: string;
}

export const FeedPost: React.FC<FeedPostProps> = ({ post, username }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const postSlug = createPostSlug(post.title, post.id);
  const postUrl = `/${post.id}/${postSlug}`;
  
  const [isLiked, setIsLiked] = useState(post.isLiked);
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

    // 낙관적 업데이트
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
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

  return (
    <article 
      className="mb-12 pb-12 cursor-pointer relative"
      onClick={handlePostClick}
    >
      {/* 작성자 정보 */}
      <div className="flex items-center gap-3 mb-6" data-author-section>
        <Link 
          href={`/profile/${username}`} 
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ProfileImage
            src={post.authorProfileImageUrl || undefined}
            alt={post.author}
            size="sm"
            className="w-10 h-10 ring-2 ring-white/30"
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

      {/* 가로 배치: 이미지 + 텍스트 */}
      <div className="flex gap-12 items-start mb-6">
        {/* 썸네일 이미지 */}
        <div className="block flex-shrink-0">
          <div className="relative w-[400px] lg:w-[500px] xl:w-[600px] aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden">
            <ThumbnailImageWithError
              src={post.thumbnailImageUrl}
              alt={post.title}
            />
            {/* 조회수 - 이미지 하단에 검은색 원형 배경 */}
            <div className="absolute bottom-0 right-0 pr-4 pb-4">
              <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
                <span className="text-white text-xs font-medium">{formatNumber(post.viewCount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 텍스트 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 제목 및 요약 */}
          <div className="block group">
            <h2 className="text-white font-bold text-3xl lg:text-4xl xl:text-5xl mb-6 group-hover:text-gray-300 transition-colors leading-tight">
              {post.title}
            </h2>
            {post.summary && (
              <p className="text-gray-400 text-xl lg:text-2xl leading-relaxed line-clamp-3">
                {post.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 하트 버튼 - 카드 오른쪽 하단 */}
      <button
        data-like-button
        onClick={handleLikeClick}
        disabled={isLiking}
        className={`absolute bottom-[75px] right-0 flex items-center gap-3 transition-colors cursor-pointer hover:opacity-80 ${
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
    </article>
  );
};

