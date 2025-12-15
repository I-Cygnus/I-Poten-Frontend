import React from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import SoftBlobsBackground from "./SoftBlobsBackground";
import emblem from "../assets/quiz/emblem.png";

/* ====== 폰트 & 토큰 ====== */
const GhanaFont = createGlobalStyle`
    @font-face {
        font-family: 'GhanaChocolate';
        src: url('/fonts/ghana-choco/GhanaChocolate.woff2') format('woff2'),
        url('${process.env.MFE_PUBLIC_SERVICE || ""}/fonts/ghana-choco/GhanaChocolate.woff2') format('woff2');
        font-weight: 400; font-style: normal; font-display: swap;
    }
`;

const UI = {
    panel: "#ffffff",
    line: "#e5e7eb",
    text: "#0f172a",
    sub: "#374151",
    primary: "#3E63E0",
    primarySoft: "#e6edff",
    success: "#28C8A3",
    successSoft: "#e9fcf8",
    danger: "#F95D5D",
    dangerSoft: "#fee6e6",
    shadow: "0 30px 80px rgba(62,99,224,.18)",
    radius: 22,
};

/* ====== 타입 ====== */
type OX = "O" | "X";

type Props = {
    index?: number;
    total?: number;
    question: string;
    initials: string[];
    value?: string;
    onChange?: (v: string) => void;
    onSubmit?: () => void;
    showResult?: boolean;
    correctAnswer?: string;
    progress?: (OX | null)[];
    emblemSrc?: string;
    emblemAlt?: string;
    offsetY?: number | string;
    headerOffset?: number | string;
    onNext?: () => void;
    resetSignal?: number | string;
};

