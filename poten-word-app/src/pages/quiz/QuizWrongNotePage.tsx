import styled, { css } from "styled-components";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import http, { authHeader } from "../../utils/http.ts";
import SystemMessageModal, { SystemMessage } from "../../components/common/SystemMessageModal.tsx";
import { SelectToggleChip } from "../../components/common/SelectToggleChip";
import {useLocation, useNavigate, useNavigationType} from "react-router-dom";
import LearningPageHeader from "../../components/common/LearningPageHeader.tsx";

/* ====== UI 토큰 ====== */
const UI = {
    panelBgSoft: "#f4f8ff",
    panelLineSoft: "#d9e6ff",
    text: "#0f172a",
    sub: "#6b7280",
    primaryBlue: "#4369e5",
    danger: "#ef4444",
    success: "#10b981",
    radiusXXL: "24px",
    shadowSoft: "0 10px 30px rgba(67,105,229,.10)",
    chipBg: "#ffffff",
    chipLine: "#e5e7eb",
    chipOnBg: "#eef2ff",
    chipOnLine: "#c7d2fe",
    bg: "#ffffff",
};

type QuestionType = "CHOICE" | "OX" | "INITIALS" | "MIX" | string;
type Difficulty = "EASY" | "MEDIUM" | "HARD" | "MIX" | string;

type WrongItem = {
    reviewId: number;
    wrongNoteId: number;
    questionId: number;
    wrongCount: number;
    badgeLabel?: string | null;
    wrongAt?: string | null;
    reviewIds: number[];
    questionType: QuestionType;
    difficulty?: Difficulty;
    prompt: string;
    choices?: Array<{ key: string; text: string }>;
    correctAnswer?: string;
    userAnswer?: string | null;
    explanation?: string | null;
    termId?: number | null;
    termTitle?: string | null;
    categoryLabel?: string | null;
    sessionId?: number | null;
    sessionTitle?: string | null;
    answeredAt?: string | null;
    resolved?: boolean;
    status?: string | null;
};

type SortKey = "RECENT" | "OLDEST" | "MOST_WRONG";

function toBackendSort(sort?: SortKey): Exclude<SortKey, "MOST_WRONG"> | undefined {
    if (sort === "MOST_WRONG") return "RECENT";
    return sort;
}

type WrongNoteCache = {
    v: 1;
    ts: number;
    scrollY: number;

    q: string;
    type: "ALL" | "CHOICE" | "OX" | "INITIALS";
    difficulty: "ALL" | "EASY" | "MEDIUM" | "HARD";
    unresolvedOnly: boolean;
    sort: SortKey;

    page: number;
    pageWindowStart: number;
    size: number;
    total: number;
    hasMore: boolean;

    items: WrongItem[];
    selected: Record<number, boolean>;
    expanded: Record<number, boolean>;
};

type Filters = {
    q: string;
    type: "ALL" | "CHOICE" | "OX" | "INITIALS";
    difficulty: "ALL" | "EASY" | "MEDIUM" | "HARD";
    unresolvedOnly: boolean;
    sort: SortKey;
};

const DEFAULT_FILTERS: Filters = {
    q: "",
    type: "ALL",
    difficulty: "ALL",
    unresolvedOnly: false,
    sort: "RECENT",
};

type FilterOption<T extends string> = {
    value: T;
    label: string;
};

const pretendard = css`
    font-family:
        "Pretendard",
        -apple-system,
        BlinkMacSystemFont,
        "Apple SD Gothic Neo",
        "Noto Sans KR",
        "Segoe UI",
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    word-break: keep-all;
`;

const readableText = css`
    ${pretendard};
    letter-spacing: -0.014em;
    line-height: 1.6;
`;

const TYPE_OPTIONS: FilterOption<Filters["type"]>[] = [
    { value: "ALL", label: "유형 전체" },
    { value: "CHOICE", label: "객관식" },
    { value: "OX", label: "OX" },
    { value: "INITIALS", label: "초성" },
];

const DIFFICULTY_OPTIONS: FilterOption<Filters["difficulty"]>[] = [
    { value: "ALL", label: "난이도 전체" },
    { value: "EASY", label: "쉬움" },
    { value: "MEDIUM", label: "보통" },
    { value: "HARD", label: "어려움" },
];

const SORT_OPTIONS: FilterOption<SortKey>[] = [
    { value: "RECENT", label: "최신순" },
    { value: "OLDEST", label: "오래된 순" },
    { value: "MOST_WRONG", label: "많이 틀린 순" },
];

const readCache = (k: string): WrongNoteCache | null => {
    try {
        const r = sessionStorage.getItem(k);
        return r ? (JSON.parse(r) as WrongNoteCache) : null;
    } catch {
        return null;
    }
};

const writeCache = (k: string, d: WrongNoteCache) => {
    try {
        sessionStorage.setItem(k, JSON.stringify(d));
    } catch {}
};

function safeStr(v: any) {
    return String(v ?? "").trim();
}

function toValidNumber(v: any) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function toTimeMs(v?: string | null) {
    if (!v) return Number.NaN;
    const ms = new Date(v).getTime();
    return Number.isFinite(ms) ? ms : Number.NaN;
}

function buildWrongBadgeLabel(wrongCount: number) {
    return wrongCount >= 2 ? String(wrongCount) + "\uD68C \uC624\uB2F5" : null;
}

function normalizeWrongItem(raw: any): WrongItem | null {
    if (!raw) return null;

    const reviewId = Number(
        raw.reviewId ?? raw.review_id ??
        raw.wrongNoteId ?? raw.wrong_note_id ??
        raw.id ?? raw.quizReviewId ?? raw.quiz_review_id ??
        raw.review?.id ?? raw.quizReview?.id
    );

    const questionId = Number(
        raw.questionId ?? raw.question_id ??
        raw.qid ?? raw.quizQuestionId ?? raw.quiz_question_id ??
        raw.question?.id ??
        raw.quizQuestion?.id ?? raw.quiz_question?.id
    );

    if (!Number.isFinite(reviewId) || !Number.isFinite(questionId)) return null;

    const qObj = raw.question ?? raw.quizQuestion ?? raw.quiz_question ?? null;

    const prompt =
        safeStr(
            raw.prompt ??
            raw.questionText ??
            qObj?.prompt ??
            qObj?.title ??
            raw.stem
        ) || "(문제 내용 없음)";

    const qType = safeStr(raw.questionType ?? raw.type ?? qObj?.questionType ?? qObj?.type).toUpperCase();
    const difficulty = safeStr(raw.difficulty ?? raw.level ?? qObj?.difficulty ?? qObj?.level).toUpperCase();

    const choicesRaw = raw.choices ?? qObj?.choices ?? raw.options ?? null;
    const choices = Array.isArray(choicesRaw)
        ? (choicesRaw
            .map((c: any, idx: number) => {
                const text = safeStr(c.text ?? c.content ?? c.value ?? c.choiceText);
                if (!text) return null;
                const key =
                    safeStr(c.key ?? c.label ?? c.choiceKey) || String.fromCharCode(65 + idx);
                return { key, text };
            })
            .filter(Boolean) as Array<{ key: string; text: string }>)
        : undefined;

    const explicitWrongCount = toValidNumber(raw.wrongCount ?? raw.wrong_count ?? raw.repeatWrongCount);
    const wrongCount = explicitWrongCount && explicitWrongCount > 0 ? explicitWrongCount : 1;
    const wrongAt =
        raw.wrongAt ?? raw.wrong_at ?? raw.answeredAt ?? raw.submittedAt ?? raw.createdAt ?? null;
    const reviewIdsRaw =
        raw.reviewIds ?? raw.review_ids ?? raw.wrongNoteIds ?? raw.wrong_note_ids ?? raw.reviewIdList ?? null;
    const reviewIds = Array.isArray(reviewIdsRaw)
        ? reviewIdsRaw.map(toValidNumber).filter((v): v is number => v != null)
        : [reviewId];
    const status = safeStr(raw.status ?? raw.reviewStatus ?? "").toUpperCase() || null;

    return {
        reviewId,
        wrongNoteId: reviewId,
        questionId,
        wrongCount,
        badgeLabel: safeStr(raw.badgeLabel ?? raw.badge_label) || buildWrongBadgeLabel(wrongCount),
        wrongAt,
        reviewIds: reviewIds.length ? Array.from(new Set(reviewIds)) : [reviewId],
        questionType: (qType || "CHOICE") as QuestionType,
        difficulty: (difficulty || undefined) as Difficulty,
        prompt,
        choices,
        correctAnswer:
            safeStr(
                raw.correctAnswer ?? raw.answer ?? raw.question?.answer ?? raw.question?.correctAnswer
            ) || undefined,
        userAnswer:
            raw.userAnswer ?? raw.selected ?? raw.myAnswer ?? raw.answerGiven ?? null,
        explanation:
            raw.explanation ?? raw.description ?? raw.reason ?? raw.question?.explanation ?? null,
        sessionId: raw.sessionId ?? raw.quizSessionId ?? raw.quizSession?.id ?? null,
        answeredAt: wrongAt,
        termId: raw.termId ?? raw.term?.id ?? null,
        termTitle: raw.termTitle ?? raw.term?.title ?? null,
        categoryLabel:
            raw.categoryLabel ?? raw.category?.label ?? raw.termCategoryLabel ?? null,
        sessionTitle: raw.sessionTitle ?? raw.session?.title ?? null,
        resolved: Boolean(
            raw.resolved ??
            raw.isResolved ??
            (String(raw.status ?? "").toUpperCase() === "RESOLVED")
        ),
        status,
    };
}

