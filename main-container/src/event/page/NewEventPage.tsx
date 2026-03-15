import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import event1 from "../../assets/event/thumbnail/01.jpg";
import event2 from "../../assets/event/thumbnail/02.jpg";
import reviewer1 from "../../assets/event/reviewer/01.jpg";
import reviewer2 from "../../assets/event/reviewer/02.jpg";
import reviewer3 from "../../assets/event/reviewer/03.jpg";
import reviewer4 from "../../assets/event/reviewer/04.jpg";

type EventStatus = "ALL" | "ONGOING" | "ENDED" | "WINNER";

type BadgeType = "ENDED" | "ALWAYS" | "DDAY";

type EventItem = {
    id: number;
    title: string;
    isNew?: boolean;
    startDate: string;
    endDate: string;
    imageUrl: string;
    status: EventStatus;
    badge: {
        type: BadgeType;
        text: string;
    };
    author?: string;
    createdAt?: string;
    contentHtml?: string;
    detailImages?: string[];
};

type WinnerPost = {
    id: number;
    tag: string;        // "당첨자"
    title: string;      // "오픈베타 이벤트 당첨자 안내"
    createdAt: string;  // "2026-03-15"
};

const WINNER_DUMMY: WinnerPost[] = [
    {
        id: 1,
        tag: "당첨자",
        title: "오픈베타 이벤트 당첨자 안내",
        createdAt: "2026-03-15",
    },
];

const PAGE = styled.div`
    width: 100%;
    min-height: 100%;
    background: #ffffff;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
`;

const Container = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 64px 24px 80px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 44px;
    font-weight: 700;
    letter-spacing: -0.8px;
    color: #111111;
`;

const Tabs = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TabBtn = styled.button<{ $active?: boolean }>`
    appearance: none;
    border: 0;
    cursor: pointer;

    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.3px;

    padding: 10px 16px;
    border-radius: 999px;

    background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
    color: #111111;

    box-shadow: ${({ $active }) =>
    $active ? "inset 0 0 0 2px #111111" : "none"};
    opacity: ${({ $active }) => ($active ? 1 : 0.7)};

    &:hover {
        opacity: 1;
    }
`;

const Divider = styled.div`
  margin-top: 16px;
  height: 1px;
  width: 100%;
  background: rgba(0, 0, 0, 0.75);
`;

const Grid = styled.div`
    margin-top: 44px; /* 28px -> 44px (Divider 아래 여백 증가) */
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 42px;

    @media (max-width: 980px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 34px;
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: 28px;
    }
`;

const Card = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const ThumbWrap = styled.div`
    position: relative;
    width: 100%;
    border-radius: 0px;
    overflow: visible;
    background: #f3f4f6;
    isolation: isolate;
    margin-top: 22px;
`;

const Thumb = styled.img`
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
`;

// 둥근 배지
// const Badge = styled.div<{ $type: BadgeType }>`
//     position: absolute;
//     top: -16px;
//     left: 12px;
//
//     width: 52px;
//     height: 52px;
//     border-radius: 999px;
//
//     display: grid;
//     place-items: center;
//
//     font-size: 12px;
//     font-weight: 400;
//     letter-spacing: -0.2px;   /* -0.3 -> -0.2 (뭉개짐도 줄어듦) */
//     line-height: 1;
//     white-space: nowrap;
//     word-break: keep-all;
//
//     color: #ffffff;
//     box-shadow: 0 8px 20px rgba(0,0,0,0.14);
//
//     transform: translateZ(0);
//     will-change: transform;
//
//     background: ${({ $type }) => {
//         if ($type === "ENDED") return "#8b8b8b";
//         if ($type === "ALWAYS") return "#ff4d4d";
//         return "#2f6feb";
//     }};
// `;

const Badge = styled.div<{ $type: BadgeType }>`
    position: absolute;
    top: -40px;
    left: 0px;
    z-index: 3;
    width: 68px;
    height: 28px;

    border-radius: 0px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    font-size: 13px;
    font-weight: 400;
    letter-spacing: -0.2px;
    line-height: 1;
    white-space: nowrap;

    color: #ffffff;

    background: ${({ $type }) => {
    if ($type === "ENDED") return "#6D7D9D";
    if ($type === "ALWAYS") return "#F24E57";
    return "#578BF2";
}};
`;

const Meta = styled.div`
  margin-top: 14px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EventTitle = styled.div`
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.4px;
    color: #111111;
