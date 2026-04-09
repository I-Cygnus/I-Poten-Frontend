// src/components/Main.tsx

/* ====== Mulmaru Font ====== */
const injectMulmaruFont = () => {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
        font-family: 'InkLiquid';
        src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/InkLipquid.woff') format('woff2');
        font-weight: normal;
        font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

/*
@font-face {
  font-family: 'Mulmaru';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-4@1.1/Mulmaru.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}
font-display: swap;*/

import React, { useEffect, useState, useRef, useId } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import incheonEducationFont from "../assets/fonts/iceJaram-Rg.woff2";
import interviewVideo from "../assets/videos/interview.mp4";
import image from "../assets/nugule.png";
import confetti from "canvas-confetti";
import word1 from "../assets/word3.png";
import word2 from "../assets/word4.png";
import wordA from "../assets/wordA.png";
import word01 from "../assets/word_01.jpg";
import word02 from "../assets/word_02.jpg";
import note01 from "../assets/note_01.jpg";
import note02 from "../assets/note_02.jpg";
import quiz01 from "../assets/quiz_01.jpg";
import quiz02 from "../assets/quiz_02.jpg";
import coreValue01 from "../assets/coreValue01.png";
import coreValue02 from "../assets/coreValue02.png";
import coreValue03 from "../assets/coreValue03.png";
import interview1 from "../assets/interview1.png";
import interview2 from "../assets/interview2.png";
import interview3 from "../assets/interview3.png";
import interview4 from "../assets/interview4.png";
import interview5 from "../assets/interview5.png";
import InterviewA from "../assets/InterviewA.png";
import interviewB from "../assets/InterviewB.jpg";
import backgr from "../assets/backgr.png";
import backgr2 from "../assets/backgr2.png";
import back7 from "../assets/back7.png";
import Review from "../review/page/Review";
import OpenEvent from "../event/page/OpenEvent";
import mobileBanner from "../assets/mobile/mobile-banner.png";
import appStoreBtn from "../assets/mobile/appstore-button.png";
import googlePlayBtn from "../assets/mobile/googleplay-button.png";
import googlePlayQr from "../assets/mobile/google-play-qr.png";
import appStoreQr from "../assets/mobile/app-store-qr.png";

/* ====== 폰트 ====== */
const GlobalFonts = createGlobalStyle`
  @font-face {
    font-family: 'IncheonEducation';
    src: url(${incheonEducationFont}) format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;

/* ====== 로고 이미지 ====== */
import logoDanggeun from "../assets/ci/daangn.png";
import logoToss from "../assets/ci/toss.png";
import logoEncore from "../assets/ci/encore.png";
import logoKT from "../assets/ci/ktMmobile.png";
import logoCoupang from "../assets/ci/coupang.png";
import logoKakao from "../assets/ci/kakao.png";
import logoLine from "../assets/ci/line.png";
import logoNaver from "../assets/ci/naver.png";

/* ====== Hero 페이지 전용 이미지 ====== */
import pageLogo from "../assets/pageLogo.png";
import pageAI from "../assets/pageAI.png";
import pageImg2 from "../assets/pageImg.png";
import pageImg from "../assets/pagimg2.png";


const BRAND = {
  blue: "#3b82f6",
  blueDark: "#60a5fa",
  blueHover: "#2563eb",
  cyan: "#22d3ee",
  cyanDeep: "#06b6d4",
  green: "#34d399",
  greenDeep: "#10b981",
  surface: "#f9fafc",
  surfaceAlt: "#f8fafc",
} as const;

/* ========== 배경 원형 그라데이션 ========== */
const BackgroundCirclesContainer = styled.div<{ $opacity?: number }>`
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  height: calc(100vh - 72px);
  pointer-events: none;
  z-index: 999;
  overflow: visible;
  opacity: ${({ $opacity }) => $opacity ?? 1};
  transition: opacity 0.3s ease;
`;

const BackgroundCircle = styled.div<{
  $size: number;
  $top: string;
  $left: string;
  $color: string;
  $blur?: number;
}>`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  top: ${props => props.$top};
  left: ${props => props.$left};
  background: ${props => props.$color};
  border-radius: 50%;
  filter: blur(${props => props.$blur || 80}px);
  opacity: 0.6;
  transform: translate(-50%, -50%);

  @media (max-width: 768px) {
    width: ${props => props.$size * 0.6}px;
    height: ${props => props.$size * 0.6}px;
    filter: blur(${props => (props.$blur || 80) * 0.7}px);
  }
`;

/* ========== 배경 레이어 (poten-word 스타일) ========== */
const SoftBg = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  background:
      radial-gradient(
          900px 900px at 20% 60%,
          rgba(211, 228, 253, 0.55) 0%,
          rgba(211, 228, 253, 0.30) 40%,
          rgba(211, 228, 253, 0.15) 60%,
          rgba(211, 228, 253, 0.05) 80%,
          transparent 100%
      ),
      radial-gradient(
          900px 900px at 80% 55%,
          rgba(213, 247, 239, 0.55) 0%,
          rgba(213, 247, 239, 0.30) 40%,
          rgba(213, 247, 239, 0.15) 60%,
          rgba(213, 247, 239, 0.05) 80%,
          transparent 100%
      ),
      #ffffff;

  @media (max-width: 640px) {
    background:
        radial-gradient(
            600px 600px at 30% 70%,
            rgba(211, 228, 253, 0.50) 0%,
            rgba(211, 228, 253, 0.20) 50%,
            transparent 100%
        ),
        radial-gradient(
            600px 600px at 80% 50%,
            rgba(213, 247, 239, 0.50) 0%,
            rgba(213, 247, 239, 0.20) 50%,
            transparent 100%
        ),
        #ffffff;
  }
`;

const NAV_HEIGHT = 72;

/* ========== 공통 레이아웃 ========== */
const Page = styled.main`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin-top: -${NAV_HEIGHT}px;
  background: transparent;
  position: relative;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;

  & > section {
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  @media (max-width: 768px) {
    padding: 0;
    scroll-snap-type: none;
  }

  [data-reveal] {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
    transition:
        opacity 520ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--reveal-delay, 0ms);
    will-change: opacity, transform, filter;
  }

  @media (max-width: 768px) {
    [data-reveal] {
      transform: translate3d(0, 10px, 0);
    }
  }

  [data-reveal][data-reveal-variant="fade"] {
    transform: none;
  }

  [data-reveal="in"] {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  @media (prefers-reduced-motion: reduce) {
    [data-reveal] {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
`;

const insightsTickerScroll = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

const ScheduleWideCard = styled.div`
  width: 100%;
  border-radius: 34px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.06);
  margin-bottom: 28px;

  @media (max-width: 640px) {
    border-radius: 28px;
    margin-bottom: 22px;
  }

  :root[data-theme="dark"] & {
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(2, 6, 23, 0.92) 100%);
    border-color: rgba(148, 163, 184, 0.14);
    box-shadow: 0 34px 110px rgba(2, 6, 23, 0.55);
  }
`;

const ScheduleWideInner = styled.div`
  width: 100%;
  height: 120px;

  @media (max-width: 640px) {
    height: 104px;
  }
`;

const ProgressSection = styled.section`
  width: 100%;
  margin-top: 308px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 100vw;
    height: 360px;
    background: linear-gradient(
        to bottom,
        rgba(248, 250, 252, 0) 0%,
        rgba(191, 219, 254, 0.22) 45%,
        rgba(248, 250, 252, 0.96) 100%
    );
    pointer-events: none;
    z-index: -1;
  }

  :root[data-theme="dark"] &::after {
    background: linear-gradient(
        to bottom,
        rgba(2, 6, 23, 0) 0%,
        rgba(30, 58, 138, 0.16) 45%,
        rgba(2, 6, 23, 0.55) 100%
    );
  }

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 40px 16px;
  }
`;

const ProgressKicker = styled.div`
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${BRAND.blue};
  margin-bottom: 14px;

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
  }
`;

const ProgressTitle = styled.h2`
  font-size: clamp(38px, 6.5vw, 62px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.12;
  margin: 0;
  color: #0f172a;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 36px;
    line-height: 1.15;
  }

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.95);
  }
`;

const ProgressTitleAccent = styled.span`
  color: ${BRAND.blue};

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
  }
`;

const ProgressDescription = styled.p`
  margin: 18px auto 0;
  max-width: 720px;
  font-size: 16px;
  line-height: 1.8;
  color: #64748b;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.7;
  }

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const FaqSection = styled.section`
  width: 100%;
  min-height: 100vh;
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 140px 20px 60px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 100px 16px 40px;
  }
`;

const FaqTitle = styled.h2`
  margin: 0 0 28px;
  font-size: clamp(32px, 4.4vw, 52px);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;
  text-align: center;

  :root[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const FaqList = styled.div`
  width: 100%;
  border-top: 1px solid rgba(148, 163, 184, 0.28);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const FaqItem = styled.div<{ $open?: boolean }>`
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  transition: border-color 0.28s ease, background-color 0.28s ease;
  background: ${({ $open }) => ($open ? "rgba(59, 130, 246, 0.02)" : "transparent")};
`;

const FaqButtonRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 26px 8px;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
  font-family: inherit;

  &:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.22);
    outline-offset: 4px;
    border-radius: 10px;
  }

  @media (max-width: 640px) {
    padding: 20px 4px;
  }
`;

const FaqQuestion = styled.div`
  font-size: 18px;
  font-weight: 800;
  line-height: 1.55;
  letter-spacing: -0.012em;
  color: rgba(15, 23, 42, 0.82);
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.88);
  }

  @media (max-width: 640px) {
    font-size: 16px;
    line-height: 1.5;
  }
`;

const FaqToggle = styled.div<{ $open?: boolean }>`
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
  color: rgba(15, 23, 42, 0.5);
  flex: 0 0 auto;
  transform: rotate(${({ $open }) => ($open ? "45deg" : "0deg")});
  transition:
      transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
      color 220ms ease;

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.68);
  }
`;

const FaqAnswerWrap = styled.div<{ $open?: boolean }>`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? "1fr" : "0fr")};
  transition:
      grid-template-rows 380ms cubic-bezier(0.16, 1, 0.3, 1),
      opacity 240ms ease;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
`;

const FaqAnswerInner = styled.div`
  overflow: hidden;
`;

const FaqAnswer = styled.div<{ $open?: boolean }>`
  padding: ${({ $open }) => ($open ? "0 8px 24px" : "0 8px 0")};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.72;
  letter-spacing: -0.01em;
  color: rgba(15, 23, 42, 0.6);
  word-break: keep-all;
  transform: translateY(${({ $open }) => ($open ? "0" : "-8px")});
  transition:
      padding 380ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 280ms ease,
      opacity 220ms ease;
  opacity: ${({ $open }) => ($open ? 1 : 0)};

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.72);
  }

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.68;
  }
`;

const ShowcaseSection = styled.section`
  width: 100%;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 40px 16px;
  }
`;

const LightShowcaseBand = styled.div`
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background-color: ${BRAND.surface};
  position: relative;
`;

const ScheduleShowcaseSection = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 120px 20px 60px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 90px 16px 40px;
  }
`;

const ScheduleShowcaseTitle = styled.h2`
  margin: 0 0 42px;
  font-size: clamp(34px, 4.8vw, 54px);
  letter-spacing: -0.04em;
  line-height: 1.1;
  word-break: keep-all;

  @media (max-width: 640px) {
    margin-bottom: 28px;
  }
`;

const ScheduleShowcaseTitleMuted = styled.span`
  display: block;
  color: rgba(15, 23, 42, 0.35);
  font-weight: 900;

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.55);
  }
`;

const ScheduleShowcaseTitleStrong = styled.span`
  display: block;
  color: rgba(15, 23, 42, 0.92);
  font-weight: 900;

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.95);
  }
`;

const ScheduleCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ScheduleCardBase = styled.div`
  border-radius: 42px;
  overflow: hidden;
  position: relative;
  min-height: 520px;

  @media (max-width: 640px) {
    border-radius: 32px;
    min-height: 400px;
  }
`;

const ScheduleLightCard = styled(ScheduleCardBase)`
  background: linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%);
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.18);

  :root[data-theme="dark"] & {
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(2, 6, 23, 0.92) 100%);
    border-color: rgba(148, 163, 184, 0.14);
    box-shadow: 0 34px 120px rgba(2, 6, 23, 0.6);
  }
`;

const ScheduleDarkCard = styled(ScheduleCardBase)`
  background: linear-gradient(180deg, rgba(17, 24, 39, 1) 0%, rgba(2, 6, 23, 1) 100%);
  box-shadow: 0 34px 120px rgba(2, 6, 23, 0.6);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 78% 62%, rgba(255, 255, 255, 0) 0 54%, rgba(255, 255, 255, 0.10) 55% 56%, rgba(255, 255, 255, 0) 57% 100%),
        radial-gradient(circle at 78% 62%, rgba(255, 255, 255, 0) 0 44%, rgba(255, 255, 255, 0.08) 45% 46%, rgba(255, 255, 255, 0) 47% 100%),
        radial-gradient(circle at 78% 62%, rgba(255, 255, 255, 0) 0 34%, rgba(255, 255, 255, 0.06) 35% 36%, rgba(255, 255, 255, 0) 37% 100%);
    opacity: 0.65;
    pointer-events: none;
  }
`;

const ScheduleLightCaption = styled.div`
  position: absolute;
  left: 50%;
  bottom: 56px;
  transform: translateX(-50%);
  width: min(92%, 520px);
  z-index: 2;
  font-size: 26px;
  line-height: 1.35;
  letter-spacing: -0.03em;
  font-weight: 900;
  text-align: left;

  @media (max-width: 640px) {
    bottom: 28px;
    width: min(92%, 520px);
    font-size: 20px;
  }
`;

const ScheduleLightCaptionMuted = styled.div`
  display: block;
  margin: 0;
  text-align: left;
  color: rgba(15, 23, 42, 0.32);

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.5);
  }
`;

const ScheduleLightCaptionStrong = styled.div`
  display: block;
  margin: 6px 0 0;
  text-align: left;
  color: rgba(15, 23, 42, 0.92);

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.92);
  }
`;

const SchedulePhoneFrame = styled.div`
  position: absolute;
  right: -90px;
  bottom: -30px;
  width: min(560px, 90%);
  height: min(560px, 90%);
  display: grid;
  place-items: center;
  z-index: 1;

  @media (max-width: 640px) {
    right: 50%;
    bottom: -12px;
    transform: translateX(50%);
    width: min(420px, 118%);
    height: auto;
    aspect-ratio: 1 / 1;
  }
`;

const ScheduleMedia = styled.img<{ $fit?: "cover" | "contain" }>`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: ${({ $fit }) => $fit ?? "contain"};
`;

const ScheduleMediaPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.9), rgba(241, 245, 249, 0.9));

  :root[data-theme="dark"] & {
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
  }
`;

const ScheduleDarkContent = styled.div`
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: min(92%, 520px);
  z-index: 2;

  @media (max-width: 640px) {
    top: 32px;
    width: min(92%, 520px);
  }
`;

const ScheduleDarkTitle = styled.h3`
  margin: 0;
  font-size: 26px;
  line-height: 1.25;
  letter-spacing: -0.03em;
  font-weight: 900;
  color: rgba(248, 250, 252, 0.95);

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const ScheduleDarkDescription = styled.p`
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(226, 232, 240, 0.62);
  word-break: keep-all;
`;

const ScheduleListFrame = styled.div`
  position: absolute;
  left: 50%;
  bottom: 54px;
  transform: translateX(-50%);
  width: min(92%, 520px);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.96);
  box-shadow: 0 22px 70px rgba(2, 6, 23, 0.45);
  overflow: hidden;
  z-index: 2;

  @media (max-width: 640px) {
    bottom: 24px;
    width: min(90%, 420px);
  }
`;

const ScheduleListInner = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 7;
`;

const InsightsSection = styled.section`
  width: 100%;
  min-height: 100vh;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 40px 16px;
  }
`;

