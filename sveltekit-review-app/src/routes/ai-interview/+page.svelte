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

  // 인라인 바닐라 JS — csr=false여도 HTML에 포함되어 브라우저가 실행
  const scrollScript = `(function(){
  var bgColors=['#ffffff','#0b1120','#111827','#f8fafc'];
  var wrapper=document.getElementById('ai-feature-wrapper');
  var fixedBg=document.getElementById('ai-fixed-bg');
  var fixedPanel=document.getElementById('ai-fixed-panel');
  if(!wrapper||!fixedBg||!fixedPanel)return;
  var activeIdx=-1;
  function tick(){
    var rect=wrapper.getBoundingClientRect();
    var vh=window.innerHeight;
    var isIn=rect.top<=0&&rect.bottom>=vh;
    fixedBg.style.opacity=isIn?'1':'0';
    fixedPanel.style.opacity=isIn?'1':'0';
    if(isIn){
      var blocks=wrapper.querySelectorAll('[data-img-block]');
      var center=vh/2;
      var best=0;var bestDist=Infinity;
      blocks.forEach(function(b){
        var i=parseInt(b.getAttribute('data-img-block'),10);
        var r=b.getBoundingClientRect();
        var d=Math.abs(r.top+r.height/2-center);
        if(d<bestDist){bestDist=d;best=i;}
      });
      if(best!==activeIdx){
        fixedBg.style.backgroundColor=bgColors[best];
        for(var i=0;i<4;i++){
          var el=document.getElementById('ai-text-'+i);
          if(!el)continue;
          if(i===best){
            el.style.opacity='1';
            el.style.transform='translateY(0)';
            el.style.pointerEvents='auto';
          }else{
            el.style.opacity='0';
            el.style.transform='translateY(40px)';
            el.style.pointerEvents='none';
          }
        }
        activeIdx=best;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();`;
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

<!-- ===== 고정 배경 오버레이 (z:5) — JS가 배경색·opacity 제어 ===== -->
<div id="ai-fixed-bg" style="position:fixed;top:0;left:0;right:0;bottom:0;background-color:#ffffff;transition:background-color 0.6s ease,opacity 0.5s ease;opacity:0;pointer-events:none;z-index:5"></div>

