<template>
  <main>
    <v-container align-center :style="containerStyle">
      <v-btn icon @click="goBack" :style="backButtonStyle" class="back-btn-animation">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      
      <div class="page-transition">
      
      <div :style="formContainerStyle" class="form-container-animation">
        <div :style="headerContainerStyle" class="header-animation">
          <h1 :style="mainTitleStyle" class="title-animation">
            <span :style="highlightTextStyle">{{ formTitle }}</span>
          </h1>
          <div :style="titleUnderlineStyle" class="underline-animation"></div>
          <p :style="subtitleStyle" class="subtitle-animation">{{ formDescription }}</p>
        </div>

        <v-card :style="cardStyle" class="card-animation">
          <v-card-text class="card-content-animation">
            <!-- 직무 -->
            <div :style="sectionStyle" class="section-animation" v-motion
              :initial="{ opacity: 0, y: 50 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 700 } }">
              <h2 :style="sectionTitleStyle" class="section-title-animation">직무</h2>
              <div :style="chipContainerStyle" class="chip-container-animation">
                <v-chip
                  v-for="(keyword, index) in keywords"
                  :key="index"
                  :value="keyword"
                  :style="[chipStyle, selectedKeyword === keyword ? selectedChipStyle : {}]"
                  @click="selectedKeyword = keyword"
                  class="chip-animation"
                  :class="{'selected-chip-animation': selectedKeyword === keyword}"
                  v-motion
                  :initial="{ opacity: 0, scale: 0.8 }"
                  :enter="{ opacity: 1, scale: 1, transition: { delay: 300 + index * 50, duration: 500 } }"
                >
                  {{ keyword }}
                </v-chip>
              </div>
            </div>

            <!-- 전공 여부 -->
            <div :style="sectionStyle">
              <h2 :style="sectionTitleStyle">전공 여부</h2>
              <div :style="chipContainerStyle">
                <v-chip
                  v-for="(major, index) in academicBackgrounds"
                  :key="index"
                  :value="major"
                  :style="[chipStyle, selectedAcademicBackground === major ? selectedChipStyle : {}]"
                  @click="selectedAcademicBackground = major"
                >
                  {{ major }}
                </v-chip>
              </div>
            </div>

            <!-- 경력 -->
            <div :style="sectionStyle">
              <h2 :style="sectionTitleStyle">경력</h2>
              <div :style="chipContainerStyle">
                <v-chip
                  v-for="(career, index) in careers"
                  :key="index"
                  :value="career"
                  :style="[chipStyle, selectedCareer === career ? selectedChipStyle : {}]"
                  @click="selectedCareer = career"
                >
                  {{ career }}
                </v-chip>
              </div>
            </div>

            <!-- 프로젝트 경험 -->
            <div :style="sectionStyle">
              <h2 :style="sectionTitleStyle">프로젝트 경험</h2>
              <div :style="chipContainerStyle">
                <v-chip
                  v-for="(project, index) in projectExperience"
                  :key="index"
                  :value="project"
                  :style="[chipStyle, selectedProjectExperience === project ? selectedChipStyle : {}]"
                  @click="handleProjectExperienceChange(project)"
                >
                  {{ project }}
                </v-chip>
              </div>
              
              <!-- 프로젝트 경험이 '있음'일 때 프로젝트 입력 폼 표시 -->
              <div v-if="selectedProjectExperience === '있음'" :style="projectFormContainerStyle" 
                   class="project-form-animation"
                   v-motion
                   :initial="{ opacity: 0, y: 20 }"
                   :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 500 } }">
                <div :style="projectFormHeaderStyle">
                  <v-icon :style="projectFormIconStyle">mdi-folder-multiple-outline</v-icon>
                  <span :style="projectFormTitleStyle">프로젝트 상세 정보</span>
                </div>
                
                <div v-for="(project, index) in projectList" :key="index" 
                     :style="projectItemStyle"
                     class="project-item-animation"
                     v-motion
                     :initial="{ opacity: 0, scale: 0.95 }"
                     :enter="{ opacity: 1, scale: 1, transition: { delay: 150 + index * 50, duration: 400 } }">
                  <div :style="projectHeaderStyle">
                    <div :style="projectBadgeStyle">
                      <v-icon size="16" color="white">mdi-briefcase-outline</v-icon>
                      <span>프로젝트 {{ index + 1 }}</span>
                    </div>
                    <v-btn 
                      v-if="projectList.length > 1"
                      icon 
                      small 
                      @click="removeProject(index)"
                      :style="removeProjectBtnStyle"
                      class="remove-btn-animation"
                    >
                      <v-icon size="18" color="#ef4444">mdi-close-circle</v-icon>
                    </v-btn>
                  </div>
                  
                  <div :style="projectInputWrapperStyle">
                    <div :style="inputLabelStyle">
                      <v-icon size="16" color="#3b82f6">mdi-text-box-outline</v-icon>
                      <span>프로젝트 이름</span>
                    </div>
                    <v-text-field
                      v-model="project.projectName"
                      placeholder="예: job-spoon 프로젝트"
                      outlined
                      dense
                      :style="projectInputStyle"
                      hide-details="auto"
                      class="custom-input"
                    ></v-text-field>
                  </div>
                  
                  <div :style="projectInputWrapperStyle">
                    <div :style="inputLabelStyle">
                      <v-icon size="16" color="#3b82f6">mdi-file-document-outline</v-icon>
                      <span>프로젝트 설명</span>
                    </div>
                    <v-textarea
                      v-model="project.projectDescription"
                      placeholder="예: AI 면접 프로젝트입니다. 사용자가 실전처럼 면접을 연습할 수 있도록 도와줍니다."
                      outlined
                      dense
                      rows="3"
                      :style="projectInputStyle"
                      hide-details="auto"
                      class="custom-input"
                    ></v-textarea>
                  </div>
                </div>
                
                <v-btn
                  :style="addProjectBtnStyle"
                  @click="addProject"
                  elevation="0"
                  class="add-project-btn-animation"
                >
                  <v-icon left size="20">mdi-plus-circle-outline</v-icon>
                  <span :style="addProjectBtnTextStyle">프로젝트 추가</span>
                </v-btn>
              </div>
            </div>

            <!-- 기술 스택 -->
            <div :style="sectionStyle">
              <h2 :style="sectionTitleStyle">기술 스택</h2>
              <p :style="helperTextStyle">관련 기술을 모두 선택해주세요</p>
              <div :style="chipContainerStyle">
                <v-chip
                  v-for="(skill, index) in skills"
                  :key="index"
                  :value="skill"
                  :style="[chipStyle, selectedTechSkills.includes(skill) ? selectedChipStyle : {}]"
                  @click="toggleSkill(skill)"
                >
                  {{ skill }}
                </v-chip>
              </div>
            </div>

            <!-- 면접 준비도 -->
            <div :style="sectionStyle">
              <h2 :style="sectionTitleStyle">면접 준비도</h2>
              <p :style="helperTextStyle">현재 면접 준비 상태를 선택해주세요</p>
              <v-slider
                v-model="preparednessLevel"
                :min="1"
                :max="5"
                :step="1"
                :ticks="true"
                :tick-labels="preparednessLabels"
                :thumb-size="24"
                :track-color="'#e0e0e0'"
                :track-fill-color="'#3b82f6'"
                :thumb-color="'#3b82f6'"
                :style="sliderStyle"
              ></v-slider>
            </div>

            <!-- 면접 시작 버튼 -->
            <div :style="buttonContainerStyle" class="button-container-animation" v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :enter="{ opacity: 1, scale: 1, transition: { delay: 800, duration: 700 } }">
              <v-btn
                :style="startButtonStyle"
                :disabled="!isFormValid"
                @click="startInterview"
                class="start-button-animation"
                :class="{'pulse-animation': isFormValid}"
              >
                <span class="btn-text-animation">면접 시작하기</span>
                <v-icon right class="btn-icon-animation">mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 안내 및 공지 -->
        <v-card :style="noticeCardStyle" class="notice-card-animation" v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 700 } }">
          <v-card-title :style="noticeTitleStyle" class="notice-title-animation">
            <v-icon :style="noticeIconStyle" class="notice-icon-animation">mdi-information-outline</v-icon>
            <span class="notice-text-animation">면접 진행 안내</span>
          </v-card-title>
          <v-card-text>
            <ul :style="noticeListStyle">
              <li :style="noticeItemStyle">
                본 면접은 특정 기업 및 직무에 맞추어진 <strong>TECH-INTERVIEW</strong>입니다.
              </li>
              <li :style="noticeItemStyle">
                모의면접에는 <strong>마이크, 카메라</strong>의 사용이 필요합니다.
              </li>
              <li :style="noticeItemStyle">
                면접 시작 전 조용한 환경에서 진행하시는 것을 권장합니다.
              </li>
              <li :style="noticeItemStyle">
                면접 결과는 마이페이지에서 확인하실 수 있습니다.
              </li>
            </ul>
          </v-card-text>
        </v-card>
      </div>
      </div>
    </v-container>
  </main>
