<template>
  <main :style="pageStyle">
    <!-- 소프트 배경 -->
    <div :style="softBgStyle"></div>

    <div :style="wrapperStyle">
      <div class="layout-container" :style="layoutContainerStyle">
        <!-- 좌측 사이드바 -->
        <aside class="sidebar-column" :style="sidebarStyle">
          <!-- 뒤로가기 -->
          <div :style="backButtonWrapperStyle" @click="goBack" class="back-btn-hover">
            <div :style="backButtonStyle">
              <v-icon color="#111111" size="20">mdi-arrow-left</v-icon>
            </div>
            <span :style="backButtonTextStyle">뒤로가기</span>
          </div>

          <!-- 타이틀 영역 -->
          <div :style="sidebarTitleAreaStyle">
            <div :style="sidebarSubtitleStyle">AI INTERVIEW</div>
            <h1 :style="sidebarTitleStyle">인성 면접 준비</h1>
            <p :style="sidebarDescStyle">현재 상황과 관심 분야를 알려주시면 맞춤형 인성 면접을 준비해 드립니다.</p>
          </div>

          <!-- 타임라인 -->
          <div class="timeline-container" :style="timelineContainerStyle">
            <div :style="timelineLineStyle"></div>
            <div v-for="(step, index) in timelineSteps" :key="index" :style="getTimelineStepStyle(index === activeStepIndex, step.completed)">
              <div :style="getTimelineDotStyle(index === activeStepIndex, step.completed)">
                <v-icon v-if="step.completed" size="14" color="white">mdi-check</v-icon>
                <div v-else-if="index === activeStepIndex" :style="activeDotInnerStyle"></div>
              </div>
              <span :style="getTimelineLabelStyle(index === activeStepIndex, step.completed)">{{ step.label }}</span>
            </div>
          </div>
        </aside>

        <!-- 우측 폼 컨테이너 -->
        <div class="form-content-column" :style="formContainerStyle">

          <!-- 01 현재 상황 -->
          <div :style="sectionStyle" class="section-animation">
            <span :style="stepNumberStyle">01</span>
            <h2 :style="sectionTitleStyle">현재 상황을 알려주세요</h2>
            <p :style="helperTextStyle">본인의 현재 상황에 맞는 항목을 선택해주세요.</p>
            <div :style="chipContainerStyle">
              <div
                v-for="status in statusOptions"
                :key="status.value"
                :style="[chipStyle, selectedStatus === status.value ? selectedChipStyle : {}]"
                @click="selectedStatus = status.value"
                class="chip-animation"
              >
                {{ status.label }}
              </div>
            </div>
          </div>

          <!-- 02 관심 분야 / 걱정 사항 -->
          <div :style="sectionStyle" class="section-animation">
            <span :style="stepNumberStyle">02</span>
            <h2 :style="sectionTitleStyle">관심 분야 또는 걱정 사항</h2>
            <p :style="helperTextStyle">면접에서 다루고 싶은 주제나 걱정되는 부분을 자유롭게 적어주세요.</p>
            <textarea
              v-model="selfConcern"
              :style="textareaStyle"
              placeholder="예) 팀워크, 갈등 해결 방법, 직무 적합성, 스트레스 관리 등"
              maxlength="300"
            />
            <div :style="charCountStyle">{{ selfConcern.length }} / 300</div>
          </div>

          <!-- 면접 시작 버튼 -->
          <div :style="buttonContainerStyle">
            <button
              :style="[startButtonStyle, (!selectedStatus || isLoading) ? { opacity: 0.5, cursor: 'not-allowed' } : {}]"
              :disabled="!selectedStatus || isLoading"
              @click="handleStart"
              class="start-button-animation"
            >
              <span :style="startButtonTextStyle">{{ isLoading ? '면접 준비 중...' : '인성 면접 시작' }}</span>
              <div :style="startButtonIconWrapStyle" class="start-btn-icon">
                <v-icon color="white" v-if="!isLoading">mdi-arrow-right</v-icon>
                <v-icon color="white" class="mdi-spin" v-else>mdi-loading</v-icon>
              </div>
            </button>
          </div>

          <!-- 안내 카드 -->
          <div :style="noticeCardStyle" class="notice-card-animation">
            <div :style="noticeTitleStyle">
              <v-icon :style="noticeIconStyle">mdi-information</v-icon>
              <span>면접 진행 안내</span>
            </div>
            <ul :style="noticeListStyle">
              <li :style="noticeItemStyle">본 면접은 입력된 정보를 기반으로 한 맞춤형 <strong>PERSONALITY-INTERVIEW</strong>입니다.</li>
              <li :style="noticeItemStyle">모의면접에는 <strong>마이크 및 카메라</strong> 권한이 필요합니다.</li>
              <li :style="noticeItemStyle">조용한 환경에서 진행하시는 것을 권장합니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <AlertPopup v-model="alertVisible" :message="alertMessage" />
  </main>
