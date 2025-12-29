import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import http, { authHeader } from "../../utils/http.ts";
import { fetchMyFoldersWithStats } from "../../api/folderStats.ts";
import { goToAccountLogin } from "../../utils/auth.ts";
import { NarrowLeft } from "../../styles/layout.ts";
import { usePotenDialog } from "../../components/common/PotenDialog.tsx";

/* ===== UI tokens (WordbookFolderPage와 일치) ===== */
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
    },
    gradient: {
        brand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
    },
    radius: { xl: 20, lg: 14, md: 12, sm: 10, pill: 999 },
    shadow: {
        card: "0 1px 0 rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.06)",
        bar: "0 6px 20px rgba(0,0,0,0.06)",
        menu: "0 8px 24px rgba(0,0,0,0.12)",
    },
    font: { h2: "22px", body: "15px", tiny: "12px" },
};

/* ===== 상단 툴바 (WordbookFolderPage 스타일) ===== */
const Toolbar = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  background: ${UI.color.bg};
  padding: 12px 8px;
  margin-bottom: 16px;
`;

const RowFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  padding: 6px 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${UI.font.h2};
  letter-spacing: -0.01em;
  color: ${UI.color.text};
`;

const Count = styled.span`
  margin-left: 8px;
  font-size: ${UI.font.body};
  font-weight: 400;
  letter-spacing: -0.02em;
  color: ${UI.color.muted};
  line-height: 1;
`;

const Spacer = styled.div` flex: 1 1 auto; `;

/* ===== 인라인 정렬 팝업 (WordbookFolderPage 포맷) ===== */
const SortInlineWrap = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  isolation: isolate;
`;
const SortInlineBtn = styled.button`
    position: relative;
    z-index: 0;
    padding: 0;
    border: 0;
    background: transparent;
    font-size: ${UI.font.body};
    font-weight: 400;
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
    cursor: pointer;
    line-height: 1;
    border-radius: ${UI.radius.pill}px;
    -webkit-tap-highlight-color: transparent;

    &::after{
        content:"";
        position:absolute; inset:-6px -10px;
        background:#fafafa; border-radius:10px; opacity:0;
        transition:opacity .12s ease; pointer-events:none;
        z-index: -1;
    }
    &:hover::after,
    &:focus-visible::after,
    &[aria-expanded="true"]::after { opacity:1; }
    &:focus-visible { outline:none; box-shadow:0 0 0 3px rgba(79,118,241,.25); }
`;
const SortPopup = styled.div`
  position: absolute;
  top: 22px; left: -8px;
  min-width: 200px;
  background: #fff;
  border: 1px solid ${UI.color.line};
  border-radius: 12px;
  box-shadow: ${UI.shadow.menu};
  padding: 6px; z-index: 8;