/* ====== 레이아웃 (생략 없이 동일) ====== */
const Stage = styled.div`
    position: relative;
    isolation: isolate;
    width: 100%;
    display: grid; place-items: center;
    padding: clamp(12px, 2vw, 24px);
`;
const Shell = styled.div`
    width: 100%;
    max-width: 1180px;
    min-height: calc(100dvh - var(--ox-offset, 0px));
    display: grid;
    place-items: center;
    gap: 12px;
    margin: 0 auto;
    transform: translateY(var(--raise, 0px));
`;
const Card = styled.section`
    --wm-size: clamp(44px, 9vw, 88px);
    --dot-size: clamp(14px, 2vw, 18px);
    --dot-gap: clamp(6px, 1vw, 8px);
    --q-shift: calc(var(--wm-size) * -0.08);
    --pad: clamp(22px, 3.6vw, 36px);
    --dock-space: clamp(160px, 22vw, 280px);
    --dock-hpad: clamp(22px, 3vw, 40px);
    --dock-vpad: clamp(16px, 2.2vw, 24px);
    --dock-round-top: clamp(28px, 3.2vw, 44px);
    --dock-lift: clamp(0px, 0vw, 0px);
    --dock-reveal: clamp(8px, 1vw, 12px);
    --choices-top-gap: clamp(26px, 3vw, 44px);
    --stat-size: clamp(34px, 2.6vw, 42px);
    --stat-font: clamp(15px, 1.5vw, 18px);
    --stat-gap: clamp(6px, 0.9vw, 10px);
    --card-top-inset: clamp(18px, 2.8vw, 48px);
    --mark-alpha: .75;
    --cta-w: clamp(112px, 13vw, 148px);

    position: relative;
    background: ${UI.panel};
    border: 1px solid ${UI.line};
    border-radius: ${UI.radius}px;
    box-shadow: ${UI.shadow};
    padding: var(--pad);
    padding-top: calc(var(--pad) + var(--card-top-inset));
    overflow: hidden;
    aspect-ratio: 16/9;
    min-height: clamp(520px, 56vw, 760px);
    width: 100%;
    margin: 0; box-sizing: border-box;
    padding-bottom: calc(var(--pad) + var(--dock-space));
`;
const Header = styled.div`
    display: grid; grid-template-columns: auto 1fr auto;
    align-items: center; column-gap: clamp(10px, 2vw, 16px);
    margin: 6px 0 18px; min-width: 0;
`;
const Title = styled.h2`
    margin: 0; font-size: clamp(18px, 2.4vw, 26px);
    font-weight: 750; color: ${UI.text};
    letter-spacing: -0.02em; line-height: 1.25;
`;
const TitleWrap = styled.div`
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    transform: translateY(var(--q-shift)); min-width: 0; overflow-wrap: anywhere;
`;
const QBox = styled.div`position: relative; padding-left: 0; margin-left: clamp(-6px, -0.5vw, -2px);`;
const QLabel = styled.span`
    font-family: 'GhanaChocolate','Pretendard','Noto Sans KR',system-ui,sans-serif;
    font-weight: 400; font-size: var(--wm-size); line-height: 1; color: #121212; display: block;
`;
const Dots = styled.div`
    position: absolute; left: 0; bottom: calc(100% + var(--dot-gap));
    display: inline-flex; gap: var(--dot-gap); z-index: 3;
`;
const Dot = styled.span<{ $filled?: boolean; $current?: boolean }>`
    width: var(--dot-size); height: var(--dot-size);
    border-radius: calc(var(--dot-size) * .30);
    background: ${({ $filled }) => ($filled ? UI.primary : "#eff1f5")};
    border: 1.25px solid ${({ $filled }) => ($filled ? UI.primarySoft : UI.line)};
    transform: ${({ $current }) => ($current ? "scale(1.06)" : "scale(1)")};
    box-shadow: ${({ $current }) => ($current ? `0 0 0 3px ${UI.primarySoft}` : "none")};
    transition: background .18s ease, border-color .18s ease, transform .18s ease, box-shadow .18s ease;
`;
const BigJudge = styled.span<{ $kind: 'O' | 'X' }>`
    --qj-size: calc(var(--wm-size) * 1.58);
    --qj-x: calc(var(--wm-size) * -0.05);
    --qj-y: calc(var(--wm-size) * -0.30);
    --qj-stroke: clamp(10px, 1.2vw, 14px);
    --qj-color: rgba(249,93,93,var(--mark-alpha,.75));
    position: absolute; left: var(--qj-x); top: var(--qj-y);
    width: var(--qj-size); height: var(--qj-size); pointer-events: none; z-index: 4; border-radius: 999px;
    ${({ $kind }) => $kind === 'O' ? css`
        border: var(--qj-stroke) solid var(--qj-color); background: transparent;
    ` : css`
        &::before, &::after {
            content: ""; position: absolute; left: 50%; top: 50%;
            width: 120%; height: calc(var(--qj-stroke) * 1.2);
            background: var(--qj-color); border-radius: calc(var(--qj-stroke) * .6);
            transform-origin: center;
        }
        &::before { transform: translate(-50%, -50%) rotate(45deg); }
        &::after { transform: translate(-50%, -50%) rotate(-45deg); }
    `}
`;
const Tiles = styled.div`
    --tile-min: 68px; --tile-scale: 1; --tile-nudge-y: 0px;
    margin: var(--choices-top-gap) 0 28px;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(var(--tile-min), 1fr));
    gap: clamp(10px, 2.2vw, 18px); justify-items: center;
    transform: translateY(var(--tile-nudge-y)); transition: transform .18s ease;
    @media (max-width: 880px) { --tile-min: 62px; }
    @media (max-width: 640px) { --tile-min: 56px; }
`;
const Tile = styled.div<{ $reveal?: boolean; $ok?: boolean }>`
    --base-size: clamp(68px, 9vw, 92px);
    width: calc(var(--base-size) * var(--tile-scale));
    height: calc(var(--base-size) * var(--tile-scale));
    border-radius: 18px; display: grid; place-items: center;
    font-family: 'GhanaChocolate','Pretendard','Noto Sans KR',system-ui,sans-serif;
    font-weight: 400; font-size: calc(clamp(26px, 3.2vw, 36px) * var(--tile-scale));
    box-shadow: 0 10px 24px rgba(62,99,224,.08);
    transition: background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease;
    background: ${({ $reveal, $ok }) => $reveal ? ($ok ? "#e9fcf8" : "#fff4f4") : "#f5f9ff"};
    border: 1.5px solid ${({ $reveal, $ok }) => $reveal ? ($ok ? "#b7f1e2" : "#ffd0d0") : "#cfe0ff"};
    color: ${({ $reveal, $ok }) => $reveal ? ($ok ? "#168f76" : "#e03e3e") : "#4766e6"};
`;
const InputRow = styled.form`
    display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;
`;
const TextInput = styled.input`
    height: clamp(40px, 4.8vw, 52px); border-radius: 12px; border: 2px solid #cfe0ff;
    background: #fff; padding: 0 16px; font-size: clamp(14px, 1.6vw, 16px);
    color: ${UI.text}; outline: none;
    &:focus { box-shadow: 0 0 0 3px rgba(62,99,224,.18); }
    &::placeholder { color: #9db3e8; }
    &:disabled { background: #f7faff; color: #94a3b8; cursor: not-allowed; }
`;
const SubmitBtn = styled.button`
    height: clamp(40px, 4.8vw, 52px); inline-size: var(--cta-w);
    padding: 0 clamp(14px, 2vw, 18px); border-radius: 12px; border: 0;
    background: #3E63E0; color: #fff; font-weight: 750; font-size: clamp(14px, 1.6vw, 16px);
    display: inline-flex; white-space: nowrap; text-align: center; flex-shrink: 0;
    align-items: center; justify-content: center; gap: 8px; cursor: pointer;
    transition: transform .08s ease, filter .15s ease, box-shadow .2s ease;
    box-shadow: 0 10px 24px rgba(62,99,224,.18);
    &:hover { filter: brightness(1.04); transform: translateY(-1px); }
    &:active { transform: translateY(0); }
    &:disabled { opacity: .55; cursor: not-allowed; }
`;
const DockBase = styled.section`
    position: absolute; left: calc(-1 * var(--pad) + var(--dock-reveal));
    right: calc(-1 * var(--pad) + var(--dock-reveal)); bottom: calc(-1 * var(--pad));
    transform: translateY(calc(-1 * var(--dock-lift)));
    box-sizing: border-box; min-height: var(--dock-space); max-height: var(--dock-space); overflow: auto;
    background: #f3f8ff; border: 1px solid #cfe0ff; border-top-width: 2px; border-top-color: #c4d4ff;
    border-top-left-radius: var(--dock-round-top); border-top-right-radius: var(--dock-round-top);
    border-bottom-left-radius: ${UI.radius}px; border-bottom-right-radius: ${UI.radius}px;
    box-shadow: 0 6px 18px rgba(62,99,224,.08), inset 0 1px 0 rgba(62,99,224,.16);
    padding: calc(var(--dock-vpad) + 8px) calc(var(--pad) + var(--dock-hpad)) var(--dock-vpad);
    color: ${UI.text};
`;
const InputDockIn = styled(DockBase)``;

