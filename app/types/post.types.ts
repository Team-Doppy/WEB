// 포스트 데이터 타입 정의

export interface Post {
  id: number;
  title: string;
  thumbnailImageUrl: string;
  content: PostContent;
  summary: string | null;
  author: string;
  authorProfileImageUrl: string;
  accessLevel: string;
  sharedGroupIds: string[] | null;
  viewCount: number;
  likeCount: number;
  commentCount?: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostContent {
  nodes: ContentNode[];
  stickers: Sticker[];
}

export type ContentNode =
  | ParagraphNode
  | ImageNode
  | VideoNode
  | MentionNode
  | ImageRowNode
  | LinkNode
  | DividerNode;

// 문단 노드
export interface ParagraphNode {
  id: string;
  type: 'paragraph';
  text: string;
  spans: TextSpan[];
  isTitle?: boolean;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  metadata?: {
    textAlign?: 'left' | 'center' | 'right';
  };
}

// 이미지 노드
export interface ImageNode {
  id: string;
  type: 'image';
  data: {
    url: string;
    mediaId?: number;
    spoiler?: boolean;
    hasComments: boolean;
    commentCount: number;
  };
}

// 이미지 행 노드 (여러 이미지를 한 줄에 표시, 최대 3개)
export interface ImageRowNode {
  id: string;
  type: 'imageRow';
  urls: string[]; // 최대 3개
  spacing?: number;
  spoiler?: boolean;
}

// 비디오 노드
export interface VideoNode {
  id: string;
  type: 'video';
  data: {
    url: string;
    hasComments: boolean;
    commentCount: number;
  };
}

// 멘션 노드
export interface MentionNode {
  id: string;
  type: 'mention';
  usernames: string[];
  align?: 'left' | 'center' | 'right';
}

// 링크 노드
export interface LinkNode {
  id: string;
  type: 'link';
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

// 디바이더 노드
export interface DividerNode {
  id: string;
  type: 'divider';
}

// 텍스트 스타일링
export interface TextSpan {
  start: number;
  end: number;
  attrs: {
    font_size?: number;
    fontFamily?: string;
    color?: string;
    spoiler?: boolean;
    highlight?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
}

// 스티커 (드로잉 또는 이미지)
export interface Sticker {
  id: string;
  type: 'drawing' | 'image';
  scale: number;
  anchor: {
    refW: number;
    localX: number;
    localY: number;
    nodeId: string;
  };
  zIndex: number;
  content: {
    strokes?: Stroke[]; // 벡터 드로잉용 (옵션)
    imageUrl?: string; // PNG 이미지용 (옵션)
    url?: string; // 이미지 URL (imageUrl 대체)
    width?: number;
    height?: number;
  };
  opacity: number;
  rotation: number;
  positionFallback: {
    xPx: number;
    yPx: number;
    docWidth: number | null;
  };
}

export interface Stroke {
  color: string;
  erase: boolean;
  width: number;
  points: Point[];
}

export interface Point {
  x: number;
  y: number;
}

