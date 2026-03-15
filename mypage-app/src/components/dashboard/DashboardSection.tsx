/* ================== 마이페이지 대쉬보드 ================== */

import React from "react";
import styled, { keyframes } from "styled-components";
import { ArrowRight, BookOpen, MessageSquare, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ================== 애니메이션 ================== */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ================== 메인 컴포넌트 ================== */
export default function DashboardSection() {
    const navigate = useNavigate();

    // Mock data for user dashboard
    const userStats = [
        { label: "보유 크레딧", value: "35", unit: "개", icon: <Star size={20} color="#F59E0B" /> },
        { label: "진행한 모의면접", value: "12", unit: "회", icon: <MessageSquare size={20} color="#3B82F6" /> },
        { label: "학습한 단어", value: "128", unit: "개", icon: <BookOpen size={20} color="#10B981" /> },
    ];

    const recentActivities = [
        { title: "프론트엔드 직무 모의면접", date: "2024. 03. 10", status: "결과 완료" },
        { title: "CS 기초 단어장 학습", date: "2024. 03. 08", status: "학습 중" },
        { title: "면접 스터디 모집글 작성", date: "2024. 03. 05", status: "모집 중" },
    ];

    return (
        <DashboardContainer>
            {/* Welcome Banner */}
            <WelcomeSection>
                <WelcomeText>
                    <Greeting>반갑습니다, 사용자님 🪴</Greeting>
                    <SubGreeting>오늘도 목표를 향해 한 걸음 더 나아가볼까요?</SubGreeting>
                </WelcomeText>
                <ProfileQuickAction onClick={() => navigate('/account/edit')}>
                    프로필 수정
                </ProfileQuickAction>
            </WelcomeSection>

            {/* Stats Grid */}
            <StatsGrid>
                {userStats.map((stat, idx) => (
                    <StatCard key={idx}>
                        <StatHeader>
                            <StatIconWrapper>{stat.icon}</StatIconWrapper>
                            <StatLabel>{stat.label}</StatLabel>
                        </StatHeader>
                        <StatValue>
                            {stat.value}<span>{stat.unit}</span>
                        </StatValue>
                    </StatCard>
                ))}
            </StatsGrid>

            {/* Content Split: Recent Activity & Quick Links */}
            <BottomGrid>
                {/* Recent Activity */}
                <ContentCard>
                    <CardHeader>
                        <CardTitle>최근 활동</CardTitle>
                        <MoreButton>전체보기</MoreButton>
                    </CardHeader>
                    <ActivityList>
                        {recentActivities.map((activity, idx) => (
                            <ActivityItem key={idx}>
                                <ActivityInfo>
                                    <ActivityTitle>{activity.title}</ActivityTitle>
                                    <ActivityDate>
                                        <Clock size={14} />
                                        {activity.date}
                                    </ActivityDate>
                                </ActivityInfo>
                                <ActivityStatus>{activity.status}</ActivityStatus>
                            </ActivityItem>
                        ))}
                    </ActivityList>
                </ContentCard>

                {/* Quick Notice or Banner */}
                <NoticeCard>
                    <NoticeContent>
                        <NoticeLabel>안내</NoticeLabel>
                        <NoticeTitle>프리미엄 멤버십으로<br/>무제한 면접을 경험하세요</NoticeTitle>
                        <NoticeDesc>AI 피드백과 심층 분석 리포트를 제공합니다.</NoticeDesc>
                    </NoticeContent>
                    <NoticeLink onClick={() => navigate('/membership')}>
                        자세히 보기 <ArrowRight size={16} />
                    </NoticeLink>
                </NoticeCard>
            </BottomGrid>
        </DashboardContainer>
    );
}

/* ================== styled-components ================== */

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    width: 100%;
    animation: ${fadeUp} 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

/* ===== Welcome Section ===== */
const WelcomeSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #FFFFFF;
    border-radius: 24px;
    padding: 36px 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    border: 1px solid #F3F4F6;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
        padding: 28px 24px;
    }
`;

const WelcomeText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Greeting = styled.h1`
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    letter-spacing: -0.02em;
`;

const SubGreeting = styled.p`
    font-size: 16px;
    color: #6B7280;
    margin: 0;
    font-weight: 500;
`;

const ProfileQuickAction = styled.button`
    padding: 12px 24px;
    background: #F9FAFB;
    color: #374151;
    border: 1px solid #E5E7EB;
    border-radius: 99px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: #F3F4F6;
        color: #111827;
    }
`;

/* ===== Stats Grid ===== */
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    
    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: #FFFFFF;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    border: 1px solid #F3F4F6;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: translateY(-4px);
    }
`;

const StatHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const StatIconWrapper = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #F9FAFB;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatLabel = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #6B7280;
`;

const StatValue = styled.div`
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    
    span {
        font-size: 16px;
        font-weight: 600;
        color: #9CA3AF;
        margin-left: 4px;
    }
`;

/* ===== Bottom Grid ===== */
const BottomGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const ContentCard = styled.div`
    background: #FFFFFF;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    border: 1px solid #F3F4F6;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardTitle = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
`;

const MoreButton = styled.button`
    background: none;
    border: none;
    color: #6B7280;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    
    &:hover {
        background: #F3F4F6;
        color: #374151;
    }
`;

const ActivityList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ActivityItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-radius: 16px;
    background: #F9FAFB;
    transition: background 0.2s ease;
    cursor: pointer;
    
    &:hover {
        background: #F3F4F6;
    }
`;

const ActivityInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ActivityTitle = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #374151;
`;

const ActivityDate = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #9CA3AF;
`;

const ActivityStatus = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: #3B82F6;
    background: #EFF6FF;
    padding: 6px 12px;
    border-radius: 99px;
`;

/* ===== Notice Card ===== */
const NoticeCard = styled.div`
    background: linear-gradient(145deg, #F8FAFB 0%, #F3F4F6 100%);
    border-radius: 24px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
    border: 1px solid #E5E7EB;
`;

const NoticeContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const NoticeLabel = styled.span`
    display: inline-block;
    padding: 4px 10px;
    background: #111827;
    color: white;
    font-size: 12px;
    font-weight: 700;
    border-radius: 6px;
    width: fit-content;
`;

const NoticeTitle = styled.h4`
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    line-height: 1.4;
    letter-spacing: -0.02em;
`;

const NoticeDesc = styled.p`
    font-size: 14px;
    color: #6B7280;
    margin: 0;
    line-height: 1.5;
`;

const NoticeLink = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #111827;
    font-size: 15px;
    font-weight: 600;
    padding: 0;
    cursor: pointer;
    width: fit-content;
    
    &:hover {
        opacity: 0.7;
    }
`;