<template>
  <v-container :style="containerStyle" class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <div :style="titleContainerStyle">
          <h1 :style="mainTitleStyle">회원가입 약관 동의</h1>
          <p :style="subtitleStyle">개인정보처리방침과 및 이용약관 내용에 동의하셔야 회원가입 하실 수 있습니다.</p>
          <p :style="subtitleStyle">이용약관과 개인정보처리방침에 대한 안내를 읽고 동의 해주세요.</p>
        </div>

        <!-- 개인정보처리방침 섹션 -->
        <div :style="sectionStyle">
          <h2 :style="sectionTitleStyle">개인정보처리방침</h2>
          <div :style="dividerStyle"></div>
          
          <div :style="termsContainerStyle">
            <div :style="termsContentStyle">
              <p :style="termsParagraphStyle">① 개인 정보 처리 목적</p>
              <p :style="termsTextStyle">1. 회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 횟수 파악 등을 통한 타겟 마케팅 및 개인 맞춤 서비스 제공</p>
              <p :style="termsTextStyle">2. 귀하는 개인 정보에 대한 선택권을 가지고 있습니다. 따라서, 귀하는 웹브라우저에서의 쿠키를 설정하므로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</p>
              
              <p :style="termsParagraphStyle">② 개인 정보 처리 방법</p>
              <p :style="termsTextStyle">1. 쿠키 설정을 거부하는 방법으로는 회원님이 사용하시는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.</p>
              <p :style="termsTextStyle">2. 설정방법 예(인터넷 익스플로러의 경우): 웹 브라우저 상단의 도구 > 인터넷 옵션 > 개인정보</p>
              <p :style="termsTextStyle">3. 단, 귀하께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.</p>
            </div>
          </div>
          
          <div :style="agreementTextStyle">개인정보처리방침 내용에 동의합니다.</div>
        </div>

        <!-- 이용약관 섹션 -->
        <div :style="sectionStyle">
          <h2 :style="sectionTitleStyle">이용약관</h2>
          <div :style="dividerStyle"></div>
          
          <div :style="termsContainerStyle">
            <div :style="termsContentStyle">
              <p :style="termsParagraphStyle">1. 제1조 목 적</p>
              <p :style="termsTextStyle">제1조 【목 적】</p>
              <p :style="termsTextStyle">디텍스는 인정하의 서비스를 제공함 의무가 있으며, 구체적 정보에 상실의 동의를 의하가 있다. 상실는 이래의 조건에 의거하여 이 '이용약관'을 '계약서'로 형성코, 이에 따라 디텍스의 서비스를 제공자에게 제공한다.</p>
              
              <p :style="termsParagraphStyle">제2조 【용어의 정의】</p>
              <p :style="termsTextStyle">이 계약서에 있어서, 다음 용어들은 각각 다음과 같은 의미로 사용한다.</p>
              <p :style="termsTextStyle">가. 디텍스는(이하 '갑'이라 칭한다.)</p>
              <p :style="termsTextStyle">인터넷서비스 제공을 목적 중 하나로 운영하다를 제공한다.</p>
              <p :style="termsTextStyle">나. 계약자는(이하 '을' 이라 칭한다.)</p>
              <p :style="termsTextStyle">당사의 서비스 이용 계약을 체결하고 있는 자.</p>
            </div>
          </div>
          
          <div :style="agreementTextStyle">이용약관 내용에 동의합니다.</div>
        </div>

        <!-- 모든 약관 동의 체크박스 -->
<!--        <div :style="allAgreeContainerStyle">-->
<!--          <v-checkbox-->
<!--            v-model="allAgreed"-->
<!--            :style="checkboxStyle"-->
<!--            label="모든 약관에 동의합니다."-->
<!--            hide-details-->
<!--          ></v-checkbox>-->
<!--        </div>-->

        <!-- 버튼 영역 -->
        <div :style="buttonContainerStyle">
          <v-btn
            @click="agreeAndLogin"
            :style="agreeBtnStyle"
            elevation="0"
          >
            모두 동의 후 회원가입
          </v-btn>
          <v-btn
            @click="goBack"
            :style="cancelBtnStyle"
            elevation="0"
          >
            뒤로 가기
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useKakaoAuthenticationStore } from "../../../kakao/stores/kakaoAuthenticationStore";
import { useGoogleAuthenticationStore } from "../../../google/stores/googleAuthenticationStore";
import { useNaverAuthenticationStore } from "../../../naver/stores/naverAuthenticationStore";
import { useHead } from '@vueuse/head';
import {useMetaAuthenticationStore} from "@/meta/stores/metaAuthenticationStore";

// 스타일 객체 정의
const containerStyle = {
  backgroundColor: "#ffffff",
  fontFamily: "'Noto Sans KR', sans-serif",
  maxWidth: "1200px",
  margin: "0 auto",
  marginTop: "50px"
};

const titleContainerStyle = {
  textAlign: "left",
  marginBottom: "2rem"
};

