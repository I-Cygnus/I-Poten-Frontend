import {ensureSpringAdminAxios} from "@/administrator/service/AdminAwsCostExplorer/AdminAwsCostExplorerApi.ts"

export type OpenAiDailyCost = {
    date: string;       // YYYY-MM-DD
    amount: number;     // 하루 비용
    currency?: string;  // 통화(옵션, 예: USD, KRW)
};

// 서버는 문자열(JSON 텍스트)을 반환한다고 하셨으므로
// 응답이 JSON 문자열이면 파싱해서 배열로 변환하는 방식.
export async function getOpenAiDailyCost(startISO: string, endISO: string): Promise<OpenAiDailyCost[]> {
    const axios = ensureSpringAdminAxios();
    const resp = await axios.get<string>("/administrator/management/openaicost", {
        params: { start: startISO, end: endISO },
        // cookie(userToken)는 withCredentials로 전송됨
        validateStatus: () => true,
    });

    if (resp.status !== 200 || !resp.data) return []

    // 서버가 ResponseEntity<String> 으로 JSON 문자열을 주는 형태 고려
    let payload: any
    try {
        payload = typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data
    } catch {
        payload = resp.data
    }

    const buckets: any[] = Array.isArray(payload?.data) ? payload.data : []

    const rows: OpenAiDailyCost[] = buckets.map((b) => {
        const startEpoch = Number(b?.start_time) // 초 단위
        const startDate = new Date(startEpoch * 1000)
        const dateStr = toISODate(startDate)

        const { amount, currency } = reduceResults(Array.isArray(b?.results) ? b.results : [])
        return { date: dateStr, amount, currency }
    })

    // 안전 가드(정렬/쓰레기 제거)
    return rows
        .filter(r => !!r && typeof r.date === "string")
        .sort((a, b) => a.date.localeCompare(b.date))
}
// YYYY-MM-DD 생성 (로컬 타임존)
function toISODate(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

// 숫자 안전 변환
function toNumber(x: any): number {
    const n = Number(x)
    return Number.isFinite(n) ? n : 0
}

// results 배열 -> 금액 합계/통화 추출
function reduceResults(results: any[]): { amount: number; currency?: string } {
    if (!Array.isArray(results) || results.length === 0) {
        return { amount: 0 }
    }
    // amount 합산, currency는 첫 번째 truthy 우선
    let sum = 0
    let currency: string | undefined = undefined
    for (const r of results) {
        if (currency == null && typeof r?.currency === "string" && r.currency.length > 0) {
            currency = r.currency
        }
        sum += toNumber(r?.amount)
    }
    return { amount: sum, currency }
}