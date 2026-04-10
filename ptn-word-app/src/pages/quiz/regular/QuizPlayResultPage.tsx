import React from "react";
import styled from "styled-components";
import { NarrowLeft } from "../../../styles/layout.ts";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SoftBlobsBackground from "../../../components/quiz/SoftBlobsBackground.tsx";
import http, { authHeader } from "../../../utils/http.ts";

/* ====== 색/토큰 ====== */
const UI = {
    bgGrad:
        "radial-gradient(1200px 600px at 50% -120px, rgba(79,118,241,.15) 0%, rgba(62,99,224,.10) 30%, rgba(255,255,255,0) 70%)",
    panel: "#ffffff",
    line: "#e5e7eb",
    text: "#0f172a",
    sub: "#374151",
    muted: "#6b7280",
    primary: "#3E63E0",
    primarySoft: "#e6edff",

    // 정답/오답 요청 색상
    danger: "#F95D5D",      // 테두리
    success: "#28C8A3",     // 테두리
    successSoft: "#e9fcf8", // 내부
    dangerSoft: "#fee6e6",  // 내부

    shadow: "0 20px 60px rgba(62,99,224,.15)",
    radius: 20,
    gradient: {
        brand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
        brandSoft:
            "linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%)",
    },
};

/* ====== 레이아웃/스타일 ====== */
const Screen = styled.div`
    min-height: 60vh;
    padding: 26px 0 46px;
`;
const Card = styled.div`
    background: ${UI.panel};
    border: 1px solid ${UI.line};
    border-radius: 24px;
    box-shadow: ${UI.shadow};
    padding: clamp(20px, 4vw, 36px);
`;
const ResultList = styled.ol`
    list-style: none;
    padding-left: 0;
    margin: 0;
`;
const Footer = styled.div`
    margin-top: 26px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;
const Ghost = styled.button`
    height: 35px; padding: 0 16px; border-radius: 5px; font-weight: 700;
    background: #fff; color: ${UI.primary}; border: 1px solid ${UI.primary};
    cursor: pointer; transition: background-color .15s, color .15s, border-color .15s, transform .08s;
    &:hover { background: ${UI.primarySoft}; }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(62,99,224,.25); }
    &:disabled { opacity: .6; cursor: not-allowed; }
`;
const Primary = styled.button`
    height: 35px; padding: 0 18px; border-radius: 5px; font-weight: 700; letter-spacing: -0.02em;
    background: ${UI.primary}; border: 1px solid ${UI.primary}; color: #fff; cursor: pointer;
    transition: filter .15s, transform .08s;
    &:hover { filter: brightness(0.96); }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
    &:disabled { opacity: .7; cursor: not-allowed; }
`;

/* 문제 타이틀/옵션 (초안 그대로) */
const QTitle = styled.h2`
    margin: 0;
    font-size: clamp(17px, 2.2vw, 20px);
    font-weight: 750;
    color: ${UI.text};
    letter-spacing: -0.02em;
    line-height: 1.45;
    text-align: left;

    em {
        font-style: normal;
        color: ${UI.danger};
        font-weight: 750;
        text-decoration: underline;
        text-decoration-color: ${UI.danger};
        text-underline-offset: 3px;     /* 밑줄과 글자 간격 */
        text-decoration-thickness: 2px; /* 밑줄 두께 */
    }