const InsightsTitle = styled.h2`
  width: 100%;
  margin: 0 0 42px;
  text-align: left;
  font-size: clamp(34px, 4.8vw, 54px);
  letter-spacing: -0.04em;
  line-height: 1.1;
  word-break: keep-all;

  @media (max-width: 640px) {
    margin-bottom: 28px;
  }
`;

const InsightsTitleMuted = styled.span`
  display: block;
  color: rgba(15, 23, 42, 0.35);
  font-weight: 900;

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.55);
  }
`;

const InsightsTitleStrong = styled.span`
  display: block;
  color: rgba(15, 23, 42, 0.92);
  font-weight: 900;

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.95);
  }
`;

const InsightsPanel = styled.div`
  width: 100%;
  height: auto;
  border-radius: 44px;
  overflow: hidden;
  position: relative;
  background-color: #E2E8F0;
  //background-color: #DDEAF3;
  //background-color: transparent;
  //background: linear-gradient(
  //  135deg,
  //  rgba(219, 234, 254, 1) 0%,
  //  rgba(165, 243, 252, 1) 45%,
  //  rgba(167, 243, 208, 1) 100%
  //);
  box-shadow: 0 34px 120px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.14);

  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(17, 24, 39, 0.92) 45%, rgba(2, 6, 23, 0.92) 100%);
    border-color: rgba(148, 163, 184, 0.12);
    box-shadow: 0 40px 140px rgba(2, 6, 23, 0.6);
  }
`;

const InsightsPanelInner = styled.div`
  position: relative;
  padding: 56px;
  min-height: 420px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 36px;
  align-items: start;

  @media (max-width: 1024px) {
    padding: 40px 34px;
    gap: 24px;
    grid-template-columns: 0.95fr 1.05fr;
    min-height: 440px;
    align-items: stretch;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 42px 28px;
    min-height: auto;
  }

  @media (max-width: 640px) {
    padding: 34px 20px;
  }
`;

const InsightsBackgroundLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.55;
  pointer-events: none;
`;

const InsightsBackgroundImage = styled.img`
  width: 103%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

const InsightsBackgroundVideo = styled.video`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  object-position: center center;
  transform: scale(1.12) translate(3%, -3%);
  transform-origin: right top;
  background: #E2E8F0;
  border-radius: inherit;

  @media (max-width: 1024px) {
    object-fit: contain;
    object-position: center center;
    transform: scale(1.06) translate(2%, -1%);
  }

  @media (max-width: 768px) {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center bottom;
    transform: scale(1.12);
    transform-origin: center bottom;
  }
`;

const InsightsBackgroundPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background:
      radial-gradient(circle at 22% 40%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 55%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 55%),
      linear-gradient(
          135deg,
          rgba(219, 234, 254, 1) 0%,
          rgba(165, 243, 252, 1) 45%,
          rgba(167, 243, 208, 1) 100%
      );

  :root[data-theme="dark"] & {
    background:
        radial-gradient(circle at 22% 40%, rgba(96, 165, 250, 0.18), rgba(2, 6, 23, 0) 55%),
        radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.14), rgba(2, 6, 23, 0) 55%),
        linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(17, 24, 39, 0.92) 55%, rgba(2, 6, 23, 0.92) 100%);
  }
`;

const InsightsLeft = styled.div`
  position: relative;
  z-index: 1;
  max-width: 520px;
  align-self: start;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const InsightsKicker = styled.div`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: ${BRAND.blue};
`;

const InsightsHeadline = styled.h3`
  margin: 0 0 16px;
  font-size: clamp(22px, 2.7vw, 32px);
  line-height: 1.25;
  letter-spacing: -0.03em;
  font-weight: 900;
  color: ${BRAND.blue};
`;

const InsightsBody = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.62);
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.7);
  }
`;

const TextHiright = styled.div`
  //color: rgba(59, 130, 246, 0.3);
  text-decoration-color: rgba(59, 130, 246, 0.3);
`;

const InsightsLeftTitle = styled.div`
  font-size: 40px;
  line-height: 1.25;
  letter-spacing: -0.03em;
  font-weight: 900;
  margin-bottom: 14px;
  //color: rgba(59, 130, 246, 0.72);
  color: black;
  word-break: keep-all;
  text-wrap: balance;

  @media (max-width: 640px) {
    font-size: 32px;
    line-height: 1.18;
  }

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
  }
`;

const InsightsLeftStrong = styled.span`
  color: ${BRAND.blue};

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
  }
`;

const InsightsRight = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 500px;

  @media (max-width: 1024px) {
    min-height: 430px;
    margin-top: 0;
  }

  @media (max-width: 768px) {
    min-height: auto;
    margin-top: 22px;
  }
`;

const InsightsQuestionStack = styled.div`
  position: absolute;
  bottom: 33%;
  right: 30%;
  width: 100%;
  height: 320px;
  overflow: hidden;
  z-index: 3;

  -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.35) 12%,
      rgba(0, 0, 0, 1) 50%,
      rgba(0, 0, 0, 0.35) 88%,
      rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.35) 12%,
      rgba(0, 0, 0, 1) 50%,
      rgba(0, 0, 0, 0.35) 88%,
      rgba(0, 0, 0, 0) 100%
  );

  @media (max-width: 1024px) {
    bottom: 30%;
    right: 18%;
    height: 260px;
  }

  @media (max-width: 768px) {
    position: relative;
    bottom: auto;
    right: auto;
    width: 100%;
    height: clamp(160px, 24vh, 220px);
  }

  @media (max-width: 640px) {
    height: 170px;
  }
`;

const InsightsQuestionTrack = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
  padding: 0;
  animation: ${insightsTickerScroll} 9.5s linear infinite;
  will-change: transform;
`;

const InsightsQuestionPill = styled.div`
  background: rgba(248, 250, 252, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  padding: 12px 18px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.7);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(10px);
`;

const InsightsDashboardFrame = styled.div`
  position: absolute;
  left: 10%;
  top: 34%;
  width: min(112%, 1120px);
  height: min(108%, 390px);
  border-radius: 24px;
  overflow: hidden;
  z-index: 1;

  @media (max-width: 1024px) {
    left: 4%;
    top: 40%;
    width: min(108%, 560px);
    height: 340px;
    margin: 0;
  }

  @media (max-width: 768px) {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    max-width: 440px;
    height: auto;
    margin: 12px auto 0;
  }

  @media (max-width: 640px) {
    max-width: 360px;
  }
`;

const InsightsDashboardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 8;
  border-radius: inherit;
  overflow: hidden;
  background: #E2E8F0;

  @media (max-width: 1024px) {
    aspect-ratio: 16 / 8;
  }

  @media (max-width: 768px) {
    aspect-ratio: 4 / 5;
  }
`;

const InsightsDashboardPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(241, 245, 249, 0.95), rgba(226, 232, 240, 0.95));
`;

const InsightsTickerBox = styled.div`
  position: absolute;
  left: 50%;
  bottom: 210px;
  transform: translateX(-50%);
  width: min(92%, 560px);
  height: 86px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 20px 70px rgba(15, 23, 42, 0.14);
  overflow: hidden;
  z-index: 4;

  @media (max-width: 640px) {
    height: 78px;
    bottom: 230px;
  }
`;

const InsightsTickerMask = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.85) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0.85) 100%
  );
  pointer-events: none;
  z-index: 3;
`;

const InsightsTickerTrack = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  animation: ${insightsTickerScroll} 9.5s linear infinite;
  will-change: transform;
`;

const InsightsTickerRow = styled.div`
  width: 100%;
  height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0 22px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.10);
  font-size: 20px;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.72);
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  @media (max-width: 640px) {
    height: 78px;
    font-size: 18px;
  }

  :root[data-theme="dark"] & {
    background: rgba(248, 250, 252, 0.10);
    border-color: rgba(148, 163, 184, 0.18);
    color: rgba(248, 250, 252, 0.82);
    box-shadow: 0 18px 44px rgba(2, 6, 23, 0.55);
  }
`;

const ShowcaseGrid = styled.div<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$reverse ? "1.1fr 1.4fr" : "1.4fr 1.1fr"};
  gap: 40px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 44px;
    display: flex;
    flex-direction: ${props => props.$reverse ? "column-reverse" : "column"};
  }
`;

const ShowcaseVisual = styled.div`
  position: relative;
  width: 100%;
  min-height: 680px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;

  @media (max-width: 1024px) {
    min-height: 520px;
  }

  @media (max-width: 640px) {
    min-height: 320px;
    justify-content: center;
    overflow: visible;
  }
`;

const ShowcaseFrameStack = styled.div<{ $reverse?: boolean }>`
  position: relative;
  width: fit-content;
  margin-top: 24px;
  transform: translateX(-300px);

  @media (max-width: 1024px) {
    transform: translateX(-120px);
    margin-top: 0;
  }

  @media (max-width: 640px) {
    width: min(100%, 360px);
    margin-inline: auto;
    transform: none;
    padding-top: 18px;
  }
`;

const ShowcaseBaseFrame = styled.div<{ $reverse?: boolean }>`
  position: relative;
  width: clamp(820px, 56vw, 980px);
  aspect-ratio: 16 / 9;
  border-radius: 22px;
  overflow: hidden;
  background: #E6EAED;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);

  :root[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.7);
    border-color: rgba(148, 163, 184, 0.18);
    box-shadow: 0 34px 110px rgba(2, 6, 23, 0.65);
  }

  @media (max-width: 1024px) {
    width: min(100%, 820px);
  }

  @media (max-width: 640px) {
    width: 100%;
    border-radius: 18px;
  }
`;

const ShowcaseOverlayFrame = styled.div<{ $reverse?: boolean }>`
  position: absolute;
  top: -120px;
  ${({ $reverse }) =>
      $reverse
          ? "left: -138px;"
          : "right: -120px;"}

  width: clamp(580px, 38vw, 720px);
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 26px 80px rgba(15, 23, 42, 0.16);
  z-index: 3;

  :root[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.75);
    border-color: rgba(148, 163, 184, 0.18);
    box-shadow: 0 42px 140px rgba(2, 6, 23, 0.75);
  }

  @media (max-width: 1024px) {
    top: -40px;
    ${({ $reverse }) =>
        $reverse
            ? "left: -76px;"
            : "right: -76px;"}
    width: min(78vw, 680px);
    border-radius: 16px;
  }

  @media (max-width: 640px) {
    top: -18px;
    ${({ $reverse }) =>
        $reverse
            ? "left: -14px;"
            : "right: -14px;"}
    width: 88%;
    border-radius: 16px;
  }
`;

const ShowcaseImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center top;

  @media (max-width: 1024px) {
    transform: scale(1.08);
    transform-origin: center top;
  }

  @media (max-width: 640px) {
    transform: scale(1.24);
    transform-origin: center top;
  }
`;

const ShowcasePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.10), transparent 55%),
  radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.10), transparent 55%),
  linear-gradient(180deg, rgba(241, 245, 249, 0.95), rgba(226, 232, 240, 0.85));

  :root[data-theme="dark"] & {
    background: radial-gradient(circle at 30% 20%, rgba(96, 165, 250, 0.16), transparent 55%),
    radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.14), transparent 55%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.75));
  }
`;

const ShowcaseContent = styled.div<{ $reverse?: boolean; $shiftX?: number }>`
  position: relative;
  left: ${({ $shiftX = 0 }) => `${$shiftX}px`};
  width: ${({ $shiftX = 0 }) =>
      $shiftX < 0 ? `calc(100% + ${Math.abs($shiftX)}px)` : "100%"};
  max-width: none;

  ${({ $reverse }) =>
      $reverse &&
      `
      text-align: right;
    `}

  @media (max-width: 1024px) {
  text-align: left;
  left: 0;
  width: 100%;
}
`;

const ShowcaseTitle = styled.h2`
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.08;
  margin: 0 0 18px;
  word-break: keep-all;
  color: ${BRAND.blue};

  :root[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const ShowcaseTitleLine = styled.span`
  display: block;

  @media (max-width: 640px) {
    white-space: normal;
  }
`;

const ShowcaseTitleAccent = styled.span`
  color: ${BRAND.blue};

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
  }
`;

const ShowcaseSubTitle = styled.h3`
  margin: 18px 0 10px;
  width: 100%;
  max-width: 430px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;

  :root[data-theme="dark"] & {
    color: #e2e8f0;
  }

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const ShowcaseDescription = styled.p`
  margin: 0;
  width: 100%;
  max-width: 430px;
  min-height: calc(1.75em * 4);
  font-size: 15px;
  line-height: 1.75;
  color: #64748b;
  word-break: keep-all;
  text-wrap: pretty;

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }

  @media (max-width: 1024px) {
    max-width: 100%;
    min-height: auto;
  }
`;

const ProgressBarWrap = styled.div`
  max-width: 720px;
  width: 100%;
  margin: 20px auto 0;
  position: relative;
`;

const ProgressTrack = styled.div`
  height: 12px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.7);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06) inset;
  overflow: hidden;

  :root[data-theme="dark"] & {
    background: rgba(148, 163, 184, 0.18);
    box-shadow: 0 16px 40px rgba(2, 6, 23, 0.35) inset;
  }
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 1) 0%, rgba(6, 182, 212, 1) 50%, rgba(16, 185, 129, 1) 100%);
  transform-origin: left center;
  transform: ${props => `scaleX(${Math.max(0, Math.min(1, props.$progress))})`};
  transition: transform 0.12s linear;
`;

const ProgressStepLabel = styled.div<{ $leftPct: number; $active?: boolean; $edge?: "left" | "right" }>`
  position: absolute;
  left: ${props => `${props.$leftPct}%`};
  top: -38px;
  transform: ${props => {
    if (props.$edge === "left") return "translate(0, 0)";
    if (props.$edge === "right") return "translate(-100%, 0)";
    return "translate(-50%, 0)";
  }};
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${props => (props.$active ? "rgba(59, 130, 246, 1)" : "rgba(100, 116, 139, 0.85)")};
  white-space: nowrap;
  user-select: none;
  pointer-events: none;

  @media (max-width: 1024px) {
    font-size: 11px;
    top: -34px;
    letter-spacing: 0.08em;
  }

  @media (max-width: 640px) {
    font-size: 9px;
    top: -28px;
    letter-spacing: 0.04em;
  }

  :root[data-theme="dark"] & {
    color: ${props => (props.$active ? "rgba(96, 165, 250, 1)" : "rgba(148, 163, 184, 0.75)")};
  }
`;

const ProgressDot = styled.div<{ $leftPct: number; $active?: boolean; $edge?: "left" | "right" }>`
  position: absolute;
  top: 50%;
  left: ${props => `${props.$leftPct}%`};
  transform: ${props => {
  const scale = props.$active ? 1.25 : 1;
  if (props.$edge === "left") return `translate(0, -50%) scale(${scale})`;
  if (props.$edge === "right") return `translate(-100%, -50%) scale(${scale})`;
  return `translate(-50%, -50%) scale(${scale})`;
}};
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: ${props => (props.$active ? "rgba(59, 130, 246, 1)" : "rgba(226, 232, 240, 1)")};
  box-shadow: ${props => (props.$active ? "0 18px 38px rgba(59, 130, 246, 0.26)" : "0 16px 34px rgba(15, 23, 42, 0.08)")};
  border: 3px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

  :root[data-theme="dark"] & {
    background: ${props => (props.$active ? "rgba(96, 165, 250, 1)" : "rgba(148, 163, 184, 0.45)")};
    border-color: rgba(15, 23, 42, 0.9);
    box-shadow: ${props => (props.$active ? "0 22px 60px rgba(2, 6, 23, 0.65)" : "0 18px 50px rgba(2, 6, 23, 0.45)")};
  }
`;

const ProgressTopSlot = styled.div`
  min-height: 36px;
  margin-top: 14px;

  @media (max-width: 640px) {
    min-height: 24px;
    margin-top: 8px;
  }
`;

const ProgressBottomSlot = styled.div`
  min-height: 36px;
  margin-top: 28px;

  @media (max-width: 640px) {
    min-height: 24px;
    margin-top: 18px;
  }
`;