const mainTitleStyle = {
  fontSize: "2rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: "1rem"
};

const subtitleStyle = {
  fontSize: "1rem",
  color: "#666",
  lineHeight: "1.5",
  margin: "0.25rem 0"
};

const sectionStyle = {
  marginBottom: "2rem",
  backgroundColor: "#fff",
  border: "1px solid #eee",
  borderRadius: "4px",
  padding: "1rem 0"
};

const sectionTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#333",
  paddingLeft: "1rem"
};

const dividerStyle = {
  height: "1px",
  backgroundColor: "#eee",
  margin: "1rem 0"
};

const termsContainerStyle = {
  backgroundColor: "#f9f9f9",
  padding: "1rem",
  maxHeight: "250px",
  overflowY: "auto",
  margin: "0 1rem",
  border: "1px solid #eee",
  borderRadius: "4px"
};

const termsContentStyle = {
  padding: "0.5rem"
};

const termsParagraphStyle = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#333",
  marginBottom: "0.5rem"
};

const termsTextStyle = {
  fontSize: "0.9rem",
  color: "#666",
  lineHeight: "1.6",
  marginBottom: "0.5rem",
  paddingLeft: "0.5rem"
};

const agreementTextStyle = {
  textAlign: "right",
  padding: "1rem",
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "#333"
};

const allAgreeContainerStyle = {
  backgroundColor: "#f9f9f9",
  padding: "1rem",
  marginBottom: "2rem",
  borderRadius: "4px",
  border: "1px solid #eee"
};

const checkboxStyle = {
  fontSize: "1rem",
  fontWeight: 700
};

const buttonContainerStyle = {
  marginTop: "100px",
  marginBottom: "100px",
  display: "flex",
  justifyContent: "center",
  gap: "1rem"
};

const agreeBtnStyle = {
  backgroundColor: "#e60000",
  color: "white",
  padding: "0 2rem",
  height: "48px",
  fontSize: "1rem",
  fontWeight: 700,
  borderRadius: "4px",
  textTransform: "none"
};

const cancelBtnStyle = {
  backgroundColor: "#fff",
  color: "#333",
  border: "1px solid #ddd",
  padding: "0 2rem",
  height: "48px",
  fontSize: "1rem",
  fontWeight: 500,
  borderRadius: "4px",
  textTransform: "none"
};

// ✅ SEO 메타 정보
useHead({
  title: "개인정보 수집 및 이용 동의 | I-Poten",
  meta: [
    { name: "description", content: "잡스틱(JobStick) 이용을 위한 개인정보 수집 및 이용 동의 페이지입니다. 사용자의 소중한 정보를 안전하게 처리합니다." },
    { name: "keywords", content: "개인정보, 개인정보 수집, 개인정보 이용, 개인정보 이용 동의, JobStick, job-stick, 잡스틱, 개발자 플랫폼, 개발자 취업, 모의 면접, AI 면접" },
    { property: "og:title", content: "잡스틱(JobStick) 개인정보 동의" },
    { property: "og:description", content: "서비스 이용을 위한 개인정보 동의 내용을 확인하고 동의해주세요." },
    { property: "og:image", content: "" }
  ]
})

const kakaoAuthentication = useKakaoAuthenticationStore();
const googleAuthentication = useGoogleAuthenticationStore();
const naverAuthentication = useNaverAuthenticationStore();
const metaAuthentication = useMetaAuthenticationStore();
const MAIN_CONTAINER_URL = process.env.MAIN_CONTAINER_URL;


const loginType = ref(null);
const router = useRouter();
const allAgreed = ref(false); // 모든 약관 동의 체크박스 상태

onMounted(() => {
  const user = sessionStorage.getItem("userInfo");
  const userInfo = JSON.parse(user);

  const tempType = sessionStorage.getItem("tempLoginType");
  const validTypes = ["KAKAO", "GOOGLE", "NAVER", "META"];
  if (!tempType || !validTypes.includes(tempType)) {
    loginType.value = null;
    alert("잘못된 접근입니다. 로그인 페이지로 이동합니다.");
    router.push("/account/login"); // 로그인 페이지로 리다이렉트
  } else {
    loginType.value = tempType;
  }
});

// 회원가입 버튼 클릭 시 실행되는 함수
const agreeAndLogin = async () => {

  
  if (!loginType.value) {
    alert("로그인 방식이 확인되지 않았습니다.");
    return;
  }

  try {


    if (loginType.value === "KAKAO") {
      await kakaoAuthentication.requestRegister();
    } else if (loginType.value === "GOOGLE") {
      await googleAuthentication.requestRegister();
    } else if (loginType.value === "NAVER") {
      await naverAuthentication.requestRegister();
    } else if (loginType.value === "META") {
      await metaAuthentication.requestRegister();
    }




  } catch (err) {
    console.error("로그인 실패:", err);
    alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
  }
};

// 메인으로 가기 버튼 클릭 시 실행되는 함수
const goBack = () => {
  router.push("/account/login");
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
</style>
