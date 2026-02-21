import { Metadata } from 'next';

// SEO 메타데이터 (검색엔진용)
export const metadata: Metadata = {
  title: '모의면접 AI - 면접준비 면접연습 면접 잘 보는 법',
  description: '모의면접, AI모의면접으로 면접준비와 면접연습을 완벽하게! 면접 잘 보는 법, 면접 팁, 실전 연습까지 무료 체험. 실시간 AI 피드백으로 합격률 UP',
  keywords: ['모의면접', 'AI모의면접', '면접준비', '면접연습', '면접 잘 보는 법', '모의 면접', '면접 준비', '면접 연습', '면접 팁', 'AI 면접', '면접 피드백', '취업 면접'],
  openGraph: {
    title: '모의면접 AI - 면접준비 면접연습 면접 잘 보는 법 | 아이포텐',
    description: 'AI모의면접으로 면접 잘 보는 법 배우기! 실전 면접연습과 면접준비를 한 번에. 무료 체험 가능',
    url: 'https://i-poten.com/seo',
    siteName: '아이포텐 - 모의면접 AI 플랫폼',
    images: [
      {
        url: '/og-main.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '모의면접 AI - 면접준비 면접연습 면접 잘 보는 법',
    description: 'AI모의면접으로 실전 면접연습! 면접 잘 보는 법과 면접준비를 한 번에',
    images: ['/twitter-main.jpg'],
  },
  alternates: {
    canonical: 'https://i-poten.com/seo',
  },
};

export default function SEOLandingPage() {
  // 검색엔진이 크롤링할 내용 (사용자는 안 봄)
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* 사용자만 즉시 리다이렉트 (검색엔진은 JavaScript 미실행) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace('/');`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: '아이포텐 - 모의면접 AI 플랫폼',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
            description: '모의면접, AI모의면접, 면접준비, 면접연습을 위한 AI 플랫폼. 면접 잘 보는 법을 배우고 실전 연습까지',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
              description: '무료 모의면접 체험',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1234',
            },
          }),
        }}
      />
      
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          <span className="text-blue-600">모의면접 AI</span>로<br />
          면접 잘 보는 법 배우기
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-700 mb-8">
          AI모의면접으로 면접준비와 면접연습을 완벽하게!<br />
          실시간 피드백으로 합격률 UP
        </p>

        <div className="space-y-6 text-left bg-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            아이포텐에서 면접준비 완벽하게
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-2">🎯 AI모의면접</h3>
              <p className="text-gray-700">실전처럼 연습하는 모의면접. AI가 면접관이 되어 실시간으로 질문하고 피드백을 제공합니다.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-2">📚 면접준비 가이드</h3>
              <p className="text-gray-700">면접 잘 보는 법부터 자주 나오는 질문까지. 체계적인 면접준비로 합격률을 높이세요.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-2">💪 면접연습 무제한</h3>
              <p className="text-gray-700">언제 어디서나 면접연습 가능. 반복 연습으로 자신감을 키워보세요.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            면접 잘 보는 법 - 자주 묻는 질문
          </h2>
          
          <div className="space-y-4 text-left">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Q. 모의면접이란 무엇인가요?</h3>
              <p className="text-gray-700">모의면접은 실제 면접 상황을 미리 연습해보는 것입니다. AI모의면접을 통해 실전처럼 면접연습을 할 수 있으며, 즉각적인 피드백으로 개선점을 파악할 수 있습니다.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Q. 면접준비는 어떻게 해야 하나요?</h3>
              <p className="text-gray-700">효과적인 면접준비를 위해서는 ① 자주 나오는 질문 숙지 ② 모의면접으로 실전 연습 ③ 피드백 반영이 중요합니다. 아이포텐의 AI모의면접으로 체계적인 면접준비가 가능합니다.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Q. 면접 잘 보는 법이 있나요?</h3>
              <p className="text-gray-700">면접 잘 보는 법은 ① 충분한 면접연습 ② 자신감 있는 태도 ③ 명확한 답변입니다. AI모의면접으로 반복 연습하면 실전에서도 자신감 있게 면접을 볼 수 있습니다.</p>
            </div>
          </div>
        </div>

        <a 
          href="/" 
          className="inline-block mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          무료 모의면접 시작하기
        </a>
      </div>
    </main>
  );
}