<!-- ===== 고정 왼쪽 텍스트 패널 (z:15) — 기능 섹션 진입 시 나타남 ===== -->
<div id="ai-fixed-panel" style="position:fixed;top:0;left:0;right:0;height:100vh;display:flex;align-items:center;opacity:0;transition:opacity 0.5s ease;pointer-events:none;z-index:15;font-family:Pretendard,-apple-system,BlinkMacSystemFont,system-ui,Roboto,'Helvetica Neue','Segoe UI','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif">
  <div style="max-width:1200px;width:100%;margin:0 auto;padding:0 40px;display:flex;flex-direction:row">
    <div style="flex:1;display:flex;align-items:center;padding-right:60px">
      <div style="position:relative;width:100%">

        <!-- 텍스트 0: Core Engine — position:relative (높이 기준) -->
        <div id="ai-text-0" style="position:relative;width:100%;opacity:1;transform:translateY(0);transition:opacity 0.7s cubic-bezier(0.25,1,0.5,1),transform 0.7s cubic-bezier(0.25,1,0.5,1)">
          <div style="display:inline-flex;align-items:center;justify-content:center;padding:6px 14px;border:1px solid #1e3a8a;color:#1e3a8a;border-radius:4px;font-size:13px;font-weight:600;margin-bottom:24px;letter-spacing:0.08em;text-transform:uppercase">01 / Core Engine</div>
          <h2 style="font-size:clamp(34px,4.5vw,46px);font-weight:800;color:#0f172a;margin-bottom:28px;letter-spacing:-0.02em;line-height:1.35;word-break:keep-all">
            지원자와<br/>지원자의 답변을 분석하는<br/><span style="background:linear-gradient(90deg,#1e3a8a,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block">개인화 면접 서비스를 제공하는 AI 엔진</span>
          </h2>
          <p style="font-size:clamp(17px,2.2vw,19px);font-weight:400;color:#475569;line-height:1.7;margin-bottom:40px;word-break:keep-all;letter-spacing:-0.01em;opacity:0.95">
            단순한 범용 질문이 아닙니다.<br/>지원자의 상황과 답변을 다각도로 분석하여<br/>지원자만의 강점과 약점을 파고드는 실전 질문을 생성합니다.
          </p>
          <div style="display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#2563eb;flex-shrink:0"></div><span style="font-size:16px;color:#475569;font-weight:500;word-break:keep-all">지원자 답변 기반 질문 제공</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#2563eb;flex-shrink:0"></div><span style="font-size:16px;color:#475569;font-weight:500;word-break:keep-all">직무 역량과 연계된 꼬리 질문 생성</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#2563eb;flex-shrink:0"></div><span style="font-size:16px;color:#475569;font-weight:500;word-break:keep-all">실제 여러 기업의 데이터 기반 면접 질문</span></div>
          </div>
        </div>

        <!-- 텍스트 1: Real Experience — position:absolute -->
        <div id="ai-text-1" style="position:absolute;top:0;left:0;width:100%;opacity:0;transform:translateY(40px);transition:opacity 0.7s cubic-bezier(0.25,1,0.5,1),transform 0.7s cubic-bezier(0.25,1,0.5,1);pointer-events:none">
          <div style="display:inline-flex;align-items:center;justify-content:center;padding:6px 14px;border:1px solid #60a5fa;color:#60a5fa;border-radius:4px;font-size:13px;font-weight:600;margin-bottom:24px;letter-spacing:0.08em;text-transform:uppercase">02 / Real Experience</div>
          <h2 style="font-size:clamp(34px,4.5vw,46px);font-weight:800;color:#ffffff;margin-bottom:28px;letter-spacing:-0.02em;line-height:1.35;word-break:keep-all">
            실제 면접장의 긴장감,<br/><span style="background:linear-gradient(90deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block">압도적인 몰입감</span>
          </h2>
          <p style="font-size:clamp(17px,2.2vw,19px);font-weight:400;color:#94a3b8;line-height:1.7;margin-bottom:40px;word-break:keep-all;letter-spacing:-0.01em;opacity:0.95">
            텍스트에 의존하는 챗봇 형식에서 벗어나,<br/>음성과 표정이 살아있는 AI 아바타 면접관과 대화하며<br/>실제 대면 면접과 동일한 환경을 경험하세요.
          </p>
          <div style="display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#3b82f6;flex-shrink:0"></div><span style="font-size:16px;color:#94a3b8;font-weight:500;word-break:keep-all">감정과 억양이 반영된 고품질 TTS</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#3b82f6;flex-shrink:0"></div><span style="font-size:16px;color:#94a3b8;font-weight:500;word-break:keep-all">상황에 반응하는 AI 아바타</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#3b82f6;flex-shrink:0"></div><span style="font-size:16px;color:#94a3b8;font-weight:500;word-break:keep-all">실전 감각을 극대화하는 UI/UX</span></div>
          </div>
        </div>

        <!-- 텍스트 2: Custom Category — position:absolute -->
        <div id="ai-text-2" style="position:absolute;top:0;left:0;width:100%;opacity:0;transform:translateY(40px);transition:opacity 0.7s cubic-bezier(0.25,1,0.5,1),transform 0.7s cubic-bezier(0.25,1,0.5,1);pointer-events:none">
          <div style="display:inline-flex;align-items:center;justify-content:center;padding:6px 14px;border:1px solid #38bdf8;color:#38bdf8;border-radius:4px;font-size:13px;font-weight:600;margin-bottom:24px;letter-spacing:0.08em;text-transform:uppercase">03 / Custom Category</div>
          <h2 style="font-size:clamp(34px,4.5vw,46px);font-weight:800;color:#ffffff;margin-bottom:28px;letter-spacing:-0.02em;line-height:1.35;word-break:keep-all">
            다양한 카테고리의<br/><span style="background:linear-gradient(90deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block">전문적인 특화 면접</span>
          </h2>
          <p style="font-size:clamp(17px,2.2vw,19px);font-weight:400;color:#94a3b8;line-height:1.7;margin-bottom:40px;word-break:keep-all;letter-spacing:-0.01em;opacity:0.95">
            각 회사별 느낌을 살린 면접<br/>내 상황과 회사 공고기반의 면접<br/>인성, 심층 기술 면접까지<br/>현재의 목표에 맞춘 디테일한 세팅이 가능합니다.
          </p>
          <div style="display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#0ea5e9;flex-shrink:0"></div><span style="font-size:16px;color:#94a3b8;font-weight:500;word-break:keep-all">실 데이터기반 회사별 면접 지원</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#0ea5e9;flex-shrink:0"></div><span style="font-size:16px;color:#94a3b8;font-weight:500;word-break:keep-all">인성면접, 기술면접등 특화 면접 준비</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#0ea5e9;flex-shrink:0"></div><span style="font-size:16px;color:#94a3b8;font-weight:500;word-break:keep-all">신입/경력 연차에 따른 난이도 조절</span></div>
          </div>
        </div>

        <!-- 텍스트 3: Growth Report — position:absolute -->
        <div id="ai-text-3" style="position:absolute;top:0;left:0;width:100%;opacity:0;transform:translateY(40px);transition:opacity 0.7s cubic-bezier(0.25,1,0.5,1),transform 0.7s cubic-bezier(0.25,1,0.5,1);pointer-events:none">
          <div style="display:inline-flex;align-items:center;justify-content:center;padding:6px 14px;border:1px solid #0f172a;color:#0f172a;border-radius:4px;font-size:13px;font-weight:600;margin-bottom:24px;letter-spacing:0.08em;text-transform:uppercase">04 / Growth Report</div>
          <h2 style="font-size:clamp(34px,4.5vw,46px);font-weight:800;color:#0f172a;margin-bottom:28px;letter-spacing:-0.02em;line-height:1.35;word-break:keep-all">
            성장을 증명하는<br/><span style="background:linear-gradient(90deg,#0f172a,#475569);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block">입체적인 평가 리포트</span>
          </h2>
          <p style="font-size:clamp(17px,2.2vw,19px);font-weight:400;color:#475569;line-height:1.7;margin-bottom:40px;word-break:keep-all;letter-spacing:-0.01em;opacity:0.95">
            면접 종료와 동시에 제공되는 다각도 분석 리포트로<br/>답변의 논리성, 직무 적합도, 비언어적 태도까지<br/>명확한 데이터 기반의 개선 방향을 확인하세요.
          </p>
          <div style="display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#334155;flex-shrink:0"></div><span style="font-size:16px;color:#475569;font-weight:500;word-break:keep-all">논리력 및 직무 적합도 AI 스코어링</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#334155;flex-shrink:0"></div><span style="font-size:16px;color:#475569;font-weight:500;word-break:keep-all">아쉬운 답변에 대한 모범 가이드라인 제공</span></div>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:18px;height:1px;background-color:#334155;flex-shrink:0"></div><span style="font-size:16px;color:#475569;font-weight:500;word-break:keep-all">질문의 대답에 대한 세세한 피드백 제공</span></div>
          </div>
        </div>

      </div>
    </div>
    <div style="flex:1"></div>
  </div>
