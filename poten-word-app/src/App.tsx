import React, { useLayoutEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  Outlet,
  useSearchParams, Navigate,
} from "react-router-dom";

import PotenWordLayout from "./layouts/PotenWordLayout.tsx";
import PotenNoteModal from "./components/note/PotenNoteModal.tsx";
import http from "./utils/http";
import { fetchUserFolders, patchReorderFolders } from "./api/wordbook";
import WordbookPage from "./pages/note/WordbookPage.tsx";

import QuizHomePage from "./pages/quiz/QuizHomePage.tsx";
import QuizPlayPage from "./pages/quiz/regular/QuizPlayPage.tsx";
import PotenNoteHomePage from "./pages/note/PotenNoteHomePage.tsx";
import { PotenDialogProvider } from "./components/common/PotenDialog.tsx";

import { PageContainerFlushTop } from "./styles/layout";
import { goToAccountLogin } from "./utils/auth";
import { GlobalFonts } from "./styles/GlobalFonts";
import QuizResultRoute from "./routes/QuizResultRoute";
import BookLandingPage from "./pages/book/BookLandingPage.tsx";
import QuizTimelinePage from "./pages/quiz/QuizTimelinePage.tsx";
import SearchPage from "./pages/word/SearchPage.tsx";
import TermListPage from "./pages/word/TermListPage.tsx";
import PotenWordLandingPage from "./pages/word/PotenWordLandingPage.tsx";
import QuizReviewPage from "./pages/quiz/regular/QuizReviewPage.tsx";

// notes 전용 로그인 가드(필요하면 라우트에 연결해서 사용)
function NotesGuard() {
  const location = useLocation();
  const loggedIn = !!localStorage.getItem("isLoggedIn");

  React.useEffect(() => {
    if (!loggedIn) {
      goToAccountLogin(location.pathname + location.search);
    }
  }, [loggedIn, location.pathname, location.search]);

  if (!loggedIn) {
    return <div style={{ padding: 24 }}>로그인 페이지로 이동 중…</div>;
  }
  return <WordbookPage />;
}

/* == 유틸 == */
function extractTermIdFromArticle(el: HTMLElement | null): number | null {
  const article = el?.closest("article");
  if (!article) return null;
  const labelled = article.getAttribute("aria-labelledby");
  if (!labelled) return null;
  const m = /^term-(\d+)$/.exec(labelled);
  if (!m) return null;
  const idNum = Number(m[1]);
  return Number.isFinite(idNum) ? idNum : null;
}

