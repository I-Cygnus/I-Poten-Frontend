<template>
  <v-container :style="containerStyle" class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <div :style="titleContainerStyle">
          <div :style="badgeRowStyle">
            <span :style="pageBadgeStyle">
              {{ rejoinMode ? "계정 재가입" : "회원가입 전 확인" }}
            </span>
<!--            <span :style="stepBadgeStyle">STEP 1</span>-->
          </div>

          <h1 :style="mainTitleStyle">
            {{ rejoinMode ? "다시 시작하기 전에 약관을 확인해 주세요" : "회원가입을 위한 약관 동의" }}
          </h1>

          <p :style="subtitleStyle">
            {{
              rejoinMode
                  ? "탈퇴 이력이 있는 계정을 다시 활성화하려면 약관 동의가 필요합니다."
                  : "I-Poten 서비스 이용을 위해 개인정보 처리방침과 이용약관 확인이 필요합니다."
            }}
          </p>

          <p :style="subtitleStyle">
            {{
              rejoinMode
                  ? "이전과 동일한 소셜 계정으로 다시 가입하는 경우에도 필수 약관 동의 절차가 진행됩니다."
                  : "필수 항목에 동의하면 회원가입을 계속 진행할 수 있습니다."
            }}
          </p>
        </div>

        <!-- 상단 상태 카드 -->
        <div :style="summaryGridStyle">
          <div :style="summaryPrimaryCardStyle">
            <div :style="summaryLabelWhiteStyle">필수 항목 동의</div>
            <div :style="summaryValueWhiteStyle">{{ requiredCheckedCount }} / {{ requiredItemsCount }}</div>
            <div :style="summaryTextWhiteStyle">
              필수 약관에 모두 동의해야 다음 단계로 진행할 수 있습니다.
            </div>
          </div>

          <div :style="summaryCardStyle">
            <div :style="summaryLabelStyle">진행 상태</div>
            <div :style="summaryValueStyle">
              {{ canSubmit ? "가입 진행 가능" : "필수 항목 확인 필요" }}
            </div>
            <div :style="summaryTextStyle">
              선택 항목은 동의하지 않아도 서비스 이용을 시작할 수 있습니다.
            </div>
          </div>
        </div>

        <!-- 전체 동의 -->
        <div :style="allAgreeSectionStyle">
          <div :style="allAgreeTopStyle" @click="toggleAll">
            <div :style="allAgreeLeftStyle">
              <div :style="allAgreeCheckWrapStyle">
                <span :style="getCheckBoxStyle(allChecked)">
                  <span :style="checkIconStyle">✓</span>
                </span>
              </div>

              <div>
                <div :style="allAgreeTitleStyle">전체 약관에 동의합니다</div>
                <div :style="allAgreeSubStyle">
                  선택 항목을 포함한 모든 약관을 한 번에 체크할 수 있습니다.
                </div>
              </div>
            </div>

            <div :style="allAgreeStateStyle">
              {{ allChecked ? "전체 동의 완료" : "전체 선택" }}
            </div>
          </div>
        </div>

        <!-- 약관 항목 -->
        <div :style="sectionWrapStyle">
          <div :style="sectionHeaderStyle">
            <h2 :style="sectionTitleStyle">약관 항목</h2>
            <p :style="sectionDescStyle">필수 항목을 우선 확인하고, 필요한 경우 상세 내용을 펼쳐 확인해 주세요.</p>
          </div>

          <div
              v-for="(item, index) in agreementItems"
              :key="item.id"
              :style="getAgreementCardStyle(item.checked, isExpanded(item.id))"
          >
            <div :style="agreementTopRowStyle">
              <div :style="agreementLeftStyle">
                <div :style="checkWrapStyle">
                  <button
                      type="button"
                      :style="checkButtonStyle"
                      @click="toggleItem(item.id)"
                      :aria-pressed="item.checked"
                      :aria-label="`${item.title} ${item.checked ? '동의 해제' : '동의'}`"
                  >
                    <span :style="getCheckBoxStyle(item.checked)">
                    <span :style="checkIconStyle">✓</span>
                    </span>
                  </button>
                </div>

                <div :style="agreementTextWrapStyle">
                  <div :style="agreementMetaRowStyle">
                    <span :style="item.required ? requiredBadgeStyle : optionalBadgeStyle">
                      {{ item.required ? "필수" : "선택" }}
                    </span>
                    <span :style="agreementOrderStyle">
                      {{ String(index + 1).padStart(2, "0") }}
                    </span>
                  </div>

                  <div :style="agreementTitleRowStyle">
                    <strong :style="agreementMainTitleStyle">{{ item.title }}</strong>
                  </div>

                  <p :style="agreementCaptionStyle">{{ item.caption }}</p>
                </div>
              </div>

              <div :style="agreementActionGroupStyle">
                <div :style="item.checked ? agreementStateActiveStyle : agreementStateStyle">
                  {{ item.checked ? "동의함" : "미동의" }}
                </div>

                <button
                    type="button"
                    :style="getDetailToggleStyle(isExpanded(item.id))"
                    @click="toggleExpanded(item.id)"
                    :aria-expanded="isExpanded(item.id)"
                >
                  <span>{{ isExpanded(item.id) ? "상세 접기" : "상세 보기" }}</span>
                  <span :style="getChevronWrapStyle">
                    <span :style="getChevronStyle(isExpanded(item.id))"></span>
                  </span>
                </button>
              </div>
            </div>

            <v-expand-transition>
              <div v-show="isExpanded(item.id)" :style="agreementBodyStyle">
                <div :style="agreementDetailHeaderStyle">
                  <div :style="agreementDetailTitleStyle">상세 안내</div>
                  <div :style="agreementDetailSubStyle">
                    아래 내용을 확인한 뒤 동의 여부를 선택해 주세요.
                  </div>
                </div>

                <div
                    v-for="paragraph in item.content"
                    :key="`${item.id}-${paragraph.slice(0, 20)}`"
                    :style="agreementParagraphRowStyle"
                >
                  <span :style="dotStyle"></span>
                  <p :style="agreementParagraphStyle">{{ paragraph }}</p>
                </div>
              </div>
            </v-expand-transition>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div :style="bottomActionStyle">
          <div :style="bottomGuideBoxStyle">
            <div :style="bottomGuideTitleStyle">
              {{ canSubmit ? "필수 약관 동의가 완료되었습니다." : "필수 약관 동의가 필요합니다." }}
            </div>
            <div :style="bottomGuideDescStyle">
              {{
                canSubmit
                    ? "이제 회원가입 또는 재가입을 계속 진행할 수 있습니다."
                    : "개인정보 수집 및 이용 동의와 서비스 이용약관 동의는 반드시 필요합니다."
              }}
            </div>
          </div>

          <div :style="buttonContainerStyle">
            <v-btn
                @click="goBack"
                :style="cancelBtnStyle"
                elevation="0"
            >
              이전으로
            </v-btn>

            <v-btn
                @click="agreeAndLogin"
                :style="canSubmit ? agreeBtnStyle : disabledAgreeBtnStyle"
                elevation="0"
                :disabled="!canSubmit"
            >
              {{ rejoinMode ? "동의하고 재가입 진행" : "동의하고 회원가입" }}
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useKakaoAuthenticationStore } from "../../../kakao/stores/kakaoAuthenticationStore";
import { useGoogleAuthenticationStore } from "../../../google/stores/googleAuthenticationStore";
import { useNaverAuthenticationStore } from "../../../naver/stores/naverAuthenticationStore";
import { useMetaAuthenticationStore } from "@/meta/stores/metaAuthenticationStore";
import { useHead } from "@vueuse/head";
import { isRejoinUser } from "../../utility/socialLogin";

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

