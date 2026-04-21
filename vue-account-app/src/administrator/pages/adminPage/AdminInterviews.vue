<!-- AdminInterviews.vue — Level 1: 면접 기록 보유 회원 리스트 -->
<template>
  <div>
    <!-- 페이지 헤더 -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-h5 font-weight-bold">면접 결과 조회</div>

      <v-select
          v-model="size"
          :items="[30, 50, 70]"
          density="compact"
          hide-details
          style="max-width: 110px"
          label="페이지 단위"
      />
    </div>

    <!-- 필터 행: 검색 | 유형 | 기간 | 초기화 -->
    <div class="filters d-flex flex-wrap align-center ga-3 mb-4">
      <v-text-field
          v-model="searchInput"
          placeholder="이메일, 닉네임으로 검색"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="filter-search"
      />

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

    <!-- 결과 테이블 -->
    <v-card variant="outlined">
      <v-table density="comfortable" class="admin-interview-table">
        <thead>
        <tr>
          <th class="text-start">이메일</th>
          <th class="text-start">닉네임</th>
          <th class="text-start">가입일</th>
          <th class="text-end text-right-col">면접 수</th>
          <th class="text-start">최근 면접</th>
          <th class="text-start">유형</th>
          <th class="text-end">&nbsp;</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="u in currentItems"
            :key="u.id"
            class="admin-interview-row"
            @click="openHistory(u.id)"
        >
          <td>{{ u.email }}</td>
          <td>{{ u.nickname }}</td>
          <td class="text-medium-emphasis">{{ formatDate(u.joinedAt) }}</td>
          <td class="text-end text-right-col font-weight-bold">{{ u.interviewCount }}</td>
          <td class="text-medium-emphasis">{{ formatDateTime(u.lastInterviewAt) }}</td>
          <td>
              <span class="type-chip-row">
                <v-chip
                    v-for="t in u.interviewTypes.slice(0, 3)"
                    :key="t"
                    :color="typeColor(t)"
                    size="x-small"
                    variant="tonal"
                    class="mr-1"
                >{{ typeLabel(t) }}</v-chip>
                <span
                    v-if="u.interviewTypes.length > 3"
                    class="text-caption text-medium-emphasis"
                >+{{ u.interviewTypes.length - 3 }}</span>
              </span>
          </td>
          <td class="text-end">
            <v-icon color="medium-emphasis" size="small">mdi-chevron-right</v-icon>
          </td>
        </tr>

        <tr v-if="!loading && currentItems.length === 0">
          <td colspan="7" class="text-medium-emphasis text-center py-8">
            <div class="d-flex flex-column align-center ga-1">
              <v-icon color="medium-emphasis" size="32">mdi-inbox-outline</v-icon>
              <div>{{ emptyMessage }}</div>
            </div>
          </td>
        </tr>
        </tbody>
      </v-table>

      <!-- 페이징 바 -->
      <div class="d-flex align-center justify-space-between px-4 py-3">
        <div class="text-caption text-medium-emphasis">
          페이지 {{ pageIndex + 1 }} / {{ totalPages }}
          <span v-if="currentPage"> · pageSize={{ currentPage.pageSize }}</span>
        </div>

        <div class="d-flex align-center ga-2">
          <v-btn
              icon="mdi-chevron-left"
              variant="text"
              size="small"
              :disabled="pageIndex === 0 || loading"
              @click="goPrev"
              aria-label="이전 페이지"
          />
          <v-btn
              icon="mdi-chevron-right"
              variant="text"
              size="small"
              :disabled="(isAtFinalPage && !(currentPage && currentPage.hasNext)) || loading || currentItems.length === 0"
              @click="goNext"
              aria-label="다음 페이지"
          />
          <v-progress-circular v-if="loading" indeterminate size="18" width="2" />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import {
  fetchInterviewUserList,
} from "@/administrator/service/interview/interviewService";
import {
  type AdminInterviewUsersResponse,
  type InterviewType,
  INTERVIEW_TYPE_LABEL,
  INTERVIEW_TYPE_COLOR,
} from "@/administrator/service/interview/dto/interviewDto";

const router = useRouter();

type PageCache = AdminInterviewUsersResponse;

