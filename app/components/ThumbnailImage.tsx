'use client';

import React from 'react';
import { useImageError } from '@/app/hooks/useImageError';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({ 
  src, 
  alt,
  className = ''
}) => {
  const { hasError, handleError } = useImageError();

  if (hasError) {
    return (
      <div className={`w-full aspect-video bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-3 border border-gray-700 ${className}`}>
        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-auto object-cover ${className}`}
      onError={handleError}
    />
  );
};

