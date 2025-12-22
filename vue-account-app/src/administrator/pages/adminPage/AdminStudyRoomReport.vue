<template>
  <div class="pa-4 d-flex flex-column ga-3">
    <!-- 상단 컨트롤: 상태 필터 + 키워드 검색 + 새로고침 -->
    <v-card>
      <v-card-text class="d-flex flex-wrap ga-3 align-center">
        <v-select
            v-model="statusFilter"
            :items="[
            { title: '전체', value: 'ALL' },
            { title: '접수 (처리 대기)', value: 'PENDING' },
            { title: '검토 중', value: 'IN_PROGRESS' },
            { title: '처리 완료', value: 'RESOLVED' }
          ]"
            label="상태"
            hide-details
            density="compact"
            style="max-width: 160px"
        />
        <v-text-field
            v-model="q"
            label="검색(룸/신고자/피신고자/분류/내용)"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-magnify"
            class="flex-1"
            clearable
        />
        <div class="ml-auto d-flex ga-2">
          <v-btn variant="text" @click="fetchReports" :loading="loading">새로고침</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 신고 테이블 -->
    <v-card>
      <v-data-table
          :headers="headers"
          :items="formattedRows"
          :loading="loading"
          item-value="reportId"
          hover
          density="comfortable"
      >
        <template #item.studyRoomTitle="{ item }">
          <v-btn variant="text" class="text-none" @click="openDetail(item)">
            {{ item.studyRoomTitle }}
          </v-btn>
        </template>

        <template #item.description="{ item }">
          <span :title="item.description">
            {{ item.description.length > 36 ? item.description.slice(0, 36) + '…' : item.description }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small">{{ item.status }}</v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-end">
            <v-btn size="small" variant="tonal" @click="openDetail(item)">보기</v-btn>

            <v-menu
                :model-value="statusMenuTarget === item.reportId"
                @update:model-value="val => !val && closeStatusMenu()"
            >
              <template #activator="{ props }">
                <v-btn
                    size="small"
                    variant="text"
                    v-bind="props"
                    @click.stop="openStatusMenu(item.reportId)"
                >상태 변경</v-btn>
              </template>

              <v-list density="compact">
                <v-list-item
                    v-for="opt in statusItems"
                    :key="opt.value"
                    @click="updateStatus(item, opt.value); closeStatusMenu()"
                >
                  <v-list-item-title>{{ opt.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-end pa-3">
            <div class="text-caption text-medium-emphasis">총 {{ filteredRows.length }}개</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 상세 다이얼로그 -->
    <v-dialog v-model="detailOpen" max-width="720">
      <v-card>
        <v-card-title class="text-h6">신고 상세</v-card-title>
        <v-card-text v-if="selected" class="d-flex flex-column ga-2">
          <div class="d-flex ga-6 flex-wrap">
            <div class="w-220"><span class="label">ID</span> {{ selected.reportId }}</div>
            <div class="w-220"><span class="label">스터디룸</span> {{ selected.studyRoomTitle }}</div>
            <div class="w-220"><span class="label">분류</span> {{ selected.category }}</div>
            <div class="w-220">
              <span class="label">상태</span>
              <v-chip :color="statusColor(selected.status)" size="small">{{ selected.status }}</v-chip>
            </div>
          </div>
          <div class="d-flex ga-6 flex-wrap">
            <div class="w-220"><span class="label">신고자</span> {{ selected.reporterNickname }}</div>
            <div class="w-220"><span class="label">피신고자</span> {{ selected.reportedUserNickname }}</div>
            <div class="w-220"><span class="label">접수일시</span> {{ new Date(selected.createdAt).toLocaleString() }}</div>
          </div>
          <v-divider class="my-2" />
          <div><span class="label">내용</span></div>
          <div class="reason-box">{{ selected.description }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailOpen=false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchAllStudyRoomReports,updateStudyRoomReportStatus } from '@/administrator/service/studyRoomReport/studyRoomReportService.ts'
import type { ReportStatus, StudyRoomReport } from '@/administrator/service/studyRoomReport/dto/studyRoomDto.ts'

const loading = ref(false)
const rows = ref<StudyRoomReport[]>([])

const statusFilter = ref<ReportStatus | 'ALL'>('ALL')
const q = ref('')

const detailOpen = ref(false)
const selected = ref<StudyRoomReport | null>(null)

const statusMenuTarget = ref<number | null>(null)
const statusItems: Array<{ label: string; value: ReportStatus }> = [
  { label: '접수 (처리 대기)', value: 'PENDING' },
  { label: '검토 중', value: 'IN_PROGRESS' },
  { label: '처리 완료', value: 'RESOLVED' }
]

function statusColor(s: ReportStatus) {
  switch (s) {
    case 'PENDING': return 'error'
    case 'IN_PROGRESS': return 'warning'
    case 'RESOLVED': return 'success'
  }
}


/** 전체 조회: 백엔드가 List만 반환 */
async function fetchReports() {
  loading.value = true
  try {
    const list = await fetchAllStudyRoomReports()
    rows.value = list ?? []
  } catch (e) {
    console.error('[fetchReports] failed:', e)
    alert('신고 목록을 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

async function updateStatus(row: StudyRoomReport, to: ReportStatus) {
  if (row.status === to) return
  try {
    const ok = await updateStudyRoomReportStatus(row.reportId, to)
    if (ok) row.status = to
    else alert('상태 변경에 실패했습니다.')
  } catch (e) {
    console.error('[updateStatus] failed:', e)
    alert('상태 변경 중 오류가 발생했습니다.')
  }
}

function openDetail(row: StudyRoomReport) {
  selected.value = row
  detailOpen.value = true
}
function openStatusMenu(reportId: number) { statusMenuTarget.value = reportId }
function closeStatusMenu() { statusMenuTarget.value = null }

/** 클라이언트 필터링 */
const filteredRows = computed(() =>
    rows.value.filter(it =>
        (statusFilter.value === 'ALL' || it.status === statusFilter.value) &&
        (!q.value ||
            it.studyRoomTitle.includes(q.value) ||
            it.reporterNickname.includes(q.value) ||
            it.reportedUserNickname.includes(q.value) ||
            it.category.includes(q.value) ||
            it.description.includes(q.value)
        )
    )
)

/** 표시용(날짜 포맷) */
const formattedRows = computed(() => filteredRows.value.map(r => ({
  ...r,
  createdAt: new Date(r.createdAt).toLocaleString(),
})))

onMounted(fetchReports)

const headers = [
  { title: 'ID', key: 'reportId', align: 'end', width: 90 },
  { title: '스터디룸', key: 'studyRoomTitle', width: 160 },
  { title: '신고자', key: 'reporterNickname', width: 140 },
  { title: '피신고자', key: 'reportedUserNickname', width: 140 },
  { title: '분류', key: 'category', width: 120 },
  { title: '내용', key: 'description', width: 360 },
  { title: '접수일시', key: 'createdAt', width: 180 },
  { title: '상태', key: 'status', width: 120 },
  { title: '동작', key: 'actions', sortable: false, width: 160 },
]
</script>

<style scoped>
.label { display:inline-block; min-width: 72px; color: rgba(0,0,0,.6); margin-right: 6px; }
.w-220 { width: 220px; }
.reason-box { padding: 10px; background: rgba(0,0,0,.04); border-radius: 8px; white-space: pre-wrap; }
</style>