function pickRepresentative(current: WrongItem, candidate: WrongItem, sort: SortKey) {
    const currentTime = toTimeMs(current.wrongAt ?? current.answeredAt);
    const candidateTime = toTimeMs(candidate.wrongAt ?? candidate.answeredAt);

    if (Number.isNaN(currentTime)) return candidate;
    if (Number.isNaN(candidateTime)) return current;

    if (sort === "OLDEST") {
        return candidateTime < currentTime ? candidate : current;
    }

    return candidateTime > currentTime ? candidate : current;
}

function compareWrongItems(a: WrongItem, b: WrongItem, sort: SortKey) {
    const aTime = toTimeMs(a.wrongAt ?? a.answeredAt);
    const bTime = toTimeMs(b.wrongAt ?? b.answeredAt);

    if (sort === "MOST_WRONG") {
        if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
        if (Number.isNaN(aTime) && Number.isNaN(bTime)) return (b.reviewId ?? 0) - (a.reviewId ?? 0);
        if (Number.isNaN(aTime)) return 1;
        if (Number.isNaN(bTime)) return -1;
        if (bTime !== aTime) return bTime - aTime;
        return (b.reviewId ?? 0) - (a.reviewId ?? 0);
    }

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return (b.reviewId ?? 0) - (a.reviewId ?? 0);
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    if (aTime !== bTime) return sort === "OLDEST" ? aTime - bTime : bTime - aTime;
    if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
    return (b.reviewId ?? 0) - (a.reviewId ?? 0);
}

function mergeWrongItems(items: WrongItem[], sort: SortKey) {
    const grouped = new Map<number, WrongItem>();

    items.forEach((item) => {
        const existing = grouped.get(item.questionId);
        if (!existing) {
            grouped.set(item.questionId, {
                ...item,
                reviewIds: item.reviewIds?.length ? Array.from(new Set(item.reviewIds)) : [item.reviewId],
                badgeLabel: item.badgeLabel ?? buildWrongBadgeLabel(item.wrongCount),
            });
            return;
        }

        const representative = pickRepresentative(existing, item, sort);
        const mergedWrongCount = existing.wrongCount + item.wrongCount;
        const mergedReviewIds = Array.from(new Set([...(existing.reviewIds || [existing.reviewId]), ...(item.reviewIds || [item.reviewId])]));
        const resolved = Boolean(existing.resolved) && Boolean(item.resolved);

        grouped.set(item.questionId, {
            ...representative,
            reviewId: representative.reviewId,
            wrongNoteId: representative.wrongNoteId ?? representative.reviewId,
            wrongCount: mergedWrongCount,
            badgeLabel: buildWrongBadgeLabel(mergedWrongCount),
            wrongAt: representative.wrongAt ?? representative.answeredAt ?? null,
            answeredAt: representative.wrongAt ?? representative.answeredAt ?? null,
            reviewIds: mergedReviewIds,
            resolved,
            status: resolved ? "RESOLVED" : (representative.status ?? "UNRESOLVED"),
        });
    });

    return Array.from(grouped.values()).sort((a, b) => compareWrongItems(a, b, sort));
}

function ExpandChevronIcon({
                               open,
                               size = 18,
                           }: {
    open: boolean;
    size?: number;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 120ms ease",
            }}
            aria-hidden="true"
            focusable="false"
        >
            <path d="M7 10l5 5 5-5" />
        </svg>
    );
}

function toTypeLabel(t: string) {
    const u = safeStr(t).toUpperCase();
    if (u === "CHOICE") return "객관식";
    if (u === "OX") return "OX";
    if (u === "INITIALS") return "초성";
    if (u === "MIX") return "혼합";
    return u || "기타";
}

function toDiffLabel(d?: string) {
    const u = safeStr(d).toUpperCase();
    if (u === "EASY") return "쉬움";
    if (u === "MEDIUM") return "보통";
    if (u === "HARD") return "어려움";
    if (u === "MIX") return "혼합";
    return u || "-";
}

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return yy + "." + mm + "." + dd + " " + hh + ":" + mi;
}

function getChoiceDisplayLabel(idx: number) {
    return String(idx + 1);
}

function toDisplayedAnswer(
    answer?: string | null,
    choices?: Array<{ key: string; text: string }>
) {
    const raw = safeStr(answer);
    if (!raw) return "-";
    if (!choices?.length) return raw;

    const foundIndex = choices.findIndex((c) => {
        const key = safeStr(c.key);
        const text = safeStr(c.text);
        return raw.toUpperCase() === key.toUpperCase() || raw === text;
    });

    if (foundIndex >= 0) return String(foundIndex + 1);
    return raw;
}

function FilterDropdown<T extends string>({
                                              label,
                                              value,
                                              options,
                                              open,
                                              active,
                                              onToggle,
                                              onSelect,
                                          }: {
    label: string;
    value: T;
    options: Array<{ value: T; label: string }>;
    open: boolean;
    active?: boolean;
    onToggle: () => void;
    onSelect: (value: T) => void;
}) {
    const selected = options.find((opt) => opt.value === value);

    return (
        <FilterDropdownWrap>
            <FilterDropdownTrigger
                type="button"
                $active={Boolean(active || open)}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={onToggle}
                title={label}
            >
                <span>{selected?.label ?? label}</span>
                <FilterCaret $open={open} />
            </FilterDropdownTrigger>

            <FilterDropdownMenu $open={open} role="menu" aria-label={label}>
                {options.map((opt) => (
                    <FilterDropdownOption
                        key={opt.value}
                        type="button"
                        $active={opt.value === value}
                        onClick={() => onSelect(opt.value)}
                        role="menuitem"
                    >
                        {opt.label}
                    </FilterDropdownOption>
                ))}
            </FilterDropdownMenu>
        </FilterDropdownWrap>
    );
}

