<template>
  <main :style="mainContainerStyle">
    <v-container :style="reportContainerStyle">
      <!-- 헤더 섹션 -->
      <div :style="headerSectionStyle">
        <div :style="headerBadgeStyle">
          <v-icon size="20" color="white">mdi-check-circle</v-icon>
          <span :style="badgeTextStyle">면접 완료</span>
        </div>
        <h1 :style="reportTitleStyle">AI 면접 결과</h1>
        <h1 :style="reportTitleStyle2">분석 리포트</h1>
<!--        <p :style="reportSubtitleStyle">당신의 면접 역량을 AI가 분석했습니다</p>-->
      </div>

      <!-- 종합 평가 카드 -->
      <v-card :style="summaryCardStyle" elevation="0">
        <v-row align="center" justify="center" no-gutters>
          <!-- 등급 섹션 -->
          <v-col cols="12" md="4" :style="gradeColStyle">
            <div :style="gradeWrapperStyle">
              <p :style="gradeLabelStyle">종합 등급</p>
              <div :style="gradeBadgeStyle">{{ grade }}</div>
              <div :style="gradeDescStyle">
                {{ getGradeDescription(grade) }}
              </div>
            </div>
          </v-col>

          <!-- 구분선 -->
          <v-divider vertical :style="verticalDividerStyle" class="d-none d-md-block" />

          <!-- 차트 섹션 -->
          <v-col cols="12" md="7" :style="chartColStyle">
            <HexagonChart :scoreList="scoreList" />
            <div :style="scoreLegendsStyle">
              <div v-for="(score, idx) in scoreList" :key="idx" :style="legendItemStyle">
                <div :style="legendDotStyle"></div>
                <span :style="legendTextStyle">{{ score.type }}: {{ score.score }}점</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 총평 섹션 -->
      <v-card v-if="overallComment" :style="overallCommentCardStyle" elevation="0">
        <!-- 헤더 -->
        <div :style="commentMainHeaderStyle">
          <div :style="commentHeaderContentStyle">
            <div :style="commentIconWrapperStyle">
              <v-icon size="36" color="white">mdi-star-circle</v-icon>
            </div>
            <div>
              <h3 :style="commentTitleStyle">AI 종합 총평</h3>
              <p :style="commentSubtitleStyle">면접 전반에 대한 종합적인 분석 결과입니다</p>
            </div>
          </div>
          <!-- 장식 요소 -->
          <div :style="headerDecoStyle"></div>
        </div>

        <!-- 콘텐츠 -->
        <div :style="commentContentWrapperStyle">
          <div 
            v-for="(section, index) in parsedComment" 
            :key="index" 
            :style="getCommentSectionStyle(index)"
            class="comment-section"
          >
            <div :style="sectionHeaderWrapperStyle">
              <div :style="getSectionIconWrapperStyle(section.title)">
                <v-icon size="22" color="white">{{ getSectionIcon(section.title) }}</v-icon>
              </div>
              <h4 :style="sectionTitleTextStyle">{{ section.title }}</h4>
              <div :style="sectionBadgeStyle(section.title)">
                {{ getSectionBadgeText(section.title) }}
              </div>
            </div>
            <div :style="sectionContentWrapperStyle">
              <p :style="sectionContentStyle">{{ section.content }}</p>
            </div>
          </div>
        </div>
      </v-card>

      <!-- 질문별 상세 분석 -->
      <div :style="detailSectionHeaderStyle">
        <v-icon size="28" color="#1e293b">mdi-clipboard-text</v-icon>
        <h2 :style="detailTitleStyle">질문별 상세 분석</h2>
      </div>

      <v-card
        v-for="(item, index) in inputList"
        :key="index"
        :style="questionCardStyle"
        elevation="0"
      >
        <!-- 질문 헤더 -->
        <div :style="questionHeaderStyle">
          <div :style="questionNumberStyle">Q{{ index + 1 }}</div>
          <h3 :style="questionTextStyle">{{ item.question }}</h3>
        </div>

        <!-- 답변 섹션 -->
        <div :style="answerSectionStyle">
          <div :style="sectionHeaderStyle">
            <v-icon size="20" color="#10b981">mdi-account-voice</v-icon>
            <h4 :style="sectionTitleStyle">당신의 답변</h4>
          </div>
          <p :style="answerTextStyle">{{ item.answer }}</p>
        </div>

        <!-- 피드백 섹션 -->
        <div :style="feedbackSectionStyle">
          <div :style="sectionHeaderStyle">
            <v-icon size="20" color="#3b82f6">mdi-lightbulb-on</v-icon>
            <h4 :style="sectionTitleStyle">AI 피드백</h4>
          </div>
          <p :style="feedbackTextStyle">{{ item.feedback }}</p>
        </div>

        <!-- 개선 제안 (있을 경우) -->
        <div v-if="item.correction" :style="correctionSectionStyle">
          <div :style="sectionHeaderStyle">
            <v-icon size="20" color="#f59e0b">mdi-pencil</v-icon>
            <h4 :style="sectionTitleStyle">개선 제안</h4>
          </div>
          <p :style="correctionTextStyle">{{ item.correction }}</p>
        </div>
      </v-card>

      <!-- 액션 버튼 -->
      <div :style="actionButtonsStyle" class="no-print">
        <v-btn
          v-if="downloadUrl"
          :style="downloadButtonStyle"
          elevation="0"
          size="large"
          @click="downloadRecording"
        >
          <v-icon left>mdi-download</v-icon>
          녹화 영상 다운로드
        </v-btn>
        <v-btn
          :style="printButtonStyle"
          elevation="0"
          size="large"
          @click="handlePrint"
        >
          <v-icon left>mdi-printer</v-icon>
          PDF로 저장
        </v-btn>
        <v-btn
          :style="homeButtonStyle"
          elevation="0"
          size="large"
          @click="goToHome"
        >
          <v-icon left>mdi-home</v-icon>
          홈으로
        </v-btn>
      </div>
    </v-container>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {useRoute, useRouter} from "vue-router";
