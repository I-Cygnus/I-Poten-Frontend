import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import http, { authHeader } from "../utils/http";
import { NarrowLeft } from "../styles/layout";
import { goToAccountLogin } from "../utils/auth";

/* ===== UI tokens ===== */
const UI = {
    color: {
        bg: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
        line: "#e5e7eb",
        primary: "#4F76F1",
        primaryStrong: "#3E63E0",
        indigo50: "#eef2ff",
        indigo200: "#c7d2fe",
        green: "#10b981",
        blue: "#3b82f6",
        orange: "#f59e0b",
        red: "#ef4444",
    },
    gradient: {
        brand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
        quizCta: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)"
    },
    radius: {
        xl: 16,
        lg: 12,
        md: 10,
        sm: 8,
        pill: 999
    },
    shadow: {
        card: "0 1px 0 rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.05)",
        bar:  "0 4px 14px rgba(0,0,0,0.06)",
        menu: "0 6px 18px rgba(0,0,0,0.10)",
    },
    font: {
        h2: "26px",
        body: "15px",
        tiny: "12px"
    },
};

/* ===== 레이아웃 ===== */
const Screen = styled.div`
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 18px;
    align-items: start;
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const LeftCol = styled.div`
    display: grid;
    gap: 16px;
`;

const RightCol = styled.aside`
    position: sticky;
    top: 64px;
    align-self: start;
    display: grid;
    grid-template-rows: max-content max-content max-content;
    gap: 12px;
    overflow: visible;
    @media (max-width: 1024px) {
        position: static;
        grid-template-rows: none;
    }
`;

const SearchCard = styled.div`
    border: 1px solid ${UI.color.line};
    border-radius: ${UI.radius.lg}px;
    background: #fff;
    box-shadow: ${UI.shadow.card};
    padding: 12px 14px;
    display: grid;
    gap: 8px;
    min-height: 100px;
`;

const SearchLabel = styled.div`
    font-weight: 750;
    letter-spacing: -.02em;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 38px;
    border-radius: ${UI.radius.md}px;
    border: 1px solid ${UI.color.line};
    padding: 0 12px 0 36px;
    background: #fff url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='7' stroke='%239aa0a6' stroke-width='2'/%3E%3Cpath d='M20 20l-3.2-3.2' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat 10px 50%;
    font-size: 14px;
    &:focus {
        outline: none;
        border-color: ${UI.color.primaryStrong};
        box-shadow: 0 0 0 3px rgba(62,99,224,.16);
    }
    &::placeholder {
        color: #9aa4b2;
    }
`;

/* ===== 상단 타이틀 & 툴바 ===== */
const Toolbar = styled.div`
    position: sticky;
    top: 0;
    z-index: 5;
    background: ${UI.color.bg};
    padding: 12px 8px 6px;
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
`;

const Title = styled.h2`
    margin: 0;
    font-size: ${UI.font.h2};
    letter-spacing: -0.01em;
    color: ${UI.color.text};
`;

/* ===== 필터 칩 ===== */
const FilterBar = styled.div.attrs({ role: "tablist" })`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

const Chip = styled.button<{ $active?: boolean }>`
    height: 36px;
    padding: 0 14px;
    border-radius: ${UI.radius.pill}px;
    font-weight: 750;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: background-color .15s ease, color .15s ease, border-color .15s ease, transform .08s ease, filter .15s ease;
    /* GhostBtn 스타일 (비활성) */
    background: #f3f4f6;
    color: #374151;
    border: 1px solid ${UI.color.line};
    /* PrimaryBtn 스타일 (활성) */
    ${({ $active }) => $active && `
    background: ${UI.color.primary};
    color: #fff;
    border: 1px solid ${UI.color.primary};
  `}
    &:hover {
        ${({ $active }) => $active
                ? `background: ${UI.color.primaryStrong};`
                : `background: #e5e7eb;`
        }
    }
    &:active {
        transform: translateY(1px);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,.25);
    }
    &[aria-pressed="true"] {
        background: ${UI.color.primary};
        color: #fff;
        border-color: ${UI.color.primary};
    }
`;

/* ===== 통계 카드 ===== */
const StatGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    border: 1px solid ${UI.color.line};
    border-radius: ${UI.radius.lg}px;
    background: #fff;
    box-shadow: ${UI.shadow.card};
    padding: 16px 18px;
    display: grid;
    gap: 8px;
`;

const StatValue = styled.div`
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
`;

const StatLabel = styled.div`
    color: ${UI.color.muted};
    font-weight: 750;
    letter-spacing: -.002em;
`;

