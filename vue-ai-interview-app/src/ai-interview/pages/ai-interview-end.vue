<template>
  <v-container :style="containerStyle" fluid>
    <!-- 배경 장식 -->
    <div :style="backgroundCircleStyle1"></div>
    <div :style="backgroundCircleStyle2"></div>
    
    <div :style="contentWrapperStyle">
      <!-- 성공 아이콘 애니메이션 -->
      <div :style="iconContainerStyle">
        <div :style="successCircleStyle">
          <v-icon size="80" color="white">mdi-check</v-icon>
        </div>
      </div>
      
      <!-- 메인 메시지 -->
      <h1 :style="titleStyle">면접이 완료되었습니다!</h1>
      <p :style="subtitleStyle">
        수고하셨습니다. 면접 결과를 분석 중입니다.
      </p>
      
      <!-- 카드 -->
      <v-card :style="cardStyle" elevation="0">
        <v-card-text :style="cardTextStyle">
          <!-- 이메일 입력 섹션 -->
          <div :style="emailSectionStyle">
            <div :style="emailHeaderStyle">
              <v-icon size="24" color="#3b82f6">mdi-email-outline</v-icon>
              <h3 :style="emailTitleStyle">결과 받을 이메일 주소</h3>
            </div>
            
            <p :style="emailDescStyle">
              면접 결과가 분석되면 입력하신 이메일로 상세한 피드백을 보내드립니다.
            </p>
            
            <v-text-field
              v-model="email"
              :style="emailInputStyle"
              placeholder="example@email.com"
              type="email"
              outlined
              dense
              :rules="[emailRule]"
              :error-messages="emailError"
              @input="emailError = ''"
            >
              <template v-slot:prepend-inner>
                <v-icon color="#64748b">mdi-email</v-icon>
              </template>
            </v-text-field>
          </div>
          
          <!-- 안내 메시지 -->
          <div :style="infoBoxStyle">
            <v-icon size="20" color="#f59e0b">mdi-information</v-icon>
            <div :style="infoTextContainerStyle">
              <p :style="infoTextStyle">
                <strong>분석 소요 시간:</strong> 약 5-10분<br>
                <strong>결과 내용:</strong> 답변 평가, 개선 포인트, 종합 점수
              </p>
            </div>
          </div>
          
          <!-- 버튼 -->
          <div :style="buttonGroupStyle">
            <v-btn
              color="primary"
              :style="submitBtnStyle"
              elevation="0"
              rounded
              large
              @click="submitEmail"
              :loading="isSubmitting"
              :disabled="!email || isSubmitting"
            >
              <v-icon left size="20">mdi-send</v-icon>
              결과 받기
            </v-btn>
            
            <v-btn
              :style="secondaryBtnStyle"
              elevation="0"
              rounded
              @click="goToHome"
            >
              <v-icon left size="18">mdi-home</v-icon>
              홈으로 돌아가기
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
      
      <!-- 추가 정보 -->
      <div :style="footerTextStyle">
        <v-icon size="16" color="#94a3b8">mdi-shield-check</v-icon>
        <span>이메일 주소는 결과 전송 목적으로만 사용됩니다</span>
      </div>
    </div>
    
    <!-- 성공 다이얼로그 -->
    <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
      <v-card :style="dialogCardStyle">
        <v-card-text :style="dialogTextStyle">
          <div :style="dialogIconStyle">
            <v-icon size="60" color="#10b981">mdi-check-circle</v-icon>
          </div>
          <h2 :style="dialogTitleStyle">이용해주셔서 감사합니다!</h2>
          <p :style="dialogMessageStyle">
            면접 결과를 빠르게 분석하여<br>
            <strong>{{ email }}</strong><br>
            으로 안내드리겠습니다.
          </p>
          <div :style="dialogSubMessageStyle">
            <v-icon size="18" color="#64748b">mdi-clock-outline</v-icon>
            <span>예상 소요 시간: 5-10분</span>
          </div>
          <v-btn
            color="primary"
            :style="dialogBtnStyle"
            elevation="0"
            rounded
            large
            @click="goToHome"
          >
            확인
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAiInterviewStore } from "../stores/aiInterviewStore";

const router = useRouter();
const aiInterviewStore = useAiInterviewStore();

const email = ref("");
const emailError = ref("");
const isSubmitting = ref(false);
const showSuccessDialog = ref(false);

// 라우터에서 전달받은 데이터
const interviewId = ref(null);
const interviewQAId = ref(null);
const lastAnswer = ref("");

onMounted(() => {
  // localStorage에서 면접 데이터 가져오기
  const interviewData = JSON.parse(localStorage.getItem("interviewEndData") || "{}");
  interviewId.value = interviewData.interviewId;
  interviewQAId.value = interviewData.interviewQAId;
  lastAnswer.value = interviewData.lastAnswer || "";
  
  console.log("=== 면접 종료 페이지 데이터 ===");
  console.log("interviewId:", interviewId.value);
  console.log("interviewQAId:", interviewQAId.value);
  console.log("lastAnswer:", lastAnswer.value);
  
  // 사용자 정보에서 이메일 가져오기 (있다면)
  // const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  // if (userInfo.email) {
  //   email.value = userInfo.email;
  // }
});

