import * as axiosUtility from "../../account/utility/axiosInstance";

export const googleAuthenticationAction = {
    async requestGoogleLoginToSpring(router: any): Promise<void> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();
        try {

            const res = await springAxiosInstance.get("/authentication/google/link");
            console.log("res.data:", res.data);
            const loginType = "GOOGLE";

            if (!res.data) {
                throw new Error("응답에 URL이 없습니다.");
            }

            // 팝업으로 열기
            const popup = window.open(res.data, '_blank', 'width=500,height=600');
            if (!popup) {
                alert('팝업 차단되어 있습니다. 팝업 허용 후 다시 시도하세요.');
                return;
            }

            // 팝업 메시지 받기
            const receiveMessage = (event: MessageEvent) => {

                console.log('📨 받은 메시지:', event.origin, event.data);

                // 허용된 origin만 허용
                if (event.origin !== process.env.ORIGIN) {
                    console.log("원본 Origin : ", process.env.ORIGIN);
                    console.warn('❌ 허용되지 않은 origin:', event.origin);
                    return;
                }

                sessionStorage.setItem("tempLoginType", loginType);
                const { accessToken, isNewUser, user } = event.data;
                const MAIN_CONTAINER_URL = process.env.MAIN_CONTAINER_URL as string;

                console.log("팝업 유저 정보 user:", user);


                if (!accessToken) {
                    console.warn('❌ accessToken 없음');
                    return;
                }

                window.dispatchEvent(new Event("user-token-changed"));
                window.removeEventListener('message', receiveMessage);






                if(isNewUser) {
                    console.log("메타 신규 유저 진입");
                    sessionStorage.setItem("tempToken", accessToken);
                    sessionStorage.setItem("userInfo", JSON.stringify(user));
                    console.log("tempToken" + accessToken);
                    console.log("userInfo" + JSON.stringify(user));
                    router.push("/account/privacy");
                } else if(!isNewUser) {
                    localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?")
                    localStorage.removeItem("tempLoginType");
                    localStorage.setItem("nickname", user.nickname);

                    window.location.href = MAIN_CONTAINER_URL;

                } else{
                    alert("로그인중 문제가 발생하였습니다.")
                }

                try {
                    popup.close();
                } catch (e) {
                    console.warn('팝업 닫기 실패:', e);
                }
            };

            window.addEventListener('message', receiveMessage);


        } catch (error) {
            console.log("requestNaverOauthRedirectionToDjango() 중 에러:", error);
            throw error; // 상위 함수에서 에러가 잡히도록 재전파
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

            const res = await springAxiosInstance.post(
                "/api/account/signup",
                userInfo,
                {
                    headers: {
                        "Authentication": accessToken
                    }
                }
            );

            localStorage.setItem("isLoggedIn", "wxx-sdwsx-ds=!>,?");
            localStorage.removeItem("tempToken");
            window.location.href = "/";

        } catch (error: any) {
            console.error("회원가입 요청 실패:", error);

            alert("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");

            if (error.response) {
                console.error("서버 응답:", error.response.data);
            }
        }
    },

    async requestGoogleWithdrawToDjango(this: any): Promise<void> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();
        const userToken = localStorage.getItem("userToken");
        try {
            const res = await djangoAxiosInstance.post(
                `/google-oauth/request-withdraw-url`,
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            console.log("구글 탈퇴 응답:", res.data);

            if (res.data && res.data.message === "구글 연결 해제 성공") {
                alert("구글 계정 탈퇴가 완료되었습니다.");
                this.userToken = '';
                this.isAuthenticated = false;
                localStorage.removeItem('userToken');
                window.location.href = "/";
            } else {
                console.error("❌ 탈퇴 실패 - 잘못된 응답:", res.data);
            }
        } catch (error) {
            console.error("🚨 구글 탈퇴 요청 중 오류 발생:", error);
            throw error;
        }
    },

    async requestAccessToken({ code }: { code: string }): Promise<{ accessToken: string; email: string; userId: string }> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();
        try {
            const response = await djangoAxiosInstance.post(
                "/google-oauth/redirect-access-token",
                { code }
            );
            return {
                accessToken: response.data.accessToken,
                email: response.data.email,
                userId: response.data.userId
            };
        } catch (error) {
            console.log("Access Token 요청 중 문제 발생:", error);
            throw error;
        }
    },

    async requestLogout(this: any, userToken: string): Promise<void> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            await djangoAxiosInstance.post("/authentication/logout", { userToken });
            this.userToken = '';
            this.isAuthenticated = false;
            localStorage.removeItem("userToken");
        } catch (error) {
            console.log("requestLogout() 중 에러:", error);
            throw error;
        }
    },

    async requestValidationUserToken(userToken: string): Promise<boolean> {
        const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            const response = await djangoAxiosInstance.post(
                "/authentication/validation",
                { userToken }
            );

            if (response.data && response.data.valid !== undefined) {
                return response.data.valid;
            } else {
                console.error("Invalid response structure:", response.data);
                return false;
            }
        } catch (error) {
            console.log("requestValidationUserToken() 중 에러:", error);
            return false;
        }
    }
};
