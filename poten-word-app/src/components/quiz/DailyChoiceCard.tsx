// src/components/ChoiceQuizCard.tsx
import React from "react";
import styled, {css, createGlobalStyle, keyframes, FastOmit} from "styled-components";
import SoftBlobsBackground from "./SoftBlobsBackground.tsx";
import {BaseObject, IStyledComponentBase} from "styled-components/dist/types";
import emblem from "../../assets/quiz/emblem.png"
import GhanaWoff2 from "../../assets/fonts/ghana-choco/GhanaChocolate.woff2?url";

export const GhanaFont = createGlobalStyle`
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

type Judge = "O" | "X" | null;

type Props = {
    index?: number;           // 1-based
    total?: number;           // 기본 3개
    question: string;
    choices: string[];        // 4개 가정
    value?: number | null;    // 사용자가 고른 보기 인덱스(제어 모드)
    onChange?: (idx: number) => void;

    showResult?: boolean;     // 제어 모드 결과 공개
    correct?: number;         // 0-based
    explanation?: string;

    progress?: (Judge)[];
    onNext?: () => void;
    onGoto?: (qNumber1Based: number) => void;

    /** 참고 컴포넌트와 통일: 우상단 엠블럼 */
    emblemSrc?: string;
    emblemAlt?: string;
    onClose?: () => void;
    closeAriaLabel?: string;
};

/* ====== 상단 Q 라벨/점 (OX와 동일) ====== */
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

/* 정오 크게 오버레이 (참고 파일과 통일) */
const BigJudge = styled.span<{ $kind: 'O' | 'X' }>`
  --qj-size:   calc(var(--wm-size) * 1.58);
  --qj-x:      calc(var(--wm-size) * -0.05);
  --qj-y:      calc(var(--wm-size) * -0.30);
  --qj-stroke: clamp(10px, 1.2vw, 14px);
  --qj-color:  rgba(249,93,93,var(--mark-alpha,.75));

  position: absolute; left: var(--qj-x); top: var(--qj-y);
  width: var(--qj-size); height: var(--qj-size);
  pointer-events: none; z-index: 4;
  border-radius: 999px; background: transparent;

  ${({ $kind }) => $kind === 'O' ? css`
    border: var(--qj-stroke) solid var(--qj-color);
  ` : css`
    --x-len:   120%;
    --x-thick: calc(var(--qj-stroke) * 1.20);
    &::before, &::after{
      content:""; position:absolute; left:50%; top:50%;
      width: var(--x-len); height: var(--x-thick);
      background: var(--qj-color); border-radius: calc(var(--x-thick)/2);
      transform-origin:center;
    }
    &::before{ transform: translate(-50%,-50%) rotate(45deg); }
    &::after { transform: translate(-50%,-50%) rotate(-45deg); }
  `}
`;

/* ====== 레이아웃 ====== */
const Stage = styled.div`
    position: relative; isolation: isolate;
    width: 100%; display: grid; place-items: center;
    padding: clamp(12px, 2vw, 24px);

    body[data-card-modal="true"] & {
        padding: 0;
        place-items: stretch;
    }
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

    body[data-card-modal="true"] & {
        max-width: none;
        min-height: 0;
        height: 100%;
        gap: 0;
        place-items: stretch;
        transform: none;
        margin: 0;
    }
