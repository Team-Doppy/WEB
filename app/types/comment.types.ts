// 댓글 데이터 타입 정의

export interface Comment {
  id: number;
  content: string;
  author: string;
  authorProfileImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  isSecret?: boolean; // 비밀 댓글 여부
}

export interface CommentResponse {
  success: boolean;
  data: {
    content: Comment[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  };
}

