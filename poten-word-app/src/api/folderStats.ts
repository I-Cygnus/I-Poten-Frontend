import http, { authHeader } from "../utils/http";

export type FolderSummary = {
    id: number;
    name: string;
    termCount: number;
    learnedCount?: number | null;
    updatedAt?: string | null;
};

export async function fetchMyFoldersWithStats(params: {
    page?: number;       // 0-base
    perPage?: number;    // 기본 20
    sort?: string;       // "sortOrder,asc" | "name,desc" | "updatedAt,desc" ...
    q?: string;
}) {
    const { page, perPage = 20, sort = "sortOrder,asc", q } = params || {};

    const res = await http.get("/me/wordbook/folders/stats", {
        params: page == null ? {} : { page, perPage, sort, q },
        headers: { ...authHeader() },
        withCredentials: true,
        validateStatus: () => true,
    });

    if (res.status !== 200) {
        const msg =
            (typeof res.data === "string" && res.data) ||
            res.data?.message ||
            `HTTP ${res.status}`;
        throw new Error(msg);
    }

    const isPaged = page != null;

    // 1) 헤더 total 시도
    const rawHeader =
        res.headers?.["x-total-count"] ?? res.headers?.["X-Total-Count"];
    const headerTotal = Number(rawHeader);
    const headerOk = Number.isFinite(headerTotal);

    // 2) items 파싱
    const items: FolderSummary[] = isPaged
        ? (Array.isArray(res.data) ? (res.data as any[]) : [])
        : (Array.isArray(res.data?.folders) ? (res.data.folders as any[]) : []);

    // 3) total 계산: 헤더가 없으면 "현재 페이지 길이"로 fallback
    const total = isPaged
        ? (headerOk ? headerTotal : items.length)
        : items.length;

    return {
        items,
        total,
        page: page ?? 0,
        perPage: isPaged ? perPage : items.length,
    };
}
