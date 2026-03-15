<template>
  <main>
    <!-- 상단 로고 -->
    <div :style="topLogoContainerStyle" @click="goHome">
      <img :src="Logo" alt="i-Poten Logo" :style="topLogoStyle" />
    </div>

    <v-container align-center :style="containerStyle">
      <v-btn 
        icon 
        @click="goBack" 
        :style="backButtonStyle"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      
      <div :style="selectionContainerStyle">
        <div :style="titleContainerStyle">
          <h2 :style="enhancedTitleStyle">
            <span :style="titleHighlightStyle">{{ pageTitle }}</span>
          </h2>
          <div :style="titleUnderlineStyle"></div>
          <p :style="titleDescriptionStyle">{{ pageDescription }}</p>
        </div>
        
        <!-- 면접 세부 유형 선택 (카드형 디자인) -->
        <div v-if="interviewType === '전형별'" :style="interviewOptionsWrapperStyle">
          <div 
            v-for="(option, index) in interviewSubTypes" 
            :key="index"
            :style="getCardStyle(index, hoveredCardIndex === index, cardsVisible)"
            @click="selectInterviewSubType(option.type)"
            @mouseenter="hoveredCardIndex = index"
            @mouseleave="hoveredCardIndex = null"
          >
            <!-- 이미지 카드 -->
            <img
              :src="option.image"
              :style="option.status === 'preparing' ? preparingCardImageStyle : cardImageStyle"
              :alt="option.title"
            />
            
            <!-- 호버 오버레이 -->
            <div :style="cardHoverOverlay(hoveredCardIndex === index)"></div>
            
            <!-- 준비중 블러 오버레이 (기술/종합 면접) -->
            <div v-if="option.status === 'preparing'" :style="preparingOverlayStyle">
              <div :style="preparingOverlayContentStyle">
                <v-icon size="36" color="white" style="margin-bottom: 12px; opacity: 0.9;">mdi-lock-outline</v-icon>
                <span :style="preparingOverlayTextStyle">COMING SOON</span>
                <span :style="preparingOverlaySubTextStyle">준비 중인 기능입니다</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 기업별 면접 - 회사 선택 (기존 유지하되 스타일 보정) -->
        <div v-else-if="interviewType === '기업별'" :style="companySelectionWrapperStyle">
          <div :style="companyGridContainerStyle">
            <div 
              v-for="(company, index) in companies" 
              :key="index"
              :style="[companyCardStyle, selectedCompany === company.name ? companyCardSelectedStyle : {}]"
              @click="selectCompany(company)"
              class="company-card"
              :class="{ 'selected': selectedCompany === company.name }"
            >
              <div :style="companyImageContainerStyle">
                <img 
                  :src="getCompanyImage(company)" 
                  :alt="company.name + ' 로고'"
                  :style="companyImageStyle"
                />
              </div>
              <div :style="companyNameStyle">{{ company.name }}</div>
              <div class="card-glow"></div>
            </div>
          </div>
          
          <div v-if="selectedCompany" :style="companyButtonContainerStyle">
            <v-btn 
              color="primary" 
              @click="goToDetailForm"
            >
              <v-icon left>mdi-arrow-right</v-icon>
              다음 단계로
            </v-btn>
          </div>
        </div>
        
        <!-- 채용공고별 면접 (준비중) -->
        <div v-else-if="interviewType === '채용공고별'" :style="preparingContainerStyle">
          <v-icon size="64" color="#3b82f6" :style="preparingIconStyle">mdi-clock-outline</v-icon>
          <p :style="preparingTextStyle">채용공고별 면접 기능은 현재 개발 중입니다.</p>
          <p :style="preparingSubtextStyle">곧 만나보실 수 있습니다.</p>
          
          <v-btn
            color="#3b82f6"
            @click="goBack"
            :style="backToSelectionBtnStyle"
          >
            이전 화면으로 돌아가기
          </v-btn>
        </div>
      </div>
    </v-container>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Logo from '@/assets/Logo.png';
import IImg from '@/assets/I.png';
import imsiImg from '@/assets/imsi.png';