/* ===== 리스트 패널 (더 라운드 & 소프트) ===== */
const Panel = styled.div`
    border: 1px solid rgba(14,18,28,.06);
    border-radius: ${UI.radius.lg}px;
    background: #fff;
    box-shadow: 0 6px 16px rgba(30,41,59,.05);
    overflow: hidden;
`;

const TimelinePanel = styled(Panel)`
    min-height: 460px;
`;

/* ===== 타임라인 ===== */
const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 22px 20px;
    &:not(:last-child){ box-shadow: inset 0 -1px #f1f5f9; }
    transition: background .15s ease, transform .08s ease, box-shadow .15s ease;
    &:hover{
        background: #fbfcff;
        transform: translateY(-1px);
        box-shadow: inset 0 -1px #eef2f7, 0 1px 6px rgba(62,99,224,.05);
    }
    @media (max-width: 860px) {
        grid-template-columns: 1fr;
    }
`;

const ActionBar = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;
`;

const DonutWrap = styled.div`
  display: grid;
  place-items: center;
`;

/* ===== 제목 스택 & 라이트 칩 ===== */
const TitleStack = styled.div`
    display: grid;
    gap: 8px;
`;

const QuizTitle = styled.div`
    font-size: 18px;
    font-weight: 750;
    letter-spacing: -.02em;
    color: #0f172a;
`;

const LightPill = styled.button`
    border: 0;
    padding: 8px 12px;
    border-radius: ${UI.radius.pill}px;
    font-weight: 750;
    font-size: 13px;
    letter-spacing: -.02em;
    color: ${UI.color.primaryStrong};
    background: rgba(79,118,241,.10);
    &:hover {
        background: rgba(79,118,241,.14);
    }
`;

/* ===== 도넛 ===== */
function Donut({
                   value,
                   total,
                   size = 64,
                   stroke = 10
               }: {
    value: number;
    total: number;
    size?: number;
    stroke?: number;
}) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    const raw = React.useId();
    const safeId = `donut_${raw.replace(/[:]/g, "_")}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={`진행률 ${pct}%`}
        >
            <defs>
                <linearGradient id={safeId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22c1b5" />
                </linearGradient>
            </defs>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke="#eef2f7"
                strokeWidth={stroke}
                fill="none"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={`url(#${safeId})`}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="15"
                fontWeight={800}
                fill={UI.color.text}
            >
                {value}/{total}
            </text>
        </svg>
    );
}

const MetricGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div<{ $from: string; $to: string }>`
    position: relative;
    border-radius: ${UI.radius.lg}px;
    padding: 12px 14px;
    min-height: 100px;
    background: radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,.9) 0%, rgba(255,255,255,.7) 45%, rgba(255,255,255,.6) 100%),
    linear-gradient(135deg, ${({ $from }) => $from} 0%, ${({ $to }) => $to} 100%);
    border: 1px solid rgba(14,18,28,.06);
    box-shadow: 0 6px 22px rgba(30,41,59,.06);
    overflow: hidden;
`;

const MetricHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const MetricIcon = styled.div`
   width: 28px;
   height: 28px;
   border-radius: ${UI.radius.sm}px;
   background: rgba(255,255,255,.78);
   display: grid;
   place-items: center;
   box-shadow: inset 0 1px 0 rgba(255,255,255,.65);
   svg { width: 16px; height: 16px; }
`;

const MetricValue = styled.div`
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -.02em;
    color: #0f172a;
`;

const MetricLabel = styled.div`
    font-size: 12px;
    color: #334155;
    font-weight: 700;
    opacity: .9;
`;

/* ===== KPI 카드 (pastel gradient + icon chip) ===== */
const KPIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const KPICard = styled.div<{ $from: string; $to: string }>`
    position: relative;
    border-radius: ${UI.radius.lg}px;
    padding: 14px 16px;
    min-height: 86px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
    background: radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,.92) 0%, rgba(255,255,255,.75) 45%, rgba(255,255,255,.6) 100%),
    linear-gradient(135deg, ${({$from}) => $from} 0%, ${({$to}) => $to} 100%);
    border: 1px solid rgba(79,118,241,.08);
    box-shadow: 0 6px 22px rgba(30,41,59,.06);

    .kpi-body {
        display: grid;
        gap: 6px;
    }
    .kpi-label {
        font-size: 12px;
        font-weight: 750;
        letter-spacing: -.02em;
        color: #334155;
        opacity: .9;
    }
    .kpi-value {
        font-size: 36px;
        font-weight: 900;
        letter-spacing: -.02em;
        color: #0f172a;
    }
    .kpi-sub {
        font-size: 12px;
        font-weight: 400;
        color: ${UI.color.muted};
    }
    .kpi-icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: rgba(255,255,255,.78);
        border: 1px solid rgba(255,255,255,.65);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.75);
        svg {
            width: 18px;
            height: 18px;
        }
    }
`;