import { useAiInterviewStore } from "../../stores/aiInterviewStore";
import HexagonChart from "../result/HexagonChart.vue";
import { useHead } from '@vueuse/head'
import Swal from 'sweetalert2';

const route = useRoute();

const interviewId = ref(route.params.interviewId || '');


// ✅ SEO 메타 정보
useHead({
  title: "AI 면접 결과 보기 | 잡스틱(JobStick)",
  meta: [
    { name: "description", content: "AI 기반 모의 면접 결과를 확인하고, 나의 강점과 개선점을 분석해보세요." },
    { name: "keywords", content: "AI 면접, 면접 결과, 자기 분석, 모의 면접, AI 분석, JotStick, job-stick, 잡스틱, 개발자 취업, 개발자 플랫폼" },
    { property: "og:title", content: "AI 면접 결과 - 잡스틱(JobStick)" },
    { property: "og:description", content: "AI가 분석한 나의 면접 결과를 지금 확인해보세요." },
    { property: "og:image", content: "" },
    { name: "robots", content: "index, follow" },
  ],
});

// =============================
// 👇 [스타일 객체/상수 정의 영역] 👇
// =============================
const mainContainerStyle = {
  minHeight: "100vh",
  background: "#ffffff",
  padding: "80px 20px 60px",
};

const reportContainerStyle = {
  maxWidth: "1200px",
  margin: "auto",
};

// 헤더 스타일
const headerSectionStyle = {
  textAlign: "center",
  marginBottom: "64px",
  animation: "fadeInDown 0.8s ease-out",
};

const headerBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 24px",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  borderRadius: "50px",
  marginBottom: "24px",
  boxShadow: "0 4px 16px rgba(79, 156, 249, 0.25)",
};

const badgeTextStyle = {
  color: "white",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.5px",
};

const reportTitleStyle = {
  fontSize: "48px",
  fontWeight: "900",
  color: "#1a1a1a",
  marginBottom: "16px",
  letterSpacing: "-2px",
  lineHeight: "1.2",
};

const reportTitleStyle2 = {
  fontSize: "30px",
  fontWeight: "900",
  color: "#1a1a1a",
  marginBottom: "16px",
  letterSpacing: "-2px",
  lineHeight: "1.2",
};

const reportSubtitleStyle = {
  fontSize: "18px",
  color: "#666666",
  fontWeight: "400",
  letterSpacing: "-0.5px",
};

