import React from "react";
import styled, { css, createGlobalStyle, keyframes } from "styled-components";
import SoftBlobsBackground from "./SoftBlobsBackground";
import emblem from "../assets/quiz/emblem.png"
import GhanaWoff2 from "../assets/fonts/ghana-choco/GhanaChocolate.woff2";

/* ====== 폰트 ====== */
const ASSET = process.env.MFE_PUBLIC_SERVICE || "";
const GhanaFont = createGlobalStyle`
    @font-face {
        font-family: 'GhanaChocolate';
        src: url(${GhanaWoff2}) format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }
`;

/* ====== 토큰 ====== */
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

type OX = "O" | "X";
type Props = {
    index?: number;
    total?: number;
    question: string;
    value?: OX | null;
    onChange?: (v: OX) => void;
    showResult?: boolean;
    correct?: OX;
    explanation?: string;
    /** 우상단 배지 (스샷의 ① ✕ ③) */
    stats?: { left?: React.ReactNode; wrong?: number; right?: React.ReactNode };
    progress?: (OX | null)[];
    onNext?: () => void;
    emblemSrc?: string;
    emblemAlt?: string;
};

const Dots = styled.div`
    position: absolute;
    left: 0;
    bottom: calc(100% + var(--dot-gap));
    display: inline-flex;
    gap: var(--dot-gap);
    z-index: 3;
`;

const Dot = styled.span<{ $active?: boolean }>`
    width: var(--dot-size);
    height: var(--dot-size);
    border-radius: calc(var(--dot-size) * 0.30);
    background: ${({ $active }) => ($active ? UI.primary : "#eff1f5")};
    border: 1.25px solid ${({ $active }) => ($active ? UI.primarySoft : UI.line)};
`;

const BigJudge = styled.span<{ $kind: 'O' | 'X' }>`
    /* 크기·위치 */
    --qj-size:   calc(var(--wm-size) * 1.58);
    --qj-x:      calc(var(--wm-size) * -0.05);
    --qj-y:      calc(var(--wm-size) * -0.30);

    /* 공통 스타일 */
    --qj-stroke: clamp(10px, 1.2vw, 14px);
    --qj-color:  rgba(249,93,93,var(--mark-alpha,.75));

    position: absolute;
    left: var(--qj-x);
    top:  var(--qj-y);
    width: var(--qj-size);
    height: var(--qj-size);
    pointer-events: none;
    z-index: 4;

    border-radius: 999px;
    background: transparent;
    box-shadow: none;

    ${({ $kind }) => $kind === 'O' ? css`
        /* O: 동일 두께의 도넛 */
        border: var(--qj-stroke) solid var(--qj-color);
    ` : css`
        /* X: 더 크고 굵게 */
        --x-len:   120%;                              /* ← 길이: 80% → 92% */
        --x-thick: calc(var(--qj-stroke) * 1.20);    /* ← 두께: 1.2배 */

        &::before, &::after{
            content: "";
            position: absolute;
            left: 50%; top: 50%;
            width: var(--x-len);
            height: var(--x-thick);
            background: var(--qj-color);
            border-radius: calc(var(--x-thick) / 2);   /* 라운드 캡 */
            transform-origin: center;
        }
        &::before{ transform: translate(-50%, -50%) rotate(45deg); }
        &::after { transform: translate(-50%, -50%) rotate(-45deg); }
    `}
`;

