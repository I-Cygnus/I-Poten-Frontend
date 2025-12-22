import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        bg: string;
        fg: string;
        surface: string;
        surfaceAlt: string;
        surfaceHover: string;
        border: string;
        muted: string;
        subtle: string;
        primary: string;
        primaryHover: string;
        tagBg: string;
        overlay: string;
        inputBg: string;
        inputBorder: string;
        inputPlaceholder: string;
        badgeRecruitingBg: string;
        badgeRecruitingFg: string;
        badgeClosedBg: string;
        badgeClosedFg: string;
        accent: string;
        accentHover: string;
        danger: string;
        dangerHover: string;
    }
}
