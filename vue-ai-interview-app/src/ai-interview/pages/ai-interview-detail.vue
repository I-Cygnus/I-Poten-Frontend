<template>
  <main>
    <v-container align-center :style="containerStyle">
      <v-btn 
        icon 
        @click="goBack" 
        :style="backButtonStyle"
        class="elevation-1"
        aria-label="뒤로 가기"
      >
        <v-icon size="24">mdi-arrow-left</v-icon>
      </v-btn>
      
      <div :style="selectionContainerStyle">
        <div :style="titleContainerStyle">
          <h2 :style="enhancedTitleStyle">
            <span :style="titleHighlightStyle">{{ pageTitle }}</span>
          </h2>
          <div :style="titleUnderlineStyle"></div>
          <p :style="titleDescriptionStyle">{{ pageDescription }}</p>
        </div>
        
        <!-- 전형별 면접 - 세부 유형 선택 -->
        <div v-if="interviewType === '전형별'" :style="interviewOptionsWrapperStyle">
          <div 
            v-for="(option, index) in interviewSubTypes" 
            :key="index"
            :style="[interviewTypeItemStyle, 
                    selectedInterviewSubType === option.type ? selectedInterviewTypeItemStyle : {}, 
                    option.status === 'preparing' ? preparingInterviewTypeItemStyle : {}]"
            @click="selectInterviewSubType(option.type)"
          >
            <div :style="interviewTypeIconStyle">
              <v-icon size="32" :color="selectedInterviewSubType === option.type ? 'white' : 'primary'">
                {{ option.icon }}
              </v-icon>
            </div>
            <div :style="interviewTypeContentStyle">
              <h2 :style="[interviewTypeTitleStyle, selectedInterviewSubType === option.type ? selectedInterviewTypeTitleStyle : {}]">{{ option.title }}</h2>
              <p :style="interviewTypeDescriptionStyle">{{ option.description }}</p>
            </div>
            <div :style="interviewTypeStatusStyle" v-if="option.status === 'preparing'">
              <v-chip color="grey" small>준비중</v-chip>
            </div>
            <div :style="interviewTypeOverlayStyle"></div>
          </div>
        </div>

        <!-- 기업별 면접 - 회사 선택 -->
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
                  :alt="company + ' 로고'"
                  :style="companyImageStyle"
                  onerror="this.src='https://via.placeholder.com/100?text='+this.alt"
                />
              </div>
              <div :style="companyNameStyle">{{ company.name }}</div>
              <div class="card-glow"></div>
            </div>
          </div>
          
          <div v-if="selectedCompany" :style="companyButtonContainerStyle">
            <v-btn 
              color="primary" 
              :style="companyNextButtonStyle"
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
import encore from '../../assets/images/company/Encore.png'
import kt from '../../assets/images/company/kt.png'
import dang from '../../assets/images/company/dang.png'
import kakao from '../../assets/images/company/kakao.png'
import naver from '../../assets/images/company/naver.png'
import toss from '../../assets/images/company/toss.png'
import coupang from '../../assets/images/company/coupang.png'

const router = useRouter();
const route = useRoute();

// 라우터에서 전달받은 면접 유형
const interviewType = ref(route.params.type || '');

// 페이지 타이틀 및 설명 계산
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

// 이전 화면으로 돌아가기
const goBack = () => {
  router.push('/ai-interview/select');
};

// ---------- 스타일 변수 ---------- //
const containerStyle = { 
  marginBottom: '5%', 
  marginTop: '2%', 
  maxWidth: '1200px',
  padding: '0 24px'
};
const mb8Style = { marginBottom: "32px" };
const formContainerStyle = { marginTop: "32px", padding: "16px" };
const drawLineStyle = {
  border: "1px solid #333",
  padding: "16px",
  borderRadius: "10px",
  width: "90%",
  marginTop: "32px"
};
const liStyle = { marginLeft: "2%" };
const buttonStyle = {
  minWidth: "120px",
  padding: "12px 24px",
  margin: "0 8px",
  borderRadius: "8px",
  fontWeight: "500",
};

// 타이틀 컨테이너 스타일
const titleContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '3rem',
  position: 'relative',
  width: '100%'
};

