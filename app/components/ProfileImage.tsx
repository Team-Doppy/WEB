'use client';

import React from 'react';
import { useImageError } from '@/app/hooks/useImageError';

interface ProfileImageProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isProfile?: boolean; // 프로필 피드에서 사용되는지 여부
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ 
  src, 
  alt, 
  size = 'md',
  className = '',
  isProfile = false
}) => {
  const { hasError, handleError } = useImageError();

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-40 h-40',
    xl: 'w-48 h-48',
  };

  // username의 첫 글자 추출 (alt에서)
  const getInitial = (text: string): string => {
    if (!text) return '?';
    // 한글, 영문, 숫자 등 첫 글자 추출
    const firstChar = text.trim().charAt(0).toUpperCase();
    return firstChar || '?';
  };

  // 이미지가 없거나 에러가 발생한 경우 username 첫 글자 표시
  if (hasError || !src) {
    const initial = getInitial(alt);
    // 폰트 크기 계산
    const fontSizeMap = {
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '2rem',       // 32px
      xl: '2.5rem',     // 40px
    };
    
    // className에 명시적 크기(w-*, h-*)가 있으면 sizeClasses 무시
    const hasExplicitSize = /w-\d+|h-\d+/.test(className);
    const shouldOverrideSize = className.includes('w-full') || className.includes('h-full') || hasExplicitSize;
    
    // 프로필 피드에서는 보더를 더 두껍게
    const borderClass = 'border-2';
    
    return (
      <div className={`${shouldOverrideSize ? '' : sizeClasses[size]} rounded-full bg-black flex items-center justify-center ${borderClass} border-gray-700 ${className}`}>
        <span className="text-white font-semibold" style={{ fontSize: fontSizeMap[size] }}>
          {initial}
        </span>
      </div>
    );
  }

  // className에 명시적 크기(w-*, h-*)가 있으면 sizeClasses 무시
  const hasExplicitSize = /w-\d+|h-\d+/.test(className);
  const shouldOverrideSize = className.includes('w-full') || className.includes('h-full') || hasExplicitSize;
  
  return (
    <img
      src={src}
      alt={alt}
      className={`${shouldOverrideSize ? '' : sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={handleError}
    />
  );
};

