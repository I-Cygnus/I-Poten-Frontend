import React, {useCallback} from "react";
import styled from "styled-components";
import { useSearchParams, useNavigationType, useNavigate } from "react-router-dom";
import http from "../../utils/http.ts";
import { fetchTermsByTag } from "../../api/termApi.ts";   // 태그 전용 API
import TermCardWithTagsLazy from "../../components/word/TermCardWithTagsLazy.tsx";

// 단어장 모달 & 폴더 관련 API
import PotenNoteModal from "../../components/note/PotenNoteModal.tsx";
import SystemMessageModal, { SystemMessage } from "../../components/common/SystemMessageModal.tsx";
import { fetchUserFolders, patchReorderFolders } from "../../api/wordbook.ts";
import { deleteUserFolder, deleteUserFoldersBulk, renameUserFolder } from "../../api/folder.ts";
import { NarrowLeft } from "../../styles/layout.ts";

/** 타입 정의 */
type Term = { id: number; title: string; description: string; tags?: string[] };
type ApiItem = {
    id: number | string;
    title: string;
    description?: string | null;
    tags?: string[] | null;
    relatedKeywords?: string[] | null;
    tagNames?: string[] | null;
    termTags?: Array<{ tag?: { name?: string }; name?: string }>;
    tagsCsv?: string | null;
};
type ApiResponse = {
    q?: string; page?: number; size?: number; total?: number;
    items?: ApiItem[]; content?: ApiItem[]; totalElements?: number;
};
type CacheData = { q: string; items: Term[]; total: number; scrollY?: number };

// 모달용 타입
type Notebook = { id: string; name: string };

/** 세션 캐시 유틸 */
const readCache = (k: string): CacheData | null => {
    try {
        const r = sessionStorage.getItem(k);
        return r ? JSON.parse(r) : null;
    } catch {
        return null;
    }
};
const writeCache = (k: string, d: CacheData) => {
    try {
        sessionStorage.setItem(k, JSON.stringify(d));
    } catch {}
};

/** 디자인 토큰 */
const TOKENS = {
    color: {
        text: "#374151",
        textMuted: "#6b7280",
        textBlue: "#2563eb",
        red: "#dc2626",
        bg: "#ffffff",
        border: "#e5e7eb",
        chipBg: "#eef2ff",
        chipBorder: "#c7d2fe",
    },
    space: (n: number) => `${n}px`,
    font: { base: "14px", small: "12px", strong: 600 },
    radius: 14,
    shadow: { xl: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" },
} as const;

/** WordbookPage 톤 맞춤 */
const UI = {
    gradient: {
        brand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
        brandSoft: "linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%)",
    },
    color: {
        primaryStrong: "#3E63E0",
        trayBg: "#0f172a",
        trayText: "#ffffff",
        line: "#e5e7eb",
    },
    radius: { pill: 999, xl: 20 },
    space: (n: number) => `${n}px`,
};

/* ---------------------- styled-components ---------------------- */
const Root = styled.div`
    margin-top: ${TOKENS.space(16)};
`;

const InfoRow = styled.div`
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: ${TOKENS.space(8)};
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    font-size: ${TOKENS.font.base};
    color: ${TOKENS.color.textMuted};
`;

const Spacer = styled.div`
    flex: 1 1 auto;
`;

const InfoStrongNum = styled.span`
    font-weight: ${TOKENS.font.strong};
    color: ${TOKENS.color.textBlue};
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${TOKENS.space(6)};
    border-radius: ${TOKENS.radius}px;
    background: ${TOKENS.color.chipBg};
    border: 1px solid ${TOKENS.color.chipBorder};
    padding: ${TOKENS.space(4)} ${TOKENS.space(8)};
    font-size: ${TOKENS.font.small};
    color: ${TOKENS.color.textBlue};
    font-weight: 700;
    flex: 0 0 auto;
`;

const Tail = styled.span`
    flex: 0 0 auto;
`;
const LoadingMsg = styled.div`
    margin-top: ${TOKENS.space(16)};
    color: ${TOKENS.color.textMuted};
`;
const ErrorMsg = styled.div`
    margin-top: ${TOKENS.space(16)};
    color: ${TOKENS.color.red};
`;
const List = styled.ul`
    margin-top: ${TOKENS.space(16)};
    padding: 0;
    list-style: none;
`;
const ListItem = styled.li`
    & + & {
        margin-top: ${TOKENS.space(16)};
    }
`;

/** 카드 래퍼 + 체크 정렬 */
const CardWrap = styled.div`
    position: relative;
    border-radius: 16px;
`;
const CHECK_W = 28;
const CHECK_GAP = 10;
const TITLE_SHIFT = CHECK_W + CHECK_GAP;

const AlignWithCheck = styled.div`
    article h3[id^="term-"] {
        margin-left: ${TITLE_SHIFT}px !important;
    }
`;

/** WordbookPage 동일 체크 토글 */
const SelectToggle = styled.button<{ $on?: boolean }>`
    position: absolute;
    top: 22px;
    left: 20px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${CHECK_W}px;
    height: ${CHECK_W}px;
    border-radius: ${UI.radius.pill}px;
    border: 0;

    background: ${({ $on }) => ($on ? UI.gradient.brand : UI.gradient.brandSoft)};
    color: ${({ $on }) => ($on ? "#fff" : "#0f172a")};
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);

    cursor: pointer;
    line-height: 0;
    overflow: hidden;
    contain: paint;
    backface-visibility: hidden;
    -webkit-tap-highlight-color: transparent;
    transition: transform 80ms ease, filter 160ms ease;

    &:hover {
        filter: brightness(0.98);
    }
    &:active {
        transform: scale(0.97);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.35);
    }
`;

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "block" }} aria-hidden="true">
        <path
            d="M20 7L10 17l-6-6"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);