/* ====== 레이아웃 ====== */
const Stage = styled.div`
    position: relative;
    isolation: isolate;
    width: 100%;
    display: grid;
    place-items: center;
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
    --dot-gap:  clamp(6px, 1vw, 8px);
    --q-shift: calc(var(--wm-size) * -0.08);
    --pad: clamp(22px, 3.6vw, 36px);          /* ← 카드 패딩 변수 */
    --dock-space: clamp(160px, 22vw, 280px);   /* ← 도크 높이(예약) */
    --dock-hpad: clamp(22px, 3vw, 40px);   /* 도크를 위로 올리는 양 */
    --dock-vpad: clamp(16px, 2.2vw, 24px);
    --dock-round-top: clamp(28px, 3.2vw, 44px);
    --dock-lift: clamp(10px, 1.4vw, 18px);
    --dock-reveal: clamp(8px, 1vw, 12px);
    --dock-left-trim: clamp(10px, 1.2vw, 14px);
    --choices-top-gap: clamp(26px, 3vw, 44px);

    /* ▶ 진행 뱃지 사이즈 변수 */
    --stat-size:  clamp(34px, 2.6vw, 42px);   /* 박스 가로/세로 */
    --stat-font:  clamp(15px, 1.5vw, 18px);   /* 숫자 폰트 */
    --stat-gap:   clamp(6px, 0.9vw, 10px);   /* 박스 간격 */
    --stat-ring:  clamp(3px, .5vw, 4px);      /* O 표시 테두리 두께 */
    --stat-inset: clamp(7px, .9vw, 9px);      /* O 테두리 안쪽 여백 */
    --stat-br:    calc(var(--stat-size) * .28); /* 둥근 정도 */
    --card-top-inset: clamp(18px, 2.8vw, 48px);
    --mark-alpha: .75;

    position: relative;
    background: ${UI.panel};
    border: 1px solid ${UI.line};
    border-radius: ${UI.radius}px;
    box-shadow: ${UI.shadow};
    padding: var(--pad);
    padding-top: calc(var(--pad) + var(--card-top-inset));
    overflow: hidden;
    aspect-ratio: 16 / 9;
    min-height: clamp(520px, 56vw, 760px);
    width: 100%;
    margin: 0;
    box-sizing: border-box;

    &::after{ content: none; }
    
    &[data-showresult="true"]{
        padding-bottom: calc(var(--pad) + var(--dock-space));
    }
`;

const Header = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    column-gap: clamp(10px, 2vw, 16px);
    margin: 6px 0 18px;
    min-width: 0;
`;

/* Q 박스: Q와 그 위의 dot을 함께 묶음 */
const QBox = styled.div`
    position: relative;
    /* 왼쪽으로 더 붙이기 */
    padding-left: 0;
    /* 필요시 미세 조정: -2px ~ -8px 사이에서 취향대로 */
    margin-left: clamp(-6px, -0.5vw, -2px);
`;

/* 실제 Q 표시 (기존 Watermark 대체) */
const QLabel = styled.span`
  font-family: 'GhanaChocolate', 'Pretendard', 'Noto Sans KR', system-ui, sans-serif;
  font-weight: 400;
  font-size: var(--wm-size);
  line-height: 1;
  color: #121212;
  display: block;
`;

const Watermark = styled.span`
    position: absolute;
    left: clamp(10px, 2vw, 18px);
    top: var(--wm-top);
    z-index: 1;
    font-family: 'GhanaChocolate', 'Pretendard', 'Noto Sans KR', system-ui, sans-serif;
    font-weight: 400;
    font-size: var(--wm-size);
    line-height: 1;
    color: #121212;
    user-select: none;
    pointer-events: none;
    @media (max-width: 640px){ display:none; }
`;

/* 우상단 배지 */
const Pills = styled.div`
    position: absolute; top: 14px; right: 14px;
    display: inline-flex; gap: 8px;
`;
const Pill = styled.span<{ $danger?: boolean }>`
    min-width: 28px; height: 28px; padding: 0 8px;
    border-radius: 8px;
    display: inline-grid; place-items: center;
    font-weight: 800; font-size: 16px; letter-spacing: -.01em;
    background: #fff;
    color: ${({ $danger }) => ($danger ? UI.danger : UI.primary)};
    border: 2px solid ${({ $danger }) => ($danger ? UI.dangerSoft : UI.primarySoft)};
    box-shadow: 0 6px 14px rgba(62,99,224,.10);
`;

/* 헤더 */
const TitleRow = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 12px 0 26px;
`;

