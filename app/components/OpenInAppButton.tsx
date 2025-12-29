'use client';

import React, { useState, useEffect } from 'react';
import { isMobile, isInAppBrowser } from '@/app/utils/device';
import { openPostInApp, openProfileInApp } from '@/app/utils/deepLink';

interface OpenInAppButtonProps {
  type: 'post' | 'profile';
  postId?: string | number;
  username?: string;
  className?: string;
}

/**
 * "앱에서 열기" 버튼 컴포넌트
 * 모바일에서만 표시되며, 딥링크로 앱을 열거나 스토어로 이동합니다.
 */
export const OpenInAppButton: React.FC<OpenInAppButtonProps> = ({
  type,
  postId,
  username,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    const mobile = isMobile();
    setIsMobileDevice(mobile);
    
    // 모바일이거나 인앱 브라우저일 때만 표시
    setIsVisible(mobile || isInAppBrowser());
  }, []);

  const handleClick = () => {
    if (type === 'post' && postId) {
      openPostInApp(postId);
    } else if (type === 'profile' && username) {
      openProfileInApp(username);
    }
  };

  // 모바일이 아니면 표시하지 않음
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`
        lg:hidden
        fixed bottom-24 left-4 right-4 z-40
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-blue-600 hover:to-purple-700
        active:from-blue-700 active:to-purple-800
        text-white font-semibold text-sm
        py-3.5 px-6 rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        flex items-center justify-center gap-2
        backdrop-blur-sm
        ${className}
      `}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <span>앱에서 열기</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};

