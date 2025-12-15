<script lang="ts">
  import favicon from '$lib/assets/jobspoon-icon-white.svg';
  import { PUBLIC_BASE_URL } from '$env/static/public';

  const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');
  const siteName = '잡스푼 | 개발자 면접 준비 플랫폼';
  const siteDesc = 'AI 모의면접 · 면접 스터디 · 기술 용어 학습을 한 곳에서.';
  const siteUrl  = BASE + '/';
  const searchUrl = BASE + '/spoon-word?q={search_term_string}';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${searchUrl}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // 너가 쓰던 Svelte5 children 패턴 그대로 유지
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- 폰트 최적화 -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />

  <!-- Sitelinks SearchBox -->
  <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
</svelte:head>

{@render children?.()}