/* Title에서 transform은 제거 (TitleWrap으로 이동) */
const Title = styled.h2`
  margin: 0;
  font-size: clamp(18px, 2.4vw, 26px);
  font-weight: 750;
  color: ${UI.text};
  letter-spacing: -0.02em;
  line-height: 1.25;
`;

/* 제목 줄 컨테이너: 제목 + 상태뱃지 */
const TitleWrap = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    transform: translateY(var(--q-shift));
    min-width: 0;
    overflow-wrap: anywhere;
`;

/* O / X 선택 영역 */
const Choices = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(16px, 3vw, 36px);
    align-items: start;
    justify-items: center;
    margin: var(--choices-top-gap) 0 28px;
`;

const circleBase = css`
    width: clamp(120px, 22vw, 180px);
    height: clamp(120px, 22vw, 180px);
    border-radius: 999px;
    display: grid; place-items: center;
    background: #5670f1;
    box-shadow:
            0 10px 24px rgba(29, 78, 216, .25),
            inset 0 1px 0 rgba(255,255,255,.25);
    border: 1px solid rgba(0,0,0,.04);
`;

const OXButton = styled.button<{
    $active?: boolean;
    $state?: "idle" | "correct" | "wrong";
}>`
    ${circleBase}
    position: relative; border: none; cursor: pointer;
    transition: transform .08s ease, filter .15s ease, box-shadow .2s ease;
    &:hover { filter: brightness(.98); }
    &:active { transform: translateY(1px) scale(.995); }
    &:focus-visible { outline: 3px solid rgba(62,99,224,.35); outline-offset: 3px; }

    ${({ $active }) => $active && css`
        box-shadow: 0 16px 28px rgba(34,197,94,.18), inset 0 1px 0 rgba(255,255,255,.25);
        filter: saturate(1.05);
    `}
    ${({ $state }) => $state === "correct" && css`
        box-shadow: 0 18px 30px rgba(40,200,163,.28);
        outline: 3px solid ${UI.success};
        outline-offset: 4px;
    `}
    ${({ $state }) => $state === "wrong" && css`
        box-shadow: 0 18px 30px rgba(249,93,93,.22);
        outline: 3px solid ${UI.danger};
        outline-offset: 4px;
        filter: grayscale(.1) brightness(.96);
    `}
`;

/* O / X 아이콘 */
const OIcon: React.FC<{ pristine?: boolean }> = ({ pristine }) => (
    <svg width="66%" viewBox="0 0 200 200" aria-hidden focusable="false">
        {/* 바깥 고리 / 안쪽 원 색을 '처음 상태'에 중립 톤으로 */}
        <circle
            cx="100"
            cy="100"
            r="70"
            fill={pristine ? "#cfe0ff" : "#79e8f6"}   // ← 처음엔 연한 블루 톤
        />
        <circle
            cx="100"
            cy="100"
            r="44"
            fill={pristine ? "#e7fbff" : "#5670f1"}
        />
    </svg>
);

const XIcon = () => (
    <svg width="58%" viewBox="0 0 200 200" aria-hidden focusable="false">
        <rect x="84" y="32" width="32" height="136" rx="16" transform="rotate(45 100 100)" fill="#e7fbff"/>
        <rect x="84" y="32" width="32" height="136" rx="16" transform="rotate(-45 100 100)" fill="#e7fbff"/>
    </svg>
);

/* 선택 체크 */
const popIn = keyframes`
  0%   { transform: scale(.6); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;
const ping = keyframes`
  0%   { transform: scale(.9); opacity: .25; }
  100% { transform: scale(1.6); opacity: 0; }
