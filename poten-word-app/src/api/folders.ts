import http, { authHeader } from "../utils/http";

type FolderDTO = { id: number | string; wordbookName?: string; name?: string; title?: string; sortOrder?: number };

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
    return items.map(it => ({ id: String(it.id), name: it.wordbookName ?? it.name ?? it.title ?? "" }));
}

export async function patchReorderFolders(orderedIds: Array<string | number>) {
    const ids = orderedIds.map(Number).filter(Number.isFinite);
    await http.patch("/me/folders:reorder", { ids }, { headers: { ...authHeader() } });
}