`;

const NewPill = styled.span`
    display: inline-grid;
    place-items: center;

    width: 22px;
    height: 22px;
    border-radius: 999px;

    background: #000000;
    color: #ffffff;

    font-size: 12px;
    font-weight: 800;
    line-height: 1;
`;

const Dates = styled.div`
    margin-top: 8px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.45);
`;

function formatRange(start: string, end: string) {
    return `${start}~${end}`;
}

const TABS: { key: EventStatus; label: string }[] = [
    { key: "ALL", label: "전체" },
    { key: "ONGOING", label: "진행중" },
    { key: "ENDED", label: "종료" },
//     { key: "WINNER", label: "당첨자발표" },
];

const DUMMY: EventItem[] = [
    {
        id: 1,
        title: "오픈베타 이벤트",
        isNew: true,
        startDate: "2026-03-15",
        endDate: "2026-04-15",
        imageUrl: event1,
        status: "ONGOING",
        badge: { type: "DDAY", text: "" },
    },
    {
        id: 2,
        title: "포텐 리뷰어 이벤트",
        isNew: true,
        startDate: "2026-03-15",
        endDate: "2026-04-15",
        imageUrl: event2,
        status: "ONGOING",
        badge: { type: "DDAY", text: "" },
        detailImages: [reviewer1, reviewer2, reviewer3, reviewer4],
    },
];

const WinnerWrap = styled.div`
  margin-top: 44px;
`;

const WinnerTable = styled.div`
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.75);
`;

const WinnerHead = styled.div`
    display: grid;
    grid-template-columns: 1fr 160px;
    align-items: center;
    padding: 18px 20px;
    background: rgba(0, 0, 0, 0.04);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);

    font-size: 15px;
    font-weight: 600;
    color: #111111;
`;

const WinnerHeadCell = styled.div`
  text-align: center;
`;

const WinnerRow = styled.a`
    display: grid;
    grid-template-columns: 1fr 160px;
    align-items: center;
    padding: 18px 20px;
    text-decoration: none;
    color: inherit;

    border-bottom: 1px solid rgba(0, 0, 0, 0.08);

    &:hover {
        background: rgba(0, 0, 0, 0.02);
    }
`;

const WinnerTitleCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const WinnerTag = styled.span`
  flex: 0 0 auto;
  height: 26px;
  padding: 0 12px;
  border-radius: 6px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 600;

  background: #ffffff;
  color: #578BF2;
  border: 1px solid rgba(87, 139, 242, 0.6);
`;

const WinnerTitleText = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: #111111;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const WinnerDate = styled.div`
    font-size: 15px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    text-align: center;
`;

const WinnerFooter = styled.div`
  padding: 22px 0 0;
`;

const StackedImages = styled.div`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);

    img {
        width: 100%;
        height: auto;
        display: block;
    }
`;

const Pagination = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 24px;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;

    padding: 6px 2px;
    font-size: 14px;
    font-weight: ${({ $active }) => ($active ? 600 : 400)};
    color: ${({ $active }) => ($active ? "#111111" : "rgba(0,0,0,0.6)")};
    line-height: 1;

    position: relative;

    &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -2px;
        height: 2px;
        background: ${({ $active }) => ($active ? "#578BF2" : "transparent")};
        border-radius: 2px;
    }

    &:hover {
        color: #111111;
    }
`;

const Ellipsis = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: rgba(0,0,0,0.45);
  padding: 6px 2px;
`;

const SearchBar = styled.div`
  margin-top: 0px;
  display: flex;
  justify-content: center;
`;

const SearchBox = styled.div`
  width: min(480px, 100%);
  height: 48px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.14);

  display: grid;
  grid-template-columns: 120px 1fr 54px;
  align-items: center;
  overflow: hidden;
`;

const SearchSelect = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: 600;
  color: rgba(0,0,0,0.65);
  letter-spacing: -0.02em;

  border-right: 1px solid rgba(0,0,0,0.10);
`;

const SearchInput = styled.input`
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;

  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #111111;
  letter-spacing: -0.02em;

  &::placeholder {
    color: rgba(0,0,0,0.35);
  }
`;

const SearchButton = styled.button`
  height: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;

  display: grid;
  place-items: center;

  border-left: 1px solid rgba(0,0,0,0.10);
  color: rgba(0,0,0,0.55);

  &:hover {
    color: rgba(0,0,0,0.8);
  }
`;

