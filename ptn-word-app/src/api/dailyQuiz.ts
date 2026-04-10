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
    initialsHint?: string | null;
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

export type DailyStartMode = "RESUME" | "TODAY";

export type DailyStartResponse = {
    todayYmd: string;     // 서버 기준 오늘(KST)
    activeYmd: string;    // 실제로 내려준 데일리(어제일 수도)
    carryOver: boolean;   // todayYmd != activeYmd
    issueType: string;
    seedMode: string;
    sessions: DailyStartSession[];
};

export async function startGeneralDaily(
    mode: DailyStartMode = "RESUME"
): Promise<DailyStartResponse> {
    const { data } = await http.post(
        `/api/me/quiz/daily/general/start?mode=${mode}`,
        null,
        { withCredentials: true }
    );
    return data;
}

export type CheckDailyQuestionRequest = {
    /** CHOICE용 */
    choiceId?: number;

    /** OX용 */
    oxAnswer?: "O" | "X";

    /** INITIALS용 */
    answerText?: string;
};

export type CheckDailyQuestionResponse = {
    correct: boolean;
    correctChoiceId?: number | null;
    explanation?: string | null;
    nextQuestionId?: number | null;
    submitted?: boolean;
};

export async function checkDailyQuestion(
    sessionId: number,
    questionId: number,
    payload: CheckDailyQuestionRequest
): Promise<CheckDailyQuestionResponse> {
    const { data } = await http.post(
        `/me/quiz/daily/sessions/${sessionId}/questions/${questionId}/check`,
        payload,
        { withCredentials: true }
    );
    return data?.data ?? data;
}