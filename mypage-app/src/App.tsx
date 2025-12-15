import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MyPageLayout from "./components/layout/MyPageLayout.tsx";
import DashboardSection from "./components/dashboard/DashboardSection.tsx";
import AccountProfilePage from "./pages/AccountProfilePage.tsx";
import InterviewResultList from "./pages/InterviewHistoryPage.tsx";
import AccountWithdrawal from "./pages/AccountWithdrawal.tsx";
import MembershipPage from "./pages/MemebershipPage.tsx";
import SchedulePage from "./pages/SchedulePage.tsx";
import MyPostsPage from "./pages/MyPostsPage.tsx";
import InquiryPage from "./pages/InquiryPage.tsx";
import MyReportsPage from "./pages/MyReportsPage";

import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { getTheme, onThemeChange, type Theme as BridgeTheme } from '@jobspoon/theme-bridge';
import SettingPage from "./pages/SettingPage.tsx";

// 리모트 전용 스코프 래퍼
const AppShell = styled.div.attrs({ 'data-app': 'mypage' })`
  min-height: 100vh;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.fg};
  transition: background-color .2s ease, color .2s ease;
`;

// 컴포넌트/3rd-party에 필요한 공통 리셋이 있으면 스코프를 강제
const ScopedGlobal = createGlobalStyle`
  [data-app="mypage"] * { box-sizing: border-box; }
  [data-app="mypage"] a { color: inherit; text-decoration: none; }
`;

/** 핵심: DOM(data-theme) → localStorage → bridge 순서로 읽고,
 *  DOM/bridge 양쪽 변경을 모두 구독해서 역전/레이스 제거
 */
function useBridgeTheme(): BridgeTheme {
    const read = (): BridgeTheme => {
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light' || attr === 'dark') return attr as BridgeTheme;
        try {
            const ls = localStorage.getItem('theme');
            if (ls === 'light' || ls === 'dark') return ls as BridgeTheme;
        } catch { }
        return getTheme();
    };

    const [mode, setMode] = useState<BridgeTheme>(read);

    useEffect(() => {
        // mount 직후 한 번 더 동기화(호스트가 DOM을 늦게 세팅해도 맞춤)
        setMode(read());

        // bridge 이벤트 구독
        const off = onThemeChange((t) => {
            setMode((prev) => (prev === t ? prev : t));
        });

        // DOM의 data-theme 변화도 감시(안전망)
        const mo = new MutationObserver(() => {
            const t = read();
            setMode((prev) => (prev === t ? prev : t));
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        return () => { off?.(); mo.disconnect(); };
    }, []);

    return mode;
}

export default function App() {
    const mode = useBridgeTheme();
    const theme = mode === 'dark' ? darkTheme : lightTheme;

    return (
        <ThemeProvider theme={theme}>
            <AppShell>
                <ScopedGlobal />

                {/* 전역 토스트 컨테이너 (한 번만 선언) */}
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    containerStyle={{
                        top: 60, // ✅ 기본보다 약간 아래 (px 단위, 40~80 정도가 자연스러움)
                    }}
                    toastOptions={{
                        style: {
                            borderRadius: "14px",
                            padding: "12px 18px",
                            fontSize: "15px",
                            fontWeight: 600,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                            color: mode === "dark" ? "#F9FAFB" : "#111827",
                            background: mode === "dark"
                                ? "rgba(28,28,30,0.9)"
                                : "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(10px)",
                            border: mode === "dark"
                                ? "1px solid rgba(255,255,255,0.08)"
                                : "1px solid rgba(0,0,0,0.08)",
                        },
                        success: {
                            iconTheme: {
                                primary: "#3B82F6",
                                secondary: "#fff",
                            },
                            style: {
                                background: mode === "dark" ? "rgba(37,99,235,0.15)" : "#EBF5FF",
                                color: "#1E40AF",
                                border: "1px solid rgba(37,99,235,0.2)",
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: "#EF4444",
                                secondary: "#fff",
                            },
                            style: {
                                background: mode === "dark" ? "rgba(239,68,68,0.15)" : "#FEE2E2",
                                color: "#991B1B",
                                border: "1px solid rgba(239,68,68,0.2)",
                            },
                        },
                    }}
                />

                <Routes>
                    <Route path="/" element={<MyPageLayout />}>
                        {/* 기본: 대시보드 (우측 영역) */}
                        <Route index element={<DashboardSection />} />
                        {/* 회원정보 수정 */}
                        <Route path="account/edit" element={<AccountProfilePage />} />
                        {/* 인터뷰 결과 보관함 */}
                        <Route path="interview/history" element={<InterviewResultList />} />
                        {/* 회원탈퇴 */}
                        <Route path="withdrawal" element={<AccountWithdrawal />} />
                        {/* 멤버십 */}
                        <Route path="membership" element={<MembershipPage />} />

                        <Route path="setting" element={<SettingPage />}  />
                        {/* 작성한 글 */}
                        <Route path="my-posts" element={<MyPostsPage />} />
                        {/* 일정 */}
                        <Route path="schedule" element={<SchedulePage />} />
                        {/* 문의 */}
                        <Route path="inquiry" element={<InquiryPage />} />
                        {/* 신고 */}
                        <Route path="my-reports" element={<MyReportsPage />} />
                    </Route>
                </Routes>
            </AppShell>
        </ThemeProvider>
    )
}

/** ===== Theme tokens ===== */
const lightTheme = {
    bg: '#ffffff',
    fg: '#111111',
    surface: '#ffffff',
    surfaceAlt: '#D9D9D954',
    surfaceHover: '#f2f4f7',
    border: '#e5e7eb',
    muted: '#6b7280',
    subtle: '#9ca3af',
    primary: '#01B0F1',
    primaryHover: '#4752c4',
    tagBg: '#eef2ff',
    overlay: 'rgba(0,0,0,0.45)',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputPlaceholder: '#9ca3af',
    badgeRecruitingBg: '#01B0F1',
    badgeRecruitingFg: '#fff',
    badgeClosedBg: '#1A1A1F',
    badgeClosedFg: '#BDBDBD',
    accent: '#5865F2',
    accentHover: '#4752c4',
    danger: '#ef4444',
    dangerHover: '#dc2626',
};

const darkTheme = {
    bg: '#181924',
    fg: '#ffffff',
    surface: '#2c2f3b',
    surfaceAlt: '#2D2F3C',
    surfaceHover: '#343846',
    border: '#3e414f',
    muted: '#8c92a7',
    subtle: '#a0a0a0',
    primary: '#01B0F1',
    primaryHover: '#6a75f7',
    tagBg: '#3e414f',
    overlay: 'rgba(0,0,0,0.7)',
    inputBg: '#1e2129',
    inputBorder: '#4a5568',
    inputPlaceholder: '#9aa3b2',
    badgeRecruitingBg: '#01B0F1',
    badgeRecruitingFg: '#fff',
    badgeClosedBg: '#1A1A1F',
    badgeClosedFg: '#BDBDBD',
    accent: '#5865F2',
    accentHover: '#6a75f7',
    danger: '#ff6b6b',
    dangerHover: '#f05252',
};