/* style objects */
const containerStyle = {
  backgroundColor: "#f5f8ff",
  fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
  maxWidth: "1200px",
  margin: "0 auto",
  marginTop: "20px",
  marginBottom: "40px",
};

const titleContainerStyle = {
  textAlign: "left",
  marginBottom: "24px",
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: "24px",
  padding: "32px",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.07)",
};

const badgeRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px",
  flexWrap: "wrap",
};

const pageBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  height: "34px",
  padding: "0 14px",
  borderRadius: "999px",
  background: "rgba(82, 124, 234, 0.1)",
  color: "#3f67dd",
  fontSize: "13px",
  fontWeight: 700,
};

const stepBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  height: "34px",
  padding: "0 12px",
  borderRadius: "999px",
  background: "#111827",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 700,
};

const mainTitleStyle = {
  fontSize: "2.1rem",
  fontWeight: 800,
  color: "#111827",
  marginBottom: "14px",
  lineHeight: "1.25",
  letterSpacing: "-0.03em",
};

const subtitleStyle = {
  fontSize: "1rem",
  color: "#6b7280",
  lineHeight: "1.7",
  margin: "6px 0",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "14px",
  marginBottom: "18px",
};

const summaryPrimaryCardStyle = {
  background: "linear-gradient(135deg, #527cea, #6b93f5)",
  borderRadius: "20px",
  padding: "22px",
  color: "#ffffff",
  boxShadow: "0 14px 30px rgba(82, 124, 234, 0.18)",
};

const summaryCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "20px",
  padding: "22px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
};

const summaryLabelWhiteStyle = {
  fontSize: "13px",
  fontWeight: 700,
  opacity: 0.95,
};

const summaryValueWhiteStyle = {
  fontSize: "2rem",
  fontWeight: 800,
  marginTop: "10px",
  lineHeight: "1.1",
};

const summaryTextWhiteStyle = {
  marginTop: "10px",
  fontSize: "13px",
  lineHeight: "1.6",
  opacity: 0.92,
};

const summaryLabelStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#64748b",
};

const summaryValueStyle = {
  fontSize: "1.45rem",
  fontWeight: 800,
  marginTop: "10px",
  lineHeight: "1.3",
  color: "#111827",
};

const summaryTextStyle = {
  marginTop: "10px",
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#64748b",
};

const allAgreeSectionStyle = {
  marginBottom: "16px",
  background: "linear-gradient(135deg, #1f2937, #334155)",
  borderRadius: "20px",
  padding: "20px 22px",
  boxShadow: "0 16px 34px rgba(15, 23, 42, 0.14)",
};

const allAgreeTopStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  cursor: "pointer",
  flexWrap: "wrap",
};

const allAgreeLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const allAgreeCheckWrapStyle = {
  display: "flex",
  alignItems: "center",
};

const allAgreeTitleStyle = {
  fontSize: "18px",
  fontWeight: 800,
  color: "#ffffff",
};

const allAgreeSubStyle = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.76)",
  marginTop: "4px",
  lineHeight: "1.5",
};

const allAgreeStateStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#ffffff",
};

const sectionWrapStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.07)",
};

const sectionHeaderStyle = {
  marginBottom: "18px",
};

const sectionTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: 800,
  color: "#111827",
  marginBottom: "8px",
};

const sectionDescStyle = {
  fontSize: "14px",
  color: "#6b7280",
  margin: 0,
};

const getAgreementCardStyle = (checked, expanded) => ({
  marginBottom: "14px",
  background: expanded ? "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" : "#ffffff",
  border: checked
      ? "1px solid rgba(82, 124, 234, 0.38)"
      : "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: expanded
      ? "0 18px 36px rgba(15, 23, 42, 0.08)"
      : checked
          ? "0 10px 24px rgba(82, 124, 234, 0.08)"
          : "none",
});

const agreementTopRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  padding: "18px 20px",
  flexWrap: "wrap",
};

const agreementLeftStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  flex: 1,
  minWidth: 0,
};

const agreementActionGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const checkWrapStyle = {
  display: "flex",
  alignItems: "flex-start",
  paddingTop: "2px",
};

const checkButtonStyle = {
  display: "inline-flex",
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const agreementTextWrapStyle = {
  flex: 1,
  minWidth: 0,
};

const agreementMetaRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "10px",
  flexWrap: "wrap",
};

const agreementOrderStyle = {
  display: "inline-flex",
  alignItems: "center",
  height: "24px",
  padding: "0 10px",
  borderRadius: "999px",
  background: "rgba(15, 23, 42, 0.06)",
  color: "#475569",
  fontSize: "12px",
  fontWeight: 700,
};

const agreementTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
};

const agreementMainTitleStyle = {
  fontSize: "17px",
  lineHeight: "1.4",
  color: "#111827",
};

const agreementCaptionStyle = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "1.6",
  margin: "8px 0 0 0",
};

const requiredBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "42px",
  height: "24px",
  padding: "0 9px",
  borderRadius: "999px",
  background: "rgba(82, 124, 234, 0.1)",
  color: "#3f67dd",
  fontSize: "12px",
  fontWeight: 700,
};

const optionalBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "42px",
  height: "24px",
  padding: "0 9px",
  borderRadius: "999px",
  background: "rgba(148, 163, 184, 0.14)",
  color: "#475569",
  fontSize: "12px",
  fontWeight: 700,
};

const agreementStateStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#94a3b8",
};

const agreementStateActiveStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#527cea",
};

const getDetailToggleStyle = (expanded) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  height: "40px",
  padding: "0 14px",
  borderRadius: "999px",
  border: expanded ? "1px solid rgba(82, 124, 234, 0.28)" : "1px solid rgba(148, 163, 184, 0.24)",
  background: expanded ? "rgba(82, 124, 234, 0.08)" : "#ffffff",
  color: expanded ? "#3f67dd" : "#334155",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
});

const getChevronWrapStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "14px",
  height: "14px",
};

const getChevronStyle = (expanded) => ({
  display: "inline-block",
  width: "7px",
  height: "7px",
  borderRight: "1.8px solid currentColor",
  borderBottom: "1.8px solid currentColor",
  transform: expanded ? "rotate(-135deg)" : "rotate(45deg)",
  transition: "transform 0.2s ease",
  color: expanded ? "#3f67dd" : "#64748b",
  marginTop: expanded ? "2px" : "-1px",
});



const agreementBodyStyle = {
  padding: "18px 20px 22px 20px",
  borderTop: "1px solid rgba(148, 163, 184, 0.14)",
  backgroundColor: "#fbfcff",
};

const agreementDetailHeaderStyle = {
  marginBottom: "4px",
};

const agreementDetailTitleStyle = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#111827",
};

const agreementDetailSubStyle = {
  marginTop: "6px",
  fontSize: "13px",
  color: "#64748b",
  lineHeight: "1.6",
};

const agreementParagraphRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  marginTop: "14px",
};

const dotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "#527cea",
  marginTop: "10px",
  flexShrink: 0,
};

const agreementParagraphStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.8",
  wordBreak: "keep-all",
};

const bottomActionStyle = {
  marginTop: "20px",
  marginBottom: "60px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: "20px",
  padding: "18px 20px",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.07)",
};

const bottomGuideBoxStyle = {
  flex: 1,
  minWidth: "260px",
};

const bottomGuideTitleStyle = {
  fontSize: "15px",
  fontWeight: 800,
  color: "#111827",
};

const bottomGuideDescStyle = {
  marginTop: "6px",
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#6b7280",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const agreeBtnStyle = {
  background: "linear-gradient(135deg, #527cea, #6b93f5)",
  color: "#ffffff",
  padding: "0 2rem",
  height: "48px",
  fontSize: "1rem",
  fontWeight: 700,
  borderRadius: "12px",
  textTransform: "none",
  boxShadow: "0 14px 28px rgba(82, 124, 234, 0.22)",
};

const disabledAgreeBtnStyle = {
  background: "#cbd5e1",
  color: "#ffffff",
  padding: "0 2rem",
  height: "48px",
  fontSize: "1rem",
  fontWeight: 700,
  borderRadius: "12px",
  textTransform: "none",
};

const cancelBtnStyle = {
  backgroundColor: "#ffffff",
  color: "#111827",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  padding: "0 2rem",
  height: "48px",
  fontSize: "1rem",
  fontWeight: 600,
  borderRadius: "12px",
  textTransform: "none",
};

const getCheckBoxStyle = (checked) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "26px",
  height: "26px",
  borderRadius: "8px",
  border: checked ? "1.5px solid #527cea" : "1.5px solid rgba(148, 163, 184, 0.55)",
  background: checked ? "linear-gradient(135deg, #527cea, #6b93f5)" : "#ffffff",
  boxShadow: checked ? "0 10px 20px rgba(82, 124, 234, 0.22)" : "none",
  flexShrink: 0,
});

const checkIconStyle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 800,
  lineHeight: 1,
};
</script>

<style>
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");
</style>
