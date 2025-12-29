'use client';

import React, { useState, useEffect } from 'react';
import { isMobile, isInAppBrowser } from '@/app/utils/device';
import { openPostInApp, openProfileInApp } from '@/app/utils/deepLink';
import { ProfileImage } from './ProfileImage';

interface OpenInAppButtonProps {
  type: 'post' | 'profile';
  postId?: string | number;
  username?: string;
  profileImageUrl?: string | null;
  displayName?: string;
  className?: string;
}

/**
 * "앱에서 열기" 모달 컴포넌트 (인스타그램 스타일)
 * 모바일에서만 표시되며, 딥링크로 앱을 엽니다.
 */
export const OpenInAppButton: React.FC<OpenInAppButtonProps> = ({
  type,
  postId,
  username,
  profileImageUrl,
  displayName,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    const mobile = isMobile();
    
    // 모바일이거나 인앱 브라우저일 때만 표시
    setIsVisible(mobile || isInAppBrowser());
  }, []);

  const handleOpenApp = () => {
    if (type === 'post' && postId) {
      openPostInApp(postId);
    } else if (type === 'profile' && username) {
      openProfileInApp(username);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // 모바일이 아니면 표시하지 않음
  if (!isVisible || !isOpen) {
    return null;
  }

  const name = displayName || username || '';

  return (
    <div className={`lg:hidden fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 */}
      <div className="relative bg-[#262626] rounded-2xl w-[85%] max-w-sm mx-4 overflow-hidden">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center pt-12 pb-6 px-6">
          <div className="w-24 h-24 mb-4">
            <ProfileImage
              src={profileImageUrl || undefined}
              alt={name}
              size="xl"
              className="!w-full !h-full rounded-full"
            />
          </div>
          
          {/* 사용자명 */}
          <h3 className="text-white text-lg font-semibold mb-2 text-center">
            {name}
          </h3>
          
          {/* 설명 텍스트 */}
          <p className="text-white/70 text-sm text-center mb-6 leading-relaxed">
            {type === 'post' 
              ? 'Doppy 앱에서 이 글을 확인해보세요.'
              : 'Doppy 앱에서 프로필을 확인해보세요.'}
          </p>

          {/* 앱에서 열기 버튼 */}
          <button
            onClick={handleOpenApp}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 mb-3"
          >
            Doppy 열기
          </button>

          {/* 취소 버튼 */}
          <button
            onClick={handleClose}
            className="w-full text-white/70 hover:text-white py-3 text-sm font-medium transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

