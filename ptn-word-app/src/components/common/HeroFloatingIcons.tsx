import React, { useMemo } from "react";
import styled from "styled-components";

type Pos = { left: number; top: number };

type Props = {
    srcs: string[];
    width?: string;
    height?: string;
    top?: string;
    rightOffset?: number;
    debug?: boolean;
    assetHost?: string;

    withShadow?: boolean;
    maxIconWidthPercent?: number | number[];
    scales?: number[];
    positions?: Pos[];
};

const Layer = styled.div<{ $w: string; $h: string; $top: string; $right: number; $debug?: boolean }>`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;

    > .field {
        position: absolute;
        top: ${({ $top }) => $top};

        right: calc(
            max(var(--ptn-main-right-gap, 20px), env(safe-area-inset-right))
            + ${({ $right }) => $right}px
        );

        width: ${({ $w }) => $w};
        height: ${({ $h }) => $h};
        ${({ $debug }) =>
            $debug &&
            "outline: 2px dashed rgba(0,128,255,.6); background: rgba(0,128,255,.06);"}
    }

    @media (max-width: 768px) {
        > .field {
          right: calc(
            max(var(--ptn-main-right-gap, 12px), env(safe-area-inset-right))
            + 0px
          );
        }
      }
`;

const Icon = styled.img<{ $z: number; $maxPct: number; $shadow: boolean }>`
    position: absolute;
    max-width: ${({ $maxPct }) => $maxPct}%;
    filter: ${({ $shadow }) => ($shadow ? "drop-shadow(0 18px 30px rgba(0,0,0,.25))" : "none")};
    transform-origin: center center;
    z-index: ${({ $z }) => $z};
`;

function absolutize(src: string, hostOrigin?: string): string {
    // 이미 절대 URL(https, http, //) 또는 data URL이면 그대로
    if (/^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) return src;

    // hostOrigin이 없거나 "/"면, 루트 기준으로만 처리
    if (!hostOrigin || hostOrigin === "/") {
        return src.startsWith("/") ? src : `/${src}`;
    }

    // hostOrigin 정규화해서 한 번만 슬래시 붙이기
    const base = hostOrigin.replace(/\/+$/, "");
    const path = src.replace(/^\/+/, "");
    return `${base}/${path}`;
}

const HeroFloatingIcons: React.FC<Props> = ({
                                                srcs,
                                                width = "clamp(220px, 26vw, 380px)",
                                                height = "clamp(160px, 24vw, 320px)",
                                                top = "clamp(16px, 6vw, 64px)",
                                                rightOffset = 0,
                                                debug = false,
                                                assetHost,

                                                withShadow = false,
                                                maxIconWidthPercent = 40,
                                                scales,
                                                positions,
                                            }) => {

    const count = Math.max(1, Math.min(3, srcs.length));
    const resolved = useMemo(
        () => srcs.slice(0, count).map((s) => absolutize(s, assetHost)),
        [srcs, assetHost, count]
    );

    // 기본 위치/스케일(개수별)
    const fallbackPositions: Pos[] =
        positions?.length ? positions.slice(0, count) :
            count === 1
                ? [{ left: 72, top: 22 }] // 한 개: 우상단 쪽
                : count === 2
                    ? [{ left: 60, top: 18 }, { left: 78, top: 36 }]
                    : [{ left: 18, top: 15 }, { left: 66, top: 15 }, { left: 46, top: 28 }];

    const fallbackScales: number[] =
        scales?.length ? scales.slice(0, count) :
            count === 1 ? [1.02] :
                count === 2 ? [1.0, 0.94] : [1.0, 0.92, 0.98];

    const getMaxPct = (i: number) =>
        Array.isArray(maxIconWidthPercent)
            ? (maxIconWidthPercent[i] ?? maxIconWidthPercent[maxIconWidthPercent.length - 1] ?? 40)
            : maxIconWidthPercent;

    return (
        <Layer $w={width} $h={height} $top={top} $right={rightOffset} $debug={debug} aria-hidden>
            <div className="field">
                {resolved.map((src, i) => (
                    <Icon
                        key={`${src}-${i}`}
                        src={src}
                        alt=""
                        $z={count - i}
                        $maxPct={getMaxPct(i)}
                        $shadow={withShadow}
                        style={{
                            left: `${fallbackPositions[i].left}%`,
                            top: `${fallbackPositions[i].top}%`,
                            transform: `translate(-50%, -50%) scale(${fallbackScales[i]})`,
                        }}
                        onError={() => console.warn("icon load fail:", src)}
                    />
                ))}
            </div>
        </Layer>
    );
};

export default HeroFloatingIcons;
