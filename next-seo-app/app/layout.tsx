import type { Metadata } from "next";
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
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '아이포텐 AI 면접',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '모의면접 AI - 면접준비 면접연습 완벽 가이드',
    description: 'AI모의면접으로 면접 잘 보는 법 배우기! 실전 면접연습과 면접준비를 한 번에',
    images: ['/twitter-image.jpg'],
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
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // other: 'your-other-verification-code',
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