async function apiFetchWrongNotes(params: {
    page?: number;
    size?: number;
    type?: string;                // "CHOICE" | "OX" | "INITIALS"
    difficulty?: string;          // "EASY" | "MEDIUM" | "HARD"
    unresolvedOnly?: boolean;
    q?: string;
    sort?: SortKey;
    sessionId?: number | null;
    from?: string | null;         // "2026-01-01"
    to?: string | null;           // "2026-01-06"
    includeAnswers?: boolean;
}) {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));
    if (params.type) query.set("type", params.type);
    if (params.difficulty) query.set("difficulty", params.difficulty);
    if (typeof params.unresolvedOnly === "boolean") query.set("unresolvedOnly", String(params.unresolvedOnly));
    const qq = (params.q ?? "").trim();
    if (qq) query.set("q", qq);
    const backendSort = toBackendSort(params.sort);
    if (backendSort) query.set("sort", backendSort);
    if (params.sessionId != null) query.set("sessionId", String(params.sessionId));
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    query.set("includeAnswers", String(params.includeAnswers ?? true));

    const url = "/me/quiz/reviews/wrong?" + query.toString();

    const { data } = await http.get(url, {
        headers: { ...authHeader(), Accept: "application/json" },
        withCredentials: true,
    });

    // 1) 서버가 JSON 대신 HTML/문자열을 주는 케이스 잡기
    if (typeof data === "string") {
        const isHtml = /<html|<!doctype/i.test(data);
        throw new Error(isHtml
            ? "API가 JSON 대신 HTML을 반환했습니다(로그인/에러 페이지 가능). 백엔드 보안 설정/세션 상태를 확인하세요."
            : "API가 JSON 대신 문자열을 반환했습니다. 응답 Content-Type/DTO를 확인하세요."
        );
    }

    // 2) 래퍼 대응: data.data / data.result / data.response 등
    const root =
        (data?.data ?? data?.result ?? data?.response ?? data) as any;

    // 3) 배열 루트도 대응
    const rawItems =
        Array.isArray(root) ? root :
            root?.items ?? root?.content ?? root?.list ?? root?.rows ?? [];

    const page = Number(root?.page ?? root?.number ?? params.page ?? 0);
    const size = Number(root?.size ?? root?.pageSize ?? params.size ?? 20);
    const rawTotal = Number(
        root?.questionTotal ??
        root?.distinctQuestionCount ??
        root?.groupTotal ??
        root?.groupedTotal ??
        root?.totalElements ??
        root?.total ??
        root?.totalCount ??
        rawItems.length
    );

    // 4) 파싱 드랍 체크 로그(원인 바로 보임)
    const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeWrongItem);
    const normalizedItems = normalized.filter(Boolean) as WrongItem[];
    const groupedItems = mergeWrongItems(normalizedItems, params.sort ?? "RECENT");
    const dropped = normalized.length - normalizedItems.length;

    console.log("[wrongnote] raw/ok/drop", {
        rawLen: Array.isArray(rawItems) ? rawItems.length : -1,
        okLen: groupedItems.length,
        dropped,
        sample: Array.isArray(rawItems) && rawItems[0] ? rawItems[0] : null,
    });

    const total = Number.isFinite(rawTotal) ? rawTotal : groupedItems.length;
    const hasMore = (page + 1) * size < total;
    return { items: groupedItems, page, size, total, hasMore };
}

async function apiToggleResolved(reviewIds: number[], resolved: boolean) {
    const ids = Array.from(new Set((reviewIds || []).filter(Number.isFinite)));
    await Promise.all(
        ids.map((reviewId) =>
            http.patch(
                "/me/quiz/reviews/" + reviewId,
                { resolved },
                {
                    headers: authHeader(),
                    withCredentials: true,
                }
            )
        )
    );
}

async function apiDeleteWrongReviews(reviewIds: number[]) {
    const ids = (reviewIds || []).filter(Number.isFinite);
    if (!ids.length) return;

    try {
        await http.delete("/me/quiz/reviews/wrong", {
            headers: { ...authHeader(), "Content-Type": "application/json" },
            data: { reviewIds: ids },
            withCredentials: true,
        });
        return;
    } catch (e) {
        // bulk가 막혀도 최소한 개별로는 지우게
    }

    await Promise.all(
        ids.map((rid) =>
            http.delete("/me/quiz/reviews/" + rid, {
                headers: authHeader(),
                withCredentials: true,
            })
        )
    );
}

async function apiStartWrongOnlySession(questionIds: number[]) {
    const url = "/me/quiz/sessions/start";
    const { data } = await http.post(
        url,
        { source: "wrong_note", questionIds, customTitle: "오답노트 선택 복습" },
        { headers: authHeader(), withCredentials: true }
    );
    const sessionId = Number(data?.sessionId ?? data?.id);
    if (!Number.isFinite(sessionId)) throw new Error("sessionId가 응답에 없습니다.");
    return { sessionId, playPath: "/learning/quiz/play" };
}

