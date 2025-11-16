// 날짜 포맷팅 유틸리티

type DateFormatOptions = 
  | 'short'      // "1월 15일" (월, 일만)
  | 'medium'     // "2024년 1월 15일" (년, 월, 일)
  | 'long'       // "2024년 1월 15일 14:30" (년, 월, 일, 시, 분)
  | 'card';      // "1월 15일" (PostCard용)

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param dateString ISO 날짜 문자열 또는 Date 객체
 * @param format 포맷 타입
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(dateString: string | Date, format: DateFormatOptions = 'medium'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const formatOptions: Record<DateFormatOptions, Intl.DateTimeFormatOptions> = {
    short: {
      month: 'long',
      day: 'numeric',
    },
    medium: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    card: {
      month: 'short',
      day: 'numeric',
    },
  };

  return date.toLocaleDateString('ko-KR', formatOptions[format]);
}

