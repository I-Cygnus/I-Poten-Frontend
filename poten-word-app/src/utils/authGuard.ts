/**
 * @file authGuard.ts
 * @description
 *  - **로그인 보장 유틸리티**.
 *  - 로그인 여부를 추론하고, 비로그인일 때
 *      1) 알림(alert) 또는 확인(confirm)으로 안내 후
 *      2) 로그인 페이지로 리다이렉트합니다(복귀 URL 포함).
 *  - 다양한 환경(레거시 토큰, 로컬스토리지 플래그, React Router navigate)을 지원합니다.
 *
 * 핵심 시그니처
 *  - `ensureAuthOrAlertRedirect(message?, loginBase?, options?) => boolean`
 *    - `true`  : 로그인 상태 → **원동작 진행**
 *    - `false` : 비로그인 → 안내/리다이렉트 수행(또는 취소) 후 **원동작 중단**
 *
 * 사용 패턴
 *  ```ts
 *  if (!ensureAuthOrAlertRedirect()) return; // 여기서 중단
 *  // 로그인된 경우에만 이어서 실행
 *  ```
 *
 * 커스터마이즈 포인트
 *  - `loginBase`            : 로그인 페이지 베이스 경로(기본 `/login`)
 *  - `returnParamKey`       : 복귀 URL 쿼리 키 이름(기본 `returnUrl`)
 *  - `promptType`/`silent`  : 안내 방식(알림/확인/무음)
 *  - `navigate`             : React Router로 이동하고 싶을 때
 *  - `flagKey`/`tokenKeys`  : 로그인 여부 추론 전략
 *
 * SSR 주의
 *  - 기본 `getCurrentUrl`은 `window`에 의존합니다. SSR에선 `getCurrentUrl`을 옵션으로 주입하세요.
 */

export const AUTH_ALERT_MSG = "로그인을 하신 후 이용해 주시기 바랍니다.";
export const DEFAULT_LOGIN_BASE = "/login";

/** 다중 호출 시 중복 팝업/다중 리다이렉트를 방지하기 위한 내부 플래그 */
let _authGuardBusy = false;

/**
 * 가드 동작을 제어하는 옵션들
 */
export type AuthGuardOptions = {
    /**
     * 상위에서 로그인 여부를 이미 알고 있을 때 직접 전달.
     * - true  : 바로 통과(리다이렉트 없음)
     * - false : 비로그인 처리(아래 로직 진행)
     * - 미지정: 로컬 정책(flagKey/tokenKeys)으로 추론
     */
    isLoggedIn?: boolean;

    /**
     * React Router의 navigate 주입.
     * - 주입 시 SPA 네비게이션으로 이동
     * - 미주입 시 window.location.href 사용
     */
    navigate?: (to: any, opts?: { replace?: boolean }) => void;

    /**
     * 현재 URL 제공자(기본: window.location.* 합성).
     * - SSR/특수 환경에서 현재 경로 수집이 필요할 때 오버라이드
     */
    getCurrentUrl?: () => string;

    /**
     * (레거시) 토큰 존재로 로그인 상태를 추론할 때 검색할 키 목록.
     *  - localStorage 또는 sessionStorage에 하나라도 존재하면 '로그인'으로 간주
     */
    tokenKeys?: string[];

    /**
     * 새 정책: 로컬스토리지 플래그 키가 존재하면 로그인으로 간주.
     * @default "isLoggedIn"
     */
    flagKey?: string;

    /**
     * 안내 방식
     *  - "alert"  : 확인 버튼만 있는 알림 → OK 후 이동
     *  - "confirm": 확인/취소 → 확인 시 이동, 취소 시 그대로 유지
     * @default "alert"
     */
    promptType?: "alert" | "confirm";

    /** navigate 사용 시 replace 네비게이션으로 이동할지 여부 */
    useReplace?: boolean;

    /** 로그인 페이지 베이스 경로 (예: "/vue-account/login", "/login") */
    loginBase?: string;

    /** 복귀 URL을 담을 쿼리 파라미터 이름 (예: "returnUrl", "redirect") @default "returnUrl" */
    returnParamKey?: string;

    /** true면 alert/confirm 없이 바로 이동(무음) @default false */
    silent?: boolean;

    onRequireAuth?: (payload: {
        message: string;
        loginUrl: string;
    }) => void;
};

