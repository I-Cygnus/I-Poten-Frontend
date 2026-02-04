import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useNavigate, useNavigationType, useSearchParams } from "react-router-dom";

import http from "../../utils/http.ts";
import { fetchTermsByTag } from "../../api/termApi.ts";
import TermCardWithTagsLazy from "../../components/word/TermCardWithTagsLazy.tsx";

import ExploreStageTabs from "../../components/word/ExploreStageTabs";
import PotenNoteModal from "../../components/note/PotenNoteModal.tsx";
import SystemMessageModal, { SystemMessage } from "../../components/common/SystemMessageModal.tsx";

import { fetchUserFolders, patchReorderFolders } from "../../api/wordbook.ts";
import { deleteUserFolder, deleteUserFoldersBulk, renameUserFolder } from "../../api/folder.ts";
import { useCategoryTree, Category } from "../../hooks/useCategoryTree";

import potenWordMark from "../../assets/hero/potenword-mark.png";

import sampleLiquidGlass from "../../assets/wordcards/liquid-glass.png";
import sampleAgenticAI from "../../assets/wordcards/agentic-ai.png";
import sampleGoldenPath from "../../assets/wordcards/golden-path.png";
import sampleIDP from "../../assets/wordcards/idp.png";
import sampleAgentOps from "../../assets/wordcards/agent-ops.png";
import sampleConfidentialAI from "../../assets/wordcards/confidential-ai.png";
import samplePlatformAsAProduct from "../../assets/wordcards/platform-as-a-product.png";
import samplePlatformEngineering from "../../assets/wordcards/platform-engineering.png";
import sampleSBOM from "../../assets/wordcards/sbom.png";
import sampleShadowAI from "../../assets/wordcards/shadow-ai.png";
import sampleToolCalling from "../../assets/wordcards/tool-calling.png";

/** 타입 정의 */
type Term = { id: number; title: string; description: string; tags?: string[] };
type ApiItem = {
    id: number | string;
    title: string;
    description?: string | null;
    tags?: string[] | null;
    relatedKeywords?: string[] | null;
    tagNames?: string[] | null;
    termTags?: Array<{ tag?: { name?: string }; name?: string }>;
    tagsCsv?: string | null;
};
type ApiResponse = {
    q?: string;
    page?: number;
    size?: number;
    total?: number;
    items?: ApiItem[];
    content?: ApiItem[];
    totalElements?: number;
};
type CacheData = { q: string; items: Term[]; total: number; scrollY?: number };
type Notebook = { id: string; name: string };

type NewArrivalItem = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
};

const NEW_ARRIVALS_SAMPLE: NewArrivalItem[] = [
    {
        id: "liquid-glass",
        title: "Liquid Glass",
        description:
            "투명한 유리처럼 보이는 UI 효과를 말합니다. 블러와 하이라이트로 깊이를 만들고, 레이어가 겹쳐도 가독성을 유지하는 게 핵심입니다.",
        imageUrl: sampleLiquidGlass,
    },
    {
        id: "agentic-ai-1",
        title: "Agentic AI",
        description:
            "목표를 세우고 계획과 도구 호출로 스스로 작업을 수행하는 AI 방식입니다. 프롬프트만이 아니라 상태와 실행 흐름을 함께 설계하는 게 중요합니다.",
        imageUrl: sampleAgenticAI,
    },
    {
        id: "idp",
        title: "내부 개발자 플랫폼(IDP)",
        description:
            "개발자가 인프라를 몰라도 배포·환경 생성을 셀프서비스로 하는 플랫폼입니다. 표준 템플릿과 가드레일로 DX와 안정성을 높입니다.",
        imageUrl: sampleIDP,
    },
    {
        id: "golden-path",
        title: "골든 패스(Golden Path)",
        description:
            "조직이 권장하는 표준 개발 흐름을 가장 쉬운 길로 제공하는 접근입니다. CI/CD, 보안 스캔, 관측성을 기본 포함해 빠르고 안전한 배포를 유도합니다.",
        imageUrl: sampleGoldenPath,
    },
    {
        id: "agent-ops",
        title: "AgentOps",
        description:
            "LLM 에이전트를 운영 가능한 서비스로 만들기 위한 운영 체계입니다. 실행 로그·비용·지연시간·실패 재시도를 관측하고 가드레일로 안전하게 통제합니다.",
        imageUrl: sampleAgentOps,
    },
    {
        id: "confidential-ai",
        title: "Confidential AI",
        description:
            "민감 데이터를 보호된 실행 환경에서 처리·추론해 노출을 줄이는 접근입니다. 키 관리·감사 로그·위협 범위를 함께 설계하는 것이 핵심입니다.",
        imageUrl: sampleConfidentialAI,
    },
    {
        id: "platform-as-a-product",
        title: "Platform as a Product",
        description:
            "내부 플랫폼을 ‘제품’처럼 설계·운영하며 개발자를 사용자로 봅니다. UX·문서·온보딩·로드맵을 관리해 채택률과 생산성을 높입니다.",
        imageUrl: samplePlatformAsAProduct,
    },
    {
        id: "platform-engineering",
        title: "Platform Engineering",
        description:
            "개발자 경험을 높이기 위해 공통 인프라를 셀프서비스 플랫폼으로 제공하는 분야입니다. 표준 템플릿과 골든 패스로 빠르고 안전한 개발 흐름을 만듭니다.",
        imageUrl: samplePlatformEngineering,
    },
    {
        id: "sbom",
        title: "SBOM(Software Bill of Materials)",
        description:
            "소프트웨어에 포함된 라이브러리와 버전 목록을 문서화한 구성요소 명세입니다. 취약점(CVE) 대응 시 영향 범위를 빠르게 파악하고 패치를 우선순위화합니다.",
        imageUrl: sampleSBOM,
    },
    {
        id: "shadow-ai",
        title: "Shadow AI",
        description:
            "조직 통제 없이 개인/팀이 외부 AI 도구를 업무에 쓰는 현상입니다. 정보 유출과 컴플라이언스 리스크가 커서 허용 정책과 대체 수단이 필요합니다.",
        imageUrl: sampleShadowAI,
    },
    {
        id: "tool-calling",
        title: "Tool Calling",
        description:
            "LLM이 함수 호출로 검색·DB·업무 시스템 같은 외부 도구를 실행하는 방식입니다. 입력 검증·권한 체크·타임아웃을 붙여 안전한 자동화를 설계합니다.",
        imageUrl: sampleToolCalling,
    },
];

type ClickToHomeProps = {
    to?: string;
    children: React.ReactNode;
};

const ClickToHome: React.FC<ClickToHomeProps> = ({ to = "/poten-word/terms", children }) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(to)} style={{ cursor: "pointer" }}>
            {children}
        </div>
    );
};

/** 세션 캐시 유틸 */
const readCache = (k: string): CacheData | null => {
    try {
        const r = sessionStorage.getItem(k);
        return r ? JSON.parse(r) : null;
    } catch {
        return null;
    }
};
const writeCache = (k: string, d: CacheData) => {
    try {
        sessionStorage.setItem(k, JSON.stringify(d));
    } catch {}
};

/** 태그 배열 정제/중복 제거 */
const uniqTags = (arr?: string[] | null) => Array.from(new Set((arr ?? []).filter(Boolean))) as string[];

/** ===== 공용 POST 폴백 도우미 ===== */
async function postWithFallback(urls: string[], body: any) {
    let lastErr: any;
    for (const u of urls) {
        try {
            const res = await http.post(u, body);
            return res?.data ?? res;
        } catch (e: any) {
            lastErr = e;
            if (e?.response?.status !== 404) throw e;
        }
    }
    throw lastErr;
}

/** 단일/벌크 공용: 항상 :bulk 호출 */
async function attachTermsBulk(wordbookId: string, termIds: number[]) {
    return postWithFallback(
        [`/me/folders/${wordbookId}/terms:bulk`, `/api/me/folders/${wordbookId}/terms:bulk`],
        { termIds }
    );
}

type TrendingItem = {
    termId: number;
    title: string;
    searchCount: number;
    lastSearchedAt?: string;
};

type TrendingResponse = {
    range: string;
    limit: number;
    items: TrendingItem[];
};

