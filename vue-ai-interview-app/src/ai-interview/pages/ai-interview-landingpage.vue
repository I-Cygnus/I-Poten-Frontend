<template>
<div :style="pageStyle" ref="pageRef">
  <!-- 히어로 섹션 -->
  <section :style="heroSectionStyle" data-hero-section>
    <div :style="heroInnerStyle">
      <div :style="getLeftContentStyle(isPageLoaded)">
        <div :style="brandLogoStyle">
          <span :style="brandTitleStyle">AI-모의면접</span>
<!--          <span :style="brandCrossStyle"></span>-->
<!--          <span :style="brandAiStyle">AI</span>-->
        </div>
        <h1 :style="mainTitleStyle">i-POTEN X AI</h1>
        <p :style="descriptionTextStyle">
          AI, I-Poten 솔루션으로<br/>
          합격과 성장에 필요한 모든 것을 연결합니다.
        </p>
        <div :style="buttonGroupStyle" class="button-group">
          <button :style="primaryButtonStyle" @click="goAiInterview">지금 시작하기</button>
          <button :style="secondaryButtonStyle" @click="scrollToFeatures">둘러보기</button>
        </div>
      </div>
      <div :style="getRightImageStyle(isPageLoaded)">
        <div :style="heroImageWrapperStyle">
          <!-- 배경 곡선 SVG (좌측 상단에서 우측 하단으로 자연스럽게 이어지는 트렌디한 원형 곡선) -->
          <svg :style="curvedLinesStyle" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.6">
              <!-- 부드러운 그라데이션 라인 1 (더 크게) -->
              <path d="M 0,250 C 150,-150 1100,-100 950,650 C 850,1100 250,1100 50,800" stroke="url(#paint0_linear)" stroke-width="3" stroke-linecap="round" />
              <!-- 교차하는 얇은 서브 라인 (더 크게) -->
              <path d="M -100,400 C 100,0 950,100 1000,550 C 1050,950 450,1000 150,850" stroke="url(#paint1_linear)" stroke-width="1.5" stroke-linecap="round" />
              <!-- 데코레이션 닷 -->
              <circle cx="950" cy="650" r="4" fill="#60a5fa" />
              <circle cx="50" cy="800" r="5" fill="#34d399" />
            </g>
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="250" x2="950" y2="650" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="50%" stop-color="#111827" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
              <linearGradient id="paint1_linear" x1="-100" y1="400" x2="1000" y2="550" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#34d399" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.5" />
              </linearGradient>
            </defs>
          </svg>

          <div :style="heroImageCardStyle">
            <img :src="interviewImg" alt="AI Interview" :style="heroImgStyle" />
            <div :style="heroImageGlowStyle"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 고정 배경 오버레이 (기능 섹션 진입 시 나타남) -->
  <div :style="fixedBgStyle"></div>

  <!-- 고정 왼쪽 텍스트 패널 (기능 섹션 진입 시 나타남) -->
  <div :style="fixedTextPanelStyle">
    <div :style="fixedTextLayoutStyle">
      <div :style="fixedTextContentAreaStyle">
        <div :style="textStackStyle">
          <div v-for="(feature, idx) in features" :key="'txt-'+idx"
            :style="getTextItemStyle(idx)">
            <div :style="featureBadgeStyle(idx)">{{ feature.badge }}</div>
            <h3 :style="featureTitleStyle(idx)" v-html="feature.title"></h3>
            <p :style="featureDescStyle(idx)" v-html="feature.desc"></p>
            <div :style="dotsWrapStyle">
              <div :style="dotRowStyle" v-for="(dot, di) in feature.dots" :key="di">
                <div :style="dotLineStyle(idx)"></div>
                <span :style="dotLabelStyle(idx)">{{ dot }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div :style="{ flex: '1' }"></div>
    </div>
  </div>

  <!-- 기능 섹션: 오른쪽 이미지들이 자연 스크롤 (스크롤 높이 제공) -->
  <section :style="featureSectionStyle" ref="featureWrapperRef">
    <div :style="featureInnerStyle">
      <div :style="leftSpacerStyle"></div>
      <div :style="rightColStyle">
        <div v-for="(feature, idx) in features" :key="'img-'+idx"
          :style="imgSlotStyle" :data-img-block="idx">
          
          <div :style="imageGroupWrapperStyle">
            <!-- 배경 장식 엘리먼트 -->
            <div :style="decorativeCircleStyle(idx)"></div>
            <div :style="decorativeGridStyle(idx)"></div>

            <!-- 메인(큰) 이미지 -->
            <div :style="primaryImgCardStyle(idx)">
              <div :style="imgPlaceholderStyle(idx)">{{ feature.imagePlaceholder[0] }}</div>
            </div>
            
            <!-- 서브(작은, 겹쳐진) 이미지 -->
            <div :style="secondaryImgCardStyle(idx)">
              <div :style="imgPlaceholderStyle(idx, true)">{{ feature.imagePlaceholder[1] }}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>

  <!-- 스크롤 탑 버튼 -->
  <button :style="scrollTopBtnStyle" @click="scrollToTop" aria-label="맨 위로">↑</button>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import interviewImg from '@/assets/interview.png';

const router = useRouter();

const isPageLoaded = ref(false);
const activeFeatureIndex = ref(0);
const isInFeatureSection = ref(false);
const featureWrapperRef = ref(null);
const pageRef = ref(null);

const features = ref([
  {
    badge: '01 / Core Engine',
    title: '지원자를 완벽히 분석하는<br /><span style="background:linear-gradient(90deg,#1e3a8a,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;">초개인화 AI 엔진</span>',
    desc: '단순한 범용 질문이 아닙니다.<br/>이력서와 포트폴리오를 다각도로 분석하여<br/>지원자만의 강점과 약점을 파고드는 실전 질문을 생성합니다.',
    dots: ['이력서 기반 심층 키워드 추출', '직무 역량과 연계된 꼬리 질문 생성', '예상되는 압박 질문 사전 대비'],
    bgColor: '#ffffff',
    titleColor: '#0f172a',
    descColor: '#475569',
    badgeColor: '#1e3a8a',
    accentColor: '#2563eb',
    imagePlaceholder: ['이력서 분석 대시보드', '키워드 추출 데이터']
  },
  {
    badge: '02 / Real Experience',
    title: '실제 면접장의 긴장감,<br /><span style="background:linear-gradient(90deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;">압도적인 몰입감</span>',
    desc: '텍스트에 의존하는 챗봇 형식에서 벗어나,<br/>음성과 표정이 살아있는 AI 아바타 면접관과 대화하며<br/>실제 대면 면접과 동일한 환경을 경험하세요.',
    dots: ['감정과 억양이 반영된 고품질 TTS', '상황에 즉각적으로 반응하는 AI 아바타', '실전 감각을 극대화하는 UI/UX'],
    bgColor: '#0b1120',
    titleColor: '#ffffff',
    descColor: '#94a3b8',
    badgeColor: '#60a5fa',
    accentColor: '#3b82f6',
    imagePlaceholder: ['AI 아바타 진행 화면', '실시간 음성 파형/자막']
  },
  {
    badge: '03 / Custom Category',
    title: '목적에 따라 세분화된<br /><span style="background:linear-gradient(90deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;">전문적인 면접 세팅</span>',
    desc: '개발, 기획, 마케팅 등의 직무 전문 면접부터<br/>인성, 임원, 심층 기술 면접까지<br/>현재의 목표에 맞춘 디테일한 세팅이 가능합니다.',
    dots: ['직군 및 직무별 전문 면접 지원', '신입/경력 연차에 따른 난이도 조절', '취약 역량 집중 트레이닝 모드'],
    bgColor: '#111827',
    titleColor: '#ffffff',
    descColor: '#94a3b8',
    badgeColor: '#38bdf8',
    accentColor: '#0ea5e9',
    imagePlaceholder: ['면접 세팅 컨트롤러', '직무 선택 드롭다운']
  },
  {
    badge: '04 / Growth Report',
    title: '성장을 증명하는<br /><span style="background:linear-gradient(90deg,#0f172a,#475569);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;">입체적인 평가 리포트</span>',
    desc: '면접 종료와 동시에 제공되는 다각도 분석 리포트로<br/>답변의 논리성, 직무 적합도, 비언어적 태도까지<br/>명확한 데이터 기반의 개선 방향을 확인하세요.',
    dots: ['논리력 및 직무 적합도 AI 스코어링', '아쉬운 답변에 대한 모범 가이드라인 제공', '목소리 톤 및 표정 변화 분석 데이터'],
    bgColor: '#f8fafc',
    titleColor: '#0f172a',
    descColor: '#475569',
    badgeColor: '#0f172a',
    accentColor: '#334155',
    imagePlaceholder: ['종합 결과 스코어 카드', '상세 피드백 차트']
  }
]);

const goAiInterview = () => {
  router.push('/ai-interview/select');
};
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const c = document.querySelector('#app') || document.body;
  if (c) c.scrollTo({ top: 0, behavior: 'smooth' });
  const root = pageRef.value;
  if (root) {
    let parent = root.parentElement;
    while (parent) {
      const s = window.getComputedStyle(parent);
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') {
        parent.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
      parent = parent.parentElement;
    }
  }
};
const scrollToFeatures = () => {
  const el = featureWrapperRef.value;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// requestAnimationFrame 기반 스크롤 추적 (Shadow DOM에서도 확실히 작동)
let rafId = null;
const tick = () => {
  const wrapper = featureWrapperRef.value;
  if (wrapper) {
    const rect = wrapper.getBoundingClientRect();
    const vh = window.innerHeight;

    // 기능 섹션이 뷰포트를 채우고 있는지 판별
    isInFeatureSection.value = rect.top <= 0 && rect.bottom >= vh;

    // 뷰포트 중앙에 가장 가까운 이미지 블록 찾기
    const blocks = wrapper.querySelectorAll('[data-img-block]');
    const center = vh / 2;
    let best = 0;
    let bestDist = Infinity;
    blocks.forEach((b) => {
      const i = parseInt(b.getAttribute('data-img-block'), 10);
      const r = b.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    activeFeatureIndex.value = best;
  }
  rafId = requestAnimationFrame(tick);
};

onMounted(() => {
  setTimeout(() => { isPageLoaded.value = true; }, 50);
  rafId = requestAnimationFrame(tick);
});
onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});

// ========== 스타일 정의 ==========
const pageStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(900px 900px at 20% 60%, rgba(211,228,253,0.55) 0%, rgba(211,228,253,0.30) 40%, rgba(211,228,253,0.15) 60%, rgba(211,228,253,0.05) 80%, transparent 100%), radial-gradient(900px 900px at 80% 55%, rgba(213,247,239,0.55) 0%, rgba(213,247,239,0.30) 40%, rgba(213,247,239,0.15) 60%, rgba(213,247,239,0.05) 80%, transparent 100%), #ffffff',
  position: 'relative',
  padding: '0',
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif'
};