const Spark = styled.svg`
    width: 100%;
    height: 36px;
`;

function MiniTrend({
                       points = "0,28 24,26 48,22 72,24 96,14 120,18 144,10"
                   }: {
    points?: string
}) {
    return (
        <Spark viewBox="0 0 144 36" aria-hidden>
            <polyline
                fill="none"
                stroke="rgba(62,99,224,.45)"
                strokeWidth="2.5"
                points={points}
            />
        </Spark>
    );
}

const PaginationBar = styled.nav`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 14px;
`;

function MiniAreaChart({
                           data = [1, 5, 3, 4, 2.8, 6.2, 4.8, 6.5],
                           labels,
                           height = 96,
                           pad = 10,
                           stroke = UI.color.primaryStrong
                       }: { data?: number[]; labels?: string[]; height?: number; pad?: number; stroke?: string }) {
    const width = 320;

    const safeData = (() => {
        if (!Array.isArray(data) || data.length === 0) return [0, 0];
        if (data.length === 1) return [data[0], data[0]];
        return data;
    })();
    const safeLabels = (() => {
        if (!Array.isArray(labels)) return undefined;
        if (labels.length === 0) return undefined;
        if (labels.length === 1) return [labels[0], labels[0]];
        return labels;
    })();

    // 상/하 여백을 따로 둬서 말풍선 여유 공간 확보
    const padTop = pad + 22;      // ← 말풍선 높이만큼 상단 추가 여백
    const padBottom = pad + 6;

    const min = Math.min(...safeData);
    const max = Math.max(...safeData);
    const range = (max - min) || 1;

    const denom = Math.max(1, safeData.length - 1);
    const x = (i: number) => pad + (i * (width - pad * 2)) / denom;
    const y = (v: number) => {
        const h = height - padTop - padBottom;
        return padTop + h * (1 - (v - min) / range);
    };

    // Catmull-Rom → Bezier
    const toPath = () => {
        const pts = safeData.map((v, i) => [x(i), y(v)]);
        if (pts.length === 0) return "";
        let d = `M ${pts[0][0]} ${pts[0][1]}`;
        if (pts.length === 1) return d;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] || pts[i];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2] || p2;
            const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
            const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
            const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
            const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
        }
        return d;
    };

    // hover 포인트
    const [idx, setIdx] = React.useState<number | null>(null);
    const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
        const rect = (e.target as SVGRectElement).getBoundingClientRect();
        const px = e.clientX - rect.left;
        let nearest = 0, best = Infinity;
        for (let i = 0; i < data.length; i++) {
            const d = Math.abs(px - x(i));
            if (d < best) { best = d; nearest = i; }
        }
        setIdx(nearest);
    };
    const handleLeave = () => setIdx(null);

    const pathD = toPath();
    const areaD = pathD
        ? pathD + ` L ${x(safeData.length - 1)} ${height - padBottom} L ${x(0)} ${height - padBottom} Z`
        : "";

    // grid lines (padTop/Bottom 반영)
    const gridRatios = [0.2, 0.5, 0.8];
    const gridY = gridRatios.map(r => padTop + (height - padTop - padBottom) * r);

    const i = Math.max(0, Math.min(idx ?? Math.floor(denom / 2), safeData.length - 1));
    const cx = x(i);
    const cy = y(safeData[i]);
    const val = safeData[i];
    const label = safeLabels?.[i];

    // 위쪽에 가까우면 말풍선을 아래로 뒤집기
    const flipDown = (cy - 28) < 0 || cy < padTop + 8;

    return (
        <ChartWrap>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="성과 추세">
                <defs>
                    <linearGradient id="gLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={UI.color.primaryStrong} />
                        <stop offset="100%" stopColor={UI.color.primaryStrong} stopOpacity="0.75" />
                    </linearGradient>
                    <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={UI.color.primary} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={UI.color.primaryStrong} stopOpacity="0.04" />
                    </linearGradient>
                    <filter id="soft" x="-20%" y="-50%" width="140%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
                    </filter>
                </defs>

                {gridY.map((gy, i) => (
                    <line key={i} x1="0" x2={width} y1={gy} y2={gy} stroke="#e9eef7" strokeWidth="1" />
                ))}

                <path d={areaD} fill="url(#gFill)" />
                <path d={pathD} stroke="url(#gLine)" strokeWidth="2.5" fill="none" filter="url(#soft)" opacity=".55" />
                <path d={pathD} stroke="url(#gLine)" strokeWidth="2.5" fill="none" />

                {/* point + tooltip */}
                <g>
                    <circle cx={cx} cy={cy} r="4.5" fill="#fff" stroke={UI.color.primaryStrong} strokeWidth="2" />
                    {flipDown ? (
                        // 아래쪽 말풍선 (꼬리가 위를 향함)
                        <g transform={`translate(${cx}, ${cy + 18})`}>
                            <rect x={-12} y={-4} width="24" height="18" rx="6" fill="#fff" stroke="#e6eaf2" />
                            <polygon points="-4,-4 0,-10 4,-4" fill="#fff" stroke="#e6eaf2" />
                            <text x="0" y="9" textAnchor="middle" fontSize="12" fontWeight="750" fill={UI.color.text}>
                                {val}
                            </text>
                            {label && (
                                <text x="0" y="24" textAnchor="middle" fontSize="10" fill="#64748b">{label}</text>
                            )}
                        </g>
                    ) : (
                        // 위쪽 말풍선 (기존)
                        <g transform={`translate(${cx}, ${cy - 18})`}>
                            <rect x={-12} y={-16} width="24" height="18" rx="6" fill="#fff" stroke="#e6eaf2" />
                            <polygon points="-4,2 0,8 4,2" fill="#fff" stroke="#e6eaf2" />
                            <text x="0" y="-3" textAnchor="middle" fontSize="12" fontWeight="750" fill={UI.color.text}>
                                {val}
                            </text>
                            {label && (
                                <text x="0" y="-22" textAnchor="middle" fontSize="10" fill="#64748b">{label}</text>
                            )}
                        </g>
                    )}
                </g>

                <rect x="0" y="0" width={width} height={height} fill="transparent"
                      onMouseMove={handleMove} onMouseLeave={handleLeave} />
            </svg>
        </ChartWrap>
    );
}