export default function QuizWrongNotePage() {
    const nav = useNavigate();
    const navType = useNavigationType();
    const location = useLocation();

    const cacheKey = useMemo(() => "quiz_wrong_note:v1:" + location.pathname, [location.pathname]);

    const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
    const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);

    const appliedRef = useRef<Filters>(DEFAULT_FILTERS);
    useEffect(() => { appliedRef.current = applied; }, [applied]);

    const [page, setPage] = useState(0);
    const size = 20;
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const pages = Math.max(1, Math.ceil((total || 0) / size));
    const WINDOW_SIZE = 5;
    const [pageWindowStart, setPageWindowStart] = useState(0);

    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [sysOpen, setSysOpen] = useState(false);
    const [sysMsg, setSysMsg] = useState<SystemMessage | null>(null);

    const [items, setItems] = useState<WrongItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const inFlightRef = useRef(false);

    const openSys = useCallback((m: SystemMessage) => {
        setSysMsg(m);
        setSysOpen(true);
    }, []);

    const closeSys = useCallback(() => {
        setSysOpen(false);
        setSysMsg(null);
    }, []);

    const getApiError = (err: any) => {
        const status = err?.response?.status ?? null;
        const data = err?.response?.data ?? null;
        const message =
            data?.message ??
            data?.error ??
            data?.detail ??
            data?.reason ??
            err?.message ??
            "요청 처리 중 오류가 발생했습니다.";
        return { status, data, message };
    };

    const clampWindowStart = useCallback(
        (start: number) => {
            const maxStart = Math.max(0, pages - WINDOW_SIZE);
            return Math.max(0, Math.min(start, maxStart));
        },
        [pages]
    );

    const pageWindow = useMemo(() => {
        const start = clampWindowStart(pageWindowStart);
        const end = Math.min(pages - 1, start + WINDOW_SIZE - 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [pageWindowStart, pages, clampWindowStart]);

    const fetchPage = useCallback(
        async (targetPage: number, filters?: Filters) => {
            if (inFlightRef.current) return;
            inFlightRef.current = true;
            setLoading(true);

            const f = filters ?? appliedRef.current;

            try {
                const res = await apiFetchWrongNotes({
                    page: targetPage,
                    size,
                    type: f.type === "ALL" ? undefined : f.type,
                    difficulty: f.difficulty === "ALL" ? undefined : f.difficulty,
                    unresolvedOnly: f.unresolvedOnly,
                    q: f.q,
                    sort: f.sort,
                    includeAnswers: true,
                });

                setItems(res.items);
                setPage(res.page);
                setTotal(res.total);
                setHasMore(res.hasMore);
                setExpanded({});
            } catch (e: any) {
                const { message } = getApiError(e);
                openSys({ title: "오답노트 불러오기 실패", message } as any);
            } finally {
                inFlightRef.current = false;
                setLoading(false);
            }
        },
        [size, openSys]
    );

    const movePage = useCallback(
        (nextPage: number) => {
            const next = Math.max(0, Math.min(nextPage, pages - 1));
            setPage(next);

            setPageWindowStart((ws) => {
                const start = clampWindowStart(ws);
                if (next < start) return clampWindowStart(next);
                if (next > start + WINDOW_SIZE - 1) return clampWindowStart(next - WINDOW_SIZE + 1);
                return start;
            });

            window.scrollTo(0, 0);
            fetchPage(next);
        },
        [pages, clampWindowStart, fetchPage]
    );

    const jumpWindow = useCallback(
        (dir: -1 | 1) => {
            const targetStart = clampWindowStart(pageWindowStart + dir * WINDOW_SIZE);
            if (targetStart === clampWindowStart(pageWindowStart)) return;
            setPageWindowStart(targetStart);
            setPage(targetStart);
            window.scrollTo(0, 0);
            fetchPage(targetStart);
        },
        [pageWindowStart, clampWindowStart, fetchPage]
    );

    const canPrevWindow = pageWindowStart > 0;
    const canNextWindow = pageWindowStart + WINDOW_SIZE < pages;

    const goPrevWindow = useCallback(() => jumpWindow(-1), [jumpWindow]);
    const goNextWindow = useCallback(() => jumpWindow(1), [jumpWindow]);

    const goPrev = useCallback(() => movePage(page - 1), [movePage, page]);
    const goNext = useCallback(() => movePage(page + 1), [movePage, page]);

    const goFirstPage = useCallback(() => {
        setPageWindowStart(0);
        setPage(0);
        window.scrollTo(0, 0);
        fetchPage(0);
    }, [fetchPage]);

    const goLastPage = useCallback(() => {
        const lastPage = pages - 1;
        const lastWindowStart = clampWindowStart(lastPage - (WINDOW_SIZE - 1));

        setPageWindowStart(lastWindowStart);
        setPage(lastPage);
        window.scrollTo(0, 0);
        fetchPage(lastPage);
    }, [pages, clampWindowStart, fetchPage]);

    const firstVisiblePage = pageWindow[0] ?? 0;
    const lastVisiblePage = pageWindow[pageWindow.length - 1] ?? 0;

    const showFirstPage = firstVisiblePage > 0;
    const showLeadingEllipsis = firstVisiblePage > 1;

    const showTrailingEllipsis = lastVisiblePage < pages - 2;
    const showLastPage = lastVisiblePage < pages - 1;

    const visiblePages = pageWindow.filter((p) => {
        if (showFirstPage && p === 0) return false;
        if (showLastPage && p === pages - 1) return false;
        return true;
    });

    useEffect(() => {
        if (page > pages - 1) movePage(pages - 1);
        setPageWindowStart((s) => clampWindowStart(s));
    }, [pages, page, clampWindowStart, movePage]);

    // selected 타입/사용 키를 reviewId로 변경
    const [selected, setSelected] = useState<Record<number, boolean>>({});

    // 서버가 이미 필터/정렬한 결과를 내려준다고 가정 → 그대로 표시
    const displayedItems = items;

    // (선택) 필터가 걸려있는 상태인지: 결과가 0일 때 메시지 분기용
    const hasActiveFilter = useMemo(() => {
        return (
            applied.q.trim().length > 0 ||
            applied.type !== "ALL" ||
            applied.difficulty !== "ALL" ||
            applied.unresolvedOnly
        );
    }, [applied]);

    // 선택된 reviewId 목록
    const checkedReviewIds = useMemo(() => {
        return Object.entries(selected)
            .filter(([, v]) => v)
            .map(([k]) => Number(k))
            .filter(Number.isFinite);
    }, [selected]);

    // 선택된 reviewId → questionId로 변환 (중복 제거)
    const checkedQuestionIds = useMemo(() => {
        const map = new Map<number, number>(); // questionId -> 1
        const byReviewId = new Map(items.map((it) => [it.reviewId, it]));
        checkedReviewIds.forEach((rid) => {
            const it = byReviewId.get(rid);
            if (it) map.set(it.questionId, 1);
        });
        return Array.from(map.keys());
    }, [checkedReviewIds, items]);

    const checkedDeleteReviewIds = useMemo(() => {
        const ids = new Set<number>();
        const byReviewId = new Map(items.map((it) => [it.reviewId, it]));
        checkedReviewIds.forEach((rid) => {
            const it = byReviewId.get(rid);
            (it?.reviewIds?.length ? it.reviewIds : [rid]).forEach((id) => {
                if (Number.isFinite(id)) ids.add(id);
            });
        });
        return Array.from(ids);
    }, [checkedReviewIds, items]);

    // 전체선택(visible 기준)도 reviewId로
    const allVisibleChecked = useMemo(() => {
        if (!displayedItems.length) return false;
        return displayedItems.every((it) => Boolean(selected[it.reviewId]));
    }, [displayedItems, selected]);

    const toggleAllVisible = () => {
        if (!displayedItems.length) return;
        const next = { ...selected };
        const to = !allVisibleChecked;
        displayedItems.forEach((it) => (next[it.reviewId] = to));
        setSelected(next);
    };

    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e as any).nativeEvent?.isComposing) return;
        if (e.key === "Enter") {
            e.preventDefault();
            applyAndSearch();
        }
    };

    const toggleExpand = (reviewId: number) => {
        setExpanded((p) => ({ ...p, [reviewId]: !p[reviewId] }));
    };

    const onToggleResolved = async (it: WrongItem) => {
        const prev = Boolean(it.resolved);
        const next = !prev;
        setItems((prevItems) =>
            prevItems.map((x) =>
                x.reviewId === it.reviewId
                    ? { ...x, resolved: next, status: next ? "RESOLVED" : "UNRESOLVED" }
                    : x
            )
        );
        try {
            await apiToggleResolved(it.reviewIds?.length ? it.reviewIds : [it.reviewId], next);
        } catch (e: any) {
            setItems((prevItems) =>
                prevItems.map((x) =>
                    x.reviewId === it.reviewId
                        ? { ...x, resolved: prev, status: prev ? "RESOLVED" : "UNRESOLVED" }
                        : x
                )
            );
            const { message } = getApiError(e);
            openSys({ title: "상태 변경 실패", message } as any);
        }
    };

    const onRetrySelected = async () => {
        if (!checkedQuestionIds.length) {
            openSys({ title: "선택된 오답이 없어요", message: "다시 풀 문제를 체크해 주세요." } as any);
            return;
        }

        try {
            const { sessionId } = await apiStartWrongOnlySession(checkedQuestionIds);
            nav("/learning/quiz/play?sessionId=" + sessionId, {
                replace: true,
                state: { sessionId, source: "wrong_note", pickedQuestionIds: checkedQuestionIds },
            });
        } catch (e: any) {
            const { message } = getApiError(e);
            openSys({
                title: "오답 세션 시작 실패",
                message: message + "\n(백엔드 오답세션 생성 API 경로/응답을 확인해 주세요.)",
            } as any);
        }
    };

    const onDeleteSelected = useCallback(async () => {
        if (!checkedReviewIds.length) {
            openSys({ title: "선택된 기록이 없어요", message: "삭제할 오답 기록을 체크해 주세요." } as any);
            return;
        }

        openSys({
            tone: "warning",
            title: "기록을 삭제할까요?",
            description: (
                <>
                    선택한 오답 기록 <b>{checkedReviewIds.length}</b>개를 삭제합니다.<br />
                    삭제하면 복구할 수 없어요.
                </>
            ),
            actions: [
                {
                    label: "삭제",
                    tone: "danger",
                    onClick: async () => {
                        setDeleting(true);

                        const snapshotItems = items;
                        const snapshotSelected = selected;

                        try {
                            const delSet = new Set(checkedReviewIds);
                            setItems((prev) => prev.filter((x) => !delSet.has(x.reviewId)));
                            setSelected({});

                            await apiDeleteWrongReviews(checkedDeleteReviewIds);
                            await fetchPage(page, appliedRef.current);

                            openSys({ tone: "success", title: "삭제 완료", description: "선택한 기록을 삭제했어요." } as any);
                        } catch (e: any) {
                            setItems(snapshotItems);
                            setSelected(snapshotSelected);

                            const { message } = getApiError(e);
                            openSys({ tone: "error", title: "삭제 실패", description: message } as any);
                            throw e;
                        } finally {
                            setDeleting(false);
                        }
                    },
                    autoClose: false,
                }
            ],
        } as any);
    }, [
        checkedReviewIds,
        checkedDeleteReviewIds,
        openSys,
        closeSys,
        fetchPage,
        page,
        getApiError,
    ]);

    const clearFilters = () => {
        setDraft(DEFAULT_FILTERS);
        applyAndSearch(DEFAULT_FILTERS);
    };

    const persistCache = useCallback(() => {
        const data: WrongNoteCache = {
            v: 1,
            ts: Date.now(),
            scrollY: window.scrollY,

            q: applied.q,
            type: applied.type,
            difficulty: applied.difficulty,
            unresolvedOnly: applied.unresolvedOnly,
            sort: applied.sort,

            page,
            pageWindowStart,
            size,
            total,
            hasMore,

            items,
            selected,
            expanded,
        };
        writeCache(cacheKey, data);
    }, [cacheKey, applied, page, pageWindowStart, size, total, hasMore, items, selected, expanded]);

    // 언마운트(다른 페이지로 이동) 시 저장
    useEffect(() => {
        return () => {
            persistCache();
        };
    }, [persistCache]);

    const restoredRef = useRef(false);
    const restoredHasItemsRef = useRef(false);

    useLayoutEffect(() => {
        restoredRef.current = false;
        restoredHasItemsRef.current = false;

        if (navType !== "POP") return;
        const cached = readCache(cacheKey);
        if (!cached || cached.v !== 1) return;

        const TTL = 10 * 60 * 1000;
        if (Date.now() - cached.ts > TTL) return;

        restoredRef.current = true;
        restoredHasItemsRef.current = (cached.items?.length ?? 0) > 0;

        const restoredFilters: Filters = {
            q: cached.q,
            type: cached.type,
            difficulty: cached.difficulty,
            unresolvedOnly: cached.unresolvedOnly,
            sort: cached.sort,
        };

        setDraft(restoredFilters);
        setApplied(restoredFilters);
        appliedRef.current = restoredFilters;

        setItems(cached.items || []);
        setPage(cached.page || 0);
        setPageWindowStart(cached.pageWindowStart ?? 0);
        setTotal(cached.total || 0);
        setHasMore(Boolean(cached.hasMore));
        setSelected(cached.selected || {});
        setExpanded(cached.expanded || {});

        requestAnimationFrame(() => {
            window.scrollTo(0, cached.scrollY ?? 0);
        });
    }, [navType, cacheKey]);

    useEffect(() => {
        if (restoredRef.current && restoredHasItemsRef.current) return;
        fetchPage(0, appliedRef.current);
    }, [fetchPage]);

    const [openFilterMenu, setOpenFilterMenu] = useState<"type" | "difficulty" | "sort" | null>(null);
    const filtersRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!filtersRef.current) return;
            if (!filtersRef.current.contains(e.target as Node)) {
                setOpenFilterMenu(null);
            }
        };

        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const applyAndSearch = useCallback(
        (next?: Filters) => {
            const f = next ?? draft;
            appliedRef.current = f;
            setApplied(f);

            setSelected({});
            setExpanded({});
            setOpenFilterMenu(null);

            setPageWindowStart(0);
            setPage(0);

            window.scrollTo(0, 0);
            fetchPage(0, f);
        },
        [draft, fetchPage]
    );

    return (
        <Wrap>
            <LearningPageHeader
                title="오답노트"
                count={`${total}개`}
                onBack={() => nav(-1)}
            />

            <Content>
                <Panel>
                    <FilterRow>
                        <SearchBox>
                            <SearchInput
                                value={draft.q}
                                onChange={(e) => setDraft((p) => ({ ...p, q: e.target.value }))}
                                onKeyDown={onSearchKeyDown}
                                placeholder="문제/해설/용어로 검색"
                            />
                            <SearchBtn onClick={() => applyAndSearch()} disabled={loading}>
                                검색
                            </SearchBtn>
                        </SearchBox>

                        <Filters ref={filtersRef}>
                            <FilterDropdown
                                label="유형"
                                value={draft.type}
                                options={TYPE_OPTIONS}
                                open={openFilterMenu === "type"}
                                active={draft.type !== "ALL"}
                                onToggle={() =>
                                    setOpenFilterMenu((prev) => (prev === "type" ? null : "type"))
                                }
                                onSelect={(value) => {
                                    const next = {
                                        ...draft,
                                        type: value,
                                    };
                                    setDraft(next);
                                    applyAndSearch(next);
                                }}
                            />

                            <FilterDropdown
                                label="난이도"
                                value={draft.difficulty}
                                options={DIFFICULTY_OPTIONS}
                                open={openFilterMenu === "difficulty"}
                                active={draft.difficulty !== "ALL"}
                                onToggle={() =>
                                    setOpenFilterMenu((prev) => (prev === "difficulty" ? null : "difficulty"))
                                }
                                onSelect={(value) => {
                                    const next = {
                                        ...draft,
                                        difficulty: value,
                                    };
                                    setDraft(next);
                                    applyAndSearch(next);
                                }}
                            />

                            <FilterDropdown
                                label="정렬"
                                value={draft.sort}
                                options={SORT_OPTIONS}
                                open={openFilterMenu === "sort"}
                                active={draft.sort !== "RECENT"}
                                onToggle={() =>
                                    setOpenFilterMenu((prev) => (prev === "sort" ? null : "sort"))
                                }
                                onSelect={(value) => {
                                    const next = {
                                        ...draft,
                                        sort: value,
                                    };
                                    setDraft(next);
                                    applyAndSearch(next);
                                }}
                            />

                            <ToggleBtn
                                $on={draft.unresolvedOnly}
                                onClick={() => {
                                    const next = {
                                        ...draft,
                                        unresolvedOnly: !draft.unresolvedOnly,
                                    };
                                    setDraft(next);
                                    applyAndSearch(next);
                                }}
                                aria-pressed={draft.unresolvedOnly}
                            >
                                미해결만
                            </ToggleBtn>

                            <GhostBtn onClick={clearFilters} disabled={loading}>
                                초기화
                            </GhostBtn>
                        </Filters>
                    </FilterRow>

                    <BulkRow>
                        <BulkLeft>
                            <CheckAll>
                                <ToggleSlot>
                                    <SelectToggleChip
                                        checked={allVisibleChecked}
                                        top={0}
                                        left={0}
                                        ariaLabel={allVisibleChecked ? "전체 선택 해제" : "전체 선택"}
                                        title={allVisibleChecked ? "전체 선택 해제" : "전체 선택"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleAllVisible();
                                        }}
                                    />
                                </ToggleSlot>
                                <span>전체 선택</span>
                            </CheckAll>

                            <BulkInfo>
                                선택 <strong>{checkedReviewIds.length}</strong>개 · 현재 페이지{' '}
                                <strong>{displayedItems.length}</strong>개 · 전체{' '}
                                <strong>{total}</strong>개
                            </BulkInfo>
                        </BulkLeft>

                        <BulkRight>
                            <PrimaryBtn
                                onClick={onRetrySelected}
                                disabled={!checkedQuestionIds.length || deleting}
                            >
                                선택 오답 다시풀기
                            </PrimaryBtn>

                            <DangerBtn
                                onClick={onDeleteSelected}
                                disabled={deleting}
                            >
                                {deleting ? "삭제 중..." : "기록 삭제"}
                            </DangerBtn>
                        </BulkRight>
                    </BulkRow>
                </Panel>

                <List>
                    {displayedItems.map((it) => {
                        const isOpen = Boolean(expanded[it.reviewId]);
                        const checked = Boolean(selected[it.reviewId]);

                        return (
                            <Card key={it.reviewId}>
                                <CardHead>
                                    <Left>
                                        <ToggleSlot>
                                            <SelectToggleChip
                                                checked={checked}
                                                top={0}
                                                left={0}
                                                ariaLabel={checked ? "선택 해제" : "선택"}
                                                title={checked ? "선택 해제" : "선택"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelected((p) => ({
                                                        ...p,
                                                        [it.reviewId]: !p[it.reviewId],
                                                    }));
                                                }}
                                            />
                                        </ToggleSlot>
                                        <Meta>
                                            <MetaTopRow>
                                                <Badges>
                                                    <Badge $tone="wrong">
                                                        {it.wrongCount >= 2 && it.badgeLabel ? it.badgeLabel : "오답"}
                                                    </Badge>
                                                    <Badge $tone="type">{toTypeLabel(String(it.questionType))}</Badge>
                                                    <Badge $tone="diff">{toDiffLabel(String(it.difficulty))}</Badge>
                                                    {it.resolved ? (
                                                        <Badge $tone="ok">해결 완료</Badge>
                                                    ) : (
                                                        <Badge $tone="pending">미해결</Badge>
                                                    )}
                                                </Badges>

                                                <TopMeta>
                                                    <span>{it.categoryLabel ? it.categoryLabel : "카테고리 없음"}</span>

                                                    {it.wrongAt ? <Dot /> : null}
                                                    {it.wrongAt ? <span>{fmtDate(it.wrongAt)}</span> : null}

                                                    {it.sessionTitle ? <Dot /> : null}
                                                    {it.sessionTitle ? (
                                                        <span title={it.sessionTitle}>{it.sessionTitle}</span>
                                                    ) : null}
                                                </TopMeta>
                                            </MetaTopRow>
                                        </Meta>
                                    </Left>

                                    <Right>
                                        <MiniBtn onClick={() => onToggleResolved(it)} $tone={it.resolved ? "ok" : "pending"}>
                                            {it.resolved ? "해결 완료" : "미해결"}
                                        </MiniBtn>
                                        <IconToggleBtn
                                            type="button"
                                            onClick={() => toggleExpand(it.reviewId)}
                                            $active={isOpen}
                                            data-tip={isOpen ? "접기" : "정답 / 해설"}
                                            title={isOpen ? "접기" : "정답 / 해설"}
                                            aria-label={isOpen ? "접기" : "정답 / 해설"}
                                            aria-expanded={isOpen}
                                        >
                                            <ExpandChevronIcon open={isOpen} />
                                        </IconToggleBtn>
                                    </Right>
                                </CardHead>

                                <Prompt title={it.prompt}>{it.prompt}</Prompt>

                                {isOpen && (
                                    <Detail>
                                        <Grid>
                                            <Box>
                                                <BoxTitle>내 답</BoxTitle>
                                                <BoxValue>{toDisplayedAnswer(it.userAnswer, it.choices)}</BoxValue>
                                            </Box>
                                            <Box>
                                                <BoxTitle>정답</BoxTitle>
                                                <BoxValue $accent>
                                                    {toDisplayedAnswer(it.correctAnswer, it.choices)}
                                                </BoxValue>
                                            </Box>
                                            <Box>
                                                <BoxTitle>연관 용어</BoxTitle>
                                                <BoxValue>
                                                    {it.termTitle ? (
                                                        <LinkBtn
                                                            onClick={() => {
                                                                persistCache();
                                                                const keyword = safeStr(it.termTitle);
                                                                if (!keyword) {
                                                                    openSys({ title: "이동 불가", message: "termTitle이 없습니다." } as any);
                                                                    return;
                                                                }
                                                                nav("/learning/word?q=" + encodeURIComponent(keyword));
                                                            }}
                                                        >
                                                            {it.termTitle}
                                                        </LinkBtn>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </BoxValue>
                                            </Box>
                                        </Grid>

                                        {it.choices?.length ? (
                                            <Choices>
                                                <ChoicesTitle>보기</ChoicesTitle>
                                                <ChoicesList>
                                                    {it.choices.map((c, idx) => {
                                                        const displayKey = getChoiceDisplayLabel(idx);

                                                        const isCorrect =
                                                            safeStr(it.correctAnswer).toUpperCase() ===
                                                            safeStr(c.key).toUpperCase() ||
                                                            safeStr(it.correctAnswer) === safeStr(c.text) ||
                                                            safeStr(it.correctAnswer) === displayKey;

                                                        const isMine =
                                                            safeStr(it.userAnswer).toUpperCase() ===
                                                            safeStr(c.key).toUpperCase() ||
                                                            safeStr(it.userAnswer) === safeStr(c.text) ||
                                                            safeStr(it.userAnswer) === displayKey;

                                                        return (
                                                            <ChoiceItem
                                                                key={c.key}
                                                                $correct={isCorrect}
                                                                $mine={isMine}
                                                            >
                                                                <span className="k">{displayKey}</span>
                                                                <span className="t">{c.text}</span>
                                                                {isCorrect ? (
                                                                    <span className="tag">정답</span>
                                                                ) : null}
                                                                {isMine && !isCorrect ? (
                                                                    <span className="tag mine">내 답</span>
                                                                ) : null}
                                                            </ChoiceItem>
                                                        );
                                                    })}
                                                </ChoicesList>
                                            </Choices>
                                        ) : null}

                                        {it.explanation ? (
                                            <Explain>
                                                <ExplainTitle>해설</ExplainTitle>
                                                <ExplainBody>{it.explanation}</ExplainBody>
                                            </Explain>
                                        ) : (
                                            <Explain>
                                                <ExplainTitle>해설</ExplainTitle>
                                                <ExplainBody $muted>해설이 아직 없습니다.</ExplainBody>
                                            </Explain>
                                        )}
                                    </Detail>
                                )}
                            </Card>
                        );
                    })}

                    {items.length === 0 && !loading && (
                        <Empty>
                            {hasActiveFilter ? (
                                <>
                                    <h3>조건에 맞는 오답이 없어요</h3>
                                    <p>필터를 조정하거나 초기화를 눌러보세요.</p>
                                </>
                            ) : (
                                <>
                                    <h3>오답이 아직 없어요</h3>
                                    <p>퀴즈를 풀고 틀린 문제는 여기에서 모아볼 수 있어요.</p>
                                </>
                            )}
                        </Empty>
                    )}

                </List>

                {items.length > 0 && pages >= 1 && (
                    <BottomGrid>
                        <PaginationRow>
                            <PaginationBar aria-label="오답노트 페이지 이동">
                                <PageNavBtn
                                    onClick={goPrevWindow}
                                    disabled={!canPrevWindow}
                                    aria-label="이전 페이지 묶음"
                                    type="button"
                                >
                                    ‹
                                </PageNavBtn>

                                {showFirstPage && (
                                    <PagePill
                                        $active={page === 0}
                                        onClick={goFirstPage}
                                        aria-current={page === 0 ? "page" : undefined}
                                        aria-label="1페이지"
                                        type="button"
                                    >
                                        1
                                    </PagePill>
                                )}

                                {showLeadingEllipsis && (
                                    <PageEllipsis aria-hidden="true">...</PageEllipsis>
                                )}

                                {visiblePages.map((p) => (
                                    <PagePill
                                        key={p}
                                        $active={p === page}
                                        onClick={() => movePage(p)}
                                        aria-current={p === page ? "page" : undefined}
                                        aria-label={String(p + 1) + "페이지"}
                                        type="button"
                                    >
                                        {p + 1}
                                    </PagePill>
                                ))}

                                {showTrailingEllipsis && (
                                    <PageEllipsis aria-hidden="true">...</PageEllipsis>
                                )}

                                {showLastPage && (
                                    <PagePill
                                        $active={page === pages - 1}
                                        onClick={goLastPage}
                                        aria-current={page === pages - 1 ? "page" : undefined}
                                        aria-label={String(pages) + "페이지"}
                                        type="button"
                                    >
                                        {pages}
                                    </PagePill>
                                )}

                                <PageNavBtn
                                    onClick={goNextWindow}
                                    disabled={!canNextWindow}
                                    aria-label="다음 페이지 묶음"
                                    type="button"
                                >
                                    ›
                                </PageNavBtn>
                            </PaginationBar>
                        </PaginationRow>
                    </BottomGrid>
                )}
                <SystemMessageModal open={sysOpen} message={sysMsg} onClose={closeSys} />
            </Content>
        </Wrap>
    );
}