// 기업 로고 임포트
import encore from '../../assets/images/company/Encore.png'
import kt from '../../assets/images/company/kt.png'
import dang from '../../assets/images/company/dang.png'
import kakao from '../../assets/images/company/kakao.png'
import naver from '../../assets/images/company/naver.png'
import toss from '../../assets/images/company/toss.png'
import coupang from '../../assets/images/company/coupang.png'

const router = useRouter();
const route = useRoute();

const interviewType = ref(route.params.type || '');
const hoveredCardIndex = ref(null);
const cardsVisible = ref(false);
const selectedCompany = ref("");

const pageTitle = computed(() => {
  if (interviewType.value === '전형별') return '면접 세부 유형을 선택해주세요';
  if (interviewType.value === '기업별') return '회사를 선택해주세요';
  if (interviewType.value === '채용공고별') return '채용공고별 면접 준비';
  return '';
});

const pageDescription = computed(() => {
  if (interviewType.value === '전형별') return '자신에게 맞는 면접 세부 유형을 선택하여 맞춤형 면접을 준비해보세요';
  if (interviewType.value === '기업별') return '지원하려는 회사를 선택하여 해당 기업에 맞는 맞춤형 면접을 준비해보세요';
  if (interviewType.value === '채용공고별') return '지원하려는 채용공고에 맞춰 맞춤형 면접을 준비해보세요';
  return '';
});

const goHome = () => { window.location.href = '/'; };
const goBack = () => { router.push('/ai-interview/select'); };

// 면접 세부 유형 데이터 (I.png 및 imsi.png 적용)
const interviewSubTypes = [
  {
    type: "기술면접",
    title: "기술 면접",
    description: "기술적 역량을 평가하는 면접",
    status: "preparing",
    image: imsiImg
  },
  {
    type: "인성면접",
    title: "인성 면접",
    description: "인성과 조직 적합성을 평가하는 면접",
    status: "active",
    image: IImg
  },
  {
    type: "종합면접",
    title: "종합 면접",
    description: "기술과 인성을 종합적으로 평가하는 면접",
    status: "preparing",
    image: imsiImg
  }
];

const selectInterviewSubType = (type) => {
  const option = interviewSubTypes.find(opt => opt.type === type);
  if (option && option.status === 'preparing') {
    alert('해당 기능은 현재 준비 중입니다.');
    return;
  }
  
  router.push({
    name: 'ai-interview-form',
    params: { type: interviewType.value, subType: type }
  });
};

// 기업 목록
const companies = [
  { id: 'SK-encore', name: 'SK-encore', logo: encore },
  { id: 'kakao', name: '카카오', logo: kakao },
  { id: 'naver', name: '네이버', logo: naver },
  { id: '라인', name: '라인', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg' },
  { id: 'coupang', name: '쿠팡', logo: coupang },
  { id: 'KT M mobile', name: 'KT M mobile', logo: kt },
  { id: 'toss', name: '토스', logo: toss },
  { id: 'daangn', name: '당근마켓', logo: dang }
];

const getCompanyImage = (company) => company.logo || `https://via.placeholder.com/100?text=${company.name}`;
const selectCompany = (company) => { selectedCompany.value = selectedCompany.value === company.name ? '' : company.name; };
const goToDetailForm = () => {
  if (!selectedCompany.value) { alert("회사를 선택해 주세요."); return; }
  router.push({ name: 'ai-interview-form', params: { type: interviewType.value, company: selectedCompany.value } });
};

onMounted(() => {
  if (!interviewType.value) { router.push('/ai-interview/select'); }
  setTimeout(() => { cardsVisible.value = true; }, 100);
});

// ---------- 스타일 (ai-interview-select.vue에서 복사) ---------- //
const containerStyle = { 
  marginBottom: '0',
  marginTop: '0', 
  maxWidth: '100%',
  width: '100%',
  background: 'linear-gradient(180deg, #faf9fb 0%, #f5f3f7 50%, #ede9f2 100%)',
  minHeight: '100vh',
  padding: '120px 40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const topLogoContainerStyle = {
  position: 'fixed',
  top: '30px',
  left: '40px',
  zIndex: 1000,
  cursor: 'pointer'
};

const topLogoStyle = { height: '40px', width: 'auto' };

const titleContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '3rem',
  width: '100%'
};

const enhancedTitleStyle = {
  fontSize: '2.2rem',
  fontWeight: '800',
  color: '#1e293b',
  marginBottom: '0.5rem',
  textAlign: 'center',
  lineHeight: '1.3'
};

