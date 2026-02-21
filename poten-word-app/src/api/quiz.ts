// src/api/quiz.ts
import http from "../utils/http";

/** 호스트(혹은 게이트웨이)에서 주입하는 런타임 설정 */
const CFG: any = (globalThis as any).__APP_CONFIG__ || {};
const QUIZ_RESULTS_PATH: string = String(CFG.QUIZ_RESULTS_PATH || "").trim();
// 예: "/api/me/quiz/sessions/:id/answers"  또는 "/api/me/quiz/sessions/{id}/items"

/** ============== 기존: 세션 요약/리포트 ============== */
export async function getSessionSummary(id: number) {
    const { data } = await http.get(`/me/quiz/sessions/${id}`);
    return data?.data ?? data;
}

/** 응답 정규화: {details:[{correct:boolean}], total?, correct?} 형태로 맞춤 */
function normalizeReportPayload(payload: any) {
    if (!payload) return null;

    const base = payload?.data ?? payload;
    if (Array.isArray(base?.details)) {
        return {
            ...base,
            details: base.details.map((d: any) => ({ correct: !!(d.correct ?? d.isCorrect) })),
        };
    }

    const arr =
        base?.items ??
        base?.answers ??
        base?.results ??
        (Array.isArray(base) ? base : null);

    if (Array.isArray(arr)) {
        return {
            total: base?.total ?? arr.length,
            correct: base?.correct ?? arr.filter((x: any) => !!(x.correct ?? x.isCorrect)).length,
            details: arr.map((it: any) => ({ correct: !!(it.correct ?? it.isCorrect) })),
        };
    }

    return null;
}

// null/undefined/빈배열 제거용 (필요하면 범용으로)
function compact2<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => {
            if (v === undefined || v === null) return false;
            if (Array.isArray(v) && v.length === 0) return false;
            return true;
        })
    ) as Partial<T>;
}

/** 서버에 /result 류가 없으면 아예 호출 안 함(= 로그 0) */
export async function getSessionReport(id: number) {
    // 1) 제출된 세션만 결과 조회 시도
    try {
        const sum = await getSessionSummary(id);
        const st = String(sum?.status || sum?.sessionStatus || "").toUpperCase();
        if (st !== "SUBMITTED") return null;
    } catch {
        // 요약 실패 → 결과도 시도하지 않음
        return null;
    }

    // 2) 런타임 경로가 없으면 호출 자체를 하지 않음
    if (!QUIZ_RESULTS_PATH) return null;

    const url = QUIZ_RESULTS_PATH.replace(":id", String(id)).replace("{id}", String(id));
    try {
        const res = await http.get(url, { validateStatus: () => true });
        if (res.status >= 200 && res.status < 300) {
            return normalizeReportPayload(res.data);
        }
    } catch {
        /* ignore */
    }
    // 실패 시 조용히 null → 프론트는 로컬/상태 progress로 표시
    return null;
}

/** ============== 세션 시작/재시작 유니파이드 API ============== */

/** 내부 POST 헬퍼 */
async function tryPost(url: string, body: any) {
    // baseURL이 이미 /api 이므로 '/api/...'로 줘도 인터셉터가 정리합니다.
    return http.post(url, body, {
        validateStatus: () => true,
        withCredentials: true,
    });
}

type QType = "MIX" | "CHOICE" | "OX" | "INITIALS";
type QLevel = "MIX" | "EASY" | "MEDIUM" | "HARD";
type SeedMode = "AUTO" | "DAILY" | "FIXED";
type WireType = "mix" | "choice" | "ox" | "initials";

function normalizeType(v: any): "MIX" | "CHOICE" | "OX" | "INITIALS" | undefined {
    const s = String(v ?? "").trim();
    if (!s) return undefined;
    const u = s.toUpperCase();
    if (u === "MIX" || u === "CHOICE" || u === "OX" || u === "INITIALS") return u;
    return undefined;
}

