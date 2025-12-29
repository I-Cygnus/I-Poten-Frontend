import React from "react";
import styled from "styled-components";
import http from "../../../utils/http.ts";
import { getSessionReport } from "../../../api/quiz.ts";
import DailyChoiceCard from "../../../components/quiz/DailyChoiceCard.tsx";

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
    correctIndex: number;
    explanation: string | null;
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

async function hydrateFromReport(sessionId: number, items: StartedItem[]) {
    const rep = await getSessionReport(sessionId);

    const byQ = new Map<number, { correctChoiceId?: number; explanation?: string | null }>();
    for (const d of rep?.details ?? []) {
        const qid = Number(d?.quizQuestionId);
        if (!Number.isFinite(qid)) continue;
        byQ.set(qid, {
            correctChoiceId: d?.correctChoiceId != null ? Number(d.correctChoiceId) : undefined,
            explanation: d?.explanation ?? null,
        });
    }

    const correctIndexes = items.map((it) => {
        const correctCid = byQ.get(it.questionId)?.correctChoiceId;
        if (correctCid == null) return -1;
        const idx = (it.options ?? []).findIndex((c) => Number(c.choiceId) === Number(correctCid));
        return idx >= 0 ? idx : -1;
    });

    const explanations = items.map((it) => byQ.get(it.questionId)?.explanation ?? null);
    return { correctIndexes, explanations };
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

    // idx는 0-based로
    const [idx, setIdx] = React.useState(0);
    const [picked, setPicked] = React.useState<(number | null)[]>([]);
    const [startMs] = React.useState(() => Date.now());

    React.useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);

            const needReport =
                items.some((it) => it.correctChoiceId == null) ||
                items.some((it) => !String(it.explanation ?? "").trim());

            let correctIndexes: number[] = [];
            let repExps: (string | null)[] = [];

            if (needReport) {
                try {
                    const hydrated = await hydrateFromReport(sessionId, items);
                    correctIndexes = hydrated.correctIndexes;
                    repExps = hydrated.explanations;
                } catch {
                    correctIndexes = items.map(() => -1);
                    repExps = items.map(() => null);
                }
            } else {
                // 서버가 다 내려줄 때
                correctIndexes = items.map((it) => {
                    if (it.correctChoiceId == null) return -1;
                    const i = (it.options ?? []).findIndex((c) => Number(c.choiceId) === Number(it.correctChoiceId));
                    return i >= 0 ? i : -1;
                });
                repExps = items.map((it) => it.explanation ?? null);
            }

            const view: ChoiceView[] = items.map((it, i) => ({
                id: it.questionId,
                q: safeTextOrNull(it.questionText) ?? "",
                choices: (it.options ?? []).map((c) => safeTextOrNull(c.text) ?? ""),
                correctIndex: correctIndexes[i] ?? -1,
                explanation: safeTextOrNull(it.explanation) ?? safeTextOrNull(repExps[i]),
            }));

            if (!mounted) return;

            setQs(view);
            setPicked(Array.from({ length: view.length }, () => null));
            setIdx(0);
            setLoading(false);
        })();

        return () => {
            mounted = false;
        };
    }, [sessionId, items]);

    const cur = qs[idx];
    const total = qs.length;

    const progress = React.useMemo<(OX | null)[]>(() => {
        return qs.map((q, i) => {
            const p = picked[i];
            if (p == null) return null;
            if (q.correctIndex < 0) return null;
            return p === q.correctIndex ? "O" : "X";
        });
    }, [qs, picked]);

    function buildSubmitAnswers() {
        const answers: Array<{ quizQuestionId: number; selectedChoiceId: number }> = [];
        for (let i = 0; i < items.length; i++) {
            const pickedIdx = picked[i];
            if (pickedIdx == null) continue;
            const it = items[i];
            const ch = it?.options?.[pickedIdx];
            if (!it?.questionId || !ch?.choiceId) continue;
            answers.push({ quizQuestionId: it.questionId, selectedChoiceId: ch.choiceId });
        }
        return answers;
    }

    const goNext = async () => {
        if (idx >= total - 1) {
            const answers = buildSubmitAnswers();
            if (!answers.length) return;

            const elapsedMs = Math.max(0, Date.now() - startMs);
            await http.post(
                `/me/quiz/sessions/${sessionId}/submit`,
                { answers, elapsedMs },
                { withCredentials: true }
            );

            onShowResult?.({ sessionId, progress });
            return;
        }

        setIdx((i) => i + 1);
    };

    if (loading) return <Stage>불러오는 중…</Stage>;
    if (!cur) return <Stage>문항이 없습니다.</Stage>;

    const selectedIndex = picked[idx];
    const showResult = selectedIndex != null;

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
                }}
                showResult={showResult}
                correct={cur.correctIndex}
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
