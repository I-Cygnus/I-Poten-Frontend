import React from "react";
import styled from "styled-components";
import http from "../../../utils/http.ts";
import { getSessionReport } from "../../../api/quiz.ts";
import DailyOXCard from "../../../components/quiz/DailyOXCard.tsx";
import { useNavigate } from "react-router-dom";

type OX = "O" | "X";

const norm = (v: any) => String(v ?? "").trim().replace(/\s+/g, "").toUpperCase();

const toOX = (text: any): OX => {
    const t = norm(text);
    // 넉넉하게 대응
    if (["X", "FALSE", "F", "NO", "N", "×", "❌"].includes(t)) return "X";
    return "O";
};

const pickQid = (v: any) => Number(v?.questionId ?? v?.quizQuestionId ?? v?.id);
const pickChoiceId = (v: any) => Number(v?.choiceId ?? v?.id);

type StartedChoice = {
    choiceId: number;
    choiceText: string;
    isAnswer?: boolean;
};

type StartedItem = {
    questionId: number;
    questionText: string;
    explanation?: string | null;
    choices: StartedChoice[];
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

const isOText = (t: string) =>
    ["O", "TRUE", "T", "YES", "Y", "○", "⭕"].includes(t);

const isXText = (t: string) =>
    ["X", "FALSE", "F", "NO", "N", "×", "❌"].includes(t);

const pickQuestionId = (it: any) =>
    Number(it?.questionId ?? it?.quizQuestionId ?? it?.id);

function safeText(v: any) {
    return String(v ?? "").trim();
}

function safeTextOrNull(v: any): string | null {
    const s = safeText(v);
    return s ? s : null;
}

function deriveCorrectFromIsAnswer(it: StartedItem): OX | null {
    const ans = (it.choices ?? []).find((c) => c?.isAnswer === true);
    if (!ans) return null;
    const v = safeText(ans.choiceText).toUpperCase();
    return v === "X" ? "X" : "O";
}

const getOptions = (it: any) => (it?.options ?? it?.choices ?? it?.choiceList ?? []) as any[];

const getOptId = (o: any) => Number(o?.choiceId ?? o?.id ?? o?.optionId);
const getOptText = (o: any) => String(o?.choiceText ?? o?.text ?? o?.optionText ?? o?.label ?? "").trim();

const deriveCorrectOX = (it: any): OX => {
    // 1) answerText가 있으면 그걸 우선
    if (it?.answerText != null) return toOX(it.answerText);

    // 2) correctChoiceId + options 텍스트로 판단
    const correctCid = Number(it?.correctChoiceId ?? it?.correct_choice_id);
    const opts = getOptions(it);
    const correctOpt = opts.find(o => getOptId(o) === correctCid);
    if (correctOpt) return toOX(getOptText(correctOpt));

    // 3) fallback
    return "O";
};

export default function DailyOxModalPlay({
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
    const nav = useNavigate();
    const [loading, setLoading] = React.useState(true);

    const choiceMapRef = React.useRef<Map<number, { O?: number; X?: number }>>(new Map());

    const putChoice = React.useCallback((qid: number, ox: OX, cid: number) => {
        if (!Number.isFinite(qid) || !Number.isFinite(cid)) return;
        const cur = choiceMapRef.current.get(qid) ?? {};
        cur[ox] = cid;
        choiceMapRef.current.set(qid, cur);
    }, []);

    const [view, setView] = React.useState<
        Array<{ qid: number; q: string; correct: OX; explanation: string | null }>
    >([]);

    const [idx, setIdx] = React.useState(0); // 0-based
    const [picked, setPicked] = React.useState<(OX | null)[]>([]);
    const [startMs] = React.useState(() => Date.now());

    React.useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);

            // options + correctChoiceId(+answerText)로 correct OX 확정
            const corrects: OX[] = items.map(deriveCorrectOX);

            // 여기서 O/X → choiceId 매핑을 확정해서 choiceMapRef에 저장
            for (let i = 0; i < items.length; i++) {
                const it = items[i];
                const qid = pickQuestionId(it);
                if (!Number.isFinite(qid)) continue;

                const opts = getOptions(it);
                if (!opts.length) continue;

                // 텍스트 기반으로 O/X 옵션 찾기 (가장 안정적)
                const oOpt = opts.find(o => isOText(norm(getOptText(o))));
                const xOpt = opts.find(o => isXText(norm(getOptText(o))));

                if (oOpt && xOpt) {
                    putChoice(qid, "O", getOptId(oOpt));
                    putChoice(qid, "X", getOptId(xOpt));
                    continue;
                }

                // 텍스트가 애매하면 correctChoiceId로 반대편을 유추
                const correctCid = Number(it?.correctChoiceId ?? it?.correct_choice_id);
                const correctOX = corrects[i] ?? "O";

                if (Number.isFinite(correctCid)) {
                    const other = opts.find(o => getOptId(o) !== correctCid);
                    const otherCid = other ? getOptId(other) : undefined;

                    if (correctOX === "O") {
                        putChoice(qid, "O", correctCid);
                        if (Number.isFinite(otherCid)) putChoice(qid, "X", otherCid!);
                    } else {
                        putChoice(qid, "X", correctCid);
                        if (Number.isFinite(otherCid)) putChoice(qid, "O", otherCid!);
                    }
                    continue;
                }

                // 최후 fallback: 0번=O, 1번=X 가정
                const c0 = getOptId(opts[0]);
                const c1 = getOptId(opts[1] ?? opts[0]);
                if (Number.isFinite(c0)) putChoice(qid, "O", c0);
                if (Number.isFinite(c1)) putChoice(qid, "X", c1);
            }

            const v = items.map((it, i) => ({
                qid: pickQuestionId(it),
                q: safeText(it.questionText),
                correct: corrects[i] ?? "O",
                explanation: safeTextOrNull(it.explanation),
            }));

            if (!mounted) return;

            setView(v);
            setPicked(Array.from({ length: v.length }, () => null));
            setIdx(0);
            setLoading(false);
        })();

        return () => { mounted = false; };
    }, [sessionId, items, putChoice]);

    const total = view.length;
    const cur = view[idx];

    const value = picked[idx] ?? null;
    const showResult = value != null;

    const progress = React.useMemo<(OX | null)[]>(() => {
        return view.map((q, i) => {
            const p = picked[i];
            if (p == null) return null;
            return p === q.correct ? "O" : "X";
        });
    }, [view, picked]);

    function buildSubmitAnswers() {
        const answers: Array<{ quizQuestionId: number; selectedChoiceId: number }> = [];

        for (let i = 0; i < items.length; i++) {
            const pickedVal = picked[i];
            if (!pickedVal) continue;

            const qid = pickQuestionId(items[i]);
            if (!Number.isFinite(qid)) continue;

            const m = choiceMapRef.current.get(qid);
            const selectedChoiceId = pickedVal === "O" ? m?.O : m?.X;

            if (!Number.isFinite(selectedChoiceId)) continue;
            answers.push({ quizQuestionId: qid, selectedChoiceId: selectedChoiceId! });
        }

        return answers;
    }

    const hydrateCorrectByReport = React.useCallback(async (): Promise<OX[]> => {
        const rep = await getSessionReport(sessionId);
        const correctByQ = new Map<number, OX>();

        for (const d of rep?.details ?? []) {
            const qid = pickQid(d);
            const correctText = d?.correctText ?? d?.correct_text;
            const correctChoiceId = Number(d?.correctChoiceId ?? d?.correct_choice_id);

            if (Number.isFinite(qid)) {
                if (correctText != null) {
                    const ox = toOX(correctText);
                    correctByQ.set(qid, ox);

                    // correctChoiceId가 있으면 O/X → choiceId 매핑도 저장
                    if (Number.isFinite(correctChoiceId)) putChoice(qid, ox, correctChoiceId);
                }

                // 서버가 wrong 쪽도 주면 같이 저장
                const wrongText = d?.wrongText ?? d?.wrong_text ?? d?.incorrectText ?? d?.incorrect_text;
                const wrongChoiceId = Number(d?.wrongChoiceId ?? d?.wrong_choice_id ?? d?.incorrectChoiceId ?? d?.incorrect_choice_id);

                if (wrongText != null && Number.isFinite(wrongChoiceId)) {
                    putChoice(qid, toOX(wrongText), wrongChoiceId);
                }
            }
        }

        return items.map((it) => correctByQ.get(pickQid(it)) ?? "O");
    }, [sessionId, items, putChoice]);

    const LS_KEY_LAST_SESSION = "quiz:lastSessionId";
    const LS_KEY_PROGRESS = "quiz/initials-or-ox/progress";

    const goNext = async () => {
        if (idx >= total - 1) {
            try {
                console.log("[OX] submit start", { sessionId, progress });

                const answers = buildSubmitAnswers();
                const elapsedMs = Math.max(0, Date.now() - startMs);

                await http.post(
                    `/me/quiz/sessions/${sessionId}/submit`,
                    { answers, elapsedMs },
                    { withCredentials: true }
                );

                console.log("[OX] submit ok -> nav result");

                try { localStorage.setItem("quiz:lastSessionId", String(sessionId)); } catch {}
                try { localStorage.setItem("quiz/initials-or-ox/progress", JSON.stringify(progress)); } catch {}

                onClose?.();
                if (onShowResult) {
                    onShowResult({ sessionId, progress });
                    return;
                }
                nav(`/poten-word/quiz/play/result/${sessionId}`, { replace:true, state:{ sessionId, progress }});
            } catch (e: any) {
                console.error("[OX] submit/nav failed:", e?.response?.status, e?.response?.data ?? e);
                alert("제출/이동에 실패했어요. 콘솔 로그를 확인해주세요.");
            }
            return;
        }

        setIdx(v => v + 1);
    };

    if (loading) return <Stage>불러오는 중…</Stage>;
    if (!cur) return <Stage>문항이 없습니다.</Stage>;

    return (
        <Stage>
            <DailyOXCard
                key={`daily-ox-${idx}-${cur.qid}`}
                index={idx + 1}
                total={total}
                question={cur.q}
                value={value}
                onChange={(v: OX) => {
                    setPicked((prev) => {
                        const next = [...prev];
                        next[idx] = v;
                        return next;
                    });
                }}
                showResult={showResult}
                correct={cur.correct}
                explanation={cur.explanation}
                progress={progress}
                onNext={goNext}
            />
        </Stage>
    );
}
