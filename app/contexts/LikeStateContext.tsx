'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface LikeState {
  isLiked: boolean;
  likeCount: number;
  isPending: boolean; // 서버 요청 중인지
}

interface LikeStateContextType {
  // 게시글의 좋아요 상태 가져오기
  getLikeState: (postId: string | number) => LikeState | null;
  // 초기 상태 설정 (서버에서 받은 값으로 초기화)
  initializeLikeState: (postId: string | number, isLiked: boolean, likeCount: number) => void;
  // 좋아요 토글 (낙관적 업데이트)
  toggleLike: (postId: string | number, currentIsLiked: boolean) => void;
  // 서버 상태로 동기화 (서버 응답이 왔을 때)
  syncWithServer: (postId: string | number, serverIsLiked: boolean, serverLikeCount: number) => void;
}

const LikeStateContext = createContext<LikeStateContextType | undefined>(undefined);

export const LikeStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 게시글 ID별로 상태 관리
  const [likeStates, setLikeStates] = useState<Record<string, LikeState>>({});

  // 게시글 ID를 문자열로 변환하는 헬퍼
  const getPostIdKey = useCallback((postId: string | number) => String(postId), []);

  // 초기 상태 설정
  const initializeLikeState = useCallback((postId: string | number, isLiked: boolean, likeCount: number) => {
    const key = getPostIdKey(postId);
    setLikeStates((prev) => {
      // 이미 존재하면 업데이트하지 않음 (이미 토글된 상태일 수 있음)
      if (prev[key]) {
        return prev;
      }
      return {
        ...prev,
        [key]: {
          isLiked,
          likeCount,
          isPending: false,
        },
      };
    });
  }, [getPostIdKey]);

  // 게시글의 좋아요 상태 가져오기
  const getLikeState = useCallback((postId: string | number): LikeState | null => {
    const key = getPostIdKey(postId);
    return likeStates[key] || null;
  }, [likeStates, getPostIdKey]);

  // 좋아요 토글 (낙관적 업데이트)
  const toggleLike = useCallback((postId: string | number, currentIsLiked: boolean) => {
    const key = getPostIdKey(postId);
    setLikeStates((prev) => {
      const current = prev[key];
      if (!current) {
        // 상태가 없으면 초기화 필요 (이론적으로는 발생하지 않아야 함)
        return prev;
      }

      // 낙관적 업데이트: 즉시 로컬 상태 변경
      const newIsLiked = !current.isLiked;
      const newLikeCount = newIsLiked ? current.likeCount + 1 : current.likeCount - 1;

      return {
        ...prev,
        [key]: {
          isLiked: newIsLiked,
          likeCount: Math.max(0, newLikeCount), // 음수 방지
          isPending: true, // 서버 요청 중 표시
        },
      };
    });
  }, [getPostIdKey]);

  // 서버 상태로 동기화
  const syncWithServer = useCallback((
    postId: string | number,
    serverIsLiked: boolean,
    serverLikeCount: number
  ) => {
    const key = getPostIdKey(postId);
    setLikeStates((prev) => {
      const current = prev[key];
      if (!current) {
        // 상태가 없으면 서버 상태로 초기화
        return {
          ...prev,
          [key]: {
            isLiked: serverIsLiked,
            likeCount: serverLikeCount,
            isPending: false,
          },
        };
      }

      // 로컬 상태와 서버 상태 비교
      // 서버 상태와 다르면 서버 상태로 동기화
      if (current.isLiked !== serverIsLiked || current.likeCount !== serverLikeCount) {
        return {
          ...prev,
          [key]: {
            isLiked: serverIsLiked,
            likeCount: serverLikeCount,
            isPending: false,
          },
        };
      }

      // 상태가 같으면 isPending만 false로 변경
      return {
        ...prev,
        [key]: {
          ...current,
          isPending: false,
        },
      };
    });
  }, [getPostIdKey]);

  const value: LikeStateContextType = {
    getLikeState,
    initializeLikeState,
    toggleLike,
    syncWithServer,
  };

  return (
    <LikeStateContext.Provider value={value}>
      {children}
    </LikeStateContext.Provider>
  );
};

export const useLikeState = () => {
  const context = useContext(LikeStateContext);
  if (context === undefined) {
    throw new Error('useLikeState must be used within a LikeStateProvider');
  }
  return context;
};

