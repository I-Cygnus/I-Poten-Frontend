import axios from "axios";

// 멀티 빌드툴 공용 API 베이스 헬퍼 (Vite/CRA/Next/Webpack + 런타임 주입)
const API_BASE =
    (typeof window !== "undefined" && (window as any).__API_BASE__) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) ||
    (process?.env?.REACT_APP_API_BASE as string | undefined) ||
    (process?.env?.NEXT_PUBLIC_API_BASE as string | undefined) ||
    (process?.env?.API_BASE as string | undefined) ||
    "/api"; // 기본값: 같은 도메인의 /api 프록시

const axiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});