`;
/* 선택 체크 - 글래스 배지 + 팝인 */
const SelectedMark = styled.span`
  --size: clamp(22px, 4.2vw, 34px);
  --ring: 2px;
  --tick-color: ${UI.primary};

  position: absolute;
  top: 8%;
  right: 10%;
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 2;
  color: var(--tick-color);

  /* 글래스 느낌 배경 */
  background:
    radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,.95), rgba(255,255,255,.7) 60%, rgba(255,255,255,.55)),
    linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.35));
  border: var(--ring) solid rgba(255,255,255,.85);
  box-shadow:
    0 6px 16px rgba(62,99,224,.22),
    inset 0 1px 0 rgba(255,255,255,.6);

  /* 등장 효과 */
  animation: ${popIn} .26s cubic-bezier(.2,.9,.2,1) both;
  will-change: transform, opacity;

  /* 외곽 파동 */
  &::before{
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: inherit;
    border: 2px solid rgba(62,99,224,.25);
    animation: ${ping} .5s ease-out both;
  }

  /* 체크 아이콘 */
  &::after{
    content: "";
    width: 64%;
    height: 64%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
   /* 살짝 하이라이트/그림자 */
   filter: drop-shadow(0 1px 0 rgba(255,255,255,.6))
           drop-shadow(0 2px 6px rgba(62,99,224,.28));
   /* UI.primary(#3E63E0) 컬러로 둥근 체크 */
    background-image: url("data:image/svg+xml;utf8,\\
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' \\
stroke='%233E63E0' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'>\\
<path d='M5 12.5 L10 17.5 L19 7.5'/></svg>");
  }
`;

const pillIn = keyframes`
  0%   { transform: translateY(6px); opacity: 0; }
  100% { transform: translateY(0);   opacity: 1; }
`;

/* 버튼 + 배지 래퍼 */
const ChoiceItem = styled.div`
  display: grid;
  place-items: center;
  align-items: start;
  row-gap: clamp(8px, 1vw, 12px);
`;

/* 정답 배지 */
const AnswerPill = styled.span<{ $kind?: 'correct' | 'wrong' }>`
    --pill-offset: clamp(10px, 1.6vw, 20px); /* 버튼과의 간격(필요시 조절) */
    margin-top: var(--pill-offset);
    padding: 7px 12px;
    border-radius: 999px;
    font-family: 'Pretendard','Noto Sans KR',system-ui,sans-serif;
    font-weight: 800;
    font-size: clamp(12px, 1.6vw, 15px);
    line-height: 1;
    white-space: nowrap;
    animation: ${pillIn} .22s ease-out both;

    /* ResultDock와 유사한 색감 */
    color: ${({ $kind }) => ($kind === 'wrong' ? UI.danger : UI.primary)};
    background: ${({ $kind }) =>
            $kind === 'wrong'
                    ? `linear-gradient(180deg, #fff4f4 0%, ${UI.dangerSoft} 100%)`
                    : `linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%)`};
    border: 1px solid
    ${({ $kind }) => ($kind === 'wrong' ? 'rgba(249,93,93,.28)' : '#cfe0ff')};

    /* ResultDock의 그림자/내측 헤어라인 느낌 */
    box-shadow:
            0 6px 12px rgba(62,99,224,.10),
            inset 0 1px 0 rgba(62,99,224,.16);

    /* 상단 쪽이 조금 더 밝게 보이도록 */
    position: relative;
    &::before{
        content:"";
        position:absolute; inset:0;
        border-radius:inherit;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.65);
        pointer-events:none;
    }
`;

/* ====== 상단 진행 뱃지 ====== */
const StatusBox = styled.span<{ $state?: OX | null }>`
    position: relative;
    width: var(--stat-size);
    height: var(--stat-size);
    border-radius: var(--stat-br);
    background: #f6fbff;
    border: clamp(2px, .28vw, 3px) solid #dbe7ff;
    display: grid;
    place-items: center;
    font-family: inherit;
    font-weight: inherit;
    font-size: var(--stat-font);
    transform: translateY(var(--stat-font-nudge, 0px));
    line-height: 1;
    color: ${UI.primary};

    /* 정답이면 숫자 주위에 붉은 동그라미 */
    &::after{
        content:"";
        position:absolute;
        inset: var(--o-inset, var(--stat-inset));
        border-radius: 999px;
        border: ${({ $state }) =>
                ($state === "O"
                    ? `${'var(--stat-ring)'} solid rgba(249,93,93,var(--mark-alpha,.75))`
                    : "0")};
        pointer-events:none;
    }
