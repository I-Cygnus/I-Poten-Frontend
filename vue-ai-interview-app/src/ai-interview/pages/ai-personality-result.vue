<template>
  <main :style="pageStyle">
    <div :style="softBgStyle"></div>

    <!-- 로딩 -->
    <div v-if="isLoading" :style="centerWrapStyle">
      <div :style="stateCardStyle">
        <v-icon size="32" color="#5B6BFF" class="mdi-spin">mdi-loading</v-icon>
        <p :style="stateTextStyle">결과를 불러오는 중입니다...</p>
      </div>
    </div>

    <!-- 에러 -->
    <div v-else-if="errorMsg" :style="centerWrapStyle">
      <div :style="stateCardStyle">
        <v-icon size="32" color="#ef4444">mdi-alert-circle-outline</v-icon>
        <p :style="stateTextStyle">{{ errorMsg }}</p>
        <button :style="retryBtnStyle" @click="loadResult">다시 시도</button>
      </div>
    </div>

    <!-- 결과 -->
    <div v-else :style="wrapperStyle">

      <!-- 헤더 -->
      <div :style="headerStyle" class="result-header-anim">
        <div :style="eyebrowStyle">PERSONALITY INTERVIEW</div>
        <h1 :style="titleStyle">인성 면접 결과</h1>
        <div :style="statsRowStyle">
          <div :style="statChipStyle">
            <div :style="statDotStyle"></div>
            <span>면접 완료</span>
          </div>
          <span :style="statDividerStyle">·</span>
          <span :style="statTextStyle">총 {{ qaList.length }}개 질문</span>
        </div>
      </div>

      <!-- 구분선 -->
      <div :style="sectionDividerStyle"></div>

      <!-- Q&A 목록 -->
      <div :style="qaListStyle">
        <div
          v-for="(item, index) in qaList"
          :key="index"
          :style="qaCardStyle"
          class="qa-card-anim"
        >
          <!-- 워터마크 번호 -->
          <div :style="cardWatermarkStyle">{{ String(index + 1).padStart(2, '0') }}</div>

          <!-- 질문 -->
          <div :style="questionRowStyle">
            <span :style="qBadgeStyle">Q{{ String(index + 1).padStart(2, '0') }}</span>
            <p :style="questionTextStyle">{{ item.question }}</p>
          </div>

          <!-- 답변 -->
          <div :style="answerBlockStyle">
            <span :style="answerEyebrowStyle">MY ANSWER</span>
            <p :style="answerTextStyle">{{ item.answer || '답변 없음' }}</p>
          </div>
        </div>
      </div>

      <!-- 하단 액션 -->
      <div :style="actionRowStyle">
        <button :style="homeBtnStyle" @click="goHome" class="action-btn-hover">
          <v-icon size="15" color="#6B7280">mdi-home-outline</v-icon>
          <span>홈으로</span>
        </button>
        <button :style="retryBtnAltStyle" @click="goRetry" class="action-btn-hover">
          <span :style="retryBtnTextStyle">다시 면접하기</span>
          <div :style="retryIconWrapStyle">
            <v-icon size="17" color="white">mdi-refresh</v-icon>
          </div>
        </button>
      </div>

    </div>
  </main>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.result-header-anim {
  animation: fadeUp 0.5s ease forwards;
}

.qa-card-anim {
  animation: fadeUp 0.5s ease forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.qa-card-anim:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.07) !important;
}

.action-btn-hover {
  transition: all 0.2s ease;
}
.action-btn-hover:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import * as axiosUtility from '../utility/axiosInstance';

const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const errorMsg = ref('');
const qaList = ref([]);

const loadResult = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const interviewId = route.params.interviewId;
    const { springAxiosInstance } = axiosUtility.createAxiosInstances();
    const res = await springAxiosInstance.get(`/api/interview/normal/result/${interviewId}`, { withCredentials: true });
    qaList.value = res.data.qaList || [];
  } catch (err) {
    console.error('결과 조회 실패:', err);
    if (err?.response?.status === 403) {
      Swal.fire({ title: '권한이 없습니다', text: '접근 권한이 없습니다.', icon: 'warning', iconColor: '#2563EB', confirmButtonText: '확인' })
        .then(r => { if (r.isConfirmed) window.location.href = '/'; });
      return;
    }
    errorMsg.value = '결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    isLoading.value = false;
  }
};

