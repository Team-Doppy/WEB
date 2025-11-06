'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ParagraphNode } from '@/app/types/post.types';

interface ParagraphBlockProps {
  node: ParagraphNode;
}

interface TextSegment {
  text: string;
  fontSize?: number;
  spoiler?: boolean;
  highlight?: string;
  spanIndex?: number;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ node }) => {
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());
  const [spoilerRects, setSpoilerRects] = useState<Map<number, DOMRect[]>>(new Map());
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
    
    const segmentKey = JSON.stringify(styles);
    const prevKey = currentSegment ? JSON.stringify({
      fontSize: currentSegment.fontSize,
      spoiler: currentSegment.spoiler,
      highlight: currentSegment.highlight,
      spanIndex: currentSegment.spanIndex,
    }) : null;

    if (segmentKey !== prevKey) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        text: char,
        fontSize: styles.font_size,
        spoiler: styles.spoiler,
        highlight: styles.highlight,
        spanIndex: styles.spanIndex,
      };
    } else {
      currentSegment!.text += char;
    }
  }
  if (currentSegment) {
    segments.push(currentSegment);
  }

  // 스포일러 영역의 실제 위치 계산
  useEffect(() => {
    if (!textRef.current) return;

    const timer = setTimeout(() => {
      if (!textRef.current) return;

      const newRects = new Map<number, DOMRect[]>();
      const spans = textRef.current.querySelectorAll('[data-spoiler-index]');
      
      spans.forEach((span) => {
        const spanIndex = parseInt(span.getAttribute('data-spoiler-index') || '-1');
        if (spanIndex === -1) return;

        const spanRect = (span as HTMLElement).getBoundingClientRect();
        const parentRect = textRef.current!.getBoundingClientRect();
        
        // 상대 좌표로 변환
        const relativeRect = new DOMRect(
          spanRect.left - parentRect.left,
          spanRect.top - parentRect.top,
          spanRect.width,
          spanRect.height
        );
        
        newRects.set(spanIndex, [relativeRect]);
      });

      setSpoilerRects(newRects);
    }, 0);

    return () => clearTimeout(timer);
  }, [node.text, node.spans]);

  const toggleSpoiler = (spanIndex: number) => {
    setRevealedSpoilers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spanIndex)) {
        newSet.delete(spanIndex);
      } else {
        newSet.add(spanIndex);
      }
      return newSet;
    });
  };

  return (
    <div className="relative">
      <p
        ref={textRef}
        className={`${
          node.isTitle
            ? 'text-3xl font-bold mb-6'
            : 'text-base leading-relaxed mb-4'
        } relative`}
      >
        {segments.map((segment, index) => {
          const style: React.CSSProperties = {};
          if (segment.fontSize) {
            style.fontSize = `${segment.fontSize}px`;
          }

          const spanIndex = segment.spanIndex;
          const isSpoilerRevealed = spanIndex !== undefined && revealedSpoilers.has(spanIndex);

          // 형광펜만 있는 경우
          if (segment.highlight && !segment.spoiler) {
            style.backgroundColor = segment.highlight;
            style.padding = '2px 0';
            return (
              <span key={index} style={style}>
                {segment.text}
              </span>
            );
          }

          // 스포일러가 있는 경우
          if (segment.spoiler && spanIndex !== undefined) {
            return (
              <span
                key={index}
                data-spoiler-index={spanIndex}
                onClick={() => toggleSpoiler(spanIndex)}
                className={`relative cursor-pointer select-none ${
                  isSpoilerRevealed ? '' : 'text-transparent'
                }`}
                style={{
                  ...style,
                  ...(segment.highlight && isSpoilerRevealed ? { 
                    backgroundColor: segment.highlight,
                    padding: '2px 0'
                  } : {}),
                }}
              >
                {segment.text}
              </span>
            );
          }

          // 일반 텍스트
          return (
            <span key={index} style={style}>
              {segment.text}
            </span>
          );
        })}
      </p>

      {/* 스포일러 파티클 오버레이 */}
      {Array.from(spoilerRects.entries()).map(([spanIndex, rects]) => {
        if (revealedSpoilers.has(spanIndex)) return null;
        return (
          <SpoilerOverlay
            key={spanIndex}
            rects={rects}
            onReveal={() => toggleSpoiler(spanIndex)}
          />
        );
      })}
    </div>
  );
};

interface SpoilerOverlayProps {
  rects: DOMRect[];
  onReveal: () => void;
}

const SpoilerOverlay: React.FC<SpoilerOverlayProps> = ({ rects, onReveal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isScattering, setIsScattering] = useState(false);
  const scatterStartTime = useRef<number>(0);

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
        const elapsed = Date.now() - scatterStartTime.current;
        const t = Math.min(elapsed / 520, 1); // 520ms 동안
        
        drawScatterEffect(ctx, rects, t);
        
        if (t >= 1) {
          setIsScattering(false);
          return;
        }
      } else {
        // 일반 파티클 애니메이션
        phase = (phase + 0.012) % 1;
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
  }, [rects, isScattering]);

  const handleClick = () => {
    setIsScattering(true);
    scatterStartTime.current = Date.now();
    setTimeout(onReveal, 520);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {rects.map((rect, i) => (
        <div
          key={i}
          onClick={handleClick}
          className="absolute cursor-pointer pointer-events-auto"
          style={{
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            backgroundColor: 'rgba(200, 200, 200, 0.3)',
          }}
        />
      ))}
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
  const t = phase * Math.PI * 2 * 0.85;

  rects.forEach(rect => {
    const area = rect.width * rect.height;
    const count = Math.max(70, Math.floor(area / 150));

    for (let i = 0; i < count; i++) {
      const seed = rect.left * 1000 + rect.top * 100 + i;
      const rand = seededRandom(seed);

      const baseX = rect.left + rand() * rect.width;
      const baseY = rect.top + rand() * rect.height;

      const ampX = 1.0 + rand() * 1.4;
      const ampY = 1.0 + rand() * 1.4;
      const phaseShift = rand() * Math.PI * 2;

      const ox = Math.sin(t * (0.85 + rand() * 0.5) + i * 0.13 + phaseShift) * ampX;
      const oy = Math.cos(t * (0.9 + rand() * 0.5) + i * 0.11 + phaseShift) * ampY;

      let x = ((baseX + ox - rect.left) % rect.width) + rect.left;
      let y = ((baseY + oy - rect.top) % rect.height) + rect.top;

      const size = 1.0 + rand() * 0.8;
      const opacity = (0.85 + rand() * 0.15) * 0.6;

      ctx.fillStyle = `rgba(100, 100, 100, ${opacity})`;
      ctx.fillRect(x, y, size, size);
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
    const count = Math.max(50, Math.floor(area / 220));
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const seed = rect.left * 1000 + rect.top * 100 + i + 999;
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

      const speed = 24 + rand() * 36;
      const move = easedT * speed;

      const x = startX + nx * move;
      const y = startY + ny * move;

      const sz = 1.0 + 1.6 * (1.0 - t);
      const opacity = 0.5 * fade;

      ctx.fillStyle = `rgba(100, 100, 100, ${opacity})`;
      ctx.fillRect(x, y, sz, sz);
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

