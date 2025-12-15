import * as axiosUtility from "../utility/axiosInstance";
import axios from "axios";
import type { AxiosResponse } from "axios"; // ✅ 타입만 import
import { useAiInterviewStore } from "./aiInterviewStore";

// ✅ 회사명 매핑 유틸
const mapCompanyName = (original: string): string => {
    const mapping: Record<string, string> = {
        당근마켓: "danggeun",
        Toss: "toss",
        "SK-encore": "sk_encore",
        "KT M mobile": "kt_mobile",
    };
    return mapping[original] || original.toLowerCase().replace(/[\s-]+/g, "_");
};

export const aiInterviewActions = {
    //첫 질문
    async requestCreateInterviewToSpring(payload: {
        interviewType: string; // "COMPANY" | "TECH"
        company: string; // 회사명
        major: string; // 전공 여부 ("전공자" | "비전공자")
        career: string; // 경력 ("신입" | "3년 이하" | "5년 이하" | "10년 이하" | "10년 이상")
        projectExp: boolean; // 프로젝트 경험 여부
        job: string; // 직무 (Backend, Frontend 등)
        interviewAccountProjectRequests: Array<{
            projectName: string;
            projectDescription: string;
        }>; // 프로젝트 목록
        techStacks: string[]; // 기술 스택
        firstQuestion: string; // 첫 번째 질문
        firstAnswer: string; // 첫 번째 답변
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        const transformedPayload = {
            ...payload,
            company: payload.company ? mapCompanyName(payload.company) : "",
        };

        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/api/interview/create",
                transformedPayload,
                {
                    withCredentials: true
                }
            );
            return res.data;
        } catch (err) {
            console.error("requestCreateInterviewToSpring() -> error:", err);
            throw err;
        }
    },

    async requestListInterviewToDjango(
        userToken: string,
        page: number = 1,
        perPage: number = 10
    ): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview/list",
                { userToken, page, perPage }
            );
            return res.data;
        } catch (err) {
            console.error("requestListInterviewToDjango() → error:", err);
            throw err;
        }
    },

    async requestRemoveInterviewToDjango(payload: {
        userToken: string;
        interviewId: number;
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview/remove",
                {
                    payload,
                }
            );
            return res.data;
        } catch (error) {
            console.error("requestRemoveInterviewToDjango() → error:", error);
            throw error;
        }
    },

    //응답 생성
    async requestCreateAnswerToSpring(payload: {
        interviewId: number;
        interviewQAId: number;
        answer: string;
        interviewType: string;
        interviewSequence: number;
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();
        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/api/interview/progress",
                payload,
                {
                    withCredentials: true
                }
            );

            return res.data;
        } catch (err) {
            console.error("답변 저장 중 오류:", err);
            throw err;
        }
    },

    async requestEndInterviewToSpring(payload: {
        interviewId: number;
        interviewQAId: number;
        answer: string;
        sender: string;
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();
        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/api/interview/end",
                payload,
                {
                    withCredentials: true
                }
            );

            return res.data;
        } catch (err) {
            console.error("답변 저장 중 오류:", err);
            throw err;
        }
    },

    //첫 질문에 대한 심화질문
    async requestFollowUpQuestionToDjango(payload: {
        jobCategory: number;
        experienceLevel: number;
        academicBackground: number;
        projectExperience: number;
        userToken: string;
        interviewId: number;
        questionId: number;
        answerText: string;
        companyName: string;
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        const transformedPayload = {
            ...payload,
            companyName: mapCompanyName(payload.companyName),
        };

        try {
            console.log(payload);
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview/followup", // 백엔드 Django가 저장하고 FastAPI 호출
                transformedPayload
            );
            return res.data;
        } catch (error) {
            console.error("requestFollowUpQuestionToDjango() → error:", error);
            throw error;
        }
    },

    // 두번째 질문
    async requestProjectCreateInterviewToDjango(payload: {
        userToken: string;
        jobCategory: number; // 직무
        experienceLevel: number; // 경력
        projectExperience: number; // 프로젝트 경험 여부
        academicBackground: number; // 전공 여부
        interviewTechStack: number[]; // 기술
        interviewId: number;
        questionId: number;
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview/project-create",
                payload
            );
            console.log(res.data.question);
            return res.data;
        } catch (err) {
            console.error("requestProjectCreateInterviewToDjango() -> error:", err);
            throw err;
        }
    },

    // 두번째 심화질문
    async requestProjectFollowUpQuestionToDjango(payload: {
        jobCategory: number;
        projectExperience: number;
        experienceLevel: number;
        interviewTechStack: number[]; // 기술
        userToken: string;
        interviewId: number;
        questionId: number;
        answerText: string;
        companyName: string;
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        const transformedPayload = {
            ...payload,
            companyName: mapCompanyName(payload.companyName),
        };

        try {
            console.log(payload);
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview/project-followup", // 백엔드 Django가 저장하고 FastAPI 호출
                transformedPayload
            );
            return res.data;
        } catch (error) {
            console.error("requestFollowUpQuestionToDjango() → error:", error);
            throw error;
        }
    },

    // 세번째 심화질문
    async requestTechFollowUpQuestionToDjango(payload: {
        interviewTechStack: number[]; // 기술
        userToken: string;
        interviewId: number;
        questionId: number;
        answerText: string;
    }): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        const transformedPayload = {
            ...payload,
        };

        try {
            console.log(payload);
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview/tech-followup", // 백엔드 Django가 저장하고 FastAPI 호출
                transformedPayload
            );
            return res.data;
        } catch (error) {
            console.error("requestTechFollowUpQuestionToDjango() → error:", error);
            throw error;
        }
    },

    async requestGetScoreResultListToDjango(payload: {
        userToken: string;
        interviewId: number;
        jobCategory: number;
        experienceLevel: number;
        projectExperience: number;
        academicBackground: number;
        questionId: number;
        interviewTechStack: number[];
    }): Promise<string> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();
        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview_result/request-interview-summary",
                payload
            );
            return res.data.interviewResultList;
        } catch (error) {
            console.log("requestGetScoreResultListToDjango() 중 문제 발생:", error);
            throw error;
        }
    },

    //인터뷰 결과 조회
    async requestGetInterviewResultToSpring(interviewId: number): Promise<any> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();
        try {
            const res: AxiosResponse = await springAxiosInstance.get(
                `/api/interview/result/${interviewId}`,
                {
                    withCredentials: true
                }
            );
            return res.data;
        } catch (error: any) {
            if (error.response) {
                console.log("권한 없음!!!");
                return error.response;
            }
            throw error;
        }
    },

    //면접 종료
    async requestEndInterviewToDjango(payload: {
        userToken: string;
        interviewId: number;
        companyName: string;
    }): Promise<string> {
        const { springAxiosInstance } = axiosUtility.createAxiosInstances();

        const transformedPayload = {
            ...payload,
            companyName: mapCompanyName(payload.companyName),
        };

        try {
            const res: AxiosResponse = await springAxiosInstance.post(
                "/interview_result/end-interview",
                transformedPayload
            );
            return res.data;
        } catch (error) {
            console.log("requestSaveInterviewResultToDjango() 중 문제 발생:", error);
            throw error;
        }
    },
};
