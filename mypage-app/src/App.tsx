import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import styled, { ThemeProvider } from "styled-components";
import { getTheme, onThemeChange, type Theme as BridgeTheme } from "@jobspoon/theme-bridge";

import MyPage from "./pages/MyPage.tsx";
import InterviewRecordListPage from "./pages/InterviewRecordListPage.tsx";
import InterviewRecordDetailPage from "./pages/InterviewRecordDetailPage.tsx";

import AccountWithdrawal from "./pages/AccountWithdrawal.tsx";
import SchedulePage from "./pages/SchedulePage.tsx";

const AppShell = styled.div.attrs({ "data-app": "mypage" })`
    position: relative;
    min-height: 100vh;
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.fg};
    transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
        color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    isolation: isolate;

    &::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background: ${({ theme }) => theme.backdrop};
    }

    & > * {
        position: relative;
        z-index: 1;
    }
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
                            borderRadius: "12px",
                            padding: "14px 18px",
                            fontSize: "14px",
                            fontWeight: 600,
                            letterSpacing: "-0.015em",
                            boxShadow: "0 22px 60px rgba(15, 23, 42, 0.12)",
                            color: mode === "dark" ? "#f1f5f9" : "#0f172a",
                            background: mode === "dark" ? "#0f172a" : "#ffffff",
                            border:
                                mode === "dark"
                                    ? "1px solid rgba(148, 163, 184, 0.18)"
                                    : "1px solid rgba(148, 163, 184, 0.22)",
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

                        <Route path="withdrawal" element={<AccountWithdrawal />} />
                        <Route path="schedule" element={<SchedulePage />} />
                    </Route>
                </Routes>
            </AppShell>
        </ThemeProvider>
    );
}

const lightBackdrop = `#f8fafc`;

const darkBackdrop = `#0b1222`;

const lightTheme = {
    bg: "#ffffff",
    backdrop: lightBackdrop,
    fg: "#0f172a",
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    surfaceHover: "#f1f5f9",
    border: "rgba(148, 163, 184, 0.22)",
    muted: "rgba(15, 23, 42, 0.66)",
    subtle: "rgba(15, 23, 42, 0.42)",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    tagBg: "rgba(59, 130, 246, 0.08)",
    overlay: "rgba(15, 23, 42, 0.45)",
    inputBg: "#ffffff",
    inputBorder: "rgba(148, 163, 184, 0.28)",
    inputPlaceholder: "rgba(15, 23, 42, 0.4)",
    badgeRecruitingBg: "#0f172a",
    badgeRecruitingFg: "#ffffff",
    badgeClosedBg: "#f1f5f9",
    badgeClosedFg: "rgba(15, 23, 42, 0.55)",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    danger: "#dc2626",
    dangerHover: "#b91c1c",
};

const darkTheme = {
    bg: "#070b14",
    backdrop: darkBackdrop,
    fg: "#f1f5f9",
    surface: "rgba(15, 23, 42, 0.92)",
    surfaceAlt: "rgba(30, 41, 59, 0.55)",
    surfaceHover: "rgba(30, 41, 59, 0.75)",
    border: "rgba(148, 163, 184, 0.18)",
    muted: "rgba(226, 232, 240, 0.66)",
    subtle: "rgba(226, 232, 240, 0.42)",
    primary: "#60a5fa",
    primaryHover: "#93c5fd",
    tagBg: "rgba(96, 165, 250, 0.14)",
    overlay: "rgba(2, 6, 23, 0.7)",
    inputBg: "rgba(15, 23, 42, 0.7)",
    inputBorder: "rgba(148, 163, 184, 0.24)",
    inputPlaceholder: "rgba(226, 232, 240, 0.4)",
    badgeRecruitingBg: "#f1f5f9",
    badgeRecruitingFg: "#0f172a",
    badgeClosedBg: "rgba(30, 41, 59, 0.75)",
    badgeClosedFg: "rgba(226, 232, 240, 0.6)",
    accent: "#60a5fa",
    accentHover: "#93c5fd",
    danger: "#f87171",
    dangerHover: "#ef4444",
};
