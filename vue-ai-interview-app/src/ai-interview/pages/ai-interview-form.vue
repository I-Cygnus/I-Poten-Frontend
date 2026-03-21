<template>
  <main :style="pageStyle">
    <!-- 소프트 배경 -->
    <div :style="softBgStyle"></div>

    <div :style="wrapperStyle">
      <div class="layout-container" :style="layoutContainerStyle">
        <!-- 좌측 사이드바 -->
        <aside class="sidebar-column" :style="sidebarStyle">
          <!-- 뒤로가기 -->
          <div :style="backButtonWrapperStyle" @click="goBack" class="back-btn-hover back-btn-animation">
            <div :style="backButtonStyle">
              <v-icon color="#111111" size="20">mdi-arrow-left</v-icon>
            </div>
            <span :style="backButtonTextStyle">뒤로가기</span>
          </div>

          <!-- 타이틀 영역 -->
          <div :style="sidebarTitleAreaStyle">
            <div :style="sidebarSubtitleStyle">AI INTERVIEW</div>
            <h1 :style="sidebarTitleStyle">{{ formTitle }}</h1>
            <p :style="sidebarDescStyle">{{ formDescription }}</p>
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

          <!-- 01 전공 여부 -->
          <div :style="sectionStyle" class="section-animation">
            <span :style="stepNumberStyle">01</span>
            <h2 :style="sectionTitleStyle">전공 여부</h2>
            <p :style="helperTextStyle">해당 직무와 관련된 전공 여부를 선택해주세요.</p>
            <div :style="chipContainerStyle">
              <div
                v-for="(major, index) in academicBackgrounds"
                :key="index"
                :style="[chipStyle, selectedAcademicBackground === major ? selectedChipStyle : {}]"
                @click="selectedAcademicBackground = major"
                class="chip-animation"
              >
                {{ major }}
              </div>
            </div>
          </div>

          <!-- 02 경력 사항 -->
          <div :style="sectionStyle" class="section-animation">
            <span :style="stepNumberStyle">02</span>
            <h2 :style="sectionTitleStyle">경력 사항</h2>
            <p :style="helperTextStyle">본인의 경력 연차를 선택해주세요.</p>
            <div :style="chipContainerStyle">
              <div
                v-for="(career, index) in careers"
                :key="index"
                :style="[chipStyle, selectedCareer === career ? selectedChipStyle : {}]"
                @click="selectedCareer = career"
                class="chip-animation"
              >
                {{ career }}
              </div>
            </div>
          </div>

          <!-- 03 프로젝트 경험 -->
          <div :style="sectionStyle" class="section-animation">
            <span :style="stepNumberStyle">03</span>
            <h2 :style="sectionTitleStyle">프로젝트 경험</h2>
            <p :style="helperTextStyle">직무 관련 프로젝트 경험이 있으신가요?</p>
            <div :style="chipContainerStyle">
              <div
                v-for="(project, index) in projectExperience"
                :key="index"
                :style="[chipStyle, selectedProjectExperience === project ? selectedChipStyle : {}]"
                @click="handleProjectExperienceChange(project)"
                class="chip-animation"
              >
                {{ project }}
              </div>
            </div>

            <!-- 프로젝트 상세 폼 -->
            <div v-if="selectedProjectExperience === '있음'" :style="projectFormContainerStyle" class="project-form-animation">
              <div :style="projectFormHeaderStyle">
                <span :style="projectFormTitleStyle">상세입력</span>
              </div>

              <div v-for="(project, index) in projectList" :key="index" :style="projectItemStyle">
                <div :style="projectHeaderStyle" v-if="projectList.length > 1">
                  <div :style="projectBadgeStyle">프로젝트 {{ index + 1 }}</div>
                  <v-btn icon small @click="removeProject(index)" :style="removeProjectBtnStyle" elevation="0">
                    <v-icon size="18" color="#ef4444">mdi-close</v-icon>
                  </v-btn>
                </div>

                <div :style="projectInputWrapperStyle">
                  <div :style="inputLabelStyle">프로젝트 이름 <span :style="requiredAsteriskStyle">*</span></div>
                  <input
                    v-model="project.projectName"
                    placeholder="프로젝트명을 입력해주세요."
                    :style="customInputStyle"
                  />
                </div>

                <div :style="projectInputWrapperStyle">
                  <div :style="inputLabelStyle">상세 내용 <span :style="requiredAsteriskStyle">*</span></div>
                  <textarea
                    v-model="project.projectDescription"
                    placeholder="자세한 프로젝트 내용을 적어주세요."
                    rows="5"
                    :style="customTextareaStyle"
                  />
                </div>
              </div>

              <button :style="addProjectBtnStyle" @click="addProject">
                + 다른 프로젝트 추가하기
              </button>
            </div>
          </div>

          <!-- 04 직무 선택 -->
          <div :style="sectionStyle" class="section-animation">
            <span :style="stepNumberStyle">04</span>
            <h2 :style="sectionTitleStyle">희망 직무</h2>
            <p :style="helperTextStyle">면접을 희망하는 직무를 선택해주세요.</p>
            <div :style="chipContainerStyle">
              <div
                v-for="(keyword, index) in keywords"
                :key="index"
                :style="[chipStyle, selectedKeyword === keyword ? selectedChipStyle : {}]"
                @click="selectedKeyword = keyword"
                class="chip-animation"
              >
                {{ keyword }}
              </div>
            </div>
          </div>

          <!-- 05 기술 스택 -->
          <div :style="sectionStyle" class="section-animation">
            <span :style="stepNumberStyle">05</span>
            <h2 :style="sectionTitleStyle">보유 기술</h2>
            <p :style="helperTextStyle">본인이 보유한 기술 스택을 모두 선택해주세요. (다중 선택 가능)</p>
            <div :style="chipContainerStyle">
              <div
                v-for="(skill, index) in skills"
                :key="index"
                :style="[chipStyle, selectedTechSkills.includes(skill) ? selectedChipStyle : {}]"
                @click="toggleTechSkill(skill)"
                class="chip-animation"
              >
                {{ skill }}
              </div>
            </div>
          </div>

          <!-- 면접 시작 버튼 -->
          <div :style="buttonContainerStyle">
            <button
              :style="[startButtonStyle, (!isFormValid || isLoading) ? { opacity: 0.5, cursor: 'not-allowed' } : {}]"
              :disabled="!isFormValid || isLoading"
              @click="handleStart"
              class="start-button-animation"
            >
              <span :style="startButtonTextStyle">{{ isLoading ? '면접 준비 중...' : 'AI 면접 시작' }}</span>
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
              <li :style="noticeItemStyle">본 면접은 입력된 정보를 기반으로 한 맞춤형 <strong>TECH-INTERVIEW</strong>입니다.</li>
              <li :style="noticeItemStyle">모의면접에는 <strong>마이크 및 카메라</strong> 권한이 필요합니다.</li>
              <li :style="noticeItemStyle">조용한 환경에서 진행하시는 것을 권장합니다.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <!-- 커스텀 시스템 메시지 모달 -->
    <div v-if="showSystemModal" :style="modalOverlayStyle" @click="showSystemModal = false">
      <div :style="modalContentStyle" @click.stop style="padding-top: 64px">
        <h2 :style="modalTitleStyle">{{ modalTitle || '안내' }}</h2>
        <p :style="modalMessageStyle" style="white-space: pre-line">{{ alertMessage }}</p>
        <div :style="modalButtonGroupStyle">
          <button :style="modalCancelButtonStyle" @click="showSystemModal = false">
            취소
          </button>
          <button :style="modalConfirmButtonStyle" @click="onConfirm">
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
import * as axiosUtility from "../utility/axiosInstance";
import AlertPopup from '@/components/common/AlertPopup.vue';

