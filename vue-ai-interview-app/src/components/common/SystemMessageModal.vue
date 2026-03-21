<template>
  <Teleport to="body">
    <div v-if="open" class="scrim" @click="handleScrimClick">
      <div class="sheet" :class="[size]" role="dialog" aria-modal="true" @click.stop>
        <div class="sheet-header">
          <button v-if="closeOnScrim" class="close-x" @click="onClose">×</button>
          <span class="icon-box" :style="iconBoxStyle">
            <slot name="icon">
              <svg v-if="tone === 'info'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="9" stroke-width="2" />
                <path d="M12 10v5" stroke-width="2" stroke-linecap="round" />
                <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
              </svg>
              <svg v-else-if="tone === 'success'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
                <path d="M20 6L9 17L4 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="tone === 'warning'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
                <path d="M12 9v4M12 17h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="tone === 'error'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
                <path d="M12 8v4M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </slot>
          </span>
          <div class="title-wrap">
            <h3>{{ title }}</h3>
          </div>
        </div>

        <div class="sheet-body">
          <div class="plain-body">
            <slot>{{ description }}</slot>
          </div>
        </div>

        <div class="sheet-footer">
          <slot name="footer">
            <button class="btn ghost" @click="onClose">닫기</button>
            <button v-if="primaryLabel" class="btn primary" @click="onPrimaryClick">{{ primaryLabel }}</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  open: boolean;
  tone?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  primaryLabel?: string;
  size?: 'default' | 'wide';
  closeOnScrim?: boolean;
}>(), {
  tone: 'info',
  size: 'default',
  closeOnScrim: true
});

const emit = defineEmits(['close', 'primary']);

const onClose = () => emit('close');
const onPrimaryClick = () => emit('primary');

const handleScrimClick = () => {
  if (props.closeOnScrim) onClose();
};

const TONE_COLORS = {
  info: "#3E63E0",
  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",
};

const TONE_BG_COLORS = {
  info: "rgba(62, 99, 224, 0.06)",
  success: "rgba(16, 185, 129, 0.06)",
  warning: "rgba(234, 179, 8, 0.06)",
  error: "rgba(239, 68, 68, 0.06)",
};

const iconBoxStyle = computed(() => ({
  color: TONE_COLORS[props.tone],
  backgroundColor: TONE_BG_COLORS[props.tone],
}));
</script>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: saturate(120%) blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet {
  display: inline-flex;
  flex-direction: column;
  width: auto;
  min-width: 320px;
  max-width: min(480px, calc(100% - 32px));
  max-height: min(80vh, calc(100vh - 48px));
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  animation: slide-up 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet.wide {
  max-width: min(720px, calc(100% - 32px));
}

.sheet-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
}

.close-x {
  position: absolute;
  top: 10px;
  right: 10px;
  border: 0;
  background: transparent;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 18px;
  color: #9ca3af;
  transition: background 0.12s ease, color 0.12s ease;
}

.close-x:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.icon-box {
  position: relative;
  margin-bottom: 6px;
  flex: 0 0 auto;
  width: 76px;
  height: 76px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  animation: icon-pop 0.38s ease-out;
}

.icon-box::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid currentColor;
  opacity: 0;
  pointer-events: none;
  animation: icon-ring 0.6s ease-out 0.1s forwards;
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  text-align: center;
  align-items: center;
}

.title-wrap h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: #111827;
  font-weight: 700;
}

.sheet-body {
  padding: 0 22px 20px;
  overflow: auto;
}

.plain-body {
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-wrap;
  text-align: center;
}

.sheet-footer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  padding: 18px 22px 22px;
}

.btn {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.ghost:hover {
  background: #f9fafb;
}

.btn.primary {
  border-color: #3e63e0;
  background: #4f76f1;
  color: #ffffff;
}

.btn.primary:hover {
  background: #3e63e0;
  filter: brightness(0.96);
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes icon-pop {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
}

@keyframes icon-ring {
  0%   { transform: scale(1);   opacity: 0.45; }
  100% { transform: scale(1.5); opacity: 0; }
}
</style>
