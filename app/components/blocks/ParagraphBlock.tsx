'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ParagraphNode } from '@/app/types/post.types';
import { useSpoiler } from '@/app/hooks/useSpoiler';
import { formatNumber } from '@/app/utils/format';
import { formatDate } from '@/app/utils/date';

interface ParagraphBlockProps {
  node: ParagraphNode;
  authorInfo?: {
    author: string;
    authorProfileImageUrl: string;
    createdAt: string;
  };
  viewCount?: number;
}

interface TextSegment {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  spoiler?: boolean;
  highlight?: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  spanIndex?: number; 
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ node, authorInfo, viewCount }) => {
  const [spoilerRects, setSpoilerRects] = useState<DOMRect[]>([]);
  const textRef = useRef<HTMLParagraphElement>(null);

  if (!node.text) {
    return <div className="h-6" />; // 빈 줄
  }

  // 텍스트를 스타일 기준으로 세그먼트화
  const segments: TextSegment[] = [];
  const styleMap = new Map<number, any>();
  
  node.spans.forEach((span, spanIndex) => {
    for (let i = span.start; i < span.end; i++) {
      if (!styleMap.has(i)) {
        styleMap.set(i, { ...span.attrs, spanIndex });
      } else {
        Object.assign(styleMap.get(i), span.attrs);
        if (span.attrs.spoiler) {
          styleMap.get(i).spanIndex = spanIndex;
        }
      }
    }
  });

  let currentSegment: TextSegment | null = null;
  for (let i = 0; i < node.text.length; i++) {
    const char = node.text[i];
    const styles = styleMap.get(i) || {};
    
    const segmentKey = JSON.stringify({
      fontSize: styles.font_size,
      fontFamily: styles.fontFamily,
      color: styles.color,
      spoiler: styles.spoiler,
      highlight: styles.highlight,
      bold: styles.bold,
      italic: styles.italic,
      strikethrough: styles.strikethrough,
      underline: styles.underline,
      spanIndex: styles.spanIndex,
    });
    const prevKey = currentSegment ? JSON.stringify({
      fontSize: currentSegment.fontSize,
      fontFamily: currentSegment.fontFamily,
      color: currentSegment.color,
      spoiler: currentSegment.spoiler,
      highlight: currentSegment.highlight,
      bold: currentSegment.bold,
      italic: currentSegment.italic,
      strikethrough: currentSegment.strikethrough,
      underline: currentSegment.underline,
      spanIndex: currentSegment.spanIndex,
    }) : null;

    if (segmentKey !== prevKey) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        text: char,
        fontSize: styles.font_size,
        fontFamily: styles.fontFamily || node.fontFamily,
        color: styles.color,
        spoiler: styles.spoiler,
        highlight: styles.highlight,
        bold: styles.bold,
        italic: styles.italic,
        strikethrough: styles.strikethrough,
        underline: styles.underline,
        spanIndex: styles.spanIndex,
      };
    } else {
      currentSegment!.text += char;
    }
  }
  if (currentSegment) {
    segments.push(currentSegment);
  }

  // 스포일러가 있는지 체크
  const hasSpoiler = segments.some(s => s.spoiler);
  const { isRevealed, isScattering, toggleSpoiler, scatterStartTimeRef } = useSpoiler({ hasSpoiler });

  // 스포일러 영역의 실제 위치 계산 (줄 단위로 병합)
  useEffect(() => {
    if (!textRef.current || !hasSpoiler || isRevealed) return;

    const timer = setTimeout(() => {
      if (!textRef.current) return;

      const spans = textRef.current.querySelectorAll('[data-spoiler]');
      
      if (spans.length === 0) {
        setSpoilerRects([]);
        return;
      }

      // 모든 스포일러 span의 영역을 포함하는 하나의 bounding box 계산
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      const parentRect = textRef.current.getBoundingClientRect();

      spans.forEach((span) => {
        const spanRect = (span as HTMLElement).getBoundingClientRect();
        
        const left = spanRect.left - parentRect.left;
        const top = spanRect.top - parentRect.top;
        const right = left + spanRect.width;
        const bottom = top + spanRect.height;

        minLeft = Math.min(minLeft, left);
        minTop = Math.min(minTop, top);
        maxRight = Math.max(maxRight, right);
        maxBottom = Math.max(maxBottom, bottom);
      });

      // 하나의 통합된 영역
      const mergedRect = new DOMRect(
        minLeft,
        minTop,
        maxRight - minLeft,
        maxBottom - minTop
      );

      setSpoilerRects([mergedRect]);
    }, 0);

    return () => clearTimeout(timer);
  }, [node.text, node.spans, hasSpoiler, isRevealed]);

  // 정렬 처리: align 속성이 우선, 없으면 metadata.textAlign, 둘 다 없으면 center (가운데 정렬)
  const textAlign = node.align || node.metadata?.textAlign || 'center';
  const alignClass = 
    textAlign === 'center' ? 'text-center' :
    textAlign === 'right' ? 'text-right' :
    'text-left';

  return (
    <div className="relative">
      {/* Placeholder - 크기 확보 (검정 배경) */}
      <div className="absolute inset-0 bg-black -z-10">
        {node.isTitle && <div className="h-32"></div>}
        {!node.isTitle && node.text && <div className="min-h-8"></div>}
        {!node.text && <div className="h-6"></div>}
      </div>
      
      {/* 실제 콘텐츠 - fade-in 효과 */}
      <div className="relative transition-opacity duration-500 opacity-0 animate-fade-in">
        {/* 제목 블록이면 작성자 정보 먼저 표시 */}
        {node.isTitle && authorInfo && (
          <div className={`flex items-center gap-2 lg:gap-4 mb-4 lg:mb-6 ${
            alignClass === 'text-center' ? 'justify-center' :
            alignClass === 'text-right' ? 'justify-end' :
            'justify-start'
          }`}>
            <img
              src={authorInfo.authorProfileImageUrl}
              alt={authorInfo.author}
              className="w-8 h-8 lg:w-12 lg:h-12 rounded-full ring-1 lg:ring-2 ring-white/30"
            />
            <div>
              <p className="font-semibold text-sm lg:text-xl text-white">{authorInfo.author}</p>
              <time className="text-xs lg:text-base text-gray-400">
                {formatDate(authorInfo.createdAt, 'medium')}
              </time>
            </div>
          </div>
        )}

        <div className={`${node.isTitle ? `${alignClass === 'text-center' ? 'flex flex-col items-center' : alignClass === 'text-right' ? 'flex flex-col items-end' : 'flex flex-col items-start'} mb-12 lg:mb-16 bg-black` : ''}`}>
          <div className={`${node.isTitle ? `flex items-center gap-3 ${alignClass === 'text-center' ? 'justify-center' : alignClass === 'text-right' ? 'justify-end' : 'justify-start'}` : ''}`}>
            <p
              ref={textRef}
              className={`${
                node.isTitle
                  ? 'text-2xl lg:text-4xl xl:text-6xl font-bold text-white bg-black'
                  : 'leading-tight mb-2 text-white text-[16px] lg:text-[21px]'
              } ${alignClass} relative whitespace-pre-wrap ${node.isTitle ? 'flex-shrink-0' : ''}`}
            >
          {segments.map((segment, index) => {
          const style: React.CSSProperties = {};
          if (segment.fontSize) {
            style.fontSize = `${segment.fontSize}px`;
          }
          if (segment.fontFamily) {
            // 폰트 이름에 공백이 있으면 따옴표로 감싸기
            style.fontFamily = segment.fontFamily.includes(' ') 
              ? `"${segment.fontFamily}", sans-serif`
              : `${segment.fontFamily}, sans-serif`;
          }
          // color가 있으면 명시적으로 설정 (부모의 text-white보다 우선순위 높음)
          if (segment.color) {
            style.color = segment.color;
          } else {
            // color가 없으면 기본 연한 흰색 설정
            style.color = '#e5e5e5';
          }
          
          const classNames: string[] = [];
          if (segment.bold) {
            classNames.push('font-bold');
          }
          if (segment.italic) {
            classNames.push('italic');
          }
          if (segment.strikethrough) {
            classNames.push('line-through');
          }
          if (segment.underline) {
            classNames.push('underline');
          }

          // 형광펜만 있는 경우
          if (segment.highlight && !segment.spoiler) {
            // 채도 높이기 (hex color를 HSL로 변환 후 채도 증가)
            const saturatedColor = saturateColor(segment.highlight, 1.5);
            style.backgroundColor = saturatedColor;
            style.padding = '2px 4px';
            style.borderRadius = '2px';
            return (
              <span key={index} style={style} className={classNames.join(' ')}>
                {segment.text}
              </span>
            );
          }

          // 스포일러가 있는 경우
          if (segment.spoiler) {
            return (
              <span
                key={index}
                data-spoiler="true"
                onClick={toggleSpoiler}
                className={`relative cursor-pointer select-none ${
                  isRevealed || isScattering ? '' : 'text-transparent'
                } ${classNames.join(' ')}`}
                style={{
                  ...style,
                  ...(segment.highlight && (isRevealed || isScattering) ? { 
                    backgroundColor: saturateColor(segment.highlight, 1.5),
                    padding: '2px 4px',
                    borderRadius: '2px'
                  } : {}),
                }}
              >
                {segment.text}
              </span>
            );
          }

          // 일반 텍스트
          return (
            <span key={index} style={style} className={classNames.join(' ')}>
              {segment.text}
            </span>
          );
        })}
        </p>

            {/* 제목 옆에 뷰카운트 */}
            {node.isTitle && viewCount !== undefined && (
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 backdrop-blur-sm flex-shrink-0">
                <span className="text-white font-semibold text-xs lg:text-sm">
                  {formatNumber(viewCount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 스포일러 파티클 오버레이 */}
        {hasSpoiler && (!isRevealed || isScattering) && spoilerRects.length > 0 && (
          <SpoilerOverlay
            rects={spoilerRects}
            isScattering={isScattering}
            scatterStartTime={scatterStartTimeRef.current}
            onReveal={toggleSpoiler}
          />
        )}
      </div>
    </div>
  );
};

interface SpoilerOverlayProps {
  rects: DOMRect[];
  isScattering: boolean;
  scatterStartTime: number;
  onReveal: () => void;
}

const SpoilerOverlay: React.FC<SpoilerOverlayProps> = ({ rects, isScattering, scatterStartTime, onReveal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Canvas 크기를 컨테이너에 맞춤
    const updateCanvasSize = () => {
      const parentRect = container.parentElement?.getBoundingClientRect();
      if (parentRect) {
        canvas.width = parentRect.width;
        canvas.height = parentRect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const animate = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isScattering) {
        // 흩어지는 애니메이션
        const elapsed = Date.now() - scatterStartTime;
        const t = Math.min(elapsed / 520, 1); // 520ms 동안
        
        drawScatterEffect(ctx, rects, t);
        
        if (t >= 1) {
          return;
        }
      } else {
        // 일반 파티클 애니메이션 (속도 느리게)
        phase = (phase + 0.005) % 1;
        drawParticles(ctx, rects, phase);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rects, isScattering, scatterStartTime]);

  const handleClick = () => {
    if (!isScattering) {
      onReveal(); // 즉시 텍스트 표시 및 scatter 시작
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* 클릭 영역 (투명) */}
      {rects.map((rect, i) => (
        <div
          key={i}
          onClick={handleClick}
          className="absolute cursor-pointer pointer-events-auto z-10"
          style={{
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          }}
        />
      ))}
      {/* 파티클 캔버스 */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
      />
    </div>
  );
};

function drawParticles(
  ctx: CanvasRenderingContext2D,
  rects: DOMRect[],
  phase: number
) {
  const t = phase * Math.PI * 2;

  rects.forEach(rect => {
    const area = rect.width * rect.height;
    const count = Math.max(150, Math.floor(area / 100));

    for (let i = 0; i < count; i++) {
      const seed = rect.left * 1000 + rect.top * 100 + i * 12345;
      const rand = seededRandom(seed);

      const baseX = rect.left + rand() * rect.width;
      const baseY = rect.top + rect.height * rand();

      // 훨씬 더 다양한 주파수 (불규칙성 극대화)
      const freq1 = 0.3 + rand() * 4.5;
      const freq2 = 0.5 + rand() * 5.0;
      const freq3 = 0.2 + rand() * 3.5;
      const freq4 = 0.7 + rand() * 2.8;
      
      const phase1 = rand() * Math.PI * 2;
      const phase2 = rand() * Math.PI * 2;
      const phase3 = rand() * Math.PI * 2;
      const phase4 = rand() * Math.PI * 2;

      // 불규칙한 진폭
      const ampX = 1.5 + rand() * 5.5;
      const ampY = 2.0 + rand() * 7.0;

      // 매우 복잡한 복합 움직임 (4개 레이어)
      const ox = 
        Math.sin(t * freq1 + phase1) * ampX +
        Math.cos(t * freq2 * 0.63 + phase2) * ampX * 0.7 +
        Math.sin(t * freq3 * 1.37 + phase3) * ampX * 0.4 +
        Math.cos(t * freq4 * 0.89 + phase4) * ampX * 0.25;
      
      const oy = 
        Math.cos(t * freq1 + phase1) * ampY +
        Math.sin(t * freq2 * 0.71 + phase2) * ampY * 0.65 +
        Math.cos(t * freq3 * 1.53 + phase3) * ampY * 0.45 +
        Math.sin(t * freq4 * 0.97 + phase4) * ampY * 0.3;

      // 불규칙한 팝핑 효과
      const popSpeed = 0.8 + rand() * 3.2;
      const popPhase = (t * popSpeed + phase1) % (Math.PI * 2);
      const popPower = 6 + Math.floor(rand() * 5); // 6~10 제곱
      const popEffect = Math.pow(Math.sin(popPhase), popPower) * (0.5 + rand() * 3.5);

      // 지터 효과 (미세한 떨림)
      const jitterX = (rand() - 0.5) * 0.8;
      const jitterY = (rand() - 0.5) * 1.2;

      let x = baseX + ox + jitterX;
      let y = baseY + oy - popEffect + jitterY;

      // 경계 처리
      x = ((x - rect.left) % rect.width + rect.width) % rect.width + rect.left;
      y = ((y - rect.top) % rect.height + rect.height) % rect.height + rect.top;

      // 불규칙한 크기 변화
      const sizeFreq = 1.2 + rand() * 4.5;
      const sizeWave = Math.sin(t * sizeFreq + phase2);
      const size = 0.6 + rand() * 1.4 + Math.abs(sizeWave) * 1.3;

      // 불규칙한 투명도 변화 - 더 또렷하게
      const opacityFreq = 0.9 + rand() * 3.8;
      const opacityWave = Math.sin(t * opacityFreq + phase3);
      const opacity = Math.min(1.0, 0.7 + rand() * 0.3 + Math.abs(opacityWave) * 0.3);

      // 완전히 또렷한 흰색 파티클
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  });
}

function drawScatterEffect(
  ctx: CanvasRenderingContext2D,
  rects: DOMRect[],
  t: number
) {
  const easedT = easeOutQuad(t);
  const fade = 1.0 - easeOut(t);

  rects.forEach(rect => {
    const area = rect.width * rect.height;
    const count = Math.max(120, Math.floor(area / 150));
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const seed = rect.left * 1000 + rect.top * 100 + i * 9999 + 12345;
      const rand = seededRandom(seed);

      const rx = rand() * rect.width;
      const ry = rand() * rect.height;
      const startX = rect.left + rx;
      const startY = rect.top + ry;

      const dirX = startX - cx;
      const dirY = startY - cy;
      const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) + 0.001;
      const nx = dirX / dirLen;
      const ny = dirY / dirLen;

      // 사방으로 터지는 듯한 강한 효과
      const speed = 80 + rand() * 120; // 더 빠르게
      const spiralEffect = Math.sin(easedT * Math.PI * 6 + rand() * Math.PI * 2) * 30; // 더 강한 나선 효과
      const move = easedT * speed;
      
      // 사방으로 터지는 효과를 위한 추가 방향성
      const angle = Math.atan2(ny, nx) + (rand() - 0.5) * 0.5;
      const spreadX = Math.cos(angle) * move;
      const spreadY = Math.sin(angle) * move;

      const x = startX + spreadX + spiralEffect * Math.cos(easedT * Math.PI * 3);
      const y = startY + spreadY + spiralEffect * Math.sin(easedT * Math.PI * 3);

      const rotation = easedT * Math.PI * 6 * (rand() > 0.5 ? 1 : -1); // 더 빠른 회전
      const sz = (1.0 + rand() * 2.0) * (1.0 + 2.5 * (1.0 - easedT)); // 더 큰 파티클
      const opacity = fade * (0.8 + rand() * 0.2); // 더 또렷하게

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      // 완전히 또렷한 흰색 파티클
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    }
  });
}

// 시드 기반 랜덤 생성기
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function easeOut(t: number): number {
  return t * (2 - t);
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

// 색상 채도 증가 함수
function saturateColor(color: string, amount: number): string {
  // #RRGGBBAA 또는 #RRGGBB 형식 파싱
  let hex = color.replace('#', '');
  let alpha = 'FF';
  
  if (hex.length === 8) {
    alpha = hex.slice(6, 8);
    hex = hex.slice(0, 6);
  } else if (hex.length === 6) {
    // 6자리는 그대로
  } else {
    return color; // 파싱 실패시 원본 반환
  }

  // RGB to HSL
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // 채도 증가
  s = Math.min(1, s * amount);

  // HSL to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let newR: number, newG: number, newB: number;
  if (s === 0) {
    newR = newG = newB = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    newR = hue2rgb(p, q, h + 1/3);
    newG = hue2rgb(p, q, h);
    newB = hue2rgb(p, q, h - 1/3);
  }

  // RGB to Hex
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}${alpha}`;
}
