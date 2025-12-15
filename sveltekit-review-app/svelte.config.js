// svelte.config.js
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build-static',
      assets: 'build-static',
      precompress: true
    }),
    paths: { base: '' },
    prerender: {
      // ✅ 링크 따라가지 않음. 명시된 것만 렌더
      crawl: false,
      // ✅ 실제 있는 페이지만
      entries: ['/', '/sitemap.xml', '/robots.txt'],
      handleHttpError: ({ status }) => {
        if (status === 404) return; // 링크 잘못 등은 무시
        throw new Error(String(status));
      },
      // 혹시 또 보이지 않는 라우트 경고가 떠도 에러로 죽지 않게
      handleUnseenRoutes: 'ignore'
    }
  }
};
export default config;
