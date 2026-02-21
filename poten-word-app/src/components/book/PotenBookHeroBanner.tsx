import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import HeroFloatingIcons from "../common/HeroFloatingIcons.tsx";

type Props = {
    title?: string;
    subtitle?: string;
    className?: string;
    align?: "left" | "center";
    narrow?: boolean;
    offsetLeft?: number;
    offsetRight?: number;
    floatingIcons?: [string, string, string];
    assetHost?: string;
    linkTo?: string;
    iconProps?: Partial<{
        width: string;
        height: string;
        top: string;
        rightOffset: number;
        debug: boolean;
        withShadow: boolean;
        maxIconWidthPercent: number;
        scales: [number, number, number];
        positions: [
            { left: number; top: number },
            { left: number; top: number },
            { left: number; top: number }
        ];
    }>;
};

/* ===== 블루(#407dd2) ↔ 핑크(#e9cbe6) 듀얼 그라디언트 ===== */
const HeroWrap = styled.section`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    margin-bottom: 12px;
    padding-block: clamp(26px, 6.5vw, 72px);
    position: relative;
    isolation: isolate;

    /* RGB 변수 */
    --blue: 64 125 210;    /* #407dd2 */
    --pink: 233 203 230;   /* #e9cbe6 */
    --title-color: #0f172a;
    --sub-color: #334155;

    /* 배경: 블루/핑크 라디얼 + 수직 그라디언트 */
    background:
            radial-gradient(1100px 720px at 18% 26%, rgb(var(--blue) / .42) 0%, transparent 66%),
            radial-gradient(1100px 720px at 82% 76%, rgb(var(--pink) / .50) 0%, transparent 66%),
            linear-gradient(180deg, rgb(var(--blue) / .12) 0%, rgb(var(--pink) / .22) 100%);

    /* 아주 은은한 수직 스트라이프 (유리효과 없음) */
    &:before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
                repeating-linear-gradient(
                        90deg,
                        rgba(255,255,255,.18) 0px 2px,
                        rgba(255,255,255,0) 2px 16px
                );
        mask: linear-gradient(0deg, transparent 0%, black 8%, black 92%, transparent 100%);
        pointer-events: none;
    }

    /* 중앙 글로우 */
    &:after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background: radial-gradient(900px 520px at 50% 55%, rgba(255,255,255,.35), transparent 60%);
        pointer-events: none;
    }

    /* 다크 모드: 텍스트만 톤업 */
    @media (prefers-color-scheme: dark) {
        --title-color: #e5e7eb;
        --sub-color: #cbd5e1;
    }
`;

const OverlayLink = styled(Link)`
    position: absolute;
    inset: 0;
    z-index: 10;
    display: block;
    pointer-events: auto;
    cursor: pointer;

    &:focus-visible {
        outline: 3px solid #407dd2;
        outline-offset: -2px;
        border-radius: 8px;
    }
`;

const Inset = styled.div`
    --hero-left-offset: 0px;
    --hero-right-offset: 0px;
    padding-left: calc(max(var(--shell-left, 20px), env(safe-area-inset-left)) + var(--hero-left-offset));
    padding-right: calc(max(var(--shell-right, 20px), env(safe-area-inset-right)) + var(--hero-right-offset));
`;

const HeroInner = styled.div<{ $align: "left" | "center" }>`
    position: relative;
    z-index: 1; /* 배경 오버레이 위 */
    display: grid;
    gap: 10px;
    justify-items: ${({ $align }) => ($align === "center" ? "center" : "start")};
    text-align: ${({ $align }) => ($align === "center" ? "center" : "left")};
`;

const HeroNarrow = styled.div<{ $narrow: boolean }>`
    width: 100%;
    max-width: ${({ $narrow, theme }) =>
            $narrow
                    ? `${theme?.custom?.layout?.narrowMaxWidth ?? 980}px`
                    : `${theme?.custom?.layout?.containerMaxWidth ?? 1280}px`};
    margin: 0;
`;

const HeroTitle = styled.h1`
    margin: 0;
    font-weight: 750;
    letter-spacing: -0.06em;
    font-size: clamp(30px, 6vw, 56px);
    line-height: 1.1;
    color: var(--title-color);
`;

const HeroSub = styled.p`
    margin: 12px 0 0 0;
    letter-spacing: -0.06em;
    font-size: clamp(14px, 2.4vw, 20px);
    line-height: 1.65;
    color: var(--sub-color);
    max-width: 60ch;
`;

const TextWrap = styled.div`
    position: relative;
`;

export default function PotenBookHeroBanner({
                                                title = "포텐북",
                                                subtitle = "경험의 밀도를 높이다. 선배들의 길을 따라 답을 찾는 시간.",
                                                className,
                                                align = "left",
                                                narrow = true,
                                                offsetLeft = 0,
                                                offsetRight = 0,
                                                floatingIcons,
                                                assetHost,
                                                linkTo = "/learning/book",
                                                iconProps
                                            }: Props) {
    return (
        <HeroWrap className={className} aria-label="포텐북 소개 배너">
            <Inset
                style={
                    {
                        ["--hero-left-offset" as any]: `${offsetLeft}px`,
                        ["--hero-right-offset" as any]: `${offsetRight}px`
                    } as React.CSSProperties
                }
            >
                <HeroInner $align={align}>
                    <HeroNarrow $narrow={narrow}>
                        <TextWrap>
                            <HeroTitle>{title}</HeroTitle>
                            <HeroSub>{subtitle}</HeroSub>
                        </TextWrap>
                    </HeroNarrow>
                </HeroInner>
            </Inset>

            {floatingIcons && (
                <HeroFloatingIcons srcs={floatingIcons} assetHost={assetHost} {...(iconProps ?? {})} />
            )}

            <OverlayLink to={linkTo} aria-label="포텐북 페이지로 이동" />
        </HeroWrap>
    );
}