function ensureApi(url?: string) {
    const base = String(url ?? "").trim().replace(/\/+$/, "");
    if (!base) return "http://localhost:8080/api";
    return base.endsWith("/api") ? base : `${base}/api`;
}

function detectApiBase(): string {
    const fromWindow = (globalThis as any)?.__API_BASE__;
    if (typeof fromWindow === "string" && fromWindow) {
        return ensureApi(fromWindow);
    }

    const fromDefine =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.VITE_API_BASE_URL ||
        process.env.VITE_API_BASE ||
        process.env.NEXT_PUBLIC_API_BASE ||
        process.env.API_BASE;

    if (fromDefine) {
        return ensureApi(fromDefine);
    }

    if (typeof window !== "undefined" && window.location?.origin) {
        return ensureApi(window.location.origin);
    }

    return "http://localhost:8080/api";
}

const API_BASE = detectApiBase();
const TIMELINE_PAGE_SIZE = 200;

export type QuizDashboardStats = {
    solvedQuestions: number;
    averageAccuracy: number;
    streakDays: number;
};

export type QuizSessionSummary = {
    id: string | number;
    sessionId: number | null;
    title: string;
    category: string | null;
    solved: number;
    accuracy: number;
    studiedAt: string;
};

export type QuizTimelineRecord = {
    id: string | number;
    sessionId: number | null;
    title: string;
    category: string | null;
    total: number;
    correct: number;
    accuracy: number;
    studiedAt: string;
};

export type QuizWrongNoteSummary = {
    reviewId: number;
    questionId: number;
    prompt: string;
    questionType: string;
    difficulty: string | null;
    categoryLabel: string | null;
    sessionTitle: string | null;
    answeredAt: string;
    resolved: boolean;
    userAnswer: string | null;
    correctAnswer: string | null;
};

type QuizTimelineItem = {
    id: string | number;
    sessionId: number | null;
    title: string;
    category: string | null;
    date: string;
    total: number;
    correct: number;
};

type QuizTimelinePage = {
    accuracy: number | null;
    total: number;
    items: QuizTimelineItem[];
};

function pickNumber(...values: unknown[]): number | null {
    for (const value of values) {
        const num = Number(value);
        if (Number.isFinite(num)) return num;
    }
    return null;
}

function toDateKey(value: string): string | null {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        const raw = value.trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey: string, days: number) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
    const nextDay = String(date.getDate()).padStart(2, "0");
    return `${nextYear}-${nextMonth}-${nextDay}`;
}

function toLocalDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function calculateStreak(items: QuizTimelineItem[]) {
    const uniqueDays = new Set(
        items
            .map((item) => toDateKey(item.date))
            .filter((value): value is string => Boolean(value))
    );

    if (uniqueDays.size === 0) return 0;

    const today = toLocalDateKey(new Date());
    const yesterday = shiftDateKey(today, -1);
    let cursor = uniqueDays.has(today) ? today : uniqueDays.has(yesterday) ? yesterday : null;

    if (!cursor) return 0;

    let streak = 0;
    while (cursor && uniqueDays.has(cursor)) {
        streak += 1;
        cursor = shiftDateKey(cursor, -1);
    }

    return streak;
}

function formatDateLabel(value: string) {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
}

function safeText(value: unknown) {
    return String(value ?? "").trim();
}

