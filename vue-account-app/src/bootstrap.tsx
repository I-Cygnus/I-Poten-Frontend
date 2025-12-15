// src/bootstrap.ts
import { createApp, h } from "vue";
import type { App as VueApp } from "vue";
import App from "./App.vue";
import { loadFonts } from "./plugins/webfontloader";
import "vuetify/styles";
// ⚠️ MDI CSS는 Shadow DOM에 주입하므로 전역 import 제거 권장
// import "@mdi/font/css/materialdesignicons.css";

import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import * as labsComponents from "vuetify/labs/components";
import { createVuetify } from "vuetify/lib/framework.mjs";
import { createPinia } from "pinia";
import router from "./router";
import {setupAdminInterceptors} from "@/administrator/utility/adminApi.ts";

let adminSecurityInitialized =false;
let offAdminSessionSync:null | (()=> void)=null;
let onUnauthorizedHandler: ((e:Event)=> void)| null =null;
let app: VueApp<Element> | null = null;
let shadowRootRef: ShadowRoot | null = null;
let routingHandler: ((path: string) => void) | null = null;
let lastEventBus: any | null = null;

export const vueAccountAppMount = async (el: string | Element, eventBus: any) => {
    const container = typeof el === "string" ? document.querySelector(el) : el;
    if (!container) return;
    // initAdminSecurityOnce();
    // 쉐도우 DOM 사용 코드 (주석 처리)
    /*
    // ShadowRoot 재사용(이미 있으면 attachShadow 금지)
    const shadowRoot: ShadowRoot =
        (container as any).shadowRoot ?? (container as Element).attachShadow({ mode: "open" });
    shadowRootRef = shadowRoot;

    // 초기화: 이전 스타일/DOM 제거
    shadowRoot.innerHTML = "";

    // Vue mount용 div (초기 숨김으로 FOUC 방지)
    const shadowAppRoot = document.createElement("div");
    shadowAppRoot.classList.add("v-application", "v-theme--light");
    (shadowAppRoot.style as any).visibility = "hidden";
    shadowRoot.appendChild(shadowAppRoot);

    // Vuetify / MDI CSS를 Shadow DOM에 주입 (대기)
    await injectVuetifyCssIntoShadow(shadowRoot);
    */

    // 일반 DOM 사용 코드 (쉐도우 DOM 제거)
    // 컨테이너 초기화
    container.innerHTML = "";

    // Vue mount용 div
    const appRoot = document.createElement("div");
    appRoot.classList.add("v-application", "v-theme--light");
    (appRoot.style as any).visibility = "hidden";
    container.appendChild(appRoot);

    // 필요한 CSS 스타일 로드 (전역 스타일시트로 적용)
    await injectGlobalCss();

    // 폰트 준비 – 너무 오래 걸리면 세이프가드로 진행
    await Promise.race([
        (document as any).fonts?.ready ?? Promise.resolve(),
        new Promise(r => setTimeout(r, 250)), // 250ms
    ]);
    await loadFonts().catch(() => { });

    // Vuetify 인스턴스
    const vuetify = createVuetify({
        components: { ...components, ...labsComponents },
        directives: { ...directives },
        icons: { defaultSet: "mdi", aliases, sets: { mdi } },
        theme: {
            defaultTheme: "light",
            themes: {
                light: {
                    dark: false,
                    colors: {
                        primary: "#1976D2",
                        error: "#D32F2F",
                        background: "#FFFFFF",
                        surface: "#FFFFFF",
                        "on-primary": "#FFFFFF",
                        "on-surface": "#000000",
                    },
                },
            },
            variations: { colors: ["primary", "error"], lighten: 5, darken: 5 },
        },
    });

    // Vue 앱 생성/마운트
    app = createApp({ render: () => h(App, { eventBus }) });
    const pinia = createPinia();
    app.use(vuetify).use(router).use(pinia);
    app.provide("eventBus", eventBus);

    // 라우팅 이벤트 핸들러 중복 방지: 이전 핸들러 해제 후 등록
    if (routingHandler && lastEventBus && typeof lastEventBus.off === "function") {
        lastEventBus.off("vue-account-routing-event", routingHandler);
    }
    routingHandler = (path: string) => {
        if (router.currentRoute.value.fullPath !== path) router.push(path);
    };
    if (eventBus && typeof eventBus.on === "function") {
        eventBus.on("vue-account-routing-event", routingHandler);
    }
    lastEventBus = eventBus;

    // 쉐도우 DOM 사용 코드 (주석 처리)
    /*
    app.mount(shadowAppRoot);

    // 다음 프레임에 표시
    requestAnimationFrame(() => { (shadowAppRoot.style as any).visibility = ""; });
    */

    // 일반 DOM 사용 코드
    app.mount(appRoot);

    // 다음 프레임에 표시
    requestAnimationFrame(() => { (appRoot.style as any).visibility = ""; });
};

