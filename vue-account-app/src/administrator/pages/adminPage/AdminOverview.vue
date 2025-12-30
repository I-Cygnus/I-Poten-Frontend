<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-h5 font-weight-bold">대시보드</div>
      <div class="text-caption text-medium-emphasis">Admin Overview</div>
    </div>

    <v-row dense>
      <v-col cols="12" md="4">
        <v-card class="pa-4" variant="outlined">
          <div class="text-caption text-medium-emphasis">총 사용자</div>
          <div class="text-h4 font-weight-bold mt-1">-</div>
          <div class="text-caption mt-2">데이터 연동 전</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" variant="outlined">
          <div class="text-caption text-medium-emphasis">오늘 가입</div>
          <div class="text-h4 font-weight-bold mt-1">-</div>
          <div class="text-caption mt-2">데이터 연동 전</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" variant="outlined">
          <div class="text-caption text-medium-emphasis">신고 대기</div>
          <div class="text-h4 font-weight-bold mt-1">-</div>
          <div class="text-caption mt-2">데이터 연동 전</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-4" variant="outlined">
      <v-card-title class="font-weight-bold">안내</v-card-title>
      <v-card-text>
        <div class="text-body-2 text-medium-emphasis">
          이 화면은 관리자 페이지 기본 대시보드입니다. 현재 파일이 비어있어 빌드가 실패하던 문제를
          해결하기 위해 최소 UI로 복구되어 있습니다.
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts"></script>
