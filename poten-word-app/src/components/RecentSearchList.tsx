import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

type Props = {
    items: string[];
    highlightedIndex: number;
    onSelect: (v: string) => void;
    onDelete: (v: string) => void;
    onClear: () => void;
    listboxId?: string;
    autoSaveEnabled?: boolean;
    onToggleAutoSave?: (enabled: boolean) => void;
    onClose?: () => void;
};

const COLORS = {
    text: "#1f2937",
    textSub: "#6b7280",
    textSubLight: "#9ca3af",
    hoverBg: "#f9fafb",
    activeBg: "#f3f4f6",
    divider: "#e5e7eb",
};

const px = (n: number) => `${n}px`;

/* styled-components */
const EmptyWrap = styled.div`
    padding: ${px(16)} ${px(16)};
    font-size: ${px(14)};
    color: ${COLORS.textSub};
`;

const Root = styled.div`
    max-height: ${px(288)};
    overflow: auto;
`;

/** 헤더 영역: 제목 + 우측 '전체 삭제' */
const Header = styled.div`
    padding: ${px(12)} ${px(16)} ${px(8)};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${px(8)};
    border-bottom: 1px solid ${COLORS.divider};
`;

const SectionTitle = styled.span`
    font-size: ${px(12)};
    font-weight: 600;
    color: ${COLORS.textSub};
`;

const HeaderActions = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${px(8)};
`;

const HeaderButton = styled.button`
    font-size: ${px(11)};
    color: ${COLORS.textSubLight};
    background: transparent;
    border: none;
    padding: ${px(4)} ${px(8)};
    border-radius: 999px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
    letter-spacing: -.02em;
    font-weight: 400;

    &:hover {
        background: ${COLORS.hoverBg};
        color: ${COLORS.textSub};
    }
`;

const List = styled.ul`
    padding: ${px(4)} 0;
    margin: 0;
    list-style: none;
`;

const Row = styled.li<{ $active: boolean; $hovered: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${px(8)} ${px(16)};
    cursor: pointer;
    user-select: none;
    transition: background-color 120ms ease;
    background-color: ${({ $active, $hovered }) =>
            $active ? COLORS.activeBg : $hovered ? COLORS.hoverBg : "transparent"};
`;

const SelectBtn = styled.button`
    text-align: left;
    flex: 1;
    outline: none;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
`;

const ItemContent = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${px(8)};
    font-size: ${px(14)};
    color: ${COLORS.text};
`;

const ClockIcon = styled.svg`
    width: ${px(14)};
    height: ${px(14)};
    display: inline-block;
    color: ${COLORS.textSubLight};
`;

const DeleteBtn = styled.button<{ $visible: boolean }>`
    margin-left: ${px(8)};
    font-size: ${px(12)};
    color: ${({ $visible }) => ($visible ? "#4b5563" : COLORS.textSubLight)};
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transition: opacity 120ms ease, color 120ms ease;
    background: transparent;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
`;

/** 하단 푸터: 왼쪽 자동저장 토글 + 오른쪽 닫기 */
const Footer = styled.div`
    border-top: 1px solid ${COLORS.divider};
    padding: ${px(8)} ${px(16)};
    display: flex;
    align-items: center;
    gap: ${px(8)};
`;

const FooterButton = styled.button`
    font-size: ${px(11)};
    color: ${COLORS.textSubLight};
    background: transparent;
    border: none;
    padding: ${px(4)} ${px(8)};
    border-radius: 999px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
    letter-spacing: -.02em;
    font-weight: 400;

    &:hover {
        background: ${COLORS.hoverBg};
        color: ${COLORS.textSub};
    }
`;

const FooterButtonLeft = styled(FooterButton)`
    margin-right: auto;
`;

const RecentSearchList: React.FC<Props> = ({
                                               items,
                                               highlightedIndex,
                                               onSelect,
                                               onDelete,
                                               onClear,
                                               listboxId,
                                               autoSaveEnabled,
                                               onToggleAutoSave,
                                               onClose,
                                           }) => {
    const [internalAutoSave, setInternalAutoSave] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    const isControlledAutoSave = typeof autoSaveEnabled === "boolean";
    const autoSave = isControlledAutoSave ? autoSaveEnabled : internalAutoSave;

    const handleToggleAutoSave = () => {
        const next = !autoSave;
        if (!isControlledAutoSave) {
            setInternalAutoSave(next);
        }
        onToggleAutoSave?.(next);
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    // 하이라이트된 항목이 보이도록 자동 스크롤
    useEffect(() => {
        if (highlightedIndex < 0) return;
        const root = rootRef.current;
        if (!root) return;
        const el = root.querySelector<HTMLLIElement>(`[data-rs-idx="${highlightedIndex}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, [highlightedIndex]);

    // 빈 목록
    if (items.length === 0) {
        return (
            <EmptyWrap role="note" id={listboxId} aria-live="polite">
                최근 검색어가 없습니다.
            </EmptyWrap>
        );
    }

    return (
        <Root ref={rootRef} id={listboxId} role="listbox" aria-label="최근 검색어">
            <Header>
                <SectionTitle>최근 검색어</SectionTitle>

                <HeaderActions>
                    {/* 헤더 우측에는 '전체 삭제'만 */}
                    <HeaderButton
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={onClear}
                        aria-label="최근 검색어 전체 삭제"
                    >
                        전체 삭제
                    </HeaderButton>
                </HeaderActions>
            </Header>

            <List>
                {items.map((item, idx) => {
                    const active = idx === highlightedIndex;
                    const hovered = hoveredIndex === idx;

                    return (
                        <Row
                            key={item + idx}
                            data-rs-idx={idx}
                            role="option"
                            aria-selected={active}
                            $active={active}
                            $hovered={!!hovered}
                            onMouseDown={(e) => {
                                // blur 전에 선택 가능하도록
                                e.preventDefault();
                                onSelect(item);
                            }}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <SelectBtn
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => onSelect(item)}
                                tabIndex={-1}
                                aria-label={`${item} 선택`}
                            >
                                <ItemContent>
                                    <ClockIcon viewBox="0 0 24 24">
                                        <path
                                            d="M12 7v5l3 3"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeLinecap="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    </ClockIcon>
                                    {item}
                                </ItemContent>
                            </SelectBtn>

                            <DeleteBtn
                                type="button"
                                aria-label={`${item} 삭제`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item);
                                }}
                                tabIndex={-1}
                                title="삭제"
                                $visible={!!hovered}
                            >
                                ✕
                            </DeleteBtn>
                        </Row>
                    );
                })}
            </List>

            <Footer>
                {/* 왼쪽: 자동저장 토글 */}
                <FooterButtonLeft
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleToggleAutoSave}
                    aria-label={autoSave ? "최근 검색어 자동저장 끄기" : "최근 검색어 자동저장 켜기"}
                >
                    {autoSave ? "자동저장 끄기" : "자동저장 켜기"}
                </FooterButtonLeft>

                {/* 오른쪽: 닫기 (항상 노출) */}
                <FooterButton
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleClose}
                    aria-label="최근 검색어 목록 닫기"
                >
                    닫기
                </FooterButton>
            </Footer>
        </Root>
    );
};

export default RecentSearchList;
