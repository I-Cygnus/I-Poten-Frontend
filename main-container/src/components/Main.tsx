// src/components/Main.tsx
import React, { useEffect, useState, useRef, useId } from "react";
import styled, { keyframes } from "styled-components";
import image from "../assets/nugule.png";
import confetti from "canvas-confetti";
import word1 from "../assets/word3.png";
import word2 from "../assets/word4.png";
import interview1 from "../assets/interview1.png";
import interview2 from "../assets/interview2.png";
import interview3 from "../assets/interview3.png";
import interview4 from "../assets/interview4.png";
import interview5 from "../assets/interview5.png";

/* ====== 로고 이미지 ====== */
import logoDanggeun from "../assets/d1.png";
import logoToss from "../assets/t2.png";
import logoEncore from "../assets/e1.png";
import logoKT from "../assets/3.png";

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

/* ========== 공통 레이아웃 ========== */
const Page = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 0px;
  background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 40%, #e0f2fe 100%);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 40px 16px 0px;
  }
  
  :root[data-theme="dark"] & {
    background: linear-gradient(180deg, #1e293b 0%, #0f1f3a 40%, #0c2340 100%);
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
  max-width: 1100px;
  width: 100%;
  max-height: 1900px;
  height: 100%;
  margin: 10px auto 0;
  padding: 96px 20px 140px;
  text-align: center;
  position: relative;
  z-index: 1;

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
    padding: 72px 16px 110px;
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
  max-width: 980px;
  width: 100%;
  margin: clamp(80px, 12vw, 180px) auto;
  padding: 40px 20px 80px;

  @media (max-width: 768px) {
    padding: 30px 16px 70px;
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
  border-top: 1px solid rgba(148, 163, 184, 0.35);
`;

const FaqItem = styled.div`
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
`;

const FaqButtonRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 10px;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.28);
    outline-offset: 4px;
    border-radius: 10px;
  }

  @media (max-width: 640px) {
    padding: 22px 6px;
  }
`;

const FaqQuestion = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.86);
  letter-spacing: -0.01em;
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.9);
  }
`;

const FaqToggle = styled.div`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 400;
  color: rgba(15, 23, 42, 0.65);
  flex: 0 0 auto;

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.75);
  }
`;

const FaqAnswer = styled.div`
  padding: 0 10px 26px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.62);

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.72);
  }
`;

const ShowcaseSection = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 50px auto;
  padding: 0px 20px 120px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 80px 16px 90px;
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
    min-height: 460px;
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
  left: 56px;
  bottom: 56px;
  z-index: 2;
  font-size: 26px;
  line-height: 1.35;
  letter-spacing: -0.03em;
  font-weight: 900;

  @media (max-width: 640px) {
    left: 28px;
    bottom: 28px;
    font-size: 22px;
  }
`;

const ScheduleLightCaptionMuted = styled.div`
  color: rgba(15, 23, 42, 0.32);

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.5);
  }
`;

const ScheduleLightCaptionStrong = styled.div`
  color: rgba(15, 23, 42, 0.92);
  margin-top: 6px;

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
    right: -80px;
    bottom: -40px;
    width: 520px;
    height: 520px;
  }
`;

const ScheduleMedia = styled.img<{ $fit?: "cover" | "contain" }>`
  width: 100%;
  height: 100%;
  display: block;
  object-fit:  "contain";
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
  left: 56px;
  right: 56px;
  z-index: 2;

  @media (max-width: 640px) {
    top: 32px;
    left: 32px;
    right: 32px;
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
`;

const ScheduleListInner = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 7;
`;

const InsightsSection = styled.section`
  max-width: 1100px;
  width: 100%;
  margin: clamp(60px, 10vw, 120px) auto;
  padding: 120px 20px 60px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 90px 16px 50px;
  }
`;

const InsightsTitle = styled.h2`
  margin: 0 0 42px;
  font-size: clamp(34px, 4.8vw, 40px);
  letter-spacing: -0.04em;
  line-height: 1.1;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.35);
  //color: rgba(15, 23, 42, 0.92);
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: rgba(248, 250, 252, 0.95);
  }
