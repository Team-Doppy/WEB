// 숫자 포맷팅 유틸리티

/**
 * 숫자를 K, M 단위로 축약
 * 예: 1234 → "1.2k", 12345 → "12k", 1234567 → "1.2M"
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 10000) {
    // 1k~9.9k
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else if (num < 1000000) {
    // 10k~999k
    return Math.floor(num / 1000) + 'k';
  } else if (num < 10000000) {
    // 1M~9.9M
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else {
    // 10M+
    return Math.floor(num / 1000000) + 'M';
  }
}

