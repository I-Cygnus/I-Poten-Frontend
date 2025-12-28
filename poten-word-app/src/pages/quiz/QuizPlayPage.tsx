import React, {useMemo} from "react";
import styled from "styled-components";
import { NarrowLeft } from "../../styles/layout.ts";
import { useLocation, useNavigate } from "react-router-dom";
import SoftBlobsBackground from "../../components/quiz/SoftBlobsBackground.tsx";
import http, { authHeader } from "../../utils/http.ts";

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

const MetaRow = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    background: ${UI.primarySoft};
    color: ${UI.primary};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: -0.02em;
`;

const CONTENT_MEASURE = "100%";
const GRID_MEASURE    = "100%";

/* 문제 제목(풀이/결과 공통) */
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

const DescBox = styled.div`
    grid-column: 1 / -1;
    margin: 4px 0 2px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #f4f8ff;
    color: ${UI.sub};
    font-weight: 650;
    white-space: pre-wrap;
`;

/* 번호 + 제목 행 (풀이/결과 공통) */
const QLine = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    justify-items: start;
    gap: 8px;
    margin: 12px 0 14px;
`;

const QBlock = styled.div`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 8px;
    row-gap: 12px;
    align-items: start;
    width: 100%;
    margin: 0 0 24px;
`;

const QNumText = styled.span`
    font-size: clamp(17px, 2.2vw, 20px);
    font-weight: 750;
    color: ${UI.text};
    line-height: 1.45;
    letter-spacing: -0.02em;
`;

/* 보기들 */
const Options = styled.div`
    display: grid;
    gap: 12px;
    width: 100%;
    grid-column: 1 / -1;
`;

const Opt = styled.div<{ $on?: boolean; $tone?: "normal" | "ok" | "bad" }>`
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid ${UI.line};
    background: #fff;
    padding: 14px 14px;
    border-radius: 14px;
    cursor: ${({ $tone }) => ($tone && $tone !== "normal" ? "default" : "pointer")};
    text-align: left;
    transition: transform 0.06s ease, background-color 0.12s ease,
    border-color 0.12s ease, box-shadow 0.12s ease;

    &:hover {
        background: #fbfbfd;
    }
    &:active {
        transform: scale(0.99);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.25);
    }

    /* 선택 상태(문제 풀이 중) */
    ${({ $on }) => $on && `border-color:${UI.primary}; background:#f8faff;`}

        /* 결과 색상 */
    ${({ $tone }) =>
            $tone === "ok" && `border-color:${UI.success}; background:${UI.successSoft};`}
    ${({ $tone }) =>
            $tone === "bad" && `border-color:${UI.danger}; background:${UI.dangerSoft};`}
`;

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

const Hollow = styled.span`
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid ${UI.primary};
    background: rgba(255, 255, 255, 0.7);
    display: block;
`;

const Bullet = styled.span<{ $on?: boolean; $tone?: "normal" | "ok" | "bad" }>`
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: ${({ $on }) => ($on ? UI.gradient.brand : UI.gradient.brandSoft)};
    color: ${({ $on }) => ($on ? "#fff" : "#0f172a")};

    ${({ $tone }) => $tone === "ok" && `background:${UI.success}; color:#fff;`}
    ${({ $tone }) => $tone === "bad" && `background:${UI.danger}; color:#fff;`}

    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
`;

const OptLabel = styled.div`
    flex: 1 1 auto;
    min-width: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${UI.text};
`;

const Footer = styled.div`
    margin-top: 26px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

