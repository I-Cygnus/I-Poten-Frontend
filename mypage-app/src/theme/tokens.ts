import { css } from "styled-components";

export const pretendard = css`
    font-family:
        "Pretendard",
        -apple-system,
        BlinkMacSystemFont,
        "Apple SD Gothic Neo",
        "Noto Sans KR",
        "Segoe UI",
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: -0.015em;
    word-break: keep-all;
`;

export const interactiveText = css`
    ${pretendard};
    font: inherit;
    letter-spacing: -0.015em;
`;

export const ease = {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    standard: "cubic-bezier(0.32, 0.08, 0.24, 1)",
};

export const motion = {
    fast: `160ms ${ease.standard}`,
    base: `280ms ${ease.out}`,
    slow: `420ms ${ease.out}`,
};

export const palette = {
    pageSurface: "#ffffff",
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    surfaceMuted: "#f1f5f9",

    border: "rgba(148, 163, 184, 0.22)",
    borderSoft: "rgba(148, 163, 184, 0.14)",
    borderStrong: "rgba(15, 23, 42, 0.12)",

    ink: "#0f172a",
    text: "#0f172a",
    textStrong: "rgba(15, 23, 42, 0.92)",
    textSoft: "rgba(15, 23, 42, 0.6)",
    textMuted: "rgba(15, 23, 42, 0.4)",
    textFaint: "rgba(15, 23, 42, 0.32)",

    accent: "#3b82f6",
    accentStrong: "#2563eb",
    accentSoft: "rgba(59, 130, 246, 0.08)",
    accentRing: "rgba(59, 130, 246, 0.16)",

    positive: "#0f766e",
    positiveSoft: "rgba(20, 184, 166, 0.1)",

    warning: "#b45309",
    warningSoft: "rgba(245, 158, 11, 0.1)",
    warningBorder: "rgba(245, 158, 11, 0.22)",

    danger: "#dc2626",
    dangerSoft: "rgba(220, 38, 38, 0.08)",

    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate200: "#e2e8f0",
    slate300: "#cbd5e1",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",
};

export const shadow = {
    soft: "0 22px 70px rgba(15, 23, 42, 0.06)",
    card: "0 1px 2px rgba(15, 23, 42, 0.04)",
    liftSm: "0 8px 24px rgba(15, 23, 42, 0.06)",
    liftMd: "0 18px 40px rgba(15, 23, 42, 0.08)",
};

export const radius = {
    xs: "6px",
    sm: "10px",
    md: "14px",
    lg: "20px",
    xl: "28px",
    pill: "999px",
};
