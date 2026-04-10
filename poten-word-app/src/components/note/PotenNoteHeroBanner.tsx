import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import PotenNoteMark from "../../assets/hero/PotenNote-mark.png";

type Props = {
    brandTitle?: string;
    title?: string;
    desc?: string;
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

const fadeUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const HeroWrap = styled.section`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    margin-bottom: 12px;
    padding-block: clamp(20px, 4.8vw, 48px);
    min-height: clamp(240px, 28vw, 360px);
    display: flex;
    align-items: center;
    position: relative;
    isolation: isolate;
    overflow: hidden;

    font-family:
            "Pretendard",
            -apple-system,
            BlinkMacSystemFont,
            "Apple SD Gothic Neo",
            "Noto Sans KR",
            "Segoe UI",
            sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;

    --blob-blue: 170 185 255;
    --blob-pink: 255 190 210;
    --bg-top: #f9fbff;
    --bg-bottom: #ffffff;
    --title-color: #0f172a;
    --sub-color: #334155;

    background:
        radial-gradient(
            900px 600px at 20% 72%,
            rgb(var(--blob-blue) / 0.55) 0%,
            rgb(var(--blob-blue) / 0.28) 22%,
            rgb(var(--blob-blue) / 0.10) 38%,
            rgb(var(--blob-blue) / 0) 62%
        ),
        radial-gradient(
            700px 620px at 74% 30%,
            rgb(var(--blob-pink) / 0.34) 0%,
            rgb(var(--blob-pink) / 0.16) 32%,
            rgb(var(--blob-pink) / 0.05) 52%,
            rgb(var(--blob-pink) / 0) 66%
        ),
        linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
    background-repeat: no-repeat;

    @media (max-width: 640px) {
        min-height: 320px;
        padding-block: 40px 72px;

        background:
            radial-gradient(
                600px 420px at 24% 74%,
                rgb(var(--blob-blue) / 0.50) 0%,
                rgb(var(--blob-blue) / 0.20) 48%,
                transparent 100%
            ),
            radial-gradient(
                520px 460px at 78% 26%,
                rgb(var(--blob-pink) / 0.32) 0%,
                rgb(var(--blob-pink) / 0.14) 44%,
                transparent 100%
            ),
            linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
    }

    @media (prefers-color-scheme: dark) {
        --blob-blue: 120 150 255;
        --blob-pink: 255 150 205;
        --bg-top: #0b1222;
        --bg-bottom: #0a0f1c;
        --title-color: #e5e7eb;
        --sub-color: #9aa4b2;
    }

    :root[data-theme="light"] &,
    body[data-theme="light"] & {
        --blob-blue: 170 185 255;
        --blob-pink: 255 190 210;
        --bg-top: #f9fbff;
        --bg-bottom: #ffffff;
        --title-color: #0f172a;
        --sub-color: #334155;
    }

    :root[data-theme="dark"] &,
    body[data-theme="dark"] & {
        --blob-blue: 120 150 255;
        --blob-pink: 255 150 205;
        --bg-top: #0b1222;
        --bg-bottom: #0a0f1c;
        --title-color: #e5e7eb;
        --sub-color: #9aa4b2;
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
        outline: 3px solid rgba(79, 118, 241, 0.5);
        outline-offset: -2px;
    }
`;

const Inset = styled.div`
    --hero-left-offset: 0px;
    --hero-right-offset: 0px;

    width: 100%;
    padding-left: calc(max(var(--shell-left, 20px), env(safe-area-inset-left)) + var(--hero-left-offset));
    padding-right: calc(max(var(--shell-right, 20px), env(safe-area-inset-right)) + var(--hero-right-offset));
`;

const HeroInner = styled.div<{ $align: "left" | "center" }>`
    position: relative;
    z-index: 2;
    width: 100%;
    display: flex;
    justify-content: center;
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
    min-height: clamp(240px, 28vw, 360px);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    overflow: visible;

    @media (max-width: 768px) {
        min-height: 240px;
    }

    @media (max-width: 640px) {
        min-height: 208px;
        align-items: flex-start;
        justify-content: flex-start;
    }
`;

const TextWrap = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    width: min(calc(100% - 48px), 920px);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    transform: translate(-50%, -50%);

    @media (max-width: 768px) {
        top: 46%;
        width: calc(100% - 32px);
        gap: 4px;
    }

    @media (max-width: 640px) {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: min(100%, 560px);
        align-items: flex-start;
        text-align: left;
        gap: 6px;
    }
`;

const BrandTitle = styled.h1`
    margin: 0 0 14px;
    font-size: clamp(44px, 6vw, 68px);
    font-weight: 700;
    color: var(--title-color);
    letter-spacing: -0.02em;
    line-height: 1.1;

    @media (max-width: 640px) {
        margin-bottom: 6px;
        font-size: 44px;
        line-height: 1;
    }
`;

const HeroTitle = styled.h2`
    margin: 0 0 8px;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--title-color);
    line-height: 1.25;

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.12s;

    @media (max-width: 640px) {
        font-size: 28px;
        line-height: 1.25;
        word-break: keep-all;
    }
