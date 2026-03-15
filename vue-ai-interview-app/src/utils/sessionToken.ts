// 면접 세션 토큰 관리 유틸리티
// TTL: 1시간

interface SessionToken {
  token: string;
  expiresAt: number;
}

const SESSION_TOKEN_KEY = 'interviewSessionToken';
const TOKEN_TTL = 60 * 60 * 1000; // 1시간 (밀리초)

/**
 * 면접 세션 토큰 생성
 * @returns 생성된 토큰 문자열
 */
export function createInterviewSessionToken(): string {
  const token = generateRandomToken();
  const expiresAt = Date.now() + TOKEN_TTL;
  
  const sessionToken: SessionToken = {
    token,
    expiresAt
  };
  
  localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(sessionToken));
  return token;
}

/**
 * 면접 세션 토큰 유효성 검증
 * @returns 토큰이 유효하면 true, 그렇지 않으면 false
 */
export function validateInterviewSessionToken(): boolean {
  try {
    const stored = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!stored) {
      return false;
    }
    
    const sessionToken: SessionToken = JSON.parse(stored);
    const now = Date.now();
    
    // TTL 체크
    if (now > sessionToken.expiresAt) {
      // 만료된 토큰 삭제
      clearInterviewSessionToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session token validation failed:', error);
    clearInterviewSessionToken();
    return false;
  }
}

/**
 * 면접 세션 토큰 삭제
 */
export function clearInterviewSessionToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * 세션 토큰 갱신 (TTL 연장)
 */
export function refreshInterviewSessionToken(): boolean {
  try {
    const stored = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!stored) {
      return false;
    }
    
    const sessionToken: SessionToken = JSON.parse(stored);
    
    // 새로운 만료 시간 설정
    sessionToken.expiresAt = Date.now() + TOKEN_TTL;
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(sessionToken));
    
    return true;
  } catch (error) {
    console.error('Session token refresh failed:', error);
    return false;
  }
}

/**
 * 랜덤 토큰 생성 (UUID v4 형식)
 */
function generateRandomToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
