// 클라이언트 전용 API 함수
// 클라이언트 컴포넌트에서만 사용

'use client';

import { getAccessToken } from './authApi';
import { Post } from '@/app/types/post.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * 클라이언트 사이드 API 요청
 */
async function clientApiRequest<T>(endpoint: string, options?: RequestInit, requireAuth: boolean = false): Promise<T | null> {
  if (!API_BASE_URL) {
    console.warn('API_BASE_URL이 설정되지 않았습니다.');
    return null;
  }

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (requireAuth) {
      const token = getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // 쿠키 포함
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 인증 오류는 상위에서 처리
        return null;
      }
      // 에러 응답 본문 읽기 시도
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(`API 요청 실패: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API 요청 오류 (${endpoint}):`, error.message);
    } else {
      console.error(`API 요청 오류 (${endpoint}):`, error);
    }
    return null;
  }
}

/**
 * 게시글 좋아요 상태 확인
 */
export async function getLikeStatus(postId: string | number): Promise<{ isLiked: boolean } | null> {
  return clientApiRequest<{ isLiked: boolean }>(
    `/web/api/posts/${postId}/like/status`,
    undefined,
    true
  );
}

/**
 * 게시글 좋아요 수 조회
 */
export async function getLikeCount(postId: string | number): Promise<{ likeCount: number } | null> {
  return clientApiRequest<{ likeCount: number }>(
    `/web/api/posts/${postId}/like/count`,
    undefined,
    false
  );
}

/**
 * 게시글 좋아요 토글
 */
export async function toggleLike(postId: string | number, isLiked: boolean): Promise<{ isLiked: boolean; likeCount: number } | null> {
  try {
    const method = isLiked ? 'DELETE' : 'POST';
    const response = await clientApiRequest<{ success: boolean; message: string }>(
      `/web/api/posts/${postId}/like`,
      { method },
      true
    );

    if (!response || !response.success) {
      return null;
    }

    const [statusResult, countResult] = await Promise.all([
      getLikeStatus(postId),
      getLikeCount(postId),
    ]);

    if (statusResult && countResult) {
      return {
        isLiked: statusResult.isLiked,
        likeCount: countResult.likeCount,
      };
    }

    return null;
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    return null;
  }
}

/**
 * 친구 상태 확인
 */
export async function getFriendStatus(username: string): Promise<{
  status: 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'BLOCKED' | 'SELF';
  isBlocked: boolean;
  isBlockedBy: boolean;
  isSentByMe: boolean;
} | null> {
  return clientApiRequest<{
    status: 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'BLOCKED' | 'SELF';
    isBlocked: boolean;
    isBlockedBy: boolean;
    isSentByMe: boolean;
  }>(
    `/web/api/friends/status/${username}`,
    undefined,
    true
  );
}

/**
 * 친구 신청
 */
export async function requestFriend(username: string): Promise<{ success: boolean; message: string } | null> {
  return clientApiRequest<{ success: boolean; message: string }>(
    `/web/api/friends/request`,
    {
      method: 'POST',
      body: JSON.stringify({ targetUsername: username }),
    },
    true
  );
}

/**
 * 친구 요청 취소
 */
export async function cancelFriendRequest(username: string): Promise<{ success: boolean; message: string } | null> {
  return clientApiRequest<{ success: boolean; message: string }>(
    `/web/api/friends/cancel-request/${username}`,
    { method: 'DELETE' },
    true
  );
}

/**
 * 친구 삭제
 */
export async function deleteFriend(username: string): Promise<{ success: boolean; message: string } | null> {
  return clientApiRequest<{ success: boolean; message: string }>(
    `/web/api/friends/delete/${username}`,
    { method: 'DELETE' },
    true
  );
}

/**
 * 사용자 검색
 */
export interface UserSearchResult {
  id: number;
  username: string;
  alias: string;
  profileImageUrl: string | null;
  isFollowing: boolean;
  friendStatus: 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'BLOCKED';
}

export async function searchUsers(username: string): Promise<UserSearchResult[]> {
  const response = await clientApiRequest<{
    success: boolean;
    data: UserSearchResult[];
  }>(
    `/web/api/friends/search?username=${encodeURIComponent(username)}`,
    undefined,
    true
  );

  if (!response) return [];
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as any).data || [];
  }
  
  // 직접 배열인 경우
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}

/**
 * 친구 요청 수락
 */
export async function acceptFriendRequest(username: string): Promise<{ success: boolean; message: string } | null> {
  return clientApiRequest<{ success: boolean; message: string }>(
    `/web/api/friends/accept/${username}`,
    { method: 'POST' },
    true
  );
}

