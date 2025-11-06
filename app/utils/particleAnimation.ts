// 보글보글 끓는 느낌의 파티클 애니메이션

export function drawBubblingParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
  color: string = 'rgba(100, 100, 100, 0.7)'
) {
  const t = phase * Math.PI * 2;
  const area = width * height;
  const count = Math.max(150, Math.floor(area / 100)); // 파티클 수 증가

  for (let i = 0; i < count; i++) {
    const seed = i * 12345;
    const rand = seededRandom(seed);

    // 기본 위치
    const baseX = rand() * width;
    const baseY = rand() * height;

    // 불규칙한 움직임 - 여러 주파수 조합
    const freq1 = 0.8 + rand() * 2.5; // 더 다양한 주파수
    const freq2 = 1.2 + rand() * 3.0;
    const freq3 = 0.5 + rand() * 1.5;
    
    const phase1 = rand() * Math.PI * 2;
    const phase2 = rand() * Math.PI * 2;
    const phase3 = rand() * Math.PI * 2;

    // 큰 진폭으로 보글보글 효과
    const ampX = 3.0 + rand() * 6.0; // 진폭 크게 증가
    const ampY = 4.0 + rand() * 8.0; // 수직 방향 더 크게

    // 복합적인 움직임 (보글보글 끓는 느낌)
    const ox = 
      Math.sin(t * freq1 + phase1) * ampX +
      Math.cos(t * freq2 * 0.7 + phase2) * ampX * 0.5 +
      Math.sin(t * freq3 * 1.3 + phase3) * ampX * 0.3;
    
    const oy = 
      Math.cos(t * freq1 + phase1) * ampY +
      Math.sin(t * freq2 * 0.8 + phase2) * ampY * 0.6 +
      Math.cos(t * freq3 * 1.5 + phase3) * ampY * 0.4;

    // 팝핑 효과 (주기적으로 튀어오름)
    const popPhase = (t * (1.5 + rand() * 2.0) + phase1) % (Math.PI * 2);
    const popEffect = Math.pow(Math.sin(popPhase), 8) * (2 + rand() * 4);

    let x = baseX + ox;
    let y = baseY + oy - popEffect;

    // 경계 처리 (래핑)
    x = ((x % width) + width) % width;
    y = ((y % height) + height) % height;

    // 크기 변화 (보글보글 커졌다 작아졌다)
    const sizeWave = Math.sin(t * (2.0 + rand() * 3.0) + phase2);
    const size = 0.8 + rand() * 1.5 + Math.abs(sizeWave) * 1.2;

    // 투명도 변화
    const opacityWave = Math.sin(t * (1.5 + rand() * 2.5) + phase3);
    const baseOpacity = 0.5 + rand() * 0.4;
    const opacity = baseOpacity + Math.abs(opacityWave) * 0.3;

    // 색상 추출 및 적용
    ctx.fillStyle = color.includes('rgb') 
      ? color.replace(/[\d.]+\)$/g, `${opacity})`)
      : `rgba(100, 100, 100, ${opacity})`;
    
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
}

export function drawBubblingScatterEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  color: string = 'rgba(100, 100, 100, 0.7)'
) {
  const easedT = easeOutQuad(t);
  const fade = 1.0 - easeOut(t);
  const area = width * height;
  const count = Math.max(120, Math.floor(area / 150));
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

    // 더 빠르고 불규칙한 흩어짐
    const speed = 40 + rand() * 80;
    const spiralEffect = Math.sin(easedT * Math.PI * 4 + rand() * Math.PI * 2) * 15;
    const move = easedT * speed;

    const x = rx + nx * move + spiralEffect * Math.cos(easedT * Math.PI * 2);
    const y = ry + ny * move + spiralEffect * Math.sin(easedT * Math.PI * 2);

    // 크기와 회전 효과
    const rotation = easedT * Math.PI * 4 * (rand() > 0.5 ? 1 : -1);
    const sz = (0.8 + rand() * 2.0) * (1.0 + 2.0 * (1.0 - easedT));
    const opacity = fade * (0.6 + rand() * 0.4);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color.includes('rgb')
      ? color.replace(/[\d.]+\)$/g, `${opacity})`)
      : `rgba(100, 100, 100, ${opacity})`;
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

