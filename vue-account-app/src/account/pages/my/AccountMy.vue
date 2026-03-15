<template>
  <v-container :style="containerStyle">
    <div :style="idCardContainerStyle">
      <v-card :style="idCardStyle" class="id-card mx-auto">
        <!-- <div :style="companyNameStyle">JOBSTICK</div> -->
        <v-avatar size="120px" class="mt-8 avatar-margin">
          <v-img :src="imageSrc"></v-img>
        </v-avatar>

        <v-card-text>
          <h2 :style="nicknameStyle">
            {{ nickname }}
          </h2>

          <v-divider class="my-3"></v-divider>
          <v-row :style="myInfoStyle">
            <v-col cols="12">
              <v-icon>{{
                gender === "male" ? "mdi-gender-male" : "mdi-gender-female"
              }}</v-icon>
              <span style="margin-left: 4px">{{
                gender === "male" ? "남성" : "여성"
              }}</span>
              &nbsp;&nbsp;&nbsp;
              <v-icon>mdi-calendar</v-icon>
              <span style="margin-left: 4px">{{ birthyear }}</span>
              &nbsp;&nbsp;&nbsp;
              <v-icon>mdi-email</v-icon>
              <span class="subtitle-1">{{ email }}</span>
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="6">
              <v-btn
                :style="updateBtnStyle"
                @click="router.push('/account/modify/modify-profile')"
              >
                프로필 수정
              </v-btn>
            </v-col>

            <v-col cols="6">
              <button
                :style="deleteBtnStyle"
                type="button"
                @click="$router.push({ name: 'AccountWithdrawPage' })"
              >
                <span :style="deleteBtnTextStyle">탈퇴하기</span>
                <span :style="deleteBtnIconStyle">
                  <!-- SVG 부분은 그대로 유지 -->
                  <svg
                    class="svg"
                    height="512"
                    viewBox="0 0 512 512"
                    width="512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title></title>
                    <path
                      d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320"
                      style="fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"
                    ></path>
                    <line
                      style="stroke: #fff; stroke-linecap: round; stroke-miterlimit: 10; stroke-width: 32px;"
                      x1="80"
                      x2="432"
                      y1="112"
                      y2="112"
                    ></line>
                    <path
                      d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40"
                      style="fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"
                    ></path>
                    <line
                      style="fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"
                      x1="256"
                      x2="256"
                      y1="176"
                      y2="400"
                    ></line>
                    <line
                      style="fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"
                      x1="184"
                      x2="192"
                      y1="176"
                      y2="400"
                    ></line>
                    <line
                      style="fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"
                      x1="328"
                      x2="320"
                      y1="176"
                      y2="400"
                    ></line>
                  </svg>
                </span>
              </button>
            </v-col>

            <!-- 홈으로 가기 버튼 -->
            <v-col cols="12" class="mt-4">
              <v-btn
                :style="goHomeBtnStyle"
                block
                @click="router.push('/')"
              >
                🏠 홈으로 가기
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAccountStore } from "../../stores/accountStore";
import profileImg from "@/assets/images/fixed/profile_img.png";
import { useRouter } from "vue-router";
import { useHead } from '@vueuse/head'

// SEO meta는 동일하게 사용
useHead({
  title: "내 정보 | I-Poten",
  meta: [
    { name: "description", content: "내 계정 정보를 확인하고 수정할 수 있는 페이지입니다." },
    { name: "keywords", content: "내 정보, 계정, 프로필, JobStick, 개발자 플랫폼, 개발자 취업, 모의 면접, AI 면접" },
    { property: "og:title", content: "내 정보 - 잡스틱(JobStcik)" },
    { property: "og:description", content: "잡스틱(JobStick)에서 내 계정 정보를 안전하게 확인하고 관리하세요." },
    { property: "og:image", content: "" }
  ]
})

const imageSrc = profileImg;
const email = ref("");
const nickname = ref("");
const gender = ref("");
const birthyear = ref(0);
const menuOpen = ref(false);

const accountStore = useAccountStore();
const router = useRouter();

onMounted(async () => {
  const storedUserToken = localStorage.getItem("userToken");
  if (!storedUserToken) {
    console.warn("userToken이 없습니다.");
  }

  try {
    const userInfo = await accountStore.requestProfileToDjango({
      email: "",
      nickname: "",
      gender: "",
      birthyear: 0,
    });

    email.value = userInfo.data.email;
    nickname.value = userInfo.data.nickname;
    gender.value = userInfo.data.gender;
    birthyear.value = userInfo.data.birthyear;
  } catch (error) {
    console.error("사용자 정보 로딩 실패:", error);
  }
});

function onClickAccountWithdraw() {
  router.push({ name: "AccountWithdrawPage" });
}
function showMenu() { menuOpen.value = true; }
function hideMenu() { menuOpen.value = false; }

// 스타일 computed
const containerStyle = computed(() => ({
  minHeight: '100vh',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
}))

const idCardContainerStyle = computed(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '60px',
}))

const idCardStyle = computed(() => ({
  position: 'relative',
  width: '436px',
  height: 'auto',
  overflow: 'hidden',
  textAlign: 'center',
  padding: '20px',
  color: 'black',
  backgroundColor: 'white',
  border: '2px solid white',
  borderRadius: '32px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
}))

const nicknameStyle = {
  marginTop: '24px',
  marginBottom: '16px',
  fontWeight: 700,
  fontSize: '1.25rem',
}

const myInfoStyle = {
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#d7dbec',
  border: '1px solid #D7DBEC',
  borderRadius: '12px',
  marginBottom: '40px',
}

// 프로필 수정 버튼
const updateBtnStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'white',
  border: '1px solid lightgray',
  borderRadius: '12px',
  color: 'black',
  marginLeft: '20%',
}

// 탈퇴 버튼 스타일
const deleteBtnStyle = {
  position: 'relative',
  borderRadius: '12px',
  width: '120px',
  height: '36px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #cc0000',
  backgroundColor: '#e50000',
  overflow: 'hidden',
  transition: 'all 0.3s',
}

const deleteBtnTextStyle = {
  transform: 'translateX(25px)',
  color: '#fff',
  fontWeight: 600,
  transition: 'all 0.3s',
}

const deleteBtnIconStyle = {
  position: 'absolute',
  transform: 'translateX(95px)',
  height: '100%',
  width: '20px',
  backgroundColor: '#cc0000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s',
}

// 홈으로 가기 버튼 스타일
const goHomeBtnStyle = {
  background: 'linear-gradient(135deg, #4a90e2, #007aff)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  borderRadius: '16px',
  padding: '12px 20px',
  transition: 'all 0.3s ease',
  boxShadow: '0 6px 12px rgba(0, 122, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
</script>

<!-- 기존 style 태그는 삭제하거나 비워도 됩니다 -->
<style scoped>
</style>
