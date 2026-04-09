// NavigationBar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import springAxiosInst from "./utility/AxiosInst.ts";
import {logoutRequest, tokenVerification} from "./utility/AccountApi.ts";

// 로고 이미지
import logoBlack from "./assets/Logo2.png";

/* ─── Modal Styles (Perfectly matched to screenshot) ────────────────────────── */

const iconPop = keyframes`
    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
`;

const ModalScrim = styled.div<{ $zIndex: number }>`
    position: fixed;
    inset: 0;
    z-index: ${({ $zIndex }) => $zIndex};
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(8px);
`;

const ModalSheet = styled.div<{ $zIndex: number }>`
    position: fixed;
    z-index: ${({ $zIndex }) => $zIndex + 1};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    width: 480px;
    max-width: calc(100% - 32px);
    background: #ffffff;
    border-radius: 40px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    font-family: 'Pretendard', -apple-system, sans-serif;
    animation: ${iconPop} 0.25s ease-out;
`;

const CloseIconButton = styled.button`
    position: absolute;
    top: 28px;
    right: 28px;
    background: none;
    border: none;
    cursor: pointer;
    color: #94A3B8;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    z-index: 10;

    &:hover {
        transform: scale(1.1);
        color: #64748B;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 56px 32px 20px;
`;

const ModalIconBox = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FDF8F1;
    margin-bottom: 28px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
`;

const ModalTitleWrap = styled.div`
    text-align: center;
    
    h3 {
        margin: 0;
        font-size: 28px;
        color: #0F172A;
        font-weight: 800;
        letter-spacing: -0.04em;
    }
`;

const ModalBody = styled.div`
    padding: 0 40px 48px;
    text-align: center;
`;

const ModalPlainBody = styled.p`
    margin: 0;
    font-size: 18px;
    line-height: 1.6;
    color: #475569;
    font-weight: 600;
    letter-spacing: -0.03em;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 0 32px 32px;
`;

const ModalGhostBtn = styled.button`
    height: 56px;
    min-width: 90px;
    padding: 0 24px;
    border-radius: 16px;
    border: 1.5px solid #E2E8F0;
    background: #ffffff;
    color: #475569;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #F8FAFC;
    }
`;

const ModalPrimaryBtn = styled.button`
    height: 56px;
    padding: 0 32px;
    border-radius: 16px;
    border: none;
    background: #4F6EF3;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 8px 20px rgba(79, 110, 243, 0.3);

    &:hover {
        background: #3F5ED3;
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(79, 110, 243, 0.4);
    }
`;

const WarningIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9V14M12 17.01L12.01 16.998" stroke="#B47D3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.29 3.86L1.82 18C1.64531 18.3024 1.55299 18.645 1.5522 18.9935C1.55141 19.3419 1.64218 19.6841 1.81546 19.9858C1.98874 20.2874 2.2384 20.5375 2.53949 20.7108C2.84059 20.8841 3.18241 20.9749 3.53 20.975H20.47C20.8176 20.9749 21.1594 20.8841 21.4605 20.7108C21.7616 20.5375 22.0113 20.2874 22.1845 19.9858C22.3578 19.6841 22.4486 19.3419 22.4478 18.9935C22.447 18.645 22.3547 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32319 12.9812 3.15449C12.6817 2.98579 12.3437 2.89746 12 2.89746C11.6563 2.89746 11.3183 2.98579 11.0188 3.15449C10.7193 3.32319 10.4683 3.56611 10.29 3.86V3.86Z" stroke="#B47D3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CloseXIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

/* ─── Navigation Styles ─────────────────────────────────────────────────── */

// 모바일 메뉴 오버레이
const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

// 모바일 메뉴
const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 72px;
  right: 0;
  width: 280px;
  max-width: 85vw;
  height: calc(100vh - 72px);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding: 24px 0;
`;

