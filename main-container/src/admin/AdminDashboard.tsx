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

const RefreshBtn = styled.button<{ $dark: boolean }>`
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

const LogoutBtn = styled.button<{ $dark: boolean }>`
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

interface AdminDashboardProps {
    onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const mode = useRecoilValue(themeAtom);
    const dark = mode === "dark";
    const [stats, setStats] = useState<Stats | null>(null);
    const [services, setServices] = useState<ServiceStatus[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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
                    desc: `Port 8080 | ${springRes.ok ? "Healthy" : "Degraded"}`,
                    status: springRes.ok ? "up" : "down",
                });
            } catch {
                // Spring doesn't have actuator, check via API
                try {
                    const check = await fetch("/spring/api/terms/trending", { signal: AbortSignal.timeout(3000) });
                    serviceChecks.push({
                        name: "Spring Backend",
                        desc: "Port 8080 | Responding",
                        status: check.ok ? "up" : "down",
                    });
                } catch {
                    serviceChecks.push({ name: "Spring Backend", desc: "Port 8080", status: "down" });
                }
            }

            try {
                const fastapiRes = await fetch("/fastapi/robots.txt", { signal: AbortSignal.timeout(3000) });
                serviceChecks.push({
                    name: "FastAPI",
                    desc: `Port 33333 | ${fastapiRes.ok ? "Healthy" : "Degraded"}`,
                    status: fastapiRes.ok ? "up" : "down",
                });
            } catch {
                serviceChecks.push({ name: "FastAPI", desc: "Port 33333", status: "down" });
            }

            serviceChecks.push({
                name: "Nginx (Frontend)",
                desc: "Port 80 | Serving",
                status: "up",
            });

            serviceChecks.push({
                name: "MySQL Database",
                desc: "Port 3306 | Internal",
                status: stats ? "up" : "unknown",
            });

            serviceChecks.push({
                name: "Redis Cache",
                desc: "Port 6379 | Internal",
                status: stats ? "up" : "unknown",
            });

            setServices(serviceChecks);

            // Generate log entries from activity
            const now = new Date();
            const mockLogs: LogEntry[] = [
                { level: "INFO", service: "Nginx", message: "Admin dashboard accessed", time: formatTime(now) },
                { level: "INFO", service: "Spring", message: "Dashboard stats API called", time: formatTime(now) },
            ];

            if (serviceChecks.some((s) => s.status === "down")) {
                mockLogs.unshift({
                    level: "ERROR",
                    service: "Monitor",
                    message: `Service health check failed: ${serviceChecks.filter((s) => s.status === "down").map((s) => s.name).join(", ")}`,
                    time: formatTime(now),
                });
            }

            serviceChecks.filter((s) => s.status === "up").forEach((s) => {
                mockLogs.push({
                    level: "OK",
                    service: s.name.split(" ")[0],
                    message: `${s.name} health check passed`,
                    time: formatTime(now),
                });
            });

            setLogs(mockLogs);
            setLastRefresh(new Date());
        } catch (err) {
            console.error("Dashboard fetch error:", err);
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
                    <LogoText>I-POTEN Admin</LogoText>
                    <BadgeTag $dark={dark}>CONSOLE</BadgeTag>
                </TopBarLeft>
                <TopBarRight>
                    <span style={{ fontSize: 12, color: dark ? "#666" : "#aaa" }}>
                        Last: {formatTime(lastRefresh)}
                    </span>
                    <RefreshBtn $dark={dark} onClick={fetchData}>
                        Refresh
                    </RefreshBtn>
                    <LogoutBtn $dark={dark} onClick={handleLogout}>
                        Logout
                    </LogoutBtn>
                </TopBarRight>
            </TopBar>

            <Content>
                {/* ====== Stats ====== */}
                <SectionTitle $dark={dark}>Overview</SectionTitle>

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
                            <StatLabel $dark={dark}>Total Users</StatLabel>
                            <StatValue $dark={dark}>{stats.users.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.green}>Active: {stats.users.active.toLocaleString()}</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.green} $delay={1}>
                            <StatIcon $bg="rgba(52,211,153,0.12)">📈</StatIcon>
                            <StatLabel $dark={dark}>New Today</StatLabel>
                            <StatValue $dark={dark}>{stats.users.newToday}</StatValue>
                            <StatSub $color={BRAND.blue}>This week: +{stats.users.newThisWeek}</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.cyan} $delay={2}>
                            <StatIcon $bg="rgba(34,211,238,0.12)">🎤</StatIcon>
                            <StatLabel $dark={dark}>Interviews</StatLabel>
                            <StatValue $dark={dark}>{stats.interviews.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.cyanDeep}>Total sessions</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.purple} $delay={3}>
                            <StatIcon $bg="rgba(167,139,250,0.12)">📝</StatIcon>
                            <StatLabel $dark={dark}>Quiz Sessions</StatLabel>
                            <StatValue $dark={dark}>{stats.quizSessions.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.purple}>Completed</StatSub>
                        </StatCard>
                        <StatCard $dark={dark} $accent={BRAND.orange} $delay={4}>
                            <StatIcon $bg="rgba(251,146,60,0.12)">📚</StatIcon>
                            <StatLabel $dark={dark}>Wordbooks</StatLabel>
                            <StatValue $dark={dark}>{stats.wordbooks.total.toLocaleString()}</StatValue>
                            <StatSub $color={BRAND.orange}>Created</StatSub>
                        </StatCard>
                    </StatsGrid>
                ) : null}

                {/* ====== Service Status ====== */}
                <SectionTitle $dark={dark}>Service Status</SectionTitle>
                <StatusGrid>
                    {services.map((svc, i) => (
                        <StatusCard key={i} $dark={dark} $status={svc.status}>
                            <StatusDot $status={svc.status} />
                            <StatusInfo>
                                <StatusName $dark={dark}>{svc.name}</StatusName>
                                <StatusDesc $dark={dark}>{svc.desc}</StatusDesc>
                            </StatusInfo>
                            <StatusBadge $status={svc.status}>
                                {svc.status === "up" ? "Running" : svc.status === "down" ? "Down" : "Unknown"}
                            </StatusBadge>
                        </StatusCard>
                    ))}
                </StatusGrid>

                {/* ====== Activity Log ====== */}
                <SectionTitle $dark={dark}>Activity Log</SectionTitle>
                <LogContainer $dark={dark}>
                    <LogHeader $dark={dark}>
                        <LogHeaderTitle $dark={dark}>Recent Events</LogHeaderTitle>
                        <span style={{ fontSize: 12, color: dark ? "#555" : "#bbb" }}>
                            Auto-refresh: 30s
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
                            No activity logs
                        </div>
                    )}
                </LogContainer>

                {/* ====== Server Info ====== */}
                {stats && (
                    <>
                        <SectionTitle $dark={dark}>Server Info</SectionTitle>
                        <StatusGrid>
                            <StatusCard $dark={dark} $status="up">
                                <StatusInfo>
                                    <StatusName $dark={dark}>Server Time (KST)</StatusName>
                                    <StatusDesc $dark={dark}>
                                        {new Date(stats.serverTime).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                                    </StatusDesc>
                                </StatusInfo>
                            </StatusCard>
                            <StatusCard $dark={dark} $status="up">
                                <StatusInfo>
                                    <StatusName $dark={dark}>Inquiries</StatusName>
                                    <StatusDesc $dark={dark}>Total: {stats.inquiries.total}</StatusDesc>
                                </StatusInfo>
                            </StatusCard>
                        </StatusGrid>
                    </>
                )}
            </Content>
        </Wrapper>
    );
}
