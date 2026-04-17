const API_BASE = process.env.REACT_APP_API_BASE_URL ?? "";

const INTERVIEW_TYPE_LABEL_MAP: Record<string, string> = {
    TECHNICAL: "기술 면접",
    TECH: "기술 면접",
    COMPANY: "기업 면접",
    PERSONAL: "인성 면접",
    COMPREHENSIVE: "종합 면접",
};

const COMMENT_SECTION_TITLES = {
    overview: "전반적인 인상",
    strengths: "강점",
    improvements: "개선점",
    final: "최종 평가",
    grade: "종합 등급",
} as const;

export type InterviewSummary = {
    interviewId: number;
    interviewType: string;
    createdAt: string;
    sender: string;
    finished: boolean;
    title: string;
    role: string;
    status: string;
    totalScore: number;
    pdfUrl?: string;
};

export type InterviewQuestionDetail = {
    id: number;
    order: number;
    question: string;
    answer: string;
    feedback: string;
    idealAnswer: string;
    score: number;
    keywords: string[];
};

export type InterviewDetail = {
    id: number;
    title: string;
    role: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    totalScore: number;
    durationMinutes: number;
    questionCount: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    techKeywords: string[];
    questions: InterviewQuestionDetail[];
    pdfUrl?: string;
};

function pickFirst<T>(...values: T[]): T | undefined {
    return values.find(
        (value) => value !== undefined && value !== null && value !== ("" as T)
    );
}

function normalizeInterviewTypeLabel(value: unknown): string {
    if (typeof value !== "string") return "AI 모의 면접";
    return INTERVIEW_TYPE_LABEL_MAP[value] ?? value;
}

function normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "string") return item.trim();
                if (item && typeof item === "object") {
                    const maybe =
                        (item as Record<string, unknown>).name ??
                        (item as Record<string, unknown>).label ??
                        (item as Record<string, unknown>).keyword ??
                        (item as Record<string, unknown>).value;
                    return typeof maybe === "string" ? maybe.trim() : "";
                }
                return "";
            })
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\n|,/g)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeQuestions(rawQuestions: unknown): InterviewQuestionDetail[] {
    if (!Array.isArray(rawQuestions)) return [];

    return rawQuestions.map((item: any, index) => ({
        id: Number(
            pickFirst(item?.id, item?.questionId, item?.resultId, index + 1) ?? index + 1
        ),
        order: Number(
            pickFirst(item?.order, item?.sequence, item?.questionOrder, index + 1) ??
            index + 1
        ),
        question: String(
            pickFirst(
                item?.question,
                item?.questionText,
                item?.interviewQuestion,
                item?.prompt,
                `질문 ${index + 1}`
            ) ?? `질문 ${index + 1}`
        ),
        answer: String(
            pickFirst(item?.answer, item?.userAnswer, item?.myAnswer, item?.reply, "") ?? ""
        ),
        feedback: String(
            pickFirst(
                item?.feedback,
                item?.comment,
                item?.analysis,
                item?.evaluation,
                item?.correction,
                ""
            ) ?? ""
        ),
        idealAnswer: String(
            pickFirst(
                item?.idealAnswer,
                item?.exampleAnswer,
                item?.recommendedAnswer,
                item?.sampleAnswer,
                item?.correction,
                ""
            ) ?? ""
        ),
        score: Number(pickFirst(item?.score, item?.questionScore, item?.rating, 0) ?? 0),
        keywords: normalizeStringArray(
            pickFirst(item?.keywords, item?.keywordList, item?.tags, item?.intent, [])
        ),
    }));
}

