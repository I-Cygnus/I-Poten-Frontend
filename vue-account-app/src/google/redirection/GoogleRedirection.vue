<template>
  <div></div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useAccountStore } from "../../account/stores/accountStore";
import { useGoogleAuthenticationStore } from "../../google/stores/googleAuthenticationStore";
import { accountAction } from "../../account/stores/accountActions";

const accountStore = useAccountStore();
const googleAuthenticationStore = useGoogleAuthenticationStore();

const router = useRouter();
const route = useRoute();

const setRedirectGoogleData = async () => {
  const code = route.query.code;

  // ✅ 백엔드에서 accessToken, email, userId 받아오기
  const { accessToken, email, userId } = await googleAuthenticationStore.requestAccessToken({ code });

  // ✅ localStorage에 로그인 기본 정보 저장
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("email", email);
  localStorage.setItem("userId", userId);

  // ✅ userToken이 있다면 프로필 정보 확인
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    try {
      const res = await accountAction.requestProfileToDjango({ userToken });
      if (!res.data.gender || res.data.birthyear === 0) {
        router.push("/account/modify/modify-profile");
      } else {
        router.push("/account/mypage");
      }
    } catch (err) {
      console.error("프로필 정보 조회 실패:", err);
      alert("프로필 정보를 불러오는 데 실패했습니다.");
      router.push("/account/login");
    }
  } else {
    // ❌ userToken이 없다면 추가 정보 입력 페이지로 이동
    router.push("/account/modify/modify-profile");
  }
};

onMounted(() => {
  setRedirectGoogleData();
});
</script>
