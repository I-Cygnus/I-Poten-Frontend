import { defineStore } from "pinia";
// Pinia의 defineStore 함수를 불러옴. (스토어 생성에 사용.)

import { githubAuthenticationState } from "./githubAuthenticationState";
// 상태(state) 초기화 함수를 불러옴.

import { githubAuthenticationAction } from "./githubAuthenticationActions";
// 인증 관련 동작(actions) 정의를 불러옴.

export const useGithubAuthenticationStore = defineStore(
    "githubAuthenticationStore", // 스토어의 고유 ID. (디버깅/디브툴에서 식별용.)
    {
        state: githubAuthenticationState, // 상태 정의. (로그인 여부, 토큰 등 저장.)
        actions: githubAuthenticationAction, // 메서드 정의. (API 호출, 토큰 발급, 로그아웃 등.)
    }
);

/*
==================================================
1. 스토어는 GitHub 인증 흐름을 전역으로 관리하는 저장소.
   - 로그인 여부, 사용자 토큰, 유저 정보 같은 데이터를 state로 관리.
   - actions를 통해 실제 인증 요청, 토큰 저장/삭제 등을 처리.

2. 컴포넌트에서 사용 방법:
   const githubStore = useGithubAuthenticationStore();
   githubStore.requestAccessToken({ code: "인가코드" });
   if (githubStore.isAuthenticated) { ... }

3. Pinia 특징:
   - state는 반응형(reactive)이므로 값이 변하면 UI 자동 업데이트.
   - actions는 비동기 처리를 지원하며, this를 통해 state 직접 접근 가능.
   - Vue DevTools와 연동 시 디버깅이 용이.
==================================================
*/