const ProgressBottomDescription = styled.p`
  margin-top: 100px;
  font-size: 30px;
  line-height: 1.65;
  color: #64748b;
  word-break: keep-all;
  text-wrap: balance;

  @media (max-width: 1024px) {
    margin-top: 72px;
    font-size: 24px;
    line-height: 1.55;
  }

  @media (max-width: 640px) {
    margin-top: 44px;
    font-size: 18px;
    line-height: 1.5;
    padding: 0 8px;
  }

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

type ProgressStepItem = {
  label: string;
  description: string;
  leftPct: number;
  edge?: "left" | "right";
};

const PROGRESS_STEPS: ProgressStepItem[] = [
  { label: "STEP 01", description: "면접을 준비하기 위한 학습 환경을 제공합니다.", leftPct: 0, edge: "left" },
  { label: "STEP 02", description: "퀴즈를 통해 학습 내용을 확인하고 점검할 수 있습니다.", leftPct: 33.333 },
  { label: "STEP 03", description: "AI 모의 면접으로 실전처럼 면접을 연습할 수 있습니다.", leftPct: 66.666 },
  { label: "STEP 04", description: "AI 모의 면접 피드백으로 나의 면접 역량 Develop!", leftPct: 100, edge: "right" },
];

const INSIGHTS_TICKER_ITEMS = [
  "트랜잭션이 무엇이고, 왜 필요한가요?",
  "데이터베이스 인덱스는 어떤 경우에 사용하나요?",
  "브라우저 렌더링 과정은 어떻게 진행되나요?",
  "상태(state)와 props의 차이는 무엇인가요?",
  "최근 프로젝트에서 가장 큰 이슈는 무엇이었고, 어떻게 해결했나요?",
  "팀 내에서 본인이 주도적으로 맡았던 역할은 무엇인가요?",
  "일정이 지연됐던 경험이 있다면, 그 원인은 무엇이었나요?",
  "협업 과정에서 의견 충돌이 있었을 때 어떻게 대응했나요?",
  "최근에 새로 배운 기술이나 지식이 있다면 무엇인가요?",
] as const;

type StoreModalType = "google" | "appstore" | null;

/* ========== Hero Section (Whale Space Style) ========== */
const HeroSection = styled.section`
  width: 100%;
  height: 100vh;
  min-height: 760px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(
      to right,
      #e1ecf8 0%,
      #e2f2f3 50%,
      #dbf4ee 100%
  ); /* 회색기 없이 더 맑고 진한 아이스 블루~아이스 민트 쿨톤 그라데이션 */

  /* 스크롤을 내릴 때 하단 영역과 끊기지 않고 부드럽게 이어지도록 화이트 페이드 아웃 효과 적용 */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 55vh;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.85) 80%, rgba(255, 255, 255, 1) 100%);
    z-index: 2;
    pointer-events: none;
  }

  /* 구름 이미지 (back7.png) 배경 레이어 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-image: url(${back7});
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    opacity: 0.45; /* 구름 느낌이 전체적으로 은은하게 깔리도록 투명도 설정 */
    mix-blend-mode: normal;
    pointer-events: none;
    z-index: 1;
    /* 구름 위쪽이 자연스럽게 투명해져 쿨톤 배경과 섞이도록 선형 마스크 적용 */
    mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,1) 70%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,1) 70%);
    animation: driftCloud 35s ease-in-out infinite alternate;
  }

  @keyframes driftCloud {
    0% { transform: scale(1.05) translate(0%, 1%); }
    100% { transform: scale(1.1) translate(-1%, -1%); }
  }

  @media (max-width: 900px) {
    height: auto;
    min-height: unset;
    padding: 120px 0 72px;
    align-items: flex-start;
  }

  @media (max-width: 640px) {
    padding: 108px 0 56px;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 0 20px;
    gap: 28px;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  color: #1a1a1a;
  text-shadow: none; /* 배경과 자연스럽게 어울리도록 텍스트 그림자 제거 */
  transform: translateY(-40px) translateX(-60px); /* 왼쪽 위로 이동 */
  @media (max-width: 1100px) {
    transform: translateY(-16px) translateX(0);
  }

  @media (max-width: 900px) {
    width: 100%;
    transform: none;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(48px, 6vw, 72px);
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 24px;
  white-space: pre-line;
  letter-spacing: -0.03em;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(18px, 2.2vw, 22px);
  font-weight: 500;
  line-height: 1.6;
  opacity: 0.85;
  white-space: pre-line;
  margin-bottom: 40px;
  max-width: 600px;
  color: #333333;

  @media (max-width: 900px) {
    margin-left: 0;
    margin-right: 0;
  }
`;


/* ══════════════════════════════════════════
   Hero 섹션 전용 컴포넌트
══════════════════════════════════════════ */

const heroImgFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
`;

/* 왼쪽 로고+타이틀 한 줄 */
const HeroLogoLine = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  margin-left: -16px;

  @media (max-width: 900px) {
    margin-left: 0;
    justify-content: flex-start;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const HeroLogoImg = styled.img`
  height: 150px;
  width: auto;
  object-fit: contain;
  display: block;

  @media (max-width: 900px) {
    height: 92px;
  }

  @media (max-width: 640px) {
    height: 72px;
  }
`;

const HeroLogoX = styled.span`
  font-size: 110px;
  //font-weight: 900;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  @media (max-width: 900px) {
    font-size: 72px;
  }

  @media (max-width: 640px) {
    font-size: 56px;
  }
`;

const HeroLogoAIText = styled.span`
  font-size: 100px;
  font-weight: 700;
  margin-top: 20px;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  @media (max-width: 900px) {
    font-size: 64px;
    margin-top: 12px;
  }

  @media (max-width: 640px) {
    font-size: 48px;
    margin-top: 8px;
  }
`;

/* 메인 슬로건 */
const HeroMainSlogan = styled.div`
  font-size: clamp(38px, 4.4vw, 64px);
  font-weight: 400;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  font-family: 'IncheonEducation', 'Pretendard', sans-serif;
`;

/* 설명 문구 */
const HeroDescText = styled.p`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #475569;
  line-height: 1.68;
  letter-spacing: -0.012em;
  margin-bottom: 36px;
  max-width: 390px;
  word-break: keep-all;
  text-wrap: pretty;

  @media (max-width: 900px) {
    margin-left: 0;
    margin-right: 0;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 1.64;
    letter-spacing: -0.01em;
    max-width: 100%;
  }
`;

/* 버튼 그룹 */
const HeroBtnRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const HeroBtn = styled.button`
  height: 50px;
  padding: 0 28px;
  background: #0f172a;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: -0.01em;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover {
    background: #1e293b;
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

/* 오른쪽 이미지 영역 */
const HeroRightArea = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 480px;
  height: 480px;
  transform: translateX(60px);

  @media (max-width: 1100px) {
    width: 380px;
    height: 380px;
    transform: translateX(24px);
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

/* 3D "AI" 텍스트 이미지 (하단 메인) */
const PageAIEl = styled.img`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.13));
  animation: ${heroImgFloat} 5.5s ease-in-out infinite;
  animation-delay: 0.3s;
`;

/* 3D 도형 이미지 (상단 우측) */
const PageImgEl = styled.img`
  position: absolute;
  top: -10px;
  right: 80px;
  width: 500px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.10));
  animation: ${heroImgFloat} 4.8s ease-in-out infinite;
  animation-delay: 1.1s;
`;

/* 3D Floating Objects */
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  50% { transform: translateY(-30px) rotate(5deg) scale(1.02); }
`;

const ObjectContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
`;

// 1. Torus (Ring) - Top Right
const RingObject = styled.div`
  position: absolute;
  top: 18%;
  right: 18%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 24px solid #81ecec;
  box-shadow:
      inset 5px 5px 15px rgba(255,255,255,0.6),
      inset -5px -5px 15px rgba(0,168,255,0.2),
      10px 20px 30px rgba(0,168,255,0.2);
  transform: rotateX(40deg) rotateY(-20deg);
  animation: ${floatAnimation} 7s ease-in-out infinite;
  opacity: 0.9;

  &::after {
    content: '';
    position: absolute;
    inset: -24px;
    border-radius: 50%;
    border: 24px solid rgba(255,255,255,0.2);
    filter: blur(5px);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    border-width: 16px;
    right: 8%;
    top: 15%;
    &::after { inset: -16px; border-width: 16px; }
  }
`;

// 2. Cube - Bottom Right
const CubeObject = styled.div`
  position: absolute;
  bottom: 20%;
  right: 20%;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #fab1a0 0%, #e84393 100%);
  border-radius: 24px;
  transform: rotate(25deg) rotateX(20deg);
  box-shadow:
      -10px -10px 20px rgba(255,255,255,0.4) inset,
      10px 10px 30px rgba(232, 67, 147, 0.3);
  animation: ${floatAnimation} 9s ease-in-out infinite reverse;

  &::before {
    content: '';
    position: absolute;
    top: 10px; left: 10px; right: 10px; bottom: 10px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
  }

  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    right: 10%;
    bottom: 15%;
  }
`;

// 3. Plus - Bottom Left
const PlusObject = styled.div`
  position: absolute;
  bottom: 18%;
  left: 18%;
  width: 80px;
  height: 80px;
  animation: ${floatAnimation} 8s ease-in-out infinite 1s;

  &::before, &::after {
    content: '';
    position: absolute;
    background: #a29bfe;
    border-radius: 12px;
    box-shadow:
        inset 2px 2px 5px rgba(255,255,255,0.4),
        5px 5px 15px rgba(108, 92, 231, 0.3);
  }

  &::before {
    top: 0; left: 28px; width: 24px; height: 80px;
  }
  &::after {
    top: 28px; left: 0; width: 80px; height: 24px;
  }

  transform: rotate(-15deg);

  @media (max-width: 768px) {
    transform: scale(0.6) rotate(-15deg);
    left: 8%;
    bottom: 12%;
  }
`;

const SearchTitle2 = styled.h2`
  margin: 0 0 8px;
  margin-top: 400px;
  margin-bottom: 400px;
  position: relative;
  z-index: 1;
  font-size: 48px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
  text-align: center;
  font-family: Freesentation, sans-serif;
  overflow-wrap: break-word;
  word-break: keep-all;
  padding: 0 24px;

  @media (max-width: 1024px) {
    margin-top: 260px;
    margin-bottom: 260px;
    font-size: 38px;
    line-height: 1.4;
    padding: 0 24px;
  }

  @media (max-width: 768px) {
    margin-top: 180px;
    margin-bottom: 180px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.5;
    padding: 0 16px;
  }
`;

const SearchTitle2Line = styled.span`
  display: block;

  @media (max-width: 1024px) {
    white-space: nowrap;
    width: fit-content;
    margin-inline: auto;
  }
`;

const SearchTitle2Char = styled.span<{ $active: number }>`
  display: inline-block;
  color: ${({ $active }) => `rgba(15, 23, 42, ${0.18 + $active * 0.82})`};
  transition: color 0.12s linear;

  :root[data-theme="dark"] & {
    color: ${({ $active }) => `rgba(248, 250, 252, ${0.22 + $active * 0.73})`};
  }
`;

/* Cloud Transition Wrap - Hero 아래 구름 배경을 연장 */
const CloudTransitionWrap = styled.div`
  width: 100%;
  position: relative;
  background: #ffffff;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-image: url(${back7});
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    opacity: 0.12;
    pointer-events: none;
    z-index: 0;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, transparent 80%);
    -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, transparent 80%);
  }
`;

/* Products Section */
const ProductsSection = styled.section<{ $isVisible?: boolean }>`
  width: 100%;
  max-width: 1200px;
  margin: 200px auto 300px;
  padding: 0 24px;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateY(${props => props.$isVisible ? '0' : '40px'});
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;

  @media (max-width: 1024px) {
    margin: 140px auto 200px;
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    margin: 120px auto 180px;
    padding: 0 16px;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 560px;
    margin: 48px auto 0;
  }

  @media (max-width: 768px) {
    gap: 20px;
    max-width: 100%;
    margin-top: 40px;
  }
`;

const ProductCard = styled.div<{ $bgColor?: string; $delay?: number; $featured?: boolean }>`
  background: ${({ $featured, $bgColor }) =>
      $featured
          ? ($bgColor || "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)")
          : "#ffffff"};
  border-radius: 32px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ $featured }) =>
      $featured ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.04)"};
  box-shadow: ${({ $featured }) =>
      $featured
          ? "0 18px 48px rgba(59, 130, 246, 0.18)"
          : "0 12px 40px rgba(0, 0, 0, 0.04)"};
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: ${props => props.$delay || 0}s;
  min-height: 460px;
  cursor: pointer;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $featured }) =>
        $featured
            ? "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 38%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.10), transparent 34%)"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)"};
    opacity: 1;
    z-index: 0;
    transition: opacity 0.5s ease;
  }

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: ${({ $featured }) =>
        $featured
            ? "0 30px 70px rgba(59, 130, 246, 0.24)"
            : "0 30px 70px rgba(59, 130, 246, 0.12)"};
    border-color: ${({ $featured }) =>
        $featured ? "rgba(255,255,255,0.22)" : "rgba(59, 130, 246, 0.2)"};
    border-radius: 50%;
  }

  @media (max-width: 1024px) {
    max-width: 560px;
    min-height: 380px;
    padding: 40px 28px;
    border-radius: 28px;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    min-height: 340px;
    padding: 34px 24px;
    border-radius: 24px;
  }
`;

const ProductTitle = styled.h3<{ $color?: string; $featured?: boolean }>`
  font-size: 28px;
  font-weight: 800;
  color: ${({ $color }) => $color || "#0f172a"};
  margin-bottom: 14px;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;

  ${ProductCard}:hover & {
    ${({ $featured }) =>
        $featured
            ? `
          color: #ffffff;
          transform: scale(1.04);
        `
            : `
          background: linear-gradient(90deg, #3a83f3, #11b884);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transform: scale(1.1);
        `}
  }
`;

const ProductDesc = styled.p<{ $color?: string; $featured?: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: ${({ $color }) => $color || "#64748b"};
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 260px;
  word-break: keep-all;
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;

  ${ProductCard}:hover & {
    color: ${({ $featured, $color }) => ($featured ? ($color || "#ffffff") : "#334155")};
    transform: translateY(-5px);
  }
`;

const ProductImageWrap = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  img {
    width: 100%;
    height: 100%;
    max-height: 220px;
    object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.05));
    transition: all 0.6s ease;
  }

  @media (max-width: 1024px) {
    img {
      max-height: 190px;
    }
  }

  @media (max-width: 768px) {
    img {
      max-height: 170px;
    }
  }
`;

const ProductCircleImageWrap = styled.div`
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  ${ProductCard}:hover & {
    transform: scale(1.2) rotate(-5deg);

    img {
      filter: brightness(1.1) drop-shadow(0 10px 20px rgba(0,0,0,0.2));
    }
  }
`;

const Highlight = styled.span`
  background: ${BRAND.blue};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  text-decoration: underline;
  text-decoration-color: rgba(59, 130, 246, 0.3);
  text-decoration-thickness: 4px;
  text-underline-offset: 6px;
`;

const Highlight2 = styled.span`
  background: linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.greenDeep} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  text-decoration: underline;
  text-decoration-color: rgba(59, 130, 246, 0.3);
  text-decoration-thickness: 4px;
  text-underline-offset: 6px;


`;

const Subtitle = styled.p`
  font-size: clamp(16px, 2.5vw, 19px);
  font-weight: 500;
  line-height: 1.8;
  color: #334155;
  margin-bottom: 48px;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 32px;
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
    width: 100%;
    animation: fadeInUp 0.8s ease-out 0.4s both;
  }
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 16px 36px;
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  height: 60px;
  background: linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.greenDeep} 100%);
  //background-color: #21A3AE ;
  border: none;
  border-radius: 40px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    width: 100%;
    max-width: 100%;
    padding: 16px 32px;
    font-size: 16px;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  }