</template>

<style scoped>
/* 애니메이션 스타일 */
.page-transition {
  animation: fadeIn 0.8s ease-out;
}

.back-btn-animation {
  animation: slideInLeft 0.6s ease-out;
}

.form-container-animation {
  animation: fadeIn 0.8s ease-out;
}

.header-animation {
  animation: fadeInDown 0.8s ease-out;
}

.title-animation {
  animation: fadeInDown 0.9s ease-out;
}

.underline-animation {
  animation: expandWidth 1.2s ease-out;
}

.subtitle-animation {
  animation: fadeInUp 1s ease-out;
}

.card-animation {
  animation: fadeInUp 0.8s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-animation:hover {
  transform: translateY(-5px);
}

.section-animation {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-animation:hover {
  transform: translateY(-3px);
}

.chip-animation {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.selected-chip-animation {
  animation: pulse 2s infinite;
}

.start-button-animation {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.start-button-animation::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.start-button-animation:hover::after {
  opacity: 1;
}

.btn-text-animation {
  position: relative;
  z-index: 2;
}

.btn-icon-animation {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.start-button-animation:hover .btn-icon-animation {
  transform: translateX(5px);
}

.pulse-animation {
  animation: softPulse 2s infinite;
}

.notice-card-animation {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.notice-card-animation:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.05);
}

.notice-icon-animation {
  animation: rotate 1s ease-out;
}

/* 키프레임 정의 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes expandWidth {
  from { width: 0; opacity: 0; }
  to { width: 80px; opacity: 1; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
  100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}

@keyframes softPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

@keyframes rotate {
  from { transform: rotate(-45deg); opacity: 0; }
  to { transform: rotate(0); opacity: 1; }
}

/* 프로젝트 폼 애니메이션 */
.project-form-animation {
  animation: slideInUp 0.5s ease-out;
}

.project-item-animation {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.project-item-animation:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15) !important;
}

.remove-btn-animation {
  transition: all 0.3s ease;
}

.remove-btn-animation:hover {
  transform: rotate(90deg) scale(1.1);
}

.add-project-btn-animation {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.add-project-btn-animation::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.add-project-btn-animation:hover::before {
  width: 300px;
  height: 300px;
}

.add-project-btn-animation:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.custom-input {
  transition: all 0.3s ease;
}

.custom-input:focus-within {
  transform: translateY(-1px);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// 라우터에서 전달받은 면접 유형과 세부 정보
const interviewType = ref(route.params.type || '');
const interviewSubType = ref(route.params.subType || '');
const selectedCompany = ref(route.params.company || '');

// 폼 제목 및 설명 계산
const formTitle = computed(() => {
  if (interviewType.value === '전형별' && interviewSubType.value === '기술면접') return '전형별 기술 면접 상세 정보';
  if (interviewType.value === '기업별') return `${selectedCompany.value} 면접 상세 정보`;
  return '면접 상세 정보';
});

const formDescription = computed(() => {
  if (interviewType.value === '전형별') {
    return `${interviewSubType.value} 면접을 위한 상세 정보를 입력해주세요`;
  }
  if (interviewType.value === '기업별') {
    return `${selectedCompany.value} 면접을 위한 상세 정보를 입력해주세요`;
  }
  return '면접을 위한 상세 정보를 입력해주세요';
});

// 이전 화면으로 돌아가기
const goBack = () => {
  router.push({
    name: 'ai-interview-detail',
    params: { type: interviewType.value }
  });
};

// 직무
const keywords = ref(["Backend", "Frontend", "App·Web", "AI", "Embedded", "DevOps"]);
const keywordMap = { Backend: 1, Frontend: 2, Embedded: 3, AI: 4, DevOps: 5, "App·Web": 6 };
const selectedKeyword = ref("");

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
const selectedProjectExperience = ref("");
const projectList = ref([{ projectName: "", projectDescription: "" }]);

// 프로젝트 경험 변경 핸들러
const handleProjectExperienceChange = (value) => {
  selectedProjectExperience.value = value;
  if (value === "없음") {
    projectList.value = [{ projectName: "", projectDescription: "" }];
  }
};

// 프로젝트 추가
const addProject = () => {
  projectList.value.push({ projectName: "", projectDescription: "" });
};

// 프로젝트 제거
const removeProject = (index) => {
  projectList.value.splice(index, 1);
};

// 기술 스택
const skills = ref([
  "풀스택", "백엔드/서버개발", "프론트엔드", "웹개발", "Flutter", "Java",
  "JavaScript", "Python", "Vue.js", "API", "MYSQL", "AWS", "ReactJS", "ASP",
  "Angular", "Bootstrap", "Node.js", "jQuery", "PHP", "JSP", "GraphQL", "HTML5",
]);
const skillsMap = Object.fromEntries(skills.value.map((s, i) => [s, i + 1]));

// displayName을 enum 이름으로 매핑
const techStackDisplayToEnum = {
  "풀스택": "FULLSTACK",
  "백엔드/서버개발": "BACKEND",
  "프론트엔드": "FRONTEND",
  "웹개발": "WEB",
  "Flutter": "FLUTTER",
  "Java": "JAVA",
  "JavaScript": "JAVASCRIPT",
  "Python": "PYTHON",
  "Vue.js": "VUEJS",
  "API": "API",
  "MYSQL": "MYSQL",
  "AWS": "AWS",
  "ReactJS": "REACTJS",
  "ASP": "ASP",
  "Angular": "ANGULAR",
  "Bootstrap": "BOOTSTRAP",
  "Node.js": "NODEJS",
  "jQuery": "JQUERY",
  "PHP": "PHP",
  "JSP": "JSP",
  "GraphQL": "GRAPHQL",
  "HTML5": "HTML5"
};

const selectedTechSkills = ref([]);

// 면접 준비도
const preparednessLevel = ref(3);
const preparednessLabels = ['매우 낮음', '낮음', '보통', '높음', '매우 높음'];

// 기술 스택 토글 함수
const toggleSkill = (skill) => {
  const index = selectedTechSkills.value.indexOf(skill);
  if (index === -1) {
    selectedTechSkills.value.push(skill);
  } else {
    selectedTechSkills.value.splice(index, 1);
  }
};

// 폼 유효성 검사
const isFormValid = computed(() => {
  const basicValid = (
    selectedKeyword.value &&
    selectedAcademicBackground.value &&
    selectedCareer.value &&
    selectedProjectExperience.value &&
    selectedTechSkills.value.length > 0
  );
  
  // 프로젝트 경험이 '있음'일 때 프로젝트 정보 검증
  if (selectedProjectExperience.value === "있음") {
    const projectValid = projectList.value.every(
      (project) => project.projectName.trim() !== "" && project.projectDescription.trim() !== ""
    );
    return basicValid && projectValid;
  }
  
  return basicValid;
});

// 면접 시작 함수
const startInterview = () => {
  if (!isFormValid.value) {
    alert("모든 필수 항목을 선택해 주세요.");
    return;
  }
  
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
  
  // 선택 정보 확인 메시지
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

  localStorage.setItem("interviewInfo", JSON.stringify(jobstorage));
  router.push("/ai-test");
};

// ---------- 스타일 변수 ---------- //
const containerStyle = { 
  marginBottom: "4rem", 
  marginTop: "2rem", 
  maxWidth: "1000px",
  position: "relative",
  background: "linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)",
  borderRadius: "24px",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.03)",
  overflow: "hidden",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)"
};

const formContainerStyle = {
  width: "100%",
  maxWidth: "850px",
  margin: "0 auto",
  padding: "1.25rem",
  position: "relative",
  zIndex: "1"
};

const headerContainerStyle = {
  textAlign: "center",
  marginBottom: "2rem"
};

const mainTitleStyle = {
  fontSize: "2.4rem",
  fontWeight: "800",
  marginBottom: "0.8rem",
  lineHeight: "1.1",
  letterSpacing: "-0.02em",
  textShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  fontFamily: "'Poppins', 'Noto Sans KR', sans-serif"
};

const highlightTextStyle = {
  background: "linear-gradient(90deg, #4f46e5 0%, #3b82f6 60%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  position: "relative",
  display: "inline-block",
  filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))"
};

const titleUnderlineStyle = {
  width: "80px",
  height: "4px",
  background: "linear-gradient(90deg, #4f46e5 0%, #3b82f6 50%, rgba(59, 130, 246, 0.3) 100%)",
  borderRadius: "2px",
  margin: "1rem auto",
  boxShadow: "0 2px 6px rgba(59, 130, 246, 0.2)"
};

const subtitleStyle = {
  fontSize: "1.1rem",
  color: "#475569",
  maxWidth: "600px",
  margin: "0 auto",
  lineHeight: "1.5",
  fontWeight: "400",
  letterSpacing: "0.01em",
  fontFamily: "'Noto Sans KR', sans-serif"
};

const cardStyle = {
  borderRadius: "16px",
  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.04), 0 6px 12px rgba(0, 0, 0, 0.02)",
  background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
  marginBottom: "1.75rem",
  overflow: "hidden",
  border: "1px solid rgba(241, 245, 249, 0.8)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  position: "relative",
  padding: "1.25rem",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 16px 32px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.03)"
  }
};

