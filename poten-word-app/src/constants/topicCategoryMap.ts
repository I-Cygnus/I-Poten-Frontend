export type TopicSource = "set" | "term_category";

export const TOPIC_TO_SCOPE = {
    /** ===== Frontend ===== */
    react: { source: "set", quizSetKey: "FE_REACT_MCQ_SET" },
    vue:   { source: "set", quizSetKey: "FE_VUE_MCQ_SET" },

    js:    { source: "term_category", termCategoryId: 12 },
    html:  { source: "term_category", termCategoryId: 11 },
    a11y:  { source: "term_category", termCategoryId: 16 },
    ts:    { source: "term_category", termCategoryId: 97 },

    /** ===== Backend/DB/Infra ===== */
    sql:   { source: "term_category", termCategoryId: 24 },
    rest:  { source: "term_category", termCategoryId: 31 },
    spring:{ source: "term_category", termCategoryId: 21 },
    devops:{ source: "term_category", termCategoryId: 64 },
    redis: { source: "term_category", termCategoryId: 27 },
    sec:   { source: "term_category", termCategoryId: 18 },

    /** ===== AI ===== */
    rag:   { source: "term_category", termCategoryId: 77 },
    exp:   { source: "term_category", termCategoryId: 79 },
    mlops: { source: "term_category", termCategoryId: 81 },
    de:    { source: "term_category", termCategoryId: 78 },
    perf:  { source: "term_category", termCategoryId: 69 },
    gov:   { source: "term_category", termCategoryId: 80 },
} as const;

export type TopicId = keyof typeof TOPIC_TO_SCOPE;
export type TopicScope = (typeof TOPIC_TO_SCOPE)[TopicId];

export function resolveTopicScope(topicId: string): TopicScope | null {
    return (TOPIC_TO_SCOPE as Record<string, TopicScope>)[topicId] ?? null;
}
