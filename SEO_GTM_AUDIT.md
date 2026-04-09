# SEO & GTM 구현 감사 보고서

> **감사일**: 2026-03-21  
> **대상**: I-Poten-Frontend 모노레포 전체  
> **GTM Container**: `GTM-NDTT7V79`  
> **GA4 Measurement ID**: `G-1JQVP9QNZQ`

---

## 1. 앱별 SEO 메타태그 감사

### 1-1. main-container (`index.html`)

| 항목 | 상태 | 값/위치 |
|---|:---:|---|
| `lang="ko"` | ✅ | `<html lang="ko">` |
| `<title>` | ✅ | 아이포텐(I-Poten) \| AI 모의면접 · 면접 준비 플랫폼 |
| `<meta description>` | ✅ | AI 모의면접, 기술 면접 준비... |
| `<meta keywords>` | ✅ | AI 모의면접, 면접 준비, 기술면접... |
| Google 인증 | ✅ | `o0o1Ivm-YjGjDmKFMj-gbDOwzST0cdhUqwZDpHPJDqE` |
| Naver 인증 | ✅ | `59468e0734f05078034054197b0e2e096be5d411` |
| Open Graph (7개) | ✅ | type, title, description, image, url, site_name, locale |
| Twitter Card | ✅ | summary_large_image + title, description, image |
| Canonical | ✅ | `https://i-poten.com` |
| Favicon | ✅ | `/favicon.png` |
| Apple Touch Icon | ✅ | `/favicon.png` |
| noindex (SPA 하위) | ✅ | `App.tsx`에서 `/vue-account`, `/vue-ai-interview`, `/mypage`, `/sveltekit-review`, `/learning/` 에 동적 적용 |

### 1-2. next-seo-app (`app/layout.tsx`)

| 항목 | 상태 | 값/위치 |
|---|:---:|---|
| `lang="ko"` | ✅ | `<html lang="ko">` |
| Title (template) | ✅ | `%s \| 아이포텐` |
| Description | ✅ | 모의면접, AI모의면접, 면접준비... |
| Keywords (12개) | ✅ | 모의면접, AI모의면접, 면접준비... |
| authors/creator/publisher | ✅ | I-Poten |
| Google 인증 | ✅ | `verification.google` |
| Naver 인증 | ✅ | `other['naver-site-verification']` |
| Open Graph | ✅ | type, locale, url, siteName, title, description, images |
| Twitter Card | ✅ | summary_large_image |
| robots | ✅ | index: true, follow: true, googleBot 설정 |
| Favicon | ✅ | `/favicon.png` |
| OG Image (layout) | ✅ | `/og-image.png` (1200x630) |

#### next-seo-app 개별 페이지

| 페이지 | metadata | JSON-LD | canonical | 문제 |
|---|:---:|:---:|:---:|---|
| `/` (page.tsx) | ✅ | ✅ WebApplication | ✅ | ⚠️ OG image: `/og-main.jpg` (파일 없음) |
| `/seo` (seo/page.tsx) | ✅ | ✅ WebApplication | ✅ | ⚠️ OG image: `/og-main.jpg` (파일 없음) |
| `/event` (event/page.tsx) | ✅ | ✅ Event | ✅ | ⚠️ OG image: `/og-event.jpg` (파일 없음), JSON-LD에 `yourdomain.com` 잔존 |

### 1-3. sveltekit-review-app

| 항목 | 상태 | 위치 |
|---|:---:|---|
| `lang="ko"` | ✅ | `app.html` |
| Google 인증 | ✅ | `app.html` |
| Naver 인증 | ✅ | `app.html` |
| Favicon | ✅ | `app.html` (`%sveltekit.assets%/favicon.png`) |
| `prerender=true, csr=false` | ✅ | `+layout.ts` (전역), `ai-interview/+page.ts` (페이지별) |

#### sveltekit-review-app 개별 페이지

| 페이지 | title | description | canonical | OG | Twitter | JSON-LD |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `/` (+page.svelte) | ✅ | ✅ | ✅ | ✅ | ✅ | — (layout에서 WebSite) |
| `/ai-interview` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ SoftwareApplication + FAQPage + BreadcrumbList |
| `+layout.svelte` | — | — | — | ✅ | — | ✅ WebSite |

### 1-4. sitemap.xml & robots.txt

| 파일 | 소스 | nginx 서빙 | 내용 |
|---|---|:---:|---|
| **`/sitemap.xml`** (next-seo-app) | `next-seo-app/public/sitemap.xml` | ✅ 서빙됨 | `/seo`, `/event` (2개 URL) |
| **`/sitemap.xml`** (sveltekit) | `sveltekit-review-app` SSG 빌드 | ❌ 서빙 안 됨 | `/`, `/ai-interview` (2개 URL) |
| **`/robots.txt`** (next-seo-app) | `next-seo-app/public/robots.txt` | ✅ 서빙됨 | Allow: /, Disallow: SPA 경로, Sitemap 참조 |
| **`/robots.txt`** (sveltekit) | `sveltekit-review-app` SSG 빌드 | ❌ 서빙 안 됨 | Allow: /, Sitemap 참조 |

