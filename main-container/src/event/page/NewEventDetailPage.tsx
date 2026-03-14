import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import OpenBetaEventLanding from "./OpenBetaEventLanding.tsx";

import event1 from "../../assets/event/thumbnail/01.png";
import event2 from "../../assets/event/thumbnail/02.png";
import event3 from "../../assets/event/thumbnail/03.png";

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

    // 상세 페이지용 (없으면 아래에서 fallback 처리)
    author?: string;
    createdAt?: string;
    contentHtml?: string;
};

const DUMMY: EventItem[] = [
    {
        id: 1,
        title: "가입 축하 면접권 증정",
        startDate: "2026-03-08",
        endDate: "2026-03-15",
        imageUrl: event1,
        status: "ENDED",
        badge: { type: "ENDED", text: "종료" },
        author: "관리자",
        createdAt: "2026-03-08",
    },
    {
        id: 2,
        title: "오픈베타 이벤트",
        isNew: true,
        startDate: "2026-03-08",
        endDate: "2026-03-31",
        imageUrl: event2,
        status: "ONGOING",
        badge: { type: "DDAY", text: "D-30" },
        author: "관리자",
        createdAt: "2026-03-08",
    },
    {
        id: 3,
        title: "출석체크 이벤트",
        startDate: "2026-03-08",
        endDate: "2026-03-31",
        imageUrl: event3,
        status: "ONGOING",
        badge: { type: "ALWAYS", text: "상시진행" },
        author: "관리자",
        createdAt: "2026-03-08",
    },
];

function formatRange(start: string, end: string) {
    return `${start}~${end}`;
}

/* ================== styles ================== */
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

const TopRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.8px;
  color: #111111;
`;

const Divider = styled.div`
  margin-top: 16px;
  height: 1px;
  width: 100%;
  background: rgba(0, 0, 0, 0.75);
`;

const PostHead = styled.div`
  margin-top: 44px;
  border-top: 1px solid rgba(0, 0, 0, 0.75);
`;

const PostTitle = styled.h2`
  margin: 0;
  padding: 22px 0 14px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.6px;
  color: #111111;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const MetaLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  font-weight: 450;
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const MetaRight = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
`;

const ShareWrap = styled.div`
  position: relative;
`;

const ShareBtn = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;

  width: 36px;
  height: 36px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  color: rgba(0, 0, 0, 0.65);

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    color: rgba(0, 0, 0, 0.85);
  }
`;

const SharePanel = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 10;

  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 999px;

  padding: 10px 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;

  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
`;

const ShareIconBtn = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;

  width: 28px;
  height: 28px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  color: rgba(0, 0, 0, 0.75);

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }
`;

const ShareCloseBtn = styled(ShareIconBtn)`
  color: rgba(0, 0, 0, 0.55);
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 999;

  background: rgba(17, 17, 17, 0.9);
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;

  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  display: inline-block;
`;

const Badge = styled.span<{ $type: BadgeType }>`
  height: 26px;
  padding: 0 12px;
  border-radius: 6px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 600;

  background: #ffffff;

  color: ${({ $type }) => {
    if ($type === "ENDED") return "#6D7D9D";
    if ($type === "ALWAYS") return "#F24E57";
    return "#578BF2";
}};

  border: 1px solid
    ${({ $type }) => {
    if ($type === "ENDED") return "rgba(109,125,157,0.55)";
    if ($type === "ALWAYS") return "rgba(242,78,87,0.55)";
    return "rgba(87,139,242,0.55)";
}};
`;

const Content = styled.div`
    padding: 28px 0 40px;

    .openbeta-full {
        width: 100vw;
        margin-left: calc(50% - 50vw);
        margin-right: calc(50% - 50vw);
    }

    img {
        max-width: 100%;
        height: auto;
        display: block;
    }

    .hero {
        width: min(760px, 100%);
        margin: 0 auto;
    }

    .desc {
        width: min(760px, 100%);
        margin: 18px auto 0;
        font-size: 15px;
    }
`;

const NavBox = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.75);
  border-bottom: 1px solid rgba(0, 0, 0, 0.75);
