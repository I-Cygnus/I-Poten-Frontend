<template>
  <main>
    <v-container v-if="!start" align-center :style="containerStyle">
      <!-- 첫 번째 화면: 면접 유형 선택 -->
      <div v-if="!showInterviewTypeSelection" :style="selectionContainerStyle">
        <div :style="titleContainerStyle">
          <h2 :style="enhancedTitleStyle">
            <span :style="titleHighlightStyle">면접 유형</span>을 선택해주세요
          </h2>
          <div :style="titleUnderlineStyle"></div>
          <p :style="titleDescriptionStyle">자신에게 맞는 면접 유형을 선택하여 실전 면접을 준비해보세요</p>
        </div>
        <div :style="interviewOptionsWrapperStyle">
          <div 
            v-for="(option, index) in interviewTypes" 
            :key="index"
            :style="[interviewTypeItemStyle, 
                    selectedInterviewType === option.type ? selectedInterviewTypeItemStyle : {}, 
                    option.status === 'preparing' ? preparingInterviewTypeItemStyle : {}]"
            @click="selectInterviewType(option.type)"
          >
            <div :style="interviewTypeIconStyle">
              <v-icon size="32" :color="selectedInterviewType === option.type ? 'white' : 'primary'">
                {{ option.icon }}
              </v-icon>
            </div>
            <div :style="interviewTypeContentStyle">
              <h2 :style="[interviewTypeTitleStyle, selectedInterviewType === option.type ? selectedInterviewTypeTitleStyle : {}]">{{ option.title }}</h2>
              <p :style="interviewTypeDescriptionStyle">{{ option.description }}</p>
            </div>
            <div :style="interviewTypeStatusStyle" v-if="option.status === 'preparing'">
              <v-chip color="grey" small>준비중</v-chip>
            </div>
            <div :style="interviewTypeOverlayStyle"></div>
          </div>
        </div>
      </div>

      <!-- 두 번째 화면: 면접 세부 유형 선택 (전형별 선택 시에만 표시) -->
      <div v-else-if="selectedInterviewType === '전형별'" :style="selectionContainerStyle">
        <v-btn icon @click="backToInterviewTypeSelection" :style="backButtonStyle">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        
        <div :style="titleContainerStyle">
          <h2 :style="enhancedTitleStyle">
            <span :style="titleHighlightStyle">면접 세부 유형</span>을 선택해주세요
          </h2>
          <div :style="titleUnderlineStyle"></div>
          <p :style="titleDescriptionStyle">자신에게 맞는 면접 세부 유형을 선택하여 맞춤형 면접을 준비해보세요</p>
        </div>
        
        <div :style="interviewOptionsWrapperStyle">
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

            <!-- 상세 정보 입력 폼 -->
            <v-slide-y-transition>
              <div v-if="selectedInterviewSubType === '기술면접'" :style="formContainerStyle">
                <v-card-title class="text-center">상세 정보를 입력해주세요</v-card-title>
                
                <!-- 직무 -->
                <v-row :style="mb8Style" justify="center">
                  <v-col cols="12" sm="8">
                    <v-card-subtitle class="text-center">직무</v-card-subtitle>
                    <v-chip-group v-model="selectedKeyword" column>
                      <v-chip
                        v-for="(keyword, index) in keywords"
                        :key="index"
                        :value="keyword"
                        clickable
                        :style="selectedKeyword === keyword ? selectedChipStyle : unselectedChipStyle"
                      >
                        {{ keyword }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>

                <!-- 전공 여부 -->
                <v-row :style="mb8Style" justify="center">
                  <v-col cols="12" sm="8">
                    <v-card-subtitle class="text-center">전공 여부</v-card-subtitle>
                    <v-chip-group v-model="selectedAcademicBackground" column>
                      <v-chip
                        v-for="(major, index) in academicBackgrounds"
                        :key="index"
                        :value="major"
                        clickable
                        :style="selectedAcademicBackground === major ? selectedChipStyle : unselectedChipStyle"
                      >
                        {{ major }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>

                <!-- 경력 -->
                <v-row :style="mb8Style" justify="center">
                  <v-col cols="12" sm="8">
                    <v-card-subtitle class="text-center">경력</v-card-subtitle>
                    <v-chip-group v-model="selectedCareer" column>
                      <v-chip
                        v-for="(career, index) in careers"
                        :key="index"
                        :value="career"
                        clickable
                        :style="selectedCareer === career ? selectedChipStyle : unselectedChipStyle"
                      >
                        {{ career }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>

                <!-- 프로젝트 경험 -->
                <v-row :style="mb8Style" justify="center">
                  <v-col cols="12" sm="8">
                    <v-card-subtitle class="text-center">프로젝트 경험</v-card-subtitle>
                    <v-chip-group v-model="selectedProjectExperience" column>
                      <v-chip
                        v-for="(project, index) in projectExperience"
                        :key="index"
                        :value="project"
                        clickable
                        :style="selectedProjectExperience === project ? selectedChipStyle : unselectedChipStyle"
                      >
                        {{ project }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>

                <!-- 기술 스택 -->
                <v-row :style="mb8Style" justify="center">
                  <v-col cols="12" sm="8">
                    <v-card-subtitle class="text-center">기술 스택</v-card-subtitle>
                    <v-chip-group v-model="selectedTechSkills" multiple column>
                      <v-chip
                        v-for="(skill, index) in skills"
                        :key="index"
                        :value="skill"
                        clickable
                        :style="selectedTechSkills.includes(skill) ? selectedChipStyle : unselectedChipStyle"
                      >
                        {{ skill }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
                
                <v-card-actions class="justify-center">
                  <v-btn
                    color="primary"
                    :disabled="!isFormValid"
                    @click="startInterview"
                    :style="buttonStyle"
                  >
                    면접 시작하기
                  </v-btn>
                </v-card-actions>
                
                <!-- 안내 및 공지 -->
                <v-container :style="drawLineStyle" align-start>
                  <v-card-title align-center>
                    <strong>※ 사전 공지 ※</strong>
                  </v-card-title>
                  <li :style="liStyle">
                    본 면접은 특정 기업 및 직무에 맞추어진 <strong>TECH-INTERVIEW</strong>입니다.
                  </li>
                  <li :style="liStyle">
                    모의면접에는 <strong>마이크, 카메라</strong>의 사용이 필요합니다.
                  </li>
                </v-container>
              </div>
            </v-slide-y-transition>
            
            <v-card-actions v-if="!selectedInterviewSubType" class="justify-center">
              <v-btn
                color="grey"
                @click="backToInterviewTypeSelection"
                :style="buttonStyle"
              >
                이전 단계
              </v-btn>
            </v-card-actions>
        </div>
        
        <!-- 기업별 면접 선택 시 -->
        <div v-else-if="selectedInterviewType === '기업별'" :style="selectionContainerStyle">
          <v-btn icon @click="backToInterviewTypeSelection" :style="backButtonStyle">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          
          <div :style="titleContainerStyle">
            <h2 :style="enhancedTitleStyle">
              <span :style="titleHighlightStyle">회사</span>를 선택해주세요
            </h2>
            <div :style="titleUnderlineStyle"></div>
            <p :style="titleDescriptionStyle">지원하려는 회사를 선택하여 해당 기업에 맞는 맞춤형 면접을 준비해보세요</p>
          </div>
          
          <div :style="companySelectionWrapperStyle">
            <div :style="companyChipContainerStyle">
              <v-chip
                v-for="(company, index) in companies"
                :key="index"
                :value="company"
                clickable
                @click="selectedCompany = company"
                :style="[companyChipStyle, selectedCompany === company ? companyChipSelectedStyle : {}]"
              >
                {{ company }}
              </v-chip>
            </div>
          </div>
              
              <!-- 기업별 면접 상세 정보 입력 폼 -->
              <v-slide-y-transition>
                <div v-if="selectedCompany" :style="formContainerStyle">
                  <v-card-title class="text-center">상세 정보를 입력해주세요</v-card-title>
                  
                  <!-- 직무 -->
                  <v-row :style="mb8Style" justify="center">
                    <v-col cols="12" sm="8">
                      <v-card-subtitle class="text-center">직무</v-card-subtitle>
                      <v-chip-group v-model="selectedKeyword" column>
                        <v-chip
                          v-for="(keyword, index) in keywords"
                          :key="index"
                          :value="keyword"
                          clickable
                          :style="selectedKeyword === keyword ? selectedChipStyle : unselectedChipStyle"
                        >
                          {{ keyword }}
                        </v-chip>
                      </v-chip-group>
                    </v-col>
                  </v-row>

                  <!-- 전공 여부 -->
                  <v-row :style="mb8Style" justify="center">
                    <v-col cols="12" sm="8">
                      <v-card-subtitle class="text-center">전공 여부</v-card-subtitle>
                      <v-chip-group v-model="selectedAcademicBackground" column>
                        <v-chip
                          v-for="(major, index) in academicBackgrounds"
                          :key="index"
                          :value="major"
                          clickable
                          :style="selectedAcademicBackground === major ? selectedChipStyle : unselectedChipStyle"
                        >
                          {{ major }}
                        </v-chip>
                      </v-chip-group>
                    </v-col>
                  </v-row>

                  <!-- 경력 -->
                  <v-row :style="mb8Style" justify="center">
                    <v-col cols="12" sm="8">
                      <v-card-subtitle class="text-center">경력</v-card-subtitle>
                      <v-chip-group v-model="selectedCareer" column>
                        <v-chip
                          v-for="(career, index) in careers"
                          :key="index"
                          :value="career"
                          clickable
                          :style="selectedCareer === career ? selectedChipStyle : unselectedChipStyle"
                        >
                          {{ career }}
                        </v-chip>
                      </v-chip-group>
                    </v-col>
                  </v-row>

                  <!-- 프로젝트 경험 -->
                  <v-row :style="mb8Style" justify="center">
                    <v-col cols="12" sm="8">
                      <v-card-subtitle class="text-center">프로젝트 경험</v-card-subtitle>
                      <v-chip-group v-model="selectedProjectExperience" column>
                        <v-chip
                          v-for="(project, index) in projectExperience"
                          :key="index"
                          :value="project"
                          clickable
                          :style="selectedProjectExperience === project ? selectedChipStyle : unselectedChipStyle"
                        >
                          {{ project }}
                        </v-chip>
                      </v-chip-group>
                    </v-col>
                  </v-row>

                  <!-- 기술 스택 -->
                  <v-row :style="mb8Style" justify="center">
                    <v-col cols="12" sm="8">
                      <v-card-subtitle class="text-center">기술 스택</v-card-subtitle>
                      <v-chip-group v-model="selectedTechSkills" multiple column>
                        <v-chip
                          v-for="(skill, index) in skills"
                          :key="index"
                          :value="skill"
                          clickable
                          :style="selectedTechSkills.includes(skill) ? selectedChipStyle : unselectedChipStyle"
                        >
                          {{ skill }}
                        </v-chip>
                      </v-chip-group>
                    </v-col>
                  </v-row>
                  
                  <v-card-actions class="justify-center">
                    <v-btn
                      color="primary"
                      :disabled="!isCompanyFormValid"
                      @click="startInterview"
                      :style="buttonStyle"
                    >
                      면접 시작하기
                    </v-btn>
                  </v-card-actions>
                  
                  <!-- 안내 및 공지 -->
                  <v-container :style="drawLineStyle" align-start>
                    <v-card-title align-center>
                      <strong>※ 사전 공지 ※</strong>
                    </v-card-title>
                    <li :style="liStyle">
                      본 면접은 특정 기업 및 직무에 맞추어진 <strong>TECH-INTERVIEW</strong>입니다.
                    </li>
                    <li :style="liStyle">
                      모의면접에는 <strong>마이크, 카메라</strong>의 사용이 필요합니다.
                    </li>
                  </v-container>
                </div>
              </v-slide-y-transition>
              
              <v-card-actions v-if="!selectedCompany" class="justify-center">
                <v-btn
                  color="grey"
                  @click="backToInterviewTypeSelection"
                  :style="buttonStyle"
                >
                  이전 단계
                </v-btn>
              </v-card-actions>
        </div>
        
        <!-- 채용공고별 면접 선택 시 (준비중) -->
        <div v-else-if="selectedInterviewType === '채용공고별'" :style="selectionContainerStyle">
          <v-btn icon @click="backToInterviewTypeSelection" :style="backButtonStyle">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          
          <div :style="titleContainerStyle">

            <h2 :style="enhancedTitleStyle">
              <span :style="titleHighlightStyle">채용공고별</span> 면접 준비
            </h2>
            <div :style="titleUnderlineStyle"></div>
            <p :style="titleDescriptionStyle">지원하려는 채용공고에 맞춰 맞춤형 면접을 준비해보세요</p>
          </div>
          
          <div :style="preparingContainerStyle">
            <v-icon size="64" color="#3b82f6" :style="preparingIconStyle">mdi-clock-outline</v-icon>
            <p :style="preparingTextStyle">채용공고별 면접 기능은 현재 개발 중입니다.</p>
            <p :style="preparingSubtextStyle">곧 만나보실 수 있습니다.</p>
            
            <v-btn
              color="#3b82f6"
              @click="backToInterviewTypeSelection"
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useHead } from '@vueuse/head'

// ✅ SEO 메타 정보
useHead({
  title: 'AI 모의 면접 선택 | 잡스푼(JobSpoon) Tech-Interview',
  meta: [
    {
      name: 'description',
      content: '당신의 이력에 맞춘 맞춤형 AI 면접을 시작하세요. 면접 유형과 세부 정보를 선택하여 맞춤형 면접을 경험하세요.',
    },
    {
      name: 'keywords',
      content: 'AI 면접, 모의 면접, AI 인터뷰, Tech-Interview, AI 취업 준비, AI 질문 추천, JobSpoon, job-spoon, 잡스푼, 개발자 플랫폼, 개발자 취업',
    },
    {
      property: 'og:title',
      content: 'AI 모의 면접 서비스 - 잡스푼(JobSpoon) Tech-Interview',
    },
    {
      property: 'og:description',
      content: '면접 유형과 세부 정보를 선택하면, AI가 맞춤형 면접을 제공합니다. 지금 시작해보세요!',
    },
    {
      property: 'og:image',
      content: '', // 실제 이미지 경로 입력
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
  ],
});

const router = useRouter();
const start = ref(false);
const showInterviewTypeSelection = ref(false);



// 1단계: 면접 유형 선택
const interviewTypes = [
  {
    type: "전형별",
    title: "전형별 면접",
    icon: "mdi-account-group",
    description: "채용 전형에 맞춤 면접 준비",
    status: "active"
  },
  {
    type: "채용공고별",
    title: "채용공고별 면접",
    icon: "mdi-file-document",
    description: "특정 채용공고에 맞춤 면접 준비",
    status: "preparing"
  },
  {
    type: "기업별",
    title: "기업별 면접",
    icon: "mdi-domain",
    description: "특정 기업에 맞춤 면접 준비",
    status: "active"
  }
];
const selectedInterviewType = ref("");

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

// 회사
const companies = ref(["당근마켓", "Toss", "SK-encore", "KT M mobile", "네이버", "카카오", "라인", "쿠팡"]);
const selectedCompany = ref("");

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
  return (
    selectedKeyword.value &&
    selectedAcademicBackground.value &&
    selectedCareer.value &&
    selectedProjectExperience.value &&
    selectedTechSkills.value.length > 0
  );
});

// 기업별 폼 유효성 검사
const isCompanyFormValid = computed(() => {
  return (
    selectedCompany.value &&
    selectedKeyword.value &&
    selectedAcademicBackground.value &&
    selectedCareer.value &&
    selectedProjectExperience.value &&
    selectedTechSkills.value.length > 0
  );
});

// 선택 핸들러
const selectInterviewType = (type) => {
  // 준비중인 옵션은 선택 불가
  const option = interviewTypes.find(opt => opt.type === type);
  if (option && option.status === 'preparing') {
    alert('해당 기능은 현재 준비 중입니다.');
    return;
  }
  
  selectedInterviewType.value = type;
  
  // 전형별 또는 기업별 선택 시 새로운 페이지로 이동
  if (type === '전형별' || type === '기업별' || type === '채용공고별') {
    router.push({
      name: 'ai-interview-detail',
      params: { type: type }
    });
  }
};

const selectInterviewSubType = (type) => {
  // 준비중인 옵션은 선택 불가
  const option = interviewSubTypes.find(opt => opt.type === type);
  if (option && option.status === 'preparing') {
    alert('해당 기능은 현재 준비 중입니다.');
    return;
  }
  
  selectedInterviewSubType.value = type;
};

// 이전 화면으로 돌아가는 함수
const backToInterviewTypeSelection = () => {
  showInterviewTypeSelection.value = false;
  selectedInterviewSubType.value = "";
  selectedCompany.value = "";
};

// TTS 및 기타 로직
// const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
// const handleBeforeUnload = () => {
//   if (synth && synth.speaking) synth.cancel();
//   localStorage.removeItem("interviewInfo");
// };
//
// onBeforeUnmount(() => {
//   if (synth && synth.speaking) synth.cancel();
//   window.removeEventListener("beforeunload", handleBeforeUnload);
// });
//
// const speakNotice = () => {
//   const message = `안녕하십니까? AI 모의 면접 서비스입니다. 면접 유형을 선택하고 상세 정보를 입력하여 맞춤형 면접을 시작하세요.`;
//   const utterance = new SpeechSynthesisUtterance(message);
//   utterance.lang = "ko-KR";
//   utterance.rate = 1;
//   utterance.pitch = 1;
//   window.speechSynthesis.cancel();
//   window.speechSynthesis.speak(utterance);
// };

onMounted(() => {
  // 로그인 체크 (필요시 주석 해제)
  /*
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    window.location.replace("/vue-account/account/login");
    return;
  }
  */
  
  // speakNotice();
  // window.addEventListener("beforeunload", handleBeforeUnload);
});

// 면접 시작 함수
const startInterview = () => {
  // 전형별 면접의 기술면접 선택 시
  if (selectedInterviewType.value === '전형별' && selectedInterviewSubType.value === '기술면접') {
    if (!isFormValid.value) {
      alert("모든 필수 항목을 선택해 주세요.");
      return;
    }
    
    const jobstorage = {
      interviewType: selectedInterviewType.value,
      interviewSubType: selectedInterviewSubType.value,
      company: "",
      academic: academicBackgroundMap[selectedAcademicBackground.value],
      exp: careerMap[selectedCareer.value],
      project: projectExperienceMap[selectedProjectExperience.value],
      tech: keywordMap[selectedKeyword.value],
      skills: selectedTechSkills.value.map((skill) => skillsMap[skill]),
    };
    
    // 선택 정보 확인 메시지
    let message = `
면접 유형: ${selectedInterviewType.value} - ${selectedInterviewSubType.value}
전공 여부: ${selectedAcademicBackground.value}
선택한 경력: ${selectedCareer.value}
프로젝트 경험: ${selectedProjectExperience.value}
선택한 직무: ${selectedKeyword.value}
기술 스택: ${selectedTechSkills.value.join(", ")}`;

    if (!confirm(message + "\n\n면접을 시작하시겠습니까?")) return;

    localStorage.setItem("interviewInfo", JSON.stringify(jobstorage));
    router.push("/ai-test");
  }
  // 기업별 면접 선택 시
  else if (selectedInterviewType.value === '기업별') {
    if (!isCompanyFormValid.value) {
      alert("모든 필수 항목을 선택해 주세요.");
      return;
    }
    
    const jobstorage = {
      interviewType: selectedInterviewType.value,
      interviewSubType: "기술면접", // 기업별 면접은 기본적으로 기술면접로 설정
      company: selectedCompany.value,
      academic: academicBackgroundMap[selectedAcademicBackground.value],
      exp: careerMap[selectedCareer.value],
      project: projectExperienceMap[selectedProjectExperience.value],
      tech: keywordMap[selectedKeyword.value],
      skills: selectedTechSkills.value.map((skill) => skillsMap[skill]),
    };
    
    // 선택 정보 확인 메시지
    let message = `
면접 유형: ${selectedInterviewType.value}
선택한 회사: ${selectedCompany.value}
전공 여부: ${selectedAcademicBackground.value}
선택한 경력: ${selectedCareer.value}
프로젝트 경험: ${selectedProjectExperience.value}
선택한 직무: ${selectedKeyword.value}
기술 스택: ${selectedTechSkills.value.join(", ")}`;

    if (!confirm(message + "\n\n면접을 시작하시겠습니까?")) return;

    localStorage.setItem("interviewInfo", JSON.stringify(jobstorage));
    router.push("/ai-test");
  }
};



// ---------- 스타일 변수 ---------- //
const containerStyle = { 
  marginBottom: '0',
  marginTop: '0', 
  maxWidth: '100%',
  width: '100%',
  background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 40%, #e0f2fe 100%)',
  minHeight: '100vh',
  padding: '80px 40px 120px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};
const cardStyle = { padding: "24px", borderRadius: "16px" };
const optionRowStyle = { gap: "16px", marginTop: "16px" };
const mb8Style = { marginBottom: "32px" };
const mt8Style = { marginTop: "32px" };
const mt16Style = { marginTop: "64px" };
const formContainerStyle = { 
  marginTop: '48px', 
  padding: '40px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%)',
  borderRadius: '24px',
  boxShadow: '0 10px 40px rgba(79, 156, 249, 0.15)',
  border: '2px solid rgba(79, 156, 249, 0.15)',
  backdropFilter: 'blur(10px)',
  maxWidth: '900px',
  margin: '48px auto 0'
};
const drawLineStyle = {
  border: '2px solid rgba(79, 156, 249, 0.2)',
  padding: '32px',
  borderRadius: '20px',
  width: '100%',
  marginTop: '40px',
  background: 'linear-gradient(135deg, rgba(79, 156, 249, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%)',
  boxShadow: '0 4px 16px rgba(79, 156, 249, 0.08)'
};
const liStyle = { marginLeft: "2%" };
const buttonStyle = {
  minWidth: "120px",
  padding: "14px 32px",
  margin: "0 8px",
  borderRadius: "50px",
  fontWeight: "700",
  background: 'linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)',
  color: 'white',
  boxShadow: '0 8px 24px rgba(79, 156, 249, 0.4)',
  transition: 'all 0.3s ease'
};

// JobSpoon AI 인터뷰 로고 스타일
const logoStyle = {
  fontSize: '1.4rem',
  fontWeight: '700',
  color: '#3b82f6',
  marginBottom: '1rem',
  letterSpacing: '0.02em',
  display: 'inline-block',
  position: 'relative',
  textAlign: 'center',
  width: '100%',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, #3b82f6 0%, rgba(59, 130, 246, 0.3) 100%)',
    borderRadius: '2px'
  }
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
  fontSize: '2.8rem',
  fontWeight: '800',
  color: '#333',
  marginBottom: '1rem',
  letterSpacing: '-0.02em',
  textAlign: 'center',
  width: '100%',
  position: 'relative',
  textShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  lineHeight: '1.2'
};

// 타이틀 하이라이트 스타일
const titleHighlightStyle = {
  background: 'linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  position: 'relative',
  display: 'inline-block'
};

// 타이틀 밑줄 스타일
const titleUnderlineStyle = {
  width: '80px',
  height: '4px',
  background: 'linear-gradient(90deg, #4F9CF9 0%, #10B981 100%)',
  borderRadius: '2px',
  marginBottom: '1.5rem'
};

// 타이틀 설명 스타일
const titleDescriptionStyle = {
  fontSize: '1.2rem',
  color: '#64748b',
  textAlign: 'center',
  maxWidth: '600px',
  lineHeight: '1.5',
  fontWeight: '400'
};

// 기존 타이틀 스타일 (호환성을 위해 유지)
const titleStyle = {
  fontSize: '2rem',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2rem',
  letterSpacing: '-0.01em',
  textAlign: 'center',
  width: '100%'
};

// 선택 화면 스타일
const selectionContainerStyle = {
  marginBottom: '0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto'
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
  borderRadius: '24px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 10px 40px rgba(79, 156, 249, 0.12)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  width: '320px',
  minHeight: '420px',
  display: 'flex',
  flexDirection: 'column',
  border: '2px solid rgba(79, 156, 249, 0.15)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px rgba(79, 156, 249, 0.25)',
    borderColor: 'rgba(79, 156, 249, 0.3)'
  }
};

// 선택된 면접 유형 아이템 스타일
const selectedInterviewTypeItemStyle = {
  background: 'linear-gradient(135deg, rgba(79, 156, 249, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
  borderColor: '#4F9CF9',
  borderWidth: '3px',
  boxShadow: '0 20px 60px rgba(79, 156, 249, 0.35)',
  transform: 'translateY(-12px) scale(1.03)'
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
  height: '120px',
  background: 'linear-gradient(135deg, rgba(79, 156, 249, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
  borderBottom: '2px solid rgba(79, 156, 249, 0.1)',
  transition: 'all 0.3s ease'
};

// 면접 유형 콘텐츠 스타일
const interviewTypeContentStyle = {
  flex: '1',
  padding: '32px 24px',
  position: 'relative',
  zIndex: '2',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '12px'
};

// 면접 유형 제목 스타일
const interviewTypeTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '800',
  marginBottom: '8px',
  color: '#1e293b',
  textAlign: 'center',
  letterSpacing: '-0.02em',
  transition: 'color 0.3s ease'
};

// 선택된 면접 유형 제목 스타일
const selectedInterviewTypeTitleStyle = {
  color: '#1e40af'
};

// 면접 유형 설명 스타일
const interviewTypeDescriptionStyle = {
  fontSize: '1rem',
  color: '#64748b',
  textAlign: 'center',
  lineHeight: '1.6',
  fontWeight: '500'
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
  maxWidth: '1000px',
  margin: '0 auto 48px',
  padding: '0 20px'
};

// 회사 선택 칩 컨테이너 스타일
const companyChipContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '16px',
  padding: '20px'
};