// 종합 평가 카드
const summaryCardStyle = {
  background: "white",
  borderRadius: "20px",
  padding: "48px 40px",
  marginBottom: "40px",
  boxShadow: "0 2px 20px rgba(0, 0, 0, 0.06)",
  border: "1px solid #f0f0f0",
  animation: "fadeInUp 0.8s ease-out 0.2s both",
};

const gradeColStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const gradeWrapperStyle = {
  textAlign: "center",
};

const gradeLabelStyle = {
  fontSize: "14px",
  color: "#999999",
  marginBottom: "20px",
  fontWeight: "600",
  letterSpacing: "1px",
  textTransform: "uppercase",
};

const gradeBadgeStyle = {
  width: "140px",
  height: "140px",
  margin: "0 auto 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "64px",
  fontWeight: "900",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  color: "white",
  borderRadius: "50%",
  boxShadow: "0 8px 32px rgba(79, 156, 249, 0.3)",
  animation: "pulse 2s ease-in-out infinite",
};

const gradeDescStyle = {
  fontSize: "15px",
  color: "#666666",
  fontWeight: "500",
};

const verticalDividerStyle = {
  height: "200px",
  width: "1px",
  background: "#e5e5e5",
  margin: "0 40px",
};

const chartColStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
};

const scoreLegendsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
  marginTop: "24px",
  width: "100%",
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const legendDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
};

const legendTextStyle = {
  fontSize: "13px",
  color: "#666666",
  fontWeight: "500",
};

// 총평 카드
const overallCommentCardStyle = {
  background: "white",
  borderRadius: "24px",
  padding: "0",
  marginBottom: "56px",
  boxShadow: "0 4px 32px rgba(0, 0, 0, 0.08)",
  border: "1px solid #f0f0f0",
  overflow: "hidden",
  animation: "fadeInUp 0.8s ease-out 0.3s both",
  position: "relative",
};

const commentMainHeaderStyle = {
  position: "relative",
  padding: "48px 48px 56px",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  overflow: "hidden",
};

const commentHeaderContentStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  position: "relative",
  zIndex: 2,
};

const headerDecoStyle = {
  position: "absolute",
  right: "-40px",
  top: "-40px",
  width: "200px",
  height: "200px",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "50%",
  zIndex: 1,
};

const commentIconWrapperStyle = {
  width: "72px",
  height: "72px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
};

const commentTitleStyle = {
  fontSize: "32px",
  fontWeight: "900",
  color: "white",
  margin: 0,
  marginBottom: "8px",
  letterSpacing: "-1.5px",
};

const commentSubtitleStyle = {
  fontSize: "15px",
  color: "rgba(255, 255, 255, 0.95)",
  margin: 0,
  fontWeight: "500",
  letterSpacing: "-0.3px",
};

const commentContentWrapperStyle = {
  padding: "48px",
  background: "white",
};

const sectionHeaderWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "20px",
};

const sectionTitleTextStyle = {
  fontSize: "20px",
  fontWeight: "900",
  color: "#1a1a1a",
  margin: 0,
  letterSpacing: "-0.8px",
  flex: 1,
};

const sectionContentWrapperStyle = {
  paddingLeft: "68px",
};

const sectionContentStyle = {
  fontSize: "15px",
  lineHeight: "1.9",
  color: "#333333",
  margin: 0,
  whiteSpace: "pre-line",
};

// 상세 분석 헤더
const detailSectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "32px",
  animation: "fadeInUp 0.8s ease-out 0.4s both",
};

const detailTitleStyle = {
  fontSize: "32px",
  fontWeight: "900",
  color: "#1a1a1a",
  margin: 0,
  letterSpacing: "-1.5px",
};

// 질문 카드
const questionCardStyle = {
  background: "white",
  borderRadius: "20px",
  padding: "36px",
  marginBottom: "24px",
  boxShadow: "0 2px 20px rgba(0, 0, 0, 0.06)",
  border: "1px solid #f0f0f0",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  animation: "fadeInUp 0.6s ease-out both",
  cursor: "default",
};

const questionHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "28px",
  paddingBottom: "24px",
  borderBottom: "1px solid #f0f0f0",
};

