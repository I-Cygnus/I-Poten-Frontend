<!-- AdminInterviewHistory.vue — Level 2: 특정 유저의 면접 이력 -->
<template>
  <div>
    <!-- 뒤로 가기 -->
    <div class="mb-3">
      <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-arrow-left"
          :to="{ name: 'AdminInterviews' }"
          class="text-none"
      >
        회원 리스트
      </v-btn>
    </div>

    <!-- 제목 -->
    <div class="d-flex align-center flex-wrap ga-3 mb-4">
      <div class="text-h5 font-weight-bold">
        {{ user?.nickname ?? "—" }}
        <span class="text-body-2 text-medium-emphasis ml-2">
          {{ user?.email ? `(${user.email})` : "" }}
        </span>
      </div>
      <v-chip
          v-if="user?.role === 'ADMIN'"
          size="x-small"
          color="primary"
          variant="tonal"
      >ADMIN</v-chip>
    </div>

    <!-- 요약 스트립 -->
    <v-card variant="outlined" class="summary-strip mb-4">
      <div class="d-flex align-stretch">
        <div class="metric">
          <div class="metric-label">총 면접 수</div>
          <div class="metric-value">
            {{ summary ? `${summary.totalCount}회` : "-" }}
          </div>
        </div>
        <v-divider vertical />
        <div class="metric">
          <div class="metric-label">최근 면접</div>
          <div class="metric-value">
            {{ summary?.lastInterviewAt ? formatDate(summary.lastInterviewAt) : "-" }}
          </div>
        </div>
        <v-divider vertical />
        <div class="metric">
          <div class="metric-label">평균 점수</div>
          <div class="metric-value">
            {{ summary && summary.averageScore > 0 ? `${summary.averageScore}점` : "-" }}
          </div>
        </div>
        <v-divider vertical />
        <div class="metric">
          <div class="metric-label">가입일</div>
          <div class="metric-value">
            {{ user?.joinedAt ? formatDate(user.joinedAt) : "-" }}
          </div>
        </div>
      </div>
    </v-card>

    <!-- 필터 -->
    <div class="d-flex flex-wrap align-center ga-3 mb-4">
      <v-select
          v-model="selectedTypes"
          :items="typeItems"
          item-title="title"
          item-value="value"
          label="면접 유형"
          density="compact"
          variant="outlined"
          hide-details
          multiple
          chips
          closable-chips
          style="min-width: 200px; max-width: 320px"
      />
      <v-text-field
          v-model="startDate"
          type="date"
          label="시작일"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 170px"
      />
      <v-text-field
          v-model="endDate"
          type="date"
          label="종료일"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 170px"
      />
      <v-btn
          variant="text"
          size="small"
          :disabled="!hasActiveFilter"
          @click="resetFilters"
          class="ml-auto"
      >
        필터 초기화
      </v-btn>
    </div>

    <!-- 이력 테이블 -->
    <v-card variant="outlined">
      <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          item-value="interviewId"
          density="comfortable"
          :items-per-page="-1"
          hide-default-footer
          hover
          class="admin-history-table"
          no-data-text="진행한 면접 기록이 없습니다."
          loading-text="면접 이력을 불러오는 중…"
          @click:row="onRowClick"
      >
        <template #item.interviewType="{ item }">
          <v-chip
              :color="typeColor(item.interviewType)"
              size="x-small"
              variant="tonal"
          >{{ typeLabel(item.interviewType) }}</v-chip>
        </template>

        <template #item.title="{ item }">
          <span class="font-weight-medium">{{ item.title || "—" }}</span>
        </template>

        <template #item.createdAt="{ item }">
          <span class="text-medium-emphasis">{{ formatDateTime(item.createdAt) }}</span>
        </template>

        <template #item.durationMinutes="{ item }">
          <span class="text-medium-emphasis text-mono">
            {{ item.durationMinutes ? `${item.durationMinutes}분` : "-" }}
          </span>
        </template>

        <template #item.questionCount="{ item }">
          <span class="text-mono">{{ item.questionCount || 0 }}</span>
        </template>

        <template #item.totalScore="{ item }">
          <span class="text-mono font-weight-bold">
            {{ item.finished && item.totalScore > 0 ? `${item.totalScore}점` : "-" }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip
              :color="statusColor(item)"
              size="x-small"
              variant="tonal"
          >{{ item.status || (item.finished ? "분석 완료" : "진행 중") }}</v-chip>
        </template>

        <template #item.actions>
          <v-icon color="medium-emphasis" size="small">mdi-chevron-right</v-icon>
        </template>
      </v-data-table>

      <div
          v-if="hasNext"
          class="d-flex align-center justify-center px-4 py-3 border-t"
      >
        <v-btn
            variant="text"
            size="small"
            :loading="loadingMore"
            @click="loadMore"
        >
          더 불러오기
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchInterviewHistory } from "@/administrator/service/interview/interviewService";
import {
  type AdminInterviewHistoryItem,
  type InterviewType,
  INTERVIEW_TYPE_LABEL,
  INTERVIEW_TYPE_COLOR,
} from "@/administrator/service/interview/dto/interviewDto";