const alertVisible = ref(false);
const alertMessage = ref('');
const modalTitle = ref('');
const showSystemModal = ref(false);
const onConfirm = ref(() => {});
const showAlert = (msg) => { 
  alertMessage.value = msg; 
  onConfirm.value = () => { showSystemModal.value = false; };
  showSystemModal.value = true; 
};

const router = useRouter();
const route = useRoute();

const interviewType = ref(route.params.type || '');
const interviewSubType = ref(route.params.subType || '');
const selectedCompany = ref(route.params.company || '');

const formTitle = computed(() => {
  if (interviewType.value === '전형별' && interviewSubType.value === '기술면접') return '전형별 기술 면접 상세 정보';
  if (interviewType.value === '기업별') return `${selectedCompany.value} 면접 상세 정보`;
  return '면접 상세 정보';
});

const formDescription = computed(() => {
  if (interviewType.value === '전형별') return `${interviewSubType.value} 면접을 위한 상세 정보를 입력해주세요`;
  if (interviewType.value === '기업별') return `${selectedCompany.value} 면접을 위한 상세 정보를 입력해주세요`;
  return '면접을 위한 상세 정보를 입력해주세요';
});

const goBack = () => {
  router.push({ name: 'ai-interview-detail', params: { type: interviewType.value } });
};