const questionNumberStyle = {
  minWidth: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  color: "white",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "800",
  boxShadow: "0 4px 16px rgba(79, 156, 249, 0.25)",
};

const questionTextStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1a1a1a",
  lineHeight: "1.6",
  margin: 0,
  flex: 1,
  letterSpacing: "-0.5px",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
};

const sectionTitleStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: 0,
};

const answerSectionStyle = {
  padding: "24px",
  background: "#f7fcf9",
  borderRadius: "14px",
  marginBottom: "16px",
  border: "1px solid #e6f7ed",
};

const answerTextStyle = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#333333",
  whiteSpace: "pre-line",
  margin: 0,
};

const feedbackSectionStyle = {
  padding: "24px",
  background: "#f7f9fc",
  borderRadius: "14px",
  marginBottom: "16px",
  border: "1px solid #e6eef7",
};

const feedbackTextStyle = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#333333",
  whiteSpace: "pre-line",
  margin: 0,
};

const correctionSectionStyle = {
  padding: "24px",
  background: "#fffcf7",
  borderRadius: "14px",
  border: "1px solid #fff4e6",
};

const correctionTextStyle = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#333333",
  whiteSpace: "pre-line",
  margin: 0,
};

// 액션 버튼
const actionButtonsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginTop: "64px",
  flexWrap: "wrap",
  animation: "fadeInUp 0.8s ease-out 0.6s both",
};

const downloadButtonStyle = {
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  color: "white",
  padding: "16px 36px",
  borderRadius: "50px",
  fontWeight: "700",
  fontSize: "15px",
  textTransform: "none",
  boxShadow: "0 4px 16px rgba(79, 156, 249, 0.25)",
  transition: "all 0.3s ease",
  letterSpacing: "-0.3px",
};

const printButtonStyle = {
  background: "linear-gradient(135deg, #4F9CF9 0%, #10B981 100%)",
  color: "white",
  padding: "16px 36px",
  borderRadius: "50px",
  fontWeight: "700",
  fontSize: "15px",
  textTransform: "none",
  boxShadow: "0 4px 16px rgba(79, 156, 249, 0.25)",
  transition: "all 0.3s ease",
  letterSpacing: "-0.3px",
};

const homeButtonStyle = {
  background: "white",
  color: "#666666",
  padding: "16px 36px",
  borderRadius: "50px",
  fontWeight: "700",
  fontSize: "15px",
  textTransform: "none",
  border: "1px solid #e5e5e5",
  transition: "all 0.3s ease",
  letterSpacing: "-0.3px",
};

// =============================
// 👆 [스타일 객체/상수 정의 끝] 👆
// =============================

