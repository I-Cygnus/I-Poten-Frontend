import React from "react";
import styled, { css, createGlobalStyle, keyframes } from "styled-components";
import SoftBlobsBackground from "./SoftBlobsBackground.tsx";
import emblem from "../../assets/quiz/emblem.png";
import GhanaWoff2 from "../../assets/fonts/ghana-choco/GhanaChocolate.woff2?url";

/* ====== 폰트 ====== */
const GhanaFont = createGlobalStyle`
  @font-face {
    font-family: 'GhanaChocolate';
    src: url('${GhanaWoff2}') format('woff2');
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
    explanation?: string | null;

    progress?: (OX | null)[];
    onNext?: () => void;
    onGoto?: (qNumber1Based: number) => void;

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
  border-radius: calc(var(--dot-size) * 0.3);
  background: ${({ $active }) => ($active ? UI.primary : "#eff1f5")};
  border: 1.25px solid ${({ $active }) => ($active ? UI.primarySoft : UI.line)};
`;

const BigJudge = styled.span<{ $kind: "O" | "X" }>`
  --qj-size: calc(var(--wm-size) * 1.58);
  --qj-x: calc(var(--wm-size) * -0.05);
  --qj-y: calc(var(--wm-size) * -0.30);

  --qj-stroke: clamp(10px, 1.2vw, 14px);
  --qj-color: rgba(249, 93, 93, var(--mark-alpha, 0.75));

  position: absolute;
  left: var(--qj-x);
  top: var(--qj-y);
  width: var(--qj-size);
  height: var(--qj-size);
  pointer-events: none;
  z-index: 4;

  border-radius: 999px;
  background: transparent;

  ${({ $kind }) =>
    $kind === "O"
        ? css`
          border: var(--qj-stroke) solid var(--qj-color);
        `
        : css`
          --x-len: 120%;
          --x-thick: calc(var(--qj-stroke) * 1.2);

          &::before,
          &::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            width: var(--x-len);
            height: var(--x-thick);
            background: var(--qj-color);
            border-radius: calc(var(--x-thick) / 2);
            transform-origin: center;
          }
          &::before {
            transform: translate(-50%, -50%) rotate(45deg);
          }
          &::after {
            transform: translate(-50%, -50%) rotate(-45deg);
          }
        `}
`;

/* ====== 레이아웃 (객관식과 동일 베이스) ====== */
const Stage = styled.div`
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(12px, 2vw, 24px);

  body[data-card-modal="true"] & {
    padding: 0;
    place-items: stretch;
  }
`;

const Shell = styled.div`
  --ox-offset: 110px;
  --raise: -40px;

  width: 100%;
  max-width: 1180px;
  min-height: calc(100dvh - var(--ox-offset, 0px));
  display: grid;
  place-items: center;
  gap: 12px;
  margin: 0 auto;
  transform: translateY(var(--raise, 0px));

  body[data-card-modal="true"] & {
    --ox-offset: 0px;
    --raise: 0px;
    max-width: none;
    width: 100%;
    height: 100%;
    min-height: 100%;
    place-items: stretch;
    gap: 0;
    margin: 0;
    transform: none;
  }
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
  --dock-lift: clamp(10px, 1.4vw, 18px);
  --dock-up: clamp(10px, 1.4vw, 18px);
  --dock-down: clamp(14px, 1.6vw, 20px);
  --dock-reveal: clamp(8px, 1vw, 12px);
  --dock-left-trim: clamp(10px, 1.2vw, 14px);
  --choices-top-gap: clamp(26px, 3vw, 44px);

  --card-top-inset: clamp(18px, 2.8vw, 48px);
  --mark-alpha: 0.75;

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
  box-sizing: border-box;

  &[data-showresult="true"] {
    padding-bottom: calc(var(--pad) + var(--dock-space));
  }

  body[data-card-modal="true"] & {
      height: 100%;
      min-height: 0;
      width: 100%;
      border-radius: 18px;
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

const QBox = styled.div`
  position: relative;
  margin-left: clamp(-6px, -0.5vw, -2px);