</template>

<style scoped>
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.back-btn-hover {
  transition: transform 0.2s ease;
}
.back-btn-hover:hover {
  transform: translateX(-4px);
}

.section-animation { transition: transform 0.3s ease; }
.section-animation:hover { transform: translateY(-2px); }

.chip-animation { transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

.start-button-animation {
  transition: all 0.3s ease;
}
.start-button-animation:hover:not(:disabled) .start-btn-icon {
  transform: translateX(6px);
  box-shadow: 0 10px 28px rgba(91, 107, 255, 0.4);
}

.notice-card-animation { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.notice-card-animation:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.04) !important; }

@media (max-width: 960px) {
  .layout-container {
    flex-direction: column !important;
    gap: 40px !important;
  }
  .sidebar-column {
    position: relative !important;
    top: 0 !important;
    width: 100% !important;
  }
  .timeline-container {
    display: none !important;
  }
  .form-content-column {
    max-width: 100% !important;
  }
}
</style>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AlertPopup from '@/components/common/AlertPopup.vue';
import * as axiosUtility from '../utility/axiosInstance';

const router = useRouter();
const isLoading = ref(false);
const alertVisible = ref(false);
const alertMessage = ref('');
const showAlert = (msg) => { alertMessage.value = msg; alertVisible.value = true; };

const selectedStatus = ref('');
const selfConcern = ref('');

const statusOptions = [
  { value: 'FIRST_JOB', label: '취업 준비' },
  { value: 'CAREER_CHANGE', label: '이직 준비' },
  { value: 'PRACTICE', label: '연습' },
  { value: 'NO_PLAN', label: '계획 없음' },
];

const goBack = () => router.back();

const timelineSteps = computed(() => [
  { label: '현재 상황', completed: selectedStatus.value !== '' },
  { label: '관심 분야', completed: selfConcern.value.trim() !== '' },
]);

const activeStepIndex = computed(() => {
  const index = timelineSteps.value.findIndex(step => !step.completed);
  return index === -1 ? timelineSteps.value.length - 1 : index;
});

const handleStart = async () => {
  if (!selectedStatus.value) {
    showAlert('현재 상황을 선택해주세요.');
    return;
  }
  isLoading.value = true;
  try {
    const { springAxiosInstance } = axiosUtility.createAxiosInstances();
    const res = await springAxiosInstance.post('/api/interview/create/normal', {
      interviewType: 'PERSONAL',
      candidateStatus: selectedStatus.value,
      self_concern: selfConcern.value,
    }, { withCredentials: true });

    const data = res.data;
    localStorage.setItem('personalityInterviewData', JSON.stringify({
      interviewId: data.interviewId,
      interviewList: data.interviewList,
    }));

    router.push('/ai-interview/personality');
  } catch (err) {
    console.error('인성 면접 생성 실패:', err);
    showAlert('면접 준비 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    isLoading.value = false;
  }
};

// ===== 스타일 =====

const pageStyle = {
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  background: '#F5F6F8',
  fontFamily: "'Pretendard', sans-serif",
};

const softBgStyle = {
  position: 'fixed',
  inset: '0',
  zIndex: '0',
  pointerEvents: 'none',
  background: `
    radial-gradient(1200px 1200px at 15% 40%, rgba(211,228,253,0.3) 0%, rgba(211,228,253,0.05) 50%, transparent 100%),
    radial-gradient(1200px 1200px at 85% 60%, rgba(213,247,239,0.3) 0%, rgba(213,247,239,0.05) 50%, transparent 100%)
  `,
};

const wrapperStyle = {
  width: '100%',
  padding: '60px 40px 140px',
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  zIndex: '1',
};

const layoutContainerStyle = {
  display: 'flex',
  width: '100%',
  maxWidth: '1140px',
  gap: '80px',
  alignItems: 'flex-start',
};

const sidebarStyle = {
  width: '240px',
  flexShrink: '0',
  position: 'sticky',
  top: '60px',
  display: 'flex',
  flexDirection: 'column',
};

const backButtonWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  marginBottom: '48px',
  marginRight: '48px',
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
  transition: 'all 0.2s ease',
};

const backButtonTextStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#4B5563',
};

