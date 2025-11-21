'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ left, right }) => {
  return (
    <header className="fixed top-0 left-20 right-0 z-40 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">{left}</div>
        <div className="flex items-center">{right}</div>
      </div>
    </header>
  );
};

interface PostHeaderProps {
  onOpenInApp?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ onOpenInApp }) => {
  return (
    <Header
      left={
        <Link href="/" className="text-white font-semibold text-lg hover:opacity-80 transition-opacity">
          Doppy
        </Link>
      }
      right={
        <button
          onClick={() => {
            console.log('store 이동');
            onOpenInApp?.();
          }}
          className="text-white text-sm hover:opacity-80 transition-opacity"
        >
          Open in app
        </button>
      }
    />
  );
};

interface UserHeaderProps {
  username: string;
  onBack?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ username, onBack }) => {
  return (
    <Header
      left={
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                window.history.back();
              }
            }}
            className="text-white hover:opacity-80 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white font-semibold">{username}</span>
        </div>
      }
    />
  );
};

