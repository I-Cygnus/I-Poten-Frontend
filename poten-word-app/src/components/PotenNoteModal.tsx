import React from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";

type Notebook = { id: string; name: string };

export type PotenNoteModalProps = {
    open: boolean;
    notebooks: Notebook[];
    onClose: () => void;
    onSave: (notebookId: string) => void | Promise<void>;
    onCreate?: (name: string) => string | Promise<string>;
    onReorder?: (orderedIds: string[]) => void | Promise<void>;
    onGoToFolder?: (wordbookId: string, name?: string) => void | Promise<void>;
    onRequestDelete?: (wordbookId: string, currentName: string) => void | Promise<void>;
    onRequestBulkDelete?: (wordbookIds: string[]) => void | Promise<void>;
    /** 새 API: 모달에서 받은 새 이름을 직접 전달 */
    onRename?: (wordbookId: string, newName: string) => void | Promise<void>;
    /** 구 API(하위호환): 기존 prompt 흐름. (submit 시 newName을 두 번째 인자로 넘겨 폴백 호출) */
    onRequestRename?: (wordbookId: string, currentName: string) => void | Promise<void>;
    /** 새로고침: 서버에서 최신 폴더 목록을 받아와 동기화 */
    onRefresh?: () => Promise<Notebook[]>;
};

const TOKENS = {
    color: {
        overlay: "rgba(17,24,39,0.45)",
        panelBg: "#ffffff",
        textPrimary: "#111827",
        textSecondary: "#374151",
        textMuted: "#6b7280",
        line: "#e5e7eb",
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        btnGhost: "#f3f4f6",
        danger: "#ef4444",
        dangerHover: "#dc2626",
        dangerText: "#ffffff",
        dangerBg: "#fef2f2",
        success: "#10b981",
        bar: "#c7d2fe",
        menuBg: "#ffffff",
        menuHover: "#f3f4f6",
        menuShadow: "rgba(0,0,0,0.12)",
    },
    radius: { panel: 14, item: 10, btn: 10, menu: 12 },
    space: (n: number) => `${n}px`,
    shadow: { panel: "0 8px 30px rgba(0,0,0,0.12)" },
    font: { h3: "18px", body: "15px", help: "12px" },
} as const;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: ${TOKENS.color.overlay};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
`;

const Panel = styled.div`
    position: relative;
    width: 420px;
    max-width: calc(100vw - 32px);
    background: ${TOKENS.color.panelBg};
    border-radius: ${TOKENS.radius.panel}px;
    box-shadow: ${TOKENS.shadow.panel};
    overflow-x: hidden;
    max-height: min(82vh, 900px);
    display: flex;
    flex-direction: column;

    /* 3D 원근 추가 */
    perspective: 1000px;
`;

const Header = styled.div`
    padding: ${TOKENS.space(18)} ${TOKENS.space(20)};
    font-size: ${TOKENS.font.h3};
    font-weight: 700;
    color: ${TOKENS.color.textPrimary};
    border-bottom: 1px solid ${TOKENS.color.line};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const HeaderTitle = styled.span``;

const HeaderRight = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
`;

const Body = styled.div`
    padding: ${TOKENS.space(12)} ${TOKENS.space(14)};
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
`;

const List = styled.div<{ $disabled?: boolean }>`
    opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
    pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
`;

const Row = styled.div<{
    $dragging?: boolean;
    $barTop?: boolean;
    $barBottom?: boolean;
    $bulk?: boolean;
}>`
    width: 100%;
    display: flex;
    align-items: center;
    gap: ${TOKENS.space(10)};
    padding: ${TOKENS.space(12)} ${TOKENS.space(10)};
    border-radius: ${TOKENS.radius.item}px;
    background: transparent;
    border: none;
    text-align: left;
    position: relative;
    cursor: ${({ $bulk }) => ($bulk ? "default" : "grab")};

    &:hover {
        background: #f9fafb;
    }
    & + & {
        border-top: 1px solid ${TOKENS.color.line};
    }

    outline: ${({ $dragging }) => ($dragging ? `2px dashed ${TOKENS.color.primary}` : "none")};

    &::before {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        height: 3px;
        top: ${({ $barTop }) => ($barTop ? "-2px" : "auto")};
        bottom: ${({ $barBottom }) => ($barBottom ? "-2px" : "auto")};
        background: ${({ $barTop, $barBottom }) => ($barTop || $barBottom ? TOKENS.color.bar : "transparent")};
        border-radius: 3px;
    }
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 auto;
    min-width: 0;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: ${TOKENS.color.primary};
    &:focus-visible {
        outline: 2px solid ${TOKENS.color.primary};
        outline-offset: 2px;
    }
    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
`;

const Name = styled.span`
    color: ${TOKENS.color.textPrimary};
    font-size: ${TOKENS.font.body};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const hexToRgb = (hex: string) => {
    const m = hex.replace("#", "");
    const bigint = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};
const alpha = (hex: string, a: number) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const ChevronIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const GearIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
        <path
            d="M19.4 13.5c.05-.49.05-.99 0-1.48l1.72-1.3a.7.7 0 0 0 .18-.89l-1.63-2.82a.7.7 0 0 0-.84-.32l-2.03.82c-.41-.26-.84-.49-1.28-.74l-.31-2.17a.7.7 0 0 0-.7-.6h-3.26a.7.7 0 0 0-.7.6l-.31 2.17c-.44.18-.87.41-1.28.68l-2.03-.8a.7.7 0 0 0-.84.32L2.71 9.83a.7.7 0 0 0 .18.89l1.72 1.3c-.05.49-.05.99 0 1.48l-1.72 1.3a.7.7 0 0 0-.18.89l1.63 2.82c.18.31.56.44.89.32l2.03-.82c.41.27.84.5 1.28.68l.31 2.17c.07.34.35.6.7.6h3.26c.35 0 .65-.26.7-.6l.31-2.17c.44-.18.87-.41 1.28-.68l2.03.82c.33.12.71-.01.89-.32l1.63-2.82a.7.7 0 0 0-.18-.89l-1.72-1.3Z"
            stroke="currentColor"
            strokeWidth="1.4"
        />
    </svg>
);

