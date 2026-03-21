<script lang="ts">
  import { PUBLIC_BASE_URL } from '$env/static/public';

  const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');
  const siteName = '아이포텐(I-Poten) | AI 모의면접 · 면접 준비 플랫폼';
  const siteDesc = 'AI 모의면접, 기술 면접 준비, IT 용어 학습을 한 곳에서. 아이포텐과 함께 취업 준비를 시작하세요.';
  const siteUrl  = BASE + '/';
  const ogImage  = BASE + '/og-image.png';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl
  };

  // 너가 쓰던 Svelte5 children 패턴 그대로 유지
  let { children } = $props();
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:site_name" content="아이포텐(I-Poten)" />
  <meta property="og:image" content={ogImage} />
  <meta property="og:locale" content="ko_KR" />

  <!-- 폰트 최적화 -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />

  <!-- Sitelinks SearchBox -->
  <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
</svelte:head>

{@render children?.()}
