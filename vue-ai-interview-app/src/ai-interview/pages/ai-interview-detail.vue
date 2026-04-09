<template>
  <main>
    <!-- 상단 로고 -->
    <div :style="topLogoContainerStyle" @click="goHome">
      <img :src="Logo" alt="i-Poten Logo" :style="topLogoStyle" />
    </div>

    <v-container align-center :style="containerStyle">
      <div :style="selectionContainerStyle">
        <!-- 뒤로가기 버튼 (상단 배치) -->
        <div :style="backButtonWrapperStyle" @click="goBack" class="back-btn-hover">
          <div :style="backButtonStyle">
            <v-icon color="#111111" size="20">mdi-arrow-left</v-icon>
          </div>
          <span :style="backButtonTextStyle">뒤로가기</span>
        </div>

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

        <!-- 기업별 면접 - 회사 선택 (트렌디 & 포멀 업그레이드) -->
        <div v-else-if="interviewType === '기업별'" :style="companySelectionWrapperStyle">
          <!-- 상단 서비스 배지 -->
          <div :style="aiServiceLabelContainerStyle">
            <div :style="aiCapsuleBadgeStyle">
              <div :style="aiDotStyle"></div>
              <span :style="aiCapsuleTextStyle">AI TECH PREMIUM</span>
            </div>
          </div>

          <div :style="companyGridContainerStyle">
            <div 
              v-for="(company, index) in companies" 
              :key="index"
              :style="[companyCardStyle, selectedCompany === company.name ? companyCardSelectedStyle : {}]"
              @click="selectCompany(company)"
              class="company-card-animation"
            >
              <div :style="companyImageContainerStyle">
                <img 
                  :src="getCompanyImage(company)" 
                  :alt="company.name + ' 로고'"
                  :style="companyImageStyle"
                />
              </div>
              <div :style="[companyNameStyle, selectedCompany === company.name ? companyNameSelectedStyle : {}]">{{ company.name }}</div>
              
              <!-- 선택 시 체크 표시 -->
              <div v-if="selectedCompany === company.name" :style="selectionCheckStyle">
                <v-icon size="14" color="white">mdi-check</v-icon>
              </div>
            </div>
          </div>
          
          <div v-if="selectedCompany" :style="companyButtonContainerStyle">
            <button 
              :style="nextStepButtonStyle"
              @click="goToDetailForm"
            >
              다음 단계로 이동하기
            </button>
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

    <!-- 커스텀 시스템 메시지 모달 -->
    <div v-if="showSystemModal" :style="modalOverlayStyle" @click="showSystemModal = false">
      <div :style="modalContentStyle" @click.stop>
        <div :style="modalIconContainerStyle">
          <div :style="modalIconCircleStyle">
            <v-icon color="white" size="32">mdi-alert-circle-outline</v-icon>
          </div>
        </div>
        <h2 :style="modalTitleStyle">알림</h2>
        <p :style="modalMessageStyle">{{ alertMessage }}</p>
        <div :style="modalButtonGroupStyle">
          <button :style="modalConfirmButtonStyle" @click="showSystemModal = false">
            확인
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Logo from '@/assets/Logo.png';
import IImg from '@/assets/I.png';
import imsiImg from '@/assets/imsi.png';
import SystemMessageModal from '../../components/common/SystemMessageModal.vue';

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
const showPreparingModal = ref(false);
const showSystemModal = ref(false);
const alertMessage = ref('');

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

const closePreparingModal = () => {
  showPreparingModal.value = false;
};

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
    showPreparingModal.value = true;
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
  if (!selectedCompany.value) { 
    alertMessage.value = "회사를 선택해 주세요.";
    showSystemModal.value = true;
    return; 
  }
  router.push({ name: 'ai-interview-form', params: { type: interviewType.value, company: selectedCompany.value } });
};

