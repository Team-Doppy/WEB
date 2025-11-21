'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/app/types/post.types';
import { createPostSlug } from '@/app/lib/slug';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';

interface FeedPostProps {
  post: Post;
  username: string;
}

export const FeedPost: React.FC<FeedPostProps> = ({ post, username }) => {
  const router = useRouter();
  const postSlug = createPostSlug(post.title, post.id);
  const postUrl = `/${username}/${postSlug}`;

  const handlePostClick = (e: React.MouseEvent) => {
    // 작성자 정보 영역 클릭 시에는 이벤트 전파 중단 (프로필로 이동)
    const target = e.target as HTMLElement;
    if (target.closest('[data-author-section]')) {
      return;
    }
    router.push(postUrl);
  };

  return (
    <article 
      className="mb-12 pb-12 border-b border-gray-800 last:border-b-0 cursor-pointer"
      onClick={handlePostClick}
    >
      {/* 작성자 정보 */}
      <div className="flex items-center gap-3 mb-6" data-author-section>
        <Link 
          href={`/${username}`} 
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={post.authorProfileImageUrl}
            alt={post.author}
            className="w-10 h-10 rounded-full ring-2 ring-white/30"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            href={`/${username}`} 
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
          <div className="relative w-full max-w-2xl aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={post.thumbnailImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 텍스트 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 제목 및 요약 */}
          <div className="block group">
            <h2 className="text-white font-bold text-5xl mb-6 group-hover:text-gray-300 transition-colors leading-tight">
              {post.title}
            </h2>
            {post.summary && (
              <p className="text-gray-400 text-2xl leading-relaxed line-clamp-3">
                {post.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 메타 정보 - 디바이더 선 바로 위, 오른쪽 정렬 */}
      <div className="flex items-center gap-10 text-gray-500 text-lg justify-end pb-12">
        <span className="flex items-center gap-2.5">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {formatNumber(post.viewCount)}
        </span>
        <span className="flex items-center gap-2.5">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {formatNumber(post.likeCount)}
        </span>
      </div>
    </article>
  );
};

