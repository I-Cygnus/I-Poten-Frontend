import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryAccordionPicker from "./category/CategoryAccordionPicker.tsx";

export type FilterSelection =
    | { mode: "initial"; value: string }
    | { mode: "alpha"; value: string }
    | { mode: "symbol"; value: string }
    | null;

type Props = {
    value?: FilterSelection;
    onChange?: (sel: FilterSelection) => void;
    defaultTab?: number;
    sticky?: boolean; // true면 선택 하이라이트 유지, false면 클릭 직후 원복
};

/* 디자인 토큰 */
const TOKENS = {
    color: {
        text: "#111827",
        muted: "#6b7280",
        blue: "#4F76F1",
        blueStrong: "#3E63E0",
        divider: "rgba(255,255,255,0.45)",
        white: "#ffffff",
        border: "#d1d5db",
        panelBg: "#f8fafc",
        chipBg: "#ffffff",
        chipBorder: "#e5e7eb",
        chipHover: "#f3f4f6",
    },
    radius: { capsule: 12, chip: 8, panel: 12 },
    space: (n: number) => `${n}px`,
    shadow: { capsule: "0 18px 40px rgba(79,118,241,0.25)" },
} as const;

const INITIALS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const ALPHABETS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const SYMBOLS = ["~","@","#","$","%","&","*","/","?","-","_","+","=",".",",","!"];

/* 한 줄 14개 고정 */
const GRID_COLS = 14;
/* 라벨 열 폭 */
const LABEL_COL = 52;

/* styled-components */
const Root = styled.div` margin-top: ${TOKENS.space(12)}; `;

/** 캡슐 탭 바 (가운데 정렬 + 1:1 동일 폭) */
const CapsuleWrap = styled.div`
    position: relative;
    overflow: visible;
    width: 100%;
    margin: 0 0 ${TOKENS.space(10)} 0;
    padding: 0 ${TOKENS.space(4)};
`;

const Capsule = styled.div`
    position: relative;
    background: linear-gradient(180deg, ${TOKENS.color.blue} 0%, ${TOKENS.color.blueStrong} 100%);
    color: ${TOKENS.color.white};
    border-radius: ${TOKENS.radius.capsule}px;
    padding: ${TOKENS.space(12)} ${TOKENS.space(16)} ;
    box-shadow: ${TOKENS.shadow.capsule};

    display: grid;
    grid-template-columns: 1fr 1fr; /* 동일 비율 2칸 */
    align-items: center;
    justify-items: center;

    &::before {
        content: "";
        position: absolute;
        top: 10px;
        bottom: 10px;
        left: 50%;
        width: 1px;
        background: ${TOKENS.color.divider};
        transform: translateX(-0.5px);
        pointer-events: none;
    }

    @media (max-width: 520px) {
        &::before { display: none; }
    }
`;

const CapsuleTab = styled.button<{ $active?: boolean }>`
    position: relative;
    width: 100%;
    background: transparent;
    border: 0;
    color: ${TOKENS.color.white};
    font-size: 14px;
    font-weight: ${({ $active }) => ($active ? 750 : 600)};
    letter-spacing: -0.06em;
    cursor: pointer;
    padding: ${TOKENS.space(6)} ${TOKENS.space(8)};
    line-height: 1;
    text-align: center;

    .badge {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 8px;
        border: ${({ $active }) => ($active ? "1px solid rgba(255,255,255,0.9)" : "1px solid transparent")};
        background: ${({ $active }) => ($active ? "rgba(255,255,255,0.15)" : "transparent")};
        box-shadow: ${({ $active }) => ($active ? "0 0 0 2px rgba(255,255,255,0.18) inset" : "none")};
        transition: all 140ms ease;
        white-space: nowrap;
    }

    &::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -8px;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: ${({ $active }) => ($active ? `8px solid ${TOKENS.color.blueStrong}` : "8px solid transparent")};
        pointer-events: none;
    }

    &:focus-visible { outline: none; filter: brightness(1.05); }
`;

