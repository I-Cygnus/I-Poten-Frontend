import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import InitialsQuizCard from "../components/InitialsQuizCard";
import http from "../utils/http";

type OX = "O" | "X";
const TARGET_LEN = 3;

type DailyInitialsQuestion = {
    id: number;
    order: number;
    questionText: string;
    answerText: string;
};

type FallbackSetQuestion = {
    id: number;
    questionText?: string;
    answerText?: string;
    choices?: { id: number; choiceText: string; isAnswer?: boolean }[];
    termTitle?: string;
    termName?: string;
};

type QuizItem = { id: number; q: string; initials: string[]; answer: string };

/* ======================= 유틸 ======================= */
function hangulToInitials(text: string): string[] {
    const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    const res: string[] = [];
    for (const ch of (text ?? "")) {
        const code = ch.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) {
            const idx = code - 0xac00;
            const choIdx = Math.floor(idx / 588);
            res.push(CHO[choIdx] ?? ch);
        } else if (/\s/.test(ch)) {
            continue;
        } else {
            res.push(ch);
        }
    }
    return res;
}
const nz = (s?: string | null) => (s ?? "").trim();
const norm = (s: string) => nz(s).replace(/\s+/g, "").toLowerCase();

function extractSessionBits(resp: any): { sessionId: string | null; quizSetId: string | null } {
    const candsId = [resp?.sessionId, resp?.session_id, resp?.id, resp?.session?.id, resp?.data?.sessionId];
    const candsSet = [resp?.quizSetId, resp?.quiz_set_id, resp?.setId, resp?.data?.quizSetId];
    const sid = candsId.find((v) => typeof v === "number" || typeof v === "string");
    const set = candsSet.find((v) => typeof v === "number" || typeof v === "string");
    return { sessionId: sid ? String(sid) : null, quizSetId: set ? String(set) : null };
}

/** 세션 요약에서 setId 복구 (URL로 sessionId만 들어온 경우 대비) */
async function fetchSetIdFromSession(sid: string): Promise<string | null> {
    try {
        const { data } = await http.get(`/me/quiz/sessions/${sid}`);
        const cands = [data?.quizSetId, data?.quiz_set_id, data?.setId];
        const v = cands.find((x) => typeof x === "number" || typeof x === "string");
        return v ? String(v) : null;
    } catch {
        return null;
    }
}

/** 세트에서 INITIALS로 보충 문항 끌어오기 */
function toInitialsItemsFromSet(list: FallbackSetQuestion[]): QuizItem[] {
    return list
        .map((q) => {
            const ans =
                nz(q.answerText) ||
                nz(q.choices?.find((c) => c.isAnswer)?.choiceText) ||
                nz(q.termTitle) ||
                nz(q.termName);
            if (!ans) return null;
            return {
                id: q.id,
                q: q.questionText || "",
                answer: ans,
                initials: hangulToInitials(ans),
            } as QuizItem;
        })
        .filter(Boolean) as QuizItem[];
}

async function tryFallbackFromSet(setId: string | null, need: number): Promise<QuizItem[]> {
    if (!setId || need <= 0) return [];
    try {
        // 백엔드: GET /api/quiz/sets/{setId}/questions?part=INITIALS
        const { data } = await http.get(`/quiz/sets/${setId}/questions`, { params: { part: "INITIALS" } });
        const list: FallbackSetQuestion[] = data?.questions ?? data?.items ?? [];
        const items = toInitialsItemsFromSet(list);
        return items.slice(0, need);
    } catch (e) {
        console.warn("[initials] fallback from set failed", e);
        return [];
    }
}
/* =================================================== */