// 모바일 네비게이션 링크
const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  display: block;
  text-decoration: none;
  color: ${({ $active }) => ($active ? "#1a1a1a" : "#666666")};
  font-size: 16px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  padding: 16px 24px;
  background: ${({ $active }) =>
    $active
        ? "linear-gradient(135deg, rgba(79, 156, 249, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)"
        : "transparent"};
  transition: all 0.2s ease;
  border-left: 3px solid ${({ $active }) => ($active ? "#4F9CF9" : "transparent")};
  
  &:hover {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.04);
  }
`;

// 모바일 인증 버튼
const MobileAuthButton = styled.button`
  width: calc(100% - 48px);
  margin: 16px 24px;
  appearance: none;
  border: 0;
  background: linear-gradient(135deg, #4F9CF9 0%, #10B981 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  padding: 14px 24px;
  border-radius: 12px;
  letter-spacing: -0.3px;
  box-shadow: 0 4px 12px rgba(79, 156, 249, 0.3);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
`;

// 햄버거 메뉴 버튼
const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
`;

const HamburgerLine = styled.span<{ $isOpen: boolean }>`
  width: 24px;
  height: 2px;
  background: #1a1a1a;
  transition: all 0.3s ease;
  border-radius: 2px;
  
  &:nth-child(1) {
    transform: ${({ $isOpen }) =>
    $isOpen ? "rotate(45deg) translateY(7px)" : "none"};
  }
  
  &:nth-child(2) {
    opacity: ${({ $isOpen }) => ($isOpen ? 0 : 1)};
  }
  
  &:nth-child(3) {
    transform: ${({ $isOpen }) =>
    $isOpen ? "rotate(-45deg) translateY(-7px)" : "none"};
  }
`;

const Header = styled.header<{ $scrolled?: boolean; $hidden?: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  height: ${({ $hidden }) => ($hidden ? "0px" : "72px")};
  background: ${({ $scrolled }) =>
    $scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent"
};
  background-color: ${({ $scrolled }) =>
    $scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent"
};
  backdrop-filter: ${({ $scrolled }) => $scrolled ? "blur(20px)" : "none"};
  -webkit-backdrop-filter: ${({ $scrolled }) => $scrolled ? "blur(20px)" : "none"};
  color: #1a1a1a;
  border-bottom: ${({ $scrolled }) =>
    $scrolled
        ? "1px solid rgba(0, 0, 0, 0.08)"
        : "none"
};
  box-shadow: ${({ $scrolled }) =>
    $scrolled
        ? "0 2px 16px rgba(0, 0, 0, 0.04)"
        : "none"
};
  transition: height 0.28s ease, opacity 0.28s ease, transform 0.28s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
  overflow: hidden;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transform: ${({ $hidden }) => ($hidden ? "translateY(-100%)" : "translateY(0)")};
  pointer-events: ${({ $hidden }) => ($hidden ? "none" : "auto")};
`;

const BottomBarWrap = styled.div<{ $visible: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 18px;
  z-index: 1100;
  display: flex;
  justify-content: center;
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "translateY(0)" : "translateY(16px)")};
  transition: opacity 0.28s ease, transform 0.28s ease;
  padding: 0 16px;
`;

const BottomBar = styled.div`
  width: min(980px, 100%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.10);
`;

const BottomHome = styled(Link)`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.10);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.10);
  text-decoration: none;
  flex: 0 0 auto;
`;

const BottomHomeLogo = styled.img`
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
`;

const BottomNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
  overflow: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const BottomNavLink = styled(Link)<{ $active?: boolean }>`
  text-decoration: none;
  color: ${({ $active }) => ($active ? "#111827" : "#64748b")};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 800 : 700)};
  padding: 10px 14px;
  border-radius: 999px;
  background: ${({ $active }) =>
    $active ? "rgba(255, 255, 255, 0.96)" : "transparent"};
  box-shadow: ${({ $active }) =>
    $active ? "0 10px 26px rgba(0, 0, 0, 0.10)" : "none"};
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    color: #111827;
    background: ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.96)" : "rgba(0, 0, 0, 0.04)")};
    transform: translateY(-1px);
  }
`;

const BottomAuthLink = styled(Link)`
  flex: 0 0 auto;
  text-decoration: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 800;
  background: #0b1220;
  color: #ffffff;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
`;

const BottomAuthButton = styled.button`
  flex: 0 0 auto;
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 800;
  background: #0b1220;
  color: #ffffff;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  white-space: nowrap;
`;

const Inner = styled.div`
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 1024px) {
    padding: 0 24px;
  }

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #1a1a1a;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LogoImg = styled.img`
  width: 150px;
  height: auto;
  object-fit: contain;
  display: block;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 1024px) {
    gap: 4px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link) <{ $active?: boolean }>`
  text-decoration: none;
  color: ${({ $active }) => ($active ? "#1a1a1a" : "#666666")};
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  padding: 10px 18px;
  border-radius: 12px;
  background: ${({ $active }) =>
    $active
        ? "linear-gradient(135deg, rgba(79, 156, 249, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)"
        : "transparent"
};
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  white-space: nowrap;

  &:hover {
    color: #1a1a1a;
    background: ${({ $active }) =>
    $active
        ? "linear-gradient(135deg, rgba(79, 156, 249, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)"
        : "rgba(0, 0, 0, 0.04)"
};
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 8px 12px;
  }
`;

const AuthButton = styled.button`
  appearance: none;
  border: 0;
  background: linear-gradient(135deg, #4F9CF9 0%, #10B981 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 24px;
  border-radius: 50px;
  letter-spacing: -0.3px;
  box-shadow: 0 4px 12px rgba(79, 156, 249, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 156, 249, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 8px 18px;
  }
`;

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiceNavMode, setIsServiceNavMode] = useState(false);
  
  // Login Required Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingReturnUrl, setPendingReturnUrl] = useState("/");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getScrollY = () => {
      const w = window.scrollY ?? 0;
      const d = document.documentElement?.scrollTop ?? 0;
      const b = document.body?.scrollTop ?? 0;
      return Math.max(w, d, b);
    };

    const handleScroll = () => {
      const scrollY = getScrollY();
      const currentPath = window.location.pathname;
      const threshold = currentPath === "/" ? 250 : 80;
      setIsScrolled(scrollY > threshold);
    };

    handleScroll();
    requestAnimationFrame(handleScroll);
    setTimeout(handleScroll, 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("load", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("load", handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsServiceNavMode(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let rafId = 0;
    let target: Element | null = null;

    const NAV_HEIGHT = 72;

    const updateMode = () => {
      if (cancelled || !target) return;
      const rect = target.getBoundingClientRect();
      const shouldUseBottomBar = rect.top <= NAV_HEIGHT + 1;

      setIsServiceNavMode(prev => {
        if (prev === shouldUseBottomBar) return prev;
        return shouldUseBottomBar;
      });

      if (shouldUseBottomBar) {
        setIsMobileMenuOpen(false);
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateMode();
      });
    };

    const tryAttach = () => {
      if (cancelled) return;

      target = document.querySelector(
          "[data-service-title], [data-service-section], [data-service-grid]"
      ) as Element | null;

      if (!target) {
        attempts += 1;
        if (attempts < 30) {
          window.setTimeout(tryAttach, 250);
        }
        return;
      }

      updateMode();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    };

    tryAttach();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const result = await tokenVerificationRequest();

        if (result.status === false) {
          localStorage.removeItem("nickname");
          localStorage.removeItem("isLoggedIn");
          setIsLoggedIn(false);
        } else if (result.status === true) {
          localStorage.setItem("nickname", result.nickname);
          localStorage.setItem("isLoggedIn", "dsds-ww-sdx-s>W??");
          setIsLoggedIn(true);
        }
      } catch (err: any) {
        if (err.response && err.response.status === 429) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("nickname");
          setIsLoggedIn(false);
        }
      }
    };

    checkLogin();
  }, [location]);

  // Handle cross-app login required state
  useEffect(() => {
    if (location.state?.loginRequired) {
      setPendingReturnUrl(location.state.returnUrl || "/");
      setShowLoginModal(true);

      // Clear only the modal-triggering route state while preserving router history metadata.
      const nextState = { ...(location.state ?? {}) };
      delete nextState.loginRequired;
      delete nextState.returnUrl;

      navigate(
        `${location.pathname}${location.search}${location.hash}`,
        {
          replace: true,
          state: Object.keys(nextState).length > 0 ? nextState : null,
        }
      );
    }
  }, [location, navigate]);

  const tokenVerificationRequest = async () => {
    const axiosResponse = await tokenVerification();
    return axiosResponse.data;
  }

  const handleLogout = async () => {
    try {
      const axiosResponse = await logoutRequest();
      if (axiosResponse.status === 200 ) {
        setIsLoggedIn(false);
        localStorage.removeItem("nickname");
        localStorage.removeItem("isLoggedIn");
        navigate("/");
      } else {
        alert("로그아웃에 실패 하였습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("로그아웃중 문제 발생");
    }
  };

  const isActive = (to: string) =>
      to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileLogout = async () => {
    await handleLogout();
    closeMobileMenu();
  };

  const handleProtectedClick = (e: React.MouseEvent, to: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setPendingReturnUrl(to);
      setShowLoginModal(true);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    const loginUrl = `/vue-account/account/login?returnUrl=${encodeURIComponent(pendingReturnUrl)}`;
    navigate(loginUrl);
  };

  // 모바일 메뉴가 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  return (
      <>
        <Header $scrolled={isScrolled} $hidden={isServiceNavMode}>
          <Inner>
            <Brand to="/" aria-label="JobSpoon 홈">
              <LogoImg src={logoBlack} alt="JobSpoon" />
            </Brand>

            <Nav>
              <NavLink 
                to="/vue-ai-interview/ai-interview/landing" 
                $active={isActive("/vue-ai-interview")}
                onClick={(e) => handleProtectedClick(e, "/vue-ai-interview/ai-interview/landing")}
              >
                AI 인터뷰
              </NavLink>
              <NavLink to="/learning/word" $active={isActive("/learning/word")}>포텐워드</NavLink>
              <NavLink to="/learning/note" $active={isActive("/learning/note")}>포텐노트</NavLink>
              <NavLink to="/learning/quiz/home" $active={isActive("/learning/quiz/home")}>포텐퀴즈</NavLink>
              <NavLink to="/event" $active={isActive("/event")}>이벤트</NavLink>
              <NavLink 
                to="/mypage" 
                $active={isActive("/mypage")}
                onClick={(e) => handleProtectedClick(e, "/mypage")}
              >
                MyPage
              </NavLink>
              {!isLoggedIn ? (
                  <NavLink to="/vue-account/account/login" $active={isActive("/vue-account")}>
                    로그인
                  </NavLink>
              ) : (
                  <AuthButton onClick={handleLogout}>로그아웃</AuthButton>
              )}
            </Nav>

            <HamburgerButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="메뉴">
              <HamburgerLine $isOpen={isMobileMenuOpen} />
              <HamburgerLine $isOpen={isMobileMenuOpen} />
              <HamburgerLine $isOpen={isMobileMenuOpen} />
            </HamburgerButton>
          </Inner>
        </Header>

        <BottomBarWrap $visible={isServiceNavMode}>
          <BottomBar>
            <BottomHome to="/" aria-label="JobSpoon 홈">
              <BottomHomeLogo src={logoBlack} alt="" />
            </BottomHome>

            <BottomNav>
              <BottomNavLink
                  to="/vue-ai-interview/ai-interview/landing"
                  $active={isActive("/vue-ai-interview")}
                  onClick={(e) => handleProtectedClick(e, "/vue-ai-interview/ai-interview/landing")}
              >
                AI 인터뷰
              </BottomNavLink>
              <BottomNavLink to="/learning/word" $active={isActive("/learning/word")}>
                포텐워드
              </BottomNavLink>
              <BottomNavLink to="/learning/note" $active={isActive("/learning/note")}>
                포텐노트
              </BottomNavLink>
              <BottomNavLink to="/learning/quiz/home" $active={isActive("/learning/quiz/home")}>
                포텐퀴즈
              </BottomNavLink>
              <BottomNavLink to="/event" $active={isActive("/event")}>
                이벤트
              </BottomNavLink>
              <BottomNavLink 
                to="/mypage" 
                $active={isActive("/mypage")}
                onClick={(e) => handleProtectedClick(e, "/mypage")}
              >
                MyPage
              </BottomNavLink>
            </BottomNav>

            {!isLoggedIn ? (
                <BottomAuthLink to="/vue-account/account/login">로그인</BottomAuthLink>
            ) : (
                <BottomAuthButton onClick={handleLogout}>로그아웃</BottomAuthButton>
            )}
          </BottomBar>
        </BottomBarWrap>

        <MobileMenuOverlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
        <MobileMenu $isOpen={isMobileMenuOpen}>

          <MobileNavLink 
            to="/vue-ai-interview/ai-interview/landing" 
            $active={isActive("/vue-ai-interview")}
            onClick={(e) => handleProtectedClick(e, "/vue-ai-interview/ai-interview/landing")}
          >
            AI 인터뷰
          </MobileNavLink>

          <MobileNavLink to="/learning/word" $active={isActive("/learning/word")}>
            포텐워드
          </MobileNavLink>
          <MobileNavLink to="/learning/note" $active={isActive("/learning/note")}>
            포텐노트
          </MobileNavLink>
          <MobileNavLink to="/learning/quiz/home" $active={isActive("/learning/quiz/home")}>
            포텐퀴즈
          </MobileNavLink>
          <MobileNavLink to="/event" $active={isActive("/event")}>
            이벤트
          </MobileNavLink>
          <MobileNavLink 
            to="/mypage" 
            $active={isActive("/mypage")}
            onClick={(e) => handleProtectedClick(e, "/mypage")}
          >
            MyPage
          </MobileNavLink>
          {!isLoggedIn ? (
              <MobileNavLink to="/vue-account/account/login" $active={isActive("/vue-account")}>
                로그인
              </MobileNavLink>
          ) : (
              <MobileAuthButton onClick={handleMobileLogout}>로그아웃</MobileAuthButton>
          )}
        </MobileMenu>

        {/* Global Login Required Modal */}
        {showLoginModal && (
            <>
                <ModalScrim $zIndex={10000} onClick={() => setShowLoginModal(false)} />
                <ModalSheet role="dialog" aria-modal="true" $zIndex={10000}>
                    <CloseIconButton onClick={() => setShowLoginModal(false)} aria-label="닫기">
                        <CloseXIcon />
                    </CloseIconButton>
                    
                    <ModalHeader>
                        <ModalIconBox>
                            <WarningIcon />
                        </ModalIconBox>
                        <ModalTitleWrap>
                            <h3>로그인이 필요합니다</h3>
                        </ModalTitleWrap>
                    </ModalHeader>

                    <ModalBody>
                        <ModalPlainBody>
                            로그인 후 이용하실 수 있어요.
                        </ModalPlainBody>
                    </ModalBody>

                    <ModalFooter>
                        <ModalGhostBtn type="button" onClick={() => setShowLoginModal(false)}>
                            닫기
                        </ModalGhostBtn>
                        <ModalPrimaryBtn type="button" onClick={handleLoginConfirm}>
                            로그인하러 가기
                        </ModalPrimaryBtn>
                    </ModalFooter>
                </ModalSheet>
            </>
        )}
      </>
  );
};

export default App;
