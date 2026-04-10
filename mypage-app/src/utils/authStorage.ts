export const AUTH_STORAGE_CLEARED_EVENT = "auth-storage-cleared";

const LOCAL_STORAGE_KEYS = [
    "isLoggedIn",
    "nickname",
    "email",
    "userToken",
    "loginType",
    "accessToken",
    "userId",
    "ptn:last_activity_at",
];

const SESSION_STORAGE_KEYS = [
    "tempLoginType",
    "tempToken",
    "userInfo",
];

function removeKeys(storage: Storage, keys: string[]) {
    for (const key of keys) {
        storage.removeItem(key);
    }
}

export function clearAuthStorage() {
    if (typeof window === "undefined") {
        return;
    }

    try {
        removeKeys(window.localStorage, LOCAL_STORAGE_KEYS);
    } catch {}

    try {
        removeKeys(window.sessionStorage, SESSION_STORAGE_KEYS);
    } catch {}

    window.dispatchEvent(new CustomEvent(AUTH_STORAGE_CLEARED_EVENT));
}
