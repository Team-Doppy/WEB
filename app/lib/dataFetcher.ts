// Server Component용 데이터 fetching 유틸리티
// 환경 변수에 따라 Mock 데이터 또는 실제 API 사용

import { Post } from '@/app/types/post.types';
import { getPost, getUserPosts, getPublicProfileFeedPosts, getAllPosts, getProfile, getRecommendationPosts, getProfileFeedSchema, getPublicProfileFeedSchema, shouldUseMockData } from './api';
import { MOCK_DATA } from './mockData';
import type { ProfileFeedSchemaResponse } from '@/app/types/feed.types';

import { ApiError } from './api';
import { getServerAccessToken } from '@/app/utils/serverCookies';

/**
 * 특정 게시글 가져오기
 * @param postId 게시글 ID
 * @returns Post 객체, null (존재하지 않음), 또는 ApiError (비공개 글)
 */
export async function fetchPostData(postId: string | number): Promise<Post | null | ApiError> {
  if (shouldUseMockData()) {
    // Mock 데이터에서 찾기 (모든 사용자 검색)
    for (const [username, posts] of Object.entries(MOCK_DATA)) {
      const post = posts[String(postId)];
      if (post) return post;
    }
    return null;
  }
  
  const result = await getPost(postId);
  
  // 비공개 글인 경우 그대로 반환
  if (result && typeof result === 'object' && 'isPrivate' in result) {
    return result as ApiError;
  }
  
  if (!result) {
    // API에서 찾지 못한 경우 Mock 데이터에서도 확인 (fallback)
    for (const [username, posts] of Object.entries(MOCK_DATA)) {
      const post = posts[String(postId)];
      if (post) return post;
    }
  }
  return result as Post | null;
}

/**
 * 사용자의 게시글 목록 가져오기
 * @param username 사용자명
 * @param schema 스키마 정보 (전체 포스트 수 확인용, 선택적)
 * @returns Post 배열
 */
export async function fetchUserPosts(username: string, schema?: { userInfo: { totalPosts: number } } | null): Promise<Post[]> {
  console.log('[fetchUserPosts] 시작:', { username, hasSchema: !!schema });
  
  if (shouldUseMockData()) {
    console.log('[fetchUserPosts] Mock 데이터 사용');
    const userPosts = MOCK_DATA[username];
    if (!userPosts) return [];
    return Object.values(userPosts);
  }
  
  // 로그인 상태 확인
  const accessToken = await getServerAccessToken();
  const isAuthenticated = !!accessToken;
  console.log('[fetchUserPosts] 인증 상태:', { isAuthenticated });
  
  const pageSize = 50; // 한 번에 가져올 포스트 수
  const allPosts: Post[] = [];
  let page = 0;
  let hasNext = true;
  let totalPagesFromApi: number | null = null;
  
  // 스키마 정보 로깅
  const totalPostsFromSchema = schema?.userInfo.totalPosts || 0;
  console.log('[fetchUserPosts] 스키마 정보:', { totalPostsFromSchema, schemaUserInfo: schema?.userInfo });
  
  // API 응답의 hasNext를 사용하여 모든 페이지 가져오기
  while (hasNext) {
    console.log(`[fetchUserPosts] 페이지 ${page} 조회 중... (인증: ${isAuthenticated})`);
    
    // 로그인 상태에 따라 다른 API 사용
    const result = isAuthenticated 
      ? await getUserPosts(username, page, pageSize)
      : await getPublicProfileFeedPosts(username, page, pageSize);
    
    console.log(`[fetchUserPosts] 페이지 ${page} 결과:`, { 
      postsCount: result.posts.length, 
      postIds: result.posts.map(p => p.id),
      hasNext: result.hasNext,
      totalPages: result.totalPages,
      totalElements: result.totalElements
    });
    
    // 첫 페이지에서 totalPages 정보 저장
    if (page === 0) {
      totalPagesFromApi = result.totalPages;
      console.log('[fetchUserPosts] API에서 받은 totalPages:', totalPagesFromApi);
    }
    
    if (result.posts.length === 0) {
      console.log(`[fetchUserPosts] 페이지 ${page}에 포스트 없음, 중단`);
      hasNext = false;
      break;
    }
    
    allPosts.push(...result.posts);
    
    // API 응답의 hasNext를 사용하여 다음 페이지 여부 확인
    hasNext = result.hasNext;
    
    // 스키마의 totalPosts와 비교하여 모든 포스트를 가져왔는지 확인
    if (totalPostsFromSchema > 0 && allPosts.length >= totalPostsFromSchema) {
      console.log(`[fetchUserPosts] 스키마의 totalPosts(${totalPostsFromSchema})에 도달, 중단`);
      hasNext = false;
      break;
    }
    
    // API의 totalElements와 비교
    if (result.totalElements > 0 && allPosts.length >= result.totalElements) {
      console.log(`[fetchUserPosts] API의 totalElements(${result.totalElements})에 도달, 중단`);
      hasNext = false;
      break;
    }
    
    page++;
    
    // 안전장치: 최대 100페이지까지만 가져오기
    if (page >= 100) {
      console.log('[fetchUserPosts] 최대 페이지 수(100) 도달, 중단');
      hasNext = false;
      break;
    }
  }
  
  console.log('[fetchUserPosts] 최종 결과:', { 
    totalPostsCount: allPosts.length, 
    expectedFromSchema: totalPostsFromSchema,
    postIds: allPosts.map(p => p.id) 
  });
  
  // API에서 데이터가 없으면 Mock 데이터 사용 (fallback)
  if (allPosts.length === 0 && MOCK_DATA[username]) {
    console.log('[fetchUserPosts] API 결과 없음, Mock 데이터 사용');
    return Object.values(MOCK_DATA[username]);
  }
  return allPosts;
}

