import { PUBLIC_BASE_URL } from '$env/static/public';
export const prerender = true;

if (!PUBLIC_BASE_URL) throw new Error('PUBLIC_BASE_URL is required');
const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');

const URLS = [
    '/',
    '/ai-interview', '/ai-interview/guide', '/ai-interview/faq',
    '/studies',
    '/spoon-word'
];

const join = (base: string, p: string) => (p === '/' ? base + '/' : base + (p.startsWith('/') ? p : `/${p}`));
const xml = (items: string) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;

export const GET = () => {
    const now = new Date().toISOString();
    const items = URLS.map(
        (p) => `<url><loc>${join(BASE, p)}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`
    ).join('\n');
    return new Response(xml(items), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
