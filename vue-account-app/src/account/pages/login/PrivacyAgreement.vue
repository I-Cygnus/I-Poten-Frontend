<template>
  <div :style="pageStyle">
    <!-- Top bar -->
    <div :style="topBarStyle">
      <div :style="topBarInnerStyle">
        <a href="/" :style="logoLinkStyle" aria-label="I-Poten 홈으로">
          <img :src="logoBlack" alt="I-Poten" :style="logoImageStyle" />
        </a>
      </div>
    </div>

    <div :style="shellStyle">
      <!-- Header -->
      <header :style="headerStyle">
        <p :style="eyebrowStyle">{{ rejoinMode ? "계정 재가입" : "회원가입" }}</p>
        <h1 :style="titleStyle">
          {{ rejoinMode ? "약관을 다시 확인해주세요" : "서비스 이용약관에 동의해주세요" }}
        </h1>
        <p :style="descStyle">
          {{
            rejoinMode
                ? "탈퇴 이력이 있는 계정을 다시 활성화하려면 약관 동의가 필요합니다."
                : "필수 항목에 동의하시면 바로 회원가입이 완료됩니다."
          }}
        </p>
      </header>

      <!-- Card -->
      <section :style="cardStyle">
        <!-- All agree -->
        <button
            type="button"
            :style="allAgreeRowStyle"
            @click="toggleAll"
            :aria-pressed="allChecked"
        >
          <span :style="getCheckStyle(allChecked, true)" aria-hidden="true">
            <span :style="getCheckIconStyle(allChecked)"></span>
          </span>
          <span :style="allAgreeLabelStyle">약관 전체 동의</span>
          <span :style="allAgreeMetaStyle">{{ requiredCheckedCount }} / {{ requiredItemsCount }} 필수</span>
        </button>

        <div :style="dividerStyle"></div>

        <!-- Items -->
        <ul :style="listStyle">
          <li
              v-for="item in agreementItems"
              :key="item.id"
              :style="itemStyle"
          >
            <div :style="itemRowStyle">
              <button
                  type="button"
                  :style="itemClickStyle"
                  @click="toggleItem(item.id)"
                  :aria-pressed="item.checked"
              >
                <span :style="getCheckStyle(item.checked, false)" aria-hidden="true">
                  <span :style="getCheckIconStyle(item.checked)"></span>
                </span>
                <span :style="itemLabelWrapStyle">
                  <span :style="item.required ? requiredTagStyle : optionalTagStyle">
                    {{ item.required ? "(필수)" : "(선택)" }}
                  </span>
                  <span :style="itemTitleStyle">{{ item.title }}</span>
                </span>
              </button>

              <button
                  type="button"
                  :style="detailToggleStyle"
                  @click="toggleExpanded(item.id)"
                  :aria-expanded="isExpanded(item.id)"
              >
                <span>{{ isExpanded(item.id) ? "접기" : "전문 보기" }}</span>
                <span :style="getChevronStyle(isExpanded(item.id))"></span>
              </button>
            </div>

            <v-expand-transition>
              <div v-show="isExpanded(item.id)" :style="detailBoxStyle">
                <p
                    v-for="paragraph in item.content"
                    :key="`${item.id}-${paragraph.slice(0, 20)}`"
                    :style="detailParagraphStyle"
                >
                  {{ paragraph }}
                </p>
              </div>
            </v-expand-transition>
          </li>
        </ul>
      </section>

      <!-- Actions -->
      <div :style="actionRowStyle">
        <v-btn
            @click="goBack"
            :style="secondaryBtnStyle"
            elevation="0"
            height="48"
        >
          이전으로
        </v-btn>
        <v-btn
            @click="agreeAndLogin"
            :style="canSubmit ? primaryBtnStyle : primaryBtnDisabledStyle"
            elevation="0"
            :disabled="!canSubmit"
            height="48"
        >
          {{ rejoinMode ? "동의하고 재가입" : "동의하고 가입하기" }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useKakaoAuthenticationStore } from "../../../kakao/stores/kakaoAuthenticationStore";
import { useGoogleAuthenticationStore } from "../../../google/stores/googleAuthenticationStore";
import { useNaverAuthenticationStore } from "../../../naver/stores/naverAuthenticationStore";
import { useMetaAuthenticationStore } from "@/meta/stores/metaAuthenticationStore";
import { useHead } from "@vueuse/head";
import { isRejoinUser } from "../../utility/socialLogin";
import logoBlack from "@/assets/images/logo/Logo2.png";

