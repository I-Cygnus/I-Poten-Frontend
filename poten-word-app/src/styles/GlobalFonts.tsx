import { createGlobalStyle } from "styled-components";
import GhanaWoff2 from "../assets/fonts/ghana-choco/GhanaChocolate.woff2?url";
import PretendardVarWoff2 from "../assets/fonts/pretendard/PretendardVariable.woff2?url";

export const GlobalFonts = createGlobalStyle`
    @font-face {
        font-family: "GhanaChocolate";
        src: url("${GhanaWoff2}") format("woff2");
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }

    /* Pretendard Variable */
    @font-face {
        font-family: "Pretendard Variable";
        src: url("${PretendardVarWoff2}") format("woff2");
        font-weight: 45 920;
        font-style: normal;
        font-display: swap;
    }

    :root {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    body {
        font-family: "Pretendard Variable", Pretendard, "Noto Sans KR",
        system-ui, -apple-system, "Segoe UI", sans-serif;

        font-synthesis: none;
        font-optical-sizing: auto;

        letter-spacing: -0.015em;
        word-break: keep-all;
        font-variant-numeric: tabular-nums;
    }
`;
