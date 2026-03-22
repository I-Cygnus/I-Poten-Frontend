<script lang="ts">
  import { PUBLIC_BASE_URL } from '$env/static/public';

  const BASE = PUBLIC_BASE_URL.replace(/\/+$/, '');
  const title = 'AI 모의면접 - 실전형 면접연습 · 실시간 AI 피드백 | 아이포텐';
  const desc  = 'AI 모의면접으로 면접 준비를 완벽하게. 직무·경험 기반 질문 생성, 실시간 AI 피드백, 답변 기록 관리까지. 기술면접·인성면접 실전 연습을 지금 무료로 시작하세요.';
  const url   = `${BASE}/ai-interview`;
  const img   = `${BASE}/og-image.png`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '아이포텐(I-Poten) AI 모의면접',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: url,
    description: desc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '137' }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'AI 모의면접은 무료인가요?',
        acceptedAnswer: { '@type': 'Answer', text: '기본 기능은 무료이며, 고급 분석 기능은 유료입니다.' }
      },
      {
        '@type': 'Question',
        name: '실제 면접처럼 연습할 수 있나요?',
        acceptedAnswer: { '@type': 'Answer', text: '실전형 질문, 시간 제한, 후속 꼬리질문으로 실제 면접과 유사한 환경을 제공합니다.' }
      },
      {
        '@type': 'Question',
        name: '어떤 종류의 면접을 연습할 수 있나요?',
        acceptedAnswer: { '@type': 'Answer', text: '기술면접, 인성면접, 회사별 맞춤 면접 등 다양한 카테고리를 지원합니다.' }
      },
      {
        '@type': 'Question',
        name: '면접 결과를 분석할 수 있나요?',
        acceptedAnswer: { '@type': 'Answer', text: '답변의 논리성, 직무 적합도, 개선 방향을 포함한 상세 리포트가 면접 종료 직후 제공됩니다.' }
      }
    ]
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'AI 모의면접', item: url }
    ]
  };
</script>

