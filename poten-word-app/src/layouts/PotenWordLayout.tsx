import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import SearchBar from "../components/word/SearchBar.tsx";
import ExploreStageTabs from "../components/word/ExploreStageTabs";
import PotenWordHeroBanner from "../components/word/PotenWordHeroBanner.tsx";
import PotenNoteHeroBanner from "../components/note/PotenNoteHeroBanner.tsx";
import PotenBookHeroBanner from "../components/book/PotenBookHeroBanner.tsx";
import PotenQuizHeroBanner from "../components/quiz/PotenQuizHeroBanner.tsx";
import { NarrowLeft } from "../styles/layout";
import icon1 from "../assets/hero/icon-1.png";
import icon2 from "../assets/hero/icon-2.png";
import icon3 from "../assets/hero/icon-3.png";
import icon4 from "../assets/hero/icon-4.png";
import icon5 from "../assets/hero/icon-5.png";
import book1 from "../assets/hero/book-1.png";
import {FilterSelection} from "../components/word/ExploreFilterBar.tsx";

const UI = {
    line: "#e5e7eb",
    primary: "#3E63E0",
    primarySoft: "#eef2ff",
    text: "#0f172a",
    panel: "#ffffff",
    shadow: "0 20px 60px rgba(62,99,224,.08)",
};

const HERO_NAV_TEXT_OFFSET = 26;

const Shell = styled.div<{ $noSide?: boolean; $quizWide?: boolean; $flushBottom?: boolean }>`
    --container-max: ${({ $quizWide }) => ($quizWide ? "1440px" : "1280px")};
    --main-max: ${({ $quizWide }) => ($quizWide ? "1180px" : "980px")};
    --gutter: clamp(16px, 3.5vw, 28px);
    --side-w: 220px;
    --gap: 24px;

    max-width: calc(var(--container-max) + var(--gutter) * 2);
    margin-inline: auto;
    padding-inline: var(--gutter);

    padding-bottom: ${({ $flushBottom }) => ($flushBottom ? "0px" : "40px")};

    display: grid;
    gap: var(--gap);
    grid-template-columns: ${(p) =>
            p.$noSide ? "1fr" : "minmax(180px, var(--side-w)) minmax(0, 1fr)"};
    align-items: start;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        justify-items: center;
    }
`;

const Side = styled.nav`
    background: ${UI.panel};
    border: 1px solid ${UI.line};
    border-radius: 14px;
    padding: 14px;
    position: sticky;
    top: var(--side-top, 20px);
    align-self: start;
    margin-top: var(--side-mt, 0px);

    @media (max-width: 1024px) {
        position: static;
        width: min(680px, 100%);
    }
`;

const TitleLink = styled(NavLink)`
    display: block;
    font-weight: 750;
    font-size: 18px;
    letter-spacing: -0.02em;
    color: ${UI.text};
    background: #eef4ff;
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 8px;
    text-decoration: none;
    &:hover {
        background: #e6eeff;
    }
    &.active {
        outline: 2px solid ${UI.primary};
        color: ${UI.primary};
    }
`;

const List = styled.ul`
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: grid;
    gap: 6px;
`;

const ItemLink = styled(NavLink)`
    display: block;
    padding: 12px 12px;
    border-radius: 10px;
    font-weight: 700;
    color: ${UI.text};
    text-decoration: none;
    border: 1px solid transparent;
    &.active {
        background: ${UI.primarySoft};
        color: ${UI.primary};
        border-color: ${UI.primary};
    }
    &:hover {
        background: #f8fafc;
    }
`;

const SearchStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Main = styled.main`
    min-width: 0;
    width: 100%;
    max-width: var(--main-max);
    justify-self: center;
`;

