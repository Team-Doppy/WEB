'use client';

import React from 'react';
import Link from 'next/link';
import { Post } from '@/app/types/post.types';
import { createPostSlug } from '@/app/lib/slug';
import { useImageError } from '@/app/hooks/useImageError';

interface PostGridProps {
  post: Post;
  username: string;
  aspectRatio?: '1:1' | '4:5';
}

export const PostGrid: React.FC<PostGridProps> = ({ post, username, aspectRatio = '1:1' }) => {
  const { hasError, handleError } = useImageError();
  const postSlug = createPostSlug(post.title, post.id);
  const postUrl = `/${post.id}/${postSlug}`;

  const aspectClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <Link
      href={postUrl}
      className={`group relative ${aspectClass} overflow-hidden bg-black`}
    >
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : (
        <>
          <img
            src={post.thumbnailImageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
            onError={handleError}
          />
          {/* 호버 시 오버레이 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-semibold">{post.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>
        </>
      )}
    </Link>
  );
};