const Panel = styled.div`
    border: 1px solid ${TOKENS.color.border};
    border-top: none;
    border-bottom-left-radius: ${TOKENS.radius.panel}px;
    border-bottom-right-radius: ${TOKENS.radius.panel}px;
    background: ${TOKENS.color.panelBg};
    padding: ${TOKENS.space(16)} ${TOKENS.space(16)} ${TOKENS.space(16)} ${TOKENS.space(12)};
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: ${LABEL_COL}px 1fr;
    align-items: start;
    gap: ${TOKENS.space(12)};
    margin-bottom: ${TOKENS.space(12)};
`;

const LabelBox = styled.div`
    height: ${TOKENS.space(36)};
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const LabelText = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: ${TOKENS.color.muted};
`;

const GroupGrid = styled.div<{ $cols: number }>`
    display: grid;
    grid-template-columns: ${({ $cols }) => `repeat(${$cols}, minmax(0, 1fr))`};
    gap: ${TOKENS.space(8)};
    justify-items: stretch;
`;

const ChipButton = styled.button<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: ${TOKENS.space(36)};
    padding: 0 ${TOKENS.space(10)};
    border-radius: ${TOKENS.radius.chip}px;
    border: 1px solid ${({ $active }) => ($active ? TOKENS.color.blueStrong : TOKENS.color.chipBorder)};
    background: ${({ $active }) => ($active ? "rgba(79,118,241,0.08)" : TOKENS.color.chipBg)};
    cursor: pointer;
    user-select: none;
    transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
    font-size: 14px;
    color: ${({ $active }) => ($active ? TOKENS.color.blueStrong : TOKENS.color.text)};
    font-weight: ${({ $active }) => ($active ? 600 : 500)};
    outline: none;

    &:not([data-active="true"]):hover { background: ${TOKENS.color.chipHover}; }
    -webkit-tap-highlight-color: transparent;
