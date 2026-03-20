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

export type InquiryType =
    | "SERVICE"
    | "PAYMENT"
    | "BUG"
    | "FEATURE"
    | "OTHER";

export type InquiryStatus =
    | "RECEIVED"
    | "IN_PROGRESS"
    | "ANSWERED"
    | "CLOSED";

export type InquirySummary = {
    id: number;
    type: InquiryType;
    title: string;
    status: InquiryStatus;
    answeredAt: string | null;
    createdAt: string | null;
};

export type InquiryDetail = {
    id: number;
    accountId: number | null;
    type: InquiryType;
    title: string;
    content: string;
    status: InquiryStatus;
    answerContent: string | null;
    answeredAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type CreateInquiryPayload = {
    type: InquiryType;
    title: string;
    content: string;
};

function pickString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) return trimmed;
        }
    }

    return null;
}

function pickNumber(...values: unknown[]): number | null {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }

    return null;
}

function toInquiryType(value: unknown): InquiryType {
    const normalized = String(value ?? "").trim().toUpperCase();

    switch (normalized) {
        case "SERVICE":
        case "PAYMENT":
        case "BUG":
        case "FEATURE":
        case "OTHER":
            return normalized;
        default:
            return "OTHER";
    }
}

function toInquiryStatus(value: unknown): InquiryStatus {
    const normalized = String(value ?? "").trim().toUpperCase();

    switch (normalized) {
        case "RECEIVED":
        case "IN_PROGRESS":
        case "ANSWERED":
        case "CLOSED":
            return normalized;
        default:
            return "RECEIVED";
    }
}

function unwrapListResponse(raw: any): any[] {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.result)) return raw.result;
    if (Array.isArray(raw?.list)) return raw.list;
    if (Array.isArray(raw?.data?.list)) return raw.data.list;
    if (Array.isArray(raw?.result?.list)) return raw.result.list;
    return [];
}

function normalizeInquirySummary(item: any): InquirySummary {
    return {
        id: pickNumber(item?.id, item?.inquiryId) ?? 0,
        type: toInquiryType(item?.type),
        title: pickString(item?.title) ?? "문의",
        status: toInquiryStatus(item?.status),
        answeredAt: pickString(item?.answeredAt),
        createdAt: pickString(item?.createdAt),
    };
}

function normalizeInquiryDetail(raw: any): InquiryDetail {
    const item = raw?.data ?? raw?.result ?? raw ?? {};

    return {
        id: pickNumber(item?.id, item?.inquiryId) ?? 0,
        accountId: pickNumber(item?.accountId),
        type: toInquiryType(item?.type),
        title: pickString(item?.title) ?? "문의",
        content: pickString(item?.content) ?? "",
        status: toInquiryStatus(item?.status),
        answerContent: pickString(item?.answerContent),
        answeredAt: pickString(item?.answeredAt),
        createdAt: pickString(item?.createdAt),
        updatedAt: pickString(item?.updatedAt),
    };
}

async function request(path: string, init?: RequestInit) {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(`Inquiry API request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<number> {
    const raw = await request("/inquiries", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    const inquiryId = pickNumber(raw, raw?.id, raw?.data, raw?.result);
    if (inquiryId == null) {
        throw new Error("Failed to parse created inquiry id.");
    }

    return inquiryId;
}

export async function getMyInquiryList(): Promise<InquirySummary[]> {
    const raw = await request("/inquiries/me", { method: "GET" });
    return unwrapListResponse(raw).map(normalizeInquirySummary);
}

export async function getMyInquiryDetail(inquiryId: number): Promise<InquiryDetail> {
    const raw = await request(`/inquiries/${inquiryId}`, { method: "GET" });
    return normalizeInquiryDetail(raw);
}
