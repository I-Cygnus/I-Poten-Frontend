// //@/security/security-config.ts
// const raw= process.env.ADMIN_SESSION_TTL_MINUTES as String | undefined;
// export const ADMIN_SESSION_TTL_MIN = (() => {
//     const n = Number(raw ?? "60");
//     return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60; // 음수/NaN 방지.
// })();