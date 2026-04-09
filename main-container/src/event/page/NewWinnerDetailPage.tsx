import React, { useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import OpenBetaEventLanding from "./OpenBetaEventLanding.tsx";

type WinnerPost = {
    id: number;
    tag: string;
    title: string;
    createdAt: string;
    author?: string;
    contentHtml?: string;
};

const WINNER_DUMMY: WinnerPost[] = [
    {
        id: 1,
        tag: "당첨자",
        title: "오픈베타 이벤트 당첨자 안내",
        createdAt: "2026-03-15",
        author: "관리자",
        contentHtml: `
      <p>오픈베타 이벤트 당첨자를 안내드립니다.</p>
      <ul>
        <li>당첨자: 홍길동, 김철수, 박영희...</li>
        <li>지급 일정: 2026-03-20</li>
      </ul>
      <p>문의: 고객센터</p>
    `,
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

  @media (max-width: 640px) {
    padding: 36px 16px 60px;
  }
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

  @media (max-width: 640px) {
    font-size: 30px;
  }
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

  @media (max-width: 640px) {
    font-size: 21px;
  }
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
  flex-wrap: wrap;
`;

const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  display: inline-block;
`;

const Tag = styled.span`
  height: 26px;
  padding: 0 12px;
  border-radius: 6px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 600;

  background: #ffffff;
  color: #578bf2;
  border: 1px solid rgba(87, 139, 242, 0.6);
`;

const Content = styled.div`
  padding: 28px 0 40px;
  width: min(760px, 100%);

  margin: 0 auto;

  font-size: 15px;
  font-weight: 450;
  line-height: 1.75;
  color: rgba(0, 0, 0, 0.72);
  letter-spacing: -0.02em;

  ul {
    padding-left: 18px;
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

const NewWinnerDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const postId = Number(id);

    const list = WINNER_DUMMY;

    const currentIndex = useMemo(() => list.findIndex((x) => x.id === postId), [list, postId]);
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
                        <ListBtn type="button" onClick={() => navigate("/event")}>
                            목록
                        </ListBtn>
                    </BottomActions>
                </Container>
            </PAGE>
        );
    }

    const author = current.author ?? "관리자";

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
                            <Tag>{current.tag}</Tag>
                            <Dot />
                            <span>작성자 {author}</span>
                            <Dot />
                            <span>등록일 {current.createdAt}</span>
                        </MetaLeft>
                    </MetaRow>

                    <Content dangerouslySetInnerHTML={{ __html: current.contentHtml ?? "" }} />

                    <NavBox>
                        <NavRow
                            type="button"
                            disabled={!prev}
                            onClick={() => prev && navigate(`/event/winner/${prev.id}`)}
                        >
                            <NavLabel>이전 글</NavLabel>
                            <NavTitle>{prev ? prev.title : "이전 글이 없습니다."}</NavTitle>
                        </NavRow>

                        <NavRow
                            type="button"
                            disabled={!next}
                            onClick={() => next && navigate(`/event/winner/${next.id}`)}
                        >
                            <NavLabel>다음 글</NavLabel>
                            <NavTitle>{next ? next.title : "다음 글이 없습니다."}</NavTitle>
                        </NavRow>
                    </NavBox>

                    <BottomActions>
                        <ListBtn type="button" onClick={() => navigate("/event")}>
                            목록
                        </ListBtn>
                    </BottomActions>
                </PostHead>
            </Container>
        </PAGE>
    );
};

export default NewWinnerDetailPage;