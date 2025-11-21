// URL slug 생성 유틸리티

/**
 * 제목을 URL-safe slug로 변환
 * 예: "애한제야" → "애한제야"
 * 예: "Hello World!" → "hello-world"
 */
export function createSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    // 특수문자를 하이픈으로 변환
    .replace(/[^\w\s가-힣-]/g, '')
    // 공백을 하이픈으로
    .replace(/\s+/g, '-')
    // 연속된 하이픈 제거
    .replace(/-+/g, '-')
    // 앞뒤 하이픈 제거
    .replace(/^-+|-+$/g, '');
}

/**
 * slug와 ID를 조합하여 URL 세그먼트 생성 (제목 slug만 반환)
 * 예: "이것이 제목입니다" → "이것이-제목입니다"
 */
export function createPostSlug(title: string, postId: number): string {
  return createSlug(title);
}

/**
 * URL 세그먼트에서 postId 추출 (이제 id는 별도 파라미터)
 * @deprecated 이제 id는 URL 파라미터로 직접 전달됨
 */
export function extractPostId(slugWithId: string): string | null {
  // 이전 호환성을 위해 유지하지만, 실제로는 사용되지 않음
  const match = slugWithId.match(/^(\d+)-/);
  return match ? match[1] : null;
}

/**
 * URL 세그먼트 검증
 * slug 형식인지 확인
 */
export function isValidPostSlug(slug: string): boolean {
  // slug는 제목에서 생성된 문자열이므로, 빈 문자열이 아니면 유효
  return slug.length > 0;
}

