import React from "react";
import styled from "styled-components";
import DailyChoiceCard from "../../../components/quiz/DailyChoiceCard";
import http from "../../../utils/http";
import { checkDailyQuestion } from "../../../api/dailyQuiz";

type OX = "O" | "X";

type StartedChoice = {
    choiceId: number;
    text: string;
    isAnswer?: boolean;
    id?: number;
    optionId?: number;
};

type StartedItem = {
    questionId: number;
    questionText: string;
    explanation?: string | null;
    correctChoiceId?: number | null;
    options: StartedChoice[];
};

type ChoiceView = {
    id: number;
    q: string;
    choices: string[];
    explanation: string | null;
    correctIndex: number;
    checked: boolean;
    isCorrect: boolean | null;
};

const Stage = styled.div`
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    padding: 12px;

    body[data-card-modal="true"] & {
        padding: 0;
        place-items: stretch;
    }
`;

function safeTextOrNull(v: any): string | null {
    const s = String(v ?? "").trim();
    return s ? s : null;
}

function getChoiceId(c: any): number | null {
    const n = Number(c?.choiceId ?? c?.id ?? c?.optionId);
    return Number.isFinite(n) ? n : null;
}

function getCorrectChoiceId(it: any): number | null {
    const direct = Number(it?.correctChoiceId ?? it?.correct_choice_id ?? it?.answerChoiceId);
    if (Number.isFinite(direct)) return direct;
    const flagged = (it?.options ?? []).find((c: any) => c?.isAnswer);
    return getChoiceId(flagged);
}

const LS_KEY = (sessionId: number) => `ipoten:daily-choice:session:${sessionId}`;

type StoredDailyChoice = {
    sessionId: number;
    items: StartedItem[];
    initialProgress?: (OX | null)[];
    savedAt: number;
};

function lsRead(sessionId: number): StoredDailyChoice | null {
    try {
        const raw = localStorage.getItem(LS_KEY(sessionId));
        if (!raw) return null;

        const parsed = JSON.parse(raw) as StoredDailyChoice;
        if (!parsed || !Array.isArray(parsed.items)) return null;

        return { ...parsed, sessionId };
    } catch {
        return null;
    }
}

function lsWrite(sessionId: number, payload: StoredDailyChoice) {
    try {
        localStorage.setItem(LS_KEY(sessionId), JSON.stringify(payload));
    } catch {
        // ignore
    }
}

