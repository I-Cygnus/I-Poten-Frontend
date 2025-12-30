<!-- AdminUsers.vue -->
<template>
  <div>
    <!-- 상단: 제목 + 페이지 단위 선택 -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-h5 font-weight-bold">사용자 관리</div>

      <!-- 서버 DTO: pageSize에 매핑될 size 값 -->
      <v-select
          v-model="size"
          :items="[30,50,70]"
          density="compact"
          hide-details
          style="max-width: 110px"
          label="페이지 단위"
      />
    </div>

    <v-card>
      <v-table density="comfortable">
        <thead>
        <tr>
          <th>이메일</th>
          <th>닉네임</th>
          <th>가입일</th>
          <th>권한</th>
          <th>동작</th>
        </tr>
        </thead>

        <tbody>
        <!-- 현재 페이지의 사용자 목록 렌더링 -->
        <tr v-for="u in currentItems" :key="u.id">
          <td>{{ u.email }}</td>
          <td>{{ u.nickname }}</td>
          <td>{{ u.joinedAt }}</td>
          <td>
            <v-chip size="small" :color="u.role === 'ADMIN' ? 'primary' : undefined">
              {{ u.role }}
            </v-chip>
          </td>
          <td>
            <v-btn
                size="small"
                variant="text"
                @click="onToggleRole(u)"
                :loading="actionLoadingId === u.id"
            >
              권한전환
            </v-btn>
            <v-btn
                size="small"
                variant="text"
                color="error"
                @click="onBan(u)"
                :loading="actionLoadingId === u.id"
            >
              차단
            </v-btn>
          </td>
        </tr>

        <!-- 비어있을 때 표시 -->
        <tr v-if="!loading && currentItems.length === 0">
          <td colspan="5" class="text-medium-emphasis text-center py-6">
            결과가 없습니다.
          </td>
        </tr>
        </tbody>
      </v-table>

      <!-- 하단: 좌/우 커서 네비게이션 (이전은 캐시 재사용, 다음은 필요 시 서버 요청) -->
      <div class="d-flex align-center justify-space-between px-4 py-3">
        <div class="text-caption">
          페이지 {{ pageIndex + 1 }} / {{ totalPages }}
          <span v-if="currentPage"> · pageSize={{ currentPage.pageSize }}</span>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
              icon="mdi-chevron-left"
              variant="text"
              :disabled="pageIndex === 0 || loading"
              @click="goPrev"
              :aria-label="'이전 페이지'"
          />
          <v-btn
              icon="mdi-chevron-right"
              variant="text"
              :disabled="(isAtFinalPage && !(currentPage && currentPage.hasNext)) || loading || currentItems.length === 0"
              @click="goNext"
              :aria-label="'다음 페이지'"
          />
          <v-progress-circular v-if="loading" indeterminate size="20" />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 옵션 A: 프론트가 서버 DTO 필드명에 맞춰 Body를 보낸다.
 *  - 서버 DTO: { pageSize: Integer(@NotNull), lastAccountId: Long(@PositiveOrZero) }
 *  - 프론트 Body: { pageSize: number, lastAccountId: number | null }
 *  - @RequestBody로 매핑되므로 반드시 JSON Body로 전송 (쿼리파라미터 X)
 */

import { ref, computed, watch, onMounted } from "vue";
import { createAxiosInstances } from "@/account/utility/axiosInstance.ts";

/** 권한 타입 */
type Role = "ADMIN" | "USER";

/** 단일 사용자 응답 모델 (서버 응답 그대로 표시) */
type AdministratorUserInfoResponse = {
  id: number;
  email: string;
  nickname: string;
  joinedAt: string;
  role: Role;
};

/** 서버 목록 응답 스펙 (백엔드 제공 형태) */
type AdministratorUserListResponse = {
  items: AdministratorUserInfoResponse[];
  pageSize: number;
  hasNext: boolean;
  nextCursor: number | null; // 다음 페이지 요청 시 lastAccountId로 넘길 값
};

/** 요청 Body 타입: 서버 DTO와 동일한 키 사용 (pageSize, lastAccountId) */
type AdministratorUserInfoRequest = {
  pageSize: number;                 // @NotNull
  lastAccountId: number | null;     // @PositiveOrZero, 첫 페이지는 null
};

/** 캐시에 저장할 페이지 단위 데이터 (서버 응답 그대로) */
type PageCache = AdministratorUserListResponse;

/** 기존 axios 인스턴스 재활용 */
const { springAdminAxiosInst } = createAxiosInstances();

/** 페이지 단위 (서버 DTO: pageSize에 매핑) */
const size = ref(30);

/** 받은 페이지를 순서대로 누적 저장 (이전 페이지로 돌아갈 때 네트워크 호출 불필요) */
const pages = ref<PageCache[]>([]);

/** 현재 화면에 보여줄 페이지 인덱스 (0부터 시작) */
const pageIndex = ref(0);

