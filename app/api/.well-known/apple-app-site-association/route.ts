import { NextResponse } from 'next/server';

/**
 * iOS Universal Links를 위한 apple-app-site-association 파일 제공
 * 
 * 주의사항:
 * 1. TEAM_ID를 실제 Apple Developer Team ID로 교체해야 합니다
 * 2. 파일은 application/json Content-Type으로 제공되어야 합니다
 * 3. 파일 확장자가 없어야 합니다 (apple-app-site-association)
 */
export async function GET() {
  const association = {
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAM_ID.com.doppy.app', // TODO: 실제 Team ID로 교체 필요
          paths: ['*'], // 모든 경로에서 앱 열기
        },
      ],
    },
  };

  return NextResponse.json(association, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

