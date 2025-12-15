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
    return http.post(url, body, { validateStatus: () => true });
}

export type StartQuizSessionUnifiedPayload =
    | { source: "set"; setId: number; seedMode?: "AUTO" | "DAILY" | "FIXED"; fixedSeed?: number | null }
    | { source: "wordbook"; wordbookId: number; count: number; type: "mix" | "choice" | "ox" | "initials"; level: "mix" | "easy" | "medium" | "hard"; seedMode?: "AUTO" | "DAILY" | "FIXED"; fixedSeed?: number | null }
    | { source: "category"; categoryId: number; count: number; type: "mix" | "choice" | "ox" | "initials"; level: "mix" | "easy" | "medium" | "hard"; seedMode?: "AUTO" | "DAILY" | "FIXED"; fixedSeed?: number | null }
    | { source: "DAILY"; setId: number; type: "CHOICE" | "OX" | "INITIALS"; role?: string; date?: string; seedMode?: "AUTO" | "DAILY" | "FIXED"; fixedSeed?: number | null };

export async function startQuizUnified(payload: StartQuizSessionUnifiedPayload) {
    // baseURL=/api 이므로 첫 호출만으로 충분(두 번째 '/api/..' 폴백은 동일 호출이라 실효 없음)
    const res = await tryPost(`/me/quiz/sessions/start`, payload);

    if (res.status < 200 || res.status >= 300) {
        const msg = (res.data && (res.data.message || res.data.error)) || `HTTP ${res.status}`;
        const err: any = new Error(msg);
        err.response = { status: res.status, data: res.data };
        throw err;
    }
    return (res.data?.data ?? res.data) as {
        sessionId: number;
        quizSetId?: number;
        questionIds?: number[];
    };
}

/** 틀린 문제만 다시 풀기: 라우트 기대 형태에 맞춰 반환 */
export async function retryWrongOnly(oldSessionId: number) {
    const res = await tryPost(`/me/quiz/sessions/${oldSessionId}/retry-wrong`, {});
    if (res.status < 200 || res.status >= 300) {
        const msg = (res.data && (res.data.message || res.data.error)) || `HTTP ${res.status}`;
        const err: any = new Error(msg);
        err.response = { status: res.status, data: res.data };
        throw err;
    }

    const d = res.data?.data ?? res.data;
    const newSessionId = Number(d?.sessionId ?? d?.id);
    if (!Number.isFinite(newSessionId)) throw new Error("Invalid newSessionId");

    // 라우트(QuizResultRoute)에서 기대하는 필드 맞춤
    return {
        newSessionId,
        questionType: d?.questionType ?? d?.question_type ?? null,
        playPath: (d?.playPath ?? "").trim() || "",
    };
}

/** 편의 */
export function startDailySetSession(setId: number, type: "OX" | "CHOICE" | "INITIALS", opts?: { role?: string; date?: string }) {
    return startQuizUnified({ source: "DAILY", setId, type, role: opts?.role, date: opts?.date, seedMode: "DAILY" });
}
