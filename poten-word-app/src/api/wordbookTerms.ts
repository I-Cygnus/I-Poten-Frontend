import http, { authHeader } from "../utils/http";

export type MoveFolderTermsPayload = {
    targetWordbookId: number;
    termIds: number[];
};

export type MoveFolderTermsResponse = {
    sourceWordbookId: number;
    targetWordbookId: number;
    movedCount: number;
    skippedCount?: number;
    movedTermIds?: number[];
    skipped?: {
        termId: number;
        reason:
            | "DUPLICATE_IN_TARGET"
            | "NOT_IN_SOURCE"
            | "TERM_NOT_FOUND"
            | "SAME_FOLDER";
    }[];
};

/** 단어장 간 용어 이동 */
export async function moveFolderTerms(
    sourceWordbookId: number | string,
    payload: MoveFolderTermsPayload
) {
    const sanitized: MoveFolderTermsPayload = {
        targetWordbookId: Number(payload.targetWordbookId),
        termIds: Array.from(
            new Set(payload.termIds.map(Number).filter(Number.isFinite))
        ),
    };

    if (!sanitized.targetWordbookId) throw new Error("TARGET_REQUIRED");
    if (!sanitized.termIds.length) throw new Error("EMPTY_TERM_IDS");

    const { data } = await http.patch<MoveFolderTermsResponse>(
        `/me/folders/${Number(sourceWordbookId)}/terms:move`,
        sanitized,
        {
            headers: { ...authHeader() },
            withCredentials: true,
        }
    );

    return data;
}

/** 단어장 폴더에서 용어 제거 (bulk) */
export async function removeFolderTerms(
    wordbookId: string | number,
    termIds: number[]
): Promise<void> {
    const sanitizedIds = Array.from(
        new Set(termIds.map(Number).filter(Number.isFinite))
    );

    if (sanitizedIds.length === 0) return;

    await http.patch(
        `/me/folders/${Number(wordbookId)}/terms:bulk`,
        { termIds: sanitizedIds },
        {
            headers: { ...authHeader() },
            withCredentials: true,
        }
    );
}