/* ====== Styles ====== */
const Wrap = styled.div`
    ${readableText};
    width: 100%;
    min-height: 100%;
    box-sizing: border-box;
    --hero-max: 1240px;
    max-width: var(--hero-max);
    margin: 0 auto;

    color: ${UI.text};
    font-variant-numeric: tabular-nums;
`;

const Content = styled.div`
    padding: 0 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (max-width: 640px) {
        padding: 0 14px 32px;
        gap: 14px;
    }
`;

const Panel = styled.section`
    background: ${UI.panelBgSoft};
    border: 1px solid ${UI.panelLineSoft};
    border-radius: ${UI.radiusXXL};
    box-shadow: ${UI.shadowSoft};
    padding: 14px 14px 12px;
`;

const FilterRow = styled.div`
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 12px;
    @media (max-width: 920px) {
        grid-template-columns: 1fr;
    }
`;

const SearchBox = styled.div`
    display: flex;
    gap: 10px;

    @media (max-width: 640px) {
        flex-direction: column;
    }
`;

const SearchInput = styled.input`
    ${pretendard};
    flex: 1 1 auto;
    height: 44px;
    border-radius: 14px;
    border: 1px solid ${UI.chipLine};
    background: #fff;
    padding: 0 14px;
    color: ${UI.text};
    outline: none;

    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: -0.012em;

    &::placeholder {
        color: rgba(107,114,128,0.82);
        font-weight: 500;
    }

    &:focus {
        border-color: rgba(67, 105, 229, 0.55);
        box-shadow: 0 0 0 3px rgba(67, 105, 229, 0.16);
    }
`;

