<script lang="ts">
  import { PUBLIC_BASE_URL } from '$env/static/public';
  export const prerender = true;
  export const csr = false;

  const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');
  const title = 'AI 인터뷰 | 실전형 모의면접 · 실시간 피드백 · 기록 관리';
  const desc  = '개발자 면접 준비를 위한 AI 모의면접. 직무/경험 기반 질문, 실시간 피드백, 답변 기록 관리로 합격률을 높이세요.';
  const url   = `${BASE}/ai-interview`;
  const img   = `${BASE}/og/ai-interview.png`;

  // Product-like 표현(SoftwareApplication) + FAQ
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '잡스푼 AI 인터뷰',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description: desc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '137' }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'AI 인터뷰는 무료인가요?',
        acceptedAnswer: { '@type': 'Answer', text: '기본 기능은 무료이며, 고급 기능은 유료입니다.' }
      },
      {
        '@type': 'Question',
        name: '실제 면접처럼 연습할 수 있나요?',
        acceptedAnswer: { '@type': 'Answer', text: '실전형 질문/시간 제한/후속 질문으로 실제와 유사한 환경을 제공합니다.' }
      }
    ]
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'AI 인터뷰', item: url }
    ]
  };
</script>

<svelte:head>
  <link rel="preload" as="image" href="/og/ai-interview.avif" fetchpriority="high" />
  <title>{title}</title>
  <meta name="description" content={desc} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={desc} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={img} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={img} />
  <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
  <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
  <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
</svelte:head>

<main>
  <h1>AI 인터뷰</h1>
  <p>실전형 모의면접으로 답변을 연습하고, AI 피드백으로 빠르게 개선하세요.</p>

  <h2>주요 기능</h2>
  <ul>
    <li>직무·경험 기반 질문 생성</li>
    <li>실시간 답변 피드백 및 모범 답안</li>
    <li>답변 기록 저장 및 개선 추적</li>
  </ul>

  <p><a href="/ai-interview/guide">사용 가이드 →</a></p>
  <p><a href="/ai-interview/faq">FAQ →</a></p>
  <p><a href="/vue-ai-interview/ai-interview/select?utm_source=seo&utm_medium=landing">지금 시작하기 →</a></p>

  <!-- 히어로 (LCP 최적화) -->
  <picture>
    <source srcset="/og/ai-interview.avif" type="image/avif" />
    <source srcset="/og/ai-interview.webp" type="image/webp" />
    <img src="/og/ai-interview.webp" alt="AI 인터뷰 미리보기"
         width="1200" height="630" fetchpriority="high" decoding="async"
         style="max-width:100%;height:auto" />
  </picture>
</main>