// 회사 선택 칩 스타일
const companyChipStyle = {
  fontSize: '1rem',
  padding: '14px 28px',
  borderRadius: '50px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#475569',
  border: '2px solid rgba(79, 156, 249, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 12px rgba(79, 156, 249, 0.1)',
  fontWeight: '600',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(79, 156, 249, 0.2)',
    borderColor: 'rgba(79, 156, 249, 0.4)'
  }
};

// 선택된 회사 칩 스타일
const companyChipSelectedStyle = {
  background: 'linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)',
  color: 'white',
  borderColor: '#4F9CF9',
  boxShadow: '0 8px 24px rgba(79, 156, 249, 0.4)',
  transform: 'translateY(-3px) scale(1.05)'
};

// 준비중 화면 컨테이너 스타일
const preparingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%)',
  borderRadius: '24px',
  boxShadow: '0 10px 40px rgba(79, 156, 249, 0.15)',
  border: '2px solid rgba(79, 156, 249, 0.15)',
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
  top: '50px',       // 상단 여백
  left: '150px',      // 좌측 여백
  zIndex: 10,
};

// 선택 화면으로 돌아가기 버튼 스타일
const backToSelectionBtnStyle = {
  padding: '14px 32px',
  fontWeight: '700',
  borderRadius: '50px',
  color: 'white',
  textTransform: 'none',
  letterSpacing: '0.02em',
  background: 'linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)',
  boxShadow: '0 8px 24px rgba(79, 156, 249, 0.4)'
};
const selectedCardStyle = {
  backgroundColor: "#3b82f6",
  color: "white",
  transition: "all 0.3s ease",
  cursor: "pointer",
  height: "100%",
  borderRadius: "12px",
};
const unselectedCardStyle = {
  backgroundColor: "white",
  color: "inherit",
  transition: "all 0.3s ease",
  cursor: "pointer",
  height: "100%",
  borderRadius: "12px",
};
const selectedChipStyle = {
  background: 'linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)',
  color: 'white',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 6px 20px rgba(79, 156, 249, 0.4)',
  transform: 'scale(1.08)',
  fontWeight: '700',
  border: '2px solid transparent'
};
const unselectedChipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#64748b',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid rgba(79, 156, 249, 0.15)',
  boxShadow: '0 2px 8px rgba(79, 156, 249, 0.08)',
  fontWeight: '600',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(79, 156, 249, 0.15)',
    borderColor: 'rgba(79, 156, 249, 0.3)'
  }
};
// --------------------------------- //



</script>