export default function DailyChoiceModalPlay({
                                                 sessionId,
                                                 items,
                                                 onClose,
                                                 onShowResult,
                                                 retryWrongOnly = false,
                                                 initialProgress,
                                             }: {
    sessionId: number;
    items: StartedItem[];
    onClose: () => void;
    onShowResult?: (p: { sessionId: number; progress: (OX | null)[] }) => void;
    retryWrongOnly?: boolean;
    initialProgress?: (OX | null)[];
}) {
    const [qs, setQs] = React.useState<ChoiceView[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [idx, setIdx] = React.useState(0);
    const [picked, setPicked] = React.useState<(number | null)[]>([]);
    const pickedRef = React.useRef<(number | null)[]>([]);
    const [submitting, setSubmitting] = React.useState(false);
    const startMsRef = React.useRef<number>(Date.now());

    React.useEffect(() => {
        pickedRef.current = picked;
    }, [picked]);

    const checkedRef = React.useRef(new Map<number, any>());
    const baseItemsRef = React.useRef<StartedItem[]>(items);
    const persistProgress = React.useCallback(
        (p: (OX | null)[]) => {
            try {
                lsWrite(sessionId, {
                    sessionId,
                    items: baseItemsRef.current,
                    initialProgress: p,
                    savedAt: Date.now(),
                });
            } catch {}
        },
        [sessionId]
    );

    const persistItems = React.useCallback(
        (nextItems: StartedItem[]) => {
            try {
                const stored = lsRead(sessionId);
                lsWrite(sessionId, {
                    sessionId,
                    items: nextItems,
                    initialProgress: stored?.initialProgress,
                    savedAt: Date.now(),
                });
            } catch {}
        },
        [sessionId]
    );

    const originProgressRef = React.useRef<(OX | null)[] | undefined>(undefined);

    React.useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);

            const stored = lsRead(sessionId);

        // 재도전이면 "전체 문항"을 localStorage에서 복원 (없으면 어쩔 수 없이 items로)
            const baseItems: StartedItem[] = retryWrongOnly
                ? (stored?.items?.length ? stored.items : (items?.length ? items : []))
                : items;

            baseItemsRef.current = baseItems;

        // 재도전일 때는 이전 결과(OXX)를 "originProgress"로 잡아둠 (Tray용)
            const originProgress: (OX | null)[] | undefined = retryWrongOnly
                ? (initialProgress?.length ? initialProgress : stored?.initialProgress?.length ? stored.initialProgress : undefined)
                : undefined;

            originProgressRef.current = originProgress;

        // 일반 플레이: 시작 스냅샷은 items만 저장 (progress는 저장 금지)
            if (!retryWrongOnly) {
                lsWrite(sessionId, { sessionId, items: baseItems, savedAt: Date.now() });
            }

        // view 생성: 재도전이면 "X였던 문제는 다시 풀도록 unchecked로 초기화"
            const view: ChoiceView[] = baseItems.map((it, i) => {
                const prev = originProgress?.[i] ?? null;

                const shouldLockAsCorrect = retryWrongOnly && prev === "O";
                const shouldRetry = retryWrongOnly && prev === "X";

                return {
                    id: it.questionId,
                    q: safeTextOrNull(it.questionText) ?? "",
                    choices: (it.options ?? []).map((c) => safeTextOrNull(c.text) ?? ""),
                    explanation: safeTextOrNull(it.explanation) ?? null,
                    correctIndex: -1,
                    checked: shouldLockAsCorrect ? true : false,
                    isCorrect: shouldLockAsCorrect ? true : null,
                };
            });

            if (!mounted) return;

            setQs(view);
            setPicked(Array.from({ length: view.length }, () => null));
            checkedRef.current.clear();

            if (retryWrongOnly) {
                const p = originProgressRef.current ?? [];
                const firstWrong = p.findIndex((v) => v === "X");
                setIdx(firstWrong >= 0 ? firstWrong : 0);
            } else {
                setIdx(0);
            }

            setLoading(false);
        })();

        return () => {
            mounted = false;
        };
    }, [sessionId, items, retryWrongOnly, initialProgress]);

    const liveProgress = React.useMemo<(OX | null)[]>(() => {
        return qs.map((q) => (q.checked && q.isCorrect != null ? (q.isCorrect ? "O" : "X") : null));
    }, [qs]);

    const trayProgress = React.useMemo<(OX | null)[]>(() => {
        if (!retryWrongOnly) return liveProgress;
        const base = originProgressRef.current ?? [];
        return qs.map((q, i) => {
            if (q.checked && q.isCorrect != null) return q.isCorrect ? "O" : "X";
            return base[i] ?? null;
        });
    }, [retryWrongOnly, liveProgress, qs]);

    const total = qs.length;

    const progress = React.useMemo<(OX | null)[]>(() => {
        return qs.map((q) => (q.checked && q.isCorrect != null ? (q.isCorrect ? "O" : "X") : null));
    }, [qs]);

    const buildTrayProgress = React.useCallback((): (OX | null)[] => {
        if (!retryWrongOnly) {
            return qs.map((q) => (q.checked && q.isCorrect != null ? (q.isCorrect ? "O" : "X") : null));
        }
        const base = originProgressRef.current ?? [];
        return qs.map((q, i) => {
            if (q.checked && q.isCorrect != null) return q.isCorrect ? "O" : "X";
            return base[i] ?? null;
        });
    }, [retryWrongOnly, qs]);

    const runCheck = async (qIndex: number, pickedIndex: number) => {
        const q = qs[qIndex];
        if (!q) return;

        const it = baseItemsRef.current[qIndex];
        const selected = it?.options?.[pickedIndex];
        const selectedChoiceId = getChoiceId(selected);
        if (!Number.isFinite(Number(selectedChoiceId))) return;

        if (retryWrongOnly) {
            const correctChoiceId = getCorrectChoiceId(it);
            if (!Number.isFinite(Number(correctChoiceId))) {
                alert("정답 정보를 찾을 수 없어 다시풀기를 진행할 수 없습니다. 오늘의 퀴즈를 새로 시작해주세요.");
                return;
            }

            const correctIndex = it.options.findIndex((c) => Number(getChoiceId(c)) === Number(correctChoiceId));
            const isCorrect = Number(selectedChoiceId) === Number(correctChoiceId);

            setQs((prev) => {
                const next = [...prev];
                const prevQ = next[qIndex];
                if (!prevQ) return prev;

                next[qIndex] = {
                    ...prevQ,
                    checked: true,
                    isCorrect,
                    correctIndex: correctIndex >= 0 ? correctIndex : -1,
                    explanation: safeTextOrNull(it?.explanation) ?? prevQ.explanation,
                };
                return next;
            });
            return;
        }

        try {
            const res = await checkDailyQuestion(sessionId, it.questionId, {
                choiceId: Number(selectedChoiceId),
            });

            const nextItems = [...baseItemsRef.current];
            if (nextItems[qIndex]) {
                nextItems[qIndex] = {
                    ...nextItems[qIndex],
                    correctChoiceId:
                        res?.correctChoiceId != null
                            ? Number(res.correctChoiceId)
                            : nextItems[qIndex]?.correctChoiceId,
                    explanation: safeTextOrNull(res?.explanation) ?? nextItems[qIndex]?.explanation ?? null,
                };
                baseItemsRef.current = nextItems;
                persistItems(nextItems);
            }

            checkedRef.current.set(q.id, res);

            const correctChoiceId = res?.correctChoiceId != null ? Number(res.correctChoiceId) : null;
            const correctIndex =
                correctChoiceId == null
                    ? -1
                    : it.options.findIndex((c) => Number(getChoiceId(c)) === correctChoiceId);

            setQs((prev) => {
                const next = [...prev];
                const prevQ = next[qIndex];
                if (!prevQ) return prev;

                next[qIndex] = {
                    ...prevQ,
                    checked: true,
                    isCorrect: !!res?.correct,
                    correctIndex: correctIndex >= 0 ? correctIndex : -1,
                    explanation: safeTextOrNull(res?.explanation) ?? prevQ.explanation,
                };
                return next;
            });
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "채점 중 오류가 발생했습니다.";
            alert(msg);
        }
    };

    function buildSubmitAnswers() {
        const answers: Array<{ quizQuestionId: number; selectedChoiceId: number }> = [];
        const base = baseItemsRef.current ?? [];
        const selected = pickedRef.current ?? [];

        for (let i = 0; i < base.length; i++) {
            const q = base[i];
            const pickedIndex = selected[i];
            if (pickedIndex == null) continue;

            const choice = q?.options?.[pickedIndex];
            const choiceId = Number(getChoiceId(choice));
            if (!Number.isFinite(choiceId)) continue;

            answers.push({
                quizQuestionId: Number(q.questionId),
                selectedChoiceId: choiceId,
            });
        }

        return answers;
    }

    const submitSession = async () => {
        if (submitting) return;
        const answers = buildSubmitAnswers();
        if (!answers.length) return;

        setSubmitting(true);
        try {
            const elapsedMs = Math.max(0, Date.now() - startMsRef.current);
            await http.post(
                `/me/quiz/sessions/${sessionId}/submit`,
                { answers, elapsedMs },
                { withCredentials: true }
            );
        } catch (e: any) {
            console.error("[daily choice submit] failed:", e?.response?.data ?? e);
            throw e;
        } finally {
            setSubmitting(false);
        }
    };

    const goNext = async () => {
        if (!qs[idx]?.checked) return;
        const currentTray = buildTrayProgress();

        if (!retryWrongOnly) {
            if (idx >= total - 1) {
                persistProgress(progress);
                try {
                    await submitSession();
                } catch (e: any) {
                    const msg = e?.response?.data?.message ?? e?.message ?? "제출 중 오류가 발생했습니다.";
                    alert(msg);
                    return;
                }
                onShowResult?.({ sessionId, progress });
                return;
            }
            setIdx((i) => i + 1);
            return;
        }

        if (idx >= total - 1) {
            persistProgress(currentTray);
            try {
                await submitSession();
            } catch (e: any) {
                console.error("[daily choice retry submit] failed:", e?.response?.data ?? e);
            }
            onShowResult?.({ sessionId, progress: currentTray });
            return;
        }

        const nextWrong = currentTray.findIndex((v, i) => i > idx && v === "X");
        if (nextWrong >= 0) return setIdx(nextWrong);

        const firstWrong = currentTray.findIndex((v) => v === "X");
        if (firstWrong >= 0 && firstWrong !== idx) return setIdx(firstWrong);

        persistProgress(currentTray);
        onShowResult?.({ sessionId, progress: currentTray });
    };

    const cur = qs[idx];

    if (loading) return <Stage>불러오는 중…</Stage>;
    if (!cur) return <Stage>문항이 없습니다.</Stage>;

    const selectedIndex = picked[idx];
    const showResult = cur.checked;
    const currentJudge = progress[idx] ?? null;

    return (
        <Stage>
            <DailyChoiceCard
                key={`daily-choice-${idx}-${cur.id}`}
                index={idx + 1}
                total={total}
                question={cur.q}
                choices={cur.choices}
                value={selectedIndex}
                onChange={(i) => {
                    setPicked((prev) => {
                        const next = [...prev];
                        next[idx] = i;
                        return next;
                    });
                    runCheck(idx, i);
                }}
                showResult={showResult}
                correct={cur.correctIndex >= 0 ? cur.correctIndex : undefined}
                explanation={cur.explanation ?? undefined}
                progress={trayProgress}
                retryWrongOnly={retryWrongOnly}
                currentJudge={currentJudge}
                onNext={goNext}
                onGoto={(n) => {
                    const next = Math.max(1, Math.min(total, n)) - 1;
                    setIdx(next);
                }}
            />
        </Stage>
    );
}
