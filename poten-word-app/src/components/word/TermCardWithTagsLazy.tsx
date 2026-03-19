import React from "react";
import http from "../../utils/http.ts";
import TermCard, { TermCardProps } from "./TermCard.tsx";

type Props = Omit<TermCardProps, "tags"> & {
    /** 검색 응답 등으로 태그가 이미 있으면 그대로 사용 */
    tags?: string[];
    /** 필요 시 외부에서 API 교체 가능 (테스트/모킹 용) */
    fallbackApi?: (id: number) => Promise<string[]>;
};

/* ---- 모듈 레벨 캐시: 동일 용어에 대한 중복 호출 방지 ---- */
const TAGS_CACHE = new Map<number, string[]>();
const PENDING = new Map<number, Promise<string[]>>();

function dedupe(arr: (string | null | undefined)[]) {
    return Array.from(new Set(arr.filter(Boolean) as string[]));
}

/** 다양한 스키마를 단일 문자열 배열로 정규화 */
function normalizeTags(payload: any): string[] {
    if (!payload) return [];

    // 1) 배열로 바로 오는 경우 (["HTML","DOM"] 또는 [{name:"HTML"},{tag:{name:"DOM"}}])
    if (Array.isArray(payload)) {
        return dedupe(payload.map((x) => (typeof x === "string" ? x : x?.name ?? x?.tag?.name)));
    }

    // 2) 객체일 때 후보 키
    const fromKeys =
        payload.tags ??
        payload.tagNames ??
        payload.relatedKeywords ??
        payload.termTags ??
        [];
    if (Array.isArray(fromKeys)) {
        return dedupe(fromKeys.map((x: any) => (typeof x === "string" ? x : x?.name ?? x?.tag?.name)));
    }

    // 3) CSV 형태
    if (typeof payload.tagsCsv === "string" && payload.tagsCsv.trim()) {
        return dedupe(payload.tagsCsv.split(",").map((s: string) => s.trim()));
    }

    return [];
}

/** 기본 fetcher: GET /api/terms/{id}/tags */
const defaultFetcher = async (id: number): Promise<string[]> => {
    try {
        const res = await http.get(`/terms/${id}/tags`);
        return normalizeTags(res.data);
    } catch (e: any) {
        const status = e?.response?.status;
        // 인증/권한/없음/서버오류 모두 "태그 없음"으로 무해 처리
        if (status === 401 || status === 403 || status === 404 || status === 500) {
            console.warn("[tags] fetch failed:", { id, status, data: e?.response?.data });
            return [];
        }
        console.warn("[tags] fetch error:", e);
        return [];
    }
};

/** 캐시 래퍼 */
async function fetchTagsOnce(
    id: number,
    fetcher: (id: number) => Promise<string[]>
): Promise<string[]> {
    if (TAGS_CACHE.has(id)) return TAGS_CACHE.get(id)!;
    if (PENDING.has(id)) return PENDING.get(id)!;

    const p = fetcher(id)
        .then((arr) => {
            const deduped = dedupe(arr ?? []);
            TAGS_CACHE.set(id, deduped);
            return deduped;
        })
        .finally(() => {
            PENDING.delete(id);
        });

    PENDING.set(id, p);
    return p;
}

/** 테스트/핫리로드용 캐시 유틸 */
export const TagCache = {
    get: (id: number) => TAGS_CACHE.get(id),
    has: (id: number) => TAGS_CACHE.has(id),
    set: (id: number, tags: string[]) => TAGS_CACHE.set(id, dedupe(tags)),
    clear: () => {
        TAGS_CACHE.clear();
        PENDING.clear();
    },
};

const TermCardWithTagsLazy: React.FC<Props> = ({
                                                   id,
                                                   title,
                                                   description,
                                                   tags,
                                                   onAdd,
                                                   onTagClick,
                                                   onRequireAuth,
                                                   fallbackApi,
                                               }) => {
    // props.tags가 있으면 우선 사용, 없으면 lazy 로딩
    const [loadedTags, setLoadedTags] = React.useState<string[] | null>(
        Array.isArray(tags) ? dedupe(tags) : null
    );

    React.useEffect(() => {
        let cancelled = false;

        if (Array.isArray(tags)) {
            setLoadedTags(dedupe(tags));
            return;
        }

        (async () => {
            const fetcher = fallbackApi ?? defaultFetcher;
            const result = await fetchTagsOnce(id, fetcher);
            if (!cancelled) setLoadedTags(result);
        })();

        return () => {
            cancelled = true;
        };
    }, [id, tags, fallbackApi]);

    return (
        <TermCard
            id={id}
            title={title}
            description={description}
            tags={loadedTags ?? []}
            onAdd={onAdd}
            onTagClick={onTagClick}
            onRequireAuth={onRequireAuth}
        />
    );
};

export default React.memo(TermCardWithTagsLazy);