const sectionStyle = {
  marginBottom: "1.25rem",
  position: "relative",
  padding: "1rem",
  borderRadius: "14px",
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  boxShadow: "0 6px 14px rgba(0, 0, 0, 0.03)",
  border: "1px solid rgba(241, 245, 249, 0.6)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)"
  }
};

const sectionTitleStyle = {
  fontSize: "1.15rem",
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "0.5rem",
  position: "relative",
  paddingLeft: "0.75rem",
  borderLeft: "3px solid transparent",
  borderImage: "linear-gradient(to bottom, #4f46e5, #3b82f6) 1",
  display: "inline-block",
  letterSpacing: "-0.01em",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  "&::after": {
    content: "\"\"",
    position: "absolute",
    bottom: "-8px",
    left: "0",
    width: "40px",
    height: "2px",
    background: "linear-gradient(90deg, #4f46e5, rgba(79, 70, 229, 0.3))",
    borderRadius: "2px"
  }
};

const chipContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  marginTop: "0.5rem"
};

const chipStyle = {
  fontSize: "0.85rem",
  padding: "8px 14px",
  borderRadius: "30px",
  backgroundColor: "rgba(248, 250, 252, 0.8)",
  color: "#334155",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  cursor: "pointer",
  fontWeight: "500",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter: "blur(5px)",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
  margin: "2px",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
    backgroundColor: "rgba(248, 250, 252, 0.95)"
  }
};

