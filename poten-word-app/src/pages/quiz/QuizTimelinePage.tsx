import React from "react";
import styled, { keyframes, css } from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import http, { authHeader } from "../../utils/http.ts";
import { NarrowLeft } from "../../styles/layout.ts";
import { goToAccountLogin } from "../../utils/auth.ts";
import SystemMessageModal, {SystemMessage} from "../../components/common/SystemMessageModal";
import { createPortal } from "react-dom";
import {usePotenDialog} from "../../components/common/PotenDialog.tsx";

/* ===== UI tokens ===== */
const UI = {
    color: {
        bg: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
        line: "#e5e7eb",
        primary: "#4F76F1",
        primaryBlue: "#4369e5",
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
        quizCta: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
    },
    radius: {
        xl: 16,
        lg: 12,
        md: 10,
        sm: 8,
        pill: 999,
    },
    shadow: {
        card: "0 1px 0 rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.05)",
        bar: "0 4px 14px rgba(0,0,0,0.06)",
        menu: "0 6px 18px rgba(0,0,0,0.10)",
    },
    font: {
        h2: "26px",
        body: "15px",
        tiny: "12px",
    },
};

const riseIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(2px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
    }
`;

const stagger = (ms: number) => css`
    opacity: 0;
    animation: ${riseIn} 520ms cubic-bezier(.2,.8,.2,1) forwards;
    animation-delay: ${ms}ms;

    @media (prefers-reduced-motion: reduce) {
        opacity: 1;
        animation: none;
        transform: none;
        filter: none;
    }
`;

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
    position: relative;
    z-index: 2;
    display: grid;
    gap: 16px;
`;

const RightCol = styled.aside`
    position: sticky;
    top: 64px;
    z-index: 1;

    max-height: calc(100vh - 64px);
    overflow: auto;
    padding-bottom: 12px;
    overscroll-behavior: contain;
    align-self: start;
    display: grid;
    grid-template-rows: max-content max-content max-content max-content;
    gap: 12px;

    @media (max-width: 1024px) {
        position: static;
        max-height: none;
        overflow: visible;
        padding-bottom: 0;
        grid-template-rows: none;
    }
`;

const BottomGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 18px;
    margin-top: 16px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
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
    letter-spacing: -0.02em;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 38px;
    border-radius: ${UI.radius.md}px;
    border: 1px solid ${UI.color.line};
    padding: 0 12px 0 36px;
    background: #fff url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='7' stroke='%239aa0a6' stroke-width='2'/%3E%3Cpath d='M20 20l-3.2-3.2' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat 10px 50%;
    font-size: 14px;
    letter-spacing: -0.02em;
    &:focus {
        outline: none;
        border-color: ${UI.color.primaryStrong};
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.16);
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
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    transform 0.08s ease, filter 0.15s ease;

    /* GhostBtn 스타일 (비활성) */
    background: #f3f4f6;
    color: #374151;
    border: 1px solid ${UI.color.line};

    /* PrimaryBtn 스타일 (활성) */
    ${({ $active }) =>
            $active &&
            `
    background: ${UI.color.primary};
    color: #fff;
    border: 1px solid ${UI.color.primary};
  `}

    &:hover {
        ${({ $active }) => ($active ? `background: ${UI.color.primaryStrong};` : `background: #e5e7eb;`)}
    }
    &:active {
        transform: translateY(1px);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.25);
    }
    &[aria-pressed="true"] {
        background: ${UI.color.primary};
        color: #fff;
        border-color: ${UI.color.primary};
    }
`;

/* ===== 통계 카드 ===== */
const StatCard = styled.div`
    border: 1px solid ${UI.color.line};
    border-radius: ${UI.radius.lg}px;
    background: #fff;
    box-shadow: ${UI.shadow.card};
    padding: 16px 18px;
    display: grid;
    gap: 8px;
`;

/* ===== 리스트 패널 ===== */
const Panel = styled.div`
    border: 1px solid rgba(14, 18, 28, 0.06);
    border-radius: ${UI.radius.lg}px;
    background: #fff;
    box-shadow: 0 6px 16px rgba(30, 41, 59, 0.05);
    overflow: hidden;
`;

const TimelinePanel = styled(Panel)`
    min-height: 460px;
    overflow: visible;
`;

/* ===== 타임라인 ===== */
const Row = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 22px 20px;

    &:not(:last-child) {
        box-shadow: inset 0 -1px #f1f5f9;
    }

    transition: background 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        background: #fbfcff;
        box-shadow: inset 0 -1px #eef2f7, 0 1px 6px rgba(62, 99, 224, 0.05);
    }
`;

const ActionBar = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;
    padding-right: 0px;
`;

const MenuWrap = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;
`;


const RowMenuWrap = styled.div`
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 20;
    display: inline-flex;
    align-items: center;
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
    letter-spacing: -0.02em;
    color: #0f172a;
`;

const LightPill = styled.button`
    border: 0;
    height: 24px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    line-height: 1;
    border-radius: ${UI.radius.pill}px;

    font-weight: 400;
    font-size: 13px;
    letter-spacing: -0.02em;
    color: ${UI.color.primaryStrong};
    background: rgba(79, 118, 241, 0.1);

    &:hover { background: rgba(79, 118, 241, 0.14); }
`;

const RetryBadge = styled.span`
  height: 24px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  border-radius: ${UI.radius.pill}px;

  font-weight: 400;
  font-size: 13px;
  letter-spacing: -0.02em;

  color: #25c4b1;
  background: #e9fcf8;
`;

const WrongOnlyBadge = styled.span`
  height: 24px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  border-radius: ${UI.radius.pill}px;

  font-weight: 400;
  font-size: 13px;
  letter-spacing: -0.02em;
  white-space: nowrap;

  color: #675CF6;
  background: #efeefe;
`;

const MetaText = styled.span`
    color: ${UI.color.muted};
    font-size: 12px;
    font-weight: 400;
    letter-spacing: -0.02em;
    white-space: nowrap;
    line-height: 1;

    position: relative;
    top: 1px;
`;

const PillRow = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

/* ===== 도넛 ===== */
function Donut({
                   value,
                   total,
                   size = 64,
                   stroke = 10,
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
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`진행률 ${pct}%`}>
            <defs>
                <linearGradient id={safeId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22c1b5" />
                    <filter id="softShadow" x="-25%" y="-25%" width="150%" height="150%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#111827" floodOpacity="0.08" />
                    </filter>
                </linearGradient>
            </defs>
            <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef2f7" strokeWidth={stroke} fill="none" />
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

/* ===== KPI 카드 ===== */
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
    isolation: isolate;
    overflow: hidden;

    border-radius: ${UI.radius.lg}px;
    padding: 14px 16px;
    min-height: 86px;

    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;

    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);

    transition: transform 180ms cubic-bezier(.2,.8,.2,1),
    box-shadow 180ms cubic-bezier(.2,.8,.2,1),
    border-color 180ms ease,
    filter 180ms ease;

    /* (기존 before/after 유지) */
    &::before {
        content: "";
        position: absolute;
        inset: -2px;
        z-index: 0;
        pointer-events: none;

        background:
                linear-gradient(
                        225deg,
                        ${({ $to }) => $to} 0%,
                        ${({ $from }) => $from} 26%,
                        rgba(255,255,255,0) 58%,
                        rgba(255,255,255,0) 100%
                ),
                linear-gradient(
                        225deg,
                        rgba(255,255,255,0.14) 0%,
                        rgba(255,255,255,0.06) 22%,
                        rgba(255,255,255,0) 52%
                ),
                radial-gradient(
                        110% 90% at 110% 110%,
                        ${({ $from }) => $from} 0%,
                        rgba(255,255,255,0) 72%
                );

        opacity: 0.72;
        transition: opacity 180ms ease, transform 180ms cubic-bezier(.2,.8,.2,1);
    }

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        background: linear-gradient(
                180deg,
                rgba(255,255,255,0.18) 0%,
                rgba(255,255,255,0.06) 36%,
                rgba(255,255,255,0) 100%
        );
        transition: opacity 180ms ease;
    }

    .kpi-body,
    .kpi-icon {
        position: relative;
        z-index: 1;
    }

    .kpi-body { display: grid; gap: 6px; }
    .kpi-label { font-size: 12px; font-weight: 750; letter-spacing: -0.02em; color: #334155; opacity: 0.92; }
    .kpi-value { font-size: 36px; font-weight: 900; letter-spacing: -0.02em; color: #0f172a; display: inline-flex; align-items: baseline; gap: 2px; }
    .kpi-unit { font-size: 20px; font-weight: 750; letter-spacing: -0.02em; color: rgba(15, 23, 42, 0.72); transform: translateY(-2px); }
    .kpi-sub { font-size: 12px; font-weight: 400; color: ${UI.color.muted}; letter-spacing: -0.02em; }

    .kpi-icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        display: grid;
        place-items: center;

        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(15, 23, 42, 0.10);
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);

        transition: transform 180ms cubic-bezier(.2,.8,.2,1),
        box-shadow 180ms ease,
        background 180ms ease;

        svg {
            width: 18px;
            height: 18px;
            transition: transform 180ms cubic-bezier(.2,.8,.2,1);
        }
    }

    &:hover {
        transform: translateY(-3px);
        border-color: rgba(15, 23, 42, 0.11);

        box-shadow:
                0 8px 22px rgba(15, 23, 42, 0.075),
                0 1px 0 rgba(255,255,255,0.55) inset;

        &::before { opacity: 0.80; transform: translateY(-1px); }
        &::after { opacity: 0.92; }

        .kpi-icon {
            transform: translateY(-1px);

            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.075);

            svg { transform: rotate(-6deg) scale(1.03); }
        }
    }

    &:active {
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.18), 0 10px 28px rgba(15, 23, 42, 0.10);
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
        &::before, &::after { transition: none; }
        .kpi-icon, .kpi-icon svg { transition: none; }
        &:hover, &:active { transform: none; }
    }