async function fetchTrendingTerms(params: { range?: string; limit?: number }) {
    const range = params.range ?? "7d";
    const limit = params.limit ?? 10;

    const urls = ["/terms/trending", "/api/terms/trending"];
    let lastErr: any;

    for (const u of urls) {
        try {
            const res = await http.get<TrendingResponse>(u, { params: { range, limit } });
            return res.data;
        } catch (e: any) {
            lastErr = e;
            if (e?.response?.status !== 404) throw e;
        }
    }
    throw lastErr;
}

const TOKENS = {
    color: {
        text: "#374151",
        textMuted: "#6b7280",
        textBlue: "#2563eb",
        red: "#dc2626",
        bg: "#ffffff",
        border: "#e5e7eb",
        chipBg: "#eef2ff",
        chipBorder: "#c7d2fe",
    },
    space: (n: number) => `${n}px`,
    font: { base: "14px", small: "12px", strong: 600 },
    radius: 14,
} as const;

const UI = {
    gradient: {
        brand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
        brandSoft: "linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%)",
    },
    color: {
        primaryStrong: "#3E63E0",
        trayBg: "#0f172a",
        trayText: "#ffffff",
        line: "#e5e7eb",
    },
    radius: { pill: 999, xl: 20 },
} as const;

const fadeUp = keyframes`
    0% { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0px); }
`;

const IconSearch = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5174e7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="11" cy="11" r="7" />
        <line x1="16" y1="16" x2="21" y2="21" />
    </svg>
);

const SEARCH_PLACEHOLDER = "예: CAP, DI, CSR, DNS";

/** 검색 영역 인뷰 래퍼 */
type SearchSectionInViewProps = {
    children: React.ReactNode;
    onVisible?: () => void;
};
const SearchSectionInView: React.FC<SearchSectionInViewProps> = ({ children, onVisible }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    const hasFiredRef = useRef(false);

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            if (!hasFiredRef.current) {
                hasFiredRef.current = true;
                onVisible?.();
            }
            return;
        }

        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target !== node) return;

                    if (entry.isIntersecting) {
                        setVisible(true);
                        if (!hasFiredRef.current) {
                            hasFiredRef.current = true;
                            onVisible?.();
                        }
                    } else {
                        setVisible(false);
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [onVisible]);

    return (
        <LandingSearchSection ref={ref} $visible={visible}>
            {children}
        </LandingSearchSection>
    );
};

type PaginationProps = {
    page: number;
    size: number;
    total: number;
    onChange: (nextPageZeroBased: number) => void;
};

const PaginationNav = styled.nav`
    margin-top: ${TOKENS.space(16)};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${TOKENS.space(8)};
    user-select: none;
`;

const PageNumBtn = styled.button<{ $active: boolean }>`
    min-width: 34px;
    height: 34px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? TOKENS.color.textBlue : TOKENS.color.border)};
    background: ${({ $active }) => ($active ? TOKENS.color.textBlue : "#fff")};
    color: ${({ $active }) => ($active ? "#fff" : TOKENS.color.text)};
    font-weight: ${({ $active }) => ($active ? 700 : 600)};
    cursor: pointer;
`;

const NavBtn = styled.button<{ $disabled: boolean }>`
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid ${TOKENS.color.border};
    background: #fff;
    color: ${({ $disabled }) => ($disabled ? "#c7c7c7" : TOKENS.color.text)};
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

const Pagination: React.FC<PaginationProps> = ({ page, size, total, onChange }) => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / (size || 1)));
    const current = page + 1; // 1-base
    const maxNumbers = 10;

    let start = Math.max(1, current - Math.floor(maxNumbers / 2));
    let end = Math.min(totalPages, start + maxNumbers - 1);
    start = Math.max(1, end - maxNumbers + 1);

    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);

    const go = (p1: number) => {
        if (p1 < 1 || p1 > totalPages || p1 === current) return;
        onChange(p1 - 1);
    };

    return (
        <PaginationNav aria-label="페이지네이션">
            <NavBtn aria-label="처음" onClick={() => go(1)} disabled={current === 1} $disabled={current === 1}>
                «
            </NavBtn>
            <NavBtn
                aria-label="이전"
                onClick={() => go(current - 1)}
                disabled={current === 1}
                $disabled={current === 1}
            >
                ‹
            </NavBtn>

            {nums.map((n) => (
                <PageNumBtn
                    key={n}
                    onClick={() => go(n)}
                    aria-current={n === current ? "page" : undefined}
                    $active={n === current}
                >
                    {n}
                </PageNumBtn>
            ))}

            <NavBtn
                aria-label="다음"
                onClick={() => go(current + 1)}
                disabled={current === totalPages}
                $disabled={current === totalPages}
            >
                ›
            </NavBtn>
            <NavBtn
                aria-label="마지막"
                onClick={() => go(totalPages)}
                disabled={current === totalPages}
                $disabled={current === totalPages}
            >
                »
            </NavBtn>
        </PaginationNav>
    );
};

const CHECK_W = 28;
const CHECK_GAP = 10;
const TITLE_SHIFT = CHECK_W + CHECK_GAP;

const CardWrap = styled.div`
    position: relative;
    border-radius: 16px;
`;

const FILTER_TAB_OUTLINE = "rgba(17, 24, 39, 0.18)";

const AlignWithCheck = styled.div`
    article h3[id^="term-"] {
        margin-left: ${TITLE_SHIFT}px !important;
    }
    article {
        border-color: ${FILTER_TAB_OUTLINE} !important;
    }
`;

const SelectToggle = styled.button<{ $on?: boolean }>`
    position: absolute;
    top: 22px;
    left: 20px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${CHECK_W}px;
    height: ${CHECK_W}px;
    border-radius: ${UI.radius.pill}px;
    border: 0;

    background: ${({ $on }) => ($on ? UI.gradient.brand : UI.gradient.brandSoft)};
    color: ${({ $on }) => ($on ? "#fff" : "#0f172a")};
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);

    cursor: pointer;
    line-height: 0;
    overflow: hidden;
    contain: paint;
    backface-visibility: hidden;
    -webkit-tap-highlight-color: transparent;
    transition: transform 80ms ease, filter 160ms ease;

    &:hover {
        filter: brightness(0.98);
    }
    &:active {
        transform: scale(0.97);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.35);
    }
`;

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "block" }} aria-hidden="true">
        <path
            d="M20 7L10 17l-6-6"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const Hollow = styled.span`
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid ${UI.color.primaryStrong};
    background: rgba(255, 255, 255, 0.7);
    display: block;
`;

const PrimaryBtn = styled.button`
    height: 32px;
    padding: 0 12px;
    border-radius: ${UI.radius.pill}px;
    border: 0;
    background: ${UI.gradient.brand};

    appearance: none;
    color: #fff !important;
    -webkit-text-fill-color: #fff;

    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: transform 80ms ease, filter 160ms ease;

    &:hover {
        filter: brightness(0.98);
    }
    &:active {
        transform: scale(0.98);
    }
`;

const Tray = styled.div`
    position: sticky;
    bottom: 0;
    z-index: 7;
    background: ${UI.color.trayBg};
    color: ${UI.color.trayText};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    margin-top: 14px;
`;

const TrayBtns = styled.div`
    display: flex;
    gap: 8px;
`;

const TrayGhostBtn = styled.button`
    border: 1px solid ${UI.color.line};
    background: transparent;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
`;

const TrayPrimary = styled.button`
    border: 0;
    background: ${UI.gradient.brand};
    color: #fff;
    padding: 8px 14px;
    border-radius: 999px;
    font-weight: 700;
    letter-spacing: 0.01em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
    cursor: pointer;
`;

const InfoRow = styled.div`
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: ${TOKENS.space(8)};
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    font-size: ${TOKENS.font.base};
    color: ${TOKENS.color.textMuted};
`;

const Spacer = styled.div`
    flex: 1 1 auto;
`;

const InfoStrongNum = styled.span`
    font-weight: ${TOKENS.font.strong};
    color: ${TOKENS.color.textBlue};
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${TOKENS.space(6)};
    border-radius: ${TOKENS.radius}px;
    background: ${TOKENS.color.chipBg};
    border: 1px solid ${TOKENS.color.chipBorder};
    padding: ${TOKENS.space(4)} ${TOKENS.space(8)};
    font-size: ${TOKENS.font.small};
    color: ${TOKENS.color.textBlue};
    font-weight: 700;
    flex: 0 0 auto;
