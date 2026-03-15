<template>
  <main :style="pageStyle">
    <!-- 소프트 배경 (PotenWordLandingPage SoftBg) -->
    <div :style="softBgStyle"></div>

    <div :style="wrapperStyle">
      <div class="layout-container" :style="layoutContainerStyle">
        <!-- 좌측 사이드바 (타임라인 & 헤더) -->
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

        <!-- 01 직무 -->
        <div :style="sectionStyle" class="section-animation">
          <span :style="stepNumberStyle">01</span>
          <h2 :style="sectionTitleStyle">지원 직무를 알려주세요</h2>
          <p :style="helperTextStyle">면접을 진행할 주요 직무를 1가지 선택해주세요.</p>
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

        <!-- 02 전공 여부 -->
        <div :style="sectionStyle" class="section-animation">
          <span :style="stepNumberStyle">02</span>
          <h2 :style="sectionTitleStyle">전공 여부</h2>
          <p :style="helperTextStyle">본인의 전공 여부를 선택해주세요.</p>
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

        <!-- 03 경력 -->
        <div :style="sectionStyle" class="section-animation">
          <span :style="stepNumberStyle">03</span>
          <h2 :style="sectionTitleStyle">경력</h2>
          <p :style="helperTextStyle">현재까지의 총 경력을 선택해주세요.</p>
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

        <!-- 04 프로젝트 경험 -->
        <div :style="sectionStyle" class="section-animation">
          <span :style="stepNumberStyle">04</span>
          <h2 :style="sectionTitleStyle">프로젝트 경험</h2>
          <p :style="helperTextStyle">직무와 관련된 프로젝트 경험 유무를 선택해주세요.</p>
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

        <!-- 05 기술 스택 -->
        <div :style="sectionStyle" class="section-animation">
          <span :style="stepNumberStyle">05</span>
          <h2 :style="sectionTitleStyle">기술 스택</h2>
          <p :style="helperTextStyle">사용 가능한 기술 스택을 모두 선택해주세요.</p>
          <div :style="chipContainerStyle">
            <div
              v-for="(skill, index) in skills"
              :key="index"
              :style="[chipStyle, selectedTechSkills.includes(skill) ? selectedChipStyle : {}]"
              @click="toggleSkill(skill)"
              class="chip-animation"
            >
              {{ skill }}
            </div>
          </div>
        </div>

        <!-- 06 면접 준비도 -->
        <div :style="sectionStyle" class="section-animation">
          <span :style="stepNumberStyle">06</span>
          <h2 :style="sectionTitleStyle">면접 준비도</h2>
          <p :style="helperTextStyle">현재 본인의 면접 준비 상태를 알려주세요.</p>
          <v-slider
            v-model="preparednessLevel"
            :min="1" :max="5" :step="1"
            :ticks="true"
            :tick-labels="preparednessLabels"
            :thumb-size="24"
            track-color="#E5E7EB"
            track-fill-color="#5B6BFF"
            thumb-color="#5B6BFF"
            :style="sliderStyle"
          />
        </div>

        <!-- 면접 시작 버튼 -->
        <div :style="buttonContainerStyle">
          <button
            :style="[startButtonStyle, !isFormValid ? { opacity: 0.5, cursor: 'not-allowed' } : {}]"
            :disabled="!isFormValid"
            @click="startInterview"
            class="start-button-animation"
          >
            <span :style="startButtonTextStyle">면접 시작</span>
            <div :style="startButtonIconWrapStyle" class="start-btn-icon">
              <v-icon color="white">mdi-arrow-right</v-icon>
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
  </main>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(16px); }
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

.project-form-animation { animation: slideInUp 0.4s ease; }
</style>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import * as axiosUtility from "../utility/axiosInstance";

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
  if (value === "없음") projectList.value = [{ projectName: "", projectDescription: "" }];
};
const addProject = () => { projectList.value.push({ projectName: "", projectDescription: "" }); };
const removeProject = (index) => { projectList.value.splice(index, 1); };

