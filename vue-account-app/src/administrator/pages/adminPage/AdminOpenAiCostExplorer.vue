<!-- src/pages/AdminOpenAiCostExplorer.vue -->
<template>
  <v-container class="py-6" fluid>
    <!-- 상단: 기간 선택 -->
    <v-row>
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-4" rounded="xl">
          <div class="d-flex align-center ga-2 mb-2">
            <v-icon size="20">mdi-robot-confused</v-icon>
            <div class="text-h6 font-weight-bold">OpenAI 비용 조회 (기간 선택)</div>
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            <strong>YYYY-MM-DD</strong> 또는 숫자만(예: 20251008) 입력해도 자동 교정됩니다. 종료일은 <strong>포함</strong> 범위입니다.
          </div>

          <v-row dense>
            <!-- 시작일 -->
            <v-col cols="12" sm="6">
              <div class="d-flex ga-2">
                <v-text-field
                    v-model="startInput"
                    label="시작일 (YYYY-MM-DD)"
                    variant="outlined"
                    density="comfortable"
                    :rules="[ruleIso]"
                    inputmode="numeric"
                    placeholder="2025-10-01 또는 20251001"
                    @blur="applyStartInput"
                    @keyup.enter="applyStartInput"
                    @click:clear="clearStart"
                    clearable
                />
                <div class="d-flex flex-column ga-2" style="min-width: 92px">
                  <v-btn size="small" variant="tonal" @click="bumpStart(-1)">-1일</v-btn>
                  <v-btn size="small" variant="tonal" @click="bumpStart(1)">+1일</v-btn>
                </div>
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                오늘: <a class="text-primary" @click.prevent="setStart(today)">{{ toISODate(today) }}</a>
              </div>
            </v-col>

            <!-- 종료일 -->
            <v-col cols="12" sm="6">
              <div class="d-flex ga-2">
                <v-text-field
                    v-model="endInput"
                    label="종료일 (YYYY-MM-DD)"
                    variant="outlined"
                    density="comfortable"
                    :rules="[ruleIso]"
                    inputmode="numeric"
                    placeholder="2025-10-08 또는 20251008"
                    @blur="applyEndInput"
                    @keyup.enter="applyEndInput"
                    @click:clear="clearEnd"
                    clearable
                />
                <div class="d-flex flex-column ga-2" style="min-width: 92px">
                  <v-btn size="small" variant="tonal" @click="bumpEnd(-1)">-1일</v-btn>
                  <v-btn size="small" variant="tonal" @click="bumpEnd(1)">+1일</v-btn>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-alert type="info" variant="tonal" density="comfortable" class="mt-2" border="start">
            <template #text>
              <div v-if="startISO && endISO">
                선택 범위: <strong>{{ startISO }}</strong> ~ <strong>{{ endISO }}</strong>
              </div>
              <div v-else>시작일과 종료일을 입력하세요.</div>
            </template>
          </v-alert>

          <v-divider class="my-4" />

          <!-- 빠른 선택 -->
          <div class="d-flex ga-2 my-2 flex-wrap">
            <v-btn size="small" variant="text" @click="quickSetDays(7)">최근 7일</v-btn>
            <v-btn size="small" variant="text" @click="quickSetDays(30)">최근 30일</v-btn>
            <v-btn size="small" variant="text" @click="quickSetThisMonth">이번 달</v-btn>
            <v-btn size="small" variant="text" @click="quickSetLastMonth">지난 달</v-btn>
          </div>

          <div class="d-flex ga-3">
            <v-btn color="primary" :disabled="!isValidRange || loading" :loading="loading" @click="fetchDailyCosts">
              조회하기
            </v-btn>
            <v-btn variant="tonal" @click="clearAll" :disabled="loading">초기화</v-btn>
          </div>

          <v-alert
              v-if="!isEmptyRange && !isValidRange"
              type="warning"
              variant="tonal"
              class="mt-4"
              border="start"
              title="날짜 범위를 확인하세요"
          >
            시작일은 종료일보다 앞서거나 같아야 합니다.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <!-- 결과 -->
    <v-row class="mt-6" v-if="rows.length">
      <!-- 월이 1개 -->
      <template v-if="months.length === 1">
        <v-col cols="12" lg="8">
          <v-card class="pa-4 calendar-card">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-medium">{{ months[0].label }} 달력</div>
              <div class="text-subtitle-2 text-medium-emphasis">
                합계: <span class="font-weight-bold">{{ formatMoney(totalAmount) }}</span>
                <span v-if="currency"> ({{ currency }})</span>
              </div>
            </div>

            <v-calendar
                :view-mode="'month'"
                :model-value="months[0].firstDate"
                :events="calendarEventsPerMonth(months[0].key)"
                class="calendar-clean"
                style="min-height: 560px"
            >
              <template #event="{ event }">
                <div class="event-amount" :class="event.marker ? 'event-marker' : ''">
                  {{ event.name }}
                </div>
              </template>
            </v-calendar>

            <div class="text-caption text-medium-emphasis mt-2">
              * 각 날짜 셀에 금액이 표시됩니다. (통화: {{ currency }})
            </div>
          </v-card>
        </v-col>

        <!-- 일자별 표 -->
        <v-col cols="12" lg="4">
          <v-card class="pa-4 rounded-xl">
            <div class="text-subtitle-1 font-weight-medium">{{ months[0].label }} 일자별 비용</div>
            <v-table class="mt-3" density="comfortable">
              <thead>
              <tr>
                <th style="width:45%">날짜</th>
                <th class="text-right">비용</th>
                <th style="width:20%">통화</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="r in monthBuckets[months[0].key]" :key="r.date">
                <td>{{ r.date }}</td>
                <td class="text-right">{{ formatMoney(r.amount) }}</td>
                <td>{{ r.currency ?? currency }}</td>
              </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </template>

      <!-- 여러 달 -->
      <template v-else>
        <v-col v-for="m in months" :key="m.key" cols="12" md="6">
          <v-card class="pa-4 calendar-card">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-medium">{{ m.label }} 달력</div>
              <div class="text-subtitle-2 text-medium-emphasis">
                합계: <span class="font-weight-bold">{{ formatMoney(monthTotals[m.key] || 0) }}</span>
                <span v-if="currency"> ({{ currency }})</span>
              </div>
            </div>

            <v-calendar
                :view-mode="'month'"
                :model-value="m.firstDate"
                :events="calendarEventsPerMonth(m.key)"
                class="calendar-clean"
                style="min-height: 480px"
            >
              <template #event="{ event }">
                <div class="event-amount" :class="event.marker ? 'event-marker' : ''">
                  {{ event.name }}
                </div>
              </template>
            </v-calendar>
          </v-card>
        </v-col>

        <!-- 월별 합계 표 -->
        <v-col cols="12">
          <v-card class="pa-4 rounded-xl">
            <div class="text-subtitle-1 font-weight-medium mb-2">월별 합계</div>
            <v-table density="comfortable">
              <thead>
              <tr>
                <th style="width:30%">월</th>
                <th class="text-right">합계</th>
                <th style="width:20%">통화</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="m in months" :key="m.key">
                <td>{{ m.label }}</td>
                <td class="text-right">{{ formatMoney(monthTotals[m.key] || 0) }}</td>
                <td>{{ currency }}</td>
              </tr>
              </tbody>
              <tfoot>
              <tr>
                <th>총합</th>
                <th class="text-right">{{ formatMoney(totalAmount) }}</th>
                <th>{{ currency }}</th>
              </tr>
              </tfoot>
            </v-table>
          </v-card>
        </v-col>

        <!-- 월별 상세 표 -->
        <v-col cols="12">
          <v-card class="pa-4 rounded-xl">
            <div class="text-subtitle-1 font-weight-medium">월별 일자 상세</div>
            <div class="mt-3" v-for="m in months" :key="m.key">
              <div class="text-subtitle-2 font-weight-medium mb-1">{{ m.label }}</div>
              <v-table density="comfortable">
                <thead>
                <tr>
                  <th style="width:25%">날짜</th>
                  <th class="text-right">비용</th>
                  <th style="width:20%">통화</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="r in monthBuckets[m.key]" :key="r.date">
                  <td>{{ r.date }}</td>
                  <td class="text-right">{{ formatMoney(r.amount) }}</td>
                  <td>{{ r.currency ?? currency }}</td>
                </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-col>
      </template>

      <!-- (선택) 라인 차트 -->
      <v-col cols="12" lg="8" v-if="chartReady">
        <v-card class="pa-4 rounded-xl">
          <div class="text-subtitle-1 font-weight-medium mb-2">일자별 비용 추이</div>
          <canvas ref="chartEl"></canvas>
        </v-card>
      </v-col>
    </v-row>

    <!-- 빈 상태 -->
    <v-row class="mt-6" v-else-if="!loading">
      <v-col cols="12" md="10" lg="8">
        <v-alert type="info" variant="tonal" border="start" prominent>
          조회 결과가 없습니다. 시작일과 종료일을 입력 후 ‘조회하기’를 누르세요.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { VCalendar } from 'vuetify/labs/VCalendar'
