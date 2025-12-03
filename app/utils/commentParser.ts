// 댓글 내용 파싱 유틸리티

export interface ParsedCommentContent {
  type: 'text' | 'image';
  content: string;
}

/**
 * 댓글 내용을 파싱하여 텍스트와 이미지를 분리
 * [IMAGE] https://... 또는 [IMAGES:https://...] 형식의 이미지를 감지
 */
export function parseCommentContent(content: string): ParsedCommentContent[] {
  const result: ParsedCommentContent[] = [];
  // [IMAGE] URL 또는 [IMAGES:URL] 형식 모두 지원
  const imagePattern = /\[IMAGES?:?\s*(https?:\/\/[^\]\s]+)\]|\[IMAGE\]\s*(https?:\/\/[^\s]+)/gi;
  
  let lastIndex = 0;
  let match;
  
  while ((match = imagePattern.exec(content)) !== null) {
    // 이미지 태그 이전의 텍스트
    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index).trim();
      if (text) {
        result.push({ type: 'text', content: text });
      }
    }
    
    // 이미지 URL (두 가지 형식 모두 처리)
    const imageUrl = match[1] || match[2];
    if (imageUrl) {
      result.push({ type: 'image', content: imageUrl });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // 마지막 이미지 이후의 텍스트
  if (lastIndex < content.length) {
    const text = content.substring(lastIndex).trim();
    if (text) {
      result.push({ type: 'text', content: text });
    }
  }
  
  // 이미지가 없으면 전체를 텍스트로 반환
  if (result.length === 0) {
    result.push({ type: 'text', content });
  }
  
  return result;
}