// 기술 스택
const skills = ref([
  "풀스택", "백엔드/서버개발", "프론트엔드", "웹개발", "Flutter", "Java",
  "JavaScript", "Python", "Vue.js", "API", "MYSQL", "AWS", "ReactJS", "ASP",
  "Angular", "Bootstrap", "Node.js", "jQuery", "PHP", "JSP", "GraphQL", "HTML5",
]);

const techStackDisplayToEnum = {
  "풀스택": "FULLSTACK", "백엔드/서버개발": "BACKEND", "프론트엔드": "FRONTEND",
  "웹개발": "WEB", "Flutter": "FLUTTER", "Java": "JAVA", "JavaScript": "JAVASCRIPT",
  "Python": "PYTHON", "Vue.js": "VUEJS", "API": "API", "MYSQL": "MYSQL",
  "AWS": "AWS", "ReactJS": "REACTJS", "ASP": "ASP", "Angular": "ANGULAR",
  "Bootstrap": "BOOTSTRAP", "Node.js": "NODEJS", "jQuery": "JQUERY",
  "PHP": "PHP", "JSP": "JSP", "GraphQL": "GRAPHQL", "HTML5": "HTML5"
};
const selectedTechSkills = ref([]);

// 면접 준비도
const preparednessLevel = ref(3);
const preparednessLabels = ['매우 낮음', '낮음', '보통', '높음', '매우 높음'];

const timelineSteps = computed(() => {
  return [
    { label: "직무", completed: selectedKeyword.value !== "" },
    { label: "전공 여부", completed: selectedAcademicBackground.value !== "" },
    { label: "경력", completed: selectedCareer.value !== "" },
    { label: "프로젝트 경험", completed: selectedProjectExperience.value !== "" && (selectedProjectExperience.value === '없음' || projectList.value.every(p => p.projectName && p.projectDescription)) },
    { label: "기술 스택", completed: selectedTechSkills.value.length > 0 },
    { label: "면접 준비도", completed: true },
  ];
});

const activeStepIndex = computed(() => {
  const index = timelineSteps.value.findIndex(step => !step.completed);
  return index === -1 ? timelineSteps.value.length - 1 : index;
});

const toggleSkill = (skill) => {
  const index = selectedTechSkills.value.indexOf(skill);
  if (index === -1) selectedTechSkills.value.push(skill);
  else selectedTechSkills.value.splice(index, 1);
};

const isFormValid = computed(() => {
  const basicValid = (
    selectedKeyword.value &&
    selectedAcademicBackground.value &&
    selectedCareer.value &&
    selectedProjectExperience.value &&
    selectedTechSkills.value.length > 0
  );
  if (selectedProjectExperience.value === "있음") {
    const projectValid = projectList.value.every(
      (p) => p.projectName.trim() !== "" && p.projectDescription.trim() !== ""
    );
    return basicValid && projectValid;
  }
  return basicValid;
});

const CREDIT_COSTS = { '전형별': 2, '기업별': 6 };

