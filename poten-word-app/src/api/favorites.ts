import http, { authHeader } from "../utils/http";

export type MoveFavoritesResponse = {
    targetWordbookId: number;
    movedCount: number;
    skippedCount: number;
    skipped: {
        termId: number;
        reason: "DUPLICATE_IN_TARGET" | "NOT_FOUND_FAVORITE" | "FORBIDDEN" | "UNKNOWN";
    }[];
};

export async function moveFavorites(params: {
    targetWordbookId: number | string;
    favoriteIds?: Array<number | string>;
    termIds?: Array<number | string>;
}) {
    const { targetWordbookId, favoriteIds = [], termIds = [] } = params;

    const sanitizedTargetWordbookId = Number(targetWordbookId);
    if (!Number.isFinite(sanitizedTargetWordbookId)) {
        throw new Error("TARGET_REQUIRED");
    }

    if (favoriteIds.length === 0 && termIds.length === 0) {
        throw new Error("EMPTY_IDS");
    }

    const payload: Record<string, any> = {
        targetWordbookId: sanitizedTargetWordbookId,
    };

    if (favoriteIds.length) {
        payload.favoriteIds = Array.from(
            new Set(favoriteIds.map(Number).filter(Number.isFinite))
        );
    }

    if (termIds.length) {
        payload.termIds = Array.from(
            new Set(termIds.map(Number).filter(Number.isFinite))
        );
    }

    const { data } = await http.patch<MoveFavoritesResponse>(
        "/api/me/favorite-terms:move",
        payload,
        { headers: authHeader() }
    );

    return data;
}

export async function deleteFavoriteTerm(favoriteTermId: number | string) {
    const id = Number(favoriteTermId);
    if (!Number.isFinite(id)) {
        throw new Error("INVALID_ID");
    }

    return http.delete(`/api/me/favorite-terms/${id}`, {
        headers: authHeader(),
    });
}