const Hollow = styled.span`
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid ${UI.color.primaryStrong};
    background: rgba(255, 255, 255, 0.7);
    display: block;
`;

/** 상단 현재 페이지 전체 선택 버튼 */
const PrimaryBtn = styled.button`
    height: 32px;
    padding: 0 12px;
    border-radius: ${UI.radius.pill}px;
    border: 0;
    background: ${UI.gradient.brand};

    appearance: none;
    color: #fff !important;
    -webkit-text-fill-color: #fff;
    && {
        color: #fff;
        -webkit-text-fill-color: #fff;
    }

    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: transform 80ms ease, filter 160ms ease;

    &:hover {
        filter: brightness(0.98);
    }
    &:active {
        transform: scale(0.98);
    }
`;

/** 하단 액션바 */
const Tray = styled.div`
    position: sticky;
    bottom: 0;
    z-index: 7;
    background: ${UI.color.trayBg};
    color: ${UI.color.trayText};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    margin-top: 10px;
`;

const TrayBtns = styled.div`
    display: flex;
    gap: 8px;
`;
const TrayGhostBtn = styled.button`
    border: 1px solid ${UI.color.line};
    background: transparent;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
`;
const TrayPrimary = styled.button`
    border: 0;
    background: ${UI.gradient.brand};
    color: #fff;
    padding: 8px 14px;
    border-radius: 999px;
    font-weight: 700;
    letter-spacing: 0.01em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
    cursor: pointer;
`;