`;

const PaginationBar = styled.nav`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px;
`;

const PagePill = styled.button<{ $active?: boolean }>`
    height: 34px;
    min-width: 34px;
    padding: 0 12px;
    border-radius: 10px;
    border: 0;

    font-weight: 800;
    letter-spacing: -0.02em;
    cursor: pointer;

    color: ${({ $active }) => ($active ? "#fff" : "rgba(15,23,42,0.70)")};
    background: ${({ $active }) => ($active ? "#3E63E0" : "transparent")};

    transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

    &:hover {
        background: ${({ $active }) => ($active ? "#3E63E0" : "rgba(255,255,255,0.85)")};
        color: ${({ $active }) => ($active ? "#fff" : UI.color.text)};
    }
    &:active {
        transform: translateY(1px);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.22);
    }
`;

const PageNavBtn = styled(PagePill)<{ disabled?: boolean }>`
    padding: 0 10px;
    color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : "rgba(15,23,42,0.70)")};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    &:hover {
        background: ${({ disabled }) => (disabled ? "transparent" : "rgba(255,255,255,0.85)")};
        color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : UI.color.text)};
    }
    &:active {
        transform: ${({ disabled }) => (disabled ? "none" : "translateY(1px)")};
    }
`;

const PaginationRow = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

function MiniAreaChart({
                           data = [1, 5, 3, 4, 2.8, 6.2, 4.8, 6.5],
                           labels,
                           height = 150,
                           valueUnit = "auto", // "auto" | "percent" | "count"
                       }: {
    data?: number[];
    labels?: string[];
    height?: number;
    valueUnit?: "auto" | "percent" | "count";
}) {
    const width = 320;

    const safeData = (() => {
        if (!Array.isArray(data) || data.length === 0) return [0, 0];
        if (data.length === 1) return [data[0], data[0]];
        return data;
    })();

    const rawMin = Math.min(...safeData);
    const rawMax = Math.max(...safeData);

    // % 성격이면 0~100
    let yMin = rawMin;
    let yMax = rawMax;
    if (rawMax <= 100 && rawMin >= 0) {
        yMin = 0;
        yMax = 100;
    }
    const yRange = yMax - yMin || 1;

    const padX = 14;
    const padTop = 14;
    const padBottom = 36;
    const plotW = width - padX * 2;
    const plotH = height - padTop - padBottom;

    const denom = Math.max(1, safeData.length - 1);
    const x = (i: number) => padX + (i * plotW) / denom;
    const y = (v: number) => padTop + plotH * (1 - (v - yMin) / yRange);
    const yBase = padTop + plotH;

    // Catmull-Rom -> Bezier
    const toPath = () => {
        const pts = safeData.map((v, i) => [x(i), y(v)] as const);
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

    const pathD = toPath();

    const areaD = (() => {
        const pts = safeData.map((v, i) => [x(i), y(v)] as const);
        if (pts.length === 0) return "";
        const firstX = pts[0][0];
        const lastX = pts[pts.length - 1][0];
        return `${pathD} L ${lastX} ${yBase} L ${firstX} ${yBase} Z`;
    })();

    const [idx, setIdx] = React.useState<number | null>(null);
    const handleLeave = () => setIdx(null);

    // labels 안전 처리
    const safeLabels =
        Array.isArray(labels) && labels.length === safeData.length ? labels : undefined;

    // tick 선택
    const pickTickIdx = (n: number) => {
        if (n <= 1) return [0];

        // 7개 이하면 전부 표시 (최근 7일)
        if (n <= 7) return Array.from({ length: n }, (_, i) => i);

        // 8개 이상이면 기존처럼 적당히 줄이기
        if (n <= 10) return [0, Math.floor((n - 1) / 2), n - 1];
        return [0, Math.floor((n - 1) / 3), Math.floor(((n - 1) * 2) / 3), n - 1];
    };

    const tickIdx = pickTickIdx(safeData.length);

    const fmtX = (s: string) => {
        if (!s) return "";
        // "YYYY-MM-DD" 또는 "MM-DD" 모두 대응
        return s.replaceAll("-", "/");
    };

    // svg 실제 렌더 폭(px)
    const svgRef = React.useRef<SVGSVGElement | null>(null);
    const [wrapW, setWrapW] = React.useState<number>(width);

    React.useLayoutEffect(() => {
        const el = svgRef.current;
        if (!el) return;

        const update = () => {
            const r = el.getBoundingClientRect();
            setWrapW(r.width || width);
        };

        update();

        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", update);
            return () => window.removeEventListener("resize", update);
        }

        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [width]);

    // 마우스(px) -> viewBox 좌표 변환 후 nearest 계산
    const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const ux = (px / rect.width) * width;

        let nearest = 0;
        let best = Infinity;
        for (let i = 0; i < safeData.length; i++) {
            const dist = Math.abs(ux - x(i));
            if (dist < best) {
                best = dist;
                nearest = i;
            }
        }
        setIdx(nearest);
    };

    const nearestTick = React.useMemo(() => {
        if (idx === null) return null;
        return tickIdx.reduce(
            (bestK, curK) => (Math.abs(curK - idx) < Math.abs(bestK - idx) ? curK : bestK),
            tickIdx[0]
        );
    }, [idx, tickIdx]);

    // 현재 포인트 계산
    const i = Math.max(0, Math.min(idx ?? safeData.length - 1, safeData.length - 1));
    const cx = x(i);
    const cy = y(safeData[i]);
    const val = safeData[i];
    const rounded = Number.isFinite(val) ? Math.round(val) : val;

    const isPercent =
        valueUnit === "percent" || (valueUnit === "auto" && rawMax <= 100 && rawMin >= 0);

    // 0이면 그대로, 0이 아니면 % 붙이기
    const tipText =
        Number.isFinite(rounded) && isPercent && rounded !== 0
            ? `${rounded}%`
            : String(rounded);

    const tipW = Math.max(44, 10 + tipText.length * 8);
    const tipH = 24;

    const TIP_EDGE_PAD = 6; // 툴팁과 차트 가장자리 간 최소 여백

    const tipX = Math.max(
        tipW / 2 + TIP_EDGE_PAD,
        Math.min(cx, width - tipW / 2 - TIP_EDGE_PAD)
    );
    const tipY = Math.max(10, cy - 22);

    const dense = safeData.length <= 7;
    const EDGE_PAD = 10;

    return (
        <ChartWrap>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                height={height}
                role="img"
                aria-label="성과 추세"
                shapeRendering="geometricPrecision"
            >
                <defs>
                    <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={UI.color.primaryStrong} />
                        <stop offset="100%" stopColor={UI.color.primary} />
                    </linearGradient>

                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={UI.color.primaryStrong} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={UI.color.primaryStrong} stopOpacity="0.02" />
                    </linearGradient>

                    <filter id="focusGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#3E63E0" floodOpacity="0.28" />
                        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#111827" floodOpacity="0.10" />
                    </filter>
                </defs>

                {[0.33, 0.66].map((r, gi) => (
                    <line
                        key={gi}
                        x1={padX}
                        x2={width - padX}
                        y1={padTop + plotH * r}
                        y2={padTop + plotH * r}
                        stroke="rgba(17,24,39,0.06)"
                        strokeWidth="1"
                    />
                ))}

                <path d={areaD} fill="url(#trendFill)" />

                <path
                    d={pathD}
                    stroke="url(#trendLine)"
                    strokeWidth="2.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#softShadow)"
                />

                {idx !== null && (
                    <>
                        {/* 1) 툴팁까지 이어지는 세로 라인 (점 -> 툴팁 하단) */}
                        <line
                            x1={cx}
                            x2={cx}
                            y1={Math.min(cy + 6, tipY - tipH + 2)}
                            y2={tipY - tipH + 2}
                            stroke="rgba(62,99,224,0.55)"
                            strokeWidth="1.6"
                            strokeDasharray="0"
                            strokeLinecap="round"
                        />

                        {/* 2) 점 -> x축까지 라인(기존 역할), 좀 더 선명한 점선 */}
                        <line
                            x1={cx}
                            x2={cx}
                            y1={cy + 6}
                            y2={yBase}
                            stroke="rgba(17,24,39,0.32)"
                            strokeWidth="1.3"
                            strokeDasharray="4 4"
                            strokeLinecap="round"
                        />
                    </>
                )}

                {idx !== null && (
                    <>
                        {/* outer glow ring */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r="7"
                            fill="rgba(62,99,224,0.16)"
                            filter="url(#focusGlow)"
                        />
                        {/* main point */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r="5"
                            fill="#ffffff"
                            stroke={UI.color.primaryStrong}
                            strokeWidth="2.4"
                        />
                    </>
                )}

                {idx !== null && (
                    <g transform={`translate(${tipX}, ${tipY})`}>
                        <rect x={-tipW / 2} y={-tipH} width={tipW} height={tipH} rx="8" fill="rgba(17,24,39,0.92)" />
                        <text x="0" y={-8} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">
                            {tipText}
                        </text>
                    </g>
                )}

                <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    fill="transparent"
                    onMouseMove={handleMove}
                    onMouseLeave={handleLeave}
                />
            </svg>

            <XBadges>
                {tickIdx.map((k, idxInTicks) => {
                    const txt = fmtX(safeLabels?.[k] ?? "");
                    const active = idx !== null && k === nearestTick;

                    const rawX = (x(k) / width) * wrapW;

                    const clampedX =
                        idxInTicks === 0
                            ? Math.max(rawX, EDGE_PAD)
                            : idxInTicks === tickIdx.length - 1
                                ? Math.min(rawX, wrapW - EDGE_PAD)
                                : rawX;

                    return (
                        <XTick key={k} $x={clampedX} $active={active} $dense={dense}>
                            {txt}
                        </XTick>
                    );
                })}
            </XBadges>
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
    letter-spacing: -0.01em;
    color: ${(p) => (p.disabled ? "#9aa4b2" : UI.color.text)};
    cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
    &:hover {
        background: ${(p) => (p.disabled ? "#fff" : "#f7f9fc")};
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
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
`;