const startInterview = async () => {
  if (!isFormValid.value) { alert("모든 필수 항목을 선택해 주세요."); return; }

  const jobstorage = {
    interviewType: interviewType.value === "기업별" ? "COMPANY" : "TECH",
    company: selectedCompany.value || "",
    major: selectedAcademicBackground.value,
    career: selectedCareer.value,
    projectExp: selectedProjectExperience.value === "있음",
    job: selectedKeyword.value,
    interviewAccountProjectRequests: selectedProjectExperience.value === "있음"
      ? projectList.value.filter(p => p.projectName.trim() && p.projectDescription.trim())
      : [],
    techStacks: selectedTechSkills.value.map(skill => techStackDisplayToEnum[skill] || skill),
    firstQuestion: "",
    firstAnswer: ""
  };

  let message = `
면접 유형: ${interviewType.value}${interviewSubType.value ? ' - ' + interviewSubType.value : ''}
${selectedCompany.value ? '선택한 회사: ' + selectedCompany.value : ''}
전공 여부: ${selectedAcademicBackground.value}
선택한 경력: ${selectedCareer.value}
프로젝트 경험: ${selectedProjectExperience.value}
선택한 직무: ${selectedKeyword.value}
기술 스택: ${selectedTechSkills.value.join(", ")}`;

  if (selectedProjectExperience.value === "있음") {
    message += `\n프로젝트 목록:\n${projectList.value.map((p, i) => `  ${i + 1}. ${p.projectName}`).join('\n')}`;
  }
  if (!confirm(message + "\n\n면접을 시작하시겠습니까?")) return;

  // 크레딧 차감
  const price = CREDIT_COSTS[interviewType.value] ?? 0;
  if (price > 0) {
    try {
      const { springAxiosInstance } = axiosUtility.createAxiosInstances();
      await springAxiosInstance.post('/credit/pay', { price });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 402 || status === 400) {
        alert('크레딧이 부족합니다. 크레딧을 충전 후 이용해 주세요.');
      } else {
        alert('크레딧 차감 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
      return;
    }
  }

  localStorage.setItem("interviewInfo", JSON.stringify(jobstorage));
  router.push("/ai-test");
};

// ===== 스타일 =====

const pageStyle = {
  minHeight: "100vh",
  width: "100%",
  position: "relative",
  background: "#F5F6F8", // 아주 밝고 세련된 라이트 그레이
  fontFamily: "'Pretendard', sans-serif",
};

const softBgStyle = {
  position: "fixed",
  inset: "0",
  zIndex: "0",
  pointerEvents: "none",
  background: `
    radial-gradient(1200px 1200px at 15% 40%, rgba(211,228,253,0.3) 0%, rgba(211,228,253,0.05) 50%, transparent 100%),
    radial-gradient(1200px 1200px at 85% 60%, rgba(213,247,239,0.3) 0%, rgba(213,247,239,0.05) 50%, transparent 100%)
  `,
};

const wrapperStyle = {
  width: "100%",
  padding: "60px 40px 140px",
  display: "flex",
  justifyContent: "center",
  position: "relative",
  zIndex: "1",
};

const layoutContainerStyle = {
  display: "flex",
  width: "100%",
  maxWidth: "1140px",
  gap: "80px",
  alignItems: "flex-start",
};

const sidebarStyle = {
  width: "240px",
  flexShrink: "0",
  position: "sticky",
  top: "60px",
  display: "flex",
  flexDirection: "column",
};

const backButtonWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  marginBottom: "48px",
  marginRight: "48px"
};

const backButtonStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  transition: "all 0.2s ease",
};

const backButtonTextStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#4B5563",
};

const sidebarTitleAreaStyle = {
  marginBottom: "48px",
  marginRight: "50px",
};

const sidebarSubtitleStyle = {
  fontSize: "13px",
  fontWeight: "800",
  color: "#5B6BFF",
  marginBottom: "8px",
  letterSpacing: "0.05em",
};

const sidebarTitleStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#111111",
  lineHeight: "1.3",
  letterSpacing: "-0.02em",
  marginBottom: "12px",
  wordBreak: "keep-all",
};

const sidebarDescStyle = {
  fontSize: "14px",
  color: "#6B7280",
  lineHeight: "1.6",
  wordBreak: "keep-all",
};

// Timeline
const timelineContainerStyle = {
  display: "flex",
  flexDirection: "column",
  position: "relative",
  marginLeft: "8px", 
};

const timelineLineStyle = {
  position: "absolute",
  left: "11px",
  top: "16px",
  bottom: "16px",
  width: "2px",
  backgroundColor: "#E5E7EB",
  zIndex: "0",
};

const getTimelineStepStyle = (isActive, isCompleted) => ({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "16px 0",
  position: "relative",
  zIndex: "1",
  opacity: isActive || isCompleted ? "1" : "0.4",
  transition: "opacity 0.3s ease",
});

const getTimelineDotStyle = (isActive, isCompleted) => ({
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: isCompleted ? "#10B981" : (isActive ? "#FFFFFF" : "#F3F4F6"),
  border: isCompleted ? "none" : (isActive ? "3px solid #5B6BFF" : "2px solid #D1D5DB"),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  boxShadow: isActive && !isCompleted ? "0 0 0 4px rgba(91, 107, 255, 0.1)" : "none",
});

const activeDotInnerStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#5B6BFF",
};

const getTimelineLabelStyle = (isActive, isCompleted) => ({
  fontSize: "15px",
  fontWeight: isActive || isCompleted ? "700" : "500",
  color: isCompleted ? "#10B981" : (isActive ? "#111111" : "#888888"),
  transition: "color 0.3s ease",
});

const formContainerStyle = {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "96px", // 섹션 간 넓은 여백으로 시원한 느낌
  maxWidth: "760px",
};

const stepNumberStyle = {
  color: "#5B6BFF",
  fontSize: "16px",
  fontWeight: "800",
  display: "block",
  marginBottom: "12px",
  letterSpacing: "0.05em",
};

const sectionStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

const sectionTitleStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#111111",
  marginBottom: "12px",
  letterSpacing: "-0.02em",
};

const helperTextStyle = {
  fontSize: "15px",
  color: "#888888",
  marginBottom: "24px",
  fontWeight: "500",
};

const chipContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const chipStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "100px",
  padding: "16px 28px",
  textAlign: "center",
  cursor: "pointer",
  fontWeight: "600",
  color: "#444444",
  boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  userSelect: "none",
};

const selectedChipStyle = {
  backgroundColor: "#5B6BFF",
  color: "#FFFFFF",
  boxShadow: "0 6px 16px rgba(91, 107, 255, 0.25)",
  transform: "translateY(-2px)",
};

const sliderStyle = {
  marginTop: "20px",
  padding: "0 10px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "flex-end", // 우측 정렬
  marginTop: "20px",
  marginBottom: "40px",
};

const startButtonStyle = {
  background: "transparent",
  border: "none",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  cursor: "pointer",
  padding: "0",
};

const startButtonTextStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#111111",
  letterSpacing: "-0.02em",
};

const startButtonIconWrapStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: "#5B6BFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 24px rgba(91, 107, 255, 0.3)",
  transition: "all 0.3s ease",
};

const noticeCardStyle = {
  marginTop: "40px",
  borderRadius: "24px",
  background: "#FFFFFF",
  padding: "36px 40px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
};

const noticeTitleStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#5B6BFF",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const noticeIconStyle = {
  color: "#5B6BFF",
  fontSize: "20px",
};

const noticeListStyle = {
  paddingLeft: "24px",
  margin: "0",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const noticeItemStyle = {
  color: "#666666",
  fontSize: "15px",
  lineHeight: "1.6",
  fontWeight: "500",
};

// 프로젝트 폼
const requiredAsteriskStyle = {
  color: "#5B6BFF",
  marginLeft: "4px",
};

const projectFormContainerStyle = {
  marginTop: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const projectFormHeaderStyle = {
  marginBottom: "8px",
};

const projectFormTitleStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#111111",
};

const projectItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  paddingBottom: "40px",
  borderBottom: "1px dashed #E5E7EB",
};

const projectHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const projectBadgeStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#5B6BFF",
};

const removeProjectBtnStyle = {
  minWidth: "auto",
  width: "36px",
  height: "36px",
  background: "#FEE2E2",
  borderRadius: "50%",
};

const projectInputWrapperStyle = { 
  display: "flex",
  flexDirection: "column",
};

const inputLabelStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#111111",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
};

const customInputStyle = {
  width: "100%",
  padding: "18px 24px",
  borderRadius: "16px",
  border: "none",
  backgroundColor: "#FFFFFF",
  fontSize: "15px",
  color: "#111111",
  boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
  outline: "none",
  fontFamily: "inherit",
};

const customTextareaStyle = {
  ...customInputStyle,
  resize: "vertical",
};

const addProjectBtnStyle = {
  width: "fit-content",
  padding: "0",
  background: "transparent",
  color: "#888888",
  border: "none",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

onMounted(() => {
  if (!interviewType.value) router.push('/ai-interview/select');
});
</script>
