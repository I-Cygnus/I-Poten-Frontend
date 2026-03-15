<template>
  <div :style="chartWrapperStyle">
    <canvas ref="chartCanvas" :style="canvasStyle" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps<{
  scoreList: { type: string; score: number }[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let radarChart: Chart | null = null;

const chartWrapperStyle = {
  width: "100%",
  maxWidth: "360px",
  height: "280px",
  margin: "auto",
};

const canvasStyle = {
  width: "100%",
  height: "100%",
  display: "block",
};

const drawChart = () => {
  if (!chartCanvas.value || !props.scoreList?.length) return;

  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }

  radarChart = new Chart(chartCanvas.value, {
    type: "radar",
    data: {
      labels: props.scoreList.map((item) => item.type),
      datasets: [
        {
          data: props.scoreList.map((item) => item.score),
          fill: true,
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          borderColor: "#4F9CF9",
          borderWidth: 2,
          pointBackgroundColor: "#4F9CF9",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#10b981",
          pointHoverBorderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeInOutQuart",
      },
      layout: { padding: 8 },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: "#c0c0c0",
            font: { size: 9 },
            backdropColor: "transparent",
          },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          angleLines: { color: "rgba(0, 0, 0, 0.07)" },
          pointLabels: {
            font: { size: 12, weight: "600" },
            color: "#374151",
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          titleColor: "#ffffff",
          bodyColor: "rgba(255,255,255,0.75)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.raw}점 / 10점`,
          },
        },
      },
    },
  });
};

watch(() => props.scoreList, drawChart, { deep: true });
onMounted(() => drawChart());
onBeforeUnmount(() => {
  if (radarChart) radarChart.destroy();
});
</script>
