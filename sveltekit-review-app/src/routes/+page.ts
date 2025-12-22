// src/routes/+page.ts
export const prerender = true; // 홈도 SSG
export const csr = false;      // 홈 페이지 자체도 JS 비활성화 (SEO/LCP 유리)
