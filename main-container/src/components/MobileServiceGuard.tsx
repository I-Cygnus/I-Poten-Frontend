import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const MOBILE_BREAKPOINT = 768;

/**
 * 랜딩 페이지 패턴 — 이 경로들은 모바일에서 그대로 보여줌.
 * 나머지는 서비스 페이지로 간주하여 모바일 유도 팝업 노출.
 */
const LANDING_PATTERNS: Array<string | RegExp> = [
  "/",
  "/learning",
  "/learning/quiz",
  "/learning/book",
  "/vue-ai-interview/ai-interview/landing",
  "/vue-account/account/login",
  "/vue-account/account/privacy",
  "/vue-account/terms-of-service",
  "/review-survey",
  /^\/event(\/|$)/,
  /^\/sveltekit-review(\/|$)/,
  // OAuth 리다이렉트
  /^\/vue-account\/(kakao|google|github|guest|naver)/,
];

function isLandingPage(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return LANDING_PATTERNS.some((p) => {
    if (typeof p === "string") {
      const norm = p.replace(/\/+$/, "") || "/";
      return clean === norm;
    }
    return p.test(clean);
  });
}

/** 세션 중 "계속하기"를 눌러 팝업을 닫은 적이 있는지 */
const DISMISSED_KEY = "mobile-service-popup-dismissed";

export default function MobileServiceGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );
  const [dismissed, setDismissed] = useState(() =>
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(DISMISSED_KEY) === "1"
      : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 경로 변경 시 dismissed 유지 (세션 단위)
  const showPopup = isMobile && !dismissed && !isLandingPage(location.pathname);

  const handleGoLanding = () => {
    // 현재 경로에 맞는 랜딩으로 이동
    const p = location.pathname;
    if (p.startsWith("/learning/quiz")) navigate("/learning/quiz");
    else if (p.startsWith("/learning")) navigate("/learning");
    else if (p.startsWith("/vue-ai-interview")) navigate("/vue-ai-interview/ai-interview/landing");
    else if (p.startsWith("/mypage")) navigate("/");
    else if (p.startsWith("/vue-account")) navigate("/vue-account/account/login");
    else navigate("/");
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  };

  return (
    <>
      {children}
      {showPopup && (
        <Overlay>
          <Popup>
            <IconWrap>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="#EEF2FF" />
                <path
                  d="M18 17C18 15.3431 19.3431 14 21 14H35C36.6569 14 38 15.3431 38 17V39C38 40.6569 36.6569 42 35 42H21C19.3431 42 18 40.6569 18 39V17Z"
                  stroke="#4F76F1"
                  strokeWidth="2.2"
                  fill="none"
                />
                <rect x="22" y="18" width="12" height="16" rx="1.5" fill="#C7D2FE" />
                <circle cx="28" cy="38" r="2" fill="#4F76F1" />
              </svg>
            </IconWrap>

            <Title>PC에서 이용해 주세요</Title>
            <Desc>
              이 기능은 데스크톱 환경에 최적화되어 있어요.
              <br />
              더 나은 경험을 위해 PC에서 접속해 주세요.
            </Desc>

            <BtnPrimary onClick={handleGoLanding}>랜딩 페이지로 돌아가기</BtnPrimary>
            <BtnGhost onClick={handleDismiss}>이대로 계속하기</BtnGhost>
          </Popup>
        </Overlay>
      )}
    </>
  );
}

/* ─── styled ─── */

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: ${fadeIn} 0.25s ease;
`;

const Popup = styled.div`
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 28px 32px;
  text-align: center;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
  animation: ${slideUp} 0.35s ease;
`;

const IconWrap = styled.div`
  margin-bottom: 20px;
  display: inline-flex;
`;

const Title = styled.h2`
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 750;
  letter-spacing: -0.04em;
  color: #111827;
  line-height: 1.3;
`;

const Desc = styled.p`
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.65;
  color: #6b7280;
  word-break: keep-all;
`;

const BtnPrimary = styled.button`
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #4f76f1 0%, #6366f1 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.1s ease;
  box-shadow: 0 6px 20px rgba(79, 118, 241, 0.35);

  &:hover {
    filter: brightness(0.95);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const BtnGhost = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 10px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: #6b7280;
  }
`;
