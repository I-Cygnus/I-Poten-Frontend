import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import HeroFloatingIcons from "../common/HeroFloatingIcons.tsx";
import icon4 from "../../assets/hero/icon-4.png";

type Props = {
    title?: string;
    subtitle?: string;
    className?: string;
    align?: "left" | "center";
    narrow?: boolean;
    offsetLeft?: number;
    offsetRight?: number;
    assetHost?: string;
    linkTo?: string;
    floatingIcons?: string[];
    iconProps?: Partial<{
        width: string;
        height: string;
        top: string;
        rightOffset: number;
        debug: boolean;
        withShadow: boolean;
        maxIconWidthPercent: number | number[];
        scales: number[];
        positions: { left: number; top: number }[];
    }>;
};

/* ===== 안전한 색 변수 기본값(라이트) ===== */
const HeroWrap = styled.section`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    margin-bottom: 12px;
    padding-block: clamp(26px, 6.5vw, 72px);
    position: relative;
    isolation: isolate;

    /* blob은 공백 구분(r g b), 텍스트/배경은 변수로 통일 */
    --blob-blue: 170 185 255;
    --blob-pink: 255 165 190;
    --bg-top: #f9fbff;
    --bg-bottom: #ffffff;
    --title-color: #0f172a;
    --sub-color: #334155;

    background:
            radial-gradient(900px 600px at 20% 72%,
            rgb(var(--blob-blue) / 0.55) 0%,
            rgb(var(--blob-blue) / 0.28) 22%,
            rgb(var(--blob-blue) / 0.10) 38%,
            rgb(var(--blob-blue) / 0.00) 62%),
            radial-gradient(700px 620px at 74% 30%,
            rgb(var(--blob-pink) / 0.60) 0%,
            rgb(var(--blob-pink) / 0.26) 32%,
            rgb(var(--blob-pink) / 0.08) 52%,
            rgb(var(--blob-pink) / 0.00) 66%),
            linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
    background-repeat: no-repeat;

    /* 시스템 다크 선호(옵션) — 변수만 바꿔서 안전하게 */
    @media (prefers-color-scheme: dark) {
        --blob-blue: 120 150 255;
        --blob-pink: 255 110 190;
        --bg-top: #0b1222;
        --bg-bottom: #0a0f1c;
        --title-color: #e5e7eb;
        --sub-color: #9aa4b2;
    }

    /* 명시 오버라이드: <html data-theme="light|dark"> 로 강제 가능 */
    :root[data-theme='light'] &,
    body[data-theme='light'] & {
        --blob-blue: 170 185 255;
        --blob-pink: 255 165 190;
        --bg-top: #f9fbff;
        --bg-bottom: #ffffff;
        --title-color: #0f172a;
        --sub-color: #334155;
    }
    :root[data-theme='dark'] &,
    body[data-theme='dark'] & {
        --blob-blue: 120 150 255;
        --blob-pink: 255 110 190;
        --bg-top: #0b1222;
        --bg-bottom: #0a0f1c;
        --title-color: #e5e7eb;
        --sub-color: #9aa4b2;
    }
`;

/* 전면 오버레이 링크 */
const OverlayLink = styled(Link)`
    position: absolute;
    inset: 0;
    z-index: 10;
    display: block;
    pointer-events: auto;
    cursor: pointer;

    &:focus-visible {
        outline: 3px solid rgba(79,118,241,.5);
        outline-offset: -2px;
    }
`;

const Inset = styled.div`
    --hero-left-offset: 0px;
    --hero-right-offset: 0px;

    padding-left: calc(max(var(--shell-left, 20px), env(safe-area-inset-left)) + var(--hero-left-offset));
    padding-right: calc(max(var(--shell-right, 20px), env(safe-area-inset-right)) + var(--hero-right-offset));
`;

const HeroInner = styled.div<{ $align: "left" | "center" }>`
    display: grid;
    gap: 8px;
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
    font-size: clamp(28px, 6vw, 56px);
    line-height: 1.1;
    color: var(--title-color);
`;

const HeroSub = styled.p`
    margin: 12px 0 0 0;
    letter-spacing: -0.06em;
    font-size: clamp(14px, 2.6vw, 20px);
    line-height: 1.6;
    color: var(--sub-color);
`;

const TextWrap = styled.div`
    position: relative;
    z-index: 2; /* 아이콘 레이어(1) 위로 */
`;

export default function SpoonNoteHeroBanner({
                                                title = "포텐노트",
                                                subtitle = "필요한 개념만, 필요한 순간에 — 나만의 맞춤 학습 노트",
                                                className,
                                                align = "left",
                                                narrow = true,
                                                offsetLeft = 0,
                                                offsetRight = 0,
                                                assetHost,
                                                linkTo = "/learning/note",
                                                floatingIcons,
                                                iconProps,
                                            }: Props) {
    const srcs = (floatingIcons && floatingIcons.length > 0) ? floatingIcons : [icon4];

    return (
        <HeroWrap className={className} aria-label="포텐노트 소개 배너">
            <Inset
                style={
                    {
                        ["--hero-left-offset" as any]: `${offsetLeft}px`,
                        ["--hero-right-offset" as any]: `${offsetRight}px`,
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

            <HeroFloatingIcons srcs={srcs} {...(iconProps ?? {})} />
            <OverlayLink to={linkTo} aria-label="포텐노트로 이동" />
        </HeroWrap>
    );
}
