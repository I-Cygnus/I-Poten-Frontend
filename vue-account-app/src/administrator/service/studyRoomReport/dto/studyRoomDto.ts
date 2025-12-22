export type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

export interface StudyRoomReport {
    reportId: number;
    reporterNickname: string;
    reportedUserNickname: string;
    studyRoomTitle: string;
    category: string;
    description: string;
    status: ReportStatus;
    createdAt: string; // ISO
}

export interface SearchReportsRequest {
    pageSize: number;
    lastId: number | null;
    status?: ReportStatus;
    q?: string;
}

export interface SearchReportsResponse {
    items: StudyRoomReport[];
    nextLastId: number | null;
    hasMore: boolean;
}
