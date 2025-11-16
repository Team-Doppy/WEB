'use client';

import React from 'react';
import { useImageError } from '@/app/hooks/useImageError';

interface ProfileImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ 
  src, 
  alt, 
  size = 'md',
  className = ''
}) => {
  const { hasError, handleError } = useImageError();

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 ${className}`}>
        <svg className="w-1/2 h-1/2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={handleError}
    />
  );
};