// 직무
const keywords = ref(["Backend", "Frontend", "App·Web", "AI", "Embedded", "DevOps"]);
const selectedKeyword = ref("");

// 전공
const academicBackgrounds = ref(["전공자", "비전공자"]);
const selectedAcademicBackground = ref("");

// 경력
const careers = ref(["신입", "3년 이하", "5년 이하", "10년 이하", "10년 이상"]);
const selectedCareer = ref("");

// 프로젝트 경험
const projectExperience = ref(["있음", "없음"]);
const selectedProjectExperience = ref("");
const projectList = ref([{ projectName: "", projectDescription: "" }]);

const handleProjectExperienceChange = (value) => {
  selectedProjectExperience.value = value;
  if (value === "있음" && projectList.value.length === 0) {
    addProject();
  }
};

const addProject = () => {
  projectList.value.push({ projectName: "", projectDescription: "" });
};

const removeProject = (index) => {
  projectList.value.splice(index, 1);
  if (projectList.value.length === 0) {
    selectedProjectExperience.value = "없음";
  }
};

// 기술 스택
const skills = ref([
  "풀스택", "백엔드/서버개발", "프론트엔드", "웹개발", "Flutter", "Java",
  "JavaScript", "Python", "Vue.js", "API", "MYSQL", "AWS", "ReactJS", "ASP",
  "Angular", "Bootstrap", "Node.js", "jQuery", "PHP", "JSP", "GraphQL", "HTML5",
]);
const selectedTechSkills = ref([]);

const toggleTechSkill = (skill) => {
  const index = selectedTechSkills.value.indexOf(skill);
  if (index === -1) {
    selectedTechSkills.value.push(skill);
  } else {
    selectedTechSkills.value.splice(index, 1);
  }
};

const timelineSteps = computed(() => [
  { label: '전공/경력', completed: selectedAcademicBackground.value !== '' && selectedCareer.value !== '' },
  { label: '프로젝트', completed: selectedProjectExperience.value !== '' },
  { label: '직무/기술', completed: selectedKeyword.value !== '' && selectedTechSkills.value.length > 0 },
]);

const activeStepIndex = computed(() => {
  const index = timelineSteps.value.findIndex(step => !step.completed);
  return index === -1 ? timelineSteps.value.length - 1 : index;
});

const isFormValid = computed(() => {
  const baseValid = selectedAcademicBackground.value && selectedCareer.value && selectedKeyword.value && selectedTechSkills.value.length > 0;
  if (selectedProjectExperience.value === '있음') {
    return baseValid && projectList.value.every(p => p.projectName && p.projectDescription);
  }
  return baseValid && selectedProjectExperience.value !== '';
});

const isLoading = ref(false);

const CREDIT_COSTS = { '전형별': 2, '기업별': 6 };

