export const RECENT_KEY = "ptn:recent_searches";
const MAX_ITEMS = 10;

function safeGetStorage(): Storage | null {
    try {
        if (typeof window === "undefined") return null;
        return window.localStorage;
    } catch {
        return null;
    }
}

// 내부 유틸: 배열을 "문자열만, trim 적용"으로 정제
function sanitize(list: unknown[]): string[] {
    return list
        .map((v) => (typeof v === "string" ? v : String(v ?? "")))
        .map((s) => s.trim())
        .filter(Boolean);
}

// 내부 유틸: 케이스 무시 중복 제거(앞쪽 우선, 순서 보존)
function dedupCaseInsensitive(list: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of list) {
        const k = s.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(s);
    }
    return out;
}

export function getRecent(): string[] {
    const ls = safeGetStorage();
    if (!ls) return [];
    try {
        const raw = ls.getItem(RECENT_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        // 문자열만 통과 + trim + 중복 제거 + 길이 캡
        const clean = sanitize(parsed);
        const deduped = dedupCaseInsensitive(clean);
        return deduped.slice(0, MAX_ITEMS);
    } catch {
        return [];
    }
}

export function saveRecent(list: string[]) {
    const ls = safeGetStorage();
    if (!ls) return;
    try {
        // 저장 시에도 길이 캡을 한 번 더
        const clean = dedupCaseInsensitive(sanitize(list)).slice(0, MAX_ITEMS);
        ls.setItem(RECENT_KEY, JSON.stringify(clean));
    } catch {
        /* ignore quota errors */
    }
}

export function addRecent(term: string): string[] {
    const t = term.trim();
    if (!t) return getRecent();

    // 최신값을 맨 앞에, 나머지는 케이스 무시 중복 제거
    const cur = getRecent();
    const lower = t.toLowerCase();
    const dedupTail = cur.filter((x) => x.toLowerCase() !== lower);

    const next = [t, ...dedupTail].slice(0, MAX_ITEMS);
    saveRecent(next);
    return next;
}

export function removeRecent(term: string): string[] {
    const lower = term.toLowerCase();
    const next = getRecent().filter((x) => x.toLowerCase() !== lower);
    saveRecent(next);
    return next;
}

export function clearRecent() {
    const ls = safeGetStorage();
    if (!ls) return;
    try {
        // 키 자체 제거(스토리지 이벤트 newValue=null, 호출부 영향 없음)
        ls.removeItem(RECENT_KEY);
    } catch {
        // 혹시 못 지우면 빈 배열로 대체 저장
        saveRecent([]);
    }
}
