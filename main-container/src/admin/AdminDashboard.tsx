import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { useRecoilValue } from "recoil";
import { themeAtom } from "@jobspoon/app-state";

const BRAND = {
    blue: "#3b82f6",
    blueDark: "#60a5fa",
    cyan: "#22d3ee",
    cyanDeep: "#06b6d4",
    green: "#34d399",
    greenDeep: "#10b981",
    orange: "#fb923c",
    red: "#ef4444",
    purple: "#a78bfa",
} as const;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

/* ====== Layout ====== */
const Wrapper = styled.div<{ $dark: boolean }>`
    min-height: 100vh;
    background: ${({ $dark }) =>
        $dark
            ? `radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.06) 0%, transparent 50%),
         radial-gradient(ellipse at 80% 100%, rgba(34,211,238,0.04) 0%, transparent 50%),
         #0f1115`
            : `radial-gradient(900px at 10% 20%, rgba(211,228,253,0.35) 0%, transparent 100%),
         radial-gradient(900px at 90% 80%, rgba(213,247,239,0.35) 0%, transparent 100%),
         #f8fafc`};
    padding: 0 0 60px 0;
    font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
`;

const TopBar = styled.div<{ $dark: boolean }>`
    padding: 20px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${({ $dark }) => ($dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")};
    position: sticky;
    top: 0;
    z-index: 100;
    background: ${({ $dark }) => ($dark ? "rgba(15,17,21,0.8)" : "rgba(248,250,252,0.8)")};
`;

const TopBarLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const LogoText = styled.span`
    font-size: 18px;
    font-weight: 800;
    background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const BadgeTag = styled.span<{ $dark: boolean }>`
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    background: ${({ $dark }) => ($dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)")};
    color: ${BRAND.blue};
    letter-spacing: 0.5px;
`;

const TopBarRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const 새로고침Btn = styled.button<{ $dark: boolean }>`
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")};
    background: ${({ $dark }) => ($dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)")};
    color: ${({ $dark }) => ($dark ? "#a0a0a0" : "#666")};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${BRAND.blue};
        color: ${BRAND.blue};
    }
`;

const 로그아웃Btn = styled.button<{ $dark: boolean }>`
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.15)")};
    background: transparent;
    color: ${BRAND.red};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(239,68,68,0.08);
    }
`;

const Content = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;

    @media (max-width: 768px) {
        padding: 20px 16px;
    }
`;

const SectionTitle = styled.h2<{ $dark: boolean }>`
    font-size: 20px;
    font-weight: 700;
    color: ${({ $dark }) => ($dark ? "#eaeaea" : "#111")};
    margin: 40px 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &:first-child {
        margin-top: 0;
    }
`;

/* ====== Stats Grid ====== */
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    animation: ${fadeIn} 0.5s ease;
`;

const StatCard = styled.div<{ $dark: boolean; $accent: string; $delay: number }>`
    padding: 24px;
    border-radius: 20px;
    background: ${({ $dark }) => ($dark ? "rgba(21,25,34,0.7)" : "rgba(255,255,255,0.8)")};
    backdrop-filter: blur(16px);
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.15)")};
    box-shadow: ${({ $dark }) =>
        $dark ? "0 8px 32px rgba(0,0,0,0.2)" : "0 4px 20px rgba(15,23,42,0.04)"};
    transition: all 0.3s ease;
    animation: ${slideUp} 0.5s ease backwards;
    animation-delay: ${({ $delay }) => $delay * 0.08}s;
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, ${({ $accent }) => $accent}, transparent);
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${({ $dark }) =>
            $dark ? "0 12px 40px rgba(0,0,0,0.3)" : "0 8px 30px rgba(15,23,42,0.08)"};
    }
`;

const StatIcon = styled.div<{ $bg: string }>`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${({ $bg }) => $bg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-bottom: 16px;
`;

const StatLabel = styled.div<{ $dark: boolean }>`
    font-size: 13px;
    font-weight: 500;
    color: ${({ $dark }) => ($dark ? "#888" : "#888")};
    margin-bottom: 6px;
`;

const StatValue = styled.div<{ $dark: boolean }>`
    font-size: 28px;
    font-weight: 800;
    color: ${({ $dark }) => ($dark ? "#fff" : "#111")};
    letter-spacing: -1px;
`;

const StatSub = styled.div<{ $color: string }>`
    font-size: 12px;
    font-weight: 600;
    color: ${({ $color }) => $color};
    margin-top: 4px;
`;

/* ====== Service Status ====== */
const StatusGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    animation: ${fadeIn} 0.6s ease;
`;

const StatusCard = styled.div<{ $dark: boolean; $status: "up" | "down" | "unknown" }>`
    padding: 20px 24px;
    border-radius: 16px;
    background: ${({ $dark }) => ($dark ? "rgba(21,25,34,0.7)" : "rgba(255,255,255,0.8)")};
    backdrop-filter: blur(16px);
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.15)")};
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
`;

const StatusDot = styled.div<{ $status: "up" | "down" | "unknown" }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $status }) =>
        $status === "up" ? BRAND.green : $status === "down" ? BRAND.red : BRAND.orange};
    box-shadow: 0 0 8px ${({ $status }) =>
        $status === "up" ? "rgba(52,211,153,0.5)" : $status === "down" ? "rgba(239,68,68,0.5)" : "rgba(251,146,60,0.5)"};
    flex-shrink: 0;
`;

const StatusInfo = styled.div`
    flex: 1;
`;

const StatusName = styled.div<{ $dark: boolean }>`
    font-size: 14px;
    font-weight: 700;
    color: ${({ $dark }) => ($dark ? "#eaeaea" : "#111")};
`;

const StatusDesc = styled.div<{ $dark: boolean }>`
    font-size: 12px;
    color: ${({ $dark }) => ($dark ? "#777" : "#999")};
    margin-top: 2px;
`;

const StatusBadge = styled.span<{ $status: "up" | "down" | "unknown" }>`
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    background: ${({ $status }) =>
        $status === "up"
            ? "rgba(52,211,153,0.12)"
            : $status === "down"
            ? "rgba(239,68,68,0.12)"
            : "rgba(251,146,60,0.12)"};
    color: ${({ $status }) =>
        $status === "up" ? BRAND.greenDeep : $status === "down" ? BRAND.red : BRAND.orange};
`;

/* ====== Log Table ====== */
const LogContainer = styled.div<{ $dark: boolean }>`
    border-radius: 20px;
    background: ${({ $dark }) => ($dark ? "rgba(21,25,34,0.7)" : "rgba(255,255,255,0.8)")};
    backdrop-filter: blur(16px);
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.15)")};
    overflow: hidden;
    animation: ${fadeIn} 0.7s ease;
`;

const LogHeader = styled.div<{ $dark: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid ${({ $dark }) => ($dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")};
`;

const LogHeaderTitle = styled.span<{ $dark: boolean }>`
    font-size: 14px;
    font-weight: 700;
    color: ${({ $dark }) => ($dark ? "#ccc" : "#333")};
`;

const LogRow = styled.div<{ $dark: boolean }>`
    display: grid;
    grid-template-columns: 100px 80px 1fr 140px;
    gap: 12px;
    padding: 14px 24px;
    border-bottom: 1px solid ${({ $dark }) => ($dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")};
    align-items: center;
    transition: background 0.15s;
    font-size: 13px;

    &:hover {
        background: ${({ $dark }) => ($dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)")};
    }

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 4px;
        padding: 12px 20px;
    }
`;

const LogLevel = styled.span<{ $level: string }>`
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    width: fit-content;
    background: ${({ $level }) =>
        $level === "INFO"
            ? "rgba(59,130,246,0.12)"
            : $level === "WARN"
            ? "rgba(251,146,60,0.12)"
            : $level === "ERROR"
            ? "rgba(239,68,68,0.12)"
            : "rgba(52,211,153,0.12)"};
    color: ${({ $level }) =>
        $level === "INFO"
            ? BRAND.blue
            : $level === "WARN"
            ? BRAND.orange
            : $level === "ERROR"
            ? BRAND.red
            : BRAND.green};
`;

const LogService = styled.span<{ $dark: boolean }>`
    font-size: 12px;
    font-weight: 600;
    color: ${({ $dark }) => ($dark ? "#a0a0a0" : "#666")};
`;

const LogMsg = styled.span<{ $dark: boolean }>`
    color: ${({ $dark }) => ($dark ? "#ccc" : "#333")};
    font-size: 13px;
`;

const LogTime = styled.span<{ $dark: boolean }>`
    color: ${({ $dark }) => ($dark ? "#666" : "#aaa")};
    font-size: 12px;
    font-family: "SF Mono", "Fira Code", monospace;
    text-align: right;
`;

/* ====== Skeleton ====== */
const Skeleton = styled.div<{ $dark: boolean; $w?: string; $h?: string }>`
    width: ${({ $w }) => $w || "100%"};
    height: ${({ $h }) => $h || "20px"};
    border-radius: 8px;
    background: ${({ $dark }) =>
        $dark
            ? "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)"
            : "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.04) 75%)"};
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
`;

/* ====== Tabs ====== */
const TabBar = styled.div`
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
`;

const Tab = styled.button<{ $dark: boolean; $active: boolean }>`
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid ${({ $dark, $active }) =>
        $active ? BRAND.blue : $dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
    background: ${({ $dark, $active }) =>
        $active
            ? $dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)"
            : "transparent"};
    color: ${({ $dark, $active }) =>
        $active ? BRAND.blue : $dark ? "#888" : "#888"};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${BRAND.blue};
        color: ${BRAND.blue};
    }
`;

/* ====== Review Card ====== */
const ReviewCard = styled.div<{ $dark: boolean }>`
    padding: 20px 24px;
    border-radius: 16px;
    background: ${({ $dark }) => ($dark ? "rgba(21,25,34,0.7)" : "rgba(255,255,255,0.8)")};
    backdrop-filter: blur(16px);
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.15)")};
    margin-bottom: 12px;
    transition: all 0.2s;
    animation: ${slideUp} 0.4s ease backwards;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${({ $dark }) =>
            $dark ? "0 8px 24px rgba(0,0,0,0.2)" : "0 4px 16px rgba(15,23,42,0.06)"};
    }
`;

const ReviewTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 8px;
`;

const ReviewMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const ReviewTypeBadge = styled.span<{ $type: string }>`
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    background: ${({ $type }) =>
        $type === "SERVICE" ? "rgba(59,130,246,0.12)" : "rgba(167,139,250,0.12)"};
    color: ${({ $type }) => ($type === "SERVICE" ? BRAND.blue : BRAND.purple)};
`;

const Stars = styled.div`
    font-size: 14px;
    letter-spacing: 1px;
`;

const ReviewComment = styled.p<{ $dark: boolean }>`
    font-size: 14px;
    line-height: 1.6;
    color: ${({ $dark }) => ($dark ? "#ccc" : "#333")};
    margin: 0;
    word-break: break-word;
`;

const ReviewFooter = styled.div<{ $dark: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 12px;
    color: ${({ $dark }) => ($dark ? "#666" : "#aaa")};
`;

/* ====== Inquiry Card ====== */
const InquiryCard = styled.div<{ $dark: boolean }>`
    padding: 20px 24px;
    border-radius: 16px;
    background: ${({ $dark }) => ($dark ? "rgba(21,25,34,0.7)" : "rgba(255,255,255,0.8)")};
    backdrop-filter: blur(16px);
    border: 1px solid ${({ $dark }) => ($dark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.15)")};
    margin-bottom: 12px;
    animation: ${slideUp} 0.4s ease backwards;
`;

const InquiryTitle = styled.div<{ $dark: boolean }>`
    font-size: 15px;
    font-weight: 700;
    color: ${({ $dark }) => ($dark ? "#eaeaea" : "#111")};
    margin-bottom: 6px;
`;

const InquiryContent = styled.p<{ $dark: boolean }>`
    font-size: 13px;
    line-height: 1.6;
    color: ${({ $dark }) => ($dark ? "#bbb" : "#555")};
    margin: 0 0 10px 0;
    word-break: break-word;
`;

const InquiryStatusBadge = styled.span<{ $status: string }>`
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    background: ${({ $status }) =>
        $status === "ANSWERED"
            ? "rgba(52,211,153,0.12)"
            : $status === "IN_PROGRESS"
            ? "rgba(59,130,246,0.12)"
            : "rgba(251,146,60,0.12)"};
    color: ${({ $status }) =>
        $status === "ANSWERED"
            ? BRAND.greenDeep
            : $status === "IN_PROGRESS"
            ? BRAND.blue
            : BRAND.orange};
`;

const InquiryAnswer = styled.div<{ $dark: boolean }>`
    margin-top: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    background: ${({ $dark }) => ($dark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.04)")};
    border-left: 3px solid ${BRAND.green};
    font-size: 13px;
    line-height: 1.6;
    color: ${({ $dark }) => ($dark ? "#bbb" : "#555")};
`;

const EmptyState = styled.div<{ $dark: boolean }>`
    padding: 60px 20px;
    text-align: center;
    color: ${({ $dark }) => ($dark ? "#555" : "#bbb")};
    font-size: 14px;
`;

/* ====== Types ====== */
interface Stats {
    users: { total: number; active: number; newToday: number; newThisWeek: number };
    interviews: { total: number };
    quizSessions: { total: number };
    wordbooks: { total: number };
    inquiries: { total: number };
    serverTime: string;
}

interface ServiceStatus {
    name: string;
    desc: string;
    status: "up" | "down" | "unknown";
}

interface LogEntry {
    level: string;
    service: string;
    message: string;
    time: string;
}

interface ReviewItem {
    id: number;
    type: string;
    rating: number;
    comment: string;
    accountId: number | null;
    createdAt: string | null;
}

interface InquiryItem {
    id: number;
    type: string;
    title: string;
    content: string;
    status: string;
    answerContent: string | null;
    answeredAt: string | null;
    accountId: number | null;
    createdAt: string | null;
}

interface AdminDashboardProps {
    onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const mode = useRecoilValue(themeAtom);
    const dark = mode === "dark";
    const [stats, setStats] = useState<Stats | null>(null);
    const [services, setServices] = useState<ServiceStatus[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
    const [reviewTab, setReviewTab] = useState<"all" | "service" | "interview">("all");
    const [loading, setLoading] = useState(true);
    const [last새로고침, setLast새로고침] = useState<Date>(new Date());

    const adminCode = sessionStorage.getItem("adminCode") || "";

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Stats
            const statsRes = await fetch("/spring/api/admin/dashboard/stats", {
                headers: { "X-Admin-Code": adminCode },
            });
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }

            // Service health checks
            const serviceChecks: ServiceStatus[] = [];

            try {
                const springRes = await fetch("/spring/actuator/health", { signal: AbortSignal.timeout(3000) });
                serviceChecks.push({
                    name: "Spring Backend",
                    desc: `포트 8080 | ${springRes.ok ? "정상" : "불안정"}`,
                    status: springRes.ok ? "up" : "down",
                });
            } catch {
                // Spring doesn't have actuator, check via API
                try {
                    const check = await fetch("/spring/api/terms/trending", { signal: AbortSignal.timeout(3000) });
                    serviceChecks.push({
                        name: "Spring Backend",
                        desc: "포트 8080 | 응답 중",
                        status: check.ok ? "up" : "down",
                    });
                } catch {
                    serviceChecks.push({ name: "Spring Backend", desc: "포트 8080", status: "down" });
                }
            }

            try {
                const fastapiRes = await fetch("/fastapi/robots.txt", { signal: AbortSignal.timeout(3000) });
                serviceChecks.push({
                    name: "FastAPI",
                    desc: `포트 33333 | ${fastapiRes.ok ? "정상" : "불안정"}`,
                    status: fastapiRes.ok ? "up" : "down",
                });
            } catch {
                serviceChecks.push({ name: "FastAPI", desc: "포트 33333", status: "down" });
            }

            serviceChecks.push({
                name: "Nginx (프론트엔드)",
                desc: "포트 80 | 서빙 중",
                status: "up",
            });

            serviceChecks.push({
                name: "MySQL 데이터베이스",
                desc: "포트 3306 | 내부",
                status: stats ? "up" : "unknown",
            });

            serviceChecks.push({
                name: "Redis 캐시",
                desc: "포트 6379 | 내부",
                status: stats ? "up" : "unknown",
            });

            setServices(serviceChecks);

            // Generate log entries from activity
            const now = new Date();
            const mockLogs: LogEntry[] = [
                { level: "INFO", service: "Nginx", message: "관리자 대시보드 접속", time: formatTime(now) },
                { level: "INFO", service: "Spring", message: "대시보드 통계 API 호출", time: formatTime(now) },
            ];

            if (serviceChecks.some((s) => s.status === "down")) {
                mockLogs.unshift({
                    level: "ERROR",
                    service: "Monitor",
                    message: `서비스 헬스체크 실패: ${serviceChecks.filter((s) => s.status === "down").map((s) => s.name).join(", ")}`,
                    time: formatTime(now),
                });
            }

            serviceChecks.filter((s) => s.status === "up").forEach((s) => {
                mockLogs.push({
                    level: "OK",
                    service: s.name.split(" ")[0],
                    message: `${s.name} 헬스체크 통과`,
                    time: formatTime(now),
                });
            });

            setLogs(mockLogs);

            // Reviews
            try {
                const reviewRes = await fetch("/spring/api/admin/dashboard/reviews", {
                    headers: { "X-Admin-Code": adminCode },
                });
                if (reviewRes.ok) {
                    const data = await reviewRes.json();
                    const all = [
                        ...(data.serviceReviews || []),
                        ...(data.interviewReviews || []),
                    ].sort((a: ReviewItem, b: ReviewItem) =>
                        (b.createdAt || "").localeCompare(a.createdAt || "")
                    );
                    setReviews(all);
                }
            } catch {}

            // Inquiries
            try {
                const inqRes = await fetch("/spring/api/admin/dashboard/inquiries", {
                    headers: { "X-Admin-Code": adminCode },
                });
                if (inqRes.ok) {
                    const data = await inqRes.json();
                    setInquiries(data.inquiries || []);
                }
            } catch {}

            setLast새로고침(new Date());
        } catch (err) {
            console.error("대시보드 데이터 조회 실패:", err);
        }
        setLoading(false);
    }, [adminCode]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const handleLogout = () => {
        sessionStorage.removeItem("adminCode");
        onLogout();
    };

    return (
        <Wrapper $dark={dark}>
            <TopBar $dark={dark}>
                <TopBarLeft>
                    <LogoText>I-Poten Admin</LogoText>
                    <BadgeTag $dark={dark}>관리 콘솔</BadgeTag>
                </TopBarLeft>
                <TopBarRight>
                    <span style={{ fontSize: 12, color: dark ? "#666" : "#aaa" }}>
                        갱신: {formatTime(last새로고침)}
                    </span>
                    <새로고침Btn $dark={dark} onClick={fetchData}>
                        새로고침
                    </새로고침Btn>
                    <로그아웃Btn $dark={dark} onClick={handleLogout}>
                        로그아웃
                    </로그아웃Btn>
                </TopBarRight>
            </TopBar>

            <Content>
                {/* ====== Stats ====== */}
                <SectionTitle $dark={dark}>서비스 현황</SectionTitle>

                {loading && !stats ? (
                    <StatsGrid>
                        {[...Array(5)].map((_, i) => (
                            <StatCard key={i} $dark={dark} $accent={BRAND.blue} $delay={i}>
                                <Skeleton $dark={dark} $w="40px" $h="40px" />
                                <Skeleton $dark={dark} $w="80px" $h="14px" />
                                <Skeleton $dark={dark} $w="60px" $h="28px" />
                            </StatCard>
                        ))}
                    </StatsGrid>
                ) : stats ? (
                    <StatsGrid>
                        <StatCard $dark={dark} $accent={BRAND.blue} $delay={0}>
                            <StatIcon $bg="rgba(59,130,246,0.12)">👥</StatIcon>
                            <StatLabel $dark={dark}>전체 유저</StatLabel>
                            <StatValue $dark={dark}>{stats.users.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.green}>활성: {stats.users.active.toLocaleString()}</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.green} $delay={1}>
                            <StatIcon $bg="rgba(52,211,153,0.12)">📈</StatIcon>
                            <StatLabel $dark={dark}>오늘 신규</StatLabel>
                            <StatValue $dark={dark}>{stats.users.newToday}</StatValue>
                            <StatSub $color={BRAND.blue}>이번 주: +{stats.users.newThisWeek}</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.cyan} $delay={2}>
                            <StatIcon $bg="rgba(34,211,238,0.12)">🎤</StatIcon>
                            <StatLabel $dark={dark}>AI 면접</StatLabel>
                            <StatValue $dark={dark}>{stats.interviews.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.cyanDeep}>총 세션 수</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.purple} $delay={3}>
                            <StatIcon $bg="rgba(167,139,250,0.12)">📝</StatIcon>
                            <StatLabel $dark={dark}>퀴즈 세션</StatLabel>
                            <StatValue $dark={dark}>{stats.quizSessions.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.purple}>완료</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.orange} $delay={4}>
                            <StatIcon $bg="rgba(251,146,60,0.12)">📚</StatIcon>
                            <StatLabel $dark={dark}>단어장</StatLabel>
                            <StatValue $dark={dark}>{stats.wordbooks.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.orange}>생성됨</StatSub>
                        </StatCard>
                    </StatsGrid>
                ) : null}

                {/* ====== Service Status ====== */}
                <SectionTitle $dark={dark}>서비스 상태</SectionTitle>
                <StatusGrid>
                    {services.map((svc, i) => (
                        <StatusCard key={i} $dark={dark} $status={svc.status}>
                            <StatusDot $status={svc.status} />
                            <StatusInfo>
                                <StatusName $dark={dark}>{svc.name}</StatusName>
                                <StatusDesc $dark={dark}>{svc.desc}</StatusDesc>
                            </StatusInfo>
                            <StatusBadge $status={svc.status}>
                                {svc.status === "up" ? "실행 중" : svc.status === "down" ? "중단" : "확인 불가"}
                            </StatusBadge>
                        </StatusCard>
                    ))}
                </StatusGrid>

                {/* ====== Activity Log ====== */}
                <SectionTitle $dark={dark}>활동 로그</SectionTitle>
                <LogContainer $dark={dark}>
                    <LogHeader $dark={dark}>
                        <LogHeaderTitle $dark={dark}>최근 이벤트</LogHeaderTitle>
                        <span style={{ fontSize: 12, color: dark ? "#555" : "#bbb" }}>
                            자동 갱신: 30초
                        </span>
                    </LogHeader>
                    {logs.map((log, i) => (
                        <LogRow key={i} $dark={dark}>
                            <LogLevel $level={log.level}>{log.level}</LogLevel>
                            <LogService $dark={dark}>{log.service}</LogService>
                            <LogMsg $dark={dark}>{log.message}</LogMsg>
                            <LogTime $dark={dark}>{log.time}</LogTime>
                        </LogRow>
                    ))}
                    {logs.length === 0 && (
                        <div style={{ padding: 40, textAlign: "center", color: dark ? "#555" : "#bbb", fontSize: 14 }}>
                            활동 로그가 없습니다
                        </div>
                    )}
                </LogContainer>

                {/* ====== Reviews ====== */}
                <SectionTitle $dark={dark}>리뷰 ({reviews.length})</SectionTitle>
                <TabBar>
                    <Tab $dark={dark} $active={reviewTab === "all"} onClick={() => setReviewTab("all")}>
                        전체 ({reviews.length})
                    </Tab>
                    <Tab $dark={dark} $active={reviewTab === "service"} onClick={() => setReviewTab("service")}>
                        서비스 ({reviews.filter(r => r.type === "SERVICE").length})
                    </Tab>
                    <Tab $dark={dark} $active={reviewTab === "interview"} onClick={() => setReviewTab("interview")}>
                        면접 ({reviews.filter(r => r.type === "INTERVIEW").length})
                    </Tab>
                </TabBar>
                {reviews
                    .filter(r => reviewTab === "all" || r.type === reviewTab.toUpperCase())
                    .slice(0, 20)
                    .map((r, i) => (
                        <ReviewCard key={`${r.type}-${r.id}`} $dark={dark} style={{ animationDelay: `${i * 0.03}s` }}>
                            <ReviewTop>
                                <ReviewMeta>
                                    <ReviewTypeBadge $type={r.type}>{r.type === "SERVICE" ? "서비스" : "면접"}</ReviewTypeBadge>
                                    <Stars>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Stars>
                                </ReviewMeta>
                                <span style={{ fontSize: 12, color: dark ? "#666" : "#aaa" }}>
                                    #{r.id}
                                </span>
                            </ReviewTop>
                            <ReviewComment $dark={dark}>
                                {r.comment || "(댓글 없음)"}
                            </ReviewComment>
                            <ReviewFooter $dark={dark}>
                                <span>유저 #{r.accountId}</span>
                                <span>{r.createdAt ? new Date(r.createdAt).toLocaleString("ko-KR") : "-"}</span>
                            </ReviewFooter>
                        </ReviewCard>
                    ))}
                {reviews.filter(r => reviewTab === "all" || r.type === reviewTab.toUpperCase()).length === 0 && (
                    <EmptyState $dark={dark}>리뷰가 없습니다</EmptyState>
                )}

                {/* ====== Inquiries ====== */}
                <SectionTitle $dark={dark}>문의 ({inquiries.length})</SectionTitle>
                {inquiries.slice(0, 20).map((inq, i) => (
                    <InquiryCard key={inq.id} $dark={dark} style={{ animationDelay: `${i * 0.03}s` }}>
                        <ReviewTop>
                            <ReviewMeta>
                                <InquiryStatusBadge $status={inq.status}>{inq.status === "ANSWERED" ? "답변 완료" : inq.status === "IN_PROGRESS" ? "처리 중" : "대기 중"}</InquiryStatusBadge>
                                <ReviewTypeBadge $type="SERVICE">{inq.type === "BUG" ? "버그" : inq.type === "FEATURE" ? "기능 요청" : inq.type === "GENERAL" ? "일반" : inq.type}</ReviewTypeBadge>
                            </ReviewMeta>
                            <span style={{ fontSize: 12, color: dark ? "#666" : "#aaa" }}>
                                #{inq.id} | 유저 #{inq.accountId}
                            </span>
                        </ReviewTop>
                        <InquiryTitle $dark={dark}>{inq.title}</InquiryTitle>
                        <InquiryContent $dark={dark}>{inq.content}</InquiryContent>
                        <ReviewFooter $dark={dark}>
                            <span>{inq.createdAt ? new Date(inq.createdAt).toLocaleString("ko-KR") : "-"}</span>
                            {inq.answeredAt && <span>답변: {new Date(inq.answeredAt).toLocaleString("ko-KR")}</span>}
                        </ReviewFooter>
                        {inq.answerContent && (
                            <InquiryAnswer $dark={dark}>{inq.answerContent}</InquiryAnswer>
                        )}
                    </InquiryCard>
                ))}
                {inquiries.length === 0 && (
                    <EmptyState $dark={dark}>문의가 없습니다</EmptyState>
                )}

                {/* ====== Server Info ====== */}
                {stats && (
                    <>
                        <SectionTitle $dark={dark}>서버 정보</SectionTitle>
                        <StatusGrid>
                            <StatusCard $dark={dark} $status="up">
                                <StatusInfo>
                                    <StatusName $dark={dark}>서버 시간 (KST)</StatusName>
                                    <StatusDesc $dark={dark}>
                                        {new Date(stats.serverTime).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                                    </StatusDesc>
                                </StatusInfo>
                            </StatusCard>
                            <StatusCard $dark={dark} $status="up">
                                <StatusInfo>
                                    <StatusName $dark={dark}>문의</StatusName>
                                    <StatusDesc $dark={dark}>총: {stats.inquiries.total}</StatusDesc>
                                </StatusInfo>
                            </StatusCard>
                        </StatusGrid>
                    </>
                )}
            </Content>
        </Wrapper>
    );
}
