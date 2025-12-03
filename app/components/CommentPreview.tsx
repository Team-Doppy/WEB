'use client';

import React, { useEffect, useState } from 'react';
import { Comment, CommentResponse } from '@/app/types/comment.types';
import { getCommentsByPostId } from '@/app/lib/clientApi';
import { formatDate } from '@/app/utils/date';
import { ProfileImage } from './ProfileImage';
import { CommentSidePanel } from './CommentSidePanel';
import { parseCommentContent } from '@/app/utils/commentParser';
import Image from 'next/image';

interface CommentPreviewProps {
  postId: number;
}

const MAX_PREVIEW_COMMENTS = 5;

export const CommentPreview: React.FC<CommentPreviewProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const response = await getCommentsByPostId(postId, 0, MAX_PREVIEW_COMMENTS);
        
        if (response?.success && response.data) {
          setComments(response.data.content || []);
          setTotalComments(response.data.totalElements || 0);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('댓글 로딩 오류:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleOpenSidePanel = () => {
    setIsSidePanelOpen(true);
  };

  if (isLoading) {
    return (
      <div className="mt-16 pt-8 border-t border-white/10">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400 text-sm">댓글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <>
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-gray-400 text-sm mb-4">댓글을 불러올 수 없습니다</div>
            <button
              onClick={handleOpenSidePanel}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors text-sm"
            >
              더 많은 채팅 보기
            </button>
          </div>
        </div>
        <CommentSidePanel 
          postId={postId} 
          isOpen={isSidePanelOpen} 
          onClose={() => setIsSidePanelOpen(false)} 
        />
      </>
    );
  }

  const hasMoreComments = totalComments > MAX_PREVIEW_COMMENTS;

  return (
    <>
      <div className="mt-16 pt-8 border-t border-white/10">
        {/* 댓글 목록 */}
        {comments.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-2.5 animate-fade-in"
                >
                  {/* 프로필 이미지 */}
                  <div className="flex-shrink-0 pt-0.5">
                    <ProfileImage
                      src={comment.authorProfileImageUrl}
                      alt={comment.author}
                      size="sm"
                      className="w-8 h-8 lg:w-9 lg:h-9 rounded-full ring-2 ring-white/10"
                    />
                  </div>
                  
                  {/* 댓글 말풍선 */}
                  <div className="flex-1 min-w-0 max-w-[calc(100%-60px)]">
                    {/* 작성자 이름 */}
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-white/90 font-medium text-sm lg:text-base">
                        {comment.author}
                      </span>
                      <span className="text-gray-500 text-xs lg:text-sm">
                        {formatDate(comment.createdAt, 'short')}
                      </span>
                    </div>
                    
                    {/* 말풍선 */}
                    <div className="relative inline-block max-w-full">
                      <div className="bg-[#2a2a2a] rounded-[20px] rounded-tl-[6px] px-4 py-2.5 lg:px-5 lg:py-3 shadow-lg">
                        {parseCommentContent(comment.content).map((part, idx) => (
                          <div key={idx}>
                            {part.type === 'text' ? (
                              <p className="text-white/95 text-[15px] lg:text-base whitespace-pre-wrap break-words leading-[1.5]">
                                {part.content}
                              </p>
                            ) : (
                              <div className="mt-2 first:mt-0 mb-2 last:mb-0 rounded-xl overflow-hidden max-w-[200px]">
                                <Image
                                  src={part.content}
                                  alt="댓글 이미지"
                                  width={200}
                                  height={150}
                                  className="w-full h-auto object-cover"
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 더 많은 채팅 보기 버튼 */}
            <div className="flex justify-center py-6">
              <button
                onClick={handleOpenSidePanel}
                className="px-12 py-3.5 bg-white hover:bg-gray-100 active:bg-gray-200 text-black rounded-full font-semibold transition-all text-sm lg:text-base shadow-lg hover:shadow-xl"
              >
                {hasMoreComments ? '더 많은 채팅 보기' : '채팅 보기'}
              </button>
            </div>
        </>
      ) : (
        /* 댓글이 없는 경우 */
        <div className="flex justify-center py-6">
          <button
            onClick={handleOpenSidePanel}
            className="px-12 py-3.5 bg-white hover:bg-gray-100 active:bg-gray-200 text-black rounded-full font-semibold transition-all text-sm lg:text-base shadow-lg hover:shadow-xl"
          >
            더 많은 채팅 보기
          </button>
        </div>
      )}
      </div>

      {/* 사이드 패널 */}
      <CommentSidePanel 
        postId={postId} 
        isOpen={isSidePanelOpen} 
        onClose={() => setIsSidePanelOpen(false)} 
      />
    </>
  );
};

