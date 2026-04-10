// src/components/category/SelectionSummary.tsx
import React from "react";
import styled from "styled-components";

const TOKENS = {
    color: {
        text: "#374151",
        blue: "#2563eb",
        border: "#e5e7eb",
        chipBg: "#eef2ff",
        chipBorder: "#c7d2fe",
        muted: "#6b7280",
    },
    space: (n: number) => `${n}px`,
};

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: ${TOKENS.space(8)};
  padding-top: ${TOKENS.space(12)};
  border-top: 1px solid ${TOKENS.color.border};
  margin-top: ${TOKENS.space(12)};
  flex-wrap: wrap;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${TOKENS.space(6)};
  padding: ${TOKENS.space(4)} ${TOKENS.space(10)};
  border-radius: 999px;
  background: ${TOKENS.color.chipBg};
  border: 1px solid ${TOKENS.color.chipBorder};
  color: ${TOKENS.color.blue};
  font-weight: 700;
  font-size: 12px;
`;

const Spacer = styled.span`
  color: ${TOKENS.color.muted};
  font-size: 12px;
`;

const Right = styled.div`
  margin-left: auto;
  display: inline-flex;
  gap: ${TOKENS.space(8)};
`;

const GhostBtn = styled.button`
  padding: ${TOKENS.space(6)} ${TOKENS.space(10)};
  border: 1px solid ${TOKENS.color.border};
  background: #fff;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
`;

const PrimaryBtn = styled.button<{ $disabled?: boolean }>`
  padding: ${TOKENS.space(6)} ${TOKENS.space(12)};
  border: none;
  background: ${({ $disabled }) => ($disabled ? "#93c5fd" : "#2563eb")};
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.8 : 1)};
`;

type PathNode = { id: number; name: string; depth: 0 | 1 | 2 };

type Props = {
    path: PathNode[];                 // 선택 경로(최대 3)
    onReset: () => void;
    onApply: (path: PathNode[]) => void;
};

const SelectionSummary: React.FC<Props> = ({ path, onReset, onApply }) => {
    const disabled = path.length === 0;

    return (
        <Bar aria-label="선택 요약">
            {path.length === 0 ? (
                <Spacer>선택한 분류가 없습니다.</Spacer>
            ) : (
                <>
                    {path.map((p, i) => (
                        <React.Fragment key={p.id}>
                            <Chip>{p.name}</Chip>
                            {i < path.length - 1 && <Spacer>›</Spacer>}
                        </React.Fragment>
                    ))}
                </>
            )}

            <Right>
                <GhostBtn type="button" onClick={onReset}>전체 초기화</GhostBtn>
                <PrimaryBtn
                    type="button"
                    onClick={() => onApply(path)}
                    $disabled={disabled}
                    aria-disabled={disabled}
                >
                    선택한 분류로 보기
                </PrimaryBtn>
            </Right>
        </Bar>
    );
};

export default SelectionSummary;
