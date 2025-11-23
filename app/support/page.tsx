import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support - Doppy',
  description: 'Doppy 지원 페이지 - 문의사항이 있으시면 app.doppy@gmail.com으로 연락해주세요.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* 모바일: 전체 너비 + 하단 네비게이션 패딩, 데스크톱: 사이드바 너비만큼 왼쪽 마진 */}
      <main className="ml-0 lg:ml-64 transition-all duration-150 pb-16 lg:pb-0">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-[30px] lg:pt-16 pb-12 px-4 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            {/* 제목 */}
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-8 lg:mb-12">
              Doppy Support
            </h1>

            {/* 설명 텍스트 */}
            <div className="space-y-6 lg:space-y-8 max-w-2xl">
              <p className="text-gray-300 text-base md:text-lg lg:text-xl leading-relaxed">
                If you have questions or need assistance, please contact us at:
              </p>

              {/* 이메일 링크 */}
              <div className="pt-4">
                <a
                  href="mailto:app.doppy@gmail.com"
                  className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-base md:text-lg font-medium"
                >
                  app.doppy@gmail.com
                </a>
              </div>

              {/* 하단 메시지 */}
              <p className="text-gray-400 text-sm md:text-base lg:text-lg pt-4">
                We will get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

