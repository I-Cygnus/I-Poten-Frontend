import React from "react";
import { NarrowLeft } from "../../styles/layout.ts";
import styled from "styled-components";
import { useParams, useNavigate, useLocation, useSearchParams, useNavigationType } from "react-router-dom";
import http, { authHeader } from "../../utils/http.ts";
import PotenNoteModal from "../../components/note/PotenNoteModal.tsx";
import { SelectToggleChip } from "../../components/common/SelectToggleChip";
import { fetchUserFolders, patchReorderFolders } from "../../api/wordbook.ts";
import TermCard from "../../components/word/TermCard.tsx";
import { setMemorization, fetchMemorizationStatuses } from "../../api/memorization.ts";
import {moveFolderTerms, removeFolderTerms} from "../../api/wordbookTerms.ts";
import { renameUserFolder, deleteUserFolder } from "../../api/folder.ts";
import { generatePdfByTermIds } from "../../api/ebook.ts";
import { saveBlob } from "../../utils/download.ts";
import { sanitizeFilename } from "../../utils/cdFilename.ts";
import { goToAccountLogin } from "../../utils/auth.ts";
import SystemMessageModal, { SystemMessage } from "../../components/common/SystemMessageModal.tsx";
import LearningPageHeader from "../../components/common/LearningPageHeader.tsx";
// import { startQuizUnified } from "../api/quiz";

/** 서버 응답에서 안전하게 뽑아둘 필드들 */
type TermRow = any;
type TermItem = {
    uwtId: string;
    termId: string | null;
    title: string;
    description: string;
    createdAt?: string;
    tags?: string[];
};

type Notebook = { id: string; name: string };
// 전체 보기 모드: 상속/전체숨김/전체표시
type ViewMode = "inherit" | "allHidden" | "allShown";

const UI = {
    color: {
        bg: "#ffffff",
        panel: "#f8fafc",
        text: "#111827",
        sub: "#374151",
        muted: "#6b7280",
        line: "#e5e7eb",
        indigo: "#6366f1",
        indigo50: "#eef2ff",
        indigo200: "#c7d2fe",
        primary: "#4F76F1",
        primaryStrong: "#3E63E0",
        danger: "#ef4444",
        quizHover: "#2c73e5",
    },
    gradient: {
        brand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
        brandSoft:
            "linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%)",
        quizCta: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
    },
    radius: { xl: 20, lg: 14, md: 12, sm: 10, pill: 999 },
    shadow: {
        card: "0 1px 0 rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.06)",
        bar: "0 6px 20px rgba(0,0,0,0.06)",
        menu: "0 8px 24px rgba(0,0,0,0.12)",
    },
    space: (n: number) => `${n}px`,
    font: { h2: "22px", body: "15px", tiny: "12px" },
};

/* ---------- 상단 툴바 ---------- */
const ChipRow = styled.div` display:flex; flex-wrap:wrap; gap:10px; align-items:center; `;

const Count = styled.span`
    margin-left: 8px;
    font-size: ${UI.font.body};
    font-weight: 400;
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
    line-height: 1;
`;

const HeaderMeta = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

/* ---------- 설정 버튼 + 메뉴 ---------- */

const PdfSubMenu = styled.div`
    position: absolute;
    top: 0;
    margin-top: 42px;

    right: 0;
    left: auto;
    width: 260px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;

    background: #fff;
    border: 1px solid ${UI.color.line};
    border-radius: 12px;
    box-shadow: ${UI.shadow.menu};
    padding: 8px 6px 6px;
    z-index: 20;
`;


const SettingsBtn = styled.button`
    height: 36px;
    padding: 0 12px;
    border-radius: ${UI.radius.sm}px;
    border-radius: ${UI.radius.pill}px;
    border: 1px solid ${UI.color.line};
    background: #f3f4f6;
    background: #f8fafc;
    color: ${UI.color.sub};
    font-weight: 700;
    cursor: pointer;
    transition: background-color 120ms ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    &:hover { background: #f1f5f9; }
`;

const RadioItem = styled.button<{ $checked?: boolean }>`
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover {
    background: #f9fafb;
  }
  & > span:first-child {
    display: inline-flex;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 2px solid ${UI.color.primaryStrong};
    background: ${({ $checked }) => ($checked ? UI.gradient.brand : "transparent")};
  }
`;

/* ---------- 리스트/카드 ---------- */
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
`;

const CHECK_W = 28;
const CHECK_GAP = 10;
const TITLE_SHIFT = CHECK_W + CHECK_GAP;

/** TermCard 내부의 + 버튼 숨김, 제목/설명 가리기, 연관 키워드 숨기기 */
const HideTermCardAdd = styled.div<{ $hideTitle?: boolean; $hideDesc?: boolean }>`
    /* TermCard 내부의 + 버튼 완전 숨김 (두 환경 라벨 모두 처리) */
    article [aria-label="내 단어장에 추가"],
    article [aria-label="내 포텐노트에 추가"] {
        display: none !important;
    }

    /* 제목은 항상 살짝 오른쪽으로 밀어 체크와 정렬 */
    article h3[id^="term-"] {
        margin-left: ${TITLE_SHIFT}px !important;
    }

  /* 제목 숨김 모드 */
  ${({ $hideTitle }) =>
    $hideTitle &&
    `
      article h3[id^="term-"]{
        position: relative;
        color: transparent !important;
        text-shadow: none !important;
        user-select: none;
      }
      article h3[id^="term-"]::selection { background: transparent; }
      article h3[id^="term-"]::after{
        content: "";
        position: absolute;
        left: -6px;
        right: -6px;
        top: -2px;
        bottom: -2px;
        background: ${UI.color.panel};
        border-radius: 10px;
        pointer-events: none;
      }
  `}

  ${({ $hideDesc }) =>
    $hideDesc &&
    `
      article > div:nth-of-type(2) { position: relative; }
      article > div:nth-of-type(2) p {
        color: transparent !important;
        text-shadow: none !important;
        user-select: none;
      }
      article > div:nth-of-type(2) p::selection { background: transparent; }
  `}

  article [aria-label="연관 키워드"] {
    display: none !important;
  }
`;

const CardWrap = styled.div`
  position: relative;
  border-radius: ${UI.radius.xl}px;
`;

/** 항상 보이는 좌측 체크(첨부칩 느낌) */
const SelectToggle = styled.button<{ $on?: boolean }>`
    position: absolute;
    top: 22px;
    left: 20px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
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

/* 비선택 점선도 동일 계열 파랑 */
const Hollow = styled.span`
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid ${UI.color.primaryStrong};
    background: rgba(255, 255, 255, 0.7);
    display: block;
`;

const MEMO_FILL = "#f2f8ff";  // 도형 내부
const MEMO_LINE = "#c7ddff";  // 윤곽선

/** 암기 상태 칩도 동일 톤으로 */
const StatusBtn = styled.button<{ $done?: boolean }>`
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;

    height: 28px;
    padding: 0 12px;
    border-radius: ${UI.radius.pill}px;

    border: 1px solid ${MEMO_LINE};
    background: ${({ $done }) => ($done ? MEMO_FILL : "#fff")};
    color: ${({ $done }) => ($done ? UI.color.primaryStrong : UI.color.muted)};

    font-size: ${UI.font.tiny};
    font-weight: 600;
    letter-spacing: -0.07em;
    cursor: pointer;

    transition: background-color .14s ease, border-color .14s ease, color .14s ease, transform .08s ease;

    &:hover {
        background: ${({ $done }) => ($done ? "#ECF4FF" : "#f9fafb")};
    }
    &:active { transform: scale(.97); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
    &:disabled { opacity: .7; cursor: not-allowed; }
`;

const LearnRow = styled.div`
    margin-top: 12px;
    margin-left: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
`;

const LearnLabel = styled.span`
    font-size: ${UI.font.tiny};
    font-weight: 700;
    color: ${UI.color.muted};
`;

const LearnSeg = styled.div`
    display: inline-flex;
    border: 1px solid ${UI.color.line};
    border-radius: ${UI.radius.sm}px;
    overflow: hidden;
`;

const LearnBtn = styled.button<{ $active?: boolean }>`
    height: 28px;
    padding: 0 10px;
    background: ${({ $active }) => ($active ? "rgba(79,118,241,0.10)" : "#fff")};
    color: ${({ $active }) => ($active ? UI.color.text : UI.color.sub)};
    border: 0;
    cursor: pointer;
    font-size: ${UI.font.tiny};
    font-weight: 700;
    &:hover {
        background: #f9fafb;
    }
`;

const Empty = styled.div`
    border: 1px dashed ${UI.color.line};
    border-radius: ${UI.radius.xl}px;
    padding: 32px;
    text-align: center;
    color: ${UI.color.muted};
`;

/* 하단 Export Tray */
const Tray = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 7;
  background: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  margin-top: 10px;
`;

/* ---------- Pagination ---------- */
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

    font-weight: 800;
    letter-spacing: -0.02em;
    cursor: pointer;

    color: ${({ $active }) => ($active ? "#fff" : "rgba(15,23,42,0.70)")};
    background: ${({ $active }) => ($active ? UI.color.primary : "transparent")};

    transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

    &:hover {
        background: ${({ $active }) => ($active ? UI.color.primary : "rgba(255,255,255,0.85)")};
        color: ${({ $active }) => ($active ? "#fff" : UI.color.text)};
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
        color: ${({ disabled }) => (disabled ? "rgba(15,23,42,0.28)" : UI.color.text)};
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
    font-weight: 800;
    letter-spacing: -0.02em;
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
                <PaginationBar aria-label="포텐노트 상세 페이지 이동">
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

/* ---------- Option Popup ---------- */
const MetaSep = styled.span`
  margin: 0 8px;
  color: ${UI.color.muted};
`;

const SortInlineWrap = styled.span`
    position: relative;
    display: inline-flex;
    align-items: center;
    isolation: isolate;   /* 내부 z-index를 독립시켜 안전하게 레이어링 */
`;

const SortInlineBtn = styled.button`
    position: relative;
    padding: 0 0px;                 /* 텍스트 간격만 살짝 */
    border: 0;
    background: transparent;
    font-size: ${UI.font.body};
    font-weight: 400;               /* Count와 동일 굵기 */
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
    cursor: pointer;
    line-height: 1;                 /* Count와 동일 라인 높이 */
    border-radius: ${UI.radius.pill}px;
    -webkit-tap-highlight-color: transparent;
    z-index: 0;

    /* 박스가 '생기는' 효과: 레이아웃 변화 없이 오버레이만 표시 */
    &::after {
        content: "";
        position: absolute;
        inset: -6px -10px;            /* 위아래/좌우 여백 */
        //border: 1px solid ${UI.color.line};
        background: #fafafa;
        border-radius: 10px;
        opacity: 0;
        transition: opacity 120ms ease;
        pointer-events: none;         /* 클릭 방해 X */
        z-index: -1;
        will-change: opacity;
    }

    &:hover::after,
    &:focus-visible::after,
    &[aria-expanded="true"]::after {
        opacity: 1;                   /* 호버/포커스/열림에 박스 표시 */
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,0.25); /* 키보드 접근성 */
    }
`;

const SortPopup = styled.div`
  position: absolute;
  top: 22px; /* 타이틀 라인의 아래쪽으로 */
  left: -8px;
  right: auto;
  min-width: 220px;
  background: #fff;
  border: 1px solid ${UI.color.line};
  border-radius: 12px;
  box-shadow: ${UI.shadow.menu};
  padding: 6px;
  z-index: 8;