const SearchBtn = styled.button`
    ${pretendard};
    flex: 0 0 auto;
    height: 44px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid ${UI.primaryBlue};
    background: ${UI.primaryBlue};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    letter-spacing: -0.012em;

    &:hover {
        filter: brightness(0.97);
    }
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    @media (max-width: 640px) {
        width: 100%;
    }
`;

const Filters = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    overflow: visible;

    @media (max-width: 920px) {
        justify-content: flex-start;
    }
`;

const FilterDropdownWrap = styled.div`
    position: relative;
`;

const FilterDropdownTrigger = styled.button<{ $active?: boolean }>`
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;

    height: 42px;
    padding: 0 14px;
    border-radius: 14px;
    letter-spacing: -0.01em;
    white-space: nowrap;

    display: inline-flex;
    align-items: center;
    gap: 8px;

    color: ${({ $active }) => ($active ? "#1a1a1a" : "#666666")};
    font-size: 13px;
    font-weight: ${({ $active }) => ($active ? 700 : 600)};

    background: ${({ $active }) =>
            $active
                    ? "linear-gradient(180deg, rgba(67, 105, 229, 0.12) 0%, rgba(67, 105, 229, 0.07) 100%)"
                    : "#fff"};

    border: 1px solid
    ${({ $active }) =>
            $active ? "rgba(67, 105, 229, 0.22)" : UI.chipLine};

    box-shadow: none;

    transition:
            background 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease,
            border-color 0.18s ease;

    &:hover {
        color: #1a1a1a;
        background: ${({ $active }) =>
                $active
                        ? "linear-gradient(180deg, rgba(67, 105, 229, 0.16) 0%, rgba(67, 105, 229, 0.10) 100%)"
                        : "rgba(255, 255, 255, 0.96)"};
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(67, 105, 229, 0.16);
    }
