import React from "react";
import http from "../utils/http";

export type Category = {
    id: number;
    type?: string | null;
    group_name?: string | null;
    name: string;
    depth: 0 | 1 | 2;
    sort_order?: number | null;
    parent_id: number | null;
};

type FetchParams = { depth?: 0 | 1 | 2; parentId?: number | null };

const keyOf = (p: FetchParams) => `d${p.depth ?? "any"}:${p.parentId ?? "root"}`;
const cache = new Map<string, Category[]>();

function normalize(list: any[]): Category[] {
    const arr = Array.isArray(list) ? list : [];
    const out = arr.map((c: any) => ({
        id: Number(c.id),
        type: c.type ?? null,
        group_name: c.group_name ?? c.groupName ?? null,
        name: String(c.name ?? c.group_name ?? c.type ?? ""),
        depth: Number(c.depth) as 0 | 1 | 2,
        sort_order: c.sort_order ?? c.sortOrder ?? null,
        parent_id: c.parent_id ?? c.parentId ?? null,
    })) as Category[];

    out.sort((a, b) => {
        const sa = a.sort_order ?? 99999;
        const sb = b.sort_order ?? 99999;
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name, "ko");
    });
    return out;
}

async function fetchCategories(p: FetchParams): Promise<Category[]> {
    const key = keyOf(p);
    if (cache.has(key)) return cache.get(key)!;

    const params: Record<string, any> = {};
    if (p.depth != null) params.depth = p.depth;
    if (p.parentId != null) { params.parentId = p.parentId; params.parent_id = p.parentId; }

    let data: any[] = [];
    try {
        const res = await http.get("/categories", { params });
        data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
    } catch {
        try {
            const res2 = await http.get("/categories", { params });
            data = Array.isArray(res2.data) ? res2.data : res2.data?.items ?? [];
        } catch {
            data = [];
        }
    }

    const list = normalize(data);
    cache.set(key, list);
    return list;
}

export function useCategoryTree(selected0?: number | null, selected1?: number | null) {
    const [d0, setD0] = React.useState<Category[]>([]);
    const [d1, setD1] = React.useState<Category[]>([]);
    const [d2, setD2] = React.useState<Category[]>([]);

    const [loading0, setLoading0] = React.useState(false);
    const [loading1, setLoading1] = React.useState(false);
    const [loading2, setLoading2] = React.useState(false);

    const [error0, setError0] = React.useState<string | null>(null);
    const [error1, setError1] = React.useState<string | null>(null);
    const [error2, setError2] = React.useState<string | null>(null);

    // depth 0
    React.useEffect(() => {
        let cancelled = false;
        setLoading0(true); setError0(null);
        fetchCategories({ depth: 0 })
            .then(arr => { if (!cancelled) { setD0(arr); console.debug("[cat:d0]", arr.length); } })
            .catch(e => { if (!cancelled) setError0(e?.message ?? "로드 오류"); })
            .finally(() => { if (!cancelled) setLoading0(false); });
        return () => { cancelled = true; };
    }, []);

    // depth 1 (중분류)
    React.useEffect(() => {
        console.debug("[cat:effect d1] selected0 =", selected0);
        if (!selected0) { setD1([]); setError1(null); setLoading1(false); return; }
        let cancelled = false;
        setLoading1(true); setError1(null);
        fetchCategories({ depth: 1, parentId: selected0 })
            .then(arr => { if (!cancelled) { setD1(arr); console.debug("[cat:d1]", { parent: selected0, len: arr.length }); } })
            .catch(e => { if (!cancelled) setError1(e?.message ?? "로드 오류"); })
            .finally(() => { if (!cancelled) setLoading1(false); });
        return () => { cancelled = true; };
    }, [selected0]);

    // depth 2 (소분류) — depth=2 먼저, 비면 fallback
    React.useEffect(() => {
        console.debug("[cat:effect d2] selected1 =", selected1);
        if (!selected1) { setD2([]); setError2(null); setLoading2(false); return; }
        let cancelled = false;
        setLoading2(true); setError2(null);

        (async () => {
            try {
                let arr = await fetchCategories({ depth: 2, parentId: selected1 });
                console.debug("[cat:d2 primary depth=2]", { parent: selected1, len: arr.length });

                if (!arr.length) {
                    const arr2 = await fetchCategories({ depth: 1, parentId: selected1 });
                    console.debug("[cat:d2 fallback depth=1]", { parent: selected1, len: arr2.length });
                    if (arr2.length) arr = arr2;
                }

                if (!arr.length) {
                    const arr3 = await fetchCategories({ parentId: selected1 });
                    console.debug("[cat:d2 fallback parentOnly]", { parent: selected1, len: arr3.length });
                    if (arr3.length) arr = arr3;
                }

                if (!cancelled) setD2(arr);
            } catch (e: any) {
                if (!cancelled) setError2(e?.message ?? "로드 오류");
            } finally {
                if (!cancelled) setLoading2(false);
            }
        })();

        return () => { cancelled = true; };
    }, [selected1]);

    return {
        level0: { items: d0, loading: loading0, error: error0 },
        level1: { items: d1, loading: loading1, error: error1 },
        level2: { items: d2, loading: loading2, error: error2 },
    };
}
export default http;