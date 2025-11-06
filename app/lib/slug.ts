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
 * slug와 ID를 조합하여 URL 세그먼트 생성
 * 예: "애한제야", 170 → "애한제야-170"
 */
export function createPostSlug(title: string, postId: number): string {
  const slug = createSlug(title);
  return `${slug}-${postId}`;
}

/**
 * URL 세그먼트에서 postId 추출
 * 예: "애한제야-170" → 170
 * 예: "hello-world-123" → 123
 */
export function extractPostId(slugWithId: string): string | null {
  const match = slugWithId.match(/-(\d+)$/);
  return match ? match[1] : null;
}

/**
 * URL 세그먼트 검증
 * slug-{숫자} 형식인지 확인
 */
export function isValidPostSlug(slugWithId: string): boolean {
  return /-\d+$/.test(slugWithId);
}

