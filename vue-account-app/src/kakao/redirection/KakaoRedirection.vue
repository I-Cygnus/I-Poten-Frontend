<template>
  <div>우선 머라도</div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useAccountStore } from "../../account/stores/accountStore";
import { useKakaoAuthenticationStore } from "../../kakao/stores/kakaoAuthenticationStore";

const accountStore = useAccountStore();
const kakaoAuthenticationStore = useKakaoAuthenticationStore();

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const codeRaw = route.query.code
  const code = Array.isArray(codeRaw) ? codeRaw[0] : codeRaw
  console.log('[KakaoCallback] mounted, href=', location.href, 'code=', code)

  if (!code) return console.error('[KakaoCallback] code 없음')

  try {
    const userToken =await kakaoAuthenticationStore.requestAccessToken({ code }) // ← 객체로 전달
    console.log('[KakaoCallback] userToken=', userToken)
    localStorage.setItem('userToken', String(userToken))
    const token = localStorage.getItem('userToken') // ← 확인용
    console.log('[KakaoCallback] userToken 저장 완료')
    console.log('토큰 :' + token)
    kakaoAuthenticationStore.isAuthenticated = true
    window.location.replace('/');  
} catch (e) {
    console.error('[KakaoCallback] 실패:', e)
  }
})
</script>