### 1-5. 에셋 파일 존재 확인

| 파일 | main-container | next-seo-app | sveltekit-review-app |
|---|:---:|:---:|:---:|
| `favicon.png` | ✅ | ✅ | ✅ |
| `og-image.png` | ✅ | ✅ | ✅ |

---

## 2. GTM 구현 감사

### 2-1. GTM 스니펫 (컨테이너 로딩)

| 앱 | `<head>` 스니펫 | `<body>` noscript | Container ID |
|---|:---:|:---:|---|
| main-container (`index.html`) | ✅ | ✅ | GTM-NDTT7V79 |
| next-seo-app (`layout.tsx`) | ✅ (Script component) | ✅ | GTM-NDTT7V79 |
| sveltekit-review-app (`app.html`) | ✅ | ✅ | GTM-NDTT7V79 |

### 2-2. dataLayer 이벤트 추적

| 앱 | 이벤트 | 트리거 | page_section | login_status | 안전처리 |
|---|---|---|---|:---:|:---:|
| **main-container** (`App.tsx`) | `page_view` | React `useEffect` on location change | `main-container` | ✅ | ✅ try/catch |
| **vue-account-app** (`router.ts`) | `page_view` | Vue `router.afterEach` | `vue-account-app` | ✅ | ✅ try/catch |
| **vue-ai-interview-app** (`router.ts`) | `page_view` | Vue `router.afterEach` | `vue-ai-interview-app` | ✅ | ✅ try/catch |
| **next-seo-app** (`layout.tsx`) | `seo_landing_viewed` | Script afterInteractive | `next-seo-app` | ✅ (guest) | ✅ |
| **sveltekit-review-app** (`app.html`) | `seo_landing_viewed` | 인라인 스크립트 (csr=false) | `sveltekit-review-app` | ✅ (guest) | ✅ |

### 2-3. dataLayer 이벤트 스키마 (공통)

```
{
  event: "page_view" | "seo_landing_viewed",
  event_category: "system",
  event_action: "page_view",
  page_path: string,       // 현재 경로 (prefix 포함)
  page_title: string,      // document.title
  page_section: string,    // 앱 식별자
  login_status: "logged_in" | "guest"
}
```

### 2-4. analytics 패키지 (`packages/analytics`)

| 항목 | 상태 |
|---|:---:|
| `pushGtmEvent()` 유틸 | ✅ |
| `pushPageView()` 헬퍼 | ✅ |
| login_status 자동 감지 | ✅ |
| userId 해시 (프라이버시) | ✅ |
| try/catch 안전처리 | ✅ |
| TypeScript 타입 선언 | ✅ |
| package.json 설정 | ✅ |

> **참고**: Vue/React 앱에서 현재 `pushPageView()` 유틸을 import하지 않고 직접 `window.dataLayer.push()`를 사용 중. 기능적으로 동일하나, 향후 유틸로 통일하면 코드 일관성 향상.

---

## 3. 빌드 & 배포 체인 감사

### 3-1. Dockerfile

| 단계 | 상태 | 내용 |
|---|:---:|---|
| sveltekit-review-app package.json COPY | ✅ | line 35 |
| workspace에 포함 | ✅ | 루트 package.json `workspaces` |
| `PUBLIC_BASE_URL` 환경변수 | ✅ | `ENV PUBLIC_BASE_URL=https://i-poten.com` |
| `PATH` 설정 | ✅ | `/app/node_modules/.bin` 추가 |
| SSG 빌드 (postbuild:ssg 우회) | ✅ | `rimraf && sync && vite build` 직접 실행 |
| build-static → nginx COPY | ✅ | `/usr/share/nginx/html/sveltekit-review-app` |

### 3-2. nginx.conf

| 경로 | 소스 | 방식 | 상태 |
|---|---|---|:---:|
| `= /sitemap.xml` | next-seo-app | exact match | ✅ |
| `= /robots.txt` | next-seo-app | exact match | ✅ |
| `/seo` | next-seo-app | prefix match | ✅ |
| `/event` | next-seo-app | prefix match | ✅ |
| `= /ai-interview` | sveltekit-review-app | exact match | ✅ |
| `= /og-image.png` | sveltekit-review-app | exact match | ✅ |
| `/` (fallback) | html-container (React SPA) | prefix match | ✅ |

### 3-3. SvelteKit 설정

| 항목 | 값 | 상태 |
|---|---|:---:|
| adapter | `@sveltejs/adapter-static` | ✅ |
| output dir | `build-static` | ✅ |
| prerender entries | `/, /ai-interview, /sitemap.xml, /robots.txt` | ✅ |
| crawl | `false` | ✅ |
| handleHttpError 404 | ignore | ✅ |

---

## 4. 발견된 문제점

### 🔴 수정 권장 (SEO에 직접 영향)

#### 4-1. sitemap.xml 불완전 — 메인 URL 누락

