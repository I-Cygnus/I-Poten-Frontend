import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import { getSessionSummary } from "../../../api/quiz.ts";
import http, { authHeader } from "../../../utils/http.ts";

const ASSET = process.env.MFE_PUBLIC_SERVICE || "";

const GhanaFont = createGlobalStyle`
    @font-face {
        font-family: 'GhanaChocolate';
        src: url('${ASSET}/fonts/ghana-choco/GhanaChocolate.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }
`;

type OX = "O" | "X";

type ResultProps = {
    progress: (OX | null)[];
    /** 이전 플레이 세션 ID (필수: 틀린 문제 재도전 시 사용) */
    sessionId?: number;
    onRetryWrong?: () => void;
    onFinish?: () => void;
    onClose?: () => void;
    title?: string;
};

const UI = {
    navy: "#173579",
    panel: "#ffffff",
    text: "#0f172a",
    success: "#28C8A3",
    xBlue: "#5C86F7",
    shadow: "0 30px 80px rgba(21, 35, 78, .32)",
    radius: 22,
    bodyBg: "#f7faff",
    line: "#e5e7eb",
    primary: "#4F76F1",
    primaryStrong: "#3E63E0",
    quizHover: "#2c73e5",
    brandGrad: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
};

const Overlay = styled.div`
    position: fixed; inset: 0; z-index: 10000;
    display: grid; place-items: center;
    background: rgba(5,12,30,.42);
    padding: clamp(12px, 2vw, 24px);
`;

const Panel = styled.section`
    --cta-w: clamp(140px, 18vw, 220px);
    width: min(92vw, 900px);
    aspect-ratio: 16/9;
    min-height: clamp(420px, 52vw, 620px);
    background: ${UI.panel};
    border-radius: ${UI.radius}px;
    box-shadow: ${UI.shadow};
    overflow: hidden;
    display: grid;
    grid-template-rows: auto 1fr;
    letter-spacing: -0.02em;
`;

const Band = styled.header`
    --grid: clamp(20px, 2vw, 20px);
    position: relative;
    background: ${UI.navy}; color: #fff; text-align: center;
    padding: clamp(18px, 3vw, 28px) clamp(16px, 3vw, 24px);
    overflow: hidden;
    &::before{
        content:""; position:absolute; inset:0; pointer-events:none;
        background-image:
                repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0, rgba(255,255,255,.06) 1px, transparent 1px, transparent var(--grid)),
                repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0, rgba(255,255,255,.05) 1px, transparent 1px, transparent var(--grid));
        opacity:.9; mix-blend-mode:soft-light;
    }
    &::after{
        --cap-t: 2px; --cap-l-h: clamp(28px, 4vw, 48px);
        --cap-l-v: clamp(10px, 1.6vw, 16px);
        --cap-x: clamp(12px, 2vw, 20px); --cap-y: clamp(8px, 1.2vw, 12px);
        content:""; position:absolute; inset:0; pointer-events:none;
        background:
                linear-gradient(#fff 0 0) top var(--cap-y) left var(--cap-x) / var(--cap-l-h) var(--cap-t) no-repeat,
                linear-gradient(#fff 0 0) top calc(var(--cap-y) + var(--cap-t)) left var(--cap-x) / var(--cap-t) var(--cap-l-v) no-repeat,
                linear-gradient(#fff 0 0) top var(--cap-y) right var(--cap-x) / var(--cap-l-h) var(--cap-t) no-repeat,
                linear-gradient(#fff 0 0) top calc(var(--cap-y) + var(--cap-t)) right var(--cap-x) / var(--cap-t) var(--cap-l-v) no-repeat;
        opacity:.25;
    }
`;

const Title = styled.h2`
    margin: 0 0 8px;
    font-family: 'GhanaChocolate','Pretendard',system-ui,sans-serif;
    font-size: clamp(24px, 3.2vw, 40px); font-weight: 400;
    letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
    margin: 0; font-weight: 600;
    font-size: clamp(18px, 2.4vw, 24px);
    letter-spacing: -0.02em;
    & em { color: ${UI.success}; font-style: normal; font-weight: 750;
        font-size: clamp(22px, 3vw, 30px); letter-spacing: -0.02em; }
`;