function parseLocalDate(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(from: Date, to: Date) {
    const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function getEventBadge(endDate: string, always?: boolean) {
    if (always) {
        return { type: "ALWAYS" as const, text: "상시진행" };
    }

    const today = new Date();
    const end = parseLocalDate(endDate);
    const dday = diffDays(today, end);

    if (dday < 0) {
        return { type: "ENDED" as const, text: "종료" };
    }

    return { type: "DDAY" as const, text: `D-${dday}` };
}

function getEventStatus(startDate: string, endDate: string): EventStatus {
    const today = startOfDay(new Date());
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);

    if (today < start) return "ALL"; // 필요하면 UPCOMING 같은 상태 따로 추가
    if (today > end) return "ENDED";
    return "ONGOING";
}

const NewEventPage: React.FC = () => {
    const [active, setActive] = useState<EventStatus>("ONGOING");
    const [winnerQuery, setWinnerQuery] = useState("");
    const [winnerPage, setWinnerPage] = useState(1);
    const WINNER_PAGE_SIZE = 10;

    const [eventQuery, setEventQuery] = useState("");
    const [eventPage, setEventPage] = useState(1);
    const EVENT_PAGE_SIZE = 6;

    // TODO: API 붙일 때 여기 events만 교체
    const events = DUMMY;

    // active 탭 기준 필터링(기존 filtered 유지)
    const filtered = useMemo(() => {
        if (active === "ALL") return events;
        return events.filter((e) => e.status === active);
    }, [events, active]);

    // 이벤트 검색(제목 기준)
    const eventFiltered = useMemo(() => {
        const q = eventQuery.trim().toLowerCase();
        if (!q) return filtered;
        return filtered.filter((e) => e.title.toLowerCase().includes(q));
    }, [filtered, eventQuery]);

    // 이벤트 페이지 수
    const eventTotalPages = Math.max(1, Math.ceil(eventFiltered.length / EVENT_PAGE_SIZE));

    // 이벤트 페이지 버튼 목록
    const eventPagesToShow = useMemo(() => {
        const total = eventTotalPages;
        const current = eventPage;

        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        const base = [1, 2, 3, 4, 5, 6];

        if (current > 6 && current < total) {
            const start = Math.max(1, current - 2);
            const end = Math.min(total, current + 2);
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

            const result: (number | "…")[] = [1];
            if (start > 2) result.push("…");
            result.push(...range);
            if (end < total - 1) result.push("…");
            result.push(total);
            return result;
        }

        return [...base, "…", total];
    }, [eventTotalPages, eventPage]);

    // 이벤트 페이지 아이템
    const eventPageItems = useMemo(() => {
        const start = (eventPage - 1) * EVENT_PAGE_SIZE;
        return eventFiltered.slice(start, start + EVENT_PAGE_SIZE);
    }, [eventFiltered, eventPage]);

    useEffect(() => {
        if (active === "WINNER") return;
        setEventPage(1);
        setEventQuery("");
    }, [active]);

    // 이벤트 검색어가 바뀌면 1페이지로
    useEffect(() => {
        setEventPage(1);
    }, [eventQuery]);

    const winnerFiltered = useMemo(() => {
        const q = winnerQuery.trim().toLowerCase();
        if (!q) return WINNER_DUMMY;
        return WINNER_DUMMY.filter((p) => p.title.toLowerCase().includes(q));
    }, [winnerQuery]);

    const winnerTotalPages = Math.max(1, Math.ceil(winnerFiltered.length / WINNER_PAGE_SIZE));

    const pagesToShow = useMemo(() => {
        const total = winnerTotalPages;
        const current = winnerPage;

        // total이 작으면 전부 노출
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        // 기본: 1~6 보여주고 ... 마지막 (이미지 스타일)
        // 필요하면 current 근처로 확장 가능
        const base = [1, 2, 3, 4, 5, 6];

        // current가 6보다 크면 current 주변 형태로
        if (current > 6 && current < total) {
            const start = Math.max(1, current - 2);
            const end = Math.min(total, current + 2);
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

            // 앞/뒤 보정해서 1, ..., range, ..., total 형태
            const result: (number | "…")[] = [1];
            if (start > 2) result.push("…");
            result.push(...range);
            if (end < total - 1) result.push("…");
            result.push(total);
            return result;
        }

        // current가 6 이하이면: 1~6 ... total
        return [...base, "…", total];
    }, [winnerTotalPages, winnerPage]);

    useEffect(() => {
        // 검색어가 바뀌면 1페이지로
        setWinnerPage(1);
    }, [winnerQuery]);

    const winnerPageItems = useMemo(() => {
        const start = (winnerPage - 1) * WINNER_PAGE_SIZE;
        return winnerFiltered.slice(start, start + WINNER_PAGE_SIZE);
    }, [winnerFiltered, winnerPage]);

    return (
        <PAGE>
            <Container>
                <HeaderRow>
                    <Title>이벤트</Title>
                    <Tabs>
                        {TABS.map((t) => (
                            <TabBtn
                                key={t.key}
                                type="button"
                                $active={active === t.key}
                                onClick={() => setActive(t.key)}
                            >
                                {t.label}
                            </TabBtn>
                        ))}
                    </Tabs>
                </HeaderRow>

                <Divider />

                {active === "WINNER" ? (
                    <WinnerWrap>
                        <WinnerTable>
                            <WinnerHead>
                                <WinnerHeadCell>제목</WinnerHeadCell>
                                <WinnerHeadCell>등록일</WinnerHeadCell>
                            </WinnerHead>

                            {winnerPageItems.map((post) => (
                                <WinnerRow key={post.id} href={`/news/event/winner/${post.id}`}>
                                    <WinnerTitleCell>
                                        <WinnerTag>{post.tag}</WinnerTag>
                                        <WinnerTitleText>{post.title}</WinnerTitleText>
                                    </WinnerTitleCell>
                                    <WinnerDate>{post.createdAt}</WinnerDate>
                                </WinnerRow>
                            ))}
                        </WinnerTable>

                        <WinnerFooter>
                            {/* WINNER pagination */}
                            <Pagination>
                                {pagesToShow.map((p, idx) =>
                                    p === "…" ? (
                                        <Ellipsis key={`w-e-${idx}`}>…</Ellipsis>
                                    ) : (
                                        <PageBtn
                                            key={`w-p-${p}`}
                                            type="button"
                                            $active={p === winnerPage}
                                            onClick={() => setWinnerPage(p)}
                                        >
                                            {p}
                                        </PageBtn>
                                    )
                                )}
                            </Pagination>

                            {/* WINNER search */}
                            <SearchBar>
                                <SearchBox>
                                    <SearchSelect>제목</SearchSelect>
                                    <SearchInput
                                        value={winnerQuery}
                                        onChange={(e) => setWinnerQuery(e.target.value)}
                                        placeholder="검색어 입력"
                                    />
                                    <SearchButton type="button" aria-label="search">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M21 21l-4.35-4.35"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </SearchButton>
                                </SearchBox>
                            </SearchBar>
                        </WinnerFooter>
                    </WinnerWrap>
                ) : (
                    <>
                        <Grid>
                            {eventPageItems.map((e) => {
                                const badge = getEventBadge(e.endDate);

                                return (
                                    <Card key={e.id} href={`/news/event/${e.id}`}>
                                        <ThumbWrap>
                                            <Thumb src={e.imageUrl} alt={e.title} />
                                            <Badge $type={badge.type}>{badge.text}</Badge>
                                        </ThumbWrap>

                                        <Meta>
                                            <TitleRow>
                                                <EventTitle>{e.title}</EventTitle>
                                                {e.isNew && <NewPill>N</NewPill>}
                                            </TitleRow>
                                            <Dates>{formatRange(e.startDate, e.endDate)}</Dates>
                                        </Meta>
                                    </Card>
                                );
                            })}
                        </Grid>

                        {/* EVENT pagination + search */}
                        <WinnerFooter>
                            <Pagination>
                                {eventPagesToShow.map((p, idx) =>
                                    p === "…" ? (
                                        <Ellipsis key={`e-e-${idx}`}>…</Ellipsis>
                                    ) : (
                                        <PageBtn
                                            key={`e-p-${p}`}
                                            type="button"
                                            $active={p === eventPage}
                                            onClick={() => setEventPage(p)}
                                        >
                                            {p}
                                        </PageBtn>
                                    )
                                )}
                            </Pagination>

                            <SearchBar>
                                <SearchBox>
                                    <SearchSelect>제목</SearchSelect>
                                    <SearchInput
                                        value={eventQuery}
                                        onChange={(e) => setEventQuery(e.target.value)}
                                        placeholder="검색어 입력"
                                    />
                                    <SearchButton type="button" aria-label="search">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M21 21l-4.35-4.35"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </SearchButton>
                                </SearchBox>
                            </SearchBar>
                        </WinnerFooter>
                    </>
                )}
            </Container>
        </PAGE>
    );
};

export default NewEventPage;