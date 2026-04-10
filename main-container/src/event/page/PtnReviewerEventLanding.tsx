import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import reviewer1 from "../../assets/event/reviewer/01.jpg";
import reviewer2 from "../../assets/event/reviewer/02.jpg";
import reviewer3 from "../../assets/event/reviewer/03.jpg";
import reviewer4 from "../../assets/event/reviewer/04.jpg";

const IMAGES = [reviewer1, reviewer2, reviewer3, reviewer4];

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
    3: [
        {
            x1: 738,
            x2: 1180,
            y1: 605.72,
            y2: 665.72,
            to: "/review-survey",
            label: "포텐 리뷰어 03 바로가기 : 실제 리뷰 페이지로 이동",
        },
    ],
};

export default function PtnReviewerEventLanding() {
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
                                alt={`포텐 리뷰어 이벤트 이미지 ${pageNumber}`}
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

const Wrap = styled.div`
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

    /* 위치 확인용
    background: rgba(255, 0, 0, 0.18);
    */

    &:focus-visible {
        outline: 2px solid #111111;
        outline-offset: 2px;
    }
`;