import type { OpenAiDailyCost } from '@/administrator/service/AdminOpenAiCostExplorer/AdminOpenAiCostExplorerApi'
import { getOpenAiDailyCost } from '@/administrator/service/AdminOpenAiCostExplorer/AdminOpenAiCostExplorerApi'

const today = new Date()

const startDate = ref<Date | null>(null)
const endDate   = ref<Date | null>(null)

const startInput = ref('')
const endInput   = ref('')

const startISO = computed(() => (startDate.value ? toISODate(startDate.value) : ''))
const endISO   = computed(() => (endDate.value ? toISODate(endDate.value) : ''))

const loading = ref(false)
const rows = ref<OpenAiDailyCost[]>([])

const currency = computed(() => rows.value.find(r => !!r.currency)?.currency ?? 'USD')
const totalAmount = computed(() => rows.value.reduce((acc, r) => acc + (r.amount ?? 0), 0))

const isEmptyRange = computed(() => !startDate.value || !endDate.value)
const isValidRange = computed(() => {
  if (isEmptyRange.value) return false
  return startDate.value!.getTime() <= endDate.value!.getTime()
})

function toISODate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
function isValidYmd(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12) return false
  const last = new Date(y, m, 0).getDate()
  return d >= 1 && d <= last
}

function normalizeToISO(input: string, clampToday = true): { iso: string | null, date: Date | null } {
  if (!input) return { iso: null, date: null }
  const digits = input.replace(/\D/g, '')
  let y: number, m: number, d: number

  if (digits.length === 8) {
    y = Number(digits.slice(0, 4))
    m = Number(digits.slice(4, 6))
    d = Number(digits.slice(6, 8))
  } else {
    const parts = input.trim().split(/[^\d]+/).filter(Boolean)
    if (parts.length === 3 && parts[0].length === 4) {
      y = Number(parts[0]); m = Number(parts[1]); d = Number(parts[2])
    } else {
      return { iso: null, date: null }
    }
  }

  if (!isValidYmd(y!, m!, d!)) return { iso: null, date: null }

  let dt = new Date(y!, m! - 1, d!)
  const t0 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  if (clampToday && t0 > today0) dt = new Date(today)

  const iso = toISODate(dt)
  return { iso, date: dt }
}