onMounted(() => {
  if (!interviewType.value) { router.push('/ai-interview/select'); }
  setTimeout(() => { cardsVisible.value = true; }, 100);
});

// ---------- 스타일 (ai-interview-select.vue에서 복사) ---------- //
const modalOverlayStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '20px',
  animation: 'fadeIn 0.3s ease-out'
};

const modalContentStyle = {
  background: '#ffffff',
  borderRadius: '32px',
  padding: '48px 40px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15)',
  textAlign: 'center',
  position: 'relative',
  animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
};

const modalIconContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '24px'
};

const modalIconCircleStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #4F9CF9 0%, #3b82f6 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 24px rgba(79, 156, 249, 0.3)'
};

const modalTitleStyle = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#0f172a',
  marginBottom: '16px',
  letterSpacing: '-0.02em'
};

const modalMessageStyle = {
  fontSize: '16px',
  color: '#64748b',
  lineHeight: '1.6',
  marginBottom: '32px',
  fontWeight: '500',
  wordBreak: 'keep-all'
};

const modalButtonGroupStyle = {
  display: 'flex',
  justifyContent: 'center'
};

const modalConfirmButtonStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '16px',
  border: 'none',
  background: '#1e293b',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
};
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

const backButtonWrapperStyle = {
  alignSelf: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  marginBottom: '40px',
  transition: 'transform 0.2s ease',
};

const backButtonStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

const backButtonTextStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#4B5563',
};

// ========== AI 배지 스타일 (ai-interview-select.vue와 통일) ========== //
const aiServiceLabelContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '32px',
};

const aiCapsuleBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 16px',
  borderRadius: '40px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
  border: '1px solid rgba(79, 156, 249, 0.3)',
};

const aiDotStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: '#4F9CF9',
  boxShadow: '0 0 8px #4F9CF9',
};

const aiCapsuleTextStyle = {
  color: '#1e293b',
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

// 기업 선택 스타일
const companySelectionWrapperStyle = { 
  width: '100%', 
  maxWidth: '1100px', 
  margin: '0 auto',
  animation: 'fadeInUp 0.6s ease-out'
};

const companyGridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '28px',
  padding: '20px'
};

const companyCardStyle = {
  position: 'relative',
  borderRadius: '28px',
  background: '#ffffff',
  padding: '40px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
  border: '1.5px solid rgba(0,0,0,0.04)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
};

const companyCardSelectedStyle = {
  borderColor: '#4F9CF9',
  background: 'rgba(79, 156, 249, 0.02)',
  boxShadow: '0 20px 48px rgba(79, 156, 249, 0.12)',
  transform: 'translateY(-8px)'
};

const selectionCheckStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#4F9CF9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 10px rgba(79, 156, 249, 0.3)',
  animation: 'scaleIn 0.3s ease-out'
};

const companyImageContainerStyle = {
  width: '110px',
  height: '110px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.02)'
};

const companyImageStyle = { width: '65%', height: '65%', objectFit: 'contain' };

const companyNameStyle = { 
  fontSize: '1.15rem', 
  fontWeight: '700', 
  color: '#475569',
  transition: 'color 0.3s ease'
};

const companyNameSelectedStyle = {
  color: '#1e293b'
};

const companyButtonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "5rem",
};

const nextStepButtonStyle = {
  padding: '18px 64px',
  fontSize: '1.1rem',
  fontWeight: '800',
  borderRadius: '18px',
  background: '#1e293b',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 10px 25px rgba(30, 41, 59, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#0f172a',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 35px rgba(30, 41, 59, 0.35)'
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

onMounted(() => {
  if (!interviewType.value) { router.push('/ai-interview/select'); }
  setTimeout(() => { cardsVisible.value = true; }, 100);
});
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.company-card-animation {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.company-card-animation:hover:not(.selected) {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  border-color: rgba(79, 156, 249, 0.2);
}

.back-btn-hover:hover {
  transform: translateX(-4px);
}
</style>