// 이메일 유효성 검사
const emailRule = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) || "올바른 이메일 주소를 입력해주세요";
};

// 이메일 제출
const submitEmail = async () => {
  if (!email.value) {
    emailError.value = "이메일을 입력해주세요";
    return;
  }
  
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email.value)) {
    emailError.value = "올바른 이메일 주소를 입력해주세요";
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // 면접 종료 API 호출
    await aiInterviewStore.requestEndInterviewToSpring({
      interviewId: interviewId.value,
      interviewQAId: interviewQAId.value,
      answer: lastAnswer.value,
      sender: email.value
    });
    
    // localStorage 정리
    localStorage.removeItem("interviewEndData");
    localStorage.removeItem("interviewInfo");
    
    // 성공 다이얼로그 표시
    showSuccessDialog.value = true;
  } catch (error) {
    console.error("면접 종료 요청 실패:", error);
    alert("결과 전송에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSubmitting.value = false;
  }
};

// 홈으로 이동
const goToHome = () => {
  window.location.href = "/";
};

// ===== 스타일 =====
const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  position: "relative",
  overflow: "hidden"
};

const backgroundCircleStyle1 = {
  position: "absolute",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
  top: "-200px",
  right: "-200px",
  filter: "blur(80px)",
  pointerEvents: "none"
};

const backgroundCircleStyle2 = {
  position: "absolute",
  width: "400px",
  height: "400px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))",
  bottom: "-150px",
  left: "-150px",
  filter: "blur(80px)",
  pointerEvents: "none"
};

const contentWrapperStyle = {
  maxWidth: "600px",
  width: "100%",
  textAlign: "center",
  position: "relative",
  zIndex: 1,
  animation: "fadeInUp 0.8s ease-out"
};

const iconContainerStyle = {
  marginBottom: "32px",
  display: "flex",
  justifyContent: "center"
};

const successCircleStyle = {
  width: "140px",
  height: "140px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 20px 60px rgba(16, 185, 129, 0.4)",
  animation: "scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
};

const titleStyle = {
  fontSize: "clamp(28px, 5vw, 42px)",
  fontWeight: "900",
  color: "#1e293b",
  marginBottom: "16px",
  letterSpacing: "-0.02em"
};

const subtitleStyle = {
  fontSize: "clamp(16px, 2vw, 18px)",
  color: "#64748b",
  marginBottom: "40px",
  fontWeight: "500",
  lineHeight: "1.6"
};

const cardStyle = {
  borderRadius: "24px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  border: "2px solid rgba(59, 130, 246, 0.1)",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
  overflow: "visible"
};

const cardTextStyle = {
  padding: "40px"
};

const emailSectionStyle = {
  marginBottom: "32px",
  textAlign: "left"
};

const emailHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px"
};

const emailTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1e293b",
  margin: "0"
};

const emailDescStyle = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "20px",
  lineHeight: "1.6"
};

const emailInputStyle = {
  fontSize: "16px"
};

const infoBoxStyle = {
  display: "flex",
  gap: "12px",
  padding: "16px",
  background: "rgba(245, 158, 11, 0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(245, 158, 11, 0.2)",
  marginBottom: "32px",
  textAlign: "left"
};

const infoTextContainerStyle = {
  flex: 1
};

const infoTextStyle = {
  fontSize: "13px",
  color: "#78350f",
  margin: "0",
  lineHeight: "1.8"
};

const buttonGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const submitBtnStyle = {
  textTransform: "none",
  fontSize: "16px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.35)",
  padding: "14px 48px",
  borderRadius: "50px",
  height: "auto",
  color: "white"
};

const secondaryBtnStyle = {
  textTransform: "none",
  fontSize: "14px",
  fontWeight: "600",
  background: "rgba(59, 130, 246, 0.1)",
  color: "#3b82f6",
  boxShadow: "none",
  padding: "12px 32px",
  borderRadius: "50px",
  height: "auto",
  border: "2px solid rgba(59, 130, 246, 0.2)"
};

const footerTextStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginTop: "24px",
  fontSize: "13px",
  color: "#94a3b8"
};

const dialogCardStyle = {
  borderRadius: "24px",
  padding: "20px",
  background: "white",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)"
};

const dialogTextStyle = {
  textAlign: "center",
  padding: "20px"
};

const dialogIconStyle = {
  marginBottom: "24px"
};

const dialogTitleStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "16px"
};

const dialogMessageStyle = {
  fontSize: "16px",
  color: "#64748b",
  marginBottom: "20px",
  lineHeight: "1.8"
};

const dialogSubMessageStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "32px",
  padding: "12px 20px",
  background: "rgba(59, 130, 246, 0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(59, 130, 246, 0.1)"
};

const dialogBtnStyle = {
  textTransform: "none",
  fontSize: "16px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.35)",
  padding: "14px 48px",
  borderRadius: "50px",
  height: "auto",
  color: "white",
  minWidth: "200px"
};
</script>

<style scoped>
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .v-card-text {
    padding: 24px !important;
  }
}
</style>
