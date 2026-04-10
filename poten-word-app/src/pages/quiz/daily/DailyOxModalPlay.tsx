import React from "react";
import styled from "styled-components";
import DailyOXCard from "../../../components/quiz/DailyOXCard.tsx";
import http from "../../../utils/http";
import { checkDailyQuestion } from "../../../api/dailyQuiz.ts";

type OX = "O" | "X";

const norm = (v: any) => String(v ?? "").trim().replace(/\s+/g, "").toUpperCase();
const O_TEXTS = ["O", "TRUE", "T", "YES", "Y"];
const X_TEXTS = ["X", "FALSE", "F", "NO", "N"];

const toOX = (text: any): OX => {
    const t = norm(text);
    if (X_TEXTS.includes(t)) return "X";
    return "O";
};

type StartedItem = {
    questionId: number;
    questionType: "OX";
    questionText: string;
    explanation?: string | null;
    correctChoiceId?: number | null;
    options: Array<{ choiceId: number; text: string; isAnswer?: boolean }>;
    answerText?: string | null;
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
    O_TEXTS.includes(t);

const isXText = (t: string) =>
    X_TEXTS.includes(t);

const pickQuestionId = (it: any) =>
    Number(it?.questionId ?? it?.quizQuestionId ?? it?.id);

function safeText(v: any) {
    return String(v ?? "").trim();
}

function safeTextOrNull(v: any): string | null {
    const s = safeText(v);
    return s ? s : null;
}

const getOptions = (it: any) => (it?.options ?? it?.choices ?? it?.choiceList ?? []) as any[];

const getOptId = (o: any) => Number(o?.choiceId ?? o?.id ?? o?.optionId);
const getOptText = (o: any) => String(o?.text ?? o?.choiceText ?? o?.optionText ?? o?.label ?? "").trim();

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

const LS_KEY = (sessionId: number) => `ipoten:daily-ox:session:${sessionId}`;

type StoredDailyOx = {
    sessionId: number;
    items: StartedItem[];
    initialProgress?: (OX | null)[];
    savedAt: number;
};

function lsRead(sessionId: number): StoredDailyOx | null {
    try {
        const raw = localStorage.getItem(LS_KEY(sessionId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredDailyOx;
        if (!parsed || !Array.isArray(parsed.items)) return null;
        return { ...parsed, sessionId };
    } catch {
        return null;
    }
}

function lsWrite(sessionId: number, payload: StoredDailyOx) {
    try {
        localStorage.setItem(LS_KEY(sessionId), JSON.stringify(payload));
    } catch {
        // ignore
    }
}

export default function DailyOxModalPlay({
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
    const [loading, setLoading] = React.useState(true);

    const choiceMapRef = React.useRef<Map<number, { O?: number; X?: number }>>(new Map());
    const baseItemsRef = React.useRef<StartedItem[]>(items);
    const originProgressRef = React.useRef<(OX | null)[] | undefined>(undefined);

    const getSelectedChoiceId = (qid: number, v: OX) => {
        const m = choiceMapRef.current.get(qid);
        return v === "O" ? m?.O : m?.X;
    };

    const putChoice = React.useCallback((qid: number, ox: OX, cid: number) => {
        if (!Number.isFinite(qid) || !Number.isFinite(cid)) return;
        const cur = choiceMapRef.current.get(qid) ?? {};
        cur[ox] = cid;
        choiceMapRef.current.set(qid, cur);
    }, []);

    const [view, setView] = React.useState<
        Array<{
            qid: number;
            q: string;
            correct: OX;
            explanation: string | null;
            checked: boolean;
            isCorrect: boolean | null;
        }>
    >([]);

    const [idx, setIdx] = React.useState(0); // 0-based
    const [picked, setPicked] = React.useState<(OX | null)[]>([]);
    const pickedRef = React.useRef<(OX | null)[]>([]);
    const [submitting, setSubmitting] = React.useState(false);
    const startMsRef = React.useRef<number>(Date.now());

    React.useEffect(() => {
        pickedRef.current = picked;
    }, [picked]);

    React.useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);

            const stored = lsRead(sessionId);
            const baseItems: StartedItem[] = retryWrongOnly
                ? (stored?.items?.length ? stored.items : (items?.length ? items : []))
                : items;

            baseItemsRef.current = baseItems;

            const originProgress: (OX | null)[] | undefined = retryWrongOnly
                ? (initialProgress?.length ? initialProgress : stored?.initialProgress?.length ? stored.initialProgress : undefined)
                : undefined;

            originProgressRef.current = originProgress;

            if (!retryWrongOnly) {
                lsWrite(sessionId, { sessionId, items: baseItems, savedAt: Date.now() });
            }

            const corrects: OX[] = baseItems.map(deriveCorrectOX);

            for (let i = 0; i < baseItems.length; i++) {
                const it = baseItems[i];
                const qid = pickQuestionId(it);
                if (!Number.isFinite(qid)) continue;

                const opts = getOptions(it);
                if (!opts.length) continue;

                const oOpt = opts.find(o => isOText(norm(getOptText(o))));
                const xOpt = opts.find(o => isXText(norm(getOptText(o))));

                if (oOpt && xOpt) {
                    putChoice(qid, "O", getOptId(oOpt));
                    putChoice(qid, "X", getOptId(xOpt));
                    continue;
                }

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

                const c0 = getOptId(opts[0]);
                const c1 = getOptId(opts[1] ?? opts[0]);
                if (Number.isFinite(c0)) putChoice(qid, "O", c0);
                if (Number.isFinite(c1)) putChoice(qid, "X", c1);
            }

            const v = baseItems.map((it, i) => {
                const prev = originProgress?.[i] ?? null;
                const shouldLockAsCorrect = retryWrongOnly && prev === "O";

                return {
                    qid: pickQuestionId(it),
                    q: safeText(it.questionText),
                    correct: corrects[i] ?? "O",
                    explanation: safeTextOrNull(it.explanation),
                    checked: shouldLockAsCorrect ? true : false,
                    isCorrect: shouldLockAsCorrect ? true : null,
                };
            });

            if (!mounted) return;

            setView(v);
            setPicked(Array.from({ length: v.length }, () => null));

            if (retryWrongOnly) {
                const p = originProgressRef.current ?? [];
                const firstWrong = p.findIndex((v) => v === "X");
                setIdx(firstWrong >= 0 ? firstWrong : 0);
            } else {
                setIdx(0);
            }
            setLoading(false);
        })();

        return () => { mounted = false; };
    }, [sessionId, items, retryWrongOnly, initialProgress, putChoice]);

    const total = view.length;
    const cur = view[idx];

    const value = picked[idx] ?? null;
    const showResult = !!cur?.checked && value != null;

    const progress = React.useMemo<(OX | null)[]>(() => {
        return view.map((q) => (q.checked && q.isCorrect != null ? (q.isCorrect ? "O" : "X") : null));
    }, [view]);

    const trayProgress = React.useMemo<(OX | null)[]>(() => {
        if (!retryWrongOnly) return progress;
        const base = originProgressRef.current ?? [];
        return view.map((q, i) => {
            if (q.checked && q.isCorrect != null) return q.isCorrect ? "O" : "X";
            return base[i] ?? "X";
        });
    }, [retryWrongOnly, progress, view]);

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

    const LS_KEY_LAST_SESSION = "quiz:lastSessionId";
    const LS_KEY_PROGRESS = "quiz/initials-or-ox/progress";

    function buildSubmitAnswers() {
        const answers: Array<{ quizQuestionId: number; selectedChoiceId: number }> = [];

        const v = view ?? [];
        const selected = pickedRef.current ?? [];

        for (let i = 0; i < v.length; i++) {
            const q = v[i];
            const pick = selected[i];
            if (!q || pick == null) continue;

            const choiceId = getSelectedChoiceId(q.qid, pick);
            if (!Number.isFinite(choiceId)) continue;

            answers.push({
                quizQuestionId: Number(q.qid),
                selectedChoiceId: Number(choiceId),
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
            console.error("[daily ox submit] failed:", e?.response?.data ?? e);
            throw e;
        } finally {
            setSubmitting(false);
        }
    };

    const goNext = async () => {
        if (!view[idx]?.checked) return;

        if (!retryWrongOnly) {
            if (idx >= total - 1) {
                try { localStorage.setItem(LS_KEY_LAST_SESSION, String(sessionId)); } catch {}
                try { localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(progress)); } catch {}
                persistProgress(progress);
                onClose?.();
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

            setIdx(v => v + 1);
            return;
        }

        if (idx >= total - 1) {
            try { localStorage.setItem(LS_KEY_LAST_SESSION, String(sessionId)); } catch {}
            try { localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(trayProgress)); } catch {}
            persistProgress(trayProgress);
            onClose?.();
            try {
                await submitSession();
            } catch (e: any) {
                console.error("[daily ox retry submit] failed:", e?.response?.data ?? e);
            }
            onShowResult?.({ sessionId, progress: trayProgress });
            return;
        }

        const nextWrong = trayProgress.findIndex((v, i) => i > idx && v === "X");
        if (nextWrong >= 0) return setIdx(nextWrong);

        const firstWrong = trayProgress.findIndex((v) => v === "X");
        if (firstWrong >= 0 && firstWrong !== idx) return setIdx(firstWrong);

        persistProgress(trayProgress);
        onClose?.();
        onShowResult?.({ sessionId, progress: trayProgress });
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
                retryWrongOnly={retryWrongOnly}
                currentJudge={trayProgress[idx] ?? null}
                onChange={async (v: OX) => {
                    // 1) UI 즉시 반영
                    setPicked(prev => {
                        const next = [...prev];
                        next[idx] = v;
                        return next;
                    });

                    // 2) check 호출
                    const qid = cur.qid;
                    if (retryWrongOnly) {
                        const baseItem = baseItemsRef.current[idx];
                        if (!baseItem) {
                            alert("정답 정보를 찾을 수 없어 다시풀기를 진행할 수 없습니다. 오늘의 퀴즈를 새로 시작해주세요.");
                            return;
                        }
                        const serverCorrect = deriveCorrectOX(baseItem);
                        const isCorrect = v === serverCorrect;

                        setView(prev => {
                            const next = [...prev];
                            const at = next[idx];
                            if (!at) return prev;

                            next[idx] = {
                                ...at,
                                checked: true,
                                isCorrect,
                                correct: serverCorrect,
                                explanation: safeTextOrNull(baseItem?.explanation) ?? at.explanation,
                            };
                            return next;
                        });
                        return;
                    }

                    const selectedChoiceId = getSelectedChoiceId(qid, v);

                    if (!Number.isFinite(selectedChoiceId)) {
                        console.warn("[OX] selectedChoiceId missing", { qid, v });
                        return;
                    }

                    try {
                        const res = await checkDailyQuestion(sessionId, qid, { choiceId: selectedChoiceId! });

                        const nextItems = [...baseItemsRef.current];
                        if (nextItems[idx]) {
                            nextItems[idx] = {
                                ...nextItems[idx],
                                correctChoiceId:
                                    res?.correctChoiceId != null
                                        ? Number(res.correctChoiceId)
                                        : nextItems[idx]?.correctChoiceId,
                                explanation: safeTextOrNull(res?.explanation) ?? nextItems[idx]?.explanation ?? null,
                            };
                            baseItemsRef.current = nextItems;
                            persistItems(nextItems);
                        }

                        setView(prev => {
                            const next = [...prev];
                            const at = next[idx];
                            if (!at) return prev;

                            const m = choiceMapRef.current.get(qid) ?? {};
                            let serverCorrect = at.correct;

                            if (res?.correctChoiceId != null) {
                                const cid = Number(res.correctChoiceId);
                                if (Number.isFinite(cid)) {
                                    if (cid === Number(m.O)) serverCorrect = "O";
                                    else if (cid === Number(m.X)) serverCorrect = "X";
                                }
                            } else if (res?.correctText != null || res?.correct_text != null) {
                                serverCorrect = toOX(res?.correctText ?? res?.correct_text);
                            }

                            const isCorrect =
                                typeof res?.correct === "boolean"
                                    ? !!res.correct
                                    : v === serverCorrect;

                            next[idx] = {
                                ...at,
                                checked: true,
                                isCorrect,
                                correct: serverCorrect,
                                explanation: res?.explanation ?? at.explanation,
                            };
                            return next;
                        });
                    } catch (e) {
                        console.error("[OX] check failed", e);
                    }
                }}
                showResult={showResult}
                correct={cur.correct}
                explanation={cur.explanation}
                progress={trayProgress}
                onNext={goNext}
                onGoto={(n) => {
                    const next = Math.max(1, Math.min(total, n)) - 1;
                    setIdx(next);
                }}
            />
        </Stage>
    );
}
