export type SocialProvider = "KAKAO" | "GOOGLE" | "NAVER" | "META" | "GITHUB";

export type SocialLoginErrorPayload = {
  code?: string;
  provider?: string;
  message?: string;
  rejoinAvailableAt?: string;
  status?: number;
};

export type SocialLoginMessagePayload = {
  accessToken?: string;
  token?: string;
  isNewUser?: boolean;
  rejoinUser?: boolean;
  user?: {
    nickname?: string;
    [key: string]: unknown;
  };
  error?: SocialLoginErrorPayload;
};

const REJOIN_USER_STORAGE_KEY = "rejoinUser";

export function normalizeSocialLoginMessage(payload: unknown): SocialLoginMessagePayload {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  return payload as SocialLoginMessagePayload;
}

export function getSocialLoginToken(payload: SocialLoginMessagePayload): string | null {
  const token = payload.token ?? payload.accessToken;
  return typeof token === "string" && token.trim() ? token : null;
}

export function setRejoinUserFlag(rejoinUser: boolean): void {
  sessionStorage.setItem(REJOIN_USER_STORAGE_KEY, rejoinUser ? "true" : "false");
}

export function isRejoinUser(): boolean {
  return sessionStorage.getItem(REJOIN_USER_STORAGE_KEY) === "true";
}

export function clearSocialSignupState(): void {
  sessionStorage.removeItem("tempToken");
  sessionStorage.removeItem("userInfo");
  sessionStorage.removeItem("tempLoginType");
  sessionStorage.removeItem(REJOIN_USER_STORAGE_KEY);
}

function formatProvider(provider?: string): string {
  switch ((provider ?? "").toUpperCase()) {
    case "KAKAO":
      return "카카오";
    case "GOOGLE":
      return "구글";
    case "NAVER":
      return "네이버";
    case "META":
      return "Meta";
    case "GITHUB":
      return "GitHub";
    default:
      return "소셜";
  }
}

function formatDateTime(value?: string): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(parsed);
}

export function buildSocialLoginErrorMessage(error?: SocialLoginErrorPayload): string {
  if (!error) {
    return "로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.code === "ACCOUNT_WITHDRAWN") {
    const providerLabel = formatProvider(error.provider);
    const availableAt = formatDateTime(error.rejoinAvailableAt);
    return availableAt
      ? `${providerLabel} 계정은 탈퇴 처리된 상태입니다.\n재가입 가능일: ${availableAt}`
      : `${providerLabel} 계정은 탈퇴 처리된 상태입니다.\n재가입 가능일은 안내 메시지에서 확인해 주세요.`;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return `${formatProvider(error.provider)} 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.`;
}

export function extractSocialLoginErrorFromAxios(error: any): SocialLoginErrorPayload | undefined {
  const responseData = error?.response?.data;
  if (!responseData || typeof responseData !== "object") {
    return undefined;
  }

  if (responseData.error && typeof responseData.error === "object") {
    return responseData.error as SocialLoginErrorPayload;
  }

  if (
    typeof responseData.code === "string" ||
    typeof responseData.message === "string" ||
    typeof responseData.provider === "string"
  ) {
    return responseData as SocialLoginErrorPayload;
  }

  return undefined;
}