const titleHighlightStyle = { color: '#4F9CF9', fontWeight: '800' };

const titleUnderlineStyle = {
  width: '80px',
  height: '4px',
  background: 'linear-gradient(90deg, #4F9CF9 0%, #10B981 100%)',
  borderRadius: '2px',
  marginBottom: '1.5rem'
};

const titleDescriptionStyle = {
  fontSize: '1.1rem',
  color: '#64748b',
  textAlign: 'center',
  maxWidth: '700px',
  lineHeight: '1.6'
};

const selectionContainerStyle = {
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const interviewOptionsWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '32px',
  flexWrap: 'wrap',
  padding: '20px'
};

const getCardStyle = (index, isHovered, isVisible) => {
  const animationDelay = `${index * 0.1}s`;
  return {
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: `transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, opacity 0.6s ease-out ${animationDelay}`,
    boxShadow: isHovered
      ? '0 36px 72px rgba(0,0,0,0.28), 0 12px 24px rgba(0,0,0,0.12)'
      : '0 16px 40px rgba(0,0,0,0.15)',
    width: '300px',
    height: '450px',
    opacity: isVisible ? 1 : 0,
    transform: isHovered ? 'translateY(-16px) scale(1.04)' : isVisible ? 'translateY(0)' : 'translateY(40px)',
    zIndex: isHovered ? 100 : index + 1,
  };
};

const cardImageStyle = {
  position: 'absolute',
  inset: '0',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center 20%' // 이미지를 약간 아래로 밀어냄
};

const preparingCardImageStyle = {
  position: 'absolute',
  top: '25%', // 제목 영역 확보를 위해 더 아래로 내림 (기존 15%)
  left: '10%',
  width: '80%',
  height: '70%',
  objectFit: 'contain',
  opacity: '0.7',
  filter: 'grayscale(0.4)'
};

const cardHoverOverlay = (isHovered) => ({
  position: 'absolute',
  inset: '0',
  background: isHovered ? 'rgba(0,0,0,0.1)' : 'transparent',
  transition: 'background 0.3s ease',
  zIndex: 5
});

const preparingOverlayStyle = {
  position: 'absolute',
  inset: '0',
  background: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const preparingOverlayContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '24px',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)'
};

const preparingOverlayTextStyle = {
  color: '#ffffff',
  fontSize: '1.2rem',
  fontWeight: '800',
  letterSpacing: '0.15em',
  marginBottom: '4px'
};

const preparingOverlaySubTextStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.85rem',
  fontWeight: '500'
};

const backButtonStyle = {
  position: 'absolute',
  top: '40px',
  left: '150px',
  zIndex: 10,
};

// 기업 선택 스타일
const companySelectionWrapperStyle = { width: '100%', maxWidth: '1000px', margin: '0 auto' };
const companyGridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '24px',
  padding: '0 16px'
};

const companyCardStyle = {
  position: 'relative',
  borderRadius: '20px',
  background: 'white',
  padding: '32px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};

const companyCardSelectedStyle = {
  borderColor: '#4F9CF9',
  boxShadow: '0 12px 24px rgba(79, 156, 249, 0.2)',
  transform: 'translateY(-5px)'
};

const companyImageContainerStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  overflow: 'hidden'
};

const companyImageStyle = { width: '70%', height: '70%', objectFit: 'contain' };
const companyNameStyle = { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' };

const companyButtonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "4rem",
  '& button': {
    padding: '16px 48px',
    fontSize: '1.1rem',
    fontWeight: '700',
    borderRadius: '50px',
    background: 'linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)',
    color: 'white',
    boxShadow: '0 8px 24px rgba(79, 156, 249, 0.4)'
  }
};

const preparingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5rem',
  background: 'white',
  borderRadius: '32px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.05)'
};

const preparingIconStyle = { marginBottom: '24px' };
const preparingTextStyle = { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' };
const preparingSubtextStyle = { fontSize: '1.1rem', color: '#64748b', marginBottom: '32px' };
const backToSelectionBtnStyle = {
  padding: '14px 32px',
  borderRadius: '50px',
  background: 'linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)',
  color: 'white',
  fontWeight: '700'
};

</script>
