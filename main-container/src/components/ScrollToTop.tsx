import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 라우트 변경 시 + 같은 경로로 다시 이동 클릭 시
 * 항상 스크롤을 최상단으로 리셋.
 */
export default function ScrollToTop() {
    const { pathname, search, hash } = useLocation();

    // 뒤로가기/앞으로가기 때 브라우저의 자동 스크롤 복원 방지
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            const prev = window.history.scrollRestoration;
            window.history.scrollRestoration = "manual";
            return () => {
                window.history.scrollRestoration = prev;
            };
        }
    }, []);

    // ① 라우트 변경 시 스크롤 리셋 (해시 이동은 기본 동작 유지)
    useEffect(() => {
        if (hash) return; // #anchor는 기본 스크롤 유지
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname, search, hash]);

    // ② 같은 경로 <a> 클릭 시도에도 스크롤 리셋
    useEffect(() => {
        const onClickCapture = (e: MouseEvent) => {
            // 기본 취소/우클릭/수정키 클릭은 무시
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            // 가장 가까운 a[href] 탐색 (React Router의 <Link>도 실제로 <a>로 렌더)
            const target = e.target as Element | null;
            const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!anchor) return;

            const url = new URL(anchor.href, window.location.href);
            const cur = window.location;

            // 다른 오리진 링크는 무시
            if (url.origin !== cur.origin) return;

            const samePath = url.pathname === cur.pathname;
            const sameSearch = url.search === cur.search;

            // 해시(#)가 붙은 same-page 앵커는 브라우저 기본 스크롤 동작 유지
            if (url.hash) return;

            // 경로·쿼리가 모두 동일한 링크를 클릭한 경우 → React Router가 네비게이션을 ‘무시’할 수 있음
            // 그 때도 스크롤을 강제로 맨 위로 올린다.
            if (samePath && sameSearch) {
                // React Router 내부 처리보다 한 틱 뒤에 실행 (네비게이션 있으면 그 후에, 없으면 그대로 실행)
                setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                }, 0);
            }
        };

        // 캡처 단계에서 가로채 동일 경로 클릭도 처리
        document.addEventListener("click", onClickCapture, true);
        return () => document.removeEventListener("click", onClickCapture, true);
    }, []);

    return null;
}
