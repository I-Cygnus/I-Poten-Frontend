/* ====================== 마이페이지 전체 레이아웃 (좌: 프로필+사이드바 / 우: 메인 컨텐츠) ====================== */

import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { FaHome } from "react-icons/fa";

import SideBar from "./SideBar";
import ProfileAppearanceCard from "../profile/ProfileAppearanceCard.tsx";
// API imports removed - using mock data
type ProfileAppearanceResponse = {
    photoUrl: string | null;
    nickname: string;
    email: string;
};

type UserTitleResponse = {
    id: number;
    code: string;
    displayName: string;
    description: string;
    equipped: boolean;
    acquiredAt: string;
};
import { notifyError } from "../../utils/toast";
import Spinner from "../common/Spinner.tsx";

export default function MyPageLayout() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileAppearanceResponse | null>(null);
    const [titles, setTitles] = useState<UserTitleResponse[]>([]);

    /** 최신 프로필/칭호 불러오기 (Mock) */
    const refreshAll = async () => {
        // Mock data for UI display
        setProfile({
            photoUrl: null,
            nickname: "사용자",
            email: "user@example.com"
        });
        
        setTitles([
            {
                id: 1,
                code: "BEGINNER",
                displayName: "초보 개발자",
                description: "첫 걸음을 시작한 개발자",
                equipped: true,
                acquiredAt: new Date().toISOString()
            }
        ]);
    };

    useEffect(() => {
        setIsLoading(true);
        refreshAll()
            .catch((err) => console.error("초기 데이터 로드 실패:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <>
            <LayoutContainer>
                {/* 좌측 고정 사이드바 */}
                <FixedAside>
                    {/* 마이페이지 헤더 블록 추가 */}
                    <HomeHeader onClick={() => navigate("/mypage")}>
                        <HomeHeaderIcon>
                            <FaHome />
                        </HomeHeaderIcon>
                        <HomeHeaderLabel>마이페이지</HomeHeaderLabel>
                    </HomeHeader>

                    <SideBar />
                </FixedAside>

                {/* 메인 영역 */}
                <Main>
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <Outlet context={{ profile, titles, refreshAll }} />
                    )}
                </Main>
            </LayoutContainer>
        </>
    );
}

/* ====================== styled-components ====================== */

/** 전체 컨테이너 */
const LayoutContainer = styled.div`
    display: flex;
    width: 100%;
    min-height: 100vh;
    height: auto;
    overflow-y: visible;
    background: #F8FAFB;
`;

/** 완전 고정 사이드바 */
const FixedAside = styled.aside`
    position: fixed;
    left: 0;
    top: 60px;
    width: 280px;
    height: calc(100vh - 60px);
    background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 32px 20px;
    border-right: 1px solid #E5E7EB;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
    flex-shrink: 0;
    overflow-y: auto;
    z-index: 100;

    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #D1D5DB;
        border-radius: 3px;
        
        &:hover {
            background: #9CA3AF;
        }
    }

    @media (max-width: 1024px) {
        width: 240px;
    }
    
    @media (max-width: 768px) {
        display: none;
    }
`;

/** 마이페이지 헤더 블록 */
const HomeHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%);
    color: white;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
    margin-bottom: 8px;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.45);
    }

    &:active {
        transform: translateY(-1px);
    }
`;

/** 아이콘 */
const HomeHeaderIcon = styled.span`
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

/** 라벨 */
const HomeHeaderLabel = styled.span`
    font-weight: 700;
    font-size: 16px;
    letter-spacing: -0.2px;
`;

/** 메인 콘텐츠 영역 */
const Main = styled.main`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    margin-left: 280px;
    padding: 32px 48px 80px 48px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: calc(100vh - 60px);
    overflow-y: auto;
    scroll-behavior: smooth;
    width: calc(100% - 280px);

    @media (max-width: 1024px) {
        margin-left: 240px;
        width: calc(100% - 240px);
        padding: 24px 40px 60px 40px;
    }

    @media (max-width: 768px) {
        margin-left: 0;
        width: 100%;
        padding: 20px 20px 60px 20px;
    }
`;