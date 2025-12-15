// adminGuards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { verifyAdminOnServer, validateTempTokenOnServer } from "@/administrator/utility/adminApi.ts";
// 위에 /admin-auth/temp/verify 같은 얇은 엔드포인트 하나 추가 구현 필요.

function isPublicRoute(to: RouteLocationNormalized): boolean {
    const PUBLIC_NAMES = new Set(["VueAccountLogin","AdminAuthCode","AdminAuthSocialLogin"]);
    const PUBLIC_PREFIXES = ["/kakao_oauth/","/google-oauth/","/github-oauth/","/guest-oauth/","/naver-oauth/"];
    const byName = to.name && PUBLIC_NAMES.has(String(to.name));
    const byPath = PUBLIC_PREFIXES.some((p)=> String(to.path).startsWith(p));
    const inAuthSection = to.matched.some((r)=> r.meta?.section==="ADMIN_AUTH");
    return Boolean(byName || byPath || inAuthSection);
}

function isTempRequiredRoute(to: RouteLocationNormalized): boolean {
    return to.matched.some((r) => r.meta?.requiresTempAdmin === true);
}
function isAdminRoute(to: RouteLocationNormalized): boolean {
    return to.matched.some((r) => r.meta?.requiresAdmin === true);
}

export async function adminBeforeEach(to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
    if (isPublicRoute(to)) return next();

    // A) 소셜 로그인 화면 보호: 서버에 임시토큰 존재 여부 확인
    if (isTempRequiredRoute(to)) {
        try {
            const ok = await validateTempTokenOnServer(); // 200/true면 임시 토큰 보유
            if (ok) return next();
        } catch {}
        alert("관리자 코드 입력이 필요합니다.");
        return next({ name: "AdminAuthCode", query: { reason: "code_required" } });
    }

    // B) 관리자 앱 보호: 서버에 최종 권한 확인
    if (isAdminRoute(to)) {
        try {
            const ok = await verifyAdminOnServer(); // 200/true면 관리자 권한
            if (ok) return next();
        } catch {}
        alert("권한 검증에 실패했습니다. 다시 로그인해주세요.");
        return next({ name: "VueAccountLogin", query: { reason: "admin_verify_failed" } });
    }

    return next();
}
