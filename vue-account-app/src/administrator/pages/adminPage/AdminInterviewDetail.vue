<!-- AdminInterviewDetail.vue — Level 3: 면접 상세 요약 -->
<template>
  <div>
    <!-- 뒤로 가기 -->
    <div class="mb-3">
      <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-arrow-left"
          :to="backRoute"
          class="text-none"
      >
        면접 이력
      </v-btn>
    </div>

    <!-- 로딩 상태 -->
    <v-card v-if="loading" variant="outlined" class="py-16">
      <div class="d-flex flex-column align-center ga-3">
        <v-progress-circular indeterminate size="28" width="2" />
        <div class="text-caption text-medium-emphasis">면접 상세를 불러오는 중…</div>
      </div>
    </v-card>

    <!-- 에러 상태 -->
    <v-card v-else-if="!detail" variant="outlined" class="pa-8">
      <div class="d-flex flex-column align-center ga-3">
        <v-icon color="medium-emphasis" size="36">mdi-alert-circle-outline</v-icon>
        <div class="text-body-1">면접 결과를 불러오지 못했습니다.</div>
        <div class="text-caption text-medium-emphasis">
          데이터가 삭제되었거나 권한이 없을 수 있습니다.
        </div>
        <v-btn
            class="mt-2"
            variant="tonal"
            size="small"
            :to="backRoute"
        >
          이력으로 돌아가기
        </v-btn>
      </div>
    </v-card>

    <template v-else>
      <!-- 헤더: 유형/상태 칩 + 제목 + PDF 액션 -->
      <div class="detail-head mb-4">
        <div class="d-flex align-center flex-wrap ga-2 mb-2">
          <v-chip
              :color="typeColor(detail.interviewType)"
              size="small"
              variant="tonal"
          >{{ typeLabel(detail.interviewType) }}</v-chip>
          <v-chip
              :color="statusColor(detail)"
              size="small"
              variant="tonal"
          >{{ detail.status || (detail.finished ? "분석 완료" : "진행 중") }}</v-chip>
          <v-spacer />
          <v-btn
              v-if="detail.pdfUrl"
              variant="outlined"
              size="small"
              prepend-icon="mdi-file-pdf-box"
              :href="detail.pdfUrl"
              target="_blank"
              rel="noopener"
          >
            PDF 열기
          </v-btn>
        </div>

        <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
          <div class="head-title-col">
            <div class="text-h5 font-weight-bold mb-1">{{ detail.title }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ detail.owner.nickname }}
              <span class="mx-1">·</span>
              {{ detail.owner.email }}
            </div>
          </div>

          <div class="score-block">
            <div class="score-label">종합 점수</div>
            <div class="score-value">
              {{ detail.finished && detail.totalScore > 0 ? detail.totalScore : "-" }}
              <span v-if="detail.finished && detail.totalScore > 0" class="score-unit">점</span>
            </div>
          </div>
        </div>

        <div class="meta-row mt-3">
          <span>{{ detail.role || "-" }}</span>
          <span class="sep">·</span>
          <span>진행 {{ formatDateTime(detail.createdAt) }}</span>
          <span v-if="detail.completedAt" class="sep">·</span>
          <span v-if="detail.completedAt">완료 {{ formatDateTime(detail.completedAt) }}</span>
          <span class="sep">·</span>
          <span>소요 {{ detail.durationMinutes || "-" }}분</span>
          <span class="sep">·</span>
          <span>문항 {{ detail.questionCount || detail.questions.length }}개</span>
        </div>

        <div v-if="detail.techKeywords.length > 0" class="keyword-row mt-3">
          <v-chip
              v-for="kw in detail.techKeywords"
              :key="kw"
              size="x-small"
              variant="tonal"
              color="primary"
          >{{ kw }}</v-chip>
        </div>
      </div>

      <!-- 종합 요약 -->
      <v-card variant="outlined" class="mb-4">
        <div class="pa-5">
          <div class="section-label mb-2">종합 요약</div>
          <p class="summary-text">
            {{ detail.summary || "요약이 제공되지 않았습니다." }}
          </p>
        </div>
      </v-card>

      <!-- 강점 / 개선점 2열 -->
      <div class="feedback-grid mb-5">
        <v-card variant="outlined">
          <div class="pa-5">
            <div class="section-label mb-3">강점</div>
            <ul v-if="detail.strengths.length > 0" class="bullet-list">
              <li v-for="(s, i) in detail.strengths" :key="i">{{ s }}</li>
            </ul>
            <div v-else class="text-body-2 text-medium-emphasis">
              기록된 강점이 없습니다.
            </div>
          </div>
        </v-card>

        <v-card variant="outlined">
          <div class="pa-5">
            <div class="section-label mb-3">개선점</div>
            <ul v-if="detail.improvements.length > 0" class="bullet-list">
              <li v-for="(s, i) in detail.improvements" :key="i">{{ s }}</li>
            </ul>
            <div v-else class="text-body-2 text-medium-emphasis">
              기록된 개선점이 없습니다.
            </div>
          </div>
        </v-card>
      </div>

      <!-- 문항별 분석 -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-subtitle-1 font-weight-bold">문항별 분석</div>
        <div class="text-caption text-medium-emphasis">
          총 {{ detail.questions.length }}문항
        </div>
      </div>

      <v-card
          v-if="detail.questions.length > 0"
          variant="outlined"
      >
        <v-expansion-panels
            v-model="openedPanels"
            variant="accordion"
            multiple
            class="question-panels"
        >
          <v-expansion-panel
              v-for="q in detail.questions"
              :key="q.id"
          >
            <v-expansion-panel-title class="question-title">
              <div class="d-flex align-center ga-3 w-100">
                <span class="question-order">Q{{ q.order }}</span>
                <span class="question-text">{{ q.question }}</span>
                <v-spacer />
                <span
                    v-if="q.score > 0"
                    class="question-score text-mono"
                    :class="scoreToneClass(q.score)"
                >{{ q.score }}점</span>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="qa-grid">
                <div class="qa-block">
                  <div class="qa-label">응답자 답변</div>
                  <p class="qa-body">{{ q.answer || "저장된 답변이 없습니다." }}</p>
                </div>
                <div class="qa-block">
                  <div class="qa-label">AI 피드백</div>
                  <p class="qa-body">{{ q.feedback || "피드백 데이터가 없습니다." }}</p>
                </div>
              </div>

              <div v-if="q.idealAnswer" class="qa-ideal mt-3">
                <div class="qa-label">이상적 답변</div>
                <p class="qa-body">{{ q.idealAnswer }}</p>
              </div>

              <div v-if="q.keywords.length > 0" class="mt-3 d-flex flex-wrap ga-1">
                <v-chip
                    v-for="kw in q.keywords"
                    :key="`${q.id}-${kw}`"
                    size="x-small"
                    variant="outlined"
                >{{ kw }}</v-chip>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>

      <v-card v-else variant="outlined" class="pa-8">
        <div class="d-flex flex-column align-center ga-1 text-medium-emphasis">
          <v-icon color="medium-emphasis" size="28">mdi-text-box-outline</v-icon>
          <div>문항 분석 데이터가 아직 없습니다.</div>
        </div>
      </v-card>

      <!-- TODO: 내부 메모 섹션 (향후 확장) -->

      <div class="d-flex justify-end mt-5">
        <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-arrow-left"
            :to="backRoute"
            class="text-none"
        >
          이력으로 돌아가기
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchInterviewDetail } from "@/administrator/service/interview/interviewService";
import {
  type AdminInterviewDetail,
  type InterviewType,
  INTERVIEW_TYPE_LABEL,
  INTERVIEW_TYPE_COLOR,
} from "@/administrator/service/interview/dto/interviewDto";

