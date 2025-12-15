// src/administrator/service/studyRoomReport/studyRoomReport.service.ts
import { createAxiosInstances, springAdminAxiosInst } from "@/account/utility/axiosInstance";
import type { ReportStatus, StudyRoomReport } from "@/administrator/service/studyRoomReport/dto/studyRoomDto";

function ensureSpringAdminAxios() {
    if (!springAdminAxiosInst) createAxiosInstances();
    return springAdminAxiosInst!;
}

/** 전체 신고 목록: 백엔드가 List<StudyRoomReportResponse> 반환 */
export async function fetchAllStudyRoomReports(): Promise<StudyRoomReport[] | null> {
    const axios = ensureSpringAdminAxios();
    try {
        const resp = await axios.get<StudyRoomReport[]>(
            "/api/admin/study-rooms/reports",                  // ← 질문에 준 엔드포인트 그대로
            { validateStatus: () => true }
        );
        if (resp.status === 200) return resp.data;
        if (resp.status === 204) return [];        // 내용 없음 → 빈 배열
        console.warn("[fetchAllStudyRoomReports] bad status:", resp.status);
        return null;
    } catch (e) {
        console.error("[fetchAllStudyRoomReports] error:", e);
        return null;
    }
}

export async function updateStudyRoomReportStatus(reportId: number,status: ReportStatus): Promise<boolean> {
    const axios = ensureSpringAdminAxios(); // withCredentials 포함 인스턴스
    try {
        const resp = await axios.patch(
            `/api/admin/study-rooms/reports/${encodeURIComponent(reportId)}/status`,
            { status },                          // ← JSON Body (RequestBody)
            { validateStatus: () => true }       // 4xx도 throw하지 않게
        );
        return resp.status === 200 || resp.status === 204;
    } catch (e) {
        console.error("[updateStudyRoomReportStatus] error:", e);
        return false;
    }
}