// Server Component용 데이터 fetching 유틸리티
// 환경 변수에 따라 Mock 데이터 또는 실제 API 사용

import { Post } from '@/app/types/post.types';
import { getPost, getUserPosts, getAllPosts, getProfile, getRecommendationPosts, shouldUseMockData } from './api';
import { MOCK_DATA } from './mockData';

/**
 * 특정 게시글 가져오기
 * @param postId 게시글 ID
 * @returns Post 객체 또는 null
 */
export async function fetchPostData(postId: string | number): Promise<Post | null> {
  if (shouldUseMockData()) {
    // Mock 데이터에서 찾기 (모든 사용자 검색)
    for (const [username, posts] of Object.entries(MOCK_DATA)) {
      const post = posts[String(postId)];
      if (post) return post;
    }
    return null;
  }
  
  const post = await getPost(postId);
  if (!post) {
    // API에서 찾지 못한 경우 Mock 데이터에서도 확인 (fallback)
    for (const [username, posts] of Object.entries(MOCK_DATA)) {
      const post = posts[String(postId)];
      if (post) return post;
    }
  }
  return post;
}

/**
 * 사용자의 게시글 목록 가져오기
 * @param username 사용자명
 * @returns Post 배열
 */
export async function fetchUserPosts(username: string): Promise<Post[]> {
  if (shouldUseMockData()) {
    const userPosts = MOCK_DATA[username];
    if (!userPosts) return [];
    return Object.values(userPosts);
  }
  
  const posts = await getUserPosts(username);
  // API에서 데이터가 없으면 Mock 데이터 사용 (fallback)
  if (posts.length === 0 && MOCK_DATA[username]) {
    return Object.values(MOCK_DATA[username]);
  }
  return posts;
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

