import { NextResponse } from 'next/server';

/**
 * Android App Links를 위한 assetlinks.json 파일 제공
 * 
 * 주의사항:
 * 1. sha256_cert_fingerprints를 실제 앱 서명 인증서의 SHA-256 지문으로 교체해야 합니다
 * 2. 디버그 빌드와 프로덕션 빌드의 지문이 다를 수 있습니다
 */
export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.doppy.app',
        sha256_cert_fingerprints: [
          'YOUR_SHA256_CERT_FINGERPRINT_HERE', // TODO: 실제 SHA-256 지문으로 교체 필요
        ],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

