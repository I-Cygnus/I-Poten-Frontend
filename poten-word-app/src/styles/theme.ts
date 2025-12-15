import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    custom: {
        layout: {
            containerMaxWidth: 1280,   // 네비 Inner의 max-width와 동일
            gutterX: 20,               // 네비 좌우 padding과 동일
            containerWidths: { sm: 640, md: 768, lg: 1024, xl: 1280 },
            gutterXDesktop: 20,
            narrowMaxWidth: 980,   // ← 검색바·필터·카드에 쓸 “살짝 좁은” 폭
        },
    },
});
