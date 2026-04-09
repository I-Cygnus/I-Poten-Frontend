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
}: {
    children: JSX.Element;
    loginPath?: string;
    fallback?: React.ReactNode;
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
        
        const returnUrl =
            (location.pathname ?? "/") +
            (location.search ?? "") +
            (location.hash ?? "");

        // Redirect to home with loginRequired state
        // This will be caught by NavigationBarApp to show the modal on the / page
        navigate("/", {
            replace: true,
            state: { loginRequired: true, returnUrl },
        });
    }, [location, navigate]);

    if (allowed === true) return children;
    return null;
}