function calculateTotalScoreFromHexagon(hexagonScore: unknown): number {
    if (!hexagonScore || typeof hexagonScore !== "object") return 0;

    const values = [
        (hexagonScore as Record<string, unknown>).communication,
        (hexagonScore as Record<string, unknown>).technical_skills,
        (hexagonScore as Record<string, unknown>).problem_solving,
        (hexagonScore as Record<string, unknown>).productivity,
        (hexagonScore as Record<string, unknown>).documentation_skills,
        (hexagonScore as Record<string, unknown>).flexibility,
    ].map((value) => Number(value ?? 0));

    const total = values.reduce((sum, value) => sum + value, 0);
    return total > 0 ? Math.round((total / 60) * 100) : 0;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCommentSection(comment: string, titles: string[]): string {
    if (!comment.trim()) return "";

    const titlePattern = titles.map(escapeRegExp).join("|");
    const nextSectionPattern = Object.values(COMMENT_SECTION_TITLES)
        .map(escapeRegExp)
        .join("|");

    const regex = new RegExp(
        `(?:\\*\\*)?(${titlePattern})(?:\\*\\*)?\\s*:?\\s*\\n?([\\s\\S]*?)(?=\\n(?:\\*\\*)?(?:${nextSectionPattern})(?:\\*\\*)?\\s*:|$)`,
        "i"
    );
    const match = comment.match(regex);
    return match?.[2]?.trim() ?? "";
}

function splitCommentSectionToList(section: string): string[] {
    if (!section.trim()) return [];

    return section
        .split(/\n+/)
        .map((line) => line.replace(/^[\-\*\d\.\)\s]+/, "").trim())
        .filter(Boolean);
}

function unwrapListResponse(raw: any): any[] {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.list)) return raw.list;
    if (Array.isArray(raw?.interviewResultList)) return raw.interviewResultList;
    if (Array.isArray(raw?.data?.list)) return raw.data.list;
    if (Array.isArray(raw?.data?.interviewResultList)) return raw.data.interviewResultList;
    return [];
}

export function normalizeInterviewSummary(item: any): InterviewSummary {
    const interviewType = normalizeInterviewTypeLabel(
        pickFirst(item?.interviewType, item?.type, item?.category)
    );
    const title = String(
        pickFirst(item?.title, item?.interviewTitle, item?.name, interviewType) ?? interviewType
    );
    const finished = Boolean(
        pickFirst(item?.finished, item?.isFinished, item?.completed, false)
    );
    const explicitTotalScore = Number(
        pickFirst(item?.totalScore, item?.score, item?.overallScore, 0) ?? 0
    );

    return {
        interviewId: Number(pickFirst(item?.interviewId, item?.id, item?.resultId, 0) ?? 0),
        interviewType,
        createdAt: String(
            pickFirst(item?.createdAt, item?.date, item?.interviewDate, item?.requestedAt, "") ??
            ""
        ),
        sender: String(pickFirst(item?.sender, item?.author, "AI") ?? "AI"),
        finished,
        title,
        role: String(
            pickFirst(
                item?.role,
                item?.jobRole,
                item?.intervieweeProfile?.job,
                item?.interviewType,
                interviewType
            ) ?? interviewType
        ),
        status: String(
            pickFirst(
                item?.status,
                item?.analysisStatus,
                item?.resultStatus,
                finished ? "분석 완료" : "진행 중"
            ) ?? (finished ? "분석 완료" : "진행 중")
        ),
        totalScore:
            explicitTotalScore || calculateTotalScoreFromHexagon(item?.hexagonScore),
        pdfUrl:
            pickFirst(
                item?.pdfUrl,
                item?.resultPdfUrl,
                item?.reportPdfUrl,
                item?.pdfFileUrl,
                item?.fileUrl,
                item?.reportUrl
            ) ?? undefined,
    };
}