// 향상된 타이틀 스타일
const enhancedTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: '800',
  color: '#1a1a1a',
  marginBottom: '1.5rem',
  letterSpacing: '-0.02em',
  textAlign: 'center',
  width: '100%',
  position: 'relative',
  lineHeight: '1.2',
  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  paddingBottom: '1rem',
  '@media (max-width: 768px)': {
    fontSize: '2rem'
  }
};

// 타이틀 하이라이트 스타일 (이제 enhancedTitleStyle로 이동)

// 타이틀 밑줄 스타일
const titleUnderlineStyle = {
  width: '60px',
  height: '4px',
  background: 'linear-gradient(90deg, #3b82f6 0%, rgba(59, 130, 246, 0.6) 100%)',
  borderRadius: '4px',
  margin: '1rem 0 1.5rem',
  opacity: '0.8'
};

// 타이틀 설명 스타일
const titleDescriptionStyle = {
  fontSize: '1.1rem',
  color: '#64748b',
  textAlign: 'center',
  maxWidth: '700px',
  lineHeight: '1.7',
  fontWeight: '400',
  margin: '0 auto',
  padding: '0 20px',
  '@media (max-width: 768px)': {
    fontSize: '1rem',
    lineHeight: '1.6'
  }
};

// 선택 화면 스타일
const selectionContainerStyle = {
  marginBottom: '10rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%'
};

// 면접 유형 선택 옵션 스타일
const interviewOptionsWrapperStyle = {
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '20px'
};

// 면접 유형 아이템 스타일
const interviewTypeItemStyle = {
  position: 'relative',
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
  backgroundColor: 'white',
  width: '300px',
  height: '480px',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(229, 231, 235, 0.6)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)'
  },
  '@media (max-width: 768px)': {
    width: '100%',
    maxWidth: '350px',
    margin: '0 auto'
  }
};

// 선택된 면접 유형 아이템 스타일
const selectedInterviewTypeItemStyle = {
  backgroundColor: '#f8fafc',
  border: '2px solid #3b82f6',
  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
  transform: 'translateY(-8px)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
    zIndex: 2
  }
};

// 준비중인 면접 유형 아이템 스타일
const preparingInterviewTypeItemStyle = {
  opacity: '0.7',
  backgroundColor: '#f9fafb',
  pointerEvents: 'none'
};

// 면접 유형 아이콘 스타일
const interviewTypeIconStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '80px',
  backgroundColor: '#f3f4f6',
  borderBottom: '1px solid #e5e7eb'
};

// 면접 유형 콘텐츠 스타일
const interviewTypeContentStyle = {
  flex: '1',
  padding: '1.5rem',
  position: 'relative',
  zIndex: '2',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

// 면접 유형 제목 스타일
const interviewTypeTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: '#333',
  textAlign: 'center'
};

// 선택된 면접 유형 제목 스타일
const selectedInterviewTypeTitleStyle = {
  color: '#1e40af'
};

// 면접 유형 설명 스타일
const interviewTypeDescriptionStyle = {
  fontSize: '0.9rem',
  color: '#6b7280',
  textAlign: 'center'
};

// 면접 유형 상태 스타일
const interviewTypeStatusStyle = {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  zIndex: '3'
};

// 면접 유형 오버레이 스타일
const interviewTypeOverlayStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
  opacity: '0',
  transition: 'opacity 0.3s ease',
  zIndex: '1'
};

// 회사 선택 스타일
const companySelectionWrapperStyle = {
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto 2rem'
};

// 회사 그리드 컨테이너 스타일
const companyGridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '24px',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '0 16px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  }
};

// 회사 카드 스타일
const companyCardStyle = {
  position: 'relative',
  borderRadius: '16px',
  background: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 16px',
  border: '1px solid rgba(0, 0, 0, 0.05)',

  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
    opacity: '0',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateZ(20px)'
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    border: '2px solid rgba(99, 102, 241, 0.1)',
    transition: 'all 0.4s ease',
    boxSizing: 'border-box',
    pointerEvents: 'none'
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02) rotateX(5deg) rotateY(5deg)',
    boxShadow: '12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff',
    color: '#4338ca',
    '&:before': {
      opacity: '1',
      transform: 'translateZ(30px)'
    },
    '&:after': {
      borderColor: 'rgba(99, 102, 241, 0.3)',
      transform: 'scale(0.98)'
    },
    '& .chip-text': {
      transform: 'translateZ(20px)',
      textShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    '& .chip-glow': {
      opacity: '0.8',
      transform: 'scale(1.1)'
    }
  },
  '&:active': {
    transform: 'translateY(1px) scale(0.99) rotateX(0) rotateY(0)',
    boxShadow: '4px 4px 8px #e2e8f0, -4px -4px 8px #ffffff'
  },
  '& .chip-text': {
    position: 'relative',
    zIndex: '2',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-block',
    transform: 'translateZ(10px)'
  },
  '& .chip-glow': {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 60%)',
    opacity: '0',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none'
  }
};

