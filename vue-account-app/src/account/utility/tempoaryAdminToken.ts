// // 임시 관리자 토큰 유틸 (오타 키 정규화 + 서버 검증)
//
// const TEMP_TOKEN ="temporaryAdminToken";
// const LEGACY_TOKENS = ["tempoaryAdminToken"]
//
// export function normalizeTempToken(storage:Storage=localStorage){
//     //표준 토큰 없을 시, 레거시코드형태로 존재하는 확인 및 승격
//     if(!storage.getItem(TEMP_TOKEN)){
//         for(const k of LEGACY_TOKENS){
//             const v=storage.getItem(k);
//             if(v){
//                 storage.setItem(TEMP_TOKEN,v);
//                 storage.removeItem(k);
//                 break;
//             }
//         }
//     }else{
//         //표준 토큰 존재시 레거시 정리
//         for(const t of LEGACY_TOKENS) storage.removeItem(t);
//     }
// }
//
// export function getTempToken(){
//     normalizeTempToken();
//     return localStorage.getItem(TEMP_TOKEN);
// }
// export function setTempToken(v:string){
//     localStorage.setItem(TEMP_TOKEN,v);
// }
// export function clearTempToken(){
//     localStorage.removeItem(TEMP_TOKEN);
// }
//
//
//
//
//