`;
const RadioItem = styled.button<{ $checked?: boolean }>`
  width: 100%;
  text-align: left;
  border: 0; background: transparent;
  border-radius: 8px; padding: 10px 12px; cursor: pointer;
  display:flex; align-items:center; gap:10px;
  &:hover{ background:#f9fafb; }
  & > span:first-child{
    display:inline-flex; width:16px; height:16px; border-radius:999px;
    border:2px solid ${UI.color.primaryStrong};
    background: ${({$checked}) => $checked ? UI.gradient.brand : "transparent"};
  }
`;
const Sep = styled.span` margin: 0 8px; color: ${UI.color.muted}; `;

/* ===== 검색/버튼 ===== */
const SearchInput = styled.input`
  width: 280px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid ${UI.color.line};
  padding: 0 12px 0 36px;
  background: #fff url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='7' stroke='%239aa0a6' stroke-width='2'/%3E%3Cpath d='M20 20l-3.2-3.2' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat 10px 50%;
  font-size: 14px;
  &:focus { outline: none; border-color: ${UI.color.primaryStrong}; box-shadow: 0 0 0 3px rgba(62,99,224,.16); }
`;

const Primary = styled.button`
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid ${UI.color.primary};
  background: ${UI.color.primary};
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: filter .15s ease, transform .08s ease;
  &:hover{ filter: brightness(.96); }
  &:active{ transform: translateY(1px); }
  &:focus-visible{ outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
`;

/* ===== 목록 패널 ===== */
const Panel = styled.div`
  border: 1px solid ${UI.color.line};
  border-radius: 12px;
  background: #fff;
  box-shadow: ${UI.shadow.card};
  overflow: visible;
  position: relative;
`;

const HeadRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 120px 220px 160px 48px;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid #eef2f7;
  background: #f8fafc;
  font-weight: 750;
  letter-spacing: -0.02em;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 120px 220px 160px 48px;
  align-items: center;
  gap: 8px;
  padding: 18px;
  border-bottom: 1px solid #eef2f7;
  &:last-child { border-bottom: 0; }
`;

const Cell = styled.div<{ $muted?: boolean }>`
  color: ${({ $muted }) => ($muted ? UI.color.muted : UI.color.text)};
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
    appearance: none;
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 3px;
    border: 1px solid #e6ebf2;
    background: linear-gradient(180deg, #f7f9fc 0%, #f3f6fb 100%);
    background-clip: padding-box;
    display: inline-grid;
    place-content: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    box-shadow: none;
    transition:
            border-color .15s ease,
            background-color .15s ease,
            transform .08s ease;

    &:hover {
        background: linear-gradient(180deg, #f8fbff 0%, #f1f5ff 100%);
    }
    &:active { transform: scale(.98); }

    &:focus-visible {
        outline: 2px solid rgba(79,118,241,.55);
        outline-offset: 2px;
    }

    &::after {
        content: "";
        width: 12px;
        height: 12px;
        background: center / contain no-repeat
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 7L10 17l-6-6' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        opacity: 0;
        transform: scale(.96);
        transition: opacity .06s ease-out, transform .06s ease-out;
    }

    &:checked {
        border-color: ${UI.color.primaryStrong};
        background: ${UI.gradient.brand};
    }
    &:checked::after {
        opacity: 1;
        transform: scale(1);
    }

    &:indeterminate{
        border-color: ${UI.color.primaryStrong};
        background: linear-gradient(180deg, #f7f9fc 0%, #eef3ff 100%);
    }
    &:indeterminate::after{
        content: "";
        width: 10px;
        height: 2px;
        border-radius: 2px;
        background: ${UI.color.primaryStrong};
        opacity: 1;
        transform: none;
    }
`;


const WordbookName = styled.button`
  appearance: none; border: 0; background: transparent;
  font-size: 18px; font-weight: 700; letter-spacing: -0.02em;
  text-align: left; cursor: pointer; color: ${UI.color.text};
  &:hover { text-decoration: underline; }
`;

/* 진행률 바 · 컬러 통일 */
const ProgressBar = styled.div`
    width: 100%;
    height: 26px;
    border-radius: 999px;
    background: #eef2f7;
    position: relative;
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
    position: absolute;
    inset: 0 auto 0 0;
    width: ${({ $pct }) => Math.max(0, Math.min(100, $pct))}%;
    background: ${UI.color.primary};
    z-index: 0; /* ← 바는 아래 */
`;

const ProgressText = styled.div<{ $pct: number }>`
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    /* 진행률 낮으면(회색 바 위) 진한 텍스트, 높으면(파란 바 위) 흰 텍스트 */
    color: ${({ $pct }) => ($pct < 45 ? UI.color.text : "#fff")};
    font-weight: 600;
    font-size: 13px;
    text-shadow: none;
    z-index: 1;
    pointer-events: none;
`;

const Kebab = styled.button`
  appearance: none; border: 0; background: transparent;
  font-size: 22px; line-height: 1; cursor: pointer; color: ${UI.color.muted};
`;

/* ---------- Pagination (WordbookFolderPage 스타일) ---------- */
type PaginationProps = {
    page: number; size: number; total: number;
    onChange: (nextPageZeroBased: number) => void;
};

const PaginationNav = styled.nav`
  margin-top: 16px;
  display: flex; align-items: center; justify-content: center;
  gap: 8px; user-select: none;
`;

const PageNumBtn = styled.button<{ $active: boolean }>`
  min-width: 34px; height: 34px; padding: 0 10px; border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? UI.color.primary : UI.color.line)};
  background: ${({ $active }) => ($active ? UI.color.primary : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : UI.color.text)};
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  cursor: pointer;
`;

const NavBtn = styled.button<{ $disabled: boolean }>`
  width: 34px; height: 34px; border-radius: 999px; border: 1px solid ${UI.color.line};
  background: #fff; color: ${({ $disabled }) => ($disabled ? "#c7c7c7" : UI.color.text)};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  display: inline-flex; align-items: center; justify-content: center;
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
            <NavBtn aria-label="처음" onClick={() => go(1)} disabled={current === 1} $disabled={current === 1}>«</NavBtn>
            <NavBtn aria-label="이전" onClick={() => go(current - 1)} disabled={current === 1} $disabled={current === 1}>‹</NavBtn>
            {nums.map((n) => (
                <PageNumBtn key={n} onClick={() => go(n)} aria-current={n === current ? "page" : undefined} $active={n === current}>
                    {n}
                </PageNumBtn>
            ))}
            <NavBtn aria-label="다음" onClick={() => go(current + 1)} disabled={current === totalPages} $disabled={current === totalPages}>›</NavBtn>
            <NavBtn aria-label="마지막" onClick={() => go(totalPages)} disabled={current === totalPages} $disabled={current === totalPages}>»</NavBtn>
        </PaginationNav>
    );
};

function pickTotal(x: any): number {
    const headersTotal = Number(x?.headers?.["x-total-count"] ?? x?.headers?.["X-Total-Count"]);
    if (Number.isFinite(headersTotal)) return headersTotal;

    const cands = [
        x?.total,
        x?.totalItems,
        x?.totalElements,
        x?.totalCount,
        x?.page?.totalElements,
        x?.pagination?.total,
        x?.meta?.totalItems,
        x?.meta?.total,
    ];
    for (const n of cands) if (typeof n === "number" && n >= 0) return n;
    return 0;
}

// 가운데 정렬 셀 + 진행률 열용 스택 추가
const CellCenter = styled(Cell)`
  text-align: center;
`;

const CenterStack = styled.div`
    display: grid;
    gap: 6px;
    justify-items: stretch;   
    text-align: center;
`;

/* ===== 케밥 메뉴 ===== */
const CellAction = styled.div`
    position: relative;
    text-align: right;
    overflow: visible;
`;

const MenuPopup = styled.div`
  position: absolute;
  top: 28px;
  right: 0;
  min-width: 220px;
  background: #fff;
  border: 1px solid ${UI.color.line};
  border-radius: 12px;
  box-shadow: ${UI.shadow.menu};
  padding: 6px;
  z-index: 20;
`;

const MenuItemBtn = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: ${UI.font.body};
  color: ${UI.color.text};
  display: flex; align-items: center; gap: 10px;
  &:hover { background: #f9fafb; }
`;

const DangerItemBtn = styled(MenuItemBtn)`
  color: #ef4444;
`;

const GlobalOverlay = styled.div`
  position: fixed; inset: 0;
  background: transparent;
  z-index: 7;
`;


/* ===== Types ===== */
type Folder = {
    id: string | number;
    name: string;
    termCount?: number;
    learnedCount?: number;
    updatedAt?: string;
    lastStudiedAt?: string | null;
};

type PlainItems<T> = { items: T[] };
type SpringPage<T> = { content: T[]; totalElements?: number };
type NestedData<T> = { data: { items: T[]; total?: number } };
type LegacyList<T> = { list: T[]; pagination?: { total: number } };

function hasItems<T>(x: unknown): x is PlainItems<T> {
    return Array.isArray((x as any)?.items);
}
function hasContent<T>(x: unknown): x is SpringPage<T> {
    return Array.isArray((x as any)?.content);
}
function hasNestedData<T>(x: unknown): x is NestedData<T> {
    return Array.isArray((x as any)?.data?.items);
}
function hasList<T>(x: unknown): x is LegacyList<T> {
    return Array.isArray((x as any)?.list);
}

// ===== Empty / NoResult =====
const EmptyWrap = styled.div`
  border: 1px solid ${UI.color.line};
  border-radius: 16px;
  background:
    radial-gradient(800px 400px at 50% -120px, rgba(79,118,241,.08) 0%, rgba(62,99,224,.04) 35%, rgba(255,255,255,0) 70%),
    #fff;
  box-shadow: ${UI.shadow.card};
  padding: 48px 28px;
  display: grid;
  gap: 18px;
  place-items: center;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 68px; height: 68px; border-radius: 16px;
  background: ${UI.gradient.brand};
  box-shadow: 0 10px 30px rgba(62,99,224,.28);
  display:grid; place-items:center;
  &::before{
    content:"";
    width: 36px; height: 36px;
    background: center/contain no-repeat
      url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white'%3E%3Cpath d='M6 4h7l3 3h2a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z'/%3E%3Crect x='7' y='11' width='10' height='2' rx='1'/%3E%3Crect x='7' y='15' width='6' height='2' rx='1'/%3E%3C/g%3E%3C/svg%3E");
  }
`;

const EmptyTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.01em;
  color: ${UI.color.text};
`;

const EmptyDesc = styled.p`
  margin: 0;
  max-width: 560px;
  color: ${UI.color.muted};
  font-size: ${UI.font.body};
  line-height: 1.6;
`;

const EmptyActions = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
`;

const GhostBtn = styled.button`
  height: 38px; padding: 0 14px;
  border-radius: 8px; border: 1px solid ${UI.color.line};
  background: #fff; color: ${UI.color.text};
  font-weight: 700; cursor: pointer;
  transition: background .15s ease, transform .08s ease, filter .15s ease;
  &:hover { background: #f9fafb; }
  &:active { transform: translateY(1px); }
  &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
`;

const NoResultWrap = styled(EmptyWrap)`
  background:
    radial-gradient(800px 400px at 50% -120px, rgba(17,24,39,.05) 0%, rgba(17,24,39,.02) 35%, rgba(255,255,255,0) 70%),
    #fff;
`;

/* ===== Utils ===== */
function formatKR(dateIso?: string) {
    if (!dateIso) return "-";
    try {
        const normalized = dateIso.replace(/(\.\d{3})\d+$/, "$1");
        const d = new Date(normalized);
        return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch {
        return "-";
    }
}

/* ===== Page ===== */
type SortKey = "title_asc" | "updated_desc" | "updated_asc" | "terms_desc" | "terms_asc" | "studied_desc";

export default function PotenNoteHomePage() {
    const nav = useNavigate();
    const location = useLocation();

    const dialogs = usePotenDialog();

    // 로그인 가드
    React.useEffect(() => {
        const loggedIn = !!localStorage.getItem("isLoggedIn");
        if (!loggedIn) {
            goToAccountLogin(location.pathname + location.search);
        }
    }, [location.pathname, location.search]);

    // 목록
    const [all, setAll] = React.useState<Folder[]>([]);
    const [q, setQ] = React.useState("");
    const [sortKey, setSortKey] = React.useState<SortKey>("updated_desc");
    const [sortOpen, setSortOpen] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [perPage, setPerPage] = React.useState(20);
    const [total, setTotal] = React.useState(0);

    const sortToServer = (k: SortKey) => {
        switch (k) {
            case "title_asc":   return "name,asc";
            case "updated_asc": return "updatedAt,asc";
            case "terms_desc":  return "termCount,desc";
            case "terms_asc":   return "termCount,asc";
            case "studied_desc":return "lastStudiedAt,desc";
            case "updated_desc":
            default:            return "updatedAt,desc";
        }
    };

    const display = all;

    // 선택(체크박스)
    const [selected, setSelected] = React.useState<Set<string | number>>(new Set());

    // 마스터 체크박스 ref + indeterminate 동기화
    const masterRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (!masterRef.current) return;
        masterRef.current.indeterminate =
            selected.size > 0 && selected.size < display.length;
    }, [selected.size, display.length]);

    const toggleAll = (checked: boolean) => {
        setSelected(checked ? new Set(display.map((f) => f.id)) : new Set());
    };
    const toggleOne = (id: string | number, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            checked ? next.add(id) : next.delete(id);
            return next;
        });
    };

    const createFolder = async () => {
        const name = await dialogs.prompt({
            title: "새 폴더 만들기",
            label: "폴더 이름",
            placeholder: "새 폴더 이름을 입력하세요",
            okText: "생성하기",
            validator: (v) => {
                const raw = v.trim();
                if (!raw) return "공백만 입력할 수 없어요.";
                if (raw.length > 60) return "폴더 이름은 최대 60자입니다.";
                // 중복 방지(현재 페이지 목록 기준)
                const normalized = raw.replace(/\s+/g, " ").toLowerCase();
                const dup = all.some(f => (f.name ?? "").trim().replace(/\s+/g, " ").toLowerCase() === normalized);
                if (dup) return "동일한 이름의 폴더가 이미 존재합니다.";
                return;
            },
        });
        if (!name) return;
        try {
            const { data } = await http.post("/me/folders", { wordbookName: name }, { headers: { ...authHeader() } });
            setAll((prev) => [
                { id: data.id, name: data.wordbookName ?? name, termCount: 0, learnedCount: 0, updatedAt: new Date().toISOString() },
                ...prev,
            ]);
            setTotal((t) => (typeof t === "number" ? (t || 0) + 1 : 1)); // ⚡ 추가
        } catch (e: any) {
            await dialogs.alert({
                title: "폴더 생성에 실패했습니다.",
                description: e?.response?.data?.message || "잠시 후 다시 시도해 주세요.",
                okText: "확인",
            });
        }
    };

    const sortLabel = React.useMemo(() => {
        switch (sortKey) {
            case "title_asc": return "제목순";
            case "updated_asc": return "오래된 업데이트";
            case "terms_desc": return "단어 수 많은순";
            case "terms_asc": return "단어 수 적은순";
            case "studied_desc": return "최근 학습";
            case "updated_desc":
            default: return "최근 업데이트";
        }
    }, [sortKey]);

    const handlePageChange = (nextZeroBased: number) => {
        setPage(nextZeroBased);
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    };



    React.useEffect(() => {
        let cancel = false;

        const run = async () => {
            try {
                const qStr = q.trim() || undefined;
                const call = (p: number) =>
                    fetchMyFoldersWithStats({
                        // page index 다양한 명칭 동시 지원
                        page: p,
                        pageIndex: p,
                        pageNo: p + 1,
                        // page size 다양한 명칭 동시 지원
                        size: perPage,
                        limit: perPage,
                        perPage,
                        sort: sortToServer(sortKey),
                        q: qStr,
                        _ts: Date.now()
                    });

                // 1) 호출
                const res: any = await call(page);
                console.log('[folders:stats raw]', res?.data ?? res);
                if (cancel) return;

                // 헤더 기반 총개수 우선 파싱 (Axios 응답일 때)
                let headerTotal: number | undefined;
                if (res?.headers) {
                    const h = res.headers;
                    const raw = h["x-total-count"] ?? h["X-Total-Count"];
                    const n = Number(raw);
                    headerTotal = Number.isFinite(n) ? n : undefined;
                }

                // 2) 타입 가드로 items/total 파싱
                let items: any[] = [];

                // Axios 응답의 data가 배열인 경우
                if (Array.isArray(res?.data)) {
                    items = res.data;
                }
                // 기존 포맷들
                else if (hasItems<any>(res)) items = res.items;
                else if (hasContent<any>(res)) items = res.content;
                else if (hasNestedData<any>(res)) items = res.data.items;
                else if (hasList<any>(res)) items = res.list;
                // API 래퍼가 바로 배열을 리턴하는 경우
                else if (Array.isArray(res)) {
                    items = res;
                }

                let tt = pickTotal(res);

                // 헤더 total이 있으면 우선 사용
                if ((!tt || tt === 0) && typeof headerTotal === "number") {
                    tt = headerTotal;
                }

                // 3) 1-base 백엔드일 수 있어 비어있으면 보정 재시도 (기존 유지)
                if (items.length === 0 && page > 0) {
                    const retry: any = await call(page + 1);
                    if (!cancel) {
                        let retryItems: any[] = [];
                        if (Array.isArray(retry?.data)) retryItems = retry.data;
                        else if (hasItems<any>(retry)) retryItems = retry.items;
                        else if (hasContent<any>(retry)) retryItems = retry.content;
                        else if (hasNestedData<any>(retry)) retryItems = retry.data.items;
                        else if (hasList<any>(retry)) retryItems = retry.list;
                        else if (Array.isArray(retry)) retryItems = retry;

                        items = retryItems;

                        // 재시도 응답에서도 헤더 total 체크
                        let retryHeaderTotal: number | undefined;
                        if (retry?.headers) {
                            const hh = retry.headers;
                            const raw2 = hh["x-total-count"] ?? hh["X-Total-Count"];
                            const n2 = Number(raw2);
                            retryHeaderTotal = Number.isFinite(n2) ? n2 : undefined;
                        }
                        tt = pickTotal(retry as any) || tt;
                        if ((!tt || tt === 0) && typeof retryHeaderTotal === "number") {
                            tt = retryHeaderTotal;
                        }
                    }
                }

                console.log('[folders:stats items][0]', Array.isArray(items) ? items[0] : items);

                // 4) 정규화
                const todayIso = new Date().toISOString();
                const normalized: Folder[] = (items || []).map((f: any) => ({
                    id: f.id,
                    name: f.name ?? f.wordbookName ?? "이름없음",
                    termCount: f.termCount ?? 0,
                    learnedCount: f.learnedCount ?? 0,
                    updatedAt: f.updatedAt ?? todayIso,
                    lastStudiedAt: f.lastStudiedAt ?? null,
                }));

                setAll(normalized);
                setTotal(tt || 0);
            } catch (e) {
                console.warn("[notes] fetch folders(paged) 실패:", e);
                setAll([]);
                setTotal(0);
            }
        };

        const t = setTimeout(run, 250);
        return () => { cancel = true; clearTimeout(t); };
    }, [page, perPage, sortKey, q]);

    React.useEffect(() => { setPage(0); }, [q, sortKey, perPage]);

    const pagerTotal =
        total ||
        (all.length === perPage
            ? (page + 2) * perPage
            : page * perPage + all.length);
    const showPager = total > 0 || page > 0 || all.length === perPage;

    // 케밥 메뉴 오픈 대상 id (행 단위로 1개만 열림)
    const [menuFor, setMenuFor] = React.useState<string | number | null>(null);
    const closeMenu = () => setMenuFor(null);

    // ESC로 닫기
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // 이름 변경
    async function handleRename(folder: Folder) {
        closeMenu();
        const next = await dialogs.prompt({
            title: "포텐노트 이름 변경",
            label: "새로운 이름",
            initialValue: folder.name,
            okText: "저장",
            validator: (v) => {
                const raw = v.trim();
                if (!raw) return "공백만 입력할 수 없어요.";
                if (raw.length > 60) return "폴더 이름은 최대 60자입니다.";
                const normalized = raw.replace(/\s+/g, " ").toLowerCase();
                const dup = all.some(f =>
                    f.id !== folder.id &&
                    (f.name ?? "").trim().replace(/\s+/g, " ").toLowerCase() === normalized
                );
                if (dup) return "동일한 이름의 폴더가 이미 존재합니다.";
                return;
            },
        });
        const name = (next ?? "").trim();
        if (!name || name === folder.name) return;

        try {
            const headers = { ...authHeader() };
            const { data } = await http.patch(`/me/folders/${folder.id}`, { wordbookName: name }, { headers });
            setAll(prev => prev.map(f => f.id === folder.id
                ? { ...f, name: data?.wordbookName ?? name, updatedAt: new Date().toISOString() }
                : f
            ));
        } catch (e: any) {
            // 혹시 서버가 다른 필드를 요구하면 한 번 더 시도
            if (e?.response?.status === 400) {
                try {
                    const { data } = await http.patch(`/me/folders/${folder.id}`, { newName: name }, { headers: { ...authHeader() } });
                    setAll(prev => prev.map(f => f.id === folder.id
                        ? { ...f, name: data?.wordbookName ?? name, updatedAt: new Date().toISOString() }
                        : f
                    ));
                    return;
                } catch {}
            }
            await dialogs.alert({
                title: "이름 변경 실패",
                description: e?.response?.data?.message || "잠시 후 다시 시도해 주세요.",
            });
        }
    }

    // 삭제
    async function handleDelete(folder: Folder) {
        closeMenu();
        const ok = await dialogs.confirm({
            title: "포텐노트를 삭제할까요?",
            description: (
                <>
                    <div style={{marginBottom:8}}>'{folder.name}' 폴더가 영구 삭제됩니다.</div>
                    <div style={{fontSize:12, color:"#6b7280"}}>이 작업은 되돌릴 수 없습니다.</div>
                </>
            ),
            okText: "영구 삭제",
            cancelText: "취소",
            danger: true,
        });
        if (!ok) return;

        try {
            await http.delete(`/me/folders/${folder.id}`, {
                params: { mode: "purge" }, // 기본 purge 명시
                headers: { ...authHeader() },
            });
            setAll(prev => prev.filter(f => f.id !== folder.id));
            setTotal(t => Math.max(0, (t || 0) - 1));
        } catch (e: any) {
            await dialogs.alert({
                title: "삭제 실패",
                description: e?.reseponse?.data?.message || "잠시 후 다시 시도해 주세요.",
            });
        }
    }

    return (
        <NarrowLeft style={{ padding: "8px 0 24px" }}>
            {/* 상단 툴바 */}
            <Toolbar>
                <RowFlex>
                    <BackBtn onClick={() => nav(-1)} aria-label="뒤로 가기">←</BackBtn>

                    <Title>내 포텐노트</Title>
                    <Count>{total}개</Count>

                    <Sep aria-hidden>|</Sep>

                    <SortInlineWrap>
                        <SortInlineBtn
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={sortOpen}
                            onClick={() => setSortOpen(v => !v)}
                        >
                            {sortLabel}
                        </SortInlineBtn>

                        {sortOpen && (
                            <SortPopup role="menu" aria-label="정렬하기">
                                <RadioItem $checked={sortKey === "updated_desc"} onClick={() => { setSortKey("updated_desc"); setSortOpen(false); }}>
                                    <span /> 최근 업데이트
                                </RadioItem>
                                <RadioItem $checked={sortKey === "updated_asc"} onClick={() => { setSortKey("updated_asc"); setSortOpen(false); }}>
                                    <span /> 오래된 업데이트
                                </RadioItem>
                                <RadioItem $checked={sortKey === "title_asc"} onClick={() => { setSortKey("title_asc"); setSortOpen(false); }}>
                                    <span /> 제목순
                                </RadioItem>
                                <RadioItem $checked={sortKey === "terms_desc"} onClick={() => { setSortKey("terms_desc"); setSortOpen(false); }}>
                                    <span /> 단어 수 많은순
                                </RadioItem>
                                <RadioItem $checked={sortKey === "terms_asc"} onClick={() => { setSortKey("terms_asc"); setSortOpen(false); }}>
                                    <span /> 단어 수 적은순
                                </RadioItem>
                                <RadioItem $checked={sortKey === "studied_desc"} onClick={() => { setSortKey("studied_desc"); setSortOpen(false); }}>
                                    <span /> 최근 학습
                                </RadioItem>
                            </SortPopup>
                        )}
                    </SortInlineWrap>

                    <Spacer />

                    <RowFlex>
                        <SearchInput
                            placeholder="폴더 검색"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <Primary onClick={createFolder}>+ 새 폴더</Primary>
                    </RowFlex>
                </RowFlex>
            </Toolbar>

            {/* 목록 */}
            {(total === 0 && all.length === 0 && !q) ? (
                <EmptyWrap role="region" aria-live="polite">
                    <EmptyIcon />
                    <EmptyTitle>아직 만든 포텐노트가 없어요</EmptyTitle>
                    <EmptyDesc>
                        개인 학습 폴더를 만들어 용어를 모으고 진행률을 관리해 보세요.
                        먼저 폴더를 만들고, 검색에서 원하는 용어를 담아두면 포텐퀴즈와도 자연스럽게 연동됩니다.
                    </EmptyDesc>
                    <EmptyActions>
                        <Primary onClick={createFolder}>+ 새 폴더 만들기</Primary>
                        <GhostBtn onClick={() => nav("/poten-word/search")}>용어 탐색하기</GhostBtn>
                    </EmptyActions>
                </EmptyWrap>
            ) : (q && all.length === 0) ? (
                <NoResultWrap role="region" aria-live="polite">
                    <EmptyIcon />
                    <EmptyTitle>검색 결과가 없어요</EmptyTitle>
                    <EmptyDesc>
                        '{q}' 와(과) 일치하는 포텐노트를 찾지 못했어요. 검색어를 줄이거나 다른 키워드로 시도해 보세요.
                    </EmptyDesc>
                    <EmptyActions>
                        <Primary onClick={() => setQ("")}>검색 초기화</Primary>
                        <GhostBtn onClick={createFolder}>+ 새 폴더 만들기</GhostBtn>
                    </EmptyActions>
                </NoResultWrap>
            ) : (
                <>
                    <Panel role="table" aria-label="폴더 목록">
                        <HeadRow role="row">
                            <Cell>
                                <Checkbox
                                    ref={masterRef}
                                    aria-label="전체 선택"
                                    checked={selected.size === display.length && display.length > 0}
                                    onChange={(e) => toggleAll(e.currentTarget.checked)}
                                />
                            </Cell>
                            <Cell>선택 항목</Cell>
                            <CellCenter>단어 수</CellCenter>
                            <CellCenter>학습 완료율</CellCenter>
                            <CellCenter>최근 학습일</CellCenter>
                            <Cell />
                        </HeadRow>

                        {display.map((f) => {
                            const total = f.termCount ?? 0;
                            const done = f.learnedCount ?? 0;
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                            return (
                                <Row key={f.id} role="row">
                                    <Cell>
                                        <Checkbox
                                            aria-label={`${f.name} 선택`}
                                            checked={selected.has(f.id)}
                                            onChange={(e) => toggleOne(f.id, e.currentTarget.checked)}
                                        />
                                    </Cell>

                                    <Cell>
                                        <WordbookName
                                            onClick={() => nav(`/poten-word/folders/${f.id}`, { state: { wordbookName: f.name } })}
                                            aria-label={`${f.name} 폴더 열기`}
                                            >
                                            {f.name}
                                        </WordbookName>
                                    </Cell>

                                    <CellCenter>{total}</CellCenter>

                                    <CellCenter>
                                        <CenterStack>
                <span style={{ color: UI.color.muted, fontWeight: 600 }}>
                  {done}/{total}
                </span>
                                            <ProgressBar aria-label="학습 진행률">
                                                <ProgressFill $pct={pct} />
                                                <ProgressText $pct={pct}>{pct}%</ProgressText>
                                            </ProgressBar>
                                        </CenterStack>
                                    </CellCenter>

                                    <CellCenter>{formatKR(f.lastStudiedAt || f.updatedAt)}</CellCenter>

                                    <CellAction>
                                        <Kebab
                                            aria-label="더보기"
                                            aria-haspopup="menu"
                                            aria-expanded={menuFor === f.id}
                                            onClick={() => {
                                                setSortOpen(false);
                                                setMenuFor(prev => (prev === f.id ? null : f.id));
                                            }}
                                        >
                                            ⋯
                                        </Kebab>

                                        {menuFor === f.id && (
                                            <MenuPopup role="menu" aria-label="폴더 메뉴">
                                                <MenuItemBtn onClick={() => handleRename(f)}>포텐노트 이름 변경하기</MenuItemBtn>
                                                <DangerItemBtn onClick={() => handleDelete(f)}>포텐노트 삭제하기</DangerItemBtn>
                                            </MenuPopup>
                                        )}
                                    </CellAction>
                                </Row>
                            );
                        })}
                    </Panel>

                    {showPager && (
                        <Pagination
                            page={page}
                            size={perPage}
                            total={pagerTotal}
                            onChange={handlePageChange}
                        />
                    )}
                </>
            )}
            {menuFor !== null && <GlobalOverlay onClick={closeMenu} />}
        </NarrowLeft>
    );
}
