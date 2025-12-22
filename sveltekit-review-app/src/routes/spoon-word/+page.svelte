<script lang="ts">
  import { PUBLIC_BASE_URL } from '$env/static/public';
  export const prerender = true;
  export const csr = false;

  const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');
  const title = '기술 용어 학습 | 면접 대비 키워드 정리 · 개인 보관함';
  const desc  = '면접에서 자주 나오는 기술 용어를 검색/정리하고, 내 보관함에 저장해 반복 학습하세요.';
  const url   = `${BASE}/spoon-word`;
  const img   = `${BASE}/og/spoon-word.png`;

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '기술 용어 학습',
    description: desc,
    url
  };
</script>

<svelte:head>
  <link rel="preload" as="image" href="/og/spoon-word.avif" fetchpriority="high" />
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
</svelte:head>

<main>
  <h1>기술 용어 학습</h1>
  <p>면접 핵심 키워드를 빠르게 찾아보고, 내 보관함에 저장해 반복 학습하세요.</p>

  <form action="/spoon-word" method="get">
    <input name="q" placeholder="예: 트랜잭션, CAP, 가비지 컬렉션" />
    <button type="submit">검색</button>
  </form>

  <p><a href="/vue-ai-interview/ai-interview/select?utm_source=seo&utm_medium=spoon-word">AI 모의면접으로 연결 →</a></p>

  <picture>
    <source srcset="/og/spoon-word.avif" type="image/avif" />
    <source srcset="/og/spoon-word.webp" type="image/webp" />
    <img src="/og/spoon-word.webp" alt="기술 용어 학습 미리보기"
         width="1200" height="630" fetchpriority="high" decoding="async"
         style="max-width:100%;height:auto" />
  </picture>
</main>
