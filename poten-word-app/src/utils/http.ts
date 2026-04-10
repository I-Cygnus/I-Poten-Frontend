// src/utils/http.ts
import axios from "axios";

/** 주어진 base URL에 반드시 `/api`를 붙이되, 중복은 방지 */
function ensureApi(u?: string) {
    const base = String(u ?? "").trim().replace(/\/+$/, "");
    if (!base) return "http://localhost:8080/api";
    return base.endsWith("/api") ? base : base + "/api";
}

/** 빌드타임(DefinePlugin) + 런타임(window) + 폴백 순서 */
function detectApiBase(): string {
    // 1) 호스트/컨테이너에서 런타임 주입(리빌드 없이 교체 가능)
    const fromWindow = (globalThis as any)?.__API_BASE__;
    if (typeof fromWindow === "string" && fromWindow) return ensureApi(fromWindow);

    // 2) 빌드타임 주입(여기서는 **직접 키**를 참조해야 Rspack이 치환함)
    const fromDefine =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.VITE_API_BASE_URL ||
        process.env.VITE_API_BASE ||
        process.env.NEXT_PUBLIC_API_BASE ||
        process.env.API_BASE;
    if (fromDefine) return ensureApi(fromDefine);

    // 3) 동일 오리진 폴백
    if (typeof window !== "undefined" && window.location?.origin) {
        return ensureApi(window.location.origin);
    }
    return "http://localhost:8080/api";
}

export const API_BASE = detectApiBase();
console.info("[http] API_BASE =", API_BASE);

const http = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

/** 예전 코드 호환용 — 다들 가져다 쓰고 있으니 빈 객체라도 export */
export function authHeader() {
    return {};
}

/** 경로가 '/api/...'로 넘어오면 중복 제거: base=/api + url=/api/... => /api 만 남기기 */
http.interceptors.request.use((config) => {
    if (typeof config.url === "string") {
        // '/api/foo' -> '/foo'
        config.url = config.url.replace(/^\/api(\/|$)/, "/");
    }
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (err) => {
        const ebookErr = err?.response?.headers?.["ebook-error"];
        if (ebookErr) console.warn("[http] ebook-error:", ebookErr);
        return Promise.reject(err);
    }
);

export default http;
