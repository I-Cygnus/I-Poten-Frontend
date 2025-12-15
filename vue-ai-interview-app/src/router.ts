import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// 페이지 컴포넌트 import
import AiInterview from '../src/ai-interview/pages/ai-interview.vue';
import AiInterviewLLM from '../src/ai-interview/pages/llm-test/ai-interview-llm.vue';
import AiInterviewAnswerResult from '../src/ai-interview/pages/result/ai-interview-answer-result.vue';
import AiInterviewLandingpage from "@/ai-interview/pages/ai-interview-landingpage.vue";
import AiInterviewSelect from "@/ai-interview/pages/ai-interview-select.vue";
import AiInterviewDetail from "@/ai-interview/pages/ai-interview-detail.vue";
import AiInterviewForm from "@/ai-interview/pages/ai-interview-form.vue";
import AiInterviewEnd from "@/ai-interview/pages/ai-interview-end.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/ai-test',
        component: AiInterview,
    },
    {
        path: '/ai-interview/llm-test',
        component: AiInterviewLLM,
    },
    {
        path: '/ai-interview/landing',
        component: AiInterviewLandingpage,
    },
    {
        path: '/ai-interview/select',
        name: 'ai-interview-select',
        component: AiInterviewSelect,
    },
    {
        path: '/ai-interview/detail/:type',
        name: 'ai-interview-detail',
        component: AiInterviewDetail,
        props: true,
    },

    {
        path: '/test',
        name: 'test',
        component: LoadingSpinner,
        props: true,
    },

    {
        path: '/ai-interview/form/:type/:subType?/:company?',
        name: 'ai-interview-form',
        component: AiInterviewForm,
        props: true,
    },
    {
        path: '/ai-interview/result/:interviewId',
        component: AiInterviewAnswerResult,
        props: true,
    },
    {
        path: '/ai-interview/end',
        name: 'ai-interview-end',
        component: AiInterviewEnd,
    },
    // 필요하다면 기타 라우트 추가
    { path: "/", redirect: "/ai-interview/select" },
];

const router = createRouter({
    history: createWebHistory("/vue-ai-interview"), // hash 모드면 createWebHashHistory()
    routes,
});

export default router;