const Seg = styled.button`
    height: 36px;
    padding: 0 14px;
    border: 0;
    font-weight: 750;
    letter-spacing: -0.02em;
    cursor: pointer;
`;

const SegGhost = styled(Seg)`
    background: #fff;
    color: #0f172a;
    letter-spacing: -0.02em;
    &:hover {
        background: #f7f9fc;
    }
`;

const SegPrimary = styled(Seg)`
    background: ${UI.color.primaryStrong};
    letter-spacing: -0.02em;
    color: #fff;
    &:hover {
        filter: brightness(0.96);
    }
`;

/* ===== 사이드 ===== */
const SideCard = styled(StatCard)`
    gap: 12px;
    min-height: 0;
`;

/* ===== 최근 이력 Pager ===== */
const PagerBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 6px;
`;
const ArrowBtn = styled.button<{ disabled?: boolean }>`
    height: 30px;
    min-width: 30px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid ${UI.color.line};
    background: #fff;
    font-weight: 750;
    letter-spacing: -0.01em;
    color: ${(p) => (p.disabled ? "#9aa4b2" : UI.color.text)};
    cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
    &:hover {
        background: ${(p) => (p.disabled ? "#fff" : "#f7f9fc")};
    }
`;
const PagerInfo = styled.span`
    color: ${UI.color.muted};
    font-weight: 700;
    font-size: 12px;
`;

type Recent = {
    when: string;
    label: string;
};

const MoreBtn = styled.button`
    width: 24px;
    height: 24px;
    border-radius: 8px;
    padding: 0;

    border: 0;
    outline: none;
    background: transparent;
    color: rgba(15, 23, 42, 0.72);
    cursor: pointer;

    display: inline-grid;
    place-items: center;

    position: relative;
    transition: transform 80ms ease, background 150ms ease, box-shadow 150ms ease;

    &::before {
        content: "";
        position: absolute;
        inset: -6px;
    }

    &:hover {
        background: transparent;
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.16);
        background: rgba(62, 99, 224, 0.08);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const MoreIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5.5" r="1.35" fill="currentColor" />
        <circle cx="12" cy="12" r="1.35" fill="currentColor" />
        <circle cx="12" cy="18.5" r="1.35" fill="currentColor" />
    </svg>
);

const DropMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 50;

  min-width: 160px;
  padding: 6px;
  border-radius: 12px;

  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.10);
  box-shadow: ${UI.shadow.menu};
`;

const MenuItemBtn = styled.button<{ $danger?: boolean }>`
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 10px;
  border-radius: 10px;

  font-weight: 750;
  letter-spacing: -0.02em;
  font-size: 13.5px;

  color: ${({ $danger }) => ($danger ? "#b91c1c" : UI.color.text)};

  &:hover {
    background: ${({ $danger }) => ($danger ? "rgba(239,68,68,0.10)" : "#f7f9fc")};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

const MenuIcon = styled.span`
  width: 18px;
  display: inline-grid;
  place-items: center;
`;

function RecentPager({ recent, pageSize = 6 }: { recent: Recent[]; pageSize?: number }) {
    const [page, setPage] = React.useState(0);
    const totalPages = Math.max(1, Math.ceil((recent?.length || 0) / pageSize));
    const start = page * pageSize;
    const pageItems = recent.slice(start, start + pageSize);

    React.useEffect(() => {
        if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
    }, [totalPages]);

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
                    <ArrowBtn onClick={() => setPage(0)} disabled={page === 0}>
                        ≪
                    </ArrowBtn>
                    <ArrowBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                        ‹
                    </ArrowBtn>
                    <PagerInfo>
                        {page + 1} / {totalPages}
                    </PagerInfo>
                    <ArrowBtn onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                        ›
                    </ArrowBtn>
                    <ArrowBtn onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
                        ≫
                    </ArrowBtn>
                </PagerBar>
            )}
        </>
    );
}

const SideTitle = styled.div`
    font-weight: 750;
    letter-spacing: -0.02em;
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

    > span {
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    > small {
        color: ${UI.color.muted};
        white-space: nowrap;
        align-self: start;
        padding-top: 2px;
    }
`;

const Quick = styled.button<{ $size?: "sm" | "md" }>`
    --cta-h: 48px;
    --cta-px: 18px;
    --cta-fs: 16px;
    --cta-ic: 28px;
    ${({ $size }) =>
            $size === "sm" &&
            `
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

    & > strong {
        font-weight: 600;
        flex: 1 1 auto;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    & > * {
        position: relative;
        z-index: 1;
    }

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: #2c73e5;
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 260ms ease;
        z-index: -1;
        pointer-events: none;
    }
    &:hover::before,
    &:focus-visible::before {
        transform: scaleX(1);
    }

    &:active {
        transform: scale(0.98);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.28);
    }

    @media (prefers-reduced-motion: reduce) {
        &::before {
            transition: none;
        }
    }
`;

const Z = {
    modal: 2147483000,
};

/* ===== Quick Retry Modal ===== */
const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: ${Z.modal};
    background: rgba(15, 23, 42, 0.45);
    display: grid;
    place-items: center;
    padding: 18px;
`;

const ModalCard = styled.div`
  position: relative;
  z-index: ${Z.modal + 1};
  width: min(520px, 100%);
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.18);
  overflow: hidden;
  animation: ${riseIn} 220ms ease-out;
`;

const ModalHead = styled.div`
  padding: 16px 18px 10px;
  border-bottom: 1px solid ${UI.color.line};
`;

const ModalTitle = styled.div`
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: ${UI.color.text};
`;

const ModalDesc = styled.div`
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.45;
  letter-spacing: -0.02em;
  color: ${UI.color.muted};
`;

const ModalBody = styled.div`
  padding: 14px 18px 16px;
  display: grid;
  gap: 12px;
`;

const OptionGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const OptionBtn = styled.button<{ $active?: boolean }>`
  width: 100%;
  text-align: left;
  border-radius: 14px;
  border: 1px solid ${({ $active }) => ($active ? "rgba(62,99,224,0.35)" : UI.color.line)};
  background: ${({ $active }) => ($active ? "rgba(79,118,241,0.10)" : "#fff")};
  padding: 14px 14px;
  cursor: pointer;

  display: grid;
  gap: 4px;

  transition: transform 80ms ease, background 150ms ease, border-color 150ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? "rgba(79,118,241,0.13)" : "#f7f9fc")};
  }
  &:active {
    transform: translateY(1px);
  }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.16);
  }
`;

const OptionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const OptionLabel = styled.div`
    font-weight: 750;
    font-size: 14.5px;
    letter-spacing: -0.02em;
    color: ${UI.color.text};
`;

const OptionSub = styled.div`
  font-size: 12px;
  letter-spacing: -0.02em;
  color: ${UI.color.muted};
`;

const CheckDot = styled.span<{ $on?: boolean }>`
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    flex: 0 0 18px;
    line-height: 0;

    border-radius: 999px;
    border: 2px solid ${({ $on }) => ($on ? UI.color.primaryStrong : "rgba(15,23,42,0.25)")};

    display: grid;
    place-items: center;

    &::after {
        content: "";
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: ${({ $on }) => ($on ? UI.color.primaryStrong : "transparent")};
    }
`;

const ModalFoot = styled.div`
    padding: 12px 18px 16px;
    border-top: 1px solid ${UI.color.line};
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

/** 공통 베이스 */
const ModalBtnBase = styled.button`
    height: 38px;
    padding: 0 14px;
    border-radius: 12px;

    font-weight: 800;
    letter-spacing: -0.02em;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    transition:
            transform 80ms ease,
            background 150ms ease,
            border-color 150ms ease,
            color 150ms ease,
            box-shadow 150ms ease,
            filter 150ms ease;

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.16);
    }

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
        transform: none;
        filter: none;
    }
`;

/** Ghost */
const ModalGhost = styled(ModalBtnBase)`
    height: 35px;
    padding: 0 16px;
    border-radius: 6px;
    font-weight: 700;

    background: #fff;
    color: ${UI.color.primaryBlue};
    border: 1px solid ${UI.color.primaryBlue};

    &:hover { background: ${UI.color.indigo50}; }
