import { PUBLIC_BASE_URL } from '$env/static/public';
export const prerender = true;

const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');

export const GET = () => {
    const body = `User-agent: *
Allow: /
Sitemap: ${BASE}/sitemap.xml
`;
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
