'use client';

import React from 'react';
import { VideoNode } from '@/app/types/post.types';

interface VideoBlockProps {
  node: VideoNode;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ node }) => {
  return (
    <div className="my-4 relative">
      <video
        src={node.data.url}
        controls
        className="w-full rounded-lg"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      {node.data.hasComments && node.data.commentCount > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          💬 {node.data.commentCount}
        </div>
      )}
    </div>
  );
};