`;

const ModalPrimary = styled(ModalBtnBase)`
    height: 35px;
    padding: 0 18px;
    border-radius: 6px;
    font-weight: 700;
    letter-spacing: -0.02em;

    background: ${UI.color.primaryBlue};
    border: 1px solid ${UI.color.primaryBlue};
    color: #fff;

    &:hover { filter: brightness(0.96); }
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const FieldLabel = styled.div`
  font-size: 13px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: ${UI.color.text};
`;

const TextField = styled.input`
  width: 100%;
  height: 40px;
  border-radius: 12px;
  border: 1px solid ${UI.color.line};
  padding: 0 12px;
  font-size: 14px;
  letter-spacing: -0.02em;
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${UI.color.primaryStrong};
    box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.16);
  }
  &::placeholder {
    color: #9aa4b2;
  }
`;

const HelperRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
`;

const HelperText = styled.div`
  font-size: 12px;
  letter-spacing: -0.02em;
  color: ${UI.color.muted};
`;

const ErrorText = styled.div`
  font-size: 12px;
  letter-spacing: -0.02em;
  color: #b91c1c;
`;

const CountText = styled.div`
  font-size: 12px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: rgba(15, 23, 42, 0.55);
`;

const InfoBox = styled.div`
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 12px;

  display: grid;
  gap: 6px;

  .title {
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${UI.color.text};
    line-height: 1.25;
  }
  .meta {
    font-size: 12px;
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
  }
`;

const ModalDanger = styled(ModalBtnBase)`
  height: 35px;
  padding: 0 18px;
  border-radius: 6px;
  font-weight: 700;
  letter-spacing: -0.02em;

  background: #ef4444;
  border: 1px solid #ef4444;
  color: #fff;

  &:hover {
    filter: brightness(0.96);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.22);
  }
`;

const ChartWrap = styled.div`
    width: 100%;
    height: 150px;
    position: relative;
    border-radius: 14px;
    background: transparent;
    border: 0;
    overflow: visible;
`;

const XBadges = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    height: 18px;
    pointer-events: none;
`;

const XTick = styled.div<{ $active?: boolean; $x: number; $dense?: boolean }>`
    position: absolute;
    left: ${({ $x }) => $x}px;
    transform: translateX(-50%);
    bottom: 0px;

    font-size: ${({ $dense }) => ($dense ? "10px" : "11px")};
    font-weight: 800;
    letter-spacing: -0.04em;
    padding: ${({ $dense }) => ($dense ? "2px 5px" : "2px 7px")};
    border-radius: 999px;
    white-space: nowrap;
    line-height: 1;

    color: ${({ $active }) => ($active ? UI.color.text : "rgba(17,24,39,0.70)")};
    background: ${({ $active }) => ($active ? "rgba(17,24,39,0.08)" : "transparent")};
`;

const SideHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
`;

const RangeTabs = styled.div.attrs({ role: "tablist" })`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px;
    border-radius: 999px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
`;

const RangeTab = styled.button<{ $active?: boolean }>`
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    border: 0;
    cursor: pointer;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: -0.02em;

    color: ${({ $active }) => ($active ? "#0f172a" : "rgba(15,23,42,0.55)")};
    background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
    box-shadow: ${({ $active }) => ($active ? "0 1px 2px rgba(15,23,42,0.10)" : "none")};

    transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

    &:hover {
        color: #0f172a;
        background: ${({ $active }) => ($active ? "#ffffff" : "rgba(255,255,255,0.65)")};
    }
    &:active {
        transform: translateY(1px);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(62, 99, 224, 0.16);
    }