`;

const StatusTray = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--stat-gap);
    transform: translateY(var(--q-shift));
    font-family: 'GhanaChocolate','Pretendard','Noto Sans KR',system-ui,sans-serif;
    font-weight: 400;                 
    letter-spacing: -.02em;
    -webkit-font-smoothing: antialiased;
    font-variant-numeric: tabular-nums; /* 자릿수 정렬 안정화(지원시) */
    --stat-font: clamp(17px, 1.8vw, 24px);
    --stat-font-nudge: 1px;
    --stat-inset: clamp(5px, .7vw, 8px);
    --stat-ring:  clamp(4px, .6vw, 6px);
    --x-width: 78%;
    --x-thick: clamp(4px, .6vw, 6px);
    --o-scale: .55;
    --o-inset: calc(var(--stat-inset) * var(--o-scale));
    --mark-alpha: .75;
`;

/* 오답 X 마크 */
const XMark = styled.span`
    position: absolute;
    inset: 0;
    &::before, &::after{
        content:"";
        position:absolute; left:50%; top:50%;
        width: var(--x-width, 78%);
        height: var(--x-thick, 4px);
        background: rgba(249,93,93,var(--mark-alpha,.75));
        border-radius: 3px;
    }
    &::before{ transform: translate(-50%, -50%) rotate(45deg); }
    &::after { transform: translate(-50%, -50%) rotate(-45deg); }
`;

/* ====== 카드 아래 결과 도크 ====== */
const ResultDock = styled.section<{ $correct?: boolean }>`
    border: 1px solid #cfe0ff;
    border-radius: 26px;
    box-shadow: 0 6px 18px rgba(62,99,224,.08);
    padding: clamp(18px, 2.2vw, 28px) clamp(22px, 2.6vw, 32px);
    color: ${UI.text};
`;
const RRow = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  align-items: baseline;           
  gap: 12px;
  & + & { margin-top: clamp(10px, 1.2vw, 14px); }
`;
const RKey = styled.span`
    font-family: 'GhanaChocolate','Pretendard','Noto Sans KR',system-ui,sans-serif;
    color: ${UI.primary};
    font-weight: 400;
    letter-spacing: -0.02em;
    font-size: clamp(18px, 2.2vw, 24px);
    line-height: 1.1;
    &:before { content: "·"; margin-right: 8px; }
`;
const RVal = styled.span<{ $center?: boolean }>`
  font-family: 'Pretendard','Noto Sans KR',system-ui,sans-serif;
  font-weight: 700;
  line-height: 1.1;                     
  padding-top: 10px ;
  font-size: clamp(18px, 2.2vw, 24px);
  color: ${UI.text};
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  transform: translateY(var(--rval-nudge, 2px));
  text-align: ${({ $center }) => ($center ? "center" : "left")};
  justify-self: ${({ $center }) => ($center ? "center" : "start")};
`;
const ResultDockIn = styled.section<{ $correct?: boolean }>`
  position: absolute;
  left:  calc(-1 * var(--pad) + var(--dock-reveal));
  right: calc(-1 * var(--pad) + var(--dock-reveal));
  bottom: calc(-1 * var(--pad));
  transform: translateY(calc(-1 * var(--dock-lift)));
  box-sizing: border-box;
  min-height: var(--dock-space);
  max-height: calc(var(--dock-space));
  overflow: auto;
  background: #f3f8ff;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #cfe0ff;
  border-top-width: 2px;     
  border-top-color: #c4d4ff; 

  border-top-left-radius: var(--dock-round-top);
  border-top-right-radius: var(--dock-round-top);
  border-bottom-left-radius: ${UI.radius}px;
  border-bottom-right-radius: ${UI.radius}px;

  box-shadow: 0 6px 18px rgba(62,99,224,.08),
                inset 0 1px 0 rgba(62,99,224,.16);
  padding-top: calc(var(--dock-vpad) + 8px);
  padding-bottom: var(--dock-vpad);
  padding-left:  calc(var(--pad) + var(--dock-hpad) - var(--dock-left-trim));
  padding-right: calc(var(--pad) + var(--dock-hpad));
  color: ${UI.text};
  &::before{
      content:"";
      position:absolute; inset:0 0 auto 0; height: max(10px, calc(var(--dock-round-top)*0.9));
      border-top-left-radius: inherit; border-top-right-radius: inherit;
      pointer-events:none;
      box-shadow: inset 0 6px 12px rgba(255,255,255,.35);
  }