`;

const QLabel = styled.span`
  font-family: "GhanaChocolate", "Pretendard", "Noto Sans KR", system-ui, sans-serif;
  font-weight: 400;
  font-size: var(--wm-size);
  line-height: 1;
  color: #121212;
  display: block;
`;

const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  transform: translateY(var(--q-shift));
  min-width: 0;
  overflow-wrap: anywhere;
`;

const MeaningfulWrap = css`
  white-space: pre-wrap;      /* \n, 문장 단위 개행 유지 */
  word-break: keep-all;       /* 한국어 단어 중간(가나다라) 쪼개짐 방지 */
  overflow-wrap: break-word;  /* URL/긴영단어/코드 같은 긴 토큰은 줄 넘치면 분해 */
  line-break: strict;         /* CJK 줄바꿈 품질 개선(지원 브라우저에서만 적용) */
  hyphens: auto;              /* 영문 하이픈 분할(가능할 때) */
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(18px, 2.4vw, 26px);
  font-weight: 750;
  color: ${UI.text};
  letter-spacing: -0.02em;
  line-height: 1.25;
  ${MeaningfulWrap}
`;

const Emblem = styled.img`
    --emblem-size: clamp(110px, 15vw, 210px);
    --emblem-nudge-x: clamp(28px, 1.6vw, 84px);

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

    @media (max-width: 640px) { display: none; }
`;

/* 우측 진행 뱃지 (객관식과 동일 톤) */
const StatusTray = styled.div`
    display: inline-flex;
    align-items: center;
    gap: clamp(6px, .9vw, 10px);
    transform: translateY(var(--q-shift));
    font-family: "GhanaChocolate", "Pretendard", "Noto Sans KR", system-ui, sans-serif;
    font-weight: 400;
    letter-spacing: -0.02em;
    -webkit-font-smoothing: antialiased;
    font-variant-numeric: tabular-nums;

    --stat-size:  clamp(34px, 2.6vw, 42px);
    --stat-font:  clamp(17px, 1.8vw, 24px);
    --stat-inset: clamp(5px, .7vw, 8px);
    --stat-ring:  clamp(4px, .6vw, 6px);
    --x-width: 78%;
    --x-thick: clamp(4px, .6vw, 6px);
    --o-scale: .55;
    --o-inset: calc(var(--stat-inset) * var(--o-scale));
    --mark-alpha: .75;
`;

const StatusNum = styled.span`
  position: relative;
  z-index: 2;
`;

const OMark = styled.span`
    position: absolute;
    inset: var(--o-inset, var(--stat-inset));
    border-radius: 999px;
    pointer-events: none;
    z-index: 1;

    border: var(--stat-ring) solid rgba(249, 93, 93, var(--mark-alpha, 0.75));
`;

const StatusBtn = styled.button<{ $state?: OX | null; $active?: boolean }>`
    all: unset;
    position: relative;
    width: var(--stat-size);
    height: var(--stat-size);
    border-radius: calc(var(--stat-size) * .28);
    background: #f6fbff;
    border: clamp(2px, .28vw, 3px) solid #dbe7ff;

    display: grid;
    place-items: center;
    color: ${UI.primary};
    font-family: inherit;
    font-weight: inherit;
    font-size: var(--stat-font);
    line-height: 1;
    cursor: pointer;

    &[disabled] {
        cursor: default;
        opacity: .65;
    }

    &:focus-visible {
        outline: 3px solid rgba(62,99,224,.35);
        outline-offset: 3px;
    }
`;

const XMark = styled.span`
    position: absolute;
    inset: 0;

    &::before,
    &::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: var(--x-width, 78%);
        height: var(--x-thick, 4px);
        background: rgba(249, 93, 93, var(--mark-alpha, 0.75));
        border-radius: 3px;
    }
    &::before {
        transform: translate(-50%, -50%) rotate(45deg);
    }
    &::after {
        transform: translate(-50%, -50%) rotate(-45deg);
    }
`;

