'use client';

import React from 'react';
import { MentionNode } from '@/app/types/post.types';

interface MentionBlockProps {
  node: MentionNode;
}

export const MentionBlock: React.FC<MentionBlockProps> = ({ node }) => {
  return (
    <div className="my-3 relative">
      {/* Placeholder - 크기 확보 */}
      <div className="h-10 bg-black absolute inset-0"></div>
      
      {/* 실제 콘텐츠 - fade-in 효과 */}
      <div className="relative flex flex-wrap gap-3 transition-opacity duration-500 opacity-0 animate-fade-in">
        {node.usernames.map((username, index) => (
          <span
            key={index}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-base font-medium border border-gray-700"
          >
            @{username}
          </span>
        ))}
      </div>
    </div>
  );
};

