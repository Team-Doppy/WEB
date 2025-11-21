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
      const isTitle = paragraphNode.isTitle;
      const text = paragraphNode.text;
      
      return (
        <div className="my-6">
          {isTitle ? (
            <div className="h-10 bg-[#1a1a1a] rounded-md animate-shimmer w-3/4"></div>
          ) : text ? (
            <div className="space-y-4">
              <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
              <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
              <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-4/5"></div>
            </div>
          ) : (
            <div className="h-6"></div>
          )}
        </div>
      );
    
    case 'image':
      return (
        <div className="my-6">
          <div className="w-full h-[500px] bg-[#1a1a1a] rounded-lg animate-shimmer overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
          </div>
        </div>
      );
    
    case 'video':
      return (
        <div className="my-6">
          <div className="w-full aspect-video bg-[#1a1a1a] rounded-lg animate-shimmer overflow-hidden relative">
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-black/30 border-2 border-white/20"></div>
            </div>
          </div>
        </div>
      );
    
    case 'imageRow':
      const imageRowNode = node as any;
      const urls = imageRowNode.urls || [];
      const count = Math.min(urls.length, 3);
      const spacing = imageRowNode.spacing || 2;
      return (
        <div className="my-6">
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${count || 3}, 1fr)`,
              gap: `${spacing}px`
            }}
          >
            {Array.from({ length: count || 3 }).map((_, i) => (
              <div 
                key={i} 
                className="w-full aspect-square bg-[#1a1a1a] rounded animate-shimmer overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'mention':
      return (
        <div className="my-6">
          <div className="inline-block h-7 bg-[#1a1a1a] rounded-md animate-shimmer w-32"></div>
        </div>
      );
    
    default:
      return (
        <div className="my-6">
          <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
        </div>
      );
  }
};

