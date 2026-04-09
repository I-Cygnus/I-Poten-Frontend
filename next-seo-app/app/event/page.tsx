import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '리뷰 이벤트 - 최대 6,000P 혜택',
  description: '아이포텐 AI 면접 리뷰를 작성하고 최대 6,000P 포인트를 받으세요! 텍스트 리뷰 500P, 포토 리뷰 1,000P, 베스트 리뷰 5,000P',
  keywords: ['리뷰 이벤트', 'AI 면접 후기', '포인트 적립', '베스트 리뷰'],
  openGraph: {
    title: '리뷰 이벤트 - 최대 6,000P 혜택 | 아이포텐',
    description: '아이포텐 AI 면접 리뷰를 작성하고 최대 6,000P 포인트를 받으세요!',
    url: 'https://i-poten.com/event',
    siteName: '아이포텐',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '리뷰 이벤트 - 최대 6,000P 혜택',
    description: '아이포텐 AI 면접 리뷰를 작성하고 최대 6,000P를 받으세요!',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://i-poten.com/event',
  },
};

export default function EventPage() {
  // TODO: EventPage.tsx 컴포넌트 내용을 여기로 마이그레이션
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: '아이포텐 리뷰 이벤트',
            description: '리뷰 작성하고 최대 6,000P 혜택 받기',
            startDate: '2026-02-01',
            endDate: '2026-12-31',
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
            location: {
              '@type': 'VirtualLocation',
              url: 'https://i-poten.com/event',
            },
            organizer: {
              '@type': 'Organization',
              name: '아이포텐',
              url: 'https://i-poten.com',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
      
      <h1>리뷰 이벤트 페이지</h1>
      <p>EventPage.tsx의 컨텐츠를 여기로 마이그레이션 필요</p>
    </main>
  );
}
