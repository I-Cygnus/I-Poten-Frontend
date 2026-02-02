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
    offsetLeft?: number;   // 왼쪽 라인 기준 +면 오른쪽으로
    offsetRight?: number;  // 오른쪽 패딩 조정
    floatingIcons?: [string, string, string];
    assetHost?: string;
    linkTo?: string;       // 배너 클릭 시 이동 경로
    iconProps?: Partial<{
        width: string;
        height: string;
        top: string;
        rightOffset: number;
        debug: boolean;
        withShadow: boolean;
        maxIconWidthPercent: number;
        scales: [number, number, number];
        positions: [{ left: number; top: number }, { left: number; top: number }, { left: number; top: number }];
    }>;
};

/* ===== 안전한 변수 기본값(라이트) + 다크/강제 오버라이드 지원 ===== */
const HeroWrap = styled.section`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    margin-bottom: 12px;
    padding-block: clamp(26px, 6.5vw, 72px);
    position: relative;
    isolation: isolate;

    /* SoftBg와 동일한 팔레트 */
    --soft-blue: 211 228 253;  /* rgba(211,228,253,...) */
    --soft-mint: 213 247 239;  /* rgba(213,247,239,...) */
    --base: #ffffff;

    --title-color: #0f172a;
    --sub-color: #334155;

    background:
            radial-gradient(
                    900px 900px at 20% 60%,
                    rgb(var(--soft-blue) / 0.55) 0%,
                    rgb(var(--soft-blue) / 0.30) 40%,
                    rgb(var(--soft-blue) / 0.15) 60%,
                    rgb(var(--soft-blue) / 0.05) 80%,
                    transparent 100%
            ),
            radial-gradient(
                    900px 900px at 80% 55%,
                    rgb(var(--soft-mint) / 0.55) 0%,
                    rgb(var(--soft-mint) / 0.30) 40%,
                    rgb(var(--soft-mint) / 0.15) 60%,
                    rgb(var(--soft-mint) / 0.05) 80%,
                    transparent 100%
            ),
            var(--base);

    background-repeat: no-repeat;

    @media (max-width: 640px) {
        background:
                radial-gradient(
                        600px 600px at 30% 70%,
                        rgb(var(--soft-blue) / 0.50) 0%,
                        rgb(var(--soft-blue) / 0.20) 50%,
                        transparent 100%
                ),
                radial-gradient(
                        600px 600px at 80% 50%,
                        rgb(var(--soft-mint) / 0.50) 0%,
                        rgb(var(--soft-mint) / 0.20) 50%,
                        transparent 100%
                ),
                var(--base);
    }

    @media (prefers-color-scheme: dark) {
        --soft-blue: 120 150 255;
        --soft-mint: 160 220 205;
        --base: #0a0f1c;
        --title-color: #e5e7eb;
        --sub-color: #9aa4b2;
    }

    :root[data-theme='light'] &,
    body[data-theme='light'] & {
        --soft-blue: 211 228 253;
        --soft-mint: 213 247 239;
        --base: #ffffff;
        --title-color: #0f172a;
        --sub-color: #334155;
    }

    :root[data-theme='dark'] &,
    body[data-theme='dark'] & {
        --soft-blue: 120 150 255;
        --soft-mint: 160 220 205;
        --base: #0a0f1c;
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

export default function PotenWordHeroBanner({
    title = "포텐워드",
    subtitle = "포텐워드와 함께, 기술 용어를 나만의 언어로 만들어 보세요.",
    className,
    align = "left",
    narrow = true,
    offsetLeft = 0,
    offsetRight = 0,
    floatingIcons,
    assetHost,
    linkTo = "/poten-word/terms",
    iconProps,
}: Props) {
    return (
        <HeroWrap className={className} aria-label="포텐워드 소개 배너">
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

            {floatingIcons && (
                <HeroFloatingIcons
                    srcs={floatingIcons}
                    assetHost={assetHost}
                    {...(iconProps ?? {})}
                />
            )}

            <OverlayLink to={linkTo} aria-label="포텐워드 단어 목록으로 이동" />
        </HeroWrap>
    );
}