/** ⟳ 새로고침 아이콘 */
const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 5v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ArrowBtn = styled.button`
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    border-radius: 999px;
    border: 1px solid ${TOKENS.color.line};
    background: #f9fafb;
    color: ${TOKENS.color.textSecondary};
    cursor: pointer;
    touch-action: manipulation;
    &:hover {
        background: #f3f4f6;
    }
    &:active {
        transform: translateY(0.5px);
    }
    &:focus-visible {
        outline: 2px solid ${TOKENS.color.primary};
        outline-offset: 2px;
    }
    @media (pointer: coarse) {
        width: 44px;
        height: 44px;
        flex-basis: 44px;
    }
`;

const SettingsBtn = styled(ArrowBtn)`
    margin-left: 0;
`;

/** 새로고침 버튼은 ArrowBtn 스타일 재사용 */
const RefreshBtn = styled(ArrowBtn)``;

const TipWrap = styled.span`
    position: relative;
    display: inline-flex;
    align-items: center;
`;

const TipBubble = styled.span`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translate(-50%, -6px);
    padding: 6px 10px;
    background: rgba(17, 24, 39, 0.92);
    color: #fff;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    opacity: 0;
    transition: opacity 160ms ease, transform 160ms ease;
    transition-delay: 60ms;
    z-index: 3;
    &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: rgba(17, 24, 39, 0.92);
    }
    ${TipWrap}:hover &, ${TipWrap}:focus-within & {
        opacity: 1;
        transform: translate(-50%, -8px);
        transition-delay: 140ms;
    }
    @media (pointer: coarse) {
        display: none;
    }
`;

const MenuRoot = styled.span`
    position: relative;
    display: inline-flex;
`;
const MenuPanel = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    background: ${TOKENS.color.menuBg};
    border: 1px solid ${TOKENS.color.line};
    border-radius: ${TOKENS.radius.menu}px;
    box-shadow: 0 8px 28px ${TOKENS.color.menuShadow};
    padding: 8px;
    z-index: 4;