`;

const FilterCaret = styled.span<{ $open: boolean }>`
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid currentColor;
    transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
    transition: transform 0.18s ease;
    opacity: 0.9;
`;

const FilterDropdownMenu = styled.div<{ $open: boolean }>`
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    min-width: 160px;
    padding: 8px;
    border-radius: 14px;

    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.12);

    opacity: ${({ $open }) => ($open ? 1 : 0)};
    transform: ${({ $open }) =>
    $open ? "translateY(0)" : "translateY(-6px)"};
    pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
    transition: opacity 0.18s ease, transform 0.18s ease;
    z-index: 50;
`;

const FilterDropdownOption = styled.button<{ $active?: boolean }>`
    width: 100%;
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;

    display: flex;
    align-items: center;
    text-align: left;

    padding: 10px 12px;
    border-radius: 12px;

    color: ${({ $active }) => ($active ? "#111827" : "#334155")};
    font-weight: ${({ $active }) => ($active ? 700 : 600)};
    font-size: 14px;
    letter-spacing: -0.01em;

    background: ${({ $active }) =>
    $active ? "rgba(0, 0, 0, 0.04)" : "transparent"};

    transition: background 0.16s ease, transform 0.16s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: translateY(-1px);
    }
`;

const ToggleBtn = styled.button<{ $on?: boolean }>`
    height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid ${({ $on }) => ($on ? UI.chipOnLine : UI.chipLine)};
    background: ${({ $on }) => ($on ? UI.chipOnBg : "#fff")};
    color: ${({ $on }) => ($on ? UI.primaryBlue : UI.text)};
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    letter-spacing: -0.01em;

    &:hover {
        background: ${({ $on }) => ($on ? UI.chipOnBg : "#f9fafb")};
    }
`;

const ToggleSlot = styled.div`
    position: relative;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
`;

const GhostBtn = styled.button`
    height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid ${UI.chipLine};
    background: #fff;
    color: ${UI.sub};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: -0.01em;

    &:hover {
        background: #f9fafb;
        color: ${UI.text};
    }
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const BulkRow = styled.div`
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed rgba(15, 23, 42, 0.12);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const BulkLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
`;

const CheckAll = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    user-select: none;
    color: ${UI.text};
    font-size: 14px;
    font-weight: 650;
    letter-spacing: -0.01em;
`;

const BulkInfo = styled.div`
    color: ${UI.sub};
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.01em;

    strong {
        color: ${UI.text};
        font-weight: 700;
    }
`;

const BulkRight = styled.div`
    display: flex;
    gap: 10px;

    @media (max-width: 640px) {
        width: 100%;
        flex-direction: column;
    }
`;

const PrimaryBtn = styled.button`
    ${pretendard};
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid ${UI.primaryBlue};
    background: ${UI.primaryBlue};
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.012em;
    cursor: pointer;

    &:hover {
        filter: brightness(0.97);
    }
    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }

    @media (max-width: 640px) {
        width: 100%;
    }
`;

const DangerBtn = styled.button`
    ${pretendard};
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.10);
    color: ${UI.danger};
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.012em;
    cursor: pointer;

    &:hover {
        background: rgba(239, 68, 68, 0.14);
        border-color: rgba(239, 68, 68, 0.45);
    }

    @media (max-width: 640px) {
        width: 100%;
    }
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Card = styled.article`
    ${pretendard};
    background: #fff;
    border: 1px solid ${UI.panelLineSoft};
    border-radius: 18px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
    padding: 16px 16px 14px;

    font-size: 14px;
    line-height: 1.62;
    color: ${UI.text};
`;

const CardHead = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const Left = styled.div`
    display: flex;
    gap: 10px;
    align-items: flex-start;

    @media (max-width: 640px) {
        width: 100%;
    }
`;

const Meta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Badges = styled.div`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
`;

const Badge = styled.span<{ $tone: "wrong" | "type" | "diff" | "ok" | "pending" }>`
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;

    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: -0.01em;

    ${({ $tone }) => {
        if ($tone === "wrong")
            return `
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: ${UI.danger};
      `;

        if ($tone === "ok")
            return `
        background: rgba(67, 105, 229, 0.06);
        border: 1px solid rgba(67, 105, 229, 0.22);
        color: ${UI.primaryBlue};
      `;

        if ($tone === "pending")
            return `
        background: rgba(107, 114, 128, 0.10);
        border: 1px solid rgba(107, 114, 128, 0.22);
        color: ${UI.sub};
      `;

        return `
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      color: ${UI.text};
    `;
    }}
`;