/**
 * 친구 요청 거절
 */
export async function rejectFriendRequest(username: string): Promise<{ success: boolean; message: string } | null> {
  return clientApiRequest<{ success: boolean; message: string }>(
    `/web/api/friends/reject/${username}`,
    { method: 'POST' },
    true
  );
}

/**
 * 사용자 차단
 */
export async function blockUser(username: string): Promise<{ success: boolean; message: string } | null> {
  return clientApiRequest<{ success: boolean; message: string }>(
    `/web/api/friends/block/${username}`,
    { method: 'POST' },
    true
  );
}

/**
 * 사용자 차단 해제
 */
export async function unblockUser(username: string): Promise<{ success: boolean; message: string } | null> {
  return clientApiRequest<{ success: boolean; message: string }>(
    `/web/api/friends/block/${username}`,
    { method: 'DELETE' },
    true
  );
}

/**
 * 친구 목록 조회 (수락된 친구들)
 */
export async function getFriends(page: number = 0, size: number = 20): Promise<PaginatedResponse<UserSearchResult> | null> {
  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<UserSearchResult>;
  } | PaginatedResponse<UserSearchResult>>(
    `/web/api/friends/accepted?page=${page}&size=${size}`,
    undefined,
    true
  );

  if (!response) return null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as any).data;
  }
  
  // 직접 PaginatedResponse인 경우
  return response as PaginatedResponse<UserSearchResult>;
}

/**
 * 보낸 친구 요청 목록
 */
export async function getSentRequests(page: number = 0, size: number = 20): Promise<PaginatedResponse<UserSearchResult> | null> {
  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<UserSearchResult>;
  } | PaginatedResponse<UserSearchResult>>(
    `/web/api/friends/sent-requests?page=${page}&size=${size}`,
    undefined,
    true
  );

  if (!response) return null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as any).data;
  }
  
  // 직접 PaginatedResponse인 경우
  return response as PaginatedResponse<UserSearchResult>;
}

/**
 * 받은 친구 요청 목록
 */
export async function getReceivedRequests(page: number = 0, size: number = 20): Promise<PaginatedResponse<UserSearchResult> | null> {
  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<UserSearchResult>;
  } | PaginatedResponse<UserSearchResult>>(
    `/web/api/friends/received-requests?page=${page}&size=${size}`,
    undefined,
    true
  );

  if (!response) return null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as any).data;
  }
  
  // 직접 PaginatedResponse인 경우
  return response as PaginatedResponse<UserSearchResult>;
}

/**
 * 차단된 사용자 목록
 */
export async function getBlockedUsers(page: number = 0, size: number = 20): Promise<PaginatedResponse<UserSearchResult> | null> {
  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<UserSearchResult>;
  } | PaginatedResponse<UserSearchResult>>(
    `/web/api/friends/blocked?page=${page}&size=${size}`,
    undefined,
    true
  );

  if (!response) return null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as any).data;
  }
  
  // 직접 PaginatedResponse인 경우
  return response as PaginatedResponse<UserSearchResult>;
}

/**
 * 사용자 팔로우/언팔로우 토글
 */
export async function toggleFollow(username: string, currentStatus?: {
  status: 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'BLOCKED' | 'SELF';
  isSentByMe?: boolean;
}): Promise<{ status: 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'BLOCKED' | 'SELF'; isSentByMe: boolean } | null> {
  try {
    let status = currentStatus;
    if (!status) {
      const statusResult = await getFriendStatus(username);
      if (!statusResult) return null;
      status = statusResult;
    }

    if (status.status === 'NONE') {
      const result = await requestFriend(username);
      if (result && result.success) {
        return { status: 'REQUESTED', isSentByMe: true };
      }
    } else if (status.status === 'REQUESTED' && status.isSentByMe) {
      const result = await cancelFriendRequest(username);
      if (result && result.success) {
        return { status: 'NONE', isSentByMe: false };
      }
    } else if (status.status === 'ACCEPTED') {
      const result = await deleteFriend(username);
      if (result && result.success) {
        return { status: 'NONE', isSentByMe: false };
      }
    }

    return null;
  } catch (error) {
    console.error('팔로우 토글 실패:', error);
    return null;
  }
}

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
 * 시맨틱 검색
 * @param query 검색어
 * @param page 페이지 번호
 * @param size 페이지 크기
 * @returns Post 배열 및 페이지네이션 정보
 */
