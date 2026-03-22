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

  const font = `Pretendard,-apple-system,BlinkMacSystemFont,system-ui,Roboto,'Helvetica Neue','Segoe UI','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif`;
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

<!-- ==================== 히어로 섹션 ==================== -->
<div style="min-height:100vh;margin:0;padding:0;font-family:{font};color:#0f172a;-webkit-font-smoothing:antialiased;overflow-x:hidden">

<section style="position:relative;min-height:100vh;display:flex;align-items:center;background:#0a0f1e;overflow:hidden">
  <!-- 배경 그라데이션 블롭 -->
  <div style="position:absolute;top:-20%;left:-10%;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.25) 0%,transparent 70%);pointer-events:none"></div>
  <div style="position:absolute;bottom:-30%;right:-15%;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%);pointer-events:none"></div>
  <div style="position:absolute;top:50%;left:60%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.15) 0%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%)"></div>

  <div style="max-width:1200px;width:100%;margin:0 auto;padding:60px 40px;display:flex;align-items:center;gap:80px;position:relative;z-index:2">
    <!-- 왼쪽 텍스트 -->
    <div style="flex:1;min-width:0">
      <div style="display:inline-block;padding:6px 16px;border:1px solid rgba(99,102,241,0.4);border-radius:20px;font-size:13px;font-weight:600;color:#818cf8;letter-spacing:0.05em;margin-bottom:24px">AI-Powered Interview Platform</div>
      <h1 style="font-size:clamp(40px,6vw,72px);font-weight:900;color:#ffffff;line-height:1.08;margin:0 0 8px 0;letter-spacing:-0.03em">
        i-POTEN
      </h1>
      <h2 style="font-size:clamp(20px,3vw,32px);font-weight:300;color:rgba(255,255,255,0.6);margin:0 0 32px 0;letter-spacing:0.02em;line-height:1.4">
        AI 모의면접으로<br/>합격에 한 걸음 더 가까이
      </h2>
      <p style="font-size:clamp(15px,1.8vw,18px);color:rgba(255,255,255,0.5);line-height:1.7;margin:0 0 48px 0;max-width:480px;word-break:keep-all">
        지원자의 경험과 직무에 맞춘 실전 질문, AI 실시간 피드백,
        그리고 성장을 증명하는 분석 리포트까지.
        면접 준비의 모든 것을 하나로.
      </p>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        <a href="/vue-ai-interview/ai-interview/select?utm_source=seo&utm_medium=landing"
           style="display:inline-flex;align-items:center;gap:8px;padding:16px 40px;font-size:16px;font-weight:700;color:#0a0f1e;background:linear-gradient(135deg,#fff 0%,#e0e7ff 100%);border-radius:50px;text-decoration:none;box-shadow:0 0 30px rgba(99,102,241,0.3);font-family:{font}">
          무료로 시작하기
          <span style="font-size:20px">&#8594;</span>
        </a>
        <a href="#features"
           style="display:inline-flex;align-items:center;padding:16px 32px;font-size:16px;font-weight:600;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.15);border-radius:50px;text-decoration:none;font-family:{font}">
          더 알아보기
        </a>
      </div>
    </div>

    <!-- 오른쪽 히어로 이미지 -->
    <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-width:0">
      <div style="position:relative;width:100%;max-width:520px">
        <div style="position:absolute;inset:-20px;border-radius:40px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(6,182,212,0.1));filter:blur(40px);z-index:0"></div>
        <div style="position:relative;border-radius:28px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.05);z-index:1">
          <img src="/landing-hero.png" alt="아이포텐 AI 모의면접 서비스 화면" width="520" height="390" fetchpriority="high" decoding="async" style="width:100%;height:auto;display:block"/>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==================== 신뢰 지표 섹션 ==================== -->
<section style="background:#0d1321;padding:48px 40px;border-top:1px solid rgba(255,255,255,0.06)">
  <div style="max-width:900px;margin:0 auto;display:flex;justify-content:center;gap:64px;flex-wrap:wrap;text-align:center">
    <div>
      <div style="font-size:36px;font-weight:800;color:#fff;letter-spacing:-0.02em">4.8</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.4);margin-top:4px">사용자 평점</div>
    </div>
    <div>
      <div style="font-size:36px;font-weight:800;color:#fff;letter-spacing:-0.02em">10,000+</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.4);margin-top:4px">면접 세션</div>
    </div>
    <div>
      <div style="font-size:36px;font-weight:800;color:#fff;letter-spacing:-0.02em">50+</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.4);margin-top:4px">대응 기업</div>
    </div>
    <div>
      <div style="font-size:36px;font-weight:800;color:#fff;letter-spacing:-0.02em">3</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.4);margin-top:4px">면접 카테고리</div>
    </div>
  </div>