`;

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  color: ${BRAND.blue};
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: ${BRAND.surfaceAlt};
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  :root[data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.05);
    color: ${BRAND.blueDark};
    border-color: rgba(96, 165, 250, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(96, 165, 250, 0.5);
    }
  }

  @media (max-width: 640px) {
    width: 100%;
    max-width: 400px;
    padding: 14px 28px;
    font-size: 15px;
  }
`;

const BlueButton = styled(SecondaryButton)`
  background: ${BRAND.blue};
  color: #ffffff;
  border-color: ${BRAND.blue};

  &:hover {
    background: ${BRAND.blueHover};
    border-color: ${BRAND.blueHover};
  }

  :root[data-theme="dark"] & {
    background: ${BRAND.blue};
    color: #ffffff;
    border-color: ${BRAND.blue};

    &:hover {
      background: ${BRAND.blueHover};
      border-color: ${BRAND.blueHover};
    }
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${BRAND.blue};
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
  }

  @media (max-width: 768px) {
    width: 52px;
    height: 52px;
    bottom: 24px;
    right: 24px;
    font-size: 22px;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
`;

const ScrollTopButton = styled(FloatingButton)`
  bottom: calc(24px + env(safe-area-inset-bottom));
  background: white;
  color: ${BRAND.blue};
  border: 2px solid #e2e8f0;
  font-size: 20px;

  &:hover {
    background: ${BRAND.surfaceAlt};
    border-color: #cbd5e1;
  }

  @media (max-width: 768px) {
    bottom: calc(20px + env(safe-area-inset-bottom));
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  }
`;

/* ====== 서비스 카드 섹션 ====== */
const ServiceSection = styled.section`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 60px 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 40px 20px;
  }

  @media (max-width: 640px) {
    padding: 40px 16px;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 400px;
    background: linear-gradient(to bottom, transparent 0%, rgba(191, 219, 254, 0.3) 50%, rgba(191, 219, 254, 0.6) 100%);
    pointer-events: none;
    z-index: -1;
  }

  :root[data-theme="dark"] &::after {
    background: linear-gradient(to bottom, transparent 0%, rgba(30, 58, 138, 0.2) 50%, rgba(30, 58, 138, 0.4) 100%);
  }
`;

const ServiceTitle = styled.h2`
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  text-align: center;
  margin-bottom: 16px;
  color: #1a1a1a;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 26px;
    line-height: 1.4;
    padding: 0 16px;
  }

  :root[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const ServiceSubtitle = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  font-weight: 500;
  text-align: center;
  color: #5a5a5a;
  margin-bottom: 48px;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 14px;
    margin-bottom: 32px;
  }

  :root[data-theme="dark"] & {
    color: #94a3b8;
  }
`;

const ServiceGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 40px;
  perspective: 1200px;
  padding: 0 20px;
  min-height: 360px;

  @media (max-width: 1024px) {
    min-height: 320px;
    padding: 0 16px;
  }

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    min-height: auto;
    padding: 0 8px;
  }
`;

const ServiceCard = styled.div<{ $rotation: number; $zIndex: number; $isVisible?: boolean; $translateX: number }>`
  background: linear-gradient(180deg, rgba(239, 246, 255, 1) 0%, rgba(224, 242, 254, 1) 100%);
  border-radius: 22px;
  padding: 26px 24px 22px;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  width: 220px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  box-shadow: 0 26px 70px rgba(59, 130, 246, 0.16);
  transform: ${props => props.$isVisible
      ? `rotate(${props.$rotation}deg) translateY(0) translateZ(0)`
      : `rotate(0deg) translateY(30px) translateZ(0)`};
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  z-index: ${props => props.$zIndex};
  border: 1px solid rgba(59, 130, 246, 0.12);
  overflow: hidden;
  will-change: transform;

  & + & {
    margin-left: -64px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 22px;
    background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.18), transparent 55%),
    radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.14), transparent 55%);
    opacity: 0.75;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: rotate(${props => props.$rotation * 0.15}deg) translateY(-22px) scale(1.03);
    box-shadow: 0 34px 90px rgba(59, 130, 246, 0.22);

    &::before {
      opacity: 1;
    }
  }

  &:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.35);
    outline-offset: 4px;
  }

  @media (max-width: 1200px) {
    width: 210px;
    height: 290px;
  }

  @media (max-width: 1024px) {
    width: 200px;
    height: 280px;
    & + & {
      margin-left: -56px;
    }
  }

  @media (max-width: 640px) {
    width: 100%;
    height: 240px;
    padding: 22px 20px 18px;
    border-radius: 20px;
    transform: ${props => (props.$isVisible ? 'translateY(0)' : 'translateY(18px)')};
    opacity: ${props => (props.$isVisible ? 1 : 0)};

    & + & {
      margin-left: 0;
    }

    &:hover {
      transform: translateY(-10px) scale(1.01);
    }
  }

  :root[data-theme="dark"] & {
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.92) 100%);
    border-color: rgba(96, 165, 250, 0.18);
    box-shadow: 0 34px 90px rgba(2, 6, 23, 0.55);

    &::before {
      opacity: 0.55;
    }

    &:hover {
      background: linear-gradient(180deg, rgba(17, 32, 66, 0.92) 0%, rgba(30, 41, 59, 0.92) 100%);
      box-shadow: 0 40px 110px rgba(2, 6, 23, 0.65);
    }
  }
`;

const CardLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(15, 23, 42, 0.55);
  margin-bottom: 10px;

  @media (max-width: 640px) {
    font-size: 12px;
  }

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.7);
  }
`;

const CardTitle = styled.h3`
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.04em;
  word-break: keep-all;
  line-height: 1.15;
  text-align: left;

  @media (max-width: 640px) {
    font-size: 26px;
  }

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const CardIcon = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 92px;
  margin-top: auto;
  padding-bottom: 10px;
  filter: drop-shadow(0 18px 26px rgba(59, 130, 246, 0.18));
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 640px) {
    font-size: 78px;
  }

  ${ServiceCard}:hover & {
    transform: translateY(-8px) scale(1.04);
  }

  :root[data-theme="dark"] & {
    filter: drop-shadow(0 18px 30px rgba(2, 6, 23, 0.5));
  }
`;

type ServiceCardItem = {
  label: string;
  title: string;
  icon: string;
};

const SERVICE_CARDS: ServiceCardItem[] = [
  {
    label: "Lecture Room",
    title: "공부",
    icon: "✏️",
  },
  {
    label: "Treatment Room",
    title: "시험",
    icon: "💉",
  },
  {
    label: "Conference Room",
    title: "면접 연습",
    icon: "💬",
  },
  {
    label: "Waiting Room",
    title: "모의 면접",
    icon: "🛋️",
  },
  {
    label: "Consultation Room",
    title: "복기",
    icon: " ",
  },
];

/* ====== 코딩 연습 섹션 ====== */
const WhiteBackground = styled.div`
  background: #ffffff;
  width: 100%;
  position: relative;
  z-index: 1;

  :root[data-theme="dark"] & {
    background: #0f172a;
  }
`;


const PracticeSection = styled.section`
  width: 100%;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 40px 16px;
  }
`;

const PracticeIcon = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  background: #E2E8F0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  box-shadow: 0 10px 40px rgba(59, 130, 246, 0.22);
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @media (max-width: 640px) {
    width: 90px;
    height: 90px;
    font-size: 48px;
  }
`;

const PracticeTitle = styled.h2`
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 900;
  margin-bottom: 50px;
  letter-spacing: -0.03em;
  color: #1e293b;
  word-break: keep-all;
  line-height: 1.3;

  @media (max-width: 640px) {
    font-size: 28px;
    margin-bottom: 16px;
  }

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const PracticeHighlight = styled.span`
  background: linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.greenDeep} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
`;

const DotStyle = styled.span`
  font-weight: 900;
  font-size: 70px;
  color: #DFE2E4;
  letter-spacing: -0.02em;   /* 두께 체감 ↑ */
  -webkit-text-stroke: 0.2px currentColor; /* 윤곽 강조 */
`;


const PracticeHighlight2 = styled.span`
  background: #3B82F6;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  text-decoration: underline;
  text-decoration-color: rgba(59, 130, 246, 0.3);
  text-decoration-thickness: 4px;
  text-underline-offset: 6px;
`;


const PracticeDescription = styled.p`
  font-size: clamp(16px, 2.5vw, 20px);
  color: #64748b;
  margin-bottom: 60px;
  line-height: 1.7;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 40px;
  }


  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;


const SubTextStyle = styled.span`
  font-weight: 900;
  font-size: 23px;
  color: #A7ABB3;
  letter-spacing: -0.02em;   /* 두께 체감 ↑ */
  -webkit-text-stroke: 0.2px currentColor; /* 윤곽 강조 */
`;

const SubTextStyle2 = styled.span`
  font-weight: 900;
  font-size: 23px;
  letter-spacing: -0.02em;   /* 두께 체감 ↑ */
  -webkit-text-stroke: 0.2px currentColor; /* 윤곽 강조 */

  background: linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.greenDeep} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: underline;
  text-decoration-color: rgba(59, 130, 246, 0.3);
  text-decoration-thickness: 4px;
  text-underline-offset: 6px;
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 40px;
  }
`;

const StepCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: left;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba(59, 130, 246, 0.12);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyanDeep});
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.14);
    border-color: rgba(59, 130, 246, 0.28);
  }

  @media (max-width: 640px) {
    padding: 32px 24px;
    border-radius: 16px;

    &:hover {
      transform: translateY(-4px);
    }
  }

  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
    border-color: rgba(96, 165, 250, 0.2);
  }
`;

const StepBadge = styled.div`
  display: inline-block;
  padding: 6px 16px;
  background: rgba(59, 130, 246, 0.12);
  color: ${BRAND.blue};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  text-transform: uppercase;

  @media (max-width: 640px) {
    font-size: 11px;
    padding: 5px 14px;
    margin-bottom: 16px;
  }
`;

const StepTitle = styled.h3`
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 20px;
    margin-bottom: 12px;
  }

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const StepDescription = styled.p`
  font-size: clamp(15px, 2vw, 17px);
  color: #64748b;
  line-height: 1.7;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 1.6;
  }

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const MockupCard = styled.div`
  background: linear-gradient(135deg, ${BRAND.greenDeep}, ${BRAND.cyanDeep});
  border-radius: 20px;
  padding: 40px;
  color: white;
  margin-top: 60px;
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
  text-align: center;

  @media (max-width: 640px) {
    padding: 32px 24px;
    margin-top: 40px;
    border-radius: 16px;
  }

  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, ${BRAND.greenDeep}, ${BRAND.cyanDeep});
  }
`;

const MockupTitle = styled.h4`
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 800;
  margin-bottom: 12px;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const MockupText = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  opacity: 0.95;
  line-height: 1.6;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 1.5;
  }
`;

/* ====== 기능 소개 섹션 ====== */
const FeaturesSection = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 80px auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 40px auto;
    padding: 0 16px;
  }
`;

const FeatureRow = styled.div<{ $reverse?: boolean; $isVisible?: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$reverse ? '1fr 1fr' : '1fr 1fr'};
  gap: ${props => props.$reverse ? '100px' : '60px'};
  align-items: center;
  margin-bottom: 180px;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateY(${props => props.$isVisible ? '0' : '60px'});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
    margin-bottom: 100px;
  }

  @media (max-width: 640px) {
    gap: 24px;
    margin-bottom: 60px;
    padding: 0;
  }
`;

const FeatureContent = styled.div<{ $reverse?: boolean; $isVisible?: boolean }>`
  order: ${props => props.$reverse ? 2 : 1};
  padding-left: ${props => props.$reverse ? '40px' : '0'};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateX(${props => props.$isVisible ? '0' : (props.$reverse ? '40px' : '-40px')});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;

  @media (max-width: 968px) {
    order: 1;
    padding-left: 0;
    transform: translateX(0);
  }

  @media (max-width: 640px) {
    padding: 0;
  }
`;

const FeatureImageBox = styled.div<{ $reverse?: boolean; $isVisible?: boolean }>`
  order: ${props => props.$reverse ? 1 : 2};
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 24px;
  padding: 60px 40px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(148, 163, 184, 0.2);
  position: relative;
  overflow: hidden;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateX(${props => props.$isVisible ? '0' : (props.$reverse ? '-40px' : '40px')}) scale(${props => props.$isVisible ? 1 : 0.95});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05));
    border-radius: 16px;
  }

  @media (max-width: 968px) {
    order: 2;
    min-height: 300px;
    transform: translateX(0) scale(${props => props.$isVisible ? 1 : 0.95});
  }

  @media (max-width: 640px) {
    min-height: 200px;
    max-height: 240px;
    padding: 32px 20px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    margin: 0;

    &::before {
      width: 70%;
      height: 70%;
    }
  }

  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.8));
    border-color: rgba(148, 163, 184, 0.1);
  }
`;

const FeatureImagePlaceholder = styled.div`
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  z-index: 1;

  @media (max-width: 640px) {
    font-size: 16px;
  }

  :root[data-theme="dark"] & {
    color: #64748b;
  }
`;

const FeatureBadge = styled.div`
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1));
  color: ${BRAND.blue};
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 0.02em;

  @media (max-width: 640px) {
    font-size: 12px;
    padding: 6px 16px;
    margin-bottom: 16px;
  }

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
  }
`;

const FeatureTitle = styled.h3`
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
  line-height: 1.3;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 24px;
    margin-bottom: 16px;
  }

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const FeatureHighlight = styled.span`
  color: ${BRAND.cyanDeep};
  position: relative;
`;

const FeatureDescription = styled.p`
  font-size: clamp(16px, 2vw, 19px);
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 24px;
  word-break: keep-all;

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
`;

const FeatureListItem = styled.li`
  font-size: clamp(15px, 2vw, 17px);
  color: #475569;
  padding: 12px 0;
  padding-left: 32px;
  position: relative;
  word-break: keep-all;

  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: ${BRAND.greenDeep};
    font-weight: 900;
    font-size: 20px;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px 0;
    padding-left: 28px;

    &::before {
      font-size: 18px;
    }
  }

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

/* ========== 하단 AI 면접 소개 섹션 ========== */
const scrollLeft = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
`;

const HomeFiveSection = styled.section`
  width: 100%;
  max-width: 1080px;
  margin: 220px auto 160px;
  padding: 0 24px;
  text-align: center;
  position: relative;
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    top: -56px;
    left: 50%;
    transform: translateX(-50%);
    width: min(100%, 920px);
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(148, 163, 184, 0.32) 50%,
        transparent 100%
    );
  }

  @media (max-width: 768px) {
    margin: 140px auto 96px;
    padding: 0 16px;

    &::before {
      top: -40px;
      width: calc(100% - 32px);
    }
  }
`;

const COMPANY_LOGOS = [
  { src: logoKT, alt: "KT M mobile" },
  { src: logoDanggeun, alt: "당근" },
  { src: logoToss, alt: "Toss" },
  { src: logoEncore, alt: "en-core" },
  { src: logoCoupang, alt: "Coupang" },
  { src: logoKakao, alt: "Kakao", boxWidth: 128 },
  { src: logoLine, alt: "LINE", boxWidth: 128 },
  { src: logoNaver, alt: "NAVER" },
];

const TitleBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${BRAND.blue};
  padding: 9px 18px;
  margin-bottom: 24px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.14);
  background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.92) 0%,
      rgba(248, 250, 252, 0.92) 100%
  );
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(10px);

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
    border-color: rgba(96, 165, 250, 0.2);
    background: linear-gradient(
        180deg,
        rgba(30, 41, 59, 0.84) 0%,
        rgba(15, 23, 42, 0.84) 100%
    );
    box-shadow: 0 16px 40px rgba(2, 6, 23, 0.35);
  }
`;

const Hero = styled.div`
  max-width: 820px;
  margin: 0 auto 56px;

  h2 {
    margin: 0 0 18px;
    font-size: clamp(34px, 5vw, 52px);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.2;
    color: #0f172a;
    word-break: keep-all;
    text-wrap: balance;

    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }

  p {
    margin: 0 auto;
    max-width: 720px;
    font-size: 16px;
    line-height: 1.8;
    color: #64748b;
    word-break: keep-all;
    text-wrap: pretty;

    :root[data-theme="dark"] & {
      color: #cbd5e1;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 40px;

    h2 {
      font-size: 32px;
      line-height: 1.28;
      margin-bottom: 14px;
    }

    p {
      font-size: 15px;
      line-height: 1.72;
    }
  }
`;

