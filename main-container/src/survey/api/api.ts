import type {
    GetActiveSurveyResponse,
    SubmitSurveyResponse,
    SubmitSurveyResponseRequest,
} from "./types.ts";

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function parseErrorMessage(response: Response): Promise<string> {
    try {
        const data = await response.json();
        if (typeof data?.message === "string" && data.message.trim()) {
            return data.message;
        }
    } catch {
        // ignore
    }

    switch (response.status) {
        case 401:
            return "로그인이 필요합니다.";
        case 404:
            return "진행 중인 설문이 없습니다.";
        case 409:
            return "이미 이 설문에 참여하셨습니다.";
        default:
            return "처리 중 오류가 발생했습니다.";
    }
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function getActiveSurvey(): Promise<GetActiveSurveyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/me/surveys/active`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new ApiError(response.status, await parseErrorMessage(response));
    }

    return response.json();
}

export async function submitActiveSurvey(
    payload: SubmitSurveyResponseRequest
): Promise<SubmitSurveyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/me/surveys/active/responses`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new ApiError(response.status, await parseErrorMessage(response));
    }

    return response.json();
}