</section>

<!-- ==================== 기능 섹션 ==================== -->
<section id="features" style="background:#ffffff;padding:120px 40px">
  <div style="max-width:1200px;margin:0 auto">
    <div style="text-align:center;margin-bottom:80px">
      <div style="display:inline-block;padding:6px 16px;border-radius:20px;background:#eff6ff;color:#2563eb;font-size:13px;font-weight:600;letter-spacing:0.04em;margin-bottom:16px">FEATURES</div>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;color:#0f172a;margin:0 0 16px 0;letter-spacing:-0.02em;line-height:1.25">면접의 모든 과정을<br/>AI가 함께합니다</h2>
      <p style="font-size:18px;color:#64748b;max-width:520px;margin:0 auto;line-height:1.6">단순한 질문 생성을 넘어, 실전 환경부터 성장 분석까지</p>
    </div>

    <!-- Feature 01 -->
    <div style="display:flex;align-items:center;gap:80px;margin-bottom:120px">
      <div style="flex:1;min-width:0">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:6px;background:#eff6ff;margin-bottom:20px">
          <span style="font-size:13px;font-weight:700;color:#1e40af;letter-spacing:0.06em">01</span>
          <span style="width:1px;height:14px;background:#bfdbfe;display:inline-block"></span>
          <span style="font-size:12px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:0.06em">Core Engine</span>
        </div>
        <h3 style="font-size:clamp(24px,3vw,36px);font-weight:800;color:#0f172a;line-height:1.35;margin:0 0 20px 0;word-break:keep-all">
          지원자의 답변을 분석하는<br/>
          <span style="background:linear-gradient(90deg,#1e40af,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">개인화 AI 면접 엔진</span>
        </h3>
        <p style="font-size:17px;color:#64748b;line-height:1.75;margin:0 0 32px 0;word-break:keep-all">
          단순한 범용 질문이 아닙니다.
          지원자의 상황과 답변을 다각도로 분석하여
          강점과 약점을 파고드는 실전 질문을 생성합니다.
        </p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#3b82f6;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">지원자 답변 기반 꼬리 질문 생성</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#3b82f6;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">직무 역량과 연계된 심층 질문</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#3b82f6;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">실 기업 데이터 기반 면접 문제</span></div>
        </div>
      </div>
      <div style="flex:1;position:relative;min-width:0">
        <div style="position:absolute;top:10%;left:5%;width:200px;height:200px;border-radius:50%;background:rgba(59,130,246,0.08);filter:blur(60px);z-index:0"></div>
        <img src="/feature-1.png" alt="AI 엔진 개인화 면접 질문 생성 화면" loading="lazy" decoding="async" style="width:100%;height:auto;display:block;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.04);position:relative;z-index:1"/>
      </div>
    </div>

    <!-- Feature 02 -->
    <div style="display:flex;align-items:center;gap:80px;margin-bottom:120px;flex-direction:row-reverse">
      <div style="flex:1;min-width:0">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:6px;background:#f5f3ff;margin-bottom:20px">
          <span style="font-size:13px;font-weight:700;color:#5b21b6;letter-spacing:0.06em">02</span>
          <span style="width:1px;height:14px;background:#c4b5fd;display:inline-block"></span>
          <span style="font-size:12px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em">Real Experience</span>
        </div>
        <h3 style="font-size:clamp(24px,3vw,36px);font-weight:800;color:#0f172a;line-height:1.35;margin:0 0 20px 0;word-break:keep-all">
          실제 면접장의 긴장감,<br/>
          <span style="background:linear-gradient(90deg,#7c3aed,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">압도적인 몰입감</span>
        </h3>
        <p style="font-size:17px;color:#64748b;line-height:1.75;margin:0 0 32px 0;word-break:keep-all">
          텍스트에 의존하는 챗봇 형식에서 벗어나,
          음성과 표정이 살아있는 AI 아바타 면접관과 대화하며
          실제 대면 면접과 동일한 환경을 경험하세요.
        </p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#7c3aed;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">감정과 억양이 반영된 고품질 TTS</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#7c3aed;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">상황에 반응하는 AI 아바타 면접관</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#7c3aed;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">실전 감각을 극대화하는 UI/UX</span></div>
        </div>
      </div>
      <div style="flex:1;position:relative;min-width:0">
        <div style="position:absolute;top:10%;right:5%;width:200px;height:200px;border-radius:50%;background:rgba(124,58,237,0.08);filter:blur(60px);z-index:0"></div>
        <img src="/feature-2.png" alt="AI 아바타 면접관과 실전 면접 환경" loading="lazy" decoding="async" style="width:100%;height:auto;display:block;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.04);position:relative;z-index:1"/>
      </div>
    </div>

    <!-- Feature 03 -->
    <div style="display:flex;align-items:center;gap:80px;margin-bottom:120px">
      <div style="flex:1;min-width:0">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:6px;background:#ecfeff;margin-bottom:20px">
          <span style="font-size:13px;font-weight:700;color:#155e75;letter-spacing:0.06em">03</span>
          <span style="width:1px;height:14px;background:#a5f3fc;display:inline-block"></span>
          <span style="font-size:12px;font-weight:600;color:#0891b2;text-transform:uppercase;letter-spacing:0.06em">Custom Category</span>
        </div>
        <h3 style="font-size:clamp(24px,3vw,36px);font-weight:800;color:#0f172a;line-height:1.35;margin:0 0 20px 0;word-break:keep-all">
          다양한 카테고리의<br/>
          <span style="background:linear-gradient(90deg,#0891b2,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">전문적인 특화 면접</span>
        </h3>
        <p style="font-size:17px;color:#64748b;line-height:1.75;margin:0 0 32px 0;word-break:keep-all">
          각 회사별 느낌을 살린 면접, 내 상황과 회사 공고 기반의 면접,
          인성·심층 기술 면접까지
          현재의 목표에 맞춘 디테일한 세팅이 가능합니다.
        </p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#0891b2;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">실 데이터 기반 회사별 면접 지원</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#0891b2;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">인성면접 · 기술면접 등 특화 준비</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#0891b2;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">신입/경력 연차에 따른 난이도 조절</span></div>
        </div>
      </div>
      <div style="flex:1;position:relative;min-width:0">
        <div style="position:absolute;top:10%;left:5%;width:200px;height:200px;border-radius:50%;background:rgba(8,145,178,0.08);filter:blur(60px);z-index:0"></div>
        <img src="/feature-3.png" alt="회사별 맞춤 면접 카테고리 선택 화면" loading="lazy" decoding="async" style="width:100%;height:auto;display:block;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.04);position:relative;z-index:1"/>
      </div>
    </div>

    <!-- Feature 04 -->
    <div style="display:flex;align-items:center;gap:80px;flex-direction:row-reverse">
      <div style="flex:1;min-width:0">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:6px;background:#f1f5f9;margin-bottom:20px">
          <span style="font-size:13px;font-weight:700;color:#334155;letter-spacing:0.06em">04</span>
          <span style="width:1px;height:14px;background:#cbd5e1;display:inline-block"></span>
          <span style="font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.06em">Growth Report</span>
        </div>
        <h3 style="font-size:clamp(24px,3vw,36px);font-weight:800;color:#0f172a;line-height:1.35;margin:0 0 20px 0;word-break:keep-all">
          성장을 증명하는<br/>
          <span style="background:linear-gradient(90deg,#0f172a,#475569);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">입체적인 평가 리포트</span>
        </h3>
        <p style="font-size:17px;color:#64748b;line-height:1.75;margin:0 0 32px 0;word-break:keep-all">
          면접 종료와 동시에 제공되는 다각도 분석 리포트로
          답변의 논리성, 직무 적합도, 비언어적 태도까지
          명확한 데이터 기반의 개선 방향을 확인하세요.
        </p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#475569;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">논리력 및 직무 적합도 AI 스코어링</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#475569;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">모범 가이드라인 및 개선 방향 제시</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div style="width:6px;height:6px;border-radius:50%;background:#475569;flex-shrink:0"></div><span style="font-size:15px;color:#475569;font-weight:500">각 답변에 대한 세세한 피드백 제공</span></div>
        </div>
      </div>
      <div style="flex:1;position:relative;min-width:0">
        <div style="position:absolute;top:10%;right:5%;width:200px;height:200px;border-radius:50%;background:rgba(51,65,85,0.06);filter:blur(60px);z-index:0"></div>
        <img src="/feature-4.png" alt="면접 결과 분석 리포트 화면" loading="lazy" decoding="async" style="width:100%;height:auto;display:block;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.04);position:relative;z-index:1"/>
      </div>
    </div>
  </div>
