import { createAxiosInstances, springAdminAxiosInst } from "@/account/utility/axiosInstance";
import {AwsDailyCost} from "@/administrator/service/AdminAwsCostExplorer/dto/AdminAwsCostExplorerDto.ts";

export function ensureSpringAdminAxios() {
    if (!springAdminAxiosInst) createAxiosInstances();
    return springAdminAxiosInst!;
}
export async function getAwsDailyCost(
    startISO: string,
    endISO: string
): Promise<AwsDailyCost[]> {
    const axios = ensureSpringAdminAxios();

    try {
        const resp = await axios.get<AwsDailyCost[]>("/api/aws/cost/daily", {
            params: { start: startISO, end: endISO },
            validateStatus: () => true,
        });

        if (resp.status === 200 && Array.isArray(resp.data)) {
            return resp.data;
        }
        if (resp.status === 204) {
            return [];
        }

        console.warn("[getAwsDailyCost] unexpected status:", resp.status, resp.data);
        return [];
    } catch (e) {
        console.error("[getAwsDailyCost] error:", e);
        return [];
    }
}