/**
 * 로그인 여부를 보장하거나, 아니라면 안내 후 로그인 페이지로 리다이렉트한다.
 *
 * @param message    - 알림/확인창에 표시할 메시지(silent=true면 무시)
 * @param loginBase  - 로그인 페이지 베이스 경로(기본값: `/login`)
 * @param options    - 가드 동작 커스터마이즈 옵션들
 * @returns
 *  - `true`  : 로그인 상태이므로 **원동작 진행**
 *  - `false` : 비로그인 흐름으로 **원동작 중단**(리다이렉트되거나, confirm에서 취소됨)
 */
export function ensureAuthOrAlertRedirect(
    message: string = AUTH_ALERT_MSG,
    loginBase: string = DEFAULT_LOGIN_BASE,
    options?: AuthGuardOptions
): boolean {
    // 1) 로그인 여부 추론
    // 1-1) 상위에서 명시 전달이 있으면 최우선
    if (typeof options?.isLoggedIn === "boolean") {
        if (options.isLoggedIn) return true;
    } else {
        // 1-2) 새 정책: flagKey 존재 여부로 판단 (기본 "isLoggedIn")
        const flagKey = options?.flagKey ?? "isLoggedIn";
        const hasFlag =
            typeof window !== "undefined" &&
            !!window.localStorage?.getItem(flagKey);
        if (hasFlag) return true;

        // 1-3) 레거시 백업 경로: tokenKeys 중 하나라도 있으면 로그인으로 간주
        const legacyKeys = options?.tokenKeys; // 명시 전달시에만 사용
        if (legacyKeys?.length) {
            const legacyHit =
                typeof window !== "undefined" &&
                legacyKeys.some(
                    (k) =>
                        !!window.localStorage?.getItem(k) ||
                        !!window.sessionStorage?.getItem(k)
                );
            if (legacyHit) return true;
        }
    }

    // 2) 중복 방지: 이미 진행 중이면 두 번째 호출은 무시
    if (_authGuardBusy) return false;
    _authGuardBusy = true;

    try {
        // 3) 안내/확인 또는 무음 처리
        const getCurrentUrl =
            options?.getCurrentUrl ??
            (() =>
                (typeof window !== "undefined"
                    ? window.location.pathname +
                    window.location.search +
                    window.location.hash
                    : "/") || "/");

        const base = options?.loginBase ?? loginBase;
        const param = options?.returnParamKey ?? "returnUrl";
        const dest  = `${base}?${encodeURIComponent(param)}=${encodeURIComponent(getCurrentUrl())}`;

        // 커스텀 UI(SystemMessageModal 등)를 쓰는 경우 브라우저 alert/confirm 대신 위임
        if (options?.onRequireAuth) {
            options.onRequireAuth({
                message,
                loginUrl: dest,
            });
            return false;
        }

        const promptType = options?.promptType ?? "alert";
        let proceed = options?.silent
            ? true
            : (promptType === "confirm"
                ? confirm(message) // 확인:true / 취소:false
                : (alert(message), true)); // alert 후 진행

        // 취소한 경우: 원동작 중단, 현재 페이지 유지
        if (!proceed) return false;

        // 4) 리다이렉트 대상 URL 구성
        // onRequireAuth가 없는 기존 호출부는 아래 이동 로직을 그대로 사용

        // 5) 이동
        if (options?.navigate) {
            options.navigate(dest, { replace: options?.useReplace });
        } else if (typeof window !== "undefined") {
            window.location.href = dest;
        }
    } finally {
        // 6) 짧은 딜레이 후 바쁨 플래그 해제(중복 클릭 완화)
        setTimeout(() => {
            _authGuardBusy = false;
        }, 500);
    }

    // 비로그인 흐름에서는 항상 원동작 중단
    return false;
}