`;
const MenuItem = styled.button<{ $danger?: boolean }>`
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    padding: 10px 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    color: ${({ $danger }) => ($danger ? TOKENS.color.danger : TOKENS.color.textPrimary)};
    cursor: pointer;
    &:hover {
        background: ${TOKENS.color.menuHover};
    }
    &:disabled,
    &[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const CreateBar = styled.div<{ $invalid?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: ${TOKENS.space(10)} ${TOKENS.space(10)};
    background: ${({ $invalid }) => ($invalid ? TOKENS.color.dangerBg : "#f8fafc")};
    border-radius: ${TOKENS.radius.item}px;
    margin: ${TOKENS.space(8)} 0 ${TOKENS.space(4)};
    border: 1px solid ${({ $invalid }) => ($invalid ? TOKENS.color.danger : "transparent")};
`;

const Plus = styled.span`
    color: ${TOKENS.color.primary};
    font-weight: 700;
    font-size: 18px;
`;
const Input = styled.input`
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: ${TOKENS.font.body};
    color: ${TOKENS.color.textPrimary};
`;

const ErrorRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 6px 2px 0;
`;
const ErrorIcon = styled.svg`
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
    color: ${TOKENS.color.danger};
    margin-top: 2px;
`;
const ErrorText = styled.p`
    margin: 0;
    font-size: ${TOKENS.font.help};
    color: ${TOKENS.color.danger};
`;

const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: ${TOKENS.space(14)} ${TOKENS.space(16)};
    border-top: 1px solid ${TOKENS.color.line};
`;

const GhostBtn = styled.button`
    min-width: 84px;
    height: 36px;
    border-radius: ${TOKENS.radius.btn}px;
    border: 1px solid ${TOKENS.color.line};
    background: ${TOKENS.color.btnGhost};
    color: ${TOKENS.color.textSecondary};
    font-weight: 600;
    cursor: pointer;
`;

const PrimaryBtn = styled.button<{ disabled?: boolean }>`
    min-width: 96px;
    height: 36px;
    border-radius: ${TOKENS.radius.btn}px;
    border: none;
    background: ${TOKENS.color.primary};
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    &:hover {
        background: ${TOKENS.color.primaryHover};
    }
    &:disabled,
    &[aria-disabled="true"] {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const DangerBtn = styled.button<{ disabled?: boolean }>`
    min-width: 120px;
    height: 36px;
    border-radius: ${TOKENS.radius.btn}px;
    border: none;
    background: ${TOKENS.color.danger};
    color: ${TOKENS.color.dangerText};
    font-weight: 800;
    cursor: pointer;
    &:hover {
        background: ${TOKENS.color.dangerHover};
    }
    &:disabled,
    &[aria-disabled="true"] {
        opacity: 0.55;
        cursor: not-allowed;
    }
`;

const Divider = styled.div`
    height: 1px;
    background: ${TOKENS.color.line};
    margin: ${TOKENS.space(12)} 0;
`;

/** 기존 배지(미사용) */
const SavedBadge = styled.div<{ $show: boolean }>`
    position: absolute;
    top: 8px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: #ecfdf5;
    border: 1px solid #d1fae5;
    color: ${TOKENS.color.success};
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    opacity: ${({ $show }) => ($show ? 1 : 0)};
    transform: translateY(${({ $show }) => ($show ? "0px" : "-6px")});
    transition: all 240ms ease;
`;

/** ========= 확인 다이얼로그 ========= */
const ConfirmBackdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483648;
`;
const ConfirmCard = styled.div`
    width: 420px;
    max-width: calc(100vw - 32px);
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
    border: 1px solid ${TOKENS.color.line};
`;
const ConfirmHeader = styled.div`
    padding: 16px 18px;
    font-weight: 600;
    color: ${TOKENS.color.textPrimary};
    border-bottom: 1px solid ${TOKENS.color.line};
`;
const ConfirmBody = styled.div`
    padding: 14px 16px;
    color: ${TOKENS.color.textSecondary};
    font-size: 14px;
`;
const ConfirmList = styled.ul`
    margin: 8px 0 0;
    padding-left: 18px;
    max-height: 160px;
    overflow: auto;
    font-size: 13px;
`;
const ConfirmFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid ${TOKENS.color.line};
`;
/** ================================= */

/** ========= 안내 배너 ========= */
const Notice = styled.div<{ $tone?: "info" | "warn" }>`
    margin: 8px 16px 0;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    color: ${({ $tone }) => ($tone === "warn" ? TOKENS.color.danger : TOKENS.color.textSecondary)};
    background: ${({ $tone }) => ($tone === "warn" ? TOKENS.color.dangerBg : "#f3f4f6")};
    border: 1px solid ${TOKENS.color.line};
`;
/** ================================= */

/** ====== Saved Toast Animation (3D) ====== */
const pop3d = keyframes`
    0%   { transform: translate3d(-50%, -46%, -60px) rotateX(10deg) scale(0.92); opacity: 0; }
    60%  { transform: translate3d(-50%, -50%,  10px) rotateX(-6deg) scale(1.03); opacity: 1; }
    100% { transform: translate3d(-50%, -50%,   0px) rotateX(0deg)  scale(1);   opacity: 1; }
`;
const ring3d = keyframes`
    0%   { transform: translateZ(-6px) scale(0.7);  opacity: 0.35; }
    80%  { transform: translateZ(-6px) scale(1.35); opacity: 0; }
    100% { transform: translateZ(-6px) scale(1.55); opacity: 0; }
`;
const draw = keyframes` to { stroke-dashoffset: 0; } `;
const pulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 rgba(0,0,0,0); }
    50% { box-shadow: 0 0 0 10px var(--pulse-color); }
`;

const SavedToast = styled.div<{ $show: boolean }>`
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 5;

    --toast: 112px;

    width: var(--toast);
    height: var(--toast);
    display: flex;
    align-items: center;
    justify-content: center;

    /* 3D 컨텍스트 유지 */
    transform-style: preserve-3d;

    transform: ${({ $show }) =>
            $show ? "translate3d(-50%, -50%, 0) scale(1)" : "translate3d(-50%, -48%, -10px) scale(0.9)"};
    opacity: ${({ $show }) => ($show ? 1 : 0)};
    transition: opacity 200ms ease, transform 260ms ease;
    animation: ${({ $show }) => ($show ? pop3d : "none")} 420ms cubic-bezier(.2,.8,.2,1) both;
    pointer-events: none;

    background: ${(p) => alpha(TOKENS.color.primary, 0.1)};
    border-radius: 999px;
    border: 1px solid ${(p) => alpha(TOKENS.color.primary, 0.18)};
    box-shadow:
            0 12px 28px rgba(0,0,0,0.18),
            inset 0 -8px 14px rgba(0,0,0,0.06);

    /* 뒤쪽 확산 링(약간 뒤로) */
    &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 999px;
        border: 2px solid ${(p) => alpha(TOKENS.color.primary, 0.26)};
        opacity: 0;
        transform: translateZ(-6px);
        animation: ${({ $show }) => ($show ? ring3d : "none")} 560ms ease-out 80ms;
        pointer-events: none;
    }

    /* 바닥 그림자(더 깊이감) */
    &::before {
        content: "";
        position: absolute;
        width: 70%;
        height: 18%;
        bottom: -14px;
        left: 50%;
        transform: translateX(-50%) translateZ(-20px);
        filter: blur(12px);
        background: radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.22), rgba(0,0,0,0) 70%);
        opacity: ${({ $show }) => ($show ? 1 : 0)};
        transition: opacity 240ms ease;
        border-radius: 999px;
        pointer-events: none;
    }
`;

const CheckWrap = styled.span`
    position: relative;
    --check: calc(var(--toast) - 20px);
    width: var(--check);
    height: var(--check);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${TOKENS.color.primary};
    color: #fff;
    border-radius: 999px;
    box-shadow: 0 10px 22px ${(p) => alpha(TOKENS.color.primary, 0.35)};
    --pulse-color: ${(p) => alpha(TOKENS.color.primary, 0.18)};
    animation: ${pulse} 720ms ease-out 60ms 1;

    /* 체크 원판을 살짝 앞으로 */
    transform: translateZ(12px);
    transform-style: preserve-3d;

    svg { display: block; }
    .check {
        fill: none;
        stroke: #fff;
        stroke-width: 4;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 40;
        stroke-dashoffset: 40;
        animation: ${draw} 460ms ease forwards 140ms;
    }