`;

const Tail = styled.span`
    flex: 0 0 auto;
`;

const LoadingMsg = styled.div`
    margin-top: ${TOKENS.space(16)};
    color: ${TOKENS.color.textMuted};
`;

const ErrorMsg = styled.div`
    margin-top: ${TOKENS.space(16)};
    color: ${TOKENS.color.red};
`;

const List = styled.ul`
    margin-top: ${TOKENS.space(16)};
    padding: 0;
    list-style: none;
`;

const ListItem = styled.li`
    & + & {
        margin-top: ${TOKENS.space(16)};
    }
`;
type NewArrivalsMarqueeProps = {
    items: NewArrivalItem[];
    onClickItem?: (item: NewArrivalItem) => void;
    speedPxPerSec?: number;
};

export function NewArrivalsMarquee({
                                       items,
                                       onClickItem,
                                       speedPxPerSec = 14,
                                   }: NewArrivalsMarqueeProps) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const groupRef = useRef<HTMLDivElement | null>(null);

    // drag 상태(리렌더 최소화를 위해 ref로)
    const isPointerDownRef = useRef(false);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startScrollLeftRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);
    const pausedRef = useRef(false);

    const hoverCountRef = useRef(0);

    const pauseFromHover = () => {
        if (isPointerDownRef.current) return;
        hoverCountRef.current += 1;
        pausedRef.current = true;
    };

    const resumeFromHover = () => {
        if (isPointerDownRef.current) return;
        hoverCountRef.current = Math.max(0, hoverCountRef.current - 1);
        if (hoverCountRef.current === 0) pausedRef.current = false;
    };

    const loopItems = useMemo(() => {
        const MIN = 24;
        const out: NewArrivalItem[] = [];
        while (out.length < MIN) out.push(...items);
        return out;
    }, [items]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const group = groupRef.current;
        if (!viewport || !group) return;

        const prefersReduce =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReduce) return;

        const tick = (ts: number) => {
            if (!viewportRef.current || !groupRef.current) return;

            const vp = viewportRef.current;
            const g = groupRef.current;

            const groupWidth = Math.round(g.getBoundingClientRect().width);
            if (groupWidth <= 0) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            const last = lastTsRef.current ?? ts;
            const dt = Math.min(40, ts - last); // 너무 큰 점프 방지
            lastTsRef.current = ts;

            if (!pausedRef.current && !isPointerDownRef.current) {
                const dx = (speedPxPerSec * dt) / 1000;
                vp.scrollLeft += dx;

                if (vp.scrollLeft >= groupWidth) vp.scrollLeft -= groupWidth;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTsRef.current = null;
        };
    }, [loopItems, speedPxPerSec]);

    const onPointerDown = (e: React.PointerEvent) => {
        const vp = viewportRef.current;
        if (!vp) return;

        pointerIdRef.current = e.pointerId;
        isPointerDownRef.current = true;
        isDraggingRef.current = false;
        startXRef.current = e.clientX;
        startScrollLeftRef.current = vp.scrollLeft;

        pausedRef.current = true;
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const vp = viewportRef.current;
        const group = groupRef.current;
        if (!vp || !group) return;
        if (!isPointerDownRef.current) return;

        const dx = e.clientX - startXRef.current;

        if (!isDraggingRef.current && Math.abs(dx) > 5) {
            isDraggingRef.current = true;
            try {
                (e.currentTarget as HTMLElement).setPointerCapture?.(pointerIdRef.current ?? e.pointerId);
            } catch {}
        }

        vp.scrollLeft = startScrollLeftRef.current - dx;

        const groupWidth = Math.round(group.getBoundingClientRect().width);
        if (groupWidth > 0) {
            while (vp.scrollLeft < 0) vp.scrollLeft += groupWidth;
            while (vp.scrollLeft >= groupWidth) vp.scrollLeft -= groupWidth;
        }
    };

    const endPointer = (forceResume = false) => {
        isPointerDownRef.current = false;
        pointerIdRef.current = null;
        isDraggingRef.current = false;

        if (forceResume) {
            hoverCountRef.current = 0;
            pausedRef.current = false;
            return;
        }

        if (hoverCountRef.current === 0) pausedRef.current = false;
    };

    const guardedClick = (it: NewArrivalItem) => {
        if (isDraggingRef.current) return;
        openArrivalModal(it);
    };

    const [arrivalOpen, setArrivalOpen] = useState(false);
    const [arrivalItem, setArrivalItem] = useState<NewArrivalItem | null>(null);

    const openArrivalModal = (it: NewArrivalItem) => {
        setArrivalItem(it);
        setArrivalOpen(true);
    };

    const pointerIdRef = useRef<number | null>(null);

    useEffect(() => {
        const handleUp = () => {
            if (isPointerDownRef.current) endPointer(true);
        };

        window.addEventListener("pointerup", handleUp, true);
        window.addEventListener("pointercancel", handleUp, true);
        window.addEventListener("blur", handleUp); // 창 밖 클릭/전환

        return () => {
            window.removeEventListener("pointerup", handleUp, true);
            window.removeEventListener("pointercancel", handleUp, true);
            window.removeEventListener("blur", handleUp);
        };
    }, []);

    return (
        <NewArrivalsWrap>
            <NewArrivalsTitleRow>
                <NewArrivalsTitle>새로 도착한 <span className="highlight">포텐워드</span></NewArrivalsTitle>
                <NewArrivalsBadge aria-hidden="true">✉️</NewArrivalsBadge>
            </NewArrivalsTitleRow>

            <MarqueeViewport
                ref={viewportRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={() => endPointer(true)}
                onPointerCancel={() => endPointer(true)}
                onLostPointerCapture={() => endPointer(true)}
                onPointerLeave={() => {
                    if (isPointerDownRef.current) endPointer(true);
                    else if (hoverCountRef.current === 0) pausedRef.current = false;
                }}
                role="region"
                aria-label="새로 도착한 포텐워드"
            >
                <MarqueeTrack>
                    {/* 1번 그룹(기준 폭) */}
                    <MarqueeGroup ref={groupRef} aria-hidden="false">
                        {loopItems.map((it, idx) => (
                            <SquareCardButton
                                key={`${it.id}-${idx}`}
                                type="button"
                                onClick={() => guardedClick(it)}
                                title={it.title}
                                onMouseEnter={pauseFromHover}
                                onMouseLeave={resumeFromHover}
                                onFocus={pauseFromHover}
                                onBlur={resumeFromHover}
                            >
                                <SquareCard>
                                    <SquareImg src={it.imageUrl} alt={it.title} draggable={false} loading="lazy" />

                                    <SquareOverlay aria-hidden="true">
                                        <SquareTitle>{it.title}</SquareTitle>
                                        <SquareDesc>{it.description}</SquareDesc>
                                    </SquareOverlay>
                                </SquareCard>
                            </SquareCardButton>
                        ))}
                    </MarqueeGroup>

                    {/* 2번 그룹(복제) */}
                    <MarqueeGroup aria-hidden="true">
                        {loopItems.map((it, idx) => (
                            <SquareCardButton
                                key={`${it.id}-${idx}-clone`}
                                type="button"
                                onClick={() => guardedClick(it)}
                                title={it.title}
                                onMouseEnter={pauseFromHover}
                                onMouseLeave={resumeFromHover}
                                onFocus={pauseFromHover}
                                onBlur={resumeFromHover}
                            >
                                <SquareCard>
                                    <SquareImg src={it.imageUrl} alt="" draggable={false} loading="lazy" />
                                    <SquareOverlay aria-hidden="true">
                                        <SquareTitle>{it.title}</SquareTitle>
                                        <SquareDesc>{it.description}</SquareDesc>
                                    </SquareOverlay>
                                </SquareCard>
                            </SquareCardButton>
                        ))}
                    </MarqueeGroup>
                </MarqueeTrack>
            </MarqueeViewport>
            {arrivalOpen && arrivalItem && (
                <ArrivalModalBackdrop
                    role="dialog"
                    aria-modal="true"
                    aria-label="설명 전체 보기"
                    onClick={() => setArrivalOpen(false)}
                >
                    <ArrivalModalCard onClick={(e) => e.stopPropagation()}>
                        <ArrivalModalTitle>{arrivalItem.title}</ArrivalModalTitle>
                        <ArrivalModalDesc>{arrivalItem.description}</ArrivalModalDesc>

                        <ArrivalModalBtns>
                            <ArrivalModalGhost type="button" onClick={() => setArrivalOpen(false)}>
                                닫기
                            </ArrivalModalGhost>

                            <ArrivalModalPrimary
                                type="button"
                                onClick={() => {
                                    setArrivalOpen(false);
                                    onClickItem?.(arrivalItem);
                                }}
                            >
                                이 용어로 검색
                            </ArrivalModalPrimary>
                        </ArrivalModalBtns>
                    </ArrivalModalCard>
                </ArrivalModalBackdrop>
            )}
        </NewArrivalsWrap>
    );
}

export default function SearchPage() {
    const [params] = useSearchParams();
    const navType = useNavigationType();
    const navigate = useNavigate();

    // 시스템 메시지 모달 상태
    const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(null);
    const [systemOpen, setSystemOpen] = useState(false);
    const showMessage = useCallback((msg: SystemMessage) => {
        setSystemMessage(msg);
        setSystemOpen(true);
    }, []);

    /** URL params */
    const q = (params.get("q") ?? "").trim();
    const tag = params.get("tag") ?? "";
    const catPath = params.get("catPath") ?? "";
    const page = Number(params.get("page") ?? 0) || 0;
    const size = Number(params.get("size") ?? 20) || 20;

    // 필터 파라미터
    const initial = params.get("initial") || "";
    const alpha = params.get("alpha") || "";
    const symbol = params.get("symbol") || "";

    // 선택된 카테고리 id (catPath의 마지막 조각)
    const catId = useMemo(() => {
        const parts = (catPath || "")
            .split("/")
            .map((s) => s.trim())
            .filter(Boolean);
        return parts.length ? Number(parts[parts.length - 1]) : null;
    }, [catPath]);

    const hasFilter = !!(q || tag || initial || alpha || symbol || catId);

    /** Landing 검색 인풋 상태 (URL q와 동기화) */
    const [searchKeyword, setSearchKeyword] = useState(q);
    useEffect(() => {
        // URL이 바뀌어서 들어왔을 때 input도 따라가게
        setSearchKeyword(q);
    }, [q]);

    /** placeholder 타자 효과 */
    const [placeholderText, setPlaceholderText] = useState("");
    const [startTypingPlaceholder, setStartTypingPlaceholder] = useState(false);

    useEffect(() => {
        if (!startTypingPlaceholder) return;

        const text = SEARCH_PLACEHOLDER;
        const typeSpeed = 80;
        const holdSteps = 20;
        let step = 0;

        const timer = setInterval(() => {
            step = (step + 1) % (text.length + holdSteps);

            if (step === 0) setPlaceholderText("");
            else if (step <= text.length) setPlaceholderText(text.slice(0, step));
            else setPlaceholderText(text);
        }, typeSpeed);

        return () => clearInterval(timer);
    }, [startTypingPlaceholder]);

    /** goSearch: 현재 path 유지하고 searchParams만 갱신 */
    const goSearch = useCallback(() => {
        const nextQ = searchKeyword.trim();
        if (!nextQ) return;

        const sp = new URLSearchParams(params);
        sp.set("q", nextQ);
        sp.set("page", "0");
        sp.set("size", String(size || 20));

        sp.delete("initial");
        sp.delete("alpha");
        sp.delete("symbol");
        sp.delete("tag");

        navigate({ search: `?${sp.toString()}` });
    }, [searchKeyword, params, size, navigate]);

    /** 검색 결과 상태 */
    const [results, setResults] = useState<Term[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /** 선택 상태 */
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const currentPageIds = useMemo(() => results.map((r) => r.id), [results]);
    const allChecked = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
    const selectedCount = selectedIds.size;

    const toggleOne = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllCurrentPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const every = currentPageIds.every((id) => next.has(id));
            if (every) currentPageIds.forEach((id) => next.delete(id));
            else currentPageIds.forEach((id) => next.add(id));
            return next;
        });
    };

    const clearAllSelected = useCallback(() => setSelectedIds(new Set()), []);

    const catIds = useMemo(() => {
        return (catPath || "")
            .split("/")
            .map((s) => Number(s.trim()))
            .filter((n) => Number.isFinite(n) && n > 0);
    }, [catPath]);

    const selected0 = catIds[0] ?? null;
    const selected1 = catIds[1] ?? null;
    const { level0, level1, level2 } = useCategoryTree(selected0, selected1);

    const categoryMap = useMemo(() => {
        const m = new Map<number, Category>();
        [...level0.items, ...level1.items, ...level2.items].forEach((c) => {
            if (c?.id != null) m.set(Number(c.id), c);
        });
        return m;
    }, [level0.items, level1.items, level2.items]);

    const catLabel = useMemo(() => {
        if (catIds.length === 0) return "";

        const names = catIds.map((id) => {
            const c = categoryMap.get(id);
            return c?.name ?? `#${id}`;
        });

        return names.join(" > ");
    }, [catIds, categoryMap]);

    /** 액션바 표시 토글 */
    const [showTray, setShowTray] = useState(true);
    useEffect(() => {
        if (selectedCount > 0) setShowTray(true);
    }, [selectedCount]);

    /** 모달 상태 */
    const [moveOpen, setMoveOpen] = useState(false);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [selectedTermId, setSelectedTermId] = useState<number | null>(null); // 단일
    const [pendingTermIds, setPendingTermIds] = useState<number[] | null>(null); // 벌크
    const [saving, setSaving] = useState(false);
    const [savedEver, setSavedEver] = useState<Set<number>>(new Set());

    /** 캐시 키 */
    const cacheKey = useMemo(() => {
        return `term_search:q${q}:tag${tag}:cat${catPath || "none"}:p${page}:z${size}:i${initial}:a${alpha}:sym${symbol}`;
    }, [q, tag, catPath, page, size, initial, alpha, symbol]);

    /** 언마운트 시 스크롤 저장 */
    useEffect(() => {
        return () => {
            const base = readCache(cacheKey) ?? { q, items: results, total };
            writeCache(cacheKey, { ...base, scrollY: window.scrollY });
        };
    }, [cacheKey, q, results, total]);

    /** 태그 배열 추출 (응답 방어) */
    const extractTags = useCallback((it: ApiItem): string[] | undefined => {
        if (Array.isArray(it.tags)) return uniqTags(it.tags);
        if (Array.isArray(it.relatedKeywords)) return uniqTags(it.relatedKeywords);
        if (Array.isArray(it.tagNames)) return uniqTags(it.tagNames);
        if (Array.isArray(it.termTags)) {
            return uniqTags(
                it.termTags.map((x) => x?.tag?.name ?? x?.name).filter((v): v is string => !!v)
            );
        }
        if (typeof it.tagsCsv === "string" && it.tagsCsv.trim()) {
            return uniqTags(it.tagsCsv.split(",").map((s) => s.trim()));
        }
        return undefined;
    }, []);

    /** 검색 + 캐시 복원 */
    useEffect(() => {
        // 필터가 하나도 없으면: 결과 초기화(landing처럼 보이게)
        if (!hasFilter) {
            setResults([]);
            setTotal(0);
            setError(null);
            setLoading(false);
            clearAllSelected();
            requestAnimationFrame(() => window.scrollTo(0, 0));
            return;
        }

        // POP 내비게이션일 때 캐시 우선 복원
        if (navType === "POP") {
            const cached = readCache(cacheKey);
            if (cached && Array.isArray(cached.items)) {
                setResults(cached.items);
                setTotal(cached.total ?? 0);
                setError(null);
                setLoading(false);
                requestAnimationFrame(() => window.scrollTo(0, cached.scrollY ?? 0));
                return;
            }
        }

        const ac = new AbortController();
        setLoading(true);
        setError(null);

        (async () => {
            try {
                let items: Term[] = [];
                let nextTotalNum = 0;

                if (tag) {
                    // 태그 검색
                    const res = await fetchTermsByTag(tag, page + 1, size);
                    const rawItems = (res as any).termList ?? [];
                    items = rawItems.map((it: any) => ({
                        id: Number(it.id),
                        title: it.title,
                        description: it.description ?? "",
                        tags: uniqTags(it.tags ?? []),
                    }));
                    const t = (res as any).totalItems;
                    if (typeof t === "number") nextTotalNum = t;

                    // 태그인데 결과 0개면 not-found로 이동
                    if (nextTotalNum === 0) {
                        const spNF = new URLSearchParams();
                        spNF.set("tag", tag);
                        navigate(
                            {
                                pathname: "../terms/not-found",
                                search: `?${spNF.toString()}`,
                            },
                            { replace: true }
                        );
                        return;
                    }
                } else {
                    // 일반 검색
                    const res = await http.get<ApiResponse>("/terms/search", {
                        params: { q, page, size, initial, alpha, symbol, catPath },
                        signal: ac.signal,
                    });

                    const rawItems = res.data.items ?? res.data.content ?? [];
                    items = rawItems.map((it) => ({
                        id: Number(it.id),
                        title: it.title,
                        description: it.description ?? "",
                        tags: extractTags(it),
                    }));

                    const dataAny = res.data as any;
                    if (typeof dataAny.total === "number") nextTotalNum = dataAny.total;
                    else if (typeof dataAny.totalElements === "number") nextTotalNum = dataAny.totalElements;
                }

                // 페이지 범위 보정
                const totalPages = Math.max(1, Math.ceil((nextTotalNum || 0) / (size || 1)));
                if (page > totalPages - 1 && nextTotalNum > 0) {
                    const sp = new URLSearchParams();
                    if (q) sp.set("q", q);
                    if (tag) sp.set("tag", tag);
                    if (initial) sp.set("initial", initial);
                    if (alpha) sp.set("alpha", alpha);
                    if (symbol) sp.set("symbol", symbol);
                    if (catPath) sp.set("catPath", catPath);
                    sp.set("page", String(totalPages - 1));
                    sp.set("size", String(size || 20));
                    navigate({ search: `?${sp.toString()}` }, { replace: true });
                    return;
                }

                setResults(items);
                setTotal(nextTotalNum);

                // 현재 페이지에 없는 선택은 정리
                setSelectedIds((prev) => {
                    const keep = new Set<number>();
                    const idsOnPage = new Set(items.map((i) => i.id));
                    prev.forEach((id) => {
                        if (idsOnPage.has(id)) keep.add(id);
                    });
                    return keep;
                });

                // 캐시 저장 (스크롤 0)
                writeCache(cacheKey, { q, items, total: nextTotalNum, scrollY: 0 });
            } catch (e: any) {
                if (ac.signal.aborted) return;

                const status = e?.response?.status;
                const ebookErr = e?.response?.headers?.["ebook-error"];
                const serverMsg = e?.response?.data?.message || e?.message;

                setError(
                    status
                        ? `오류(${status}) ${serverMsg || ""}${ebookErr ? ` [${ebookErr}]` : ""}`
                        : serverMsg || "검색 중 오류가 발생했습니다."
                );
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [
        hasFilter,
        navType,
        cacheKey,
        q,
        tag,
        page,
        size,
        initial,
        alpha,
        symbol,
        catPath,
        navigate,
        clearAllSelected,
        extractTags,
    ]);

    /** 페이지 이동 */
    const handlePageChange = (nextZeroBased: number) => {
        const sp = new URLSearchParams();
        if (q) sp.set("q", q);
        if (tag) sp.set("tag", tag);
        if (initial) sp.set("initial", initial);
        if (alpha) sp.set("alpha", alpha);
        if (symbol) sp.set("symbol", symbol);
        if (catPath) sp.set("catPath", catPath);
        sp.set("page", String(nextZeroBased));
        sp.set("size", String(size || 20));
        navigate({ search: `?${sp.toString()}` });
    };

    /** 카드 내 태그 클릭 → 태그 검색으로 전환 */
    const handleTagClick = (t: string) => {
        const sp = new URLSearchParams();
        sp.set("tag", t);
        sp.set("page", "0");
        sp.set("size", String(size || 20));
        navigate({ search: `?${sp.toString()}` });
    };

    /** 단일/벌크 저장 트리거 */
    const handleAddClick = useCallback(
        async (termId: number) => {
            const hasSelection = selectedIds.size > 0;

            if (hasSelection) {
                const ids = Array.from(new Set<number>([...Array.from(selectedIds), termId]));
                setPendingTermIds(ids);
                setSelectedTermId(null);
            } else {
                setSelectedTermId(termId);
                setPendingTermIds(null);
            }

            try {
                setNotebooks(await fetchUserFolders());
            } catch (e: any) {
                if (e?.response?.status === 401) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }
                setNotebooks([]);
            }

            setMoveOpen(true);
        },
        [selectedIds, navigate]
    );

    /** 액션바 '내 포텐노트에 저장하기' */
    const openBulkSave = useCallback(async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) {
            alert("먼저 단어를 선택해 주세요.");
            return;
        }
        setSelectedTermId(null);
        setPendingTermIds(ids);

        try {
            setNotebooks(await fetchUserFolders());
        } catch (e: any) {
            if (e?.response?.status === 401) {
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }
            setNotebooks([]);
        }
        setMoveOpen(true);
    }, [selectedIds, navigate]);

    /** 벌크 응답 파싱 */
    type BulkParsed = {
        addedIds: number[];
        duplicateIds: number[];
        failedIds: number[];
        addedCount: number;
        duplicateCount: number;
        failedCount: number;
        invalidCount: number;
    };

    function parseBulkResult(data: any): BulkParsed {
        const num = (v: any) => {
            const n = Number(v);
            return Number.isFinite(n) && n >= 0 ? n : 0;
        };

        const addedCount = num(data?.attached);
        const duplicateCount = num(data?.skipped);
        const failedCount = num(data?.failed);
        const invalidCount = Array.isArray(data?.invalidIds) ? data.invalidIds.length : 0;

        return {
            addedIds: [],
            duplicateIds: [],
            failedIds: [],
            addedCount,
            duplicateCount,
            failedCount,
            invalidCount,
        };
    }

    /** 모달 저장 */
    const handleSaveToNotebook = useCallback(
        async (notebookId: string) => {
            if (saving) return;

            try {
                setSaving(true);

                const idsToSave =
                    pendingTermIds && pendingTermIds.length > 0 ? pendingTermIds : selectedTermId ? [selectedTermId] : [];

                if (idsToSave.length === 0) {
                    alert("저장할 항목이 없어요.");
                    return;
                }

                const resData = await attachTermsBulk(notebookId, idsToSave);
                const { addedIds, duplicateIds, failedIds, addedCount, duplicateCount, failedCount } = parseBulkResult(resData);

                // 로컬 배지(확실히 아는 것만)
                const toMark = new Set<number>([...addedIds, ...duplicateIds]);
                if (toMark.size > 0) setSavedEver((prev) => new Set([...prev, ...toMark]));

                const addN = addedCount;
                const dupN = duplicateCount;
                const failN = failedCount;

                if (failN > 0) {
                    showMessage({
                        tone: "warning",
                        title: "일부만 저장되었어요",
                        description: `${addN}개 저장, ${dupN}개는 이미 저장됨, ${failN}개는 실패했어요. 잠시 후 다시 시도해 주세요.`,
                    });
                } else if (addN === 0 && dupN > 0) {
                    showMessage({
                        tone: "info",
                        title: "이미 저장된 용어예요",
                        description: `총 ${dupN}개 용어는 이미 내 포텐노트에 저장되어 있었어요.`,
                    });
                } else if (addN > 0 && dupN > 0) {
                    showMessage({
                        tone: "success",
                        title: "저장 완료",
                        description: `${addN}개 용어를 저장했고, ${dupN}개는 이미 저장된 항목이었어요.`,
                    });
                } else if (addN > 0) {
                    const desc = idsToSave.length === 1 ? "단어가 내 포텐노트에 저장됐어요." : `${addN}개 용어를 저장했어요.`;
                    showMessage({ tone: "success", title: "저장 완료", description: desc });
                } else {
                    const guessedDup = idsToSave.filter((id) => savedEver.has(id)).length;
                    if (guessedDup > 0) {
                        showMessage({
                            tone: "info",
                            title: "이미 저장된 용어예요",
                            description: `총 ${guessedDup}개 용어는 이미 저장되어 있었어요.`,
                        });
                    } else {
                        showMessage({
                            tone: "warning",
                            title: "저장된 항목이 없어요",
                            description: "이미 저장되어 있거나 처리할 수 없었어요.",
                        });
                        console.debug("[bulk-save] unexpected response:", resData);
                    }
                }

                // 종료/정리
                setPendingTermIds(null);
                setSelectedTermId(null);
                setMoveOpen(false);
                clearAllSelected();
            } catch (err: any) {
                const s = err?.response?.status;
                if (s === 401) {
                    showMessage({ tone: "warning", title: "로그인이 필요합니다", description: "로그인 후 다시 시도해 주세요." });
                } else if (s === 403) {
                    showMessage({ tone: "warning", title: "접근 권한이 없어요", description: "해당 포텐노트에 접근할 수 없습니다." });
                } else if (s === 404) {
                    showMessage({
                        tone: "error",
                        title: "폴더나 용어를 찾을 수 없어요",
                        description: "삭제되었거나 존재하지 않는 항목일 수 있어요.",
                    });
                } else {
                    showMessage({ tone: "error", title: "저장 중 오류가 발생했어요", description: "잠시 후 다시 시도해 주세요." });
                }
                console.error("[save to notebook] failed:", err);
            } finally {
                setSaving(false);
            }
        },
        [pendingTermIds, selectedTermId, saving, clearAllSelected, savedEver, showMessage]
    );

    /** 용어 카드 1장씩 등장 */
    const [visibleCount, setVisibleCount] = useState(0);
    const listRef = useRef<HTMLUListElement | null>(null);

    useEffect(() => {
        setVisibleCount(0);
        if (!listRef.current || results.length === 0) return;

        const rootEl = listRef.current;
        const items = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-term-idx]"));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const idxAttr = entry.target.getAttribute("data-term-idx");
                    if (idxAttr == null) return;

                    const idx = Number(idxAttr);
                    if (Number.isNaN(idx)) return;

                    setVisibleCount((prev) => Math.max(prev, idx + 1));
                    observer.unobserve(entry.target);
                });
            },
            { root: null, threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
        );

        items.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [results]);

    const resultsTopRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (navType === "POP") return;
        if (!hasFilter) return;

        resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [navType, hasFilter, q, tag, initial, alpha, symbol, catPath]);

    const [trending, setTrending] = useState<TrendingItem[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(false);
    const [trendingError, setTrendingError] = useState<string | null>(null);

    useEffect(() => {
        if (hasFilter) return; // landing에서만
        let alive = true;

        (async () => {
            try {
                setTrendingLoading(true);
                setTrendingError(null);

                const data = await fetchTrendingTerms({ range: "7d", limit: 10 });
                if (!alive) return;

                setTrending((data?.items ?? []).slice(0, 10));
            } catch (e: any) {
                if (!alive) return;
                const msg =
                    e?.response?.data?.message ||
                    e?.message ||
                    "트렌딩 용어를 불러오지 못했어요.";

                setTrendingError(msg);
                setTrending([]);
            } finally {
                if (alive) setTrendingLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [hasFilter]);

    return (
        <>
            <SoftBg />

            {/* ===== Landing Hero (검색) ===== */}
            <ClickToHome>
                <Wrapper>
                    <HeroWatermark aria-hidden="true">
                        <HeroWatermarkImg src={potenWordMark} alt="" />
                    </HeroWatermark>

                    <SearchSectionInView
                        onClick={(e) => e.stopPropagation()}
                        onVisible={() => setStartTypingPlaceholder(true)}
                    >
                    <SearchHeader>
                            <BrandTitle>포텐워드</BrandTitle>
                            <SearchTitle>궁금한 IT 용어를 바로 검색해 보세요.</SearchTitle>
                            <SearchDesc>
                                모르는 용어를 만날 때마다 포텐워드에서 바로 검색해 보세요. 개념, 중요성, 실무 혹은 면접에서의 포인트까지
                                연결해서 정리해 드립니다.
                            </SearchDesc>
                        </SearchHeader>

                        <SearchBarForm
                            onSubmit={(e) => {
                                e.preventDefault();
                                goSearch();
                            }}
                        >
                            <SearchInput
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        goSearch();
                                    }
                                }}
                                placeholder={placeholderText || SEARCH_PLACEHOLDER}
                            />
                            <SearchButton type="button" aria-label="검색" onClick={goSearch}>
                                <IconSearch />
                            </SearchButton>
                        </SearchBarForm>
                    </SearchSectionInView>
                </Wrapper>
            </ClickToHome>

            {/* ===== Landing WhiteStage (탐색 탭) ===== */}
            <WhiteStage>
                <WhiteStageInner>
                    <ExploreStageTabs defaultCollapsed={false} />



                    {hasFilter && (
                        <ResultsStage>
                            <div ref={resultsTopRef} />

                            <ContentInner>
                                {/* 안내/칩줄 + 로딩/에러 메시지 */}
                                <InfoRow aria-live="polite">
                                    <Tail>
                                        총 <InfoStrongNum>{total.toLocaleString()}</InfoStrongNum>개 용어가 검색되었습니다.
                                    </Tail>

                                    {results.length > 0 && (
                                        <>
                                            <Spacer />
                                            <PrimaryBtn
                                                type="button"
                                                onClick={toggleAllCurrentPage}
                                                aria-pressed={allChecked}
                                                title={allChecked ? "현재 페이지 선택 해제" : "현재 페이지 전체 선택"}
                                            >
                                                {allChecked ? "현재 페이지 선택 해제" : "현재 페이지 전체 선택"}
                                            </PrimaryBtn>
                                        </>
                                    )}
                                </InfoRow>

                                {loading && <LoadingMsg>불러오는 중...</LoadingMsg>}
                                {error && <ErrorMsg>{error}</ErrorMsg>}

                                {/* 검색 결과 리스트 */}
                                {!loading && !error && results.length > 0 && (
                                    <List ref={listRef}>
                                        {results.map((t, idx) => {
                                            const isVisible = idx < visibleCount;
                                            const isOn = selectedIds.has(t.id);

                                            return (
                                                <ListItem
                                                    key={t.id}
                                                    data-term-idx={idx}
                                                    style={{
                                                        opacity: isVisible ? 1 : 0,
                                                        transform: isVisible ? "translateY(0)" : "translateY(8px)",
                                                        transition: "opacity 200ms ease, transform 200ms ease",
                                                    }}
                                                >
                                                    <CardWrap>
                                                        <SelectToggle
                                                            $on={isOn}
                                                            aria-label={isOn ? "선택 해제" : "선택"}
                                                            title={isOn ? "선택 해제" : "선택"}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleOne(t.id);
                                                            }}
                                                        >
                                                            {isOn ? <CheckIcon /> : <Hollow />}
                                                        </SelectToggle>

                                                        <AlignWithCheck>
                                                            <TermCardWithTagsLazy
                                                                id={t.id}
                                                                title={t.title}
                                                                description={t.description}
                                                                tags={t.tags}
                                                                onTagClick={handleTagClick}
                                                                onAdd={handleAddClick}
                                                            />
                                                        </AlignWithCheck>
                                                    </CardWrap>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                )}

                                {/* 페이지네이션 */}
                                {!loading && !error && total > 0 && (
                                    <Pagination page={page} size={size} total={total} onChange={handlePageChange} />
                                )}

                                {/* 결과 없음 */}
                                {!loading && !error && results.length === 0 && (
                                    <div style={{ marginTop: TOKENS.space(16), color: TOKENS.color.textMuted }}>
                                        검색 결과가 없습니다.
                                    </div>
                                )}

                                {/* 하단 액션바 */}
                                {selectedCount > 0 && showTray && (
                                    <Tray role="region" aria-label="선택 항목 액션바">
                                        <span>선택 {selectedCount.toLocaleString()}개</span>
                                        <TrayBtns>
                                            <TrayGhostBtn onClick={() => setShowTray(false)}>닫기</TrayGhostBtn>
                                            <TrayPrimary onClick={openBulkSave}>내 포텐노트에 저장하기</TrayPrimary>
                                        </TrayBtns>
                                    </Tray>
                                )}
                            </ContentInner>
                        </ResultsStage>
                    )}

                    {/* 포텐노트 모달 */}
                    <PotenNoteModal
                        open={moveOpen}
                        notebooks={notebooks}
                        onClose={() => {
                            setMoveOpen(false);
                            setSelectedTermId(null);
                            setPendingTermIds(null);
                        }}
                        onSave={handleSaveToNotebook}
                        onCreate={async (name) => {
                            const { data } = await http.post("/me/folders", { wordbookName: name });
                            const newId = String(data.id);
                            const newName = data.wordbookName ?? name;
                            setNotebooks((prev) => [{ id: newId, name: newName }, ...prev]);
                            return newId;
                        }}
                        onReorder={async (orderedIds) => {
                            try {
                                await patchReorderFolders(orderedIds);
                                const refreshed = await fetchUserFolders();
                                setNotebooks(refreshed);
                            } catch (e) {
                                console.warn("[folders reorder] 실패", e);
                            }
                        }}
                        onGoToFolder={() => setMoveOpen(false)}
                        onRename={async (wordbookId, newName) => {
                            await renameUserFolder(wordbookId, newName);
                            setNotebooks((prev) => prev.map((n) => (n.id === wordbookId ? { ...n, name: newName } : n)));
                        }}
                        onRequestDelete={async (fid) => {
                            await deleteUserFolder(fid, "purge");
                            setNotebooks(await fetchUserFolders());
                        }}
                        onRequestBulkDelete={async (ids) => {
                            await deleteUserFoldersBulk(ids, "purge");
                            setNotebooks(await fetchUserFolders());
                        }}
                        onRefresh={async () => await fetchUserFolders()}
                    />

                    {/* 시스템 메시지 모달 */}
                    <SystemMessageModal
                        open={systemOpen}
                        message={systemMessage}
                        onClose={() => {
                            setSystemOpen(false);
                            setSystemMessage(null);
                        }}
                    />
                </WhiteStageInner>
            </WhiteStage>
            {/* 필터/검색 없을 때: 새로 도착한 포텐워드 */}
            {!hasFilter && (
                <>
                    <NewArrivalsMarquee
                        items={NEW_ARRIVALS_SAMPLE}
                        speedPxPerSec={60}
                        onClickItem={(item) => {
                            const sp = new URLSearchParams(params);
                            sp.set("q", item.title);
                            sp.set("page", "0");
                            sp.set("size", String(size || 20));

                            sp.delete("initial");
                            sp.delete("alpha");
                            sp.delete("symbol");
                            sp.delete("tag");

                            navigate({ search: `?${sp.toString()}` });
                        }}
                    />

                    <TrendingWrap>
                        <TrendingInner>
                            <TrendingHead>
                                <div>
                                    <TrendingTitle>
                                        이번 주 I-Poten 회원들이 가장 많이 찾아본 <span className="highlight">포텐워드</span> TOP 10
                                    </TrendingTitle>
                                </div>
                            </TrendingHead>

                            {trendingLoading && <TrendingState>불러오는 중...</TrendingState>}
                            {trendingError && <TrendingState $error>{trendingError}</TrendingState>}

                            {!trendingLoading && !trendingError && trending.length > 0 && (
                                <TrendingRankList>
                                    {trending.map((it, idx) => (
                                        <TrendingRowBtn
                                            key={`${it.termId}-${idx}`}
                                            type="button"
                                            onClick={() => {
                                                const sp = new URLSearchParams(params);
                                                sp.set("q", it.title);
                                                sp.set("page", "0");
                                                sp.set("size", String(size || 20));
                                                sp.delete("initial");
                                                sp.delete("alpha");
                                                sp.delete("symbol");
                                                sp.delete("tag");
                                                navigate({ search: `?${sp.toString()}` });
                                            }}
                                            title={`${idx + 1}위 ${it.title}`}
                                        >
                                            <TrendingRowContent>
                                                <RankPill $rank={idx + 1}>{idx + 1}위</RankPill>
                                                <RowTitle>{it.title}</RowTitle>
                                            </TrendingRowContent>
                                        </TrendingRowBtn>
                                    ))}
                                </TrendingRankList>
                            )}

                            {!trendingLoading && !trendingError && trending.length === 0 && (
                                <TrendingState>이번 주 트렌딩 데이터가 아직 없어요.</TrendingState>
                            )}
                        </TrendingInner>
                    </TrendingWrap>
                </>
            )}
        </>
    );
}

/** =========================
 *  Styled (Landing + Layout)
 *  ========================= */
const SoftBg = styled.div`
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    background:
            radial-gradient(
                    900px 900px at 20% 60%,
                    rgba(211, 228, 253, 0.55) 0%,
                    rgba(211, 228, 253, 0.30) 40%,
                    rgba(211, 228, 253, 0.15) 60%,
                    rgba(211, 228, 253, 0.05) 80%,
                    transparent 100%
            ),
            radial-gradient(
                    900px 900px at 80% 55%,
                    rgba(213, 247, 239, 0.55) 0%,
                    rgba(213, 247, 239, 0.30) 40%,
                    rgba(213, 247, 239, 0.15) 60%,
                    rgba(213, 247, 239, 0.05) 80%,
                    transparent 100%
            ),
            #ffffff;

    @media (max-width: 640px) {
        background:
                radial-gradient(
                        600px 600px at 30% 70%,
                        rgba(211, 228, 253, 0.50) 0%,
                        rgba(211, 228, 253, 0.20) 50%,
                        transparent 100%
                ),
                radial-gradient(
                        600px 600px at 80% 50%,
                        rgba(213, 247, 239, 0.50) 0%,
                        rgba(213, 247, 239, 0.20) 50%,
                        transparent 100%
                ),
                #ffffff;
    }
`;

const Wrapper = styled.div`
    width: 100%;
    padding: 80px 20px 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
`;

const HeroWatermark = styled.div`
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    z-index: 1;
    pointer-events: none;
    user-select: none;

    width: min(1400px, 92vw);
    display: flex;
    justify-content: center;

    @media (max-width: 640px) {
        bottom: 0px;
    }
`;

const HeroWatermarkImg = styled.img`
    width: 100%;
    height: auto;
    opacity: 0.36;
    filter: saturate(1.2) contrast(1.12) brightness(0.98) drop-shadow(0 14px 28px rgba(15, 23, 42, 0.1));
    mix-blend-mode: normal;

    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 14%, #000 100%);
    mask-image: linear-gradient(180deg, transparent 0%, #000 14%, #000 100%);

    @media (max-width: 640px) {
        opacity: 0.16;
        filter: saturate(1.15) contrast(1.1) brightness(0.99) drop-shadow(0 10px 22px rgba(15, 23, 42, 0.08));
        -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 100%);
        mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 100%);
    }
`;

const LandingSearchSection = styled.section<{ $visible?: boolean }>`
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1100px;
    margin-top: 60px;
    margin-bottom: 80px;

    & > * {
        opacity: 0;
        transform: translateY(18px);
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(.16,1,.3,1);
    }

    ${({ $visible }) =>
            $visible &&
            css`
                & > * {
                    opacity: 1;
                    transform: translateY(0);
                }
                & > *:nth-child(1) { transition-delay: 0.0s; }
                & > *:nth-child(2) { transition-delay: 0.08s; }
                & > *:nth-child(3) { transition-delay: 0.16s; }
                & > *:nth-child(4) { transition-delay: 0.24s; }
            `}
`;

const SearchHeader = styled.div`
    text-align: center;
    margin-bottom: 24px;

    @media (max-width: 640px) {
        text-align: left;
    }
`;

const BrandTitle = styled.h1`
    margin: 0 0 6px;
    font-size: clamp(44px, 6vw, 68px);
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.02s;
`;

const SearchTitle = styled.h2`
    margin: 0 0 8px;
    font-size: 36px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.12s;
`;

const SearchDesc = styled.p`
    margin: 0;
    font-size: 15px;
    color: #4b5563;
    line-height: 1.6;
    letter-spacing: -0.02em;
    word-break: keep-all;

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.2s;
`;

const SearchBarForm = styled.form`
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #ffffff;
    border-radius: 999px;
    padding: 8px 10px 8px 18px;
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
    border: 1px solid #e5e7eb;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
        border-radius: 18px;
        padding: 10px 12px;
    }
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    color: #111827;
    background: transparent;

    &::placeholder {
        color: #9ca3af;
    }
`;

const SearchButton = styled.button`
    flex-shrink: 0;
    border: 1px solid #ffffff;
    border-radius: 999px;
    width: 36px;
    height: 36px;
    padding: 0;
    background: #ffffff;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: transform 80ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;

    svg {
        display: block;
    }
`;

const WhiteStage = styled.section`
    position: relative;
    isolation: isolate;

    width: 100vw;
    left: 50%;
    margin-left: -50vw;
    background: transparent;

    padding: 72px 0 64px;
    margin-top: -18px;

    overflow-x: clip;
    --vFade: clamp(22px, 4vw, 56px);

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        background: #ffffff;
        border-top: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 -18px 60px rgba(15, 23, 42, 0.06);

        -webkit-mask-image: linear-gradient(
                180deg,
                transparent 0,
                #000 var(--vFade),
                #000 calc(100% - var(--vFade)),
                transparent 100%
        );
        mask-image: linear-gradient(
                180deg,
                transparent 0,
                #000 var(--vFade),
                #000 calc(100% - var(--vFade)),
                transparent 100%
        );

        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-size: 100% 100%;
        mask-size: 100% 100%;
    }

    @media (max-width: 640px) {
        padding: 56px 0 80px;
        margin-top: -12px;
        --vFade: 28px;
    }
`;

const WhiteStageInner = styled.div`
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
`;

const ResultsStage = styled.section`
    width: 100%;
    padding: 0 0 24px;
    margin-top: 24px;
`;

const ContentInner = styled.div`
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
`;

const NewArrivalsWrap = styled.section`
    position: relative;

    width: 100vw;
    left: 50%;
    margin-left: -50vw;

    margin-top: 22px;
    padding: 22px 0 6px;

    overflow-x: hidden;
`;

const highlightText = css`
  .highlight {
    background: linear-gradient(90deg, #3a83f3, #11b884);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
  }
`;

const NewArrivalsTitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 16px;
`;

const NewArrivalsTitle = styled.h3`
    margin: 0;
    font-size: 34px;
    font-weight: 750;
    letter-spacing: -0.02em;
    color: #0f172a;
    ${highlightText}
`;

const NewArrivalsBadge = styled.span`
    font-size: 30px;
    transform: translateY(1px);
`;

/** 그룹 2개가 같은 폭을 가지도록 "동일한 gap/구성" 강제 */
const MarqueeGroup = styled.div`
    display: flex;
    gap: 32px;
    padding: 0 max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
    flex: 0 0 auto;
`;

const MarqueeViewport = styled.div`
    width: 100%;
    overflow: hidden;
    padding: 14px 0 12px;

    cursor: grab;
    user-select: none;
    touch-action: pan-y;

    transform: translateZ(0);

    &:active {
        cursor: grabbing;
    }
`;

const MarqueeTrack = styled.div`
    display: flex;
    width: max-content;
    will-change: transform;
    transform: translate3d(0,0,0);
`;

const SquareCard = styled.div`
    position: relative;
    width: 520px;
    height: 520px;
    border-radius: 32px;
    overflow: hidden;

    box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
    contain: content;

    @media (max-width: 1024px) {
        width: 360px;
        height: 360px;
    }
    @media (max-width: 640px) {
        width: 280px;
        height: 280px;
        border-radius: 26px;
    }
`;

const SquareImg = styled.img`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;

    backface-visibility: hidden;
    transform: translateZ(0);
`;

const SquareOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    padding: 22px 22px 26px;
    color: #fff;

    background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 42%,
            rgba(0, 0, 0, 0.28) 64%,
            rgba(0, 0, 0, 0.70) 100%
    );

    @media (max-width: 1024px) {
        padding: 18px 18px 22px;
    }
    @media (max-width: 640px) {
        padding: 14px 14px 18px;
    }
`;

const SquareTitle = styled.h4`
  margin: 0 0 10px;

  font-family: "GhanaChocolate", "Pretendard Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
  font-weight: 400;

  font-size: 36px;
  line-height: 1.12;
  letter-spacing: -0.02em;

  text-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 1024px) {
    font-size: 26px;
    margin-bottom: 8px;
  }
  @media (max-width: 640px) {
    font-size: 21px;
    margin-bottom: 6px;
  }
`;

const SquareDesc = styled.p`
    margin: 0;

    font-family: "Pretendard Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
    font-weight: 300;
    font-size: 15px;
    line-height: 1.55;
    letter-spacing: -0.01em;

    opacity: 0.92;
    text-shadow: 0 6px 18px rgba(0, 0, 0, 0.42);

    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;

    @media (max-width: 1024px) {
        font-size: 14px;
        -webkit-line-clamp: 3;
    }
    @media (max-width: 640px) {
        font-size: 14px;
        -webkit-line-clamp: 3;
    }
`;

const SquareCardButton = styled.button`
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    backface-visibility: hidden;
    transform: translateZ(0);

    &:hover ${SquareOverlay} {
        background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0) 38%,
                rgba(0, 0, 0, 0.32) 60%,
                rgba(0, 0, 0, 0.80) 100%
        );
    }
`;

const ArrivalModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
`;

const ArrivalModalCard = styled.div`
  width: min(560px, 100%);
  border-radius: 18px;
  background: #fff;
  padding: 18px 18px 16px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.25);
`;

const ArrivalModalTitle = styled.h4`
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: #0f172a;
`;

const ArrivalModalDesc = styled.p`
  margin: 0 0 14px;
  color: #334155;
  font-size: 14px;
  letter-spacing: -0.02em;
  line-height: 1.65;
`;

const ArrivalModalBtns = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ArrivalModalGhost = styled.button`
  border: 1px solid rgba(15,23,42,0.18);
  background: transparent;
  color: #0f172a;
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: -0.02em;
  cursor: pointer;
`;

const ArrivalModalPrimary = styled.button`
  border: 0;
  background: ${UI.gradient.brand};
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 750;
  letter-spacing: -0.02em;
  cursor: pointer;
`;

const TrendingWrap = styled.section`
    width: 100vw;
    left: 50%;
    margin-left: -50vw;
    position: relative;

    padding: 96px 0 72px;

    @media (max-width: 640px) {
        padding: 72px 0 64px;
    }
`;

const TrendingInner = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
`;

const TrendingHead = styled.div`
    display: flex;
    justify-content: center;
    text-align: center;

    margin: 10px 0 30px;

    @media (max-width: 640px) {
        margin: 6px 0 22px;
    }
`;

const TrendingTitle = styled.h2`
  margin: 0;
  font-size: 34px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: #0f172a;

  @media (max-width: 640px) {
    font-size: 22px;
  }
  ${highlightText}
`;

const TrendingState = styled.div<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? "#dc2626" : "#6b7280")};
  font-size: 14px;
  text-align: center;
  padding: 12px 0;
