<template>
  <div class="w-full overflow-hidden flex items-center justify-center min-h-screen bg-white">

    <!-- 배경 텍스트 애니메이션 -->
    <div :style="backgroundTextContainerStyle">
      <div :style="backgroundTextStyle">
        <span> I-POTEN · I-POTEN · I-POTEN · I-POTEN · I-POTEN· I-POTEN · I-POTEN · I-POTEN · </span>
        <span> I-POTEN · I-POTEN · I-POTEN · I-POTEN · I-POTEN· I-POTEN · I-POTEN · I-POTEN · </span>
      </div>
    </div>

    <!-- 로그인 카드 -->
    <div :style="loginBoxStyle" @mouseenter="Object.assign(loginBoxStyle, loginBoxHoverStyle)" @mouseleave="loginBoxStyle.boxShadow = '0 10px 30px rgba(31, 38, 135, 0.4)'">

      <!-- 로고 -->
      <div :style="logoWrapStyle" @click="goHome">
        <img :src="logoBlack" :style="logoImgStyle" alt="I-Poten Logo" />
      </div>

      <!-- 타이틀 -->
      <div :style="titleStyle">
        <span :style="titleSpanStyle">로그인</span>
      </div>
      <div :style="subtitleStyle">클릭 한번으로 I-Poten과 함께 하세요</div>
      <div :style="subtitleLastStyle">
        클릭하여 <span :style="registerLinkStyle">간편 회원가입!</span>
      </div>

      <!-- 소셜 로그인 버튼들 -->
      <div :style="socialBtnGroupStyle">

        <!-- 카카오 -->
        <button
            :style="kakaoBtnNewStyle"
            @mouseenter="hoverKakao = true"
            @mouseleave="hoverKakao = false"
            @click="() => goToPrivacyAgreementPage('KAKAO')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C5.029 2 1 5.134 1 8.998c0 2.467 1.632 4.632 4.093 5.862l-.698 2.588c-.058.215.188.384.378.26l3.1-2.07c.7.1 1.418.156 2.127.156 4.971 0 9-3.134 9-6.996S14.971 2 10 2z" fill="#181600"/>
          </svg>
          <span>카카오로 시작하기</span>
        </button>

        <!-- 네이버 -->
        <button
            :style="naverBtnNewStyle"
            @mouseenter="hoverNaver = true"
            @mouseleave="hoverNaver = false"
            @click="() => goToPrivacyAgreementPage('NAVER')"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M12.194 9.57L5.553 0H0v18h5.806V8.43L12.447 18H18V0h-5.806v9.57z" fill="#fff"/>
          </svg>
          <span>네이버로 시작하기</span>
        </button>

        <!-- 구글 -->
        <button
            :style="googleBtnNewStyle"
            @mouseenter="hoverGoogle = true"
            @mouseleave="hoverGoogle = false"
            @click="() => goToPrivacyAgreementPage('GOOGLE')"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Google로 시작하기</span>
        </button>

        <!-- Meta -->
        <button
            :style="metaBtnNewStyle"
            @mouseenter="hoverMeta = true"
            @mouseleave="hoverMeta = false"
            @click="() => goToPrivacyAgreementPage('META')"
        >
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
            <path d="M8.143 12.475c-1.573 2.352-2.476 5.358-2.476 7.774 0 3.578 1.588 5.755 4.216 5.755 1.438 0 2.95-.916 4.57-3.16.962-1.333 1.974-3.108 2.713-4.285l1.395-2.216c.978-1.555 2.11-3.283 3.39-4.694C23.534 9.908 25.254 9 26.95 9c3.086 0 5.832 2.402 7.17 6.106.957 2.654 1.453 5.757 1.453 9.102 0 2.1-.35 3.683-1.058 4.805C33.854 30.05 32.68 30.5 31.2 30.5v-3.5c1.723 0 1.91-1.94 1.91-3.25 0-2.85-.408-5.553-1.19-7.84-.92-2.694-2.594-4.41-4.571-4.41-1.34 0-2.735 1.06-4.233 3.148-.795 1.107-1.595 2.455-2.496 4.015l-1.072 1.853c-1.942 3.352-2.618 4.366-3.616 5.663C14.04 28.682 12.266 30 9.883 30 6.7 30 4.167 27.7 3.173 24.1c-.49-1.778-.74-3.78-.74-5.805 0-3.1 1.05-6.576 3.04-9.6l2.67 3.78z" fill="#fff"/>
          </svg>
          <span>Meta로 시작하기</span>
        </button>

      </div>

      <!-- 관리자(GitHub) 버튼: Alt 키를 누를 때만 노출 -->
      <button
          v-show="altPressed"
          @click="goToAdminLogin"
          aria-label="관리자 로그인"
          title="관리자 로그인"
          :style="adminFloatStyle"
      >
        <img :src="githubIcon" alt="" style="width:22px;height:22px;" />
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, reactive} from 'vue'
import { useRouter } from 'vue-router'
import { useGuestAuthenticationStore } from '../../../guest/stores/guestAuthenticationStore'
import { useHead } from '@vueuse/head' // 필요 시 SEO 메타 사용
import '../../../assets/tailwind.css'