export async function semanticSearch(
  query: string,
  page: number = 0,
  size: number = 20
): Promise<{ posts: Post[]; pagination: PaginatedResponse<Post> | null }> {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    size: size.toString(),
  });

  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<any>;
  } | PaginatedResponse<any>>(
    `/web/api/search/semantic?${params.toString()}`,
    undefined,
    true // 토큰이 있으면 포함
  );

  if (!response) {
    return { posts: [], pagination: null };
  }
  
  let paginated: PaginatedResponse<any> | null = null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data && data.content && Array.isArray(data.content)) {
      paginated = data;
    } else if (Array.isArray(data)) {
      paginated = {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        size: data.length,
        number: 0,
        first: true,
        last: true,
      };
    }
  } else if (response && typeof response === 'object' && 'content' in response) {
    // 직접 PaginatedResponse인 경우
    paginated = response as PaginatedResponse<any>;
  }
  
  if (!paginated || !Array.isArray(paginated.content)) {
    return { posts: [], pagination: null };
  }
  
  const posts = paginated.content.map((post: any) => transformApiPostToPost(post));
  
  return {
    posts,
    pagination: {
      content: posts,
      totalElements: paginated.totalElements,
      totalPages: paginated.totalPages,
      size: paginated.size,
      number: paginated.number,
      first: paginated.first,
      last: paginated.last,
    },
  };
}

/**
 * 제목으로 포스트 검색
 * @param keyword 검색 키워드
 * @param page 페이지 번호
 * @param size 페이지 크기
 * @returns Post 배열 및 페이지네이션 정보
 */
export async function searchPostsByTitle(
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<{ posts: Post[]; pagination: PaginatedResponse<Post> | null }> {
  const params = new URLSearchParams({
    keyword,
    page: page.toString(),
    size: size.toString(),
  });

  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<any>;
  } | PaginatedResponse<any>>(
    `/web/api/posts/search?${params.toString()}`,
    undefined,
    false
  );

  if (!response) {
    return { posts: [], pagination: null };
  }
  
  let paginated: PaginatedResponse<any> | null = null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data && data.content && Array.isArray(data.content)) {
      paginated = data;
    } else if (Array.isArray(data)) {
      paginated = {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        size: data.length,
        number: 0,
        first: true,
        last: true,
      };
    }
  } else if (response && typeof response === 'object' && 'content' in response) {
    // 직접 PaginatedResponse인 경우
    paginated = response as PaginatedResponse<any>;
  }
  
  if (!paginated || !Array.isArray(paginated.content)) {
    return { posts: [], pagination: null };
  }
  
  const posts = paginated.content.map((post: any) => transformApiPostToPost(post));
  
  return {
    posts,
    pagination: {
      content: posts,
      totalElements: paginated.totalElements,
      totalPages: paginated.totalPages,
      size: paginated.size,
      number: paginated.number,
      first: paginated.first,
      last: paginated.last,
    },
  };
}

/**
 * 실시간 검색어 조회
 * @param limit 조회할 검색어 개수
 * @returns 실시간 검색어 및 추천 포스트
 */
export interface TrendingKeyword {
  keyword: string;
  count: number;
}

export interface TrendingData {
  keywords: TrendingKeyword[];
  recommendedPosts: any[];
}

export async function getTrendingKeywords(
  limit: number = 5
): Promise<TrendingData | null> {
  const response = await clientApiRequest<{
    success: boolean;
    data: TrendingData;
  }>(
    `/web/api/search/trending?limit=${limit}`,
    undefined,
    true // 토큰이 있으면 포함
  );

  if (!response) return null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as any).data;
  }
  
  // 직접 TrendingData인 경우
  return response as TrendingData;
}

/**
 * 프로필 피드 포스트 조회 (클라이언트용)
 * @param username 사용자명
 * @param page 페이지 번호
 * @param size 페이지 크기
 * @returns 포스트 목록 및 페이지네이션 정보
 */
export async function getProfileFeedPosts(
  username: string,
  page: number = 0,
  size: number = 20
): Promise<{ posts: Post[]; pagination: PaginatedResponse<Post> | null }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await clientApiRequest<{
    success: boolean;
    data: {
      posts: any[];
      currentPage: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }>(
    `/web/api/profile/${username}/feed/posts?${params.toString()}`,
    undefined,
    true // 인증 필요
  );

  if (!response) {
    return { posts: [], pagination: null };
  }

  let posts: Post[] = [];
  let pagination: PaginatedResponse<Post> | null = null;

  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data && data.posts && Array.isArray(data.posts)) {
      posts = data.posts.map((post: any) => transformApiPostToPost(post));
      pagination = {
        content: posts,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        size: size,
        number: data.currentPage || page,
        first: page === 0,
        last: !data.hasNext,
      };
    }
  }

  return { posts, pagination };
}

