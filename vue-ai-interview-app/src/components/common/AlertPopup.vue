<template>
  <Teleport to="body">
    <div v-if="modelValue" class="alert-overlay" @click.self="emit('update:modelValue', false)">
      <div class="alert-box">
        <p class="alert-message">{{ message }}</p>
        <button class="alert-btn" @click="emit('update:modelValue', false)">확인</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  message: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 40px 28px;
  width: 360px;
  max-width: calc(100vw - 40px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  font-family: 'Pretendard', sans-serif;
  animation: pop-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alert-message {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

.alert-btn {
  width: 100%;
  padding: 13px 0;
  background: #111111;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Pretendard', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}

.alert-btn:hover {
  background: #333333;
}

@keyframes pop-in {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
