import React from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchDailyPlan, DailyPlan } from "../api/dailyQuiz";
import { fetchChoiceQuestionsBySetId, ChoiceQuestion } from "../api/quizChoice";
import QuizChoiceCard from "../components/QuizChoiceCard";
import { goToAccountLogin } from "../utils/auth";
import { startQuizUnified } from "../api/quiz";
import http from "../utils/http";
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

type SessionSummary = {
    id?: number;
    sessionId?: number;
    questionType?: string;
    quizSetId?: number;
    status?: string;
    [k: string]: any;
};

type SessionItem = {
    questionId?: number;
    id?: number;
    quizQuestionId?: number;
    question_id?: number;
    // 제출용 choice id들(백엔드 포맷 가변 대응)
    choices?: Array<{ id?: number; choiceId?: number; choice_id?: number; text?: string }>;
    choiceId1?: number; choice_id1?: number;
    choiceId2?: number; choice_id2?: number;
    choiceId3?: number; choice_id3?: number;
    choiceId4?: number; choice_id4?: number;
    // 화면용 텍스트가 담겨올 수도 있음(옵션)
    q?: string; question?: string; questionText?: string; question_text?: string;
    choice1?: string; choice2?: string; choice3?: string; choice4?: string;
    explanation?: string; explain?: string; desc?: string;
    [k: string]: any;
};

// 여러 위치에서 세트ID를 뽑아보는 헬퍼
function deriveSetId(summary?: any, items?: SessionItem[]): number | undefined {
    const cand = [
        summary?.quizSetId,
        summary?.setId,
        summary?.quiz_set_id,
        summary?.snapshot?.quizSetId,
        summary?.questionsSnapshot?.quizSetId,
    ].find(v => v != null);

    if (cand != null && Number.isFinite(Number(cand))) return Number(cand);

    // 아이템 안에 들어오는 경우도 시도
    if (Array.isArray(items)) {
        const fromItem = items
            .map(it => it?.quizSetId ?? it?.setId ?? it?.quiz_set_id)
            .find(v => v != null);
        if (fromItem != null && Number.isFinite(Number(fromItem))) return Number(fromItem);
    }
    return undefined;
}

// 세션 아이템 로더: includeAnswers 옵션 추가
async function loadSessionItems(
    sid: number,
    arg2?: number | boolean,   // limit 또는 includeAnswers
    arg3?: number              // includeAnswers가 boolean일 때 limit
): Promise<SessionItem[]> {
    let includeAnswers = false;
    let limit = 999;

    if (typeof arg2 === "boolean") {
        includeAnswers = arg2;
        if (typeof arg3 === "number" && Number.isFinite(arg3)) limit = arg3;
    } else if (typeof arg2 === "number" && Number.isFinite(arg2)) {
        limit = arg2;
    }

    const raw = await http.get(`/me/quiz/sessions/${sid}/items`, {
        params: { offset: 0, limit, includeAnswers },
        withCredentials: true,
    });

    const items = raw?.data?.items ?? raw?.data?.data?.items ?? raw?.data ?? [];
    return Array.isArray(items) ? (items as SessionItem[]) : [];
}

// (세트가 없을 때) 세션 아이템만으로 ChoiceQuestion 리스트 만들기
function buildListFromItems(items: SessionItem[]): ChoiceQuestion[] {
    const list: ChoiceQuestion[] = [];

    for (const it of items) {
        const id =
            it.questionId ?? it.id ?? it.quizQuestionId ?? it.question_id;

        // 질문 텍스트
        const q =
            it.q ?? it.question ?? it.questionText ?? it.question_text ?? "";

        // 보기 텍스트
        const choices =
            Array.isArray(it.choices) && it.choices.length
                ? it.choices.map(c => c?.text ?? c?.choiceText ?? c?.choice_text ?? "")
                : [it.choice1, it.choice2, it.choice3, it.choice4].filter(Boolean) as string[];

        // 정답 인덱스(0-based) 추정
        let correctIndex: number | undefined = undefined;
        if (Array.isArray(it.choices) && it.choices.length) {
            const idx = it.choices.findIndex(
                (c: any) => c?.is_answer === true || c?.isAnswer === true || c?.correct === true
            );
            if (idx >= 0) correctIndex = idx;
        }
        if (correctIndex == null && (it as any)?.answerIndex != null) {
            const ai = Number((it as any).answerIndex);
            if (Number.isFinite(ai)) correctIndex = ai >= 1 ? ai - 1 : ai; // 1/0-based 보정
        }

        const explanation = it.explanation ?? it.explain ?? it.desc ?? "";

        list.push({
            id,
            q,
            choices,
            correctIndex: correctIndex!,
            explanation,
        } as any as ChoiceQuestion);
    }
    return list;
}

