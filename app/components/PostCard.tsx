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
      <Link href={postUrl} className="flex gap-4 p-4 rounded-lg hover:bg-gray-800/50 transition-colors">
        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
          {hasError ? (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">{post.title}</h3>
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{post.summary || ''}</p>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span>{formatDate(post.createdAt, 'card')}</span>
            <span className="flex items-center gap-1">
              <span>👁️</span>
              <span>{formatNumber(post.viewCount)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>❤️</span>
              <span>{formatNumber(post.likeCount)}</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};

