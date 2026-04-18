/**
 * 면접 결과 조회 어드민 DTO
 * ----------------------------------------------------
 * 서버 엔드포인트 제안 (백엔드 구현 예정):
 *   POST /administrator/management/interview/users
 *   POST /administrator/management/interview/users/:userId/history
 *   GET  /administrator/management/interview/:interviewId
 *
 * 기존 mypage-app/src/api/InterviewApi.ts 의 InterviewSummary / InterviewDetail 스키마를
 * 어드민 뷰에 맞춰 확장 (유저 정보 포함, 전체 범위 조회).
 */

/** 면접 유형 (서버 enum). 기존 INTERVIEW_TYPE_LABEL_MAP과 호환 */
export type InterviewType = "TECHNICAL" | "TECH" | "PERSONAL" | "COMPANY" | "COMPREHENSIVE";

/** 유형 → 한국어 짧은 라벨 (어드민 밀도를 위해 "면접" 접미 제거) */
export const INTERVIEW_TYPE_LABEL: Record<InterviewType, string> = {
    TECHNICAL: "기술",
    TECH: "기술",
    PERSONAL: "인성",
    COMPANY: "기업",
    COMPREHENSIVE: "종합",
};

/** Vuetify chip color 매핑 */
export const INTERVIEW_TYPE_COLOR: Record<InterviewType, string> = {
    TECHNICAL: "primary",
    TECH: "primary",
    PERSONAL: "success",
    COMPANY: "info",
    COMPREHENSIVE: "secondary",
};

export type InterviewStatus = string;

/* ------------------------------------------------------------------ */
/* Level 1 — 회원 리스트                                               */
/* ------------------------------------------------------------------ */

export type AdminInterviewUsersRequest = {
    pageSize: number;
    lastAccountId: number | null;
    q?: string;
    startDate?: string | null;
    endDate?: string | null;
    types?: InterviewType[];
};

export type AdminInterviewUser = {
    id: number;
    email: string;
    nickname: string;
    joinedAt: string;
    role: "ADMIN" | "USER";
    interviewCount: number;
    lastInterviewAt: string | null;
    interviewTypes: InterviewType[];
};

export type AdminInterviewUsersResponse = {
    items: AdminInterviewUser[];
    pageSize: number;
    hasNext: boolean;
    nextCursor: number | null;
};

/* ------------------------------------------------------------------ */
/* Level 2 — 특정 유저의 면접 이력                                      */
/* ------------------------------------------------------------------ */

export type AdminInterviewHistoryRequest = {
    pageSize: number;
    lastInterviewId: number | null;
    startDate?: string | null;
    endDate?: string | null;
    types?: InterviewType[];
};

export type AdminInterviewHistoryItem = {
    interviewId: number;
    interviewType: InterviewType;
    title: string;
    role: string;
    createdAt: string;
    completedAt: string | null;
    durationMinutes: number;
    questionCount: number;
    totalScore: number;
    status: InterviewStatus;
    finished: boolean;
};

export type AdminInterviewHistoryResponse = {
    user: {
        id: number;
        email: string;
        nickname: string;
        role: "ADMIN" | "USER";
        joinedAt: string;
    };
    summary: {
        totalCount: number;
        lastInterviewAt: string | null;
        averageScore: number;
    };
    items: AdminInterviewHistoryItem[];
    pageSize: number;
    hasNext: boolean;
    nextCursor: number | null;
};

/* ------------------------------------------------------------------ */
/* Level 3 — 면접 상세                                                 */
/* ------------------------------------------------------------------ */

export type AdminInterviewQuestion = {
    id: number;
    order: number;
    question: string;
    answer: string;
    feedback: string;
    idealAnswer: string;
    score: number;
    keywords: string[];
};

export type AdminInterviewDetail = {
    id: number;
    interviewType: InterviewType;
    title: string;
    role: string;
    status: InterviewStatus;
    finished: boolean;
    createdAt: string;
    completedAt: string | null;
    durationMinutes: number;
    questionCount: number;
    totalScore: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    techKeywords: string[];
    questions: AdminInterviewQuestion[];
    pdfUrl?: string;
    owner: {
        id: number;
        email: string;
        nickname: string;
    };
};