const sidebarTitleAreaStyle = {
  marginBottom: '48px',
  marginRight: '50px',
};

const sidebarSubtitleStyle = {
  fontSize: '13px',
  fontWeight: '800',
  color: '#5B6BFF',
  marginBottom: '8px',
  letterSpacing: '0.05em',
};

const sidebarTitleStyle = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#111111',
  lineHeight: '1.3',
  letterSpacing: '-0.02em',
  marginBottom: '12px',
  wordBreak: 'keep-all',
};

const sidebarDescStyle = {
  fontSize: '14px',
  color: '#6B7280',
  lineHeight: '1.6',
  wordBreak: 'keep-all',
};

const timelineContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  marginLeft: '8px',
};

const timelineLineStyle = {
  position: 'absolute',
  left: '11px',
  top: '16px',
  bottom: '16px',
  width: '2px',
  backgroundColor: '#E5E7EB',
  zIndex: '0',
};

const getTimelineStepStyle = (isActive, isCompleted) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px 0',
  position: 'relative',
  zIndex: '1',
  opacity: isActive || isCompleted ? '1' : '0.4',
  transition: 'opacity 0.3s ease',
});

const getTimelineDotStyle = (isActive, isCompleted) => ({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: isCompleted ? '#10B981' : (isActive ? '#FFFFFF' : '#F3F4F6'),
  border: isCompleted ? 'none' : (isActive ? '3px solid #5B6BFF' : '2px solid #D1D5DB'),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  boxShadow: isActive && !isCompleted ? '0 0 0 4px rgba(91, 107, 255, 0.1)' : 'none',
});

const activeDotInnerStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#5B6BFF',
};

const getTimelineLabelStyle = (isActive, isCompleted) => ({
  fontSize: '15px',
  fontWeight: isActive || isCompleted ? '700' : '500',
  color: isCompleted ? '#10B981' : (isActive ? '#111111' : '#888888'),
  transition: 'color 0.3s ease',
});

const formContainerStyle = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: '96px',
  maxWidth: '760px',
};

const stepNumberStyle = {
  color: '#5B6BFF',
  fontSize: '16px',
  fontWeight: '800',
  display: 'block',
  marginBottom: '12px',
  letterSpacing: '0.05em',
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#111111',
  marginBottom: '12px',
  letterSpacing: '-0.02em',
};

const helperTextStyle = {
  fontSize: '15px',
  color: '#888888',
  marginBottom: '24px',
  fontWeight: '500',
};

const chipContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
};

const chipStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '100px',
  padding: '16px 28px',
  textAlign: 'center',
  cursor: 'pointer',
  fontWeight: '600',
  color: '#444444',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '15px',
  userSelect: 'none',
};

const selectedChipStyle = {
  backgroundColor: '#5B6BFF',
  color: '#FFFFFF',
  boxShadow: '0 6px 16px rgba(91, 107, 255, 0.25)',
  transform: 'translateY(-2px)',
};

const textareaStyle = {
  width: '100%',
  minHeight: '160px',
  padding: '20px 24px',
  borderRadius: '16px',
  border: 'none',
  backgroundColor: '#FFFFFF',
  fontSize: '15px',
  color: '#111111',
  lineHeight: '1.6',
  resize: 'vertical',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  transition: 'box-shadow 0.2s ease',
};

const charCountStyle = {
  fontSize: '13px',
  color: '#9CA3AF',
  textAlign: 'right',
  marginTop: '8px',
  fontWeight: '500',
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '20px',
  marginBottom: '40px',
};

const startButtonStyle = {
  background: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  cursor: 'pointer',
  padding: '0',
};

const startButtonTextStyle = {
  fontSize: '26px',
  fontWeight: '800',
  color: '#111111',
  letterSpacing: '-0.02em',
};

const startButtonIconWrapStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  backgroundColor: '#5B6BFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 24px rgba(91, 107, 255, 0.3)',
  transition: 'all 0.3s ease',
};

const noticeCardStyle = {
  marginTop: '40px',
  borderRadius: '24px',
  background: '#FFFFFF',
  padding: '36px 40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
};

const noticeTitleStyle = {
  fontSize: '16px',
  fontWeight: '800',
  color: '#5B6BFF',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const noticeIconStyle = {
  color: '#5B6BFF',
  fontSize: '20px',
};

const noticeListStyle = {
  paddingLeft: '24px',
  margin: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const noticeItemStyle = {
  color: '#666666',
  fontSize: '15px',
  lineHeight: '1.6',
  fontWeight: '500',
};
</script>
