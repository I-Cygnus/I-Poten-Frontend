import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { markLastActivity } from "../../utils/activity.ts";

import potenWordMark from "../../assets/hero/PotenWord-mark.png";

import sampleLiquidGlass from "../../assets/wordcards/liquid-glass.png";
import sampleAgenticAI from "../../assets/wordcards/agentic-ai.png";
import sampleGoldenPath from "../../assets/wordcards/golden-path.png";
import sampleIDP from "../../assets/wordcards/idp.png";
import sampleAgentOps from "../../assets/wordcards/agent-ops.jpg";
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
type JobGroup = {
    key: string;
    title: string;
    desc: string;
};
type JobRecommendedTerm = {
    termId: number | null;
    title: string;
    description: string;
};

type NewArrivalItem = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
};

function buildCardSearchQuery(title: string) {
    const raw = String(title ?? "").trim();
    if (!raw) return "";

    const withoutParen = raw.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
    return withoutParen || raw;
}

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
        id: "agent-ops",
        title: "AgentOps",
        description:
            "LLM 에이전트를 운영 가능한 서비스로 만들기 위한 운영 체계입니다. 실행 로그·비용·지연시간·실패 재시도를 관측하고 가드레일로 안전하게 통제합니다.",
        imageUrl: sampleAgentOps,
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
        id: "sbom",
        title: "SBOM(Software Bill of Materials)",
        description:
            "소프트웨어에 포함된 라이브러리와 버전 목록을 문서화한 구성요소 명세입니다. 취약점(CVE) 대응 시 영향 범위를 빠르게 파악하고 패치를 우선순위화합니다.",
        imageUrl: sampleSBOM,
    },
    {
        id: "platform-engineering",
        title: "Platform Engineering",
        description:
            "개발자 경험을 높이기 위해 공통 인프라를 셀프서비스 플랫폼으로 제공하는 분야입니다. 표준 템플릿과 골든 패스로 빠르고 안전한 개발 흐름을 만듭니다.",
        imageUrl: samplePlatformEngineering,
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

const ClickToHome: React.FC<ClickToHomeProps> = ({ to = "/learning/word", children }) => {
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

async function attachJobRecommendationToFolder(
    wordbookId: string,
    jobKey: string
) {
    const res = await http.post(
        `/me/folders/${wordbookId}/recommended-terms/by-job`,
        { jobKey }
    );
    return res.data;
}

/** 단일/벌크 공용: 항상 :bulk 호출 */
function normalizeJobRecommendedTerms(payload: any): JobRecommendedTerm[] {
    const rawItems = Array.isArray(payload)
        ? payload
        : payload?.items ??
          payload?.content ??
          payload?.termList ??
          payload?.recommendedTerms ??
          payload?.terms ??
          payload?.data ??
          [];

    if (!Array.isArray(rawItems)) return [];

    return rawItems
        .map((item: any) => {
            if (typeof item === "string") {
                return {
                    termId: null,
                    title: item.trim(),
                    description: "",
                };
            }

            const rawId = item?.termId ?? item?.id ?? item?.term?.id ?? null;
            const termId = Number.isFinite(Number(rawId)) ? Number(rawId) : null;
            const title = String(
                item?.title ??
                    item?.termTitle ??
                    item?.name ??
                    item?.keyword ??
                    item?.term?.title ??
                    ""
            ).trim();
            const description = String(
                item?.description ?? item?.summary ?? item?.term?.description ?? ""
            ).trim();

            return { termId, title, description };
        })
        .filter((item: JobRecommendedTerm) => item.title);
}

async function fetchJobRecommendedTerms(jobKey: string) {
    const urls = [
        "/recommended-terms/by-job",
        "/word/recommended-terms/by-job",
        "/terms/recommended/by-job",
        "/terms/recommended-terms/by-job",
    ];

    let lastErr: any;

    for (const url of urls) {
        try {
            const res = await http.get(url, { params: { jobKey } });
            return normalizeJobRecommendedTerms(res.data);
        } catch (err: any) {
            lastErr = err;
            if (err?.response?.status !== 404) throw err;
        }
    }

    throw lastErr;
}

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

const PaginationRow = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 6px;
    width: fit-content;
    margin: 0 auto;
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

    font-weight: 700;
    letter-spacing: -0.01em;
    cursor: pointer;

    color: ${({ $active }) => ($active ? "#fff" : "rgba(15,23,42,0.70)")};
    background: ${({ $active }) => ($active ? UI.color.primaryStrong : "transparent")};

    transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

    &:hover {
        background: ${({ $active }) => ($active ? UI.color.primaryStrong : "rgba(255,255,255,0.85)")};
        color: ${({ $active }) => ($active ? "#fff" : "#0f172a")};
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,0.22);
    }
`;

const PageNavBtn = styled(PagePill)<{ disabled?: boolean }>`
    padding: 0 10px;
    color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : "rgba(15,23,42,0.70)")};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    &:hover {
        background: ${({ disabled }) => (disabled ? "transparent" : "rgba(255,255,255,0.85)")};
        color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : "#0f172a")};
    }

    &:active {
        transform: ${({ disabled }) => (disabled ? "none" : "translateY(1px)")};
    }
`;

const PageEllipsis = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 34px;
    padding: 0 4px;
    color: rgba(15, 23, 42, 0.5);
    font-weight: 700;
    letter-spacing: -0.01em;
    user-select: none;
`;