// 이미지/리소스

import logoBlack from "@/assets/images/logo/Logo2.png";
import kakaoBtn from '@/assets/images/fixed/btn_login_kakao.png'
import googleBtn from '@/assets/images/fixed/btn_login_google.png'
import naverBtn from '@/assets/images/fixed/btn_login_naver.png'
import githubIcon from '@/assets/images/fixed/icon-github.svg'
import metaBtn from '@/assets/images/fixed/MetaLogin2.png'

// 액션/스토어
import { kakaoAuthenticationAction as kakaoAuthentication } from '@/kakao/stores/kakaoAuthenticationActions'
import {metaAuthenticationAction} from "@/meta/stores/metaAuthenticationActions.ts";
import {naverAuthenticationAction} from "@/naver/stores/naverAuthenticationActions.ts";
import {googleAuthenticationAction} from "@/google/stores/googleAuthenticationActions.ts";



// 라우터/스토어
const router = useRouter()
const guestAuthentication = useGuestAuthenticationStore()

// 폼 상태
const email = ref('')
const password = ref('')
const remember = ref(false)

// hover 상태 (보존)
const hoverGuest = ref(false)
const hoverKakao = ref(false)
const hoverGoogle = ref(false)
const hoverMeta = ref(false)
const hoverNaver = ref(false)
const hoverAdmin = ref(false)

// 로그인 박스 스타일
const loginBoxStyle = reactive({
  width: '100%',
  maxWidth: '420px',
  height: 'auto',
  paddingTop: '2.5rem',
  paddingLeft: '2rem',
  paddingRight: '2rem',
  paddingBottom: '2.5rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '1.5rem',
  background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 10px 30px rgba(31, 38, 135, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s',
  position: 'relative',
  overflow: 'hidden',
  margin: '0 16px',
  boxSizing: 'border-box',
})

const loginBoxHoverStyle = {
  boxShadow: '0 15px 35px rgba(31, 38, 135, 0.45)'
}

const highlightStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '33.333333%',
  background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
  opacity: '0.2',
  transform: 'skewY(-12deg)',
}

const decorCircleTopStyle = {
  position: 'absolute',
  top: '-50px',
  right: '-50px',
  width: '100px',
  height: '100px',
  borderRadius: '9999px',
  background: 'linear-gradient(to bottom right, rgba(96, 165, 250, 0.2), rgba(168, 85, 247, 0.2))',
  filter: 'blur(24px)',
}

const decorCircleBottomStyle = {
  position: 'absolute',
  bottom: '-30px',
  left: '-30px',
  width: '80px',
  height: '80px',
  borderRadius: '9999px',
  background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
  filter: 'blur(16px)',
}

// 로고 스타일
const logoWrapStyle = {
  display: 'flex',
  justifyContent: 'center',
  cursor: 'pointer',
  marginBottom: '16px',
}

const logoImgStyle = {
  width: 'auto',
  height: '52px',
}

// 텍스트 스타일
const titleStyle = {
  position: 'relative',
  zIndex: '10',
  fontSize: '32px',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  marginTop: '1.5rem',
  color: '#1f2937',
}

const titleSpanStyle = {
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  backgroundImage: 'linear-gradient(to right, #4F9CF9, #10B981)',
}

const subtitleStyle = {
  position: 'relative',
  zIndex: '10',
  color: '#4b5563',
  fontSize: '0.875rem',
  marginBottom: '0.25rem',
}

const subtitleLastStyle = {
  position: 'relative',
  zIndex: '10',
  color: '#4b5563',
  fontSize: '0.875rem',
  marginBottom: '2rem',
}

const registerLinkStyle = {
  color: '#2CADB1',
  fontWeight: '500',
}



const backgroundTextContainerStyle = reactive({
  position: 'fixed',
  top: '65%',
  left: '0',
  width: '100%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  zIndex: '0',
  overflow: 'hidden',
})

const backgroundTextStyle = reactive({
  display: 'flex',
  whiteSpace: 'nowrap',
  fontSize: 'clamp(70px, 10vw, 120px)',
  fontWeight: '900',
  color: 'rgba(200, 230, 255, 0.35)',
  letterSpacing: '0.1em',
  transition: 'opacity 0.3s ease',
  transform: 'translateX(0)',
})

let offset = 0
onMounted(() => {
  const animate = () => {
    offset -= 0.3 // 속도 조절 가능
    backgroundTextStyle.transform = `translateX(${offset}px)`
    if (offset < -window.innerWidth) offset = 0 // 반복
    requestAnimationFrame(animate)
  }
  animate()
})


