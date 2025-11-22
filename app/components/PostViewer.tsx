'use client';

import React, { useState } from 'react';
import { Post } from '@/app/types/post.types';
import { ReadOnlyEditor } from './ReadOnlyEditor';

interface PostViewerProps {
  post: Post;
}

export const PostViewer: React.FC<PostViewerProps> = ({ post }) => {
  const [showContent, setShowContent] = useState(true);

  if (showContent) {
    return (
      <main className="min-h-screen bg-black">
        <div className="ml-0 lg:ml-64">
          <div className="max-w-4xl mx-auto py-12 px-4">
            <ReadOnlyEditor post={post} />
          </div>
        </div>
      </main>
    );
  }

  // 초기 화면: 썸네일 배경 + 고급스러운 UI
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* 배경 이미지 전체 */}
          {post.thumbnailImageUrl && (
            <div className="absolute inset-0">
              <img
                src={post.thumbnailImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/60 to-black/80" />

          {/* 가로 레이아웃 */}
          <div className="relative flex min-h-[500px]">
            {/* 왼쪽: 썸네일 영역 (40%) */}
            <div className="w-2/5 relative">
              {/* 하단 그라데이션 */}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* 오른쪽: 콘텐츠 영역 (60%) */}
            <div className="w-3/5 relative">
              {/* Blur 오버레이 */}
              <div 
                className="absolute inset-0 bg-black/40"
                style={{ backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}
              />

              {/* 콘텐츠 */}
              <div className="relative h-full flex flex-col justify-center px-14 py-16">
                {/* 상단: 제목 + 요약 */}
                <div className="mb-auto">
                  <h1 className="text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
                    {post.title}
                  </h1>

                  {/* 요약 - 항상 표시 */}
                  <p className="text-lg text-white/85 leading-relaxed line-clamp-3 mb-8">
                    {post.summary || '클릭하여 전체 내용을 확인하세요.'}
                  </p>
                </div>

                {/* 중단: 작성자 & 통계 */}
                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorProfileImageUrl}
                      alt={post.author}
                      className="w-11 h-11 rounded-full ring-2 ring-white/30 shadow-lg"
                    />
                    <div>
                      <p className="text-white/95 font-semibold text-sm">{post.author}</p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-white/65 text-sm ml-auto">
                    <span className="flex items-center gap-2">
                      <span className="text-base">👁️</span>
                      <span className="font-medium">{post.viewCount.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-base">❤️</span>
                      <span className="font-medium">{post.likeCount.toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* 하단: 버튼 */}
                <button
                  onClick={() => setShowContent(true)}
                  className="group inline-flex items-center justify-center w-full px-8 py-4 bg-white/95 hover:bg-white text-black text-base font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.2)] hover:translate-y-[-2px] active:translate-y-0"
                >
                  <span>글 보러가기</span>
                  <svg 
                    className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