const BottomGrid = styled.div`
    width: 100%;
    margin-top: 16px;
    display: flex;
    justify-content: center;
`;

const Pagination: React.FC<PaginationProps> = ({ page, size, total, onChange }) => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / (size || 1)));
    const WINDOW_SIZE = 5;

    const current = Math.max(0, Math.min(page, totalPages - 1));

    const clampWindowStart = (start: number) => {
        const maxStart = Math.max(0, totalPages - WINDOW_SIZE);
        return Math.max(0, Math.min(start, maxStart));
    };

    const pageWindowStart = clampWindowStart(
        Math.floor(current / WINDOW_SIZE) * WINDOW_SIZE
    );

    const pageWindowEnd = Math.min(totalPages - 1, pageWindowStart + WINDOW_SIZE - 1);

    const pageWindow = Array.from(
        { length: pageWindowEnd - pageWindowStart + 1 },
        (_, i) => pageWindowStart + i
    );

    const firstVisiblePage = pageWindow[0] ?? 0;
    const lastVisiblePage = pageWindow[pageWindow.length - 1] ?? 0;

    const showFirstPage = firstVisiblePage > 0;
    const showLeadingEllipsis = firstVisiblePage > 1;

    const showTrailingEllipsis = lastVisiblePage < totalPages - 2;
    const showLastPage = lastVisiblePage < totalPages - 1;

    const visiblePages = pageWindow.filter((p) => {
        if (showFirstPage && p === 0) return false;
        if (showLastPage && p === totalPages - 1) return false;
        return true;
    });

    const goFirstPage = () => {
        if (current === 0) return;
        onChange(0);
    };

    const goLastPage = () => {
        if (current === totalPages - 1) return;
        onChange(totalPages - 1);
    };

    const goPrevWindow = () => {
        const prevStart = clampWindowStart(pageWindowStart - WINDOW_SIZE);
        if (prevStart === pageWindowStart) return;
        onChange(prevStart);
    };

    const goNextWindow = () => {
        const nextStart = clampWindowStart(pageWindowStart + WINDOW_SIZE);
        if (nextStart === pageWindowStart) return;
        onChange(nextStart);
    };

    return (
        <BottomGrid>
            <PaginationRow>
                <PaginationBar aria-label="검색 결과 페이지 이동">
                    <PageNavBtn
                        onClick={goPrevWindow}
                        disabled={pageWindowStart === 0}
                        aria-label="이전 페이지 묶음"
                        type="button"
                    >
                        ‹
                    </PageNavBtn>

                    {showFirstPage && (
                        <PagePill
                            $active={current === 0}
                            onClick={goFirstPage}
                            aria-current={current === 0 ? "page" : undefined}
                            aria-label="1페이지"
                            type="button"
                        >
                            1
                        </PagePill>
                    )}

                    {showLeadingEllipsis && (
                        <PageEllipsis aria-hidden="true">...</PageEllipsis>
                    )}

                    {visiblePages.map((p) => (
                        <PagePill
                            key={p}
                            $active={p === current}
                            onClick={() => onChange(p)}
                            aria-current={p === current ? "page" : undefined}
                            aria-label={`${p + 1}페이지`}
                            type="button"
                        >
                            {p + 1}
                        </PagePill>
                    ))}

                    {showTrailingEllipsis && (
                        <PageEllipsis aria-hidden="true">...</PageEllipsis>
                    )}

                    {showLastPage && (
                        <PagePill
                            $active={current === totalPages - 1}
                            onClick={goLastPage}
                            aria-current={current === totalPages - 1 ? "page" : undefined}
                            aria-label={`${totalPages}페이지`}
                            type="button"
                        >
                            {totalPages}
                        </PagePill>
                    )}

                    <PageNavBtn
                        onClick={goNextWindow}
                        disabled={pageWindowEnd >= totalPages - 1}
                        aria-label="다음 페이지 묶음"
                        type="button"
                    >
                        ›
                    </PageNavBtn>
                </PaginationBar>
            </PaginationRow>
        </BottomGrid>
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

const SelectAllBtn = styled.button<{ $on?: boolean }>`
    border: 0;
    background: transparent;
    padding: 4px 6px;
    margin: 0;

    display: inline-flex;
    align-items: center;
    gap: 10px;

    color: #0f172a;
    font-size: 15px;

    font-weight: 600;

    letter-spacing: -0.02em;
    line-height: 1.1;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1;

    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.22);
        border-radius: 10px;
    }
`;

const SelectAllBox = styled.span<{ $on?: boolean }>`
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;

    line-height: 0;
    overflow: hidden;

    border: 1.5px solid ${({ $on }) => ($on ? UI.color.primaryStrong : "rgba(15, 23, 42, 0.35)")};
    background: ${({ $on }) => ($on ? UI.color.primaryStrong : "#fff")};
    box-shadow: ${({ $on }) =>
            $on
                    ? `
        inset 0 0 0 1px rgba(255,255,255,0.18),
        inset 0 -1px 0 rgba(0,0,0,0.18)
      `
                    : "none"};

    transition: transform 80ms ease, filter 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;

    ${({ $on }) =>
            $on &&
            css`
      border: 0;
      background: ${UI.gradient.brand};
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);

      contain: paint;
      backface-visibility: hidden;
      -webkit-tap-highlight-color: transparent;

      ${SelectAllBtn}:hover & {
        filter: brightness(0.98);
      }
      ${SelectAllBtn}:active & {
        transform: scale(0.97);
      }
    `}

    svg {
        display: block;
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

const JOB_GROUPS: JobGroup[] = [
    {
        key: "FRONTEND",
        title: "Frontend",
        desc: "HTML/CSS부터 상태관리까지\n프론트엔드 필수 100",
    },
    {
        key: "BACKEND",
        title: "Backend",
        desc: "HTTP부터 트랜잭션까지\n백엔드 필수 100",
    },
    {
        key: "DATABASE",
        title: "Database",
        desc: "정규화부터 트랜잭션까지\n데이터베이스 필수 100",
    },
    {
        key: "NETWORK",
        title: "Network",
        desc: "OSI 7계층부터 HTTP까지\n네트워크 필수 100",
    },
    {
        key: "OS",
        title: "Operating System",
        desc: "프로세스부터 스레드까지\n운영체제 필수 100",
    },
    {
        key: "DSA",
        title: "Data Structure & Algorithm",
        desc: "자료구조·알고리즘 필수 100",
    },
    {
        key: "SECURITY",
        title: "Security",
        desc: "인증부터 암호화까지\n보안 필수 100",
    },
    {
        key: "SE",
        title: "Software Engineering",
        desc: "요구분석부터 테스트까지\n소프트웨어 공학 필수 100",
    },
    {
        key: "DEVOPS",
        title: "DevOps / Cloud",
        desc: "CI/CD부터 컨테이너까지\nDevOps·클라우드 필수 100",
    },
    {
        key: "CS",
        title: "Computer Science",
        desc: "컴퓨터 구조부터 계산 이론까지\n컴퓨터 공학 필수 100",
    },
    {
        key: "AI",
        title: "AI / Data / Machine Learning",
        desc: "회귀부터 딥러닝까지 AI·데이터·머신러닝 필수 100",
    },
    {
        key: "EMBEDDED",
        title: "Embedded / IoT / System Programming",
        desc: "임베디드·IoT·시스템 프로그래밍 필수 100",
    },
];

export default function SearchPage() {
    const [params] = useSearchParams();
    const navType = useNavigationType();
    const navigate = useNavigate();

    // 직무 추천 포텐워드 저장용 모달 상태
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobGroup | null>(null);
    const [jobTermsOpen, setJobTermsOpen] = useState(false);
    const [jobTermsLoading, setJobTermsLoading] = useState(false);
    const [jobTermsError, setJobTermsError] = useState<string | null>(null);
    const [jobTerms, setJobTerms] = useState<JobRecommendedTerm[]>([]);
    const [jobTermsJob, setJobTermsJob] = useState<JobGroup | null>(null);

// 모달 상태
    const [moveOpen, setMoveOpen] = useState(false);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
    const [pendingTermIds, setPendingTermIds] = useState<number[] | null>(null);
    const [saving, setSaving] = useState(false);
    const [savedEver, setSavedEver] = useState<Set<number>>(new Set());

// 시스템 메시지 모달 상태
    const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(null);
    const [systemOpen, setSystemOpen] = useState(false);
    const systemTimerRef = useRef<number | null>(null);

    const showMessage = useCallback(
        (msg: SystemMessage) => {
            if (systemTimerRef.current) {
                window.clearTimeout(systemTimerRef.current);
                systemTimerRef.current = null;
            }

            const hasBlockingModal = moveOpen || noteModalOpen || jobTermsOpen;

            if (hasBlockingModal) {
                setMoveOpen(false);
                setNoteModalOpen(false);
                setJobTermsOpen(false);

                systemTimerRef.current = window.setTimeout(() => {
                    setSystemMessage(msg);
                    setSystemOpen(true);
                    systemTimerRef.current = null;
                }, 220);

                return;
            }

            setSystemMessage(msg);
            setSystemOpen(true);
        },
        [moveOpen, noteModalOpen, jobTermsOpen]
    );

    useEffect(() => {
        return () => {
            if (systemTimerRef.current) {
                window.clearTimeout(systemTimerRef.current);
            }
        };
    }, []);

    const openLoginRequiredModal = useCallback(
        (
            description = "로그인하신 후 이용할 수 있어요.",
            loginUrl = "/login"
        ) => {
            showMessage({
                tone: "warning",
                title: "로그인이 필요합니다",
                description,
                actions: [
                    {
                        label: "닫기",
                        tone: "normal",
                        autoClose: true,
                    },
                    {
                        label: "로그인하러 가기",
                        tone: "primary",
                        onClick: () => navigate(loginUrl),
                        autoClose: true,
                    },
                ],
            });
        },
        [showMessage, navigate]
    );

    const isLoggedInForNoteAction = useCallback(() => {
        if (typeof window === "undefined") return false;
        return !!window.localStorage.getItem("isLoggedIn");
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

        markLastActivity();
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
            if (!isLoggedInForNoteAction()) {
                openLoginRequiredModal(
                    "로그인하신 후 단어를 내 포텐노트에 저장할 수 있어요.",
                    "/vue-account/account/login"
                );
                return;
            }

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
                setMoveOpen(true);
            } catch (e: any) {
                if (e?.response?.status === 401) {
                    openLoginRequiredModal(
                        "로그인하신 후 단어를 내 포텐노트에 저장할 수 있어요.",
                        "/vue-account/account/login"
                    );
                    return;
                }
                setNotebooks([]);
                showMessage({
                    tone: "error",
                    title: "포텐노트를 불러오지 못했어요",
                    description: "잠시 후 다시 시도해 주세요.",
                });
            }
        },
        [selectedIds, isLoggedInForNoteAction, openLoginRequiredModal, showMessage]
    );

    /** 직무 저장 함수 */
    const handleJobPlusClick = useCallback(
        async (e: React.MouseEvent, job: JobGroup) => {
            e.stopPropagation();

            if (!isLoggedInForNoteAction()) {
                openLoginRequiredModal(
                    "로그인하신 후 직무별 추천 포텐워드를 내 포텐노트에 저장할 수 있어요.",
                    "/vue-account/account/login"
                );
                return;
            }

            setSelectedJob(job);

            try {
                const folders = await fetchUserFolders();
                setNotebooks(folders);
                setNoteModalOpen(true);
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    openLoginRequiredModal(
                        "로그인하신 후 직무별 추천 포텐워드를 내 포텐노트에 저장할 수 있어요.",
                        "/vue-account/account/login"
                    );
                    return;
                }
                console.error("[fetchUserFolders] 실패:", err);
                setNotebooks([]);
                showMessage({
                    tone: "error",
                    title: "포텐노트를 불러오지 못했어요",
                    description: "잠시 후 다시 시도해 주세요.",
                });
            }
        },
        [isLoggedInForNoteAction, openLoginRequiredModal, showMessage]
    );

    const openJobTermsModal = useCallback(async (job: JobGroup) => {
        setJobTermsJob(job);
        setJobTermsOpen(true);
        setJobTermsLoading(true);
        setJobTermsError(null);
        setJobTerms([]);

        try {
            const items = await fetchJobRecommendedTerms(job.key);
            setJobTerms(items);
        } catch (err) {
            console.error("[fetchJobRecommendedTerms] failed:", err);
            setJobTermsError("추천 단어 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        } finally {
            setJobTermsLoading(false);
        }
    }, []);

    const closeJobTermsModal = useCallback(() => {
        setJobTermsOpen(false);
        setJobTermsLoading(false);
        setJobTermsError(null);
        setJobTerms([]);
        setJobTermsJob(null);
    }, []);

    useEffect(() => {
        if (!jobTermsOpen || typeof document === "undefined") return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [jobTermsOpen]);

    const activeJobTermsJob = jobTermsJob;

    const jobTermsModal =
        jobTermsOpen && typeof document !== "undefined"
            ? createPortal(
                  <JobTermsModalBackdrop
                      role="dialog"
                      aria-modal="true"
                      aria-label={jobTermsJob ? `${jobTermsJob!.title} 추천 단어 목록` : "직무 추천 단어 목록"}
                      onClick={closeJobTermsModal}
                  >
                      <JobTermsModalCard onClick={(e) => e.stopPropagation()}>
                          <JobTermsModalHead>
                              <div>
                                  <JobTermsModalEyebrow>직무별 추천 포텐워드</JobTermsModalEyebrow>
                                  <JobTermsModalTitle>
                                      {jobTermsJob ? `${jobTermsJob!.title} 추천 단어` : "추천 단어"}
                                  </JobTermsModalTitle>
                                  <JobTermsModalDesc>
                                      마음에 드는 단어만 개별로 저장하거나, 오른쪽 상단 버튼으로 직무 전체를 저장할 수 있어요.
                                  </JobTermsModalDesc>
                              </div>
                              <JobTermsHeaderActions>
                                  {jobTermsJob && (
                                      <JobTermsSaveAllButton
                                          type="button"
                                          onClick={(e) => {
                                              closeJobTermsModal();
                                              void handleJobPlusClick(e, jobTermsJob!);
                                          }}
                                      >
                                          전체 저장
                                      </JobTermsSaveAllButton>
                                  )}
                                  <JobTermsCloseButton
                                      type="button"
                                      onClick={closeJobTermsModal}
                                      aria-label="모달 닫기"
                                  >
                                      ×
                                  </JobTermsCloseButton>
                              </JobTermsHeaderActions>
                          </JobTermsModalHead>

                          <JobTermsModalBody>
                              {jobTermsLoading && <JobTermsState>추천 단어를 불러오는 중입니다.</JobTermsState>}

                              {!jobTermsLoading && jobTermsError && (
                                  <JobTermsState $error>{jobTermsError}</JobTermsState>
                              )}

                              {!jobTermsLoading && !jobTermsError && jobTerms.length === 0 && (
                                  <JobTermsState>표시할 추천 단어가 없어요.</JobTermsState>
                              )}

                              {!jobTermsLoading && !jobTermsError && jobTerms.length > 0 && (
                                  <JobTermsList>
                                      {jobTerms.map((term, idx) => (
                                          <JobTermsItem key={`${term.termId ?? term.title}-${idx}`}>
                                              <JobTermsItemMain>
                                                  <JobTermsItemTitle>{term.title}</JobTermsItemTitle>
                                                  {term.description && (
                                                      <JobTermsItemDesc>{term.description}</JobTermsItemDesc>
                                                  )}
                                              </JobTermsItemMain>
                                              <JobTermsItemAction
                                                  type="button"
                                                  disabled={!term.termId}
                                                  aria-label={
                                                      term.termId
                                                          ? `${term.title} 단어를 포텐노트에 저장`
                                                          : `${term.title} 단어는 저장할 수 없음`
                                                  }
                                                  title={term.termId ? "개별 저장" : "termId가 없어 저장할 수 없어요"}
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (!term.termId) return;
                                                      closeJobTermsModal();
                                                      void handleAddClick(term.termId);
                                                  }}
                                              >
                                                  +
                                              </JobTermsItemAction>
                                          </JobTermsItem>
                                      ))}
                                  </JobTermsList>
                              )}
                          </JobTermsModalBody>
                      </JobTermsModalCard>
                  </JobTermsModalBackdrop>,
                  document.body
              )
            : null;

    const handleSaveJobToNotebook = useCallback(
        async (wordbookId: string) => {
            if (!selectedJob || saving) return;

            try {
                setSaving(true);

                const jobTitle = selectedJob.title;

                const resData = await attachJobRecommendationToFolder(
                    wordbookId,
                    selectedJob.key
                );
                markLastActivity();

                const {
                    addedCount,
                    duplicateCount,
                    failedCount,
                } = parseBulkResult(resData);

                const addN = addedCount;
                const dupN = duplicateCount;
                const failN = failedCount;

                setSelectedJob(null);

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
                        description: `'${jobTitle}' 직무 추천 용어는 이미 내 포텐노트에 저장되어 있었어요.`,
                    });
                } else if (addN > 0 && dupN > 0) {
                    showMessage({
                        tone: "success",
                        title: "저장 완료",
                        description: `${addN}개 용어를 저장했고, ${dupN}개는 이미 저장된 항목이었어요.`,
                    });
                } else if (addN > 0) {
                    showMessage({
                        tone: "success",
                        title: "저장 완료",
                        description: `'${jobTitle}' 직무 추천 포텐워드를 ${addN}개 저장했어요.`,
                    });
                } else {
                    showMessage({
                        tone: "warning",
                        title: "저장된 항목이 없어요",
                        description: "이미 저장되어 있거나 처리할 수 없었어요.",
                    });
                    console.debug("[job-save] unexpected response:", resData);
                }
            } catch (err: any) {
                const s = err?.response?.status;

                if (s === 401) {
                    openLoginRequiredModal("로그인 세션이 만료되었어요. 다시 로그인한 후 저장해 주세요.");
                } else if (s === 403) {
                    showMessage({
                        tone: "warning",
                        title: "접근 권한이 없어요",
                        description: "해당 포텐노트에 저장할 권한이 없습니다.",
                    });
                } else if (s === 404) {
                    showMessage({
                        tone: "warning",
                        title: "대상을 찾을 수 없어요",
                        description: "폴더 또는 직무 추천 세트를 찾을 수 없습니다.",
                    });
                } else {
                    showMessage({
                        tone: "error",
                        title: "저장 중 오류가 발생했어요",
                        description: "잠시 후 다시 시도해 주세요.",
                    });
                }

                console.error("[attachJobGroupToFolder] 실패:", err);
            } finally {
                setSaving(false);
            }
        },
        [selectedJob, saving, showMessage, openLoginRequiredModal]
    );

    /** 액션바 '내 포텐노트에 저장하기' */
    const openBulkSave = useCallback(async () => {
        const ids = Array.from(selectedIds);

        if (ids.length === 0) {
            showMessage({
                tone: "info",
                title: "선택된 항목이 없어요",
                description: "먼저 저장할 단어를 선택해 주세요.",
            });
            return;
        }

        if (!isLoggedInForNoteAction()) {
            openLoginRequiredModal(
                "로그인하신 후 선택한 단어를 내 포텐노트에 저장할 수 있어요.",
                "/vue-account/account/login"
            );
            return;
        }

        setSelectedTermId(null);
        setPendingTermIds(ids);

        try {
            setNotebooks(await fetchUserFolders());
            setMoveOpen(true);
        } catch (e: any) {
            if (e?.response?.status === 401) {
                openLoginRequiredModal(
                    "로그인하신 후 선택한 단어를 내 포텐노트에 저장할 수 있어요.",
                    "/vue-account/account/login"
                );
                return;
            }
            setNotebooks([]);
            showMessage({
                tone: "error",
                title: "포텐노트를 불러오지 못했어요",
                description: "잠시 후 다시 시도해 주세요.",
            });
        }
    }, [selectedIds, showMessage, isLoggedInForNoteAction, openLoginRequiredModal]);

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
                    showMessage({
                        tone: "info",
                        title: "저장할 항목이 없어요",
                        description: "저장할 단어를 먼저 선택해 주세요.",
                    });
                    return;
                }

                const resData = await attachTermsBulk(notebookId, idsToSave);
                markLastActivity();
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
                    openLoginRequiredModal("로그인 세션이 만료되었어요. 다시 로그인한 후 저장해 주세요.");
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
        [pendingTermIds, selectedTermId, saving, clearAllSelected, savedEver, showMessage, openLoginRequiredModal]
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
            <PageRoot>
            <SoftBg />

            {/* ===== Landing Hero (검색) ===== */}
            <ClickToHome>
                <Wrapper>
                    <HeroWatermark aria-hidden="true">
                        <HeroWatermarkImg src={potenWordMark} alt="" />
                    </HeroWatermark>

                    <SearchSectionInView onVisible={() => setStartTypingPlaceholder(true)}>
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
                                    {results.length > 0 && (
                                        <SelectAllBtn
                                            type="button"
                                            onClick={toggleAllCurrentPage}
                                            aria-pressed={allChecked}
                                            aria-label={allChecked ? "현재 페이지 선택 해제" : "현재 페이지 전체 선택"}
                                            title={allChecked ? "현재 페이지 선택 해제" : "현재 페이지 전체 선택"}
                                            $on={allChecked}
                                        >
                                            <SelectAllBox $on={allChecked} aria-hidden="true">
                                                {allChecked ? <CheckIcon /> : null}
                                            </SelectAllBox> 전체 선택
                                        </SelectAllBtn>
                                    )}

                                    <Spacer />

                                    <Tail>
                                        총 <InfoStrongNum>{total.toLocaleString()}</InfoStrongNum>개 용어가 검색되었습니다.
                                    </Tail>
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
                                                                onRequireAuth={(message, loginUrl) => {
                                                                    openLoginRequiredModal(message, loginUrl);
                                                                }}
                                                            />
                                                        </AlignWithCheck>
                                                    </CardWrap>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                )}

                                {/* 페이지네이션 */}
                                {!loading && !error && results.length > 0 && total > 0 && (
                                    <Pagination
                                        page={page}
                                        size={size}
                                        total={total}
                                        onChange={handlePageChange}
                                    />
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
                    {false && (
                        <JobTermsModalBackdrop
                            role="dialog"
                            aria-modal="true"
                            aria-label={jobTermsJob ? `${jobTermsJob!.title} 추천 단어 목록` : "직무 추천 단어 목록"}
                            onClick={closeJobTermsModal}
                        >
                            <JobTermsModalCard onClick={(e) => e.stopPropagation()}>
                                <JobTermsModalHead>
                                    <div>
                                        <JobTermsModalEyebrow>직무별 추천 포텐워드</JobTermsModalEyebrow>
                                        <JobTermsModalTitle>
                                            {jobTermsJob ? `${jobTermsJob!.title} 추천 단어` : "추천 단어"}
                                        </JobTermsModalTitle>
                                        <JobTermsModalDesc>
                                            원하는 용어만 개별로 저장하거나, 우측 상단 버튼으로 직무 전체를 저장할 수 있어요.
                                        </JobTermsModalDesc>
                                    </div>
                                    <JobTermsHeaderActions>
                                        {jobTermsJob && (
                                            <JobTermsSaveAllButton
                                                type="button"
                                                onClick={(e) => {
                                                    closeJobTermsModal();
                                                    void handleJobPlusClick(e, jobTermsJob!);
                                                }}
                                            >
                                                전체 저장
                                            </JobTermsSaveAllButton>
                                        )}
                                        <JobTermsCloseButton
                                            type="button"
                                            onClick={closeJobTermsModal}
                                            aria-label="모달 닫기"
                                        >
                                            ×
                                        </JobTermsCloseButton>
                                    </JobTermsHeaderActions>
                                </JobTermsModalHead>

                                <JobTermsModalBody>
                                    {jobTermsLoading && <JobTermsState>추천 단어를 불러오는 중입니다.</JobTermsState>}

                                    {!jobTermsLoading && jobTermsError && (
                                        <JobTermsState $error>{jobTermsError}</JobTermsState>
                                    )}

                                    {!jobTermsLoading && !jobTermsError && jobTerms.length === 0 && (
                                        <JobTermsState>표시할 추천 단어가 없어요.</JobTermsState>
                                    )}

                                    {!jobTermsLoading && !jobTermsError && jobTerms.length > 0 && (
                                        <JobTermsList>
                                            {jobTerms.map((term, idx) => (
                                                <JobTermsItem key={`${term.termId ?? term.title}-${idx}`}>
                                                    <JobTermsItemMain>
                                                        <JobTermsItemTitle>{term.title}</JobTermsItemTitle>
                                                        {term.description && (
                                                            <JobTermsItemDesc>{term.description}</JobTermsItemDesc>
                                                        )}
                                                    </JobTermsItemMain>
                                                    <JobTermsItemAction
                                                        type="button"
                                                        disabled={!term.termId}
                                                        aria-label={
                                                            term.termId
                                                                ? `${term.title} 용어를 내 포텐노트에 저장`
                                                                : `${term.title} 용어는 저장할 수 없음`
                                                        }
                                                        title={term.termId ? "개별 저장" : "termId가 없어 저장할 수 없어요"}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!term.termId) return;
                                                            closeJobTermsModal();
                                                            void handleAddClick(term.termId);
                                                        }}
                                                    >
                                                        +
                                                    </JobTermsItemAction>
                                                </JobTermsItem>
                                            ))}
                                        </JobTermsList>
                                    )}
                                </JobTermsModalBody>
                            </JobTermsModalCard>
                        </JobTermsModalBackdrop>
                    )}

                    {jobTermsModal}

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
                            markLastActivity();
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
                            sp.set("q", buildCardSearchQuery(item.title));
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

                    <TopSection>
                        <SubTitle>
                            지금 어느 직무를 준비 중이신가요?
                        </SubTitle>
                        <Title>
                            직무별 추천 <span className="highlight">포텐워드</span>를 나만의 <span className="highlight">포텐노트</span>에 빠르게 저장해 보세요
                        </Title>
                    </TopSection>

                    <JobSection>
                        <JobGridInView>
                            {JOB_GROUPS.map((job) => (
                                <JobCard
                                    key={job.key}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openJobTermsModal(job)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            void openJobTermsModal(job);
                                        }
                                    }}
                                >
                                    <JobCardHeader>
                                        <JobTitle>{job.title}</JobTitle>
                                        <JobPlusCircle
                                            type="button"
                                            onClick={(e) => handleJobPlusClick(e, job)}
                                            aria-label={`${job.title} 직무 추천 포텐워드를 내 포텐노트에 저장`}
                                        >
                                            <span>+</span>
                                        </JobPlusCircle>
                                    </JobCardHeader>
                                    <JobDesc>{job.desc}</JobDesc>
                                </JobCard>
                            ))}
                        </JobGridInView>
                    </JobSection>

                    {/* 직무별 내 포텐노트 저장 모달 */}
                    <PotenNoteModal
                        open={noteModalOpen}
                        notebooks={notebooks}
                        onClose={() => {
                            setNoteModalOpen(false);
                            setSelectedJob(null);
                        }}
                        onSave={handleSaveJobToNotebook}

                        onCreate={async (name) => {
                            // 1) 폴더 생성만
                            const { data: wb } = await http.post("/me/folders", { wordbookName: name });
                            const newId = String(wb.id);

                            // 2) UI 갱신
                            const newName = wb.wordbookName ?? name;
                            setNotebooks((prev) => [{ id: newId, name: newName }, ...prev]);
                            markLastActivity();

                            // 3) 여기서 attach 호출하지 않음
                            // (저장은 사용자가 "저장하기" 누를 때 onSave에서만)

                            return newId; // 모달이 이 값을 받아서 "선택" 처리할 수 있게
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
                        onGoToFolder={() => {
                            setNoteModalOpen(false);
                        }}
                        onRename={async (wordbookId, newName) => {
                            await renameUserFolder(wordbookId, newName);
                            setNotebooks(prev =>
                                prev.map(n => n.id === wordbookId ? ({ ...n, name: newName }) : n)
                            );
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
                </>
            )}
            {/* 시스템 메시지 모달 */}
            <SystemMessageModal
                open={systemOpen}
                message={systemMessage}
                onClose={() => {
                    setSystemOpen(false);
                    setSystemMessage(null);
                }}
            />
            </PageRoot>
        </>
    );
}

/** =========================
 *  Styled (Landing + Layout)
 *  ========================= */
const PageRoot = styled.div`
    font-family:
            "Pretendard Variable",
            "Pretendard",
            -apple-system,
            BlinkMacSystemFont,
            "Apple SD Gothic Neo",
            "Noto Sans KR",
            "Segoe UI",
            sans-serif;
