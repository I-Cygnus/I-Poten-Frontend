import http, { authHeader } from "../utils/http";

export type MemorizationStatus = "LEARNING" | "DONE";

/** termId 기준으로 암기 상태 변경 */
export async function patchTermMemorization(
    termId: number | string,
    status: MemorizationStatus
) {
    return http.patch(
        `/me/terms/${termId}/memorization`,
        { status },
        { headers: { ...authHeader() }, withCredentials: true }
    );
}

export async function setMemorization(opts: {
    termId?: number | string;
    done: boolean;
}) {
    const status: MemorizationStatus = opts.done ? "DONE" : "LEARNING";
    if (opts.termId == null) {
        throw new Error(
            "setMemorization: server only accepts termId. (userTermId unsupported)"
        );
    }
    return patchTermMemorization(opts.termId, status);
}

/** 일괄 조회도 쿠키 필요 */
export async function fetchMemorizationStatuses(termIds: Array<number | string>) {
    const ids = termIds.join(",");
    const { data } = await http.get<Record<string, MemorizationStatus>>(
        "/me/terms/memorization",
        {
            params: { ids },
            headers: { ...authHeader() },
            withCredentials: true,
        }
    );
    return data;
}