export default function InitialsQuizPage() {
    const nav = useNavigate();
    const [sp] = useSearchParams();
    const location = useLocation();

    const initialSessionId = sp.get("sessionId") ?? (location.state as any)?.sessionId ?? null;

    const [sessionId, setSessionId] = React.useState<string | null>(initialSessionId);
    const [quizSetId, setQuizSetId] = React.useState<string | null>(null);
    const [quiz, setQuiz] = React.useState<QuizItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const LS_KEY = React.useMemo(() => (sessionId ? `quiz/initials/${sessionId}/progress` : ""), [sessionId]);
    const LS_KEY_RESULT_BRIDGE = "quiz/initials-or-ox/progress"; // 결과 페이지와 키 통합

    const [idx, setIdx] = React.useState(1);
    const [answer, setAnswer] = React.useState("");
    const [showResult, setShowResult] = React.useState(false);
    const [progress, setProgress] = React.useState<(OX | null)[]>([]);

    const total = quiz.length;
    const cur = quiz[idx - 1];
    const isCorrect = showResult && cur && norm(answer) === norm(cur.answer);
    const [resetToken, setResetToken] = React.useState(0);

    React.useEffect(() => {
        let mounted = true;

        async function ensureSession(): Promise<{ sid: string; setId: string | null }> {
            if (initialSessionId) {
                const setId = await fetchSetIdFromSession(initialSessionId);
                return { sid: initialSessionId, setId };
            }
            const payload = { source: "daily", type: "INITIALS", role: "GENERAL", seedMode: "DAILY" };
            const { data } = await http.post("/me/quiz/sessions/start", payload);
            const { sessionId: sid, quizSetId: setId } = extractSessionBits(data);
            if (!sid) throw new Error("세션 생성 실패: sessionId 부재");
            return { sid, setId };
        }

        async function loadInitialsQuestions(sid: string): Promise<QuizItem[]> {
            const { data } = await http.get(`/me/quiz/sessions/${sid}/questions/initials`);
            const list: DailyInitialsQuestion[] = data?.questions ?? [];
            return list.map((q) => ({
                id: q.id,
                q: q.questionText,
                answer: q.answerText,
                initials: hangulToInitials(q.answerText),
            }));
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const { sid, setId } = await ensureSession();
                const effectiveSetId = setId ?? (await fetchSetIdFromSession(sid));
                if (!mounted) return;
                setSessionId(sid);
                setQuizSetId(effectiveSetId ?? null);

                // 주소창에 sessionId 고정
                const url = new URL(window.location.href);
                url.searchParams.set("sessionId", sid);
                window.history.replaceState(null, "", url.toString());

                // 1차: 세션 기반 문항
                let items = await loadInitialsQuestions(sid);
                if (!mounted) return;

                // 부족하면 같은 세트에서 보충
                if (items.length < 3) {
                    const need = 3 - items.length;
                    const extras = await tryFallbackFromSet(effectiveSetId ?? null, need);
                    const seen = new Set(items.map((it) => it.id));
                    for (const ex of extras) {
                        if (!seen.has(ex.id)) {
                            items.push(ex);
                            seen.add(ex.id);
                            if (items.length >= 3) break;
                        }
                    }
                }

                // 최종 3개로 강제
                if (items.length > TARGET_LEN) items = items.slice(0, TARGET_LEN);

                setQuiz(items);
                setIdx(1);
                setAnswer("");
                setShowResult(false);

                // 진행도 복구(길이 맞춤)
                const freshStart = !initialSessionId;
                const empty = Array.from({ length: TARGET_LEN }, () => null as OX | null);

                if (freshStart) {
                    // 로컬 스토리지 진행도 완전 초기화
                    try { localStorage.removeItem(`quiz/initials/${sid}/progress`); } catch {}
                    try { localStorage.removeItem(LS_KEY_RESULT_BRIDGE); } catch {}
                    setProgress(empty);            // 부모 진행도 리셋
                    setResetToken((t) => t + 1);   // 자식 카드(stickyProgress)도 리셋
                } else {
                    // 재접속(이어하기)일 때만 복구 시도
                    const saved =
                        (sid ? localStorage.getItem(`quiz/initials/${sid}/progress`) : null) ??
                        localStorage.getItem(LS_KEY_RESULT_BRIDGE);
                    if (saved) {
                        try {
                            const parsed = JSON.parse(saved) as (OX | null)[];
                            setProgress(Array.isArray(parsed) ? empty.map((_, i) => parsed[i] ?? null) : empty);
                        } catch { setProgress(empty); }
                    } else {
                        setProgress(empty);
                    }
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (!showResult || !sessionId || !cur || total !== TARGET_LEN) return;
        setProgress((prev) => {
            const next = prev.length === TARGET_LEN ? [...prev] : Array.from({ length: TARGET_LEN }, () => null as OX | null);
            if (next[idx - 1] == null) next[idx - 1] = isCorrect ? "O" : "X";
            if (LS_KEY) localStorage.setItem(LS_KEY, JSON.stringify(next));
            try { localStorage.setItem(LS_KEY_RESULT_BRIDGE, JSON.stringify(next)); } catch {}
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showResult]);

    const handleSubmit = () => {
        if (!answer.trim()) return;
        setShowResult(true);
    };

    const handleNext = () => {
        // 총 길이는 고정 3으로 통일
        if (idx >= TARGET_LEN) {
            nav("/poten-word/quiz/result", { state: { progress, total: TARGET_LEN, sessionId, part: "INITIALS" } });
            return;
        }
        setIdx((i) => i + 1);
        setAnswer("");
        setShowResult(false);
    };

    if (loading) return <div style={{ padding: 24 }}>초성퀴즈를 불러오는 중...</div>;
    if (error)   return <div style={{ padding: 24, color: "#b91c1c" }}>로드 실패: {error}</div>;
    if (!cur)    return <div style={{ padding: 24 }}>문항이 없습니다.</div>;

    return (
        <InitialsQuizCard
            index={idx}
            total={TARGET_LEN}
            question={cur.q}
            initials={cur.initials}
            value={answer}
            onChange={setAnswer}
            onSubmit={handleSubmit}
            onNext={handleNext}
            showResult={showResult}
            correctAnswer={cur.answer}
            progress={progress}
            resetSignal={resetToken}
        />
    );
}