// 쉐도우 DOM에 Vuetify/MDI/Tailwind css fetch해서 style로 삽입 (상대 경로 보정 포함) - 주석 처리된 코드
async function injectVuetifyCssIntoShadow(shadowRoot: ShadowRoot) {
    const [vuetifyCss, mdiCssRaw, tailwindCss] = await Promise.all([
        fetch("https://cdn.jsdelivr.net/npm/vuetify@3.9.0/dist/vuetify.min.css").then((r) => r.text()),
        fetch("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css").then((r) => r.text()),
        // Tailwind CSS CDN 추가
        fetch("https://cdn.jsdelivr.net/npm/tailwindcss@4.1.12/dist/tailwind.min.css").then((r) => r.text()),
    ]);

    // MDI 상대 폰트 경로를 절대 경로로 치환
    const mdiBase = "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/";
    const mdiCss = mdiCssRaw.replace(
        /url\((['"\\]?)(?!https?:|data:)([^'"\\)]+)\1\)/g,
        (_: string, _q: string, url: string) => `url('${new URL(url, mdiBase).href}')`
    );

    // 기본 스타일 요소 생성
    const style = document.createElement("style");
    style.id = "vuetify-shadow-css";
    style.textContent = `
    /* 초기 토큰 선언으로 계산 안정화 */
    :host, .v-theme--light {
      --v-theme-primary: #1976D2;
      --v-theme-error: #D32F2F;
      --v-theme-background: #FFFFFF;
      --v-theme-surface: #FFFFFF;
      --v-theme-on-primary: #FFFFFF;
      --v-theme-on-error: #FFFFFF;
      --v-theme-on-surface: #000000;
    }
    ${vuetifyCss}
    ${mdiCss}
  `;
    shadowRoot.appendChild(style);

    // Tailwind CSS를 별도 스타일 요소로 추가
    const tailwindStyle = document.createElement("style");
    tailwindStyle.id = "tailwind-shadow-css";
    tailwindStyle.textContent = tailwindCss;
    shadowRoot.appendChild(tailwindStyle);

    // 커스텀 CSS 변수 및 레이아웃 스타일 추가
    const customStyle = document.createElement("style");
    customStyle.id = "custom-shadow-css";
    customStyle.textContent = `
    /* 레이아웃 관련 CSS 변수 */
    :host {
      --flex-direction: row;
      --login-width: 50%;
    }
    
    /* Tailwind 클래스 보완 스타일 */
    .w-full { width: 100% !important; }
    .h-screen { height: 100vh !important; }
    .flex { display: flex !important; }
    .flex-row { flex-direction: row !important; }
    .flex-col { flex-direction: column !important; }
    .justify-center { justify-content: center !important; }
    .items-center { align-items: center !important; }
    .w-1/2 { width: 50% !important; }
    .p-16 { padding: 4rem !important; }
    .gap-6 { gap: 1.5rem !important; }
    .bg-black { background-color: #000 !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .text-white { color: #fff !important; }
    
    /* 반응형 스타일 */
    @media (max-width: 768px) {
      :host {
        --flex-direction: column;
        --login-width: 100%;
      }
    }
  `;
    shadowRoot.appendChild(customStyle);
}

// 일반 DOM에 전역 스타일 주입 (쉐도우 DOM 제거 버전)
async function injectGlobalCss() {
    const [vuetifyCss, mdiCssRaw, tailwindCss] = await Promise.all([
        fetch("https://cdn.jsdelivr.net/npm/vuetify@3.9.0/dist/vuetify.min.css").then((r) => r.text()),
        fetch("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css").then((r) => r.text()),
        // Tailwind CSS CDN 추가
        fetch("https://cdn.jsdelivr.net/npm/tailwindcss@4.1.12/dist/tailwind.min.css").then((r) => r.text()),
    ]);

    // MDI 상대 폰트 경로를 절대 경로로 치환
    const mdiBase = "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/";
    const mdiCss = mdiCssRaw.replace(
        /url\((['"\\]?)(?!https?:|data:)([^'"\\)]+)\1\)/g,
        (_: string, _q: string, url: string) => `url('${new URL(url, mdiBase).href}')`
    );

    // 기존 스타일 요소가 있는지 확인
    let vuetifyStyle = document.getElementById("vuetify-global-css");
    if (!vuetifyStyle) {
        vuetifyStyle = document.createElement("style");
        vuetifyStyle.id = "vuetify-global-css";
        document.head.appendChild(vuetifyStyle);
    }
    vuetifyStyle.textContent = vuetifyCss;

    // MDI 아이콘 스타일 추가
    let mdiStyle = document.getElementById("mdi-global-css");
    if (!mdiStyle) {
        mdiStyle = document.createElement("style");
        mdiStyle.id = "mdi-global-css";
        document.head.appendChild(mdiStyle);
    }
    mdiStyle.textContent = mdiCss;

    // Tailwind CSS 추가
    let tailwindStyle = document.getElementById("tailwind-global-css");
    if (!tailwindStyle) {
        tailwindStyle = document.createElement("style");
        tailwindStyle.id = "tailwind-global-css";
        document.head.appendChild(tailwindStyle);
    }
    tailwindStyle.textContent = tailwindCss;

    // 커스텀 CSS 변수 및 레이아웃 스타일 추가
    let customStyle = document.getElementById("custom-global-css");
    if (!customStyle) {
        customStyle = document.createElement("style");
        customStyle.id = "custom-global-css";
        document.head.appendChild(customStyle);
    }
    customStyle.textContent = `
    /* 레이아웃 관련 CSS 변수 */
    :root {
      --flex-direction: row;
      --login-width: 50%;
    }
    
    /* 반응형 스타일 */
    @media (max-width: 768px) {
      :root {
        --flex-direction: column;
        --login-width: 100%;
      }
    }
    `;
}

export const vueAccountAppUnmount = () => {
    if (app) {
        app.unmount();
        app = null;
    }
    // 라우팅 핸들러 해제
    if (routingHandler && lastEventBus && typeof lastEventBus.off === "function") {
        lastEventBus.off("vue-account-routing-event", routingHandler);
    }
    routingHandler = null;

    // // ⬇️ 추가: 보안 리스너 해제
    // if (onUnauthorizedHandler) {
    //     window.removeEventListener("admin-unauthorized", onUnauthorizedHandler);
    //     onUnauthorizedHandler = null;
    // }
    // if (offAdminSessionSync) {
    //     offAdminSessionSync();
    //     offAdminSessionSync = null;
    // }
    // 쉐도우 DOM 사용 코드 (주석 처리)
    /*
    // ShadowRoot 비우기 (스타일/DOM 정리)
    if (shadowRootRef) {
        shadowRootRef.innerHTML = "";
        shadowRootRef = null;
    }
    */

    // 일반 DOM 사용 코드
    // 기존 전역 스타일은 유지 (다른 앱에서도 사용할 수 있음)

    lastEventBus = null;
};
// function initAdminSecurityOnce() {
//     if (adminSecurityInitialized) return;
//     adminSecurityInitialized = true;
//
//     // 1) Axios 인터셉터 1회 등록 (401/403 → 이벤트 발생)
//     setupAdminInterceptors();
//
//     // 2) 401/403 통지 수신 → 관리자 인증 절차로 회송
//     onUnauthorizedHandler = () => {
//         const inAdmin = router.currentRoute.value.matched.some(
//             (r) => r.meta?.section === "ADMIN_APP"
//         );
//         if (inAdmin) router.replace({ name: "AdminAuthCode" });
//     };
//     window.addEventListener("admin-unauthorized", onUnauthorizedHandler);
//
//     // 3) (선택) AdminSession 멀티탭 동기화 수신
//     offAdminSessionSync = listenAdminSessionSync({
//         onClear: () => {
//             const inAdmin = router.currentRoute.value.matched.some(
//                 (r) => r.meta?.section === "ADMIN_APP"
//             );
//             if (inAdmin) router.replace({ name: "AdminAuthCode" });
//         },
//         // onSet: (s) => console.log("[admin-sync] SET", s),
//     });
//
//
//     const s = loadAdminSession();
//     if (!s) {
//         // router.replace({ name: "AdminAuthCode" });
//     }
// }
interface EventBus {
    listeners: { [eventName: string]: Function[] };
    on(eventName: string, callback: Function): void;
    off(eventName: string, callback: Function): void;
    emit(eventName: string, data: any): void;
}

// 로컬 개발용 간단 EventBus (호스트가 넘겨줄 때는 사용되지 않음)
const eventBus: EventBus = {
    listeners: {},
    on(eventName, callback) {
        if (!this.listeners[eventName]) this.listeners[eventName] = [];
        this.listeners[eventName].push(callback);
    },
    off(eventName, callback) {
        if (!this.listeners[eventName]) return;
        const idx = this.listeners[eventName].indexOf(callback);
        if (idx !== -1) this.listeners[eventName].splice(idx, 1);
    },
    emit(eventName, data) {
        if (!this.listeners[eventName]) return;
        this.listeners[eventName].forEach((cb) => cb(data));
    },
};

// 독립 실행(로컬 테스트) 시 자동 마운트
const root = document.querySelector("#vue-account-app");
if (root) { vueAccountAppMount(root, eventBus); }