`;
const Card = styled.section`
  --wm-size: clamp(44px, 9vw, 88px);
  --dot-size: clamp(14px, 2vw, 18px);
  --dot-gap:  clamp(6px, 1vw, 8px);
  --q-shift: calc(var(--wm-size) * -0.08);
  --pad: clamp(22px, 3.6vw, 36px);
  --dock-space: clamp(160px, 22vw, 280px);
  --dock-hpad: clamp(22px, 3vw, 40px);
  --dock-vpad: clamp(16px, 2.2vw, 24px);
  --dock-round-top: clamp(28px, 3.2vw, 44px);
  --dock-lift: clamp(10px, 1.4vw, 18px);
  --dock-nudge: clamp(20px, 3vw, 35px);
  --dock-reveal: clamp(8px, 1vw, 12px);
  --dock-left-trim: clamp(10px, 1.2vw, 14px);
  --choices-top-gap: clamp(26px, 3vw, 44px);
  --card-top-inset: clamp(18px, 2.8vw, 48px);
  --mark-alpha: .75;

  position: relative; width: 100%;
  background: ${UI.panel}; border: 1px solid ${UI.line};
  border-radius: ${UI.radius}px; box-shadow: ${UI.shadow};
  padding: var(--pad); padding-top: calc(var(--pad) + var(--card-top-inset));
  overflow: hidden;
  aspect-ratio: 16/9; min-height: clamp(520px, 56vw, 760px);

  body[data-card-modal="true"] & {
      min-height: 0;
      height: 100%;
      width: 100%;
      border-radius: 18px; /* 모달 라운드와 맞추고 싶으면 */
  }

  &[data-showresult="true"]{
    padding-bottom: calc(var(--pad) + var(--dock-space));
  }
`;
const Header = styled.div`
  display: grid; grid-template-columns: auto 1fr auto;
  align-items: center; column-gap: clamp(10px, 2vw, 16px);
  margin: 6px 0 18px; min-width: 0;
`;
const QBox = styled.div`
  position: relative; margin-left: clamp(-6px,-.5vw,-2px);
`;
const QLabel = styled.span`
  font-family: 'GhanaChocolate', 'Pretendard','Noto Sans KR', system-ui, sans-serif;
  font-weight: 400; font-size: var(--wm-size); line-height: 1; color: #121212;
  display: block;
`;
const MeaningfulWrap = css`
  white-space: pre-wrap;      /* \n, 문장 단위 개행 유지 */
  word-break: keep-all;       /* 한국어 단어 중간(가나다라) 쪼개짐 방지 */
  overflow-wrap: break-word;  /* URL/긴영단어/코드 같은 긴 토큰은 줄 넘치면 분해 */
  line-break: strict;         /* CJK 줄바꿈 품질 개선(지원 브라우저에서만 적용) */
  hyphens: auto;              /* 영문 하이픈 분할(가능할 때) */
`;
const TitleWrap = styled.div`
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  transform: translateY(var(--q-shift)); min-width: 0; overflow-wrap: anywhere;
`;
const Title = styled.h2`
  margin: 0; font-size: clamp(18px,2.4vw,26px); font-weight: 750;
  color: ${UI.text}; letter-spacing: -.02em; line-height: 1.25;
`;

/* ====== 우측 진행 뱃지 + 엠블럼 (참고 통일) ====== */
const StatusTray = styled.div`
  display: inline-flex; align-items: center;
  gap: clamp(6px, .9vw, 10px);
  transform: translateY(var(--q-shift));
  font-family: 'GhanaChocolate','Pretendard','Noto Sans KR',system-ui,sans-serif;
  font-weight: 400; letter-spacing: -.02em;
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
  --stat-size:  clamp(34px, 2.6vw, 42px);
  --stat-font:  clamp(17px, 1.8vw, 24px);
  --stat-inset: clamp(5px, .7vw, 8px);
  --stat-ring:  clamp(4px, .6vw, 6px);
  --x-width: 78%; --x-thick: clamp(4px, .6vw, 6px);
  --o-scale: .55; --o-inset: calc(var(--stat-inset) * var(--o-scale));
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
  border: var(--stat-ring) solid rgba(249,93,93,var(--mark-alpha,.75));
`;
const StatusBtn = styled.button<{ $state?: Judge; $active?: boolean }>`
  all: unset; /* span과 동일한 초기화 */
  position: relative; width: var(--stat-size); height: var(--stat-size);
  border-radius: calc(var(--stat-size)*.28);
  background: #f6fbff; border: clamp(2px,.28vw,3px) solid #dbe7ff;
  display: grid; place-items: center; color: ${UI.primary};
  font-family: inherit; font-weight: inherit; font-size: var(--stat-font); line-height: 1;
  cursor: pointer;
    
      &[disabled]{ cursor: default; opacity: .65; }
    
      &:focus-visible{
        outline: 3px solid rgba(62,99,224,.35); outline-offset: 3px;
      }