`;

/* ---------- QuizCta ---------- */
const QuizCta = styled.button`
    position: relative;
    isolation: isolate;
    overflow: hidden;
    height: 42px;
    padding: 0 18px;
    border: 0;
    border-radius: 8px;
    background: ${UI.gradient.quizCta};
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.02em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.25);
    -webkit-tap-highlight-color: transparent;
    transition: transform 80ms ease;
    z-index: 0;                 /* 버튼 자체를 스택 컨텍스트 0으로 */

    /* 텍스트/아이콘은 항상 오버레이 위로 */
    & > * { position: relative; z-index: 1; }

    /* 왼→오 채우는 오버레이 */
    &::before{
        content: "";
        position: absolute;
        inset: 0;
        background: ${UI.color.quizHover};   /* #2c73e5 */
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 260ms ease;
        z-index: -1;              /* 오버레이를 텍스트 뒤로 */
        pointer-events: none;
        will-change: transform;
    }

    &:hover::before,
    &:focus-visible::before { transform: scaleX(1); }

    &:active { transform: scale(0.98); }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,.28);
    }

    @media (prefers-reduced-motion: reduce) {
        &::before{ transition: none; }
    }
`;


const PlusDot = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

/* ---------- Quiz Setup Modal ---------- */
const Scrim = styled.div`
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(15, 23, 42, .45);
    backdrop-filter: saturate(120%) blur(2px);
`;

const Sheet = styled.div`
    position: fixed; z-index: 1001;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: min(920px, calc(100% - 32px));
    max-height: min(84vh, calc(100vh - 32px));
    display: flex; flex-direction: column;
    background: #fff; border: 1px solid ${UI.color.line};
    border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,.18);
    overflow: hidden;
    --sheet-pad-x: 24px;
    /* 아이콘(36) + gap(12) = 48px 만큼 헤더만 추가 인덴트 */
    --sheet-header-indent: 48px;
`;

const SheetHeader = styled.div`
    position: relative;
    padding: 20px var(--sheet-pad-x) 16px;
    display:flex; align-items:center; gap:12px;
    border-bottom: 1px solid ${UI.color.line};
    background: linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
`;
const TitleWrap = styled.div`
    display:flex; flex-direction:column; gap:4px;
    h3{ margin:0; font-size:20px; letter-spacing:-0.02em; }
    small{ color:${UI.color.muted}; font-weight:400; }