</section>

<!-- ==================== FAQ 섹션 ==================== -->
<section style="background:#f8fafc;padding:100px 40px">
  <div style="max-width:720px;margin:0 auto">
    <div style="text-align:center;margin-bottom:56px">
      <div style="display:inline-block;padding:6px 16px;border-radius:20px;background:#fff;color:#475569;font-size:13px;font-weight:600;letter-spacing:0.04em;margin-bottom:16px;border:1px solid #e2e8f0">FAQ</div>
      <h2 style="font-size:clamp(26px,3.5vw,38px);font-weight:800;color:#0f172a;margin:0;letter-spacing:-0.02em">자주 묻는 질문</h2>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <details style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <summary style="padding:22px 28px;font-size:17px;font-weight:600;color:#0f172a;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;font-family:{font}">AI 모의면접은 무료인가요?</summary>
        <p style="padding:0 28px 22px;margin:0;font-size:16px;color:#64748b;line-height:1.7">기본 기능은 무료이며, 고급 분석 기능은 유료입니다.</p>
      </details>
      <details style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <summary style="padding:22px 28px;font-size:17px;font-weight:600;color:#0f172a;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;font-family:{font}">실제 면접처럼 연습할 수 있나요?</summary>
        <p style="padding:0 28px 22px;margin:0;font-size:16px;color:#64748b;line-height:1.7">실전형 질문, 시간 제한, 후속 꼬리질문으로 실제 면접과 유사한 환경을 제공합니다.</p>
      </details>
      <details style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <summary style="padding:22px 28px;font-size:17px;font-weight:600;color:#0f172a;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;font-family:{font}">어떤 종류의 면접을 연습할 수 있나요?</summary>
        <p style="padding:0 28px 22px;margin:0;font-size:16px;color:#64748b;line-height:1.7">기술면접, 인성면접, 회사별 맞춤 면접 등 다양한 카테고리를 지원합니다.</p>
      </details>
      <details style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <summary style="padding:22px 28px;font-size:17px;font-weight:600;color:#0f172a;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;font-family:{font}">면접 결과를 분석할 수 있나요?</summary>
        <p style="padding:0 28px 22px;margin:0;font-size:16px;color:#64748b;line-height:1.7">답변의 논리성, 직무 적합도, 개선 방향을 포함한 상세 리포트가 면접 종료 직후 제공됩니다.</p>
      </details>
    </div>
  </div>