const Features = styled.div`
  max-width: 920px;
  margin: 0 auto 28px;
  padding: 34px 36px;
  border-radius: 30px;
  background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.92) 0%,
      rgba(248, 250, 252, 0.98) 100%
  );
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(10px);

  h2 {
    margin: 0 0 14px;
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.3;
    color: #0f172a;
    word-break: keep-all;

    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.8;
    color: #64748b;
    word-break: keep-all;
    text-wrap: pretty;

    :root[data-theme="dark"] & {
      color: #cbd5e1;
    }
  }

  :root[data-theme="dark"] & {
    background: linear-gradient(
        180deg,
        rgba(30, 41, 59, 0.84) 0%,
        rgba(15, 23, 42, 0.88) 100%
    );
    border-color: rgba(148, 163, 184, 0.14);
    box-shadow: 0 26px 70px rgba(2, 6, 23, 0.45);
  }

  @media (max-width: 768px) {
    padding: 26px 22px;
    border-radius: 24px;
    margin-bottom: 22px;

    h2 {
      font-size: 22px;
      margin-bottom: 10px;
    }

    p {
      font-size: 14px;
      line-height: 1.72;
    }
  }
`;

const Companies = styled.div`
  max-width: 980px;
  margin: 220px auto 260px;
  padding-top: 28px;
  padding-bottom: 24px;
  text-align: center;

  @media (max-width: 768px) {
    margin: 132px auto 168px;
    padding-top: 18px;
    padding-bottom: 16px;
  }
`;

const CompaniesEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  color: ${BRAND.blue};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 14px;

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
    background: rgba(96, 165, 250, 0.12);
  }
`;

const CompaniesTitle = styled.h2`
  margin: 0;
  font-size: clamp(30px, 4.6vw, 46px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.18;
  color: #0f172a;
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const CompaniesTitleAccent = styled.span`
  color: ${BRAND.blue};

  :root[data-theme="dark"] & {
    color: ${BRAND.blueDark};
  }
`;

const CompaniesDesc = styled.p`
  margin: 14px auto 0;
  max-width: 760px;
  font-size: 16px;
  line-height: 1.8;
  color: #64748b;
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 1.7;
  }
`;

/* ========== COREVALUE 섹션 ========== */
const CoreValueSection = styled.section`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  @media (max-width: 1024px) {
    padding: 96px 24px;
  }

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 80px 20px;
  }
`;

const CoreValueHeader = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 80px;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    margin-bottom: 56px;
  }
`;

const CoreValueLabel = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.22em;
  color: #ffffff;
  text-transform: uppercase;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  padding: 9px 22px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
`;

const CoreValueTitle = styled.h2`
  font-size: clamp(32px, 4.5vw, 52px);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.32;
  margin: 0;
  letter-spacing: -0.02em;
  word-break: keep-all;
  text-wrap: balance;

  @media (max-width: 768px) {
    font-size: 28px;
    line-height: 1.38;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    line-height: 1.42;
  }
`;

const CoreValueTitleLine = styled.span`
  display: inline;

  & + & {
    margin-left: 0.28em;
  }

  @media (max-width: 1024px) {
    display: block;

    & + & {
      margin-left: 0;
    }
  }
`;

const CoreValueTitleAccent = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  padding-bottom: 2px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 2px;
    opacity: 0.28;
  }
`;

const CoreValueGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 80px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    gap: 56px;
  }

  @media (max-width: 768px) {
    gap: 48px;
  }
`;

const CoreValueRow = styled.div<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 28px;
    width: 100%;
  }

  ${props => props.$reverse && `
    direction: rtl;

    > * {
      direction: ltr;
    }
  `}
`;

const CoreValueImageCard = styled.div`
  width: 100%;
  aspect-ratio: 3 / 2;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 32px;
  padding: 0;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 32px 64px rgba(37, 99, 235, 0.3);
  }

  @media (max-width: 1024px) {
    width: 100%;
    border-radius: 28px;
  }

  @media (max-width: 768px) {
    border-radius: 24px;
  }
`;

const CoreValueImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const CoreValueImage = styled.img<{ $fit?: "cover" | "contain" }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: ${({ $fit }) => $fit ?? "cover"};
  object-position: center;
`;

const CoreValueContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const CoreValueCardTitle = styled.h3`
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.02em;
  word-break: keep-all;
  text-wrap: balance;

  @media (max-width: 768px) {
    font-size: 24px;
    line-height: 1.45;
  }

  @media (max-width: 480px) {
    font-size: 22px;
    line-height: 1.5;
  }
`;

const CoreValueCardTitleLine = styled.span`
  display: block;
`;

const CoreValueCardDesc = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.8;
  margin: 0;
`;

/* ========== GROWTH 섹션 ========== */
const GrowthSection = styled.section`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  box-sizing: border-box;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  }

  @media (max-width: 768px) {
    min-height: 100vh;
    padding: 80px 20px;
  }
`;

const GrowthHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 80px;
  max-width: 1300px;
  margin-left: auto;
  margin-right: auto;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%);
    border-radius: 2px;
  }
`;

const GrowthLabel = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.22em;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 20px;
  padding: 8px 22px;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 999px;
  border: 1px solid #e2e8f0;
`;

const GrowthTitle = styled.h2`
  font-size: clamp(32px, 4.2vw, 48px);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.32;
  margin: 0;
  letter-spacing: -0.02em;
  word-break: keep-all;
  text-wrap: balance;

  @media (max-width: 768px) {
    font-size: 28px;
    line-height: 1.38;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    line-height: 1.42;
  }
`;

const GrowthTitleLine = styled.span`
  display: inline;

  & + & {
    margin-left: 0.28em;
  }

  &:nth-of-type(2)::after {
    content: "";
    display: block;
  }

  &:nth-of-type(3) {
    margin-left: 0;
  }

  @media (max-width: 1024px) {
    display: block;

    & + & {
      margin-left: 0;
    }

    &:nth-of-type(2)::after {
      content: none;
    }
  }
`;

const GrowthTitleAccent = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  padding-bottom: 2px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 2px;
    opacity: 0.28;
  }
`;

const GrowthCard = styled.div<{ $offset?: number }>`
  flex: 1;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 36px 28px;
  margin-top: ${({ $offset }) => $offset || 0}px;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 0;
    background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
    transition: height 0.5s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 32px rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.2);

    &::before {
      height: 100%;
    }

    @media (max-width: 900px) {
      margin-top: 0;
    }
  }

  @media (max-width: 900px) {
    margin-top: 0;
  }
`;

const GrowthTimeline = styled.div`
  display: flex;
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
`;

const GrowthCardYear = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 10px;
`;

const GrowthCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px;
  line-height: 1.45;
  letter-spacing: -0.02em;
  word-break: keep-all;
  text-wrap: pretty;
`;

const GrowthCardDesc = styled.p`
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.75;
  margin: 0;
  word-break: keep-all;
  text-wrap: pretty;
`;

/* ========== 스크롤 인터랙티브 섹션 ========== */
const ScrollSectionsWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ScrollSectionWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200vh;
`;

const ScrollSection = styled.section<{ $bgColor: string; $zIndex: number }>`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: ${props => props.$bgColor};
  position: sticky;
  top: 0;
  z-index: ${props => props.$zIndex};

  @media (max-width: 768px) {
    padding: 60px 20px;
    height: 100vh;
  }
`;

const ScrollContainer = styled.div`
  max-width: 1400px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ScrollTextContent = styled.div`
  @media (max-width: 900px) {
    order: 1;
  }
`;

const ScrollLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 20px;
  opacity: 0.7;
`;

const ScrollTitle = styled.h2`
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 24px;
  letter-spacing: -0.02em;
  word-break: keep-all;
`;

const ScrollDescription = styled.p`
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.7;
  margin: 0;
  opacity: 0.8;
  word-break: keep-all;
`;

const ScrollImageBox = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    order: 0;
    aspect-ratio: 16 / 9;
  }
`;

const ScrollImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  opacity: 0.5;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
`;

const LogoSlider = styled.div`
  overflow: hidden;
  width: 100%;
  margin-top: 26px;
  padding: 20px 0;
  position: relative;
`;

const LogoTrack = styled.div`
  display: flex;
  align-items: center;
  width: max-content;
  will-change: transform;
  animation: ${scrollLeft} 42s linear infinite;

  ${LogoSlider}:hover & {
    animation-play-state: paused;
  }

  @media (max-width: 640px) {
    animation: ${scrollLeft} 32s linear infinite;
  }
`;

const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 44px;
  padding-right: 44px;

  @media (max-width: 640px) {
    gap: 30px;
    padding-right: 30px;
  }
`;

const LogoItemWrap = styled.div<{ $width?: number }>`
  flex: 0 0 auto;
  width: ${({ $width }) => `${$width ?? 144}px`};
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.96;
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    opacity: 1;
  }

  @media (max-width: 640px) {
    width: ${({ $width }) => `${Math.round(($width ?? 144) * 0.8)}px`};
    height: 38px;
  }
`;

const LogoInner = styled.div<{ $height?: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height ?? 40}px`};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    height: ${({ $height }) => `${Math.round(($height ?? 40) * 0.8)}px`};
  }
`;

const LogoImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
`;

const BlueText = styled.strong`
  color: ${BRAND.blue};
`;

const ConfettiCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none;
  z-index: 9999;
`;

/* ========== 모바일 ========== */

const MobilePromoSection = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 120px;
  padding: 0 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin: 0 auto 88px;
    padding: 0 16px;
  }
`;

const MobilePromoHead = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const MobilePromoEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  color: ${BRAND.blue};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 14px;
`;

const MobilePromoTitle = styled.h2`
  margin: 0;
  font-size: clamp(30px, 4.6vw, 46px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.18;
  color: #0f172a;
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const MobilePromoDesc = styled.p`
  margin: 14px auto 0;
  max-width: 760px;
  font-size: 16px;
  line-height: 1.8;
  color: #64748b;
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 1.7;
  }
`;

const MobilePromoBanner = styled.div`
  position: relative;
  width: 100%;
  min-height: 430px;
  border-radius: 40px;
  overflow: visible;
  isolation: isolate;
  background: linear-gradient(180deg, #eef2f7 0%, #edf4f6 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);

  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  align-items: center;
  padding: 44px 60px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    min-height: 360px;
    padding: 32px 32px 28px;
    grid-template-columns: 0.95fr 1.05fr;
  }

  @media (max-width: 640px) {
    min-height: auto;
    grid-template-columns: 1fr;
    padding: 24px 18px 170px;
    border-radius: 24px;
    gap: 12px;
    overflow: hidden;
  }
`;

const MobilePromoImage = styled.img`
  position: absolute;
  right: 0px;
  bottom: -8px;
  top: auto;
  z-index: 2;
  display: block;
  width: min(540px, 54%);
  height: auto;
  margin: 0;
  pointer-events: none;
  filter: drop-shadow(0 28px 60px rgba(15, 23, 42, 0.16));

  @media (max-width: 1024px) {
    right: 0px;
    bottom: -6px;
    width: min(520px, 58%);
  }

  @media (max-width: 640px) {
    right: -8px;
    bottom: 8px;
    width: min(290px, 88%);
    margin: 0;
  }
`;

const MobilePromoLogo = styled.img`
  display: block;
  width: 140px;
  height: auto;
  object-fit: contain;
  margin-bottom: 18px;

  @media (max-width: 768px) {
    width: 120px;
    margin-bottom: 14px;
  }
`;

const MobilePromoContent = styled.div`
  position: relative;
  z-index: 3;
  max-width: 420px;
  align-self: center;

  @media (max-width: 1024px) {
    max-width: 360px;
  }

  @media (max-width: 640px) {
    max-width: 100%;
    align-self: start;
    text-align: left;
  }
`;

const MobilePromoInsideTitle = styled.h2`
  margin: 0;
  font-size: clamp(34px, 4.2vw, 54px);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.045em;
  color: #0f172a;
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: 32px;
    line-height: 1.16;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const MobilePromoInsideDesc = styled.p`
  margin: 20px 0 0;
  font-size: 17px;
  line-height: 1.55;
  color: rgba(15, 23, 42, 0.72);
  word-break: keep-all;

  @media (max-width: 768px) {
    margin-top: 16px;
    font-size: 15px;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const MobileStoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-top: 22px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const MobileStoreButtonImg = styled.img`
  display: block;
  height: 54px;
  width: auto;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 48px;
  }

  @media (max-width: 480px) {
    height: 44px;
  }
`;

const MobileStoreActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.96;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const StoreQrModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
`;

const StoreQrModalCard = styled.div`
  position: relative;
  width: min(92vw, 420px);
  border-radius: 28px;
  background: #ffffff;
  padding: 28px 24px 24px;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.24);
  text-align: center;

  :root[data-theme="dark"] & {
    background: #0f172a;
    box-shadow: 0 28px 80px rgba(2, 6, 23, 0.55);
  }

  @media (max-width: 640px) {
    border-radius: 22px;
    padding: 24px 18px 20px;
  }
`;

const StoreQrCloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: #0f172a;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: rgba(148, 163, 184, 0.2);
    transform: scale(1.04);
  }

  :root[data-theme="dark"] & {
    color: #f8fafc;
    background: rgba(148, 163, 184, 0.16);
  }
`;

const StoreQrTitle = styled.h3`
  margin: 6px 0 10px;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;

  :root[data-theme="dark"] & {
    color: #f8fafc;
  }

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const StoreQrDesc = styled.p`
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.7;
  color: #64748b;
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const StoreQrImageWrap = styled.div`
  width: min(100%, 240px);
  margin: 0 auto;
  padding: 14px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);

  :root[data-theme="dark"] & {
    background: #ffffff;
  }
`;

const StoreQrImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
`;

const StoreQrCaption = styled.p`
  margin: 16px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #94a3b8;
`;


/* ========== SVG 스트로크 로고 컴포넌트 ========== */
type SvgStrokeLogoProps = {
  src: string;
  size?: number;
  stroke?: number;
  color?: string;
};

function SvgStrokeLogo({
                         src,
                         size = 120,
                         stroke = 1,
                         color = "#fff",
                       }: SvgStrokeLogoProps) {
  const rawId = useId().replace(/[:]/g, "");
  const strokeId = `stroke-${rawId}`;

  return (
      <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
          filter={stroke > 0 ? `url(#${strokeId})` : undefined}
      >
        {stroke > 0 && (
            <defs>
              <filter
                  id={strokeId}
                  x="-10%"
                  y="-10%"
                  width="120%"
                  height="120%"
                  colorInterpolationFilters="sRGB"
              >
                <feMorphology
                    in="SourceAlpha"
                    operator="dilate"
                    radius={stroke}
                    result="DILATE"
                />
                <feFlood floodColor={color} />
                <feComposite in2="DILATE" operator="in" result="STROKE" />
                <feMerge>
                  <feMergeNode in="STROKE" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
        )}

        <image
            href={src}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid meet"
        />
      </svg>
  );
}

