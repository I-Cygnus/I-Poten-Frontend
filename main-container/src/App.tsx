// src/App.tsx
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";

import { CircularProgress, CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { RecoilRoot, useRecoilValue } from "recoil";
import { Helmet, HelmetProvider } from "react-helmet-async";

import mitt from "mitt";

import Main from "./components/Main.tsx";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import VueAccountAppWrapper from "./VueAccountWrapper.tsx";
import VueAiInterviewAppWrapper from "./VueAiInterviewWrapper.tsx";
import SvelteKitReviewAppWrapper from "./SvelteKitReviewWrapper.tsx";
import RequireToken from "./RequireToken";
import ThemeSync from "./ThemeSync";
import ThemeToggleButton from "./ThemeToggleButton";
import { themeAtom } from "@jobspoon/app-state";
import Logo from "./assets/img_1.png";
import RequireLogin from "./RequireLogin.tsx";

const eventBus = mitt();

function goHome() {
  window.location.href = "/";
}

const NavigationBarApp = lazy(() => import("navigationBarApp/App"));
const StudyRoomApp = lazy(() => import("studyRoomApp/App"));
const MyPageApp = lazy(() => import("myPageApp/App"));
const PotenWordApp = lazy(() => import("potenWordApp/App"));

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
              "html, body, #app": { height: "100%" },
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
    const location = useLocation();

    // 네비게이션바 숨길 경로
    const hiddenLayouts = [
      "/vue-account/account/login",
      "/vue-ai-interview/ai-interview/select",
      "/vue-ai-interview/ai-interview/result",
      "/vue-ai-interview/ai-interview/form/",
      "/vue-ai-interview/ai-test/",
    ];

      const hiddenLayoutsFooters = [
          "/mypage/",
          "/mypage",
          "/vue-account/account/login",
          "/vue-ai-interview/ai-interview/select",
          "/vue-ai-interview/ai-interview/result",
          "/vue-ai-interview/ai-interview/form/",
          "/vue-ai-interview/ai-test/",
      ];
    const hideLayout = hiddenLayouts.some((path) =>
      location.pathname.startsWith(path)
    );

      const hideLayoutFooter = hiddenLayoutsFooters.some((path) =>
          location.pathname.startsWith(path)
      );

      const hiddenLayoutsLogo = [
          "/vue-ai-interview/ai-interview/select",
          "/vue-ai-interview/ai-interview/form/",
          "/vue-ai-interview/ai-interview/result",
          "/vue-ai-interview/ai-test/",
      ];
      const hiddenLayoutLogo = hiddenLayoutsLogo.some((path) =>
          location.pathname.startsWith(path)
      );

    // 🔒 SPA 하위 경로는 noindex (정적 랜딩은 인덱싱 허용)
    // - '/studies' (정적 랜딩) → index 허용
    // - '/studies/...'(리모트 SPA) → noindex
    // - '/spoon-word'도 동일 정책
    const noindexPrefixes = [
      "/vue-account",
      "/vue-ai-interview",
      "/mypage",
      "/sveltekit-review",
      "/studies/", // 슬래시 포함 → 정확히 하위만 매칭
      "/poten-word/",
    ];
    const noindex = noindexPrefixes.some((p) =>
      location.pathname.startsWith(p)
    );

    return (
      <Suspense fallback={<CircularProgress />}>
        {/* robots 메타 */}
        {noindex && (
          <Helmet>
            <meta name="robots" content="noindex, nofollow" />
          </Helmet>
        )}

        {!hideLayout && <NavigationBarApp />}
        {hiddenLayoutLogo && (
          <div className="fixed top-0 left-0 p-10 z-50">
            <img
              src={Logo}
              alt="Logo"
              style={{ width: 180, height: 70, objectFit: "contain", marginLeft:"70px", marginTop:"10px" }}
              onClick={goHome}
            />
          </div>
        )}

        <Routes>
          <Route path="/" element={<Main />} />
          <Route
            path="/vue-account/*"
            element={<VueAccountAppWrapper eventBus={eventBus} />}
          />
          <Route path="/studies/*" element={<StudyRoomApp />} />
          <Route path="/poten-word/*" element={<PotenWordApp />} />
          <Route
            path="/vue-ai-interview/*"
            element={
              <RequireToken loginPath="/vue-account/account/login">
                <VueAiInterviewAppWrapper eventBus={eventBus} />
              </RequireToken>
            }
          />
          <Route path="/mypage/*" element={
              <RequireLogin loginPath="/vue-account/account/login">
                <MyPageApp />
              </RequireLogin>}/>
          <Route
            path="/sveltekit-review/*"
            element={<SvelteKitReviewAppWrapper />}
          />
        </Routes>

        {!hideLayoutFooter && <Footer />}
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
