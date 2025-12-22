// vite.mf.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { federation } from '@module-federation/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        federation({
            name: 'svelteKitReviewApp',
            filename: 'remoteEntry.js',
            exposes: {
                './App': './src/lib/index.ts',     // ⬅️ 기본 진입
                './mount': './src/mf/boot.ts'      // (옵션) 함수형 마운트도 노출
            },
            shared: {} // 교차 번들 공유 비활성(가장 안전)
        }),
        svelte({
            compilerOptions: {
                compatibility: { componentApi: 4 }  // ⬅️ 이 줄
            }
        })
    ],
    resolve: {
        dedupe: ['svelte'],
        alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) }
    },
    server: { port: 5174, strictPort: true, host: true, cors: true, headers: { 'Access-Control-Allow-Origin': '*' } },
    build: { target: 'esnext', modulePreload: false, outDir: 'dist/mf' },
    optimizeDeps: { exclude: ['svelte'] }
});