/* ========== 메인 컴포넌트 ========== */
export default function Main() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const confettiFnRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const cooldownRef = useRef(false);
  const progressSectionRef = useRef<HTMLElement | null>(null);
  const progressValueRef = useRef(0);
  const isProgressPinnedRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const lockedScrollYRef = useRef(0);
  const isSnappingRef = useRef(false);
  const pinCooldownUntilRef = useRef(0);
  const progressCompletedOnceRef = useRef(false);
  const lastProgressTopRef = useRef(Number.POSITIVE_INFINITY);
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(true);
  const [areCardsVisible, setAreCardsVisible] = useState(false);
  const [featureVisibility, setFeatureVisibility] = useState([false, false, false, false]);
  const [progressValue, setProgressValue] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [circlesOpacity, setCirclesOpacity] = useState(1);
  const [isSearchTitle2Visible, setIsSearchTitle2Visible] = useState(false);
  const [isProductsVisible, setIsProductsVisible] = useState(false);
  const [shouldHideNavbar, setShouldHideNavbar] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isOpenEventModalOpen, setIsOpenEventModalOpen] = useState(false);
  const [storeModalType, setStoreModalType] = useState<StoreModalType>(null);
  const productsSectionRef = useRef<HTMLElement | null>(null);

  const searchTitle2Ref = useRef<HTMLHeadingElement | null>(null);
  const [searchTitle2FillProgress, setSearchTitle2FillProgress] = useState(0);

  const SEARCH_TITLE2_DESKTOP_LINES = [
    "면접으로 시작해 더 다양한 가치를 만드는데",
    "함께 하세요",
  ] as const;

  const SEARCH_TITLE2_TABLET_LINES = [
    "면접으로 시작해",
    "더 다양한 가치를 만드는데",
    "함께 하세요",
  ] as const;

  const SEARCH_TITLE2_MOBILE_LINES = [
    "면접으로 시작해",
    "더 다양한 가치를 만드는데",
    "함께 하세요",
  ] as const;

  const [titleMode, setTitleMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= 640) {
        setTitleMode("mobile");
      } else if (width <= 1024) {
        setTitleMode("tablet");
      } else {
        setTitleMode("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchTitle2Lines =
      titleMode === "mobile"
          ? SEARCH_TITLE2_MOBILE_LINES
          : titleMode === "tablet"
              ? SEARCH_TITLE2_TABLET_LINES
              : SEARCH_TITLE2_DESKTOP_LINES;

  const goToAiInterview = () => {
    window.location.href = "http://localhost/vue-ai-interview/ai-interview/landing";
  };

  const scrollToProducts = () => {
    if (!productsSectionRef.current) return;

    const y =
        productsSectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        88;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  const revealStyle = (delayMs: number) =>
      ({ ["--reveal-delay" as any]: `${delayMs}ms` } as React.CSSProperties);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsReviewModalOpen(true);
  //   }, 1500);
  //   return () => clearTimeout(timer);
  // }, []);

  const renderSearchTitle2 = () => {
    const totalChars = searchTitle2Lines.join("").replace(/\s/g, "").length;
    let currentCharIndex = 0;

    return searchTitle2Lines.map((line, lineIndex) => (
        <SearchTitle2Line key={lineIndex}>
          {[...line].map((char, charIndex) => {
            if (char === " ") {
              return <span key={`${lineIndex}-${charIndex}`}>&nbsp;</span>;
            }

            const active = Math.max(
                0,
                Math.min(1, searchTitle2FillProgress * totalChars - currentCharIndex)
            );

            currentCharIndex += 1;

            return (
                <SearchTitle2Char
                    key={`${lineIndex}-${charIndex}`}
                    $active={active}
                >
                  {char}
                </SearchTitle2Char>
            );
          })}
        </SearchTitle2Line>
    ));
  };

  useEffect(() => {
    const hideUntil = localStorage.getItem('openEventHideUntil');
    if (hideUntil && Date.now() < Number(hideUntil)) return;
    const timer = setTimeout(() => {
      setIsOpenEventModalOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const FAQ_ITEMS = [
    {
      q: "I-Poten은 어떤 서비스인가요?",
      a: "I-Poten은 면접 준비에 필요한 학습, 퀴즈, AI 모의 면접, 피드백 리포트를 하나로 연결해 주는 서비스입니다. 단순히 질문과 답변을 외우는 방식이 아니라, 반복 학습과 실전 연습을 통해 나만의 답변과 면접 역량을 만들어 갈 수 있도록 돕습니다.",
    },
    {
      q: "무료로 이용할 수 있나요?",
      a: "일부 기능은 무료로 이용할 수 있으며, 서비스 정책에 따라 체험 범위가 달라질 수 있습니다. 학습, 퀴즈, AI 모의 면접 등 세부 이용 범위는 추후 플랜에 따라 구분될 수 있습니다.",
    },
    {
      q: "어떤 사람에게 적합한 서비스인가요?",
      a: "취업을 준비하는 신입 구직자부터 이직을 준비하는 주니어, 경력 정리를 하고 싶은 시니어까지 폭넓게 활용할 수 있습니다. 직무별 핵심 개념 학습이 필요한 사용자, 실전 면접 연습이 필요한 사용자, 피드백을 통해 답변을 개선하고 싶은 사용자에게 특히 적합합니다.",
    },
    {
      q: "별도 프로그램 설치가 필요한가요?",
      a: "아니요. I-Poten은 웹 기반 서비스이기 때문에 별도의 프로그램 설치 없이 바로 이용할 수 있습니다. 브라우저만 있으면 학습, 퀴즈, AI 모의 면접, 결과 확인까지 한 곳에서 진행할 수 있습니다.",
    },
    {
      q: "AI 모의 면접은 어떻게 진행되나요?",
      a: "AI 모의 면접은 실제 면접처럼 질문에 답변하는 방식으로 진행되며, 사용자의 답변 내용을 바탕으로 피드백을 제공합니다. 답변의 흐름, 전달력, 보완할 점 등을 확인하면서 반복 연습에 활용할 수 있도록 구성됩니다.",
    },
    {
      q: "면접 결과나 피드백은 다시 확인할 수 있나요?",
      a: "네. 면접 결과와 피드백은 리포트 형태로 다시 확인할 수 있으며, 마이페이지나 저장 기능을 통해 반복적으로 복기할 수 있습니다. 이를 통해 이전 답변과 현재 답변을 비교하며 성장 과정을 확인할 수 있습니다.",
    },
    {
      q: "학습한 내용은 퀴즈나 면접 연습과 연결되나요?",
      a: "네. I-Poten은 단어 학습, 퀴즈, AI 모의 면접이 서로 연결되도록 설계되어 있습니다. 학습한 내용을 퀴즈로 점검하고, 이후 면접 답변에서 실제로 활용해 보면서 준비 과정을 자연스럽게 이어갈 수 있습니다.",
    },
  ] as const;

  // Confetti 초기화
  useEffect(() => {
    if (canvasRef.current && !confettiFnRef.current) {
      confettiFnRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }
    return () => {
      confettiFnRef.current = null;
    };
  }, []);

  // Confetti 발사 효과
  useEffect(() => {
    if (!sectionRef.current) return;
    const el = sectionRef.current;
    const fire = () => {
      const fn = confettiFnRef.current;
      if (!fn) return;
      const shot = (r: number, o: any) =>
          fn({ ...o, particleCount: Math.floor(200 * r), origin: { y: 0.8 } });
      shot(0.25, { spread: 26, startVelocity: 55 });
      shot(0.2, { spread: 60 });
      shot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      shot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      shot(0.1, { spread: 120, startVelocity: 45 });
    };
    const io = new IntersectionObserver(
        (ents) => {
          ents.forEach((e) => {
            if (e.isIntersecting && !document.hidden && !cooldownRef.current) {
              fire();
              cooldownRef.current = true;
              setTimeout(() => (cooldownRef.current = false), 3500);
            }
          });
        },
        { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (nodes.length === 0) return;

    if (reduceMotion) {
      nodes.forEach((node) => node.setAttribute("data-reveal", "in"));
      return;
    }

    const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            el.setAttribute("data-reveal", "in");
            io.unobserve(el);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);

  const injectFonts = () => {
    const style = document.createElement("style");
    style.textContent = `
    @font-face {
      font-family: 'InkLiquid';
      src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/InkLipquid.woff') format('woff');
      font-weight: normal;
      font-display: swap;
    }

    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    // Mulmaru 폰트 주입
    injectFonts();

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const setProgress = (v: number) => {
      const next = clamp(v, 0, 1);
      progressValueRef.current = next;
      setProgressValue(next);
    };

    const onWheel = (e: WheelEvent) => {
      if (!isProgressPinnedRef.current) return;

      const delta = e.deltaY;
      if (delta === 0) return;

      e.preventDefault();

      const speed = 1200;
      const next = clamp(progressValueRef.current + delta / speed, 0, 1);
      setProgress(next);

      if (next >= 1 && delta > 0) {
        unlockProgressScroll("down");
      }

      if (next <= 0 && delta < 0) {
        unlockProgressScroll("up");
      }
    };

    const lockProgressScroll = (targetScrollY?: number) => {
      if (isProgressPinnedRef.current) return;

      isProgressPinnedRef.current = true;
      setProgress(0);

      const nextLockedScrollY = typeof targetScrollY === "number" ? targetScrollY : window.scrollY;
      lockedScrollYRef.current = nextLockedScrollY;
      if (typeof targetScrollY === "number") {
        window.scrollTo({ top: nextLockedScrollY, behavior: "auto" });
      }
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockedScrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";

      window.addEventListener("wheel", onWheel, { passive: false });
    };

    const unlockProgressScroll = (direction: "down" | "up" = "down") => {
      if (!isProgressPinnedRef.current) return;

      isProgressPinnedRef.current = false;
      window.removeEventListener("wheel", onWheel as any);

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (direction === "down" && progressValueRef.current >= 1) {
        progressCompletedOnceRef.current = true;
      }

      isSnappingRef.current = true;
      pinCooldownUntilRef.current = Date.now() + 700;

      window.scrollTo({ top: lockedScrollYRef.current, behavior: "auto" });

      requestAnimationFrame(() => {
        isSnappingRef.current = false;
      });
    };

    const handleScroll = () => {
      // 배경 원들 페이드아웃 - 스크롤 위치에 따라
      const scrollY = window.scrollY;
      const fadeStart = 200; // 페이드 시작 스크롤 위치
      const fadeEnd = 600; // 페이드 완료 스크롤 위치
      const newOpacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      setCirclesOpacity(scrollY < fadeStart ? 1 : newOpacity);

      // SearchTitle2 스크롤 애니메이션 및 navbar/footer 토글
      const searchTitle2 = searchTitle2Ref.current;
      if (searchTitle2) {
        const rect = searchTitle2.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const triggerPoint = windowHeight * 0.65;
        setIsSearchTitle2Visible(rect.top < triggerPoint);

        const fillStart = windowHeight * 0.82;
        const fillEnd = windowHeight * 0.28;
        const rawProgress = (fillStart - rect.top) / (fillStart - fillEnd);
        const nextFillProgress = Math.max(0, Math.min(1, rawProgress));

        setSearchTitle2FillProgress(nextFillProgress);

        const shouldHide = rect.top < 0;
        setShouldHideNavbar(shouldHide);

        if (shouldHide) {
          window.dispatchEvent(new CustomEvent('hideNavbar', { detail: { hide: true } }));
        } else {
          window.dispatchEvent(new CustomEvent('hideNavbar', { detail: { hide: false } }));
        }
      }

      // Products Section 스크롤 애니메이션
      const productsSection = document.querySelector('[data-products-section]');
      if (productsSection) {
        const rect = productsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.75;
        setIsProductsVisible(rect.top < triggerPoint);
      }

      // 프로그레스 섹션(AI 모의 면접 피드백) 관련 처리
      const progressSection = progressSectionRef.current;
      let progressRect: DOMRect | null = null;

      if (progressSection) {
        progressRect = progressSection.getBoundingClientRect();
        // 프로그레스 섹션이 화면 하단 70% 위치에 도달하면 배경 글자 숨김
        setIsBackgroundVisible(progressRect.top > window.innerHeight * 0.7);
      }

      const serviceSectionTitle = document.querySelector('[data-service-title]');
      if (serviceSectionTitle) {
        const titleRect = serviceSectionTitle.getBoundingClientRect();
        // 서비스 타이틀이 화면 상단 100px 이내에 들어오면 배경 글자 숨김 (기존 로직 유지)
        if (titleRect.top <= 100) {
          setIsBackgroundVisible(false);
        }
      }

      // 카드 애니메이션 트리거 (반복 가능)
      const serviceGrid = document.querySelector('[data-service-grid]');
      if (serviceGrid) {
        const gridRect = serviceGrid.getBoundingClientRect();
        // 그리드가 화면에 보이면 카드 표시, 벗어나면 숨김
        if (gridRect.top < window.innerHeight * 0.7 && gridRect.bottom > window.innerHeight * 0.2) {
          setAreCardsVisible(true);
        } else {
          setAreCardsVisible(false);
        }
      }

      // 프로그레스 섹션 스크롤 락 로직
      if (
          progressSection &&
          progressRect &&
          !isProgressPinnedRef.current &&
          !isSnappingRef.current &&
          Date.now() > pinCooldownUntilRef.current
      ) {
        const vh = window.innerHeight;
        const NAV_HEIGHT = 0;

        if (progressCompletedOnceRef.current) {
          const isOutOfView = progressRect.bottom < 0 || progressRect.top > vh;
          if (isOutOfView) {
            progressCompletedOnceRef.current = false;
          }
        }

        const crossedTopLineDown = lastProgressTopRef.current > NAV_HEIGHT && progressRect.top <= NAV_HEIGHT;
        const topLineInRange = progressRect.bottom > NAV_HEIGHT;
        const scrollingDown = window.scrollY > lastScrollYRef.current;

        if (crossedTopLineDown && topLineInRange && scrollingDown && !progressCompletedOnceRef.current) {
          const targetScrollY = window.scrollY + (progressRect.top - NAV_HEIGHT);
          lockProgressScroll(targetScrollY);
        }

        lastProgressTopRef.current = progressRect.top;
      }

      lastScrollYRef.current = window.scrollY;

      // 기능 섹션 애니메이션 트리거 (더 일찍 시작)
      const featureRows = document.querySelectorAll('[data-feature-row]');

      setFeatureVisibility(prevVisibility => {
        const newVisibility = [...prevVisibility];
        featureRows.forEach((row, index) => {
          const rect = row.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            newVisibility[index] = true;
          } else {
            newVisibility[index] = false;
          }
        });
        return newVisibility;
      });
    };

    lastScrollYRef.current = window.scrollY;
    // 초기 체크
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unlockProgressScroll("down");
    };
  }, []);

  useEffect(() => {
    if (!storeModalType) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStoreModalType(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [storeModalType]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeStepIndex =
      progressValue < 0.25
          ? 0
          : progressValue < 0.5
              ? 1
              : progressValue < 0.75
                  ? 2
                  : 3;
  const activeStep = PROGRESS_STEPS[activeStepIndex] ?? PROGRESS_STEPS[0];

  const storeModalTitle =
      storeModalType === "google"
          ? "Google Play 다운로드"
          : storeModalType === "appstore"
              ? "App Store 다운로드"
              : "";

  const storeModalQr =
      storeModalType === "google"
          ? googlePlayQr
          : storeModalType === "appstore"
              ? appStoreQr
              : "";

  return (
      <>
        <GlobalFonts />
        <Page>
          <SoftBg />
          {/* <BackgroundTextContainer>
          <BackgroundText $isVisible={isBackgroundVisible}>
            <BackgroundImage src={backFont} alt="" />
            <BackgroundImage src={backFont} alt="" />
            <BackgroundImage src={backFont} alt="" />
            <BackgroundImage src={backFont} alt="" />
            <BackgroundImage src={backFont} alt="" />
            <BackgroundImage src={backFont} alt="" />
            <BackgroundImage src={backFont} alt="" />
            <BackgroundImage src={backFont} alt="" />
          </BackgroundText>
        </BackgroundTextContainer> */}
          <HeroSection>
            <HeroInner>

              {/* ── LEFT: 텍스트 + 버튼 ── */}
              <HeroContent>

                {/* i-POTEN (로고) × AI */}
                <HeroLogoLine>
                  <HeroLogoImg src={pageLogo} alt="i-POTEN" draggable={false} />
                  <HeroLogoX>×</HeroLogoX>
                  <HeroLogoAIText>AI</HeroLogoAIText>
                </HeroLogoLine>

                {/* 메인 슬로건 */}
                <HeroMainSlogan>당신의 잠재력을 깨우다</HeroMainSlogan>

                {/* 설명 */}
                <HeroDescText>
                  AI 기반 I-Poten 솔루션으로<br />
                  당신의 면접과 취업, 합격 이후의 성장까지<br />
                  필요한 모든 것을 연결합니다.
                </HeroDescText>

                {/* CTA 버튼 */}
                <HeroBtnRow>
                  <HeroBtn type="button" onClick={goToAiInterview}>
                    지금 시작하기
                  </HeroBtn>
                  <HeroBtn type="button" onClick={scrollToProducts}>
                    둘러보기
                  </HeroBtn>
                </HeroBtnRow>

              </HeroContent>

              {/* ── RIGHT: 3D 이미지 ── */}
              <HeroRightArea>
                {/* 상단 우측 추상 도형 */}
                <PageImgEl src={pageImg} alt="" draggable={false} />
                {/* 하단 3D AI 텍스트 */}
                {/*<PageAIEl src={pageAI} alt="AI" draggable={false} />*/}
              </HeroRightArea>

            </HeroInner>
          </HeroSection>

          <CloudTransitionWrap>
            <SearchTitle2
                ref={searchTitle2Ref}
                data-search-title2
                data-service-section
            >
              {renderSearchTitle2()}
            </SearchTitle2>

            {/* Products Section */}
            <ProductsSection
                ref={productsSectionRef}
                data-products-section
                $isVisible={isProductsVisible}
            >
              <ProductsGrid>
                {/* Word Card 1 */}
                <ProductCard $bgColor="#f8f9fa" $delay={0.1}>
                  <ProductTitle>단어학습</ProductTitle>
                  <ProductDesc>
                    면접에 자주 나오는 핵심 단어와<br />
                    실무 용어를 학습합니다
                  </ProductDesc>
                  <ProductImageWrap>
                    <img src={word01} alt="단어학습" draggable={false} />
                  </ProductImageWrap>
                </ProductCard>

                {/* Word Card 2 */}
                <ProductCard $bgColor="#f8f9fa" $delay={0.2}>
                  <ProductTitle>단어복습</ProductTitle>
                  <ProductDesc>
                    학습한 단어를 반복 학습하여<br />
                    완벽하게 내 것으로 만듭니다
                  </ProductDesc>
                  <ProductImageWrap>
                    <img src={note01} alt="단어복습" draggable={false} />
                  </ProductImageWrap>
                </ProductCard>

                {/* Interview Card */}
                <ProductCard
                    $featured
                    $bgColor="linear-gradient(135deg, #5b8ef7 0%, #56d3c2 100%)"
                    $delay={0.3}
                >
                  <ProductTitle $color="#0f172a" $featured>
                    AI 모의 면접
                  </ProductTitle>

                  <ProductDesc $color="rgba(15, 23, 42, 0.62)" $featured>
                    실전처럼 연습하는 AI 면접<br />
                    실시간 피드백으로 합격률 향상
                  </ProductDesc>

                  <ProductCircleImageWrap>
                    <img src={interviewB} alt="AI 모의 면접" draggable={false} />
                  </ProductCircleImageWrap>
                </ProductCard>
              </ProductsGrid>
            </ProductsSection>
          </CloudTransitionWrap>

          {/*<ServiceSection>*/}
          {/*<ServiceTitle data-service-title data-reveal style={revealStyle(0)}>*/}
          {/*  <Highlight>취업 준비</Highlight>, 어디까지 해보셨나요?*/}
          {/*</ServiceTitle>*/}
          {/*<ServiceSubtitle data-reveal style={revealStyle(120)}>*/}
          {/*  ↓ 잡스푼은 다양한 방향의 취업 준비 솔루션을 제공합니다*/}
          {/*</ServiceSubtitle>*/}

          {/*  <ServiceGrid data-service-grid>*/}
          {/*    {SERVICE_CARDS.map((card, index) => {*/}
          {/*      const rotations = [-12, -6, 0, 6, 12];*/}
          {/*      const zIndexes = [1, 2, 3, 2, 1];*/}
          {/*      const delays = ["0s", "0.06s", "0.12s", "0.18s", "0.24s"];*/}
          {/*      return (*/}
          {/*        <ServiceCard*/}
          {/*          key={card.title}*/}
          {/*          $rotation={rotations[index] ?? 0}*/}
          {/*          $zIndex={zIndexes[index] ?? 1}*/}
          {/*          $translateX={0}*/}
          {/*          $isVisible={areCardsVisible}*/}
          {/*          style={{ transitionDelay: delays[index] ?? "0s" }}*/}
          {/*        >*/}
          {/*          <CardLabel>{card.label}</CardLabel>*/}
          {/*          <CardTitle>{card.title}</CardTitle>*/}
          {/*          <CardIcon aria-hidden>{card.icon}</CardIcon>*/}
          {/*        </ServiceCard>*/}
          {/*      );*/}
          {/*    })}*/}
          {/*  </ServiceGrid>*/}
          {/*</ServiceSection>*/}

          <ProgressSection data-progress-section ref={progressSectionRef}>
            <ProgressKicker data-reveal style={revealStyle(0)}>I-POTEN FLOW</ProgressKicker>
            <ProgressTitle data-reveal style={revealStyle(100)}>
              면접의 모든 과정을
              <br />
              <ProgressTitleAccent>I-Poten</ProgressTitleAccent>과 함께
            </ProgressTitle>
            <ProgressDescription data-reveal style={revealStyle(220)}>
              면접 준비의 흐름을 따라
              각 단계를 순차적으로 확인해 보세요
            </ProgressDescription>
            <ProgressTopSlot />
            <ProgressBarWrap>
              <ProgressTrack>
                <ProgressFill $progress={progressValue} />
              </ProgressTrack>
              {PROGRESS_STEPS.map((step, idx) => (
                  <ProgressStepLabel
                      key={step.label}
                      $leftPct={step.leftPct}
                      $edge={step.edge}
                      $active={activeStepIndex === idx}
                  >
                    {step.label}
                  </ProgressStepLabel>
              ))}
              {PROGRESS_STEPS.map((step, idx) => (
                  <ProgressDot
                      key={`${step.label}-dot`}
                      $leftPct={step.leftPct}
                      $edge={step.edge}
                      $active={activeStepIndex === idx}
                  />
              ))}
            </ProgressBarWrap>
            <ProgressBottomSlot data-reveal style={revealStyle(420)}>
              <ProgressBottomDescription>{activeStep.description}</ProgressBottomDescription>
            </ProgressBottomSlot>
          </ProgressSection>

          <CoreValueSection>
            <CoreValueHeader data-reveal style={revealStyle(0)}>
              <CoreValueLabel>COREVALUE</CoreValueLabel>
              <CoreValueTitle>
                <CoreValueTitleLine>합격을 넘어,</CoreValueTitleLine>
                <CoreValueTitleLine>나만의 Identity를 완성하는</CoreValueTitleLine>
                <CoreValueTitleLine>
                  면접 준비의 <CoreValueTitleAccent>핵심</CoreValueTitleAccent>을 제공합니다.
                </CoreValueTitleLine>
              </CoreValueTitle>
            </CoreValueHeader>

            <CoreValueGrid>
              {/* Row 1 - Image Left, Content Right */}
              <CoreValueRow data-reveal style={revealStyle(100)}>
                <CoreValueImageCard>
                  <CoreValueImage src={coreValue01} alt="I-Poten 핵심 가치 1" $fit="cover" />
                </CoreValueImageCard>

                <CoreValueContent>
                  <CoreValueCardTitle>
                    <CoreValueCardTitleLine>정답을 외우는 면접은 끝났다</CoreValueCardTitleLine>
                    <CoreValueCardTitleLine>나만의 Identity로</CoreValueCardTitleLine>
                    <CoreValueCardTitleLine>증명하는 면접</CoreValueCardTitleLine>
                  </CoreValueCardTitle>
                  <CoreValueCardDesc>
                    AI가 단순히 정답을 알려주는 것이 아닌,<br />
                    당신만의 고유한 경험과 가치를 발견하고<br />
                    면접관에게 깊은 인상을 남기는<br />
                    진정한 자기소개를 완성하도록 돕습니다.
                  </CoreValueCardDesc>
                </CoreValueContent>
              </CoreValueRow>

              {/* Row 2 - Content Left, Image Right (Reversed) */}
              <CoreValueRow $reverse data-reveal style={revealStyle(200)}>
                <CoreValueImageCard>
                  <CoreValueImage src={coreValue02} alt="I-Poten 핵심 가치 2" $fit="cover" />
                </CoreValueImageCard>

                <CoreValueContent>
                  <CoreValueCardTitle>
                    <CoreValueCardTitleLine>왜 떨어졌는지</CoreValueCardTitleLine>
                    <CoreValueCardTitleLine>모르는 면접은 그만</CoreValueCardTitleLine>
                    <CoreValueCardTitleLine>연습을 넘어 면접을 주도하는</CoreValueCardTitleLine>
                  </CoreValueCardTitle>
                  <CoreValueCardDesc>
                    실시간 AI 피드백으로 당신의 답변을 분석하고,<br />
                    개선점을 명확히 제시합니다.<br />
                    단순 연습을 넘어 면접장에서 자신감 있게<br />
                    대화를 이끌어가는 능력을 키웁니다.
                  </CoreValueCardDesc>
                </CoreValueContent>
              </CoreValueRow>

              {/* Row 3 - Image Left, Content Right */}
              <CoreValueRow data-reveal style={revealStyle(300)}>
                <CoreValueImageCard>
                  <CoreValueImage src={coreValue03} alt="I-Poten 핵심 가치 3" $fit="cover" />
                </CoreValueImageCard>

                <CoreValueContent>
                  <CoreValueCardTitle>
                    <CoreValueCardTitleLine>합격하기 위한 면접을 넘어</CoreValueCardTitleLine>
                    <CoreValueCardTitleLine>합격할 수밖에 없는</CoreValueCardTitleLine>
                    <CoreValueCardTitleLine>나를 만들어갑니다</CoreValueCardTitleLine>
                  </CoreValueCardTitle>
                  <CoreValueCardDesc>
                    일회성 합격이 아닌, 지속 가능한 성장을 추구합니다.<br />
                    면접 준비 과정에서 쌓인 모든 경험이<br />
                    당신의 커리어 전반에 걸쳐<br />
                    강력한 무기가 되도록 돕습니다.
                  </CoreValueCardDesc>
                </CoreValueContent>
              </CoreValueRow>
            </CoreValueGrid>
          </CoreValueSection>

          {/* GROWTH 섹션 */}
          <GrowthSection>
            <GrowthHeader data-reveal style={revealStyle(0)}>
              <GrowthLabel>GROWTH</GrowthLabel>
              <GrowthTitle>
                <GrowthTitleLine>면접의 경험과 준비는</GrowthTitleLine>
                <GrowthTitleLine>함께 발전하며,</GrowthTitleLine>
                <GrowthTitleLine>
                  <GrowthTitleAccent>내가 걸어온 길</GrowthTitleAccent>의 증명입니다
                </GrowthTitleLine>
              </GrowthTitle>
            </GrowthHeader>

            <GrowthTimeline>
              <GrowthCard $offset={120} data-reveal style={revealStyle(100)}>
                <GrowthCardYear>신입</GrowthCardYear>
                <GrowthCardTitle>
                  가능성을 증명하는
                  <br />
                  첫 면접
                </GrowthCardTitle>
                <GrowthCardDesc>
                  배움의 과정과 성장 의지를 바탕으로
                  <br />
                  앞으로의 가능성을 설득력 있게 보여줍니다.
                </GrowthCardDesc>
              </GrowthCard>

              <GrowthCard $offset={60} data-reveal style={revealStyle(200)}>
                <GrowthCardYear>주니어</GrowthCardYear>
                <GrowthCardTitle>
                  경험으로 실력을 말하는
                  <br />
                  성장의 면접
                </GrowthCardTitle>
                <GrowthCardDesc>
                  실무 경험과 프로젝트 성과를 통해
                  <br />
                  문제 해결 능력과 실행력을 보여줍니다.
                </GrowthCardDesc>
              </GrowthCard>

              <GrowthCard $offset={0} data-reveal style={revealStyle(300)}>
                <GrowthCardYear>시니어</GrowthCardYear>
                <GrowthCardTitle>
                  가치와 영향력을 증명하는
                  <br />
                  완성의 면접
                </GrowthCardTitle>
                <GrowthCardDesc>
                  조직에 기여한 성과와 리더십을 바탕으로
                  <br />
                  더 큰 책임과 역할을 증명합니다.
                </GrowthCardDesc>
              </GrowthCard>
            </GrowthTimeline>
          </GrowthSection>

          <LightShowcaseBand>
            {/* 섹션 1: 포텐워드 */}
            <ShowcaseSection>
              <ShowcaseGrid>
                <ShowcaseVisual>
                  <div data-reveal style={revealStyle(0)}>
                    <ShowcaseFrameStack>
                      <ShowcaseBaseFrame>
                        <ShowcaseImage
                            src={word02}
                            alt="포텐워드 상세 화면"
                            draggable={false}
                        />
                      </ShowcaseBaseFrame>

                      <ShowcaseOverlayFrame
                          data-reveal
                          data-reveal-variant="fade"
                          style={revealStyle(180)}
                      >
                        <ShowcaseImage
                            src={word01}
                            alt="포텐워드 메인 화면"
                            draggable={false}
                        />
                      </ShowcaseOverlayFrame>
                    </ShowcaseFrameStack>
                  </div>
                </ShowcaseVisual>

                <ShowcaseContent $shiftX={-100} data-reveal style={revealStyle(100)}>
                  <ShowcaseTitle>
                    <ShowcaseTitleLine>필요한 용어만</ShowcaseTitleLine>
                    <ShowcaseTitleLine>빠르게 찾으세요</ShowcaseTitleLine>
                  </ShowcaseTitle>
                  <ShowcaseSubTitle>면접 준비의 시작, 포텐워드로 더 쉽게</ShowcaseSubTitle>
                  <ShowcaseDescription>
                    분야별로 꼭 필요한 IT 용어를 모아 4만 개 이상의 포텐워드를 한곳에서 검색하고, 상세한 설명과 연관 키워드로 더 넓고 깊게 학습할 수 있습니다.
                  </ShowcaseDescription>
                </ShowcaseContent>
              </ShowcaseGrid>
            </ShowcaseSection>

            {/* 섹션 2: 포텐노트 */}
            <ShowcaseSection>
              <ShowcaseGrid>
                <ShowcaseVisual>
                  <div data-reveal style={revealStyle(0)}>
                    <ShowcaseFrameStack>
                      <ShowcaseBaseFrame>
                        <ShowcaseImage
                            src={note02}
                            alt="포텐노트 반복 학습 화면"
                            draggable={false}
                        />
                      </ShowcaseBaseFrame>

                      <ShowcaseOverlayFrame
                          data-reveal
                          data-reveal-variant="fade"
                          style={revealStyle(180)}
                      >
                        <ShowcaseImage
                            src={note01}
                            alt="포텐노트 메인 화면"
                            draggable={false}
                        />
                      </ShowcaseOverlayFrame>
                    </ShowcaseFrameStack>
                  </div>
                </ShowcaseVisual>

                <ShowcaseContent $shiftX={-100} data-reveal style={revealStyle(100)}>
                  <ShowcaseTitle>
                    <ShowcaseTitleLine>나만의 학습을</ShowcaseTitleLine>
                    <ShowcaseTitleLine>완성하세요</ShowcaseTitleLine>
                  </ShowcaseTitle>
                  <ShowcaseSubTitle>모아두고, 가려보며, 반복해서 익히세요</ShowcaseSubTitle>
                  <ShowcaseDescription>
                    포텐노트에 학습하고 싶은 용어만 따로 모아 나만의 학습 목록으로 관리하고, 용어와 뜻을 가려가며 반복 학습과 진행 상황까지 한눈에 확인할 수 있습니다.
                  </ShowcaseDescription>
                </ShowcaseContent>
              </ShowcaseGrid>
            </ShowcaseSection>

            {/* 섹션 3: 포텐퀴즈 */}
            <ShowcaseSection>
              <ShowcaseGrid>
                <ShowcaseVisual>
                  <div data-reveal style={revealStyle(0)}>
                    <ShowcaseFrameStack>
                      <ShowcaseBaseFrame>
                        <ShowcaseImage
                            src={quiz02}
                            alt="포텐퀴즈 타임라인 화면"
                            draggable={false}
                        />
                      </ShowcaseBaseFrame>

                      <ShowcaseOverlayFrame
                          data-reveal
                          data-reveal-variant="fade"
                          style={revealStyle(180)}
                      >
                        <ShowcaseImage
                            src={quiz01}
                            alt="포텐퀴즈 메인 화면"
                            draggable={false}
                        />
                      </ShowcaseOverlayFrame>
                    </ShowcaseFrameStack>
                  </div>
                </ShowcaseVisual>

                <ShowcaseContent $shiftX={-100} data-reveal style={revealStyle(100)}>
                  <ShowcaseTitle>
                    <ShowcaseTitleLine>꾸준하게 확인하며</ShowcaseTitleLine>
                    <ShowcaseTitleLine>실력을 쌓으세요</ShowcaseTitleLine>
                  </ShowcaseTitle>
                  <ShowcaseSubTitle>퀴즈로 점검하고, 기록으로 성장하세요</ShowcaseSubTitle>
                  <ShowcaseDescription>
                    오늘의 퀴즈와 직무별 퀴즈로 원하는 분야와 난이도에 맞춰 학습하고, 퀴즈 타임라인으로 학습 기록과 성과를 한눈에 확인할 수 있습니다. 틀린 문제는 오답노트에 모아 복습이 필요한 문제만 다시 학습해 보세요.
                  </ShowcaseDescription>
                </ShowcaseContent>
              </ShowcaseGrid>
            </ShowcaseSection>

            {/* COREVALUE 섹션 */}


            <ScheduleShowcaseSection>
              <ScheduleShowcaseTitle data-reveal style={revealStyle(0)}>
                <ScheduleShowcaseTitleMuted>면접 결과 한눈에</ScheduleShowcaseTitleMuted>
                <ScheduleShowcaseTitleStrong>확인하고 발전하세요.</ScheduleShowcaseTitleStrong>
              </ScheduleShowcaseTitle>



              <ScheduleCardsGrid>

                <ScheduleDarkCard data-reveal style={revealStyle(180)}>
                  <ScheduleDarkContent>
                    <ScheduleDarkTitle>
                      종합적 지표를 통해
                      <br />
                      나의 면접 역량을 파악하세요.
                    </ScheduleDarkTitle>
                    <ScheduleDarkDescription>
                      다양한 세부 점수와 종합 점수를 제공하여
                      <br />
                      현재 나의 상태와 성장 방향을 한눈에 확인할 수 있습니다.
                    </ScheduleDarkDescription>
                  </ScheduleDarkContent>

                  <ScheduleListFrame>
                    <ScheduleListInner>
                      <ScheduleMedia src={interview1} alt="" $fit="cover" />
                    </ScheduleListInner>
                  </ScheduleListFrame>
                </ScheduleDarkCard>

                <ScheduleLightCard data-reveal style={revealStyle(260)}>
                  <ScheduleLightCaption>
                    <ScheduleLightCaptionMuted>
                      질문
                      <br />
                      하나하나
                      <br />
                      확인하고
                    </ScheduleLightCaptionMuted>
                    <ScheduleLightCaptionStrong>피드백을!</ScheduleLightCaptionStrong>
                  </ScheduleLightCaption>

                  <SchedulePhoneFrame>
                    <ScheduleMedia src={interview2} alt="" $fit="contain" />
                  </SchedulePhoneFrame>
                </ScheduleLightCard>



                <ScheduleLightCard data-reveal style={revealStyle(340)}>
                  <ScheduleLightCaption>
                    <ScheduleLightCaptionMuted>
                      한 번에
                      <br />
                      전반적인
                      <br />
                      나의 면접
                    </ScheduleLightCaptionMuted>
                    <ScheduleLightCaptionStrong>피드백!</ScheduleLightCaptionStrong>
                  </ScheduleLightCaption>

                  <SchedulePhoneFrame>
                    <ScheduleMedia src={interview3} alt="" $fit="contain" />
                  </SchedulePhoneFrame>
                </ScheduleLightCard>

                <ScheduleDarkCard data-reveal style={revealStyle(420)}>
                  <ScheduleDarkContent>
                    <ScheduleDarkTitle>
                      PDF 및 마이페이지에서
                      <br />
                      면접 기록을 오래도록 보관하세요
                    </ScheduleDarkTitle>
                    <ScheduleDarkDescription>
                      PDF로 내보내거나
                      <br />
                      마이페이지에서 나의 면접 기록을 언제든 다시 확인할 수 있습니다.
                    </ScheduleDarkDescription>
                  </ScheduleDarkContent>

                  <ScheduleListFrame>
                    <ScheduleListInner>
                      <ScheduleMedia src={interview4} alt="" $fit="cover" />
                    </ScheduleListInner>
                  </ScheduleListFrame>
                </ScheduleDarkCard>

              </ScheduleCardsGrid>
            </ScheduleShowcaseSection>

            <InsightsSection>
              <InsightsTitle data-reveal style={revealStyle(0)}>
                <InsightsTitleMuted>실제 면접 데이터를 통해</InsightsTitleMuted>
                <InsightsTitleStrong>더욱 엄선된 면접을 제공합니다.</InsightsTitleStrong>
              </InsightsTitle>

              <InsightsPanel>
                <InsightsPanelInner>
                  <InsightsLeft data-reveal style={revealStyle(140)}>
                    <InsightsLeftTitle>
                      실제
                      <br />
                      <Highlight2>4,000여 개</Highlight2>의
                      <br />
                      면접 데이터로
                      <br />
                      <InsightsLeftStrong>보다 정확하게, 확실하게 </InsightsLeftStrong>
                    </InsightsLeftTitle>
                    <InsightsBody>
                      실제 면접 같은 다양한 면접을 통해
                      <br />
                      면접 준비 시간을 줄여보세요.
                    </InsightsBody>
                  </InsightsLeft>

                  <InsightsRight data-reveal style={revealStyle(220)}>
                    <InsightsQuestionStack>
                      <InsightsQuestionTrack>
                        {INSIGHTS_TICKER_ITEMS.map((t) => (
                            <InsightsQuestionPill key={`a-${t}`}>{t}</InsightsQuestionPill>
                        ))}
                        {INSIGHTS_TICKER_ITEMS.map((t) => (
                            <InsightsQuestionPill key={`b-${t}`}>{t}</InsightsQuestionPill>
                        ))}
                      </InsightsQuestionTrack>
                    </InsightsQuestionStack>

                    {/*<InsightsTickerBox>*/}
                    {/*  <InsightsTickerTrack>*/}
                    {/*    {INSIGHTS_TICKER_ITEMS.map((t, idx) => (*/}
                    {/*      <InsightsTickerRow key={`a-${idx}`}>{t}</InsightsTickerRow>*/}
                    {/*    ))}*/}
                    {/*    {INSIGHTS_TICKER_ITEMS.map((t, idx) => (*/}
                    {/*      <InsightsTickerRow key={`b-${idx}`}>{t}</InsightsTickerRow>*/}
                    {/*    ))}*/}
                    {/*  </InsightsTickerTrack>*/}
                    {/*  <InsightsTickerMask />*/}
                    {/*</InsightsTickerBox>*/}

                    <InsightsDashboardFrame>
                      <InsightsDashboardInner>
                        <InsightsBackgroundVideo
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                        >
                          <source src={interviewVideo} type="video/mp4" />
                        </InsightsBackgroundVideo>
                      </InsightsDashboardInner>
                    </InsightsDashboardFrame>
                  </InsightsRight>
                </InsightsPanelInner>
              </InsightsPanel>
            </InsightsSection>
          </LightShowcaseBand>

          <WhiteBackground>
            {/*<PracticeSection>*/}
            {/*  <PracticeIcon data-reveal style={revealStyle(0)}>*/}
            {/*    <img style={{ width: "110px", height: "auto" }} src={image} />*/}
            {/*  </PracticeIcon>*/}

            {/*  <PracticeTitle data-reveal style={revealStyle(120)}>*/}
            {/*    면접은 한 번의 준비보다*/}
            {/*    <br />*/}
            {/*    <PracticeHighlight>반복된 연습</PracticeHighlight>이 더 중요합니다*/}
            {/*  </PracticeTitle>*/}

            {/*  <PracticeDescription data-reveal style={revealStyle(240)}>*/}
            {/*    실전 같은 연습과 꾸준한 준비를 통해*/}
            {/*    <br />*/}
            {/*    더 자신 있는 답변과 더 단단한 면접 역량을 만들어 보세요.*/}
            {/*  </PracticeDescription>*/}
            {/*</PracticeSection>*/}

            <FaqSection>
              <FaqTitle data-reveal style={revealStyle(0)}>자주 묻는 질문</FaqTitle>
              <FaqList data-reveal data-reveal-variant="fade" style={revealStyle(140)}>
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                      <FaqItem key={item.q} $open={isOpen}>
                        <FaqButtonRow
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        >
                          <FaqQuestion>{item.q}</FaqQuestion>
                          <FaqToggle $open={isOpen}>+</FaqToggle>
                        </FaqButtonRow>

                        <FaqAnswerWrap $open={isOpen} aria-hidden={!isOpen}>
                          <FaqAnswerInner>
                            <FaqAnswer $open={isOpen}>{item.a}</FaqAnswer>
                          </FaqAnswerInner>
                        </FaqAnswerWrap>
                      </FaqItem>
                  );
                })}
              </FaqList>
            </FaqSection>

            <Companies data-reveal style={revealStyle(320)}>
              <CompaniesEyebrow>Supported Companies</CompaniesEyebrow>

              <CompaniesTitle>
                현재 I-Poten이 지원하는 기업
              </CompaniesTitle>

              <CompaniesDesc>
                다양한 기업 면접 흐름과 준비 방향을 반영해
                <br />
                더 실전감 있게 면접을 준비할 수 있습니다.
              </CompaniesDesc>

              <LogoSlider>
                <LogoTrack>
                  <LogoGroup>
                    {COMPANY_LOGOS.map((logo, i) => (
                        <LogoItemWrap key={`group1-${i}`} $width={logo.boxWidth}>
                          <LogoImage
                              src={logo.src}
                              alt={logo.alt}
                              draggable={false}
                          />
                        </LogoItemWrap>
                    ))}
                  </LogoGroup>

                  <LogoGroup aria-hidden="true">
                    {COMPANY_LOGOS.map((logo, i) => (
                        <LogoItemWrap key={`group2-${i}`} $width={logo.boxWidth}>
                          <LogoImage
                              src={logo.src}
                              alt={logo.alt}
                              draggable={false}
                          />
                        </LogoItemWrap>
                    ))}
                  </LogoGroup>
                </LogoTrack>
              </LogoSlider>
            </Companies>

            {/*<HomeFiveSection>*/}
            {/*  <Hero>*/}
            {/*    <TitleBox data-reveal data-reveal-variant="fade" style={revealStyle(120)}>*/}
            {/*      I-POTEN*/}
            {/*    </TitleBox>*/}

            {/*    <h2>*/}
            {/*      면접 준비의 흐름을*/}
            {/*      <br />*/}
            {/*      더 자연스럽게 연결합니다*/}
            {/*    </h2>*/}

            {/*    <p>*/}
            {/*      학습, 연습, 피드백의 과정을 하나로 연결해*/}
            {/*      <br />*/}
            {/*      더 체계적이고 실전감 있는 면접 준비를 경험해 보세요.*/}
            {/*    </p>*/}
            {/*  </Hero>*/}

            {/*  <Features data-reveal style={revealStyle(220)}>*/}
            {/*    <h2>한 번의 연습이 아닌, 이어지는 준비</h2>*/}
            {/*    <p>*/}
            {/*      핵심 개념 학습부터 AI 모의면접과 리포트까지*/}
            {/*      <br />*/}
            {/*      I-Poten은 면접 준비 전 과정을 끊김 없이 이어줍니다.*/}
            {/*    </p>*/}
            {/*  </Features>*/}
            {/*</HomeFiveSection>*/}

            <MobilePromoSection>
              <MobilePromoHead data-reveal style={revealStyle(0)}>
                <MobilePromoEyebrow>Mobile App</MobilePromoEyebrow>
                <MobilePromoTitle>모바일에서도 I-Poten을 만나보세요</MobilePromoTitle>
                <MobilePromoDesc>
                  학습부터 퀴즈, AI 모의면접까지
                  <br />
                  언제 어디서나 I-Poten을 끊김 없이 이어갈 수 있습니다.
                </MobilePromoDesc>
              </MobilePromoHead>

              <MobilePromoBanner data-reveal data-reveal-variant="fade" style={revealStyle(120)}>
                <MobilePromoContent>
                  <MobilePromoLogo
                      src={pageLogo}
                      alt="i-POTEN"
                      draggable={false}
                  />

                  <MobilePromoInsideTitle>
                    App으로 더 편하게
                  </MobilePromoInsideTitle>

                  <MobilePromoInsideDesc>
                    이동 중에도, 짧은 틈에도
                    <br />
                    I-Poten으로 면접 준비를 이어가 보세요.
                  </MobilePromoInsideDesc>

                  <MobileStoreRow>
                    <MobileStoreActionButton
                        type="button"
                        aria-label="Google Play 다운로드"
                        onClick={() => setStoreModalType("google")}
                    >
                      <MobileStoreButtonImg
                          src={googlePlayBtn}
                          alt="Google Play에서 다운로드"
                          draggable={false}
                      />
                    </MobileStoreActionButton>

                    <MobileStoreActionButton
                        type="button"
                        aria-label="App Store 다운로드"
                        onClick={() => setStoreModalType("appstore")}
                    >
                      <MobileStoreButtonImg
                          src={appStoreBtn}
                          alt="App Store에서 다운로드"
                          draggable={false}
                      />
                    </MobileStoreActionButton>
                  </MobileStoreRow>
                </MobilePromoContent>

                <MobilePromoImage
                    src={mobileBanner}
                    alt="i-Poten 애플리케이션 출시 배너"
                    draggable={false}
                    loading="lazy"
                />
              </MobilePromoBanner>
            </MobilePromoSection>
          </WhiteBackground>


          <ScrollTopButton onClick={scrollToTop} aria-label="맨 위로">
            ↑
          </ScrollTopButton>

          <Review
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              onSubmit={async (rating, comment) => {
                console.log('리뷰 제출:', { rating, comment });
                alert(`리뷰가 제출되었습니다!\n평점: ${rating}점\n내용: ${comment}`);
              }}
          />
          <OpenEvent
              isOpen={isOpenEventModalOpen}
              onClose={() => setIsOpenEventModalOpen(false)}
          />
          {storeModalType && (
              <StoreQrModalOverlay onClick={() => setStoreModalType(null)}>
                <StoreQrModalCard onClick={(e) => e.stopPropagation()}>
                  <StoreQrCloseButton
                      type="button"
                      aria-label="QR 모달 닫기"
                      onClick={() => setStoreModalType(null)}
                  >
                    ×
                  </StoreQrCloseButton>

                  <StoreQrTitle>{storeModalTitle}</StoreQrTitle>
                  <StoreQrDesc>
                    스마트폰 카메라로 QR을 스캔해
                    <br />
                    I-Poten 앱 다운로드 페이지로 이동하세요.
                  </StoreQrDesc>

                  <StoreQrImageWrap>
                    <StoreQrImage
                        src={storeModalQr}
                        alt={`${storeModalTitle} QR 코드`}
                        draggable={false}
                    />
                  </StoreQrImageWrap>

                  <StoreQrCaption>
                    버튼을 누르거나 바깥 영역을 클릭하면 닫을 수 있습니다.
                  </StoreQrCaption>
                </StoreQrModalCard>
              </StoreQrModalOverlay>
          )}
        </Page>
      </>
  );
}