useHead({
  title: "약관 동의 | I-Poten",
  meta: [
    {
      name: "description",
      content: "I-Poten 회원가입을 위한 개인정보 처리방침 및 서비스 이용약관 동의 페이지입니다.",
    },
    {
      name: "keywords",
      content: "I-Poten, 약관 동의, 개인정보 처리방침, 서비스 이용약관",
    },
    { property: "og:title", content: "I-Poten 약관 동의" },
    {
      property: "og:description",
      content: "회원가입 전 필수 약관과 개인정보 처리방침을 확인해 주세요.",
    },
  ],
});

const router = useRouter();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const isMobile = computed(() => windowWidth.value <= 640);
const onResize = () => { windowWidth.value = window.innerWidth; };
onMounted(() => { window.addEventListener('resize', onResize); });
onUnmounted(() => { window.removeEventListener('resize', onResize); });
const kakaoAuthentication = useKakaoAuthenticationStore();
const googleAuthentication = useGoogleAuthenticationStore();
const naverAuthentication = useNaverAuthenticationStore();
const metaAuthentication = useMetaAuthenticationStore();

const loginType = ref(null);
const rejoinMode = ref(false);
const expandedItemIds = ref([]);

const agreementItems = ref([
  {
    id: "privacy",
    title: "개인정보 수집 및 이용 동의",
    caption: "개인정보 처리 목적, 수집 항목, 이용 범위, 보관 기간을 확인해 주세요.",
    required: true,
    checked: false,
    content: [
      "회사는 회원 식별, 계정 관리, 서비스 제공, 맞춤형 추천, 통계 분석, 보안 및 부정 이용 방지 목적 범위에서 개인정보를 수집하고 이용합니다.",
      "수집 항목에는 이메일 주소 및 계정 정보, 회원이 선택적으로 제공한 이력서 경력 포트폴리오 정보, AI 면접 응답과 분석 결과, PotenWord 검색 기록, 학습 진행 기록, PotenBook 이용 이력, 접속 로그 및 기기 정보가 포함될 수 있습니다.",
      "AI 면접 기능 제공을 위해 외부 AI 서비스가 사용될 수 있으며, 이 과정에서 회원이 입력한 질문, 답변, 이력 정보 일부가 해당 서비스로 전송될 수 있습니다.",
      "개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기하며, 관련 법령에 보관 의무가 있는 경우에는 해당 기간 동안 별도로 보관합니다.",
      "회원은 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제를 요청할 수 있으며, 탈퇴를 통해 계정 삭제를 진행할 수 있습니다.",
    ],
  },
  {
    id: "service",
    title: "서비스 이용약관 동의",
    caption: "서비스 목적, 이용 조건, 금지 행위, 책임 제한 항목을 확인해 주세요.",
    required: true,
    checked: false,
    content: [
      "본 약관은 I-Poten가 제공하는 I-Poten 서비스의 이용 조건, 회원과 회사의 권리와 의무, 책임사항을 규정합니다.",
      "I-Poten은 AI 모의면접, PotenWord, PotenNote, PotenQuiz, PotenBook 등 취업 준비와 학습을 위한 기능을 제공합니다. 회사는 운영상 필요에 따라 서비스 내용이나 제공 방식을 변경할 수 있습니다.",
      "회원은 관련 법령과 운영정책을 준수해야 하며, 타인의 권리 침해, 악성 코드 배포, 무단 광고, 부정 접근, 콘텐츠 무단 복제 및 영리 목적 이용 행위를 해서는 안 됩니다.",
      "AI가 생성한 질문, 분석, 피드백 결과는 자동 생성 정보이므로 부정확하거나 편향될 수 있습니다. 회원은 이를 최종 판단 자료로만 사용하고 사실 여부를 직접 확인해야 합니다.",
      "회원이 약관이나 정책을 위반하는 경우 회사는 게시물 제한, 이용 정지, 계정 해지 등 필요한 조치를 할 수 있습니다.",
      "서비스 내 콘텐츠와 지식재산권은 회사 또는 정당한 권리자에게 귀속되며, 회원은 사전 동의 없이 이를 복제, 배포, 전송, 2차 저작물 작성, 상업적 이용할 수 없습니다.",
    ],
  },
  {
    id: "marketing",
    title: "혜택 및 이벤트 알림 수신 동의",
    caption: "프로모션, 신규 기능, 이벤트 공지 등 선택 안내를 받을 수 있습니다.",
    required: false,
    checked: false,
    content: [
      "선택 항목이므로 동의하지 않아도 회원가입과 기본 서비스 이용에는 제한이 없습니다.",
      "동의 시 이벤트, 프로모션, 신규 기능, 학습 추천, 유료 상품 및 제휴 혜택 안내를 이메일 또는 서비스 알림 형태로 받을 수 있습니다.",
      "수신 동의는 언제든지 철회할 수 있으며, 철회 이후에는 마케팅 목적의 안내 발송이 중단됩니다.",
    ],
  },
]);

