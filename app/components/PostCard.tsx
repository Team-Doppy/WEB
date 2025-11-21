'use client';

import React from 'react';
import Link from 'next/link';
import { Post } from '@/app/types/post.types';
import { createPostSlug } from '@/app/lib/slug';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';
import { useImageError } from '@/app/hooks/useImageError';

interface PostCardProps {
  post: Post;
  username: string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, username }) => {
  const { hasError, handleError } = useImageError();
  const postSlug = createPostSlug(post.title, post.id);
  const postUrl = `/${username}/${postSlug}`;

  return (
    <li>
      <Link href={postUrl} className="flex gap-8 p-8 rounded-lg hover:bg-gray-800/50 transition-colors">
        <div className="flex-shrink-0 w-56 h-56 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
          {hasError ? (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ) : (
            <img
              src={post.thumbnailImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={handleError}
            />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-white font-semibold text-2xl mb-3 line-clamp-1">{post.title}</h3>
          <p className="text-gray-400 text-lg mb-4 line-clamp-2">{post.summary || ''}</p>
          <div className="flex items-center gap-8 text-gray-500 text-base">
            <span>{formatDate(post.createdAt, 'card')}</span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{formatNumber(post.viewCount)}</span>
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{formatNumber(post.likeCount)}</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};