const StatusTray = styled.div`
    display: inline-flex; align-items: center; gap: var(--stat-gap);
    transform: translateY(var(--q-shift));
    font-family: 'GhanaChocolate','Pretendard','Noto Sans KR',system-ui,sans-serif;
    font-weight: 400; letter-spacing: -.02em; -webkit-font-smoothing: antialiased;
    font-variant-numeric: tabular-nums;
    --stat-font: clamp(17px,1.8vw,24px);
    --stat-font-nudge: 1px; --stat-inset: clamp(5px, .7vw, 8px);
    --stat-ring: clamp(4px, .6vw, 6px); --x-width: 78%;
    --x-thick: clamp(4px, .6vw, 6px); --o-scale: .55;
    --o-inset: calc(var(--stat-inset) * var(--o-scale)); --mark-alpha: .75;
`;
const StatusBox = styled.span<{ $state?: OX | null }>`
    position: relative; width: var(--stat-size); height: var(--stat-size);
    border-radius: calc(var(--stat-size)*.28); background: #f6fbff;
    border: clamp(2px, .28vw, 3px) solid #dbe7ff; display: grid; place-items: center;
    font-size: var(--stat-font); transform: translateY(var(--stat-font-nudge));
    line-height: 1; color: ${UI.primary};
    &::after {
        content: ""; position: absolute; inset: var(--o-inset); border-radius: 999px;
        border: ${({ $state }) => ($state === "O" ? 'var(--stat-ring) solid rgba(249,93,93,var(--mark-alpha,.75))' : '0')};
        pointer-events: none;
    }
`;
const XMark = styled.span`
    position: absolute; inset: 0;
    &::before, &::after {
        content: ""; position: absolute; left: 50%; top: 50%;
        width: var(--x-width); height: var(--x-thick);
        background: rgba(249,93,93,var(--mark-alpha,.75)); border-radius: 3px;
    }
    &::before { transform: translate(-50%, -50%) rotate(45deg); }
    &::after { transform: translate(-50%, -50%) rotate(-45deg); }
`;
const RightCol = styled.div`
    position: relative; display: flex; flex-direction: column; align-items: flex-end;
    gap: clamp(6px,.9vw,10px); transform: translateY(var(--q-shift));
    & ${StatusTray} { transform: none; }
`;
const Emblem = styled.img`
    --emblem-size: clamp(110px, 15vw, 210px); --emblem-nudge-x: clamp(32px, 1vw, 64px);
    position: absolute; right: 0; bottom: calc(100% + clamp(6px,1vw,12px));
    width: var(--emblem-size); height: auto; user-select: none; pointer-events: none; z-index: 0;
    filter: drop-shadow(0 6px 14px rgba(0,0,0,.12)); transform: translateX(var(--emblem-nudge-x));
    @media (max-width: 640px) { display: none; }
`;

