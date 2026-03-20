export const LAST_ACTIVITY_KEY = "poten:last_activity_at";
export const LAST_ACTIVITY_EVENT = "poten:last-activity-updated";

function safeParseDate(value: string | null | undefined): number | null {
    if (!value) return null;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
}

export function getLastActivityAt(): string | null {
    try {
        const raw = window.localStorage.getItem(LAST_ACTIVITY_KEY);
        return safeParseDate(raw) == null ? null : raw;
    } catch {
        return null;
    }
}

export function getMostRecentActivityAt(...values: Array<string | null | undefined>): string | null {
    let picked: string | null = null;
    let pickedTime: number | null = null;

    for (const value of values) {
        const time = safeParseDate(value);
        if (time == null) continue;
        if (pickedTime == null || time > pickedTime) {
            picked = value ?? null;
            pickedTime = time;
        }
    }

    return picked;
}
