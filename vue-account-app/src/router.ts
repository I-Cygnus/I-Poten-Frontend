// src/router.ts
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { adminBeforeEach } from "@/security/admin/adminGuards";

// account pages
import AccountLogin from "./account/pages/login/AccountLogin.vue";
import PrivacyAgreement from "./account/pages/login/PrivacyAgreement.vue";
import AccountMy from "./account/pages/my/AccountMy.vue";
import ModifyIndex from "./account/pages/modify/ModifyIndex.vue";
import AccountWithdraw from "./account/pages/withdraw/AccountWithdraw.vue";

// 소셜/게스트 인증 리다이렉션
import KakaoRedirection from "./kakao/redirection/KakaoRedirection.vue";
import GoogleRedirection from "./google/redirection/GoogleRedirection.vue";
import GithubRedirection from "./github/redirection/GithubRedirection.vue";
import GuestRedirection from "./guest/redirection/GuestRedirection.vue";
import NaverRedirection from "./naver/redirection/NaverRedirection.vue";

//관리자 인증 플로우 컴포넌트.(코드 입력 및 Github 로그인 화면)
const AdminAuthLayout=() => import("@/administrator/pages/admin-login/AdminAuthLayout.vue");
const AdminCodeInput =() => import("@/administrator/pages/admin-login/AdminCodeInput.vue");
const GithubAdminLogin = () => import("@/administrator/pages/admin-login/GithubAdminLogin.vue");

//관리자 앱 레이아웃과 화면 요소
const AdminOverview = () => import("@/administrator/pages/adminPage/AdminOverview.vue");
const AdminLayout = () => import("@/administrator/pages/adminPage/AdminLayout.vue");
const AdminUsers = () => import("@/administrator/pages/adminPage/AdminUsers.vue");
const AdminStudyRoomReport=() => import("@/administrator/pages/adminPage/AdminStudyRoomReport.vue");
const AdminAwsCostExplorer=() => import("@/administrator/pages/adminPage/AdminAwsCostExplorer.vue");
const AdminOpenAiCostView=() => import("@/administrator/pages/adminPage/AdminOpenAiCostExplorer.vue");

const routes: Array<RouteRecordRaw> = [
  { path: "/account/login", name: "VueAccountLogin", component: AccountLogin },
  { path: "/account/privacy", component: PrivacyAgreement },
  { path: "/account/mypage", component: AccountMy },
  { path: "/account/modify/modify-profile", component: ModifyIndex },
  { path: "/account/withdraw", component: AccountWithdraw },

  //관리자 인증 플로우
  {
    path: "/account/admin-auth",
    component: AdminAuthLayout,
    meta:{ section: "ADMIN_AUTH"},
    children:[
        //인데긋 접근시 code 화면으로 리다이렉트
      {path: "", redirect:{ name: "AdminAuthCode"}},
        //관리자 코드 입력(tempAdminToken발급)
      {
        path:"code",
        name: "AdminAuthCode",
        component:AdminCodeInput,
        meta: {section:"ADMIN_AUTH"},
      },
        //Github 관리자 로그인. TempAdminToken 필수
      {
        path: "socialLogin",
        name:"AdminAuthSocialLogin",
        component:GithubAdminLogin,
        //전역가드에서 temp 체크 예정
        meta: {section: "ADMIN_AUTH", requiresTempAdmin: true},
      }
    ]
  },
  { path: "/account/admin-code", redirect: { name: "AdminAuthCode" } },
  { path: "/account/admin-login", redirect: { name: "AdminAuthSocialLogin" } },

  //관리자 페이지 영역
  { path: "/account/admin",
    component: AdminLayout,
    meta: { section: "ADMIN_APP", requiresAdmin: true },
    children: [
      { path: "", redirect: {name:"AdminOverview"} },
      {
        path:"overview",
        name: "AdminOverview",
        component:AdminOverview,
        meta: {section: "ADMIN_APP", requiresAdmin: true}
      },
      {
        path: "users",
        name: "AdminUsers",
        component: AdminUsers,
        meta: {section:"ADMIN_APP",requiresAdmin: true}
      },
      {
        path:"studyroom",
        name:"AdminStudyRoomReport",
        component: AdminStudyRoomReport,
        meta: {section: "ADMIN_APP",requiresAdmin: true}
      },
      {
        path:"awsCost",
        name:"AdminAwsCostExplorer",
        component: AdminAwsCostExplorer,
        meta: {section: "ADMIN_APP",requiresAdmin: true}
      },
        {
            path:"openaiCost",
            name:"AdminOpenAiCostView",
            component:AdminOpenAiCostView,
            meta: {section: "ADMIN_APP",requiresAdmin: true}
        }
    ],
  },
  // 소셜/게스트 인증 콜백
  { path: "/kakao_oauth/kakao-access-token", component: KakaoRedirection },
  { path: "/google-oauth/redirect-access-token", component: GoogleRedirection },
  { path: "/github-oauth/redirect-access-token", component: GithubRedirection },
  { path: "/guest-oauth/redirect-access-token", component: GuestRedirection },
  { path: "/naver-oauth/redirect-access-token", component: NaverRedirection },

  // fallback: 404 or main
  { path: "/:pathMatch(.*)*", redirect: "/account/login" },
];

const router = createRouter({
  history: createWebHistory("/vue-account/"),
  routes,
});
//전역 가드 등록
router.beforeEach(adminBeforeEach);

export default router;
