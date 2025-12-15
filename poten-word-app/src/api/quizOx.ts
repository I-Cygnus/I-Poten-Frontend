// api/quizOx.ts
import http from "../utils/http";

export type OX = "O" | "X";
export type OXQuestion = { id?: number; q: string; correct: OX; explanation?: string };

const Q_TTL = 5 * 60_000;
const qCache = new Map<number, { expires: number; value: OXQuestion[] }>();
const qInflight = new Map<number, Promise<OXQuestion[]>>();

const toStr = (v: any) => (v == null ? "" : String(v));
const upper = (v: any) => toStr(v).trim().toUpperCase();

function strToOX(v: any): OX | null {
    const s = upper(v);
    if (["O","TRUE","T","YES","Y"].includes(s)) return "O";
    if (["X","FALSE","F","NO","N"].includes(s)) return "X";
    return null;
}

function isLikelyOX(raw: any): boolean {
    const t = upper(raw?.questionType ?? raw?.question_type ?? raw?.type ?? raw?.part);
    if (t.includes("OX") || t.includes("TRUE_FALSE") || t.includes("BOOLEAN") || t === "TF") return true;

    const choices = Array.isArray(raw?.choices) ? raw.choices : null;
    if (choices && choices.length === 2) return true;
    if (strToOX(raw?.answer) || strToOX(raw?.answerText) || strToOX(raw?.answer_text)) return true;

    // 일부 백엔드는 type 누락 + choice1/choice2만 존재
    if ((raw?.choice1 || raw?.choice2) && !raw?.choice3 && !raw?.choice4) return true;

    return false;
}

function mapOne(raw: any): OXQuestion {
    const id = raw.id ?? raw.questionId ?? raw.question_id ?? raw.quizQuestionId ?? raw.quiz_question_id;
    const q = toStr(raw.questionText ?? raw.question_text ?? raw.q ?? raw.question ?? raw.text ?? "");
    const explanation = raw.explanation ?? raw.explain ?? raw.desc ?? raw.description ?? undefined;

    let correct: OX | null =
        strToOX(raw.correct) ?? strToOX(raw.answer) ?? strToOX(raw.answerText) ?? strToOX(raw.answer_text);

    if (!correct && Array.isArray(raw.choices)) {
        const ans = raw.choices.find((c: any) => c?.is_answer || c?.isAnswer || c?.correct);
        if (ans) correct = strToOX(ans?.text ?? ans?.label ?? ans?.value);
        if (!correct && raw.choices.length >= 2) correct = "O"; // 2지선다 가정(리포트로 보강)
    }
    if (!correct) {
        const ci = raw.correctIndex ?? raw.correct_index ?? raw.answer_index ?? raw.answerIndex;
        if (ci === 0 || ci === 1) correct = ci === 0 ? "O" : "X";
    }
    return { id, q, correct: (correct ?? "O"), explanation };
}

const CANDIDATES = (setId: number) => [
    { method: "get" as const, url: `/quiz/sets/${setId}/questions`, params: { type: "OX" as const } },
    { method: "get" as const, url: `/quiz/sets/${setId}/questions`, params: { questionType: "OX" as const } },
    { method: "get" as const, url: `/quiz/sets/${setId}/questions`, params: { part: "OX" as const } },
    { method: "get" as const, url: `/quiz/sets/${setId}/questions` }, // 무파라미터
];

export async function fetchOxQuestionsBySetId(setId: number): Promise<OXQuestion[]> {
    const now = Date.now();
    const cached = qCache.get(setId);
    if (cached && cached.expires > now) return cached.value;

    const inflight = qInflight.get(setId);
    if (inflight) return inflight;

    const p = (async () => {
        for (const c of CANDIDATES(setId)) {
            try {
                const res = await (c.method === "get"
                    ? http.get(c.url, { params: (c as any).params, withCredentials: true })
                    : http.post(c.url, (c as any).data, { params: (c as any).params, withCredentials: true }));

                const raw = res.data?.data ?? res.data ?? [];
                const rows = Array.isArray((raw as any)?.questions)
                    ? (raw as any).questions
                    : Array.isArray(raw)
                        ? raw
                        : [];

                const oxRows = rows.filter(isLikelyOX);
                const mapped = (oxRows.length ? oxRows : rows).filter(isLikelyOX).map(mapOne);

                if (mapped.length > 0) {
                    qCache.set(setId, { expires: now + Q_TTL, value: mapped });
                    return mapped;
                }
                // 빈 배열이면 다음 후보 계속 시도
            } catch {
                // 400/500이면 다음 후보로
            }
        }
        // 모든 후보 실패/빈 리스트면 그냥 [] 반환(호출부 폴백)
        return [] as OXQuestion[];
    })();

    qInflight.set(setId, p);
    try { return await p; } finally { qInflight.delete(setId); }
}
