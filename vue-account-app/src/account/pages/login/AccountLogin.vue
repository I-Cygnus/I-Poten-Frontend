<template>
  <!-- 좌상단 로고 -->



  <div class="w-full overflow-hidden flex items-center justify-center min-h-screen bg-white">


    <!-- 왼쪽 로그인 영역 -->

      <div :style="backgroundTextContainerStyle">
        <div :style="backgroundTextStyle">
          <span>JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · </span>
          <span>JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · </span>
        </div>
      </div>
      <!-- 컨테이너 전체 -->
      <div :style="loginBoxStyle" @mouseenter="Object.assign(loginBoxStyle, loginBoxHoverStyle)" @mouseleave="loginBoxStyle.boxShadow = '0 10px 30px rgba(31, 38, 135, 0.4)'">
        <div style="display: flex; justify-content: center; height: 100px; margin-bottom: 30px" @click="goHome">
          <img :src="logoBlack" :style="{ width: 'auto', height: '100%' }" alt="Logo" />
        </div>


        <!-- 상단 텍스트 -->
        <div :style="titleStyle">
          <span :style="titleSpanStyle">로그인</span>
        </div>
        <div :style="subtitleStyle">
          클릭 한번으로 Job-spoon과 함께 하세요
        </div>
        <div :style="subtitleLastStyle">
          클릭하여 <span :style="registerLinkStyle">간편 회원가입!</span>
        </div>
        <!-- 소셜 로그인 버튼 컨테이너 -->
        <div :style="buttonContainerStyle">
          <!-- Kakao Login Button -->
          <button :style="buttonContainerStyle">
            <img
                :src="kakaoBtn"
                alt="Kakao Login"
                :style="{
                    height: '73%',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '0.5rem',
                    transform: hoverKakao ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }"
                @mouseenter="hoverKakao = true"
                @mouseleave="hoverKakao = false"
                @click="() => goToPrivacyAgreementPage('KAKAO')"
            />
          </button>

          <!-- Naver Login Button -->

          <button :style="buttonContainerStyle">
            <img
                :src="naverBtn"
                alt="Naver Login"
                :style="{
                    height: '73%',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '0.5rem',
                    transform: hoverNaver ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }"
                @mouseenter="hoverNaver = true"
                @mouseleave="hoverNaver = false"
                @click="() => goToPrivacyAgreementPage('NAVER')"
            />
          </button>

          <!-- Google Login Button -->

          <button :style="buttonContainerStyle">
            <img
                :src="googleBtn"
                alt="Google Login"
                :style="{
                    height: '73%',
                    width: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '0.5rem',
                    transform: hoverGoogle ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    border: hoverGoogle
                      ? '1.5px solid rgba(0, 0, 0, 0.25)' // hover 시 조금 진하게
                      : '1px solid rgba(0, 0, 0, 0.15)',  // 기본은 아주 연하게
                  }"
                @mouseenter="hoverGoogle = true"
                @mouseleave="hoverGoogle = false"
                @click="() => goToPrivacyAgreementPage('GOOGLE')"
            />
          </button>


          <button :style="buttonContainerStyle2">
            <img
                :src="metaBtn"
                alt="Meta Login"
                :style="{
                    height: '35%',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '0.5rem',
                    transform: hoverMeta ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',

                  }"
                @mouseenter="hoverMeta = true"
                @mouseleave="hoverMeta = false"
                @click="() => goToPrivacyAgreementPage('META')"
            />
          </button>

          <!-- 관리자(GitHub) 버튼: Alt 키를 누를 때만 노출, 우상단에서 '빼꼼' -->
          <button
              v-show="altPressed"
              @click="goToAdminLogin"
              aria-label="관리자 로그인"
              title="관리자 로그인"
              class="absolute top-3 z-10 rounded-full shadow-lg border border-white/20 hover:scale-105 transition-transform focus:outline-none"
              style="
          right:-12px;               /* 컨테이너 밖으로 살짝(빼꼼) */
          width:48px;height:48px;
          background: white;
          display:flex;align-items:center;justify-content:center;
          opacity:0.95;
        "
          >
            <img :src="githubIcon" alt="" style="width:26px;height:26px;" />
          </button>




        </div>



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

import logoBlack from "@/assets/images/logo/jobspoonLOGO_black.png";
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
const loginBoxStyle = {
  width: '400px',
  height: '600px',
  paddingTop: '2.5rem',
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
}

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

// 텍스트 스타일
const titleStyle = {
  position: 'relative',
  zIndex: '10',
  fontSize: '32px',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
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


// 버튼 컨테이너 스타일
const buttonContainerStyle2 = {
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  // gap: '1rem',
  position: 'relative',
  marginTop: '1rem',
  zIndex: '10',
}

const buttonContainerStyle = {
  width: 'fit-content',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  // gap: '1rem',
  position: 'relative',
  zIndex: '10',
}

// 공통/버튼 스타일 (보존)
const btnCommon = {
  width: '100%',
  height: '50px',
  margin: '1.3vh auto',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  borderRadius: '1.4vh',
}

const guestBtnStyle = computed(() => ({
  ...btnCommon,
  backgroundColor: hoverGuest.value ? '#00c0ef' : '#00d0ff',
  color: 'white',
}))

const kakaoBtnStyle = computed(() => ({
  ...btnCommon,
  backgroundImage: `url('${kakaoBtn}')`,
  backgroundColor: hoverKakao.value ? '#f6db00' : '#ffea00',
  marginBottom: '1vh',
}))

const googleBtnStyle = computed(() => ({
  ...btnCommon,
  backgroundImage: `url('${googleBtn}')`,
  backgroundColor: hoverGoogle.value ? '#f7f7f7' : '#fff',
  marginBottom: '1vh',
}))

const naverBtnStyle = computed(() => ({
  ...btnCommon,
  backgroundImage: `url('${naverBtn}')`,
  backgroundColor: hoverNaver.value ? '#02b04f' : '#03c75a',
}))

const adminBtnStyle = computed(() => ({
  width: '70px',
  height: '50px',
  backgroundImage: `url('${githubIcon}')`,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  padding: 0,
  margin: '10px auto',
  display: 'block',
  minWidth: 0,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  filter: hoverAdmin.value ? 'brightness(0.9)' : 'none',
}))

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
