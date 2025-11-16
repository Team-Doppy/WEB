// Server Component용 데이터 fetching 유틸리티
// 개발 환경에서는 Mock 데이터, 프로덕션에서는 실제 API 사용

import { Post } from '@/app/types/post.types';
import { getPost, getUserPosts } from './api';
import { MOCK_DATA } from './mockData';

/**
 * 특정 사용자의 게시글 가져오기
 * @param username 사용자명
 * @param postId 게시글 ID
 * @returns Post 객체 또는 null
 */
export async function fetchPostData(username: string, postId: string): Promise<Post | null> {
  if (process.env.NODE_ENV === 'development') {
    return MOCK_DATA[username]?.[postId] || null;
  }
  return await getPost(username, postId);
}

/**
 * 사용자의 게시글 목록 가져오기
 * @param username 사용자명
 * @returns Post 배열
 */
export async function fetchUserPosts(username: string): Promise<Post[]> {
  if (process.env.NODE_ENV === 'development') {
    const userPosts = MOCK_DATA[username];
    if (!userPosts) return [];
    return Object.values(userPosts);
  }
  return await getUserPosts(username);
}

