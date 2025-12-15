import { ensureAuthOrAlertRedirect } from "./authGuard.ts";

/**
 * @file auth.ts
 * @description
 *  - 계정(뷰) 로그인 페이지로 **즉시 리다이렉트**하는 얇은 래퍼.
 *  - 내부적으로 `ensureAuthOrAlertRedirect`를 사용하지만,
 *    - 로그인 여부를 **검사하지 않고**(isLoggedIn: false),
 *    - **알림/확인 없이**(silent: true) 곧장 이동합니다.
 *  - 리다이렉트 시 현재 URL(또는 전달받은 경로)을 `redirect` 쿼리 파라미터로 전달합니다.
 *
 * 사용 예)
 *  - 단순 이동: `goToAccountLogin()`
 *  - 특정 복귀 지점 지정: `goToAccountLogin("/poten-word/folders/1?page=2")`
 *
 * 주의
 *  - 이 함수는 **항상 리다이렉트**를 시도합니다. 로그인 체크가 필요하면 `ensureAuthOrAlertRedirect`를 직접 사용하세요.
 *  - SSR 컨텍스트에선 `window` 접근이 불가하므로, 서버 사이드에선 호출하지 않거나 `redirectTo`를 명시적으로 넘겨주세요.
 */

/** 계정(뷰) 로그인 베이스 경로 (리다이렉트 대상) */
export const ACCOUNT_LOGIN = "/vue-account/login";

/**
 * 계정(뷰) 로그인 페이지로 즉시 리다이렉트합니다.
 *
 * @param redirectTo - 리다이렉트 후 복귀할 경로. 미지정 시 현재 location(pathname+search+hash).
 * @returns 항상 `false` (가드 시그니처를 맞추기 위한 반환값으로, 흐름 제어용입니다)
 */
export function goToAccountLogin(redirectTo?: string) {
    return ensureAuthOrAlertRedirect(
        "", // 메시지 없음(무음 이동)
        ACCOUNT_LOGIN,
        {
            isLoggedIn: false,          // 로그인이라 가정하지 않음(=항상 이동)
            silent: true,               // alert/confirm 없이 즉시 이동
            returnParamKey: "redirect", // 쿼리 키 이름을 'redirect'로 통일
            getCurrentUrl: () =>
                redirectTo ??
                (window.location.pathname + window.location.search + window.location.hash),
        }
    );
}