`;
const XMark = styled.span`
  position: absolute; inset: 0;
  &::before,&::after{ content:""; position:absolute; left:50%; top:50%;
    width: var(--x-width,78%); height: var(--x-thick,4px);
    background: rgba(249,93,93,var(--mark-alpha,.75)); border-radius: 3px; }
  &::before{ transform: translate(-50%,-50%) rotate(45deg); }
  &::after { transform: translate(-50%,-50%) rotate(-45deg); }
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
  --emblem-nudge-x: clamp(12px, 1.2vw, 30px);
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

/* ====== 보기 리스트 ====== */
const List = styled.ul`
  --opt-left-nudge: clamp(8px, 1.2vw, 18px);
  --bullet-shift: 1.5cm;  
  list-style: none;
  margin: var(--choices-top-gap) 0 12px;
  padding: 0;
  display: grid;
  gap: clamp(14px, 1.8vw, 18px);
  margin-left: calc(-1 * (var(--opt-left-nudge) + var(--bullet-shift)));

  @media (max-width: 480px){
        --bullet-shift: 1.2cm;
  }
`;
const OptionWrap = styled.li`
  display: grid; align-items: start; row-gap: clamp(6px, 1vw, 10px);
`;
const OptText = styled.span`
  font-weight: 750; letter-spacing: -.02em; color: ${UI.text};
  font-size: clamp(19px, 3.0vw, 26px); line-height: 1.35; word-break: break-word;
  text-decoration: none;
  &:hover, &:focus { text-decoration: none; }
`;
const NumBullet = styled.button<{ $active?: boolean }>`
  appearance: none; border: 0; cursor: pointer;
  & ${OptText} { cursor: default; }
  --size: clamp(30px, 3vw, 36px);
  width: var(--size); height: var(--size);
  display: grid; place-items: center;
  border-radius: 999px;
  background: ${UI.primary};
  color: #fff; font-weight: 750; font-size: clamp(14px,1.6vw,16px);
  box-shadow: 0 6px 12px rgba(62,99,224,.18), inset 0 1px 0 rgba(255,255,255,.25);
  user-select: none;
  outline-offset: 3px;
  &:focus-visible { outline: 3px solid rgba(62,99,224,.35); }
  &:disabled{ opacity: .55; cursor: not-allowed; }
  svg { width: 70%; height: 70%; }
`;

let OptionRow: IStyledComponentBase<"web", FastOmit<React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>, "$active" | "$state"> & {
    $active?: boolean;
    $state?: "idle" | "correct" | "wrong"
}> & string & BaseObject & {};
OptionRow = styled.div<{
    $active?: boolean;
    $state?: "idle" | "correct" | "wrong";
}>`
  position: relative;
  display: grid;
  --pill-col: clamp(82px, 12vw, 138px);
  grid-template-columns: var(--pill-col) auto 1fr;
  align-items: center;
  column-gap: clamp(0px, .2vw, 2px);
  row-gap: clamp(6px, 1vw, 10px);
  padding: 10px 12px 10px calc(8px + var(--bullet-shift));
  border-radius: 12px;
  background: transparent;
  border: none;
  transition: transform .08s ease;
  cursor: default;

  &:active  { transform: translateY(1px); }
  ${({$active}) => $active && css``}
  ${({$state}) => $state === "correct" && css``}
  ${({$state}) => $state === "wrong" && css``}

  --num-left-nudge: clamp(14px, 1.4vw, 16px);
  & ${NumBullet} { margin-left: calc(-1 * (var(--num-left-nudge) + var(--bullet-shift))); }
  --numtext-tighten: clamp(12px, 1.2vw, 22px);
  & ${OptText} { margin-left: calc(-1 * var(--numtext-tighten)); }

   @media (max-width: 480px){
       --pill-col: clamp(68px, 18vw, 104px);
       --num-left-nudge: clamp(8px, 1.2vw, 10px);
       --numtext-tighten: clamp(8px, 1.8vw, 14px);
   }
`;
/* 선택 체크(글래스 배지) — 참고 파일과 동일 */
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
  top: 10px;
  right: 12px;
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 2;

  background:
    radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,.95), rgba(255,255,255,.7) 60%, rgba(255,255,255,.55)),
    linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.35));
  border: var(--ring) solid rgba(255,255,255,.85);
  box-shadow:
    0 6px 16px rgba(62,99,224,.22),
    inset 0 1px 0 rgba(255,255,255,.6);

  animation: ${popIn} .26s cubic-bezier(.2,.9,.2,1) both;

  &::before{
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: inherit;
    border: 2px solid rgba(62,99,224,.25);
    animation: ${ping} .5s ease-out both;
  }
  &::after{
    content: "";
    width: 64%;
    height: 64%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    filter: drop-shadow(0 1px 0 rgba(255,255,255,.6))
            drop-shadow(0 2px 6px rgba(62,99,224,.28));
    background-image: url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'\
stroke='%233E63E0' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'>\
<path d='M5 12.5 L10 17.5 L19 7.5'/></svg>");
  }
