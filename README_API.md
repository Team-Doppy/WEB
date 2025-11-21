# API 연동 가이드

## 환경 변수 설정

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 실제 API 서버 URL
NEXT_PUBLIC_API_URL=https://api.doppy.app

# Mock 데이터 사용 여부 (true: Mock 데이터 사용, false: 실제 API 사용)
USE_MOCK_DATA=false
```

**개발 환경 예시:**
```env
# 개발 중에는 Mock 데이터 사용
NEXT_PUBLIC_API_URL=https://api.doppy.app
USE_MOCK_DATA=true
```

**프로덕션 환경 예시:**
```env
# 프로덕션에서는 실제 API 사용
NEXT_PUBLIC_API_URL=https://api.doppy.app
USE_MOCK_DATA=false
```

### 2. 환경 변수 설명

- **NEXT_PUBLIC_API_URL**: 블로그 API 서버의 기본 URL
  - 예: `https://api.yourblog.com`
  - 클라이언트와 서버 모두에서 접근 가능 (NEXT_PUBLIC_ 접두사)
  
- **USE_MOCK_DATA**: Mock 데이터 사용 여부
  - `true`: Mock 데이터 사용 (API 호출 안 함)
  - `false`: 실제 API 호출
  - 설정하지 않으면 API_BASE_URL이 없을 때 자동으로 Mock 데이터 사용

- **API_URL**: 서버 사이드에서만 사용되는 API URL (선택사항)
  - 클라이언트에 노출되지 않는 내부 API URL이 필요한 경우 사용

## API 엔드포인트

실제 Doppy 웹 전용 API 서버 (`https://api.doppy.app`)의 엔드포인트를 사용합니다:

### 1. 공개 포스트 상세 조회
```
GET /web/api/posts/{postId}
```

**응답 예시:**
```json
{
  "id": 170,
  "title": "게시글 제목",
  "thumbnailImageUrl": "https://...",
  "content": {
    "nodes": [...],
    "stickers": [...]
  },
  "summary": "요약",
  "author": {
    "username": "testuser",
    "alias": "테스트 유저",
    "profileImageUrl": "https://..."
  },
  "accessLevel": "PUBLIC",
  "viewCount": 100,
  "likeCount": 10,
  "commentCount": 5,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### 2. 공개 프로필 정보 조회
```
GET /web/api/profile/{username}
```

**응답 예시:**
```json
{
  "username": "testuser",
  "alias": "테스트 유저",
  "profileImageUrl": "https://...",
  "selfIntroduction": "소개글",
  "links": ["https://instagram.com/username"],
  "linkTitles": {
    "https://instagram.com/username": "내 인스타그램"
  },
  "createdAt": "2025-01-01T00:00:00"
}
```

### 3. 프로필 피드 포스트 조회
```
GET /web/api/profile/{username}/feed/posts?page=0&size=20
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "포스트 제목",
        "summary": "포스트 요약",
        "thumbnailImageUrl": "https://...",
        "author": "testuser",
        "authorAlias": "테스트 유저",
        "createdAt": "2024-01-01T00:00:00",
        "likeCount": 10,
        "commentCount": 5,
        "viewCount": 100,
        "accessLevel": "PUBLIC",
        "categoryId": 0,
        "categoryName": "system_doppy_uncategorized"
      }
    ],
    "currentPage": 0,
    "totalPages": 5,
    "totalElements": 100,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": null
}
```

**참고:** 
- 모든 엔드포인트는 인증 없이 접근 가능한 공개 API입니다
- 프로필 피드 응답은 `{ success, data: { posts, ... } }` 구조입니다
- 웹 전용 API에는 전체 피드 엔드포인트가 없으므로, 홈 피드는 Mock 데이터를 사용하거나 여러 사용자의 프로필 피드를 병합합니다

## 개발 모드

개발 중에는 `.env.local`에서 `USE_MOCK_DATA=true`로 설정하여 Mock 데이터를 사용할 수 있습니다.

## 프로덕션 배포

프로덕션 환경에서는:

1. `.env.local` 또는 배포 플랫폼의 환경 변수 설정에서 `NEXT_PUBLIC_API_URL`을 실제 API 서버 URL로 설정
2. `USE_MOCK_DATA=false`로 설정 (또는 환경 변수에서 제거)

## 에러 처리

- API 요청 실패 시 자동으로 Mock 데이터로 fallback (개발 환경)
- 404 응답은 `null` 반환
- 401/403 인증 오류는 로그만 남기고 `null` 반환
- 네트워크 오류나 파싱 오류는 콘솔에 로그 출력 후 `null` 또는 빈 배열 반환

## 응답 구조 처리

웹 전용 API는 다음 응답 구조를 사용합니다:

1. **프로필 피드 응답**:
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "currentPage": 0,
    "totalPages": 5,
    "totalElements": 100,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": null
}
```

2. **포스트 상세 응답**:
```json
{
  "id": 1,
  "title": "...",
  "author": {
    "username": "...",
    "alias": "...",
    "profileImageUrl": "..."
  },
  ...
}
```

3. **프로필 정보 응답**:
```json
{
  "username": "...",
  "alias": "...",
  "profileImageUrl": "...",
  ...
}
```

## 인증 토큰 처리

### 서버 사이드 (Server Components)
- 현재는 공개 게시글 조회만 구현되어 인증 불필요
- 향후 인증이 필요한 경우 쿠키나 헤더를 통해 토큰 전달

### 클라이언트 사이드 (Client Components)
- `app/lib/apiClient.ts` 사용
- localStorage에서 토큰 자동 읽기
- 토큰 만료 5분 전 자동 갱신
- 서버 자동 갱신 토큰 감지 및 저장

## 사용 예시

### 서버 컴포넌트에서 사용
```typescript
import { fetchPostData, fetchUserPosts } from '@/app/lib/dataFetcher';

// 게시글 조회
const post = await fetchPostData(170);

// 사용자 게시글 목록
const posts = await fetchUserPosts('username');
```

### 클라이언트 컴포넌트에서 사용 (인증 필요 시)
```typescript
'use client';
import { clientApiRequest } from '@/app/lib/apiClient';

// 인증이 필요한 API 호출
const data = await clientApiRequest('/api/posts/my');
```