function normalizeLevel(v: any): "MIX" | "EASY" | "MEDIUM" | "HARD" | undefined {
    const s = String(v ?? "").trim();
    if (!s) return undefined;
    const u = s.toUpperCase();
    if (u === "MIX" || u === "EASY" || u === "MEDIUM" || u === "HARD") return u;
    return undefined;
}

function toWireType(t: QType): WireType {
    switch (t) {
        case "CHOICE": return "choice";
        case "OX": return "ox";
        case "INITIALS": return "initials";
        case "MIX":
        default: return "mix";
    }
}

// undefined 값은 JSON.stringify에서 빠지니까 “키 자체가 제거”되는 효과
function compact<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined)
    ) as Partial<T>;
}

export type StartQuizSessionUnifiedPayload =
    | {
    source: "set";
    quizSetId?: number;
    setId?: number;
    count?: number;
    type?: QType;
    level?: QLevel;
    seedMode?: SeedMode;
    fixedSeed?: number | null;
    title?: string;
    customTitle?: string;
}
    | {
    source: "wordbook";
    wordbookId: number;
    count: number;
    type: QType;
    level: QLevel;
    seedMode?: SeedMode;
    fixedSeed?: number | null;
    title?: string;
    customTitle?: string;
}
    | {
    source: "term_category" | "category";
    categoryId?: number;
    termCategoryId?: number;
    count: number;
    type: QType;
    level: QLevel;
    seedMode?: SeedMode;
    fixedSeed?: number | null;
    labelKeys?: string[];
    title?: string;
    customTitle?: string;

}
    | {
    source: "labels";
    labelKeys: string[];
    count: number;
    type: QType;
    level: QLevel;
    seedMode?: SeedMode;
    fixedSeed?: number | null;
    title?: string;
    customTitle?: string;
}

    | {
    source: "multi";
    filters: Array<{ termCategoryId: number; labelKeys?: string[] }>;
    count: number;
    type: QType;
    level: QLevel;
    seedMode?: SeedMode;
    fixedSeed?: number | null;
    title?: string;
    customTitle?: string;
};