</div>

<!-- ===== 페이지 래퍼 ===== -->
<div style="min-height:100vh;background:radial-gradient(900px 900px at 20% 60%,rgba(211,228,253,0.55) 0%,rgba(211,228,253,0.30) 40%,rgba(211,228,253,0.15) 60%,rgba(211,228,253,0.05) 80%,transparent 100%),radial-gradient(900px 900px at 80% 55%,rgba(213,247,239,0.55) 0%,rgba(213,247,239,0.30) 40%,rgba(213,247,239,0.15) 60%,rgba(213,247,239,0.05) 80%,transparent 100%),#ffffff;position:relative;padding:0;font-family:Pretendard,-apple-system,BlinkMacSystemFont,system-ui,Roboto,'Helvetica Neue','Segoe UI','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif">

  <!-- ===== 히어로 섹션 (z:10 — fixed-bg z:5 보다 위) ===== -->
  <section style="position:relative;z-index:10">
    <div style="max-width:1200px;width:100%;min-height:100vh;margin:0 auto;display:flex;flex-direction:row;gap:60px;align-items:center;justify-content:space-between;padding:0 40px">
      <div style="display:flex;flex-direction:column;flex:1;z-index:2">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;position:relative;z-index:100;margin-left:-40px">
          <span style="font-size:clamp(64px,8vw,100px);font-weight:900;color:#111827;letter-spacing:-0.02em">AI-모의면접</span>
        </div>
        <h1 style="font-size:clamp(28px,4vw,40px);font-weight:700;color:#111827;line-height:1.3;margin:0 0 20px 0;letter-spacing:-0.02em">i-POTEN X AI</h1>
        <p style="font-size:clamp(16px,2vw,18px);font-weight:500;color:#6b7280;margin:0 0 40px 0;line-height:1.6;letter-spacing:-0.01em;word-break:keep-all">
          AI, I-Poten 솔루션으로<br/>합격과 성장에 필요한 모든 것을 연결합니다.
        </p>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <a href="https://i-poten.com/" style="padding:16px 36px;font-size:16px;font-weight:700;color:#fff;background-color:#111827;border-radius:30px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-decoration:none;display:inline-block">지금 시작하기</a>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;flex:1;position:relative;z-index:2">
        <div style="position:relative;width:100%;max-width:480px;display:flex;justify-content:center">
          <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:320%;height:320%;z-index:-2;pointer-events:none" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.6">
              <path d="M 0,250 C 150,-150 1100,-100 950,650 C 850,1100 250,1100 50,800" stroke="url(#p0)" stroke-width="3" stroke-linecap="round"/>
              <path d="M -100,400 C 100,0 950,100 1000,550 C 1050,950 450,1000 150,850" stroke="url(#p1)" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="950" cy="650" r="4" fill="#60a5fa"/><circle cx="50" cy="800" r="5" fill="#34d399"/>
            </g>
            <defs>
              <linearGradient id="p0" x1="0" y1="250" x2="950" y2="650" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#3b82f6"/><stop offset="50%" stop-color="#111827"/><stop offset="100%" stop-color="#34d399"/>
              </linearGradient>
              <linearGradient id="p1" x1="-100" y1="400" x2="1000" y2="550" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#34d399" stop-opacity="0.5"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0.5"/>
              </linearGradient>
            </defs>
          </svg>
          <div style="position:relative;width:100%;border-radius:32px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.12),0 0 0 1px rgba(255,255,255,0.1);z-index:1">
            <img src="/landing-hero.png" alt="아이포텐 AI 모의면접 서비스 화면" width="480" height="360" fetchpriority="high" decoding="async" style="width:100%;height:auto;display:block;object-fit:cover;border-radius:32px"/>
            <div style="position:absolute;inset:-2px;border-radius:34px;background:linear-gradient(135deg,rgba(58,131,243,0.3),rgba(17,184,132,0.3));z-index:-1;filter:blur(20px)"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 기능 섹션: 이미지가 자연 스크롤, 텍스트는 fixed panel (z:10) ===== -->
  <section id="ai-feature-wrapper" style="position:relative;z-index:10">
    <div style="max-width:1200px;width:100%;margin:0 auto;padding:0 40px;display:flex;flex-direction:row">
      <!-- 왼쪽 여백 (fixed 텍스트 패널과 동일 비율 flex:1) -->
      <div style="flex:1"></div>
      <!-- 오른쪽 이미지 열 -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start">

        <!-- 이미지 슬롯 0 — 높이 150vh -->
        <div data-img-block="0" style="width:100%;height:150vh;display:flex;align-items:center;justify-content:flex-start;flex-shrink:0">
          <div style="position:relative;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.26),0 10px 28px rgba(0,0,0,0.14);line-height:0">
            <img src="/feature-1.png" alt="AI 엔진 개인화 면접 질문 생성" loading="lazy" decoding="async" style="width:100%;height:auto;display:block"/>
          </div>
        </div>

        <!-- 이미지 슬롯 1 — 높이 150vh -->
        <div data-img-block="1" style="width:100%;height:150vh;display:flex;align-items:center;justify-content:flex-start;flex-shrink:0">
          <div style="position:relative;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.26),0 10px 28px rgba(0,0,0,0.14);line-height:0">
            <img src="/feature-2.png" alt="AI 아바타 면접관 실전 환경" loading="lazy" decoding="async" style="width:100%;height:auto;display:block"/>
          </div>
        </div>

        <!-- 이미지 슬롯 2 — 높이 150vh -->
        <div data-img-block="2" style="width:100%;height:150vh;display:flex;align-items:center;justify-content:flex-start;flex-shrink:0">
          <div style="position:relative;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.26),0 10px 28px rgba(0,0,0,0.14);line-height:0">
            <img src="/feature-3.png" alt="회사별 맞춤 면접 카테고리 선택" loading="lazy" decoding="async" style="width:100%;height:auto;display:block"/>
          </div>
        </div>

        <!-- 이미지 슬롯 3 — 높이 150vh -->
        <div data-img-block="3" style="width:100%;height:150vh;display:flex;align-items:center;justify-content:flex-start;flex-shrink:0">
          <div style="position:relative;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.26),0 10px 28px rgba(0,0,0,0.14);line-height:0">
            <img src="/feature-4.png" alt="면접 결과 분석 리포트" loading="lazy" decoding="async" style="width:100%;height:auto;display:block"/>
          </div>
        </div>

      </div>
    </div>
  </section>

</div>

<!-- ===== 인라인 바닐라 JS — csr=false여도 HTML에 포함돼 브라우저가 실행 ===== -->
{@html '<script>' + scrollScript + '<\/script>'}
