export type TopicFilter =
    | { source: "term_category"; termCategoryId: number; labelKeys?: string[] }
    | { source: "labels"; labelKeys: string[] }
    | {
    source: "multi";
    filters: Array<{ termCategoryId: number; labelKeys?: string[] }>;
};

export const TOPIC_FILTERS = {
    js:    { source: "term_category", termCategoryId: 12 },
    react: { source: "term_category", termCategoryId: 14, labelKeys: ["react"] },
    vue:   { source: "term_category", termCategoryId: 14, labelKeys: ["vue"] },
    html:  { source: "term_category", termCategoryId: 11 },
    a11y:  { source: "term_category", termCategoryId: 16 },
    ts:    { source: "term_category", termCategoryId: 97 },
    sql:   { source: "labels", labelKeys: ["sql"] },
    rest:  { source: "labels", labelKeys: ["http", "rest", "api"] },
    spring:{ source: "labels", labelKeys: ["java", "spring", "springboot"] },
    devops:{ source: "labels", labelKeys: ["devops", "cloud"] },
    redis: { source: "labels", labelKeys: ["devops", "cloud"] },
    sec:   { source: "labels", labelKeys: ["security", "authentication"] },
    "dsa-complexity": { source: "labels", labelKeys: ["big_o", "responsible_time_complexity"] },
    "dsa-sorting": { source: "labels", labelKeys: ["sorting", "searching", "complexity"] },
    "dsa-hash": { source: "labels", labelKeys: ["hash", "set"] },
    "dsa-stack-queue": { source: "labels", labelKeys: ["stack", "queue", "heap"] },
    "dsa-graph": { source: "labels", labelKeys: ["graph", "bfs", "dfs"] },
    "dsa-dp-greedy": { source: "labels", labelKeys: ["dp", "greedy", "two_pointers"] },
    "rag": { source: "labels", labelKeys: ["llm", "rag", "finetuning"] },
    "exp": { source: "labels", labelKeys: ["experimental_design", "model_evaluation"] },
    "mlops": { source: "term_category", termCategoryId: 81, labelKeys: ["mlops", "production"]  },
    "de": { source: "labels", labelKeys: ["data_engineering"] },
    "perf": { source: "labels", labelKeys: ["performance_optimization", "acceleration"] },
    "gov": { source: "labels", labelKeys: ["responsible_ai", "governance"] },
} as const satisfies Record<string, TopicFilter>;

export type TopicId = keyof typeof TOPIC_FILTERS;

export function getTopicFilter(topicId: string): TopicFilter | null {
    // string 인덱싱 안전하게
    return (TOPIC_FILTERS as Record<string, TopicFilter>)[topicId] ?? null;
}

export function isMultiFilter(filter: TopicFilter): filter is Extract<TopicFilter, { source: "multi" }> {
    return filter.source === "multi";
}