export type SurveyQuestionType = "SINGLE_CHOICE" | "LINEAR_SCALE" | "LONG_TEXT";

export interface SurveyOption {
    code: string;
    label: string;
}

export interface SurveyScale {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
}

export interface SurveyQuestion {
    code: string;
    title: string;
    type: SurveyQuestionType;
    required: boolean;
    options: SurveyOption[] | null;
    scale: SurveyScale | null;
}

export interface GetActiveSurveyResponse {
    formCode: string;
    version: number;
    title: string;
    description: string;
    questions: SurveyQuestion[];
}

export interface SubmitSurveyAnswerRequest {
    questionCode: string;
    selectedOptionCode?: string;
    scaleValue?: number;
    textAnswer?: string;
}

export interface SubmitSurveyResponseRequest {
    answers: SubmitSurveyAnswerRequest[];
}

export interface SubmitSurveyResponse {
    responseId: number;
    formCode: string;
    submittedAt: string;
}