const PageBtn = styled.button<{ disabled?: boolean }>`
    height: 34px;
    min-width: 34px;
    padding: 0 10px;
    border-radius: 10px;
    border: 1px solid ${UI.color.line};
    background: #fff;
    font-weight: 750;
    letter-spacing: -.01em;
    color: ${p => p.disabled ? "#9aa4b2" : UI.color.text};
    cursor: ${p => p.disabled ? "not-allowed" : "pointer"};
    &:hover {
        background: ${p => p.disabled ? "#fff" : "#f7f9fc"};
    }
`;

const PageInfo = styled.span`
    color: ${UI.color.muted};
    font-weight: 700;
`;

/* ===== 우측 버튼: 분할 버튼 형태 ===== */
const SegGroup = styled.div`
    display: inline-flex;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e6eaf2;
    box-shadow: 0 1px 0 rgba(0,0,0,.02);
`;

const Seg = styled.button`
    height: 36px;
    padding: 0 14px;
    border: 0;
    font-weight: 750;
    letter-spacing: -.02em;
    cursor: pointer;
`;

const SegGhost = styled(Seg)`
    background: #fff;
    color: #0f172a;
    letter-spacing: -.02em;
    &:hover {
        background: #f7f9fc;
    }
`;

const SegPrimary = styled(Seg)`
    background: ${UI.color.primaryStrong};
    letter-spacing: -.02em;
    color: #fff;
    &:hover {
        filter: brightness(.96);
    }
`;

/* ===== 사이드 ===== */
const SideCard = styled(StatCard)`
    gap: 12px;
    min-height: 0;
`;

const SideScroll = styled.div`
    display: grid;
    grid-template-rows: max-content 1fr;
    gap: 12px;
    min-height: 0; /* 스크롤 동작 핵심 */
    overflow: auto; /* 여기서 스크롤 */
    padding-right: 2px; /* 스크롤바 여백 */
`;

/* ===== 최근 이력 Pager ===== */
const PagerBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 6px;
`;
const ArrowBtn = styled.button<{disabled?: boolean}>`
    height: 30px;
    min-width: 30px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid ${UI.color.line};
    background: #fff;
    font-weight: 750;
    letter-spacing: -.01em;
    color: ${p => p.disabled ? "#9aa4b2" : UI.color.text};
    cursor: ${p => p.disabled ? "not-allowed" : "pointer"};
    &:hover { background: ${p => p.disabled ? "#fff" : "#f7f9fc"}; }
`;
const PagerInfo = styled.span`
    color: ${UI.color.muted};
    font-weight: 700;
    font-size: 12px;
