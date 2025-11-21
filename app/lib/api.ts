// API 호출 유틸리티

import { Post } from '@/app/types/post.types';

// 환경 변수에서 API URL 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || (!API_BASE_URL && process.env.NODE_ENV === 'development');

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
}

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (!API_BASE_URL) {
    console.warn('API_BASE_URL이 설정되지 않았습니다. Mock 데이터를 사용합니다.');
    return null;
  }

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Next.js 서버 컴포넌트에서는 cache 옵션 사용
      ...(typeof window === 'undefined' && { cache: 'no-store' }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      // 401, 403 등의 인증 오류는 로그만 남기고 null 반환
      if (response.status === 401 || response.status === 403) {
        console.warn(`인증 오류 (${endpoint}): ${response.status}`);
        return null;
      }
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // 네트워크 오류나 파싱 오류 등
    if (error instanceof Error) {
      console.error(`API 요청 오류 (${endpoint}):`, error.message);
    } else {
      console.error(`API 요청 오류 (${endpoint}):`, error);
    }
    return null;
  }
}

/**
 * API 응답을 Post 타입으로 변환
 */
function transformApiPostToPost(apiPost: any): Post {
  // author가 객체인 경우 문자열로 변환
  const author = typeof apiPost.author === 'string' 
    ? apiPost.author 
    : apiPost.author?.username || '';
  
  const authorProfileImageUrl = typeof apiPost.author === 'object' && apiPost.author?.profileImageUrl
    ? apiPost.author.profileImageUrl
    : apiPost.authorProfileImageUrl || '';

  return {
    id: apiPost.id,
    title: apiPost.title || '',
    thumbnailImageUrl: apiPost.thumbnailImageUrl || '',
    content: apiPost.content || { nodes: [], stickers: [] },
    summary: apiPost.summary || null,
    author,
    authorProfileImageUrl,
    accessLevel: apiPost.accessLevel || 'PUBLIC',
    sharedGroupIds: apiPost.sharedGroupIds || null,
    viewCount: apiPost.viewCount || 0,
    likeCount: apiPost.likeCount || 0,
    isLiked: apiPost.isLiked || false,
    createdAt: apiPost.createdAt || '',
    updatedAt: apiPost.updatedAt || apiPost.createdAt || '',
  };
}

/**
 * 특정 게시글 가져오기 (공개 포스트 상세 조회)
 * @param postId 게시글 ID
 * @returns Post 객체 또는 null
 */
export async function getPost(postId: string | number): Promise<Post | null> {
  const apiPost = await apiRequest<any>(`/web/api/posts/${postId}`);
  if (!apiPost) return null;
  return transformApiPostToPost(apiPost);
}

/**
 * 특정 사용자의 게시글 목록 가져오기 (프로필 피드 포스트)
 * @param username 사용자명
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @returns Post 배열
 */
export async function getUserPosts(username: string, page: number = 0, size: number = 20): Promise<Post[]> {
  const response = await apiRequest<{
    success: boolean;
    data: {
      posts: any[];
      currentPage: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }>(`/web/api/profile/${username}/feed/posts?page=${page}&size=${size}`);
  
  if (!response || !response.success || !response.data) return [];
  
  // API 응답의 posts를 Post 타입으로 변환
  return (response.data.posts || []).map(post => {
    // 프로필 피드 응답에서 author는 문자열이고 authorAlias가 별도로 옴
    return transformApiPostToPost({
      ...post,
      author: post.author || username,
      authorProfileImageUrl: post.authorProfileImageUrl || '',
    });
  });
}

/**
 * 공개 프로필 정보 조회
 * @param username 사용자명
 * @returns 프로필 정보 또는 null
 */
export async function getProfile(username: string): Promise<{
  username: string;
  alias: string;
  profileImageUrl: string | null;
  selfIntroduction: string | null;
  links: string[];
  linkTitles: Record<string, string>;
  createdAt: string;
} | null> {
  return apiRequest(`/web/api/profile/${username}`);
}

/**
 * 공개 추천 포스트 조회
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @param region 리전 (KR, US 등, 선택적)
 * @returns Post 배열
 */
export async function getRecommendationPosts(
  page: number = 0,
  size: number = 20,
  region?: string
): Promise<Post[]> {
  const regionParam = region ? `&region=${region}` : '';
  const response = await apiRequest<PaginatedResponse<any>>(
    `/web/api/posts/recommendation?page=${page}&size=${size}${regionParam}`
  );

  if (!response) return [];
  if (Array.isArray(response)) {
    return response.map(post => transformApiPostToPost(post));
  }
  if (response.content && Array.isArray(response.content)) {
    return response.content.map(post => transformApiPostToPost(post));
  }
  return [];
}

/**
 * 모든 게시글 가져오기 (피드용 - 추천 포스트 사용)
 * @returns Post 배열 (최신순 정렬)
 */
export async function getAllPosts(): Promise<Array<Post & { username: string }>> {
  const posts = await getRecommendationPosts(0, 50, 'KR');
  
  // username 필드 추가 (author 필드에서)
  return posts.map(post => ({ ...post, username: post.author }));
}

/**
 * Mock 데이터 사용 여부 확인
 */
export function shouldUseMockData(): boolean {
  return USE_MOCK_DATA;
}

