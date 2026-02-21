import React from "react";
import styled from "styled-components";
import DailyChoiceCard from "../../../components/quiz/DailyChoiceCard.tsx";
import {checkDailyQuestion} from "../../../api/dailyQuiz.ts";

type OX = "O" | "X";

type StartedChoice = {
    choiceId: number;
    text: string;
    isAnswer?: boolean;
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

export default function DailyChoiceModalPlay({
                                                 sessionId,
                                                 items,
                                                 onClose,
                                                 onShowResult,
                                             }: {
    sessionId: number;
    items: StartedItem[];
    onClose: () => void;
    onShowResult?: (p: { sessionId: number; progress: (OX | null)[] }) => void;
}) {
    const [qs, setQs] = React.useState<ChoiceView[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [idx, setIdx] = React.useState(0);

    /** picked는 “선택한 보기 인덱스(0-based)” */
    const [picked, setPicked] = React.useState<(number | null)[]>([]);
    const [startMs] = React.useState(() => Date.now());

    /** 문항별 check 결과 캐시(중복 호출 방지) */
    const checkedRef = React.useRef(new Map<number, any>());

    React.useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);

            const view: ChoiceView[] = items.map((it) => ({
                id: it.questionId,
                q: safeTextOrNull(it.questionText) ?? "",
                choices: (it.options ?? []).map((c) => safeTextOrNull(c.text) ?? ""),
                explanation: safeTextOrNull(it.explanation) ?? null,

                correctIndex: -1,
                checked: false,
                isCorrect: null,
            }));

            if (!mounted) return;
            setQs(view);
            setPicked(Array.from({ length: view.length }, () => null));
            setIdx(0);
            checkedRef.current.clear();
            setLoading(false);
        })();

        return () => {
            mounted = false;
        };
    }, [sessionId, items]);

    const cur = qs[idx];
    const total = qs.length;

    /** progress는 “체크된 문항만 O/X, 아니면 null” */
    const progress = React.useMemo<(OX | null)[]>(() => {
        return qs.map((q, i) => {
            if (!q.checked || q.isCorrect == null) return null;
            return q.isCorrect ? "O" : "X";
        });
    }, [qs]);

    const runCheck = async (qIndex: number, pickedIndex: number) => {
        const q = qs[qIndex];
        if (!q) return;

        const it = items[qIndex];
        const selected = it?.options?.[pickedIndex];
        if (!selected?.choiceId) return;

        try {
            const res = await checkDailyQuestion(sessionId, it.questionId, {
                choiceId: selected.choiceId,
            });

            checkedRef.current.set(q.id, res);

            const correctChoiceId = res?.correctChoiceId != null ? Number(res.correctChoiceId) : null;
            const correctIndex =
                correctChoiceId == null ? -1
                    : it.options.findIndex((c) => Number(c.choiceId) === correctChoiceId);

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

    const goNext = async () => {
        if (!qs[idx]?.checked) return;

        if (idx >= total - 1) {
            onShowResult?.({ sessionId, progress });
            return;
        }
        setIdx((i) => i + 1);
    };

    if (loading) return <Stage>불러오는 중…</Stage>;
    if (!cur) return <Stage>문항이 없습니다.</Stage>;

    const selectedIndex = picked[idx];

    /** “선택하면 결과 표시” */
    const showResult = cur.checked && cur.correctIndex >= 0;

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
                correct={cur.correctIndex >= 0 ? cur.correctIndex : null}
                explanation={cur.explanation}
                progress={progress}
                onNext={goNext}
                onGoto={(n) => {
                    const next = Math.max(1, Math.min(total, n)) - 1;
                    setIdx(next);
                }}
            />
        </Stage>
    );
}