`;

function RecentPager({ recent, pageSize = 6 }: { recent: Recent[]; pageSize?: number }) {
    const [page, setPage] = React.useState(0);
    const totalPages = Math.max(1, Math.ceil((recent?.length || 0) / pageSize));
    const start = page * pageSize;
    const pageItems = recent.slice(start, start + pageSize);
    React.useEffect(() => { if (page >= totalPages) setPage(Math.max(0, totalPages - 1)); }, [totalPages]);
    return (
        <>
            <List>
                {pageItems.map((r, i) => (
                    <Item key={start + i}>
                        <span>{r.label}</span>
                        <small>{r.when}</small>
                    </Item>
                ))}
                {recent.length === 0 && <div style={{ color: UI.color.muted }}>최근 기록이 없어요</div>}
            </List>
            {recent.length > pageSize && (
                <PagerBar>
                    <ArrowBtn onClick={() => setPage(0)} disabled={page===0}>≪</ArrowBtn>
                    <ArrowBtn onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0}>‹</ArrowBtn>
                    <PagerInfo>{page+1} / {totalPages}</PagerInfo>
                    <ArrowBtn onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page>=totalPages-1}>›</ArrowBtn>
                    <ArrowBtn onClick={() => setPage(totalPages-1)} disabled={page>=totalPages-1}>≫</ArrowBtn>
                </PagerBar>
            )}
        </>
    );
}

const SideTitle = styled.div`
    font-weight: 750;
    letter-spacing: -.02em;
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
    min-height: 0;
