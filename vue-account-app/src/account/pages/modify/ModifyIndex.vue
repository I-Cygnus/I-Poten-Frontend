<!-- /account/pages/modify/index.vue -->
<template>
  <v-container>
    <h1 class="text-h5 font-weight-bold mb-4">🧑 마이페이지</h1>

    <v-card class="pa-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <strong>닉네임:</strong> {{ profile.nickname || '로딩 중...' }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>성별:</strong> {{ profile.gender || '로딩 중...' }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>출생년도:</strong> {{ profile.birthyear || '로딩 중...' }}
          </v-col>
          <v-col cols="12" md="6">
            <strong>연령대:</strong> {{ profile.age_range || '로딩 중...' }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const profile = ref({
  nickname: "",
  gender: "",
  birthyear: "",
  age_range: "",
});

onMounted(async () => {
  const token = localStorage.getItem("userToken");

  if (!token) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const res = await axios.get("/account/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    profile.value = res.data;
  } catch (e) {
    console.error("프로필 정보를 불러오는 중 오류 발생", e);
  }
});
</script>
