import styled from "styled-components";

const Bg = styled.div`
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    body[data-modal-open="true"] & {
        display: none !important;
    }

    background:
            radial-gradient(620px 620px at 108% -40px,
            rgba(79, 118, 241, .2) 0%,
            rgba(79, 118, 241, .08) 38%,
            rgba(255, 255, 255, 0) 72%),
            radial-gradient(700px 700px at -80px 86%,
            rgba(40, 200, 163, .2) 0%,
            rgba(40, 200, 163, .08) 38%,
            rgba(255, 255, 255, 0) 72%),
            #ffffff;

    @media (max-width: 640px) {
        background:
                radial-gradient(460px 460px at 120% -60px,
                rgba(62, 99, 224, .24) 0%,
                rgba(62, 99, 224, .10) 34%,
                rgba(255,255,255,0) 70%),
                radial-gradient(520px 520px at -100px 100%,
                rgba(79, 118, 241, .18) 0%,
                rgba(79, 118, 241, .08) 36%,
                rgba(255,255,255,0) 70%),
                #ffffff;
    }
`;

export default function SoftBlobsBackground() {
    return <Bg aria-hidden />;
}
