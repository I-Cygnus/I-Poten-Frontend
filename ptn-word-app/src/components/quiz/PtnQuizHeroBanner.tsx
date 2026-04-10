import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import HeroFloatingIcons from "../common/HeroFloatingIcons.tsx";
import icon5 from "../../assets/hero/icon-5.png";

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

const HeroWrap = styled.section`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    margin-bottom: 12px;
    padding-block: clamp(26px, 6.5vw, 72px);
    position: relative;
    isolation: isolate;
    overflow: hidden;

    --bg: 255 253 252;
    --sky: 190 225 255;
    --left-accent: 215 230 255;

    --dash-purple: 200 180 255;
    --dash-pink: 245 190 255;
    --dash-lavender: 220 210 255;

    --title-color: #1a1f36;
    --sub-color: #475569;

    background: rgb(var(--bg));
    background-repeat: no-repeat;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        background:
                radial-gradient(circle at 12% 28%,
                rgb(var(--left-accent) / 0.9) 0%,
                rgb(var(--left-accent) / 0.4) 45%,
                transparent 75%
                ),
                radial-gradient(circle at 15% 75%,
                rgb(var(--sky) / 0.55) 0%,
                transparent 70%
                );

        filter: blur(80px);
        opacity: 0.85;
    }

    &::after {
        content: "";
        position: absolute;
        z-index: 0;
        pointer-events: none;

        width: clamp(500px, 65vw, 950px);
        height: clamp(500px, 65vw, 950px);
        right: -15%;
        top: 45%;
        transform: translateY(-50%);
        border-radius: 50%;

        background:
                radial-gradient(circle at 35% 35%,
                rgba(255, 255, 255, 0.9) 0%,
                transparent 60%
                ),
                radial-gradient(circle at 70% 35%,
                rgb(var(--dash-pink) / 0.65) 0%,
                rgb(var(--dash-lavender) / 0.3) 50%,
                transparent 80%
                ),
                radial-gradient(circle at 55% 65%,
                rgb(var(--dash-purple) / 0.62) 0%,
                transparent 70%
                ),
                radial-gradient(circle at 35% 85%,
                rgb(var(--sky) / 0.55) 0%,
                transparent 85%
                );

        -webkit-mask-image: radial-gradient(
                circle at 50% 50%,
                black 5%,
                rgba(0, 0, 0, 0.5) 45%,
                rgba(0, 0, 0, 0.05) 80%,
                transparent 100%
        );
        mask-image: radial-gradient(
                circle at 50% 50%,
                black 5%,
                rgba(0, 0, 0, 0.5) 45%,
                rgba(0, 0, 0, 0.1) 80%,
                transparent 100%
        );

        filter: blur(90px);
        opacity: 0.95;

        box-shadow:
                0 80px 150px -40px rgb(var(--dash-purple) / 0.25),
                inset 0 -30px 60px rgba(255, 255, 255, 0.4);
    }

    @media (max-width: 768px) {
        margin-bottom: 8px;
        padding-block: 24px 28px;
    }

    @media (max-width: 480px) {
        padding-block: 20px 24px;
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
    outline: 3px solid rgba(139, 223, 238, 0.55);
    outline-offset: -2px;
  }
`;

const Inset = styled.div`
  --hero-left-offset: 0px;
  --hero-right-offset: 0px;

  padding-left: calc(
    max(var(--shell-left, 20px), env(safe-area-inset-left)) + var(--hero-left-offset)
  );
  padding-right: calc(
    max(var(--shell-right, 20px), env(safe-area-inset-right)) + var(--hero-right-offset)
  );
`;

const HeroInner = styled.div<{ $align: "left" | "center" }>`
    position: relative;
    z-index: 2;
    width: 100%;
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
    margin: 0 auto;
`;

const TextWrap = styled.div`
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

const HeroTitle = styled.h1`
    margin: 0;
    font-weight: 760;
    letter-spacing: -0.06em;
    font-size: clamp(28px, 6vw, 56px);
    line-height: 1.08;
    color: var(--title-color);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);

    @media (max-width: 768px) {
        font-size: 32px;
        line-height: 1.12;
        letter-spacing: -0.05em;
    }

    @media (max-width: 480px) {
        font-size: 26px;
        line-height: 1.16;
    }
`;

const HeroSub = styled.p`
    margin: 12px 0 0 0;
    letter-spacing: -0.06em;
    font-size: clamp(14px, 2.6vw, 20px);
    line-height: 1.6;
    color: var(--sub-color);
    max-width: 64ch;

    @media (max-width: 768px) {
        margin-top: 10px;
        font-size: 15px;
        line-height: 1.55;
        max-width: 36ch;
    }

    @media (max-width: 480px) {
        font-size: 14px;
        line-height: 1.5;
        max-width: 30ch;
    }
`;

const FloatingIconsWrap = styled.div`
  @media (max-width: 480px) {
    display: none;
  }
`;

export default function PtnQuizHeroBanner({
                                                title = "포텐퀴즈",
                                                subtitle = "매일 5분, 면접 감각을 깨우는 퀴즈 루틴. 오답은 복습으로, 실력은 데이터로.",
                                                className,
                                                align = "left",
                                                narrow = true,
                                                offsetLeft = 0,
                                                offsetRight = 0,
                                                assetHost,
                                                linkTo = "/learning/quiz/home",
                                                floatingIcons,
                                                iconProps,
                                            }: Props) {
    const srcs = floatingIcons && floatingIcons.length > 0 ? floatingIcons : [icon5];

    return (
        <HeroWrap className={className} aria-label="포텐퀴즈 소개 배너">
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

            {/* 아이콘 레이어 */}
            <FloatingIconsWrap>
                <HeroFloatingIcons
                    srcs={srcs}
                    assetHost={assetHost}
                    {...(iconProps ?? {})}
                />
            </FloatingIconsWrap>

            {/* 전면 클릭 링크 */}
            <OverlayLink to={linkTo} aria-label="포텐퀴즈로 이동" />
        </HeroWrap>
    );
}