const requiredItems = computed(() => agreementItems.value.filter(item => item.required));
const requiredItemsCount = computed(() => requiredItems.value.length);
const requiredCheckedCount = computed(() => requiredItems.value.filter(item => item.checked).length);
const canSubmit = computed(() => requiredCheckedCount.value === requiredItemsCount.value);
const allChecked = computed(() => agreementItems.value.every(item => item.checked));

onMounted(() => {
  rejoinMode.value = isRejoinUser();

  const tempType = sessionStorage.getItem("tempLoginType");
  const validTypes = ["KAKAO", "GOOGLE", "NAVER", "META"];

  if (!tempType || !validTypes.includes(tempType)) {
    loginType.value = null;
    alert("로그인 정보를 확인할 수 없습니다. 로그인 페이지로 이동합니다.");
    router.push("/account/login");
    return;
  }

  loginType.value = tempType;
});

const toggleItem = (id) => {
  agreementItems.value = agreementItems.value.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
  );
};

const isExpanded = (id) => expandedItemIds.value.includes(id);

const toggleExpanded = (id) => {
  expandedItemIds.value = isExpanded(id)
      ? expandedItemIds.value.filter((itemId) => itemId !== id)
      : [...expandedItemIds.value, id];
};

const toggleAll = () => {
  const nextChecked = !allChecked.value;
  agreementItems.value = agreementItems.value.map((item) => ({
    ...item,
    checked: nextChecked,
  }));
};

const agreeAndLogin = async () => {
  if (!canSubmit.value) {
    alert("필수 약관에 모두 동의해 주세요.");
    return;
  }

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
    console.error("회원가입 처리 실패:", err);
    alert("가입 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
  }
};

const goBack = () => {
  router.push("/account/login");
};

/* ===================== styles ===================== */

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f7f8fa",
  fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  color: "#191f28",
};

const topBarStyle = {
  position: "sticky",
  top: 0,
  zIndex: 30,
  background: "rgba(247, 248, 250, 0.85)",
  backdropFilter: "saturate(180%) blur(12px)",
  WebkitBackdropFilter: "saturate(180%) blur(12px)",
  borderBottom: "1px solid #edeff2",
};

const topBarInnerStyle = computed(() => ({
  maxWidth: "1120px",
  margin: "0 auto",
  padding: isMobile.value ? "14px 20px" : "18px 32px",
  display: "flex",
  alignItems: "center",
}));

const logoLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
};

const logoImageStyle = {
  height: "26px",
  width: "auto",
  display: "block",
};

const shellStyle = computed(() => ({
  maxWidth: "720px",
  margin: "0 auto",
  padding: isMobile.value ? "32px 20px 80px" : "64px 32px 120px",
}));

const headerStyle = computed(() => ({
  marginBottom: isMobile.value ? "24px" : "32px",
  paddingLeft: "4px",
}));

const eyebrowStyle = {
  margin: 0,
  fontSize: "13px",
  fontWeight: 600,
  color: "#3182f6",
  letterSpacing: "0.02em",
  marginBottom: "12px",
  textTransform: "uppercase",
};

const titleStyle = computed(() => ({
  margin: 0,
  fontSize: isMobile.value ? "1.625rem" : "2rem",
  fontWeight: 700,
  color: "#191f28",
  lineHeight: "1.35",
  letterSpacing: "-0.025em",
  wordBreak: "keep-all",
}));

const descStyle = {
  margin: "12px 0 0",
  fontSize: "15px",
  lineHeight: "1.65",
  color: "#6b7684",
  letterSpacing: "-0.01em",
  wordBreak: "keep-all",
};

const cardStyle = computed(() => ({
  background: "#ffffff",
  border: "1px solid #e5e8eb",
  borderRadius: "16px",
  padding: isMobile.value ? "8px 20px" : "16px 32px",
  boxShadow: "0 1px 2px rgba(17, 24, 39, 0.04)",
}));

const allAgreeRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  width: "100%",
  padding: "20px 4px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};

const allAgreeLabelStyle = {
  fontSize: "17px",
  fontWeight: 700,
  color: "#191f28",
  letterSpacing: "-0.015em",
  flex: 1,
};

const allAgreeMetaStyle = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#8b95a1",
  letterSpacing: "-0.01em",
  fontVariantNumeric: "tabular-nums",
};

const dividerStyle = {
  height: "1px",
  background: "#f2f4f6",
  margin: "0 -8px",
};

const listStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const itemStyle = {
  padding: "0",
  borderBottom: "1px solid #f2f4f6",
};

const itemRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "16px 4px",
};

const itemClickStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flex: 1,
  minWidth: 0,
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};

const itemLabelWrapStyle = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: "6px",
  flexWrap: "wrap",
  minWidth: 0,
};

const requiredTagStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#3182f6",
  letterSpacing: "-0.01em",
  flexShrink: 0,
};

const optionalTagStyle = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#8b95a1",
  letterSpacing: "-0.01em",
  flexShrink: 0,
};

const itemTitleStyle = {
  fontSize: "15px",
  fontWeight: 500,
  color: "#191f28",
  letterSpacing: "-0.015em",
  lineHeight: "1.5",
};

const detailToggleStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  height: "32px",
  padding: "0 12px",
  background: "transparent",
  border: "none",
  borderRadius: "6px",
  color: "#6b7684",
  fontSize: "13px",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  cursor: "pointer",
  flexShrink: 0,
};

const getChevronStyle = (expanded) => ({
  display: "inline-block",
  width: "6px",
  height: "6px",
  borderRight: "1.5px solid currentColor",
  borderBottom: "1.5px solid currentColor",
  transform: expanded ? "rotate(-135deg)" : "rotate(45deg)",
  transition: "transform 0.2s ease",
  marginTop: expanded ? "2px" : "-2px",
});

const detailBoxStyle = {
  margin: "0 4px 16px",
  padding: "18px 20px",
  background: "#f7f8fa",
  borderRadius: "10px",
};

const detailParagraphStyle = {
  margin: "0 0 8px",
  fontSize: "13px",
  color: "#4e5968",
  lineHeight: "1.75",
  wordBreak: "keep-all",
  letterSpacing: "-0.01em",
};

const getCheckStyle = (checked, strong) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: strong ? "26px" : "24px",
  height: strong ? "26px" : "24px",
  borderRadius: "50%",
  background: checked ? "#3182f6" : "transparent",
  border: checked ? "1.5px solid #3182f6" : "1.5px solid #d1d6db",
  transition: "background 0.15s ease, border-color 0.15s ease",
  flexShrink: 0,
});

const getCheckIconStyle = (checked) => ({
  display: "inline-block",
  width: "10px",
  height: "6px",
  borderLeft: "2px solid #ffffff",
  borderBottom: "2px solid #ffffff",
  transform: "rotate(-45deg)",
  marginTop: "-2px",
  opacity: checked ? 1 : 0,
  transition: "opacity 0.15s ease",
});

const actionRowStyle = computed(() => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
  marginTop: isMobile.value ? "24px" : "32px",
  flexWrap: "wrap",
}));

const primaryBtnStyle = {
  background: "#3182f6",
  color: "#ffffff",
  fontSize: "0.9375rem",
  fontWeight: 700,
  borderRadius: "10px",
  textTransform: "none",
  letterSpacing: "-0.015em",
  boxShadow: "none",
  padding: "0 24px",
  minWidth: "180px",
};

const primaryBtnDisabledStyle = {
  background: "#e5e8eb",
  color: "#b0b8c1",
  fontSize: "0.9375rem",
  fontWeight: 700,
  borderRadius: "10px",
  textTransform: "none",
  letterSpacing: "-0.015em",
  boxShadow: "none",
  padding: "0 24px",
  minWidth: "180px",
};

const secondaryBtnStyle = {
  background: "#ffffff",
  color: "#4e5968",
  border: "1px solid #d1d6db",
  fontSize: "0.9375rem",
  fontWeight: 600,
  borderRadius: "10px",
  textTransform: "none",
  letterSpacing: "-0.015em",
  boxShadow: "none",
  padding: "0 20px",
};
</script>

<style>
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");
</style>
