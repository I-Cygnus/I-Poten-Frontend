// components/Footer.tsx
import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import eddiLogo from "../assets/eddi1.png"; // ← 경로 확인

const Wrap = styled.footer`
  background: #f8f9fa;
  color: #6c757d;
  padding: 60px 20px 40px;
  user-select: none;
  -webkit-user-select: none;
  border-top: 1px solid #e9ecef;
  
  :root[data-theme="dark"] & {
    background: #1a1d23;
    border-top: 1px solid #2d3139;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 40px;
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #dee2e6;
  
  :root[data-theme="dark"] & {
    border-bottom: 1px solid #2d3139;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 32px;
`;

const NavLink = styled(Link)`
  color: #495057;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #212529;
  }
  
  :root[data-theme="dark"] & {
    color: #adb5bd;
    
    &:hover {
      color: #f8f9fa;
    }
  }
`;

const EmailLink = styled.a`
  color: #495057;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #212529;
  }
  
  :root[data-theme="dark"] & {
    color: #adb5bd;
    
    &:hover {
      color: #f8f9fa;
    }
  }
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CompanyText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #6c757d;
  
  :root[data-theme="dark"] & {
    color: #868e96;
  }
`;

const CopyrightText = styled.p`
  margin: 0;
  font-size: 11px;
  color: #adb5bd;
  
  :root[data-theme="dark"] & {
    color: #6c757d;
  }
`;

export default function SiteFooter() {
  const navigate = useNavigate();

  const goHome: React.MouseEventHandler = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <Wrap>
      <Container>
        {/* 상단 네비게이션 */}
        <TopSection>
          <Nav>
            <NavLink to="/">job-spoon</NavLink>
            <NavLink to="/">이용약관</NavLink>
            <NavLink to="/">개인정보 처리방침</NavLink>
            <NavLink to="/">제휴문의</NavLink>
          </Nav>
        </TopSection>

        {/* 하단 회사 정보 */}
        <BottomSection>
          <CompanyText>
            서울특별시 송파구 새말로8길 26, 3층(문정동)
          </CompanyText>
          <CopyrightText>
            Copyright © 2025 에디(EDDI). All rights reserved.
          </CopyrightText>
        </BottomSection>
      </Container>
    </Wrap>
  );
}
