'use client';

import React from 'react';
import Link from 'next/link';
import { MentionNode } from '@/app/types/post.types';

interface MentionBlockProps {
  node: MentionNode;
}

export const MentionBlock: React.FC<MentionBlockProps> = ({ node }) => {
  // 정렬 처리: align 속성이 없으면 center (가운데 정렬)
  const align = node.align || 'center';
  const alignClass = 
    align === 'center' ? 'justify-center' :
    align === 'right' ? 'justify-end' :
    'justify-start';

  return (
    <div className="my-3">
      {/* 실제 콘텐츠 - fade-in 효과 */}
      <div className={`flex flex-wrap gap-3 ${alignClass} transition-opacity duration-500 opacity-0 animate-fade-in`}>
        {node.usernames.map((username, index) => (
          <Link
            key={index}
            href={`/profile/${username}`}
            className="inline-flex items-center px-4 py-2 bg-[#1a1a1a] text-white rounded-full text-lg font-bold border border-white/10 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          >
            @{username}
          </Link>
        ))}
      </div>
    </div>
  );
};

