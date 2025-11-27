'use client';

import React from 'react';
import { LinkNode } from '@/app/types/post.types';

interface LinkBlockProps {
  node: LinkNode;
}

export const LinkBlock: React.FC<LinkBlockProps> = ({ node }) => {
  const { url, title, description, thumbnailUrl } = node;

  return (
    <div className="my-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 hover:border-white/20 transition-all group"
      >
        {thumbnailUrl && (
          <div className="w-full aspect-video overflow-hidden bg-gray-800">
            <img
              src={thumbnailUrl}
              alt={title || url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          {title && (
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-gray-300 transition-colors">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">
              {description}
            </p>
          )}
          <p className="text-gray-500 text-xs truncate">
            {url}
          </p>
        </div>
      </a>
    </div>
  );
};

