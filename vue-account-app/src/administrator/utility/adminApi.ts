//admin 임시토큰 유효성 검증
// import {clearAdminSession} from "@/security/admin";
import {createAxiosInstances, springAdminAxiosInst, springAxiosInstance} from "@/account/utility/axiosInstance.ts";
import springAxiosInst from "navigation-bar-app/src/utility/AxiosInst.ts";

export async function validateTempTokenOnServer(): Promise<boolean> {
    if (!springAdminAxiosInst) createAxiosInstances();
    try {
        const resp = await springAdminAxiosInst!.get("/administrator/authentication/temporaryAdminToken_valid", {
            validateStatus: () => true,
        });
        return resp.status === 200 || resp.status === 204;
    } catch {
        return false;
    }
}

export async function verifyAdminOnServer(): Promise<boolean> {
    if (!springAdminAxiosInst) createAxiosInstances();
    try {
        const resp = await springAdminAxiosInst!.post(
            "/administrator/authentication/social_login",
            null,
            {
                validateStatus: () => true,
            }
        );
        return resp.status === 200;
    } catch {
        return false;
    }
}
export async function logoutRequest(): Promise<boolean> {
    if (!springAdminAxiosInst) createAxiosInstances();
    try {
        const res = await springAdminAxiosInst!.post(
            "/api/authentication/logout",
            {},
            {
                withCredentials: true
            }
        );
        return res.status >= 200 && res.status < 300;
    } catch {
        return false;
    }
}
export function setupAdminInterceptors() {
    if (!springAdminAxiosInst) createAxiosInstances();
    springAxiosInstance!.interceptors.response.use(
        (res) => {
            if (res.status === 401 || res.status === 403) {
                // clearAdminSession();
                window.dispatchEvent(new CustomEvent("admin-unauthorized"));
            }
            return res;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
}
