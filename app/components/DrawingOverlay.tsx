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
    const totalImages = stickers.filter(s => s.content?.imageUrl).length;

    if (totalImages === 0) {
      setLoadedImages(new Map());
      return;
    }

    stickers.forEach(sticker => {
      if (sticker.content?.imageUrl) {
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
        img.src = sticker.content.imageUrl;
      }
    });
  }, [stickers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.scrollWidth;
        canvas.height = container.scrollHeight;
      }
    };

    const drawStickers = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stickers.forEach(sticker => {
        const anchorNode = nodeRefs.get(sticker.anchor.nodeId);
        if (!anchorNode) return;

        const rect = anchorNode.getBoundingClientRect();
        const containerRect = canvas.parentElement?.getBoundingClientRect();
        if (!containerRect) return;

        const offsetX = rect.left - containerRect.left + sticker.anchor.localX;
        const offsetY = rect.top - containerRect.top + sticker.anchor.localY;

        ctx.save();
        ctx.globalAlpha = sticker.opacity;
        ctx.translate(offsetX, offsetY);
        ctx.rotate(sticker.rotation);
        ctx.scale(sticker.scale, sticker.scale);

        // 이미지 스티커인 경우
        if (sticker.content?.imageUrl) {
          const img = loadedImages.get(sticker.id);
          if (img) {
            ctx.drawImage(img, 0, 0);
          }
        }
        // 벡터 드로잉 스티커인 경우 (기존 strokes)
        else if (sticker.content && sticker.content.strokes && Array.isArray(sticker.content.strokes)) {
          sticker.content.strokes.forEach(stroke => {
            if (!stroke || !stroke.points || stroke.points.length < 2) return;

            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            
            for (let i = 1; i < stroke.points.length; i++) {
              ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            
            ctx.stroke();
          });
        }

        ctx.restore();
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    drawStickers();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [stickers, nodeRefs, loadedImages]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
};

