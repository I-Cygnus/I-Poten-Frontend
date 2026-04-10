import http, { authHeader } from "../utils/http";

export type RetryWrongResponse = {
    newSessionId: number;
    questionType: string;
    questionCount: number;
    playPath?: string;
};

export async function fetchChoiceQuestionsBySetId(setId: number) {
    const res = await http.get(`/quiz/choice/sets/${setId}/questions`);
    // 백엔드 스키마에 맞춰 파싱
    return Array.isArray(res.data?.questions) ? res.data.questions : res.data;
}

export async function retryWrongOnly(sessionId: number): Promise<RetryWrongResponse> {
    const res = await http.post(
        `/me/quiz/sessions/${sessionId}/retry-wrong`,
        {},
        { headers: authHeader(), withCredentials: true, validateStatus: () => true }
    );

    if (res.status < 200 || res.status >= 300) {
        const msg = (res.data && (res.data.message || res.data.error)) || `HTTP ${res.status}`;
        throw new Error(msg);
    }

    const body = res.data?.data ?? res.data ?? {};

    // 다양한 필드명 대응
    let newSessionId: any =
        body.newSessionId ??
        body.sessionId ??
        body.new_session_id ??
        body.session_id ??
        body.id ??
        body?.session?.id;

    // 헤더 Location에서 폴백 추출: /me/quiz/sessions/{id}
    if (!Number.isFinite(Number(newSessionId))) {
        const loc = (res.headers?.location || res.headers?.Location || "").toString();
        const m = /\/sessions\/(\d+)/.exec(loc);
        if (m) newSessionId = Number(m[1]);
    }

    const questionType = String(
        body.questionType ??
        body.question_type ??
        body.type ??
        body?.session?.questionType ??
        ""
    ).toUpperCase();

    const questionCount =
        body.questionCount ??
        body.total ??
        body.count ??
        body.size ??
        0;

    const playPath =
        body.playPath ??
        body.play_path ??
        body.url ??
        body.playUrl ??
        body.play_url ??
        undefined;

    if (!Number.isFinite(Number(newSessionId))) {
        console.error("[retryWrongOnly] raw response without session id:", body, res.headers);
        throw new Error("Invalid newSessionId");
    }

    return {
        newSessionId: Number(newSessionId),
        questionType,
        questionCount: Number(questionCount) || 0,
        playPath,
    };
}
