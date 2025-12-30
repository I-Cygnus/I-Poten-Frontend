import React from "react";
import styled from "styled-components";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { NarrowLeft } from "../../../styles/layout.ts";
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

    danger: "#F95D5D",
    success: "#28C8A3",
    successSoft: "#e9fcf8",
    dangerSoft: "#fee6e6",

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
const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;
const Title = styled.h1`
  margin: 0;
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 750;
  color: ${UI.text};
  letter-spacing: -0.03em;
`;
const Meta = styled.div`
  color: ${UI.sub};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;
const Pill = styled.span<{ $tone?: "normal" | "ok" | "bad" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${UI.line};
  background: #fff;
  font-size: 13px;
  font-weight: 800;

  ${({ $tone }) => $tone === "ok" && `border-color:${UI.success}; background:${UI.successSoft}; color:${UI.success};`}
  ${({ $tone }) => $tone === "bad" && `border-color:${UI.danger}; background:${UI.dangerSoft}; color:${UI.danger};`}
`;

const ResultList = styled.ol`
  list-style: none;
  padding-left: 0;
  margin: 0;
  display: grid;
  gap: 14px;
`;

const ItemCard = styled.li`
  border: 1px solid ${UI.line};
  border-radius: 18px;
  background: #fff;
  padding: 16px;
`;

const QLine = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 10px;
  margin-bottom: 12px;
`;
const QNumText = styled.span`
  font-size: 16px;
  font-weight: 750;
  color: ${UI.text};
  line-height: 1.45;
  letter-spacing: -0.02em;
`;
const QTitle = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: ${UI.text};
  letter-spacing: -0.02em;
  line-height: 1.55;

  em {
    font-style: normal;
    color: ${UI.danger};
    font-weight: 750;
    text-decoration: underline;
    text-decoration-color: ${UI.danger};
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
`;

const Options = styled.div`
  display: grid;
  gap: 12px;
`;

const Opt = styled.div<{ $tone?: "normal" | "ok" | "bad" }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid ${UI.line};
  background: #fff;
  padding: 14px;
  border-radius: 14px;
  text-align: left;

  ${({ $tone }) => $tone === "ok" && `border-color:${UI.success}; background:${UI.successSoft};`}
  ${({ $tone }) => $tone === "bad" && `border-color:${UI.danger}; background:${UI.dangerSoft};`}
`;

const Bullet = styled.span<{ $tone?: "normal" | "ok" | "bad" }>`
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #0f172a;
  background: ${UI.gradient.brandSoft};
  ${({ $tone }) => $tone === "ok" && `background:${UI.success}; color:#fff;`}
  ${({ $tone }) => $tone === "bad" && `background:${UI.danger}; color:#fff;`}
  box-shadow: inset 0 1px 0 rgba(255,255,255,.28);
`;

const Hollow = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid ${UI.primary};
  background: rgba(255,255,255,.7);
  display: block;
`;

const OptLabel = styled.div`
  font-size: 15px;
  font-weight: 750;
  color: ${UI.text};
`;

const Badge = styled.span<{ $tone: "ok" | "bad" | "mine" }>`
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid
    ${({ $tone }) =>
    $tone === "ok" ? UI.success : $tone === "bad" ? UI.danger : UI.primary};
  background:
    ${({ $tone }) =>
    $tone === "ok" ? UI.successSoft : $tone === "bad" ? UI.dangerSoft : UI.primarySoft};
  color:
    ${({ $tone }) =>
    $tone === "ok" ? UI.success : $tone === "bad" ? UI.danger : UI.primary};
`;

const ExplainBox = styled.div`
  margin-top: 12px;
  padding: 14px;
  border: 1px solid ${UI.line};
  border-radius: 14px;
  background: #F9F9F9;
`;
const ExplainTitle = styled.div`
  font-weight: 700;
  margin-bottom: 6px;
  color: ${UI.text};
  letter-spacing: -0.02em;
`;
const ExplainText = styled.div`
  line-height: 1.65;
  color: ${UI.sub};
  white-space: pre-wrap;
  letter-spacing: -0.02em;
`;

const Footer = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

