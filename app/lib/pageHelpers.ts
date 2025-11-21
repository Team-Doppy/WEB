// 페이지 컴포넌트용 헬퍼 함수

import { notFound } from 'next/navigation';
import { createSlug } from './slug';
import { validateUsername } from './validation';
import { fetchPostData } from './dataFetcher';
import { Post } from '@/app/types/post.types';
import { ApiError } from './api';

/**
 * PostPage용 파라미터 검증 및 데이터 가져오기
 * @param id URL에서 추출한 post ID
 * @param slug URL에서 추출한 제목 slug
 * @returns 검증된 데이터 또는 ApiError (비공개 글)
 */
export async function validateAndFetchPost(
  id: string | undefined,
  slug: string | undefined
): Promise<Post | ApiError> {
  // URL 파라미터 검증
  if (!id || !slug) {
    notFound();
  }

  // id가 숫자인지 확인
  const postId = id.match(/^\d+$/) ? id : null;
  if (!postId) {
    notFound();
  }

  // 데이터 가져오기 (postId만 사용)
  const result = await fetchPostData(postId);

  // 비공개 글인 경우 ApiError 반환
  if (result && typeof result === 'object' && 'isPrivate' in result) {
    return result as ApiError;
  }

  if (!result) {
    notFound();
  }

  const post = result as Post;

  // slug가 제목과 일치하는지 확인 (SEO 및 보안)
  // URL 디코딩 처리 (한글 등이 인코딩될 수 있음)
  try {
    const decodedSlug = decodeURIComponent(slug);
    const expectedSlug = createSlug(post.title);
    
    // 디버깅을 위한 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('Slug 비교:', {
        received: decodedSlug,
        expected: expectedSlug,
        title: post.title,
        match: decodedSlug === expectedSlug
      });
    }
    
    // slug가 일치하지 않으면 404 (하지만 ID는 맞으므로 경고만)
    if (decodedSlug !== expectedSlug) {
      console.warn(`Slug 불일치: 예상 "${expectedSlug}", 받음 "${decodedSlug}" (ID: ${postId})`);
      // 일단 ID만으로도 접근 허용 (slug는 SEO용이므로)
      // notFound();
    }
  } catch (e) {
    // URL 디코딩 실패 시에도 ID만으로 접근 허용
    console.warn('Slug 디코딩 실패:', e);
  }

  return post;
}

/**
 * UserPage용 파라미터 검증
 * @param username URL에서 추출한 username
 * @returns 검증된 username 또는 null (notFound 호출)
 */
export function validateUsernameParam(username: string | undefined): string {
  const validUsername = validateUsername(username);
  if (!validUsername) {
    notFound();
  }
  return validUsername;
}

