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
    try {
        const data = await response.json();
        if (typeof data?.message === "string" && data.message.trim()) {
            return data.message.trim();
        }
        if (typeof data?.error === "string" && data.error.trim()) {
            return data.error.trim();
        }
    } catch {}

    return `Withdraw request failed: ${response.status}`;
}

export async function withdrawAccount() {
    const response = await fetch(`${API_BASE}/account/withdraw`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }
}