`;

const InsightsTitle2 = styled.h2`
  margin: 0 0 42px;
  font-size: clamp(34px, 4.8vw, 40px);
  letter-spacing: -0.04em;
  line-height: 1.1;
  font-weight: 900;
  //color: rgba(15, 23, 42, 0.35);
  color: rgba(15, 23, 42, 0.92);
  word-break: keep-all;

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
  align-items: center;

  @media (max-width: 1024px) {
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
  min-height: 420px;

  @media (max-width: 1024px) {
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

  @media (max-width: 640px) {
    height: 280px;
  }

  @media (max-width: 1024px) {
    position: relative;
    bottom: auto;
    right: auto;
    width: 100%;
    height: clamp(220px, 34vh, 320px);
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
  top: 44%;
  width: min(100%, 1000px);
  height: min(92%, 300px);
  border-radius: 24px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  z-index: 1;

  @media (max-width: 1024px) {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    height: auto;
    margin-top: 22px;
  }
`;

const InsightsDashboardInner = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 7;
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

const ShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: 1.55fr 0.95fr;
  gap: 64px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 44px;
  }
`;

const ShowcaseVisual = styled.div`
  position: relative;
  width: 100vw;
  height: auto;
  min-height: clamp(420px, 62vh, 780px);
  margin-left: calc(50% - 50vw);
  //overflow: hidden;

  @media (max-width: 1024px) {
    width: 100%;
    margin-left: 0;
    min-height: clamp(360px, 52vh, 560px);
    overflow: visible;
  }
`;

const ShowcaseBaseFrame = styled.div`
  margin-top: 10%;
  width: min(860px, 100%);
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  background: #E6EAED;
  //border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
  transform: translateX(-70px);

  :root[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.7);
    border-color: rgba(148, 163, 184, 0.18);
    box-shadow: 0 34px 110px rgba(2, 6, 23, 0.65);
  }

  @media (max-width: 1024px) {
    margin-top: 0;
    width: 100%;
    transform: translateX(0);
  }
`;

const ShowcaseOverlayFrame = styled.div`
  position: absolute;
  right: 25%;
  bottom: 40%;
  width: 35%;
  height: 45%;
  aspect-ratio: 3 / 4;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 34px 120px rgba(15, 23, 42, 0.18);

  @media (max-width: 640px) {
    right: 6%;
    top: 12%;
    width: 46%;
  }

  @media (max-width: 1024px) {
    right: 6%;
    bottom: 10%;
    width: min(360px, 56%);
    height: auto;
  }

  :root[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.75);
    border-color: rgba(148, 163, 184, 0.18);
    box-shadow: 0 42px 140px rgba(2, 6, 23, 0.75);
  }
`;

const ShowcaseImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
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

const ShowcaseContent = styled.div`
  width: 100%;
`;

const ShowcaseTitle = styled.h2`
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin: 0 0 18px;
  word-break: keep-all;
  color: ${BRAND.blue};

  :root[data-theme="dark"] & {
    color: #f8fafc;
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
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;

  :root[data-theme="dark"] & {
    color: #e2e8f0;
  }
`;

const ShowcaseDescription = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.75;
  color: #64748b;
  word-break: keep-all;

  :root[data-theme="dark"] & {
    color: #cbd5e1;
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
`;

const ProgressBottomSlot = styled.div`
  min-height: 36px;
  margin-top: 28px;
`;

const ProgressBottomDescription = styled.p`
  margin-top: 100px;
  font-size: 30px;
  line-height: 1.65;
  color: #64748b;
  word-break: keep-all;

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
  { label: "STEP 01", description: "면접을 준비하기 위한 공부 환경을 제공합니다.", leftPct: 0, edge: "left" },
  { label: "STEP 02", description: "면접 준비를 위한 공부를 확인 검증하는 퀴즈를 제공합니다.", leftPct: 33.333 },
  { label: "STEP 03", description: "면접을 준비할 수 있도록 AI 모의면접을 진행합니다.", leftPct: 66.666 },
  { label: "STEP 04", description: "AI 모의 면접 피드백으로 나의 면접 Develop!", leftPct: 100, edge: "right" },
];

const SHOWCASE_IMAGES = {
  baseSrc: "",
  overlaySrc: "",
} as const;

const SCHEDULE_SHOWCASE_IMAGES = {
  leftPhoneSrc: "",
  rightListSrc: "",
  wideSrc: "",
} as const;

const INSIGHTS_SHOWCASE_IMAGES = {
  backgroundSrc: "",
  dashboardSrc: "",
} as const;

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

const BackgroundTextContainer = styled.div`
  position: fixed;
  top: 78%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const BackgroundText = styled.div<{ $isVisible: boolean }>`
  display: flex;
  white-space: nowrap;
  font-size: clamp(70px, 10vw, 120px);
  font-weight: 900;
  color: rgba(200, 230, 255, 0.35);
  letter-spacing: 0.1em;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease;
  animation: scrollLeft 30s linear infinite;
  
  @media (max-width: 640px) {
    font-size: 60px;
    opacity: ${props => props.$isVisible ? 0.5 : 0};
  }
  
  :root[data-theme="dark"] & {
    color: rgba(30, 60, 100, 0.4);
  }

  @keyframes scrollLeft {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;

/* ====== 히어로 섹션 ====== */
const HeroSection = styled.section`
  max-width: 900px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
  margin-top: 35px;
  margin-bottom: 100px;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin-top: 20px;
    margin-bottom: 60px;
    padding: 0 16px;
  }
`;

const MainTitle = styled.h1`
  font-size: clamp(36px, 7vw, 50px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.25;
  margin-bottom: 28px;
  word-break: keep-all;
  color: #0f172a;
  
  @media (max-width: 640px) {
    font-size: clamp(28px, 8vw, 36px);
    line-height: 1.3;
    margin-bottom: 20px;
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  :root[data-theme="dark"] & {
    color: #f8fafc;
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
  gap: 8px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.greenDeep} 100%);
  //background-color: #21A3AE ;
  border: none;
  border-radius: 8px;
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
  bottom: 100px;
  background: white;
  color: ${BRAND.blue};
  border: 2px solid #e2e8f0;
  font-size: 20px;

  &:hover {
    background: ${BRAND.surfaceAlt};
    border-color: #cbd5e1;
  }

  @media (max-width: 768px) {
    bottom: 88px;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  }
`;

/* ====== 서비스 카드 섹션 ====== */
const ServiceSection = styled.section`
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
  margin-top: 300px;
  padding: 0 20px 300px;
  
  @media (max-width: 768px) {
    margin-top: 150px;
    padding: 0 20px 150px;
  }
  
  @media (max-width: 640px) {
    padding: 0 16px 120px;
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
    title: "강의실",
    icon: "✏️",
  },
  {
    label: "Treatment Room",
    title: "진료실",
    icon: "💉",
  },
  {
    label: "Conference Room",
    title: "회의실",
    icon: "💬",
  },
  {
    label: "Waiting Room",
    title: "대기실",
    icon: "🛋️",
  },
  {
    label: "Consultation Room",
    title: "상담실",
    icon: "�",
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
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 170px 20px 10px;
  text-align: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 80px 16px 10px;
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
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const HomeFiveSection = styled.section`
  max-width: 900px;
  margin: 320px auto 180px;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin: 150px auto 100px;
    padding: 0 16px;
  }
`;

const TitleBox = styled.div`
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  letter-spacing: 1px;
  display: inline-block;
  position: relative;
  background: linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.greenDeep} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  text-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.25),
      0px 8px 20px rgba(16, 185, 129, 0.3),
      0px 8px 20px rgba(59, 130, 246, 0.3);
  transform: perspective(500px) rotateX(10deg);
  transition: all 0.4s ease-in-out;
  margin-bottom: 50px;

  &:hover {
    transform: perspective(500px) rotateX(0deg) scale(1.05);
    text-shadow:
        0px 6px 12px rgba(0, 0, 0, 0.3),
        0px 12px 30px rgba(16, 185, 129, 0.4),
        0px 12px 30px rgba(59, 130, 246, 0.4);
  }
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
    transform: perspective(500px) rotateX(5deg);
  }