`;

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const FooterRow = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: clamp(8px, 1.2vw, 14px);
    position: relative;
    z-index: 2;
    animation: ${fadeInUp} .18s ease-out both;
`;

const NextButton = styled.button`
  appearance: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: clamp(34px, 4vw, 44px);
  padding: 0 clamp(12px, 1.6vw, 16px);
  border-radius: 12px;
  font-weight: 750;
  font-size: clamp(14px, 1.6vw, 16px);
  letter-spacing: -0.02em;
  color: #fff;
  background: #3E63E0;
  cursor: pointer;
  transition: transform .08s ease, filter .15s ease, box-shadow .2s ease;

  &:hover { filter: brightness(1.04); transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  &:focus-visible { outline: 3px solid rgba(62,99,224,.35); outline-offset: 3px; }

  &:disabled{
    opacity: .55;
    cursor: not-allowed;
    transform: none;
  }
`;

const FloatingNext = styled.div<{ $showDock?: boolean }>`
  position: absolute;
  right: var(--pad);
  bottom: ${({ $showDock }) =>
    $showDock
        ? 'calc(var(--pad) + var(--dock-space) + -40px)'
        : 'var(--pad)'};
  z-index: 6;
  animation: ${fadeInUp} .18s ease-out both;
`;

const RightCol = styled.div`
  position: relative;      
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: clamp(6px, .9vw, 10px);
  transform: translateY(var(--q-shift));
      & ${/* sc-selector */StatusTray} { transform: none; }
`;

const Emblem = styled.img`
  --emblem-size: clamp(110px, 15vw, 210px);
  --emblem-nudge-x: clamp(32px, 1vw, 64px);
  position: absolute;
  right: 0;
  bottom: calc(100% + clamp(6px, 1vw, 12px));
  width: var(--emblem-size);
  height: auto;
  user-select: none;
  pointer-events: none;
  z-index: 0; 
  filter: drop-shadow(0 6px 14px rgba(0,0,0,.12));
  transform: translateX(var(--emblem-nudge-x)); 
  @media (max-width: 640px){ display:none; } 
`;


const DEFAULT_EMBLEM = emblem;