const RightCol = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: clamp(6px, .9vw, 10px);
    transform: translateY(var(--q-shift));

    & ${StatusTray} {
        transform: none;
    }
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
  display: grid;
  place-items: center;
  background: #5670f1;
  box-shadow: 0 10px 24px rgba(29, 78, 216, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const OXButton = styled.button<{
    $active?: boolean;
    $state?: "idle" | "correct" | "wrong";
}>`
  ${circleBase}
  position: relative;
  border: none;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    filter: brightness(0.98);
  }
  &:active {
    transform: translateY(1px) scale(0.995);
  }
  &:focus-visible {
    outline: 3px solid rgba(62, 99, 224, 0.35);
    outline-offset: 3px;
  }

  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 16px 28px rgba(34, 197, 94, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
      filter: saturate(1.05);
    `}

  ${({ $state }) =>
    $state === "correct" &&
    css`
      box-shadow: 0 18px 30px rgba(40, 200, 163, 0.28);
      outline: 3px solid ${UI.success};
      outline-offset: 4px;
    `}

  ${({ $state }) =>
    $state === "wrong" &&
    css`
      box-shadow: 0 18px 30px rgba(249, 93, 93, 0.22);
      outline: 3px solid ${UI.danger};
      outline-offset: 4px;
      filter: grayscale(0.1) brightness(0.96);
    `}
