// src/api/wordbookTerms.ts
import http, { authHeader } from "../utils/http";

export type MoveFolderTermsPayload = {
    targetWordbookId: number;
    termIds?: number[];              // 원본 용어 ID
    userWordbookTermIds?: number[];  // 단어장 항목 ID(폴백)
};

export type MoveFolderTermsResponse = {
    sourceWordbookId: number;
    targetWordbookId: number;
    movedCount: number;
    skippedCount?: number;
    movedTermIds?: number[];
    skipped?: {
        termId: number;
        reason: "DUPLICATE_IN_TARGET" | "NOT_IN_SOURCE" | "TERM_NOT_FOUND" | "SAME_FOLDER";
    }[];
};

export async function moveFolderTerms(sourceWordbookId: string | number, payload: MoveFolderTermsPayload) {
    const body = {
        targetWordbookId: Number(payload.targetWordbookId),
        termIds: Array.from(new Set((payload.termIds ?? []).map(Number).filter(Number.isFinite))),
        userWordbookTermIds: Array.from(
            new Set((payload.userWordbookTermIds ?? []).map(Number).filter(Number.isFinite))
        ),
    };

    // 콜론형만 호출 (중복/재시도 금지)
    const { data } = await http.patch<MoveFolderTermsResponse>(
        `/me/folders/${Number(sourceWordbookId)}/terms:move`,
        body,
        { headers: { ...authHeader() } }
    );
    return data;
}
