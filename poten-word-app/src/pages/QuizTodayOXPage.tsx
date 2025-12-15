import React from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchDailyPlan, DailyPlan } from "../api/dailyQuiz";
import { fetchOxQuestionsBySetId, OXQuestion, OX } from "../api/quizOx";
import OXQuizCard from "../components/OXQuizCard";
import { goToAccountLogin } from "../utils/auth";
import { startQuizUnified } from "../api/quiz";
import http, { authHeader } from "../utils/http";
import { getSessionReport } from "../api/quiz";

const Stage = styled.div`
  width: 100%;
  min-height: calc(100dvh - 110px);
  display: grid;
  place-items: center;
  place-content: center;
  padding: clamp(12px, 2vw, 24px);
  background:
    radial-gradient(50% 38% at 10% 10%, rgba(62,99,224,.06) 0%, rgba(62,99,224,0) 70%),
    radial-gradient(40% 32% at 88% 18%, rgba(62,99,224,.08) 0%, rgba(62,99,224,0) 70%);
  border-radius: 28px;
`;

const LS_LAST_SESSION = "quiz:lastSessionId";
const LS_KEY_PROGRESS = "quiz/initials-or-ox/progress"; // 결과 라우트에서 복구용

type SessionSummary = {
    id?: number;
    sessionId?: number;
    questionType?: string;
    quizSetId?: number;
    status?: string;
    [k: string]: any;
};

type SessionItem = {
    questionId?: number; id?: number; quizQuestionId?: number; question_id?: number;
    choices?: Array<{ id?: number; choiceId?: number; choice_id?: number; text?: string; label?: string; value?: string; is_answer?: boolean; isAnswer?: boolean; correct?: boolean }>;
    choiceId1?: number; choice_id1?: number;
    choiceId2?: number; choice_id2?: number;
    q?: string; question?: string; questionText?: string; question_text?: string;
    explanation?: string; explain?: string; desc?: string;
    [k: string]: any;
};

function getQuestionId(it: SessionItem): number | undefined {
    return it?.questionId ?? it?.id ?? it?.quizQuestionId ?? it?.question_id;
}

async function loadSessionItems(sid: number, includeAnswers = true): Promise<SessionItem[]> {
    const raw = await http.get(`/me/quiz/sessions/${sid}/items`, {
        params: { offset: 0, limit: 999, includeAnswers },
        headers: authHeader(),
        withCredentials: true,
    });
    const items = raw?.data?.items ?? raw?.data?.data?.items ?? raw?.data ?? [];
    return Array.isArray(items) ? (items as SessionItem[]) : [];
}

function strToOX(v: any): OX | null {
    const s = (v == null ? "" : String(v)).trim().toUpperCase();
    if (s === "O" || s === "TRUE" || s === "T" || s === "YES" || s === "Y") return "O";
    if (s === "X" || s === "FALSE" || s === "F" || s === "NO" || s === "N") return "X";
    return null;
}

function deriveSetId(summary?: any, items?: SessionItem[]): number | undefined {
    const cand = [
        summary?.quizSetId,
        summary?.setId,
        summary?.quiz_set_id,
        summary?.snapshot?.quizSetId,
        summary?.questionsSnapshot?.quizSetId,
    ].find(v => v != null);
    if (cand != null && Number.isFinite(Number(cand))) return Number(cand);
    if (Array.isArray(items)) {
        const fromItem = items
            .map(it => it?.quizSetId ?? it?.setId ?? it?.quiz_set_id)
            .find(v => v != null);
        if (fromItem != null && Number.isFinite(Number(fromItem))) return Number(fromItem);
    }
    return undefined;
}

