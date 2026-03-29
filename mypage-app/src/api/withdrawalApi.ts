function ensureApi(url?: string) {
    const base = String(url ?? "").trim().replace(/\/+$/, "");
    if (!base) return "http://localhost:8080/api";
    return base.endsWith("/api") ? base : `${base}/api`;
}

function detectApiBase(): string {
    const fromWindow = (globalThis as any)?.__API_BASE__;
    if (typeof fromWindow === "string" && fromWindow) {
        return ensureApi(fromWindow);
    }

    const fromDefine =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.VITE_API_BASE_URL ||
        process.env.VITE_API_BASE ||
        process.env.NEXT_PUBLIC_API_BASE ||
        process.env.API_BASE;

    if (fromDefine) {
        return ensureApi(fromDefine);
    }

    if (typeof window !== "undefined" && window.location?.origin) {
        return ensureApi(window.location.origin);
    }

    return "http://localhost:8080/api";
}

const API_BASE = detectApiBase();

async function readErrorMessage(response: Response) {
    if (response.status === 401) {
        return "로그인 상태를 확인한 뒤 다시 시도해 주세요.";
    }

    if (response.status === 403) {
        return "회원 탈퇴 권한이 없습니다.";
    }

    try {
        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            const data = await response.json();
            if (typeof data?.message === "string" && data.message.trim()) {
                return data.message.trim();
            }
            if (typeof data?.error === "string" && data.error.trim()) {
                return data.error.trim();
            }
        } else {
            const text = await response.text();
            if (text.trim()) {
                return text.trim();
            }
        }
    } catch {}

    return "회원 탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function withdrawAccount() {
    const response = await fetch(`${API_BASE}/account/withdraw`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }
}
