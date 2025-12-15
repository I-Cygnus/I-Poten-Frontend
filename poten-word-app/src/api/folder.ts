import http, { authHeader } from "../utils/http";

export type RenameFolderResponse = {
    id: number;
    wordbookName: string;
    sortOrder: number;
    updatedAt?: string;
};

export async function renameUserFolder(wordbookId: string | number, wordbookName: string): Promise<RenameFolderResponse> {
    const { data } = await http.patch<RenameFolderResponse>(
        `/me/folders/${Number(wordbookId)}`,
        { wordbookName },
        { headers: { ...authHeader() } }
    );
    return data;
}

/** 단일 폴더 삭제 */
export async function deleteUserFolder(
    wordbookId: string | number,
    mode: "purge" | "detach" | "move" = "purge",
    targetWordbookId?: string | number
): Promise<void> {
    const params: Record<string, any> = { mode };
    if (mode === "move" && targetWordbookId != null) params.targetWordbookId = targetWordbookId;

    await http.delete(`/me/folders/${wordbookId}`, {
        headers: { ...authHeader() },
        params,
    })
}

/** 여러 폴더 일괄 삭제 */
export async function deleteUserFoldersBulk(
    wordbookIds: Array<string | number>,
    mode: "purge" | "detach" | "move" = "purge",
    targetWordbookId?: string | number
): Promise<{ deletedCount: number }> {
    const body: Record<string, any> = {
        wordbookIds: wordbookIds.map(Number),
        mode,
    };
    if (mode === "move" && targetWordbookId != null) body.targetWordbookId = Number(targetWordbookId);

    // axios는 DELETE + body 지원 (http.request 사용)
    const { data } = await http.request({
        method: "DELETE",
        url: "/me/folders:bulk",
        headers: { ...authHeader() },
        data: body,
    });

    return data ?? { deletedCount: 0 };
}
