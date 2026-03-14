import React from "react";
import styled from "styled-components";

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

export default function OpenBetaEventLanding() {
    return (
        <Wrap>
            {IMAGES.map((src, index) => (
                <ImageSection key={index}>
                    <FullImage
                        src={src}
                        alt={`오픈베타 이벤트 이미지 ${index + 1}`}
                        loading={index === 0 ? "eager" : "lazy"}
                    />
                </ImageSection>
            ))}
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

const FullImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
`;