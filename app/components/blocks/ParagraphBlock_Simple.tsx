'use client';

import React, { useState } from 'react';
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
    <p
      className={`${
        node.isTitle
          ? 'text-3xl font-bold mb-6'
          : 'text-base leading-relaxed mb-4'
      }`}
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
          if (isSpoilerRevealed) {
            // 해제된 스포일러
            return (
              <span
                key={index}
                onClick={() => toggleSpoiler(spanIndex)}
                className="cursor-pointer"
                style={{
                  ...style,
                  ...(segment.highlight ? { 
                    backgroundColor: segment.highlight,
                    padding: '2px 0'
                  } : {}),
                }}
              >
                {segment.text}
              </span>
            );
          } else {
            // 가려진 스포일러 - 간단한 CSS 기반
            return (
              <span
                key={index}
                onClick={() => toggleSpoiler(spanIndex)}
                className="relative inline-block cursor-pointer select-none"
                style={style}
              >
                <span className="text-transparent bg-gray-300 dark:bg-gray-700 px-1 rounded">
                  {segment.text}
                </span>
                <span 
                  className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 pointer-events-none"
                  style={{ fontSize: '10px' }}
                >
                  클릭하여 보기
                </span>
              </span>
            );
          }
        }

        // 일반 텍스트
        return (
          <span key={index} style={style}>
            {segment.text}
          </span>
        );
      })}
    </p>
  );
};

