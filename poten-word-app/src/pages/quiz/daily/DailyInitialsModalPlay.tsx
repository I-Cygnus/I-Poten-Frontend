import React from "react";
import styled from "styled-components";
import DailyInitialsCard from "../../../components/quiz/DailyInitialsCard.tsx";
import { useNavigate } from "react-router-dom";
import http from "../../../utils/http.ts";

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
const norm = (s: any) => nz(s).replace(/\s+/g, "").toLowerCase();

function hangulToInitials(text: string): string[] {
    const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    const res: string[] = [];
    for (const ch of (text ?? "")) {
        const code = ch.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) {
            const idx = code - 0xac00;
            res.push(CHO[Math.floor(idx / 588)] ?? ch);
        } else if (/\s/.test(ch)) continue;
        else res.push(ch);
    }
    return res;
}

function extractAnswer(it: StartedItem): string {
    const direct = nz((it as any).answerText);
    if (direct) return direct;

    const found =
        (it.choices ?? []).find(c => c.isAnswer)?.choiceText ??
        (it.choices ?? []).find(c => c.isAnswer)?.text ??
        "";

    return nz(found);
}

export default function DailyInitialsModalPlay({
                                                   sessionId,
                                                   items,
                                                   onClose,
                                                   onShowResult,
                                               }: Props) {
    const nav = useNavigate();
    const [startMs] = React.useState(() => Date.now()); // elapsedMs 용

    const qs = React.useMemo(() => {
        return (items ?? [])
            .map((it) => {
                const ans = extractAnswer(it);
                return {
                    id: it.questionId,
                    q: nz(it.questionText),
                    answer: ans,
                    initials: hangulToInitials(ans),
                    explanation: it.explanation ?? null,
                };
            })
            .filter((x) => !!x.answer) as Array<{
            id: number;
            q: string;
            answer: string;
            initials: string[];
            explanation: string | null;
        }>;
    }, [items]);

    const total = qs.length;

    const [idx, setIdx] = React.useState(0);
    const [answer, setAnswer] = React.useState("");
    const [showResult, setShowResult] = React.useState(false);

    const [progress, setProgress] = React.useState<(OX | null)[]>(
        () => Array.from({ length: total }, () => null)
    );

    // 각 문항의 "사용자 입력"을 저장해 둬야 마지막 submit 가능
    const [userAnswers, setUserAnswers] = React.useState<(string | null)[]>(
        () => Array.from({ length: total }, () => null)
    );

    // 최신 progress를 항상 들고있기 (stale 방지)
    const progressRef = React.useRef<(OX | null)[]>(progress);
    React.useEffect(() => { progressRef.current = progress; }, [progress]);

    // 최신 userAnswers도 ref로(마지막 submit 시점 stale 방지)
    const userAnswersRef = React.useRef<(string | null)[]>(userAnswers);
    React.useEffect(() => { userAnswersRef.current = userAnswers; }, [userAnswers]);

    React.useEffect(() => {
        setIdx(0);
        setAnswer("");
        setShowResult(false);
        setProgress(Array.from({ length: total }, () => null));
        setUserAnswers(Array.from({ length: total }, () => null));
    }, [total]);

    const cur = qs[idx];
    if (!cur) return <Stage>문항이 없습니다.</Stage>;

    // showResult 상관없이 "현재 입력 기준" 정답 판단
    const correctNow = norm(answer) === norm(cur.answer);

    const finishToResult = React.useCallback(
        (p: (OX | null)[]) => {
            // localStorage는 항상 저장(라우트/새로고침 대비)
            try {
                localStorage.setItem(LS_KEY_LAST_SESSION, String(sessionId));
                localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(p));
            } catch {}

            if (onShowResult) {
                onShowResult({ sessionId, progress: p });
                return;
            }

            onClose();
            nav(`/poten-word/quiz/play/result/${sessionId}`, {
                state: { sessionId, progress: p },
                replace: true,
            });
        },
        [onShowResult, sessionId, onClose, nav]
    );

    const handleSubmit = () => {
        if (!answer.trim()) return;

        // 현재 문항 사용자답 저장
        setUserAnswers((prev) => {
            const next = prev.length === total ? [...prev] : Array.from({ length: total }, () => null);
            next[idx] = answer; // raw 저장
            userAnswersRef.current = next;
            return next;
        });

        // 제출 순간에 correctNow로 진행도 기록
        setShowResult(true);
        setProgress((prev) => {
            const next =
                prev.length === total ? [...prev] : Array.from({ length: total }, () => null);

            next[idx] = correctNow ? "O" : "X";
            progressRef.current = next;
            return next;
        });
    };

    const [submitting, setSubmitting] = React.useState(false);

    function buildSubmitAnswers() {
        // 서버 제출 payload (텍스트형)
        const answers: Array<{ quizQuestionId: number; textAnswer: string; answerText?: string }> = [];

        for (let i = 0; i < qs.length; i++) {
            const qid = qs[i]?.id;
            const a = (userAnswersRef.current[i] ?? "").trim();
            if (!qid) continue;
            answers.push({ quizQuestionId: qid, textAnswer: a, answerText: a });
        }
        return answers;
    }

    const handleNext = async () => {
        // 마지막: "결과 보기" 클릭
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

                // submit 성공 후 결과로
                finishToResult(progressRef.current);
            } catch (e: any) {
                console.error("[initials submit] failed:", e?.response?.data ?? e);
                alert("제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
            } finally {
                setSubmitting(false);
            }
            return;
        }

        // 다음 문제
        setIdx((i) => i + 1);
        setAnswer("");
        setShowResult(false);
    };

    return (
        <Stage>
            <DailyInitialsCard
                index={idx + 1}
                total={total}
                question={cur.q}
                initials={cur.initials}
                value={answer}
                onChange={setAnswer}
                onSubmit={handleSubmit}
                onNext={handleNext}
                showResult={showResult}
                correctAnswer={cur.answer}
                progress={progress}
            />
        </Stage>
    );
}
