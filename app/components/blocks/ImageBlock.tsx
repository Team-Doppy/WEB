'use client';

import React, { useRef, useEffect } from 'react';
import { ImageNode } from '@/app/types/post.types';
import { useImageError } from '@/app/hooks/useImageError';
import { useSpoiler } from '@/app/hooks/useSpoiler';

interface ImageBlockProps {
  node: ImageNode;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ node }) => {
  const { hasError, handleError } = useImageError();
  const { isRevealed, isScattering, toggleSpoiler, scatterStartTimeRef } = useSpoiler({
    hasSpoiler: !!node.data.spoiler,
  });

  if (hasError) {
    return (
      <div className="my-4 relative">
        <div className="w-full aspect-video bg-[#121212] rounded-lg absolute inset-0"></div>
        <div className="w-full aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-3 border border-gray-700 relative transition-opacity duration-500 opacity-0 animate-fade-in">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</p>
        </div>
        {node.data.hasComments && node.data.commentCount > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <span>💬</span>
            <span>{node.data.commentCount}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="my-4 relative">
      {/* Placeholder - 크기 확보 */}
      <div className="w-full aspect-video bg-[#121212] rounded-lg absolute inset-0"></div>
      
      {/* 실제 콘텐츠 - fade-in 효과 */}
      <div className="relative transition-opacity duration-500 opacity-0 animate-fade-in">
        <img
          src={node.data.url}
          alt=""
          className="w-full rounded-lg"
          loading="lazy"
          style={{ display: 'block' }}
          onError={handleError}
          onLoad={(e) => {
            // 이미지 로드 완료 시 fade-in
            e.currentTarget.parentElement?.classList.remove('opacity-0');
            e.currentTarget.parentElement?.classList.add('opacity-100');
          }}
        />
      
        {/* 스포일러 오버레이 */}
        {node.data.spoiler && !isRevealed && (
          <ImageSpoilerOverlay
            isScattering={isScattering}
            scatterStartTime={scatterStartTimeRef.current}
            onReveal={toggleSpoiler}
          />
        )}

        {/* 댓글 배지 */}
        {node.data.hasComments && node.data.commentCount > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <span>💬</span>
            <span>{node.data.commentCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ImageSpoilerOverlayProps {
  isScattering: boolean;
  scatterStartTime: number;
  onReveal: () => void;
}

const ImageSpoilerOverlay: React.FC<ImageSpoilerOverlayProps> = ({
  isScattering,
  scatterStartTime,
  onReveal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Canvas 크기를 컨테이너에 맞춤
    const updateCanvasSize = () => {
      if (container && canvas) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
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
        const elapsed = Date.now() - scatterStartTime;
        const t = Math.min(elapsed / 520, 1);
        drawScatterEffect(ctx, canvas.width, canvas.height, t);
        
        if (t >= 1) {
          return;
        }
      } else {
        // 일반 파티클 애니메이션 (속도 느리게)
        phase = (phase + 0.005) % 1;
        drawParticles(ctx, canvas.width, canvas.height, phase);
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
  }, [isScattering, scatterStartTime]);

  return (
    <div
      ref={containerRef}
      onClick={onReveal}
      className="absolute inset-0 cursor-pointer"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* 반투명 검은색 오버레이 */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* 파티클 캔버스 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
};

function drawParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number
) {
  const t = phase * Math.PI * 2;
  const area = width * height;
  const count = Math.max(200, Math.floor(area / 1000));

  for (let i = 0; i < count; i++) {
    const seed = i * 12345;
    const rand = seededRandom(seed);

    const baseX = rand() * width;
    const baseY = rand() * height;

    // 훨씬 더 다양한 주파수
    const freq1 = 0.3 + rand() * 4.5;
    const freq2 = 0.5 + rand() * 5.0;
    const freq3 = 0.2 + rand() * 3.5;
    const freq4 = 0.7 + rand() * 2.8;
    
    const phase1 = rand() * Math.PI * 2;
    const phase2 = rand() * Math.PI * 2;
    const phase3 = rand() * Math.PI * 2;
    const phase4 = rand() * Math.PI * 2;

    const ampX = 3.0 + rand() * 8.0;
    const ampY = 4.0 + rand() * 10.0;

    // 매우 복잡한 복합 움직임
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

    // 불규칙한 팝핑
    const popSpeed = 0.8 + rand() * 3.2;
    const popPhase = (t * popSpeed + phase1) % (Math.PI * 2);
    const popPower = 6 + Math.floor(rand() * 5);
    const popEffect = Math.pow(Math.sin(popPhase), popPower) * (1 + rand() * 5);

    // 지터 효과
    const jitterX = (rand() - 0.5) * 1.5;
    const jitterY = (rand() - 0.5) * 2.0;

    let x = baseX + ox + jitterX;
    let y = baseY + oy - popEffect + jitterY;

    x = ((x % width) + width) % width;
    y = ((y % height) + height) % height;

    // 불규칙한 크기 변화
    const sizeFreq = 1.2 + rand() * 4.5;
    const sizeWave = Math.sin(t * sizeFreq + phase2);
    const size = 0.8 + rand() * 1.8 + Math.abs(sizeWave) * 1.5;

    // 불규칙한 투명도
    const opacityFreq = 0.9 + rand() * 3.8;
    const opacityWave = Math.sin(t * opacityFreq + phase3);
    const opacity = (0.5 + rand() * 0.4 + Math.abs(opacityWave) * 0.3) * 0.9;

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
}

function drawScatterEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number
) {
  const easedT = easeOutQuad(t);
  const fade = 1.0 - easeOut(t);
  const area = width * height;
  const count = Math.max(150, Math.floor(area / 1500));
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < count; i++) {
    const seed = i * 9999 + 12345;
    const rand = seededRandom(seed);

    const rx = rand() * width;
    const ry = rand() * height;

    const dirX = rx - cx;
    const dirY = ry - cy;
    const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) + 0.001;
    const nx = dirX / dirLen;
    const ny = dirY / dirLen;

    const speed = 50 + rand() * 100;
    const spiralEffect = Math.sin(easedT * Math.PI * 4 + rand() * Math.PI * 2) * 20;
    const move = easedT * speed;

    const x = rx + nx * move + spiralEffect * Math.cos(easedT * Math.PI * 2);
    const y = ry + ny * move + spiralEffect * Math.sin(easedT * Math.PI * 2);

    const rotation = easedT * Math.PI * 4 * (rand() > 0.5 ? 1 : -1);
    const sz = (0.8 + rand() * 2.0) * (1.0 + 2.0 * (1.0 - easedT));
    const opacity = fade * (0.7 + rand() * 0.3);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
    ctx.restore();
  }
}

function seededRandom(seed: number): () => number {
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

