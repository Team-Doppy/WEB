import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // .well-known 경로는 리다이렉트하지 않음
  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  // 프로덕션 환경에서만 리다이렉트
  if (process.env.NODE_ENV === 'production') {
    // doppy.app (www 없음)을 www.doppy.app으로 리다이렉트
    if (hostname === 'doppy.app') {
      const url = request.nextUrl.clone();
      url.hostname = 'www.doppy.app';
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