/* ====== 컴포넌트 ====== */
const DEFAULT_EMBLEM = emblem;

export default function InitialsQuizCard(props: Props) {
    const {
        index = 1,
        total = 3,
        question,
        initials,
        value = "",
        onChange,
        onSubmit,
        showResult = false,
        correctAnswer = "",
        progress,
        emblemSrc,
        emblemAlt,
        offsetY,
        headerOffset,
        onNext,
        resetSignal,
    } = props;

    const emblemURL = emblemSrc ?? DEFAULT_EMBLEM;

    const isCorrect = correctAnswer?.trim().length
        ? value.trim() === correctAnswer.trim()
        : false;

    const [stickyProgress, setStickyProgress] = React.useState<(OX | null)[]>(
        () => Array.from({ length: total }, () => null)
    );

    React.useEffect(() => {
        setStickyProgress(Array.from({ length: total }, () => null));
    }, [resetSignal, total]);

    React.useEffect(() => {
        // total 변동 시 길이 맞추기
        setStickyProgress((prev) => {
            const next = Array.from({ length: total }, (_, i) => prev[i] ?? null);
            return next;
        });
    }, [total]);

    React.useEffect(() => {
        if (!showResult) return;
        const pos = Math.min(index - 1, total - 1);
        const mark: OX = isCorrect ? "O" : "X";
        setStickyProgress((prev) => {
            if (prev[pos] === mark) return prev;
            const next = [...prev]; next[pos] = mark; return next;
        });
    }, [showResult, index, isCorrect, total]);

    const displayProgress = React.useMemo(() => {
        if (Array.isArray(progress)) {
            return Array.from({ length: total }, (_, i) => progress[i] ?? stickyProgress[i] ?? null) as (OX | null)[];
        }
        return stickyProgress;
    }, [progress, stickyProgress, total]);

    const isLast = index >= total;
    const ctaLabel = showResult ? (isLast ? "결과 보기" : "다음 문제") : "제출하기";

    const revealChars = (correctAnswer || "").replace(/\s/g, "");
    const tilesData = showResult ? [...revealChars] : initials;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showResult) onSubmit?.(); else onNext?.();
    };

    const tilesRef = React.useRef<HTMLDivElement>(null);
    const [singleLine, setSingleLine] = React.useState(true);

    React.useEffect(() => {
        const el = tilesRef.current;
        if (!el) return;
        const measure = () => {
            const children = Array.from(el.children) as HTMLElement[];
            const tops = new Set(children.map((ch) => ch.offsetTop));
            setSingleLine(tops.size <= 1);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        window.addEventListener("resize", measure);
        return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
    }, [showResult, correctAnswer, initials]);

    return (
        <Stage aria-live="polite">
            <SoftBlobsBackground />
            <GhanaFont />
            <Shell
                style={{
                    ["--ox-offset" as any]: typeof headerOffset === "number"
                        ? `${headerOffset}px` : (headerOffset ?? "110px"),
                    ["--raise" as any]: typeof offsetY === "number"
                        ? `${offsetY}px` : (offsetY ?? "-40px"),
                }}
            >
                <Card data-showresult={showResult}>
                    {/* 헤더 */}
                    <Header>
                        <QBox>
                            <Dots aria-label="진행 표시">
                                {Array.from({ length: total }).map((_, i) => {
                                    const current = i === index - 1;
                                    const filled = i < index; // 진행된 것(현재 포함)
                                    return (
                                        <Dot key={i} $filled={filled} $current={current}
                                             role="img" aria-label={`${i + 1}번 ${filled ? "진행됨" : "대기"}`} />
                                    );
                                })}
                            </Dots>
                            <QLabel>{`Q${Math.min(index, total)}`}</QLabel>
                            {showResult && <BigJudge $kind={isCorrect ? "O" : "X"} aria-hidden />}
                        </QBox>

                        <TitleWrap><Title>{question}</Title></TitleWrap>

                        <RightCol>
                            {emblemURL && <Emblem src={emblemURL} alt={emblemAlt ?? "엠블럼"} draggable={false} />}
                            <StatusTray aria-label="풀이 진행 현황">
                                {displayProgress.map((st, i) => (
                                    <StatusBox key={i} $state={st}
                                               aria-label={`${i + 1}번 ${st === "O" ? "정답" : st === "X" ? "오답" : "미답"}`}>
                                        {i + 1}
                                        {st === "X" && <XMark aria-hidden />}
                                    </StatusBox>
                                ))}
                            </StatusTray>
                        </RightCol>
                    </Header>

                    {/* 중앙 타일 */}
                    <Tiles
                        ref={tilesRef}
                        role="list"
                        aria-label={showResult ? "정답 타일" : "초성 타일"}
                        style={{
                            ['--tile-scale' as any]: singleLine ? 1.50 : 1,
                            ['--tile-min' as any]: singleLine ? '74px' : undefined,
                            ['--tile-nudge-y' as any]: singleLine ? 'clamp(12px, 3.5vh, 36px)' : '0px',
                        }}
                    >
                        {tilesData.map((ch, i) => (
                            <Tile key={`${ch}-${i}`} $reveal={showResult} $ok={isCorrect} aria-label={ch}>{ch}</Tile>
                        ))}
                    </Tiles>

                    {/* 하단 도크 */}
                    <InputDockIn>
                        <InputRow onSubmit={handleSubmit} aria-label="정답 입력">
                            <TextInput
                                type="text"
                                value={value}
                                onChange={(e) => onChange?.(e.target.value)}
                                placeholder="뜻을 참고하여 주어진 초성의 단어를 작성하세요."
                                aria-label="정답 입력"
                                disabled={showResult}
                                readOnly={showResult}
                            />
                            <SubmitBtn type="submit" disabled={!showResult && !value.trim()}>
                                {ctaLabel}
                            </SubmitBtn>
                        </InputRow>
                    </InputDockIn>
                </Card>
            </Shell>
        </Stage>
    );
}