const Ghost = styled.button`
    height: 35px;
    padding: 0 16px;
    border-radius: 5px;
    font-weight: 700;
    background: #fff;
    color: ${UI.primary};
    border: 1px solid ${UI.primary};
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s, border-color 0.15s, transform 0.08s;
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
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const Primary = styled.button`
    height: 35px;
    padding: 0 18px;
    border-radius: 5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: ${UI.primary};
    border: 1px solid ${UI.primary};
    color: #fff;
    cursor: pointer;
    transition: filter 0.15s, transform 0.08s;
    &:hover {
        filter: brightness(0.96);
    }
    &:active {
        transform: translateY(1px);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.25);
    }
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const Badge = styled.span<{ $tone: "ok" | "bad" }>`
    margin-left: auto;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 750;
    border: 1px solid ${({ $tone }) => ($tone === "ok" ? UI.success : UI.danger)};
    background: ${({ $tone }) => ($tone === "ok" ? UI.successSoft : UI.dangerSoft)};
    color: ${({ $tone }) => ($tone === "ok" ? UI.success : UI.danger)};
`;

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

/* ====== INITIALS 전용 인풋 ====== */
const TextAnswerWrap = styled.div<{ $tone?: "ok" | "bad" | "none" }>`
    grid-column: 1 / -1;
    width: 100%;

    input {
        height: 44px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid ${UI.line};
        font-size: 16px;
        letter-spacing: -0.02em;
        color: ${UI.text};
        background: #fff;
        transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
        width: 100%;
    }
    input::placeholder {
        color: ${UI.muted};
    }
    input:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.25);
        border-color: ${UI.primary};
        background: #f8faff;
    }

    ${({ $tone }) =>
            $tone === "ok" &&
            `
    input { border-color:${UI.success}; background:${UI.successSoft}; }
  `}
    ${({ $tone }) =>
            $tone === "bad" &&
            `
    input { border-color:${UI.danger}; background:${UI.dangerSoft}; }
  `}
`;

const Tiny = styled.p`
    margin: 6px 0 0;
    font-size: 12px;
    color: ${UI.muted};
`;

const TextResult = styled.div<{ $tone: "ok" | "bad" }>`
    display: grid;
    gap: 8px;
    padding: 14px;
    border: 1px solid ${({ $tone }) => ($tone === "ok" ? UI.success : UI.danger)};
    background: ${({ $tone }) => ($tone === "ok" ? UI.successSoft : UI.dangerSoft)};
    border-radius: 14px;
    max-width: ${CONTENT_MEASURE};
    width: 100%;
    margin-left: 0;
    margin-right: auto;
`;

/* ====== INITIALS 힌트 타일 ====== */
const HintTiles = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
  margin-bottom: 10px;
`;

const HintTile = styled.span`
  min-width: 44px;
  height: 44px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1.5px solid #cfe0ff;
  background: #f5f9ff;
  color: #4766e6;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.02em;
  box-shadow: 0 10px 24px rgba(62,99,224,.06);
`;

// 공백용(간격만)
const HintGap = styled.span`
  width: 12px;
  height: 44px;
`;

/* 결과 리스트: 기본 번호 숨김 (겹침 방지) */
const ResultList = styled.ol`
    list-style: none;
    padding-left: 0;
    margin: 0;