// 🟠 [미디어쿼리/프린트/숨김 등 특수 스타일 동적 삽입]
const STYLE_TAG_ID = "ai-report-inline-style";
function injectDynamicStyle() {
  if (document.getElementById(STYLE_TAG_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_TAG_ID;
  style.textContent = `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    @media (min-width: 960px) {
      .d-md-block { display: block !important; }
    }
    
    @media (max-width: 768px) {
      .report-title { font-size: 32px !important; }
      .grade-badge { width: 80px !important; height: 80px !important; font-size: 40px !important; }
      .score-legends { grid-template-columns: repeat(2, 1fr) !important; }
    }
    
    .comment-section {
      position: relative;
    }
    
    .comment-section::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 0;
      background: linear-gradient(135deg, #4F9CF9 0%, #10B981 100%);
      border-radius: 0 4px 4px 0;
      transition: height 0.3s ease;
    }
    
    .comment-section:hover {
      transform: translateX(4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }
    
    .comment-section:hover::before {
      height: 100%;
    }
    
    @media print {
      .no-print { display: none !important; }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        margin: 0 !important;
        background: white !important;
      }
      main {
        background: white !important;
        padding: 20px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function removeDynamicStyle() {
  const style = document.getElementById(STYLE_TAG_ID);
  if (style) style.remove();
}

// =============================
// [컴포넌트 논리 영역]
// =============================
const aiInterviewStore = useAiInterviewStore();
const router = useRouter();
const inputList = ref([]);
const overallComment = ref("");
const parsedComment = ref([]);
const downloadUrl = ref(null);
const grade = ref("");
const scoreList = ref([]);
const calculateGrade = (scores) => {
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  if (total >= 54) return "A";
  if (total >= 45) return "B";
  if (total >= 30) return "C";
  if (total >= 15) return "D";
  return "F";
};
const userToken = ref("");


onMounted(async () => {
  injectDynamicStyle();
  userToken.value = localStorage.getItem("userToken");
  
  // interviewId 가져오기 (면접 종료 시 저장된 값 또는 URL 파라미터)
  // const savedInterviewId = localStorage.getItem("currentInterviewId");
  // if (savedInterviewId) {
  //   interviewId.value = Number(savedInterviewId);
  // }
  //
  // if (interviewId.value) {
  //   await getScoreResultList(interviewId.value);
  // } else {
  //   console.error("❌ interviewId를 찾을 수 없습니다.");
  //   alert("면접 결과를 불러올 수 없습니다. 면접 ID가 없습니다.");
  // }
  //
  if (interviewId.value === ''){
    alert("인터뷰가 비어 있음");
  }
  console.log(interviewId.value);
  getScoreResultList(interviewId.value);

  const saveUrl = localStorage.getItem("interviewRecordingUrl");
  if (saveUrl) downloadUrl.value = saveUrl;
});

onBeforeUnmount(() => {
  removeDynamicStyle();
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
  }
  localStorage.removeItem("interviewRecordingUrl");
});

const getScoreResultList = async (interviewId) => {
  try {
    console.log("=== 면접 결과 조회 ===");
    console.log("interviewId:", interviewId);
    
    const res = await aiInterviewStore.requestGetInterviewResultToSpring(interviewId);
    console.log(res);
    if (res.status === 401) {
      Swal.fire({
        title: '권한이 없습니다',
        text: '접근 권한이 없습니다.',
        icon: 'warning',
        iconColor: '#2563EB',
        background: '#F9FAFB',
        color: '#111827',

        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster'
        },

        backdrop: `rgba(0,0,0,0.6)`,

        showCancelButton: false,
        confirmButtonText: '확인',

        buttonsStyling: false,
        customClass: {
          popup: 'rounded-xl shadow-2xl p-6',
          confirmButton: 'custom-confirm-btn'
        },
        didOpen: () => {
          const btn = document.querySelector('.custom-confirm-btn');
          Object.assign(btn.style, {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px 36px',
            fontSize: '16px',
            fontWeight: '700',
            color: '#fff',
            background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '200px',
          });

          btn.onmouseover = () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 15px 30px rgba(0,0,0,0.25)';
          };
          btn.onmouseout = () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
          };
          btn.onmousedown = () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
          };
          btn.onmouseup = () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 15px 30px rgba(0,0,0,0.25)';
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/";
        }
      });


    }
    inputList.value = res.interviewResultList;
    const hexagon = res.hexagonScore || {};
    overallComment.value = res.overallComment;
    
    // 총평 파싱
    parsedComment.value = parseOverallComment(res.overallComment);
    
    scoreList.value = [
      { type: "생산성", score: hexagon.productivity || 0 },
      { type: "의사소통", score: hexagon.communication || 0 },
      { type: "개발역량", score: hexagon.technical_skills || 0 },
      { type: "문서작성", score: hexagon.documentation_skills || 0 },
      { type: "유연성", score: hexagon.flexibility || 0 },
      { type: "의사결정력", score: hexagon.problem_solving || 0 },
    ];
    grade.value = calculateGrade(scoreList.value);
  } catch (err) {
    console.error("❌ 면접 결과 불러오기 실패:", err);
  }
};
const handlePrint = () => {
  window.print();
};

const downloadRecording = () => {
  if (downloadUrl.value) {
    const link = document.createElement('a');
    link.href = downloadUrl.value;
    link.download = 'interview-recording.webm';
    link.click();
  }
};

const goToHome = () => {
  router.push('/ai-interview/select');
};

const getGradeDescription = (grade) => {
  const descriptions = {
    'A': '탁월한 면접 역량',
    'B': '우수한 면접 역량',
    'C': '양호한 면접 역량',
    'D': '개선이 필요한 면접 역량',
    'F': '많은 연습이 필요합니다'
  };
  return descriptions[grade] || '평가 중';
};

// 총평 텍스트 파싱 함수
const parseOverallComment = (comment) => {
  if (!comment) return [];
  
  const sections = [];
  const lines = comment.split('\n').filter(line => line.trim());
  
  let currentSection = null;
  
  lines.forEach(line => {
    // **로 감싸진 제목 찾기
    const titleMatch = line.match(/\*\*(.+?)\*\*/);
    
    if (titleMatch) {
      // 이전 섹션이 있으면 저장
      if (currentSection) {
        sections.push(currentSection);
      }
      // 새 섹션 시작
      currentSection = {
        title: titleMatch[1].trim(),
        content: line.replace(/\*\*(.+?)\*\*/, '').trim()
      };
    } else if (currentSection) {
      // 현재 섹션의 내용 추가
      currentSection.content += (currentSection.content ? '\n' : '') + line.trim();
    }
  });
  
  // 마지막 섹션 추가
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // 섹션이 없으면 전체를 하나의 섹션으로
  if (sections.length === 0) {
    sections.push({
      title: '종합 평가',
      content: comment
    });
  }
  
  return sections;
};

// 섹션별 아이콘 매핑
const getSectionIcon = (title) => {
  const iconMap = {
    '전반적인 인상': 'mdi-account-star',
    '강점': 'mdi-thumb-up',
    '개선점': 'mdi-chart-line',
    '추천사항': 'mdi-lightbulb',
    '종합 평가': 'mdi-clipboard-check',
    '의사소통': 'mdi-message-text',
    '기술 역량': 'mdi-code-tags',
    '태도': 'mdi-heart',
    '전문성': 'mdi-briefcase'
  };
  
  // 부분 매칭
  for (const [key, icon] of Object.entries(iconMap)) {
    if (title.includes(key)) {
      return icon;
    }
  }
  
  return 'mdi-information';
};

// 섹션별 색상 매핑
const getSectionColor = (title) => {
  const colorMap = {
    '전반적인 인상': '#3b82f6',
    '강점': '#10b981',
    '개선점': '#f59e0b',
    '추천사항': '#8b5cf6',
    '종합 평가': '#3b82f6',
    '의사소통': '#06b6d4',
    '기술 역량': '#6366f1',
    '태도': '#ec4899',
    '전문성': '#14b8a6'
  };
  
  // 부분 매칭
  for (const [key, color] of Object.entries(colorMap)) {
    if (title.includes(key)) {
      return color;
    }
  }
  
  return '#64748b';
};

// 섹션 스타일 (인덱스별 애니메이션 딜레이)
const getCommentSectionStyle = (index) => {
  return {
    marginBottom: "24px",
    padding: "32px",
    background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
    borderRadius: "20px",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    animation: `fadeInUp 0.6s ease-out ${0.5 + index * 0.1}s both`,
  };
};

// 섹션 아이콘 래퍼 스타일 (색상별)
const getSectionIconWrapperStyle = (title) => {
  const color = getSectionColor(title);
  return {
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: color,
    borderRadius: "16px",
    boxShadow: `0 4px 16px ${color}40`,
  };
};

// 섹션 배지 스타일
const sectionBadgeStyle = (title) => {
  const colorMap = {
    '전반적인 인상': '#3b82f6',
    '강점': '#10b981',
    '개선점': '#f59e0b',
    '추천사항': '#8b5cf6',
  };
  
  let bgColor = '#e5e5e5';
  let textColor = '#666666';
  
  for (const [key, color] of Object.entries(colorMap)) {
    if (title.includes(key)) {
      bgColor = `${color}15`;
      textColor = color;
      break;
    }
  }
  
  return {
    padding: "6px 14px",
    borderRadius: "50px",
    background: bgColor,
    color: textColor,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  };
};

// 섹션 배지 텍스트
const getSectionBadgeText = (title) => {
  if (title.includes('강점')) return '👍 STRENGTH';
  if (title.includes('개선점')) return '📈 IMPROVE';
  if (title.includes('추천')) return '💡 TIP';
  if (title.includes('전반적')) return '⭐ OVERVIEW';
  return '✓';
};
</script>

