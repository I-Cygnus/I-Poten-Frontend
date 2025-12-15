<!--AdminLayout.vue -->
<template>
  <!-- 레이아웃: 상단 App Bar + 좌측 Drawer + 본문 -->
  <v-app-bar flat color="primary" density="comfortable">
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-toolbar-title class="font-weight-bold">Admin Console</v-toolbar-title>
    <v-spacer />
    <v-btn variant="text" @click="logout">로그아웃</v-btn>
  </v-app-bar>

  <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      @mouseenter="rail = false"
      @mouseleave="rail = true"
  >
    <v-list nav density="comfortable">
      <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="대시보드"
          :to="{ name: 'AdminOverview' }"
          link
      />
      <v-list-item
          prepend-icon="mdi-account-group"
          title="사용자 관리"
          :to="{ name: 'AdminUsers' }"
          link
      />
      <v-list-item
          prepend-icon="mdi-chair-rolling"
          title="스터디룸 신고 관리"
          :to="{ name: 'AdminStudyRoomReport' }"
          link
      />
      <v-list-item
          prepend-icon="mdi-aws"
          title="Aws 비용 관리"
          :to="{ name: 'AdminAwsCostExplorer' }"
          link
      />
      <v-list-item
          prepend-icon="mdi-robot-confused"
          title="OpenAi 비용 관리"
          :to="{ name: 'AdminOpenAiCostView' }"
          link
      />
    </v-list>

    <template #append>
      <v-divider />
      <div class="pa-2 text-caption">Admin Area</div>
    </template>
  </v-navigation-drawer>

  <v-main>
    <v-container class="py-6">
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {logoutRequest} from "@/administrator/utility/adminApi.ts";

const router = useRouter();
const drawer = ref(true);
const rail = ref(false);

const logout = async () => {
  try{
    await logoutRequest();
  }catch (e){
    console.warn("[logout] failed to logout : ",e);
  } finally {
    router.push("/");
  }
};
</script>

<style scoped>
/* 선택: 레이아웃 미세 보정 */
</style>