const route = useRoute();
const router = useRouter();

const userId = computed(() => Number(route.params.userId ?? 0));

const loading = ref(false);
const loadingMore = ref(false);
const user = ref<{
  id: number;
  email: string;
  nickname: string;
  role: "ADMIN" | "USER";
  joinedAt: string;
} | null>(null);
const summary = ref<{
  totalCount: number;
  lastInterviewAt: string | null;
  averageScore: number;
} | null>(null);
const items = ref<AdminInterviewHistoryItem[]>([]);
const hasNext = ref(false);
const lastCursor = ref<number | null>(null);

const selectedTypes = ref<InterviewType[]>([]);
const startDate = ref<string>("");
const endDate = ref<string>("");

const typeItems = [
  { title: "기술", value: "TECHNICAL" as InterviewType },
  { title: "인성", value: "PERSONAL" as InterviewType },
  { title: "기업", value: "COMPANY" as InterviewType },
  { title: "종합", value: "COMPREHENSIVE" as InterviewType },
];

const hasActiveFilter = computed(
    () =>
        selectedTypes.value.length > 0 ||
        !!startDate.value ||
        !!endDate.value
);

function resetFilters() {
  selectedTypes.value = [];
  startDate.value = "";
  endDate.value = "";
}

const headers = [
  { title: "유형", key: "interviewType", sortable: false, width: 80 },
  { title: "제목", key: "title", sortable: true },
  { title: "직무", key: "role", sortable: true, width: 140 },
  { title: "진행일", key: "createdAt", sortable: true, width: 160 },
  { title: "소요", key: "durationMinutes", align: "end" as const, sortable: true, width: 80 },
  { title: "문항", key: "questionCount", align: "end" as const, sortable: true, width: 70 },
  { title: "점수", key: "totalScore", align: "end" as const, sortable: true, width: 80 },
  { title: "상태", key: "status", sortable: false, width: 110 },
  { title: "", key: "actions", sortable: false, width: 40, align: "end" as const },
];

function buildRequestBase() {
  return {
    pageSize: 50,
    startDate: startDate.value || null,
    endDate: endDate.value || null,
    types: selectedTypes.value.length > 0 ? [...selectedTypes.value] : undefined,
  };
}

async function fetchInitial() {
  if (!userId.value) return;
  loading.value = true;
  try {
    const data = await fetchInterviewHistory(userId.value, {
      ...buildRequestBase(),
      lastInterviewId: null,
    });
    if (data) {
      user.value = data.user;
      summary.value = data.summary;
      items.value = data.items ?? [];
      hasNext.value = !!data.hasNext;
      lastCursor.value = data.nextCursor;
    } else {
      items.value = [];
      hasNext.value = false;
      lastCursor.value = null;
    }
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (!hasNext.value || loadingMore.value) return;
  loadingMore.value = true;
  try {
    const data = await fetchInterviewHistory(userId.value, {
      ...buildRequestBase(),
      lastInterviewId: lastCursor.value,
    });
    if (data) {
      items.value = [...items.value, ...(data.items ?? [])];
      hasNext.value = !!data.hasNext;
      lastCursor.value = data.nextCursor;
    }
  } finally {
    loadingMore.value = false;
  }
}

watch(
    [selectedTypes, startDate, endDate],
    () => {
      fetchInitial();
    },
    { deep: true }
);

onMounted(fetchInitial);

/* ── 렌더 유틸 ──────────────────────────────────────────────── */
function typeLabel(t: InterviewType) {
  return INTERVIEW_TYPE_LABEL[t] ?? t;
}
function typeColor(t: InterviewType) {
  return INTERVIEW_TYPE_COLOR[t] ?? "default";
}

function statusColor(item: AdminInterviewHistoryItem) {
  if (!item.finished) return "warning";
  if (item.status === "피드백 확인 필요") return "warning";
  return "success";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
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

function openDetail(interviewId: number) {
  router.push({
    name: "AdminInterviewDetail",
    params: {
      userId: String(userId.value),
      interviewId: String(interviewId),
    },
  });
}

function onRowClick(_event: Event, row: { item: AdminInterviewHistoryItem }) {
  openDetail(row.item.interviewId);
}
</script>

<style scoped>
.summary-strip {
  overflow: hidden;
}
.summary-strip .metric {
  flex: 1 1 0;
  min-width: 0;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-strip .metric-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
}
.summary-strip .metric-value {
  font-size: 18px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  font-variant-numeric: tabular-nums;
}

.admin-history-table :deep(thead th) {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
}
.admin-history-table :deep(tbody tr) {
  cursor: pointer;
}

.text-mono {
  font-variant-numeric: tabular-nums;
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

@media (max-width: 720px) {
  .summary-strip .d-flex {
    flex-wrap: wrap;
  }
  .summary-strip .metric {
    flex: 1 1 50%;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
}
</style>