/* ====== 컴포넌트 ====== */
export default function OXQuizCard({
                                       index = 1,
                                       total = 3,
                                       question,
                                       value = null,
                                       onChange,
                                       showResult = false,
                                       correct = "O",
                                       explanation = "텍스트를 입력하세요.",
                                       stats,
                                       progress,
                                       onNext,
                                       emblemSrc,
                                       emblemAlt,
                                   }: Props) {
    const isCorrect = value != null && value === correct;
    const activeDot = Math.min(index, total);

    const stateFor = (choice: OX): "idle"|"correct"|"wrong" => {
        if (!showResult) return "idle";
        if (choice === correct) return "correct";
        if (choice === value) return "wrong";
        return "idle";
    };

    const judge: "correct" | "wrong" | null =
        value == null ? null : value === correct ? "correct" : "wrong";

    const computedProgress = React.useMemo(() => {
        const base = Array.from({ length: total }, () => null) as (OX | null)[];
        if (Array.isArray(progress)) {
            for (let i = 0; i < Math.min(progress.length, total); i++) base[i] = progress[i];
        } else {
            base[index - 1] = value == null ? null : value === correct ? "O" : "X";
        }
        return base;
    }, [progress, total, index, value, correct]);

    const pristine = value == null && !showResult;

    const canGoNext = value != null;

    const isLast = index >= total;
    const ctaLabel = isLast ? "결과 보기" : "다음 문제";
    const showCTA = canGoNext && (!isLast || !showResult);
    const emblemURL = emblemSrc ?? DEFAULT_EMBLEM;

    return (
        <Stage aria-live="polite">
            <SoftBlobsBackground />
            <GhanaFont />
            <Shell
                style={{
                    ['--ox-offset' as any]: '110px',
                    ['--raise' as any]: '-40px',
                }}
            >
                <Card data-showresult={showResult}>
                    <Header>
                        <QBox>
                            <Dots aria-hidden>
                                {Array.from({ length: total }).map((_, i) => (
                                    <Dot key={i} $active={i + 1 === Math.min(index, total)} />
                                ))}
                            </Dots>
                            <QLabel>{`Q${index}`}</QLabel>
                            {/* 결과 공개 시 Q 라벨 위에 크게 O/X 오버레이 */}
                             {showResult && value != null && (
                               <BigJudge $kind={value === correct ? 'O' : 'X'} aria-hidden />
                             )}
                        </QBox>

                        <TitleWrap>
                            <Title>{question}</Title>
                        </TitleWrap>

                        <RightCol>
                            {emblemURL && (
                                <Emblem
                                    src={emblemURL}
                                    alt={emblemAlt ?? "엠블럼"}
                                    draggable={false}
                                />
                            )}
                            <StatusTray aria-label="풀이 진행 현황">
                                {computedProgress.map((st, i) => (
                                    <StatusBox key={i} $state={st} aria-label={`${i + 1}번 ${st === "O" ? "정답" : st === "X" ? "오답" : "미답"}`}>
                                        {i + 1}
                                        {st === "X" && <XMark aria-hidden />}
                                    </StatusBox>
                                ))}
                            </StatusTray>
                        </RightCol>
                    </Header>

                    {/* 선택 영역 */}
                    <Choices role="radiogroup" aria-label={`문항 ${index} OX 선택`}>
                        <ChoiceItem>
                            <OXButton
                                type="button"
                                aria-checked={value === "O"}
                                role="radio"
                                $active={value === "O"}
                                $state={stateFor("O")}
                                onClick={() => onChange?.("O")}
                            >
                                <OIcon pristine={pristine} />
                                {value === "O" && <SelectedMark />}
                            </OXButton>
                            {showResult && correct === "O" && (
                                <AnswerPill aria-live="polite">정답!</AnswerPill>
                            )}
                        </ChoiceItem>

                        <ChoiceItem>
                            <OXButton
                                type="button"
                                aria-checked={value === "X"}
                                role="radio"
                                $active={value === "X"}
                                $state={stateFor("X")}
                                onClick={() => onChange?.("X")}
                            >
                                <XIcon />
                                {value === "X" && <SelectedMark />}
                            </OXButton>
                            {showResult && correct === "X" && (
                                <AnswerPill
                                    $kind="correct"
                                    style={{ visibility: showResult && correct === "X" ? "visible" : "hidden" }}
                                    aria-live="polite"
                                >
                                    정답!
                                </AnswerPill>
                            )}
                        </ChoiceItem>
                    </Choices>
                    {canGoNext && (
                        <FloatingNext $showDock={showResult}>
                            <NextButton
                                type="button"
                                onClick={() => onNext?.()}
                                aria-label={ctaLabel}
                            >
                                {ctaLabel}
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
                                    <path d="M13 5l7 7-7 7M5 12h14" fill="none" stroke="white" strokeWidth="2"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </NextButton>
                        </FloatingNext>
                    )}
                    {/* 결과는 카드 밖, 바로 아래 */}
                    {showResult && (
                            <ResultDockIn $correct={isCorrect}>
                              <RRow>
                                <RKey>정답</RKey>
                                <RVal>{correct}</RVal>
                              </RRow>
                              <RRow>
                                <RKey>해설</RKey>
                                <RVal>{explanation}</RVal>
                              </RRow>
                            </ResultDockIn>
                          )}
                </Card>
            </Shell>
        </Stage>
    );
}