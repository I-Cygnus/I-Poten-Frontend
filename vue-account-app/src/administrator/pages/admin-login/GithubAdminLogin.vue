<!-- src/account/pages/admin-login/GithubAdminLogin.vue -->
<template>
  <div class="grey lighten-5" style="font-family: 'Noto Sans KR', sans-serif">
    <v-container class="white">
      <v-row justify="center">
        <v-col cols="auto" style="padding-bottom: 90px">
          <v-card width="460">
            <v-card-text class="text-center px-12 py-16">
              <div class="text-h4 font-weight-black mb-10">
                GitHub Oauth 로그인
              </div>

              <div class="d-flex">
                <v-img :src="githubIconSrc" width="120" class="mx-auto mb-6" />
              </div>
              <v-alert v-if="tokenValid === false" type="warning" variant="tonal" class="mb-4" density="compact">
                임시 토큰이 없거나 유효하지 않습니다.
              </v-alert>
<!--              <v-btn-->
<!--                  block-->
<!--                  x-large-->
<!--                  rounded-->
<!--                  color="gray lighten-1"-->
<!--                  class="mt-6"-->
<!--                  @click="goToAdminCodeInput"-->
<!--              >-->
<!--                로그인-->
<!--              </v-btn>-->

              <!-- 필요하면 GitHub로 바로 이동 버튼도 사용 -->

              <v-btn block x-large rounded color="black" class="mt-3"
                     :disabled="tokenValid === false"
                @click="goToGithubLogin"
              >
                GitHub 소셜 로그인
              </v-btn>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
// 별칭(@)이 없다면 아래를 ../../../assets/... 으로 바꿔주세요.
import githubIconSrc from "@/assets/images/fixed/icon-github.svg";
// import githubIconSrc from "../../assets/images/fixed/icon-github.svg";
import { useGithubAuthenticationStore } from "../../../github/stores/githubAuthenticationStore.ts";
// import { getTempToken} from "@/account/utility/tempoaryAdminToken.ts";
import { createAxiosInstances} from "@/account/utility/axiosInstance.ts";
import {validateTempTokenOnServer} from "@/administrator/utility/adminApi.ts";

const router = useRouter();
const githubAuthentication = useGithubAuthenticationStore();

// 버튼: 코드 입력 화면으로 이동
const goToAdminCodeInput = () => {
  router.push("/account/admin-code");
};

// UI 확인용: null=미확인, true=유효, false=무효/없음
const tokenValid = ref<boolean|null>(null);

/**
 * GitHub 로그인 플로우 시작 핸들러.
 * - async: 비동기 작업을 순차적으로 제어.
 * - await: 스토어 함수가 완료(resolve/reject)될 때까지 대기.
 * - try/catch: 네트워크/서버 오류를 캐치하고 로깅.
 */
const goToGithubLogin = async (): Promise<void> => {
  try {
    // GitHub OAuth 시작을 백엔드(Django)에 요청.
    // 내부에서 redirect URL 수신 후, window.location 으로 실제 GitHub 로그인 페이지로 이동 처리.
    // 주의: window.location으로 페이지 이동 시, 이후 코드 실행은 사실상 중단될 수 있음.
    console.log("goToGithubLogin is working")
    await githubAuthentication.requestGithubLoginToSpringBoot(router);

    // 여기 도달하는 경우는 보통 (1) 바로 이동하지 않는 설계거나 (2) 예외 상황.
    // 이동이 즉시 일어나는 설계라면 이 부분은 실행되지 않을 수 있음.
    // console.log("로그인 요청 완료. 다음 단계로 진행.");
  } catch (e) {
    // 요청 실패나 예외 상황을 콘솔로 남김. 사용자에게 알림 UI를 띄워도 좋음.
    console.error("[GithubAdminLogin] GitHub 로그인 요청 실패:", e);
    // 예: showToast("로그인 요청 중 오류가 발생했습니다.");
  }
};

function setMeta(
    name: string,
    content: string,
    attr: "name" | "property" = "name"
) {
  let el = document.head.querySelector<HTMLMetaElement>(
      `meta[${attr}="${name}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
//토큰 검증을 함수로 분리 → onMounted에서 호출
async function runTempTokenValidation() {
  createAxiosInstances();
  // const token = getTempToken();
  // if (!token) {
  //   tokenValid.value = false;
  //   console.warn("[GithubAdminLogin] 임시토큰 없음");
  //   return;
  // }
  const ok = await validateTempTokenOnServer();
  tokenValid.value = ok;
  console.log("[GithubAdminLogin] 임시토큰 유효성:", ok ? "유효" : "무효");
}
onMounted(async () => {
  // 1) 토큰 조회 + 서버 유효성 검증
  await runTempTokenValidation();

  // 2) 메타 설정
  document.title = "관리자 GitHub 로그인 | 잡스틱(JobStick)";
  setMeta("description", "잡스틱(JobStick) 관리자 전용 GitHub 계정으로 로그인하여 관리 기능을 이용하세요.");
  setMeta("keywords", "관리자 로그인, GitHub 로그인, JobStick 관리자, Admin GitHub Login, JobStick, job-stick, 잡스틱, 개발자 플랫폼, 개발자 취업, 모의 면접, AI 면접");
  setMeta("og:title", "잡스틱(JobStick) 관리자 GitHub 로그인", "property");
  setMeta("og:description", "잡스틱(JobStick)의 관리자용 페이지입니다. GitHub 계정으로 안전하게 로그인하세요.", "property");
  setMeta("og:image", "/assets/images/fixed/icon-github.svg", "property");
  setMeta("robots", "noindex, nofollow");
  if (tokenValid.value === false) {
    alert("인증되지않은 토큰이 발견되었습니다");
    router.replace({ name: "AdminAuthCode" });
  }
});
</script>

<style scoped>
/* 필요 시 추가 스타일 */
</style>