/* ── 필터 상태 ─────────────────────────────────────────────── */
const size = ref(30);
const searchInput = ref("");          // 즉시 바인딩되는 입력값
const searchQuery = ref("");          // debounce 후 실제 쿼리에 반영되는 값
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
        !!searchInput.value ||
        selectedTypes.value.length > 0 ||
        !!startDate.value ||
        !!endDate.value
);

function resetFilters() {
  searchInput.value = "";
  searchQuery.value = "";
  selectedTypes.value = [];
  startDate.value = "";
  endDate.value = "";
}

/* ── 검색어 debounce ────────────────────────────────────────── */
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchInput, (v) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery.value = (v ?? "").trim();
  }, 300);
});
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

/* ── 페이지 캐시 ────────────────────────────────────────────── */
const pages = ref<PageCache[]>([]);
const pageIndex = ref(0);
const loading = ref(false);

const currentPage = computed(() => pages.value[pageIndex.value] ?? null);
const currentItems = computed(() => currentPage.value?.items ?? []);
const totalPages = computed(() => Math.max(1, pages.value.length));
const isAtFinalPage = computed(() => pageIndex.value === pages.value.length - 1);

const emptyMessage = computed(() =>
    hasActiveFilter.value
        ? "조건에 맞는 회원이 없습니다. 필터를 조정해보세요."
        : "면접 기록이 있는 회원이 없습니다."
);

/* ── 요청 취소 ──────────────────────────────────────────────── */
let abortCtrl: AbortController | null = null;
function cancelPending() {
  if (abortCtrl) abortCtrl.abort();
  abortCtrl = null;
}

function buildRequestBase() {
  return {
    pageSize: size.value,
    q: searchQuery.value || undefined,
    startDate: startDate.value || null,
    endDate: endDate.value || null,
    types: selectedTypes.value.length > 0 ? [...selectedTypes.value] : undefined,
  };
}

async function fetchFirstPage() {
  loading.value = true;
  cancelPending();
  abortCtrl = new AbortController();

  try {
    const data = await fetchInterviewUserList({
      ...buildRequestBase(),
      lastAccountId: null,
    });
    pages.value = data ? [data] : [];
    pageIndex.value = 0;
  } finally {
    loading.value = false;
  }
}

async function fetchNextPage() {
  const cur = currentPage.value;
  if (!cur || !cur.hasNext) return;

  loading.value = true;
  cancelPending();
  abortCtrl = new AbortController();

  try {
    const data = await fetchInterviewUserList({
      ...buildRequestBase(),
      lastAccountId: cur.nextCursor ?? null,
    });
    if (data) {
      pages.value.push(data);
      pageIndex.value += 1;
    }
  } finally {
    loading.value = false;
  }
}

function goPrev() {
  if (pageIndex.value === 0) return;
  pageIndex.value -= 1;
}

async function goNext() {
  if (pageIndex.value + 1 < pages.value.length) {
    pageIndex.value += 1;
  } else {
    await fetchNextPage();
  }
}

/* ── 필터/pageSize 변경 시 첫 페이지부터 재요청 ───────────────── */
watch(
    [size, searchQuery, selectedTypes, startDate, endDate],
    () => {
      fetchFirstPage();
    },
    { deep: true }
);

onMounted(fetchFirstPage);

/* ── 렌더 유틸 ──────────────────────────────────────────────── */
function typeLabel(t: InterviewType) {
  return INTERVIEW_TYPE_LABEL[t] ?? t;
}
function typeColor(t: InterviewType) {
  return INTERVIEW_TYPE_COLOR[t] ?? "default";
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

function openHistory(userId: number) {
  router.push({ name: "AdminInterviewHistory", params: { userId: String(userId) } });
}
</script>

<style scoped>
.filter-search {
  flex: 1 1 260px;
  min-width: 260px;
}

.admin-interview-table :deep(thead th) {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
}

.admin-interview-table :deep(tbody tr.admin-interview-row) {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.admin-interview-table :deep(tbody tr.admin-interview-row:hover) {
  background-color: rgba(0, 0, 0, 0.025);
}

.text-right-col {
  font-variant-numeric: tabular-nums;
}

.type-chip-row {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 4px;
}
</style>