</section>

<!-- ==================== CTA 섹션 ==================== -->
<section style="position:relative;padding:120px 40px;background:#0a0f1e;overflow:hidden;text-align:center">
  <div style="position:absolute;top:50%;left:50%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%)"></div>
  <div style="position:relative;z-index:2;max-width:600px;margin:0 auto">
    <h2 style="font-size:clamp(26px,4vw,42px);font-weight:800;color:#fff;margin:0 0 16px 0;letter-spacing:-0.02em;line-height:1.3">
      지금 바로 시작하세요
    </h2>
    <p style="font-size:18px;color:rgba(255,255,255,0.5);margin:0 0 48px 0;line-height:1.6">
      무료로 시작하고, AI와 함께 면접 합격에 한 걸음 더 가까워지세요.
    </p>
    <a href="/vue-ai-interview/ai-interview/select?utm_source=seo&utm_medium=landing&utm_campaign=cta_bottom"
       style="display:inline-flex;align-items:center;gap:8px;padding:18px 52px;font-size:18px;font-weight:700;color:#0a0f1e;background:#fff;border-radius:50px;text-decoration:none;box-shadow:0 0 40px rgba(255,255,255,0.15);font-family:{font}">
      무료로 시작하기
      <span style="font-size:22px">&#8594;</span>
    </a>
  </div>
</section>

</div>