`;
const PillSlot = styled.div`
  position: relative;
  z-index: 2;
  grid-column: 1 / 2;
  display: grid;
  align-items: center;
  justify-items: start;
  width: var(--pill-col);
  min-height: clamp(24px, 3.6vw, 32px); /* 행 높이 튐 방지 */
  pointer-events: none; /* 클릭 방해 없음 */
`;

/* 정답/오답 Pill (OX와 동일 톤) */
const pillIn = keyframes`
  0%   { transform: translateY(6px); opacity: 0; }
  100% { transform: translateY(0);   opacity: 1; }
`;
const AnswerPill = styled.span<{ $kind?: 'correct' | 'wrong' }>`
  padding: 7px 12px;
  border-radius: 999px;
  font-family: 'Pretendard','Noto Sans KR',system-ui,sans-serif;
  font-weight: 800;
  font-size: clamp(12px, 1.6vw, 15px);
  line-height: 1;
  white-space: nowrap;
  animation: ${pillIn} .22s ease-out both;
  justify-self: start;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  color: ${({ $kind }) => ($kind === 'wrong' ? UI.danger : UI.primary)};
  background: ${({ $kind }) =>
    $kind === 'wrong'
        ? `linear-gradient(180deg, #fff4f4 0%, ${UI.dangerSoft} 100%)`
        : `linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%)`};
  border: 1px solid
    ${({ $kind }) => ($kind === 'wrong' ? 'rgba(249,93,93,.28)' : '#cfe0ff')};
  box-shadow:
    0 6px 12px rgba(62,99,224,.10),
    inset 0 1px 0 rgba(62,99,224,.16);

  position: relative;
  z-index: 3;
  &::before{
    content:"";
    position:absolute; inset:0;
    border-radius:inherit;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.65);
    pointer-events:none;
  }
`;

/* ====== 애니 (선언을 먼저) ====== */
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
`;

/* ====== 결과 도크/CTA — OX와 동일 ====== */
const ResultDockIn = styled.section<{ $correct?: boolean }>`
  position: absolute;
  left:  calc(-1 * var(--pad) + var(--dock-reveal));
  right: calc(-1 * var(--pad) + var(--dock-reveal));
  bottom: calc(-1 * var(--pad));
  transform: translateY(calc(-1 * var(--dock-lift) + var(--dock-nudge)));
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
    position:absolute; inset:0 0 auto 0;
    height: max(10px, calc(var(--dock-round-top)*0.9));
    border-top-left-radius: inherit; border-top-right-radius: inherit;
    pointer-events:none;
    box-shadow: inset 0 6px 12px rgba(255,255,255,.35);
  }
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
  color: ${UI.primary}; font-weight: 400; letter-spacing: -.02em;
  font-size: clamp(18px, 2.2vw, 24px); line-height: 1.1;
  &:before { content: "·"; margin-right: 8px; }
`;
const RVal = styled.span<{ $center?: boolean }>`
  font-family: 'Pretendard','Noto Sans KR',system-ui,sans-serif;
  font-weight: 700; line-height: 1.1; padding-top: 10px;
  font-size: clamp(18px, 2.2vw, 24px); color: ${UI.text};
  white-space: normal; word-break: break-word; overflow-wrap: anywhere;
  text-align: ${({ $center }) => ($center ? "center" : "left")};
  justify-self: ${({ $center }) => ($center ? "center" : "start")};
  ${MeaningfulWrap}
`;

