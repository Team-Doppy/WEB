'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileImage } from './ProfileImage';
import { LoginForm } from './LoginForm';
import { useAuth } from '@/app/contexts/AuthContext';

interface PrivatePostViewProps {
  username: string;
  authorProfileImageUrl?: string;
}

export const PrivatePostView: React.FC<PrivatePostViewProps> = ({ 
  username,
  authorProfileImageUrl 
}) => {
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const { isAuthenticated } = useAuth();

  // 로그인한 상태에서는 다른 UI 표시
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <main className="pt-8 pb-16 px-4 ml-20 lg:ml-64 transition-all duration-150">
          <div className="max-w-4xl mx-auto">
            {/* 비공개 글 메시지 - 로그인한 상태 */}
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-white whitespace-nowrap">
                    작성자가 이 글을 특정 사용자에게만 공개했어요.
                  </h2>
                  <p className="text-gray-400 text-lg whitespace-nowrap">
                    이 글을 볼 권한이 없습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 로그인하지 않은 상태
  return (
    <div className="min-h-screen bg-[#121212]">
      <main className="pt-8 pb-16 px-4 ml-20 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl mx-auto">
          {/* 비공개 글 메시지 */}
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white whitespace-nowrap">
                  작성자가 이 글을 특정 사용자에게만 공개했어요.
                </h2>
                <p className="text-gray-400 text-lg whitespace-nowrap">
                  확인하려면 먼저 로그인해 주세요
                </p>
              </div>

              {/* 로그인 버튼 */}
              <button
                onClick={() => setShowLoginOverlay(true)}
                className="mt-8 w-full px-6 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 로그인 오버레이 */}
      {showLoginOverlay && (
        <LoginOverlay 
          onClose={() => setShowLoginOverlay(false)}
          onSuccess={() => {
            setShowLoginOverlay(false);
            // 로그인 성공 후 페이지 새로고침 또는 상태 업데이트
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

interface LoginOverlayProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onClose, onSuccess }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <LoginForm onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>
  );
};