`;
const CloseX = styled.button`
    margin-left:auto; border:0; background:transparent; cursor:pointer;
    width:34px; height:34px; border-radius:10px;
    display:grid; place-items:center; color:#6b7280;
    &:hover{ background:#f3f4f6; color:#111827; }
`;

const SheetBody = styled.div`
    padding: 18px var(--sheet-pad-x) 8px;
    overflow: auto;
    scrollbar-gutter: stable;
`;
const Section = styled.section`
    &:not(:first-child){ margin-top: 18px; }
    h4{ margin:0 0 10px; font-size:14px; color:#0f172a; letter-spacing:-0.02em; }
`;

const Cards2 = styled.div`
    display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
    @media (max-width: 720px){ grid-template-columns: 1fr; }
`;

const OptionCard = styled.button<{ $on?: boolean }>`
    text-align:left; padding:16px; border-radius:14px; cursor:pointer;
    border: 1px solid ${({$on}) => $on ? UI.color.indigo200 : UI.color.line};
    background: ${({$on}) => $on ? UI.color.indigo50 : "#fff"};
    display:flex; gap:12px; align-items:flex-start;
    transition: border-color 140ms ease, background-color 140ms ease, transform 80ms ease;
    &:hover{ background:#fafafa; }
    &:active{ transform: scale(.99); }
    h5{ margin:0 0 4px; font-size:15px; }
    p{ margin:0; color:${UI.color.muted}; font-size:13px; }
`;

const IconBox = styled.span`
    width:36px; height:36px; border-radius:10px;
    display:grid; place-items:center;
    background: ${UI.gradient.brandSoft};
    color: ${UI.color.primaryStrong};
    flex: 0 0 auto;
`;

const Chip = styled.button<{ $on?: boolean }>`
    height: 34px; padding: 0 14px; border-radius: 999px; font-weight:700; letter-spacing:-0.02em;
    border:1px solid ${({$on}) => $on ? UI.color.indigo200 : UI.color.line};
    background: ${({$on}) => $on ? UI.color.indigo50 : "#fff"};
    color: ${({$on}) => $on ? UI.color.primaryStrong : UI.color.text};
    cursor:pointer; &:hover{ background:#f9fafb; }
`;

const CountChip = styled(Chip)<{ $on?: boolean }>`
    /* 색상만 상태에 따라 바뀌게 */
    color: ${({ $on }) => ($on ? UI.color.primaryStrong : UI.color.muted)};
    font-weight: ${({ $on }) => ($on ? 700 : 500)};

    /* 부드러운 전환 */
    transition:
            background-color 140ms ease,
            border-color 140ms ease,
            color 140ms ease,
            box-shadow 140ms ease,
            transform 80ms ease;
    will-change: background-color, border-color, color, transform;
    -webkit-tap-highlight-color: transparent;

    /* 선택/비선택 각각 자연스러운 hover 색 */
    &:hover {
        background: ${({ $on }) => ($on ? "#e6edff" : "#f9fafb")};
    }

    /* 클릭 프레스 감(부드러운 누름) */
    &:active {
        transform: scale(0.98);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,0.25);
    }
`;

const Select = styled.select`
    box-sizing: border-box;     /* 패딩 포함해 overflow 방지 */
    height: 38px;               /* CatBtn과 높이 맞춤 */
    width: 100%;                /* 부모 폭을 꽉 채움 */
    min-width: 0;               /* 기존 320px 제거 -> 그리드 칼럼폭에 맞게 */
    padding: 0 12px;
    border-radius: 12px;
    border:1px solid ${UI.color.line};
    background:#fff;
    font-weight:400;
    color:#374151;
    letter-spacing: -0.02em;
`;

/* ---------- Fancy Folder/Category Dropdown ---------- */

const DDWrap = styled.div`
  position: relative;
`;

const DDTrigger = styled.button<{ $hasValue?: boolean }>`
  width: 100%;
  height: 38px;
  border-radius: 12px;
  border: 1px solid ${UI.color.line};
  background: #fff;
  padding: 0 36px 0 12px;
  text-align: left;
  font-size: 14px;
  font-weight: ${({ $hasValue }) => ($hasValue ? 600 : 500)};
  letter-spacing: -0.02em;
  color: ${({ $hasValue }) => ($hasValue ? UI.color.text : UI.color.muted)};
  cursor: pointer;
  transition: box-shadow .15s ease, border-color .15s ease, transform .08s ease, background .12s ease;
  &:hover { background: #f9fafb; }
  &:active { transform: translateY(1px); }
  &:focus-visible {
    outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25);
    border-color: ${UI.color.primaryStrong};
  }
`;

// 캐럿 회전
const DDCaret = styled.span<{ $open?: boolean }>`
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%) rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  transition: transform .18s ease;
  pointer-events: none; color: ${UI.color.muted};
  & svg { display:block }
`;

// '지우기' 버튼
const DDClear = styled.button`
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px; height: 22px;
  border: 0; background: transparent; color: ${UI.color.muted};
  border-radius: 999px; cursor: pointer;
  transition: background .12s ease, color .12s ease, transform .08s ease;
  &:hover { background: #f3f4f6; color: ${UI.color.sub}; }
  &:active { transform: translateY(-50%) scale(.96); }
`;

const DDPanel = styled.div`
  position: absolute; top: calc(100% + 6px); left: 0;
  width: min(100%, 520px);
  max-width: 100%;
  max-height: 320px;
  border: 1px solid ${UI.color.line};
  border-radius: 12px;
  background: #fff;
  box-shadow: ${UI.shadow.menu};
  overflow: hidden;
  z-index: 12;
  animation: dd-pop .12s ease;
  @keyframes dd-pop {
    from { opacity: .6; transform: translateY(-2px) scale(.98); }
    to   { opacity: 1;  transform: translateY(0)    scale(1); }
  }
`;

// 검색영역 + 아이콘
const DDSearchWrap = styled.div`
  position: relative;
  border-bottom: 1px solid ${UI.color.line};
  background: #fafafa;
`;

const DDSearchIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${UI.color.muted};
  pointer-events: none;
  & svg { display:block; }
`;

// 기존 DDSearch 개선
const DDSearch = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 12px 0 32px;
  border: 0;
  background: transparent;
  font-size: 14px;
  letter-spacing: -0.01em;
  &:focus { outline: none; background: #f6f8fb; }
`;

// 스크롤 섀도우 컨테이너
const DDListWrap = styled.div<{ $top?: boolean; $bot?: boolean }>`
  position: relative;
  &::before, &::after {
    content: "";
    position: absolute;
    left: 0; right: 0;
    height: 12px;
    pointer-events: none;
    transition: opacity .15s ease;
    z-index: 1;
  }
  &::before {
    top: 0;
    background: linear-gradient(#fff, rgba(255,255,255,0));
    opacity: ${({ $top }) => ($top ? 1 : 0)};
  }
  &::after {
    bottom: 0;
    background: linear-gradient(rgba(255,255,255,0), #fff);
    opacity: ${({ $bot }) => ($bot ? 1 : 0)};
  }
`;

const DDList = styled.div`
  position: relative;
  max-height: 280px; overflow: auto;
  scrollbar-gutter: stable;
`;

// 항목 (depth2 인디케이터 + mark 하이라이트)
const DDItem = styled.button<{ $active?: boolean; $selected?: boolean; $depth2?: boolean }>`
  width: 100%; text-align: left; border: 0; background: transparent;
  display: grid; grid-template-columns: 1fr auto; align-items: center;
  padding: 10px 12px; cursor: pointer;
  color: ${UI.color.text}; letter-spacing:-0.01em;
  transition: background-color .12s ease;
  ${({ $active }) => $active && `background:#f9fafb;`}
  ${({ $selected }) => $selected && `
    background: ${UI.color.indigo50};
    color: ${UI.color.primaryStrong};
  `}
  &:hover { background: #f9fafb; }
  mark {
    background: #fff3cd;
    color: inherit;
    padding: 0 2px;
    border-radius: 3px;
  }
  ${({ $depth2 }) =>
    $depth2 &&
    `
      position: relative;
      padding-left: 20px;
      &::before{
        content: "";
        position: absolute;
        left: 10px;
        top: 50%;
        width: 6px; height: 6px;
        border-radius: 999px;
        background: ${UI.color.primaryStrong};
        opacity: .35;
        transform: translateY(-50%);
      }
  `}
`;

const DDCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 7L10 17l-6-6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// 빈 상태
const DDEmpty = styled.div`
  padding: 14px 12px;
  color: ${UI.color.muted};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  svg { opacity: .6; }
`;

/* ---------- 검색어 하이라이트 헬퍼 ---------- */
const renderHL = (text: string, keyword: string): React.ReactNode => {
    const q = keyword.trim();
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
        <>
            {text.slice(0, i)}
            <mark>{text.slice(i, i + q.length)}</mark>
            {text.slice(i + q.length)}
        </>
    );
};

/* ---------- FolderSelect ---------- */
type FolderSelectProps = {
    value: string;
    onChange: (v: string) => void;
    options: Notebook[];
    placeholder?: string;
};

/* ---------- 퀴즈 베이스 경로 유틸 ---------- */
//  /learning/quiz
const BASE_PATH_CAPTURE_RE = /(\/learning)?\/(quiz)/;
function getQuizBasePath(pathname: string): string {
    const m = pathname.match(BASE_PATH_CAPTURE_RE);
    return m ? m[0].replace(/\/$/, "") : "/quiz";
}

const FolderSelect: React.FC<FolderSelectProps> = ({ value, onChange, options, placeholder="내 포텐노트 폴더 선택" }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [hover, setHover] = React.useState<number>(-1);
    const ref = React.useRef<HTMLDivElement | null>(null);

    // 섀도우/스크롤
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [topShadow, setTopShadow] = React.useState(false);
    const [botShadow, setBotShadow] = React.useState(false);
    const updateShadows = React.useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setTopShadow(el.scrollTop > 0);
        setBotShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);
    React.useEffect(() => {
        if (!open) return;
        requestAnimationFrame(updateShadows);
    }, [open, options.length, q, updateShadows]);

    const label = React.useMemo(
        () => options.find(o => String(o.id) === String(value))?.name ?? "",
        [options, value]
    );

    const list = React.useMemo(() => {
        const t = q.trim().toLowerCase();
        return t ? options.filter(o => o.name.toLowerCase().includes(t)) : options;
    }, [q, options]);

    React.useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const pick = (idx: number) => {
        const item = list[idx];
        if (!item) return;
        onChange(String(item.id));
        setOpen(false);
        setQ("");
        setHover(-1);
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); setOpen(true); return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHover(h => Math.min((h<0? -1 : h) + 1, list.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setHover(h => Math.max((h<0? list.length : h) - 1, 0)); }
        if (e.key === "Enter")     { e.preventDefault(); pick(hover >= 0 ? hover : 0); }
    };

    return (
        <DDWrap ref={ref}>
            <DDTrigger
                $hasValue={!!label}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label || placeholder}
            </DDTrigger>

            <DDCaret aria-hidden $open={open}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </DDCaret>

            {open && (
                <DDPanel role="listbox" aria-label="폴더 선택">
                    <DDSearchWrap>
                        <DDSearchIcon aria-hidden>
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </DDSearchIcon>
                        <DDSearch
                            autoFocus
                            placeholder="폴더 검색…"
                            value={q}
                            onChange={(e)=>{ setQ(e.target.value); setHover(0); }}
                        />
                    </DDSearchWrap>

                    <DDListWrap $top={topShadow} $bot={botShadow}>
                        <DDList ref={listRef} onScroll={updateShadows}>
                            {list.length === 0 ? (
                                <DDEmpty>
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                    결과가 없어요.
                                </DDEmpty>
                            ) : list.map((n, i) => {
                                const selected = String(n.id) === String(value);
                                return (
                                    <DDItem
                                        key={n.id}
                                        $active={i===hover}
                                        $selected={selected}
                                        onMouseEnter={()=>setHover(i)}
                                        onClick={()=>{ onChange(String(n.id)); setOpen(false); setQ(""); setHover(-1); }}
                                        aria-selected={selected}
                                    >
                                        <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                                            {renderHL(n.name, q)}
                                        </span>
                                        {selected ? <DDCheck/> : <span/>}
                                    </DDItem>
                                );
                            })}
                        </DDList>
                    </DDListWrap>
                </DDPanel>
            )}
        </DDWrap>
    );
};

const toServerType = (t: "mix" | "choice" | "ox" | "initials") =>
    ({ mix: "MIX", choice: "CHOICE", ox: "OX", initials: "INITIALS" } as const)[t];

const toServerLevel = (l: "mix" | "easy" | "medium" | "hard") =>
    ({ mix: "MIX", easy: "EASY", medium: "MEDIUM", hard: "HARD" } as const)[l];

/* ---------- CategorySelect ---------- */
type CategorySelectProps = {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
    allowClear?: boolean; // 선택 해제 행 노출
};

const CategorySelect: React.FC<CategorySelectProps> = ({
                                                           value,
                                                           onChange,
                                                           options,
                                                           placeholder = "카테고리 선택",
                                                           allowClear = true,
                                                       }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [hover, setHover] = React.useState<number>(-1);
    const ref = React.useRef<HTMLDivElement | null>(null);

    // 섀도우/스크롤
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [topShadow, setTopShadow] = React.useState(false);
    const [botShadow, setBotShadow] = React.useState(false);
    const updateShadows = React.useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setTopShadow(el.scrollTop > 0);
        setBotShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);
    React.useEffect(() => {
        if (!open) return;
        requestAnimationFrame(updateShadows);
    }, [open, options.length, q, updateShadows]);

    const label = value || "";

    // 검색 필터링 + (옵션) 상단 '선택 해제' 항목 추가
    type Item = { id: string; label: string; isClear?: boolean };
    const list: Item[] = React.useMemo(() => {
        const t = q.trim().toLowerCase();
        const filtered = (t ? options.filter(o => o.toLowerCase().includes(t)) : options)
            .map(o => ({ id: o, label: o }));
        if (allowClear && value) filtered.unshift({ id: "__CLEAR__", label: "선택 해제", isClear: true });
        return filtered;
    }, [q, options, allowClear, value]);

    // 바깥 클릭/ESC로 닫기
    React.useEffect(() => {
        const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const pick = (idx: number) => {
        const item = list[idx];
        if (!item) return;
        if (item.isClear) onChange("");
        else onChange(item.id);
        setOpen(false);
        setQ("");
        setHover(-1);
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); setOpen(true); return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHover(h => Math.min((h < 0 ? -1 : h) + 1, list.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setHover(h => Math.max((h < 0 ? list.length : h) - 1, 0)); }
        if (e.key === "Enter")     { e.preventDefault(); pick(hover >= 0 ? hover : 0); }
    };

    return (
        <DDWrap ref={ref}>
            <DDTrigger
                $hasValue={!!label}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label || placeholder}
            </DDTrigger>

            {/* 원클릭 선택 해제 */}
            {(allowClear && !!label && !open) && (
                <DDClear aria-label="선택 해제" onClick={(e) => { e.stopPropagation(); onChange(""); }}>
                    ×
                </DDClear>
            )}

            <DDCaret aria-hidden $open={open}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </DDCaret>

            {open && (
                <DDPanel role="listbox" aria-label="카테고리 선택">
                    <DDSearchWrap>
                        <DDSearchIcon aria-hidden>
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </DDSearchIcon>
                        <DDSearch
                            autoFocus
                            placeholder="카테고리 검색…"
                            value={q}
                            onChange={(e)=>{ setQ(e.target.value); setHover(0); }}
                        />
                    </DDSearchWrap>

                    <DDListWrap $top={topShadow} $bot={botShadow}>
                        <DDList ref={listRef} onScroll={updateShadows}>
                            {list.length === 0 ? (
                                <DDEmpty>
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                    결과가 없어요.
                                </DDEmpty>
                            ) : list.map((it, i) => {
                                const selected = it.id === value && !it.isClear;
                                const depth2 = it.label.startsWith("• ");
                                const clean = depth2 ? it.label.replace(/^•\s*/, "") : it.label;
                                return (
                                    <DDItem
                                        key={`${it.id}-${i}`}
                                        $active={i===hover}
                                        $selected={selected}
                                        $depth2={depth2}
                                        onMouseEnter={()=>setHover(i)}
                                        onClick={()=> pick(i)}
                                        aria-selected={selected}
                                    >
                                        <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                                            {renderHL(clean, q)}
                                        </span>
                                        {selected ? <DDCheck/> : <span/>}
                                    </DDItem>
                                );
                            })}
                        </DDList>
                    </DDListWrap>
                </DDPanel>
            )}
        </DDWrap>
    );
};

const CatSearch = styled.input`
  height: 38px; width: 100%; border-radius: 10px; padding: 0 12px; margin-bottom: 10px;
  border:1px solid ${UI.color.line}; background:#fff; font-weight:400; letter-spacing: -0.02em;
`;

const GridCat = styled.div`
  display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:8px;
  @media (max-width: 720px){ grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const CatBtn = styled(CountChip)<{ $on?: boolean }>`
    width: 100%;
    height: 38px;
    border-radius: 12px;
    font-size: 14px;
    letter-spacing: -0.02em;
`;

const SheetFooter = styled.div`
  position: sticky; bottom: 0;
  display:flex; justify-content:flex-end; gap:10px;
  padding: 12px var(--sheet-pad-x); 
  background: linear-gradient(180deg, rgba(255,255,255,.85), #fff 60%);
  border-top: 1px solid ${UI.color.line};
`;

const Ghost = styled.button`
    height: 35px;
    padding: 0 16px;
    border-radius: 5px;
    font-weight: 700;
    background: #fff;
    color: ${UI.color.primaryStrong};
    border: 1px solid ${UI.color.primaryStrong};
    cursor: pointer;
    transition: background-color .15s ease, color .15s ease, border-color .15s ease, transform .08s ease;

    &:hover { background: ${UI.color.indigo50}; }        /* 은은한 파란 톤 배경 */
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(62,99,224,.25); }
    &:disabled { opacity: .6; cursor: not-allowed; }
`;

const Primary = styled.button`
    height: 35px;
    padding: 0 18px;
    border-radius: 5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: ${UI.color.primary};                      /* 솔리드 파랑 */
    border: 1px solid ${UI.color.primary};
    color: #fff;
    cursor: pointer;
    box-shadow: none;

    transition: filter .15s ease, transform .08s ease;
    &:hover { filter: brightness(0.96); }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
    &:disabled { opacity: .7; cursor: not-allowed; }
`;

// 타입
type CategoryRow = {
    id: number;
    type: string;
    group_name: string;
    name: string;
    depth: number;
    sort_order: number;
    parent_id: number | null;
};

function groupByGroupName(rows: CategoryRow[] | any): CategoryGroup[] {
    if (!Array.isArray(rows)) return [];
    const filtered = rows.filter(
        (r: CategoryRow) =>
            (r.type === "직무 중심" || r.type === "언어 중심") &&
            (r.depth === 1 || r.depth === 2)
    );

    // 그룹/정렬
    filtered.sort((a, b) =>
        a.group_name.localeCompare(b.group_name, "ko") ||
        a.depth - b.depth ||
        a.sort_order - b.sort_order ||
        a.name.localeCompare(b.name, "ko")
    );

    const map = new Map<string, CategoryGroup>();
    for (const r of filtered) {
        if (!map.has(r.group_name)) {
            map.set(r.group_name, { group: r.group_name, options: [] });
        }
        map.get(r.group_name)!.options.push({
            id: r.id,
            label: r.depth === 2 ? `• ${r.name}` : r.name, // depth=2는 점으로 들여쓰기
            depth: r.depth,
        });
    }
    return Array.from(map.values());
}

const DDGroupHeader = styled.div`
  padding: 8px 12px 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${UI.color.muted};
  background: #fafafa;
  position: sticky; top: 0; /* 스크롤 시 상단 고정 느낌 */
  z-index: 1;
`;

type GroupedCategorySelectProps = {
    value: number | null;
    onChange: (v: number | null) => void;
    groups: CategoryGroup[];
    placeholder?: string;
    allowClear?: boolean;
};

type FlatItem =
    | { kind: "header"; key: string; label: string }
    | { kind: "option"; key: string; id: number | null; label: string };

const GroupedCategorySelect: React.FC<GroupedCategorySelectProps> = ({
                                                                         value, onChange, groups, placeholder = "카테고리 선택", allowClear = true
                                                                     }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [hover, setHover] = React.useState<number>(-1);
    const ref = React.useRef<HTMLDivElement | null>(null);

    // 섀도우/스크롤
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [topShadow, setTopShadow] = React.useState(false);
    const [botShadow, setBotShadow] = React.useState(false);
    const updateShadows = React.useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setTopShadow(el.scrollTop > 0);
        setBotShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);
    React.useEffect(() => {
        if (!open) return;
        requestAnimationFrame(updateShadows);
    }, [open, groups.length, q, updateShadows]);

    // 선택 라벨
    const selectedLabel = React.useMemo(() => {
        for (const g of groups) {
            const f = g.options.find(o => o.id === value);
            if (f) return f.label.replace(/^•\s*/, ""); // 표시용으로 점 제거
        }
        return "";
    }, [value, groups]);

    // 검색 + 플랫 리스트 (헤더는 선택 불가, 옵션만 선택)
    const flat: FlatItem[] = React.useMemo(() => {
        const out: FlatItem[] = [];
        const query = q.trim().toLowerCase();

        if (allowClear && value != null) {
            out.push({ kind: "option", key: "__clear__", id: null, label: "선택 해제" });
        }

        for (const g of groups) {
            const opts = query
                ? g.options.filter(o =>
                    (g.group + " " + o.label).toLowerCase().includes(query)
                )
                : g.options;

            if (opts.length === 0) continue;

            out.push({ kind: "header", key: `h:${g.group}`, label: g.group });
            for (const o of opts) {
                out.push({ kind: "option", key: `o:${o.id}`, id: o.id, label: o.label });
            }
        }
        return out;
    }, [groups, q, value, allowClear]);

    // 바깥 클릭/ESC로 닫기
    React.useEffect(() => {
        const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
    }, []);

    // 키보드 이동: header는 건너뛰고 option에서만 선택
    const moveHover = (dir: 1 | -1) => {
        if (flat.length === 0) return;
        let i = hover;
        do {
            i = (i + dir + flat.length) % flat.length;
        } while (flat[i]?.kind === "header" && i !== hover);
        setHover(i);
    };

    const pick = (idx: number) => {
        const it = flat[idx];
        if (!it || it.kind !== "option") return;
        onChange(it.id);        // null 이면 선택 해제
        setOpen(false);
        setQ("");
        setHover(-1);
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); setOpen(true); return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); moveHover(1); }
        if (e.key === "ArrowUp")   { e.preventDefault(); moveHover(-1); }
        if (e.key === "Enter")     { e.preventDefault(); pick(hover >= 0 ? hover : flat.findIndex(f => f.kind === "option")); }
    };

    return (
        <DDWrap ref={ref}>
            <DDTrigger
                $hasValue={!!selectedLabel}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {selectedLabel || placeholder}
            </DDTrigger>

            {/* 원클릭 선택 해제 */}
            {(allowClear && !!selectedLabel && !open) && (
                <DDClear aria-label="선택 해제" onClick={(e) => { e.stopPropagation(); onChange(null); }}>
                    ×
                </DDClear>
            )}

            <DDCaret aria-hidden $open={open}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </DDCaret>

            {open && (
                <DDPanel role="listbox" aria-label="카테고리 선택">
                    <DDSearchWrap>
                        <DDSearchIcon aria-hidden>
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </DDSearchIcon>
                        <DDSearch
                            autoFocus
                            placeholder="카테고리/그룹 검색…"
                            value={q}
                            onChange={(e)=>{ setQ(e.target.value); setHover(0); }}
                        />
                    </DDSearchWrap>

                    <DDListWrap $top={topShadow} $bot={botShadow}>
                        <DDList ref={listRef} onScroll={updateShadows}>
                            {flat.length === 0 ? (
                                <DDEmpty>
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                    결과가 없어요.
                                </DDEmpty>
                            ) : flat.map((it, i) => {
                                if (it.kind === "header") {
                                    return <DDGroupHeader key={it.key}>{it.label}</DDGroupHeader>;
                                }
                                const selected = it.id != null && it.id === value;
                                const depth2 = it.label.startsWith("• ");
                                const clean = depth2 ? it.label.replace(/^•\s*/, "") : it.label;
                                return (
                                    <DDItem
                                        key={it.key}
                                        $active={i===hover}
                                        $selected={selected}
                                        $depth2={depth2}
                                        onMouseEnter={()=>setHover(i)}
                                        onClick={()=> pick(i)}
                                        aria-selected={selected}
                                    >
                                        <span style={{
                                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"
                                        }}>
                                            {renderHL(clean, q)}
                                        </span>
                                        {selected ? <DDCheck/> : <span/>}
                                    </DDItem>
                                );
                            })}
                        </DDList>
                    </DDListWrap>
                </DDPanel>
            )}
        </DDWrap>
    );
};

type CategoryOption = { id: number; label: string; depth?: number };
type CategoryGroup = { group: string; options: CategoryOption[] };

export default function WordbookPage() {
    const { wordbookId } = useParams<{ wordbookId: string }>();
    const navigate = useNavigate();
    const location = useLocation() as any;
    const [searchParams] = useSearchParams();
    const navType = useNavigationType();

    const [wordbookName, setWordbookName] = React.useState<string>(
        location.state?.wordbookName ?? "내 포텐노트"
    );

    const [items, setItems] = React.useState<TermItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [page, setPage] = React.useState<number>(Number(searchParams.get("page") ?? 0) || 0);
    const [size, setSize] = React.useState<number>(Number(searchParams.get("size") ?? 20 ) || 20);
    const [total, setTotal] = React.useState<number>(0); // 전체 개수(서버 totalItems)

    /** 선택 상태 (항상 노출되는 체크 기반) */
    const [checked, setChecked] = React.useState<Record<string, boolean>>({});
    const allOn =
        items.length > 0 &&
        Object.values(checked).length === items.length &&
        Object.values(checked).every(Boolean);

    // 전체 보기 모드(마스터 스위치)
    const [titleMode, setTitleMode] = React.useState<ViewMode>("inherit");
    const [descMode, setDescMode] = React.useState<ViewMode>("inherit");

    // 카드별 보기 상태 : 카드별로 '제목(t)'과 '뜻(d)'을 각각 show/hide/undefined로 보관
    type CardOverrides = { t?: "hide" | "show"; d?: "hide" | "show" };
    const [cardView, setCardView] = React.useState<Record<string, CardOverrides>>({});

    // 카드별 암기 상태
    const [learn, setLearn] = React.useState<Record<string, "unmemorized" | "memorized">>({});

    // ===== 정렬 상태 =====
    type SortKey = "createdAt_desc" | "title_asc" | "title_desc" | "status_asc" | "status_desc";
    const CLIENT_SORT_PARAM = "cs";
    const [, setSortMenuOpen] = React.useState(false);

    const sortToServer = (k: SortKey): string => {
        switch (k) {
            case "title_asc":
                return "title,asc";
            case "title_desc":
                return "title,desc";
            case "createdAt_desc":
                return "createdAt,desc";
            case "status_asc":
            case "status_desc":
            default:
                return "createdAt,desc";
        }
    };

    const parseSortKeyFromSearch = (sp: URLSearchParams): SortKey => {
        const cs = (sp.get(CLIENT_SORT_PARAM) || "").trim().toLowerCase();
            if (cs === "title,asc")  return "title_asc";
            if (cs === "title,desc") return "title_desc";
            if (cs === "status,asc") return "status_asc";
            if (cs === "status,desc")return "status_desc";
                // fallback: 기존 sort=title,asc|desc|createdAt,desc만 해석
        const sort = (sp.get("sort") || "").trim().toLowerCase();
            if (sort.startsWith("title,asc")) return "title_asc";
            if (sort.startsWith("title,desc")) return "title_desc";
            return "createdAt_desc";
    };

            const clientSortToUrl = (k: SortKey): string => {
                switch (k) {
                    case "title_asc":  return "title,asc";
                        case "title_desc": return "title,desc";
                        case "status_asc": return "status,asc";
                        case "status_desc":return "status,desc";
                        case "createdAt_desc":
                        default:           return "createdAt,desc";
                    }
            };

    const [sortKey, setSortKey] = React.useState<SortKey>(() => {
        const params = new URLSearchParams(location.search);
        return parseSortKeyFromSearch(params);
    });

    const [sortInlineOpen, setSortInlineOpen] = React.useState(false);
    const inlineSortRef = React.useRef<HTMLSpanElement | null>(null);

    // 현재 정렬 라벨
    const sortLabel = React.useMemo(() => {
        switch (sortKey) {
            case "title_asc":  return "제목순";
            case "title_desc": return "제목역순";
            case "status_asc": return "상태: 학습 중→학습 완료";
            case "status_desc":return "상태: 학습 완료→학습 중";
            case "createdAt_desc":
            default:           return "최신 등록순";
        }
    }, [sortKey]);

    // 저장/내보내기 진행 상태
    const [saving, setSaving] = React.useState<Record<string, boolean>>({});
    const [exporting, setExporting] = React.useState(false);

    // 설정 메뉴
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [pdfMenuOpen, setPdfMenuOpen] = React.useState(false);
    const actionsRef = React.useRef<HTMLDivElement | null>(null);

    // 이동 모달
    const [moveOpen, setMoveOpen] = React.useState(false);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);

    // 전역 선택 바구니: termId 기준(페이지 넘어가도 유지)
    const [selectedTermIds, setSelectedTermIds] = React.useState<Set<number>>(new Set());
    const [uwtToTerm, setUwtToTerm] = React.useState<Record<string, number | null>>({});
    const storageKey = React.useMemo(() => `wb:${wordbookId}:selectedTermIds`, [wordbookId]);

    // 선택 바구니 복원
    React.useEffect(() => {
        try {
            const raw = sessionStorage.getItem(storageKey);
            if (raw) setSelectedTermIds(new Set(JSON.parse(raw)));
        } catch {}
    }, [storageKey]);

    const persistSelected = React.useCallback((next: Set<number>) => {
        setSelectedTermIds(next);
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {}
    }, [storageKey]);

    const mapRow = (row: TermRow): TermItem | null => {
        const uwt =
            row.userWordbookTermId ??
            row.userTermId ??
            row.uwtId ??
            row.id ??
            row.user_wordbook_term_id;
        if (uwt == null) return null;

        let tId: number | null = row?.term?.id ?? row?.term_id ?? null;
        if (tId == null) {
            const rootTermId = row.termId ?? row.tid ?? row?.term?.termId;
            if (rootTermId != null && String(rootTermId) !== String(uwt)) {
                tId = Number(rootTermId);
                if (!Number.isFinite(tId)) tId = null;
            }
        }

        const title = row.word ?? row.title ?? row.term?.title ?? row.term?.word ?? "(제목 없음)";
        const description =
            row.description ?? row.term?.description ?? row.explain ?? row.meaning ?? "";
        const createdAt = row.createdAt ?? row.created_at;
        const tags: string[] = row.tags ?? row.term?.tags ?? [];

        return {
            uwtId: String(uwt),
            termId: tId != null ? String(tId) : null,
            title: String(title),
            description: String(description),
            createdAt,
            tags,
        };
    };

    const fetchPage = React.useCallback(
        async (p: number, pageSize: number, sortKeyNow: SortKey) => {
            if (!wordbookId) return;
            setLoading(true);
            setError(null);
            try {
                const res = await http.get(`/me/folders/${wordbookId}/terms`, {
                    params: { page: p, size: pageSize, sort: sortToServer(sortKeyNow) },
                    headers: { ...authHeader() },
                    withCredentials: true,
                });

                const d = res.data ?? {};
                const raw: any[] = d.userWordbookTermList || d.items || d.content || d.terms || d.data || [];
                const list = raw.map(mapRow).filter(Boolean) as TermItem[];
                setItems(list);

                const nextTotal =
                    (typeof d.totalItems === "number" && d.totalItems) ||
                    (typeof d.total === "number" && d.total) ||
                    (typeof d.totalElements === "number" && d.totalElements) ||
                    0;

                const headerTotalRaw = (res.headers?.["x-total-count"] ??
                    (res.headers ? (res.headers as any)["X-Total-Count"] : undefined));
                const headerTotal = Number(headerTotalRaw);
                setTotal(Number.isFinite(headerTotal) ? headerTotal : nextTotal);

                if (typeof d.wordbookName === "string" && d.wordbookName.trim()) setWordbookName(d.wordbookName);
            } catch (err: any) {
                const s = err?.response?.status ?? 0;
                const msg = err?.message ?? "";
                const data = err?.response?.data;
                console.error("[fetchPage] failed:", { status: s, msg, body: data ?? "(no body)" });

                if (s === 401) { goToAccountLogin(location.pathname + location.search); return; }
                else if (s === 404 || s === 403) setError("폴더를 찾을 수 없습니다.");
                else setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        },
        [wordbookId]
    );

    // 페이지 바뀔 때 URL 업데이트 + 스크롤 상단
    const syncUrl = React.useCallback((p: number, s: number, sk: SortKey) => {
        const sp = new URLSearchParams(location.search);
        sp.set("page", String(p));
        sp.set("size", String(s));
        sp.set("sort", sortToServer(sk));
        sp.set(CLIENT_SORT_PARAM, clientSortToUrl(sk));
        navigate({ search: `?${sp.toString()}` }, { replace: false });
    }, [location.search, navigate]);

    const handlePageChange = (nextZeroBased: number) => {
        setPage(nextZeroBased);
        syncUrl(nextZeroBased, size, sortKey);
        // 새 페이지 데이터
        fetchPage(nextZeroBased, size, sortKey);
        // 접근성/UX: 맨 위로
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    };

    // 초기 진입/뒤로가기(POP) 시 복원
    React.useEffect(() => {
        // URL → 상태 반영
        const p = Number(searchParams.get("page") ?? 0) || 0;
        const s = Number(searchParams.get("size") ?? 20) || 20;
        const sk = parseSortKeyFromSearch(searchParams);
        setPage(p);
        setSize(s);
        setSortKey(sk);

        // 데이터 로드
        fetchPage(p, s, sk);
        // count도 갱신
        refreshCount();
        // POP으로 돌아온 경우 스크롤 복원은 필요하면 sessionStorage로 별도 구현
        if (navType !== "POP") requestAnimationFrame(() => window.scrollTo(0, 0));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wordbookId, searchParams]);

    // items 들어올 때 uwtId→termId 매핑 갱신 및 체크 동기화
    React.useEffect(() => {
        if (!items.length) return;
        setUwtToTerm((prev) => {
            const next = { ...prev };
            for (const it of items) next[it.uwtId] = it.termId ? Number(it.termId) : null;
            return next;
        });

        setChecked((prev) => {
            const next: Record<string, boolean> = { ...prev };
            for (const it of items) {
                const idNum = Number(it.termId);
                next[it.uwtId] =
                    Number.isFinite(idNum) && idNum > 0 ? selectedTermIds.has(idNum) : !!prev[it.uwtId];
            }
            return next;
        });
    }, [items, selectedTermIds]);

    // 암기 상태 초기 동기화
    React.useEffect(() => {
        if (items.length === 0) return;
        let aborted = false;
        const ids = Array.from(new Set(items.map((it) => Number(it.termId)).filter(Boolean)));

        (async () => {
            try {
                const map = await fetchMemorizationStatuses(ids);
                if (aborted || !map) return;
                setLearn((prev) => {
                    const next = { ...prev };
                    for (const it of items) {
                        const raw = map[String(it.termId)];
                        if (raw === "DONE") next[it.uwtId] = "memorized";
                        else if (raw === "LEARNING") next[it.uwtId] = "unmemorized";
                    }
                    return next;
                });
            } catch (e) {
                console.warn("[memo:init] 상태 조회 실패", e);
            }
        })();

        return () => {
            aborted = true;
        };
    }, [items]);

    /* ------ selection / bulk actions ------ */
    const onToggleItem = (uwtId: string) => {
        const currentlyOn = !!checked[uwtId];
        setChecked((prev) => ({ ...prev, [uwtId]: !currentlyOn }));

        const termId = uwtToTerm[uwtId];
        if (Number.isFinite(termId) && (termId as number) > 0) {
            const next = new Set(selectedTermIds);
            if (currentlyOn) next.delete(termId as number);
            else next.add(termId as number);
            persistSelected(next);
        }
    };

    const toggleAll = (on: boolean) => {
        const nextChecked: Record<string, boolean> = {};
        const nextSelected = new Set(selectedTermIds);
        if (on) {
            items.forEach((it) => {
                nextChecked[it.uwtId] = true;
                const id = Number(it.termId);
                if (Number.isFinite(id) && id > 0) nextSelected.add(id);
            });
        } else {
            items.forEach((it) => {
                nextChecked[it.uwtId] = false;
                const id = Number(it.termId);
                if (Number.isFinite(id) && id > 0) nextSelected.delete(id);
            });
        }
        setChecked(nextChecked);
        persistSelected(nextSelected);
    };

    const clearAllSelected = () => {
        persistSelected(new Set());
        setChecked({});
    };

    const openMove = async () => {
        const selectedCount = selectedTermIds.size;
        if (selectedCount === 0) {
            alert("먼저 단어를 선택해 주세요.");
            return;
        }
        try {
            const list = await fetchUserFolders();
            setNotebooks(list);
        } catch {
            setNotebooks([]);
        }
        setMoveOpen(true);
        setMenuOpen(false);
        setPdfMenuOpen(false);
        setSortMenuOpen(false);
    };

    // 이동 완료 핸들러
    const handleConfirmMove = async (destWordbookId: string) => {
        if (!wordbookId) return;
        const termIds = Array.from(selectedTermIds);
        if (termIds.length === 0) {
            setMoveOpen(false);
            return;
        }

        try {
            const res = await moveFolderTerms(Number(wordbookId), {
                targetWordbookId: Number(destWordbookId),
                termIds,
            });

            const movedIds = (res.movedTermIds ?? []).map(String);
            const movedSet = new Set(movedIds);
            const movedCount = res.movedCount ?? movedSet.size;
            const skippedArr = res.skipped ?? [];
            const skippedCount = res.skippedCount ?? skippedArr.length;

            // 리스트에서 이동된 것 제거
            if (movedSet.size > 0) {
                setItems((prev) => prev.filter((it) => !movedSet.has(String(it.termId))));
                setCount((c) => Math.max(0, (c ?? 0) - movedSet.size));
            }

            setPage(0);
            syncUrl(0, size, sortKey);
            await fetchPage(0, size, sortKey);
            clearAllSelected();
            refreshCount();

            // termId -> title 맵 (현재 페이지 기준)
            const termTitleMap = new Map<number, string>();
            items.forEach((it) => {
                if (it.termId) termTitleMap.set(Number(it.termId), it.title);
            });

            const bullets: string[] = [];
            for (const s of skippedArr) {
                const title = termTitleMap.get(s.termId) ?? `ID ${s.termId}`;
                let reasonText = "";
                switch (s.reason) {
                    case "DUPLICATE_IN_TARGET":
                        reasonText = "이미 대상 폴더에 있어서 이동하지 않았어요.";
                        break;
                    case "NOT_IN_SOURCE":
                        reasonText = "원본 폴더에 없는 항목이라 건너뛰었어요.";
                        break;
                    case "TERM_NOT_FOUND":
                        reasonText = "용어 정보를 찾지 못해서 건너뛰었어요.";
                        break;
                    case "SAME_FOLDER":
                        reasonText = "같은 폴더로 이동 요청이라 건너뛰었어요.";
                        break;
                    default:
                        reasonText = "알 수 없는 이유로 건너뛰었어요.";
                }
                bullets.push(`「${title}」 – ${reasonText}`);
            }

            if (skippedCount > 0) {
                setSystemMessage({
                    tone: "warning",
                    title: "일부 단어만 이동했어요",
                    description: `총 ${movedCount + skippedCount}개 중 ${movedCount}개는 이동했고, ${skippedCount}개는 건너뛰었어요.`,
                    bullets,
                });
            } else {
                setSystemMessage({
                    tone: "success",
                    title: "단어 이동 완료",
                    description: `${movedCount}개 단어를 성공적으로 이동했어요.`,
                });
            }
            setSystemMessageOpen(true);
        } catch (err: any) {
            const status = err?.status ?? err?.response?.status;

            if (status === 401) {
                setSystemMessage({
                    tone: "error",
                    title: "로그인이 필요합니다",
                    description: "다시 로그인한 뒤 이동을 시도해 주세요.",
                });
                goToAccountLogin(location.pathname + location.search);
            } else if (status === 403) {
                setSystemMessage({
                    tone: "error",
                    title: "이동 권한이 없습니다",
                    description: "해당 폴더에 대한 권한이 없어 이동할 수 없습니다.",
                });
            } else if (status === 404) {
                setSystemMessage({
                    tone: "error",
                    title: "폴더 또는 용어를 찾을 수 없습니다",
                    description: "이미 삭제되었거나 존재하지 않는 항목일 수 있습니다.",
                });
            } else {
                setSystemMessage({
                    tone: "error",
                    title: "용어 이동 중 오류가 발생했습니다",
                    description: "잠시 후 다시 시도해 주세요.",
                });
            }
            setSystemMessageOpen(true);
            console.error("[moveFolderTerms] failed:", err);
        }
    };

    // 서버 카운트 상태
    const [count, setCount] = React.useState<number | null>(null);
    const fmt = (n: number) => n.toLocaleString();

    // 카운트 새로고침 함수
    const refreshCount = React.useCallback(async () => {
        if (!wordbookId) return;

        const parseCount = (data: any) => {
            // 다양한 스키마 대응
            if (typeof data === "number") return data;
            if (data == null) return 0;
            const keys = ["count", "termsCount", "totalCount", "total", "size", "value"];
            for (const k of keys) {
                const v = (data as any)[k];
                if (typeof v === "number") return v;
                if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
            }
            // text/plain인 경우
            if (typeof data === "string" && data.trim() && !Number.isNaN(Number(data))) {
                return Number(data);
            }
            return 0;
        };

        const tryFetch = async (url: string) => {
            return http.get(url, {
                headers: { ...authHeader() },
                withCredentials: true,
                validateStatus: () => true,
            });
        };

        try {
            let res = await tryFetch(`/me/folders/${wordbookId}/terms/count`);
            if (res.status === 404 || res.status === 405) {
                // 클래스 레벨이 /api인 경우 대비
                res = await tryFetch(`/api/me/folders/${wordbookId}/terms/count`);
            }

            if (res.status === 200) {
                const value = parseCount(res.data);
                setCount(Number.isFinite(value) ? value : 0);
                return;
            }

            // 인증 실패 시 null 유지 → 상단에 …개로 표시됨
            if (res.status === 401) {
                console.warn("[count] 401", res.data);
                setCount(null);
                return;
            }

            // 권한/미존재는 0으로 표기
            if (res.status === 403 || res.status === 404) {
                console.warn("[count] ", res.status, res.data);
                setCount(0);
                return;
            }

            console.warn("[count] unexpected", res.status, res.data);
            setCount(null);
        } catch (err: any) {
            console.warn("[count] fetch error", err?.response?.status, err?.response?.data);
            setCount(null);
        }
    }, [wordbookId]);


    // 폴더 바뀌면 카운트/리스트 동시 초기화
    React.useEffect(() => {
        setPage(0);
        setChecked({});
        refreshCount();
    }, [wordbookId]);

    /* ------ PDF 내보내기 ------ */
    const exportByTermIds = async (termIds: number[], title: string) => {
        if (!termIds.length) {
            alert("선택한 단어가 없습니다.");
            return;
        }
        try {
            setExporting(true);
            const { blob, meta } = await generatePdfByTermIds({ termIds, title });
            if ((meta as any)?.mismatch) console.warn("[PDF Export] filename mismatch", meta);
            const preferred =
                (meta as any)?.cdFilename ||
                (meta as any)?.ebookFilename ||
                `I-Poten_terms_${Date.now()}.pdf`;
            const finalName = sanitizeFilename(preferred, `I-Poten_terms_${Date.now()}.pdf`);
            saveBlob(blob, finalName);
        } catch (e: any) {
            console.error("[PDF] export failed", e);
            alert(e?.message ?? "PDF 생성에 실패했습니다.");
        } finally {
            setExporting(false);
            setMenuOpen(false);
            setPdfMenuOpen(false);
            setSortMenuOpen(false);
        }
    };

    const generatePdfByFolder = React.useCallback(
        async (wordbookIdNum: number, title: string) => {
            const body = {
                wordbookId: wordbookIdNum,
                userWordbookId: wordbookIdNum,
                title,
            };

            const call = async (url: string) => {
                try {
                    const res = await http.post(url, body, {
                        headers: { ...authHeader() },
                        responseType: "blob",
                        withCredentials: true,
                        validateStatus: () => true,
                    });

                    if (res.status >= 200 && res.status < 300) {
                        const headers = (res as any).headers || {};
                        const ebookFilename = headers["ebook-filename"] || headers["Ebook-Filename"];
                        let filename = ebookFilename || `I-Poten_terms_${Date.now()}.pdf`;

                        const cd = headers["content-disposition"] || headers["Content-Disposition"];
                        if (!ebookFilename && typeof cd === "string") {
                            const m = cd.match(/filename\*?=UTF-8''([^;]+)|filename="([^"]+)"/i);
                            const enc = m?.[1] ? decodeURIComponent(m[1]) : m?.[2] || "";
                            if (enc) filename = sanitizeFilename(enc, filename);
                        }

                        return { ok: true as const, blob: res.data as Blob, filename };
                    }

                    let serverMsg = `HTTP ${res.status}`;
                    try {
                        const text = await (res.data as Blob).text();
                        if (text) serverMsg = `${serverMsg} • ${text}`;
                    } catch {}
                    return { ok: false as const, status: res.status, message: serverMsg };
                } catch (e: any) {
                    return { ok: false as const, status: 0, message: e?.message ?? "요청 실패" };
                }
            };

            let result = await call(`/pdf/generate`);
            if (!result.ok && result.status === 404) {
                result = await call(`/api/pdf/generate`);
            }

            if (!result.ok) {
                if (result.status === 404) {
                    alert("폴더를 찾을 수 없거나 접근 권한이 없습니다.\n(서버 메시지) " + result.message);
                } else if (result.status === 401) {
                    alert("로그인이 필요합니다.");
                    goToAccountLogin(location.pathname + location.search);
                } else {
                    alert("PDF 생성에 실패했습니다.\n" + result.message);
                }
                throw new Error(result.message);
            }

            return { blob: result.blob, filename: result.filename };
        },
        [navigate, location.pathname]
    );

    const handleExportSelectedPdf = async () => {
        const picked = Array.from(selectedTermIds);
        await exportByTermIds(picked, wordbookName);
    };

    const handleExportWholeFolderPdf = async () => {
        if (!wordbookId) return;
        try {
            setExporting(true);
            const { blob, filename } = await generatePdfByFolder(Number(wordbookId), wordbookName);
            saveBlob(blob, filename);
        } catch {
        } finally {
            setExporting(false);
            setMenuOpen(false);
            setPdfMenuOpen(false);
            setSortMenuOpen(false);
        }
    };

    /* ------ settings & inline-sort : outside click/esc ------ */
    React.useEffect(() => {
        if (!menuOpen && !sortInlineOpen) return;

        const onDocClick = (e: MouseEvent) => {
            const t = e.target as Node;
            const inActions = actionsRef.current?.contains(t);
            const inInline  = inlineSortRef.current?.contains(t);
            if (!inActions && !inInline) {
                setMenuOpen(false);
                setPdfMenuOpen(false);
                setSortMenuOpen(false);
                setSortInlineOpen(false);
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                setPdfMenuOpen(false);
                setSortMenuOpen(false);
                setSortInlineOpen(false);
            }
        };

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [menuOpen, sortInlineOpen]);

    const cycleTitleMode = () =>
        setTitleMode((m) => (m === "allHidden" ? "inherit" : "allHidden"));

    const cycleDescMode = () =>
        setDescMode((m) => (m === "allHidden" ? "inherit" : "allHidden"));

    const handleDeleteSelected = async () => {
        if (selectedTermIds.size === 0) {
            alert("먼저 단어를 선택해 주세요.");
            return;
        }
        if (!wordbookId) return;

        const ids = Array.from(selectedTermIds);

        if (!confirm(`선택된 ${ids.length.toLocaleString()}개 단어를 삭제할까요?`)) {
            return;
        }

        try {
            await removeFolderTerms(Number(wordbookId), ids);

            // UI에서 삭제 반영
            setItems((prev) =>
                prev.filter((it) => !selectedTermIds.has(Number(it.termId)))
            );

            setCount((c) =>
                c == null ? c : Math.max(0, c - ids.length)
            );

            setPage(0);
            syncUrl(0, size, sortKey);
            await fetchPage(0, size, sortKey);
            clearAllSelected();
            refreshCount();

            // 선택 개수 기준으로 메시지 표시
            setSystemMessage({
                tone: "success",
                title: "용어 삭제 완료",
                description: `${ids.length.toLocaleString()}개 용어를 삭제했어요.`,
            });
            setSystemMessageOpen(true);

        } catch (err: any) {
            const status = err?.status ?? err?.response?.status;

            if (status === 401) {
                alert("로그인이 필요합니다.");
                goToAccountLogin(location.pathname + location.search);
            } else if (status === 403) {
                alert("해당 폴더에 대한 권한이 없습니다.");
            } else if (status === 404) {
                alert("폴더 또는 용어를 찾을 수 없습니다.");
            } else {
                alert("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            }
            console.error("[removeFolderTerms] failed:", err);
        } finally {
            setMenuOpen(false);
            setPdfMenuOpen(false);
            setSortMenuOpen(false);
        }
    };

    // ===== 표시 목록(정렬 적용) =====
    const displayItems = React.useMemo(() => {
        const arr = [...items];

        const compareTitle = (a: TermItem, b: TermItem) =>
            a.title.localeCompare(b.title, "ko", { numeric: true, sensitivity: "base" });

        const safeDate = (it: TermItem) => {
            const t = it.createdAt ? Date.parse(it.createdAt) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };

        if (sortKey === "status_asc" || sortKey === "status_desc") {
            const rank = (id: string) => (learn[id] ?? "unmemorized") === "memorized" ? 1 : 0;
            return arr.sort((a, b) => {
                const diff = (sortKey === "status_asc" ? 1 : -1) * (rank(a.uwtId) - rank(b.uwtId));
                return diff || compareTitle(a, b);
            });
        }

        switch (sortKey) {
            case "title_asc":
                return arr.sort(compareTitle);
            case "title_desc":
                return arr.sort((a, b) => compareTitle(b, a));
            case "createdAt_desc":
            default:
                return arr.sort((a, b) => (safeDate(b) - safeDate(a)) || compareTitle(a, b));
        }
    }, [items, learn, sortKey]);

    /** 카드 1장씩 떠오르는 애니메이션 (검색페이지와 동일 패턴) */
    React.useEffect(() => {
        // 페이지/정렬/아이템이 바뀔 때마다 처음부터 다시
        setVisibleCount(0);

        if (!listRef.current || displayItems.length === 0) return;

        const rootEl = listRef.current;
        const nodes = Array.from(
            rootEl.querySelectorAll<HTMLElement>("[data-term-idx]")
        );

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
            {
                root: null,
                threshold: 0.2,
                rootMargin: "0px 0px -10% 0px",
            }
        );

        nodes.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [items, page, sortKey, displayItems.length]);

    const applySort = (next: SortKey) => {
        setSortKey(next);
        setMenuOpen(false);
        setSortMenuOpen(false);
        setSortInlineOpen(false);
        setPage(0);
        syncUrl(0, size, next);
        fetchPage(0, size, next);
    };

    // 퀴즈 설정 모달 상태
    // const [quizOpen, setQuizOpen] = React.useState(false);
    // type Source = "folder" | "category" | null;
    // const [source, setSource] = React.useState<Source>(null);
    // const [quizWordbookId, setQuizWordbookId] = React.useState<string>("");
    // const [quizCount, setQuizCount] = React.useState<number>(5);
    // type QType = "mix" | "choice" | "ox" | "initials";
    // const [quizType, setQuizType] = React.useState<QType>("mix");
    // type QLevel = "mix" | "hard" | "medium" | "easy";
    // const [quizLevel, setQuizLevel] = React.useState<QLevel>("mix");
    // const [quizErr, setQuizErr] = React.useState<string>("");
    // const [quizLoading, setQuizLoading] = React.useState(false);

    const [catFetchFailed, setCatFetchFailed] = React.useState(false);

    // 서버 응답/오류 알림용 시스템 메시지 모달 상태
    const [systemMessageOpen, setSystemMessageOpen] = React.useState(false);
    const [systemMessage, setSystemMessage] = React.useState<SystemMessage | null>(null);

    // 모달 열릴 때 폴더 필요하면 불러오기(한 번만)
    // React.useEffect(() => {
    //     if (!quizOpen || source !== "folder") return;
    //     (async () => {
    //         try {
    //             if (!notebooks.length) {
    //                 const list = await fetchUserFolders();
    //                 setNotebooks(list);
    //             }
    //         } catch {}
    //     })();
    // }, [quizOpen, source, notebooks.length]);

    const CATEGORIES = [
        "Frontend","Backend","Database","Network","Operating System","Data Structure & Algorithm","Security","Software Engineering","DevOps / Cloud","Computer Science","AI / Data / Machine Learning","Embedded / IoT / System Programming","Java","Python","JavaScript","TypeScript","C / C++ / C#","SQL","Shell / Bash","Go(Golang)","Rust","Kotlin","Swift","Ruby","PHP","Dart","R","Julia","Assembly","Bash","PowerShell","HTML/CSS","GraphQL","Haskell, Scala, Elixir","Objective-C","Lua",
    ];

    const QuizIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path
                d="M8.5 9c.6-1.5 2.1-2.5 3.8-2.5 2.1 0 3.8 1.7 3.8 3.8 0 1.5-1 2.7-2.4 3.3-.9.4-1.3.8-1.3 1.9"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const [quizCategoryId, setQuizCategoryId] = React.useState<number | null>(null);
    const [catGroups, setCatGroups] = React.useState<CategoryGroup[]>([]);
    const extractCategoryRows = (data: any): CategoryRow[] => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.content)) return data.content;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    type CategoryDto = { id: number; name: string };

    // async function loadCategories() {
    //     try {
    //         const roots = (await http.get<CategoryDto[]>("/categories", {
    //             params: { depth: 0 }, withCredentials: true,
    //         })).data;
    //
    //         if (!roots?.length) {
    //             setCatGroups([]);
    //             setQuizErr("카테고리 데이터가 비어 있습니다.");
    //             setCatFetchFailed(true);
    //             return;
    //         }
    //
    //         const groups = await Promise.all(
    //             roots.map(async (root) => {
    //                 const lv1 = (await http.get<CategoryDto[]>("/categories", {
    //                     params: { depth: 1, parentId: root.id }, withCredentials: true,
    //                 })).data;
    //
    //                 // lv2는 병렬로
    //                 const lv2Bundles = await Promise.all(
    //                     (lv1 ?? []).map(async (c1) => {
    //                         const lv2 = (await http.get<CategoryDto[]>("/categories", {
    //                             params: { depth: 2, parentId: c1.id }, withCredentials: true,
    //                         })).data;
    //                         return { parent: c1, children: lv2 ?? [] };
    //                     })
    //                 );
    //
    //                 const options: CategoryOption[] = [];
    //                 for (const { parent, children } of lv2Bundles) {
    //                     options.push({ id: parent.id, label: parent.name, depth: 1 });
    //                     for (const c2 of children) {
    //                         options.push({ id: c2.id, label: `• ${c2.name}`, depth: 2 });
    //                     }
    //                 }
    //
    //                 return { group: root.name, options };
    //             })
    //         );
    //
    //         setCatGroups(groups);
    //         setQuizErr("");
    //         setCatFetchFailed(false);
    //     } catch (e) {
    //         setQuizErr("카테고리를 불러오지 못했습니다.");
    //         setCatFetchFailed(true);
    //     }
    // }
    //
    // React.useEffect(() => {
    //     if (quizOpen && source === "category" && !catFetchFailed && catGroups.length === 0) {
    //         loadCategories();
    //     }
    // }, [quizOpen, source, catFetchFailed, catGroups.length]);

    function collectQuestionIds(input: any): number[] {
        if (!input) return [];

        // 문자열: JSON/CSV/단일 수 모두 시도
        if (typeof input === "string") {
            const t = input.trim();
            if (t.startsWith("{") || t.startsWith("[")) {
                try { return collectQuestionIds(JSON.parse(t)); } catch { return []; }
            }
            if (t.includes(",")) return t.split(",").map(s => Number(s.trim())).filter(Number.isFinite);
            const n = Number(t);
            return Number.isFinite(n) ? [n] : [];
        }

        // 숫자 배열
        if (Array.isArray(input) && input.every(x => Number.isFinite(x))) {
            return input.map(Number);
        }

        // 객체 배열: 자주 쓰는 키들에서 ID 추출
        if (Array.isArray(input) && input.length && typeof input[0] === "object") {
            const keys = ["id","questionId","quizQuestionId","qqId","qq_id"];
            const out = input.map((o: any) => {
                for (const k of keys) {
                    const v = o?.[k];
                    if (Number.isFinite(v)) return Number(v);
                    if (typeof v === "string" && Number.isFinite(Number(v))) return Number(v);
                }
                return null;
            }).filter((n: number | null): n is number => n != null);
            if (out.length) return out;
        }

        // 객체 컨테이너: 대표 키부터 시도
        if (input && typeof input === "object") {
            const candidates = [
                "questionIds","questionIdList","quizQuestionIds","quiz_question_ids",
                "orderedIds","orderedQuestionIds","order","list","ids","items",
                "questions","data","payload"
            ];
            for (const k of candidates) {
                const got = collectQuestionIds((input as any)[k]);
                if (got.length) return got;
            }
            // 얕은 딥스캔 (재귀)
            for (const v of Object.values(input)) {
                const got = collectQuestionIds(v);
                if (got.length) return got;
            }
        }

        return [];
    }

    function normalizeStartResponse(raw: any) {
        const root = raw?.data ?? raw ?? {};

        // 세션 ID를 다양한 자리에서 탐색 (숫자로 캐스팅 가능하면 채택)
        const firstNumber = (v: any) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
        };

        const sid =
            firstNumber(root.sessionId) ??
            firstNumber(root.id) ??
            firstNumber(root.session?.id) ??
            firstNumber(root.session?.sessionId) ??
            firstNumber(root.result?.sessionId) ??
            firstNumber(root.result?.session?.id) ??
            null;

        const title =
            root.title ??
            root.session?.title ??
            root.quizSet?.title ??
            root.result?.title ??
            "";

        // 문항 ID는 root 전체를 대상으로 한 번에 긁어오기 (가장 관대한 전략)
        const questionIds =
            collectQuestionIds(root) ||
            [];

        return { sessionId: sid, title, questionIds };
    }

    const basePath = React.useMemo(
        () => (location.pathname.startsWith("/learning") ? "/learning" : ""),
        [location.pathname]
    );

    // async function fetchQuestionIdsBySession(sessionId: number | string): Promise<number[]> {
    //     const call = (url: string) =>
    //         http.get(url, {
    //             headers: { ...authHeader() },
    //             withCredentials: true,
    //             validateStatus: () => true,
    //         });
    //
    //     let res = await call(`/me/quiz/sessions/${sessionId}`);
    //     if (res.status === 404) {
    //         res = await call(`/api/me/quiz/sessions/${sessionId}`);
    //     }
    //
    //     if (res.status >= 200 && res.status < 300) {
    //         const norm = normalizeStartResponse(res.data);
    //         return Array.isArray(norm.questionIds) ? norm.questionIds : [];
    //     }
    //     throw new Error(`fetch session failed: HTTP ${res.status}`);
    // }

    const goToNotes = React.useCallback(() => {
        const base = location.pathname.startsWith("/learning") ? "/learning" : "";
        navigate(`${base}/note`);
    }, [location.pathname, navigate]);

    /** 용어 카드 1장씩 등장 */
    const CARD_STAGGER_MS = 90;
    const CARD_MAX_STAGGER_INDEX = 6;
    const [visibleCount, setVisibleCount] = React.useState(0);
    const listRef = React.useRef<HTMLDivElement | null>(null);

    return (
        <NarrowLeft style={{ padding: "8px 0 24px" }}>  {/* SearchBar와 동일 폭/정렬 */}
            {/* 상단 */}
            <LearningPageHeader
                title={wordbookName}
                count={`${(count ?? total).toLocaleString()}개`}
                onBack={goToNotes}
                meta={
                    <HeaderMeta>
                        <MetaSep aria-hidden="true">|</MetaSep>

                        <SortInlineWrap ref={inlineSortRef}>
                            <SortInlineBtn
                                type="button"
                                aria-haspopup="menu"
                                aria-expanded={sortInlineOpen}
                                onClick={() => {
                                    setSortInlineOpen((v) => !v);
                                    setMenuOpen(false);
                                    setPdfMenuOpen(false);
                                }}
                            >
                                {sortLabel}
                            </SortInlineBtn>

                            {sortInlineOpen && (
                                <SortPopup role="menu" aria-label="정렬하기">
                                    <RadioItem
                                        $checked={sortKey === "createdAt_desc"}
                                        onClick={() => applySort("createdAt_desc")}
                                    >
                                        <span /> 최신 등록순
                                    </RadioItem>
                                    <RadioItem
                                        $checked={sortKey === "title_asc"}
                                        onClick={() => applySort("title_asc")}
                                    >
                                        <span /> 제목순
                                    </RadioItem>
                                    <RadioItem
                                        $checked={sortKey === "title_desc"}
                                        onClick={() => applySort("title_desc")}
                                    >
                                        <span /> 제목역순
                                    </RadioItem>
                                    <RadioItem
                                        $checked={sortKey === "status_asc"}
                                        onClick={() => applySort("status_asc")}
                                    >
                                        <span /> 상태: 학습 중 → 학습 완료
                                    </RadioItem>
                                    <RadioItem
                                        $checked={sortKey === "status_desc"}
                                        onClick={() => applySort("status_desc")}
                                    >
                                        <span /> 상태: 학습 완료 → 학습 중
                                    </RadioItem>
                                </SortPopup>
                            )}
                        </SortInlineWrap>

                        {selectedTermIds.size > 0 && (
                            <Count>{`· 선택 ${fmt(selectedTermIds.size)}`}</Count>
                        )}
                    </HeaderMeta>
                }
                right={
                    <div
                        ref={actionsRef}
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <SettingsBtn
                            type="button"
                            onClick={() => {
                                setMenuOpen((v) => !v);
                                setPdfMenuOpen(false);
                                setSortInlineOpen(false);
                            }}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 9.5A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5Zm7.5 2a1 1 0 0 0-.8-.98l-1.39-.27a5.9 5.9 0 0 0-.56-1.34l.8-1.17a1 1 0 0 0-.12-1.25l-1.1-1.1a1 1 0 0 0-1.25-.12l-1.17.8c-.43-.24-.88-.43-1.35-.57L12.5 4.3a1 1 0 0 0-1-.8h-1.5a1 1 0 0 0-.98.8l-.27 1.39c-.47.14-.92.33-1.35.57l-1.17-.8a1 1 0 0 0-1.25.12l-1.1 1.1a1 1 0 0 0-.12 1.25l.8 1.17c-.24.43-.43.88-.57 1.34L2.3 11.5a1 1 0 0 0-.8.98v1.5a1 1 0 0 0 .8.98l1.39.27c.14.47.33.92.57 1.35l-.8 1.17a1 1 0 0 0 .12 1.25l1.1 1.1a1 1 0 0 0 1.25.12l1.17-.8c.43.24.88.43 1.35.57l.27 1.39a1 1 0 0 0 .98.8h1.5a1 1 0 0 0 .98-.8l.27-1.39c.47-.14.92-.33 1.35-.57l1.17.8a1 1 0 0 0 1.25-.12l1.1-1.1a1 1 0 0 0 .12-1.25l-.8-1.17c.24-.43.43-.88.57-1.35l1.39-.27a1 1 0 0 0 .8-.98v-1.5Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>설정</span>
                        </SettingsBtn>

                        {menuOpen && (
                            <PdfSubMenu role="menu" aria-label="폴더 설정">
                                    <div
                                        style={{
                                            padding: "4px 4px 2px",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: UI.color.muted,
                                        }}
                                    >
                                        보기 설정
                                    </div>
                                    <RadioItem onClick={cycleTitleMode}>
                                        <span />
                                        {titleMode === "allHidden"
                                            ? "단어 전체 보이기"
                                            : "단어 전체 숨기기"}
                                    </RadioItem>
                                    <RadioItem onClick={cycleDescMode}>
                                        <span />
                                        {descMode === "allHidden"
                                            ? "뜻 전체 보이기"
                                            : "뜻 전체 숨기기"}
                                    </RadioItem>

                                    <div
                                        style={{
                                            borderTop: `1px solid ${UI.color.line}`,
                                            margin: "6px 0",
                                        }}
                                    />

                                    <div
                                        style={{
                                            padding: "2px 4px 2px",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: UI.color.muted,
                                        }}
                                    >
                                        선택/이동
                                    </div>
                                    <RadioItem onClick={() => toggleAll(!allOn)}>
                                        <span />
                                        {allOn
                                            ? "현재 페이지 전체 선택 해제"
                                            : "현재 페이지 전체 선택"}
                                    </RadioItem>
                                    <RadioItem onClick={openMove}>
                                        <span />
                                        선택 항목 다른 폴더로 이동
                                    </RadioItem>
                                    <RadioItem onClick={handleDeleteSelected}>
                                        <span />
                                        선택 항목 삭제
                                    </RadioItem>

                                    <div
                                        style={{
                                            borderTop: `1px solid ${UI.color.line}`,
                                            margin: "6px 0",
                                        }}
                                    />

                                    <div
                                        style={{
                                            padding: "2px 4px 2px",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: UI.color.muted,
                                        }}
                                    >
                                        PDF 내보내기
                                    </div>
                                    <RadioItem onClick={() => setPdfMenuOpen((v) => !v)}>
                                        <span />
                                        PDF 내보내기 옵션
                                    </RadioItem>

                                    {pdfMenuOpen && (
                                        <div style={{ marginTop: 4, paddingLeft: 18 }}>
                                            <RadioItem onClick={handleExportSelectedPdf}>
                                                <span />
                                                선택 항목만 PDF로 내보내기
                                            </RadioItem>
                                            <RadioItem onClick={handleExportWholeFolderPdf}>
                                                <span />
                                                폴더 전체를 PDF로 내보내기
                                            </RadioItem>
                                        </div>
                                    )}
                                </PdfSubMenu>
                            )}
                        </div>
                }
            />

            {/* 본문 */}
            {error ? (
                <p style={{ color: "red", padding: 20 }}>{error}</p>
            ) : loading && items.length === 0 ? (
                <p style={{ padding: 20 }}>⏳ 불러오는 중...</p>
            ) : items.length === 0 ? (
                <Empty>아직 담긴 용어가 없습니다.</Empty>
            ) : (
                <>
                    <Grid ref={listRef}>
                        {displayItems.map((it, idx) => {
                            const ov = cardView[it.uwtId] || {};

                            const titleHidden =
                                ov.t === "hide"
                                    ? true
                                    : ov.t === "show"
                                        ? false
                                        : titleMode === "allHidden"
                                            ? true
                                            : titleMode === "allShown"
                                                ? false
                                                : false;
                            const descHidden =
                                ov.d === "hide"
                                    ? true
                                    : ov.d === "show"
                                        ? false
                                        : descMode === "allHidden"
                                            ? true
                                            : descMode === "allShown"
                                                ? false
                                                : false;

                            const isChecked = !!checked[it.uwtId];
                            const status = learn[it.uwtId] ?? "unmemorized";
                            const done = status === "memorized";
                            const isSaving = !!saving[it.uwtId];

                            const isVisible = idx < visibleCount;
                            const delayMs = isVisible
                                ? Math.min(idx, CARD_MAX_STAGGER_INDEX) * CARD_STAGGER_MS
                                : 0;

                            return (
                                <CardWrap
                                    key={it.uwtId}
                                    data-term-idx={idx}
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? "translateY(0)" : "translateY(8px)",
                                        transition: "opacity 240ms ease, transform 240ms ease",
                                        transitionDelay: `${delayMs}ms`,
                                    }}
                                >
                                    <SelectToggleChip
                                        checked={isChecked}
                                        ariaLabel={isChecked ? "선택 해제" : "선택"}
                                        title={isChecked ? "선택 해제" : "선택"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleItem(it.uwtId);
                                        }}
                                    />

                                    <StatusBtn
                                        $done={done}
                                        disabled={isSaving || !it.termId}
                                        title={
                                            !it.termId
                                                ? "이 항목은 termId가 없어 암기 상태를 저장할 수 없어요."
                                                : undefined
                                        }
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (isSaving || !it.termId) return;
                                            const prev = learn[it.uwtId] ?? "unmemorized";
                                            const nextLocal =
                                                prev === "memorized" ? "unmemorized" : "memorized";
                                            setLearn((m) => ({ ...m, [it.uwtId]: nextLocal }));
                                            setSaving((m) => ({ ...m, [it.uwtId]: true }));
                                            try {
                                                await setMemorization({
                                                    termId: Number(it.termId),
                                                    done: nextLocal === "memorized",
                                                });
                                            } catch (err) {
                                                setLearn((m) => ({ ...m, [it.uwtId]: prev }));
                                            } finally {
                                                setSaving((m) => ({ ...m, [it.uwtId]: false }));
                                            }
                                        }}
                                    >
                                        {done ? "학습 완료" : "학습 중"}
                                    </StatusBtn>

                                    <HideTermCardAdd
                                        $hideTitle={titleHidden}
                                        $hideDesc={descHidden}
                                    >
                                        <TermCard
                                            id={Number(it.termId || it.uwtId)}
                                            title={it.title}
                                            description={it.description}
                                            tags={it.tags ?? []}
                                        />
                                    </HideTermCardAdd>

                                    <LearnRow aria-label="학습 모드">
                                        <LearnLabel>학습 모드</LearnLabel>
                                        <LearnSeg role="group" aria-label="학습 모드 선택">
                                            <LearnBtn
                                                $active={titleHidden}
                                                aria-pressed={titleHidden}
                                                onClick={() => {
                                                    setCardView((prev) => {
                                                        const cur = prev[it.uwtId] || {};
                                                        if (titleMode === "allHidden") {
                                                            const nextT = cur.t === "show" ? undefined : "show";
                                                            return { ...prev, [it.uwtId]: { ...cur, t: nextT } };
                                                        }
                                                        if (titleMode === "allShown") {
                                                            const nextT = cur.t === "hide" ? undefined : "hide";
                                                            return { ...prev, [it.uwtId]: { ...cur, t: nextT } };
                                                        }
                                                        const nextT = cur.t === "hide" ? undefined : "hide";
                                                        return { ...prev, [it.uwtId]: { ...cur, t: nextT } };
                                                    });
                                                }}
                                            >
                                                {titleHidden ? "단어 보이기" : "단어 숨기기"}
                                            </LearnBtn>

                                            <LearnBtn
                                                $active={descHidden}
                                                aria-pressed={descHidden}
                                                onClick={() => {
                                                    setCardView((prev) => {
                                                        const cur = prev[it.uwtId] || {};
                                                        if (descMode === "allHidden") {
                                                            const nextD = cur.d === "show" ? undefined : "show";
                                                            return { ...prev, [it.uwtId]: { ...cur, d: nextD } };
                                                        }
                                                        if (descMode === "allShown") {
                                                            const nextD = cur.d === "hide" ? undefined : "hide";
                                                            return { ...prev, [it.uwtId]: { ...cur, d: nextD } };
                                                        }
                                                        const nextD = cur.d === "hide" ? undefined : "hide";
                                                        return { ...prev, [it.uwtId]: { ...cur, d: nextD } };
                                                    });
                                                }}
                                            >
                                                {descHidden ? "뜻 보이기" : "뜻 숨기기"}
                                            </LearnBtn>
                                        </LearnSeg>
                                    </LearnRow>
                                </CardWrap>
                            );
                        })}
                    </Grid>

                    {total > 0 && (
                        <div style={{ marginTop: 16}}>
                            <Pagination page={page} size={size} total={total} onChange={handlePageChange} />
                        </div>
                    )}
                </>
            )}

            {/* 하단 Export Tray */}
            {selectedTermIds.size > 0 && (
                <Tray>
        <span>
            선택 {selectedTermIds.size.toLocaleString()}개 — 필요한 페이지를 더 불러온 뒤에도 선택은 유지돼요.
        </span>

                    <div style={{ display: "flex", gap: 8 }}>
                        {/* 현재 페이지 전체 선택 / 해제 */}
                        <button
                            type="button"
                            onClick={() => toggleAll(!allOn)}
                            style={{
                                border: `1px solid ${UI.color.line}`,
                                background: "transparent",
                                color: "#fff",
                                padding: "8px 12px",
                                borderRadius: 8,
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {allOn ? "현재 페이지 선택 해제" : "현재 페이지 전체 선택"}
                        </button>

                        {/* 선택 전체 초기화 (전 페이지 통합 선택 바구니 비우기) */}
                        <button
                            type="button"
                            onClick={clearAllSelected}
                            style={{
                                border: `1px solid ${UI.color.line}`,
                                background: "transparent",
                                color: "#fff",
                                padding: "8px 12px",
                                borderRadius: 8,
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            모두 해제
                        </button>

                        {/* 선택 항목 PDF 내보내기 */}
                        <button
                            type="button"
                            onClick={handleExportSelectedPdf}
                            disabled={exporting}
                            style={{
                                border: 0,
                                background: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
                                color: "#fff",
                                padding: "8px 14px",
                                borderRadius: 999,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                                opacity: exporting ? 0.85 : 1,
                                cursor: exporting ? "default" : "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {exporting ? "내보내는 중..." : "선택 항목 PDF 내보내기"}
                        </button>
                    </div>
                </Tray>
            )}


            <SystemMessageModal
                open={systemMessageOpen && !!systemMessage}
                message={systemMessage}
                onClose={() => {
                    setSystemMessageOpen(false);
                    setSystemMessage(null);
                }}
            />
            {/* 이동 모달 */}
            <PotenNoteModal
                open={moveOpen}
                notebooks={notebooks}
                onClose={() => setMoveOpen(false)}
                onCreate={async (name) => {
                    const { data } = await http.post(
                        "/me/folders",
                        { wordbookName: name },
                        { headers: { ...authHeader() } }
                    );
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
                        console.error("[PotenNoteModal] 폴더 순서 변경 실패", e);
                        alert("폴더 순서 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                        throw e;
                    }
                }}
                onSave={handleConfirmMove}
                onGoToFolder={(fid, name) => {
                    setMoveOpen(false);
                    navigate(`/learning/folders/${fid}`, { state: { wordbookName: name } });
                }}
                onRename={async (wordbookId, newName) => {
                    await renameUserFolder(wordbookId, newName);
                    setNotebooks((prev) => prev.map((n) => (n.id === wordbookId ? { ...n, name: newName } : n)));
                }}
                onRequestDelete={async (fid) => {
                    await deleteUserFolder(fid, "purge");
                    setNotebooks(await fetchUserFolders());
                }}
                onRequestBulkDelete={async (ids) => {
                    if (!confirm(`선택 ${ids.length}개 폴더 삭제? (안의 용어도 삭제)`)) return;
                    setNotebooks(await fetchUserFolders());
                }}
            />
        </NarrowLeft>

    );
}