const ruleIso = (v: string) => {
  if (!v) return true
  const { iso } = normalizeToISO(v, false)
  return !!iso || 'YYYY-MM-DD / 20251008 등으로 입력하세요.'
}

/** 월 계산/버킷팅 */
type MonthItem = { key: string; label: string; firstDate: Date }

const months = computed<MonthItem[]>(() => {
  if (!rows.value.length) return []
  const first = new Date(rows.value[0].date)
  const last  = new Date(rows.value[rows.value.length - 1].date)
  const items: MonthItem[] = []
  const cur = new Date(first.getFullYear(), first.getMonth(), 1)
  const end = new Date(last.getFullYear(), last.getMonth(), 1)
  while (cur <= end) {
    const y = cur.getFullYear()
    const m = cur.getMonth() + 1
    const key = `${y}-${String(m).padStart(2,'0')}`
    items.push({ key, label: key, firstDate: new Date(y, m - 1, 1) })
    cur.setMonth(cur.getMonth() + 1)
  }
  return items
})

const monthBuckets = computed<Record<string, OpenAiDailyCost[]>>(() => {
  const map: Record<string, OpenAiDailyCost[]> = {}
  for (const r of rows.value) {
    const key = r.date.slice(0, 7)
    if (!map[key]) map[key] = []
    map[key].push(r)
  }
  for (const k of Object.keys(map)) map[k].sort((a, b) => a.date.localeCompare(b.date))
  return map
})