export function normalizeInterviewDetail(raw: any, interviewId: number): InterviewDetail {
    const source = raw?.result ?? raw?.data ?? raw ?? {};
    const overallComment = String(
        pickFirst(
            source?.overallComment,
            source?.overallFeedback,
            source?.resultSummary,
            source?.summary,
            ""
        ) ?? ""
    );
    const questions = normalizeQuestions(
        pickFirst(
            source?.questions,
            source?.questionResults,
            source?.questionList,
            source?.feedbackList,
            source?.interviewResultList,
            []
        )
    );
    const parsedStrengths = splitCommentSectionToList(
        extractCommentSection(overallComment, [COMMENT_SECTION_TITLES.strengths])
    );
    const parsedImprovements = splitCommentSectionToList(
        extractCommentSection(overallComment, [COMMENT_SECTION_TITLES.improvements])
    );
    const fallbackSummary =
        extractCommentSection(overallComment, [
            COMMENT_SECTION_TITLES.final,
            COMMENT_SECTION_TITLES.overview,
        ]) || overallComment;
    const explicitTotalScore = Number(
        pickFirst(source?.totalScore, source?.score, source?.overallScore, 0) ?? 0
    );
    const totalScore =
        explicitTotalScore || calculateTotalScoreFromHexagon(source?.hexagonScore);

    return {
        id: Number(
            pickFirst(source?.interviewId, source?.id, source?.resultId, interviewId) ??
            interviewId
        ),
        title: String(
            pickFirst(
                source?.title,
                source?.interviewTitle,
                source?.name,
                normalizeInterviewTypeLabel(source?.interviewType),
                "AI 모의 면접 결과"
            ) ?? "AI 모의 면접 결과"
        ),
        role: String(
            pickFirst(
                source?.role,
                source?.intervieweeProfile?.job,
                normalizeInterviewTypeLabel(source?.interviewType),
                source?.jobRole,
                source?.category,
                "Interview"
            ) ?? "Interview"
        ),
        status: String(
            pickFirst(
                source?.status,
                source?.analysisStatus,
                source?.resultStatus,
                "분석 완료"
            ) ?? "분석 완료"
        ),
        createdAt: String(
            pickFirst(
                source?.createdAt,
                source?.date,
                source?.interviewDate,
                source?.requestedAt,
                "-"
            ) ?? "-"
        ),
        completedAt: String(
            pickFirst(source?.completedAt, source?.finishedAt, source?.updatedAt, "") ?? ""
        ),
        totalScore,
        durationMinutes: Number(
            pickFirst(source?.durationMinutes, source?.duration, source?.elapsedMinutes, 0) ?? 0
        ),
        questionCount:
            questions.length ||
            Number(pickFirst(source?.questionCount, source?.totalQuestionCount, 0) ?? 0),
        summary: String(
            pickFirst(
                source?.summary,
                source?.overallComment,
                source?.overallFeedback,
                source?.resultSummary,
                fallbackSummary,
                "면접 분석 결과를 불러왔습니다."
            ) ?? "면접 분석 결과를 불러왔습니다."
        ),
        strengths: normalizeStringArray(
            pickFirst(
                source?.strengths,
                source?.goodPoints,
                source?.strongPoints,
                parsedStrengths,
                []
            )
        ),
        improvements: normalizeStringArray(
            pickFirst(
                source?.improvements,
                source?.weakPoints,
                source?.toImprove,
                parsedImprovements,
                []
            )
        ),
        techKeywords: normalizeStringArray(
            pickFirst(
                source?.techKeywords,
                source?.techStack,
                source?.stacks,
                source?.keywords,
                []
            )
        ),
        questions,
        pdfUrl:
            pickFirst(
                source?.pdfUrl,
                source?.resultPdfUrl,
                source?.reportPdfUrl,
                source?.pdfFileUrl,
                source?.fileUrl,
                source?.reportUrl
            ) ?? undefined,
    };
}

async function requestJson<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        credentials: "include",
    });

    if (response.status === 403) {
        throw new Error("접근 권한이 없습니다.");
    }

    if (!response.ok) {
        throw new Error(`Interview API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function getInterviewResultList(): Promise<InterviewSummary[]> {
    const raw = await requestJson<any>("/api/interview/result/list");
    return unwrapListResponse(raw).map(normalizeInterviewSummary);
}

export async function getInterviewResultDetail(
    interviewId: number
): Promise<InterviewDetail> {
    const raw = await requestJson<any>(`/api/interview/result/${interviewId}`);
    return normalizeInterviewDetail(raw, interviewId);
}