// 선택된 회사 카드 스타일
const companyCardSelectedStyle = {
  position: 'relative',
  transform: 'translateY(-5px)',
  boxShadow: '0 12px 24px rgba(99, 102, 241, 0.2)',
  border: '2px solid #6366f1',
  animation: 'pulse 2s infinite',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '4px',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
    zIndex: '1',
    animation: 'gradient 3s ease infinite',
    backgroundSize: '200% 200%'
  },
  '&:hover': {
    transform: 'translateY(-6px) scale(1.02)',
    boxShadow: '0 15px 30px rgba(99, 102, 241, 0.3)',
    '&:before': {
      left: '100%',
      transition: '1.2s'
    },
    '& .chip-text': {
      transform: 'translateZ(30px) scale(1.05)',
      textShadow: '0 2px 10px rgba(255,255,255,0.3)'
    },
    '& .chip-glow': {
      opacity: '1',
      transform: 'scale(1.2)'
    }
  },
  '&:active': {
    transform: 'translateY(-2px) scale(0.99) rotateX(0)'
  },
  '& .chip-text': {
    position: 'relative',
    zIndex: '2',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-block',
    transform: 'translateZ(20px)',
    textShadow: '0 1px 3px rgba(0,0,0,0.2)'
  },
  '& .chip-glow': {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3), transparent 70%)',
    opacity: '0.6',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none'
  }
};

// 준비중 화면 컨테이너 스타일
const preparingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
  backgroundColor: '#f9fafb',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
  margin: '0 auto'
};

// 준비중 아이콘 스타일
const preparingIconStyle = {
  marginBottom: '1.5rem'
};

// 준비중 텍스트 스타일
const preparingTextStyle = {
  fontSize: '1.25rem',
  fontWeight: '500',
  color: '#333',
  marginBottom: '0.5rem',
  textAlign: 'center'
};

// 준비중 서브텍스트 스타일
const preparingSubtextStyle = {
  fontSize: '1rem',
  color: '#6b7280',
  marginBottom: '2rem',
  textAlign: 'center'
};

// 뒤로가기 버튼 스타일
const backButtonStyle = {
  position: 'absolute',
  top: '30px',
  left: '30px',
  zIndex: 10,
  background: 'linear-gradient(145deg, #ffffff, #e6e9ef)',
  boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  color: '#6366f1',
  border: 'none',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  },
  '&:hover': {
    transform: 'translateY(-3px) rotate(-5deg)',
    boxShadow: '10px 10px 20px #d1d9e6, -10px -10px 20px #ffffff',
    color: '#4f46e5',
    '&:before': {
      opacity: '1'
    }
  },
  '&:active': {
    transform: 'translateY(1px) scale(0.95)',
    boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
  },
  '@media (max-width: 768px)': {
    top: '20px',
    left: '20px',
    width: '46px',
    height: '46px'
  }
};

// 선택 화면으로 돌아가기 버튼 스타일
const backToSelectionBtnStyle = {
  padding: '16px 36px',
  fontWeight: '600',
  borderRadius: '50px',
  color: 'white',
  textTransform: 'none',
  letterSpacing: '0.5px',
  background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #d946ef)',
  backgroundSize: '200% 200%',
  boxShadow: '0 8px 25px -5px rgba(99, 102, 241, 0.4)',
  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: '0.5s',
    animation: 'shine 2s infinite',
    zIndex: '1'
  },
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.5)',
    backgroundPosition: '100% 50%',
    '&:before': {
      left: '100%',
      transition: '1s'
    }
  },
  '&:active': {
    transform: 'translateY(1px) scale(0.98)',
    boxShadow: '0 5px 15px -3px rgba(99, 102, 241, 0.3)'
  },
  '& span': {
    position: 'relative',
    zIndex: '2',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  '& .v-icon': {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
  }
};