export default function PotenWordLayout() {
    const loc = useLocation();
    const nav = useNavigate();
    const heroRef = React.useRef<HTMLDivElement | null>(null);
    const shellRef = React.useRef<HTMLDivElement | null>(null);
    const mainRef = React.useRef<HTMLElement | null>(null);

    const BASE = "/learning";

    const under = (base: string) =>
        loc.pathname === base || loc.pathname.startsWith(base + "/");

    // Hall 라우트 판별 추가
    const isQuizHallRoute = new RegExp(`^${BASE}\\/quiz\\/hall(\\/|$)`).test(loc.pathname);

    // 퀴즈 영역에서는 글로벌 히어로 숨김
    const hideGlobalHero = under(`${BASE}/quiz`);

    const isQuizLandingRoute = new RegExp(`^${BASE}\\/quiz\\/?$`).test(loc.pathname);

    // QuizTimelinePage 라우트 판별 추가
    const isQuizTimelineRoute = new RegExp(`^${BASE}\\/quiz\\/timeline(\\/|$)`).test(loc.pathname);

    // 오답노트 라우트도 판별 추가
    const isQuizWrongNotesRoute = new RegExp(`^${BASE}\\/quiz\\/wrong-notes(\\/|$)`).test(loc.pathname);

    // timeline / wrong-notes / hall 에서 QuizHero 노출
    const showQuizHero = isQuizTimelineRoute || isQuizWrongNotesRoute || isQuizHallRoute;

    // OX·초성·오늘의 등 “퀴즈 모드” 화면에서는 사이드 숨김 (퀴즈 전용 와이드)
    const isQuizModePage = new RegExp(`^${BASE}\\/quiz\\/daily(\\/|$)`).test(loc.pathname);

    // 라우트 분기
    const isLanding =
        loc.pathname === BASE ||
        loc.pathname === `${BASE}/` ||
        loc.pathname === `${BASE}/word` ||
        loc.pathname === `${BASE}/word/`;
    const isNotesRoute = under(`${BASE}/note`);
    const isFolderRoute = under(`${BASE}/folders`);
    const isBookRoute = under(`${BASE}/book`) || loc.pathname === "/book";
    const isTermsRoute = new RegExp(`^${BASE}\\/terms(\\/|$)`).test(loc.pathname);
    const isSearchRoute = new RegExp(`^${BASE}\\/search(\\/|$)`).test(loc.pathname);
    const isSearchLikeRoute = isSearchRoute || isTermsRoute;

    // 노출 플래그
    const showNoteHero = !hideGlobalHero && (isNotesRoute || isFolderRoute);
    const showBookHero = !hideGlobalHero && isBookRoute;
    const showWordHero =
        !hideGlobalHero && !isLanding && !isSearchLikeRoute && !showNoteHero && !isBookRoute;

    // 메인 랜딩에서는 검색/필터 숨김
    const showSearchBars =
        !hideGlobalHero &&
        !isLanding &&
        !isSearchLikeRoute &&
        !(isNotesRoute || isFolderRoute || isBookRoute);

    const isWordHome = loc.pathname === `${BASE}/word` || loc.pathname === `${BASE}/word/`;

    // ── 검색/필터 상태 동기화 ──
    const [q, setQ] = React.useState("");
    React.useEffect(() => {
        const sp = new URLSearchParams(loc.search);
        setQ((sp.get("q") ?? "").trim());
    }, [loc.search]);

    const handleSearch = (term: string) => {
        const t = term.trim();
        if (!t) return;
        const sp = new URLSearchParams(loc.search);
        sp.set("q", t);
        sp.delete("page");
        sp.delete("tag");
        nav({ pathname: `${BASE}/search`, search: `?${sp.toString()}` });
    };

    React.useLayoutEffect(() => {
        const apply = () => {
            const heroH = heroRef.current?.getBoundingClientRect().height ?? 0;

            const header =
                (document.querySelector("header") as HTMLElement | null) ??
                (document.querySelector('[role="banner"]') as HTMLElement | null);
            const headerH = header?.getBoundingClientRect().height ?? 0;

            document.documentElement.style.setProperty("--poten-hero-h", `${heroH}px`);
            document.documentElement.style.setProperty(
                "--poten-header-h",
                `${headerH}px`,
            );

            // Shell padding + margin을 합쳐서 "전체 콘텐츠 시작/끝 좌표" 계산
            if (shellRef.current) {
                const shell = shellRef.current;
                const rect = shell.getBoundingClientRect();
                const cs = getComputedStyle(shell);

                const padL = parseFloat(cs.paddingLeft || "0");
                const padR = parseFloat(cs.paddingRight || "0");

                const contentLeft = rect.left + padL;
                const contentRight = window.innerWidth - rect.right + padR;

                document.documentElement.style.setProperty(
                    "--shell-left",
                    `${contentLeft}px`,
                );
                document.documentElement.style.setProperty(
                    "--shell-right",
                    `${contentRight}px`,
                );
            }

            if (mainRef.current) {
                const mainRect = mainRef.current.getBoundingClientRect();
                const mainRightGap = window.innerWidth - mainRect.right;
                document.documentElement.style.setProperty(
                    "--poten-main-right-gap",
                    `${mainRightGap}px`,
                );
            }
        };

        apply();

        const ro = heroRef.current ? new ResizeObserver(apply) : undefined;
        ro?.observe(heroRef.current as Element);
        window.addEventListener("resize", apply);

        return () => {
            window.removeEventListener("resize", apply);
            ro?.disconnect();
        };
    }, [showWordHero, showNoteHero, showBookHero, showQuizHero, loc.pathname]);

    const [selection, setSelection] = React.useState<FilterSelection>(null);
    React.useEffect(() => {
        const sp = new URLSearchParams(loc.search);
        const initial = sp.get("initial");
        const alpha = sp.get("alpha");
        const symbol = sp.get("symbol");
        if (initial) setSelection({ mode: "initial", value: initial });
        else if (alpha) setSelection({ mode: "alpha", value: alpha });
        else if (symbol) setSelection({ mode: "symbol", value: symbol });
        else setSelection(null);
    }, [loc.search]);

    const handleFilterChange = (sel: FilterSelection) => {
        const sp = new URLSearchParams(loc.search);
        sp.delete("initial");
        sp.delete("alpha");
        sp.delete("symbol");
        if (sel) sp.set(sel.mode, sel.value);
        sp.delete("page");
        nav({ pathname: `${BASE}/search`, search: `?${sp.toString()}` });
    };

    return (
        <>
            {/* 라우트별 히어로 */}
            <div ref={heroRef} id="potenword-hero-anchor">
                {showWordHero && (
                    <PotenWordHeroBanner
                        align="left"
                        narrow
                        offsetLeft={HERO_NAV_TEXT_OFFSET}
                        floatingIcons={[icon1]}
                        iconProps={{
                            width: "360px",
                            height: "240px",
                            top: "70px",
                            rightOffset: -150,
                            maxIconWidthPercent: 100,
                            positions: [{ left: 30, top: 22 }],
                            scales: [1.00],
                            withShadow: false,
                        }}
                    />
                )}

                {showNoteHero && (
                    <PotenNoteHeroBanner
                        align="left"
                        narrow
                        offsetLeft={HERO_NAV_TEXT_OFFSET}
                        floatingIcons={[icon4]}
                        iconProps={{
                            width: "360px",
                            height: "240px",
                            top: "70px",
                            rightOffset: -150,
                            maxIconWidthPercent: 100,
                            positions: [{ left: 30, top: 22 }],
                            scales: [1.05],
                            withShadow: false,
                        }}
                    />
                )}

                {showBookHero && (
                    <PotenBookHeroBanner
                        align="left"
                        narrow
                        offsetLeft={HERO_NAV_TEXT_OFFSET}
                        floatingIcons={[book1]}
                        iconProps={{
                            width: "360px",
                            height: "240px",
                            top: "70px",
                            rightOffset: -130,
                            maxIconWidthPercent: 100,
                            positions: [{ left: 30, top: 22 }],
                            scales: [1.05],
                            withShadow: false,
                        }}
                    />
                )}

                {/* QuizTimeline / WrongNotes 일 때 QuizHero 노출 */}
                {showQuizHero && (
                    <PotenQuizHeroBanner
                        align="left"
                        narrow
                        offsetLeft={HERO_NAV_TEXT_OFFSET}
                        // 아이콘은 필요하면 교체/추가
                        floatingIcons={[icon5]}
                        iconProps={{
                            width: "360px",
                            height: "240px",
                            top: "72px",
                            rightOffset: -140,
                            maxIconWidthPercent: 100,
                            positions: [{ left: 30, top: 22 }],
                            scales: [0.65],
                            withShadow: false,
                        }}
                    />
                )}
            </div>

            {/* 히어로 아래 레이아웃 */}
            <Shell
                ref={shellRef}
                data-testid="potenword-shell"
                $noSide={isQuizModePage || isLanding || isSearchLikeRoute || isQuizLandingRoute}
                $quizWide={isQuizModePage}
                $flushBottom={isSearchLikeRoute}
                style={{
                    ["--side-top" as any]: "calc(var(--poten-header-h, 0px) + 20px)",
                    ["--side-mt" as any]:
                        showWordHero || showNoteHero || showBookHero || showQuizHero ? "12px" : "0px",
                }}
            >
                {/* 메인 랜딩(/learning) 에서는 사이드바 렌더 X */}
                {!isQuizModePage && !isLanding && !isSearchLikeRoute && !isQuizLandingRoute && (
                    <Side aria-label="포텐워드 네비게이션">
                        <TitleLink
                            to={`${BASE}/word`}
                            end
                            aria-label="포텐워드 홈으로"
                        >
                            포텐워드
                        </TitleLink>
                        <List>
                            <li>
                                <ItemLink to={`${BASE}/note`} end>
                                    포텐노트
                                </ItemLink>
                            </li>
                            <li>
                                <ItemLink to={`${BASE}/quiz/home`}>포텐퀴즈</ItemLink>
                            </li>
                            <li>
                                <ItemLink to={`${BASE}/book`}>포텐북</ItemLink>
                            </li>
                        </List>
                    </Side>
                )}

                <Main ref={mainRef}>
                    {showSearchBars && (
                        <SearchStack style={{ marginTop: "var(--side-mt, 0px)" }}>
                            <NarrowLeft>
                                <SearchBar value={q} onChange={setQ} onSearch={handleSearch} />
                            </NarrowLeft>

                            <NarrowLeft>
                                <ExploreStageTabs defaultCollapsed={false} />
                            </NarrowLeft>
                        </SearchStack>
                    )}
                    <Outlet />
                </Main>
            </Shell>
        </>
    );
}