/* 다음 버튼 */
const FloatingNext = styled.div<{ $showDock?: boolean }>`
  position: absolute;
  right: var(--pad);
    bottom: ${({ $showDock }) =>
                $showDock
                  ? 'calc(var(--pad) + var(--dock-space) - 80px)'
                          : 'var(--pad)'};
  z-index: 6;
  animation: ${fadeInUp} .18s ease-out both;
`;
const NextButton = styled.button`
  appearance: none; border: 0;
  display: inline-flex; align-items: center; gap: 8px;
  height: clamp(34px, 4vw, 44px); padding: 0 clamp(12px, 1.6vw, 16px);
  border-radius: 12px; font-weight: 750; font-size: clamp(14px, 1.6vw, 16px);
  letter-spacing: -0.02em; color: #fff; background: #3E63E0; cursor: pointer;
  transition: transform .08s ease, filter .15s ease, box-shadow .2s ease;

  &:hover { filter: brightness(1.04); transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  &:focus-visible { outline: 3px solid rgba(62,99,224,.35); outline-offset: 3px; }
  &:disabled{ opacity: .55; cursor: not-allowed; transform: none; }
`;

/* ====== 컴포넌트 ====== */
export default function DailyChoiceCard({
                                           index = 1,
                                           total = 3,
                                           question,
                                           choices = [],
                                           value = null,
                                           onChange,
                                           showResult = false,
                                           correct = 0,
                                           explanation = "텍스트를 입력하세요.",
                                           progress,
                                           onNext,
                                           onGoto,
                                           emblemSrc,
                                           emblemAlt,
                                       }: Props) {

    /* 내부 즉시 반응용 상태(부분-제어 패턴) */
    const [localValue, setLocalValue] = React.useState<number | null>(value ?? null);
    const [localShowResult, setLocalShowResult] = React.useState<boolean>(false);

    // 외부 value 동기화
    React.useEffect(() => {
        if (value !== undefined) setLocalValue(value ?? null);
    }, [value]);

    React.useEffect(() => {
          setLocalValue(value ?? null);
          setLocalShowResult(false);
            }, [index, question]);

    const selected = value ?? localValue;
    const reveal   = showResult || localShowResult;

    // 보기 안전 보정
    const safeChoices = React.useMemo(
        () => (Array.isArray(choices) ? choices : []).map(v => String(v ?? "")).slice(0, 4),
        [choices]
    );
    const displayChoices = safeChoices.length
        ? safeChoices
        : Array.from({ length: 4 }, (_, i) => `보기 ${i + 1}`);

    // 정답 인덱스 보정
    const correctIdx = React.useMemo(() => {
        const c = Number.isInteger(correct as number) ? (correct as number) : -1;
        const len = displayChoices.length;
        return c >= 0 && c < len ? c : -1;
    }, [correct, displayChoices.length]);

    const isAnswered = selected != null;
    const isCorrect = isAnswered && correctIdx >= 0 && selected === correctIdx;

    const computedProgress = React.useMemo(() => {
        const base = Array.from({ length: total }, () => null) as Judge[];

        if (Array.isArray(progress)) {
            for (let i = 0; i < Math.min(progress.length, total); i++) base[i] = progress[i];
        }

        const pos = Math.max(0, Math.min(total - 1, index - 1));

        if (base[pos] == null && selected != null && correctIdx >= 0) {
            base[pos] = selected === correctIdx ? "O" : "X";
        }

        return base;
    }, [progress, total, index, selected, correctIdx]);

    const stateFor = (i: number): "idle" | "correct" | "wrong" => {
        if (!reveal) return "idle";
        if (i === correctIdx) return "correct";
        if (i === selected) return "wrong";
        return "idle";
    };

    const handlePick = (i: number) => {
        if (isAnswered) return;
        setLocalValue(i);
        setLocalShowResult(true);
        onChange?.(i);
    };

    const handleKeyPick: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        const div = e.currentTarget as HTMLDivElement;
        const idx = Number(div.dataset.index);
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isAnswered) handlePick(idx);
        }
    };

    const goNext = React.useCallback(() => {
        if (onNext) return onNext();                     // 부모 핸들러 우선
        if (onGoto) onGoto(Math.min(index + 1, total));  // 폴백: 바로 다음 문제로
         }, [onNext, onGoto, index, total]);

    const canGoNext = isAnswered;
    const isLast = index >= total;
    const ctaLabel = isLast ? "결과 보기" : "다음 문제";
    const showCTA = canGoNext && (!isLast || reveal);
    const emblemURL = emblemSrc ?? DEFAULT_EMBLEM;

    const handleNextClick = React.useCallback(() => {
        onNext?.();
    }, [onNext]);

    return (
        <Stage aria-live="polite">
            <SoftBlobsBackground style={{ pointerEvents: 'none' }} />
            <GhanaFont />
            <Shell style={{ ['--mc-offset' as any]: '110px', ['--ox-offset' as any]: '110px', ['--raise' as any]: '-40px' }}>
                <Card data-showresult={reveal}>
                    <Header>
                        <QBox>
                            <Dots aria-hidden>
                                {Array.from({ length: total }).map((_, i) => (
                                    <Dot key={i} $active={i + 1 === Math.min(index, total)} />
                                ))}
                            </Dots>
                            <QLabel>{`Q${index}`}</QLabel>
                            {reveal && isAnswered && correctIdx >= 0 && (
                                <BigJudge $kind={isCorrect ? "O" : "X"} aria-hidden />
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

                    {/* 보기 4개 */}
                    <List role="radiogroup" aria-label={`문항 ${index} 객관식 보기`}>
                        {displayChoices.map((text, i) => {
                            const active = selected === i;
                            const state = stateFor(i);
                            const isCorrectOption = i === correctIdx;
                            const isWrongPicked = reveal && !isCorrect && selected === i;

                            return (
                                <OptionWrap key={i}>
                                    <OptionRow
                                        data-index={i}
                                        $active={active}
                                        $state={state}
                                    >
                                        <PillSlot>
                                               {reveal && isCorrectOption && <AnswerPill aria-live="polite">정답!</AnswerPill>}
                                               {isWrongPicked && <AnswerPill $kind="wrong" aria-live="polite">오답</AnswerPill>}
                                             </PillSlot>
                                        <NumBullet
                                             type="button"
                                             role="radio"
                                             aria-checked={active}
                                             aria-label={`${i + 1}번 보기 선택`}
                                             onClick={() => handlePick(i)}
                                             disabled={isAnswered}
                                        >
                                             {active ? (
                                               <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                    <path d="M5 12.5 L10 17.5 L19 7.5"/>
                                                   </svg>
                                            ) : (
                                               i + 1
                                             )}
                                           </NumBullet>
                                        <OptText>{text}</OptText>
                                    </OptionRow>
                                </OptionWrap>
                            );
                        })}
                    </List>

                    {/* 다음 문제 버튼 — OX와 동일 조건/위치 */}
                    {showCTA && (
                        <FloatingNext $showDock={reveal}>
                            <NextButton type="button" onClick={handleNextClick} aria-label={ctaLabel}>
                                {ctaLabel}
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
                                    <path d="M13 5l7 7-7 7M5 12h14" fill="none" stroke="white" strokeWidth="2"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </NextButton>
                        </FloatingNext>
                    )}

                    {/* 결과 도크 — OX와 동일 레이아웃 */}
                    {reveal && (
                        <ResultDockIn $correct={isCorrect}>
                            <RRow>
                                <RKey>정답</RKey>
                                <RVal>{`${correctIdx + 1}번 (${displayChoices[correctIdx] ?? ""})`}</RVal>
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