const route = useRoute();

const userId = computed(() => Number(route.params.userId ?? 0));
const interviewId = computed(() => Number(route.params.interviewId ?? 0));

const loading = ref(true);
const detail = ref<AdminInterviewDetail | null>(null);
const openedPanels = ref<number[]>([0]); // 첫 문항 기본 열림

const backRoute = computed(() => ({
  name: "AdminInterviewHistory",
  params: { userId: String(userId.value) },
}));

async function load() {
  if (!interviewId.value) {
    loading.value = false;
    detail.value = null;
    return;
  }
  loading.value = true;
  try {
    detail.value = await fetchInterviewDetail(interviewId.value);
  } finally {
    loading.value = false;
  }
}

watch(interviewId, load);
onMounted(load);

/* ── 렌더 유틸 ──────────────────────────────────────────────── */
function typeLabel(t: InterviewType) {
  return INTERVIEW_TYPE_LABEL[t] ?? t;
}
function typeColor(t: InterviewType) {
  return INTERVIEW_TYPE_COLOR[t] ?? "default";
}
function statusColor(d: AdminInterviewDetail) {
  if (!d.finished) return "warning";
  if (d.status === "피드백 확인 필요") return "warning";
  return "success";
}
function scoreToneClass(score: number) {
  if (score >= 85) return "score-excellent";
  if (score >= 70) return "score-good";
  return "score-caution";
}
function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
</script>

<style scoped>
.detail-head {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.head-title-col {
  flex: 1 1 320px;
  min-width: 0;
}

.score-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding-left: 16px;
}
.score-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
}
.score-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: rgba(0, 0, 0, 0.87);
}
.score-unit {
  font-size: 14px;
  font-weight: 700;
  margin-left: 2px;
  color: rgba(0, 0, 0, 0.6);
}

.meta-row {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.meta-row .sep {
  color: rgba(0, 0, 0, 0.3);
}

.keyword-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
}

.summary-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(0, 0, 0, 0.82);
  max-width: 72ch;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 860px) {
  .feedback-grid {
    grid-template-columns: 1fr;
  }
}

.bullet-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bullet-list li {
  position: relative;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(0, 0, 0, 0.82);
}
.bullet-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
}

.question-panels :deep(.v-expansion-panel-title) {
  padding: 16px 20px;
  min-height: 60px;
}
.question-panels :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 20px 20px 20px;
}

.question-order {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(0, 0, 0, 0.55);
  flex-shrink: 0;
}
.question-text {
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  text-align: left;
  line-height: 1.5;
}
.question-score {
  font-size: 13px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}
.score-excellent {
  background: rgba(46, 125, 50, 0.1);
  color: #2e7d32;
}
.score-good {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}
.score-caution {
  background: rgba(237, 108, 2, 0.1);
  color: #ed6c02;
}

.qa-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 720px) {
  .qa-grid {
    grid-template-columns: 1fr;
  }
}

.qa-block,
.qa-ideal {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 14px 16px;
}
.qa-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 6px;
}
.qa-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(0, 0, 0, 0.82);
  white-space: pre-wrap;
}

.text-mono {
  font-variant-numeric: tabular-nums;
}
</style>