// 소셜 버튼 공통 스타일
const socialBtnGroupStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  position: 'relative',
  zIndex: '10',
}

const socialBtnBase = {
  width: 'clamp(240px, 85%, 300px)',
  height: 'clamp(46px, 7vw, 56px)',
  margin: '0 auto',
  border: 'none',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  cursor: 'pointer',
  fontSize: 'clamp(12px, 1.4vw, 13px)',
  fontWeight: '700',
  letterSpacing: '-0.02em',
  transition: 'all 0.2s ease',
  outline: 'none',
  fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
}

const kakaoBtnNewStyle = computed(() => ({
  ...socialBtnBase,
  background: hoverKakao.value ? '#F5DC00' : '#FEE500',
  color: '#191919',
  boxShadow: hoverKakao.value
    ? '0 6px 20px rgba(254, 229, 0, 0.4)'
    : '0 2px 8px rgba(254, 229, 0, 0.25)',
  transform: hoverKakao.value ? 'translateY(-2px)' : 'translateY(0)',
}))

const naverBtnNewStyle = computed(() => ({
  ...socialBtnBase,
  background: hoverNaver.value ? '#00B843' : '#03C75A',
  color: '#ffffff',
  boxShadow: hoverNaver.value
    ? '0 6px 20px rgba(3, 199, 90, 0.4)'
    : '0 2px 8px rgba(3, 199, 90, 0.25)',
  transform: hoverNaver.value ? 'translateY(-2px)' : 'translateY(0)',
}))

const googleBtnNewStyle = computed(() => ({
  ...socialBtnBase,
  background: hoverGoogle.value ? '#f5f5f5' : '#ffffff',
  color: '#3c4043',
  border: '1px solid ' + (hoverGoogle.value ? '#d0d0d0' : '#dadce0'),
  boxShadow: hoverGoogle.value
    ? '0 6px 20px rgba(0, 0, 0, 0.1)'
    : '0 1px 4px rgba(0, 0, 0, 0.08)',
  transform: hoverGoogle.value ? 'translateY(-2px)' : 'translateY(0)',
}))

const metaBtnNewStyle = computed(() => ({
  ...socialBtnBase,
  background: hoverMeta.value
    ? 'linear-gradient(135deg, #0062E0 0%, #19AFFF 100%)'
    : 'linear-gradient(135deg, #0081FB 0%, #19AFFF 100%)',
  color: '#ffffff',
  boxShadow: hoverMeta.value
    ? '0 6px 20px rgba(0, 129, 251, 0.4)'
    : '0 2px 8px rgba(0, 129, 251, 0.25)',
  transform: hoverMeta.value ? 'translateY(-2px)' : 'translateY(0)',
}))

const adminFloatStyle = {
  position: 'absolute',
  top: '12px',
  right: '-12px',
  width: '44px',
  height: '44px',
  borderRadius: '999px',
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: '10',
  transition: 'transform 0.15s ease',
}

// Alt 키 감지 상태
const altPressed = ref(false)
function onKeyDown(e: KeyboardEvent) {
  if (e.altKey) altPressed.value = true
}
function onKeyUp(e: KeyboardEvent) {
  if (!e.altKey) altPressed.value = false
}
function onBlur() {
  altPressed.value = false
}
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', onBlur)
})

// 네비게이션/액션
function goHome() {
  window.location.href = '/'
}

function triggerSocialLogin() {
  alert('준비중입니다 소셜 로그인을 이용해주세요')
  console.log('로그인 버튼 클릭')
}

const goToPrivacyAgreementPage = async (loginType: string) => {
  sessionStorage.setItem('tempLoginType', loginType)
  if(loginType === 'KAKAO') {
    await kakaoAuthentication.requestKakaoLoginToSpring(router)
  } else if (loginType === 'META') {
    await metaAuthenticationAction.requestMetaLoginToSpring(router)
  } else if (loginType === 'NAVER') {
    await naverAuthenticationAction.requestNaverLoginToSpring(router)
  } else if (loginType === 'GOOGLE') {
    await googleAuthenticationAction.requestGoogleLoginToSpring(router)
  }

  // 필요 시: router.push('/account/privacy')
}

const handleGuestLogin = async () => {
  try {
    localStorage.setItem('loginType', 'GUEST')
    const userToken = await guestAuthentication.requestGuestLoginToDjango()
    localStorage.setItem('userToken', userToken)
    router.push('/')
  } catch (error) {
    console.error('게스트 로그인 실패:', error)
    alert('게스트 로그인에 실패했습니다.')
  }
}

// 관리자 코드 입력 페이지로 이동
const goToAdminLogin = () => {
  // Alt 키와 함께 클릭했을 때만 허용하고 싶다면 아래처럼 가드 추가 가능
  // if (!altPressed.value) return;
  router.push('/account/admin-code')
}
</script>