`;

const OIcon: React.FC<{ pristine?: boolean }> = ({ pristine }) => (
    <svg width="66%" viewBox="0 0 200 200" aria-hidden focusable="false">
        <circle cx="100" cy="100" r="70" fill={pristine ? "#cfe0ff" : "#79e8f6"} />
        <circle cx="100" cy="100" r="44" fill={pristine ? "#e7fbff" : "#5670f1"} />
    </svg>
);

const XIcon = () => (
    <svg width="58%" viewBox="0 0 200 200" aria-hidden focusable="false">
        <rect x="84" y="32" width="32" height="136" rx="16" transform="rotate(45 100 100)" fill="#e7fbff" />
        <rect x="84" y="32" width="32" height="136" rx="16" transform="rotate(-45 100 100)" fill="#e7fbff" />
    </svg>
);

const popIn = keyframes`
  0%   { transform: scale(.6); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;
const ping = keyframes`
  0%   { transform: scale(.9); opacity: .25; }
  100% { transform: scale(1.6); opacity: 0; }
`;

const SelectedMark = styled.span`
  --size: clamp(22px, 4.2vw, 34px);
  --ring: 2px;

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
  color: ${UI.primary};

  background: radial-gradient(120% 120% at 30% 20%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.7) 60%, rgba(255, 255, 255, 0.55)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.35));
  border: var(--ring) solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 6px 16px rgba(62, 99, 224, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.6);

  animation: ${popIn} 0.26s cubic-bezier(0.2, 0.9, 0.2, 1) both;

  &::before {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: inherit;
    border: 2px solid rgba(62, 99, 224, 0.25);
    animation: ${ping} 0.5s ease-out both;
  }

  &::after {
    content: "";
    width: 64%;
    height: 64%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.6)) drop-shadow(0 2px 6px rgba(62, 99, 224, 0.28));
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

const ChoiceItem = styled.div`
  display: grid;
  place-items: center;
  align-items: start;
  row-gap: clamp(8px, 1vw, 12px);
`;

const AnswerPill = styled.span<{ $kind?: "correct" | "wrong" }>`
  margin-top: clamp(10px, 1.6vw, 20px);
  padding: 7px 12px;
  border-radius: 999px;
  font-family: "Pretendard", "Noto Sans KR", system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(12px, 1.6vw, 15px);
  line-height: 1;
  white-space: nowrap;
  animation: ${pillIn} 0.22s ease-out both;

  color: ${({ $kind }) => ($kind === "wrong" ? UI.danger : UI.primary)};
  background: ${({ $kind }) =>
    $kind === "wrong"
        ? `linear-gradient(180deg, #fff4f4 0%, ${UI.dangerSoft} 100%)`
        : `linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%)`};
  border: 1px solid ${({ $kind }) => ($kind === "wrong" ? "rgba(249,93,93,.28)" : "#cfe0ff")};

  box-shadow: 0 6px 12px rgba(62, 99, 224, 0.1), inset 0 1px 0 rgba(62, 99, 224, 0.16);
`;

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const FloatingNext = styled.div<{ $showDock?: boolean }>`
    position: absolute;
    right: var(--pad);
    bottom: ${({ $showDock }) =>
            $showDock
                    ? "calc(var(--pad) + var(--dock-space) - 20px - var(--dock-down))"
                    : "calc(var(--pad) + 10px - var(--dock-down))"};
    z-index: 6;
    animation: ${fadeInUp} 0.18s ease-out both;
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
  background: #3e63e0;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    filter: brightness(1.04);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:focus-visible {
    outline: 3px solid rgba(62, 99, 224, 0.35);
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultDockIn = styled.section`
  position: absolute;
  left: calc(-1 * var(--pad) + var(--dock-reveal));
  right: calc(-1 * var(--pad) + var(--dock-reveal));
  bottom: calc(-1 * var(--pad));
  transform: translateY(calc(-1 * (var(--dock-lift) + var(--dock-up)) + var(--dock-down)));

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

  box-shadow: 0 6px 18px rgba(62, 99, 224, 0.08), inset 0 1px 0 rgba(62, 99, 224, 0.16);

  padding-top: calc(var(--dock-vpad) + 8px);
  padding-bottom: var(--dock-vpad);
  padding-left: calc(var(--pad) + var(--dock-hpad) - var(--dock-left-trim));
  padding-right: calc(var(--pad) + var(--dock-hpad));
  color: ${UI.text};

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: max(10px, calc(var(--dock-round-top) * 0.9));
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    pointer-events: none;
    box-shadow: inset 0 6px 12px rgba(255, 255, 255, 0.35);
  }
`;

const RRow = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  align-items: baseline;
  gap: 12px;
  & + & {
    margin-top: clamp(10px, 1.2vw, 14px);
  }
`;

const RKey = styled.span`
  font-family: "GhanaChocolate", "Pretendard", "Noto Sans KR", system-ui, sans-serif;
  color: ${UI.primary};
  font-weight: 400;
  letter-spacing: -0.02em;
  font-size: clamp(18px, 2.2vw, 24px);
  line-height: 1.1;
  &:before {
    content: "·";
    margin-right: 8px;
  }
`;

const RVal = styled.span`
  font-family: "Pretendard", "Noto Sans KR", system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.1;
  padding-top: 10px;
  font-size: clamp(18px, 2.2vw, 24px);
  color: ${UI.text};
  white-space: normal;
  ${MeaningfulWrap}
`;

const DEFAULT_EMBLEM = emblem;

/* ====== 컴포넌트 ====== */
export default function DailyOXCard({
                                       index = 1,
                                       total = 3,
                                       question,
                                       value = null,
                                       onChange,
                                       showResult = false,
                                       correct = "O",
                                       explanation = null,
                                       progress,
                                       onNext,
                                       onGoto,
                                       emblemSrc,
                                       emblemAlt,
                                   }: Props) {
    const [localValue, setLocalValue] = React.useState<OX | null>(null);

    // 부모가 value를 내려주면 로컬도 동기화
    React.useEffect(() => {
        if (value != null) setLocalValue(value);
    }, [value]);

    const effectiveValue: OX | null = value ?? localValue;

    const computedProgress = React.useMemo<(OX | null)[]>(() => {
        // 1) 부모 progress를 먼저 깔기(길이 보정)
        const base = Array.from({ length: total }, (_, i) =>
            Array.isArray(progress) ? (progress[i] ?? null) : null
        ) as (OX | null)[];

        // 2) 현재 문제는 카드가 알고 있는 value/correct로 "무조건" 덮어쓰기
        //    (부모 progress가 아직 업데이트 안 됐어도 즉시 O/X가 뜸)
        if (effectiveValue != null) {
            const pos = Math.max(0, Math.min(total - 1, index - 1));
            base[pos] = effectiveValue === correct ? "O" : "X";
        }

        return base;
    }, [progress, total, index, effectiveValue, correct]);

    const stateFor = (choice: OX): "idle" | "correct" | "wrong" => {
        if (!showResult) return "idle";
        if (choice === correct) return "correct";
        if (choice === effectiveValue) return "wrong";
        return "idle";
    };

    const pristine = effectiveValue == null && !showResult;
    const canGoNext = effectiveValue != null;
    const isLast = index >= total;
    const ctaLabel = isLast ? "결과 보기" : "다음 문제";
    const showCTA = canGoNext; // OX는 답 고르면 항상 버튼 노출
    const emblemURL = emblemSrc ?? DEFAULT_EMBLEM;

    return (
        <Stage aria-live="polite">
            <SoftBlobsBackground style={{ pointerEvents: "none" }} />
            <GhanaFont />

            <Shell>
                <Card data-showresult={showResult}>
                    <Header>
                        <QBox>
                            <Dots aria-hidden>
                                {Array.from({ length: total }).map((_, i) => (
                                    <Dot key={i} $active={i + 1 === Math.min(index, total)} />
                                ))}
                            </Dots>

                            <QLabel>{`Q${index}`}</QLabel>

                            {showResult && effectiveValue != null && (
                                <BigJudge $kind={effectiveValue === correct ? "O" : "X"} />
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
                                    <StatusBtn
                                        key={i}
                                        type="button"
                                        $state={st}
                                        $active={i + 1 === index}
                                        aria-current={i + 1 === index ? "true" : undefined}
                                        aria-label={`${i + 1}번으로 이동 (${st === "O" ? "정답" : st === "X" ? "오답" : "미답"})`}
                                        title={`${i + 1}번으로 이동`}
                                        disabled={!onGoto}
                                        onClick={() => {
                                            if (i + 1 === index) return;
                                            onGoto?.(i + 1);
                                        }}
                                    >
                                        <StatusNum>{i + 1}</StatusNum>
                                        {st === "O" && <OMark aria-hidden />}
                                        {st === "X" && <XMark aria-hidden />}
                                    </StatusBtn>
                                ))}
                            </StatusTray>
                        </RightCol>
                    </Header>

                    <Choices role="radiogroup" aria-label={`문항 ${index} OX 선택`}>
                        <ChoiceItem>
                            <OXButton
                                type="button"
                                aria-checked={effectiveValue === "O"}
                                role="radio"
                                $active={effectiveValue === "O"}
                                $state={stateFor("O")}
                                onClick={() => { setLocalValue("O"); onChange?.("O"); }}
                            >
                                <OIcon pristine={pristine} />
                                {effectiveValue === "O" && <SelectedMark />}
                            </OXButton>
                            {showResult && correct === "O" && <AnswerPill>정답!</AnswerPill>}
                            {showResult && correct !== "O" && effectiveValue  === "O" && <AnswerPill $kind="wrong">오답</AnswerPill>}
                        </ChoiceItem>

                        <ChoiceItem>
                            <OXButton
                                type="button"
                                aria-checked={effectiveValue === "X"}
                                role="radio"
                                $active={effectiveValue === "X"}
                                $state={stateFor("X")}
                                onClick={() => { setLocalValue("X"); onChange?.("X"); }}
                            >
                                <XIcon />
                                {effectiveValue === "X" && <SelectedMark />}
                            </OXButton>
                            {showResult && correct === "X" && <AnswerPill>정답!</AnswerPill>}
                            {showResult && correct !== "X" && effectiveValue === "X" && <AnswerPill $kind="wrong">오답</AnswerPill>}
                        </ChoiceItem>
                    </Choices>

                    {showCTA && (
                        <FloatingNext $showDock={showResult}>
                            <NextButton type="button" onClick={() => onNext?.()} aria-label={ctaLabel}>
                                {ctaLabel}
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
                                    <path
                                        d="M13 5l7 7-7 7M5 12h14"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </NextButton>
                        </FloatingNext>
                    )}

                    {showResult && (
                        <ResultDockIn>
                            <RRow>
                                <RKey>정답</RKey>
                                <RVal>{correct}</RVal>
                            </RRow>
                            <RRow>
                                <RKey>해설</RKey>
                                <RVal>{(explanation ?? "").trim() || "해설이 없습니다."}</RVal>
                            </RRow>
                        </ResultDockIn>
                    )}
                </Card>
            </Shell>
        </Stage>
    );
}