function normalizeName(s: string) {
  return (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

/* == 라우트 미매칭 fallback == */
function AutoContent() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const tag = params.get("tag") ?? "";
  const hasFilter = !!(
      params.get("initial") ||
      params.get("alpha") ||
      params.get("symbol")
  );
  if (tag) return <TermListPage />;
  if (q || hasFilter) return <SearchPage />;
  console.debug("[AutoContent] fallback rendered (no search/filter).");
  return null;
}

/* == 서버 로그인 호환 라우트 == */
function RedirectToAccountLogin() {
  const location = useLocation();
  React.useEffect(() => {
    const backTo = location.pathname + location.search;
    goToAccountLogin(backTo);
  }, [location.pathname, location.search]);
  return <div style={{ padding: 24 }}>로그인 페이지로 이동 중…</div>;
}

/* == 공통 레이아웃 (히어로/검색 없음) == */
function AppLayout() {
  const location = useLocation();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTermId, setSelectedTermId] = React.useState<number | null>(null);
  const [notebooks, setNotebooks] = React.useState<{ id: string; name: string }[]>(
      []
  );

  const handleReorder = React.useCallback(async (orderedIds: string[]) => {
    let serverOk = true;
    try {
      await patchReorderFolders(orderedIds as unknown as Array<string | number>);
    } catch (e: any) {
      serverOk = false;
      if (e?.message === "NON_NUMERIC_ID") {
        console.warn("[reorder] 서버 저장 생략: 숫자 id가 아님", orderedIds);
      } else {
        console.error("[reorder] 서버 오류:", e);
        return;
      }
    }

    setNotebooks((prev) => {
      const map = new Map(prev.map((n) => [n.id, n]));
      const next = orderedIds.map((id) => map.get(id)).filter(Boolean) as typeof prev;
      const leftovers = prev.filter((n) => !orderedIds.includes(n.id));
      return [...next, ...leftovers];
    });

    if (serverOk) console.debug("[reorder] 서버 저장 완료", orderedIds);
  }, []);

  React.useEffect(() => {
    if (!modalOpen) return;
    if (notebooks.length > 0) return;

    let aborted = false;
    (async () => {
      try {
        const list = await fetchUserFolders();
        if (!aborted) setNotebooks(list);
      } catch (e) {
        console.warn("[folders] 목록 조회 실패", e);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [modalOpen, notebooks.length]);

  const closeModal = React.useCallback(() => {
    setModalOpen(false);
    setSelectedTermId(null);
  }, []);

  const handleCreateNotebook = React.useCallback(
      async (name: string) => {
        const raw = name;
        const normalized = normalizeName(raw);
        if (!normalized) throw new Error("EMPTY_NAME");
        const localDup = notebooks.some((n) => normalizeName(n.name) === normalized);
        if (localDup) throw new Error("DUPLICATE_LOCAL");

        try {
          const { data } = await http.post("/me/folders", { wordbookName: raw });
          const newId: string = String(data.id);
          const newName: string = data.wordbookName ?? raw;
          setNotebooks((prev) => [{ id: newId, name: newName }, ...prev]);
          console.debug("[createFolder] created id/name =", newId, newName);
          return newId;
        } catch (err: any) {
          const status = err?.response?.status;
          const msg: string | undefined = err?.response?.data?.message;
          if (status === 409 || msg?.includes("이미 존재"))
            throw new Error("DUPLICATE_SERVER");
          if (status === 400 || msg?.includes("폴더명") || msg?.includes("입력"))
            throw new Error("EMPTY_NAME");
          throw err;
        }
      },
      [notebooks]
  );

  const handleSaveToNotebook = React.useCallback(
      async (notebookId: string) => {
        if (!selectedTermId) return;
        try {
          await http.post(`/me/folders/${notebookId}/terms`, { termId: selectedTermId });
          console.debug("[attach] term", selectedTermId, "-> folder", notebookId, "OK");
          closeModal();
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 401) {
            closeModal();
            goToAccountLogin(location.pathname + location.search);
          } else {
            console.error("[attach] 폴더에 용어 추가 실패:", err);
          }
        }
      },
      [selectedTermId, closeModal, location.pathname, location.search]
  );

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const addBtn = target.closest(
          'button[aria-label="내 포텐노트에 추가"]'
      ) as HTMLElement | null;
      if (!addBtn) return;
      if (modalOpen) return;

      const loggedIn = !!localStorage.getItem("isLoggedIn");
      if (!loggedIn) return;

      const termId = extractTermIdFromArticle(addBtn);
      if (!termId) return;

      setSelectedTermId(termId);
      setModalOpen(true);
    }

    document.addEventListener("click", onDocClick, false);
    return () => document.removeEventListener("click", onDocClick, false);
  }, [modalOpen]);

  // 헤더 기준 shell inset (전체 앱 공통)
  useLayoutEffect(() => {
    const setShellInsets = () => {
      const brand = document.querySelector(
          'header a[aria-label="i-Poten 홈"]'
      ) as HTMLElement | null;
      const inner = brand?.closest("div") as HTMLElement | null;
      if (!inner) return;

      const rect = inner.getBoundingClientRect();
      const cs = getComputedStyle(inner);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;

      const left = Math.max(0, Math.round(rect.left + padL));
      const right = Math.max(0, Math.round(window.innerWidth - rect.right + padR));

      document.documentElement.style.setProperty("--shell-left", `${left}px`);
      document.documentElement.style.setProperty("--shell-right", `${right}px`);
    };

    setShellInsets();
    window.addEventListener("resize", setShellInsets);
    return () => window.removeEventListener("resize", setShellInsets);
  }, []);

  return (
      <PageContainerFlushTop>
        <Outlet />
        {/* PotenNoteModal 필요하면 여기서 다시 켜기 */}
      </PageContainerFlushTop>
  );
}

/* == 홈(빈 본문 허용) == */
function HomePage() {
  return null;
}

/* == 라우트 구성 == */
export default function App() {
  return (
      <>
        <GlobalFonts />
        <PotenDialogProvider>
          <Routes>
            {/* 공통 레이아웃 */}
            <Route element={<AppLayout />}>
              {/* 호스트가 /poten-word/* 에 마운트한다고 가정 */}
              <Route path="/*" element={<PotenWordLayout />}>
                {/* /poten-word → 메인 랜딩 페이지 */}
                <Route index element={<PotenWordLandingPage />} />

                {/* /poten-word/terms → 용어 리스트 */}
                <Route path="terms" element={<TermListPage />} />

                <Route path="notes" element={<PotenNoteHomePage />} />
                <Route path="search" element={<SearchPage />} />

                {/* 퀴즈 경로 */}
                <Route path="quiz">
                  <Route index element={<QuizHomePage />} />

                  {/* 일반 세트 플레이 */}
                  <Route path="play" element={<QuizPlayPage />} />
                  <Route path="play/review" element={<Navigate to="../quiz" replace />} />
                  <Route path="review/:sessionId" element={<QuizReviewPage />} />
                  <Route path="play/result/:sessionId" element={<QuizReviewPage />} />

                  {/* 세트/세션 결과 */}
                  <Route path="result" element={<Navigate to="timeline" replace />} />
                  <Route path="result/:sessionId" element={<QuizResultRoute />} />

                  {/* 타임라인 대시보드 */}
                  <Route path="timeline" element={<QuizTimelinePage />} />
                </Route>

                <Route path="book" element={<BookLandingPage />} />
                <Route path="folders/:wordbookId" element={<WordbookPage />} />
              </Route>

              {/* 기타 경로들 */}
              <Route path="login" element={<RedirectToAccountLogin />} />
              <Route path="*" element={<AutoContent />} />
            </Route>
          </Routes>
        </PotenDialogProvider>
      </>
  );
}