/**
 * 홈 피드 포스트 조회 (추천 포스트)
 * @param page 페이지 번호
 * @param size 페이지 크기
 * @param region 리전 (선택적)
 * @returns 포스트 목록 및 페이지네이션 정보
 */
export async function getHomeFeedPosts(
  page: number = 0,
  size: number = 20,
  region: string = 'KR'
): Promise<{ posts: Post[]; pagination: PaginatedResponse<Post> | null }> {
  const regionParam = region ? `&region=${region}` : '';
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<any>;
  } | PaginatedResponse<any>>(
    `/web/api/posts/recommendation?${params.toString()}${regionParam}`,
    undefined,
    true // 토큰이 있으면 포함
  );

  if (!response) {
    return { posts: [], pagination: null };
  }

  let paginated: PaginatedResponse<any> | null = null;

  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data && data.content && Array.isArray(data.content)) {
      paginated = data;
    } else if (Array.isArray(data)) {
      paginated = {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        size: data.length,
        number: 0,
        first: true,
        last: true,
      };
    }
  } else if (response && typeof response === 'object' && 'content' in response) {
    paginated = response as PaginatedResponse<any>;
  }

  if (!paginated || !Array.isArray(paginated.content)) {
    return { posts: [], pagination: null };
  }

  const posts = paginated.content.map((post: any) => transformApiPostToPost(post));

  return {
    posts: posts.map(post => ({ ...post, username: post.author })),
    pagination: {
      content: posts,
      totalElements: paginated.totalElements,
      totalPages: paginated.totalPages,
      size: paginated.size,
      number: paginated.number,
      first: paginated.first,
      last: paginated.last,
    },
  };
}

/**
 * 좋아요한 포스트 조회
 * @param page 페이지 번호
 * @param size 페이지 크기
 * @returns 좋아요한 포스트 목록 및 페이지네이션 정보
 */
export async function getLikedPosts(
  page: number = 0,
  size: number = 20
): Promise<{ posts: Post[]; pagination: PaginatedResponse<Post> | null }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await clientApiRequest<{
    success: boolean;
    data: PaginatedResponse<any>;
  } | PaginatedResponse<any>>(
    `/web/api/posts/my/liked?${params.toString()}`,
    undefined,
    true // 인증 필수
  );

  if (!response) {
    return { posts: [], pagination: null };
  }
  
  let paginated: PaginatedResponse<any> | null = null;
  
  // ApiResponse 형식인 경우
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as any).data;
    if (data && data.content && Array.isArray(data.content)) {
      paginated = data;
    } else if (Array.isArray(data)) {
      // 배열인 경우 PaginatedResponse로 변환
      paginated = {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        size: data.length,
        number: 0,
        first: true,
        last: true,
      };
    }
  } else if (response && typeof response === 'object' && 'content' in response) {
    // 직접 PaginatedResponse인 경우
    paginated = response as PaginatedResponse<any>;
  }
  
  if (!paginated || !Array.isArray(paginated.content)) {
    return { posts: [], pagination: null };
  }
  
  const posts = paginated.content.map((post: any) => transformApiPostToPost(post));
  
  return {
    posts,
    pagination: {
      content: posts,
      totalElements: paginated.totalElements,
      totalPages: paginated.totalPages,
      size: paginated.size,
      number: paginated.number,
      first: paginated.first,
      last: paginated.last,
    },
  };
}

/**
 * 프로필 정보 수정
 */
export interface UpdateProfileRequest {
  alias?: string;
  selfIntroduction?: string;
  links?: string[];
  linkTitles?: Record<string, string>;
}

export async function updateProfileInfo(data: UpdateProfileRequest): Promise<{ success: boolean; message?: string } | null> {
  return clientApiRequest<{ success: boolean; message?: string }>(
    '/web/api/profile/info',
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    true
  );
}

/**
 * 프로필 이미지 업로드
 */
export async function uploadProfileImage(file: File): Promise<{ success: boolean; imageUrl?: string; message?: string } | null> {
  if (!API_BASE_URL) {
    console.warn('API_BASE_URL이 설정되지 않았습니다.');
    return null;
  }

  try {
    const token = getAccessToken();
    if (!token) {
      console.warn('인증 토큰이 없습니다.');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/web/api/profile/image/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `이미지 업로드 실패: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('프로필 이미지 업로드 오류:', error.message);
    } else {
      console.error('프로필 이미지 업로드 오류:', error);
    }
    return null;
  }
}

/**
 * 프로필 이미지 삭제
 */
export async function deleteProfileImage(): Promise<{ success: boolean; message?: string } | null> {
  return clientApiRequest<{ success: boolean; message?: string }>(
    '/web/api/profile/image',
    {
      method: 'DELETE',
    },
    true
  );
}

