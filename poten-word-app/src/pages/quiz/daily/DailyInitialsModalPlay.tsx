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

const nz = (v: any) => String(v ?? "").trim();

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
                                               }: Props) {
    const nav = useNavigate();
    const [startMs] = React.useState(() => Date.now());

    const qs = React.useMemo(() => {
        return (items ?? []).map((it) => ({
            id: it.questionId,
            q: nz(it.questionText),
            hint: nz(it.initialsHint),
        }));
    }, [items]);

    const total = qs.length;

    const [idx, setIdx] = React.useState(0);
    const [answer, setAnswer] = React.useState("");
    const [showResult, setShowResult] = React.useState(false);

    const [progress, setProgress] = React.useState<(OX | null)[]>(
        () => Array.from({ length: total }, () => null)
    );

    const [userAnswers, setUserAnswers] = React.useState<(string | null)[]>(
        () => Array.from({ length: total }, () => null)
    );

    const [correctAnswer, setCorrectAnswer] = React.useState("");

    const [checked, setChecked] = React.useState<{
        correct: boolean;
        explanation?: string | null;
    } | null>(null);

    const [checking, setChecking] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);

    // stale 방지 refs
    const progressRef = React.useRef<(OX | null)[]>(progress);
    React.useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    const userAnswersRef = React.useRef<(string | null)[]>(userAnswers);
    React.useEffect(() => {
        userAnswersRef.current = userAnswers;
    }, [userAnswers]);

    // session/문항 변동 시 초기화
    React.useEffect(() => {
        setIdx(0);
        setAnswer("");
        setShowResult(false);
        setChecked(null);
        setCorrectAnswer("");
        setProgress(Array.from({ length: total }, () => null));
        setUserAnswers(Array.from({ length: total }, () => null));
    }, [sessionId, total]);

    const cur = qs[idx];

    const finishToResult = React.useCallback(
        (p: (OX | null)[]) => {
            try {
                localStorage.setItem(LS_KEY_LAST_SESSION, String(sessionId));
                localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(p));
            } catch {}

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
        [onShowResult, sessionId, onClose, nav]
    );

    const handleSubmit = async () => {
        if (!cur) return;
        if (!answer.trim()) return;

        // 이미 결과 보여주는 상태면 재채점 금지
        if (showResult) return;

        // 더블클릭/엔터 연타 방지
        if (checking) return;

        setChecking(true);
        try {
            setUserAnswers((prev) => {
                const next = [...prev];
                next[idx] = answer;
                userAnswersRef.current = next;
                return next;
            });

            const res = await checkDailyQuestion(sessionId, cur.id, { answerText: answer });

            setChecked({ correct: !!res?.correct, explanation: res?.explanation ?? null });
            setCorrectAnswer(pickAnswerText(res));
            setShowResult(true);

            setProgress((prev) => {
                const next = [...prev];
                next[idx] = res?.correct ? "O" : "X";
                progressRef.current = next;
                return next;
            });
        } catch (e: any) {
            const status = e?.response?.status;
            const data = e?.response?.data;
            const msg = String(data?.message ?? "");

            // 세션 만료/조회 금지
            if (msg.includes("만료") || msg.includes("조회는 금지")) {
                alert("오늘의 퀴즈 세션이 만료되었어요. 새로고침 후 다시 시도해주세요.");
                onClose();
                return;
            }

            // 이미 채점됨(409): 백엔드가 payload를 내려주면 그걸로 결과 렌더
            if (status === 409) {
                const correct = !!data?.correct;
                const explanation = data?.explanation ?? null;

                setChecked({ correct, explanation });
                setCorrectAnswer(pickAnswerText(data));
                setShowResult(true);

                setProgress((prev) => {
                    const next = [...prev];
                    next[idx] = data?.correct === undefined ? prev[idx] : correct ? "O" : "X";
                    progressRef.current = next;
                    return next;
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
        const answers: Array<{ quizQuestionId: number; textAnswer: string; answerText?: string }> =
            [];

        for (let i = 0; i < qs.length; i++) {
            const qid = qs[i]?.id;
            const a = (userAnswersRef.current[i] ?? "").trim();
            if (!qid) continue;
            answers.push({ quizQuestionId: qid, textAnswer: a, answerText: a });
        }

        return answers;
    }

    const handleNext = async () => {
        // 마지막: 결과 보기(세션 submit)
        if (idx >= total - 1) {
            if (submitting) return;

            const answers = buildSubmitAnswers();
            if (!answers.length) return;

            setSubmitting(true);
            try {
                const elapsedMs = Math.max(0, Date.now() - startMs);

                await http.post(
                    `/me/quiz/sessions/${sessionId}/submit`,
                    { answers, elapsedMs },
                    { withCredentials: true }
                );

                finishToResult(progressRef.current);
            } catch (e: any) {
                console.error("[initials submit] failed:", e?.response?.data ?? e);
                alert("제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
            } finally {
                setSubmitting(false);
            }
            return;
        }

        // 다음 문항
        setIdx((i) => i + 1);
        setAnswer("");
        setShowResult(false);
        setChecked(null);
        setCorrectAnswer("");
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
                onChange={setAnswer}
                onSubmit={handleSubmit}
                onNext={handleNext}
                showResult={showResult}
                correctAnswer={showResult ? correctAnswer : ""}
                progress={progress}
            />
        </Stage>
    );
}
