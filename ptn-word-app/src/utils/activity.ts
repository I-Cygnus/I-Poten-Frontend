export const LAST_ACTIVITY_KEY = "ptn:last_activity_at";
export const LAST_ACTIVITY_EVENT = "ptn:last-activity-updated";

function safeParseDate(value: string | null): number | null {
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

export function markLastActivity(at: string = new Date().toISOString()): string {
    try {
        const current = getLastActivityAt();
        const nextTime = safeParseDate(at);
        const currentTime = safeParseDate(current);

        if (nextTime != null && (currentTime == null || nextTime >= currentTime)) {
            window.localStorage.setItem(LAST_ACTIVITY_KEY, at);
        }

        window.dispatchEvent(new CustomEvent(LAST_ACTIVITY_EVENT, { detail: { at } }));
    } catch {
        // Ignore storage failures and keep the UX responsive.
    }

    return at;
}
