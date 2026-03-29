import type { NavigateFunction } from "react-router-dom";
import { clearAuthStorage } from "./authStorage.ts";

export function completeWithdrawal(navigate: NavigateFunction) {
    clearAuthStorage();
    navigate("/vue-account/account/login", { replace: true });
}