`;
const QLine = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    gap: 8px;
    margin: 12px 0 14px;
`;
const QNumText = styled.span`
    font-size: clamp(17px, 2.2vw, 20px);
    font-weight: 750;
    color: ${UI.text};
    line-height: 1.45;
    letter-spacing: -0.02em;
`;
const Options = styled.div`
    display: grid;
    gap: 12px;
`;
const Opt = styled.div<{ $tone?: "normal" | "ok" | "bad" }>`
    width: 100%;
    display: flex; align-items: center; gap: 14px;
    border: 1px solid ${UI.line}; background: #fff;
    padding: 14px; border-radius: 14px; text-align: left;
    ${({ $tone }) => $tone === "ok" && `border-color:${UI.success}; background:${UI.successSoft};`}
    ${({ $tone }) => $tone === "bad" && `border-color:${UI.danger}; background:${UI.dangerSoft};`}
`;
const Bullet = styled.span<{ $tone?: "normal" | "ok" | "bad" }>`
    width: 28px; height: 28px; flex: 0 0 auto;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 999px; color: #0f172a;
    background: ${UI.gradient.brandSoft};
    ${({ $tone }) => $tone === "ok" && `background:${UI.success}; color:#fff;`}
    ${({ $tone }) => $tone === "bad" && `background:${UI.danger}; color:#fff;`}
    box-shadow: inset 0 1px 0 rgba(255,255,255,.28);
`;
const Hollow = styled.span`
    width: 14px; height: 14px; border-radius: 999px;
    border: 2px solid ${UI.primary}; background: rgba(255,255,255,.7); display: block;
`;
const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
        <path d="M20 7L10 17l-6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);
const CrossS = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);
const OptLabel = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${UI.text};
`;
const Badge = styled.span<{ $tone: "ok" | "bad" }>`
    margin-left: auto; padding: 2px 8px; border-radius: 999px;
    font-size: 12px; font-weight: 750;
    border: 1px solid ${({ $tone }) => ($tone === "ok" ? UI.success : UI.danger)};
    background: ${({ $tone }) => ($tone === "ok" ? UI.successSoft : UI.dangerSoft)};
    color: ${({ $tone }) => ($tone === "ok" ? UI.success : UI.danger)};
`;

/* ====== 타입 ====== */
type SessionItem = {
    questionId: number;
    questionText: string;
    explanation?: string | null;
    choices: { id: number; text: string; isAnswer?: boolean | null }[];
};

/* ====== 유틸 ====== */
function emphasizeNot(text: string) {
    return text.replace(/(않는|아닌)/g, (m) => `<em>${m}</em>`);
}

const idKey = (v: any): string | null => {
    if (v == null || v === "") return null;
    if (Array.isArray(v)) return idKey(v[0]);
    if (typeof v === "object") {
        return idKey(
            v.id ?? v.choiceId ?? v.value ?? v.answerId ?? v.choice?.id ?? v.solutionId ?? v.solution?.id
        );
    }
    const s = String(v);
    return s.length ? s : null;
};
const pickKey = (...cands: any[]) => {
    for (const c of cands) {
        const k = idKey(c);
        if (k != null) return k;
    }
    return null;
};

