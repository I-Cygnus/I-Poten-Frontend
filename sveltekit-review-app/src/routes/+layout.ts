// src/routes/+layout.ts
export const prerender = true; // 전체를 SSG로 굽기
export const csr = false;      // 레이아웃 레벨에서 클라이언트 JS 비활성화(정적)