`;

const TrendingRankList = styled.div`
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    margin-top: 48px;
    position: relative;

    border-top: 0;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);

        width: min(560px, 92%);
        height: 1px;
        background: rgba(15, 23, 42, 0.12);
    }
`;

const TrendingRowBtn = styled.button`
    width: 100%;
    border: 0;
    background: transparent;
    padding: 16px 10px;
    cursor: pointer;

    display: flex;
    justify-content: center;

    position: relative;

    &::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        transform: translateX(-50%);
        width: min(560px, 92%);
        background: transparent;
        border-radius: 0;
        transition: background 140ms ease;
        pointer-events: none;
        z-index: 0;
    }

    &:hover::before {
        background: rgba(15, 23, 42, 0.03);
    }

    &::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: min(560px, 92%);
        height: 1px;
        background: rgba(15, 23, 42, 0.12);
        z-index: 1;
    }
`;

const TrendingRowContent = styled.div`
    width: min(560px, 92%);
    display: flex;
    align-items: center;
    gap: 18px;

    position: relative;
    z-index: 2;

    padding-left: 12px;
    padding-right: 0;
`;

const RankPill = styled.span<{ $rank: number }>`
    min-width: 56px;
    height: 30px;
    padding: 0 12px;
    border-radius: 999px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    font-size: 13px;
    font-weight: 750;
    line-height: 1;
    letter-spacing: -0.02em;
    color: #fff;

    background: ${({ $rank }) => {
        const top3 = "linear-gradient(135deg, #4F76F1 0%, #16b981 100%)";
        if ($rank <= 3) return top3;
        return "#0b0b0b";
    }};
`;

const RowTitle = styled.div`
    font-size: 20px;
    font-weight: 560;
    line-height: 1.08;
    letter-spacing: -0.035em;
    color: #0f172a;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 640px) {
        font-size: 17px;
        font-weight: 520;
        line-height: 1.1;
        letter-spacing: -0.03em;
    }
`;