`;

const HeroDesc = styled.p`
    margin: 0;
    font-size: 15px;
    color: var(--sub-color);
    line-height: 1.6;
    letter-spacing: -0.02em;
    word-break: keep-all;

    opacity: 0;
    animation: ${fadeUp} 0.55s ease forwards;
    animation-delay: 0.2s;

    @media (max-width: 640px) {
        font-size: 15px;
        line-height: 1.6;
    }
`;

const HeroIconWrap = styled.div<{ $align: "left" | "center" }>`
    position: absolute;
    left: 50%;
    bottom: -12px;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    pointer-events: none;
    transform: translateX(-50%);
    width: 105vw;

    @media (max-width: 640px) {
        bottom: 0;
        width: min(1400px, 92vw);
    }
`;

const HeroIcon = styled.img<{ $width: string; $height?: string; $scale: number }>`
    display: block;
    width: ${({ $width }) => $width};
    max-width: none;
    height: ${({ $height }) => $height ?? "auto"};
    object-fit: contain;
    opacity: 0.18;
    transform: translateY(48px) scale(${({ $scale }) => $scale});
    transform-origin: center bottom;

    @media (max-width: 640px) {
        opacity: 0.16;
        filter: saturate(1.15) contrast(1.1) brightness(0.99) drop-shadow(0 10px 22px rgba(15, 23, 42, 0.08));
        -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 100%);
        mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 100%);
    }
`;

function absolutize(src: string, hostOrigin?: string): string {
    if (/^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) return src;
    if (!hostOrigin || hostOrigin === "/") return src.startsWith("/") ? src : `/${src}`;

    const base = hostOrigin.replace(/\/+$/, "");
    const path = src.replace(/^\/+/, "");
    return `${base}/${path}`;
}

export default function PotenNoteHeroBanner({
                                                brandTitle = "포텐노트",
                                                title = "필요한 개념만 골라 나만의 학습 노트를 만들어 보세요.",
                                                desc = "포텐워드에서 저장한 용어를 바탕으로, 헷갈리는 개념과 복습 포인트를 한곳에서 관리해 보세요.",
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
    const srcs = floatingIcons && floatingIcons.length > 0 ? floatingIcons : [PotenNoteMark];
    const heroIconSrc = absolutize(srcs[0], assetHost);
    const heroIconScale = iconProps?.scales?.[0] ?? 1.25;
    const heroIconWidth = iconProps?.width ?? "min(1000px, 68vw)";
    const heroIconHeight = iconProps?.height;

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
                            <BrandTitle>{brandTitle}</BrandTitle>
                            <HeroTitle>{title}</HeroTitle>
                            <HeroDesc>{desc}</HeroDesc>
                        </TextWrap>
                        <HeroIconWrap $align={align}>
                            <HeroIcon
                                src={heroIconSrc}
                                alt=""
                                aria-hidden="true"
                                $width={heroIconWidth}
                                $height={heroIconHeight}
                                $scale={heroIconScale}
                            />
                        </HeroIconWrap>
                    </HeroNarrow>
                </HeroInner>
            </Inset>

            <OverlayLink to={linkTo} aria-label="포텐노트로 이동" />
        </HeroWrap>
    );
}
