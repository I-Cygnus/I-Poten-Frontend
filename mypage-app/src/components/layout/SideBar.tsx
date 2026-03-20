import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
    FaUser,
    FaCalendarAlt,
    FaFolderOpen,
    FaCrown,
    FaSignOutAlt,
    FaExclamationTriangle,
    FaQuestionCircle
} from "react-icons/fa";
import { MdArticle } from "react-icons/md";
import ServiceModal from "../modals/ServiceModal.tsx";

export default function SideBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();
    const isInterviewMenuActive = location.pathname.startsWith("/mypage/interview");

    return (
        <Wrapper>
            <NavSection>
                <MenuList>
                    <StyledNavLink to="account/edit">
                        <FaUser className="icon" />
                        회원정보
                    </StyledNavLink>

                    <StyledNavLink to="interview/records" className={isInterviewMenuActive ? "active" : undefined}>
                        <FaFolderOpen className="icon" />
                        면접기록
                    </StyledNavLink>

                    <StyledNavLink to="schedule">
                        <FaCalendarAlt className="icon" />
                        일정관리
                    </StyledNavLink>



                    <StyledNavLink to="setting">
                        <FaCrown className="icon" />
                        설정
                    </StyledNavLink>


                </MenuList>
            </NavSection>

            <BottomSection>
                <StyledNavLink to="inquiry">
                    <FaQuestionCircle className="icon" />
                    문의하기
                </StyledNavLink>

                <StyledNavLink to="withdrawal">
                    <FaSignOutAlt className="icon" />
                    회원탈퇴
                </StyledNavLink>
            </BottomSection>

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </Wrapper>
    );
}

/* ================== Styled ================== */

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 18px 16px;
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const NavSection = styled.div`
    
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const MenuList = styled.ul`
    
    display: flex;
    flex-direction: column;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 0;
`;

const BottomSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
`;

const StyledNavLink = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    font-size: 15px;
    font-weight: 500;
    color: #2d2d2d;
    border-radius: 10px;
    text-decoration: none;
    letter-spacing: -0.2px;
    transition: all 0.25s ease-in-out;

    .icon {
        font-size: 15px;
        color: #94a3b8; /* 기존보다 살짝 부드러운 기본톤 */
        transition: color 0.25s ease;
    }

    &.active {
        background: rgba(41, 152, 197, 0.12); /* #eff6ff → 브랜드톤 */
        color: #2998C5; /* 메인 블루 */
        .icon {
            color: #2998C5;
        }
    }

    &:hover {
        background: rgba(41, 152, 197, 0.08); /* #f3f8ff → 브랜드톤 */
        color: #20A4AD; /* hover 시 민트빛 포인트 */
        transform: translateX(2px);
        .icon {
            color: #20A4AD;
        }
    }
`;
