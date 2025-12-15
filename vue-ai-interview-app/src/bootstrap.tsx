// src/bootstrap.ts
import { createApp, h } from "vue";
import type { App as VueApp } from "vue";
import App from "./App.vue";
import { loadFonts } from "../src/plugins/webfontloader";

import "vuetify/styles";
// ⚠️ MDI 폰트는 Shadow DOM에 주입하므로 전역 import 제거 권장
// import "@mdi/font/css/materialdesignicons.css";

import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import * as labsComponents from "vuetify/labs/components";
import { createVuetify } from "vuetify/lib/framework.mjs";
import { createPinia } from "pinia";
import router from "./router";

let app: VueApp<Element> | null = null;
let shadowRootRef: ShadowRoot | null = null;
let routingHandler: ((path: string) => void) | null = null;
let lastEventBus: any | null = null;

export const vueAiInterviewAppMount = async (el: string | Element, eventBus: any) => {
    const container = typeof el === "string" ? document.querySelector(el) : el;
    if (!container) return;

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

    // 폰트 준비 – 너무 오래 걸리면 세이프가드로 진행
    await Promise.race([
        (document as any).fonts?.ready ?? Promise.resolve(),
        new Promise((r) => setTimeout(r, 250)), // 250ms
    ]);
    await loadFonts().catch(() => { /* 폰트 실패해도 앱은 띄운다 */ });

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
        lastEventBus.off("vue-board-routing-event", routingHandler);
    }
    routingHandler = (path: string) => {
        if (router.currentRoute.value.fullPath !== path) router.push(path);
    };
    if (eventBus && typeof eventBus.on === "function") {
        eventBus.on("vue-board-routing-event", routingHandler);
    }
    lastEventBus = eventBus;

    app.mount(shadowAppRoot);

    // 다음 프레임에 표시
    requestAnimationFrame(() => { (shadowAppRoot.style as any).visibility = ""; });
};

// ShadowRoot에 Vuetify/MDI css fetch해서 style로 삽입 (상대 경로 보정 포함)
async function injectVuetifyCssIntoShadow(shadowRoot: ShadowRoot) {
    const [vuetifyCss, mdiCssRaw] = await Promise.all([
        fetch("https://cdn.jsdelivr.net/npm/vuetify@3.9.0/dist/vuetify.min.css").then((r) => r.text()),
        fetch("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css").then((r) => r.text()),
    ]);

    // MDI 상대 폰트 경로를 절대 경로로 치환
    const mdiBase = "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/";
    const mdiCss = mdiCssRaw.replace(
        /url\((['"]?)(?!https?:|data:)([^'")]+)\1\)/g,
        (_: string, _q: string, url: string) => `url('${new URL(url, mdiBase).href}')`
    );

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
}

export const vueAiInterviewAppUnmount = () => {
    if (app) {
        app.unmount();
        app = null;
    }
    // 라우팅 핸들러 해제
    if (routingHandler && lastEventBus && typeof lastEventBus.off === "function") {
        lastEventBus.off("vue-board-routing-event", routingHandler);
    }
    routingHandler = null;
    lastEventBus = null;

    // ShadowRoot 비우기 (스타일/DOM 정리)
    if (shadowRootRef) {
        shadowRootRef.innerHTML = "";
        shadowRootRef = null;
    }
};

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
const root = document.querySelector("#vue-ai-interview-app");
if (root) { vueAiInterviewAppMount(root, eventBus); }
