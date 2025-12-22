import * as axiosUtility from "../../account/utility/axiosInstance";

export const guestAuthenticationAction = {
  async requestGuestLoginToDjango(this: any): Promise<string> {
    const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();
    try {
      const res = await djangoAxiosInstance.post(
        "/guest-oauth/request-login-url"
      );
      const userToken = res.data.userToken;

      if (!userToken) {
        throw new Error("UserToken이 응답이 없습니다.");
      }
      this.userToken = userToken;
      this.isAuthenticated = true;

      localStorage.setItem("userToken", userToken);
      localStorage.setItem("loginType", "GUEST");

      return userToken;
    } catch (error) {
      throw error;
    }
  },

  async requestLogout(this: any, userToken: string): Promise<void> {
    const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();

    try {
      await djangoAxiosInstance.post("/authentication/logout", { userToken });

      this.userToken = null;
      this.isAuthenticated = false;
      localStorage.removeItem("userToken");
      localStorage.removeItem("loginType");
    } catch (error) {
      console.log("requestLogout() 중 에러:", error);
    }
  },

  async requestValidationUserToken(
    this: any,
    userToken: string
  ): Promise<boolean> {
    const { djangoAxiosInstance } = axiosUtility.createAxiosInstances();

    try {
      const response = await djangoAxiosInstance.post(
        "/authentication/validation",
        { userToken }
      );

      if (response.data && response.data.valid !== undefined) {
        this.isAuthenticated = response.data.valid;

        return response.data.valid;
      } else {
        console.error("Invalid response structure:", response.data);
        return false;
      }
    } catch (error) {
      console.log("requestLogout() 중 에러:", error);
      return false;
    }
  },

  setUserToken(this: any, userToken: string) {
    this.userToken = userToken;
    this.isAuthenticated = true;
    localStorage.setItem("userToken", userToken);
    localStorage.setItem("loginType", "GUEST");
  },
};