const monthTotals = computed<Record<string, number>>(() => {
  const sums: Record<string, number> = {}
  for (const [k, arr] of Object.entries(monthBuckets.value)) {
    sums[k] = arr.reduce((acc, r) => acc + (r.amount ?? 0), 0)
  }
  return sums
})

function calendarEventsPerMonth(monthKey: string) {
  const arr = monthBuckets.value[monthKey] ?? []
  const hasCost = new Set(arr.map(r => r.date))

  const evts = arr.map(r => ({
    start: r.date,
    end: r.date,
    name: formatMoney(r.amount as number),
    marker: false as boolean,
  }))

  if (startISO.value && startISO.value.startsWith(monthKey) && !hasCost.has(startISO.value)) {
    evts.push({ start: startISO.value, end: startISO.value, name: '시작', marker: true })
  }
  if (endISO.value && endISO.value.startsWith(monthKey) && !hasCost.has(endISO.value)) {
    evts.push({ start: endISO.value, end: endISO.value, name: '종료', marker: true })
  }
  return evts
}

/** 입력 적용/조작 */
function applyStartInput() {
  const { iso, date } = normalizeToISO(startInput.value, true)
  startDate.value = date
  startInput.value = iso ?? startInput.value
}
function applyEndInput() {
  const { iso, date } = normalizeToISO(endInput.value, true)
  endDate.value = date
  endInput.value = iso ?? endInput.value
}
function setStart(d: Date) { startDate.value = new Date(d); startInput.value = toISODate(d) }
function setEnd(d: Date)   { endDate.value   = new Date(d); endInput.value   = toISODate(d) }

function addDays(base: Date, delta: number): Date { const d = new Date(base); d.setDate(d.getDate() + delta); return d }
function bumpStart(delta: number) { setStart(addDays(startDate.value ?? today, delta)) }
function bumpEnd(delta: number)   { setEnd(addDays(endDate.value   ?? today, delta)) }

function quickSetDays(days: number) { const end = new Date(); const start = addDays(end, -(days - 1)); setStart(start); setEnd(end) }
function quickSetThisMonth() { const y=today.getFullYear(), m=today.getMonth(); setStart(new Date(y,m,1)); setEnd(new Date(y,m+1,0)) }
function quickSetLastMonth() { const y=today.getFullYear(), m=today.getMonth()-1; setStart(new Date(y,m,1)); setEnd(new Date(y,m+1,0)) }

/** 입력 자동 하이픈 */
const liveHyphen = true
function autoHyphen(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 8)
  if (!digits) return ''
  let out = digits
  if (digits.length > 4) out = digits.slice(0, 4) + '-' + digits.slice(4)
  if (digits.length > 6) out = out.slice(0, 7) + '-' + out.slice(7)
  return out
}
if (liveHyphen) {
  watch(startInput, (v) => {
    if (v === '') startDate.value = null
    const h = autoHyphen(v)
    if (h !== v) startInput.value = h
  })
  watch(endInput, (v) => {
    if (v === '') endDate.value = null
    const h = autoHyphen(v)
    if (h !== v) endInput.value = h
  })
}

