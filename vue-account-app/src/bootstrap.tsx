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

let app: VueApp<Element> | null = null;
let shadowRootRef: ShadowRoot | null = null;
let routingHandler: ((path: string) => void) | null = null;
let lastEventBus: any | null = null;

export const vueAccountAppMount = async (el: string | Element, eventBus: any) => {
    const container = typeof el === "string" ? document.querySelector(el) : el;
    if (!container) return;

    const host = container as Element;
    const shadowRoot = (host as any).shadowRoot ?? host.attachShadow({ mode: "open" });
    shadowRootRef = shadowRoot;
    shadowRoot.innerHTML = "";

    const appRoot = document.createElement("div");
    appRoot.classList.add("v-application", "v-theme--light");
    (appRoot.style as any).visibility = "hidden";
    shadowRoot.appendChild(appRoot);

    await injectVuetifyCssIntoShadow(shadowRoot);

    await Promise.race([
        (document as any).fonts?.ready ?? Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 250)),
    ]);
    await loadFonts().catch(() => {});

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

    app = createApp({ render: () => h(App, { eventBus }) });
    const pinia = createPinia();
    app.use(vuetify).use(router).use(pinia);
    app.provide("eventBus", eventBus);

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

    app.mount(appRoot);
    requestAnimationFrame(() => {
        (appRoot.style as any).visibility = "";
    });
};

async function injectVuetifyCssIntoShadow(shadowRoot: ShadowRoot) {
    const [vuetifyCss, mdiCssRaw, tailwindCss] = await Promise.all([
        fetch("https://cdn.jsdelivr.net/npm/vuetify@3.9.0/dist/vuetify.min.css").then((r) => r.text()),
        fetch("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css").then((r) => r.text()),
        fetch("https://cdn.jsdelivr.net/npm/tailwindcss@4.1.12/dist/tailwind.min.css").then((r) => r.text()),
    ]);

    const mdiBase = "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/";
    const mdiCss = mdiCssRaw.replace(
        /url\((['"\\]?)(?!https?:|data:)([^'"\\)]+)\1\)/g,
        (_: string, _q: string, url: string) => `url('${new URL(url, mdiBase).href}')`
    );

    const style = document.createElement("style");
    style.id = "vuetify-shadow-css";
    style.textContent = `
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

    const tailwindStyle = document.createElement("style");
    tailwindStyle.id = "tailwind-shadow-css";
    tailwindStyle.textContent = tailwindCss;
    shadowRoot.appendChild(tailwindStyle);

    const customStyle = document.createElement("style");
    customStyle.id = "custom-shadow-css";
    customStyle.textContent = `
    :host {
      display: block;
      --flex-direction: row;
      --login-width: 50%;
    }

    .w-full { width: 100% !important; }
    .h-screen { height: 100vh !important; }
    .flex { display: flex !important; }
    .flex-row { flex-direction: row !important; }
    .flex-col { flex-direction: column !important; }
    .justify-center { justify-content: center !important; }
    .items-center { align-items: center !important; }
    .w-1\\/2 { width: 50% !important; }
    .p-16 { padding: 4rem !important; }
    .gap-6 { gap: 1.5rem !important; }
    .bg-black { background-color: #000 !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .text-white { color: #fff !important; }

    @media (max-width: 768px) {
      :host {
        --flex-direction: column;
        --login-width: 100%;
      }
    }
  `;
    shadowRoot.appendChild(customStyle);
}

export const vueAccountAppUnmount = () => {
    if (app) {
        app.unmount();
        app = null;
    }

    if (routingHandler && lastEventBus && typeof lastEventBus.off === "function") {
        lastEventBus.off("vue-account-routing-event", routingHandler);
    }
    routingHandler = null;

    if (shadowRootRef) {
        shadowRootRef.innerHTML = "";
        shadowRootRef = null;
    }

    lastEventBus = null;
};

interface EventBus {
    listeners: { [eventName: string]: Function[] };
    on(eventName: string, callback: Function): void;
    off(eventName: string, callback: Function): void;
    emit(eventName: string, data: any): void;
}

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

const root = document.querySelector("#vue-account-app");
if (root) {
    vueAccountAppMount(root, eventBus);
}
