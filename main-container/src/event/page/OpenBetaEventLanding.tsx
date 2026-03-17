import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import event01 from "../../assets/event/openbeta/01.jpg";
import event02 from "../../assets/event/openbeta/02.jpg";
import event03 from "../../assets/event/openbeta/03.jpg";
import event04 from "../../assets/event/openbeta/04.jpg";
import event05 from "../../assets/event/openbeta/05.jpg";
import event06 from "../../assets/event/openbeta/06.jpg";
import event07 from "../../assets/event/openbeta/07.jpg";

const IMAGES = [
    event01,
    event02,
    event03,
    event04,
    event05,
    event06,
    event07,
];

type Hotspot = {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    to: string;
    label: string;
};

type ImageSize = {
    width: number;
    height: number;
};

const HOTSPOTS_BY_PAGE: Record<number, Hotspot[]> = {
    // 오픈베타 - 02.jpg
    2: [
        {
            x1: 470,
            x2: 780,
            y1: 873,
            y2: 940,
            to: "/vue-account/account/login",
            label: "오픈베타 02 첫 번째 바로가기 : AI 면접 체험권 1회 증정",
        },
        {
            x1: 800,
            x2: 1110,
            y1: 873,
            y2: 940,
            to: "/event/2",
            label: "오픈베타 02 두 번째 바로가기 : 포텐 리뷰어",
        },
        {
            x1: 1136,
            x2: 1448,
            y1: 873,
            y2: 940,
            to: "/vue-account/account/login",
            label: "오픈베타 02 세 번째 바로가기 : 크레딧",
        },
    ],

    // 오픈베타 - 03.jpg
    3: [
        {
            x1: 568,
            x2: 896,
            y1: 870,
            y2: 947.72,
            to: "/vue-ai-interview/ai-interview/landing", // TODO 임시 링크 교체
            label: "오픈베타 03 첫 번째 바로가기 : 기업별 면접 바로가기",
        },
        {
            x1: 1020,
            x2: 1350,
            y1: 870,
            y2: 947.72,
            to: "/vue-ai-interview/ai-interview/landing", // TODO 임시 링크 교체
            label: "오픈베타 03 두 번째 바로가기 : 인성 면접 바로가기",
        },
    ],

    // 오픈베타 - 04.jpg
    4: [
        {
            x1: 796,
            x2: 1122,
            y1: 903.72,
            y2: 985.72,
            to: "/event/2",
            label: "오픈베타 04 바로가기 : 포텐 리뷰어",
        },
    ],

    // 오픈베타 - 05.jpg
    5: [
        {
            x1: 796,
            x2: 1122,
            y1: 903.72,
            y2: 985.72,
            to: "/vue-account/account/login",
            label: "오픈베타 05 바로가기 : 크레딧 제공",
        },
    ],
};

export default function OpenBetaEventLanding() {
    const navigate = useNavigate();
    const [imageSizes, setImageSizes] = useState<Record<number, ImageSize>>({});

    const handleImageLoad = useCallback(
        (pageNumber: number, e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.currentTarget;
            setImageSizes((prev) => ({
                ...prev,
                [pageNumber]: {
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                },
            }));
        },
        []
    );

    return (
        <Wrap>
            {IMAGES.map((src, index) => {
                const pageNumber = index + 1;
                const hotspots = HOTSPOTS_BY_PAGE[pageNumber] ?? [];
                const size = imageSizes[pageNumber];

                return (
                    <ImageSection key={pageNumber}>
                        <ImageFrame>
                            <FullImage
                                src={src}
                                alt={`오픈베타 이벤트 이미지 ${pageNumber}`}
                                loading={pageNumber === 1 ? "eager" : "lazy"}
                                onLoad={(e) => handleImageLoad(pageNumber, e)}
                            />

                            {size &&
                                hotspots.map((spot, spotIndex) => {
                                    const left = (spot.x1 / size.width) * 100;
                                    const top = (spot.y1 / size.height) * 100;
                                    const width = ((spot.x2 - spot.x1) / size.width) * 100;
                                    const height = ((spot.y2 - spot.y1) / size.height) * 100;

                                    return (
                                        <HotspotButton
                                            key={`${pageNumber}-${spotIndex}`}
                                            type="button"
                                            aria-label={spot.label}
                                            style={{
                                                left: `${left}%`,
                                                top: `${top}%`,
                                                width: `${width}%`,
                                                height: `${height}%`,
                                            }}
                                            onClick={() => navigate(spot.to)}
                                        />
                                    );
                                })}
                        </ImageFrame>
                    </ImageSection>
                );
            })}
        </Wrap>
    );
}

const Wrap = styled.div.attrs({ className: "openbeta-full" })`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    background: #fff;
`;

const ImageSection = styled.section`
    width: 100vw;
    overflow: hidden;
`;

const ImageFrame = styled.div`
    position: relative;
    width: 100%;
`;

const FullImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
`;

const HotspotButton = styled.button`
    position: absolute;
    border: 0;
    background: transparent;
    cursor: pointer;
    z-index: 2;

    /* 개발 중 위치 확인하고 싶으면 주석 해제
    background: rgba(255, 0, 0, 0.18);
    */

    &:focus-visible {
        outline: 2px solid #111111;
        outline-offset: 2px;
    }
`;