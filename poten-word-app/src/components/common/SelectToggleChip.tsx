import React from "react";
import styled from "styled-components";

const TOKENS = {
    gradientBrand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
    gradientBrandSoft:
        "linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%)",
    primaryStrong: "#3E63E0",
    focusRing: "rgba(79, 118, 241, 0.35)",
};

export const SelectToggleAbs = styled.button.attrs({ type: "button" })<{
    $on?: boolean;
}>`
  position: absolute;
  top: var(--st-top, 22px);
  left: var(--st-left, 20px);
  z-index: 3;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 0;

  background: ${({ $on }) => ($on ? TOKENS.gradientBrand : TOKENS.gradientBrandSoft)};
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
    box-shadow: 0 0 0 3px ${TOKENS.focusRing};
  }
`;

export const Hollow = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid ${TOKENS.primaryStrong};
  background: rgba(255, 255, 255, 0.7);
  display: block;
`;

export const CheckIcon: React.FC = () => (
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

export const SelectToggleMark: React.FC<{ checked: boolean }> = ({ checked }) =>
    checked ? <CheckIcon /> : <Hollow />;

/**
 * (선택) position을 컴포넌트 안에서 제어하고 싶으면 이 래퍼를 써도 됨.
 */
export function SelectToggleChip(props: {
    checked: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    ariaLabel?: string;
    title?: string;
    top?: number;
    left?: number;
}) {
    const { checked, onClick, ariaLabel, title, top = 22, left = 20 } = props;
    return (
        <SelectToggleAbs
            $on={checked}
            onClick={onClick}
            aria-label={ariaLabel}
            title={title}
            style={
                {
                    // CSS var로 주입 -> styled-components 재생성 최소화
                    ["--st-top" as any]: `${top}px`,
                    ["--st-left" as any]: `${left}px`,
                } as React.CSSProperties
            }
        >
            <SelectToggleMark checked={checked} />
        </SelectToggleAbs>
    );
}
