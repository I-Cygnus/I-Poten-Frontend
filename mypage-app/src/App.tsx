import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import styled, { ThemeProvider } from "styled-components";
import { getTheme, onThemeChange, type Theme as BridgeTheme } from "@jobspoon/theme-bridge";

import MyPage from "./pages/MyPage.tsx";
import InterviewRecordListPage from "./pages/InterviewRecordListPage.tsx";
import InterviewRecordDetailPage from "./pages/InterviewRecordDetailPage.tsx";
import MyPageLayout from "./components/layout/MyPageLayout.tsx";

import AccountProfilePage from "./pages/old/AccountProfilePage.tsx";
import InterviewResultList from "./pages/old/InterviewHistoryPage.tsx";
import AccountWithdrawal from "./pages/old/AccountWithdrawal.tsx";
import MembershipPage from "./pages/old/MemebershipPage.tsx";
import SchedulePage from "./pages/SchedulePage.tsx";
import MyPostsPage from "./pages/old/MyPostsPage.tsx";
import InquiryPage from "./pages/old/InquiryPage.tsx";
import MyReportsPage from "./pages/old/MyReportsPage.tsx";
import SettingPage from "./pages/old/SettingPage.tsx";

const AppShell = styled.div.attrs({ "data-app": "mypage" })`
    min-height: 100vh;
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.fg};
    transition: background-color 0.2s ease, color 0.2s ease;
`;

function useBridgeTheme(): BridgeTheme {
    const read = (): BridgeTheme => {
        const attr = document.documentElement.getAttribute("data-theme");
        if (attr === "light" || attr === "dark") return attr as BridgeTheme;
        try {
            const ls = localStorage.getItem("theme");
            if (ls === "light" || ls === "dark") return ls as BridgeTheme;
        } catch {}
        return getTheme();
    };

    const [mode, setMode] = useState<BridgeTheme>(read);

    useEffect(() => {
        setMode(read());

        const off = onThemeChange((t) => {
            setMode((prev) => (prev === t ? prev : t));
        });

        const mo = new MutationObserver(() => {
            const t = read();
            setMode((prev) => (prev === t ? prev : t));
        });

        mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        return () => {
            off?.();
            mo.disconnect();
        };
    }, []);

    return mode;
}

export default function App() {
    const mode = useBridgeTheme();
    const theme = mode === "dark" ? darkTheme : lightTheme;

    return (
        <ThemeProvider theme={theme}>
            <AppShell>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    containerStyle={{ top: 60 }}
                    toastOptions={{
                        style: {
                            borderRadius: "14px",
                            padding: "12px 18px",
                            fontSize: "15px",
                            fontWeight: 600,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                            color: mode === "dark" ? "#F9FAFB" : "#111827",
                            background:
                                mode === "dark"
                                    ? "rgba(28,28,30,0.9)"
                                    : "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(10px)",
                            border:
                                mode === "dark"
                                    ? "1px solid rgba(255,255,255,0.08)"
                                    : "1px solid rgba(0,0,0,0.08)",
                        },
                    }}
                />

                <Routes>
                    <Route path="/" element={<MyPage />}>
                        <Route
                            path="interview/records"
                            element={<InterviewRecordListPage />}
                        />
                        <Route
                            path="interview/:interviewId"
                            element={<InterviewRecordDetailPage />}
                        />

                        <Route path="account/edit" element={<AccountProfilePage />} />
                        <Route path="interview/history" element={<InterviewResultList />} />
                        <Route path="withdrawal" element={<AccountWithdrawal />} />
                        <Route path="membership" element={<MembershipPage />} />
                        <Route path="setting" element={<SettingPage />} />
                        <Route path="my-posts" element={<MyPostsPage />} />
                        <Route path="schedule" element={<SchedulePage />} />
                        <Route path="inquiry" element={<InquiryPage />} />
                        <Route path="my-reports" element={<MyReportsPage />} />
                    </Route>
                </Routes>
            </AppShell>
        </ThemeProvider>
    );
}

const lightTheme = {
    bg: "#ffffff",
    fg: "#111111",
    surface: "#ffffff",
    surfaceAlt: "#D9D9D954",
    surfaceHover: "#f2f4f7",
    border: "#e5e7eb",
    muted: "#6b7280",
    subtle: "#9ca3af",
    primary: "#01B0F1",
    primaryHover: "#4752c4",
    tagBg: "#eef2ff",
    overlay: "rgba(0,0,0,0.45)",
    inputBg: "#ffffff",
    inputBorder: "#d1d5db",
    inputPlaceholder: "#9ca3af",
    badgeRecruitingBg: "#01B0F1",
    badgeRecruitingFg: "#fff",
    badgeClosedBg: "#1A1A1F",
    badgeClosedFg: "#BDBDBD",
    accent: "#5865F2",
    accentHover: "#4752c4",
    danger: "#ef4444",
    dangerHover: "#dc2626",
};

const darkTheme = {
    bg: "#181924",
    fg: "#ffffff",
    surface: "#2c2f3b",
    surfaceAlt: "#2D2F3C",
    surfaceHover: "#343846",
    border: "#3e414f",
    muted: "#8c92a7",
    subtle: "#a0a0a0",
    primary: "#01B0F1",
    primaryHover: "#6a75f7",
    tagBg: "#3e414f",
    overlay: "rgba(0,0,0,0.7)",
    inputBg: "#1e2129",
    inputBorder: "#4a5568",
    inputPlaceholder: "#9aa3b2",
    badgeRecruitingBg: "#01B0F1",
    badgeRecruitingFg: "#fff",
    badgeClosedBg: "#1A1A1F",
    badgeClosedFg: "#BDBDBD",
    accent: "#5865F2",
    accentHover: "#6a75f7",
    danger: "#ff6b6b",
    dangerHover: "#f05252",
};