const Body = styled.div`
    background: ${UI.bodyBg};
    padding: clamp(18px, 2.4vw, 28px);
    display: grid; grid-template-rows: auto 1fr auto;
    row-gap: clamp(12px, 1.6vw, 18px);
`;

const Grid = styled.div`
    height: 100%;
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: clamp(10px, 2vw, 22px);
    align-items: start; justify-items: center;
`;

const ICON_W = "clamp(110px, 16vw, 200px)";
const Item = styled.div` display: grid; justify-items: center;`;

const TitleBar = styled.div`
    width: ${ICON_W};
    display: inline-flex; justify-content: center; align-items: flex-end;
    gap: clamp(4px, .6vw, 8px); line-height: 1; white-space: nowrap;
    margin: clamp(10px, 1.8vw, 22px) 0 clamp(8px, 1vw, 12px);
    color: ${UI.text}; letter-spacing: -0.02em;
    .lab { font-weight: 750; font-size: clamp(16px,1.9vw,20px); opacity:.95; }
    .num { color: ${UI.navy}; font-weight: 750; font-size: clamp(28px,3.4vw,36px); transform: translateY(2px); }
`;

const IconWrap = styled.div`
    width: 100%; display: grid; place-items: center;
    height: min(24vh, 220px);
`;

const BigO = styled.span`
    --ring: clamp(16px, 2.2vw, 22px);
    width: clamp(116px, 11vw, 196px);
    aspect-ratio: 1;
    border-radius: 999px;
    position: relative;
    background: linear-gradient(135deg, #53DFBE 0%, #36CFAC 100%);
    &::after{ content:""; position:absolute; inset:var(--ring); border-radius:inherit; background:${UI.bodyBg}; }
`;

const BigX = styled.span`
    width: ${ICON_W}; aspect-ratio: 1; position: relative; display: inline-block;
    &::before,&::after{
        content:""; position:absolute; left:50%; top:50%;
        width:92%; height: clamp(16px, 2.2vw, 22px);
        background: linear-gradient(135deg, #629EFD 0%, #357BE9 100%);
        border-radius: 999px;
    }
    &::before{ transform: translate(-50%,-50%) rotate(45deg); }
    &::after{  transform: translate(-50%,-50%) rotate(-45deg); }
`;

const Actions = styled.div`
    display: flex; gap: clamp(10px, 2vw, 16px);
    justify-content: center; flex-wrap: wrap; margin-top: clamp(6px, 1vw, 10px);
`;

const BtnPrimary = styled.button`
    inline-size: var(--cta-w);
    height: clamp(40px, 4.6vw, 48px);
    border-radius: 12px; border: 0; color:#fff; font-weight:700;
    letter-spacing: -0.02em; font-size: clamp(14px, 1.6vw, 16px);
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    cursor:pointer; -webkit-tap-highlight-color:transparent;
    box-shadow: 0 2px 10px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.25);
    transition: background-size .26s ease, transform .08s ease;
    background-image:
            linear-gradient(90deg, ${UI.quizHover}, ${UI.quizHover}),
            ${UI.brandGrad};
    background-repeat:no-repeat; background-position:0 0, 0 0;
    background-size:0% 100%, 100% 100%;
    &:hover{ filter: brightness(.96); }
    &:active{ transform: translateY(1px); }
    &:focus-visible{ outline:none; box-shadow:0 0 0 3px rgba(79,118,241,.25); }
    .ico-exit{ width: clamp(18px,1.7vw,22px); height: clamp(18px,1.7vw,22px); transform: translateY(1.5px); transition: transform .18s ease; flex: 0 0 auto; }
    &:hover .ico-exit,&:focus-visible .ico-exit{ transform: translate(2px,1.5px); }
    &:active .ico-exit{ transform: translate(3px,1.5px); }
    &:disabled .ico-exit{ transform: translateY(1.5px); }
`;