/** 전체 목록 요청/다음 페이지 요청 로딩 */
const loading = ref(false);

/** 행 단위 액션(권한전환/차단) 로딩 표시용 */
const actionLoadingId = ref<number | null>(null);

/** 파생 상태: 현재 페이지/목록/총 페이지/마지막 페이지 여부 */
const currentPage   = computed(() => pages.value[pageIndex.value] ?? null);
const currentItems  = computed(() => currentPage.value?.items ?? []);
const totalPages    = computed(() => Math.max(1, pages.value.length));
const isAtFinalPage = computed(() => pageIndex.value === pages.value.length - 1);

/** 최신 요청만 유효하게: 이전 진행 중인 요청 취소용 */
let abortCtrl: AbortController | null = null;
function cancelPending() { if (abortCtrl) abortCtrl?.abort(); abortCtrl = null; }

/** Authorization 헤더(간단 버전) — 인스턴스 인터셉터로 주입해도 됨 */
function authHeader() {
  const raw = localStorage.getItem("userToken");
  if (!raw) return {};
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}

/**
 * 첫 페이지 로드
 * - 캐시 초기화 → lastAccountId=null 로 POST
 * - Body 키는 서버 DTO와 동일: { pageSize, lastAccountId }
 */
async function fetchFirstPage() {
  loading.value = true;
  cancelPending();
  abortCtrl = new AbortController();

  try {
    const body: AdministratorUserInfoRequest = {
      pageSize: size.value,      // 서버 DTO @NotNull
      lastAccountId: null,       // 첫 페이지는 null
    };

    const { data } = await springAdminAxiosInst.post<AdministratorUserListResponse>(
        "/administrator/management/userinfo", // 컨트롤러 @PostMapping("/administrator/userinfo")
        body,                      // ✅ @RequestBody 매핑
        {
          headers: {
            ...authHeader(),
            "Content-Type": "application/json", // JSON Body 전송
            Accept: "application/json",
          },
          signal: abortCtrl.signal as any,
        }
    );

    // 0번 페이지로 초기화
    pages.value = [data];
    pageIndex.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 다음 페이지 로드
 * - 서버가 준 nextCursor를 lastAccountId로 보냄
 * - 성공 시 캐시에 push하고 인덱스를 한 칸 전진
 */
async function fetchNextPage() {
  const cur = currentPage.value;
  if (!cur || !cur.hasNext) return; // 더 불러올 게 없으면 중단

  loading.value = true;
  cancelPending();
  abortCtrl = new AbortController();

  try {
    const body: AdministratorUserInfoRequest = {
      pageSize: size.value,
      lastAccountId: cur.nextCursor ?? null, // 커서 기반 페이징
    };

    const { data } = await springAdminAxiosInst.post<AdministratorUserListResponse>(
        "/administrator/management/userinfo",
        body,
        {
          headers: {
            ...authHeader(),
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: abortCtrl.signal as any,
        }
    );

    pages.value.push(data);
    pageIndex.value += 1;
  } finally {
    loading.value = false;
  }
}

/** 이전 페이지: 네트워크 호출 없이 캐시 재사용 */
function goPrev() {
  if (pageIndex.value === 0) return;
  pageIndex.value -= 1;
}

/** 다음 페이지: 캐시에 있으면 이동만, 없으면 서버 요청 */
async function goNext() {
  if (pageIndex.value + 1 < pages.value.length) {
    pageIndex.value += 1;
  } else {
    await fetchNextPage();
  }
}

/** 권한 전환: 서버 응답의 role로 현재 행 업데이트 */
async function onToggleRole(u: AdministratorUserInfoResponse) {
  actionLoadingId.value = u.id;
  try {
    const { data } = await springAdminAxiosInst.post<{ role: Role }>(
        `/admin/users/${u.id}/toggle-role`,
        null,
        { headers: authHeader() }
    );
    u.role = data.role;
  } finally {
    actionLoadingId.value = null;
  }
}

/** 사용자 차단: 성공 시 현재 페이지 배열에서만 제거(간단 처리) */
async function onBan(u: AdministratorUserInfoResponse) {
  actionLoadingId.value = u.id;
  try {
    await springAdminAxiosInst.post<void>(
        `/admin/users/${u.id}/ban`,
        null,
        { headers: authHeader() }
    );
    const arr = currentPage.value?.items ?? [];
    const idx = arr.findIndex(x => x.id === u.id);
    if (idx >= 0) arr.splice(idx, 1);
  } finally {
    actionLoadingId.value = null;
  }
}

/** 페이지 단위(size) 변경 시 첫 페이지부터 다시 로드 */
watch(size, () => {
  fetchFirstPage();
});

/** 라우트 진입 시 자동 첫 로드 */
onMounted(fetchFirstPage);
</script>

<style scoped>
/* 필요시 스타일 보정 */
</style>