`;

const RowLast = styled(Row)` margin-bottom: 0; `;

/* ---------------- util: 세션 캐시 정리 ---------------- */
const CLEAR_CACHE_PREFIXES = ["term_search:", "terms_by_tag:"];

function clearSessionByPrefixes(prefixes: string[]) {
    try {
        const keys = Object.keys(window.sessionStorage);
        for (const k of keys) {
            if (prefixes.some((p) => k.startsWith(p))) {
                window.sessionStorage.removeItem(k);
            }
        }
    } catch {}
}

const ExploreFilterBar: React.FC<Props> = ({
                                               value,
                                               onChange,
                                               defaultTab = 1,
                                               sticky = true,
                                           }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [internalSel, setInternalSel] = useState<FilterSelection>(null);
    const selection = value === undefined ? internalSel : value;
    const [tabResetKey, setTabResetKey] = useState(0); // 카테고리 강제 리마운트

    const navigate = useNavigate();
    const location = useLocation();

    // 포커스 정리
    const rootRef = useRef<HTMLDivElement>(null);
    const blurActiveInRoot = () => {
        const ae = document.activeElement as HTMLElement | null;
        if (ae && rootRef.current && rootRef.current.contains(ae)) ae.blur();
    };
    const handlePointerDownCapture: React.PointerEventHandler<HTMLDivElement> = () => {
        blurActiveInRoot();
    };

    useEffect(() => {
        requestAnimationFrame(blurActiveInRoot);
    }, [selection?.mode, selection?.value, activeTab]);

    // URL에서 검색 관련 쿼리 리셋 + search 라우트로 이동(카드 비우기)
    const resetUrlAndGoEmpty = () => {
        const sp = new URLSearchParams(location.search);
        ["q", "tag", "initial", "alpha", "symbol", "catPath", "page", "size"].forEach((k) => sp.delete(k));
        navigate({ pathname: "search", search: "" }); // 빈 상태(안내 문구만 보임)
    };

    const onTabSwitch = (nextTab: number) => {
        if (activeTab === nextTab) return;
        setActiveTab(nextTab);

        // 내부 선택 상태 초기화
        setInternalSel(null);
        setTabResetKey((k) => k + 1);

        // 이전 탭의 캐시/스크롤 흔적 제거
        clearSessionByPrefixes(CLEAR_CACHE_PREFIXES);
        window.scrollTo({ top: 0 });

        // 결과 비우기 위해 URL 쿼리 리셋
        resetUrlAndGoEmpty();

        requestAnimationFrame(blurActiveInRoot);
    };

    const toggleSelection = (sel: Exclude<FilterSelection, null>, btn?: HTMLButtonElement) => {
        const isSame = selection && selection.mode === sel.mode && selection.value === sel.value;
        const next: FilterSelection = isSame ? null : sel;

        onChange?.(next);
        if (value === undefined) setInternalSel(sticky ? next : null);

        requestAnimationFrame(() => { blurActiveInRoot(); btn?.blur(); });
    };

    const isActiveKey = (mode: "initial" | "alpha" | "symbol", v: string) =>
        (value === undefined ? internalSel : value)?.mode === mode &&
        (value === undefined ? internalSel : value)?.value === v;

    const makeButton = (mode: "initial" | "alpha" | "symbol", v: string) => {
        const isActive = isActiveKey(mode, v);
        return (
            <ChipButton
                key={`${mode}-${v}`}
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => toggleSelection({ mode, value: v }, e.currentTarget)}
                aria-pressed={sticky ? isActive : undefined}
                data-active={isActive ? "true" : "false"}
                $active={isActive}
            >
                {v}
            </ChipButton>
        );
    };

    const renderGroup = (mode: "initial" | "alpha" | "symbol", items: string[]) => (
        <GroupGrid $cols={GRID_COLS}>{items.map((v) => makeButton(mode, v))}</GroupGrid>
    );

    /** 카테고리 적용 → catPath 쿼리로 search 라우팅 */
    const handleApplyCategory = (path: { id: number; name: string; depth: 0 | 1 | 2 }[]) => {
        const ids = path.map((p) => p.id).join("/");
        const sp = new URLSearchParams(location.search);
        ["q", "tag", "initial", "alpha", "symbol", "page"].forEach((k) => sp.delete(k));
        if (ids) sp.set("catPath", ids); else sp.delete("catPath");
        navigate({ pathname: "search", search: `?${sp.toString()}` });
    };

    return (
        <Root ref={rootRef} aria-label="탐색 방식 선택" onPointerDownCapture={handlePointerDownCapture}>
            {/* 캡슐형 탭 바 (가운데 정렬 1:1) */}
            <CapsuleWrap role="tablist" aria-label="탐색 방식">
                <Capsule>
                    {/* 왼쪽: 분류별로 찾기 (activeTab === 1 이면 활성) */}
                    <CapsuleTab
                        role="tab"
                        aria-selected={activeTab === 1}
                        $active={activeTab === 1}
                        onClick={() => onTabSwitch(1)}
                    >
                        <span className="badge">분류별로 찾기</span>
                    </CapsuleTab>

                    {/* 오른쪽: 초성/알파벳/기호로 찾기 (activeTab === 0 이면 활성) */}
                    <CapsuleTab
                        role="tab"
                        aria-selected={activeTab === 0}
                        $active={activeTab === 0}
                        onClick={() => onTabSwitch(0)}
                    >
                        <span className="badge">초성 / 알파벳 / 기호로 찾기</span>
                    </CapsuleTab>
                </Capsule>
            </CapsuleWrap>

            {activeTab === 0 ? (
                <Panel role="tabpanel" aria-label="초성/알파벳/기호 패널">
                    <Row>
                        <LabelBox><LabelText>초성</LabelText></LabelBox>
                        {renderGroup("initial", INITIALS)}
                    </Row>
                    <Row>
                        <LabelBox><LabelText>알파벳</LabelText></LabelBox>
                        {renderGroup("alpha", ALPHABETS)}
                    </Row>
                    <RowLast>
                        <LabelBox><LabelText>기호</LabelText></LabelBox>
                        {renderGroup("symbol", SYMBOLS)}
                    </RowLast>
                </Panel>
            ) : (
                <Panel role="tabpanel" aria-label="분류별로 찾기 패널" key={tabResetKey}>
                    <CategoryAccordionPicker onApply={handleApplyCategory} />
                </Panel>
            )}
        </Root>
    );
};

export default ExploreFilterBar;
