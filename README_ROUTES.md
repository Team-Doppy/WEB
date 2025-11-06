# URL 라우팅 구조

## 📁 라우트 구조 (Medium 스타일)

```
/                                → 홈페이지 (랜딩)
/[username]                      → 사용자 게시글 목록
/[username]/[title-slug-id]     → 특정 게시글 상세
```

## 🎯 URL 예시

Medium처럼 제목이 포함된 SEO 친화적 URL:

```
/affection_jh/애한제야-170
/user_name/hello-world-123
/test-user/my-first-post-456
```

## 🔒 보안 기능

### 1. URL 파라미터 검증
- **username**: 영문자, 숫자, 언더스코어, 하이픈만 허용 (`/^[a-zA-Z0-9_-]+$/`)
- **slug-id**: 마지막에 `-{숫자}` 형식 필수 (`/-\d+$/`)

### 2. 데이터 검증
- 게시글 작성자와 URL의 username이 일치하는지 확인
- 불일치 시 404 에러 반환

### 3. XSS 방지
- URL 파라미터에서 특수문자 차단
- 정규식을 통한 입력값 검증

## 🎯 사용 예시

### 유효한 URL
```
✅ /affection_jh/애한제야-170
✅ /user_name/hello-world-123
✅ /test-user/my-post-456
```

### 무효한 URL
```
❌ /user<script>/title-123     → username에 특수문자
❌ /user/abc                   → ID 없음
❌ /user/title-abc             → ID가 숫자 아님
❌ /wrong_user/post-170        → 작성자 불일치
```

## 📝 Slug 생성 규칙

`lib/slug.ts`의 `createPostSlug()` 함수:

1. 제목을 소문자로 변환
2. 특수문자 제거
3. 공백을 하이픈(-)으로 변환
4. 마지막에 `-{postId}` 추가

```typescript
createPostSlug("애한제야", 170)        → "애한제야-170"
createPostSlug("Hello World!", 123)   → "hello-world-123"
```

## 🚀 개발 환경

개발 환경에서는 Mock 데이터를 사용합니다:
- `app/[username]/[postId]/page.tsx` - MOCK_DATA 객체
- `app/[username]/page.tsx` - MOCK_USERS 객체

## 📦 프로덕션 환경

프로덕션에서는 실제 API를 호출합니다:
- `lib/api.ts`의 `getPost()`, `getUserPosts()` 함수 사용
- `NEXT_PUBLIC_API_URL` 환경변수 설정 필요

## 🛠️ API 엔드포인트

```typescript
GET /users/{username}/posts/{postId}  → 특정 게시글
GET /users/{username}/posts           → 사용자의 모든 게시글
```

## 📝 메타데이터

각 페이지는 자동으로 SEO 메타데이터를 생성합니다:
- Open Graph 태그
- 제목, 설명, 썸네일 이미지

