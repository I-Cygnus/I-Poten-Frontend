import React, { useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import OpenBetaEventLanding from "./OpenBetaEventLanding.tsx";
import PotenReviewerEventLanding from "./PotenReviewerEventLanding.tsx";

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

const DUMMY: EventItem[] = [
    {
        id: 1,
        title: "오픈베타 이벤트",
        isNew: true,
        startDate: "2026-03-08",
        endDate: "2026-03-31",
        imageUrl: event1,
        status: "ONGOING",
        badge: { type: "DDAY", text: "D-30" },
        author: "관리자",
        createdAt: "2026-03-15",
    },
    {
        id: 2,
        title: "포텐 리뷰어 이벤트",
        startDate: "2026-03-15",
        endDate: "2026-03-31",
        imageUrl: event2,
        status: "ONGOING",
        badge: { type: "DDAY", text: "D-30" },
        author: "관리자",
        createdAt: "2026-03-15",
        detailImages: [reviewer1, reviewer2, reviewer3, reviewer4],
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
    padding: 40px 24px 0;
`;

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) 40px;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
`;

const BackButton = styled.button`
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;
    border-radius: 999px;
    color: #111111;

    &:hover {
        background: rgba(0, 0, 0, 0.05);
    }
`;

const HeaderSpacer = styled.div`
    width: 40px;
    height: 40px;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.6px;
    color: #111111;
    word-break: keep-all;
    text-align: center;
`;

const FullBleedContent = styled.div`
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    margin-top: 0;

    img {
        width: 100%;
        height: auto;
        display: block;
    }
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

const EmptyText = styled.div`
    margin-top: 24px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 15px;
`;

const BackIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const NewEventDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const eventId = Number(id);
    const list = DUMMY;

    const current = useMemo(() => {
        return list.find((x) => x.id === eventId) ?? null;
    }, [list, eventId]);

    if (!current) {
        return (
            <PAGE>
                <Container>
                    <HeaderRow>
                        <BackButton type="button" onClick={() => navigate("/news/event")} aria-label="뒤로 가기">
                            <BackIcon />
                        </BackButton>
                        <Title>이벤트</Title>
                        <HeaderSpacer />
                    </HeaderRow>

                    <EmptyText>게시글을 찾을 수 없어요.</EmptyText>
                </Container>
            </PAGE>
        );
    }

    return (
        <PAGE>
            <Container>
                <HeaderRow>
                    <BackButton type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기">
                        <BackIcon />
                    </BackButton>
                    <Title>{current.title}</Title>
                    <HeaderSpacer />
                </HeaderRow>
            </Container>

            <FullBleedContent>
                {current.id === 1 ? (
                    <OpenBetaEventLanding />
                ) : current.id === 2 ? (
                    <PotenReviewerEventLanding />
                ) : (
                    <img src={current.imageUrl} alt={current.title} />
                )}
            </FullBleedContent>
        </PAGE>
    );
};

export default NewEventDetailPage;