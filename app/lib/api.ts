// API 호출 유틸리티

import { Post } from '@/app/types/post.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

/**
 * 특정 사용자의 게시글 가져오기
 */
export async function getPost(username: string, postId: string): Promise<Post | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}/posts/${postId}`, {
      cache: 'no-store', // 항상 최신 데이터
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

/**
 * 사용자의 게시글 목록 가져오기
 */
export async function getUserPosts(username: string): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${username}/posts`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

