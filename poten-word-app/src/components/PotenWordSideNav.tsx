import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const Side = styled.aside`
  position: sticky;
  top: 84px;          /* 헤더가 있으면 그 높이만큼 */
  align-self: start;
`;
const Box = styled.nav`
  width: 240px;
`;
const SectionTitle = styled.div`
  padding: 16px 18px;
  border-radius: 10px;
  background: #eaf2ff;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.02em;
`;
const List = styled.ul`
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
`;
const Item = styled.li``;

const Link = styled(NavLink)`
  display: block;
  padding: 14px 16px;
  margin: 6px 0;
  border-radius: 10px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: #111827;
  text-decoration: none;
  &:hover { background: #f6f8fb; }

  /* 활성 링크 스타일 */
  &.active {
    background: #f1f3f5;
  }
`;

export default function SpoonWordSideNav() {
    return (
        <Side>
            <Box aria-label="포텐워드 내 메뉴">
                <SectionTitle>포텐워드</SectionTitle>
                <List>
                    <Item><Link to="notes" end>내 포텐노트</Link></Item>
                    <Item><Link to="quiz">포텐퀴즈</Link></Item>
                    <Item><Link to="book">포텐북</Link></Item>
                </List>
            </Box>
        </Side>
    );
}
