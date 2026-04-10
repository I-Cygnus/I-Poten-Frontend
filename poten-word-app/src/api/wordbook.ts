import http, { authHeader } from "../utils/http";

type FolderDTO = {
    id: number | string;
    wordbookName?: string;
    name?: string;
    title?: string;
    sortOrder?: number;
};

export async function fetchUserFolders(): Promise<Array<{ id: string; name: string }>> {
    const res = await http.get("/me/folders", { headers: { ...authHeader() } });
    const data = res?.data;

    const toArray = (d: any): FolderDTO[] => {
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.items)) return d.items;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.folders)) return d.folders;
        if (Array.isArray(d?.result)) return d.result;
        if (Array.isArray(d?.content)) return d.content;
        if (Array.isArray(d?.list)) return d.list;
        return [];
    };

    const items = toArray(data);
    return items.map((it) => ({
        id: String(it.id),
        name: it.wordbookName ?? it.name ?? it.title ?? "",
    }));
}

/** 폴더 순서 저장: 서버는 RPC 스타일(:reorder)만 OK */
export async function patchReorderFolders(orderedIds: Array<string | number>) {
    const ids = Array.from(new Set(orderedIds.map(Number).filter(Number.isFinite)));

    const headers = { ...authHeader() };

    // 1) 권장/정상: RPC 스타일
    try {
        await http.patch("/me/folders:reorder", { ids }, { headers });
        return;
    } catch (e1) {
        // 2) 폴백들 (혹시 다른 환경 대응)
        try {
            await http.post("/me/folders:reorder", { ids }, { headers });
            return;
        } catch (e2) {
            // 3) 마지막 폴백: REST 스타일 (여긴 현재 서버에서 500이니 거의 안 타게 됨)
            await http.patch("/me/folders/reorder", { ids }, { headers });
        }
    }
}

export type UserFolder = {
    id: string;
    name: string;
    termCount?: number;
    learnedCount?: number;
    updatedAt?: string | null;
};

// 이름/ID 전용 (이동/퀴즈 모달에서 사용)
export async function fetchUserFolders(): Promise<Array<{ id: string; name: string }>> {
    const res = await http.get("/me/folders", { headers: { ...authHeader() }, withCredentials: true });
    const data = res?.data;
    const arr =
        (Array.isArray(data) && data) ||
        data?.items || data?.data || data?.folders || data?.result || data?.content || data?.list || [];
    return arr.map((it: any) => ({
        id: String(it.id),
        name: it.wordbookName ?? it.name ?? it.title ?? "",
    }));
}

// 통계 포함 (폴더 목록 화면에서 사용)
export async function fetchUserFoldersWithStats(): Promise<UserFolder[]> {
    const call = (url: string) =>
        http.get(url, {
            headers: { ...authHeader() },
            withCredentials: true,
            validateStatus: () => true,
        });

    let res = await call("/me/wordbook/folders:stats");
    if (res.status === 404 || res.status === 405) {
        res = await call("/api/me/wordbook/folders:stats");
    }
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);

    const list = Array.isArray(res.data?.folders) ? res.data.folders : Array.isArray(res.data) ? res.data : [];
    return list.map((f: any) => ({
        id: String(f.id),
        name: f.name ?? f.wordbookName ?? f.title ?? "이름없음",
        termCount: Number(f.termCount ?? 0),
        learnedCount: Number(f.learnedCount ?? 0),
        updatedAt: f.updatedAt ?? null,
    }));
}