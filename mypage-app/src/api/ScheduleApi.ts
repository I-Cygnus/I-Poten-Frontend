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
const SCHEDULE_BASE_PATH = "/me/schedules";

export type Schedule = {
    id: number;
    title: string;
    memo: string;
    startAt: string;
    endAt: string;
    allDay: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ScheduleListResponse = {
    schedules: Schedule[];
};

export type ScheduleDeleteResponse = {
    scheduleId: number;
    deleted: boolean;
};

export type ScheduleQuery = {
    from?: string;
    to?: string;
};

export type ScheduleUpsertRequest = {
    title: string;
    memo: string;
    startAt: string;
    endAt: string;
    allDay: boolean;
};

function pickString(...values: unknown[]): string {
    for (const value of values) {
        if (typeof value === "string") {
            return value;
        }
    }

    return "";
}

function pickBoolean(...values: unknown[]): boolean {
    for (const value of values) {
        if (typeof value === "boolean") {
            return value;
        }
    }

    return false;
}

function pickNumber(...values: unknown[]): number {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return 0;
}

function normalizeSchedule(raw: any): Schedule {
    const item = raw?.data ?? raw?.result ?? raw ?? {};

    return {
        id: pickNumber(item?.id, item?.scheduleId),
        title: pickString(item?.title),
        memo: pickString(item?.memo),
        startAt: pickString(item?.startAt),
        endAt: pickString(item?.endAt),
        allDay: pickBoolean(item?.allDay),
        createdAt: pickString(item?.createdAt),
        updatedAt: pickString(item?.updatedAt),
    };
}

function normalizeScheduleList(raw: any): Schedule[] {
    const items = Array.isArray(raw?.schedules)
        ? raw.schedules
        : Array.isArray(raw?.data?.schedules)
          ? raw.data.schedules
          : Array.isArray(raw?.result?.schedules)
            ? raw.result.schedules
            : Array.isArray(raw)
              ? raw
              : [];

    return items.map(normalizeSchedule);
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

    if (!response.ok) {
        throw new Error(`Schedule API request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return null as T;
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
}

function buildQueryString(query?: ScheduleQuery) {
    const searchParams = new URLSearchParams();

    if (query?.from) searchParams.set("from", query.from);
    if (query?.to) searchParams.set("to", query.to);

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

export async function getMySchedules(query?: ScheduleQuery): Promise<Schedule[]> {
    const raw = await request<ScheduleListResponse | { data?: ScheduleListResponse }>(
        `${SCHEDULE_BASE_PATH}${buildQueryString(query)}`,
        { method: "GET" }
    );

    return normalizeScheduleList(raw);
}

export async function getMyScheduleDetail(scheduleId: number): Promise<Schedule> {
    const raw = await request<Schedule>(`${SCHEDULE_BASE_PATH}/${scheduleId}`, {
        method: "GET",
    });

    return normalizeSchedule(raw);
}

export async function createMySchedule(
    payload: ScheduleUpsertRequest
): Promise<Schedule> {
    const raw = await request<Schedule>(SCHEDULE_BASE_PATH, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return normalizeSchedule(raw);
}

export async function updateMySchedule(
    scheduleId: number,
    payload: ScheduleUpsertRequest
): Promise<Schedule> {
    const raw = await request<Schedule>(`${SCHEDULE_BASE_PATH}/${scheduleId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return normalizeSchedule(raw);
}

export async function deleteMySchedule(
    scheduleId: number
): Promise<ScheduleDeleteResponse> {
    const raw = await request<ScheduleDeleteResponse>(
        `${SCHEDULE_BASE_PATH}/${scheduleId}`,
        {
            method: "DELETE",
        }
    );

    return {
        scheduleId: pickNumber(raw?.scheduleId, scheduleId),
        deleted: pickBoolean(raw?.deleted),
    };
}
