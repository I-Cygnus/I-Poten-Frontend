<template>
  <div></div> <!-- 빈 컨테이너를 렌더링. 콜백 전용 페이지 역할. -->
</template>

<script setup>

import { onMounted } from "vue"; // 마운트 시점 훅을 임포트.
import { useRouter, useRoute } from "vue-router"; // 라우터, 현재 라우트 접근 훅.

import { useAccountStore } from "../../account/stores/accountStore"; // 계정 관련 Pinia 스토어.
import { useGithubAuthenticationStore } from "../../github/stores/githubAuthenticationStore"; // Github 인증 스토어.

const accountStore = useAccountStore(); // 계정 스토어 인스턴스 생성. (현재 코드에서는 미사용.)
const githubAuthenticationStore = useGithubAuthenticationStore(); // Github 인증 스토어 인스턴스 생성.

const router = useRouter(); // 라우터 인스턴스 획득. 페이지 이동에 사용.
const route = useRoute(); // 현재 라우트 정보 획득. 쿼리스트링 접근에 사용.

const setRedirectGithubData = async () => { // 콜백 처리 핵심 로직 정의.
  const code = route.query.code; // 쿼리스트링의 code 획득. (string | string[] | undefined 가능.)
  const userToken = await githubAuthenticationStore.requestAccessToken({
    code, // 인가 코드를 백엔드로 전달하여 액세스 토큰 교환 요청.
  });

  localStorage.setItem("userToken", userToken); // 발급된 사용자 토큰을 로컬스토리지에 저장.
  localStorage.setItem("loginType", "GITHUB"); // 로그인 타입을 기록. 후속 가드/뷰에서 활용.
  githubAuthenticationStore.isAuthenticated = true; // 스토어 인증 상태를 true로 설정.

  router.push("/"); // 홈으로 리다이렉트. (필요 시 관리자/마이페이지 등으로 변경 가능.)
};

onMounted(async () => { // 컴포넌트가 DOM에 마운트된 직후 실행.
  await setRedirectGithubData(); // 콜백 처리 로직 수행.
});
</script>
