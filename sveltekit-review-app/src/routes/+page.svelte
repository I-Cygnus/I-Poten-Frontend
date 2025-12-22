<!-- sveltekit-review-app/src/routes/+page.svelte -->
<script lang="ts">
  import { PUBLIC_BASE_URL } from '$env/static/public';

  const BASE  = PUBLIC_BASE_URL.replace(/\/+$/, '');
  const title = '잡스푼 | AI 인터뷰 · 면접 스터디 · 기술 용어 학습';
  const desc  = '개발자 면접 준비 올인원: AI 모의면접, 오프라인/온라인 면접 스터디, 기술 용어 학습/정리.';
  const url   = `${BASE}/`;
  const imgOg = `${BASE}/og/home-hero.png`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={desc} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={desc} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={imgOg} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={imgOg} />

  <link rel="modulepreload" href="/boot-host.js" />
  <script type="module" src="/boot-host.js" defer></script>
</svelte:head>

<main id="seo-content">
  <!-- 리액트 마운트 타깃 -->
  <div id="app"></div>

  <!-- JS 꺼짐/봇 전용 텍스트 -->
  <noscript>
    <h1>잡스푼 — 개발자 면접 준비 플랫폼</h1>
    <p>AI 모의면접 · 면접 스터디 · 기술 용어 학습</p>
  </noscript>
</main>

<style>
  /* ✅ JS가 켜져 있으면 SEO 문구는 절대 안 보임 */
  .js #seo-content > :not(#app) { display: none !important; }

  /* (선택) 첫 페인트 높이 확보해서 레이아웃 점프 방지 */
  #app { min-height: 60vh; }
</style>
