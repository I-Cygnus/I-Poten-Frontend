import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import RecentSearchList from "./RecentSearchList";
import { RECENT_KEY, addRecent, clearRecent, getRecent, removeRecent } from "../utils/recentSearch";

type Props = {
    value: string;
    onChange: (v: string) => void;
    onSearch: (term: string) => void;
};

/** 탐색 캡슐 톤(#4F76F1 → #3E63E0)에 맞춘 토큰 */
const TOKENS = {
    radius: 12,
    padX: 20,
    padY: 16,
    btnPadX: 16,
    btnPadY: 8,
    fontSize: 15,
    colors: {
        text: "#111827",
        placeholder: "#9CA3AF",
        bg: "#ffffff",
        border: "#e5e7eb",
        ring: "#e5e7eb",
        /** 포커스/브랜드 컬러 */
        primary: "#4F76F1",
        primaryStrong: "#3E63E0",
        ringFocus: "#4F76F1",
        /** 버튼 톤: 캡슐과 동일 그라데이션 */
        btnBg: "#4F76F1",
        btnBgHover: "#1e63d2",
        btnText: "#ffffff",
    },
    z: { popup: 20 },
    shadow: {
        sm: "0 1px 2px rgba(0,0,0,0.06)",
        xl: "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(0,0,0,0.05)",
        /** 캡슐 하이라이트 느낌 */
        innerHighlight: "inset 0 1px 0 rgba(255,255,255,0.25)",
        focusRing: "0 0 0 3px rgba(79,118,241,0.35)",
    },
};

const Wrapper = styled.div`
    position: relative;
`;

const InputShell = styled.div`
    position: relative;
`;

const InputContainer = styled.div<{ $focused: boolean }>`
    position: relative;
    border-radius: ${TOKENS.radius}px;
    background: ${TOKENS.colors.bg};
    box-shadow: ${TOKENS.shadow.sm};
    box-sizing: border-box;
    border-width: 1px;
    border-style: solid;
    border-color: ${({ $focused }) =>
            $focused ? TOKENS.colors.ringFocus : TOKENS.colors.ring};

    transition: border-color 120ms ease;
`;

const InputEl = styled.input`
    width: 100%;
    border: none;
    outline: none;
    border-radius: ${TOKENS.radius}px;
    padding: ${TOKENS.padY}px ${TOKENS.padX}px;
    padding-right: ${TOKENS.padX + 44}px; /* 버튼 공간 확보 */
    font-size: ${TOKENS.fontSize}px;
    color: ${TOKENS.colors.text};
    background: transparent;
    letter-spacing: -.02em;
    font-weight: 300;

    &::placeholder {
        color: ${TOKENS.colors.placeholder};
    }
`;

const SearchBtn = styled.button`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #5174e7;
    transition: opacity 120ms ease, transform 80ms ease;

    &:hover {
        opacity: 0.85;
    }

    &:active {
        transform: translateY(-50%) scale(0.96);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px rgba(81, 116, 231, 0.45);
        border-radius: 999px;
    }
`;

const BtnIcon = styled.svg`
    width: 18px;
    height: 18px;
    display: inline-block;
    color: #5174e7;
`;

const Popup = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    z-index: ${TOKENS.z.popup};
    margin-top: 8px;
    border-radius: 16px;
    border: 1px solid ${TOKENS.colors.border};
    background: ${TOKENS.colors.bg};
    box-shadow: ${TOKENS.shadow.xl};
`;

const SearchBar: React.FC<Props> = ({ value, onChange, onSearch }) => {
    const [open, setOpen] = useState(false);
    const [recent, setRecent] = useState<string[]>(() => getRecent());
    const [highlight, setHighlight] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const [isComposing, setIsComposing] = useState(false); // IME 가드

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = "recent-search-listbox";

    // 외부 클릭 시 팝업 닫기
    useEffect(() => {
        function onDocDown(e: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setHighlight(-1);
            }
        }
        document.addEventListener("mousedown", onDocDown);
        return () => document.removeEventListener("mousedown", onDocDown);
    }, []);

    // 다른 탭에서 localStorage 변경 반영
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === RECENT_KEY) setRecent(getRecent());
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const runSearch = (term: string) => {
        const t = term.trim();
        if (!t) return;
        const updated = addRecent(t);
        setRecent(updated);
        setOpen(false);
        setHighlight(-1);
        onSearch(t);
    };

    const filtered = useMemo(() => recent, [recent]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isComposing || (e.nativeEvent as any)?.isComposing) return; // IME 이중 가드

        if (e.key === "Enter") {
            e.preventDefault();
            if (open && highlight >= 0 && filtered[highlight]) runSearch(filtered[highlight]);
            else runSearch(value);
            return;
        }

        // 목록 네비게이션은 팝업이 열렸을 때만
        if (!open) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(filtered.length - 1, h + 1));
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(-1, h - 1));
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            setHighlight(-1);
            return;
        }
    };

    return (
        <Wrapper ref={wrapperRef}>
            <InputShell>
                <InputContainer $focused={isFocused}>
                    <InputEl
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => {
                            setIsFocused(true);
                            setOpen(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        placeholder="찾고 싶은 용어를 입력해 주세요."
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        aria-controls={listboxId}
                        aria-label="검색어 입력"
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={handleKeyDown}  // Enter/화살표/ESC 처리
                        enterKeyHint="search"      // 모바일 키보드 '검색'
                    />
                    <SearchBtn
                        type="button"
                        aria-label="검색"
                        onClick={() => runSearch(value)}
                    >
                        <BtnIcon viewBox="0 0 24 24">
                            <path
                                d="M21 21l-4.3-4.3m1.3-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </BtnIcon>
                    </SearchBtn>
                </InputContainer>
            </InputShell>

            {open && (
                <Popup role="dialog" aria-modal="true">
                    <RecentSearchList
                        items={filtered}
                        highlightedIndex={highlight}
                        onSelect={(v) => runSearch(v)}
                        onDelete={(v) => setRecent(removeRecent(v))}
                        onClear={() => {
                            clearRecent();
                            setRecent([]);
                        }}
                        listboxId={listboxId}
                    />
                </Popup>
            )}
        </Wrapper>
    );
};

export default SearchBar;