`;

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
    font-weight: 700;
    letter-spacing: -0.015em;
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
`;

const SquareDesc = styled.p`
    margin: 0;

    font-family:
            "Pretendard Variable",
            "Pretendard",
            -apple-system,
            BlinkMacSystemFont,
            "Apple SD Gothic Neo",
            "Noto Sans KR",
            "Segoe UI",
            sans-serif;
    font-weight: 300;
    font-size: 15px;
    line-height: 1.55;
    letter-spacing: -0.01em;

    opacity: 0.92;
    text-shadow: 0 6px 18px rgba(0, 0, 0, 0.42);
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

const JobTermsModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  background: rgba(15, 23, 42, 0.56);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const JobTermsModalCard = styled.div`
  width: min(760px, 100%);
  max-height: min(80vh, 760px);
  overflow: hidden;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.24);
  display: flex;
  flex-direction: column;
`;

const JobTermsModalHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 18px;
  border-bottom: 1px solid #e5e7eb;
`;

const JobTermsModalEyebrow = styled.div`
    font-size: 12px;
    font-weight: 800;
    color: #4f76f1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family:
            "Pretendard Variable",
            "Pretendard",
            -apple-system,
            BlinkMacSystemFont,
            "Apple SD Gothic Neo",
            "Noto Sans KR",
            "Segoe UI",
            sans-serif;
`;

