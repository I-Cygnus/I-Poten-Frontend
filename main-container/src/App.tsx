// src/App.tsx
import React, { lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import ReactDOM from "react-dom/client";

import { CircularProgress, CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot, useRecoilValue } from "recoil";
import { Helmet, HelmetProvider } from "react-helmet-async";

import mitt from "mitt";

import Main from "./components/Main.tsx";
import EventPage from "./event/page/EventPage";
import EventPage1 from "./event/page/EventPage1";
import EventPage2 from "./event/page/EventPage2";
import NewEventPage from "./event/page/NewEventPage.tsx";
import NewEventDetailPage from "./event/page/NewEventDetailPage.tsx";
import NewWinnerDetailPage from "./event/page/NewWinnerDetailPage.tsx";
import ReviewSurveyPage from "./survey/page/ReviewSurveyPage.tsx";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import VueAccountAppWrapper from "./VueAccountWrapper.tsx";
import VueAiInterviewAppWrapper from "./VueAiInterviewWrapper.tsx";
import SvelteKitReviewAppWrapper from "./SvelteKitReviewWrapper.tsx";
import RequireToken from "./RequireToken";
import ThemeSync from "./ThemeSync";
import ThemeToggleButton from "./ThemeToggleButton";
import { themeAtom } from "@jobspoon/app-state";
import RequireLogin from "./RequireLogin.tsx";
import MobileServiceGuard from "./components/MobileServiceGuard.tsx";
import OpenBetaEventLanding from "./event/page/OpenBetaEventLanding.tsx";
import PtnReviewerEventLanding from "./event/page/PtnReviewerEventLanding.tsx";
import AdminPage from "./admin/AdminPage.tsx";

const eventBus = mitt();

const NavigationBarApp = lazy(() => import("navigationBarApp/App"));
const MyPageApp = lazy(() => import("myPageApp/App"));
const PtnWordApp = lazy(() => import("ptnWordApp/App"));

function subscribeToBrowserPath(onStoreChange: () => void) {
    window.addEventListener("popstate", onStoreChange);
    window.addEventListener("vue-route-change", onStoreChange as EventListener);

    return () => {
        window.removeEventListener("popstate", onStoreChange);
        window.removeEventListener("vue-route-change", onStoreChange as EventListener);
    };
}

function getBrowserPathSnapshot() {
    return window.location.pathname;
}

function getBrowserPathServerSnapshot() {
    return "/";
}

function useBrowserPathname() {
    return useSyncExternalStore(
        subscribeToBrowserPath,
        getBrowserPathSnapshot,
        getBrowserPathServerSnapshot
    );
}

function InnerApp() {
    const [isNavigationBarLoaded, setIsNavigationBarLoaded] = useState(false);
    const mode = useRecoilValue(themeAtom);

    // ✅ 라이트/다크 팔레트 토큰
    const paletteTokens =
        mode === "dark"
            ? {
                background: { default: "#0f1115", paper: "#151922" },
                text: { primary: "#eaeaea", secondary: "#a0a0a0" },
            }
            : {
                background: { default: "#ffffff", paper: "#ffffff" },
                text: { primary: "#111111", secondary: "#666666" },
            };

    // ✅ 테마 생성 + CssBaseline에서 body에 강제 적용
    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: { mode, ...paletteTokens },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: (themeParam) => ({
                            html: { margin: 0, padding: 0 },
                            body: {
                                margin: 0,
                                padding: 0,
                                minHeight: "100%",
                                backgroundColor: themeParam.palette.background.default,
                                color: themeParam.palette.text.primary,
                                transition: "background-color .2s ease, color .2s ease",
                                backgroundImage: "none",
                            },
                            "#app": {
                                margin: 0,
                                padding: 0,
                                minHeight: "100%",
                            },
                            body: {
                                backgroundColor: themeParam.palette.background.default,
                                color: themeParam.palette.text.primary,
                                transition: "background-color .2s ease, color .2s ease",
                                backgroundImage: "none",
                            },
                        }),
                    },
                },
            }),
        [mode]
    );

    useEffect(() => {
        import("navigationBarApp/App")
            .then(() => setIsNavigationBarLoaded(true))
            .catch((err) => console.error("Failed to load navigation bar:", err));
    }, []);

    function AppRoutes() {
        const pathname = useBrowserPathname();

        useEffect(() => {
            // GTM 페이지뷰 추적
            try {
                (window as any).dataLayer = (window as any).dataLayer || [];
                (window as any).dataLayer.push({
                    event: "page_view",
                    event_category: "system",
                    event_action: "page_view",
                    page_path: pathname,
                    page_title: document.title,
                    page_section: "main-container",
                    login_status: localStorage.getItem("isLoggedIn") === "true" ? "logged_in" : "guest",
                });
            } catch (e) {
                console.warn("[GTM]", e);
            }
        }, [pathname]);

        // 네비게이션바 숨길 경로
        const hiddenLayouts = [
            "/admin",
            "/vue-account/account/login",
            "/vue-account/account/privacy",
            "/vue-account/account/admin",
            "/vue-account/account/admin-auth",
            "/vue-ai-interview/ai-interview/select",
            "/vue-ai-interview/ai-interview/result",
            "/vue-ai-interview/ai-interview/form/",
            "/vue-ai-interview/ai-interview/detail/",
            "/vue-ai-interview/ai-interview/end",
            "/vue-ai-interview/ai-test",
            "/vue-ai-interview/ai-interview/personality-form",
            "/vue-ai-interview/ai-interview/personality-result",
            "/vue-ai-interview/ai-interview/personality",
        ];

        const hiddenLayoutsFooters = [
            "/admin",
            "/mypage/",
            "/mypage",
            "/vue-account/account/login",
            "/vue-account/account/privacy",
            "/vue-account/account/admin",
            "/vue-account/account/admin-auth",
            "/vue-ai-interview/ai-interview/select",
            "/vue-ai-interview/ai-interview/result",
            "/vue-ai-interview/ai-interview/form/",
            "/vue-ai-interview/ai-interview/detail/",
            "/vue-ai-interview/ai-interview/end",
            "/vue-ai-interview/ai-test",
            "/vue-ai-interview/ai-interview/personality-form",
            "/vue-ai-interview/ai-interview/personality-result",
            "/vue-ai-interview/ai-interview/personality",
        ];
        const hideLayout = hiddenLayouts.some((path) =>
            pathname.startsWith(path)
        );

        const hideLayoutFooter = hiddenLayoutsFooters.some((path) =>
            pathname.startsWith(path)
        );

        const shouldHideNavbar = hideLayout;
        const shouldShowFooter = !hideLayoutFooter;

        const noindexPrefixes = [
            "/admin",
            "/vue-account",
            "/vue-ai-interview",
            "/mypage",
            "/sveltekit-review",
        ];
        const noindex = noindexPrefixes.some((p) =>
            pathname.startsWith(p)
        );

        return (
            <Suspense fallback={<CircularProgress />}>
                {/* robots 메타 */}
                {noindex && (
                    <Helmet>
                        <meta name="robots" content="noindex, nofollow" />
                    </Helmet>
                )}

                {!shouldHideNavbar && <NavigationBarApp />}
                <MobileServiceGuard>
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/review-survey" element={<ReviewSurveyPage />} />
                        <Route path="/event" element={<NewEventPage />} />
                        <Route path="/event/:id" element={<NewEventDetailPage />} />
                        <Route path="/event/winner/:id" element={<NewWinnerDetailPage />} />
                        <Route
                            path="/vue-account/*"
                            element={<VueAccountAppWrapper eventBus={eventBus} />}
                        />
                        <Route path="/learning/*" element={<PtnWordApp />} />
                        <Route
                            path="/vue-ai-interview/*"
                            element={
                                <RequireToken loginPath="/vue-account/account/login" fallback={<Main />}>
                                    <VueAiInterviewAppWrapper eventBus={eventBus} />
                                </RequireToken>
                            }
                        />
                        <Route
                            path="/mypage/*"
                            element={
                                <RequireToken loginPath="/vue-account/account/login" fallback={<Main />}>
                                    <MyPageApp />
                                </RequireToken>
                            }
                        />
                        <Route
                            path="/sveltekit-review/*"
                            element={<SvelteKitReviewAppWrapper />}
                        />
                    </Routes>
                </MobileServiceGuard>

                {shouldShowFooter && <Footer />}
            </Suspense>
        );
    }

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <GlobalStyles
                styles={(theme) => ({
                    ":root": {
                        "--host-bg": theme.palette.background.default,
                        "--host-fg": theme.palette.text.primary,
                    },
                })}
            />
            <ThemeSync />

            <BrowserRouter>
                <ScrollToTop />
                <AppRoutes />
            </BrowserRouter>

            <ThemeToggleButton />
        </ThemeProvider>
    );
}

const App = () => (
    <RecoilRoot>
        <HelmetProvider>
            <InnerApp />
        </HelmetProvider>
    </RecoilRoot>
);

export default App;

const container = document.getElementById("app") as HTMLElement;
if (!container) throw new Error("Root container #app not found");
const root = ReactDOM.createRoot(container);
root.render(<App />);

