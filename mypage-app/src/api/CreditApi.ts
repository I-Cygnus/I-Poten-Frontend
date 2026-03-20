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

export type CreditAccountSummary = {
    balance: number;
    monthlyEarned: number;
    monthlyUsed: number;
    expiresAt: string | null;
};

function pickNumber(...values: unknown[]): number | null {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function pickString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) return trimmed;
        }
    }

    return null;
}

function normalizeCreditAccount(raw: any): CreditAccountSummary {
    const body = raw?.data ?? raw?.result ?? raw ?? {};

    return {
        balance: pickNumber(
            body?.balance,
            body?.credit,
            body?.creditBalance,
            body?.currentCredit,
            body?.totalCredit,
        ) ?? 0,
        monthlyEarned: pickNumber(
            body?.monthlyEarned,
            body?.earnedThisMonth,
            body?.thisMonthEarned,
            body?.monthEarnedCredit,
        ) ?? 0,
        monthlyUsed: pickNumber(
            body?.monthlyUsed,
            body?.usedThisMonth,
            body?.thisMonthUsed,
            body?.monthUsedCredit,
        ) ?? 0,
        expiresAt: pickString(
            body?.expiresAt,
            body?.expireAt,
            body?.expirationDate,
            body?.expiryDate,
        ),
    };
}

export async function getCreditAccountSummary(): Promise<CreditAccountSummary> {
    const response = await fetch(`${API_BASE}/credit/account`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Credit account request failed: ${response.status}`);
    }

    const text = await response.text();
    const raw = text ? JSON.parse(text) : null;
    return normalizeCreditAccount(raw);
}