<svelte:head>
  <link rel="preload" as="image" href="/landing-hero.png" fetchpriority="high" />
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
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={desc} />
  <meta name="twitter:image" content={img} />
  {@html `<script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
</svelte:head>

<div class="page">
  <!-- ==================== 히어로 섹션 ==================== -->
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-left">
        <span class="hero-brand">AI-모의면접</span>
        <h1 class="hero-title">i-POTEN X AI</h1>
        <p class="hero-desc">
          AI, I-Poten 솔루션으로<br/>
          합격과 성장에 필요한 모든 것을 연결합니다.
        </p>
        <div class="hero-buttons">
          <a href="/vue-ai-interview/ai-interview/select?utm_source=seo&utm_medium=landing" class="btn-primary">지금 시작하기</a>
          <a href="#features" class="btn-secondary">둘러보기</a>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-img-wrapper">
          <svg class="hero-svg" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.6">
              <path d="M 0,250 C 150,-150 1100,-100 950,650 C 850,1100 250,1100 50,800" stroke="url(#g1)" stroke-width="3" stroke-linecap="round"/>
              <path d="M -100,400 C 100,0 950,100 1000,550 C 1050,950 450,1000 150,850" stroke="url(#g2)" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="950" cy="650" r="4" fill="#60a5fa"/>
              <circle cx="50" cy="800" r="5" fill="#34d399"/>
            </g>
            <defs>
              <linearGradient id="g1" x1="0" y1="250" x2="950" y2="650" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#3b82f6"/><stop offset="50%" stop-color="#111827"/><stop offset="100%" stop-color="#34d399"/>
              </linearGradient>
              <linearGradient id="g2" x1="-100" y1="400" x2="1000" y2="550" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#34d399" stop-opacity="0.5"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0.5"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="hero-img-card">
            <img src="/landing-hero.png" alt="아이포텐(I-Poten) AI 모의면접 서비스 화면" width="480" height="360" fetchpriority="high" decoding="async"/>
            <div class="hero-img-glow"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== 기능 섹션 ==================== -->
  <section class="features" id="features">

    <!-- Feature 01 -->
    <div class="feature-block feature-light">
      <div class="feature-inner">
        <div class="feature-text">
          <span class="feature-badge" style="color:#1e3a8a;border-color:#1e3a8a">01 / Core Engine</span>
          <h2 class="feature-title">
            지원자와 지원자의 답변을 분석하는
            <span class="gradient-text" style="background:linear-gradient(90deg,#1e3a8a,#3b82f6)">개인화 면접 서비스를 제공하는 AI 엔진</span>
          </h2>
          <p class="feature-desc">
            단순한 범용 질문이 아닙니다.<br/>
            지원자의 상황과 답변을 다각도로 분석하여<br/>
            지원자만의 강점과 약점을 파고드는 실전 질문을 생성합니다.
          </p>
          <ul class="feature-dots">
            <li><span class="dot-line" style="background:#2563eb"></span>지원자 답변 기반 질문 제공</li>
            <li><span class="dot-line" style="background:#2563eb"></span>직무 역량과 연계된 꼬리 질문 생성</li>
            <li><span class="dot-line" style="background:#2563eb"></span>실제 여러 기업의 데이터 기반 면접 질문</li>
          </ul>
        </div>
        <div class="feature-image">
          <div class="deco-circle" style="background:#2563eb"></div>
          <img src="/feature-1.png" alt="AI 엔진 개인화 면접 질문 생성 화면" loading="lazy" decoding="async"/>
        </div>
      </div>
    </div>

    <!-- Feature 02 -->
    <div class="feature-block feature-dark" style="background:#0b1120">
      <div class="feature-inner">
        <div class="feature-text">
          <span class="feature-badge" style="color:#60a5fa;border-color:#60a5fa">02 / Real Experience</span>
          <h2 class="feature-title" style="color:#fff">
            실제 면접장의 긴장감,
            <span class="gradient-text" style="background:linear-gradient(90deg,#60a5fa,#a78bfa)">압도적인 몰입감</span>
          </h2>
          <p class="feature-desc" style="color:#94a3b8">
            텍스트에 의존하는 챗봇 형식에서 벗어나,<br/>
            음성과 표정이 살아있는 AI 아바타 면접관과 대화하며<br/>
            실제 대면 면접과 동일한 환경을 경험하세요.
          </p>
          <ul class="feature-dots dark">
            <li><span class="dot-line" style="background:#3b82f6"></span><span style="color:#94a3b8">감정과 억양이 반영된 고품질 TTS</span></li>
            <li><span class="dot-line" style="background:#3b82f6"></span><span style="color:#94a3b8">상황에 반응하는 AI 아바타</span></li>
            <li><span class="dot-line" style="background:#3b82f6"></span><span style="color:#94a3b8">실전 감각을 극대화하는 UI/UX</span></li>
          </ul>
        </div>
        <div class="feature-image">
          <div class="deco-circle" style="background:#3b82f6;opacity:0.3"></div>
          <img src="/feature-2.png" alt="AI 아바타 면접관과 실전 면접 환경" loading="lazy" decoding="async"/>
        </div>
      </div>
    </div>

    <!-- Feature 03 -->
    <div class="feature-block feature-dark" style="background:#111827">
      <div class="feature-inner">
        <div class="feature-text">
          <span class="feature-badge" style="color:#38bdf8;border-color:#38bdf8">03 / Custom Category</span>
          <h2 class="feature-title" style="color:#fff">
            다양한 카테고리의
            <span class="gradient-text" style="background:linear-gradient(90deg,#38bdf8,#818cf8)">전문적인 특화 면접</span>
          </h2>
          <p class="feature-desc" style="color:#94a3b8">
            각 회사별 느낌을 살린 면접,
            내 상황과 회사 공고기반의 면접,
            인성·심층 기술 면접까지
            현재의 목표에 맞춘 디테일한 세팅이 가능합니다.
          </p>
          <ul class="feature-dots dark">
            <li><span class="dot-line" style="background:#0ea5e9"></span><span style="color:#94a3b8">실 데이터기반 회사별 면접 지원</span></li>
            <li><span class="dot-line" style="background:#0ea5e9"></span><span style="color:#94a3b8">인성면접, 기술면접 등 특화 면접 준비</span></li>
            <li><span class="dot-line" style="background:#0ea5e9"></span><span style="color:#94a3b8">신입/경력 연차에 따른 난이도 조절</span></li>
          </ul>
        </div>
        <div class="feature-image">
          <div class="deco-circle" style="background:#0ea5e9;opacity:0.3"></div>
          <img src="/feature-3.png" alt="회사별 맞춤 면접 카테고리 선택 화면" loading="lazy" decoding="async"/>
        </div>
      </div>
    </div>

    <!-- Feature 04 -->
    <div class="feature-block feature-light" style="background:#f8fafc">
      <div class="feature-inner">
        <div class="feature-text">
          <span class="feature-badge" style="color:#0f172a;border-color:#0f172a">04 / Growth Report</span>
          <h2 class="feature-title">
            성장을 증명하는
            <span class="gradient-text" style="background:linear-gradient(90deg,#0f172a,#475569)">입체적인 평가 리포트</span>
          </h2>
          <p class="feature-desc">
            면접 종료와 동시에 제공되는 다각도 분석 리포트로<br/>
            답변의 논리성, 직무 적합도, 비언어적 태도까지<br/>
            명확한 데이터 기반의 개선 방향을 확인하세요.
          </p>
          <ul class="feature-dots">
            <li><span class="dot-line" style="background:#334155"></span>논리력 및 직무 적합도 AI 스코어링</li>
            <li><span class="dot-line" style="background:#334155"></span>아쉬운 답변에 대한 모범 가이드라인 제공</li>
            <li><span class="dot-line" style="background:#334155"></span>질문의 대답에 대한 세세한 피드백 제공</li>
          </ul>
        </div>
        <div class="feature-image">
          <div class="deco-circle" style="background:#334155"></div>
          <img src="/feature-4.png" alt="면접 결과 분석 리포트 화면" loading="lazy" decoding="async"/>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== FAQ 섹션 ==================== -->
  <section class="faq-section">
    <div class="faq-inner">
      <h2 class="faq-heading">자주 묻는 질문</h2>
      <div class="faq-list">
        <details class="faq-item">
          <summary>AI 모의면접은 무료인가요?</summary>
          <p>기본 기능은 무료이며, 고급 분석 기능은 유료입니다.</p>
        </details>
        <details class="faq-item">
          <summary>실제 면접처럼 연습할 수 있나요?</summary>
          <p>실전형 질문, 시간 제한, 후속 꼬리질문으로 실제 면접과 유사한 환경을 제공합니다.</p>
        </details>
        <details class="faq-item">
          <summary>어떤 종류의 면접을 연습할 수 있나요?</summary>
          <p>기술면접, 인성면접, 회사별 맞춤 면접 등 다양한 카테고리를 지원합니다.</p>
        </details>
        <details class="faq-item">
          <summary>면접 결과를 분석할 수 있나요?</summary>
          <p>답변의 논리성, 직무 적합도, 개선 방향을 포함한 상세 리포트가 면접 종료 직후 제공됩니다.</p>
        </details>
      </div>
    </div>
  </section>

  <!-- ==================== CTA 섹션 ==================== -->
  <section class="cta-section">
    <div class="cta-inner">
      <h2 class="cta-title">지금 바로 AI 모의면접을 시작하세요</h2>
      <p class="cta-desc">무료로 시작하고, 실전 면접 감각을 키워보세요.</p>
      <a href="/vue-ai-interview/ai-interview/select?utm_source=seo&utm_medium=landing&utm_campaign=cta_bottom" class="btn-cta">무료로 시작하기</a>
    </div>
  </section>
</div>

<style>
  /* ===== Reset & Base ===== */
  .page {
    min-height: 100vh;
    margin: 0;
    padding: 0;
    font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto,
      'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR',
      'Malgun Gothic', sans-serif;
    color: #111827;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== 히어로 ===== */
  .hero {
    position: relative;
    background:
      radial-gradient(900px 900px at 20% 60%, rgba(211,228,253,0.55) 0%, transparent 80%),
      radial-gradient(900px 900px at 80% 55%, rgba(213,247,239,0.55) 0%, transparent 80%),
      #ffffff;
  }

  .hero-inner {
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 60px;
    padding: 0 40px;
  }

  .hero-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    z-index: 2;
  }

  .hero-brand {
    font-size: clamp(48px, 7vw, 80px);
    font-weight: 900;
    color: #111827;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    line-height: 1.1;
  }

  .hero-title {
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 700;
    color: #111827;
    line-height: 1.3;
    margin: 0 0 20px 0;
    letter-spacing: -0.02em;
  }

  .hero-desc {
    font-size: clamp(16px, 2vw, 18px);
    font-weight: 500;
    color: #6b7280;
    margin: 0 0 40px 0;
    line-height: 1.6;
    word-break: keep-all;
  }

  .hero-buttons {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn-primary {
    padding: 16px 36px;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    background: #111827;
    border: none;
    border-radius: 30px;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: inline-block;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

  .btn-secondary {
    padding: 16px 36px;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    background: #374151;
    border: none;
    border-radius: 30px;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    display: inline-block;
  }

  .hero-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  .hero-img-wrapper {
    position: relative;
    width: 100%;
    max-width: 480px;
    display: flex;
    justify-content: center;
  }

  .hero-svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320%;
    height: 320%;
    z-index: -2;
    pointer-events: none;
  }

  .hero-img-card {
    position: relative;
    width: 100%;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1);
    z-index: 1;
  }

  .hero-img-card img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    border-radius: 32px;
  }

  .hero-img-glow {
    position: absolute;
    inset: -2px;
    border-radius: 34px;
    background: linear-gradient(135deg, rgba(58,131,243,0.3), rgba(17,184,132,0.3));
    z-index: -1;
    filter: blur(20px);
  }

  /* ===== 기능 섹션 ===== */
  .features {
    position: relative;
    z-index: 10;
  }

  .feature-block {
    padding: 100px 0;
    overflow: hidden;
  }

  .feature-light { background: #fff; }

  .feature-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    align-items: center;
    gap: 80px;
  }

  .feature-text {
    flex: 1;
    min-width: 0;
  }

  .feature-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border: 1px solid;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 24px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .feature-title {
    font-size: clamp(28px, 3.5vw, 42px);
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 28px;
    letter-spacing: -0.02em;
    line-height: 1.35;
    word-break: keep-all;
  }

  .gradient-text {
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }

  .feature-desc {
    font-size: clamp(16px, 2vw, 18px);
    font-weight: 400;
    color: #475569;
    line-height: 1.7;
    margin-bottom: 40px;
    word-break: keep-all;
    opacity: 0.95;
  }

  .feature-dots {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .feature-dots li {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 16px;
    color: #475569;
    font-weight: 500;
    word-break: keep-all;
  }

  .feature-dots.dark li { color: #94a3b8; }

  .dot-line {
    width: 18px;
    height: 1px;
    flex-shrink: 0;
    display: inline-block;
  }

  .feature-image {
    flex: 1;
    position: relative;
    min-width: 0;
  }

  .feature-image img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 24px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.16), 0 10px 28px rgba(0,0,0,0.10);
    position: relative;
    z-index: 2;
    transform: perspective(1800px) rotateY(2.5deg) rotateX(1deg);
  }

  .deco-circle {
    position: absolute;
    top: 5%;
    left: 10%;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    z-index: 0;
  }

  /* ===== FAQ 섹션 ===== */
  .faq-section {
    background: #fff;
    padding: 100px 0;
  }

  .faq-inner {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .faq-heading {
    font-size: clamp(28px, 3.5vw, 40px);
    font-weight: 800;
    text-align: center;
    margin-bottom: 48px;
    color: #0f172a;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .faq-item {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }

  .faq-item summary {
    padding: 20px 24px;
    font-size: 17px;
    font-weight: 600;
    color: #0f172a;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .faq-item summary::after {
    content: '+';
    font-size: 24px;
    font-weight: 300;
    color: #94a3b8;
    transition: transform 0.2s ease;
  }

  .faq-item[open] summary::after {
    transform: rotate(45deg);
  }

  .faq-item p {
    padding: 0 24px 20px;
    margin: 0;
    font-size: 16px;
    color: #475569;
    line-height: 1.7;
  }

  /* ===== CTA 섹션 ===== */
  .cta-section {
    background: linear-gradient(135deg, #111827 0%, #1e3a8a 100%);
    padding: 100px 0;
    text-align: center;
  }

  .cta-inner {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .cta-title {
    font-size: clamp(24px, 3.5vw, 36px);
    font-weight: 800;
    color: #fff;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }

  .cta-desc {
    font-size: 18px;
    color: #94a3b8;
    margin-bottom: 40px;
  }

  .btn-cta {
    display: inline-block;
    padding: 18px 48px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    background: #fff;
    border-radius: 30px;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(255,255,255,0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,255,255,0.3); }

  /* ===== 반응형 ===== */
  @media (max-width: 768px) {
    .hero-inner {
      flex-direction: column;
      gap: 40px;
      padding: 80px 24px 60px;
      min-height: auto;
    }
    .hero-brand { font-size: 48px; }
    .hero-right { width: 100%; }
    .hero-img-wrapper { max-width: 100%; }
    .feature-inner {
      flex-direction: column;
      gap: 48px;
      padding: 0 24px;
    }
    .feature-block { padding: 60px 0; }
    .feature-image img { transform: none; }
    .faq-inner { padding: 0 24px; }
    .cta-inner { padding: 0 24px; }
  }
</style>