**현재 상태**: nginx가 `next-seo-app/public/sitemap.xml`을 서빙하며, 여기엔 `/seo`와 `/event`만 포함.  
**문제**: 가장 중요한 `/`(홈)과 `/ai-interview` URL이 sitemap에 없음.  
**영향**: Google이 주요 페이지를 색인하는 데 불리.

```
현재 sitemap (next-seo-app):    누락된 URL:
/seo                             /          ← 홈페이지
/event                           /ai-interview ← SEO 랜딩
```

**해결**: `next-seo-app/public/sitemap.xml`에 `/`와 `/ai-interview` 추가.

#### 4-2. next-seo-app 개별 페이지 OG 이미지 경로 오류

| 파일 | 현재 값 | 실제 존재하는 파일 |
|---|---|---|
| `page.tsx` OG | `/og-main.jpg` | `/og-image.png` |
| `page.tsx` Twitter | `/twitter-main.jpg` | `/og-image.png` |
| `seo/page.tsx` OG | `/og-main.jpg` | `/og-image.png` |
| `seo/page.tsx` Twitter | `/twitter-main.jpg` | `/og-image.png` |
| `event/page.tsx` OG | `/og-event.jpg` | `/og-image.png` |
| `event/page.tsx` Twitter | `/twitter-event.jpg` | `/og-image.png` |

**영향**: 소셜 미디어 공유 시 썸네일이 안 보임 (카카오톡, 슬랙, 트위터 등).  
**참고**: `layout.tsx`의 OG image (`/og-image.png`)가 있으나, 페이지별 metadata가 layout을 override하므로 잘못된 경로가 적용됨.

#### 4-3. event 페이지 JSON-LD에 `yourdomain.com` 잔존

`next-seo-app/app/event/page.tsx` line 52, 57에 `https://yourdomain.com`이 남아있음.  
→ `https://i-poten.com`으로 변경 필요.

### 🟡 개선 권장 (기능에 영향 없음)

#### 4-4. ai-interview 페이지에서 존재하지 않는 하위 경로 링크

`sveltekit-review-app/src/routes/ai-interview/+page.svelte`에서:
- `/ai-interview/guide` → 라우트 파일 없음
- `/ai-interview/faq` → 라우트 파일 없음

클릭 시 SPA fallback(React)으로 처리되어 빈 페이지가 나올 수 있음.

#### 4-5. analytics 패키지 미사용

`packages/analytics/src/gtm.ts`의 `pushGtmEvent()`, `pushPageView()`가 만들어져 있으나, 실제 Vue/React 라우터에서는 직접 `window.dataLayer.push()`를 사용 중. 기능 동일하나 코드 일관성을 위해 유틸로 통일 권장.

---

## 5. 종합 점수

| 카테고리 | 점수 | 비고 |
|---|:---:|---|
| **SEO 메타태그** | 9/10 | next-seo-app 페이지별 OG image 경로만 수정 필요 |
| **검색엔진 인증** | 10/10 | Google + Naver 모두 3개 앱에 적용 완료 |
| **GTM 스니펫** | 10/10 | 3개 앱 모두 head + noscript 완비 |
| **GTM dataLayer** | 10/10 | 5개 앱 모두 페이지뷰 추적, try/catch 안전처리 |
| **sitemap/robots** | 7/10 | 메인 URL 누락, 이중 소스 비정리 |
| **에셋 (favicon, OG)** | 10/10 | 3개 앱 모두 통일 |
| **빌드/배포** | 10/10 | Dockerfile + nginx 정상 |
| **브랜드 통일** | 10/10 | 잡스푼 → 아이포텐(I-Poten) 완료 |
| **전체** | **9.5/10** | |

---

## 6. 즉시 수정 필요 항목 (3개)

```
1. next-seo-app/public/sitemap.xml → '/', '/ai-interview' URL 추가
2. next-seo-app/app/page.tsx, seo/page.tsx, event/page.tsx → OG image 경로를 '/og-image.png'으로 수정
3. next-seo-app/app/event/page.tsx → JSON-LD의 'yourdomain.com'을 'i-poten.com'으로 수정
```

---

## 7. 배포 후 확인 체크리스트

```
□ https://i-poten.com/                → 메인 페이지 + GTM 로딩
□ https://i-poten.com/ai-interview    → 정적 SEO 페이지 (SvelteKit)
□ https://i-poten.com/seo             → SEO 랜딩 (Next.js) → 리다이렉트
□ https://i-poten.com/event           → 이벤트 페이지 (Next.js)
□ https://i-poten.com/sitemap.xml     → XML 출력 (4개 URL 포함)
□ https://i-poten.com/robots.txt      → 텍스트 출력
□ https://i-poten.com/og-image.png    → 이미지 정상 출력
□ 브라우저 소스보기 → <meta name="google-site-verification" ...>
□ 브라우저 콘솔 → console.log(window.dataLayer) → 배열 확인
□ GTM 콘솔 → GA4 태그 연결 (G-1JQVP9QNZQ)
□ GSC → sitemap 제출
□ 네이버 서치어드바이저 → sitemap 제출
```