const JobTermsModalTitle = styled.h3`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #0f172a;
`;

const JobTermsModalDesc = styled.p`
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: -0.02em;
  color: #475569;
`;

const JobTermsHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const JobTermsCloseButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #0f172a;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
`;

const JobTermsSaveAllButton = styled.button`
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    background: ${UI.gradient.brand};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    cursor: pointer;
`;

const JobTermsModalBody = styled.div`
  padding: 16px 24px 24px;
  overflow: auto;
`;

const JobTermsState = styled.div<{ $error?: boolean }>`
  padding: 24px 4px;
  text-align: center;
  color: ${({ $error }) => ($error ? "#dc2626" : "#64748b")};
  font-size: 15px;
  line-height: 1.6;
`;

const JobTermsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const JobTermsItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
`;

const JobTermsItemMain = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const JobTermsItemTitle = styled.h4`
    margin: 0;
    color: #0f172a;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.015em;
`;

const JobTermsItemDesc = styled.p`
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: -0.02em;
`;

const JobTermsItemAction = styled.button`
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 999px;
    background: ${UI.gradient.brand};
    color: #fff;
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:disabled {
        cursor: not-allowed;
        background: #cbd5e1;
        color: #f8fafc;
    }
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
    font-weight: 700;
    letter-spacing: -0.015em;
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
    font-weight: 500;
    line-height: 1.12;
    letter-spacing: -0.02em;
    color: #0f172a;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 640px) {
        font-size: 17px;
        font-weight: 500;
        line-height: 1.15;
        letter-spacing: -0.015em;
    }
`;

const TopSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
    margin-bottom: 60px;
`;

const SubTitle = styled.div`
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 5px;
    letter-spacing: -0.02em;

    opacity: 0;
    animation: ${fadeUp} 0.5s ease forwards;
    animation-delay: 0.05s;
`;

const Title = styled.div`
    font-size: 36px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    letter-spacing: -0.02em;
    word-break: keep-all;

    .highlight {
        background: linear-gradient(90deg, #3a83f3, #11b884);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.18s;
`;

const Cards = styled.div`
    width: 100%;
    max-width: 1100px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`;

const CardTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #111827;
    letter-spacing: -.02em;
    transition: color .25s ease;
`;

const CardDesc = styled.div`
    font-size: 15px;
    color: #6b7280;
    line-height: 1.5;
    height: 60px;
    letter-spacing: -.02em;
    transition: color .25s ease;
    word-break: keep-all;
`;

const CardFooter = styled.div`
    margin-top: 22px;
    font-family: "GhanaChocolate", sans-serif;
    font-size: 30px;
    color: #4f76f1;
    letter-spacing: -.02em;
    transition: color .25s ease;
`;

const CardIcon = styled.div`
    width: 58px;
    height: 58px;
    border-radius: 50%;
    margin: 0 auto 20px auto;
    background: #5174E7;
    display: flex;
    align-items: center;
    justify-content: center;

    color: #ffffff;
    transition: all .25s ease;

    svg {
        width: 28px;
        height: 28px;
        stroke: currentColor;
    }
`;

const Card = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    transition:
            background .35s ease,
            transform .35s cubic-bezier(.16,1,.3,1),
            box-shadow .35s ease,
            border .35s ease;
    border: 1px solid rgba(0,0,0,0.05);

    opacity: 0;
    animation: ${fadeUp} 0.6s ease forwards;

    cursor: pointer;

    &:nth-child(1) { animation-delay: 0.28s; }
    &:nth-child(2) { animation-delay: 0.43s; }
    &:nth-child(3) { animation-delay: 0.58s; }

    &:hover {
        background: #5174E7;
        transform: translateY(-6px) scale(1.03);
        border-color: rgba(81, 116, 231, 0.5);
    }

    &:hover ${CardTitle},
    &:hover ${CardDesc},
    &:hover ${CardFooter} {
        color: #ffffff;
    }

    &:hover ${CardIcon} {
        background: #ffffff;
        color: #5174E7;
    }
`;


const JobSection = styled.section`
    width: 100%;
    max-width: 1100px;
    margin-top: 24px;
    margin-bottom: 40px;
`;

const JobCardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const JobCard = styled.div<{ $visible?: boolean; $row?: number }>`
    background: #ffffff;
    border-radius: 28px;
    padding: 22px 22px 20px;
    box-shadow: 0 10px 32px rgba(15, 23, 42, 0.08);
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    /* 인뷰 등장 애니메이션 (줄 단위 딜레이) */
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transform: ${({ $visible }) =>
    $visible ? "translateY(0px)" : "translateY(18px)"};
    transition:
            opacity 0.55s ease,
            transform 0.55s cubic-bezier(.16,1,.3,1),
            box-shadow 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease;
    transition-delay: ${({ $visible, $row }) =>
    $visible ? `${0.08 * (($row ?? 0))}s` : "0s"};

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.14);
        border-color: rgba(79, 118, 241, 0.7);
        background: #f9fbff;
    }
`;

const JobCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 10px;
`;

const JobTitle = styled.h4`
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
    word-break: keep-all;
`;

const JobPlusCircle = styled.button`
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #4f76f1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 6px 16px rgba(79, 118, 241, 0.18);

    border: 0;
    padding: 0;
    cursor: pointer;

    span {
        color: #ffffff;
        font-size: 20px;
        line-height: 1;
        margin-top: -1px;
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.35);
    }
`;

const JobDesc = styled.p`
    margin: 0;
    margin-top: 4px;
    font-size: 15px;
    color: #4b5563;
    line-height: 1.5;
    letter-spacing: -0.02em;
    white-space: pre-line;
`;

/** 직무 카드 그리드용 인뷰 래퍼 */
type JobGridInViewProps = {
    children: React.ReactNode;
};

const JobGridInView: React.FC<JobGridInViewProps> = ({ children }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }

        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target !== node) return;
                    setVisible(entry.isIntersecting);
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const columnsPerRow = 3;

    return (
        <JobCardGrid ref={ref}>
            {React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) return child;

                const row = Math.floor(index / columnsPerRow);

                return React.cloneElement(child as React.ReactElement<any>, {
                    $visible: visible,
                    $row: row,
                });
            })}
        </JobCardGrid>
    );
};
