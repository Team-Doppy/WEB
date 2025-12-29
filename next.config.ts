import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 환경에서 cross-origin 요청 허용
  allowedDevOrigins: ['192.168.56.1'],
  
  // .well-known 경로를 API 라우트로 리다이렉트
  async rewrites() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        destination: '/api/.well-known/apple-app-site-association',
      },
      {
        source: '/.well-known/assetlinks.json',
        destination: '/api/.well-known/assetlinks',
      },
    ];
  },
  
  // .well-known 경로를 위한 헤더 설정 (Universal Links / App Links)
  async headers() {
    return [
      {
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  
  // 프로덕션에서 www가 없는 도메인을 www로 리다이렉트
  // 주의: .well-known/* 경로는 vercel.json에서 처리되어 리디렉션되지 않음
  // Next.js의 redirects는 vercel.json의 redirects보다 나중에 적용되므로,
  // vercel.json에서 .well-known 경로를 제외하는 것이 더 확실함
  async redirects() {
    // vercel.json에서 redirects를 처리하므로 여기서는 비활성화
    return [];
  },
};

export default nextConfig;
