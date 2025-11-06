'use client';

import React from 'react';
import { MentionNode } from '@/app/types/post.types';

interface MentionBlockProps {
  node: MentionNode;
}

export const MentionBlock: React.FC<MentionBlockProps> = ({ node }) => {
  return (
    <div className="my-3 flex flex-wrap gap-3">
      {node.usernames.map((username, index) => (
        <span
          key={index}
          className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-base font-medium border border-blue-500/30"
        >
          @{username}
        </span>
      ))}
    </div>
  );
};