`;

const truthy = (v: any): boolean => {
    if (v === true || v === 1) return true;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "1" || s === "true" || s === "y" || s === "yes";
};

/* ====== 타입 ====== */
type PlayState = {
    sessionId?: number;
    title?: string;
    source?: "wordbook" | "category" | "selected" | "retry";
};

type QuestionType = "CHOICE" | "OX" | "INITIALS";

type SessionItem = {
    questionId: number;
    questionText: string;
    questionType?: QuestionType;
    answerText?: string;
    choices: { id: string | number; text: string; isAnswer?: boolean }[];
    initialsHint?: string;
};

/* ====== 경로 유틸 ====== */
const RESULT_PATH_RE = /(\/poten-word)?\/(poten-quiz|quiz)\/(play\/review|review)$/;
const BASE_PATH_CAPTURE_RE = /(\/poten-word)?\/(poten-quiz|quiz)/i;

function getQuizBasePath(pathname: string): string {
    const m = pathname.match(BASE_PATH_CAPTURE_RE);
    const base = m ? m[0].replace(/\/$/, "") : "/poten-word/quiz";
    return base.replace(/\/poten-quiz\b/i, "/quiz");
}

/* 강조(‘않는’) 하이라이트 */
function emphasizeNot(text: string) {
    return text.replace(/(않는)(?!\s*다)|(아닌)/g, (m) => `<em>${m}</em>`);
}

function escapeHtml(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function splitHintAndDesc(text?: string) {
    const esc = escapeHtml(String(text ?? ""));
    // "초성 힌트: ... 설명: ..." 모두 있는 경우
    const mBoth = esc.match(/초성\s*힌트\s*:\s*([\s\S]*?)(?:\s*설명\s*:\s*([\s\S]*))$/i);
    if (mBoth) {
        const hint = (mBoth[1] ?? "").trim();
        const desc = (mBoth[2] ?? "").trim();
        return {
            titleHtml: emphasizeNot(`<span class="q-hint">초성 힌트: ${hint}</span>`),
            descHtml: emphasizeNot(desc),
        };
    }
    // "설명:"만 있는 경우 → 설명만 박스로
    const mDescOnly = esc.match(/설명\s*:\s*([\s\S]*)$/i);
    if (mDescOnly) {
        const desc = (mDescOnly[1] ?? "").trim();
        return { titleHtml: "", descHtml: emphasizeNot(desc) };
    }
    // 기본: 전부 제목으로
    return { titleHtml: emphasizeNot(esc), descHtml: "" };
}

/* ====== INITIALS 힌트 유틸 ====== */

// 한글 음절 -> 초성
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"] as const;
function toChosungChar(ch: string) {
    const code = ch.charCodeAt(0);
    // 가(0xAC00) ~ 힣(0xD7A3)
    if (code < 0xac00 || code > 0xd7a3) return ch;
    const idx = Math.floor((code - 0xac00) / 588);
    return CHO[idx] ?? ch;
}

// "엄격 모드" -> ["ㅇ","ㄱ"," ","ㅁ","ㄷ"] 같은 느낌으로 분해
function toChosungTiles(answer: string) {
    const raw = String(answer ?? "");
    // 공백은 유지, 그 외는 초성/원문
    return Array.from(raw).map((ch) => {
        if (/\s/.test(ch)) return " ";          // 공백 타일(연출용)
        return toChosungChar(ch);
    });
}

// questionText에서 "초성 힌트:" 부분만 뽑기 (네가 이미 splitHintAndDesc에서 사용 중)
function extractHintTextFromQuestionText(questionText?: string) {
    const s = String(questionText ?? "");
    const m = s.match(/초성\s*힌트\s*:\s*([\s\S]*?)(?:\s*설명\s*:|$)/i);
    return (m?.[1] ?? "").trim();
}

/**
 * INITIALS 힌트 결정 우선순위
 * 1) questionText에 명시된 "초성 힌트: ..."
 * 2) (혹시 내려오면) q.answerText에서 초성 생성
 */
function getInitialsTiles(q: SessionItem) {
    // 0) API의 initialsHint 우선 사용
    const apiHint = String(q.initialsHint ?? "").trim();
    if (apiHint) return Array.from(apiHint); // "ㅂㄷㄱ ㅊㄹ" 그대로 타일화 (공백 포함)

    // 1) questionText에 박아둔 힌트 파싱
    const hint = extractHintTextFromQuestionText(q.questionText);
    if (hint) return Array.from(hint);

    // 2) 정답에서 초성 생성(서버가 내려줄 때만)
    const ans = String(q.answerText ?? "").trim();
    if (ans) return toChosungTiles(ans);

    return [];
}

const isInitialsQ = (q: SessionItem) => q.questionType === "INITIALS";

/* ===================== ResultView ===================== */
function ResultView({ title, summary, items, answers, sessionId, onClose }: any) {
    const nav = useNavigate();
    const loc = useLocation();
    const [retrying, setRetrying] = React.useState(false);
    const [reviewDetails, setReviewDetails] = React.useState<any[] | null>(null);

    if (!summary) {
        return <p style={{ padding: 24 }}>결과를 찾을 수 없어요.</p>;
    }

    const ms = Number(summary.elapsedMs ?? 0);

    // summary.details에 정답/정오 정보가 부족하면 review API 호출
    React.useEffect(() => {
        const details = summary?.details;
        const hasEnoughData =
            Array.isArray(details) &&
            details.some(
                (d: any) =>
                    d.correctChoiceId ||
                    d.answerChoiceId ||
                    typeof d.correct === "boolean" ||
                    d.expectedText || d.textAnswer
            );

        if (hasEnoughData || !sessionId) return;

        (async () => {
            try {
                const res = await http.get(`/me/quiz/sessions/${sessionId}/review`, {
                    headers: { ...authHeader() },
                    withCredentials: true,
                });
                const reviewItems = res?.data?.items ?? [];
                setReviewDetails(reviewItems);
            } catch {
                // 리뷰 데이터가 없어도 기존 로직으로 표시
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

    // 선택형 답변 fallback
    const fallbackPickedMap = new Map<string, string>(
        (answers ?? []).map((a: any) => [
            String(a.quizQuestionId ?? a.questionId ?? a.qid ?? a.id),
            String(a.quizChoiceId ?? a.selectedChoiceId ?? a.choiceId ?? a.cid ?? a.value),
        ])
    );

    // 텍스트 답변 fallback (INITIALS)
    const fallbackTextMap = new Map<string, string>(
        (answers ?? []).map((a: any) => [
            String(a.quizQuestionId ?? a.questionId ?? a.qid ?? a.id),
            String(a.textAnswer ?? a.answerText ?? a.text ?? ""),
        ])
    );

    const idKey = (v: any): string | null => {
        if (v == null || v === "") return null;
        if (Array.isArray(v)) return idKey(v[0]);
        if (typeof v === "object") {
            return idKey(
                v.id ??
                v.choiceId ??
                v.value ??
                v.answerId ??
                v.choice?.id ??
                v.solutionId ??
                v.solution?.id
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
                data?.sessionId ?? data?.id ?? data?.session?.id
            );
            if (!Number.isFinite(newSessionId)) {
                throw new Error("세션 생성에 실패했습니다. (sessionId 없음)");
            }

            const base = getQuizBasePath(loc.pathname);
            nav(`${base}/play?sessionId=${newSessionId}`, {
                state: { sessionId: newSessionId, title: title ?? "포텐퀴즈", source: "retry" },
                replace: true,
            });
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "오답 세션 생성 중 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setRetrying(false);
        }
    };

    const base = getQuizBasePath(loc.pathname);

    // 텍스트 비교(트림만 적용 — 요청사항)
    const eqTrim = (a?: string, b?: string) =>
        (a ?? "").trim() === (b ?? "").trim();

    return (
        <div>
            <h1 style={{ margin: 0 }}>{title ?? "결과"}</h1>
            <p style={{ color: "#374151" }}>
                <strong>{summary.correct}</strong> / {summary.total} 정답 · {(ms / 1000).toFixed(1)}초
            </p>

            <ResultList>
                {(items ?? []).map((q: SessionItem, idx: number) => {
                    const d = detailMap.get(String(q.questionId));

                    // 선택형 처리(기존)
                    const pickedKey =
                        pickKey(d?.choiceId, d?.selectedChoiceId, d?.quizChoiceId, d?.selectedId, d?.selected)
                        ?? fallbackPickedMap.get(String(q.questionId))
                        ?? null;

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

                    // INITIALS(주관식) 처리
                    const isInitials = isInitialsQ(q);
                    const userText =
                        String(
                            d?.textAnswer ??
                            d?.submittedText ??
                            d?.userText ??
                            fallbackTextMap.get(String(q.questionId)) ??
                            ""
                        );
                    const expectedText =
                        String(
                            d?.expectedText ??
                            d?.correctText ??
                            d?.answerText ??
                            d?.solutionText ??
                            q?.answerText ??
                            ""
                        );

                    const isPickedWrong =
                        isInitials
                            ? (userText.trim().length > 0 && !eqTrim(userText, expectedText))
                            : (typeof d?.correct === "boolean"
                                ? (!d.correct && pickedKey != null)
                                : (pickedKey != null && correctKey != null && pickedKey !== correctKey));

                    return (
                        <li key={String(q.questionId)} style={{ margin: "14px 0" }}>
                            <QBlock>
                                <QNumText>{idx + 1}번.</QNumText>
                                {(() => {
                                    const parts = splitHintAndDesc(q.questionText);
                                    return (
                                        <>
                                            <QTitle dangerouslySetInnerHTML={{ __html: parts.titleHtml }} />
                                            {parts.descHtml && (
                                                <DescBox dangerouslySetInnerHTML={{ __html: parts.descHtml }} />
                                            )}
                                        </>
                                    );
                                })()}
                                {isInitials ? (
                                    <TextResult $tone={isPickedWrong ? "bad" : "ok"}>
                                        <div><strong>내 답:</strong> {userText.trim() || "미입력"}</div>
                                        <div><strong>정답:</strong> {expectedText.trim() || "-"}</div>
                                    </TextResult>
                                ) : (
                                    <Options role="radiogroup" aria-label={`문항 ${q.questionId} 정답 선택`}>
                                        {q.choices.map((o) => {
                                            const oid = String(o.id);
                                            const isPicked  = pickedKey != null && oid === String(pickedKey);
                                            const isCorrect = correctKey != null && oid === String(correctKey);

                                            const tone =
                                                isCorrect ? "ok"
                                                    : (isPicked && !isCorrect) ? "bad"
                                                        : "normal";

                                            return (
                                                <Opt key={oid} $tone={tone} tabIndex={-1}>
                                                    <Bullet aria-hidden $tone={tone}>
                                                        {tone === "ok" ? <CheckIcon/> : <Hollow/>}
                                                    </Bullet>
                                                    <OptLabel>{o.text}</OptLabel>
                                                    {isCorrect && <Badge $tone="ok">정답</Badge>}
                                                    {isPicked && !isCorrect && <Badge $tone="bad">내 선택</Badge>}
                                                </Opt>
                                            );
                                        })}
                                    </Options>
                                )}
                            </QBlock>
                        </li>
                    );
                })}
            </ResultList>

            <Footer>
                <Ghost
                    type="button"
                    onClick={() => {
                        if (onClose) onClose();
                        else nav(base);
                    }}
                >
                    닫기
                </Ghost>
                {(() => {
                    const wrongCount = Math.max(0, Number(summary.total) - Number(summary.correct));
                    return(
                        <Primary
                            type="button"
                            onClick={handleRetryWrong}
                            disabled={retrying || wrongCount === 0}
                            style={{ pointerEvents: retrying ? "none" : undefined }}
                        >
                            {retrying ? "다시 시작 중..." : "틀린 문제 다시 풀기"}
                        </Primary>
                    );
                })()}
            </Footer>
        </div>
    );
}

/* ===================== Page ===================== */
export default function QuizPlayPage() {
    const nav = useNavigate();
    const loc = useLocation();
    const payload = (loc.state ?? {}) as PlayState;

    const sp = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
    const sessionId =
        payload.sessionId ??
        (() => {
            const v = sp.get("sessionId");
            const n = v ? Number(v) : NaN;
            return Number.isFinite(n) ? n : undefined;
        })();

    const [items, setItems] = React.useState<SessionItem[]>([]);
    const [selectedByQ, setSelectedByQ] =
        React.useState<Record<number, string | number>>({});
    const [textByQ, setTextByQ] = React.useState<Record<number, string>>({});
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);

    const startedAtRef = React.useRef<number>(performance.now());
    const [submitting, setSubmitting] = React.useState(false);
    const inFlightRef = React.useRef(false);

    // 결과 경로 여부
    const isResultRoute = RESULT_PATH_RE.test(loc.pathname);

    const sameId = (a: any, b: any) => String(a) === String(b);

    const hasValidSelection = (q: SessionItem) => {
        const sel = selectedByQ[q.questionId];
        if (sel == null || String(sel).trim() === "") return false;
        // 보기 리스트에 실제 존재하는지 확인
        return (q.choices ?? []).some(ch => sameId(ch.id, sel));
    };

    React.useEffect(() => {
        if (isResultRoute) return;

        let aborted = false;

        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                if (!sessionId) { setErr("세션 ID가 없습니다."); return; }
                const res = await http.get(`/me/quiz/sessions/${sessionId}/items`, {
                    params: { offset: 0, limit: 200, includeAnswers: false },
                    headers: { ...authHeader() },
                    withCredentials: true,
                });
                const page = res.data ?? {};
                const arr: SessionItem[] = (page.items ?? []).map((row: any) => {
                    const typeStr = String(row.questionType ?? row.type ?? "").toUpperCase();
                    const mappedType = (typeStr === "CHOICE" || typeStr === "OX" || typeStr === "INITIALS") ? (typeStr as QuestionType) : undefined;
                    return {
                        questionId: Number(row.questionId ?? row.id),
                        questionText: String(row.questionText ?? row.question ?? "문항 본문이 없습니다."),
                        questionType: mappedType,
                        answerText: String(row.answerText ?? row.expectedText ?? row.textAnswer ?? ""), // ★ INITIALS 정답(초성) 힌트
                        choices: (row.choices ?? []).map((c: any) => {
                            const raw = c.id ?? c.choiceId ?? c.value ?? c.cid;
                            const n = Number(raw);
                            const safeId = Number.isFinite(n) && String(n) === String(raw) ? n : String(raw ?? "");
                            const text = String(
                                c.text ?? c.choiceText ?? c.label ?? c.name ?? c.title ?? c.content ?? ""
                            );
                            return {
                                id: safeId,
                                text,
                                isAnswer: truthy(
                                    c.isAnswer ?? c.is_answer ?? c.answer ?? c.correct ?? c.isRight ?? c.right ?? c.solution
                                ),
                            };
                        }),
                        initialsHint: String(row.initialsHint ?? ""),
                    };
                });
                if (!aborted) {
                    setItems(arr);
                    setSelectedByQ({});
                    setTextByQ({});
                    setTotal(Number.isFinite(page.total) ? Number(page.total) : arr.length);
                }
            } catch (e: any) {
                if (!aborted) setErr(e?.message ?? "문항을 불러오지 못했어요.");
            } finally {
                if (!aborted) setLoading(false);
            }
        };

        load();
        return () => { aborted = true; };
    }, [isResultRoute, sessionId]);

    const normalizeText = (s?: string) => (s ?? "").trim();

    const stripNullish = (o: Record<string, any>) =>
        Object.fromEntries(Object.entries(o).filter(([_, v]) =>
            v !== undefined && v !== null && !(typeof v === "number" && !Number.isFinite(v))
        ));

    // 응답 완료 여부 계산(초성은 텍스트 입력이 있어야 함)
    const answeredCount = items.filter((q) =>
        isInitialsQ(q)
            ? normalizeText(textByQ[q.questionId]).length > 0
            : hasValidSelection(q)
    ).length;

    const unanswered = items.filter((q) =>
        isInitialsQ(q)
            ? !(normalizeText(textByQ[q.questionId]).length > 0)
            : !hasValidSelection(q)
    );

    // ===== 렌더링 분기 =====
    if (isResultRoute) {
        const st = (loc.state as any) ?? {};
        const base = getQuizBasePath(loc.pathname);
        return (
            <>
                {/* 결과 화면도 동일한 배경/용지 적용 */}
                <SoftBlobsBackground />
                <Screen>
                    <NarrowLeft>
                        <Card>
                            <ResultView
                                title={st.title}
                                summary={st.summary}
                                items={st.items}
                                answers={st.answers}
                                sessionId={st.sessionId}
                                onClose={() => nav(base)}
                            />
                        </Card>
                    </NarrowLeft>
                </Screen>
            </>
        );
    }

    async function submit() {
        if (inFlightRef.current) return;

        const sid = sessionId;
        if (!sid) { alert("세션 ID가 없습니다."); return; }

        // 미응답 방지(버튼 disabled와 중복 방어)
        const unanswered = items.filter((q) =>
            isInitialsQ(q)
                ? !(normalizeText(textByQ[q.questionId]).length > 0)
                : !hasValidSelection(q)
        );
        if (unanswered.length > 0) {
            alert("모든 문항에 응답해 주세요.");
            return;
        }

        inFlightRef.current = true;
        setSubmitting(true);
        try {
            const stripNullish = (o: Record<string, any>) =>
                Object.fromEntries(
                    Object.entries(o).filter(
                        ([, v]) =>
                            v !== undefined &&
                            v !== null &&
                            !(typeof v === "number" && !Number.isFinite(v))
                    )
                );

            // 서버로 보낼 answers 생성 (초성=텍스트 / 선택형=selectedChoiceId)
            const builtAnswers = items.map((q) => {
                // 1) INITIALS(주관식): selectedChoiceId 같은 거 쓰면 안 됨
                if (isInitialsQ(q)) {
                    const text = normalizeText(textByQ[q.questionId]);
                    return stripNullish({
                        quizQuestionId: Number(q.questionId),
                        textAnswer: text,
                    });
                }

                // 2) 선택형
                const raw = selectedByQ[q.questionId];

                // 보기 리스트에 실제 존재하는지 확인
                if (!(q.choices ?? []).some((ch) => sameId(ch.id, raw))) {
                    throw new Error(`유효하지 않은 선택값(q=${q.questionId}): ${raw}`);
                }

                const n = Number(raw);
                const choiceId =
                    Number.isFinite(n) && String(n) === String(raw) ? n : String(raw);

                return stripNullish({
                    quizQuestionId: Number(q.questionId),
                    selectedChoiceId: choiceId,
                });
            });

            const elapsedMs = Math.round(performance.now() - startedAtRef.current);

            const resp = await http.post(
                `/me/quiz/sessions/${sid}/submit`,
                { answers: builtAnswers, elapsedMs },
                { headers: { ...authHeader() }, withCredentials: true }
            );

            const summary = (resp && (resp as any).data) ? (resp as any).data : resp;
            const base = getQuizBasePath(loc.pathname) || "/quiz";

            // 결과 페이지로 이동(상태로 summary/answers/items 전달)
            nav(`${base}/review/${sid}`, {
                state: { title: payload.title ?? "포텐퀴즈" },
                replace: true,
            });
        } catch (e: any) {
            console.log("STATUS:", e?.response?.status);
            console.log("DATA:", e?.response?.data);
            console.log("HEADERS:", e?.response?.headers);
            const msg =
                e?.response?.data?.message ??
                e?.response?.data?.error ??
                JSON.stringify(e?.response?.data) ??
                e?.message ??
                "제출 중 오류";
            alert(msg);
        } finally {
            inFlightRef.current = false;
            setSubmitting(false);
        }
    }

    return (
        <>
            <SoftBlobsBackground />
            <Screen>
                <NarrowLeft>
                    <Card>
                        {loading ? (
                            <p>불러오는 중…</p>
                        ) : err ? (
                            <p style={{ color: UI.danger }}>{err}</p>
                        ) : items.length === 0 ? (
                            <p>표시할 문항이 없습니다.</p>
                        ) : (
                            <>
                                <MetaRow>
                                    <Chip>총 {total}문항</Chip>
                                    <Chip>응답 {answeredCount}/{total}</Chip>
                                </MetaRow>

                                {items.map((q, idx) => (
                                    <QBlock key={q.questionId}>
                                        {/* 1행: 번호 + 제목(설명/힌트 포함) */}
                                        <QNumText>{idx + 1}번.</QNumText>
                                        {(() => {
                                            const parts = splitHintAndDesc(q.questionText);
                                            return (
                                                <>
                                                    <QTitle dangerouslySetInnerHTML={{ __html: parts.titleHtml }} />
                                                    {parts.descHtml && (
                                                        <DescBox dangerouslySetInnerHTML={{ __html: parts.descHtml }} />
                                                    )}
                                                </>
                                            );
                                        })()}

                                        {/* 2행: (초성) 정답 입력칸  → 설명 바로 아래, 2열 시작선에 정렬 */}
                                        {isInitialsQ(q) ? (
                                            <>
                                                {/* 초성 힌트 타일 */}
                                                {(() => {
                                                    const tiles = getInitialsTiles(q);
                                                    return tiles.length > 0 ? (
                                                        <HintTiles aria-label="초성 힌트">
                                                            {tiles.map((ch, i) =>
                                                                ch === " " ? (
                                                                    <HintGap key={`gap-${i}`} aria-hidden />
                                                                ) : (
                                                                    <HintTile key={`t-${i}`} aria-label={ch}>
                                                                        {ch}
                                                                    </HintTile>
                                                                )
                                                            )}
                                                        </HintTiles>
                                                    ) : null;
                                                })()}

                                                <TextAnswerWrap $tone="none">
                                                    <input
                                                        type="text"
                                                        inputMode="text"
                                                        placeholder="정답을 입력하세요."
                                                        value={textByQ[q.questionId] ?? ""}
                                                        onChange={(e) =>
                                                            setTextByQ((prev) => ({ ...prev, [q.questionId]: e.target.value }))
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                const unansweredNext = items.find(
                                                                    (it, i) =>
                                                                        i > idx &&
                                                                        (isInitialsQ(it)
                                                                            ? !(normalizeText(textByQ[it.questionId]).length > 0)
                                                                            : selectedByQ[it.questionId] == null)
                                                                );
                                                                if (!unansweredNext && unanswered.length === 0) submit();
                                                            }
                                                        }}
                                                    />
                                                </TextAnswerWrap>
                                            </>
                                        ) : (
                                            <Options role="radiogroup" aria-label={`문항 ${q.questionId} 정답 선택`}>
                                                {q.choices.map((o) => {
                                                    const on = sameId(selectedByQ[q.questionId], o.id);
                                                    return (
                                                        <Opt
                                                            key={String(o.id)}
                                                            $on={on}
                                                            role="radio"
                                                            aria-checked={on}
                                                            tabIndex={0}
                                                            onClick={() =>
                                                                setSelectedByQ(prev => ({ ...prev, [q.questionId]: o.id }))
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" || e.key === " ") {
                                                                    e.preventDefault();
                                                                    setSelectedByQ(prev => ({ ...prev, [q.questionId]: o.id }));
                                                                }
                                                            }}
                                                        >
                                                            <Bullet aria-hidden $on={on}>
                                                                {on ? <CheckIcon /> : <Hollow />}
                                                            </Bullet>
                                                            <OptLabel>{o.text}</OptLabel>
                                                        </Opt>
                                                    );
                                                })}
                                            </Options>
                                        )}
                                    </QBlock>
                                ))}

                                <Footer>
                                    <Ghost onClick={() => nav(getQuizBasePath(loc.pathname))}>취소</Ghost>
                                    <Primary
                                        type="button"
                                        onClick={submit}
                                        disabled={submitting || unanswered.length > 0}
                                        style={{ pointerEvents: submitting ? "none" : undefined }}
                                    >
                                        제출 완료
                                    </Primary>
                                </Footer>
                            </>
                        )}
                    </Card>
                </NarrowLeft>
            </Screen>
        </>
    );
}