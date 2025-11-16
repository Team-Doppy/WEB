'use client';

import React from 'react';
import { ContentNode } from '@/app/types/post.types';

interface SkeletonBlockProps {
  node: ContentNode;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ node }) => {
  switch (node.type) {
    case 'paragraph':
      const paragraphNode = node as any;
      // 실제 텍스트 높이를 추정하여 크기 확보
      const estimatedHeight = paragraphNode.isTitle 
        ? 'h-20' // 제목은 더 큰 높이
        : paragraphNode.text 
          ? `min-h-[${Math.max(24, paragraphNode.text.length * 0.5)}px]` 
          : 'h-6'; // 빈 줄
      
      return (
        <div className="my-4">
          <div className={`bg-[#121212] ${paragraphNode.isTitle ? 'h-20' : 'min-h-6'}`}>
            {paragraphNode.isTitle && (
              <div className="h-6 bg-gray-800/30 rounded w-1/2"></div>
            )}
            {paragraphNode.text && !paragraphNode.isTitle && (
              <div className="h-4 bg-gray-800/30 rounded w-3/4"></div>
            )}
          </div>
        </div>
      );
    
    case 'image':
      return (
        <div className="my-4">
          <div className="w-full aspect-video bg-[#121212] rounded-lg"></div>
        </div>
      );
    
    case 'video':
      return (
        <div className="my-4">
          <div className="w-full aspect-video bg-[#121212] rounded-lg"></div>
        </div>
      );
    
    case 'imageRow':
      const imageRowNode = node as any;
      const urls = imageRowNode.urls || [];
      const count = Math.min(urls.length, 3);
      const spacing = imageRowNode.spacing || 2;
      return (
        <div className="my-4">
          <div 
            className="grid bg-[#121212]"
            style={{ 
              gridTemplateColumns: `repeat(${count || 3}, 1fr)`,
              gap: `${spacing}px`
            }}
          >
            {Array.from({ length: count || 3 }).map((_, i) => (
              <div key={i} className="w-full aspect-square bg-[#121212]"></div>
            ))}
          </div>
        </div>
      );
    
    case 'mention':
      return (
        <div className="my-4">
          <div className="h-6 bg-[#121212] w-32"></div>
        </div>
      );
    
    default:
      return (
        <div className="my-4">
          <div className="h-4 bg-[#121212] w-full"></div>
        </div>
      );
  }
};