function buildListFromItems(items: SessionItem[]): OXQuestion[] {
    const list: OXQuestion[] = [];
    for (const it of items) {
        const id = getQuestionId(it);
        const q =
            it.q ?? it.question ?? it.questionText ?? it.question_text ?? "";
        const explanation = it.explanation ?? it.explain ?? it.desc ?? "";

        // 정답 탐색: choices 내 correct/is_answer true → 텍스트를 OX로 해석
        let correct: OX | null = null;
        if (Array.isArray(it.choices) && it.choices.length) {
            const ans = it.choices.find(c => c?.is_answer || c?.isAnswer || c?.correct);
            if (ans) correct = strToOX(ans.text ?? ans.label ?? ans.value);
            // 못찾으면 2지선다 가정: 첫 번째를 O, 두 번째를 X로 매핑
            if (!correct && it.choices.length >= 2) {
                // 혹시 텍스트가 "O/X"라면 그대로 반영
                const t0 = strToOX(it.choices[0]?.text ?? it.choices[0]?.label ?? it.choices[0]?.value);
                const t1 = strToOX(it.choices[1]?.text ?? it.choices[1]?.label ?? it.choices[1]?.value);
                if (t0 && t1) {
                    // 아무 플래그도 없다면 correct는 일단 O로 가정(서버 리포트로 보강)
                    correct = "O";
                } else {
                    correct = "O";
                }
            }
        }
        list.push({ id, q, correct: (correct ?? "O"), explanation });
    }
    return list;
}

// 세트 기반 재정렬(세션 아이템 순서대로)
async function buildListFromSet(items: SessionItem[], setId: number): Promise<OXQuestion[]> {
    const all = await fetchOxQuestionsBySetId(setId);
    const byId = new Map<number, OXQuestion>();
    for (const q of all) {
        const id = (q as any)?.id ?? (q as any)?.questionId ?? (q as any)?.quizQuestionId;
        if (typeof id === "number") byId.set(id, q);
    }
    const list: OXQuestion[] = [];
    for (const it of items) {
        const qid = getQuestionId(it);
        if (typeof qid !== "number") continue;
        const q = byId.get(qid);
        if (q) list.push(q);
    }
    return list.length ? list : all;
}

// 선택값(O/X) → choiceId로 변환
function getChoiceIdForOX(item: SessionItem, pick: OX): number | undefined {
    // 1) choices 배열에서 텍스트로 매핑 시도
    if (Array.isArray(item?.choices) && item.choices.length) {
        const want = pick === "O" ? ["O", "TRUE", "T", "YES", "Y"] : ["X", "FALSE", "F", "NO", "N"];
        const found = item.choices.find(c => {
            const s = (c?.text ?? c?.label ?? c?.value ?? "").toString().trim().toUpperCase();
            return want.includes(s);
        });
        if (found) return found.id ?? found.choiceId ?? found.choice_id;

        // 2) 못 찾으면 2지선다 가정: index 0 → O, index 1 → X
        const idx = pick === "O" ? 0 : 1;
        const fallback = item.choices[idx];
        if (fallback) return fallback.id ?? fallback.choiceId ?? fallback.choice_id;
    }

    // 3) 필드형( choiceId1 / choiceId2 ) 가정
    if (pick === "O") return item?.choiceId1 ?? item?.choice_id1;
    return item?.choiceId2 ?? item?.choice_id2;
}