const Ghost = styled.button`
  height: 35px;
  padding: 0 16px;
  border-radius: 5px;
  font-weight: 800;
  background: #fff;
  color: ${UI.primary};
  border: 1px solid ${UI.primary};
  cursor: pointer;
  transition: background-color 0.15s, transform 0.08s;

  &:hover {
    background: ${UI.primarySoft};
  }
  &:active {
    transform: translateY(1px);
  }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.25);
  }
`;

const IconButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid ${UI.line};
  background: #fff;
  color: ${UI.sub};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  transition: background-color 0.15s, transform 0.08s, border-color 0.15s;

  &:hover {
    background: ${UI.primarySoft};
    border-color: ${UI.primarySoft};
    color: ${UI.primary};
  }
  &:active {
    transform: translateY(1px);
  }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.25);
  }
`;

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
        <path
            d="M20 7L10 17l-6-6"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);
const CrossS = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

/* ====== 타입 ====== */
type QuestionType = "CHOICE" | "OX" | "INITIALS";

type ReviewChoice = { id: number; text: string; answer?: boolean | null };
type ReviewItem = {
    quizQuestionId: number;
    questionType: QuestionType;
    questionText: string;
    myChoiceId?: number | null;
    mySubmittedText?: string | null;
    expectedText?: string | null;
    correct?: boolean | null;
    answerChoiceId?: number | null;
    explanation?: string | null;
    choices?: ReviewChoice[];
};

type ReviewResponse = {
    sessionId: number;
    status: "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";
    total: number;
    correct: number;
    items: ReviewItem[];
};

/* ====== 유틸 ====== */
function emphasizeNot(text: string) {
    return text.replace(/(않는)(?!\s*다)|(아닌)/g, (m) => `<em>${m}</em>`);
}
function normalizeAnswerText(s?: string | null) {
    const t = (s ?? "").trim();
    return t.length ? t : "미입력";
}

function sortOxChoices(choices: ReviewChoice[]) {
    return [...choices].sort((a, b) => {
        const ta = (a.text ?? "").trim().toUpperCase();
        const tb = (b.text ?? "").trim().toUpperCase();
        const ra = ta === "O" ? 0 : ta === "X" ? 1 : 2;
        const rb = tb === "O" ? 0 : tb === "X" ? 1 : 2;
        if (ra !== rb) return ra - rb;
        return a.id - b.id;
    });
}

export default function QuizReviewPage() {
    const nav = useNavigate();
    const location = useLocation();
    const { sessionId } = useParams();

    const [data, setData] = React.useState<ReviewResponse | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [retrying, setRetrying] = React.useState(false);

    React.useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                setLoading(true);
                if (!sessionId) return;

                const res = await http.get(`/me/quiz/sessions/${sessionId}/review`, {
                    headers: { ...authHeader() },
                    withCredentials: true,
                });

                if (!cancel) setData(res.data);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();

        return () => {
            cancel = true;
        };
    }, [sessionId]);

    const prefix = window.location.pathname.startsWith("/poten-word/") ? "/poten-word" : "";
    const quizHome = `${prefix}/quiz`;
    const quizPlay = `${quizHome}/play`;

    // "이전 페이지"로 닫기 (없으면 quizHome)
    type NavState = { from?: string };
    const from = (location.state as NavState | null)?.from;

    const handleClose = React.useCallback(() => {
        // 다른 페이지에서 state로 from을 넘겨준 경우(가장 확실)
        if (from) {
            nav(from, { replace: true });
            return;
        }

        // 히스토리 스택에 이전이 있으면 뒤로
        const idx = (window.history.state?.idx ?? 0) as number;
        if (idx > 0) {
            nav(-1);
            return;
        }

        // 직접 진입 등 뒤로갈 곳이 없으면 홈으로
        nav(quizHome, { replace: true });
    }, [nav, from, quizHome]);

    const handleRetryWrong = async () => {
        if (!sessionId || retrying) return;
        setRetrying(true);
        try {
            const res = await http.post(
                `/me/quiz/sessions/${sessionId}/retry-wrong`,
                {},
                { headers: { ...authHeader() }, withCredentials: true }
            );
            const payload = (res && (res as any).data) ? (res as any).data : res;

            const newSessionId = Number(
                payload?.newSessionId ?? payload?.sessionId ?? payload?.id ?? payload?.session?.id
            );
            if (!Number.isFinite(newSessionId)) throw new Error("세션 생성 실패");

            nav(quizPlay, {
                state: { sessionId: newSessionId, source: "retry-wrong" },
                replace: true,
            });
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "오답 세션 생성 중 오류";
            alert(msg);
        } finally {
            setRetrying(false);
        }
    };

    if (loading) {
        return (
            <>
                <SoftBlobsBackground />
                <Screen>
                    <NarrowLeft>
                        <Card>
                            <div style={{ padding: 24, color: UI.sub, fontWeight: 800 }}>불러오는 중…</div>
                        </Card>
                    </NarrowLeft>
                </Screen>
            </>
        );
    }

    if (!data) {
        return (
            <>
                <SoftBlobsBackground />
                <Screen>
                    <NarrowLeft>
                        <Card>
                            <div style={{ padding: 24, color: UI.sub, fontWeight: 800 }}>
                                결과를 찾을 수 없어요.
                            </div>
                            <Footer>
                                <IconButton type="button" onClick={handleClose} aria-label="닫기" title="닫기">
                                    <XIcon />
                                </IconButton>
                            </Footer>
                        </Card>
                    </NarrowLeft>
                </Screen>
            </>
        );
    }

    const effectiveStatus = data.status ?? (
        Number.isFinite(data.total) && data.total > 0 && Array.isArray(data.items)
            ? "SUBMITTED"
            : "IN_PROGRESS"
    );

    if (effectiveStatus !== "SUBMITTED") {
        return (
            <>
                <SoftBlobsBackground />
                <Screen>
                    <NarrowLeft>
                        <Card>
                            <Title>결과 보기</Title>
                            <div style={{ marginTop: 10, color: UI.sub, fontWeight: 800 }}>
                                제출 완료된 세션만 리뷰할 수 있어요.
                            </div>
                            <Footer>
                                <Ghost onClick={handleClose}>닫기</Ghost>
                            </Footer>
                        </Card>
                    </NarrowLeft>
                </Screen>
            </>
        );
    }

    const total = Number(data.total ?? 0);
    const correct = Number(data.correct ?? 0);
    const wrong = Math.max(0, total - correct);
    const scorePercent = total > 0 ? Math.round((correct * 100) / total) : 0;

    return (
        <>
            <SoftBlobsBackground />
            <Screen>
                <NarrowLeft>
                    <Card>
                        <Header>
                            <div>
                                <Title>결과 보기</Title>
                                <Meta style={{ marginTop: 8 }}>
                                    <Pill $tone="ok">정답 {correct}</Pill>
                                    <Pill $tone="bad">오답 {wrong}</Pill>
                                    <Pill>총 {total}문항</Pill>
                                    <Pill>{scorePercent}%</Pill>
                                </Meta>
                            </div>

                            <IconButton type="button" onClick={handleClose} aria-label="닫기" title="닫기">
                                <XIcon />
                            </IconButton>
                        </Header>

                        <ResultList>
                            {data.items.map((it, idx) => {
                                const isInitials = it.questionType === "INITIALS";
                                const isChoice = it.questionType === "CHOICE" || it.questionType === "OX";

                                const myCorrect = typeof it.correct === "boolean"
                                    ? it.correct
                                    : (() => {
                                        if (isInitials) {
                                            // 서버가 correct 내려주면 그걸 쓰고, 아니면 텍스트 비교까지는 안 함(오탐 방지)
                                            return null;
                                        }
                                        if (it.myChoiceId == null || it.answerChoiceId == null) return null;
                                        return it.myChoiceId === it.answerChoiceId;
                                    })();

                                const myBadgeTone: "ok" | "bad" | "mine" =
                                    myCorrect === true ? "ok" : myCorrect === false ? "bad" : "mine";

                                // 보기 정렬(OX는 O/X 순)
                                const baseChoices = Array.isArray(it.choices) ? it.choices : [];
                                const choices = it.questionType === "OX" ? sortOxChoices(baseChoices) : baseChoices;

                                return (
                                    <ItemCard key={it.quizQuestionId}>
                                        <QLine>
                                            <QNumText>{idx + 1}번.</QNumText>
                                            <QTitle
                                                dangerouslySetInnerHTML={{
                                                    __html: emphasizeNot(it.questionText ?? it.questionText ?? ""),
                                                }}
                                            />
                                        </QLine>

                                        {isInitials ? (
                                            <>
                                                <Options>
                                                    {/* 정답이면: "내 답" 한 줄만 + 오른쪽은 정답 칩만 */}
                                                    {myCorrect === true ? (
                                                        <Opt $tone="ok">
                                                            <Bullet $tone="ok">
                                                                <CheckIcon />
                                                            </Bullet>

                                                            <OptLabel>내 답: {normalizeAnswerText(it.mySubmittedText)}</OptLabel>

                                                            {/* 오른쪽엔 정답 칩만 */}
                                                            <Badge $tone="ok">정답</Badge>
                                                        </Opt>
                                                    ) : (
                                                        <>
                                                            {/* 오답이면: 기존처럼 내 답 + 정답 둘 다 */}
                                                            <Opt $tone={myCorrect === false ? "bad" : "normal"}>
                                                                <Bullet $tone={myCorrect === false ? "bad" : "normal"}>
                                                                    {myCorrect === false ? <CrossS /> : <Hollow />}
                                                                </Bullet>
                                                                <OptLabel>내 답: {normalizeAnswerText(it.mySubmittedText)}</OptLabel>
                                                                <Badge $tone={myBadgeTone}>내 답</Badge>
                                                            </Opt>

                                                            <Opt $tone="ok">
                                                                <Bullet $tone="ok">
                                                                    <CheckIcon />
                                                                </Bullet>
                                                                <OptLabel>정답: {normalizeAnswerText(it.expectedText)}</OptLabel>
                                                                <Badge $tone="ok">정답</Badge>
                                                            </Opt>
                                                        </>
                                                    )}
                                                </Options>

                                                {it.explanation && (
                                                    <ExplainBox>
                                                        <ExplainTitle>해설</ExplainTitle>
                                                        <ExplainText>{it.explanation}</ExplainText>
                                                    </ExplainBox>
                                                )}
                                            </>
                                        ) : isChoice ? (
                                            <>
                                                <Options>
                                                    {choices.map((c) => {
                                                        const picked = it.myChoiceId != null && c.id === it.myChoiceId;
                                                        const correctChoice = it.answerChoiceId != null && c.id === it.answerChoiceId;

                                                        // 톤: 내가 고른 오답(빨강) > 정답(초록) > 일반
                                                        let tone: "normal" | "ok" | "bad" = "normal";
                                                        if (picked && !correctChoice) tone = "bad";
                                                        else if (correctChoice) tone = "ok";

                                                        return (
                                                            <Opt key={c.id} $tone={tone}>
                                                                <Bullet aria-hidden $tone={tone}>
                                                                    {tone === "ok" ? <CheckIcon /> : tone === "bad" ? <CrossS /> : <Hollow />}
                                                                </Bullet>
                                                                <OptLabel>{c.text}</OptLabel>

                                                                {correctChoice && <Badge $tone="ok">정답</Badge>}
                                                                {picked && !correctChoice && <Badge $tone="bad">내 답</Badge>}
                                                            </Opt>
                                                        );
                                                    })}
                                                </Options>

                                                {it.explanation && (
                                                    <ExplainBox>
                                                        <ExplainTitle>해설</ExplainTitle>
                                                        <ExplainText>{it.explanation}</ExplainText>
                                                    </ExplainBox>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{ color: UI.sub, fontWeight: 800 }}>
                                                지원되지 않는 문항 타입입니다.
                                            </div>
                                        )}
                                    </ItemCard>
                                );
                            })}
                        </ResultList>

                        <Footer>
                            <Ghost onClick={handleClose}>닫기</Ghost>

                            {wrong > 0 && !!sessionId && (
                                <Primary type="button" onClick={handleRetryWrong} disabled={retrying}>
                                    {retrying ? "다시 시작 중..." : "틀린 문제 다시 풀기"}
                                </Primary>
                            )}
                        </Footer>

                    </Card>
                </NarrowLeft>
            </Screen>
        </>
    );
}
