// src/components/category/CategoryColumn.tsx
import React from "react";
import styled from "styled-components";
import type { Category } from "../../hooks/useCategoryTree";

const TOKENS = {
    color: {
        text: "#374151",
        muted: "#6b7280",
        border: "#e5e7eb",
        selectedBg: "#eef2ff",
        selectedText: "#2563eb",
    },
    space: (n: number) => `${n}px`,
};

const ColWrap = styled.div`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;                            
    border-right: 1px solid ${TOKENS.color.border};

    &:last-child {
        border-right: none;
    }
`;
const ColHeader = styled.div`
  padding: ${TOKENS.space(10)} ${TOKENS.space(12)};
  font-size: 14px;
  font-weight: 700;
  color: ${TOKENS.color.text};
  background: #f8fafc;
  border-bottom: 1px solid ${TOKENS.color.border};
`;

const List = styled.ul`
  margin: 0;
  padding: 4px 0;
  list-style: none;
  max-height: 320px;
  overflow: auto;
  scrollbar-gutter: stable both-edges;
  overflow-y: scroll;
`;

const Row = styled.li<{ $selected: boolean }>`
  padding: ${TOKENS.space(8)} ${TOKENS.space(12)};
  font-size: 14px;
  color: ${({ $selected }) => ($selected ? TOKENS.color.selectedText : TOKENS.color.text)};
  background: ${({ $selected }) => ($selected ? TOKENS.color.selectedBg : "transparent")};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${({ $selected }) => ($selected ? TOKENS.color.selectedBg : "#f9fafb")};
  }
`;

const Placeholder = styled.div`
  padding: ${TOKENS.space(12)};
  color: ${TOKENS.color.muted};
  font-size: 14px;
`;

type Props = {
    title: string;
    items: Category[];
    selectedId?: number | null;
    onSelect?: (c: Category) => void;
    loading?: boolean;
    placeholder?: string;
    emptyText?: string;
};

const CategoryColumn: React.FC<Props> = ({
                                             title,
                                             items,
                                             selectedId,
                                             onSelect,
                                             loading,
                                             placeholder,
                                             emptyText = "하위 분류 없음",
                                         }) => {
    return (
        <ColWrap role="region" aria-label={title}>
            <ColHeader>{title}</ColHeader>

            {loading ? (
                <Placeholder>불러오는 중...</Placeholder>
            ) : items.length === 0 ? (
                <Placeholder>{placeholder ?? emptyText}</Placeholder>
            ) : (
                <List role="listbox" aria-label={`${title} 목록`}>
                    {items.map((it) => (
                        <Row
                            key={it.id}
                            role="option"
                            aria-selected={selectedId === it.id}
                            $selected={selectedId === it.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onSelect?.(it)}
                            title={it.name}
                        >
                            {it.name}
                        </Row>
                    ))}
                </List>
            )}
        </ColWrap>
    );
};

export default CategoryColumn;
