import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://i-poten.com'),
  title: {
    default: '모의면접 AI 플랫폼 - 면접준비 면접연습 | 아이포텐',
    template: '%s | 아이포텐'
  },
  description: '모의면접, AI모의면접, 면접준비, 면접연습을 한 곳에서! 면접 잘 보는 법부터 실전 연습까지 무료 체험 가능. 실시간 피드백으로 합격률 UP',
  keywords: ['모의면접', 'AI모의면접', '면접준비', '면접연습', '면접 잘 보는 법', 'AI 면접', '모의 면접', '면접 준비', '면접 연습', '취업 면접', '면접 피드백', '면접 팁'],
  authors: [{ name: 'I-Poten' }],
  creator: 'I-Poten',
  publisher: 'I-Poten',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://i-poten.com',
    siteName: '아이포텐 - 모의면접 AI 플랫폼',
    title: '모의면접 AI - 면접준비 면접연습 완벽 가이드 | 아이포텐',
    description: 'AI모의면접으로 면접 잘 보는 법 배우기! 실전 면접연습과 면접준비를 한 번에. 무료 체험 가능',

    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '아이포텐(I-Poten) AI 모의면접 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '모의면접 AI - 면접준비 면접연습 완벽 가이드',
    description: 'AI모의면접으로 면접 잘 보는 법 배우기! 실전 면접연습과 면접준비를 한 번에',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'o0o1Ivm-YjGjDmKFMj-gbDOwzST0cdhUqwZDpHPJDqE',
  },
  other: {
    'naver-site-verification': '59468e0734f05078034054197b0e2e096be5d411',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NDTT7V79');
        `}} />
        {/* SEO 랜딩 페이지뷰 */}
        <Script id="gtm-seo-pageview" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'seo_landing_viewed',
            event_category: 'system',
            event_action: 'page_view',
            page_path: window.location.pathname,
            page_title: document.title || 'SEO Landing',
            page_section: 'next-seo-app',
            login_status: 'guest'
          });
        `}} />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NDTT7V79"
          height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
        {children}
      </body>
    </html>
  );
}