`;

const Hero = styled.div`
  margin-bottom: 40px;
  h2 {
    font-size: clamp(24px, 4vw, 32px);
    font-weight: 700;
    margin-bottom: 12px;
    color: #0f172a;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
  p {
    font-size: clamp(16px, 2.5vw, 18px);
    line-height: 1.6;
    color: #475569;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #cbd5e1;
    }
  }
`;

const Features = styled.div`
  margin-top: 60px;
  h2 {
    font-size: clamp(20px, 3vw, 24px);
    font-weight: 600;
    margin-bottom: 16px;
    color: #0f172a;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
  p {
    font-size: clamp(14px, 2vw, 16px);
    color: #64748b;
    line-height: 1.8;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #94a3b8;
    }
  }
`;

const Companies = styled.div`
  margin-top: 60px;
  text-align: center;
  h3 {
    font-size: clamp(18px, 2.5vw, 20px);
    font-weight: 600;
    color: #0f172a;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
`;

const LogoSlider = styled.div`
  overflow: hidden;
  width: 100%;
  margin-top: 20px;
  
  @media (max-width: 640px) {
    margin-top: 16px;
  }
`;

const LogoTrack = styled.div`
  display: flex;
  gap: 40px;
  animation: ${scrollLeft} 20s linear infinite;
  
  @media (max-width: 640px) {
    gap: 30px;
    animation: ${scrollLeft} 15s linear infinite;
  }
`;

const LogoItemWrap = styled.div`
  width: 120px;
  height: 120px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: grayscale(0.3);
  transition: transform 0.3s ease, filter 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
    filter: grayscale(0);
  }
  
  @media (max-width: 640px) {
    width: 90px;
    height: 90px;
  }
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
      filter={`url(#${strokeId})`}
    >
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

  const revealStyle = (delayMs: number) =>
    ({ ["--reveal-delay" as any]: `${delayMs}ms` } as React.CSSProperties);

  const FAQ_ITEMS = [
    {
      q: "무료로 체험해 볼 수 있나요?",
      a: "무료 체험 제공 여부는 플랜에 따라 다를 수 있어요. 자세한 내용은 문의해 주세요.",
    },
    {
      q: "결제는 어떻게 하나요?",
      a: "카드 등록을 통해 구독하거나 별도의 계산서 발급을 통해 결제할 수 있습니다.",
    },
    {
      q: "프로그램을 설치해야 하나요?",
      a: "별도 설치 없이 웹에서 바로 이용할 수 있어요.",
    },
    {
      q: "회의실마다 디스플레이가 없어도 사용이 가능한가요?",
      a: "디스플레이 없이도 기본 기능은 사용할 수 있으며, 디스플레이 연동은 선택 사항입니다.",
    },
    {
      q: "구축형 예약 시스템 도입도 가능한가요?",
      a: "규모와 환경에 맞춘 구축/커스터마이징 도입도 가능합니다.",
    },
    {
      q: "디스플레이로 사용할 수 있는 기기는 무엇인가요?",
      a: "모니터/태블릿 등 다양한 디스플레이 기기에서 사용할 수 있어요.",
    },
    {
      q: "연동을 지원하는 서비스는 무엇인가요?",
      a: "연동 지원 범위는 계속 확장 중이며, 필요한 서비스가 있다면 요청해 주세요.",
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

  useEffect(() => {
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
      const serviceSectionTitle = document.querySelector('[data-service-title]');
      if (serviceSectionTitle) {
        const rect = serviceSectionTitle.getBoundingClientRect();
        // 타이틀이 화면 상단 100px 이내에 들어오면 배경 글자 숨김
        setIsBackgroundVisible(rect.top > 100);
      }

      // 카드 애니메이션 트리거 (반복 가능)
      const serviceGrid = document.querySelector('[data-service-grid]');
      if (serviceGrid) {
        const rect = serviceGrid.getBoundingClientRect();
        // 그리드가 화면에 보이면 카드 표시, 벗어나면 숨김
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.2) {
          setAreCardsVisible(true);
        } else {
          setAreCardsVisible(false);
        }
      }

      const progressEl = progressSectionRef.current;
      if (
        progressEl &&
        !isProgressPinnedRef.current &&
        !isSnappingRef.current &&
        Date.now() > pinCooldownUntilRef.current
      ) {
        const rect = progressEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const NAV_HEIGHT = 0;

        if (progressCompletedOnceRef.current) {
          const isOutOfView = rect.bottom < 0 || rect.top > vh;
          if (isOutOfView) {
            progressCompletedOnceRef.current = false;
          }
        }

        const crossedTopLineDown = lastProgressTopRef.current > NAV_HEIGHT && rect.top <= NAV_HEIGHT;
        const topLineInRange = rect.bottom > NAV_HEIGHT;
        const scrollingDown = window.scrollY > lastScrollYRef.current;

        if (crossedTopLineDown && topLineInRange && scrollingDown && !progressCompletedOnceRef.current) {
          const targetScrollY = window.scrollY + (rect.top - NAV_HEIGHT);
          lockProgressScroll(targetScrollY);
        }

        lastProgressTopRef.current = rect.top;
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

  return (
    <Page>
      <BackgroundTextContainer>
        <BackgroundText $isVisible={isBackgroundVisible}>
          <span>I-Poten · I-Poten · I-Poten · I-Poten · I-Poten · I-Poten · </span>
          <span>I-Poten · I-Poten · I-Poten · I-Poten · I-Poten · I-Poten · </span>
        </BackgroundText>
      </BackgroundTextContainer>
      <HeroSection>
        <MainTitle>
          AI로 검증하는 <Highlight>면접솔루션</Highlight>,
          {/*<br />*/}
          {/*잡스푼*/}
          <br />
          <Highlight2>I-Poten</Highlight2>
        </MainTitle>
        <Subtitle>
          I-Poten과 함께, 더 똑똑하고 효과적인 면접을 경험하세요
          <br />
          면접 AI 함께 가나다라 마바사
        </Subtitle>
        <ButtonGroup>
          <PrimaryButton href="#start">
            AI 면접 시작하기 →
          </PrimaryButton>
          {/*<SecondaryButton href="#free">*/}
          {/*  무료 체험*/}
          {/*</SecondaryButton>*/}
          {/*<BlueButton href="#guide">*/}
          {/*  도입 문의*/}
          {/*</BlueButton>*/}
        </ButtonGroup>
      </HeroSection>

      <ServiceSection>
        <ServiceTitle data-service-title data-reveal style={revealStyle(0)}>
          <Highlight>취업 준비</Highlight>, 어디까지 해보셨나요?
        </ServiceTitle>
        <ServiceSubtitle data-reveal style={revealStyle(120)}>
          ↓ 잡스푼은 다양한 방향의 취업 준비 솔루션을 제공합니다
        </ServiceSubtitle>
        
        <ServiceGrid data-service-grid>
          {SERVICE_CARDS.map((card, index) => {
            const rotations = [-12, -6, 0, 6, 12];
            const zIndexes = [1, 2, 3, 2, 1];
            const delays = ["0s", "0.06s", "0.12s", "0.18s", "0.24s"];
            return (
              <ServiceCard
                key={card.title}
                $rotation={rotations[index] ?? 0}
                $zIndex={zIndexes[index] ?? 1}
                $translateX={0}
                $isVisible={areCardsVisible}
                style={{ transitionDelay: delays[index] ?? "0s" }}
              >
                <CardLabel>{card.label}</CardLabel>
                <CardTitle>{card.title}</CardTitle>
                <CardIcon aria-hidden>{card.icon}</CardIcon>
              </ServiceCard>
            );
          })}
        </ServiceGrid>
      </ServiceSection>

      <ProgressSection data-progress-section ref={progressSectionRef}>
        <ProgressKicker data-reveal style={revealStyle(0)}>I-POTEN FLOW</ProgressKicker>
        <ProgressTitle data-reveal style={revealStyle(100)}>
          면접을 위한 모든 과정 함께
          <br />
          <ProgressTitleAccent>I-Poten</ProgressTitleAccent>
        </ProgressTitle>
        <ProgressDescription data-reveal style={revealStyle(220)}>
          아래로 스크롤하면 진행 바가 자연스럽게 채워지며 각 단계가 나타납니다
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
      <LightShowcaseBand>
        <ShowcaseSection>
          <ShowcaseGrid>
            <ShowcaseVisual>
              <div data-reveal style={revealStyle(0)}>
                <ShowcaseBaseFrame>
                  {/*{SHOWCASE_IMAGES.baseSrc ? (*/}
                    <ShowcaseImage src={word1} alt="" />
                  {/*) : (*/}
                  {/*  <ShowcasePlaceholder />*/}
                  {/*)}*/}
                </ShowcaseBaseFrame>
              </div>
              <ShowcaseOverlayFrame data-reveal data-reveal-variant="fade" style={revealStyle(180)}>
                {/*{SHOWCASE_IMAGES.overlaySrc ? (*/}
                  <ShowcaseImage src={word2} alt="" />
                {/*) : (*/}
                {/*  <ShowcasePlaceholder />*/}
                {/*)}*/}
              </ShowcaseOverlayFrame>
            </ShowcaseVisual>

            <ShowcaseContent data-reveal style={revealStyle(140)}>
              <ShowcaseTitle>
                빠르고
                <br />
                간편하게
                <br />
                공부 하세요.
              </ShowcaseTitle>
              <ShowcaseSubTitle>면접을 위한 공부 어떻게 하시나요?</ShowcaseSubTitle>
              <ShowcaseDescription>
                (여기에 작은 설명을 넣을 예정)
                <br />
                이미지 2장만 넣으면 레퍼런스와 동일한 레이아웃 호호호
              </ShowcaseDescription>
            </ShowcaseContent>
          </ShowcaseGrid>
        </ShowcaseSection>

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
                파악하세요.
              </ScheduleDarkTitle>
              <ScheduleDarkDescription>
                다양한 부분 점수와 종합 점수를 제공하여
                <br />
                나의 상황과 발전
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
                한번에
                <br />
                전반적인
                <br />
                나의
                <br />
                면접

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
                영구적으로 간직하고 사용하세요
              </ScheduleDarkTitle>
              <ScheduleDarkDescription>
                PDF 내보내기,
                <br />
                마이페이지에서 나의 면접 기록들을!
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
            실제 면접 데이터를 통해
            <br />
            <InsightsTitle2 data-reveal style={revealStyle(0)}>더욱 엄선된 면접을 제공합니다.</InsightsTitle2>
          </InsightsTitle>

        <InsightsPanel>


          <InsightsPanelInner>
            <InsightsLeft data-reveal style={revealStyle(140)}>
              <InsightsLeftTitle>
                실제,
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
                    <InsightsBackgroundImage src={interview5} alt="" />
                </InsightsDashboardInner>
              </InsightsDashboardFrame>
            </InsightsRight>
          </InsightsPanelInner>
        </InsightsPanel>
        </InsightsSection>
      </LightShowcaseBand>

      <WhiteBackground>
        <PracticeSection>
          <PracticeIcon data-reveal style={revealStyle(0)}><img style={{ width: "110px", height: "auto" }} src={image} /></PracticeIcon>
          <PracticeTitle data-reveal style={revealStyle(120)}>
            <DotStyle>"</DotStyle><PracticeHighlight2>면접</PracticeHighlight2><DotStyle>"</DotStyle> <br/>
            <PracticeHighlight>지속적인 연습</PracticeHighlight>이 <br/>필요합니다

          </PracticeTitle>
          <PracticeDescription data-reveal style={revealStyle(240)}>
            <SubTextStyle>면접은 지속적인 연습과 준비가 필요합니다 <br /><SubTextStyle2>I-Poten</SubTextStyle2>이 당신의 취업과 발전에 함께하겠습니다</SubTextStyle>
          </PracticeDescription>
        </PracticeSection>

        <FaqSection>
          <FaqTitle data-reveal style={revealStyle(0)}>자주 묻는 질문</FaqTitle>
          <FaqList data-reveal data-reveal-variant="fade" style={revealStyle(140)}>
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <FaqItem key={item.q}>
                  <FaqButtonRow
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  >
                    <FaqQuestion>{item.q}</FaqQuestion>
                    <FaqToggle>{isOpen ? "×" : "+"}</FaqToggle>
                  </FaqButtonRow>
                  {isOpen ? <FaqAnswer>{item.a}</FaqAnswer> : null}
                </FaqItem>
              );
            })}
          </FaqList>
        </FaqSection>

        <HomeFiveSection ref={sectionRef}>
          <Hero>
            <TitleBox data-reveal data-reveal-variant="fade" style={revealStyle(120)}>I-POTEN</TitleBox>
            <h2>국내 최초, 개발자를 위한 AI 모의 면접 플랫폼</h2>
            <p>
              <BlueText>I-Poten</BlueText>은 진짜 면접처럼 연습하고, <br />
              기업 맞춤 정보를 통해 자신 있게 면접을 준비할 수 있도록 돕습니다.
            </p>
          </Hero>
          <Features data-reveal style={revealStyle(220)}>
            <h2>
              <BlueText>I-Poten</BlueText>은 이렇게 다릅니다
            </h2>
            <p>
              단순한 질문 생성기가 아닙니다. <br />
              각 기업이 요구하는 조건, 자주 묻는 질문, 실제 면접에서 사용된 질문을
              수집하고 분석하여
              <br />
              사용자에게 맞춤형으로 제공하는 국내 최초 개발자 특화 면접 준비
              사이트입니다.
            </p>
          </Features>
          <Companies data-reveal style={revealStyle(320)}>
            <h3>
              현재 <BlueText>I-Poten</BlueText>이 지원하는 기업
            </h3>
            <LogoSlider>
              <LogoTrack>
                {[logoDanggeun, logoToss, logoEncore, logoKT, logoDanggeun, logoToss, logoEncore, logoKT].map((src, i) => (
                  <LogoItemWrap key={`${src}-${i}`}>
                    <SvgStrokeLogo src={src} size={120} stroke={1} />
                  </LogoItemWrap>
                ))}
              </LogoTrack>
            </LogoSlider>
          </Companies>
          <ConfettiCanvas ref={canvasRef} />
        </HomeFiveSection>

        
      </WhiteBackground>


      <ScrollTopButton onClick={scrollToTop} aria-label="맨 위로">
        ↑
      </ScrollTopButton>
    </Page>
  );
}