// 회사 선택 후 다음 버튼 컨테이너 스타일
const companyButtonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "3rem",
  width: "100%",
  padding: '0 20px',
  '& button': {
    padding: '18px 40px',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '50px',
    color: 'white',
    background: 'linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)',
    backgroundSize: '200% 200%',
    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 15px 30px -5px rgba(16, 185, 129, 0.5)',
      backgroundPosition: '100% 50%',
      '&:before': {
        left: '100%',
        transition: '1s'
      }
    },
    '&:active': {
      transform: 'translateY(1px) scale(0.98)'
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: '0.5s',
      animation: 'shine 2s infinite',
      zIndex: '1'
    },
    '& .v-btn__content': {
      position: 'relative',
      zIndex: '2',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    '& .v-icon': {
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      transition: 'transform 0.3s ease',
      marginLeft: '5px'
    },
    '&:hover .v-icon': {
      transform: 'translateX(3px)'
    }
  },
  '@media (max-width: 600px)': {
    '& button': {
      width: '100%',
      maxWidth: '320px',
      padding: '16px 24px',
      fontSize: '1rem'
    }
  }
};

// 회사 이미지 컨테이너 스타일
const companyImageContainerStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(0, 0, 0, 0.05)'
};

// 회사 이미지 스타일
const companyImageStyle = {
  width: '60%',
  height: '60%',
  objectFit: 'contain',
  transition: 'transform 0.3s ease'
};

// 회사 이름 스타일
const companyNameStyle = {
  fontSize: '1rem',
  fontWeight: '600',
  color: '#1e293b',
  textAlign: 'center',
  marginTop: '8px',
  transition: 'color 0.3s ease'
};

// 전역 스타일
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    }
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes shine {
    0% { 
      left: -100%; 
      opacity: 0.6;
    }
    20% { 
      left: 100%;
      opacity: 0.8;
    }
    100% { 
      left: 100%;
      opacity: 0;
    }
  }
  
  .company-card {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .company-card .company-image-container {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15), transparent 70%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }
  
  .company-card:hover .card-glow {
    opacity: 0.8;
  }
  
  .company-card.selected .card-glow {
    opacity: 1;
    background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2), transparent 70%);
  }
  
  .company-card.selected .company-image-container {
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
  }
`;
document.head.appendChild(globalStyles);

// 회사 선택 후 다음 버튼 스타일
const companyNextButtonStyle = {
  padding: "14px 28px",
  fontWeight: "600",
  fontSize: "1.1rem",
  borderRadius: "12px",
  boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)",
  transition: "all 0.3s ease",
  textTransform: "none",
  letterSpacing: "0.02em",
  backgroundColor: "#3b82f6",
  color: "white",
  minWidth: "150px",
  minHeight: "50px"
};

const selectedChipStyle = {
  backgroundColor: "#6366f1",
  color: "white",
  transition: "all 0.3s ease",
};
const unselectedChipStyle = {
  backgroundColor: "#e0e0e0",
  color: "black",
  transition: "all 0.3s ease",
};

// 2단계: 면접 세부 유형 선택
const interviewSubTypes = [
  {
    type: "기술면접",
    title: "기술 면접",
    icon: "mdi-code-tags",
    description: "기술적 역량을 평가하는 면접",
    status: "active"
  },
  {
    type: "인성면접",
    title: "인성 면접",
    icon: "mdi-account-heart",
    description: "인성과 조직 적합성을 평가하는 면접",
    status: "preparing"
  },
  {
    type: "종합면접",
    title: "종합 면접",
    icon: "mdi-account-multiple",
    description: "기술과 인성을 종합적으로 평가하는 면접",
    status: "preparing"
  }
];
const selectedInterviewSubType = ref("");

// 회사 목록 (예시)
const companies = [
  { 
    id: 'SK-encore',
    name: 'SK-encore',
    logo: encore,
  },
  { 
    id: 'kakao',
    name: '카카오',
    logo: kakao
  },
  { 
    id: 'naver',
    name: '네이버',
    logo: naver
  },
  { 
    id: '라인',
    name: '라인',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg'
  },
  { 
    id: 'coupang',
    name: '쿠팡',
    logo: coupang
  },
  { 
    id: 'KT M mobile',
    name: 'KT M mobile',
    logo: kt
  },
  { 
    id: 'toss',
    name: '토스',
    logo: toss
  },
  { 
    id: 'daangn',
    name: '당근마켓',
    logo: dang
  }
];

// 회사 이미지 가져오기
const getCompanyImage = (company) => {
  return company.logo || `https://via.placeholder.com/100?text=${company.name}`;
};

