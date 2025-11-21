'use client';

import React from 'react';

interface PasswordBreachModalProps {
  onConfirm: () => void;
}

export const PasswordBreachModal: React.FC<PasswordBreachModalProps> = ({ onConfirm }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        // 배경 클릭 시 닫기
        if (e.target === e.currentTarget) {
          onConfirm();
        }
      }}
    >
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6">
      {/* 정보 아이콘 및 확인 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>보안 정보</span>
          </div>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

