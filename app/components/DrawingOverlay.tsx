'use client';

import React, { useRef, useEffect } from 'react';
import { Sticker } from '@/app/types/post.types';

interface DrawingOverlayProps {
  stickers: Sticker[];
  nodeRefs: Map<string, HTMLElement>;
}

export const DrawingOverlay: React.FC<DrawingOverlayProps> = ({ stickers, nodeRefs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // 스티커 그리기
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

      // 각 stroke 그리기
      sticker.content.strokes.forEach(stroke => {
        if (stroke.points.length < 2) return;

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

      ctx.restore();
    });

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [stickers, nodeRefs]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
};