const MetaLine = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${UI.sub};
    font-size: 12px;
    letter-spacing: -0.02em;
    span {
        max-width: 380px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const MetaTopRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const TopMeta = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    color: rgba(107,114,128,0.92);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: -0.008em;

    min-width: 0;

    span {
        max-width: 380px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    @media (max-width: 520px) {
        flex-basis: 100%;
    }
`;

const Dot = styled.span`
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.25);
    display: inline-block;
`;

const Right = styled.div`
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;

    @media (max-width: 640px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

const MiniBtn = styled.button<{ $tone: "ok" | "pending" | "normal" }>`
    height: 32px;
    min-width: 92px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    font-size: 13px;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: ${UI.text};

    ${({ $tone }) =>
            $tone === "ok" &&
            `
      border-color: rgba(67, 105, 229, 0.22);
      color: ${UI.primaryBlue};
      background: rgba(67, 105, 229, 0.06);
    `}

    ${({ $tone }) =>
            $tone === "pending" &&
            `
      border-color: rgba(107, 114, 128, 0.22);
      color: ${UI.sub};
      background: rgba(107, 114, 128, 0.10);
    `}

    &:hover {
        filter: brightness(0.98);
    }
    &:focus-visible {
        outline: 3px solid rgba(67, 105, 229, 0.22);
        outline-offset: 2px;
    }
`;

const IconToggleBtn = styled.button<{ $active?: boolean }>`
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 999px;

    border: 0;
    background: transparent;
    color: #6b7280;

    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &:hover {
        background: rgba(15, 23, 42, 0.06);
        color: #111827;
    }

    ${({ $active }) =>
            $active &&
            `
      background: rgba(67, 105, 229, 0.10);
      color: ${UI.primaryBlue};
    `}

    &:active {
        background: rgba(15, 23, 42, 0.10);
    }

    &:focus-visible {
        outline: 3px solid rgba(67, 105, 229, 0.22);
        outline-offset: 2px;
        background: rgba(67, 105, 229, 0.10);
    }

    /* Tooltip */
    &::after {
        content: attr(data-tip);
        position: absolute;
        left: 50%;
        bottom: calc(100% + 10px);
        transform: translateX(-50%) translateY(2px);
        background: rgba(15, 23, 42, 0.92);
        color: #fff;
        padding: 6px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.12s ease, transform 0.12s ease;
    }

    &::before {
        content: "";
        position: absolute;
        left: 50%;
        bottom: calc(100% + 4px);
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: rgba(15, 23, 42, 0.92);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.12s ease;
    }

    &:hover::after,
    &:focus-visible::after {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    &:hover::before,
    &:focus-visible::before {
        opacity: 1;
    }

    @media (max-width: 640px) {
        &::after,
        &::before {
            display: none;
        }
    }
`;

const Prompt = styled.h3`
    ${pretendard};
    margin: 10px 0 0;
    font-size: 16px;
    line-height: 1.68;
    letter-spacing: -0.016em;
    font-weight: 700;
    color: ${UI.text};

    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const Detail = styled.div`
    margin-top: 12px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    @media (max-width: 920px) {
        grid-template-columns: 1fr;
    }
`;

const Box = styled.div`
    border: 1px solid #e5e7eb;
    background: #fbfbfd;
    border-radius: 14px;
    padding: 10px 10px 9px;
`;

const BoxTitle = styled.div`
    ${pretendard};
    font-size: 12px;
    color: ${UI.text};
    font-weight: 800;
    line-height: 1.4;
    letter-spacing: -0.01em;
`;

const BoxValue = styled.div<{ $accent?: boolean }>`
    ${pretendard};
    margin-top: 6px;
    font-size: 14px;
    line-height: 1.65;
    color: ${({ $accent }) => ($accent ? UI.primaryBlue : UI.text)};
    font-weight: 600;
    letter-spacing: -0.012em;
    white-space: pre-wrap;
    word-break: break-word;
`;

const LinkBtn = styled.button`
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
    color: ${UI.text};
    font-weight: 600;
    letter-spacing: -0.008em;
    line-height: 1.45;

    text-decoration: underline;
    text-decoration-color: rgba(67,105,229,0.35);
    text-underline-offset: 3px;

    &:hover {
        text-decoration-color: rgba(67,105,229,0.65);
        filter: brightness(0.98);
    }
`;

const Choices = styled.div``;

const ChoicesTitle = styled.div`
    font-size: 12px;
    color: ${UI.sub};
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 8px;
`;

const ChoicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ChoiceItem = styled.div<{ $correct?: boolean; $mine?: boolean }>`
    ${pretendard};
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 12px 12px;
    display: grid;
    grid-template-columns: 32px 1fr auto;
    gap: 10px;
    align-items: center;

    background: ${({ $correct, $mine }) =>
            $correct
                    ? "rgba(16, 185, 129, 0.08)"
                    : $mine
                            ? "rgba(239, 68, 68, 0.08)"
                            : "#fff"};

    border-color: ${({ $correct, $mine }) =>
            $correct
                    ? "rgba(16, 185, 129, 0.25)"
                    : $mine
                            ? "rgba(239, 68, 68, 0.22)"
                            : "#e5e7eb"};

    .k {
        font-weight: 700;
        font-size: 13px;
        line-height: 1.3;
    }

    .t {
        font-size: 15px;
        line-height: 1.68;
        letter-spacing: -0.012em;
        font-weight: 500;
    }

    .tag {
        font-size: 12px;
        font-weight: 700;
        color: ${UI.success};
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.22);
        border-radius: 999px;
        padding: 4px 8px;
        height: fit-content;
    }

    .tag.mine {
        color: ${UI.danger};
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.22);
    }

    ${({ $mine, $correct }) =>
            $mine && !$correct ? `box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.10);` : ""};

    @media (max-width: 640px) {
        grid-template-columns: 28px 1fr;
        align-items: start;

        .tag {
            grid-column: 2 / 3;
            justify-self: start;
            margin-top: 4px;
        }

        .t {
            font-size: 14px;
            line-height: 1.6;
        }
    }
`;

const Explain = styled.div``;

const ExplainTitle = styled.div`
    font-size: 12px;
    color: ${UI.sub};
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 8px;
`;

const ExplainBody = styled.p<{ $muted?: boolean }>`
    ${pretendard};
    margin: 0;
    font-size: 14px;
    line-height: 1.76;
    letter-spacing: -0.012em;
    font-weight: 400;
    color: ${({ $muted }) => ($muted ? "rgba(107,114,128,0.92)" : UI.text)};
    white-space: pre-wrap;
    word-break: break-word;
`;

const MoreRow = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 8px;
`;

const MoreBtn = styled.button`
    appearance: none;
    border: 1px solid ${UI.panelLineSoft};
    background: #fff;
    height: 44px;
    padding: 0 18px;
    border-radius: 14px;
    cursor: pointer;
    font-weight: 800;
    color: ${UI.text};
    &:hover {
        background: #f9fafb;
    }
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EndText = styled.div`
    color: ${UI.sub};
    font-size: 13px;
    letter-spacing: -0.02em;
`;

const Empty = styled.div`
    background: #fff;
    border: 1px dashed rgba(15, 23, 42, 0.18);
    border-radius: 18px;
    padding: 26px 18px;
    text-align: center;

    h3 {
        margin: 0;
        font-size: 16px;
        color: ${UI.text};
        letter-spacing: -0.01em;
        font-weight: 650;
    }

    p {
        margin: 8px 0 0;
        font-size: 13px;
        color: ${UI.sub};
        letter-spacing: -0.008em;
        font-weight: 500;
    }
`;

const PaginationRow = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 6px;
    width: fit-content;
    margin: 0 auto;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const PaginationBar = styled.nav`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px;

    @media (max-width: 768px) {
        width: 100%;
        gap: 4px;
        overflow-x: auto;
        justify-content: flex-start;
        padding: 6px 0;
    }
`;


const PagePill = styled.button<{ $active?: boolean }>`
    height: 34px;
    min-width: 34px;
    padding: 0 12px;
    border-radius: 10px;
    border: 0;

    font-weight: 800;
    letter-spacing: -0.02em;
    cursor: pointer;

    color: ${({ $active }) => ($active ? "#fff" : "rgba(15,23,42,0.70)")};
    -webkit-text-fill-color: ${({ $active }) => ($active ? "#fff" : "rgba(15,23,42,0.70)")};
    background: ${({ $active }) => ($active ? UI.primaryBlue : "transparent")};

    transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

    &:hover {
        background: ${({ $active }) => ($active ? UI.primaryBlue : "rgba(255,255,255,0.85)")};
        color: ${({ $active }) => ($active ? "#fff" : UI.text)};
        -webkit-text-fill-color: ${({ $active }) => ($active ? "#fff" : UI.text)};
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(67, 105, 229, 0.22);
    }
`;

const PageNavBtn = styled(PagePill)<{ disabled?: boolean }>`
    padding: 0 10px;
    color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : "rgba(15,23,42,0.70)")};
    -webkit-text-fill-color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : "rgba(15,23,42,0.70)")};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    &:hover {
        background: ${({ disabled }) => (disabled ? "transparent" : "rgba(255,255,255,0.85)")};
        color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : UI.text)};
        -webkit-text-fill-color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : UI.text)};
    }

    &:active {
        transform: ${({ disabled }) => (disabled ? "none" : "translateY(1px)")};
    }
`;

const PageEllipsis = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 34px;
    padding: 0 4px;
    color: rgba(15, 23, 42, 0.5);
    font-weight: 800;
    letter-spacing: -0.02em;
    user-select: none;
`;

const BottomGrid = styled.div`
    width: 100%;
    margin-top: 16px;
    display: flex;
    justify-content: center;
`;