const BtnGhost = styled.button<{disabled?: boolean}>`
    inline-size: var(--cta-w);
    height: clamp(40px, 4.6vw, 48px);
    border-radius: 12px; border: 1px solid ${UI.primaryStrong};
    background: #fff; color: ${UI.primaryStrong}; font-weight: 700;
    letter-spacing: -0.02em; font-size: clamp(14px,1.6vw,16px);
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    cursor: ${(p)=>p.disabled?'not-allowed':'pointer'};
    -webkit-tap-highlight-color: transparent;
    transition: background-color .15s ease, color .15s ease, border-color .15s ease, transform .08s ease;
    .ico-refresh{ width: clamp(18px,1.6vw,22px); height: clamp(18px,1.6vw,22px); transform: translateY(1.5px); transition: transform .18s ease; }
    &:hover .ico-refresh{ transform: translateY(1.5px) rotate(-22deg); }
    &:hover { background: #eef2ff; }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
    &[aria-busy="true"]{ opacity:.7; pointer-events:none; }
`;

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ico-refresh" {...props}>
        <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 5v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ExitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" className="ico-exit" aria-hidden="true" {...props}>
        <path d="M10 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

type RetryWrongRes = {
    newSessionId?: number;
    sessionId?: number;
    id?: number;
    questionType: "CHOICE" | "OX" | "INITIALS";
    questionCount: number;
    /** 백엔드가 바로 제공하면 이 경로로 보냄(권장) 예: "/poten-word/quiz/ox" */
    playPath?: string;
};