`;

const SavedToastView: React.FC<{ show: boolean; tick: number }> = ({ show, tick }) => (
    <SavedToast key={tick} $show={show} role="status" aria-label="완료">
        <CheckWrap aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24">
                <path className="check" d="M20 6L9 17l-5-5" />
            </svg>
        </CheckWrap>
    </SavedToast>
);
/** ==================================== */

/** 폴더 링크 a태그(컴포넌트 밖에 정의) */
const ArrowLink = styled.a`
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    border-radius: 999px;
    border: 1px solid ${TOKENS.color.line};
    background: #f9fafb;
    color: ${TOKENS.color.textSecondary};
    text-decoration: none;
    &:hover { background: #f3f4f6; }
    &:active { transform: translateY(0.5px); }
    &:focus-visible { outline: 2px solid ${TOKENS.color.primary}; outline-offset: 2px; }
    @media (pointer: coarse) {
        width: 44px;
        height: 44px;
        flex-basis: 44px;
    }
`;

/** 컴포넌트 내부 헬퍼 */
const getFolderHref = (wordbookId: string) => {
    const inPoten = window.location.pathname.startsWith("/poten-word");
    return inPoten ? `/poten-word/folders/${wordbookId}` : `/folders/${wordbookId}`;
};

export default function PotenNoteModal({
                                           open,
                                           notebooks,
                                           onClose,
                                           onSave,
                                           onCreate,
                                           onReorder,
                                           onGoToFolder,
                                           onRequestRename,
                                           onRequestDelete,
                                           onRequestBulkDelete,
                                           onRename,
                                           onRefresh,
                                       }: PotenNoteModalProps) {
    // 내부 가시성 상태로 즉시 닫히게 처리
    const [internalOpen, setInternalOpen] = React.useState(open);
    React.useEffect(() => {
        setInternalOpen(open);
    }, [open]);

    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [newName, setNewName] = React.useState("");
    const [error, setError] = React.useState<string>("");

    const [list, setList] = React.useState<Notebook[]>([]);
    const [draggingId, setDraggingId] = React.useState<string | null>(null);
    const [dragOver, setDragOver] = React.useState<{ id: string; edge: "top" | "bottom" } | null>(null);
    const [savingOrder, setSavingOrder] = React.useState(false);

    // 저장 토스트 상태
    const [showSaved, setShowSaved] = React.useState(false);
    const [savedTick, setSavedTick] = React.useState(0);
    const triggerSaved = React.useCallback(() => {
        setShowSaved(true);
        setSavedTick((t) => t + 1);
        window.setTimeout(() => setShowSaved(false), 1200);
    }, []);

    const lastStableRef = React.useRef<Notebook[]>([]);

    const [bulkMode, setBulkMode] = React.useState(false);
    const [deleteIds, setDeleteIds] = React.useState<Set<string>>(new Set());

    const [menuOpen, setMenuOpen] = React.useState(false);

    // 확인 다이얼로그
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    // 안내 배너 상태
    const [hint, setHint] = React.useState<{ text: string; tone?: "info" | "warn" } | null>(null);
    const hintTimer = React.useRef<number | null>(null);
    const showHint = React.useCallback((text: string, tone: "info" | "warn" = "info") => {
        setHint({ text, tone });
        if (hintTimer.current) window.clearTimeout(hintTimer.current);
        hintTimer.current = window.setTimeout(() => setHint(null), 1600);
    }, []);
    React.useEffect(
        () => () => {
            if (hintTimer.current) window.clearTimeout(hintTimer.current);
        },
        []
    );

    // ===== 이름 바꾸기 미니 모달 상태 =====
    const [renameOpen, setRenameOpen] = React.useState(false);
    const [renameTarget, setRenameTarget] = React.useState<{ id: string; current: string } | null>(null);
    const [renameValue, setRenameValue] = React.useState("");
    const [renameError, setRenameError] = React.useState<string>("");

    const validateRename = React.useCallback(
        (val: string, selfId?: string) => {
            const raw = val.trim();
            if (!raw) return "공백만 입력할 수 없어요.";
            if (raw.length > 60) return "폴더 이름은 최대 60자입니다.";
            const normalized = raw.replace(/\s+/g, " ").toLowerCase();
            const dup = list.some(
                (n) => n.id !== selfId && n.name.trim().replace(/\s+/g, " ").toLowerCase() === normalized
            );
            if (dup) return "동일한 이름의 폴더가 이미 존재합니다.";
            return "";
        },
        [list]
    );

    const openRename = (id: string, currentName: string) => {
        setRenameTarget({ id, current: currentName });
        setRenameValue(currentName);
        setRenameError("");
        setRenameOpen(true);
    };
    const closeRename = () => {
        setRenameOpen(false);
        setRenameTarget(null);
        setRenameValue("");
        setRenameError("");
    };

    const submitRename = async () => {
        if (!renameTarget) return;
        const err = validateRename(renameValue, renameTarget.id);
        if (err) {
            setRenameError(err);
            return;
        }
        const nextName = renameValue.trim();
        try {
            if (onRename) {
                await Promise.resolve(onRename(renameTarget.id, nextName));
            } else if (onRequestRename) {
                await Promise.resolve(onRequestRename(renameTarget.id, nextName));
            } else {
                showHint("이름 변경 핸들러가 연결되지 않았어요(onRename).", "warn");
                return;
            }
            // 낙관적 반영
            setList((prev) => prev.map((n) => (n.id === renameTarget.id ? { ...n, name: nextName } : n)));
            closeRename();
            triggerSaved();
        } catch (e) {
            setRenameError("이름 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            console.error("[rename modal] failed:", e);
        }
    };
    // =====================================

    const getRenameSelection = React.useCallback(() => {
        if (bulkMode) {
            const ids = Array.from(deleteIds);
            return { count: ids.length, oneId: ids.length === 1 ? ids[0] : null };
        }
        return { count: selectedId ? 1 : 0, oneId: selectedId };
    }, [bulkMode, deleteIds, selectedId]);

    React.useEffect(() => {
        if (!internalOpen) {
            setSelectedId(null);
            setCreating(false);
            setNewName("");
            setError("");
            setDraggingId(null);
            setDragOver(null);
            setSavingOrder(false);
            setShowSaved(false);
            setMenuOpen(false);
            setBulkMode(false);
            setDeleteIds(new Set());
            setConfirmOpen(false);
            setHint(null);
            closeRename();
        }
    }, [internalOpen]);

    React.useEffect(() => {
        if (!internalOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [internalOpen]);


    const shallowSame = React.useCallback((a: Notebook[], b: Notebook[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (String(a[i].id) !== String(b[i].id)) return false;
            if (a[i].name !== b[i].name) return false;
        }
        return true;
    }, []);

    React.useEffect(() => {
        if (!internalOpen) return;
        if (savingOrder) return;

        setList((prev) => (shallowSame(prev, notebooks) ? prev : notebooks));
        lastStableRef.current = notebooks;

        if (!selectedId && !bulkMode && !creating && !savingOrder && notebooks.length > 0) {
            setSelectedId(notebooks[0].id);
        }
    }, [internalOpen, notebooks, savingOrder, shallowSame, selectedId, bulkMode, creating]);

    const normalizeName = React.useCallback((s: string) => s.trim().replace(/\s+/g, " ").toLowerCase(), []);

    // ESC 한 번에 닫기 (내부 상태 즉시 false + 부모 onClose)
    React.useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                if (renameOpen) {
                    closeRename();
                    return;
                }
                if (confirmOpen) {
                    setConfirmOpen(false);
                    return;
                }
                if (menuOpen) {
                    setMenuOpen(false);
                    return;
                }
                if (bulkMode) {
                    /* 선택 유지 */
                    return;
                }
                setInternalOpen(false); // 즉시 사라짐
                onClose();
            }
            if (e.key === "Enter") {
                if (renameOpen) {
                    void submitRename();
                    return;
                }
                if (confirmOpen) {
                    void executeBulkDelete();
                } else if (bulkMode) {
                    /* Enter 무시 */
                } else handlePrimary();
            }
        }
        if (internalOpen) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [
        internalOpen,
        creating,
        selectedId,
        newName,
        error,
        menuOpen,
        bulkMode,
        deleteIds,
        confirmOpen,
        renameOpen,
        renameValue,
        onClose,
    ]);

    const headerRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
        function handleDocMouseDown(ev: MouseEvent) {
            if (!menuOpen) return;
            const el = ev.target as HTMLElement;
            if (headerRef.current && !headerRef.current.contains(el)) setMenuOpen(false);
        }
        document.addEventListener("mousedown", handleDocMouseDown);
        return () => document.removeEventListener("mousedown", handleDocMouseDown);
    }, [menuOpen]);

    const [refreshing, setRefreshing] = React.useState(false);

    const handleToggle = (id: string) => {
        if (draggingId || refreshing) return;
        if (bulkMode) {
            setDeleteIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        } else {
            setSelectedId((prev) => (prev === id ? null : id));
        }
    };

    const handleCreateToggle = () => {
        if (refreshing) return;
        setMenuOpen(false);
        setBulkMode(false);
        setDeleteIds(new Set());
        setCreating(true);
        setSelectedId(null);
        setError("");
    };

    const handleChangeName = (val: string) => {
        setNewName(val);
        const normalized = normalizeName(val);
        if (!normalized) return setError("공백만 입력할 수 없어요.");
        const dup = list.some((n) => normalizeName(n.name) === normalized);
        if (dup) return setError("중복되는 이름입니다.");
        setError("");
    };

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) return setError("공백만 입력할 수 없어요.");
        if (error) return;
        try {
            let newId: string | undefined;
            if (onCreate) {
                const r = onCreate(name);
                newId = typeof (r as any)?.then === "function" ? await (r as Promise<string>) : (r as string);
            }
            if (newId) {
                setList((prev) => [{ id: newId!, name }, ...prev]);
                setSelectedId(newId);
            }
            setCreating(false);
            setNewName("");
            setError("");
            triggerSaved();
        } catch (e: any) {
            const status = e?.response?.status;
            if (e?.message === "DUPLICATE_LOCAL" || status === 409) setError("중복되는 이름입니다.");
            else if (e?.message === "EMPTY_NAME" || status === 400) setError("공백만 입력할 수 없어요.");
            else setError("폴더 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    const handleSave = async () => {
        if (!selectedId) return;
        await Promise.resolve(onSave(selectedId));
        setInternalOpen(false);
        onClose();
    };
    const handlePrimary = () => {
        if (creating) handleCreate();
        else handleSave();
    };

    const moveItem = (arr: Notebook[], from: number, to: number) => {
        const copy = arr.slice();
        const [m] = copy.splice(from, 1);
        copy.splice(to, 0, m);
        return copy;
    };

    const onDragStart = (id: string, e: React.DragEvent) => {
        if (bulkMode || refreshing) {
            e.preventDefault();
            return;
        }
        setMenuOpen(false);
        setDraggingId(id);
        setDragOver(null);
        try {
            e.dataTransfer.effectAllowed = "move";
            const img = document.createElement("div");
            img.style.position = "absolute";
            img.style.top = "-99999px";
            img.style.left = "-99999px";
            document.body.appendChild(img);
            e.dataTransfer.setDragImage(img, 0, 0);
            setTimeout(() => document.body.removeChild(img), 0);
        } catch {}
    };

    const onRowDragStart = (id: string, e: React.DragEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, [role="checkbox"], [role="switch"], [data-testid="go-to-folder"]')) {
            e.preventDefault();
            return;
        }
        onDragStart(id, e);
    };

    const onDragOverRow = (overId: string, e: React.DragEvent<HTMLDivElement>) => {
        if (bulkMode || refreshing) return;
        if (!draggingId || draggingId === overId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const rect = e.currentTarget.getBoundingClientRect();
        const isBottom = e.clientY - rect.top > rect.height / 2;
        setDragOver({ id: overId, edge: isBottom ? "bottom" : "top" });
    };

    const onDropRow = async (overId: string, e: React.DragEvent<HTMLDivElement>) => {
        if (bulkMode || refreshing) return;
        e.preventDefault();
        if (!draggingId || draggingId === overId) {
            setDraggingId(null);
            setDragOver(null);
            return;
        }
        const from = list.findIndex((n) => n.id === draggingId);
        const base = list.findIndex((n) => n.id === overId);
        if (from < 0 || base < 0) {
            setDraggingId(null);
            setDragOver(null);
            return;
        }
        let to = base + (dragOver?.edge === "bottom" ? 1 : 0);
        if (from < to) to--;
        to = Math.max(0, Math.min(to, list.length - 1));
        if (from === to) {
            setDraggingId(null);
            setDragOver(null);
            return;
        }

        const prev = list;
        const next = moveItem(list, from, to);
        setList(next);
        setSavingOrder(true);
        setDraggingId(null);
        setDragOver(null);

        try {
            lastStableRef.current = prev;
            if (onReorder) await Promise.resolve(onReorder(next.map((n) => n.id)));
            triggerSaved();
            lastStableRef.current = next;
        } catch (err) {
            console.error("[folders reorder] PATCH failed:", err);
            setList(lastStableRef.current);
        } finally {
            setSavingOrder(false);
        }
    };

    const onDragEnd = () => {
        setDraggingId(null);
        setDragOver(null);
    };

    const executeBulkDelete = async () => {
        const ids = Array.from(deleteIds);
        if (!ids.length) return;
        try {
            if (onRequestBulkDelete) {
                await Promise.resolve(onRequestBulkDelete(ids));
            } else if (onRequestDelete) {
                for (const id of ids) {
                    const name = list.find((n) => n.id === id)?.name ?? "";
                    // eslint-disable-next-line no-await-in-loop
                    await Promise.resolve(onRequestDelete(id, name));
                }
            }
            // 낙관적 반영
            setList((prev) => prev.filter((n) => !ids.includes(n.id)));

            setConfirmOpen(false);
            setBulkMode(false);
            setDeleteIds(new Set());
            triggerSaved();
        } catch (e) {
            console.error("[bulk delete] failed:", e);
        } finally {
            setMenuOpen(false);
        }
    };

    /** ===== 새로고침 상태/핸들러 (조기 return 위쪽) ===== */
    const doRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            if (!onRefresh) {
                showHint("새로고침 핸들러가 연결되지 않았어요(onRefresh).", "warn");
                return;
            }
            const next = await onRefresh();
            if (Array.isArray(next)) {
                setList(next);
                lastStableRef.current = next;
                setSelectedId((prev) => (prev && next.some((n) => n.id === prev) ? prev : next[0]?.id ?? null));
                triggerSaved(); // 3D 체크 모션
            }
        } catch (e) {
            console.error("[folders refresh] failed:", e);
            showHint("동기화 실패. 잠시 후 다시 시도해 주세요.", "warn");
        } finally {
            setRefreshing(false);
        }
    };
    /** =================================================== */

    // 내부 가시성 기준으로 렌더링 (※ 이 아래에는 훅 선언 금지)
    if (!internalOpen) return null;

    const isCreateInvalid = creating && (!!error || newName.trim().length === 0);
    const showArrow = !bulkMode;
    const menuDisabled = creating || savingOrder || refreshing;

    const menu = (
        <MenuPanel role="menu" aria-label="전역 설정 메뉴">
            <MenuItem
                role="menuitem"
                onClick={(e) => {
                    e.stopPropagation();
                    if (menuDisabled || list.length === 0) return;

                    const { count, oneId } = getRenameSelection();
                    if (count === 0) {
                        showHint("이름을 바꿀 단어장을 먼저 선택해 주세요.", "warn");
                        setMenuOpen(false);
                        return;
                    }
                    if (count > 1) {
                        showHint("이름 변경은 한 번에 하나만 가능합니다.", "warn");
                        setMenuOpen(false);
                        return;
                    }

                    const current = list.find((n) => n.id === oneId)?.name ?? "";
                    setMenuOpen(false);
                    openRename(oneId!, current);
                }}
                disabled={menuDisabled || list.length === 0}
                aria-disabled={menuDisabled || list.length === 0}
            >
                이름 바꾸기
            </MenuItem>

            {!bulkMode ? (
                <MenuItem
                    role="menuitem"
                    $danger
                    onClick={() => {
                        setMenuOpen(false);
                        setBulkMode(true);
                        setDeleteIds(new Set(selectedId ? [selectedId] : []));
                    }}
                    disabled={menuDisabled || list.length === 0}
                    aria-disabled={menuDisabled || list.length === 0}
                >
                    삭제 시작
                </MenuItem>
            ) : (
                <>
                    <MenuItem
                        role="menuitem"
                        onClick={() => setDeleteIds(new Set(list.map((n) => n.id)))}
                        disabled={list.length === 0}
                        aria-disabled={list.length === 0}
                    >
                        전체 선택
                    </MenuItem>
                    <MenuItem
                        role="menuitem"
                        onClick={() => setDeleteIds(new Set())}
                        disabled={deleteIds.size === 0}
                        aria-disabled={deleteIds.size === 0}
                    >
                        전체 해제
                    </MenuItem>
                    <MenuItem
                        role="menuitem"
                        $danger
                        onClick={() => {
                            setMenuOpen(false);
                            setConfirmOpen(true);
                        }}
                        disabled={deleteIds.size === 0}
                        aria-disabled={deleteIds.size === 0}
                    >
                        선택 삭제
                    </MenuItem>
                </>
            )}
        </MenuPanel>
    );

    const modal = (
        <Overlay role="dialog" aria-modal="true" aria-label="내 포텐노트에 저장하기">
            <Panel>
                {/* 저장 체크 토스트 (3D) */}
                <SavedToastView show={showSaved} tick={savedTick} />

                <Header ref={headerRef}>
                    <HeaderTitle>내 포텐노트에 저장하기</HeaderTitle>
                    <HeaderRight>
            <span
                aria-live="polite"
                style={{ fontSize: 12, color: bulkMode ? TOKENS.color.danger : TOKENS.color.textMuted }}
            >
              {bulkMode ? `삭제 모드 · ${deleteIds.size}개 선택됨` : ""}
            </span>

                        {/* 새로고침 버튼 */}
                        <TipWrap data-tip>
                            <RefreshBtn
                                type="button"
                                aria-label="새로고침"
                                onClick={() => {
                                    setMenuOpen(false);
                                    void doRefresh();
                                }}
                                disabled={savingOrder || refreshing}
                                aria-disabled={savingOrder || refreshing}
                                title="서버와 동기화"
                                style={{ transition: "transform 200ms", transform: refreshing ? "rotate(90deg)" : "none" }}
                            >
                                <RefreshIcon />
                            </RefreshBtn>
                            <TipBubble>{refreshing ? "동기화 중..." : "서버와 동기화"}</TipBubble>
                        </TipWrap>

                        <MenuRoot>
                            <TipWrap data-tip>
                                <SettingsBtn type="button" aria-label="설정 열기" onClick={() => setMenuOpen((v) => !v)}>
                                    <GearIcon />
                                </SettingsBtn>
                                <TipBubble>설정</TipBubble>
                            </TipWrap>
                            {menuOpen && menu}
                        </MenuRoot>
                    </HeaderRight>
                </Header>

                {/* 안내 배너 */}
                {hint && <Notice $tone={hint.tone}>{hint.text}</Notice>}

                <Body>
                    {!creating ? (
                        <Row
                            role="button"
                            tabIndex={0}
                            draggable={false}
                            data-block-tips={savingOrder || menuOpen || bulkMode}
                            onClick={() => {
                                setMenuOpen(false);
                                if (!bulkMode) handleCreateToggle();
                            }}
                            onKeyDown={(e) => {
                                if ((e.key === "Enter" || e.key === " ") && !bulkMode) handleCreateToggle();
                            }}
                            $bulk={bulkMode}
                        >
                            <Left>
                                <Plus>＋</Plus>
                                <Name>새로운 포텐노트 만들기</Name>
                            </Left>
                            {!bulkMode && <span aria-hidden="true">›</span>}
                        </Row>
                    ) : (
                        <>
                            <CreateBar $invalid={!!error}>
                                <Plus>＋</Plus>
                                <Input
                                    autoFocus
                                    placeholder="새 노트 이름을 입력하세요"
                                    value={newName}
                                    onChange={(e) => handleChangeName(e.target.value)}
                                    aria-invalid={!!error}
                                    aria-describedby={error ? "notebook-name-error" : undefined}
                                />
                            </CreateBar>
                            {error && (
                                <ErrorRow>
                                    <ErrorIcon viewBox="0 0 24 24" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="17" r="1.5" fill="currentColor" />
                                    </ErrorIcon>
                                    <ErrorText id="notebook-name-error" aria-live="assertive">
                                        {error}
                                    </ErrorText>
                                </ErrorRow>
                            )}
                        </>
                    )}

                    <Divider />

                    {list.length === 0 && <Notice>아직 단어장이 없어요. 상단에서 새로 만들 수 있어요.</Notice>}

                    <List $disabled={savingOrder || refreshing}>
                        {list.map((nb) => {
                            const isDragging = draggingId === nb.id;
                            const isOverTop = dragOver?.id === nb.id && dragOver.edge === "top";
                            const isOverBottom = dragOver?.id === nb.id && dragOver.edge === "bottom";

                            const checked = bulkMode ? deleteIds.has(nb.id) : selectedId === nb.id;

                            return (
                                <Row
                                    key={nb.id}
                                    role="button"
                                    tabIndex={0}
                                    draggable={false}
                                    data-block-tips={isDragging || savingOrder || menuOpen || bulkMode}
                                    onDragStart={(e) => onRowDragStart(nb.id, e)}
                                    onDragOver={(e) => onDragOverRow(nb.id, e)}
                                    onDrop={(e) => onDropRow(nb.id, e)}
                                    onDragEnd={onDragEnd}
                                    onClick={(e) => {
                                        if ((e as any).defaultPrevented) return;
                                        const el = e.target as HTMLElement;
                                        if (el.closest('input,button,[role="checkbox"],[role="switch"]')) return;
                                        setMenuOpen(false);
                                        handleToggle(nb.id);
                                    }}
                                    onKeyDown={(e) => {
                                        if ((e as any).defaultPrevented) return;
                                        const el = e.target as HTMLElement;
                                        if (el.closest('input, button, [role="checkbox"], [role="switch"]')) return;
                                        if (e.key === "Enter" || e.key === " ") {
                                            setMenuOpen(false);
                                            handleToggle(nb.id);
                                        }
                                    }}
                                    $dragging={isDragging}
                                    $barTop={!!isOverTop}
                                    $barBottom={!!isOverBottom}
                                    $bulk={bulkMode}
                                >
                                    <Left>
                                        <TipWrap data-tip>
                                            <Checkbox
                                                draggable={false}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                                checked={checked}
                                                onChange={() => handleToggle(nb.id)}
                                                aria-label={bulkMode ? `${nb.name} 삭제 대상으로 선택` : `${nb.name} 선택`}
                                                disabled={refreshing}
                                            />
                                            <TipBubble>{bulkMode ? "삭제 대상으로 선택" : "저장할 단어장 선택하기"}</TipBubble>
                                        </TipWrap>

                                        <Name>{nb.name}</Name>
                                    </Left>

                                    {showArrow && (
                                        <TipWrap data-tip>
                                            <ArrowLink
                                                href={getFolderHref(nb.id)}
                                                aria-label={`${nb.name} 폴더로 이동`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuOpen(false);
                                                    if (onGoToFolder) {
                                                        try {
                                                            void Promise.resolve(onGoToFolder(nb.id, nb.name));
                                                        } catch {}
                                                    }
                                                    setInternalOpen(false);
                                                    onClose();
                                                }}
                                                data-testid="go-to-folder"
                                            >
                                                <ChevronIcon />
                                            </ArrowLink>
                                            <TipBubble>해당 단어장으로 이동하기</TipBubble>
                                        </TipWrap>
                                    )}
                                </Row>
                            );
                        })}
                    </List>
                </Body>

                <Footer>
                    {!bulkMode ? (
                        <>
                            <GhostBtn
                                onClick={() => {
                                    setMenuOpen(false);
                                    setInternalOpen(false);
                                    onClose();
                                }}
                            >
                                닫기
                            </GhostBtn>
                            <PrimaryBtn
                                onClick={() => {
                                    setMenuOpen(false);
                                    handlePrimary();
                                }}
                                aria-disabled={(creating ? isCreateInvalid : !selectedId) || refreshing}
                                disabled={(creating ? isCreateInvalid : !selectedId) || refreshing}
                            >
                                {creating ? "생성하기" : "저장하기"}
                            </PrimaryBtn>
                        </>
                    ) : (
                        <>
                            <GhostBtn
                                onClick={() => {
                                    setBulkMode(false);
                                }}
                            >
                                모드 종료
                            </GhostBtn>
                            <DangerBtn
                                onClick={() => {
                                    setConfirmOpen(true);
                                }}
                                disabled={deleteIds.size === 0 || refreshing}
                                aria-disabled={deleteIds.size === 0 || refreshing}
                            >
                                선택 {deleteIds.size}개 삭제
                            </DangerBtn>
                        </>
                    )}
                </Footer>
            </Panel>

            {/* ======== 삭제 확인 다이얼로그 ======== */}
            {confirmOpen && (
                <ConfirmBackdrop role="dialog" aria-modal="true" aria-label="선택 삭제 확인">
                    <ConfirmCard>
                        <ConfirmHeader>정말 삭제하시겠어요?</ConfirmHeader>
                        <ConfirmBody>
                            선택한 단어장 {deleteIds.size}개가 영구 삭제됩니다. 이 작업은 되돌릴 수 없어요.
                            {deleteIds.size > 0 && (
                                <ConfirmList>
                                    {Array.from(deleteIds)
                                        .slice(0, 6)
                                        .map((id) => {
                                            const name = list.find((n) => n.id === id)?.name ?? id;
                                            return <li key={id}>{name}</li>;
                                        })}
                                    {deleteIds.size > 6 && <li>… 외 {deleteIds.size - 6}개</li>}
                                </ConfirmList>
                            )}
                        </ConfirmBody>
                        <ConfirmFooter>
                            <GhostBtn onClick={() => setConfirmOpen(false)}>닫기</GhostBtn>
                            <DangerBtn
                                onClick={() => {
                                    void executeBulkDelete();
                                }}
                            >
                                영구 삭제
                            </DangerBtn>
                        </ConfirmFooter>
                    </ConfirmCard>
                </ConfirmBackdrop>
            )}
            {/* ==================================== */}

            {/* ======== 이름 바꾸기 미니 모달 ======== */}
            {renameOpen && renameTarget && (
                <ConfirmBackdrop role="dialog" aria-modal="true" aria-label="폴더 이름 바꾸기">
                    <ConfirmCard>
                        <ConfirmHeader>이름 바꾸기</ConfirmHeader>
                        <ConfirmBody>
                            <label style={{ display: "block", fontSize: 13, color: "#6b7280", marginBottom: 8 }}>새로운 이름</label>
                            <input
                                autoFocus
                                type="text"
                                value={renameValue}
                                onChange={(e) => {
                                    setRenameValue(e.target.value);
                                    setRenameError(validateRename(e.target.value, renameTarget.id));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") submitRename();
                                    if (e.key === "Escape") closeRename();
                                }}
                                style={{
                                    width: "100%",
                                    height: 36,
                                    padding: "0 10px",
                                    borderRadius: 10,
                                    border: `1px solid ${renameError ? "#ef4444" : "#e5e7eb"}`,
                                    outline: "none",
                                }}
                                aria-invalid={!!renameError}
                            />
                            {!!renameError && <p style={{ margin: "8px 2px 0", color: "#ef4444", fontSize: 12 }}>{renameError}</p>}
                        </ConfirmBody>
                        <ConfirmFooter>
                            <GhostBtn onClick={closeRename}>닫기</GhostBtn>
                            <PrimaryBtn
                                onClick={submitRename}
                                disabled={!!validateRename(renameValue, renameTarget.id) || refreshing}
                                aria-disabled={!!validateRename(renameValue, renameTarget.id) || refreshing}
                            >
                                저장
                            </PrimaryBtn>
                        </ConfirmFooter>
                    </ConfirmCard>
                </ConfirmBackdrop>
            )}
            {/* ==================================== */}
        </Overlay>
    );

    return createPortal(modal, document.body);
}
