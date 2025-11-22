'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ImageRowNode } from '@/app/types/post.types';
import { useSpoiler } from '@/app/hooks/useSpoiler';

interface ImageRowBlockProps {
  node: ImageRowNode;
}

export const ImageRowBlock: React.FC<ImageRowBlockProps> = ({ node }) => {
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [imageHeights, setImageHeights] = useState<number[]>([]);
  const [averageHeight, setAverageHeight] = useState<number | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const { isRevealed, isScattering, toggleSpoiler, scatterStartTimeRef } = useSpoiler({
    hasSpoiler: !!node.spoiler,
  });
  
  // 최대 3개까지만 표시
  const urls = node.urls.slice(0, 3);
  const spacing = Math.max(0.5, (node.spacing || 2) * 0.5); // 간격을 절반으로 줄임

  const handleImageError = (index: number) => {
    setErrorIndices(prev => new Set(prev).add(index));
  };

  const handleImageLoad = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const imageContainer = img.parentElement?.parentElement;
    if (!imageContainer) return;

    // 이미지의 자연 비율 사용
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    if (naturalWidth === 0 || naturalHeight === 0) return;
    
    // 컨테이너 너비에 맞춘 높이 계산
    const containerWidth = imageContainer.offsetWidth || imageContainer.clientWidth;
    if (containerWidth === 0) {
      // 컨테이너 너비를 아직 알 수 없으면 다음 프레임에 다시 시도
      setTimeout(() => handleImageLoad(index, e), 0);
      return;
    }
    
    const aspectRatio = naturalWidth / naturalHeight;
    const calculatedHeight = containerWidth / aspectRatio;
    
    setImageHeights(prev => {
      const newHeights = [...prev];
      newHeights[index] = calculatedHeight;
      
      // 모든 이미지가 로드되었는지 확인
      if (newHeights.length === urls.length && newHeights.every(h => h > 0 && !isNaN(h))) {
        // 평균 높이 계산
        const avg = newHeights.reduce((sum, h) => sum + h, 0) / newHeights.length;
        setAverageHeight(avg);
      }
      
      return newHeights;
    });

    // fade-in 효과
    const fadeContainer = img.parentElement;
    if (fadeContainer) {
      fadeContainer.classList.remove('opacity-0');
      fadeContainer.classList.add('opacity-100');
    }
  };
  
  return (
    <div 
      className="my-4 grid relative"
      style={{ 
        gridTemplateColumns: `repeat(${urls.length}, 1fr)`,
        gap: `${spacing}px`,
        ...(averageHeight ? { height: `${averageHeight}px` } : {})
      }}
    >
      {urls.map((url, index) => (
        <div 
          key={index} 
          className="relative overflow-hidden bg-black"
          style={averageHeight ? { height: `${averageHeight}px` } : {}}
        >
          {errorIndices.has(index) ? (
            <div className="absolute inset-0 w-full h-full bg-gray-800 flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ) : (
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 animate-fade-in">
              <img
                ref={(el) => { imageRefs.current[index] = el; }}
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                style={{ display: 'block' }}
                onError={() => handleImageError(index)}
                onLoad={(e) => handleImageLoad(index, e)}
              />
            </div>
          )}
        </div>
      ))}

      {/* 스포일러 오버레이 */}
      {node.spoiler && (!isRevealed || isScattering) && (
        <ImageSpoilerOverlay
          isScattering={isScattering}
          scatterStartTime={scatterStartTimeRef.current}
          onReveal={toggleSpoiler}
        />
      )}
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
      <div className="absolute inset-0 bg-black/10" />
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

    const popSpeed = 0.8 + rand() * 3.2;
    const popPhase = (t * popSpeed + phase1) % (Math.PI * 2);
    const popPower = 6 + Math.floor(rand() * 5);
    const popEffect = Math.pow(Math.sin(popPhase), popPower) * (1 + rand() * 5);

    const jitterX = (rand() - 0.5) * 1.5;
    const jitterY = (rand() - 0.5) * 2.0;

    let x = baseX + ox + jitterX;
    let y = baseY + oy - popEffect + jitterY;

    x = ((x % width) + width) % width;
    y = ((y % height) + height) % height;

    const sizeFreq = 1.2 + rand() * 4.5;
    const sizeWave = Math.sin(t * sizeFreq + phase2);
    const size = 0.8 + rand() * 1.8 + Math.abs(sizeWave) * 1.5;

    const opacityFreq = 0.9 + rand() * 3.8;
    const opacityWave = Math.sin(t * opacityFreq + phase3);
    const opacity = Math.min(1.0, 0.7 + rand() * 0.3 + Math.abs(opacityWave) * 0.3);

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

    // 사방으로 터지는 듯한 강한 효과
    const speed = 80 + rand() * 120; // 더 빠르게
    const spiralEffect = Math.sin(easedT * Math.PI * 6 + rand() * Math.PI * 2) * 30; // 더 강한 나선 효과
    const move = easedT * speed;
    
    // 사방으로 터지는 효과를 위한 추가 방향성
    const angle = Math.atan2(ny, nx) + (rand() - 0.5) * 0.5;
    const spreadX = Math.cos(angle) * move;
    const spreadY = Math.sin(angle) * move;

    const x = rx + spreadX + spiralEffect * Math.cos(easedT * Math.PI * 3);
    const y = ry + spreadY + spiralEffect * Math.sin(easedT * Math.PI * 3);

    const rotation = easedT * Math.PI * 6 * (rand() > 0.5 ? 1 : -1); // 더 빠른 회전
    const sz = (1.0 + rand() * 2.0) * (1.0 + 2.5 * (1.0 - easedT)); // 더 큰 파티클
    const opacity = fade * (0.8 + rand() * 0.2); // 더 또렷하게

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