export async function startQuizUnified(payload: StartQuizSessionUnifiedPayload) {
    const body = (() => {
        const rawTitle = (payload as any).customTitle ?? (payload as any).title;
        const customTitle = String(rawTitle ?? "").trim() || undefined;

        // 1) term_category / category
        if (payload.source === "category" || payload.source === "term_category") {
            const categoryIdRaw = (payload as any).categoryId ?? (payload as any).termCategoryId;
            const termCategoryId = Number(categoryIdRaw);
            const count = Number((payload as any).count);

            const typeRaw = (payload as any).type ?? "mix";
            const levelRaw = (payload as any).level ?? "MIX";

            const typeNorm = normalizeType(typeRaw) ?? "MIX";
            const levelNorm = normalizeLevel(levelRaw) ?? "MIX";

            const seedMode = (payload as any).seedMode ?? "AUTO";
            const fixedSeed = seedMode === "FIXED" ? ((payload as any).fixedSeed ?? null) : undefined;

            const labelKeys = Array.isArray((payload as any).labelKeys) ? (payload as any).labelKeys : [];

            // NaN이면 보내지 말고 바로 에러(프론트에서 잡아 UX 처리)
            if (!Number.isFinite(termCategoryId)) {
                throw new Error("termCategoryId가 유효하지 않습니다.");
            }

            return compact({
                source: "term_category",
                termCategoryId,
                count,
                type: toWireType(typeNorm),
                level: levelNorm,
                seedMode,
                fixedSeed,
                ...(labelKeys.length ? { labelKeys } : {}),
                ...(customTitle ? { customTitle, title: customTitle } : {}),
            });
        }

        // 2) wordbook
        if (payload.source === "wordbook") {
            const typeNorm = normalizeType(payload.type) ?? "MIX";
            const levelNorm = normalizeLevel(payload.level) ?? "MIX";

            return compact({
                source: "wordbook",
                wordbookId: payload.wordbookId,
                count: payload.count,
                type: toWireType(typeNorm),
                level: levelNorm,
                seedMode: payload.seedMode ?? "AUTO",
                ...(payload.seedMode === "FIXED" ? { fixedSeed: payload.fixedSeed ?? null } : {}),
                ...(customTitle ? { customTitle, title: customTitle } : {}),
            });
        }

        if (payload.source === "labels") {
            const count = Number((payload as any).count);
            const typeNorm = normalizeType((payload as any).type ?? "mix") ?? "MIX";
            const levelNorm = normalizeLevel((payload as any).level ?? "MIX") ?? "MIX";

            const seedMode = (payload as any).seedMode ?? "AUTO";
            const fixedSeed = seedMode === "FIXED" ? ((payload as any).fixedSeed ?? null) : undefined;

            const labelKeys = Array.isArray((payload as any).labelKeys) ? (payload as any).labelKeys : [];
            if (!labelKeys.length) throw new Error("labelKeys가 비어 있습니다.");

            return compact({
                source: "labels",
                labelKeys,
                count,
                type: toWireType(typeNorm),
                level: levelNorm,
                seedMode,
                fixedSeed,
                ...(customTitle ? { customTitle, title: customTitle } : {}),
            });
        }

        if (payload.source === "multi") {
            const count = Number((payload as any).count);

            const typeNorm = normalizeType((payload as any).type ?? "MIX") ?? "MIX";
            const levelNorm = normalizeLevel((payload as any).level ?? "MIX") ?? "MIX";

            const seedMode = (payload as any).seedMode ?? "AUTO";
            const fixedSeed = seedMode === "FIXED" ? ((payload as any).fixedSeed ?? null) : undefined;

            const filters = Array.isArray((payload as any).filters) ? (payload as any).filters : [];
            if (!filters.length) throw new Error("filters가 비어 있습니다.");

            return compact({
                source: "multi",
                filters: filters.map((f: any) => ({
                    termCategoryId: Number(f.termCategoryId),
                    ...(Array.isArray(f.labelKeys) && f.labelKeys.length ? { labelKeys: f.labelKeys } : {}),
                })),
                count,
                type: toWireType(typeNorm),
                level: levelNorm,
                seedMode,
                fixedSeed,
                ...(customTitle ? { customTitle, title: customTitle } : {}),
            });
        }

        // 3) set
        const quizSetId = (payload as any).quizSetId ?? (payload as any).setId;

        const typeNorm = normalizeType((payload as any).type) ?? "MIX";
        const levelNorm = normalizeLevel((payload as any).level) ?? "MIX";

        return compact({
            source: "set",
            quizSetId,
            seedMode: (payload as any).seedMode ?? "AUTO",
            ...(payload.seedMode === "FIXED" ? { fixedSeed: (payload as any).fixedSeed ?? null } : {}),
            ...(payload.count ? { count: payload.count } : {}),
            type: toWireType(typeNorm),
            level: levelNorm,
            ...(customTitle ? { customTitle, title: customTitle } : {}),
        });
    })();

    const res = await tryPost(`/me/quiz/sessions/start`, body);

    if (res.status < 200 || res.status >= 300) {
        console.error("[startQuizUnified] failed:", { status: res.status, data: res.data, sentBody: body });

        const msg = (res.data && (res.data.message || res.data.error)) || `HTTP ${res.status}`;

        const e: any = new Error(msg);
        e.response = { status: res.status, data: res.data };
        e.sentBody = body;
        throw e;
    }

    const d = res.data?.data ?? res.data;
    const sessionId = Number(d?.sessionId ?? d?.id);
    if (!Number.isFinite(sessionId)) throw new Error("Invalid sessionId");

    return {
        sessionId,
        quizSetId: Number(d?.quizSetId ?? 0) || undefined,
        questionIds: Array.isArray(d?.questionIds) ? d.questionIds : [],
        items: Array.isArray(d?.items) ? d.items : [],
        playPath: String(d?.playPath ?? "").trim() || `/poten-word/quiz/play`,
    };
}

/** 편의 */
export function startDailySetSession(
    setId: number,
    type: "OX" | "CHOICE" | "INITIALS",
) {
    return startQuizUnified({
        source: "set",
        setId,
        type: type as any,
        seedMode: "DAILY",
    });
}
