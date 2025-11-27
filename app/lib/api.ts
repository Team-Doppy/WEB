// API 호출 유틸리티

import { Post } from '@/app/types/post.types';
import { getAccessToken, refreshToken } from './authApi';

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
export interface ApiError {
  error: string;
  isPrivate?: boolean;
  username?: string; // 비공개 글인 경우 작성자 username
}

async function apiRequest<T>(endpoint: string, options?: RequestInit, requireAuth: boolean = false): Promise<T | null> {
  if (!API_BASE_URL) {
    console.warn('API_BASE_URL이 설정되지 않았습니다. Mock 데이터를 사용합니다.');
    return null;
  }

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // 인증이 필요한 경우 토큰 추가
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (requireAuth) {
      let token: string | null = null;
      
      // 클라이언트 사이드
      if (typeof window !== 'undefined') {
        token = getAccessToken();
      } else {
        // 서버 사이드 - 동적 import로 서버 전용 코드 분리
        try {
          const { getServerAccessToken } = await import('@/app/utils/serverCookies');
          token = await getServerAccessToken();
        } catch (error) {
          // 서버 쿠키를 읽을 수 없는 경우
          token = null;
        }
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    let response = await fetch(url, {
      ...options,
      headers,
      // Next.js 서버 컴포넌트에서는 cache 옵션 사용
      ...(typeof window === 'undefined' && { cache: 'no-store' }),
    });

    // 401 에러 시 토큰 갱신 후 재시도 (클라이언트 사이드만)
    if (response.status === 401 && requireAuth && typeof window !== 'undefined') {
      try {
        await refreshToken();
        const newToken = getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 쿠키 삭제 및 홈으로 리다이렉트
        const { clearAuthCookies } = await import('@/app/utils/cookies');
        clearAuthCookies();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
    
    // 서버 사이드에서 401 에러는 그대로 진행 (권한 없음으로 처리)

    if (!response.ok) {
      // 403 Forbidden: 권한 없음 (비공개 글 등)
      if (response.status === 403) {
        try {
          const errorData = await response.json();
          const errorMessage = errorData?.error || '이 글을 볼 권한이 없습니다.';
          throw { 
            isPrivate: true, 
            error: errorMessage,
            username: errorData?.username || undefined
          } as ApiError;
        } catch (e) {
          // 이미 ApiError로 throw된 경우 다시 throw
          if (e && typeof e === 'object' && 'isPrivate' in e) {
            throw e;
          }
          // JSON 파싱 실패 시 기본 에러 반환
          throw { 
            isPrivate: true, 
            error: '이 글을 볼 권한이 없습니다.',
            username: undefined
          } as ApiError;
        }
      }
      
      // 404 Not Found: 게시글 없음 또는 비공개 글 (하위 호환성)
      if (response.status === 404) {
        // 404 응답의 body를 읽어서 비공개 글인지 확인
        try {
          const errorData = await response.json();
          const errorMessage = errorData?.error || '';
          
          if (typeof errorMessage === 'string') {
            // 비공개 글 관련 에러 메시지 확인
            if (errorMessage.includes('공개되어 있지 않습니다') || 
                errorMessage.includes('공개되어 있지 않') ||
                errorMessage.includes('비공개') ||
                errorMessage.includes('허가받은') ||
                errorData?.isPrivate === true) {
              // 비공개 글임을 나타내는 특별한 값 반환
              throw { 
                isPrivate: true, 
                error: errorMessage,
                username: errorData?.username || undefined
              } as ApiError;
            }
          }
        } catch (e) {
          // 이미 ApiError로 throw된 경우 다시 throw
          if (e && typeof e === 'object' && 'isPrivate' in e) {
            throw e;
          }
          // JSON 파싱 실패 시 일반 404로 처리 (게시글 없음)
        }
        return null;
      }
      
      // 400 Bad Request: 차단된 사용자, 잘못된 요청 등
      if (response.status === 400) {
        // 프로필 관련 요청인 경우 조용히 null 반환 (차단된 사용자 등)
        if (endpoint.includes('/profile/') && endpoint.includes('/feed/schema')) {
          return null;
        }
        // 다른 400 에러는 일반 에러로 처리
        let errorMessage = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        throw new Error(`API 요청 실패: ${errorMessage}`);
      }
      
      // 401 Unauthorized: 인증 필요
      if (response.status === 401) {
        console.warn(`인증 오류 (${endpoint}): 401`);
        return null;
      }
      
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // ApiError인 경우 다시 throw (비공개 글)
    if (error && typeof error === 'object' && 'isPrivate' in error) {
      throw error;
    }
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
    commentCount: apiPost.commentCount ?? 0,
    isLiked: apiPost.isLiked === null || apiPost.isLiked === undefined ? false : Boolean(apiPost.isLiked),
    createdAt: apiPost.createdAt || '',
    updatedAt: apiPost.updatedAt || apiPost.createdAt || '',
  };
}

/**
 * 특정 게시글 가져오기 (공개 포스트 상세 조회)
 * 로그인한 사용자의 경우 인증 토큰을 포함하여 권한 체크
 * @param postId 게시글 ID
 * @returns Post 객체, null (존재하지 않음), 또는 ApiError (비공개 글)
 */
export async function getPost(postId: string | number): Promise<Post | null | ApiError> {
  try {
    // 로그인 여부와 관계없이 토큰이 있으면 포함 (서버에서 권한 체크)
    // requireAuth를 true로 설정하여 토큰이 있으면 자동으로 포함
    const apiPost = await apiRequest<any>(`/web/api/posts/${postId}`, undefined, true);
  if (!apiPost) return null;
  return transformApiPostToPost(apiPost);
  } catch (error) {
    // 비공개 글인 경우 ApiError를 그대로 반환
    if (error && typeof error === 'object' && 'isPrivate' in error) {
      const apiError = error as ApiError;
      // API 응답에서 username이 없으면, postId로부터 추출 시도
      // (실제로는 API가 username을 반환해야 함)
      if (!apiError.username) {
        // API 응답을 다시 확인하거나, 다른 방법으로 username 추출
        // 일단은 error 객체에 그대로 반환
      }
      return apiError;
    }
    return null;
  }
}

/**
 * 공개 프로필 피드 포스트 가져오기 (로그인하지 않은 경우)
 * @param username 사용자명
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @returns Post 배열과 페이지네이션 메타데이터
 */
export async function getPublicProfileFeedPosts(
  username: string, 
  page: number = 0, 
  size: number = 20
): Promise<{
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}> {
  const url = `/web/api/profile/${username}/feed/posts?page=${page}&size=${size}`;
  console.log('[getPublicProfileFeedPosts] API 요청:', { username, page, size, url });
  
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
  }>(url, undefined, false); // 인증 불필요 (서버가 자동으로 공개 포스트만 반환)
  
  console.log('[getPublicProfileFeedPosts] API 응답:', { 
    hasResponse: !!response, 
    success: response?.success, 
    hasData: !!response?.data,
    postsCount: response?.data?.posts?.length || 0,
    currentPage: response?.data?.currentPage,
    totalPages: response?.data?.totalPages,
    totalElements: response?.data?.totalElements,
    hasNext: response?.data?.hasNext,
    postIds: response?.data?.posts?.map((p: any) => p.id) || []
  });
  
  if (!response || !response.success || !response.data) {
    console.log('[getPublicProfileFeedPosts] 응답 없음 또는 실패');
    return {
      posts: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }
  
  // API 응답의 posts를 Post 타입으로 변환
  const transformedPosts = (response.data.posts || []).map(post => {
    return transformApiPostToPost({
      ...post,
      author: post.author || username,
      authorProfileImageUrl: post.authorProfileImageUrl || '',
    });
  });
  
  console.log('[getPublicProfileFeedPosts] 변환된 포스트:', { 
    count: transformedPosts.length, 
    ids: transformedPosts.map(p => p.id) 
  });
  
  return {
    posts: transformedPosts,
    currentPage: response.data.currentPage,
    totalPages: response.data.totalPages,
    totalElements: response.data.totalElements,
    hasNext: response.data.hasNext,
    hasPrevious: response.data.hasPrevious,
  };
}

/**
 * 특정 사용자의 게시글 목록 가져오기 (프로필 피드 포스트 - 로그인한 경우)
 * @param username 사용자명
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @returns Post 배열과 페이지네이션 메타데이터
 */
export async function getUserPosts(
  username: string, 
  page: number = 0, 
  size: number = 20
): Promise<{
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}> {
  const url = `/web/api/profile/${username}/feed/posts?page=${page}&size=${size}`;
  console.log('[getUserPosts] API 요청:', { username, page, size, url });
  
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
  }>(url, undefined, true); // 인증 필요
  
  console.log('[getUserPosts] API 응답:', { 
    hasResponse: !!response, 
    success: response?.success, 
    hasData: !!response?.data,
    postsCount: response?.data?.posts?.length || 0,
    currentPage: response?.data?.currentPage,
    totalPages: response?.data?.totalPages,
    totalElements: response?.data?.totalElements,
    hasNext: response?.data?.hasNext,
    postIds: response?.data?.posts?.map((p: any) => p.id) || []
  });
  
  if (!response || !response.success || !response.data) {
    console.log('[getUserPosts] 응답 없음 또는 실패');
    return {
      posts: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }
  
  // API 응답의 posts를 Post 타입으로 변환
  const transformedPosts = (response.data.posts || []).map(post => {
    // 프로필 피드 응답에서 author는 문자열이고 authorAlias가 별도로 옴
    return transformApiPostToPost({
      ...post,
      author: post.author || username,
      authorProfileImageUrl: post.authorProfileImageUrl || '',
    });
  });
  
  console.log('[getUserPosts] 변환된 포스트:', { 
    count: transformedPosts.length, 
    ids: transformedPosts.map(p => p.id) 
  });
  
  return {
    posts: transformedPosts,
    currentPage: response.data.currentPage,
    totalPages: response.data.totalPages,
    totalElements: response.data.totalElements,
    hasNext: response.data.hasNext,
    hasPrevious: response.data.hasPrevious,
  };
}

/**
 * 공개 프로필 피드 스키마 조회 (로그인하지 않은 경우)
 * @param username 사용자명
 * @returns 피드 스키마 또는 null
 */
export async function getPublicProfileFeedSchema(username: string) {
  try {
    const response = await apiRequest<{
      success: boolean;
      data: {
        userInfo: {
          id: number;
          username: string;
          alias: string;
          profileImageUrl: string | null;
          isOwnProfile: boolean;
          totalPosts: number;
          followersCount: number;
          followingCount: number;
          isFollowing: boolean;
          canFollow: boolean;
          links: string[];
        };
        categories: Array<{
          id: number;
          name: string;
          displayOrder: number;
          postCount: number;
          isPrivate: boolean;
          isSystem: boolean;
          description: string | null;
        }>;
        postsByCategory: Record<string, Array<{
          id: number;
          order: number;
          globalIndex: number;
        }>>;
        systemCategoryMappings: Record<string, number[]>;
      };
      message: string | null;
    }>(`/web/api/profile/${username}/feed/schema`, undefined, false); // 인증 불필요 (서버에서 두 경로 모두 처리)
    
    if (!response || !response.success || !response.data) return null;
    
    return response.data;
  } catch (error) {
    // 차단된 사용자, 비공개 프로필 등 에러는 조용히 null 반환
    return null;
  }
}

/**
 * 프로필 피드 스키마 조회 (로그인한 경우)
 * @param username 사용자명
 * @returns 피드 스키마 또는 null
 */
export async function getProfileFeedSchema(username: string) {
  try {
    const response = await apiRequest<{
      success: boolean;
      data: {
        userInfo: {
          id: number;
          username: string;
          alias: string;
          profileImageUrl: string | null;
          isOwnProfile: boolean;
          totalPosts: number;
          followersCount: number;
          followingCount: number;
          isFollowing: boolean;
          canFollow: boolean;
          links: string[];
        };
        categories: Array<{
          id: number;
          name: string;
          displayOrder: number;
          postCount: number;
          isPrivate: boolean;
          isSystem: boolean;
          description: string | null;
        }>;
        postsByCategory: Record<string, Array<{
          id: number;
          order: number;
          globalIndex: number;
        }>>;
        systemCategoryMappings: Record<string, number[]>;
      };
      message: string | null;
    }>(`/web/api/profile/${username}/feed/schema`, undefined, true); // 인증 필요
    
    if (!response || !response.success || !response.data) return null;
    
    return response.data;
  } catch (error) {
    // 차단된 사용자, 비공개 프로필 등 에러는 조용히 null 반환
    return null;
  }
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
 * 로그인한 사용자의 경우 토큰을 포함하여 자신이 볼 수 있는 비공개 글도 포함
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
  // requireAuth: true로 설정하여 토큰이 있으면 자동으로 포함
  // 서버에서 권한 체크 후 공개 글 + 볼 수 있는 비공개 글 반환
  const response = await apiRequest<PaginatedResponse<any>>(
    `/web/api/posts/recommendation?page=${page}&size=${size}${regionParam}`,
    undefined,
    true  // 토큰이 있으면 포함
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