/** 조회 */
async function fetchDailyCosts() {
  if (!isValidRange.value) return
  loading.value = true
  try {
    const list = await getOpenAiDailyCost(startISO.value, endISO.value)
    rows.value = [...list]
        .filter(r => r && typeof r.date === 'string')
        .sort((a, b) => a.date.localeCompare(b.date))
    drawChart()
  } catch (e) {
    console.error('[fetchDailyCosts] error:', e)
    rows.value = []
    destroyChart()
  } finally {
    loading.value = false
  }
}
function clearAll() {
  startDate.value = null; endDate.value = null
  startInput.value = ''; endInput.value = ''
  rows.value = []
  destroyChart()
}
function clearStart() { startInput.value = ''; startDate.value = null }
function clearEnd()   { endInput.value   = ''; endDate.value   = null }

/** Chart.js */
let chart: any = null
const chartEl = ref<HTMLCanvasElement | null>(null)
const chartReady = ref(false)
async function ensureChartJs() { if (chart) return { default: chart.constructor } as any; return await import('chart.js/auto') }
async function drawChart() {
  if (!chartEl.value || rows.value.length === 0) { chartReady.value = false; destroyChart(); return }
  const { default: Chart } = await ensureChartJs() as any
  destroyChart()
  const labels = rows.value.map(r => r.date)
  const data   = rows.value.map(r => r.amount ?? 0)
  chart = new Chart(chartEl.value, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Daily Cost', data }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: { x: { ticks: { autoSkip: true, maxTicksLimit: 10 } } },
    },
  })
  chartReady.value = true
}
function destroyChart() { if (chart) { chart.destroy(); chart = null } }

onMounted(() => { quickSetDays(7) })
onBeforeUnmount(() => { destroyChart() })

function formatMoney(n: number | undefined) {
  if (n == null) return '-'
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
/* 카드 라운드 제거 + 플랫 톤 */
.calendar-card {
  border-radius: 0 !important;
  box-shadow: none !important;
  border: 1px solid rgba(0,0,0,0.06);
}

/* 캘린더 전체를 평평하게 */
.calendar-clean {
  border-radius: 0 !important;
  border: 1px solid rgba(0,0,0,0.06);
}

/* Vuetify 내부 클래스는 deep 필요 */
:deep(.calendar-clean .v-calendar-month__week) {
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
:deep(.calendar-clean .v-calendar-month__day) {
  border-right: 1px solid rgba(0,0,0,0.04);
}
:deep(.calendar-clean .v-calendar-month__week:last-child),
:deep(.calendar-clean .v-calendar-month__day:last-child) {
  border-bottom: none;
  border-right: none;
}

/* 이벤트 바 풀폭 + 중앙정렬 */
:deep(.calendar-clean .v-calendar-event) {
  --v-event-left: 0% !important;
  --v-event-width: 100% !important;
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
:deep(.calendar-clean .v-calendar-event-content) {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 !important;
}
:deep(.event-amount) {
  width: 100% !important;
  display: block !important;
  text-align: center !important;
  margin: 0 auto !important;
  font-size: 12px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  padding: 2px 0;
  opacity: 0.9;
}
:deep(.calendar-clean .v-calendar-month__day .v-calendar-events) {
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: center !important;
}

/* 시작/종료 마커 스타일 */
.event-marker {
  font-weight: 500;
  border: 1px dashed rgba(0,0,0,0.25);
  padding: 1px 4px;
  display: inline-block;
  border-radius: 2px;
  margin-top: 2px;
  text-align: center;
  opacity: 0.8;
}

/* 차트 높이 */
canvas { width: 100%; height: 260px; }
</style>
