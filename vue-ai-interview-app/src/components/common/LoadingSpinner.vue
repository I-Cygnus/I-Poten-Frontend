<template>
  <div class="spinner-wrap" :class="{ fullscreen }" role="status" aria-live="polite">
    <v-progress-circular indeterminate :size="size" :width="width" color="primary" />
    <div v-if="label" class="spinner-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    fullscreen?: boolean;
    size?: number;
    width?: number;
  }>(),
  {
    label: "로딩 중...",
    fullscreen: true,
    size: 44,
    width: 4,
  }
);
</script>

<style scoped>
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: rgba(15, 23, 42, 0.7);
}

.spinner-wrap.fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 9999;
}

.spinner-label {
  font-size: 14px;
  font-weight: 700;
}
</style>
