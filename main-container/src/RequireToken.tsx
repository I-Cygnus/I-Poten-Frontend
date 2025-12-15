import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function hasToken() {
    try { return !!localStorage.getItem("isLoggedIn"); } catch { return false; }
}

export default function RequireToken({
    children,
    loginPath = "/vue-account/account/login",
}: {
    children: JSX.Element;
    loginPath?: string;
}) {
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (hasToken()) {
            setAllowed(true);
            return;
        }
        // 알럿 후 로그인으로
        setAllowed(false);

        // 추가 : 현재 위치를 정확히 복원하기 위해 hash(#...)까지 포함
        const returnUrl = (location.pathname ?? "/") + (location.search ?? "") + (location.hash ?? "");

        // 추가 : loginPath에 안전하게 returnUrl 쿼리 부착(이미 ? 가 있으면 & 사용)
        const loginUrl =
            `${loginPath}${loginPath.includes("?") ? "&" : "?"}returnUrl=${encodeURIComponent(returnUrl)}`;

        setTimeout(() => {
            alert("로그인 후 이용할 수 있습니다. 로그인 페이지로 이동합니다.");
            // 로그인 완료 후 돌아올 수 있게 from 전달(옵션)
            // 변경: state.from에도 hash까지 포함된 현재 URL을 그대로 담아 전달
            navigate(`${loginPath}`, {
                replace: true,
                state: { from: returnUrl },
            });
        }, 0);
    // 변경 : 의존성은 기존 유지. location 객체 하나만 보고도 위 로직이 정상 동작함.
    }, [location, navigate, loginPath]);

    if (allowed === null) return null; // 초기 체크 순간엔 렌더 안함(깜빡임 방지)
    if (allowed === false) return null; // 알럿 후 네비게이션 예정

    return children;
}