export default function DailyQuizResultPage({
                                           progress,
                                           sessionId: prevSessionId,
                                           onRetryWrong,
                                           onFinish,
                                           onClose,
                                           title = "결과 보기",
                                       }: ResultProps) {
    const nav = useNavigate();
    const QUIZ_LEN = Math.max(1, progress?.length || 3);

    const sid = prevSessionId;

    const normalized = React.useMemo<OX[]>(
        () => Array.from({ length: QUIZ_LEN }, (_, i) => (progress[i] ?? "X")),
        [progress]
    );

    const correct = normalized.filter((v) => v === "O").length;
    const wrongCount = QUIZ_LEN - correct;

    const [busy, setBusy] = React.useState(false);
    const canRetry = !!sid && wrongCount > 0 && !busy;

    const handleFinish = React.useCallback(() => {
        const used = !!onFinish;
        console.debug("[QuizResultPage] finish clicked → using onFinish?", used);
        if (used) return onFinish!();
        nav("/poten-word/quiz", { replace: true });
    }, [onFinish, nav]);

    const handleClose = React.useCallback(() => {
        if (onClose) return onClose();
        nav("/poten-word/quiz", { replace: true });
    }, [onClose, nav]);

    const LS_LAST_SESSION = "quiz:lastSessionId";

    // 기본 재도전 동작 (백엔드 세션 생성)
    const fallbackRetryWrong = React.useCallback(async () => {
        if (!sid) return;
        setBusy(true);
        try {
            // 1) 서버 상태 확인: 제출(SUBMITTED)된 세션만 허용
            const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
            let summary = await getSessionSummary(sid);
            for (let i = 0; i < 4 && summary?.status !== "SUBMITTED"; i++) {
                await sleep(400);
                summary = await getSessionSummary(sid);
            }
            if (!summary || summary.status !== "SUBMITTED") {
                alert("먼저 퀴즈를 제출해주세요. 제출 완료된 세션에서만 오답 재도전이 가능합니다.");
                return;
            }


            // 2) 오답 재도전 세션 생성 (경로는 /me/.../retry-wrong 이 맞음)
            const {data} = await http.post<RetryWrongRes>(
                `/me/quiz/sessions/${sid}/retry-wrong`,
                {},
                {headers: authHeader(), withCredentials: true}
            );

            // 3) 새 세션ID 추출(+호환 키들)
            const nextSid = Number(
                (data as any)?.newSessionId ??
                (data as any)?.sessionId ??
                (data as any)?.id ??
                (data as any)?.new_session_id
            );


            if (!Number.isFinite(nextSid)) {
                console.error("[retry-wrong] 새 세션 ID 없음:", data);
                alert("재도전 세션 ID를 받지 못했어요.");
                return;
            }
            try { localStorage.setItem("quiz:lastSessionId", String(nextSid)); } catch {}

            const qt = String((data as any)?.questionType || "").toUpperCase();
            let basePath = (data as any)?.playPath || "/poten-word/quiz/today";
            if (!((data as any)?.playPath)) {
                const qt = String((data as any)?.questionType || "").toUpperCase();
                if (qt.includes("OX")) basePath = "/poten-word/quiz/ox";
                else if (qt.includes("INITIAL")) basePath = "/poten-word/quiz/initials";
            }
            nav(`${basePath}?sessionId=${nextSid}`, { replace: true });
        } catch (e: any) {
            console.error("[retry-wrong] error:", e?.response?.data ?? e);
            const status = e?.response?.status;
            if (status === 401) {
                alert("로그인이 필요합니다.");
            } else if (status === 422) {
                alert("틀린 문제가 없습니다. 전체 다시 풀기 또는 다른 퀴즈를 선택해 보세요.");
            } else if (status === 400 || status === 409) {
                // 서버가 '미제출'을 400/409로 줄 수 있으니 동일 메시지 처리
                alert("먼저 퀴즈를 제출해주세요. 제출 완료된 세션에서만 오답 재도전이 가능합니다.");
            } else {
                console.error(e);
                alert("재도전 세션 생성 중 문제가 발생했어요.");
            }
        } finally {
            setBusy(false);
        }
    }, [sid, nav]);

    const handleRetryWrong = React.useCallback(() => {
        if (!canRetry) return;
        if (onRetryWrong) return onRetryWrong();
        return fallbackRetryWrong();
    }, [canRetry, onRetryWrong, fallbackRetryWrong]);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleClose]);

    return (
        <Overlay role="dialog" aria-modal="true" aria-label="퀴즈 결과" onClick={handleClose}>
            <GhanaFont />
            <Panel onClick={(e) => e.stopPropagation()}>
                <Band>
                    <Title>{title}</Title>
                    <Subtitle>
                        총 {QUIZ_LEN}문제 중 <em>{correct}문제</em>를 맞히셨습니다.
                    </Subtitle>
                </Band>

                <Body>
                    <Grid>
                        {normalized.map((v, i) => (
                            <Item key={i}>
                                <TitleBar>
                                    <span className="lab">문제</span>
                                    <span className="num">{String(i + 1).padStart(2, "0")}</span>
                                </TitleBar>
                                <IconWrap>{v === "O" ? <BigO aria-label="정답" /> : <BigX aria-label="오답" />}</IconWrap>
                            </Item>
                        ))}
                    </Grid>

                    <Actions>
                        <BtnGhost
                            onClick={handleRetryWrong}
                            disabled={!canRetry}
                            aria-busy={busy}
                            aria-disabled={!canRetry}
                            title={
                                !sid
                                    ? "세션 정보가 없어 재도전을 시작할 수 없어요"
                                    : wrongCount === 0
                                        ? "틀린 문제가 없어요"
                                        : "틀린 문제만 다시 풀기"
                            }
                        >
                            <RefreshIcon />
                            <span>{busy ? "준비 중..." : "틀린 문제 다시 풀기"}</span>
                        </BtnGhost>

                        <BtnPrimary onClick={handleFinish}>
                            <ExitIcon />
                            <span>학습 완료</span>
                        </BtnPrimary>
                    </Actions>
                    {!sid && (
                        <p style={{ textAlign: "center", marginTop: 6, color: "#6b7280" }}>
                            세션ID가 전달되지 않았습니다. (state/query/localStorage 모두 없음)
                        </p>
                    )}
                </Body>
            </Panel>
        </Overlay>
    );
}