const goHome = () => router.push('/ai-interview/select');
const goRetry = () => router.push('/ai-interview/personality-form');

onMounted(loadResult);

// ===== 스타일 =====

const pageStyle = {
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  background: '#F5F6F8',
  fontFamily: "'Pretendard', sans-serif",
  boxSizing: 'border-box',
};

const softBgStyle = {
  position: 'fixed',
  inset: '0',
  zIndex: '0',
  pointerEvents: 'none',
  background: `
    radial-gradient(1100px 1100px at 10% 30%, rgba(211,228,253,0.25) 0%, transparent 70%),
    radial-gradient(1100px 1100px at 90% 70%, rgba(213,247,239,0.2) 0%, transparent 70%)
  `,
};

const centerWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '24px',
  position: 'relative',
  zIndex: '1',
};

const stateCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '18px',
  padding: '52px 64px',
  background: '#FFFFFF',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
};

const stateTextStyle = {
  fontSize: '15px',
  color: '#6B7280',
  fontWeight: '500',
  margin: '0',
};

const retryBtnStyle = {
  padding: '12px 32px',
  background: '#ef4444',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '100px',
  fontSize: '14px',
  fontWeight: '700',
  cursor: 'pointer',
};

const wrapperStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '72px 40px 120px',
  display: 'flex',
  flexDirection: 'column',
  gap: '40px',
  position: 'relative',
  zIndex: '1',
};

// 헤더
const headerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const eyebrowStyle = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#5B6BFF',
  letterSpacing: '0.1em',
};

const titleStyle = {
  fontSize: '40px',
  fontWeight: '800',
  color: '#111111',
  margin: '0',
  letterSpacing: '-0.03em',
  lineHeight: '1.15',
};

const statsRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '4px',
};

const statChipStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '5px 12px',
  background: 'rgba(16, 185, 129, 0.08)',
  borderRadius: '100px',
  fontSize: '12px',
  fontWeight: '700',
  color: '#10B981',
};

const statDotStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#10B981',
};

const statDividerStyle = {
  fontSize: '14px',
  color: '#D1D5DB',
  fontWeight: '400',
};

const statTextStyle = {
  fontSize: '14px',
  color: '#9CA3AF',
  fontWeight: '500',
};

const sectionDividerStyle = {
  height: '1px',
  background: 'linear-gradient(90deg, #E5E7EB 0%, transparent 100%)',
  marginBottom: '8px',
};

// Q&A 카드
const qaListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const qaCardStyle = {
  position: 'relative',
  background: '#FFFFFF',
  borderRadius: '20px',
  padding: '36px 40px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const cardWatermarkStyle = {
  position: 'absolute',
  top: '-8px',
  right: '24px',
  fontSize: '80px',
  fontWeight: '900',
  color: 'rgba(91,107,255,0.04)',
  letterSpacing: '-0.04em',
  lineHeight: '1',
  userSelect: 'none',
  pointerEvents: 'none',
};

const questionRowStyle = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
};

const qBadgeStyle = {
  flexShrink: '0',
  padding: '4px 10px',
  background: '#5B6BFF',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '800',
  color: '#FFFFFF',
  letterSpacing: '0.04em',
  marginTop: '3px',
};

const questionTextStyle = {
  fontSize: '17px',
  fontWeight: '700',
  color: '#111111',
  lineHeight: '1.65',
  margin: '0',
  letterSpacing: '-0.01em',
};

const answerBlockStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  paddingLeft: '8px',
  borderLeft: '2px solid #E9EAFF',
  marginLeft: '4px',
};

const answerEyebrowStyle = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#10B981',
  letterSpacing: '0.08em',
};

const answerTextStyle = {
  fontSize: '15px',
  color: '#4B5563',
  lineHeight: '1.85',
  margin: '0',
  whiteSpace: 'pre-wrap',
  fontWeight: '500',
};

// 액션
const actionRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '14px',
  paddingTop: '8px',
};

const homeBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  padding: '13px 24px',
  background: '#FFFFFF',
  color: '#6B7280',
  border: 'none',
  borderRadius: '100px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  letterSpacing: '-0.01em',
};

const retryBtnAltStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
};

const retryBtnTextStyle = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#111111',
  letterSpacing: '-0.02em',
};

const retryIconWrapStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: '#5B6BFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 20px rgba(91,107,255,0.28)',
  transition: 'all 0.3s ease',
  flexShrink: '0',
};
</script>