const handleStart = async () => {
  if (!isFormValid.value) {
    showAlert('모든 필수 항목을 입력해주세요.');
    return;
  }

  const jobstorage = {
    interviewType: interviewType.value,
    interviewSubType: interviewSubType.value || "기술면접",
    company: selectedCompany.value,
    major: selectedAcademicBackground.value,
    career: selectedCareer.value,
    projectExp: selectedProjectExperience.value,
    interviewAccountProjectRequests: selectedProjectExperience.value === "있음" ? projectList.value : [],
    job: selectedKeyword.value,
    techStacks: selectedTechSkills.value,
  };

  let message = `입력하신 정보를 바탕으로\n최적의 AI 면접 문항을 생성합니다.\n\n유형 : ${interviewType.value}${interviewSubType.value ? ' (' + interviewSubType.value + ')' : ''}\n${selectedCompany.value ? '기업 : ' + selectedCompany.value + '\n' : ''}직무 : ${selectedKeyword.value}\n기술 : ${selectedTechSkills.value.slice(0, 3).join(", ")}${selectedTechSkills.value.length > 3 ? ' 외' : ''}\n\n정보가 정확하다면 확인을 눌러주세요.`;

  modalTitle.value = '면접 정보 확인';
  alertMessage.value = message;
  onConfirm.value = async () => {
    showSystemModal.value = false;
    isLoading.value = true;
    
    // 크레딧 차감
    const price = CREDIT_COSTS[interviewType.value] ?? 0;
    if (price > 0) {
      try {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();
        await springAxiosInstance.post('/credit/pay', { price });
      } catch (e) {
        isLoading.value = false;
        const status = e?.response?.status;
        if (status === 402 || status === 400) {
          showAlert('크레딧이 부족합니다. 크레딧을 충전 후 이용해 주세요.');
        } else {
          showAlert('크레딧 차감 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        }
        return;
      }
    }

    localStorage.setItem("interviewInfo", JSON.stringify(jobstorage));
    router.push("/ai-test");
  };
  showSystemModal.value = true;
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

const sidebarTitleAreaStyle = { marginBottom: '48px' };

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
};

const sidebarDescStyle = {
  fontSize: '14px',
  color: '#6B7280',
  lineHeight: '1.6',
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
};

const helperTextStyle = {
  fontSize: '15px',
  color: '#888888',
  marginBottom: '24px',
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
  fontSize: '15px',
};

const selectedChipStyle = {
  backgroundColor: '#5B6BFF',
  color: '#FFFFFF',
  boxShadow: '0 6px 16px rgba(91, 107, 255, 0.25)',
  transform: 'translateY(-2px)',
};

const projectFormContainerStyle = {
  marginTop: '32px',
  padding: '40px',
  backgroundColor: '#FFFFFF',
  borderRadius: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: '40px',
};

const projectFormHeaderStyle = {
  paddingBottom: '20px',
  borderBottom: '2px solid #F3F4F6',
};

const projectFormTitleStyle = {
  fontSize: '18px',
  fontWeight: '800',
  color: '#111111',
};

const projectItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  paddingBottom: '40px',
  borderBottom: '1px dashed #E5E7EB',
};

const projectHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const projectBadgeStyle = {
  fontSize: '15px',
  fontWeight: '800',
  color: '#5B6BFF',
};

const removeProjectBtnStyle = {
  minWidth: 'auto',
  width: '36px',
  height: '36px',
  background: '#FEE2E2',
  borderRadius: '50%',
};

const projectInputWrapperStyle = { 
  display: 'flex',
  flexDirection: 'column',
};

const inputLabelStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#111111',
  marginBottom: '12px',
};

const requiredAsteriskStyle = { color: '#ef4444', marginLeft: '4px' };

const customInputStyle = {
  width: '100%',
  padding: '18px 24px',
  borderRadius: '16px',
  border: 'none',
  backgroundColor: '#F9FAFB',
  fontSize: '15px',
  color: '#111111',
  outline: 'none',
};

const customTextareaStyle = {
  ...customInputStyle,
  resize: 'vertical',
};

const addProjectBtnStyle = {
  width: 'fit-content',
  padding: '0',
  background: 'transparent',
  color: '#888888',
  border: 'none',
  fontSize: '15px',
  fontWeight: '700',
  cursor: 'pointer',
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '20px',
};

const startButtonStyle = {
  background: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  cursor: 'pointer',
};

const startButtonTextStyle = {
  fontSize: '26px',
  fontWeight: '800',
  color: '#111111',
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
};

const noticeCardStyle = {
  marginTop: '40px',
  borderRadius: '24px',
  background: '#FFFFFF',
  padding: '36px 40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
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
};

// ========== 모달 스타일 (트렌디 & 포멀) ========== //
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
  gap: '12px',
  justifyContent: 'center'
};

const modalCancelButtonStyle = {
  flex: '1',
  padding: '16px',
  borderRadius: '16px',
  border: '1.5px solid #e2e8f0',
  background: '#ffffff',
  color: '#64748b',
  fontSize: '15px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const modalConfirmButtonStyle = {
  flex: '1',
  padding: '16px',
  borderRadius: '16px',
  border: 'none',
  background: '#1e293b',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
};

onMounted(() => {
  if (!interviewType.value) router.push('/ai-interview/select');
  if (interviewSubType.value === '인성면접') router.push('/ai-interview/personality-form');
});
</script>

<style scoped>
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.back-btn-animation { animation: slideInLeft 0.5s ease forwards; }

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