export default function QuizTodayChoicePage() {
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
    const [qs, setQs] = React.useState<ChoiceQuestion[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // 진행 상태
    const [idx, setIdx] = React.useState(1); // 1-based
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
    const [showResult, setShowResult] = React.useState(false);
    const [progress, setProgress] = React.useState<("O" | "X" | null)[]>([]);
    const [picked, setPicked] = React.useState<(number | null)[]>([]);
    const [startMs, setStartMs] = React.useState<number>(() => Date.now());
    const [wire, setWire] = React.useState<SessionItem[] | null>(null);

    // 세션ID
    const [sessionId, setSessionId] = React.useState<number | null>(null);

    const cur = qs[idx - 1];

    // 로드키
    const loadKey = React.useMemo(
        () => (sidFromQs ? `sid:${sidFromQs}` : `${role}|${date || "today"}`),
        [sidFromQs, role, date]
    );

    React.useEffect(() => {
        console.debug("[QuizTodayChoicePage] mount", { key: loadKey });
        return () => console.debug("[QuizTodayChoicePage] unmount", { key: loadKey });
    }, [loadKey]);

    // ---------- 유틸들 ----------
    const saveLastSession = (sid: number) => {
        try { localStorage.setItem(LS_LAST_SESSION, String(sid)); } catch {}
    };

    const getQuestionId = (it: SessionItem): number | undefined =>
        it?.questionId ?? it?.id ?? it?.quizQuestionId ?? it?.question_id;

    const loadSessionSummary = async (sid: number): Promise<SessionSummary> => {
        const { data } = await http.get(`/me/quiz/sessions/${sid}`, {
            withCredentials: true
        });
        return (data?.data ?? data) as SessionSummary;
    };

    // 세션 타입별 라우트 매핑
    const QUESTION_TYPE_ROUTES: Record<string, string> = {
        CHOICE:   '/poten-word/quiz/choice',
        OX:       '/poten-word/quiz/ox',
        INITIALS: '/poten-word/quiz/initials',
    };

// 리다이렉트가 필요한 세션 타입인지 확인
    const redirectIfDifferentQuestionType = async (sid: number): Promise<SessionSummary> => {
        const summary = await loadSessionSummary(sid);
        const questionType = String(summary?.questionType || '').toUpperCase();

        if (questionType !== 'CHOICE' && QUESTION_TYPE_ROUTES[questionType]) {
            nav(`${QUESTION_TYPE_ROUTES[questionType]}?sessionId=${sid}`, { replace: true });
            throw new Error(`REDIRECT_TO_${questionType}`);
        }

        // 리다이렉트가 필요한 타입 찾기
        const redirectRoute = Object.entries(QUESTION_TYPE_ROUTES).find(([type]) =>
            questionType.includes(type)
        )?.[1];

        if (redirectRoute) {
            nav(`${redirectRoute}?sessionId=${sid}`, { replace: true });
            throw new Error(`REDIRECT_TO_${questionType}`);
        }

        // CHOICE 계열은 현재 페이지에서 진행
        return summary;
    };

    // 세션 순서에 맞춰 세트 문항을 재정렬해서 화면용 리스트 생성
    const buildListFromSet = (items: SessionItem[], setId: number): Promise<ChoiceQuestion[]> =>
        fetchChoiceQuestionsBySetId(setId).then((all) => {
            const byId = new Map<number, ChoiceQuestion>();
            for (const q of all) {
                const id = (q as any)?.id ?? (q as any)?.questionId ?? (q as any)?.quizQuestionId;
                if (typeof id === "number") byId.set(id, q);
            }
            const list: ChoiceQuestion[] = [];
            for (const it of items) {
                const qid = getQuestionId(it);
                if (typeof qid !== "number") continue;
                const q = byId.get(qid);
                if (q) list.push(q);
            }
            return list.length ? list : all; // 안전망
        });

    const resetQuizState = () => {
        setQs([]);
        setProgress([]);
        setSessionId(null);
        setWire(null);
        setIdx(1);
        setSelectedIndex(null);
        setShowResult(false);
    };

    const initializeQuizState = (list: ChoiceQuestion[], items?: SessionItem[]) => {
        setQs(list);
        setIdx(1);
        setSelectedIndex(null);
        setShowResult(false);
        setProgress(Array.from({ length: list.length }, () => null));
        setPicked(Array.from({ length: list.length }, () => null));
        setStartMs(Date.now());
        if (items) setWire(items);
    };

    const handleLoadError = (e: any, ac: AbortController) => {
        if (ac.signal.aborted) return;
        if (e?.message === "REDIRECT_TO_OX" || e?.message === "REDIRECT_TO_INITIALS" || e?.message === "UNKNOWN_QUESTION_TYPE") return;
        if (e?.response?.status === 401) { goToAccountLogin(); return; }
        console.error(e);
        setError(e?.message || "문항을 불러오지 못했어요.");
        resetQuizState();
    };

    // ---------- 데이터 로딩 ----------
    React.useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setError(null);

                if (sidFromQs) {
                    // 재도전/기존 세션
                    setPlan(null);
                    setSessionId(sidFromQs);
                    saveLastSession(sidFromQs);

                    // 타입 확인(+필요시 리다이렉트), 세트ID 확보
                    const summary = await redirectIfDifferentQuestionType(sidFromQs);
                    if (ac.signal.aborted) return;
                    let items = await loadSessionItems(sidFromQs, true);
                    if (ac.signal.aborted) return;

                    // 요약/아이템에서 세트ID 파생
                    const setId = deriveSetId(summary, items);
                    let list: ChoiceQuestion[] | null = null;
                    if (Number.isFinite(setId as any)) {
                        // 세트 기준으로 화면 리스트 재정렬
                        list = await buildListFromSet(items, setId!);
                    } else {
                        // 세트가 없으면 → answers 포함해서 다시 로드 후 아이템으로 화면 구성
                        items = await loadSessionItems(sidFromQs, /*includeAnswers*/ true);
                        list = buildListFromItems(items);

                        // 추가 보강: 서버 리포트로 correctIndex 정확히 주입
                        try {
                            const rep = await getSessionReport(sidFromQs);

                            // questionId -> correctChoiceId 매핑
                            const byQ = new Map<number, number>();
                            for (const d of (rep?.details ?? [])) {
                                const qid = Number(d?.quizQuestionId);
                                const cid = Number(d?.correctChoiceId);
                                if (Number.isFinite(qid) && Number.isFinite(cid)) {
                                    byQ.set(qid, cid);
                                }
                            }

                            // questionId -> SessionItem 매핑
                            const itemByQ = new Map<number, SessionItem>();
                            for (const it of items) {
                                const qid = getQuestionId(it);
                                if (typeof qid === "number") {
                                    itemByQ.set(qid, it);
                                }
                            }

                            // correctIndex 주입
                            list = list.map(q => {
                                const qid = (q as any)?.id ?? (q as any)?.questionId;
                                const item = itemByQ.get(qid);
                                const correctCid = byQ.get(qid);

                                if (!item || !correctCid || !Array.isArray(item.choices)) {
                                    return q;
                                }

                                const idx = item.choices.findIndex((c: any) =>
                                    (c?.id ?? c?.choiceId ?? c?.choice_id) === correctCid
                                );

                                return idx >= 0 ? { ...q, correctIndex: idx } : q;
                            });
                        } catch {}
                    }
                    if (ac.signal.aborted) return;
                    initializeQuizState(list, items);
                    return;
                }

                // 새로운 DAILY 세션 시작
                const p = await fetchDailyPlan({ part: "CHOICE", role, date: date || undefined });
                if (ac.signal.aborted) return;
                setPlan(p);

                if (!p.quizSetId) {
                    resetQuizState();
                    return;
                }

                // 통합 세션 시작
                const startRes = await startQuizUnified({
                    source: "DAILY",
                    type: "CHOICE",
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

                let items: SessionItem[] | null = null;
                let list: ChoiceQuestion[] | null = null;

                if (Number.isFinite(sid)) {
                    try {
                        // 1) 세션 아이템에 텍스트/보기 있으면 그대로 화면 리스트로 사용
                        items = await loadSessionItems(sid, /* includeAnswers */ true);
                        if (Array.isArray(items) && items.length) {
                            const hasTexts = items.some(it =>
                                typeof (it.q ?? it.question ?? it.questionText ?? it.question_text) === "string"
                            );
                            if (hasTexts) {
                                list = buildListFromItems(items);
                            } else {
                                // 2) 세트 ID가 있으면 세트 기반으로 재정렬 (아이템 순서 유지)
                                const sum = await loadSessionSummary(sid);
                                const setId = deriveSetId(sum, items) ?? p.quizSetId;
                                if (Number.isFinite(setId as any)) {
                                    try {
                                        list = await buildListFromSet(items, setId!);
                                    } catch {
                                        // 세트 API가 죽었으면 나중에 다른 소스로 보강
                                    }
                                }
                            }
                        }
                    } catch { /* 세션 아이템 실패 시 아래로 폴백 */ }
                }

                // 3) 그래도 없으면: 시작 응답에 포함된 questions 사용 or 마지막으로 세트 API 시도
                if (!list || list.length === 0) {
                    const provided = Array.isArray(startRes?.questions)
                        ? (startRes as any).questions as ChoiceQuestion[]
                        : null;
                    if (provided && provided.length) {
                        list = provided;
                    } else {
                        // ❗ 이 지점에서만 세트 API 호출 (현재 서버가 500이면 여기도 실패할 수 있음)
                        try {
                            list = await fetchChoiceQuestionsBySetId(p.quizSetId);
                        } catch {
                            // 끝까지 실패 → 타입 확인 리다이렉트 시도(서버가 다른 타입 세션을 만들었을 가능성)
                            if (Number.isFinite(sid)) await redirectIfDifferentQuestionType(sid!);
                        }
                    }
                }

                if (!list || list.length === 0) {
                    throw new Error("문항을 불러오지 못했어요."); // 상단 에러 UI로 처리
                }

                initializeQuizState(list, items ?? undefined);
            } catch (e: any) {
                handleLoadError(e, ac);
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [loadKey, role, date, sidFromQs]); // nav는 여기 의존 X

    // ---------- 상호작용 ----------
    React.useEffect(() => {
        if (selectedIndex === null) return;
        setShowResult(true);
    }, [selectedIndex]);

    React.useEffect(() => {
        if (!showResult || selectedIndex === null || !cur) return;
        setProgress(prev => {
            const next = [...prev];
            if (next[idx - 1] == null) next[idx - 1] = (selectedIndex === (cur as any).correctIndex) ? "O" : "X";
            return next;
        });
    }, [showResult]); // intentionally not depending on cur/idx to avoid double mark

    // submit payload (questionId -> choiceId 매핑)
    function buildSubmitAnswers(): Array<{ quizQuestionId: number; selectedChoiceId: number }> {
        if (!wire || !Array.isArray(wire)) return [];

        const itemByQuestionId = new Map<number, SessionItem>();
        for (const item of wire) {
            const qid = getQuestionId(item);
            if (typeof qid === "number") itemByQuestionId.set(qid, item);
        }

        const answers: Array<{ quizQuestionId: number; selectedChoiceId: number }> = [];
        for (let i = 0; i < qs.length; i++) {
            const pickedIdx = picked[i];
            if (pickedIdx == null) continue;

            const qAny: any = qs[i];
            const questionId: number | undefined =
                qAny?.id ?? qAny?.questionId ?? qAny?.quizQuestionId ?? qAny?.question_id;

            if (typeof questionId !== "number") continue;

            const item = itemByQuestionId.get(questionId);
            if (!item) continue;

            const choiceId = getChoiceId(item, pickedIdx);
            if (typeof choiceId === "number") {
                answers.push({ quizQuestionId: questionId, selectedChoiceId: choiceId });
            }
        }
        return answers;
    }

    function getChoiceId(item: SessionItem, index: number): number | undefined {
        if (Array.isArray(item?.choices)) {
            const c = item.choices[index];
            return c?.id ?? c?.choiceId ?? c?.choice_id;
        }
        const fields = [
            item?.choiceId1 ?? item?.choice_id1,
            item?.choiceId2 ?? item?.choice_id2,
            item?.choiceId3 ?? item?.choice_id3,
            item?.choiceId4 ?? item?.choice_id4,
        ];
        return fields[index];
    }

    const goNext = async () => {
        if (idx >= qs.length) {
            if (sessionId) {
                try {
                    const answers = buildSubmitAnswers();
                    if (!answers.length) {
                        alert("제출할 답안이 없습니다. 각 문제에서 보기를 선택한 뒤 결과를 확인해주세요.");
                        return; // 결과 화면으로 가지 말고 중단
                    }
                    const elapsedMs = Math.max(0, Date.now() - startMs);
                    await http.post(
                        `/me/quiz/sessions/${sessionId}/submit`,
                        {answers, elapsedMs},
                        {withCredentials: true}
                    );
                } catch (e) {
                    console.error("[submit] 실패", e);
                    alert("제출에 실패했어요. 네트워크 상태를 확인한 뒤 다시 시도해주세요.");
                    return; // 실패 시 결과 화면으로 이동하지 않음
                }
            }

            const search = Number.isFinite(sessionId as any) ? `?sessionId=${sessionId}` : "";
            nav({pathname: "/poten-word/quiz/result", search}, {
                state: {progress, part: "CHOICE", setId: plan?.quizSetId, sessionId: sessionId ?? undefined},
                replace: true,
            });
            return;
        }
        setSelectedIndex(null);

        setShowResult(false);
        requestAnimationFrame(() => setIdx(i => i + 1));
    };

    // ---------- 렌더 ----------
    if (loading) return <Stage>불러오는 중…</Stage>;
    if (error)   return <Stage>에러: {error}</Stage>;
    if (!cur)    return <Stage>오늘의 퀴즈가 없어요.</Stage>;

    return (
        <Stage>
            <QuizChoiceCard
                key={`q-${idx}-${(cur as any).id ?? "noid"}`}
                index={idx}
                total={qs.length}
                question={(cur as any).q}
                choices={(cur as any).choices}
                value={selectedIndex}
                onChange={(i) => {
                    setSelectedIndex(i);
                    setPicked(prev => {
                        const next = [...prev];
                        next[idx - 1] = i;
                        return next;
                    });
                }}
                showResult={showResult}
                correct={(cur as any).correctIndex}
                explanation={(cur as any).explanation}
                progress={progress}
                onNext={goNext}
                onGoto={(n) => {
                    setSelectedIndex(null);
                    setShowResult(false);
                    requestAnimationFrame(() => setIdx(n));
                }}
            />
        </Stage>
    );
}
