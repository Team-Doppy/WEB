'use client';

import React from 'react';
import Link from 'next/link';
import { Post } from '@/app/types/post.types';
import { createPostSlug } from '@/app/lib/slug';
import { useImageError } from '@/app/hooks/useImageError';

interface PostGridProps {
  post: Post;
  username: string;
}

export const PostGrid: React.FC<PostGridProps> = ({ post, username }) => {
  const { hasError, handleError } = useImageError();
  const postSlug = createPostSlug(post.title, post.id);
  const postUrl = `/${username}/${postSlug}`;

  return (
    <Link
      href={postUrl}
      className="aspect-square overflow-hidden rounded-lg bg-gray-800 border border-gray-700 hover:opacity-80 transition-opacity"
    >
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center">
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
        <img
          src={post.thumbnailImageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      )}
    </Link>
  );
};