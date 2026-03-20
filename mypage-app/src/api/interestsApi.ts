function ensureApi(url?: string) {
    const base = String(url ?? "").trim().replace(/\/+$/, "");
    if (!base) return "http://localhost:8080/api";
    return base.endsWith("/api") ? base : `${base}/api`;
}

function detectApiBase(): string {
    const fromWindow = (globalThis as { __API_BASE__?: unknown }).__API_BASE__;
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

export type InterestTag = {
    id: number;
    name: string;
    sortOrder: number;
    active: boolean;
};

export type Interest = {
    id: number;
    name: string;
    iconUrl: string | null;
    sortOrder: number;
    active: boolean;
    tags: InterestTag[];
};

export type MyInterestsResponse = {
    interestIds: number[];
    interestTagIds: number[];
};

export type UpdateMyInterestsRequest = {
    interestsIds: number[];
    interestTagIds: number[];
};

export class InterestsApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "InterestsApiError";
        this.status = status;
    }
}

function pickString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) {
                return trimmed;
            }
        }
    }

    return null;
}

function pickNumber(...values: unknown[]): number | null {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function normalizeTag(raw: any): InterestTag {
    return {
        id: pickNumber(raw?.id, raw?.tagId, raw?.tag_id, raw?.interestTagId, raw?.interest_tag_id) ?? 0,
        name: pickString(raw?.name, raw?.tagName, raw?.tag_name) ?? "",
        sortOrder: pickNumber(raw?.sortOrder, raw?.sort_order) ?? 0,
        active: raw?.active !== false && raw?.isActive !== false && raw?.is_active !== false,
    };
}

function normalizeInterest(raw: any): Interest {
    const tags = Array.isArray(raw?.tags) ? raw.tags.map(normalizeTag) : [];

    return {
        id: pickNumber(raw?.id, raw?.interestId, raw?.interest_id) ?? 0,
        name: pickString(raw?.name, raw?.interestName, raw?.interest_name) ?? "",
        iconUrl: pickString(raw?.iconUrl, raw?.icon_url),
        sortOrder: pickNumber(raw?.sortOrder, raw?.sort_order) ?? 0,
        active: raw?.active !== false && raw?.isActive !== false && raw?.is_active !== false,
        tags,
    };
}

function normalizeInterestList(raw: any): Interest[] {
    const items: unknown[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.result)
            ? raw.result
            : Array.isArray(raw?.interests)
              ? raw.interests
              : [];

    return items
        .map(normalizeInterest)
        .filter((interest) => interest.id > 0)
        .sort((left, right) => {
            if (left.sortOrder !== right.sortOrder) {
                return left.sortOrder - right.sortOrder;
            }

            return left.id - right.id;
        })
        .map((interest) => ({
            ...interest,
            tags: [...interest.tags]
                .filter((tag) => tag.id > 0)
                .sort((left, right) => {
                    if (left.sortOrder !== right.sortOrder) {
                        return left.sortOrder - right.sortOrder;
                    }

                    return left.id - right.id;
                }),
        }));
}

function normalizeMyInterests(raw: any): MyInterestsResponse {
    const body = raw?.data ?? raw?.result ?? raw ?? {};

    return {
        interestIds: Array.isArray(body?.interestIds)
            ? body.interestIds.map((value: unknown) => pickNumber(value) ?? 0).filter((id: number) => id > 0)
            : [],
        interestTagIds: Array.isArray(body?.interestTagIds)
            ? body.interestTagIds.map((value: unknown) => pickNumber(value) ?? 0).filter((id: number) => id > 0)
            : [],
    };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    const text = await response.text();
    const body = text ? text : null;

    if (!response.ok) {
        throw new InterestsApiError(
            response.status,
            typeof body === "string" && body.trim()
                ? body
                : `Interests API request failed: ${response.status}`
        );
    }

    if (!body) {
        return null as T;
    }

    try {
        return JSON.parse(body) as T;
    } catch {
        return body as T;
    }
}

export function validateUpdateMyInterestsRequest(
    payload: UpdateMyInterestsRequest,
    interests: Interest[]
) {
    const uniqueInterestIds = new Set(payload.interestsIds);
    const uniqueTagIds = new Set(payload.interestTagIds);

    if (payload.interestsIds.length === 0) {
        throw new Error("관심사는 최소 1개 이상 선택해야 합니다.");
    }

    if (payload.interestsIds.length > 5) {
        throw new Error("관심사는 최대 5개까지 선택할 수 있습니다.");
    }

    if (payload.interestTagIds.length > 20) {
        throw new Error("태그는 최대 20개까지 선택할 수 있습니다.");
    }

    if (uniqueInterestIds.size !== payload.interestsIds.length || uniqueTagIds.size !== payload.interestTagIds.length) {
        throw new Error("중복된 관심사 또는 태그는 저장할 수 없습니다.");
    }

    const interestMap = new Map(interests.map((interest) => [interest.id, interest]));

    for (const interestId of payload.interestsIds) {
        if (!interestMap.has(interestId)) {
            throw new Error("존재하지 않거나 비활성화된 관심사가 포함되어 있습니다.");
        }
    }

    const allowedTagIds = new Set(
        payload.interestsIds.flatMap((interestId) =>
            interestMap.get(interestId)?.tags.map((tag) => tag.id) ?? []
        )
    );

    for (const tagId of payload.interestTagIds) {
        if (!allowedTagIds.has(tagId)) {
            throw new Error("선택하지 않은 관심사에 속한 태그는 저장할 수 없습니다.");
        }
    }
}

export async function getInterests(): Promise<Interest[]> {
    const raw = await request<unknown>("/interests", { method: "GET" });
    return normalizeInterestList(raw);
}

export async function getMyInterests(): Promise<MyInterestsResponse> {
    const raw = await request<unknown>("/me/interests", { method: "GET" });
    return normalizeMyInterests(raw);
}

export async function updateMyInterests(
    payload: UpdateMyInterestsRequest
): Promise<MyInterestsResponse> {
    const raw = await request<unknown>("/me/interests", {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return normalizeMyInterests(raw);
}
