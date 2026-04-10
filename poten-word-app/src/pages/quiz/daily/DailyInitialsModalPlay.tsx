import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import DailyInitialsCard from "../../../components/quiz/DailyInitialsCard";
import http from "../../../utils/http";
import { checkDailyQuestion } from "../../../api/dailyQuiz";

type OX = "O" | "X";

type StartedChoice = {
    choiceId: number;
    choiceText?: string;
    text?: string;
    isAnswer?: boolean;
};

type StartedItem = {
    questionId: number;
    questionText: string;
    explanation?: string | null;
    choices?: StartedChoice[];
    answerText?: string;
    initialsHint?: string | null;
};

type Props = {
    sessionId: number;
    items: StartedItem[];
    onClose: () => void;
    onShowResult?: (p: { sessionId: number; progress: (OX | null)[] }) => void;
    retryWrongOnly?: boolean;
    initialProgress?: (OX | null)[];
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

const LS_KEY_LAST_SESSION = "quiz:lastSessionId";
const LS_KEY_PROGRESS = "quiz/initials-or-ox/progress";
const LS_KEY = (sessionId: number) => `ipoten:daily-initials:session:${sessionId}`;

type StoredDailyInitials = {
    sessionId: number;
    items: StartedItem[];
    initialProgress?: (OX | null)[];
    correctAnswers?: string[];
    explanations?: (string | null)[];
    savedAt: number;
};

function lsRead(sessionId: number): StoredDailyInitials | null {
    try {
        const raw = localStorage.getItem(LS_KEY(sessionId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredDailyInitials;
        if (!parsed || !Array.isArray(parsed.items)) return null;
        return { ...parsed, sessionId };
    } catch {
        return null;
    }
}

function lsWrite(sessionId: number, payload: StoredDailyInitials) {
    try {
        localStorage.setItem(LS_KEY(sessionId), JSON.stringify(payload));
    } catch {
        // ignore
    }
}

const nz = (v: any) => String(v ?? "").trim();
const normalizeAnswer = (v: any) => nz(v).replace(/\s+/g, "").toLowerCase();

const toHintArray = (hint?: string | null) =>
    String(hint ?? "")
        .trim()
        .split("")
        .filter((ch) => ch !== " ");

function pickAnswerText(data: any) {
    return (
        data?.answerText ??
        data?.correctAnswer ??
        data?.correctText ??
        data?.answer ??
        data?.solution ??
        ""
    );
}

export default function DailyInitialsModalPlay({
    sessionId,
    items,
    onClose,
    onShowResult,
    retryWrongOnly = false,
    initialProgress,
}: Props) {
    const nav = useNavigate();
    const [startMs] = React.useState(() => Date.now());

    const qs = React.useMemo(() => {
        return (items ?? []).map((it) => ({
            id: it.questionId,
            q: nz(it.questionText),
            hint: nz(it.initialsHint),
            answerText: nz(it.answerText),
            explanation: nz(it.explanation) || null,
        }));
    }, [items]);

    const total = qs.length;

    const [idx, setIdx] = React.useState(0);
    const [answer, setAnswer] = React.useState("");

    const [progress, setProgress] = React.useState<(OX | null)[]>(
        () => Array.from({ length: total }, () => null)
    );
    const [checkedFlags, setCheckedFlags] = React.useState<boolean[]>(
        () => Array.from({ length: total }, () => false)
    );
    const [correctAnswers, setCorrectAnswers] = React.useState<string[]>(
        () => Array.from({ length: total }, () => "")
    );
    const [explanations, setExplanations] = React.useState<(string | null)[]>(
        () => Array.from({ length: total }, () => null)
    );

    const [userAnswers, setUserAnswers] = React.useState<(string | null)[]>(
        () => Array.from({ length: total }, () => null)
    );

    const [checking, setChecking] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);

    const originProgressRef = React.useRef<(OX | null)[] | undefined>(undefined);
    const progressRef = React.useRef<(OX | null)[]>(progress);
    const userAnswersRef = React.useRef<(string | null)[]>(userAnswers);
    const correctAnswersRef = React.useRef<string[]>(correctAnswers);
    const explanationsRef = React.useRef<(string | null)[]>(explanations);
    const storedRef = React.useRef<StoredDailyInitials | null>(null);

    React.useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    React.useEffect(() => {
        userAnswersRef.current = userAnswers;
    }, [userAnswers]);

    React.useEffect(() => {
        correctAnswersRef.current = correctAnswers;
    }, [correctAnswers]);

    React.useEffect(() => {
        explanationsRef.current = explanations;
    }, [explanations]);

    const persistProgress = React.useCallback(
        (
            p: (OX | null)[],
            extras?: {
                correctAnswers?: string[];
                explanations?: (string | null)[];
            }
        ) => {
            const payload: StoredDailyInitials = {
                sessionId,
                items,
                initialProgress: p,
                correctAnswers: extras?.correctAnswers ?? correctAnswersRef.current,
                explanations: extras?.explanations ?? explanationsRef.current,
                savedAt: Date.now(),
            };
            lsWrite(sessionId, payload);
            storedRef.current = payload;
        },
        [sessionId, items]
    );

    React.useEffect(() => {
        const stored = lsRead(sessionId);
        storedRef.current = stored;
        const storedCorrects = stored?.correctAnswers ?? [];
        const storedExplanations = stored?.explanations ?? [];
        const originProgress: (OX | null)[] | undefined = retryWrongOnly
            ? (initialProgress?.length ? initialProgress : stored?.initialProgress?.length ? stored.initialProgress : undefined)
            : undefined;

        originProgressRef.current = originProgress;

        const nextProgress: (OX | null)[] = Array.from({ length: total }, (_, i) =>
            retryWrongOnly && originProgress?.[i] === "O" ? "O" : null
        );
        const nextChecked: boolean[] = Array.from({ length: total }, (_, i) =>
            retryWrongOnly && originProgress?.[i] === "O"
        );
        const nextCorrectAnswers: string[] = Array.from({ length: total }, (_, i) => {
            if (!retryWrongOnly) return "";
            return storedCorrects[i] ?? pickAnswerText(items[i]);
        });
        const nextExplanations: (string | null)[] = Array.from({ length: total }, (_, i) => {
            if (!retryWrongOnly) return null;
            return storedExplanations[i] ?? qs[i]?.explanation ?? null;
        });

        setProgress(nextProgress);
        setCheckedFlags(nextChecked);
        setCorrectAnswers(nextCorrectAnswers);
        setExplanations(nextExplanations);
        setUserAnswers(Array.from({ length: total }, () => null));

        if (!retryWrongOnly) {
            const payload: StoredDailyInitials = {
                sessionId,
                items,
                correctAnswers: correctAnswersRef.current,
                explanations: explanationsRef.current,
                savedAt: Date.now(),
            };
            lsWrite(sessionId, payload);
            storedRef.current = payload;
            setIdx(0);
            setAnswer("");
            return;
        }

        const firstWrong = (originProgress ?? []).findIndex((v) => v === "X");
        const nextIdx = firstWrong >= 0 ? firstWrong : 0;
        setIdx(nextIdx);
        setAnswer("");
    }, [sessionId, total, retryWrongOnly, initialProgress, items, qs]);

    React.useEffect(() => {
        setAnswer(userAnswers[idx] ?? "");
    }, [idx, userAnswers]);

    const cur = qs[idx];
    const showResult = !!checkedFlags[idx];
    const currentCorrectAnswer = correctAnswers[idx] ?? "";
    const currentExplanation = explanations[idx] ?? null;

    const trayProgress = React.useMemo<(OX | null)[]>(() => {
        if (!retryWrongOnly) return progress;
        const base = originProgressRef.current ?? initialProgress ?? [];
        return Array.from({ length: total }, (_, i) => {
            const p = progress[i];
            if (p != null) return p;
            const b = base[i];
            if (b != null) return b;
            return null;
        });
    }, [retryWrongOnly, progress, total, initialProgress]);

    const buildTrayProgress = React.useCallback(() => {
        if (!retryWrongOnly) return progressRef.current;
        const base = originProgressRef.current ?? initialProgress ?? [];
        const live = progressRef.current ?? [];
        return Array.from({ length: total }, (_, i) => {
            const p = live[i];
            if (p != null) return p;
            const b = base[i];
            if (b != null) return b;
            return null;
        });
    }, [retryWrongOnly, total, initialProgress]);

    const finishToResult = React.useCallback(
        (p: (OX | null)[]) => {
            try {
                localStorage.setItem(LS_KEY_LAST_SESSION, String(sessionId));
                localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(p));
            } catch {
                // ignore
            }

            persistProgress(p);

            if (onShowResult) {
                onShowResult({ sessionId, progress: p });
                return;
            }

            onClose();
            nav(`/learning/quiz/play/result/${sessionId}`, {
                state: { sessionId, progress: p },
                replace: true,
            });
        },
        [onShowResult, sessionId, onClose, nav, persistProgress]
    );

    const handleSubmit = async () => {
        if (!cur) return;
        if (showResult) return;
        if (!answer.trim()) return;
        if (checking) return;

        setChecking(true);
        try {
            setUserAnswers((prev) => {
                const next = [...prev];
                next[idx] = answer;
                userAnswersRef.current = next;
                return next;
            });

            if (retryWrongOnly) {
                const expected =
                    nz(correctAnswersRef.current[idx]) ||
                    nz(cur.answerText) ||
                    nz(storedRef.current?.correctAnswers?.[idx]) ||
                    "";
                const isCorrect =
                    !!expected && normalizeAnswer(answer) === normalizeAnswer(expected);

                setCheckedFlags((prev) => {
                    const next = [...prev];
                    next[idx] = true;
                    return next;
                });

                const nextProgress = [...progressRef.current];
                nextProgress[idx] = isCorrect ? "O" : "X";
                progressRef.current = nextProgress;
                setProgress(nextProgress);

                const nextCorrectAnswers = [...correctAnswersRef.current];
                nextCorrectAnswers[idx] = expected || answer.trim();
                correctAnswersRef.current = nextCorrectAnswers;
                setCorrectAnswers(nextCorrectAnswers);

                const nextExplanations = [...explanationsRef.current];
                nextExplanations[idx] =
                    cur.explanation ??
                    storedRef.current?.explanations?.[idx] ??
                    null;
                explanationsRef.current = nextExplanations;
                setExplanations(nextExplanations);

                persistProgress(nextProgress, {
                    correctAnswers: nextCorrectAnswers,
                    explanations: nextExplanations,
                });
                return;
            }

            const res = await checkDailyQuestion(sessionId, cur.id, { answerText: answer });
            const isCorrect = !!res?.correct;

            setCheckedFlags((prev) => {
                const next = [...prev];
                next[idx] = true;
                return next;
            });

            const nextProgress = [...progressRef.current];
            nextProgress[idx] = isCorrect ? "O" : "X";
            progressRef.current = nextProgress;
            setProgress(nextProgress);

            const nextCorrectAnswers = [...correctAnswersRef.current];
            nextCorrectAnswers[idx] =
                pickAnswerText(res) ||
                cur.answerText ||
                storedRef.current?.correctAnswers?.[idx] ||
                answer.trim() ||
                "";
            correctAnswersRef.current = nextCorrectAnswers;
            setCorrectAnswers(nextCorrectAnswers);

            const nextExplanations = [...explanationsRef.current];
            nextExplanations[idx] =
                res?.explanation ??
                cur.explanation ??
                storedRef.current?.explanations?.[idx] ??
                null;
            explanationsRef.current = nextExplanations;
            setExplanations(nextExplanations);

            persistProgress(nextProgress, {
                correctAnswers: nextCorrectAnswers,
                explanations: nextExplanations,
            });
        } catch (e: any) {
            const status = e?.response?.status;
            const data = e?.response?.data;
            const msg = String(data?.message ?? "");

            if (msg.includes("만료") || msg.includes("조회") || msg.includes("금지")) {
                alert("퀴즈 세션이 만료되었거나 접근이 불가합니다. 다시 시도해주세요.");
                onClose();
                return;
            }

            if (status === 409) {
                const correct = !!data?.correct;

                setCheckedFlags((prev) => {
                    const next = [...prev];
                    next[idx] = true;
                    return next;
                });

                const nextProgress = [...progressRef.current];
                nextProgress[idx] = data?.correct === undefined ? progressRef.current[idx] : correct ? "O" : "X";
                progressRef.current = nextProgress;
                setProgress(nextProgress);

                const nextCorrectAnswers = [...correctAnswersRef.current];
                const storedCorrect = storedRef.current?.correctAnswers?.[idx] ?? "";
                nextCorrectAnswers[idx] =
                    pickAnswerText(data) || cur.answerText || storedCorrect || answer.trim() || "";
                correctAnswersRef.current = nextCorrectAnswers;
                setCorrectAnswers(nextCorrectAnswers);

                const nextExplanations = [...explanationsRef.current];
                const storedExplanation = storedRef.current?.explanations?.[idx] ?? null;
                nextExplanations[idx] =
                    data?.explanation ?? cur.explanation ?? storedExplanation ?? null;
                explanationsRef.current = nextExplanations;
                setExplanations(nextExplanations);

                persistProgress(nextProgress, {
                    correctAnswers: nextCorrectAnswers,
                    explanations: nextExplanations,
                });
                return;
            }

            console.error("[daily initials check] failed:", data ?? e);
            alert("채점 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
        } finally {
            setChecking(false);
        }
    };

    function buildSubmitAnswers() {
        const answers: Array<{ quizQuestionId: number; textAnswer: string; answerText?: string }> = [];

        for (let i = 0; i < qs.length; i++) {
            const qid = qs[i]?.id;
            const a = (userAnswersRef.current[i] ?? "").trim();
            if (!qid) continue;
            if (!a) continue;
            answers.push({ quizQuestionId: qid, textAnswer: a, answerText: a });
        }

        return answers;
    }

    const handleNext = async () => {
        if (!showResult) return;

        const finalProgress = retryWrongOnly ? buildTrayProgress() : progressRef.current;

        if (!retryWrongOnly) {
            if (idx >= total - 1) {
                if (submitting) return;

                const answers = buildSubmitAnswers();
                if (!answers.length) {
                    finishToResult(finalProgress);
                    return;
                }

                setSubmitting(true);
                try {
                    const elapsedMs = Math.max(0, Date.now() - startMs);
                    await http.post(
                        `/me/quiz/sessions/${sessionId}/submit`,
                        { answers, elapsedMs },
                        { withCredentials: true }
                    );
                    finishToResult(finalProgress);
                } catch (e: any) {
                    console.error("[initials submit] failed:", e?.response?.data ?? e);
                    alert("제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
                } finally {
                    setSubmitting(false);
                }
                return;
            }

            setIdx((i) => i + 1);
            return;
        }

        if (idx >= total - 1) {
            if (!submitting) {
                const answers = buildSubmitAnswers();
                if (answers.length) {
                    setSubmitting(true);
                    try {
                        const elapsedMs = Math.max(0, Date.now() - startMs);
                        await http.post(
                            `/me/quiz/sessions/${sessionId}/submit`,
                            { answers, elapsedMs },
                            { withCredentials: true }
                        );
                    } catch (e: any) {
                        console.error("[initials retry submit] failed:", e?.response?.data ?? e);
                    } finally {
                        setSubmitting(false);
                    }
                }
            }

            finishToResult(finalProgress);
            return;
        }

        const currentTray = buildTrayProgress();
        const nextWrong = currentTray.findIndex((v, i) => i > idx && v === "X");
        if (nextWrong >= 0) {
            setIdx(nextWrong);
            return;
        }

        const firstWrong = currentTray.findIndex((v) => v === "X");
        if (firstWrong >= 0 && firstWrong !== idx) {
            setIdx(firstWrong);
            return;
        }

        finishToResult(finalProgress);
    };

    if (!cur) return <Stage>문항이 없습니다.</Stage>;

    return (
        <Stage>
            <DailyInitialsCard
                index={idx + 1}
                total={total}
                question={cur.q}
                initials={toHintArray(cur.hint)}
                value={answer}
                onChange={(v) => {
                    setAnswer(v);
                    setUserAnswers((prev) => {
                        const next = [...prev];
                        next[idx] = v;
                        userAnswersRef.current = next;
                        return next;
                    });
                }}
                onSubmit={handleSubmit}
                onNext={handleNext}
                onGoto={(n) => {
                    const next = Math.max(1, Math.min(total, n)) - 1;
                    setIdx(next);
                }}
                showResult={showResult}
                correctAnswer={showResult ? currentCorrectAnswer : ""}
                explanation={currentExplanation}
                progress={trayProgress}
                retryWrongOnly={retryWrongOnly}
            />
        </Stage>
    );
}