`;

const Item = styled.li`
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 10px;
    align-items: start;
    font-size: 14px;
    color: ${UI.color.text};

    /* 텍스트(왼쪽) */
    > span {
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* 날짜(오른쪽) */
    > small {
        color: ${UI.color.muted};
        white-space: nowrap;
        align-self: start;
        padding-top: 2px;
    }
`;

const Quick = styled.button<{ $size?: "sm" | "md" }>`
    /* CTA와 동일한 변수 */
    --cta-h: 48px; --cta-px: 18px; --cta-fs: 16px; --cta-ic: 28px;
    ${({ $size }) => $size === "sm" && `
    --cta-h: 40px; --cta-px: 14px; --cta-fs: 14px; --cta-ic: 24px;
  `}

    --cta-w: auto;
    width: var(--cta-w);
    max-width: 100%;

    position: relative;
    isolation: isolate;
    overflow: hidden;
    height: var(--cta-h);
    padding: 0 var(--cta-px);
    border: 0;
    border-radius: 999px;
    background: ${UI.gradient.quizCta};
    color: #fff;
    font-weight: 750;
    font-size: var(--cta-fs);
    letter-spacing: -0.02em;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    -webkit-tap-highlight-color: transparent;
    transition: transform 80ms ease;

    /* 텍스트 말줄임 동일 처리 */
    & > strong {
        font-weight: 600;
        flex: 1 1 auto;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    & > * { position: relative; z-index: 1; }

    /* hover 오버레이 */
    &::before {
        content: "";
        position: absolute; inset: 0;
        background: #2c73e5;
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 260ms ease;
        z-index: -1; pointer-events: none;
    }
    &:hover::before, &:focus-visible::before { transform: scaleX(1); }

    &:active { transform: scale(0.98); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.28); }

    @media (prefers-reduced-motion: reduce) {
        &::before { transition: none; }
    }
`;

/* CTA와 동일한 흰 원 아이콘 래퍼 */
const QuickIcon = styled.span`
  width: var(--cta-ic);
  height: var(--cta-ic);
  flex: 0 0 auto;
  border-radius: 999px;
  background: #ffffff;
  display: inline-grid;
  place-items: center;

    color: ${UI.color?.primaryStrong ?? "#3E63E0"};
    svg { width: 18px; height: 18px; }
    svg *, svg path, svg polyline, svg line, svg circle {
        vector-effect: non-scaling-stroke;
      }
    svg path, svg polyline, svg line, svg circle {
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
`;

const ChartWrap = styled.div`
    width: 100%;
    height: 96px;
    position: relative;
    border-radius: ${UI.radius.md}px;
    background:
            radial-gradient(120% 120% at 0% 0%, rgba(62,99,224,.05) 0%, rgba(62,99,224,0) 60%),
            linear-gradient(to bottom, #fff, #fbfcff);
    border: 1px solid rgba(14,18,28,.06);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.6);
    overflow: hidden;
`;

/* ===== 타입 ===== */
type PartType = "CHOICE" | "OX" | "INITIALS";

type TimelineItem = {
    id: number | string;
    title: string;
    partType: PartType;
    date: string;
    correct: number;
    total: number;
    category?: string | null;
};

type Summary = {
    totalSets: number;
    accuracy: number;
    retryRate: number;
};

type Recent = {
    when: string;
    label: string;
};

type TrendPoint = { date: string; value: number };
type TrendResponse = { metric: "accuracy" | "sets" | "retryRate"; span: string; points: TrendPoint[] };

/* ===== 유틸 ===== */
function fmtDate(iso: string) {
    try {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } catch {
        return iso;
    }
}

function labelOf(p: PartType) {
    return p === "CHOICE" ? "객관식" : p === "OX" ? "OX" : "초성";
}

/* ===== API 정규화 ===== */
async function fetchTimeline(params: {
    q?: string;
    type?: PartType | "ALL";
    page: number;
    size: number;
}) {
    const { q, type, page, size } = params;
    const headers = { ...authHeader() };
    const p: any = { q, page, size };
    if (type && type !== "ALL") p.type = type;
    const { data } = await http.get("/me/quiz/timeline", { params: p, headers });

    const s: Summary = {
        totalSets: Number(data?.summary?.totalSets ?? 0),
        accuracy: Number(data?.summary?.accuracy ?? 0),
        retryRate: Number(data?.summary?.retryRate ?? 0),
    };

    const items: TimelineItem[] = Array.isArray(data?.items)
        ? data.items.map((x: any) => ({
            id: x.id ?? x.sessionId ?? `${x.date}-${x.title}`,
            title: x.title ?? x.setTitle ?? "제목없음",
            partType: (x.partType ?? x.type ?? "CHOICE") as PartType,
            date: x.date ?? x.playedAt ?? new Date().toISOString(),
            correct: Number(x.correct ?? x.solved ?? 0),
            total: Number(x.total ?? x.totalQuestions ?? 0),
            category: x.category ?? x.categoryName ?? null,
        }))
        : [];

    const recent: Recent[] = Array.isArray(data?.recent)
        ? data.recent.map((r: any) => ({
            when: fmtDate(r.when ?? r.date ?? new Date().toISOString()),
            label: String(r.label ?? r.title ?? "퀴즈"),
        }))
        : [];

    const total = Number(data?.total ?? data?.totalElements ?? items.length);

    return { summary: s, items, recent, total };
}

async function fetchTrend(params: { metric: "accuracy" | "sets" | "retryRate"; span?: string }) {
    const headers = { ...authHeader() };
    const { data } = await http.get<TrendResponse>("/me/quiz/metrics", {
        params: { metric: params.metric, span: params.span ?? "30d" },
        headers,
    });
    const points: TrendPoint[] = Array.isArray(data?.points)
        ? data.points.map(p => ({ date: String(p.date), value: Number(p.value ?? 0) }))
        : [];
    return { ...data, points };
}

async function fetchTotalSets() {
    const headers = { ...authHeader() };
    const { data } = await http.get("/me/quiz/metrics/total-sets", { headers, withCredentials: true });
    return Number(data?.totalSets ?? 0);
}

async function fetchTotalSetsFallback(span = "365d") {
    const headers = { ...authHeader() };
    const { data } = await http.get("/me/quiz/metrics", {
        params: { metric: "sets", span },
        headers, withCredentials: true
    });
    const points = Array.isArray(data?.points) ? data.points : [];
    return points.reduce((sum, p) => sum + (Number.isFinite(+p.value) ? +p.value : 0), 0);
}

/* ===== 페이지 ===== */
export default function QuizTimelinePage() {
    const nav = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const loggedIn = !!localStorage.getItem("isLoggedIn");
        if (!loggedIn) goToAccountLogin(location.pathname + location.search);
    }, [location.pathname, location.search]);

    const [q, setQ] = React.useState("");
    const [type, setType] = React.useState<PartType | "ALL">("ALL");
    const [page, setPage] = React.useState(0);
    const [perPage] = React.useState(10);
    const [summary, setSummary] = React.useState<Summary>({
        totalSets: 0,
        accuracy: 0,
        retryRate: 0
    });
    const [items, setItems] = React.useState<TimelineItem[]>([]);
    const [recent, setRecent] = React.useState<Recent[]>([]);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                const n = await fetchTotalSets();
                if (!cancel) setSummary(s => ({ ...s, totalSets: n }));
            } catch (e1) {
                try {
                    const n = await fetchTotalSetsFallback("365d");
                    if (!cancel) setSummary(s => ({ ...s, totalSets: n }));
                } catch (e2) {
                    console.warn("[totalSets] both fetches failed", e1, e2);
                }
            }
        })();
        return () => { cancel = true; };
    }, []);

    React.useEffect(() => {
        let cancel = false;

        const run = async () => {
            setLoading(true);
            try {
                const res = await fetchTimeline({ q: q.trim() || undefined, type, page, size: perPage });
                if (cancel) return;
                setSummary(s => ({ ...s, accuracy: res.summary.accuracy, retryRate: res.summary.retryRate }));
                setItems(res.items);
                setRecent(res.recent);
                setTotal(res.total);
            } catch (e) {
                if (!cancel) { setItems([]); setTotal(0); }
                console.warn("[timeline] fetch failed", e);
            } finally {
                if (!cancel) setLoading(false);
            }
        };

        const t = setTimeout(run, 200);
        return () => { cancel = true; clearTimeout(t); };
    }, [q, type, page, perPage]);

    const pages = Math.max(1, Math.ceil((total || 0) / perPage));

    const [metric, setMetric] = React.useState<"accuracy" | "sets" | "retryRate">("accuracy");
    const [trend, setTrend] = React.useState<TrendPoint[]>([]);
    const [trendLoading, setTrendLoading] = React.useState(false);

    React.useEffect(() => {
        let cancel = false;
        const run = async () => {
            setTrendLoading(true);
            try {
                const res = await fetchTrend({ metric, span: "30d" });
                if (!cancel) setTrend(res.points);
            } catch (e) {
                if (!cancel) setTrend([]);
                console.warn("[trend] fetch failed", e);
            } finally {
                if (!cancel) setTrendLoading(false);
            }
        };
        run();
        return () => { cancel = true; };
    }, [metric]);

    return (
        <NarrowLeft style={{ padding: "8px 0 24px" }}>
            {/* 상단 */}
            <Toolbar>
                <TitleRow>
                    <Title>나의 퀴즈 타임라인(Quiz Timeline)</Title>
                </TitleRow>
            </Toolbar>

            <Screen>
                <LeftCol>
                    {/* 1) 통계 카드 */}
                    <KPIGrid>
                        {/* 완료 세트 */}
                        <KPICard $from="#D8E7FF" $to="#CFE0FF" style={{ borderColor: "rgba(62,99,224,.20)" }}>
                            <div className="kpi-body">
                                <div className="kpi-label">완료 세트</div>
                                <div className="kpi-value">{summary.totalSets}</div>
                                <div className="kpi-sub">누적 집계</div>
                            </div>
                            <div className="kpi-icon" aria-hidden>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M4 12l4 4 12-12" stroke="#6F5DE6" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </KPICard>

                        {/* 정답률 */}
                        <KPICard $from="#E8E3FF" $to="#E1DAFF" style={{ borderColor: "rgba(139,124,246,.24)" }}>
                            <div className="kpi-body">
                                <div className="kpi-label">정답률</div>
                                <div className="kpi-value">{Math.round(summary.accuracy)}%</div>
                                <div className="kpi-sub">전체 평균</div>
                            </div>
                            <div className="kpi-icon" aria-hidden>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M4 12l4 4 12-12"
                                          stroke="#6F5DE6" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                                </svg>
                            </div>
                        </KPICard>

                        {/* 재도전율 */}
                        <KPICard $from="#D8F0E7" $to="#E4F8EF" style={{ borderColor: "rgba(16,185,129,.22)" }}>
                            <div className="kpi-body">
                                <div className="kpi-label">재도전율</div>
                                <div className="kpi-value">{Math.round(summary.retryRate)}%</div>
                                <div className="kpi-sub">최근 세션 기준</div>
                            </div>
                            <div className="kpi-icon" aria-hidden>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5v6l4 2"
                                          stroke="#0EA37E" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                                </svg>
                            </div>
                        </KPICard>
                    </KPIGrid>

                    {/* 2) 필터 */}
                    <FilterBar>
                        {[
                            { key: "ALL", label: "전체" },
                            { key: "CHOICE", label: "객관식" },
                            { key: "OX", label: "OX" },
                            { key: "INITIALS", label: "초성" },
                        ].map((f: any) => (
                            <Chip
                                key={f.key}
                                onClick={() => {
                                    setType(f.key);
                                    setPage(0);
                                }}
                                $active={type === f.key as any}
                                aria-pressed={type === f.key as any}
                                role="tab"
                            >
                                {f.label}
                            </Chip>
                        ))}
                    </FilterBar>

                    {/* 3) 타임라인 리스트 */}
                    <TimelinePanel role="list" aria-label="퀴즈 타임라인 목록">
                        {items.length === 0 && (
                            <div style={{ padding: "28px", color: UI.color.muted }}>
                                {loading ? "불러오는 중..." : "표시할 타임라인이 없어요."}
                            </div>
                        )}
                        {items.map((it) => (
                            <Row key={it.id} role="listitem">
                                {/* 왼쪽: 제목 */}
                                <TitleStack>
                                    <QuizTitle>
                                        [{it.category || labelOf(it.partType)}] {fmtDate(it.date)} {it.title}
                                    </QuizTitle>
                                    <div>
                                        <LightPill onClick={() => nav("/quiz/today")}>
                                            {it.category ? it.category : "오늘의 퀴즈"}
                                        </LightPill>
                                    </div>
                                </TitleStack>

                                {/* 오른쪽: 도넛 + 버튼 */}
                                <ActionBar>
                                    <DonutWrap>
                                        <Donut value={it.correct} total={it.total} />
                                    </DonutWrap>
                                    <SegGroup>
                                        <SegGhost onClick={() => nav(`/quiz/result/${it.id}`)}>결과 보기</SegGhost>
                                        <SegPrimary onClick={() => nav(`/quiz/retry/${it.id}`)}>재도전</SegPrimary>
                                    </SegGroup>
                                </ActionBar>
                            </Row>
                        ))}
                    </TimelinePanel>

                    {/* 페이징 */}
                    {items.length > 0 && (
                        <PaginationBar aria-label="타임라인 페이지 이동">
                            <PageBtn
                                onClick={() => setPage(0)}
                                disabled={page === 0}
                            >
                                ≪
                            </PageBtn>
                            <PageBtn
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                ‹ 이전
                            </PageBtn>
                            <PageInfo>페이지 {page + 1} / {pages}</PageInfo>
                            <PageBtn
                                onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                                disabled={page >= pages - 1}
                            >
                                다음 ›
                            </PageBtn>
                            <PageBtn
                                onClick={() => setPage(pages - 1)}
                                disabled={page >= pages - 1}
                            >
                                ≫
                            </PageBtn>
                        </PaginationBar>
                    )}
                </LeftCol>

                {/* 오른쪽 사이드 */}
                <RightCol>
                    {/* 검색 카드: 최근 이력 카드와 동일한 위치·폭 */}
                    <SearchCard>
                        <SearchLabel>세트/카테고리 검색</SearchLabel>
                        <SearchInput
                            placeholder="세트/카테고리 검색"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value);
                                setPage(0);
                            }}
                        />
                    </SearchCard>

                    {/* 성과 대시보드: 자연 높이 유지 (왜곡 방지) */}
                    <SideCard>
                        <SideTitle>성과 대시보드</SideTitle>
                        <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                            {[
                                { k: "accuracy", label: "정답률(%)" },
                                { k: "sets", label: "세트 수" },
                                { k: "retryRate", label: "재도전율(%)" },
                            ].map(btn => (
                                <button
                                    key={btn.k}
                                    onClick={() => setMetric(btn.k as any)}
                                    style={{
                                        height: 30, padding: "0 10px", borderRadius: 8,
                                        border: "1px solid #e6eaf2",
                                        background: metric === btn.k ? UI.color.primaryStrong : "#fff",
                                        color: metric === btn.k ? "#fff" : UI.color.text,
                                        fontWeight: 750, letterSpacing: "-.01em", cursor: "pointer"
                                    }}
                                    aria-pressed={metric === btn.k}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <MiniAreaChart
                                data={(trend.length ? trend.map(p => p.value) : [])}
                                labels={(trend.length ? trend.map(p => p.date.slice(5)) : [])}
                            />
                        </div>
                        <div style={{ color: UI.color.muted, fontSize: 13 }}>
                            최근 30일 추이 {trendLoading ? "(불러오는 중…)" : ""}
                        </div>
                    </SideCard>

                    <SideCard>
                        <SideTitle>빠른 재도전</SideTitle>
                        <Quick onClick={() => nav("/quiz/quick-retry")} aria-label="오답만 다시 풀기">
                            <strong>오답만 다시 풀기</strong>
                            <QuickIcon aria-hidden>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
                                    <polyline points="20 4 20 10 14 10" />
                                </svg>
                            </QuickIcon>
                        </Quick>
                    </SideCard>

                    {/* 최근 이력: 버튼으로 넘기는 Pager */}
                    <SideCard>
                        <SideTitle>최근 이력</SideTitle>
                        <RecentPager recent={recent} />
                    </SideCard>
                </RightCol>
            </Screen>
        </NarrowLeft>
    );
}