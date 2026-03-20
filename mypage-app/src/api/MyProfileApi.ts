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

export type MyProfileSummary = {
    nickname: string | null;
    email: string | null;
    lastActivityAt: string | null;
    representativeLabel: string | null;
    representativeJob: string | null;
    representativeCareer: string | null;
};

function pickString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return null;
}

function normalizeProfile(raw: any): MyProfileSummary {
    const body = raw?.data ?? raw?.result ?? raw?.user ?? raw ?? {};

    return {
        nickname: pickString(body?.nickname, body?.name, body?.userName),
        email: pickString(body?.email, body?.accountEmail, body?.loginEmail),
        lastActivityAt: pickString(body?.lastActivityAt),
        representativeLabel: pickString(body?.representativeLabel),
        representativeJob: pickString(body?.representativeJob),
        representativeCareer: pickString(body?.representativeCareer),
    };
}

async function requestProfile(path: string) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Profile request failed: ${response.status}`);
    }

    return response.json();
}

export async function getMyProfileSummary(): Promise<MyProfileSummary> {
    const candidates = [
        "/account-profile/profile",
        "/me",
        "/me/profile",
        "/account/profile",
        "/users/me",
        "/members/me",
        "/authentication/token/verification",
    ];

    for (const path of candidates) {
        try {
            const raw = await requestProfile(path);
            const profile = normalizeProfile(raw);

            if (
                profile.nickname ||
                profile.email ||
                profile.lastActivityAt ||
                profile.representativeLabel
            ) {
                return profile;
            }
        } catch {
            // Try the next endpoint shape.
        }
    }

    return {
        nickname: null,
        email: null,
        lastActivityAt: null,
        representativeLabel: null,
        representativeJob: null,
        representativeCareer: null,
    };
}
