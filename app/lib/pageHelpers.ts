// 페이지 컴포넌트용 헬퍼 함수

import { notFound } from 'next/navigation';
import { extractPostId } from './slug';
import { validateUsername } from './validation';
import { fetchPostData } from './dataFetcher';
import { Post } from '@/app/types/post.types';

/**
 * PostPage용 파라미터 검증 및 데이터 가져오기
 * @param username URL에서 추출한 username
 * @param slugWithId URL에서 추출한 slug-with-id
 * @returns 검증된 데이터 (실패 시 notFound 호출로 never 반환)
 */
export async function validateAndFetchPost(
  username: string | undefined,
  slugWithId: string | undefined
): Promise<Post> {
  // URL 파라미터 검증
  if (!username || !slugWithId) {
    notFound();
  }

  // username 검증
  const validUsername = validateUsername(username);
  if (!validUsername) {
    notFound();
  }

  // slug-postId 형식 검증 및 postId 추출
  const postId = extractPostId(slugWithId);
  if (!postId) {
    notFound();
  }

  // 데이터 가져오기 (postId만 사용)
  const post = await fetchPostData(postId);

  if (!post) {
    notFound();
  }

  // 게시글 작성자와 URL의 username이 일치하는지 확인 (보안)
  if (post.author !== validUsername) {
    notFound();
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

