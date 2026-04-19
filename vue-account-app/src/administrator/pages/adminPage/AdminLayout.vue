<!-- AdminLayout.vue -->
<template>
  <div class="admin-shell">
    <!-- 좌측 사이드바 -->
    <aside class="admin-sidebar" :class="{ collapsed }">
      <!-- 브랜드 영역 -->
      <div class="brand">
        <div class="brand-mark">
          <span class="brand-dot" />
          <span class="brand-wordmark" v-if="!collapsed">
            I-POTEN <span class="brand-sub">/ admin</span>
          </span>
        </div>
        <button
            type="button"
            class="collapse-btn"
            @click="collapsed = !collapsed"
            :aria-label="collapsed ? '사이드바 펼치기' : '사이드바 접기'"
            :title="collapsed ? '펼치기' : '접기'"
        >
          <v-icon size="18">{{ collapsed ? "mdi-chevron-right" : "mdi-chevron-left" }}</v-icon>
        </button>
      </div>

      <!-- 섹션별 네비 -->
      <nav class="nav">
        <template v-for="(section, idx) in navSections" :key="section.label">
          <div class="section-label" v-if="!collapsed">{{ section.label }}</div>
          <div v-else-if="idx > 0" class="section-gap" aria-hidden="true" />

          <router-link
              v-for="item in section.items"
              :key="item.routeName"
              :to="{ name: item.routeName }"
              class="nav-item"
              :class="{ active: isActive(item) }"
              v-slot="{ isExactActive, isActive: linkActive, navigate }"
              custom
          >
            <a
                class="nav-item"
                :class="{ active: linkActive || isExactActive || isActive(item) }"
                @click="navigate"
                :title="collapsed ? item.label : undefined"
            >
              <v-icon :size="collapsed ? 22 : 18" class="nav-icon">{{ item.icon }}</v-icon>
              <span class="nav-label" v-if="!collapsed">{{ item.label }}</span>
              <span
                  v-if="!collapsed && item.badge"
                  class="nav-badge"
              >{{ item.badge }}</span>
            </a>
          </router-link>
        </template>
      </nav>

      <!-- 하단 유저 / 로그아웃 -->
      <div class="sidebar-footer">
        <div class="user-chip" v-if="!collapsed">
          <div class="user-avatar">
            <v-icon size="18" color="rgba(255,255,255,0.75)">mdi-shield-account</v-icon>
          </div>
          <div class="user-meta">
            <div class="user-name">관리자</div>
            <div class="user-role">Admin Console</div>
          </div>
        </div>
        <button
            class="logout-btn"
            :class="{ icon: collapsed }"
            type="button"
            @click="logout"
            :title="collapsed ? '로그아웃' : undefined"
        >
          <v-icon size="18">mdi-logout</v-icon>
          <span v-if="!collapsed">로그아웃</span>
        </button>
      </div>
    </aside>

    <!-- 본문 영역 -->
    <main class="admin-main">
      <header class="topbar">
        <div class="breadcrumb">
          <span class="crumb-home">Admin</span>
          <v-icon size="14" color="rgba(15, 20, 36, 0.32)">mdi-chevron-right</v-icon>
          <span class="crumb-current">{{ currentCrumb }}</span>
        </div>
        <div class="topbar-right">
          <span class="env-chip">
            <span class="env-dot" />
            PROD
          </span>
        </div>
      </header>

      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { logoutRequest } from "@/administrator/utility/adminApi.ts";

type NavItem = {
  routeName: string;
  label: string;
  icon: string;
  matchPrefix?: string;
  badge?: string;
};
type NavSection = { label: string; items: NavItem[] };

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { routeName: "AdminOverview", label: "대시보드", icon: "mdi-view-dashboard-outline" },
    ],
  },
  {
    label: "Management",
    items: [
      { routeName: "AdminUsers", label: "사용자 관리", icon: "mdi-account-multiple-outline" },
      {
        routeName: "AdminInterviews",
        label: "면접 결과 조회",
        icon: "mdi-clipboard-text-search-outline",
        matchPrefix: "/account/admin/interviews",
      },
    ],
  },
  {
    label: "Moderation",
    items: [
      { routeName: "AdminStudyRoomReport", label: "스터디룸 신고 관리", icon: "mdi-flag-outline" },
    ],
  },
];

