// api/dailyQuiz.ts
import http from "../utils/http";

export type DailyPart = "DAILY_CHOICE" | "DAILY_OX" | "DAILY_INITIALS";
export type DailyPlan = {
    date: string;
    part: DailyPart;
    role: string;
    quizSetId: number;
    questionIds: number[];
    questionCount: number;
    setTitle?: string;
    exists?: boolean;
};

function normalizePlan(d: any): DailyPlan {
    const partCore = String(d.part || "CHOICE").toUpperCase().replace(/^DAILY_/, "");
    return {
        date: d.date,
        part: (`DAILY_${partCore}` as DailyPart),
        role: d.role,
        quizSetId: Number(d.quizSetId),
        questionIds: d.questionIds ?? [],
        questionCount: d.totalQuestions ?? d.questionCount ?? (d.questionIds?.length ?? 0),
        setTitle: d.title ?? d.setTitle,
        exists: d.exists ?? true,
    };
}

export async function fetchDailyPlan({ part, role, date }: { part: string; role?: string; date?: string }) {
    // dev 프록시/환경변수 정리 후에는 이 경로 하나면 충분
    const res = await http.get("/daily/plan", {
        params: { part: String(part).toUpperCase().replace(/^DAILY_/,""), role, date },
    });
    const raw = res.data?.data ?? res.data;
    return normalizePlan(raw);
}
