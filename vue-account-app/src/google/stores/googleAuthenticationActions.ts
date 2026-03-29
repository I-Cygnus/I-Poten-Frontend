import * as axiosUtility from "../../account/utility/axiosInstance";
import {
    buildSocialLoginErrorMessage,
    clearSocialSignupState,
    extractSocialLoginErrorFromAxios,
    getSocialLoginToken,
    normalizeSocialLoginMessage,
    setRejoinUserFlag,
} from "../../account/utility/socialLogin";

export const googleAuthenticationAction = {
    async requestGoogleLoginToSpring(router: any): Promise<void> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            const res = await springAxiosInstance.get("/authentication/google/link");
            const loginType = "GOOGLE";

            if (!res.data) {
                throw new Error("로그인 URL 응답이 비어 있습니다.");
            }

            const popup = window.open(res.data, "_blank", "width=500,height=600");
            if (!popup) {
                alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.");
                return;
            }

            const receiveMessage = (event: MessageEvent) => {
                if (event.origin !== process.env.ORIGIN) {
                    return;
                }

                const payload = normalizeSocialLoginMessage(event.data);
                const socialError = payload.error;
                if (socialError) {
                    window.removeEventListener("message", receiveMessage);
                    alert(buildSocialLoginErrorMessage(socialError));
                    try {
                        popup.close();
                    } catch {}
                    return;
                }

                sessionStorage.setItem("tempLoginType", loginType);
                const accessToken = getSocialLoginToken(payload);
                const { isNewUser, rejoinUser, user } = payload;
                const mainContainerUrl = process.env.MAIN_CONTAINER_URL as string;

                if (!accessToken) {
                    return;
                }

                window.dispatchEvent(new Event("user-token-changed"));
                window.removeEventListener("message", receiveMessage);

                if (isNewUser) {
                    sessionStorage.setItem("tempToken", accessToken);
                    sessionStorage.setItem("userInfo", JSON.stringify(user));
                    setRejoinUserFlag(Boolean(rejoinUser));
                    router.push("/account/privacy");
                } else if (!isNewUser) {
                    setRejoinUserFlag(false);
                    localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
                    localStorage.removeItem("tempLoginType");
                    localStorage.setItem("nickname", user?.nickname ?? "");
                    window.location.href = mainContainerUrl;
                } else {
                    alert("로그인 처리 중 문제가 발생했습니다.");
                }

                try {
                    popup.close();
                } catch {}
            };

            window.addEventListener("message", receiveMessage);
        } catch (error) {
            const socialError = extractSocialLoginErrorFromAxios(error);
            if (socialError) {
                alert(buildSocialLoginErrorMessage(socialError));
                return;
            }

            console.log("requestGoogleLoginToSpring() error:", error);
            throw error;
        }
    },

    async requestRegister(): Promise<void> {
        try {
            const { springAxiosInstance } = axiosUtility.createAxiosInstances();
            const accessToken = sessionStorage.getItem("tempToken");
            let userInfo = null;
            const user = sessionStorage.getItem("userInfo");

            if (user) {
                userInfo = JSON.parse(user);
                userInfo.loginType = "GOOGLE";
            }

            await springAxiosInstance.post("/api/account/signup", userInfo, {
                headers: {
                    Authentication: accessToken,
                },
            });

            try {
                await springAxiosInstance.get("/credit/account");
            } catch (creditError) {
                console.warn("credit account warm-up failed after signup:", creditError);
            }

            localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
            clearSocialSignupState();
            window.location.href = "/";
        } catch (error: any) {
            const socialError = extractSocialLoginErrorFromAxios(error);
            if (socialError) {
                alert(buildSocialLoginErrorMessage(socialError));
                return;
            }

            console.error("requestRegister() error:", error);
            alert("회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");

            if (error.response) {
                console.error("server response:", error.response.data);
            }
        }
    },

    async requestGoogleWithdrawToDjango(this: any): Promise<void> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();
        const userToken = localStorage.getItem("userToken");

        try {
            const res = await djangoAxiosInstance.post(
                "/google-oauth/request-withdraw-url",
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (res.data && res.data.message === "구글 연결 해제 성공") {
                alert("구글 계정 탈퇴가 완료되었습니다.");
                this.userToken = "";
                this.isAuthenticated = false;
                localStorage.removeItem("userToken");
                window.location.href = "/";
            } else {
                console.error("unexpected withdraw response:", res.data);
            }
        } catch (error) {
            console.error("requestGoogleWithdrawToDjango() error:", error);
            throw error;
        }
    },

    async requestAccessToken({ code }: { code: string }): Promise<{ accessToken: string; email: string; userId: string }> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            const response = await djangoAxiosInstance.post("/google-oauth/redirect-access-token", { code });
            return {
                accessToken: response.data.accessToken,
                email: response.data.email,
                userId: response.data.userId,
            };
        } catch (error) {
            console.log("requestAccessToken() error:", error);
            throw error;
        }
    },

    async requestLogout(this: any, userToken: string): Promise<void> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            await djangoAxiosInstance.post("/authentication/logout", { userToken });
            this.userToken = "";
            this.isAuthenticated = false;
            localStorage.removeItem("userToken");
        } catch (error) {
            console.log("requestLogout() error:", error);
            throw error;
        }
    },

    async requestValidationUserToken(userToken: string): Promise<boolean> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            const response = await djangoAxiosInstance.post("/authentication/validation", { userToken });

            if (response.data && response.data.valid !== undefined) {
                return response.data.valid;
            }

            console.error("Invalid response structure:", response.data);
            return false;
        } catch (error) {
            console.log("requestValidationUserToken() error:", error);
            return false;
        }
    },
};