const selectedChipStyle = {
  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
  color: "white",
  borderColor: "transparent",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 6px rgba(79, 70, 229, 0.12)",
  transform: "translateY(-1px) scale(1.02)",
  fontWeight: "600",
  letterSpacing: "0.01em",
  position: "relative",
  zIndex: "2",
  "&::after": {
    content: "\"\"",
    position: "absolute",
    top: "-2px",
    left: "-2px",
    right: "-2px",
    bottom: "-2px",
    background: "linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
    borderRadius: "32px",
    zIndex: "-1",
    filter: "blur(4px)"
  }
};

const helperTextStyle = {
  fontSize: "0.85rem",
  color: "#64748b",
  marginTop: "-0.25rem",
  marginBottom: "0.5rem",
  fontStyle: "italic",
  opacity: "0.9",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  "&::before": {
    // content: '\'\2022\'',
    color: "#3b82f6",
    fontWeight: "bold",
    display: "inline-block",
    fontSize: "1.2rem"
  }
};

const sliderStyle = {
  marginTop: "1rem",
  marginBottom: "0.75rem"
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "1.5rem",
  high: "200px"
};

const startButtonStyle = {
  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
  color: "white",
  padding: "12px 28px",
  fontSize: "1rem",
  fontWeight: "700",
  borderRadius: "12px",
  boxShadow: "0 6px 16px rgba(59, 130, 246, 0.3), 0 4px 8px rgba(79, 70, 229, 0.12)",
  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  textTransform: "none",
  letterSpacing: "0.02em",
  height: "100%",
  border: "none",
  position: "relative",
  overflow: "hidden",
  zIndex: "1",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter: "blur(5px)",
  transform: "translateY(0)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(59, 130, 246, 0.4), 0 6px 10px rgba(79, 70, 229, 0.2)"
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 3px 10px rgba(59, 130, 246, 0.3), 0 2px 5px rgba(79, 70, 229, 0.12)"
  }
};

