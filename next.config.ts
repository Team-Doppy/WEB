import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 환경에서 cross-origin 요청 허용
  allowedDevOrigins: ['192.168.56.1'],
  
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