/* ====== 결과 페이지 (Play 전용) ====== */
export default function QuizPlayResultPage() {
    const nav = useNavigate();
    const loc = useLocation();
    const { sessionId: sessionIdParam } = useParams();

    const st = (loc.state as any) ?? {};
    type NavState = { from?: string };
    const from = (loc.state as NavState | null)?.from;

    const sessionId: number | undefined = (() => {
        const fromState = st.sessionId;
        const fromParam = sessionIdParam;
        const fromQs = new URLSearchParams(loc.search).get("sessionId");
        const cand = [fromState, fromParam, fromQs].find(
            (v) => v != null && String(v).trim() !== ""
        );
        const n = Number(cand);
        return Number.isFinite(n) ? n : undefined;
    })();

    const [serverItems, setServerItems] = React.useState<SessionItem[] | null>(null);
    const [serverTitle, setServerTitle] = React.useState<string | null>(null);

    const title: string = st.title ?? serverTitle ?? "포텐퀴즈";
    const items: SessionItem[] =
        (Array.isArray(st.items) && st.items.length > 0)
            ? st.items
            : (serverItems ?? []);

    const answers: any[] = st.answers ?? [];
    const [summary, setSummary] = React.useState<any>(st.summary ?? null);
    const [reviewDetails, setReviewDetails] = React.useState<any[] | null>(null);
    const [retrying, setRetrying] = React.useState(false);

    React.useEffect(() => {
        if (summary || !sessionId) return;
        (async () => {
            try {
                const res = await http.get(`/me/quiz/sessions/${sessionId}`, {
                    headers: { ...authHeader() }, withCredentials: true,
                });
                setSummary(res?.data ?? res);
            } catch {
                // noop
            }
        })();
    }, [summary, sessionId]);

    const ms = Number(summary?.elapsedMs ?? 0);

    // summary.details가 부족하면 review API 보완
    React.useEffect(() => {
        const details = summary?.details;
        const hasEnough =
            Array.isArray(details) &&
            details.some(
                (d: any) =>
                    d.correctChoiceId ||
                    d.answerChoiceId ||
                    typeof d.correct === "boolean"
            );
        if (hasEnough || !sessionId) return;

        (async () => {
            try {
                const res = await http.get(`/me/quiz/sessions/${sessionId}/review`, {
                    headers: { ...authHeader() }, withCredentials: true,
                });
                const reviewItems = res?.data?.items ?? res?.data?.details ?? [];
                setReviewDetails(reviewItems);
            } catch {
                // 리뷰 없으면 기존 데이터로만 렌더
            }
        })();
    }, [sessionId, summary?.details]);

    const effectiveDetails =
        (Array.isArray(summary?.details) && summary.details.length > 0)
            ? summary.details
            : (Array.isArray(reviewDetails) ? reviewDetails : []);

    const detailsArray: any[] = Array.isArray(effectiveDetails) ? effectiveDetails : [];
    const detailMap = new Map<string, any>(
        detailsArray.map((d: any) => [
            String(d.quizQuestionId ?? d.questionId ?? d.qid ?? d.id),
            d,
        ])
    );

    function normalizeItems(payload: any): SessionItem[] {
        const pickArr = (...xs: any[]) => xs.find(Array.isArray) as any[] | undefined;

        const raw =
            pickArr(
                payload?.items,
                payload?.questions,
                payload?.quizQuestions,
                payload?.sessionItems,
                payload?.data?.items,
                payload?.data?.questions,
                payload?.data?.quizQuestions
            ) ?? [];

        const out: SessionItem[] = [];

        for (const x of raw) {
            const q = x?.question ?? x?.quizQuestion ?? x;

            const qid = Number(q?.questionId ?? q?.quizQuestionId ?? q?.id ?? x?.questionId ?? x?.quizQuestionId ?? x?.id);
            if (!Number.isFinite(qid)) continue;

            const qtext =
                String(
                    q?.questionText ??
                    q?.text ??
                    q?.title ??
                    x?.questionText ??
                    x?.text ??
                    ""
                ) || "(문항 텍스트 없음)";

            const qExpl = q?.explanation ?? q?.questionExplanation ?? x?.explanation ?? null;

            const choicesRaw =
                (Array.isArray(q?.choices) && q.choices) ||
                (Array.isArray(q?.options) && q.options) ||
                (Array.isArray(q?.quizChoices) && q.quizChoices) ||
                (Array.isArray(x?.choices) && x.choices) ||
                [];

            const choices = (choicesRaw ?? [])
                .map((c: any) => {
                    const rawIsAnswer = c?.isAnswer ?? c?.answer ?? c?.correct;
                    const isAnswer =
                        rawIsAnswer === null || rawIsAnswer === undefined ? null : Boolean(rawIsAnswer);

                    return {
                        id: Number(c?.id ?? c?.choiceId ?? c?.quizChoiceId ?? c?.cid ?? c?.value),
                        text: String(c?.text ?? c?.choiceText ?? c?.label ?? c?.content ?? ""),
                        isAnswer,
                    };
                })
                .filter((c: any) => Number.isFinite(c.id) && c.text);

            out.push({ questionId: qid, questionText: qtext, explanation: qExpl, choices });
        }

        return out;
    }

    React.useEffect(() => {
        let cancel = false;
        if (!sessionId) return;

        // state로 받은 items가 이미 있으면 굳이 안 불러도 됨
        if (Array.isArray(st.items) && st.items.length > 0) return;

        (async () => {
            try {
                // 1) 세션 상세(가능하면 questions+choices 포함)
                const a = await http.get(`/me/quiz/sessions/${sessionId}`, {
                    headers: { ...authHeader() },
                    withCredentials: true,
                });
                const dataA = (a as any)?.data ?? a;

                // 2) 리뷰 상세(혹시 여기에 문항/보기 들어오는 서버도 있어서 같이 시도)
                let dataB: any = null;
                try {
                    const b = await http.get(`/me/quiz/sessions/${sessionId}/review`, {
                        headers: { ...authHeader() },
                        withCredentials: true,
                    });
                    dataB = (b as any)?.data ?? b;
                } catch {
                    // review 없으면 그냥 넘어감
                }

                if (cancel) return;

                const t =
                    dataA?.title ?? dataA?.setTitle ?? dataA?.quizSetTitle ??
                    dataB?.title ?? dataB?.setTitle ?? dataB?.quizSetTitle;

                if (t) setServerTitle(String(t));

                const itemsA = normalizeItems(dataA);
                const itemsB = normalizeItems(dataB);

                const merged = (itemsA.length ? itemsA : itemsB);
                if (merged.length) setServerItems(merged);
            } catch {
                // noop
            }
        })();

        return () => { cancel = true; };
    }, [sessionId]);


    // answers fallback (선택한 보기)
    const fallbackPickedMap = new Map<string, string>(
        (answers ?? []).map((a: any) => [
            String(a.quizQuestionId ?? a.questionId ?? a.qid ?? a.id),
            String(a.selectedChoiceId ?? a.choiceId ?? a.cid ?? a.value),
        ])
    );

    const prefix = loc.pathname.startsWith("/learning/") ? "/learning" : "";
    const quizHome = `${prefix}/quiz`;
    const quizPlay = `${quizHome}/play`;

    const handleClose = () => {
        if (from) return nav(from, { replace: true });

        const idx = (window.history.state?.idx ?? 0) as number;
        if (idx > 0) return nav(-1);

        return nav(quizHome, { replace: true });
    };

    const handleRetryWrong = async () => {
        if (!sessionId || retrying) return;
        setRetrying(true);
        try {
            const res = await http.post(
                `/me/quiz/sessions/${sessionId}/retry-wrong`,
                {},
                { headers: { ...authHeader() }, withCredentials: true }
            );
            const data = (res && (res as any).data) ? (res as any).data : res;
            const newSessionId = Number(
                data?.newSessionId ?? data?.sessionId ?? data?.id ?? data?.session?.id
            );
            if (!Number.isFinite(newSessionId)) throw new Error("세션 생성 실패");

            nav(quizPlay, {
                state: {
                    sessionId: newSessionId,
                    startPayload: payload,
                    source: "retry-wrong",
                },
                replace: true,
            });
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "오답 세션 생성 중 오류";
            alert(msg);
        } finally {
            setRetrying(false);
        }
    };

    return (
        <>
            <SoftBlobsBackground />
            <Screen>
                <NarrowLeft>
                    <Card>
                        {!summary ? (
                            <p style={{ padding: 24 }}>결과를 불러오는 중…</p>
                        ) : (
                            <>
                                <h1 style={{ margin: 0 }}>{title}</h1>
                                <p style={{ color: "#374151" }}>
                                    <strong>{summary.correct}</strong> / {summary.total} 정답 · {(ms / 1000).toFixed(1)}초
                                </p>

                                <ResultList>
                                    {(items ?? []).map((q: SessionItem, idx: number) => {
                                        const d = detailMap.get(String(q.questionId));

                                        // 내가 고른 보기
                                        const pickedKey =
                                            pickKey(d?.choiceId, d?.selectedChoiceId, d?.quizChoiceId, d?.selectedId, d?.selected)
                                            ?? fallbackPickedMap.get(String(q.questionId))
                                            ?? null;

                                        // 정답 키: details → items.isAnswer → (맞은 문제면) pickedKey
                                        let correctKey =
                                            pickKey(
                                                d?.correctChoiceId,
                                                d?.answerChoiceId,
                                                d?.answerId,
                                                d?.correctId,
                                                d?.correctChoice?.id,
                                                d?.answer?.id,
                                                d?.solutionChoiceId,
                                                d?.solution?.id,
                                                d?.correctChoiceIds,
                                                d?.answerChoiceIds
                                            ) ?? null;

                                        if (!correctKey) {
                                            const ans = (q.choices ?? []).find((c) => c.isAnswer === true);
                                            if (ans) correctKey = idKey(ans.id);
                                        }
                                        if (!correctKey && typeof d?.correct === "boolean" && d.correct && pickedKey) {
                                            correctKey = pickedKey;
                                        }

                                        // 오답 여부
                                        const isWrongQuestion =
                                            pickedKey != null && correctKey != null && pickedKey !== correctKey;

                                        return (
                                            <li key={String(q.questionId)} style={{ margin: "14px 0" }}>
                                                <QLine>
                                                    <QNumText>{idx + 1}번.</QNumText>
                                                    <QTitle dangerouslySetInnerHTML={{ __html: emphasizeNot(q.questionText) }} />
                                                </QLine>

                                                <Options>
                                                    {q.choices.map((c) => {
                                                        const cid = idKey(c.id);
                                                        const isPicked = !!cid && !!pickedKey && cid === pickedKey;
                                                        const isCorrectChoice =
                                                            (!!cid && !!correctKey && cid === correctKey) ||
                                                            (!correctKey && c.isAnswer === true);

                                                        // 톤: 내가 고른 오답(빨강) > 정답(초록) > 일반
                                                        let tone: "normal" | "ok" | "bad" = "normal";
                                                        if (isPicked && isWrongQuestion) tone = "bad";
                                                        else if (isCorrectChoice) tone = "ok";

                                                        return (
                                                            <Opt key={String(c.id)} $tone={tone}>
                                                                <Bullet aria-hidden $tone={tone}>
                                                                    {tone === "ok" ? <CheckIcon /> : tone === "bad" ? <CrossS /> : <Hollow />}
                                                                </Bullet>
                                                                <OptLabel>{c.text}</OptLabel>

                                                                {isCorrectChoice && <Badge $tone="ok">정답</Badge>}
                                                                {isPicked && isWrongQuestion && <Badge $tone="bad">내 답</Badge>}
                                                            </Opt>
                                                        );
                                                    })}
                                                </Options>
                                                {q.explanation && (
                                                    <div style={{
                                                        marginTop: 12,
                                                        padding: 14,
                                                        border: `1px solid ${UI.line}`,
                                                        borderRadius: 14,
                                                        background: "#fff"
                                                    }}>
                                                        <div style={{ fontWeight: 800, marginBottom: 6, color: UI.text }}>해설</div>
                                                        <div style={{ lineHeight: 1.6, color: UI.sub }}>{q.explanation}</div>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ResultList>

                                <Footer>
                                    <Ghost type="button" onClick={handleClose}>닫기</Ghost>
                                    {Number.isFinite(Number(summary.total)) &&
                                        Number(summary.total) - Number(summary.correct) > 0 &&
                                        !!sessionId && (
                                            <Primary type="button" onClick={handleRetryWrong} disabled={retrying}>
                                                {retrying ? "다시 시작 중..." : "틀린 문제 다시 풀기"}
                                            </Primary>
                                        )}
                                </Footer>
                            </>
                        )}
                    </Card>
                </NarrowLeft>
            </Screen>
        </>
    );
}