`;

const NavRow = styled.button`
  width: 100%;
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;

  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 14px;

  padding: 16px 8px;
  text-align: left;

  & + & {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`;

const NavLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
`;

const NavTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #111111;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BottomActions = styled.div`
  margin-top: 22px;
  display: flex;
  justify-content: flex-end;
`;

const ListBtn = styled.button`
  appearance: none;
  border: 0;
  cursor: pointer;

  height: 42px;
  padding: 0 16px;
  border-radius: 999px;

  background: #111111;
  color: #ffffff;

  font-size: 14px;
  font-weight: 600;
`;

const ShareIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M16 8a3 3 0 1 0-2.83-4M8 13l8-4M8 11l8 4M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const LinkIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/* ================== component ================== */
const NewEventDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const eventId = Number(id);
    const list = DUMMY; // 나중에 API로 교체

    const currentIndex = useMemo(() => {
        return list.findIndex((x) => x.id === eventId);
    }, [list, eventId]);

    const current = currentIndex >= 0 ? list[currentIndex] : null;
    const prev = currentIndex > 0 ? list[currentIndex - 1] : null;
    const next = currentIndex >= 0 && currentIndex < list.length - 1 ? list[currentIndex + 1] : null;

    if (!current) {
        return (
            <PAGE>
                <Container>
                    <TopRow>
                        <PageTitle>이벤트</PageTitle>
                    </TopRow>
                    <Divider />
                    <div style={{ marginTop: 44, color: "rgba(0,0,0,0.65)" }}>
                        게시글을 찾을 수 없어요.
                    </div>
                    <BottomActions>
                        <ListBtn type="button" onClick={() => navigate("/news/event")}>
                            목록
                        </ListBtn>
                    </BottomActions>
                </Container>
            </PAGE>
        );
    }

    const author = current.author ?? "관리자";
    const createdAt = current.createdAt ?? current.startDate;

    const [shareOpen, setShareOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = current?.title ?? "이벤트";

    const showToast = (msg: string) => {
        setToast(msg);
        window.setTimeout(() => setToast(null), 1400);
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl);
            showToast("링크가 복사됐어요");
        } catch {
            // 일부 브라우저 fallback
            const ta = document.createElement("textarea");
            ta.value = pageUrl;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            showToast("링크가 복사됐어요");
        }
    };

    const nativeShare = async () => {
        // 모바일/일부 브라우저에서만 동작
        if (!navigator.share) {
            await copyLink();
            return;
        }
        try {
            await navigator.share({ title: shareTitle, url: pageUrl });
        } catch {
            // 사용자가 취소한 경우 등은 무시
        }
    };

    return (
        <PAGE>
            <Container>
                <TopRow>
                    <PageTitle>이벤트</PageTitle>
                </TopRow>
                <Divider />

                <PostHead>
                    <PostTitle>{current.title}</PostTitle>

                    <MetaRow>
                        <MetaLeft>
                            <Badge $type={current.badge.type}>{current.badge.text}</Badge>
                            <Dot />
                            <MetaItem>작성자 {author}</MetaItem>
                            <Dot />
                            <MetaItem>등록일 {createdAt}</MetaItem>
                        </MetaLeft>

                        <MetaRight>
                            <div style={{ fontSize: 14, fontWeight: 450, color: "rgba(0,0,0,0.55)" }}>
                                기간 {formatRange(current.startDate, current.endDate)}
                            </div>

                            <ShareWrap>
                                <ShareBtn
                                    type="button"
                                    aria-label="share"
                                    onClick={() => setShareOpen((v) => !v)}
                                >
                                    <ShareIcon />
                                </ShareBtn>

                                {shareOpen && (
                                    <SharePanel role="menu" aria-label="share menu">
                                        {/* 시스템 공유 */}
                                        <ShareIconBtn type="button" onClick={nativeShare} title="공유">
                                            <ShareIcon />
                                        </ShareIconBtn>

                                        {/* 링크 복사 */}
                                        <ShareIconBtn type="button" onClick={copyLink} title="링크 복사">
                                            <LinkIcon />
                                        </ShareIconBtn>

                                        {/* 닫기 */}
                                        <ShareCloseBtn type="button" onClick={() => setShareOpen(false)} title="닫기">
                                            <CloseIcon />
                                        </ShareCloseBtn>
                                    </SharePanel>
                                )}
                            </ShareWrap>
                        </MetaRight>
                    </MetaRow>

                    <Content>
                        {current.id === 2 ? (
                            <OpenBetaEventLanding />
                        ) : (
                            <>
                                <img className="hero" src={current.imageUrl} alt={current.title} />
                                <div className="desc">
                                    이벤트 상세 내용 영역입니다. (나중에 API로 HTML/이미지/블록 데이터를 내려받아서 렌더링하면 돼요)
                                </div>
                            </>
                        )}
                    </Content>

                    <NavBox>
                        <NavRow
                            type="button"
                            disabled={!prev}
                            onClick={() => prev && navigate(`/news/event/${prev.id}`)}
                        >
                            <NavLabel>이전 글</NavLabel>
                            <NavTitle>{prev ? prev.title : "이전 글이 없습니다."}</NavTitle>
                        </NavRow>

                        <NavRow
                            type="button"
                            disabled={!next}
                            onClick={() => next && navigate(`/news/event/${next.id}`)}
                        >
                            <NavLabel>다음 글</NavLabel>
                            <NavTitle>{next ? next.title : "다음 글이 없습니다."}</NavTitle>
                        </NavRow>
                    </NavBox>

                    <BottomActions>
                        <ListBtn type="button" onClick={() => navigate("/news/event")}>
                            목록
                        </ListBtn>
                    </BottomActions>
                </PostHead>
            </Container>
            {toast && <Toast>{toast}</Toast>}
        </PAGE>
    );
};

export default NewEventDetailPage;