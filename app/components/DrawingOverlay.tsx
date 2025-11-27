'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Sticker } from '@/app/types/post.types';

interface DrawingOverlayProps {
  stickers: Sticker[];
  nodeRefs: Map<string, HTMLElement>;
}

export const DrawingOverlay: React.FC<DrawingOverlayProps> = ({ stickers, nodeRefs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  // 이미지 로드
  useEffect(() => {
    const imageMap = new Map<string, HTMLImageElement>();
    let loadedCount = 0;
    const totalImages = stickers.filter(s => s.content?.imageUrl || s.content?.url).length;

    if (totalImages === 0) {
      setLoadedImages(new Map());
      return;
    }

    stickers.forEach(sticker => {
      const imageUrl = sticker.content?.imageUrl || sticker.content?.url;
      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageMap.set(sticker.id, img);
          loadedCount++;
          if (loadedCount === totalImages) {
            setLoadedImages(new Map(imageMap));
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setLoadedImages(new Map(imageMap));
          }
        };
        img.src = imageUrl;
      }
    });
  }, [stickers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    
    // 캔버스 크기 설정 - 실제 컨텐츠 영역에 맞춤
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        // 컨테이너의 실제 크기 사용 (뷰포트 크기)
        const rect = container.getBoundingClientRect();
        
        // Canvas 픽셀 크기 설정
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const drawStickers = () => {
      // 컨텍스트 재설정 (크기 변경 시 초기화되므로)
      const ctx = canvas.getContext('2d', { 
        alpha: true,
        willReadFrequently: false,
        desynchronized: false
      });
      if (!ctx) return;
      
      // Canvas를 완전히 투명하게 지우기 (전체 영역)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const containerRect = canvas.parentElement?.getBoundingClientRect();
      if (!containerRect) return;
      
      // zIndex 순서로 정렬
      const sortedStickers = [...stickers].sort((a, b) => a.zIndex - b.zIndex);
      
      sortedStickers.forEach(sticker => {
        // 기준 너비 대비 현재 컨테이너 너비의 비율 계산
        const refW = sticker.anchor.refW || 393.0; // 기본값은 모바일 너비
        const currentContainerWidth = containerRect.width;
        const scaleRatio = currentContainerWidth / refW;

        let offsetX = 0;
        let offsetY = 0;

        const anchorNode = nodeRefs.get(sticker.anchor.nodeId);
        if (anchorNode) {
          // anchor 노드가 있으면 anchor 기준으로 위치 계산 (정규화 적용)
          const rect = anchorNode.getBoundingClientRect();
          const anchorOffsetX = rect.left - containerRect.left;
          const anchorOffsetY = rect.top - containerRect.top;
          
          // anchor 노드의 현재 너비와 기준 너비 비교하여 정규화
          const anchorRefW = sticker.anchor.refW || refW;
          const anchorCurrentWidth = rect.width;
          const anchorScaleRatio = anchorCurrentWidth / anchorRefW;
          
          // localX, localY는 기준 너비 대비 상대 좌표이므로, 현재 anchor 크기에 맞춰 스케일
          offsetX = anchorOffsetX + (sticker.anchor.localX * anchorScaleRatio);
          offsetY = anchorOffsetY + (sticker.anchor.localY * anchorScaleRatio);
        } else if (sticker.positionFallback) {
          // anchor 노드를 찾지 못하면 positionFallback 사용 (정규화 적용)
          // positionFallback의 좌표도 기준 너비 대비로 계산되어 있으므로 스케일 적용
          offsetX = sticker.positionFallback.xPx * scaleRatio;
          offsetY = sticker.positionFallback.yPx * scaleRatio;
        } else {
          // 둘 다 없으면 스킵
          return;
        }

        ctx.save();
        ctx.globalAlpha = sticker.opacity;
        ctx.translate(offsetX, offsetY);
        ctx.rotate(sticker.rotation);
        ctx.scale(sticker.scale, sticker.scale);

        // 이미지 스티커인 경우
        const imageUrl = sticker.content?.imageUrl || sticker.content?.url;
        if (imageUrl) {
          const img = loadedImages.get(sticker.id);
          if (img) {
            // anchor 노드 기준으로 정규화된 비율 계산
            const anchorRefW = sticker.anchor.refW || refW;
            const imageScaleRatio = anchorNode 
              ? (anchorNode.getBoundingClientRect().width / anchorRefW)
              : scaleRatio;
            
            // 크기도 정규화된 비율로 스케일
            const originalWidth = sticker.content?.width || img.width;
            const originalHeight = sticker.content?.height || img.height;
            const scaledWidth = originalWidth * imageScaleRatio;
            const scaledHeight = originalHeight * imageScaleRatio;
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
          }
        }
        // 벡터 드로잉 스티커인 경우 (기존 strokes) - 정규화 적용
        else if (sticker.content && sticker.content.strokes && Array.isArray(sticker.content.strokes)) {
          sticker.content.strokes.forEach(stroke => {
            if (!stroke || !stroke.points || stroke.points.length < 2) return;

            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width * scaleRatio; // 선 두께도 정규화
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            // 첫 번째 점 (정규화된 좌표)
            ctx.moveTo(stroke.points[0].x * scaleRatio, stroke.points[0].y * scaleRatio);
            
            // 나머지 점들 (정규화된 좌표)
            for (let i = 1; i < stroke.points.length; i++) {
              ctx.lineTo(stroke.points[i].x * scaleRatio, stroke.points[i].y * scaleRatio);
            }
            
            ctx.stroke();
          });
        }

        ctx.restore();
      });
    };

    updateCanvasSize();
    
    const handleResize = () => {
      updateCanvasSize();
      drawStickers();
    };

    const handleScroll = () => {
      drawStickers();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    // 초기 그리고, 이미지 로드 후 다시 그리기
    drawStickers();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [stickers, nodeRefs, loadedImages]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ 
        zIndex: 10,
        backgroundColor: 'transparent',
        background: 'transparent'
      }}
      width={0}
      height={0}
    />
  );
};

