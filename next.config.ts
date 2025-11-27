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
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'doppy.app', // www 없는 도메인
            },
          ],
          destination: 'https://www.doppy.app/:path*',
          permanent: true,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
