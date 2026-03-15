<template>
  <div class="spinner-wrap" :class="{ fullscreen }" role="status" aria-live="polite">
    <div class="loading-container">
      <div class="loading-visual">
        <div class="pulse-circle"></div>
        <div class="spinning-ring"></div>
        <div class="center-dot"></div>
      </div>
      <div v-if="label" class="spinner-label">{{ label }}</div>
      <div class="spinner-sub-label">데이터를 안전하게 처리하고 있습니다</div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    fullscreen?: boolean;
  }>(),
  {
    label: "면접 결과를 분석 중입니다",
    fullscreen: true,
  }
);
</script>

<style scoped>
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
}

.spinner-wrap.fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-visual {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.spinning-ring {
  position: absolute;
  width: 80%;
  height: 80%;
  border: 3px solid transparent;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.center-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
}

.spinner-label {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.spinner-sub-label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.3); opacity: 0.2; }
}
</style>
