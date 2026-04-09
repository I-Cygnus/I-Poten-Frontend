// packages/analytics/src/gtm.ts
// GTM DataLayer 유틸리티 — 전체 앱 공유

type LoginStatus = "logged_in" | "guest";

interface GtmEventPayload {
  event: string;
  event_category: string;
  event_action: string;
  event_label?: string;
  page_path?: string;
  page_title?: string;
  page_section?: string;
  login_status?: LoginStatus;
  user_id_hash?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function getLoginStatus(): LoginStatus {
  try {
    return localStorage.getItem("isLoggedIn") === "true" ? "logged_in" : "guest";
  } catch {
    return "guest";
  }
}

function getUserIdHash(): string | undefined {
  try {
    const raw = localStorage.getItem("userId");
    if (!raw) return undefined;
    // 간단한 해시 (프라이버시 보호)
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return "u_" + Math.abs(hash).toString(36);
  } catch {
    return undefined;
  }
}

/**
 * GTM dataLayer에 이벤트를 푸시합니다.
 * try/catch로 감싸서 GTM 에러가 서비스 동작에 영향을 주지 않습니다.
 */
export function pushGtmEvent(payload: GtmEventPayload): void {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      ...payload,
      login_status: payload.login_status ?? getLoginStatus(),
      user_id_hash: payload.user_id_hash ?? getUserIdHash(),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    if (typeof console !== "undefined") {
      console.warn("[GTM] pushGtmEvent failed:", e);
    }
  }
}

/**
 * 페이지뷰 이벤트 전용 헬퍼
 */
export function pushPageView(pageSection: string, pagePath?: string, pageTitle?: string): void {
  pushGtmEvent({
    event: "page_view",
    event_category: "system",
    event_action: "page_view",
    page_path: pagePath ?? window.location.pathname,
    page_title: pageTitle ?? document.title,
    page_section: pageSection,
  });
}
