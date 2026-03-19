import http, { authHeader } from "../utils/http";

export type FolderSummary = {
    id: number;
    name: string;
    termCount: number;
    learnedCount?: number | null;
    updatedAt?: string | null;
};

type FetchMyFoldersWithStatsParams = {
    page?: number;       // 0-base
    perPage?: number;    // 기본 20
    sort?: string;       // "sortOrder,asc" | "name,desc" | "updatedAt,desc" ...
    q?: string;
};

function pickTotal(data: any, headers?: any): number {
    const headerRaw =
        headers?.["x-total-count"] ?? headers?.["X-Total-Count"];
    const headerTotal = Number(headerRaw);

    if (Number.isFinite(headerTotal)) return headerTotal;

    const candidates = [
        data?.total,
        data?.totalItems,
        data?.totalElements,
        data?.totalCount,
        data?.page?.totalElements,
        data?.pagination?.total,
        data?.meta?.total,
        data?.meta?.totalItems,
    ];

    for (const value of candidates) {
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0) return n;
    }

    return 0;
}

function pickItems(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.folders)) return data.folders;
    if (Array.isArray(data?.list)) return data.list;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    return [];
}

export async function fetchMyFoldersWithStats(params: FetchMyFoldersWithStatsParams) {
    const { page, perPage = 20, sort = "sortOrder,asc", q } = params || {};

    const queryParams: Record<string, any> = {
        sort,
        q,
    };

    if (page != null) {
        queryParams.page = page;
        queryParams.perPage = perPage;
    }

    const res = await http.get("/me/wordbook/folders/stats", {
        params: queryParams,
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

    const rawItems = pickItems(res.data);

    const items: FolderSummary[] = rawItems.map((item: any) => ({
        id: Number(item.id),
        name: item.name ?? item.wordbookName ?? "이름없음",
        termCount: Number(item.termCount ?? 0),
        learnedCount:
            item.learnedCount == null ? null : Number(item.learnedCount),
        updatedAt: item.updatedAt ?? null,
    }));

    const total = pickTotal(res.data, res.headers) || items.length;

    return {
        items,
        total,
        page: page ?? 0,
        perPage: page != null ? perPage : items.length,
    };
}