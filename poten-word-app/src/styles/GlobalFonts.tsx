import { createGlobalStyle } from "styled-components";
import GhanaWoff2 from "../assets/fonts/ghana-choco/GhanaChocolate.woff2?url";

export const GlobalFonts = createGlobalStyle`
    @font-face {
        font-family: 'GhanaChocolate';
        src: url('${GhanaWoff2}') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }
`;