`;

const Reveal = styled.div<{ $d?: number }>`
        ${({ $d = 0 }) => stagger($d)}
    `;


/* ===== 타입 ===== */
type PartType = "CHOICE" | "OX" | "INITIALS" | "MIX";
type RetryKind = "RETRY_ALL" | "WRONG_ONLY";
type QuickDays = 7 | 30;

type TimelineItem = {
    id: number | string;
    sessionId?: number;

    /** 현재 세션의 타이틀(재도전 커스텀 문구 포함 가능) */
    title: string;

    /** 원본(root) 세션 타이틀 */
    originTitle?: string | null;

    partType: PartType;
    date: string;
    correct: number;
    total: number;

    category?: string | null;

    isRetry?: boolean;
    sessionMode?: "FULL" | "WRONG_ONLY" | string | null;
    parentSessionId?: number | null;

    retryKind?: RetryKind | null;
};

type Summary = {
    totalSets: number;
    accuracy: number;
    retryRate: number;
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
    return p === "CHOICE" ? "객관식"
        : p === "OX" ? "OX"
            : p === "INITIALS" ? "초성"
                : "혼합";
}

/* ===== API 정규화 ===== */
async function fetchTimeline(params: { q?: string; type?: PartType | "ALL"; page: number; size: number }) {
    const { q, type, page, size } = params;
    const headers = { ...authHeader() };
    const p: any = { q, page, size };
    if (type && type !== "ALL") p.type = type;

    const { data } = await http.get("/me/quiz/timeline", { params: p, headers });

    console.log("[timeline item sample]", data?.items?.[0]);

    const s: Summary = {
        totalSets: Number(data?.summary?.totalSets ?? 0),
        accuracy: Number(data?.summary?.accuracy ?? 0),
        retryRate: Number(data?.summary?.retryRate ?? 0),
    };

    const items: TimelineItem[] = Array.isArray(data?.items)
        ? data.items.map((x: any) => {
            const title = String(x.title ?? "제목없음");
            const originTitle =
                x.originTitle == null ? null : String(x.originTitle);

            // 백엔드가 내려준 값 우선 사용
            const retryKindRaw = x.retryKind == null ? null : String(x.retryKind).toUpperCase();
            const retryKind =
                retryKindRaw === "RETRY_ALL" || retryKindRaw === "WRONG_ONLY"
                    ? (retryKindRaw as "RETRY_ALL" | "WRONG_ONLY")
                    : null;

            const isRetry = x.isRetry != null ? Boolean(x.isRetry) : retryKind != null;

            const rawMode = x.sessionMode == null ? "" : String(x.sessionMode);
            const mode = rawMode.trim().replace(/[\s-]+/g, "_").toUpperCase();

            const sessionId = Number(x.sessionId ?? x.id);
            const safeSessionId = Number.isFinite(sessionId) ? sessionId : undefined;

            return {
                id: x.id ?? x.sessionId ?? `${x.date}-${originTitle ?? title}`,
                sessionId: safeSessionId,

                title,
                originTitle,

                partType: (x.partType ?? x.type ?? "CHOICE") as PartType,
                date: x.date ?? x.playedAt ?? new Date().toISOString(),
                correct: Number(x.correct ?? 0),
                total: Number(x.total ?? 0),
                category: x.category ?? x.categoryName ?? null,

                isRetry,
                sessionMode: mode || null,
                parentSessionId: x.parentSessionId ?? null,

                retryKind,
            };
        })
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

async function updateMySessionTitle(sessionId: number, title: string) {
    return http.patch(
        `/me/quiz/sessions/${sessionId}/title`,
        { title },
        { headers: authHeader(), withCredentials: true }
    );
}

async function deleteMySession(sessionId: number) {
    return http.delete(`/me/quiz/sessions/${sessionId}`, {
        headers: authHeader(),
        withCredentials: true,
    });
}

async function fetchTrend(params: { metric: "accuracy" | "sets" | "retryRate"; span?: string }) {
    const headers = { ...authHeader() };
    const { data } = await http.get<TrendResponse>("/me/quiz/metrics", {
        params: { metric: params.metric, span: params.span ?? "30d" },
        headers,
    });

    const points: TrendPoint[] = Array.isArray(data?.points)
        ? data.points.map((p) => ({ date: String(p.date), value: Number(p.value ?? 0) }))
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
        headers,
        withCredentials: true,
    });
    const points = Array.isArray(data?.points) ? data.points : [];
    return points.reduce((sum, p) => sum + (Number.isFinite(+p.value) ? +p.value : 0), 0);
}

/* ===== 페이지 ===== */
export default function QuizTimelinePage() {
    const nav = useNavigate();
    const location = useLocation();
    const dialogs = usePotenDialog();

    const [reloadSeq, setReloadSeq] = React.useState(0);
    const invalidate = React.useCallback(() => {
        setReloadSeq((n) => n + 1);
    }, []);

    const [sysOpen, setSysOpen] = React.useState(false);
    const [sysMsg, setSysMsg] = React.useState<SystemMessage | null>(null);

    const openSys = React.useCallback((m: SystemMessage) => {
        setSysMsg(m);
        setSysOpen(true);
    }, []);

    const closeSys = React.useCallback(() => {
        setSysOpen(false);
        setSysMsg(null);
    }, []);

    const [renameOpen, setRenameOpen] = React.useState(false);
    const [renameTarget, setRenameTarget] = React.useState<TimelineItem | null>(null);
    const [renameValue, setRenameValue] = React.useState("");
    const [renameErr, setRenameErr] = React.useState<string | null>(null);
    const [renameSaving, setRenameSaving] = React.useState(false);
    const renameInputRef = React.useRef<HTMLInputElement | null>(null);

    const openRenameModal = React.useCallback((it: TimelineItem) => {
        if (!it.sessionId) return;
        setRenameTarget(it);
        setRenameValue(String(it.title ?? ""));
        setRenameErr(null);
        setRenameOpen(true);
    }, []);

    const closeRenameModal = React.useCallback(() => {
        if (renameSaving) return;
        setRenameOpen(false);
        setRenameTarget(null);
        setRenameErr(null);
    }, [renameSaving]);

    const validateRename = React.useCallback((v: string) => {
        const raw = (v ?? "").trim().replace(/\s+/g, " ");
        if (!raw) return "공백만 입력할 수 없어요.";
        if (raw.length > 60) return "세션 이름은 최대 60자입니다.";
        return null;
    }, []);

    const submitRename = React.useCallback(async () => {
        if (!renameTarget?.sessionId) return;

        const next = renameValue;
        const err = validateRename(next);
        if (err) {
            setRenameErr(err);
            return;
        }

        const finalTitle = next.trim().replace(/\s+/g, " ");
        setRenameSaving(true);
        setRenameErr(null);

        try {
            await updateMySessionTitle(renameTarget.sessionId, finalTitle);

            setItems((prev) =>
                prev.map((x) =>
                    x.sessionId === renameTarget.sessionId ? { ...x, title: finalTitle } : x
                )
            );

            invalidate();

            setRenameOpen(false);
            setRenameTarget(null);

            openSys({
                tone: "success",
                title: "세션 이름을 변경했어요",
                description: "타임라인에 바로 반영됐어요.",
            });
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 401) {
                goToAccountLogin(location.pathname + location.search);
                return;
            }
            setRenameErr(e?.response?.data?.message || "이름 변경에 실패했어요. 잠시 후 다시 시도해주세요.");
        } finally {
            setRenameSaving(false);
        }
    }, [
        renameTarget,
        renameValue,
        validateRename,
        invalidate,
        location.pathname,
        location.search,
        openSys,
    ]);

    React.useEffect(() => {
        if (!renameOpen) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeRenameModal();
        };
        window.addEventListener("keydown", onKey);

        const t = window.setTimeout(() => renameInputRef.current?.focus(), 0);

        return () => {
            window.clearTimeout(t);
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [renameOpen, closeRenameModal]);

    /* ===== Delete Modal (PotenNote style) ===== */
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<TimelineItem | null>(null);
    const [deleteTyped, setDeleteTyped] = React.useState("");
    const [deleteErr, setDeleteErr] = React.useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const deleteInputRef = React.useRef<HTMLInputElement | null>(null);

    const openDeleteModal = React.useCallback((it: TimelineItem) => {
        if (!it.sessionId) return;
        setDeleteTarget(it);
        setDeleteTyped("");
        setDeleteErr(null);
        setDeleteOpen(true);
    }, []);

    const closeDeleteModal = React.useCallback(() => {
        if (deleteLoading) return;
        setDeleteOpen(false);
        setDeleteTarget(null);
        setDeleteTyped("");
        setDeleteErr(null);
    }, [deleteLoading]);

    const submitDelete = React.useCallback(async () => {
        if (!deleteTarget?.sessionId) return;

        if (deleteTyped.trim() !== "삭제") {
            setDeleteErr("정확히 '삭제'를 입력해야 삭제할 수 있어요.");
            return;
        }

        setDeleteLoading(true);
        setDeleteErr(null);

        try {
            const sid = deleteTarget.sessionId;

            await deleteMySession(sid);

            setItems((prev) => {
                const next = prev.filter((x) => x.sessionId !== sid);

                // 현재 페이지에 1개뿐이었다면 삭제 후 비게 되므로 이전 페이지로
                if (prev.length === 1) {
                    setPage((p) => (p > 0 ? p - 1 : 0));
                }

                return next;
            });

            setTotal((t) => Math.max(0, (t || 0) - 1));
            setSummary((s) => ({
                ...s,
                totalSets: Math.max(0, Number(s.totalSets || 0) - 1),
            }));

            invalidate();

            setDeleteOpen(false);
            setDeleteTarget(null);

            openSys({
                tone: "success",
                title: "세션을 삭제했어요",
                description: "타임라인/목록에서 더 이상 보이지 않아요.",
            });
        } catch (e: any) {
            const status = e?.response?.status;

            if (status === 401) {
                goToAccountLogin(location.pathname + location.search);
                return;
            }
            if (status === 404) {
                setDeleteErr("이미 삭제된 세션이에요. 새로고침하면 목록이 정리될 거예요.");
                return;
            }

            setDeleteErr(e?.response?.data?.message || "삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
        } finally {
            setDeleteLoading(false);
        }
    }, [
        deleteTarget,
        deleteTyped,
        invalidate,
        location.pathname,
        location.search,
        openSys,
    ]);

    React.useEffect(() => {
        if (!deleteOpen) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeDeleteModal();
        };
        window.addEventListener("keydown", onKey);

        const t = window.setTimeout(() => deleteInputRef.current?.focus(), 0);

        return () => {
            window.clearTimeout(t);
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [deleteOpen, closeDeleteModal]);

    const [quickModalOpen, setQuickModalOpen] = React.useState(false);
    const [quickDays, setQuickDays] = React.useState<QuickDays>(7);
    const [quickRetryLoading, setQuickRetryLoading] = React.useState(false);
    const quickStartBtnRef = React.useRef<HTMLButtonElement | null>(null);

    const openQuickModal = React.useCallback(() => {
        setQuickDays(7);
        setQuickModalOpen(true);
    }, []);

    const closeQuickModal = React.useCallback(() => {
        if (quickRetryLoading) return; // 로딩 중엔 닫힘 방지(원하면 제거)
        setQuickModalOpen(false);
    }, [quickRetryLoading]);

    React.useEffect(() => {
        if (!quickModalOpen) return;

        // 스크롤 잠금
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // ESC 닫기
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeQuickModal();
        };
        window.addEventListener("keydown", onKey);

        // 기본 포커스
        const t = window.setTimeout(() => quickStartBtnRef.current?.focus(), 0);

        return () => {
            window.clearTimeout(t);
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [quickModalOpen, closeQuickModal]);

    const handleRetryAll = React.useCallback(
        async (sessionId: number | string) => {
            try {
                const { data } = await http.post(`/me/quiz/sessions/${sessionId}/retry-wrong`, null, { headers: authHeader(), withCredentials: true });
                const newSid = Number(data?.sessionId ?? data?.newSessionId ?? data?.id);
                if (!Number.isFinite(newSid)) throw new Error("Invalid new sessionId");

                nav(`/learning/quiz/play?sessionId=${newSid}`);
            } catch (e) {
                console.error("[retryAll] failed", e);
                openSys({
                    tone: "error",
                    title: "재도전을 시작하지 못했어요",
                    description: "잠시 후 다시 시도해주세요.",
                });
            }
        },
        [nav, openSys]
    );

    const quickRetryInFlight = React.useRef(false);

    const handleQuickRetry = React.useCallback(
        async (days: QuickDays) => {
            if (quickRetryInFlight.current) return;
            quickRetryInFlight.current = true;
            setQuickRetryLoading(true);

            try {
                const { data } = await http.post(
                    "/me/quiz/sessions/quick-retry",
                    null,
                    {
                        // 백엔드에서 days(7/30) 받게 할 때 가장 흔한 방식
                        params: { days },
                        headers: authHeader(),
                        withCredentials: true,
                    }
                );

                const newSid = Number(data?.sessionId ?? data?.id ?? data?.newSessionId);
                if (!Number.isFinite(newSid)) throw new Error("Invalid sessionId");

                setQuickModalOpen(false);
                nav(`/learning/quiz/play?sessionId=${newSid}`);
            } catch (e: any) {
                console.error("[quickRetry] failed", e);

                const status = e?.response?.status;
                const msg = e?.response?.data?.message;

                if (status === 401) {
                    goToAccountLogin(location.pathname + location.search);
                    return;
                }

                if (status === 409) {
                    // 1) 빠른 재도전 모달 먼저 닫기(로딩 중이어도 강제)
                    setQuickModalOpen(false);

                    // 2) 시스템 메시지 모달 띄우기
                    openSys({
                        tone: "info",
                        title: "오답이 없어요",
                        description: (
                            <>
                                선택한 기간 <b>{days}일</b> 내에 오답이 없어서
                                빠른 재도전 세트를 만들 수 없어요.
                            </>
                        ),
                        bullets: [
                            <>기간을 <b>30일</b>로 늘려서 다시 시도해보세요.</>,
                            <>오답이 생기면 여기서 바로 “오답만 재도전”이 가능해요.</>,
                        ],
                    });

                    return;
                }

                alert("빠른 재도전을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
            } finally {
                setQuickRetryLoading(false);
                quickRetryInFlight.current = false;
            }
        },
        [nav, location.pathname, location.search, openSys]
    );

    const handleRetryWrongOnly = React.useCallback(async (sessionId: number | string) => {
        try {
            const { data } = await http.post(
                `/me/quiz/sessions/${sessionId}/retry-wrong-only`, // ← 백엔드 엔드포인트에 맞게
                null,
                { headers: authHeader(), withCredentials: true }
            );

            const newSid = Number(data?.sessionId ?? data?.newSessionId ?? data?.id);
            if (!Number.isFinite(newSid)) throw new Error("Invalid new sessionId");

            nav(`/learning/quiz/play?sessionId=${newSid}`);
        } catch (e) {
            console.error("[retryWrongOnly] failed", e);
            openSys({
                tone: "error",
                title: "오답 재도전을 시작하지 못했어요",
                description: "잠시 후 다시 시도해주세요.",
            });
        }
    }, [nav, openSys]);

    React.useEffect(() => {
        const loggedIn = !!localStorage.getItem("isLoggedIn");
        if (!loggedIn) goToAccountLogin(location.pathname + location.search);
    }, [location.pathname, location.search]);

    const [q, setQ] = React.useState("");
    const [type, setType] = React.useState<PartType | "ALL">("ALL");
    const [page, setPage] = React.useState(0);
    const [perPage] = React.useState(5);

    const [summary, setSummary] = React.useState<Summary>({ totalSets: 0, accuracy: 0, retryRate: 0 });
    const [items, setItems] = React.useState<TimelineItem[]>([]);
    const [recent, setRecent] = React.useState<Recent[]>([]);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                const n = await fetchTotalSets();
                if (!cancel) setSummary((s) => ({ ...s, totalSets: n }));
            } catch (e1) {
                try {
                    const n = await fetchTotalSetsFallback("365d");
                    if (!cancel) setSummary((s) => ({ ...s, totalSets: n }));
                } catch (e2) {
                    console.warn("[totalSets] both fetches failed", e1, e2);
                }
            }
        })();
        return () => {
            cancel = true;
        };
    }, [reloadSeq]);

    React.useEffect(() => {
        let cancel = false;

        const run = async () => {
            setLoading(true);
            try {
                const res = await fetchTimeline({ q: q.trim() || undefined, type, page, size: perPage });
                if (cancel) return;
                setSummary((s) => ({ ...s, accuracy: res.summary.accuracy, retryRate: res.summary.retryRate }));
                setItems(res.items);
                setRecent(res.recent);
                setTotal(res.total);
            } catch (e) {
                if (!cancel) {
                    setItems([]);
                    setTotal(0);
                }
                console.warn("[timeline] fetch failed", e);
            } finally {
                if (!cancel) setLoading(false);
            }
        };

        const t = setTimeout(run, 200);
        return () => {
            cancel = true;
            clearTimeout(t);
        };
    }, [q, type, page, perPage, reloadSeq]);

    const pages = Math.max(1, Math.ceil((total || 0) / perPage));

    const WINDOW_SIZE = 5;
    const [pageWindowStart, setPageWindowStart] = React.useState(0);

    const clampWindowStart = React.useCallback(
        (start: number) => {
            const maxStart = Math.max(0, pages - WINDOW_SIZE);
            return Math.max(0, Math.min(start, maxStart));
        },
        [pages]
    );

    React.useEffect(() => {
        setPage((p) => Math.min(Math.max(0, p), pages - 1));
        setPageWindowStart((s) => clampWindowStart(s));
    }, [pages, clampWindowStart]);

    const pageWindow = React.useMemo(() => {
        const start = clampWindowStart(pageWindowStart);
        const end = Math.min(pages - 1, start + WINDOW_SIZE - 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [pageWindowStart, pages, clampWindowStart]);

    const goPrev = React.useCallback(() => {
        setPageWindowStart((ws) => {
            const start = clampWindowStart(ws);
            const prevStart = clampWindowStart(start - WINDOW_SIZE);

            setPage(prevStart);
            return prevStart;
        });
    }, [clampWindowStart]);

    const goNext = React.useCallback(() => {
        setPageWindowStart((ws) => {
            const start = clampWindowStart(ws);
            const nextStart = clampWindowStart(start + WINDOW_SIZE);

            setPage(nextStart);
            return nextStart;
        });
    }, [clampWindowStart]);

    const [metric] = React.useState<"accuracy" | "sets" | "retryRate">("accuracy");
    const [span, setSpan] = React.useState<"7d" | "30d">("7d");
    const [trend, setTrend] = React.useState<TrendPoint[]>([]);
    const [trendLoading, setTrendLoading] = React.useState(false);

    React.useEffect(() => {
        let cancel = false;
        const run = async () => {
            setTrendLoading(true);
            try {
                const res = await fetchTrend({ metric, span });
                if (!cancel) setTrend(res.points);
            } catch (e) {
                if (!cancel) setTrend([]);
                console.warn("[trend] fetch failed", e);
            } finally {
                if (!cancel) setTrendLoading(false);
            }
        };
        run();
        return () => {
            cancel = true;
        };
    }, [metric, span]);

    const handleRenameSession = React.useCallback(
        async (it: TimelineItem) => {
            const sid = it.sessionId;
            if (!sid) {
                openSys({
                    tone: "error",
                    title: "수정할 수 없는 항목이에요",
                    description: "세션 식별자(sessionId)를 찾지 못했어요.",
                });
                return;
            }

            const nextTitle = await dialogs.prompt({
                title: "세션 이름 변경",
                label: "세션 이름",
                placeholder: "세션 이름을 입력하세요",
                okText: "저장하기",
                // (PotenDialog 구현에 따라 initialValue / defaultValue 지원 시 사용)
                // initialValue: it.title,
                validator: (v: string) => {
                    const raw = (v ?? "").trim().replace(/\s+/g, " ");
                    if (!raw) return "공백만 입력할 수 없어요.";
                    if (raw.length > 60) return "세션 이름은 최대 60자입니다.";
                    return;
                },
            });

            if (!nextTitle) return;
            const finalTitle = nextTitle.trim().replace(/\s+/g, " ");

            try {
                await updateMySessionTitle(sid, finalTitle);

                // UI 즉시 반영
                setItems((prev) =>
                    prev.map((x) => (x.sessionId === sid ? { ...x, title: finalTitle } : x))
                );

                invalidate();

                openSys({
                    tone: "success",
                    title: "세션 이름을 변경했어요",
                    description: "타임라인에 바로 반영됐어요.",
                });
            } catch (e: any) {
                const status = e?.response?.status;
                if (status === 401) {
                    goToAccountLogin(location.pathname + location.search);
                    return;
                }

                await dialogs.alert({
                    title: "이름 변경에 실패했습니다.",
                    description: e?.response?.data?.message || "잠시 후 다시 시도해 주세요.",
                    okText: "확인",
                });
            }
        },
        [dialogs, invalidate, location.pathname, location.search, openSys]
    );

    const [menuOpenId, setMenuOpenId] = React.useState<string | number | null>(null);
    const menuWrapRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (menuOpenId == null) return;

        const onPointerDownCapture = (e: PointerEvent) => {
            const el = menuWrapRef.current;
            if (!el) return;
            if (!el.contains(e.target as Node)) setMenuOpenId(null);
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpenId(null);
        };

        document.addEventListener("pointerdown", onPointerDownCapture, true);
        window.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("pointerdown", onPointerDownCapture, true);
            window.removeEventListener("keydown", onKey);
        };
    }, [menuOpenId]);

    // 목록/페이지 바뀌면 메뉴는 자동 닫히게
    React.useEffect(() => {
        setMenuOpenId(null);
    }, [q, type, page, items.length]);

    const handleDeleteSessionWithDialog = React.useCallback(
        async (it: TimelineItem) => {
            const sid = it.sessionId;
            if (!sid) {
                await dialogs.alert({
                    title: "삭제할 수 없는 항목이에요",
                    description: "세션 식별자(sessionId)를 찾지 못했어요. 새로고침 후 다시 시도해주세요.",
                    okText: "확인",
                });
                return;
            }

            // PotenDialog에 confirm이 있으면 confirm 사용, 없으면 prompt로 안전 폴백
            const confirmFn = (dialogs as any).confirm as
                | undefined
                | ((opts: any) => Promise<boolean>);

            let ok = false;

            if (typeof confirmFn === "function") {
                ok = await confirmFn({
                    title: "세션을 삭제할까요?",
                    description: (
                        <>
                            <b>{it.title}</b>
                            <div style={{ marginTop: 6 }}>
                                {fmtDate(it.date)}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                삭제하면 타임라인/목록에서 숨겨져요. (오답노트는 삭제되지 않아요)
                            </div>
                        </>
                    ),
                    okText: "삭제",
                    cancelText: "취소",
                    // (PotenDialog가 danger 옵션 지원하면)
                    // tone: "danger",
                });
            } else {
                const typed = await dialogs.prompt({
                    title: "세션 삭제",
                    label: "삭제 확인",
                    placeholder: "삭제하려면 '삭제'를 입력하세요",
                    okText: "삭제",
                    validator: (v: string) => {
                        if ((v ?? "").trim() !== "삭제") return "정확히 '삭제'를 입력해야 삭제할 수 있어요.";
                        return;
                    },
                });
                ok = (typed ?? "").trim() === "삭제";
            }

            if (!ok) return;

            try {
                await deleteMySession(sid);

                // 1) UI 즉시 반영
                setItems((prev) => prev.filter((x) => x.sessionId !== sid));
                setTotal((t) => Math.max(0, (t || 0) - 1));
                setSummary((s) => ({ ...s, totalSets: Math.max(0, Number(s.totalSets || 0) - 1) }));

                // 2) 현재 페이지가 비면 이전 페이지로
                setPage((p) => {
                    // 지금 페이지에서 하나 삭제했을 때 비는 케이스 대응
                    if (items.length <= 1 && p > 0) return p - 1;
                    return p;
                });

                invalidate();

                openSys({
                    tone: "success",
                    title: "세션을 삭제했어요",
                    description: "타임라인/목록에서 더 이상 보이지 않아요.",
                });
            } catch (e: any) {
                const status = e?.response?.status;

                if (status === 401) {
                    goToAccountLogin(location.pathname + location.search);
                    return;
                }

                if (status === 404) {
                    await dialogs.alert({
                        title: "이미 삭제된 세션이에요",
                        description: "새로고침하면 목록이 정리될 거예요.",
                        okText: "확인",
                    });
                    return;
                }

                await dialogs.alert({
                    title: "삭제하지 못했어요",
                    description: e?.response?.data?.message || "잠시 후 다시 시도해주세요.",
                    okText: "확인",
                });
            }
        },
        [dialogs, invalidate, items.length, location.pathname, location.search, openSys]
    );

    const onOutsideClick = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) closeQuickModal();
        },
        [closeQuickModal]
    );

    const quickModalPortal = quickModalOpen
        ? createPortal(
            <ModalOverlay
                role="presentation"
                onMouseDown={onOutsideClick}
            >
                <ModalCard
                    role="dialog"
                    aria-modal="true"
                    aria-label="최근 오답 기간 선택"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <ModalHead>
                        <ModalTitle>최근 오답 범위 선택</ModalTitle>
                        <ModalDesc>선택한 기간 내에서 틀린 문제만 모아 새로운 퀴즈를 생성해요.</ModalDesc>
                    </ModalHead>

                    <ModalBody>
                        <OptionGrid>
                            <OptionBtn
                                type="button"
                                $active={quickDays === 7}
                                aria-pressed={quickDays === 7}
                                onClick={() => setQuickDays(7)}
                            >
                                <OptionTop>
                                    <OptionLabel>최근 7일</OptionLabel>
                                    <CheckDot $on={quickDays === 7} aria-hidden />
                                </OptionTop>
                                <OptionSub>최근 1주일 동안의 오답만 모아서 재도전</OptionSub>
                            </OptionBtn>

                            <OptionBtn
                                type="button"
                                $active={quickDays === 30}
                                aria-pressed={quickDays === 30}
                                onClick={() => setQuickDays(30)}
                            >
                                <OptionTop>
                                    <OptionLabel>최근 30일</OptionLabel>
                                    <CheckDot $on={quickDays === 30} aria-hidden />
                                </OptionTop>
                                <OptionSub>최근 1달 동안의 오답만 모아서 재도전</OptionSub>
                            </OptionBtn>
                        </OptionGrid>
                    </ModalBody>

                    <ModalFoot>
                        <ModalGhost
                            type="button"
                            onClick={closeQuickModal}
                            disabled={quickRetryLoading}
                        >
                            취소
                        </ModalGhost>

                        <ModalPrimary
                            ref={quickStartBtnRef}
                            type="button"
                            onClick={() => handleQuickRetry(quickDays)}
                            disabled={quickRetryLoading}
                        >
                            {quickRetryLoading ? "생성 중..." : "시작하기"}
                        </ModalPrimary>
                    </ModalFoot>
                </ModalCard>
            </ModalOverlay>,
            document.body
        )
        : null;

    return (
        <NarrowLeft style={{ padding: "8px 0 24px" }}>
            {/* 상단 */}
            <Reveal $d={0}>
                <Toolbar>
                    <TitleRow>
                        <Title>나의 퀴즈 타임라인</Title>
                    </TitleRow>
                </Toolbar>
            </Reveal>

            <Screen>
                <LeftCol>
                    {/* 1) 통계 카드 */}
                    <KPIGrid>
                        <Reveal $d={80}>
                            {/* 완료 세트 */}
                            <KPICard $from="#D8E7FF" $to="#CFE0FF" style={{ borderColor: "rgba(62,99,224,.20)" }}>
                                <div className="kpi-body">
                                    <div className="kpi-label">완료 세트</div>
                                    <div className="kpi-value">
                                        {summary.totalSets}
                                        <span className="kpi-unit">개</span>
                                    </div>
                                    <div className="kpi-sub">누적 집계</div>
                                </div>
                                <div className="kpi-icon" aria-hidden>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        {/* list lines */}
                                        <path d="M10 6h10" stroke="#3E63E0" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M10 12h10" stroke="#3E63E0" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                                        <path d="M10 18h10" stroke="#3E63E0" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                                        {/* check */}
                                        <path d="M4.5 12l2.2 2.2L9.8 9.2" stroke="#3E63E0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </KPICard>
                        </Reveal>

                        <Reveal $d={160}>
                            {/* 정답률 */}
                            <KPICard $from="#E8E3FF" $to="#E1DAFF" style={{ borderColor: "rgba(139,124,246,.24)" }}>
                                <div className="kpi-body">
                                    <div className="kpi-label">정답률</div>
                                    <div className="kpi-value">
                                        {Math.round(summary.accuracy)}
                                        <span className="kpi-unit">%</span>
                                    </div>
                                    <div className="kpi-sub">전체 평균</div>
                                </div>

                                <div className="kpi-icon" aria-hidden>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        {/* outer ring */}
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="8"
                                            stroke="#6F5DE6"
                                            strokeWidth="2.0"
                                            opacity="0.9"
                                        />
                                        {/* middle ring */}
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="5"
                                            stroke="#6F5DE6"
                                            strokeWidth="2.2"
                                            opacity="0.65"
                                        />
                                        {/* crosshair */}
                                        <path
                                            d="M12 4v3.2M12 16.8V20M4 12h3.2M16.8 12H20"
                                            stroke="#6F5DE6"
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            opacity="0.9"
                                        />
                                        {/* bullseye */}
                                        <circle cx="12" cy="12" r="1.6" fill="#6F5DE6" />
                                    </svg>
                                </div>
                            </KPICard>
                        </Reveal>

                        <Reveal $d={240}>
                            {/* 재도전율 */}
                            <KPICard $from="#D8F0E7" $to="#E4F8EF" style={{ borderColor: "rgba(16,185,129,.22)" }}>
                                <div className="kpi-body">
                                    <div className="kpi-label">재도전율</div>
                                    <div className="kpi-value">
                                        {Math.round(summary.retryRate)}
                                        <span className="kpi-unit">%</span>
                                    </div>
                                    <div className="kpi-sub">최근 세션 기준</div>
                                </div>
                                <div className="kpi-icon" aria-hidden>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v6l4 2" stroke="#0EA37E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                                    </svg>
                                </div>
                            </KPICard>
                        </Reveal>
                    </KPIGrid>

                    {/* 2) 필터 */}
                    <Reveal $d={320}>
                        <FilterBar>
                            {[
                                { key: "ALL", label: "전체" },
                                { key: "CHOICE", label: "객관식" },
                                { key: "OX", label: "OX" },
                                { key: "INITIALS", label: "초성" },
                                { key: "MIX", label: "혼합" },
                            ].map((f: any) => (
                                <Chip
                                    key={f.key}
                                    onClick={() => {
                                        setType(f.key);
                                        setPage(0);
                                        setPageWindowStart(0);
                                    }}
                                    $active={type === (f.key as any)}
                                    aria-pressed={type === (f.key as any)}
                                    role="tab"
                                >
                                    {f.label}
                                </Chip>
                            ))}
                        </FilterBar>
                    </Reveal>

                    {/* 3) 타임라인 리스트 */}
                    <Reveal $d={400}>
                        <TimelinePanel role="list" aria-label="퀴즈 타임라인 목록">
                            {items.length === 0 && (
                                <div style={{ padding: "28px", color: UI.color.muted }}>{loading ? "불러오는 중..." : "표시할 타임라인이 없어요."}</div>
                            )}
                            {items.map((it) => (
                                <Row key={it.id} role="listitem">
                                    {/* 왼쪽: 제목 */}
                                    <TitleStack>
                                        <QuizTitle>{it.title}</QuizTitle>
                                        <PillRow>
                                            <LightPill onClick={() => nav("/quiz/today")}>
                                                {it.category ? it.category : "오늘의 퀴즈"}
                                            </LightPill>

                                            {it.retryKind === "RETRY_ALL" && <RetryBadge>재도전</RetryBadge>}
                                            {it.retryKind === "WRONG_ONLY" && <WrongOnlyBadge>틀린 문제만</WrongOnlyBadge>}

                                            <MetaText>{fmtDate(it.date)}</MetaText>
                                        </PillRow>
                                    </TitleStack>

                                    {/* 오른쪽: 도넛 + 버튼 */}
                                    <ActionBar>
                                        <DonutWrap>
                                            <Donut value={it.correct} total={it.total} />
                                        </DonutWrap>

                                        {/* SegGroup */}
                                        <SegGroup>
                                            <SegGhost
                                                onClick={() =>
                                                    nav(`/learning/quiz/play/result/${it.id}`, {
                                                        state: { backTo: location.pathname + location.search },
                                                    })
                                                }
                                            >
                                                결과 보기
                                            </SegGhost>
                                            <SegPrimary onClick={() => handleRetryAll(it.sessionId ?? it.id)}>재도전</SegPrimary>
                                        </SegGroup>
                                    </ActionBar>

                                    {/* ⋮ 메뉴: Row 우측 상단 */}
                                    <RowMenuWrap
                                        ref={
                                            menuOpenId === it.id
                                                ? (el) => {
                                                    menuWrapRef.current = el;
                                                }
                                                : undefined
                                        }
                                    >
                                        <MoreBtn
                                            type="button"
                                            onClick={() => setMenuOpenId((cur) => (cur === it.id ? null : it.id))}
                                            aria-label="세션 더보기"
                                            aria-haspopup="menu"
                                            aria-expanded={menuOpenId === it.id}
                                            disabled={!it.sessionId}
                                            title={!it.sessionId ? "삭제할 수 없는 항목" : "더보기"}
                                        >
                                            <MoreIcon />
                                        </MoreBtn>

                                        {menuOpenId === it.id && (
                                            <DropMenu role="menu" aria-label="세션 메뉴">
                                                <MenuItemBtn
                                                    type="button"
                                                    onClick={() => {
                                                        setMenuOpenId(null);
                                                        openRenameModal(it);
                                                    }}
                                                    disabled={!it.sessionId}
                                                >
                                                    퀴즈 세션 이름 수정
                                                </MenuItemBtn>

                                                <MenuItemBtn
                                                    type="button"
                                                    $danger
                                                    onClick={() => {
                                                        setMenuOpenId(null);
                                                        openDeleteModal(it);
                                                    }}
                                                    disabled={!it.sessionId}
                                                >
                                                    퀴즈 세션 삭제
                                                </MenuItemBtn>
                                            </DropMenu>
                                        )}
                                    </RowMenuWrap>
                                </Row>
                            ))}
                        </TimelinePanel>
                    </Reveal>
                </LeftCol>

                {/* 오른쪽 사이드 */}
                <RightCol>
                    <Reveal $d={200}>
                        <SearchCard>
                            <SearchLabel>세트/카테고리 검색</SearchLabel>
                            <SearchInput
                                placeholder="찾고 싶은 퀴즈 이름을 입력하세요."
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(0);
                                    setPageWindowStart(0);
                                }}
                            />
                        </SearchCard>
                    </Reveal>

                    <Reveal $d={280}>
                        <SideCard>
                            <SideHeader>
                                <SideTitle>성과 대시보드</SideTitle>
                                <RangeTabs aria-label="기간 선택">
                                    {[
                                        { key: "30d", label: "MONTH" },
                                        { key: "7d", label: "WEEK" },
                                    ].map((t) => (
                                        <RangeTab
                                            key={t.key}
                                            role="tab"
                                            aria-selected={span === (t.key as any)}
                                            $active={span === (t.key as any)}
                                            onClick={() => setSpan(t.key as any)}
                                            type="button"
                                        >
                                            {t.label}
                                        </RangeTab>
                                    ))}
                                </RangeTabs>
                            </SideHeader>

                            <div style={{ marginTop: 8 }}>
                                <MiniAreaChart
                                    height={150}
                                    data={trend.length ? trend.map((p) => p.value) : []}
                                    labels={trend.length ? trend.map((p) => p.date.slice(5)) : []}
                                    valueUnit="percent"
                                />
                            </div>

                            <div style={{ color: UI.color.text, fontSize: 13, letterSpacing: -0.02 }}>
                                최근 {span === "7d" ? "7일" : "30일"} 추이 {trendLoading ? "(불러오는 중…)" : ""}
                            </div>
                        </SideCard>
                    </Reveal>

                    <Reveal $d={360}>
                        <SideCard>
                            <SideTitle>빠른 재도전</SideTitle>
                            <Quick onClick={openQuickModal} aria-label="최근 N일 이내 오답만 다시 풀기">
                                <strong>최근 N일 이내 오답만 다시 풀기</strong>
                            </Quick>
                        </SideCard>
                    </Reveal>

                    <Reveal $d={440}>
                        <SideCard>
                            <SideTitle>최근 이력</SideTitle>
                            <RecentPager recent={recent} />
                        </SideCard>
                    </Reveal>
                </RightCol>
            </Screen>
            {/* 페이징 */}
            {items.length > 0 && pages > 1 && (
                <Reveal $d={480}>
                    <BottomGrid>
                        <PaginationRow>
                            <PaginationBar aria-label="타임라인 페이지 이동">
                                <PageNavBtn
                                    onClick={goPrev}
                                    disabled={page === 0}
                                    aria-label="이전 페이지"
                                    type="button"
                                >
                                    ‹
                                </PageNavBtn>

                                {pageWindow.map((p) => (
                                    <PagePill
                                        key={p}
                                        $active={p === page}
                                        onClick={() => setPage(p)}
                                        aria-current={p === page ? "page" : undefined}
                                        aria-label={`${p + 1}페이지`}
                                        type="button"
                                    >
                                        {p + 1}
                                    </PagePill>
                                ))}

                                <PageNavBtn
                                    onClick={goNext}
                                    disabled={page >= pages - 1}
                                    aria-label="다음 페이지"
                                    type="button"
                                >
                                    ›
                                </PageNavBtn>
                            </PaginationBar>
                        </PaginationRow>
                    </BottomGrid>
                </Reveal>
            )}
            {quickModalPortal}
            {renameOpen &&
                createPortal(
                    <ModalOverlay
                        role="presentation"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) closeRenameModal();
                        }}
                    >
                        <ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-label="세션 이름 변경"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <ModalHead>
                                <ModalTitle>세션 이름 변경하기</ModalTitle>
                                <ModalDesc>타임라인에 표시될 이름을 바꿔요.</ModalDesc>
                            </ModalHead>

                            <ModalBody>
                                <Field>
                                    <FieldLabel>세션 이름</FieldLabel>
                                    <TextField
                                        ref={renameInputRef}
                                        value={renameValue}
                                        placeholder="세션 이름을 입력하세요"
                                        onChange={(e) => {
                                            setRenameValue(e.target.value);
                                            if (renameErr) setRenameErr(null);
                                        }}
                                        onKeyDown={(e) => {
                                            // IME 조합 중 Enter 방지
                                            // @ts-ignore
                                            if ((e.nativeEvent as any)?.isComposing) return;
                                            if (e.key === "Enter") submitRename();
                                        }}
                                        disabled={renameSaving}
                                    />
                                    <HelperRow>
                                        <HelperText>최대 60자까지 입력 가능 · 공백만 입력하면 저장되지 않아요</HelperText>
                                        <CountText>{(renameValue ?? "").trim().length}/60</CountText>
                                    </HelperRow>
                                    {renameErr && <ErrorText>{renameErr}</ErrorText>}
                                </Field>
                            </ModalBody>

                            <ModalFoot>
                                <ModalGhost type="button" onClick={closeRenameModal} disabled={renameSaving}>
                                    취소
                                </ModalGhost>
                                <ModalPrimary type="button" onClick={submitRename} disabled={renameSaving}>
                                    {renameSaving ? "저장 중..." : "저장하기"}
                                </ModalPrimary>
                            </ModalFoot>
                        </ModalCard>
                    </ModalOverlay>,
                    document.body
                )}

            {/* ===== Delete Modal Portal ===== */}
            {deleteOpen &&
                createPortal(
                    <ModalOverlay
                        role="presentation"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) closeDeleteModal();
                        }}
                    >
                        <ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-label="세션 삭제"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <ModalHead>
                                <ModalTitle>세션 삭제하기</ModalTitle>
                                <ModalDesc>삭제하면 타임라인/목록에서 숨겨져요. (오답노트는 삭제되지 않아요)</ModalDesc>
                            </ModalHead>

                            <ModalBody>
                                <InfoBox>
                                    <div className="title">{deleteTarget?.title ?? "-"}</div>
                                    <div className="meta">{deleteTarget ? fmtDate(deleteTarget.date) : ""}</div>
                                </InfoBox>

                                <Field>
                                    <FieldLabel>삭제 확인</FieldLabel>
                                    <TextField
                                        ref={deleteInputRef}
                                        value={deleteTyped}
                                        placeholder="삭제하려면 '삭제'를 입력하세요"
                                        onChange={(e) => {
                                            setDeleteTyped(e.target.value);
                                            if (deleteErr) setDeleteErr(null);
                                        }}
                                        onKeyDown={(e) => {
                                            // @ts-ignore
                                            if ((e.nativeEvent as any)?.isComposing) return;
                                            if (e.key === "Enter") submitDelete();
                                        }}
                                        disabled={deleteLoading}
                                    />
                                    <HelperText>실수 방지를 위해 확인 문구 입력이 필요해요.</HelperText>
                                    {deleteErr && <ErrorText>{deleteErr}</ErrorText>}
                                </Field>
                            </ModalBody>

                            <ModalFoot>
                                <ModalGhost type="button" onClick={closeDeleteModal} disabled={deleteLoading}>
                                    취소
                                </ModalGhost>
                                <ModalDanger
                                    type="button"
                                    onClick={submitDelete}
                                    disabled={deleteLoading || deleteTyped.trim() !== "삭제"}
                                >
                                    {deleteLoading ? "삭제 중..." : "삭제"}
                                </ModalDanger>
                            </ModalFoot>
                        </ModalCard>
                    </ModalOverlay>,
                    document.body
                )}
            <SystemMessageModal open={sysOpen} message={sysMsg} onClose={closeSys} />
        </NarrowLeft>
    );
}