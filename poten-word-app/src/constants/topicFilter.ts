export type TopicFilter = {
    source: "term_category";
    termCategoryId: number;
    labelKeys?: readonly string[];
};

export const TOPIC_FILTERS = {
    js:    { source: "term_category", termCategoryId: 12 },
    react: { source: "term_category", termCategoryId: 14, labelKeys: ["react"] },
    vue:   { source: "term_category", termCategoryId: 14, labelKeys: ["vue"] },
    html:  { source: "term_category", termCategoryId: 11 },
    a11y:  { source: "term_category", termCategoryId: 16 },
    ts:    { source: "term_category", termCategoryId: 97 },
    sql:   { source: "term_category", termCategoryId: 24 },
    rest:  { source: "term_category", termCategoryId: 31 },
    devops:{ source: "term_category", termCategoryId: 64 },
    sec:   { source: "term_category", termCategoryId: 18 },
} as const;

export type TopicId = keyof typeof TOPIC_FILTERS;
export type TopicFilterDef = (typeof TOPIC_FILTERS)[TopicId];

export function getTopicFilter(topicId: string): TopicFilterDef | null {
    return (TOPIC_FILTERS as Record<string, TopicFilterDef>)[topicId] ?? null;
}