async function requestJson<T>(path: string, params?: Record<string, string | number>) {
    const search = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        search.set(key, String(value));
    });

    const query = search.toString();
    const response = await fetch(`${API_BASE}${path}${query ? `?${query}` : ""}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Quiz stats request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

function normalizeTimelinePage(raw: any): QuizTimelinePage {
    const body = raw?.data ?? raw ?? {};
    const itemsRaw = Array.isArray(body?.items) ? body.items : [];

    return {
        accuracy: pickNumber(body?.summary?.accuracy, body?.accuracy),
        total: Number(body?.total ?? body?.totalElements ?? itemsRaw.length ?? 0),
        items: itemsRaw.map((item: any) => ({
            id: item?.id ?? item?.sessionId ?? `${item?.date ?? item?.playedAt ?? "quiz"}-${item?.title ?? item?.originTitle ?? "session"}`,
            sessionId: Number.isFinite(Number(item?.sessionId ?? item?.id))
                ? Number(item?.sessionId ?? item?.id)
                : null,
            title: String(item?.title ?? item?.originTitle ?? item?.category ?? "퀴즈 학습"),
            category:
                item?.category == null && item?.categoryName == null
                    ? null
                    : String(item?.category ?? item?.categoryName),
            date: String(item?.date ?? item?.playedAt ?? item?.createdAt ?? ""),
            total: Number(
                item?.total ??
                    item?.questionCount ??
                    item?.totalQuestions ??
                    item?.questionTotal ??
                    0
            ),
            correct: Number(
                item?.correct ??
                    item?.correctCount ??
                    item?.correctAnswers ??
                    0
            ),
        })),
    };
}

async function fetchTimelinePage(page: number) {
    const raw = await requestJson<any>("/me/quiz/timeline", {
        page,
        size: TIMELINE_PAGE_SIZE,
    });
    return normalizeTimelinePage(raw);
}

export async function getQuizDashboardStats(): Promise<QuizDashboardStats> {
    const firstPage = await fetchTimelinePage(0);
    const pageCount = Math.max(1, Math.ceil(firstPage.total / TIMELINE_PAGE_SIZE));

    const restPages =
        pageCount > 1
            ? await Promise.all(
                  Array.from({ length: pageCount - 1 }, (_, index) => fetchTimelinePage(index + 1))
              )
            : [];

    const allPages = [firstPage, ...restPages];
    const allItems = allPages.flatMap((page) => page.items);

    const solvedQuestions = allItems.reduce(
        (sum, item) => sum + Math.max(0, Number(item.total) || 0),
        0
    );
    const correctAnswers = allItems.reduce(
        (sum, item) => sum + Math.max(0, Number(item.correct) || 0),
        0
    );

    const averageAccuracy =
        firstPage.accuracy !== null
            ? Math.round(firstPage.accuracy)
            : solvedQuestions > 0
              ? Math.round((correctAnswers / solvedQuestions) * 100)
              : 0;

    return {
        solvedQuestions,
        averageAccuracy,
        streakDays: calculateStreak(allItems),
    };
}

export async function getRecentQuizSessions(limit = 3): Promise<QuizSessionSummary[]> {
    const firstPage = await fetchTimelinePage(0);

    return firstPage.items.slice(0, limit).map((item) => ({
        id: item.id,
        sessionId: item.sessionId,
        title: item.title,
        category: item.category,
        solved: Math.max(0, Number(item.total) || 0),
        accuracy:
            item.total > 0
                ? Math.round((Math.max(0, Number(item.correct) || 0) / item.total) * 100)
                : 0,
        studiedAt: formatDateLabel(item.date),
    }));
}

export async function getQuizTimelineRecords(limit = 6): Promise<QuizTimelineRecord[]> {
    const firstPage = await fetchTimelinePage(0);

    return firstPage.items.slice(0, limit).map((item) => ({
        id: item.id,
        sessionId: item.sessionId,
        title: item.title,
        category: item.category,
        total: Math.max(0, Number(item.total) || 0),
        correct: Math.max(0, Number(item.correct) || 0),
        accuracy:
            item.total > 0
                ? Math.round((Math.max(0, Number(item.correct) || 0) / item.total) * 100)
                : 0,
        studiedAt: formatDateLabel(item.date),
    }));
}

function normalizeWrongNote(raw: any): QuizWrongNoteSummary | null {
    const reviewId = pickNumber(
        raw?.reviewId,
        raw?.review_id,
        raw?.wrongNoteId,
        raw?.wrong_note_id,
        raw?.id,
        raw?.quizReviewId,
        raw?.quiz_review_id
    );
    const questionId = pickNumber(
        raw?.questionId,
        raw?.question_id,
        raw?.qid,
        raw?.quizQuestionId,
        raw?.quiz_question_id,
        raw?.question?.id,
        raw?.quizQuestion?.id
    );

    if (reviewId === null || questionId === null) {
        return null;
    }

    const prompt =
        safeText(
            raw?.prompt ??
                raw?.questionText ??
                raw?.question?.prompt ??
                raw?.question?.title ??
                raw?.stem
        ) || "문제 내용이 없습니다.";

    const answeredAtRaw = safeText(
        raw?.answeredAt ?? raw?.wrongAt ?? raw?.submittedAt ?? raw?.createdAt
    );

    return {
        reviewId,
        questionId,
        prompt,
        questionType: safeText(
            raw?.questionType ?? raw?.type ?? raw?.question?.questionType ?? raw?.question?.type
        ).toUpperCase() || "CHOICE",
        difficulty:
            safeText(
                raw?.difficulty ?? raw?.level ?? raw?.question?.difficulty ?? raw?.question?.level
            ).toUpperCase() || null,
        categoryLabel:
            safeText(raw?.categoryLabel ?? raw?.category?.label ?? raw?.termCategoryLabel) || null,
        sessionTitle: safeText(raw?.sessionTitle ?? raw?.session?.title) || null,
        answeredAt: formatDateLabel(answeredAtRaw),
        resolved: Boolean(
            raw?.resolved ??
                raw?.isResolved ??
                (safeText(raw?.status).toUpperCase() === "RESOLVED")
        ),
        userAnswer: safeText(raw?.userAnswer ?? raw?.selected ?? raw?.myAnswer ?? raw?.answerGiven) || null,
        correctAnswer:
            safeText(
                raw?.correctAnswer ??
                    raw?.answer ??
                    raw?.question?.answer ??
                    raw?.question?.correctAnswer
            ) || null,
    };
}

export async function getRecentWrongNotes(limit = 5): Promise<QuizWrongNoteSummary[]> {
    const raw = await requestJson<any>("/me/quiz/reviews/wrong", {
        page: 0,
        size: limit,
        sort: "RECENT",
        includeAnswers: "true",
    });

    const body = raw?.data ?? raw?.result ?? raw?.response ?? raw ?? {};
    const itemsRaw = Array.isArray(body)
        ? body
        : Array.isArray(body?.items)
          ? body.items
          : Array.isArray(body?.content)
            ? body.content
            : Array.isArray(body?.list)
              ? body.list
              : [];

    return itemsRaw
        .map((item: any) => normalizeWrongNote(item))
        .filter((item: QuizWrongNoteSummary | null): item is QuizWrongNoteSummary => Boolean(item));
}
