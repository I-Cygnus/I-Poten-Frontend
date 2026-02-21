# Next.js SEO App - 아이포텐 모의면접 AI

## 🎯 타겟 키워드

### 주요 키워드 (Primary Keywords)
- **모의면접** - 월 검색량: 높음
- **AI모의면접** - 월 검색량: 중간, 경쟁도: 낮음
- **면접준비** - 월 검색량: 높음
- **면접연습** - 월 검색량: 중간
- **면접 잘 보는 법** - 월 검색량: 중간

### 보조 키워드 (Secondary Keywords)
- 모의 면접
- 면접 준비
- 면접 연습
- AI 면접
- 면접 팁
- 취업 면접
- 면접 피드백

## 📊 SEO 최적화 현황

### ✅ 기술적 SEO
- [x] Next.js SSG (Static Site Generation)
- [x] 메타 태그 최적화
- [x] Open Graph 태그
- [x] Twitter Card 태그
- [x] Structured Data (JSON-LD)
- [x] robots.txt
- [x] sitemap.xml
- [x] 시맨틱 HTML (H1, H2, H3)
- [x] 모바일 최적화 (Tailwind responsive)

### ✅ 콘텐츠 SEO
- [x] 키워드 밀도 최적화 (2-3%)
- [x] H1 태그에 주요 키워드 포함
- [x] H2, H3 태그에 보조 키워드 포함
- [x] FAQ 섹션으로 롱테일 키워드 타겟팅
- [x] 자연스러운 키워드 배치

## 🚀 개발 환경

```bash
# 의존성 설치
cd next-seo-app
npm install

# 개발 서버 실행 (Port 3100)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
next-seo-app/
├── app/
│   ├── layout.tsx          # 전역 SEO 메타데이터
│   ├── page.tsx            # 홈페이지 (모의면접 메인)
│   ├── event/
│   │   └── page.tsx        # 이벤트 페이지
│   └── globals.css
├── public/
│   ├── robots.txt          # 크롤러 제어
│   ├── sitemap.xml         # 사이트맵
│   └── og-images/          # OG 이미지 (추가 필요)
└── package.json
```

## 🔍 SEO 체크리스트

### 즉시 할 것
- [ ] npm install 실행
- [ ] OG 이미지 생성 및 추가 (/public/og-main.jpg, og-event.jpg)
- [ ] Google Search Console 등록
- [ ] Google Analytics 설정
- [ ] 도메인 설정 (yourdomain.com → 실제 도메인)

### 단기 (1주일)
- [ ] 블로그 섹션 추가 (/blog)
- [ ] 추가 콘텐츠 페이지 (면접 팁, 합격 후기 등)
- [ ] 내부 링크 구조 개선

### 중기 (1개월)
- [ ] 백링크 확보 (취업 커뮤니티, 블로그)
- [ ] 콘텐츠 확장 (주 1-2개 블로그 포스팅)
- [ ] 검색 순위 모니터링

## 📈 예상 검색 순위

| 키워드 | 현재 | 1개월 후 | 3개월 후 | 6개월 후 |
|--------|------|----------|----------|----------|
| 모의면접 | 순위 밖 | 30-50위 | 10-20위 | 5-10위 |
| AI모의면접 | 순위 밖 | 10-20위 | 3-5위 | 1-3위 |
| 면접준비 | 순위 밖 | 30-50위 | 15-25위 | 5-15위 |
| 면접연습 | 순위 밖 | 20-40위 | 10-20위 | 5-10위 |
| 면접 잘 보는 법 | 순위 밖 | 20-30위 | 10-15위 | 5-10위 |

## 🛠️ Nginx 라우팅 설정 (필요)

```nginx
# SEO 페이지 → Next.js
location / {
  proxy_pass http://next-seo-app:3100;
}

location /event {
  proxy_pass http://next-seo-app:3100;
}

# 인증 페이지 → React SPA
location /vue-account {
  proxy_pass http://main-container:3001;
}
```

## 📊 모니터링

### Google Search Console
- 검색 쿼리 모니터링
- 크롤링 에러 확인
- 인덱싱 상태 확인

### Google Analytics
- 유입 경로 분석
- 이탈률 확인
- 체류 시간 측정

## 💡 추가 최적화 권장사항

1. **콘텐츠 확장**
   - 블로그 추가 (주 1-2개 포스팅)
   - 면접 후기, 합격 사례 추가
   - 직무별 면접 가이드

2. **기술적 개선**
   - 이미지 최적화 (WebP, lazy loading)
   - Core Web Vitals 개선
   - Lighthouse 점수 100점 목표

3. **백링크 전략**
   - 취업 커뮤니티 활동
   - 블로그 게스트 포스팅
   - SNS 마케팅

## 🔗 유용한 링크

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