export default function QuizTodayOXPage() {
    const nav = useNavigate();
    const [sp] = useSearchParams();

    const role = (sp.get("role") ?? "GENERAL").toUpperCase();
    const date = sp.get("date") ?? "";
    const sidFromQs = React.useMemo(() => {
        const v = sp.get("sessionId");
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    }, [sp]);

    // 데이터 상태
    const [plan, setPlan] = React.useState<DailyPlan | null>(null);
    const [qs, setQs] = React.useState<OXQuestion[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // 진행 상태
    const [idx, setIdx] = React.useState(1); // 1-based
    const [value, setValue] = React.useState<OX | null>(null);
    const [showResult, setShowResult] = React.useState(false);
    const [progress, setProgress] = React.useState<(OX | null)[]>([]);
    const [picked, setPicked] = React.useState<(OX | null)[]>([]);
    const [startMs, setStartMs] = React.useState<number>(() => Date.now());
    const [wire, setWire] = React.useState<SessionItem[] | null>(null);

    // 세션ID
    const [sessionId, setSessionId] = React.useState<number | null>(null);

    const cur = qs[idx - 1];

    const loadKey = React.useMemo(
        () => (sidFromQs ? `ox:sid:${sidFromQs}` : `ox:${role}|${date || "today"}`),
        [sidFromQs, role, date]
    );

    const saveLastSession = (sid: number) => {
        try { localStorage.setItem(LS_LAST_SESSION, String(sid)); } catch {}
    };

    const loadSessionSummary = async (sid: number): Promise<SessionSummary> => {
        const { data } = await http.get(`/me/quiz/sessions/${sid}`, {
            headers: authHeader(), withCredentials: true
        });
        return (data?.data ?? data) as SessionSummary;
    };

    const QUESTION_TYPE_ROUTES: Record<string, string> = {
        CHOICE:   '/poten-word/quiz/choice',
        OX:       '/poten-word/quiz/ox',
        INITIALS: '/poten-word/quiz/initials',
    };

    const redirectIfDifferentQuestionType = async (sid: number): Promise<SessionSummary> => {
        const summary = await loadSessionSummary(sid);
        const qt = String(summary?.questionType || '').toUpperCase();

        if (qt !== 'OX' && QUESTION_TYPE_ROUTES[qt]) {
            nav(`${QUESTION_TYPE_ROUTES[qt]}?sessionId=${sid}`, { replace: true });
            throw new Error(`REDIRECT_TO_${qt}`);
        }

        // includes 방어
        const redirectRoute = Object.entries(QUESTION_TYPE_ROUTES).find(([type]) =>
            qt.includes(type)
        )?.[1];
        if (redirectRoute && !redirectRoute.endsWith("/ox")) {
            nav(`${redirectRoute}?sessionId=${sid}`, { replace: true });
            throw new Error(`REDIRECT_TO_${qt}`);
        }

        return summary;
    };

    const resetQuizState = () => {
        setQs([]);
        setProgress([]);
        setSessionId(null);
        setWire(null);
        setIdx(1);
        setValue(null);
        setShowResult(false);
    };

    const initializeQuizState = (list: OXQuestion[], items?: SessionItem[]) => {
        setQs(list);
        setIdx(1);
        setValue(null);
        setShowResult(false);
        setProgress(Array.from({ length: list.length }, () => null));
        setPicked(Array.from({ length: list.length }, () => null));
        setStartMs(Date.now());
        if (items) setWire(items);
    };

    const handleLoadError = (e: any, ac: AbortController) => {
        if (ac.signal.aborted) return;
        if (e?.message?.startsWith("REDIRECT_TO_")) return;
        if (e?.response?.status === 401) { goToAccountLogin(); return; }
        console.error(e);
        setError(e?.message || "문항을 불러오지 못했어요.");
        resetQuizState();
    };

    // 데이터 로딩
    React.useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setError(null);

                if (sidFromQs) {
                    setPlan(null);
                    setSessionId(sidFromQs);
                    saveLastSession(sidFromQs);

                    const summary = await redirectIfDifferentQuestionType(sidFromQs);
                    if (ac.signal.aborted) return;

                    let items = await loadSessionItems(sidFromQs, true);
                    if (ac.signal.aborted) return;

                    const setId = deriveSetId(summary, items);
                    let list: OXQuestion[] | null = null;

                    if (Number.isFinite(setId as any)) {
                        try {
                            // 1) 세트 기반 로드 시도
                            list = await buildListFromSet(items, setId!);
                        } catch {
                            // 2) 실패 시: answers 포함 아이템 재로드 → 아이템만으로 구성
                            items = await loadSessionItems(sidFromQs, true);
                            list = buildListFromItems(items);
                            // 3) (선택) 리포트로 정답 보강
                            try {
                                const rep = await getSessionReport(sidFromQs);
                                const byQ = new Map<number, number>();
                                for (const d of (rep?.details ?? [])) {
                                    const qid = Number(d?.quizQuestionId);
                                    const cid = Number(d?.correctChoiceId);
                                    if (Number.isFinite(qid) && Number.isFinite(cid)) byQ.set(qid, cid);
                                }
                                const itemByQ = new Map<number, SessionItem>();
                                for (const it of items) {
                                    const qid = getQuestionId(it);
                                    if (typeof qid === "number") itemByQ.set(qid, it);
                                }
                                list = list.map(q => {
                                    const qid = (q as any)?.id ?? (q as any)?.questionId;
                                    const item = itemByQ.get(qid);
                                    const correctCid = byQ.get(qid);
                                    if (!item || !correctCid || !Array.isArray(item.choices)) return q;
                                    const idx = item.choices.findIndex((c: any) =>
                                        (c?.id ?? c?.choiceId ?? c?.choice_id) === correctCid
                                    );
                                    if (idx === 0) return { ...q, correct: "O" };
                                    if (idx === 1) return { ...q, correct: "X" };
                                    return q;
                                });
                            } catch {}
                        }
                    } else {
                        // setId를 못얻으면 원래대로 아이템 기반
                        items = await loadSessionItems(sidFromQs, true);
                        list = buildListFromItems(items);
                    }

                    initializeQuizState(list, items);
                    return;
                }

                // 새로운 DAILY OX 세션 시작
                const p = await fetchDailyPlan({ part: "OX", role, date: date || undefined });
                if (ac.signal.aborted) return;
                setPlan(p);

                if (!p.quizSetId) { resetQuizState(); return; }

                const startRes = await startQuizUnified({
                    source: "DAILY",
                    type: "OX",
                    setId: p.quizSetId,
                    date: date || undefined,
                    role,
                });

                const sid = Number(startRes?.sessionId);
                if (Number.isFinite(sid)) {
                    setSessionId(sid);
                    saveLastSession(sid);
                    await redirectIfDifferentQuestionType(sid);
                }

                // 1) 세트에서 시도
                let list: OXQuestion[] = [];
                try {
                    list = await fetchOxQuestionsBySetId(p.quizSetId);
                } catch {
                    list = [];
                }

                // 2) 세트가 비면 → 세션 아이템으로 폴백
                let items: SessionItem[] | null = null;
                if (!list.length && Number.isFinite(sid)) {
                    try {
                        items = await loadSessionItems(sid!, /* includeAnswers */ true);
                        list = buildListFromItems(items);

                        // (선택) 서버 리포트로 정답 보강
                        try {
                            const rep = await getSessionReport(sid!);
                            const byQ = new Map<number, number>();
                            for (const d of (rep?.details ?? [])) {
                                const qid = Number(d?.quizQuestionId);
                                const cid = Number(d?.correctChoiceId);
                                if (Number.isFinite(qid) && Number.isFinite(cid)) byQ.set(qid, cid);
                            }
                            const itemByQ = new Map<number, SessionItem>();
                            for (const it of items) {
                                const qid = getQuestionId(it);
                                if (typeof qid === "number") itemByQ.set(qid, it);
                            }
                            list = list.map(q => {
                                const qid = (q as any)?.id ?? (q as any)?.questionId;
                                const item = itemByQ.get(qid);
                                const correctCid = byQ.get(qid);
                                if (!item || !correctCid || !Array.isArray(item.choices)) return q;
                                const idx = item.choices.findIndex((c: any) =>
                                    (c?.id ?? c?.choiceId ?? c?.choice_id) === correctCid
                                );
                                if (idx === 0) return { ...q, correct: "O" };
                                if (idx === 1) return { ...q, correct: "X" };
                                return q;
                            });
                        } catch {}
                    } catch {
                        items = null;
                    }
                }

                initializeQuizState(list, items ?? undefined);
            } catch (e: any) {
                handleLoadError(e, ac);
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [loadKey, role, date, sidFromQs]);

    // 상호작용
    React.useEffect(() => {
        if (value === null) return;
        setShowResult(true);
    }, [value]);

    React.useEffect(() => {
        if (!showResult || value === null || !cur) return;
        setProgress(prev => {
            const next = [...prev];
            if (next[idx - 1] == null) next[idx - 1] = value === cur.correct ? "O" : "X";
            try { localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(next)); } catch {}
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showResult]);

    function buildSubmitAnswers(): Array<{ quizQuestionId: number; selectedChoiceId: number }> {
        if (!wire || !Array.isArray(wire)) return [];
        const itemByQuestionId = new Map<number, SessionItem>();
        for (const item of wire) {
            const qid = getQuestionId(item);
            if (typeof qid === "number") itemByQuestionId.set(qid, item);
        }

        const answers: Array<{ quizQuestionId: number; selectedChoiceId: number }> = [];
        for (let i = 0; i < qs.length; i++) {
            const pickedOX = picked[i];
            if (pickedOX == null) continue;

            const qAny: any = qs[i];
            const questionId: number | undefined =
                qAny?.id ?? qAny?.questionId ?? qAny?.quizQuestionId ?? qAny?.question_id;
            if (typeof questionId !== "number") continue;

            const item = itemByQuestionId.get(questionId);
            if (!item) continue;

            const choiceId = getChoiceIdForOX(item, pickedOX);
            if (typeof choiceId === "number") {
                answers.push({ quizQuestionId: questionId, selectedChoiceId: choiceId });
            }
        }
        return answers;
    }

    const goNext = async () => {
        if (idx >= qs.length) {
            if (sessionId) {
                try {
                    const answers = buildSubmitAnswers();
                    if (!answers.length) {
                        alert("제출할 답안이 없습니다. 각 문제에서 O/X를 선택해 주세요.");
                        return;
                    }
                    const elapsedMs = Math.max(0, Date.now() - startMs);
                    await http.post(
                        `/me/quiz/sessions/${sessionId}/submit`,
                        { answers, elapsedMs },
                        { headers: authHeader(), withCredentials: true }
                    );
                } catch (e) {
                    console.error("[submit] 실패", e);
                    alert("제출에 실패했어요. 네트워크 상태를 확인한 뒤 다시 시도해주세요.");
                    return;
                }
            }
            const search = Number.isFinite(sessionId as any) ? `?sessionId=${sessionId}` : "";
            nav({ pathname: "/poten-word/quiz/result", search }, {
                state: { progress, part: "OX", setId: plan?.quizSetId, sessionId: sessionId ?? undefined },
                replace: true,
            });
            return;
        }
        setValue(null);
        setShowResult(false);
        requestAnimationFrame(() => setIdx(i => i + 1));
    };

    if (loading) return <Stage>불러오는 중…</Stage>;
    if (error)   return <Stage>에러: {error}</Stage>;
    if (!cur)    return <Stage>오늘의 OX 퀴즈가 없어요.</Stage>;

    return (
        <Stage>
            <OXQuizCard
                key={`ox-${idx}-${(cur as any).id ?? "noid"}`}
                index={idx}
                total={qs.length}
                question={(cur as any).q}
                value={value}
                onChange={(v) => {
                    setValue(v);
                    setPicked(prev => {
                        const next = [...prev];
                        next[idx - 1] = v;
                        return next;
                    });
                }}
                showResult={showResult}
                correct={(cur as any).correct}
                explanation={(cur as any).explanation}
                progress={progress}
                onNext={goNext}
            />
        </Stage>
    );
}