const noticeCardStyle = {
  borderRadius: "14px",
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.04), 0 3px 10px rgba(0, 0, 0, 0.02)",
  border: "1px solid rgba(241, 245, 249, 0.8)",
  background: "linear-gradient(145deg, #f1f5f9, #f8fafc)",
  padding: "1rem",
  position: "relative",
  overflow: "hidden",
  marginTop: "1.5rem",
  "&::before": {
    content: "\"\"",
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "5px",
    background: "linear-gradient(90deg, #3b82f6, #4f46e5)"
  }
};

const noticeTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#334155",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const noticeIconStyle = {
  color: "#4f46e5",
  marginRight: "10px",
  fontSize: "1.5rem",
  filter: "drop-shadow(0 2px 4px rgba(79, 70, 229, 0.2))"
};

const noticeListStyle = {
  paddingLeft: "1.25rem",
  marginTop: "0.4rem"
};

const noticeItemStyle = {
  marginBottom: "1rem",
  color: "#334155",
  lineHeight: "1.7",
  position: "relative",
  paddingLeft: "1.5rem",
  fontSize: "1rem",
  "&::before": {
    // content: "'\2022'",
    color: "#4f46e5",
    fontWeight: "bold",
    display: "inline-block",
    width: "1em",
    marginLeft: "-1em",
    fontSize: "1.2rem"
  }
};

