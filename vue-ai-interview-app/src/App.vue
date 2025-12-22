<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
import { provide } from "vue";

const props = defineProps<{ eventBus?: any }>();

if (props.eventBus) {
  provide("eventBus", props.eventBus);
}
</script>
