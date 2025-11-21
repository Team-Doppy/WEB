// 프로필 피드 관련 타입 정의

// 사용자 정보 (피드 스키마 응답)
export interface UserInfoResponse {
  id: number;
  username: string;
  alias: string;
  profileImageUrl: string | null;
  isOwnProfile: boolean;
  totalPosts: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  canFollow: boolean;
  links: string[];
}

// 카테고리 정보
export interface CategoryInfo {
  id: number;
  name: string;
  displayOrder: number;
  postCount: number;
  isPrivate: boolean;
  isSystem: boolean;
  description: string | null;
}

// 포스트 순서 정보
export interface PostOrderInfo {
  id: number;
  order: number;
  globalIndex: number;
}

// 피드 스키마 응답
export interface ProfileFeedSchemaResponse {
  userInfo: UserInfoResponse;
  categories: CategoryInfo[];
  postsByCategory: Record<string, PostOrderInfo[]>;
  systemCategoryMappings: Record<string, number[]>;
}

