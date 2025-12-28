import http from "../utils/http";

export type DailyQuestionType = "CHOICE" | "OX" | "INITIALS";

export type StartedOption = {
    choiceId: number;
    text: string;
    isAnswer?: boolean;
};

export type StartedItem = {
    questionId: number;
    questionType: DailyQuestionType;
    questionText: string;
    explanation?: string | null;
    correctChoiceId?: number | null;
    options: StartedOption[];
    answerText?: string | null;
};

export type DailyStartSession = {
    questionType: DailyQuestionType;
    sessionId: number;
    count: number;
    title: string;
    questionIds?: number[] | null;
    items?: StartedItem[] | null;
};

export type DailyStartResponse = {
    ymd: string;        // 백엔드는 LocalDate라 문자열로 옴
    issueType: string;  // "GENERAL"
    seedMode: string;   // "DAILY -> FIXED" 등
    sessions: DailyStartSession[];
};

export async function startGeneralDaily(): Promise<DailyStartResponse> {
    const { data } = await http.post("/api/me/quiz/daily/general/start", null, {
        withCredentials: true,
    });
    return data;
}