/**
 * 프로필 피드 스키마 가져오기
 * @param username 사용자명
 * @returns 피드 스키마 또는 null
 */
export async function fetchProfileFeedSchema(username: string): Promise<ProfileFeedSchemaResponse | null> {
  if (shouldUseMockData()) {
    // Mock 데이터에서는 스키마를 생성하지 않음 (null 반환)
    return null;
  }
  
  try {
    // 로그인 상태 확인
    const accessToken = await getServerAccessToken();
    const isAuthenticated = !!accessToken;
    console.log('[fetchProfileFeedSchema] 인증 상태:', { isAuthenticated });
    
    // 로그인 상태에 따라 다른 API 사용
    return isAuthenticated 
      ? await getProfileFeedSchema(username)
      : await getPublicProfileFeedSchema(username);
  } catch (error) {
    // 차단된 사용자, 비공개 프로필 등 에러는 조용히 null 반환
    return null;
  }
}

/**
 * 공개 프로필 정보 가져오기
 * @param username 사용자명
 * @returns 프로필 정보 또는 null
 */
export async function fetchProfile(username: string): Promise<{
  username: string;
  alias: string;
  profileImageUrl: string | null;
  selfIntroduction: string | null;
  links: string[];
  linkTitles: Record<string, string>;
  createdAt: string;
} | null> {
  if (shouldUseMockData()) {
    // Mock 데이터에서 프로필 정보 생성
    const userPosts = MOCK_DATA[username];
    if (!userPosts || Object.keys(userPosts).length === 0) return null;
    
    const firstPost = Object.values(userPosts)[0];
    return {
      username,
      alias: username,
      profileImageUrl: firstPost.authorProfileImageUrl,
      selfIntroduction: null,
      links: [],
      linkTitles: {},
      createdAt: firstPost.createdAt,
    };
  }
  
  return await getProfile(username);
}

/**
 * 모든 사용자의 게시글을 가져와서 피드 형식으로 반환 (추천 포스트 사용)
 * @returns Post 배열 (최신순 정렬)
 */
export async function fetchAllPosts(): Promise<Array<Post & { username: string }>> {
  if (shouldUseMockData()) {
    const allPosts: Array<Post & { username: string }> = [];
    
    // 모든 사용자의 게시글을 수집
    Object.entries(MOCK_DATA).forEach(([username, posts]) => {
      Object.values(posts).forEach((post) => {
        allPosts.push({ ...post, username });
      });
    });
    
    // 최신순 정렬 (createdAt 기준)
    return allPosts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  // 실제 API 호출 - 추천 포스트 사용
  const posts = await getAllPosts();
  if (posts.length > 0) {
    return posts;
  }
  
  // API에서 데이터가 없으면 Mock 데이터 사용 (fallback)
  const allPosts: Array<Post & { username: string }> = [];
  Object.entries(MOCK_DATA).forEach(([username, userPosts]) => {
    Object.values(userPosts).forEach((post) => {
      allPosts.push({ ...post, username });
    });
  });
  return allPosts.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