const selectedCompany = ref("");

// 회사 선택 함수
const selectCompany = (company) => {
  // 이미 선택된 회사를 다시 클릭하면 선택 해제, 아니면 새로 선택
  selectedCompany.value = selectedCompany.value === company.name ? '' : company.name;
};

// 상세 정보 입력 페이지로 이동 함수
const goToDetailForm = () => {
  if (!selectedCompany.value) {
    alert("회사를 선택해 주세요.");
    return;
  }
  
  router.push({
    name: 'ai-interview-form',
    params: { 
      type: interviewType.value,
      company: selectedCompany.value
    }
  });
};

// 전공
const academicBackgrounds = ref(["전공자", "비전공자"]);
const academicBackgroundMap = { 전공자: 2, 비전공자: 1 };
const selectedAcademicBackground = ref("");

// 경력
const careers = ref(["신입", "3년 이하", "5년 이하", "10년 이하", "10년 이상"]);
const careerMap = { 신입: 1, "3년 이하": 2, "5년 이하": 3, "10년 이하": 4, "10년 이상": 5 };
const selectedCareer = ref("");

// 프로젝트 경험
const projectExperience = ref(["있음", "없음"]);
const projectExperienceMap = { 있음: 2, 없음: 1 };
const selectedProjectExperience = ref("");

// 직무
const keywords = ref(["Backend", "Frontend", "App·Web", "AI", "Embedded", "DevOps"]);
const keywordMap = { Backend: 1, Frontend: 2, Embedded: 3, AI: 4, DevOps: 5, "App·Web": 6 };
const selectedKeyword = ref("");

// 기술 스택
const skills = ref([
  "풀스택", "백엔드/서버개발", "프론트엔드", "웹개발", "Flutter", "Java",
  "JavaScript", "Python", "Vue.js", "API", "MYSQL", "AWS", "ReactJS", "ASP",
  "Angular", "Bootstrap", "Node.js", "jQuery", "PHP", "JSP", "GraphQL", "HTML5",
]);
const skillsMap = Object.fromEntries(skills.value.map((s, i) => [s, i + 1]));
const selectedTechSkills = ref([]);

// 폼 유효성 검사
const isFormValid = computed(() => {
  if (interviewType.value === '전형별') {
    return (
      selectedInterviewSubType.value === '기술면접' &&
      selectedKeyword.value &&
      selectedAcademicBackground.value &&
      selectedCareer.value &&
      selectedProjectExperience.value &&
      selectedTechSkills.value.length > 0
    );
  } else if (interviewType.value === '기업별') {
    return (
      selectedCompany.value &&
      selectedKeyword.value &&
      selectedAcademicBackground.value &&
      selectedCareer.value &&
      selectedProjectExperience.value &&
      selectedTechSkills.value.length > 0
    );
  }
  return false;
});

// 선택 핸들러
const selectInterviewSubType = (type) => {
  // 준비중인 옵션은 선택 불가
  const option = interviewSubTypes.find(opt => opt.type === type);
  if (option && option.status === 'preparing') {
    alert('해당 기능은 현재 준비 중입니다.');
    return;
  }
  
  selectedInterviewSubType.value = type;
  
  // 선택 후 상세 정보 입력 페이지로 이동
  router.push({
    name: 'ai-interview-form',
    params: { 
      type: interviewType.value,
      subType: type
    }
  });
};

// 상세 정보 입력 페이지로 이동 함수
// const goToDetailForm = () => {
//   if (!selectedCompany.value) {
//     alert("회사를 선택해 주세요.");
//     return;
//   }
//
//   router.push({
//     name: 'ai-interview-form',
//     params: {
//       type: interviewType.value,
//       company: selectedCompany.value
//     }
//   });
// };

onMounted(() => {
  // 면접 유형이 없으면 선택 페이지로 리다이렉트
  if (!interviewType.value) {
    router.push('/ai-interview-selection');
  }
});
</script>
