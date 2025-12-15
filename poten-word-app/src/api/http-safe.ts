export class HttpError extends Error {
    status: number;
    body: any;
    constructor(status: number, statusText: string, body: any) {
        super(`${status} ${statusText}`);
        this.status = status;
        this.body = body;
    }
}

async function safeBody(res: Response) {
    const text = await res.text();
    if (!text) return null; // 본문 없음(204/500 빈 바디 등)
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        try { return JSON.parse(text); } catch { /* fallthrough */ }
    }
    return text; // JSON이 아니면 텍스트로
}

export async function request(url: string, init?: RequestInit) {
    const res = await fetch(url, init);
    if (!res.ok) {
        const body = await safeBody(res);
        throw new HttpError(res.status, res.statusText, body);
    }
    if (res.status === 204) return null;
    return await safeBody(res);
}
