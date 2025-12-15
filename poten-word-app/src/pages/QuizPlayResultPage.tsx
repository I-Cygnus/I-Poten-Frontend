import React from "react";
import styled from "styled-components";
import { NarrowLeft } from "../styles/layout";
import { useLocation, useNavigate } from "react-router-dom";
import SoftBlobsBackground from "../components/SoftBlobsBackground";
import http, { authHeader } from "../utils/http";

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
    em { font-style: normal; color: ${UI.danger}; font-weight: 750; }
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
    choices: { id: number; text: string; isAnswer?: boolean }[];
};

/* ====== 유틸 ====== */
const emphasizeNot = (text: string) =>
    text.replace(/(않는|아닌|NOT)/gi, (m) => `<em>${m}</em>`);

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

    // QuizPlayPage에서 넘겨준 state 기대: { sessionId, title, summary, items, answers }
    const st = (loc.state as any) ?? {};
    const title: string = st.title ?? "포텐퀴즈";
    const sessionId: number | undefined = st.sessionId;
    const items: SessionItem[] = st.items ?? [];
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
                const reviewData = res?.data?.details ?? res?.data ?? [];
                setReviewDetails(reviewData);
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

    // answers fallback (선택한 보기)
    const fallbackPickedMap = new Map<string, string>(
        (answers ?? []).map((a: any) => [
            String(a.quizQuestionId ?? a.questionId ?? a.qid ?? a.id),
            String(a.selectedChoiceId ?? a.choiceId ?? a.cid ?? a.value),
        ])
    );

    const prefix = loc.pathname.startsWith("/poten-word/") ? "/poten-word" : "";

    const handleClose = () => nav(`${prefix}/poten-quiz`, { replace: true });

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

            // 재도전은 같은 플레이 경로(목록 화면)로 돌려보내고 state로 sessionId 전달하거나
            // 네비게이션 단에서 sessionId 쿼리/상태 처리하도록 사용 중인 UX에 맞춰 수정 가능
            nav(`${prefix}/poten-quiz`, {
                state: { sessionId: newSessionId, title, source: "retry" },
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
