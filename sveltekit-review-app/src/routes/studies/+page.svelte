<script lang="ts">
  import { PUBLIC_BASE_URL } from '$env/static/public';
  export const prerender = true;
  export const csr = false;

  const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');
  const title = '면접 스터디 | 온·오프라인 모임 개설 · 참가 · 일정 관리';
  const desc  = '지역/온라인 조건으로 면접 스터디를 만들고, 참가하고, 일정/공지 관리로 실전 감각을 끌어올리세요.';
  const url   = `${BASE}/studies`;
  const img   = `${BASE}/og/studies.png`;

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '면접 스터디',
    description: desc,
    url
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '오프라인/온라인 모두 가능한가요?',
        acceptedAnswer: { '@type': 'Answer', text: '예. 지역 기반 오프라인, 온라인(화상) 둘 다 지원합니다.' }
      },
      {
        '@type': 'Question',
        name: '참가 조건이나 인원 제한이 있나요?',
        acceptedAnswer: { '@type': 'Answer', text: '모임장 설정에 따라 다르며, 상세 페이지에서 확인할 수 있습니다.' }
      }
    ]
  };
</script>

<svelte:head>
  <link rel="preload" as="image" href="/og/studies.avif" fetchpriority="high" />
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
  <script type="application/ld+json">{JSON.stringify(collectionJsonLd)}</script>
  <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
</svelte:head>

<main>
  <h1>면접 스터디</h1>
  <ul>
    <li>모임 개설(지역/온라인)</li>
    <li>참가 신청/승인/공지</li>
    <li>일정 관리 · 모의면접 진행</li>
  </ul>

  <p><a href="/studies/guide">운영 가이드 →</a></p>
  <p><a href="/vue-ai-interview/ai-interview/select?utm_source=seo&utm_medium=studies">AI 모의면접 바로가기 →</a></p>

  <picture>
    <source srcset="/og/studies.avif" type="image/avif" />
    <source srcset="/og/studies.webp" type="image/webp" />
    <img src="/og/studies.webp" alt="면접 스터디 미리보기"
         width="1200" height="630" fetchpriority="high" decoding="async"
         style="max-width:100%;height:auto" />
  </picture>
</main>