function isActive(item: NavItem) {
  if (item.matchPrefix && route.path.startsWith(item.matchPrefix)) return true;
  return route.name === item.routeName;
}

const currentCrumb = computed(() => {
  for (const section of navSections) {
    for (const item of section.items) {
      if (isActive(item)) return item.label;
    }
  }
  return "";
});

const logout = async () => {
  try {
    await logoutRequest();
  } catch (e) {
    console.warn("[logout] failed to logout : ", e);
  } finally {
    router.push("/");
  }
};
</script>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: #f6f7fb;
  font-feature-settings: "ss01", "cv11";
}
.admin-shell:has(.admin-sidebar.collapsed) {
  grid-template-columns: 72px 1fr;
}

/* ───────── Sidebar ───────── */
.admin-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  background: #0f1424;
  color: rgba(255, 255, 255, 0.72);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  transition: width 0.22s ease;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 18px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.brand-mark {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: linear-gradient(135deg, #5b8cff 0%, #8b5cf6 100%);
  box-shadow: 0 0 12px rgba(91, 140, 255, 0.45);
  flex-shrink: 0;
}
.brand-wordmark {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
  overflow: hidden;
}
.brand-sub {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.38);
  margin-left: 2px;
}
.collapse-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

/* ───────── Nav ───────── */
.nav {
  flex: 1;
  padding: 18px 12px;
  overflow-y: auto;
}
.section-label {
  padding: 12px 12px 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.32);
}
.section-gap {
  height: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 2px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.68);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.14s ease, color 0.14s ease, transform 0.14s ease;
  position: relative;
}
.nav-item .nav-icon {
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.14s ease;
  flex-shrink: 0;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.95);
}
.nav-item:hover .nav-icon {
  color: rgba(255, 255, 255, 0.9);
}
.nav-item.active {
  background: rgba(91, 140, 255, 0.14);
  color: #ffffff;
  font-weight: 600;
}
.nav-item.active .nav-icon {
  color: #9ab7ff;
}
.nav-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(91, 140, 255, 0.2);
  color: #b7ccff;
  letter-spacing: 0.03em;
}

/* Collapsed 상태: 아이콘 중앙 정렬 */
.admin-sidebar.collapsed .nav {
  padding: 18px 10px;
}
.admin-sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px 0;
}
.admin-sidebar.collapsed .brand-mark {
  justify-content: center;
  width: 100%;
}

/* ───────── Footer ───────── */
.sidebar-footer {
  padding: 14px 12px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b8cff 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-meta {
  min-width: 0;
}
.user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.94);
  line-height: 1.2;
}
.user-role {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.4;
  margin-top: 2px;
}
.logout-btn {
  all: unset;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.logout-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ff9ca1;
}
.logout-btn.icon {
  justify-content: center;
  padding: 9px 0;
}

/* ───────── Main ───────── */
.admin-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
  background: #ffffff;
  border-bottom: 1px solid rgba(15, 20, 36, 0.06);
  position: sticky;
  top: 0;
  z-index: 5;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}
.crumb-home {
  color: rgba(15, 20, 36, 0.42);
  font-weight: 500;
  letter-spacing: 0.02em;
}
.crumb-current {
  color: rgba(15, 20, 36, 0.9);
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.env-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.08);
  color: #047857;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.env-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.admin-content {
  padding: 28px 32px 48px;
  max-width: 1400px;
  width: 100%;
}

/* ───────── Responsive ───────── */
@media (max-width: 960px) {
  .admin-shell {
    grid-template-columns: 72px 1fr;
  }
  .admin-sidebar {
    width: 72px;
  }
  .brand-wordmark,
  .section-label,
  .nav-label,
  .nav-badge,
  .user-chip {
    display: none;
  }
  .nav-item {
    justify-content: center;
    padding: 10px 0;
  }
  .logout-btn {
    justify-content: center;
    padding: 9px 0;
  }
  .admin-content {
    padding: 20px 16px 40px;
  }
  .topbar {
    padding: 14px 20px;
  }
}
</style>