// 히어로
const heroSectionStyle = { position: 'relative', zIndex: 10 };
const heroInnerStyle = { maxWidth: '1200px', width: '100%', minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'row', gap: '60px', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' };
const getLeftContentStyle = (l) => ({ display: 'flex', flexDirection: 'column', flex: '1', zIndex: 2, opacity: l ? 1 : 0, transform: l ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.9s ease, transform 0.9s ease' });
const getRightImageStyle = (l) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', position: 'relative', zIndex: 2, opacity: l ? 1 : 0, transform: l ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 1s ease 0.2s, transform 1s ease 0.2s' });
const brandLogoStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  marginBottom: '20px', 
  position: 'relative', 
  zIndex: 100, 
  marginLeft: '-40px' 
};
const brandTitleStyle = { fontSize: 'clamp(64px, 8vw, 100px)', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' };
const brandCrossStyle = { fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '500', color: '#4b5563' };
const brandAiStyle = { fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' };
const mainTitleStyle = { fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', color: '#111827', lineHeight: '1.3', margin: '0 0 20px 0', letterSpacing: '-0.02em' };
const descriptionTextStyle = { fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: '500', color: '#6b7280', margin: '0 0 40px 0', lineHeight: '1.6', letterSpacing: '-0.01em', wordBreak: 'keep-all' };
const buttonGroupStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' };
const primaryButtonStyle = { padding: '16px 36px', fontSize: '16px', fontWeight: '700', color: '#fff', backgroundColor: '#111827', border: 'none', borderRadius: '30px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const secondaryButtonStyle = { padding: '16px 36px', fontSize: '16px', fontWeight: '700', color: '#fff', backgroundColor: '#374151', border: 'none', borderRadius: '30px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };

const heroImageWrapperStyle = { position: 'relative', width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'center' };
const curvedLinesStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '320%', height: '320%', zIndex: -2, pointerEvents: 'none' };

const heroImageCardStyle = { position: 'relative', width: '100%', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)', zIndex: 1 };
const heroImgStyle = { width: '100%', height: 'auto', display: 'block', objectFit: 'cover', borderRadius: '32px' };
const heroImageGlowStyle = { position: 'absolute', inset: '-2px', borderRadius: '34px', background: 'linear-gradient(135deg, rgba(58,131,243,0.3), rgba(17,184,132,0.3))', zIndex: -1, filter: 'blur(20px)' };

// ========== 고정 오버레이 (position: fixed — Shadow DOM에서도 작동) ==========
const fixedBgStyle = computed(() => ({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: features.value[activeFeatureIndex.value].bgColor,
  transition: 'background-color 0.6s ease, opacity 0.5s ease',
  opacity: isInFeatureSection.value ? 1 : 0,
  pointerEvents: 'none',
  zIndex: 5
}));

const fixedTextPanelStyle = computed(() => ({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  opacity: isInFeatureSection.value ? 1 : 0,
  transition: 'opacity 0.5s ease',
  pointerEvents: isInFeatureSection.value ? 'auto' : 'none',
  zIndex: 15
}));

const fixedTextLayoutStyle = {
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  padding: '0 40px',
  display: 'flex',
  flexDirection: 'row'
};

const fixedTextContentAreaStyle = {
  flex: '1',
  display: 'flex',
  alignItems: 'center',
  paddingRight: '60px'
};

const textStackStyle = {
  position: 'relative',
  width: '100%',
};

const getTextItemStyle = (idx) => ({
  position: idx === 0 ? 'relative' : 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  opacity: activeFeatureIndex.value === idx ? 1 : 0,
  transform: activeFeatureIndex.value === idx ? 'translateY(0)' : 'translateY(40px)',
  transition: 'opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1), transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
  pointerEvents: (isInFeatureSection.value && activeFeatureIndex.value === idx) ? 'auto' : 'none'
});

const featureBadgeStyle = (idx) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', border: `1px solid ${features.value[idx].badgeColor}`, color: features.value[idx].badgeColor, borderRadius: '4px', fontSize: '13px', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.08em', textTransform: 'uppercase' });
const featureTitleStyle = (idx) => ({ fontSize: 'clamp(34px, 4.5vw, 46px)', fontWeight: '800', color: features.value[idx].titleColor, marginBottom: '28px', letterSpacing: '-0.02em', lineHeight: '1.35', wordBreak: 'keep-all' });
const featureDescStyle = (idx) => ({ fontSize: 'clamp(17px, 2.2vw, 19px)', fontWeight: '400', color: features.value[idx].descColor, lineHeight: '1.7', marginBottom: '40px', wordBreak: 'keep-all', letterSpacing: '-0.01em', opacity: '0.95' });
const dotsWrapStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };
const dotRowStyle = { display: 'flex', alignItems: 'center', gap: '14px' };
const dotLineStyle = (idx) => ({ width: '18px', height: '1px', backgroundColor: features.value[idx].accentColor, flexShrink: 0 });
const dotLabelStyle = (idx) => ({ fontSize: '16px', color: features.value[idx].descColor, lineHeight: '1.5', fontWeight: '500', wordBreak: 'keep-all' });

