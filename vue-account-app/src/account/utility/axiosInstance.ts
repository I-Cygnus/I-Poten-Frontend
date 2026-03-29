// 서버에 요청을 보내는 도메인
import axios, {type AxiosInstance} from "axios";

export let djangoAxiosInstance: AxiosInstance | null = null;
export let springAxiosInstance: AxiosInstance | null = null;
export let fastapiAxiosInst: AxiosInstance | null = null;
export let springAdminAxiosInst: AxiosInstance | null = null;

export function createAxiosInstances() {
    const djangoApiUrl = process.env.VUE_APP_DJANGO_API_BASE_URL;
    const springApiUrl = process.env.VUE_APP_SPRING_API_BASE_URL;
    const aiBaseUrl = process.env.VUE_APP_AI_API_BASE_URL;
    const adminApiUrl = process.env.VUE_APP_SPRING_API_BASE_URL;

    if (!djangoAxiosInstance) {
        console.log("🔎 Spring API URL:", process.env.VUE_APP_SPRING_API_BASE_URL);
        djangoAxiosInstance = axios.create({
            baseURL: djangoApiUrl,
            timeout: 80000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    if (!springAxiosInstance) {
        springAxiosInstance = axios.create({
            baseURL: springApiUrl,
            timeout: 80000,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }


    if (!fastapiAxiosInst) {
        fastapiAxiosInst = axios.create({
            baseURL: aiBaseUrl,
            timeout: 20000,
        });
    }

    if (!springAdminAxiosInst) {
        springAdminAxiosInst = axios.create({
            baseURL: adminApiUrl,
            timeout: 80000,
            withCredentials: true, // ★ 쿠키 자동 전송
        });
    }

    return { djangoAxiosInstance, springAxiosInstance, fastapiAxiosInst, springAdminAxiosInst };
}