const backButtonStyle = {
  position: "absolute",
  top: "30px",
  left: "30px",
  zIndex: 10,
};

// 프로젝트 폼 스타일
const projectFormContainerStyle = {
  marginTop: "1.25rem",
  padding: "1.5rem",
  background: "linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)",
  borderRadius: "16px",
  border: "2px solid rgba(59, 130, 246, 0.15)",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.08)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  position: "relative",
  overflow: "hidden"
};

const projectFormHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "1.25rem",
  paddingBottom: "0.75rem",
  borderBottom: "2px solid rgba(59, 130, 246, 0.1)"
};

const projectFormIconStyle = {
  color: "#3b82f6",
  fontSize: "24px",
  filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))"
};

const projectFormTitleStyle = {
  fontSize: "1rem",
  fontWeight: "700",
  color: "#1e293b",
  letterSpacing: "-0.01em"
};

const projectItemStyle = {
  marginBottom: "1.25rem",
  padding: "1.25rem",
  background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
  borderRadius: "14px",
  border: "1px solid rgba(226, 232, 240, 0.6)",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.04)",
  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  position: "relative",
  overflow: "hidden"
};

const projectHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem"
};

const projectBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 14px",
  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  color: "white",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: "700",
  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.25)",
  letterSpacing: "0.01em"
};

const removeProjectBtnStyle = {
  minWidth: "auto",
  width: "36px",
  height: "36px",
  background: "rgba(239, 68, 68, 0.05)",
  borderRadius: "50%",
  transition: "all 0.3s ease"
};

const projectInputWrapperStyle = {
  marginBottom: "1rem"
};

const inputLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginBottom: "0.5rem",
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#475569"
};

const projectInputStyle = {
  marginTop: "0.25rem"
};

const addProjectBtnStyle = {
  width: "100%",
  marginTop: "0.75rem",
  textTransform: "none",
  fontWeight: "700",
  padding: "12px 20px",
  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)",
  color: "#3b82f6",
  border: "2px dashed rgba(59, 130, 246, 0.3)",
  borderRadius: "12px",
  fontSize: "0.95rem",
  letterSpacing: "0.01em",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  position: "relative",
  overflow: "hidden"
};

const addProjectBtnTextStyle = {
  position: "relative",
  zIndex: 2
};

onMounted(() => {
  // 면접 유형이나 세부 정보가 없으면 선택 페이지로 리다이렉트
  if (!interviewType.value) {
    router.push('/ai-interview/select');
  }
});
</script>
