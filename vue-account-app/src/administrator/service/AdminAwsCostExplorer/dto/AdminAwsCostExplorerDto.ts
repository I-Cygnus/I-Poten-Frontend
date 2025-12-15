export interface AwsDailyCost {
    date: string;     // ISO yyyy-MM-dd
    amount: number;   // 일자별 비용
    currency?: string;
};