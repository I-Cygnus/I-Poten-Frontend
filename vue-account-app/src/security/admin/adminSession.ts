// //security/adminSession.ts
//
// // AdminSession 유틸(최소 규격).
// // - 목적: 관리자 권한 검증 결과를 "같은 브라우저 탭"에서만 짧게 캐시해 라우팅 UX를 빠르게 함.
// // - 저장소: sessionStorage (탭을 닫으면 소멸, 다른 탭과 공유되지 않음).
// // - 보안 주의: 이 값은 신뢰 근거가 아님. 민감 API는 항상 서버에서 UserToken으로 최종 검증.
//
// // NOTE: 번들러에 따라 .ts 확장자 생략 가능. 현재 프로젝트 규칙에 맞춰 사용.
// import { ADMIN_SESSION_TTL_MIN } from "@/security/admin/security-config.ts";
//
// // ───────────────────────────────────────────────────────────────────────────────
// // 1) 키/스키마/기본 상수
// // ───────────────────────────────────────────────────────────────────────────────
//
// // sessionStorage 키 집합. (키 문자열은 한 곳에서만 관리)
// export const STORAGE_KEYS = {
//     ADMIN_SESSION: "adminSession",
// } as const;
//
// // AdminSession 스키마: "관리자 검증 성공"을 캐시하고 만료 시각을 갖는다.
// export interface AdminSession {
//     verified: boolean; // true면 "서버에서 관리자 검증을 통과"했다는 캐시 결과.
//     expiresAt: number; // 만료 시각(Epoch ms). now()보다 작아지면 무효.
//     // version?: number; // (선택) 서버 권한 버전 비교에 사용할 수 있음. Phase 2에선 미사용.
// }
//
// // TTL(분) → ms 변환. 최소 1분 보장.
// const TTL_MS = Math.max(1, ADMIN_SESSION_TTL_MIN) * 60 * 1000;
//
// // ───────────────────────────────────────────────────────────────────────────────
// // 2) 유틸 헬퍼
// // ───────────────────────────────────────────────────────────────────────────────
//
// const now = () => Date.now();
//
// // 문자열(JSON) → 객체 파싱. 실패/빈 값이면 null.
// const safeParse = <T,>(raw: string | null): T | null => {
//     if (!raw) return null;
//     try {
//         return JSON.parse(raw) as T;
//     } catch {
//         return null;
//     }
// };
//
// // ───────────────────────────────────────────────────────────────────────────────
// // 3) sessionStorage 접근 래퍼
// // ───────────────────────────────────────────────────────────────────────────────
//
// // 읽기: 파싱 실패/손상된 데이터는 즉시 제거하여 오염을 남기지 않음.
// function sessionStorageRead<T>(key: string): T | null {
//     const obj = safeParse<T>(sessionStorage.getItem(key));
//     if (obj == null) sessionStorage.removeItem(key); // 손상 데이터 제거
//     return obj;
// }
//
// // 쓰기: 값은 항상 JSON 직렬화하여 저장.
// function sessionStorageWrite(key: string, value: unknown) {
//     sessionStorage.setItem(key, JSON.stringify(value));
// }
//
// // ───────────────────────────────────────────────────────────────────────────────
// // 4) 코어 API (검증/로드/저장/연장/삭제/TTL조회)
// // ───────────────────────────────────────────────────────────────────────────────
//
// // 유효성 검사: verified=true && 만료시간이 미래여야 유효.
// export function isAdminSessionValid(s: AdminSession | null): s is AdminSession {
//     return !!s && s.verified === true && typeof s.expiresAt === "number" && s.expiresAt > now();
// }
//
// // 로드: 세션을 읽고, 만료/손상이면 자동 제거 후 null 반환.
// export function loadAdminSession(): AdminSession | null {
//     const s = sessionStorageRead<AdminSession>(STORAGE_KEYS.ADMIN_SESSION);
//     if (!isAdminSessionValid(s)) {
//         clearAdminSession(); // 만료/손상 시 깨끗이 정리.
//         return null;
//     }
//     return s;
// }
//
// // 저장: "지금부터 TTL 동안 유효"한 새 세션을 기록.
// // - 서버 1회 검증 성공 직후 호출하는 것이 일반적.
// // - (옵션) version을 도입할 경우, 여기에 병합 저장하면 됨.
// export function saveAdminSession(): AdminSession {
//     const s: AdminSession = {
//         verified: true,
//         expiresAt: now() + TTL_MS,
//         // ...(opts?.version ? { version: opts.version } : {}),
//     };
//     sessionStorageWrite(STORAGE_KEYS.ADMIN_SESSION, s);
//     broadcast("SET", s); // 다른 탭에 "세션 설정" 알림.
//     return s;
// }
//
// // 연장: 현재 유효 세션의 만료시각을 갱신(활동 발생 시 갱신에 사용 가능).
// export function refreshAdminSession(): AdminSession | null {
//     const s = loadAdminSession();
//     if (!s) return null; // 유효 세션이 없으면 갱신 불가.
//     s.expiresAt = now() + TTL_MS;
//     sessionStorageWrite(STORAGE_KEYS.ADMIN_SESSION, s);
//     broadcast("SET", s); // 다른 탭에도 갱신 통지.
//     return s;
// }
//
// // 제거: 세션 완전 삭제 + 다른 탭에 "세션 해제" 브로드캐스트.
// // - 사례: 로그아웃, API 401/403(권한 박탈/토큰 만료) 수신 시.
// export function clearAdminSession(): void {
//     // FIX: sessionStorage.remove → removeItem이 맞음.
//     sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
//     broadcast("CLEAR");
// }
//
// // 남은 TTL(ms): 유효 세션이면 잔여시간, 없으면 0.
// // - UI에서 "세션 만료까지 남은 시간" 표시에 활용 가능.
// export function getAdminSessionTTLLeftMs(): number {
//     const s = loadAdminSession();
//     // FIX: Math.max 인자 누락 → 0과 비교하여 음수 방지.
//     return s ? Math.max(0, s.expiresAt - now()) : 0;
// }
//
// // ───────────────────────────────────────────────────────────────────────────────
// // 5) 멀티 탭 동기화 (선택)
// //   - 동일 브라우저의 "다른 탭/창"에도 세션 설정/해제 신호를 전파한다.
// //   - 서버 전송 없음. BroadcastChannel 미지원 환경(일부)에서는 자동 no-op.
// // ───────────────────────────────────────────────────────────────────────────────
//
// type Msg = { type: "CLEAR" } | { type: "SET"; payload: AdminSession };
// const CH = "admin-sync";
// let bc: BroadcastChannel | null = null;
//
// // 채널 획득: 지원하지 않으면 null 반환하여 자연스럽게 비활성.
// function channel(): BroadcastChannel | null {
//     if (typeof BroadcastChannel === "undefined") return null;
//     if (!bc) bc = new BroadcastChannel(CH);
//     return bc;
// }
//
// // 브로드캐스트: SET/CLEAR 이벤트를 전송.
// // - 다른 탭에서 listen 중이면 동일 동작을 수행할 수 있도록 hook 제공.
// function broadcast(type: "CLEAR" | "SET", payload?: AdminSession) {
//     const c = channel();
//     if (!c) return;
//     const msg: Msg = type === "CLEAR" ? { type: "CLEAR" } : { type: "SET", payload: payload! };
//     c.postMessage(msg);
// }
//
// // 동기화 리스너 등록: 다른 탭의 SET/CLEAR를 수신.
// // - 반환값: 리스너 해제 함수.
// // - 사용 예: 앱 부트 시 등록 → 콘솔 로그/상태 정리 등.
// export function listenAdminSessionSync(handlers?: {
//     onClear?: () => void;
//     onSet?: (s: AdminSession) => void;
// }): () => void {
//     const c = channel();
//     if (!c) return () => {};
//     const onMsg = (ev: MessageEvent<Msg>) => {
//         if (!ev?.data) return;
//         if (ev.data.type === "CLEAR") handlers?.onClear?.();
//         else if (ev.data.type === "SET" && ev.data.payload) handlers?.onSet?.(ev.data.payload);
//     };
//     c.addEventListener("message", onMsg);
//     return () => c.removeEventListener("message", onMsg);
// }
//
// /* ──────────────────────────────────────────────────────────────────────────────
// [동작 요약]
// 1) saveAdminSession()
//    - 서버 1회 검증 성공 직후 호출 → verified=true, expiresAt=지금+TTL 로 저장.
//    - 다른 탭에도 "SET" 신호를 보낸다.
//
// 2) loadAdminSession()
//    - 세션을 읽어 유효성 검사.
//    - 만료/손상이면 자동 제거(clear)하고 null 반환.
//
// 3) refreshAdminSession()
//    - 유효 세션이 있을 때 만료시각을 연장.
//    - 다른 탭에도 "SET" 신호(갱신) 전파.
//
// 4) clearAdminSession()
//    - 세션을 완전히 제거.
//    - 다른 탭에도 "CLEAR" 신호 전파.
//
// 5) getAdminSessionTTLLeftMs()
//    - 남은 시간(ms)을 반환. 없으면 0.
// ─────────────────────────────────────────────────────────────────────────────── */
