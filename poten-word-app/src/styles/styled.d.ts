import "styled-components";
import type { Theme } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Theme {
        custom: {
            layout: {
                containerMaxWidth: number;   // 기본 컨테이너 폭
                gutterX: number;             // 좌우 여백
                // (옵션) 반응형 컨테이너 폭
                containerWidths?: Partial<Record<"sm" | "md" | "lg" | "xl", number>>;
                gutterXDesktop?: number;
                narrowMaxWidth?: number;
            };
        };
    }
    interface ThemeOptions {
        custom?: {
            layout?: Partial<Theme["custom"]["layout"]>;
        };
    }
}
declare module "styled-components" {
    export interface DefaultTheme extends Theme {}
}