/* ---------- Pagination ---------- */
type PaginationProps = {
    page: number;
    size: number;
    total: number;
    onChange: (nextPageZeroBased: number) => void;
};
const PaginationNav = styled.nav`
    margin-top: ${TOKENS.space(16)};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${TOKENS.space(8)};
    user-select: none;
`;
const PageNumBtn = styled.button<{ $active: boolean }>`
    min-width: 34px;
    height: 34px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? TOKENS.color.textBlue : TOKENS.color.border)};
    background: ${({ $active }) => ($active ? TOKENS.color.textBlue : "#fff")};
    color: ${({ $active }) => ($active ? "#fff" : TOKENS.color.text)};
    font-weight: ${({ $active }) => ($active ? 700 : 600)};
    cursor: pointer;
`;
const NavBtn = styled.button<{ $disabled: boolean }>`
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid ${TOKENS.color.border};
    background: #fff;
    color: ${({ $disabled }) => ($disabled ? "#c7c7c7" : TOKENS.color.text)};
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

const Pagination: React.FC<PaginationProps> = ({ page, size, total, onChange }) => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / (size || 1)));
    const current = page + 1; // 1-base
    const maxNumbers = 10;

    let start = Math.max(1, current - Math.floor(maxNumbers / 2));
    let end = Math.min(totalPages, start + maxNumbers - 1);
    start = Math.max(1, end - maxNumbers + 1);

    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);

    const go = (p1: number) => {
        if (p1 < 1 || p1 > totalPages || p1 === current) return;
        onChange(p1 - 1);
    };

    return (
        <PaginationNav aria-label="페이지네이션">
            <NavBtn aria-label="처음" onClick={() => go(1)} disabled={current === 1} $disabled={current === 1}>
                «
            </NavBtn>
            <NavBtn
                aria-label="이전"
                onClick={() => go(current - 1)}
                disabled={current === 1}
                $disabled={current === 1}
            >
                ‹
            </NavBtn>
            {nums.map((n) => (
                <PageNumBtn
                    key={n}
                    onClick={() => go(n)}
                    aria-current={n === current ? "page" : undefined}
                    $active={n === current}
                >
                    {n}
                </PageNumBtn>
            ))}
            <NavBtn
                aria-label="다음"
                onClick={() => go(current + 1)}
                disabled={current === totalPages}
                $disabled={current === totalPages}
            >
                ›
            </NavBtn>
            <NavBtn
                aria-label="마지막"
                onClick={() => go(totalPages)}
                disabled={current === totalPages}
                $disabled={current === totalPages}
            >
                »
            </NavBtn>
        </PaginationNav>
    );
};

/** 유틸: 태그 배열 정제/중복 제거 */
const uniqTags = (arr?: string[] | null) =>
    Array.from(new Set((arr ?? []).filter(Boolean))) as string[];

/** ===== 공용 POST 폴백 도우미 ===== */
async function postWithFallback(urls: string[], body: any) {
    let lastErr: any;
    for (const u of urls) {
        try {
            const res = await http.post(u, body);
            // 항상 body만 반환
            return res?.data ?? res;
        } catch (e: any) {
            lastErr = e;
            if (e?.response?.status !== 404) throw e;
        }
    }
    throw lastErr;
}

/** 단일/벌크 공용: 항상 :bulk 호출 */
async function attachTermsBulk(wordbookId: string, termIds: number[]) {
    return postWithFallback(
        [`/me/folders/${wordbookId}/terms:bulk`, `/api/me/folders/${wordbookId}/terms:bulk`],
        { termIds }
    );
}

/** 단일 저장 도우미 (현재는 사용 안 함: bulk로 통일) */
async function attachSingleTermToFolder(wordbookId: string, termId: number) {
    return postWithFallback(
        [`/me/folders/${wordbookId}/terms`, `/api/me/folders/${wordbookId}/terms`],
        { termId }
    );
}

/** ---------------------- 검색 페이지 ---------------------- */
export default function SearchPage() {
    const [params] = useSearchParams();
    const navType = useNavigationType();
    const navigate = useNavigate();

    // 시스템 메시지 모달 상태
    const [systemMessage, setSystemMessage] = React.useState<SystemMessage | null>(null);
    const [systemOpen, setSystemOpen] = React.useState(false);

    const showMessage = React.useCallback((msg: SystemMessage) => {
        setSystemMessage(msg);
        setSystemOpen(true);
    }, []);

    const q = (params.get("q") ?? "").trim();
    const tag = params.get("tag") ?? ""; // 태그 전용
    const catPath = params.get("catPath") ?? ""; // 카테고리 경로(예: "1/4/12")
    const page = Number(params.get("page") ?? 0) || 0;
    const size = Number(params.get("size") ?? 20) || 20;

    // 필터 파라미터
    const initial = params.get("initial") || "";
    const alpha = params.get("alpha") || "";
    const symbol = params.get("symbol") || "";

    // 선택된 카테고리 id (catPath의 마지막 조각)
    const catId = React.useMemo(() => {
        const parts = (catPath || "")
            .split("/")
            .map((s) => s.trim())
            .filter(Boolean);
        return parts.length ? Number(parts[parts.length - 1]) : null;
    }, [catPath]);

    // 상태
    const [results, setResults] = React.useState<Term[]>([]);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // 선택 상태
    const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
    const currentPageIds = React.useMemo(() => results.map((r) => r.id), [results]);
    const allChecked = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
    const selectedCount = selectedIds.size;

    const toggleOne = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const toggleAllCurrentPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const every = currentPageIds.every((id) => next.has(id));
            if (every) currentPageIds.forEach((id) => next.delete(id));
            else currentPageIds.forEach((id) => next.add(id));
            return next;
        });
    };
    const clearAllSelected = useCallback(() => setSelectedIds(new Set()), []);

    // 액션바 표시 토글 (닫기)
    const [showTray, setShowTray] = React.useState(true);
    React.useEffect(() => {
        if (selectedCount > 0) setShowTray(true);
    }, [selectedCount]);

    // 모달 상태
    const [moveOpen, setMoveOpen] = React.useState(false);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);
    const [selectedTermId, setSelectedTermId] = React.useState<number | null>(null); // 단일 추가용
    const [pendingTermIds, setPendingTermIds] = React.useState<number[] | null>(null); // 벌크 추가용
    const [saving, setSaving] = React.useState(false); // 저장 중 중복 클릭 방지
    const [savedEver, setSavedEver] = React.useState<Set<number>>(new Set());

    // 캐시 키
    const cacheKey = React.useMemo(
        () =>
            `term_search:q${q}:tag${tag}:cat${catPath || "none"}:p${page}:s${size}:i${initial}:a${alpha}:s${symbol}`,
        [q, tag, catPath, page, size, initial, alpha, symbol]
    );

    /** 언마운트 시 스크롤 저장 */
    React.useEffect(() => {
        return () => {
            const base = readCache(cacheKey) ?? { q, items: results, total };
            writeCache(cacheKey, { ...base, scrollY: window.scrollY });
        };
    }, [cacheKey, q, results, total]);

    /** 검색 + 캐시 복원 */
    React.useEffect(() => {
        const hasFilter = !!(q || tag || initial || alpha || symbol || catId);

        // 필터가 하나도 없으면 초기 상태
        if (!hasFilter) {
            setResults([]);
            setTotal(0);
            setError(null);
            setLoading(false);
            clearAllSelected();
            requestAnimationFrame(() => window.scrollTo(0, 0));
            return;
        }

        // ----- POP 내비게이션일 때 세션 캐시 우선 복원 -----
        if (navType === "POP") {
            const cached = readCache(cacheKey);
            if (cached && Array.isArray(cached.items)) {
                setResults(cached.items);
                setTotal(cached.total ?? 0);
                setError(null);
                setLoading(false);
                // 스크롤 복원
                requestAnimationFrame(() => {
                    window.scrollTo(0, cached.scrollY ?? 0);
                });
                // POP + 캐시 있는 경우에는 네트워크 호출 스킵
                return;
            }
        }

        const ac = new AbortController();

        setLoading(true);
        setError(null);

        (async () => {
            try {
                let items: Term[] = [];
                let nextTotalNum = 0;

                if (tag) {
                    // ===== 태그 검색 =====
                    const res = await fetchTermsByTag(tag, page + 1, size);
                    const rawItems = (res as any).termList ?? [];
                    items = rawItems.map((it: any) => ({
                        id: Number(it.id),
                        title: it.title,
                        description: it.description ?? "",
                        tags: uniqTags(it.tags ?? []),
                    }));
                    const t = (res as any).totalItems;
                    if (typeof t === "number") nextTotalNum = t;

                    // 태그인데 결과 0개면 not-found 페이지로 이동
                    if (nextTotalNum === 0) {
                        const spNF = new URLSearchParams();
                        spNF.set("tag", tag);
                        navigate(
                            {
                                pathname: "../terms/not-found",
                                search: `?${spNF.toString()}`,
                            },
                            { replace: true }
                        );
                        return;
                    }
                } else {
                    // ===== 일반 검색(q, initial, alpha, symbol, catPath) =====
                    const res = await http.get<ApiResponse>("/terms/search", {
                        params: { q, page, size, initial, alpha, symbol, catPath },
                        signal: ac.signal,
                    });

                    const rawItems = res.data.items ?? res.data.content ?? [];
                    items = rawItems.map((it) => ({
                        id: Number(it.id),
                        title: it.title,
                        description: it.description ?? "",
                        tags: extractTags(it),
                    }));

                    const dataAny = res.data as any;
                    if (typeof dataAny.total === "number") {
                        nextTotalNum = dataAny.total;
                    } else if (typeof dataAny.totalElements === "number") {
                        nextTotalNum = dataAny.totalElements;
                    }
                }

                // 페이지 범위 보정
                const totalPages = Math.max(1, Math.ceil((nextTotalNum || 0) / (size || 1)));
                if (page > totalPages - 1 && nextTotalNum > 0) {
                    const sp = new URLSearchParams();
                    if (q) sp.set("q", q);
                    if (tag) sp.set("tag", tag);
                    if (initial) sp.set("initial", initial);
                    if (alpha) sp.set("alpha", alpha);
                    if (symbol) sp.set("symbol", symbol);
                    if (catPath) sp.set("catPath", catPath);
                    sp.set("page", String(totalPages - 1));
                    sp.set("size", String(size || 20));
                    navigate({ search: `?${sp.toString()}` }, { replace: true });
                    return;
                }

                setResults(items);
                setTotal(nextTotalNum);

                // 현재 페이지에 없는 선택은 정리
                setSelectedIds((prev) => {
                    const keep = new Set<number>();
                    const idsOnPage = new Set(items.map((i) => i.id));
                    prev.forEach((id) => {
                        if (idsOnPage.has(id)) keep.add(id);
                    });
                    return keep;
                });

                // 캐시에도 저장 (스크롤은 0으로)
                writeCache(cacheKey, { q, items, total: nextTotalNum, scrollY: 0 });
            } catch (e: any) {
                if (ac.signal.aborted) return;

                const status = e?.response?.status;
                const ebookErr = e?.response?.headers?.["ebook-error"];
                const serverMsg = e?.response?.data?.message || e?.message;

                setError(
                    status
                        ? `오류(${status}) ${serverMsg || ""}${ebookErr ? ` [${ebookErr}]` : ""}`
                        : serverMsg || "검색 중 오류가 발생했습니다."
                );
            } finally {
                if (!ac.signal.aborted) {
                    setLoading(false);
                }
            }
        })();

        return () => ac.abort();
    }, [q, tag, page, size, initial, alpha, symbol, catId, catPath, cacheKey, navigate, navType]);

    /** 태그 배열 추출 (응답 방어) */
    const extractTags = (it: ApiItem): string[] | undefined => {
        if (Array.isArray(it.tags)) return uniqTags(it.tags);
        if (Array.isArray(it.relatedKeywords)) return uniqTags(it.relatedKeywords);
        if (Array.isArray(it.tagNames)) return uniqTags(it.tagNames);
        if (Array.isArray(it.termTags)) {
            return uniqTags(
                it.termTags
                    .map((x) => x?.tag?.name ?? x?.name)
                    .filter((v): v is string => !!v)
            );
        }
        if (typeof it.tagsCsv === "string" && it.tagsCsv.trim()) {
            return uniqTags(
                it.tagsCsv.split(",").map((s) => s.trim())
            );
        }
        return undefined;
    };

    /** 페이지 이동 */
    const handlePageChange = (nextZeroBased: number) => {
        const sp = new URLSearchParams();
        if (q) sp.set("q", q);
        if (tag) sp.set("tag", tag);
        if (initial) sp.set("initial", initial);
        if (alpha) sp.set("alpha", alpha);
        if (symbol) sp.set("symbol", symbol);
        if (catPath) sp.set("catPath", catPath);
        sp.set("page", String(nextZeroBased));
        sp.set("size", String(size || 20));
        navigate({ search: `?${sp.toString()}` });
    };

    /** 카드 내 태그 클릭 → 태그 검색으로 전환 */
    const handleTagClick = (t: string) => {
        const sp = new URLSearchParams();
        sp.set("tag", t);
        sp.set("page", "0");
        sp.set("size", String(size || 20));
        navigate({ search: `?${sp.toString()}` });
    };

    /** 단일 or 벌크 저장 트리거: (+) 버튼
     *  - 선택된 항목이 있으면: 선택 집합 + 클릭한 카드 → 벌크 저장 모달
     *  - 선택이 없으면: 클릭한 카드만 → 단일 저장 모달
     */
    const handleAddClick = React.useCallback(
        async (termId: number) => {
            const hasSelection = selectedIds.size > 0;

            if (hasSelection) {
                const ids = Array.from(new Set<number>([...Array.from(selectedIds), termId]));
                setPendingTermIds(ids);
                setSelectedTermId(null);
            } else {
                setSelectedTermId(termId);
                setPendingTermIds(null);
            }

            try {
                setNotebooks(await fetchUserFolders());
            } catch (e: any) {
                if (e?.response?.status === 401) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }
                setNotebooks([]);
            }
            setMoveOpen(true);
        },
        [selectedIds, navigate]
    );

    /** 액션바 '내 포텐노트에 저장하기' */
    const openBulkSave = React.useCallback(async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) {
            alert("먼저 단어를 선택해 주세요.");
            return;
        }
        setSelectedTermId(null);
        setPendingTermIds(ids);
        try {
            setNotebooks(await fetchUserFolders());
        } catch (e: any) {
            if (e?.response?.status === 401) {
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }
            setNotebooks([]);
        }
        setMoveOpen(true);
    }, [selectedIds, navigate]);

    /** 벌크 응답 파싱: 백엔드(actual) 키에 정확히 맞춤 */
    type BulkParsed = {
        addedIds: number[]; // 서버가 ID 배열은 안 주니 비워둠(메시지엔 count만 사용)
        duplicateIds: number[];
        failedIds: number[];
        addedCount: number; // == attached
        duplicateCount: number; // == skipped (중복으로 스킵)
        failedCount: number; // == failed
        invalidCount: number; // == invalidIds.length
    };

    function parseBulkResult(data: any): BulkParsed {
        const num = (v: any) => {
            const n = Number(v);
            return Number.isFinite(n) && n >= 0 ? n : 0;
        };

        // 우리 백엔드가 주는 확정 키들
        const addedCount = num(data?.attached);
        const duplicateCount = num(data?.skipped);
        const failedCount = num(data?.failed);
        const invalidCount = Array.isArray(data?.invalidIds) ? data.invalidIds.length : 0;

        return {
            addedIds: [], // 서버가 배열을 안 줌
            duplicateIds: [],
            failedIds: [],
            addedCount,
            duplicateCount,
            failedCount,
            invalidCount,
        };
    }

    /** 모달 저장: 단일 or 벌크 */
    const handleSaveToNotebook = React.useCallback(
        async (notebookId: string) => {
            if (saving) return;
            try {
                setSaving(true);

                // ===== 저장 타깃 결정 =====
                const idsToSave =
                    pendingTermIds && pendingTermIds.length > 0
                        ? pendingTermIds
                        : selectedTermId
                            ? [selectedTermId]
                            : [];

                if (idsToSave.length === 0) {
                    alert("저장할 항목이 없어요.");
                    return;
                }

                // 항상 bulk API 사용 (단일도 1개짜리 배열로)
                const resData = await attachTermsBulk(notebookId, idsToSave);
                const { addedIds, duplicateIds, failedIds, addedCount, duplicateCount, failedCount } =
                    parseBulkResult(resData);

                // 로컬 배지(확실히 아는 것만)
                const toMark = new Set<number>([...addedIds, ...duplicateIds]);
                if (toMark.size > 0) {
                    setSavedEver((prev) => new Set([...prev, ...toMark]));
                }

                // ===== 메시지 분기 =====
                const addN = addedCount;
                const dupN = duplicateCount;
                const failN = failedCount;

                if (failN > 0) {
                    // 일부 실패
                    showMessage({
                        tone: "warning",
                        title: "일부만 저장되었어요",
                        description: `${addN}개 저장, ${dupN}개는 이미 저장됨, ${failN}개는 실패했어요. 잠시 후 다시 시도해 주세요.`,
                    });
                } else if (addN === 0 && dupN > 0) {
                    // 전부 중복
                    showMessage({
                        tone: "info",
                        title: "이미 저장된 용어예요",
                        description: `총 ${dupN}개 용어는 이미 내 포텐노트에 저장되어 있었어요.`,
                    });
                } else if (addN > 0 && dupN > 0) {
                    // 일부 신규 + 일부 중복
                    showMessage({
                        tone: "success",
                        title: "저장 완료",
                        description: `${addN}개 용어를 저장했고, ${dupN}개는 이미 저장된 항목이었어요.`,
                    });
                } else if (addN > 0) {
                    // 전부 신규
                    const desc =
                        idsToSave.length === 1
                            ? "단어가 내 포텐노트에 저장됐어요."
                            : `${addN}개 용어를 저장했어요.`;
                    showMessage({
                        tone: "success",
                        title: "저장 완료",
                        description: desc,
                    });
                } else {
                    // 서버가 카운트를 안 내려주거나 특수 포맷일 때 추론 보정
                    const guessedDup = idsToSave.filter((id) => savedEver.has(id)).length;
                    if (guessedDup > 0) {
                        showMessage({
                            tone: "info",
                            title: "이미 저장된 용어예요",
                            description: `총 ${guessedDup}개 용어는 이미 저장되어 있었어요.`,
                        });
                    } else {
                        showMessage({
                            tone: "warning",
                            title: "저장된 항목이 없어요",
                            description: "이미 저장되어 있거나 처리할 수 없었어요.",
                        });
                        console.debug("[bulk-save] unexpected response:", resData);
                    }
                }

                // 종료/정리
                setPendingTermIds(null);
                setSelectedTermId(null);
                setMoveOpen(false);
                clearAllSelected();
            } catch (err: any) {
                const s = err?.response?.status;
                if (s === 401) {
                    showMessage({
                        tone: "warning",
                        title: "로그인이 필요합니다",
                        description: "로그인 후 다시 시도해 주세요.",
                    });
                } else if (s === 403) {
                    showMessage({
                        tone: "warning",
                        title: "접근 권한이 없어요",
                        description: "해당 포텐노트에 접근할 수 없습니다.",
                    });
                } else if (s === 404) {
                    showMessage({
                        tone: "error",
                        title: "폴더나 용어를 찾을 수 없어요",
                        description: "삭제되었거나 존재하지 않는 항목일 수 있어요.",
                    });
                } else {
                    showMessage({
                        tone: "error",
                        title: "저장 중 오류가 발생했어요",
                        description: "잠시 후 다시 시도해 주세요.",
                    });
                }
                console.error("[save to notebook] failed:", err);
            } finally {
                setSaving(false);
            }
        },
        [pendingTermIds, selectedTermId, saving, clearAllSelected, savedEver, showMessage]
    );

    /** 용어 카드 1장씩 등장 */
    const [visibleCount, setVisibleCount] = React.useState(0);
    const listRef = React.useRef<HTMLUListElement | null>(null);

    React.useEffect(() => {
        // 검색 결과가 바뀌면 처음부터 다시
        setVisibleCount(0);

        if (!listRef.current || results.length === 0) return;

        const rootEl = listRef.current;
        const items = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-term-idx]"));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const idxAttr = entry.target.getAttribute("data-term-idx");
                    if (idxAttr == null) return;

                    const idx = Number(idxAttr);
                    if (Number.isNaN(idx)) return;

                    setVisibleCount((prev) => Math.max(prev, idx + 1));

                    observer.unobserve(entry.target);
                });
            },
            {
                root: null,
                threshold: 0.2,
                rootMargin: "0px 0px -10% 0px",
            }
        );

        items.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [results]);

    return (
        <Root>
            {/* 안내/칩줄 + 로딩/에러 메시지 */}
            <NarrowLeft>
                {q || tag || initial || alpha || symbol || catId ? (
                    <InfoRow aria-live="polite">
                        {q && <Chip>검색어: {q}</Chip>}
                        {tag && <Chip>#{tag}</Chip>}
                        {initial && <Chip>초성: {initial}</Chip>}
                        {alpha && <Chip>알파벳: {alpha}</Chip>}
                        {symbol && <Chip>기호: {symbol}</Chip>}
                        {catId && <Chip>분류 필터 적용</Chip>}
                        <Tail>
                            에 대한 <InfoStrongNum>{total}</InfoStrongNum>개의 용어가 검색되었습니다.
                        </Tail>

                        {results.length > 0 && (
                            <>
                                <Spacer />
                                <PrimaryBtn
                                    type="button"
                                    onClick={toggleAllCurrentPage}
                                    aria-pressed={allChecked}
                                    title={allChecked ? "현재 페이지 선택 해제" : "현재 페이지 전체 선택"}
                                >
                                    {allChecked ? "현재 페이지 선택 해제" : "현재 페이지 전체 선택"}
                                </PrimaryBtn>
                            </>
                        )}
                    </InfoRow>
                ) : (
                    <InfoRow>검색어를 입력하거나 분류를 선택해 주세요.</InfoRow>
                )}

                {loading && <LoadingMsg>불러오는 중...</LoadingMsg>}
                {error && <ErrorMsg>{error}</ErrorMsg>}
            </NarrowLeft>

            {/* 검색 결과 리스트 */}
            {!loading && !error && results.length > 0 && (
                <NarrowLeft>
                    <List ref={listRef}>
                        {results.map((t, idx) => {
                            const isVisible = idx < visibleCount;
                            const isOn = selectedIds.has(t.id);

                            return (
                                <ListItem
                                    key={t.id}
                                    data-term-idx={idx}
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? "translateY(0)" : "translateY(8px)",
                                        transition: "opacity 200ms ease, transform 200ms ease",
                                    }}
                                >
                                    <CardWrap>
                                        <SelectToggle
                                            $on={isOn}
                                            aria-label={isOn ? "선택 해제" : "선택"}
                                            title={isOn ? "선택 해제" : "선택"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOne(t.id);
                                            }}
                                        >
                                            {isOn ? <CheckIcon /> : <Hollow />}
                                        </SelectToggle>

                                        <AlignWithCheck>
                                            <TermCardWithTagsLazy
                                                id={t.id}
                                                title={t.title}
                                                description={t.description}
                                                tags={t.tags}
                                                onTagClick={handleTagClick}
                                                onAdd={handleAddClick}
                                            />
                                        </AlignWithCheck>
                                    </CardWrap>
                                </ListItem>
                            );
                        })}
                    </List>
                </NarrowLeft>
            )}

            {/* 페이지네이션 */}
            {!loading && !error && (q || tag || initial || alpha || symbol || catId) && total > 0 && (
                <NarrowLeft>
                    <Pagination page={page} size={size} total={total} onChange={handlePageChange} />
                </NarrowLeft>
            )}

            {/* 결과 없음 */}
            {!loading && !error && (q || tag || initial || alpha || symbol || catId) && results.length === 0 && (
                <NarrowLeft>
                    <div style={{ marginTop: TOKENS.space(16), color: TOKENS.color.textMuted }}>
                        검색 결과가 없습니다.
                    </div>
                </NarrowLeft>
            )}

            {/* 하단 액션바: 전체 폭 유지 */}
            {selectedCount > 0 && showTray && (
                <Tray role="region" aria-label="선택 항목 액션바">
                    <span>선택 {selectedCount.toLocaleString()}개</span>
                    <TrayBtns>
                        <TrayGhostBtn onClick={() => setShowTray(false)}>닫기</TrayGhostBtn>
                        <TrayPrimary onClick={openBulkSave}>내 포텐노트에 저장하기</TrayPrimary>
                    </TrayBtns>
                </Tray>
            )}

            {/* 포텐노트 모달 */}
            <PotenNoteModal
                open={moveOpen}
                notebooks={notebooks}
                onClose={() => {
                    setMoveOpen(false);
                    setSelectedTermId(null);
                    setPendingTermIds(null);
                }}
                onSave={handleSaveToNotebook}
                onCreate={async (name) => {
                    const { data } = await http.post("/me/folders", { wordbookName: name });
                    const newId = String(data.id);
                    const newName = data.wordbookName ?? name;
                    setNotebooks((prev) => [{ id: newId, name: newName }, ...prev]);
                    return newId;
                }}
                onReorder={async (orderedIds) => {
                    try {
                        await patchReorderFolders(orderedIds);
                        const refreshed = await fetchUserFolders();
                        setNotebooks(refreshed);
                    } catch (e) {
                        console.warn("[folders reorder] 실패", e);
                    }
                }}
                onGoToFolder={() => {
                    setMoveOpen(false);
                }}
                onRename={async (wordbookId, newName) => {
                    await renameUserFolder(wordbookId, newName);
                    setNotebooks((prev) =>
                        prev.map((n) => (n.id === wordbookId ? { ...n, name: newName } : n))
                    );
                }}
                onRequestDelete={async (fid) => {
                    await deleteUserFolder(fid, "purge");
                    setNotebooks(await fetchUserFolders());
                }}
                onRequestBulkDelete={async (ids) => {
                    await deleteUserFoldersBulk(ids, "purge");
                    setNotebooks(await fetchUserFolders());
                }}
                onRefresh={async () => await fetchUserFolders()}
            />
            {/* 시스템 메시지 모달 */}
            <SystemMessageModal
                open={systemOpen}
                message={systemMessage}
                onClose={() => {
                    setSystemOpen(false);
                    setSystemMessage(null);
                }}
            />
        </Root>
    );
}