import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function hasLogin() {
    try {
        return !!localStorage.getItem("isLoggedIn");
    } catch {
        return false;
    }
}

export default function RequireLogin({
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
        if (hasLogin()) {
            setAllowed(true);
            return;
        }

        setAllowed(false);

        // 현재 위치 (pathname + search + hash) 복원
        const returnUrl =
            (location.pathname ?? "/") +
            (location.search ?? "") +
            (location.hash ?? "");

        // 로그인 페이지 URL 만들기
        const loginUrl = `${loginPath}${
            loginPath.includes("?") ? "&" : "?"
        }returnUrl=${encodeURIComponent(returnUrl)}`;

        setTimeout(() => {
            alert("로그인 후 이용할 수 있습니다. 로그인 페이지로 이동합니다.");
            navigate(loginUrl, {
                replace: true,
                state: { from: returnUrl },
            });
        }, 0);
    }, [location, navigate, loginPath]);

    if (allowed === null) return null; // 체크 중
    if (allowed === false) return null; // 로그인 리다이렉트 예정

    return children;
}
