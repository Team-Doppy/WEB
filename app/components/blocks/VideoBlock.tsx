'use client';

import React from 'react';
import { VideoNode } from '@/app/types/post.types';
import { useImageError } from '@/app/hooks/useImageError';

interface VideoBlockProps {
  node: VideoNode;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ node }) => {
  const { hasError, handleError } = useImageError();

  if (hasError) {
    return (
      <div className="my-4 relative">
        <div className="w-full aspect-video bg-[#121212] rounded-lg absolute inset-0"></div>
        <div className="w-full aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-3 border border-gray-700 relative transition-opacity duration-500 opacity-0 animate-fade-in">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">동영상을 불러올 수 없습니다</p>
        </div>
        {node.data.hasComments && node.data.commentCount > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
            💬 {node.data.commentCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="my-4 relative">
      {/* Placeholder - 크기 확보 */}
      <div className="w-full aspect-video bg-[#121212] rounded-lg absolute inset-0"></div>
      
      {/* 실제 콘텐츠 - fade-in 효과 */}
      <div className="relative transition-opacity duration-500 opacity-0 animate-fade-in">
        <video
          src={node.data.url}
          controls
          className="w-full rounded-lg"
          preload="metadata"
          onError={handleError}
          onLoadedData={(e) => {
            // 비디오 로드 완료 시 fade-in
            e.currentTarget.parentElement?.classList.remove('opacity-0');
            e.currentTarget.parentElement?.classList.add('opacity-100');
          }}
        >
          Your browser does not support the video tag.
        </video>
        {node.data.hasComments && node.data.commentCount > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
            💬 {node.data.commentCount}
          </div>
        )}
      </div>
    </div>
  );
};