// ========== 기능 섹션 (이미지 스크롤 영역) ==========
const featureSectionStyle = {
  position: 'relative',
  zIndex: 10
};

const featureInnerStyle = {
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  padding: '0 40px',
  display: 'flex',
  flexDirection: 'row'
};

const leftSpacerStyle = {
  flex: '1'
};

const rightColStyle = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const imgSlotStyle = {
  width: '100%',
  maxWidth: '760px', // 영역을 더 넓혀서 두 이미지가 여유있게 배치되도록 함
  height: '200vh', // 150vh -> 200vh로 변경하여 스크롤 구간을 더 넓힘
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const imageGroupWrapperStyle = {
  position: 'relative',
  width: '100%',
  height: '560px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const decorativeCircleStyle = (idx) => {
  const isLight = features.value[idx].bgColor === '#ffffff' || features.value[idx].bgColor === '#f8fafc';
  return {
    position: 'absolute',
    top: '5%',
    left: '10%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: features.value[idx].accentColor,
    filter: 'blur(90px)',
    opacity: isLight ? 0.15 : 0.3,
    zIndex: 0,
    transition: 'background 0.5s ease, opacity 0.5s ease'
  };
};

const decorativeGridStyle = (idx) => {
  const isLight = features.value[idx].bgColor === '#ffffff' || features.value[idx].bgColor === '#f8fafc';
  return {
    position: 'absolute',
    bottom: '-5%',
    right: '0%',
    width: '250px',
    height: '250px',
    backgroundImage: isLight 
      ? 'radial-gradient(rgba(0,0,0,0.15) 2px, transparent 2px)' 
      : 'radial-gradient(rgba(255,255,255,0.15) 2px, transparent 2px)',
    backgroundSize: '24px 24px',
    zIndex: 0,
    opacity: 0.8,
    transition: 'background-image 0.5s ease'
  };
};

const primaryImgCardStyle = (idx) => {
  const isLight = features.value[idx].bgColor === '#ffffff' || features.value[idx].bgColor === '#f8fafc';
  return {
    background: isLight ? '#ffffff' : '#0f172a',
    borderRadius: '24px',
    width: '68%',
    height: '400px',
    position: 'absolute',
    bottom: '20px',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
    boxShadow: isLight ? '0 30px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.03)' : '0 30px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
    transition: 'background 0.5s ease, border 0.5s ease, box-shadow 0.5s ease, transform 0.5s ease',
    overflow: 'hidden',
    zIndex: 2,
    transform: 'perspective(1200px) rotateY(4deg) rotateX(2deg)' // 조금 더 역동적인 입체감
  };
};

const secondaryImgCardStyle = (idx) => {
  const isLight = features.value[idx].bgColor === '#ffffff' || features.value[idx].bgColor === '#f8fafc';
  return {
    background: isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(30, 41, 59, 0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '20px',
    width: '45%',
    height: '260px',
    position: 'absolute',
    top: '-10px',
    right: '-80px',  // 바깥으로 과감하게 빼기
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: isLight ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.15)',
    boxShadow: isLight ? '0 15px 40px rgba(0,0,0,0.06)' : '0 15px 40px rgba(0,0,0,0.5)',
    transition: 'background 0.5s ease, border 0.5s ease, box-shadow 0.5s ease, transform 0.5s ease',
    overflow: 'hidden',
    zIndex: 1,
    transform: 'perspective(1200px) rotateY(-5deg) rotateX(-2deg) translateY(-10px)' // 역동적인 비대칭 배치
  };
};

const imgPlaceholderStyle = (idx, isSecondary = false) => {
  const isLight = features.value[idx].bgColor === '#ffffff' || features.value[idx].bgColor === '#f8fafc';
  return {
    color: isLight ? '#94a3b8' : '#475569',
    fontSize: isSecondary ? '13px' : '15px',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: '0.02em',
    padding: '0 20px',
    lineHeight: '1.4',
    wordBreak: 'keep-all'
  };
};

const scrollTopBtnStyle = {
  position: 'fixed', bottom: '40px', right: '40px', width: '50px', height: '50px',
  borderRadius: '50%', background: '#fff', color: '#111827', border: 'none',
  fontSize: '20px', fontWeight: '700', cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'all 0.3s ease',
  zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
};
</script>

<style scoped>
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
}
button:active {
  transform: translateY(0);
}

@media (max-width: 968px) {
  [data-hero-section] > div {
    flex-direction: column !important;
    text-align: center;
    padding-top: 100px !important;
  }
  .button-group {
    justify-content: center !important;
  }
}

@media (max-width: 640px) {
  [data-hero-section] > div {
    padding: 60px 20px !important;
  }
  .button-group {
    flex-direction: column;
    width: 100%;
  }
  .button-group button {
    width: 100%;
  }
}
</style>
