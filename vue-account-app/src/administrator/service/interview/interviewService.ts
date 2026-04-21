/**
 * 면접 결과 조회 어드민 서비스
 * 기존 admin service 컨벤션 준수:
 *   - springAdminAxiosInst 사용 (withCredentials 포함)
 *   - validateStatus: () => true 로 4xx도 throw하지 않고 상태 기반 분기
 *   - 엔드포인트 및 Body 키는 서버 DTO와 1:1 매핑
 *
 * 엔드포인트는 백엔드 구현 전까지 404를 반환할 수 있으며,
 * 각 함수는 null 또는 빈 형태를 반환해 UI가 graceful하게 빈 상태를 보이도록 처리.
 */

import {
    createAxiosInstances,
    springAdminAxiosInst,
} from "@/account/utility/axiosInstance";
import type {
    AdminInterviewUsersRequest,
    AdminInterviewUsersResponse,
    AdminInterviewHistoryRequest,
    AdminInterviewHistoryResponse,
    AdminInterviewDetail,
} from "@/administrator/service/interview/dto/interviewDto";

function ensureSpringAdminAxios() {
    if (!springAdminAxiosInst) createAxiosInstances();
    return springAdminAxiosInst!;
}

/** Level 1 — 면접 기록 보유 회원 리스트 (서버 필터링/페이징) */
export async function fetchInterviewUserList(
    body: AdminInterviewUsersRequest
): Promise<AdminInterviewUsersResponse | null> {
    const axios = ensureSpringAdminAxios();
    try {
        const resp = await axios.post<AdminInterviewUsersResponse>(
            "/administrator/management/interview/users",
            body,
            { validateStatus: () => true }
        );
        if (resp.status === 200) return resp.data;
        if (resp.status === 204) {
            return { items: [], pageSize: body.pageSize, hasNext: false, nextCursor: null };
        }
        console.warn("[fetchInterviewUserList] bad status:", resp.status);
        return null;
    } catch (e) {
        console.error("[fetchInterviewUserList] error:", e);
        return null;
    }
}

/** Level 2 — 특정 유저의 면접 이력 */
export async function fetchInterviewHistory(
    userId: number,
    body: AdminInterviewHistoryRequest
): Promise<AdminInterviewHistoryResponse | null> {
    const axios = ensureSpringAdminAxios();
    try {
        const resp = await axios.post<AdminInterviewHistoryResponse>(
            `/administrator/management/interview/users/${encodeURIComponent(userId)}/history`,
            body,
            { validateStatus: () => true }
        );
        if (resp.status === 200) return resp.data;
        console.warn("[fetchInterviewHistory] bad status:", resp.status);
        return null;
    } catch (e) {
        console.error("[fetchInterviewHistory] error:", e);
        return null;
    }
}

/** Level 3 — 면접 상세 */
export async function fetchInterviewDetail(
    interviewId: number
): Promise<AdminInterviewDetail | null> {
    const axios = ensureSpringAdminAxios();
    try {
        const resp = await axios.get<AdminInterviewDetail>(
            `/administrator/management/interview/${encodeURIComponent(interviewId)}`,
            { validateStatus: () => true }
        );
        if (resp.status === 200) return resp.data;
        console.warn("[fetchInterviewDetail] bad status:", resp.status);
        return null;
    } catch (e) {
        console.error("[fetchInterviewDetail] error:", e);
        return null;
    }
}
