/* ================== 마이페이지 대쉬보드 ================== */

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ArrowUp, ArrowDown, Bitcoin, Wallet, TrendingUp, Shield, Phone, User } from "lucide-react";

/* ================== 기본 색상 팔레트 ================== */
const palette = {
    bitcoin: "#F7931A",
    streamex: "#5B8DEF",
    ripple: "#00AAE4",
    tether: "#26A17B",
    lightBG: "#F8FAFB",
    cardBG: "#FFFFFF",
    textMain: "#1F2937",
    textSub: "#6B7280",
    border: "#E5E7EB",
    cyan: "#00D4FF",
    blue: "#5B8DEF",
    accent: "#3B82F6",
    success: "#10B981",
};

/* ================== 애니메이션 ================== */
const fadeUp = keyframes`
  from { opacity: 0; margin-top: 16px; }
  to { opacity: 1; margin-top: 0; }
`;

/* ================== 메인 컴포넌트 ================== */
export default function DashboardSection() {
    // Mock data for crypto dashboard
    const portfolioData = [
        { name: "BTC", value: 37, color: "#F7931A" },
        { name: "STE", value: 23, color: "#5B8DEF" },
        { name: "XRP", value: 20, color: "#00AAE4" },
        { name: "USDT", value: 20, color: "#26A17B" },
    ];

    // Chart data for line graph (1~10점 사이)
    const chartData = [
        { month: "1회차", value: 4.5, value2: 4.2 },
        { month: "2회차", value: 5.2, value2: 4.8 },
        { month: "3회차", value: 4.8, value2: 5.1 },
        { month: "4회차", value: 6.1, value2: 5.8 },
        { month: "5회차", value: 5.5, value2: 6.0 },
        { month: "6회차", value: 6.7, value2: 6.5 },
        { month: "7회차", value: 7.2, value2: 7.0 },
        { month: "8회차", value: 6.8, value2: 7.3 },
        { month: "9회차", value: 7.5, value2: 7.2 },
        { month: "10회차", value: 8.2, value2: 8.0 },
        { month: "11회차", value: 8.8, value2: 8.5 },
        { month: "12회차", value: 9.5, value2: 9.2 },
    ];

    const wallets = [
        { name: "워드1", amount: "워드", btc: "워드", color: "linear-gradient(135deg, #F7931A 0%, #E67E22 100%)", icon: "₿" },
        { name: "워드2", amount: "워드", btc: "워드", color: "linear-gradient(135deg, #5B8DEF 0%, #4A7FD9 100%)", icon: "S" },
        { name: "워드3", amount: "워드", btc: "워드", color: "linear-gradient(135deg, #00AAE4 0%, #0099CC 100%)", icon: "✕" },
        { name: "워드4", amount: "워드", btc: "워드", color: "linear-gradient(135deg, #26A17B 0%, #1E8E6A 100%)", icon: "₮" },
    ];

    const transactions = [
        { type: "sent", title: "Sent USDT", date: "23 Feb 2020", amount: "- $1,678.00", isPositive: false },
        { type: "received", title: "Received USDT", date: "23 Feb 2020", amount: "+ $1,098.00", isPositive: true },
    ];

    const tradingFees = [
        { name: "Maker", rate: "0.069%", progress: 69, color: "#00D4FF" },
        { name: "Taker", rate: "0.075%", progress: 75, color: "#5B8DEF" },
    ];

    const securityItems = [
        { icon: User, label: "Identity", status: false },
        { icon: Phone, label: "Phone", status: false },
    ];

    /* ================== 렌더링 ================== */
    return (
        <DashboardContainer>
            {/* Welcome Banner */}
            <WelcomeBanner>
                <WelcomeContent>
                    <WelcomeIcon>👋</WelcomeIcon>
                    <WelcomeTextGroup>
                        <WelcomeTitle>환영합니다!</WelcomeTitle>
                        <WelcomeSubtitle>I-Poten에서 당신의 성장을 함께합니다</WelcomeSubtitle>
                    </WelcomeTextGroup>
                </WelcomeContent>
                <WelcomeDecoration>
                    <DecoCircle $size={120} $top={-20} $right={-20} $opacity={0.1} />
                    <DecoCircle $size={80} $top={40} $right={60} $opacity={0.08} />
                </WelcomeDecoration>
            </WelcomeBanner>

            {/* Top Section: 3 Cards */}
            <TopSection>
                {/* Left Column: 크레딧 + 내 관심 분야 */}
                <LeftColumn>
                    {/* 크레딧 카드 */}
                    <BalanceCard>
                        <CardLabel>크레딧</CardLabel>
                        <BalanceAmount>35개</BalanceAmount>

                        <CurrencyRow>
                            <CurrencyBox>
                                <CurrencyIcon style={{ background: "linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)" }}>↓</CurrencyIcon>
                                <div>
                                    <CurrencyAmount>12</CurrencyAmount>
                                    <CurrencyLabel>사용 크레딧</CurrencyLabel>
                                </div>
                            </CurrencyBox>
                        </CurrencyRow>

                        <ButtonRow>
                            <ActionButton $primary={true}>충전</ActionButton>
                        </ButtonRow>
                    </BalanceCard>

                    {/* 내 관심 분야 카드 */}
                    <InterestCard>
                        <CardLabel>내 관심 분야</CardLabel>
                        <InterestTags>
                            <InterestTag>프론트엔드</InterestTag>
                            <InterestTag>React</InterestTag>
                            <InterestTag>TypeScript</InterestTag>
                            <InterestTag>UI/UX</InterestTag>
                            <InterestTag>웹 개발</InterestTag>
                        </InterestTags>
                        <AddInterestButton>+ 관심 분야 추가</AddInterestButton>
                    </InterestCard>
                </LeftColumn>

                {/* Right: 내 면접 결과 수치 */}
                <PortfolioCard>
                    <ChartHeader>
                        <ChartHeaderLeft>
                            <ChartTitle>내 면접 결과 수치</ChartTitle>
                            <ChartSubtitle></ChartSubtitle>
                        </ChartHeaderLeft>
                        <ChartStats>

                        </ChartStats>
                    </ChartHeader>

                    <ChartWrapper>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5B8DEF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#5B8DEF" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" opacity={0.3} />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#8E8E93"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#8E8E93"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                    tickFormatter={(value) => `${value}점`}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #E5E5EA',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                    formatter={(value: any) => [`${value}점`, '']}
                                    labelStyle={{ color: '#1A1A1F', fontWeight: 600 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value2" 
                                    stroke="#00D4FF" 
                                    strokeWidth={2.5}
                                    fill="url(#colorValue2)" 
                                    dot={false}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#5B8DEF" 
                                    strokeWidth={3}
                                    fill="url(#colorValue)" 
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartWrapper>

                    <ChartLegend>
                        <LegendItem>
                            <LegendDot $color="#5B8DEF" />
                            <LegendLabel>점수</LegendLabel>
                        </LegendItem>
                        <LegendItem>
                            <LegendDot $color="#00D4FF" />
                            <LegendLabel>평균 기대 점수</LegendLabel>
                        </LegendItem>
                    </ChartLegend>
                </PortfolioCard>
            </TopSection>

            {/* Middle Section: Wallets + Trading Fees */}
            <MiddleSection>
                {/* Wallets */}
                <WalletsSection>
                    <SectionHeader>
                        <SectionTitle>WALLETS</SectionTitle>
                        <MoreLink>More →</MoreLink>
                    </SectionHeader>
                    <WalletsGrid>
                        {wallets.map((wallet, idx) => (
                            <WalletCard key={idx} $gradient={wallet.color}>
                                <WalletIcon>{wallet.icon}</WalletIcon>
                                <WalletName>{wallet.name}</WalletName>
                                <WalletAmount>{wallet.amount}</WalletAmount>
                                <WalletBTC>{wallet.btc}</WalletBTC>
                            </WalletCard>
                        ))}
                    </WalletsGrid>
                </WalletsSection>

               
            </MiddleSection>



                {/* Security */}

        </DashboardContainer>
    );
}

/* ================== styled-components ================== */

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    animation: ${fadeUp} 0.6s ease both;
`;

/* ===== Welcome Banner ===== */
const WelcomeBanner = styled.div`
    position: relative;
    background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%);
    border-radius: 24px;
    padding: 32px 40px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25), 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(59, 130, 246, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15);
    }
`;

const WelcomeContent = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 20px;
`;

const WelcomeIcon = styled.div`
    font-size: 48px;
    animation: wave 2s ease-in-out infinite;
    
    @keyframes wave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(20deg); }
        75% { transform: rotate(-20deg); }
    }
`;

const WelcomeTextGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const WelcomeTitle = styled.h1`
    font-size: 32px;
    font-weight: 800;
    color: white;
    margin: 0;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const WelcomeSubtitle = styled.p`
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    letter-spacing: 0.2px;
`;

const WelcomeDecoration = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
`;

const DecoCircle = styled.div<{ $size: number; $top: number; $right: number; $opacity: number }>`
    position: absolute;
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    top: ${({ $top }) => $top}px;
    right: ${({ $right }) => $right}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, ${({ $opacity }) => $opacity});
    animation: float 6s ease-in-out infinite;
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
`;

/* ===== Top Section ===== */
const TopSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const BalanceCard = styled.div`
    background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(229, 231, 235, 0.6);
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }
`;

const CardLabel = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: ${palette.textSub};
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 4px;
`;

const BalanceAmount = styled.div`
    font-size: 42px;
    font-weight: 800;
    background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
`;

const BalanceBTC = styled.div`
    font-size: 14px;
    color: ${palette.textSub};
    margin-top: -12px;
`;

const CurrencyRow = styled.div`
    display: flex;
    gap: 16px;
    margin-top: 8px;
`;

const CurrencyBox = styled.div`
    flex: 1;
    background: linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 100%);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;
    
    &:hover {
        background: linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%);
        border-color: rgba(59, 130, 246, 0.2);
    }
`;

const CurrencyIcon = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const CurrencyAmount = styled.div`
    font-size: 20px;
    font-weight: 800;
    color: ${palette.textMain};
`;

const CurrencyLabel = styled.div`
    font-size: 13px;
    color: ${palette.textSub};
    font-weight: 500;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 8px;
`;

const ActionButton = styled.button<{ $primary: boolean }>`
    flex: 1;
    padding: 14px 20px;
    border-radius: 12px;
    border: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.3px;
    
    ${({ $primary }) => $primary
        ? `
            background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%);
            color: white;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
            
            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
            }
        `
        : `
            background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
            color: white;
            box-shadow: 0 4px 14px rgba(0, 212, 255, 0.4);
            
            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 212, 255, 0.5);
            }
        `
    }
    
    &:active {
        transform: translateY(0);
    }
`;

/* ===== Interest Card ===== */
const InterestCard = styled.div`
    background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(229, 231, 235, 0.6);
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }
`;

const InterestTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const InterestTag = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 10px 18px;
    background: linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%);
    border: 1.5px solid rgba(59, 130, 246, 0.2);
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    color: #3B82F6;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    
    &:hover {
        background: linear-gradient(135deg, #DBEAFE 0%, #BAE6FD 100%);
        border-color: #3B82F6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
`;

const AddInterestButton = styled.button`
    padding: 12px 18px;
    background: transparent;
    border: 2px dashed rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: ${palette.textSub};
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        border-style: solid;
        border-color: #3B82F6;
        color: #3B82F6;
        background: linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%);
        transform: translateY(-1px);
    }
`;

/* ===== Portfolio Card ===== */
const PortfolioCard = styled.div`
    background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(229, 231, 235, 0.6);
    display: flex;
    flex-direction: column;
    gap: 24px;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
        padding: 24px;
    }
`;

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
    }
`;

const ChartHeaderLeft = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ChartTitle = styled.h3`
    font-size: 22px;
    font-weight: 800;
    color: ${palette.textMain};
    margin: 0;
    letter-spacing: -0.5px;
`;

const ChartSubtitle = styled.p`
    font-size: 13px;
    color: ${palette.textSub};
    margin: 0;
`;

const ChartStats = styled.div`
    display: flex;
    gap: 24px;
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
`;

const StatLabel = styled.span`
    font-size: 11px;
    color: ${palette.textSub};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;

const StatValue = styled.span<{ $positive: boolean }>`
    font-size: 20px;
    font-weight: 700;
    color: ${({ $positive }) => $positive ? "#26A17B" : "#EF4444"};
`;

const ChartWrapper = styled.div`
    width: 100%;
    height: 280px;
    
    @media (max-width: 768px) {
        height: 240px;
    }
`;

const ChartLegend = styled.div`
    display: flex;
    gap: 24px;
    justify-content: center;
    padding-top: 8px;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const LegendDot = styled.div<{ $color: string }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
`;

const LegendLabel = styled.span`
    font-size: 13px;
    color: ${palette.textSub};
    font-weight: 500;
`;

/* ===== Middle Section ===== */
const MiddleSection = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 18px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const WalletsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SectionTitle = styled.h3`
    font-size: 12px;
    font-weight: 700;
    color: ${palette.textSub};
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin: 0;
`;

const MoreLink = styled.a`
    font-size: 13px;
    color: ${palette.textSub};
    cursor: pointer;
    transition: color 0.2s ease;
    
    &:hover {
        color: ${palette.blue};
    }
`;

const WalletsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    
    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const WalletCard = styled.div<{ $gradient: string }>`
    background: ${({ $gradient }) => $gradient};
    border-radius: 20px;
    padding: 24px;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
    }
    
    &:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15);
        
        &::before {
            opacity: 1;
        }
    }
`;

const WalletIcon = styled.div`
    width: 42px;
    height: 42px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    backdrop-filter: blur(10px);
`;

const WalletName = styled.div`
    font-size: 16px;
    font-weight: 600;
    margin-top: 8px;
`;

const WalletAmount = styled.div`
    font-size: 18px;
    font-weight: 700;
    margin-top: 4px;
`;

const WalletBTC = styled.div`
    font-size: 12px;
    opacity: 0.8;
`;

/* ===== Trading Fees ===== */
const TradingFeesSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FeesGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FeeCard = styled.div`
    background: ${palette.cardBG};
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
`;

const FeeIcon = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const FeeInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const FeeRate = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${palette.textMain};
`;

const FeeName = styled.div`
    font-size: 13px;
    color: ${palette.textSub};
`;

const FeeProgress = styled.div`
    width: 100%;
    height: 6px;
    background: ${palette.lightBG};
    border-radius: 3px;
    overflow: hidden;
`;

const FeeProgressBar = styled.div<{ $width: number; $color: string }>`
    width: ${({ $width }) => $width}%;
    height: 100%;
    background: ${({ $color }) => $color};
    border-radius: 3px;
    transition: width 0.5s ease;
`;

/* ===== Bottom Section ===== */
const BottomSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const TransactionsSection = styled.div`
    background: ${palette.cardBG};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const TransactionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const TransactionItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: ${palette.lightBG};
    border-radius: 10px;
    transition: background 0.2s ease;
    
    &:hover {
        background: #E8EDF3;
    }
`;

const TransactionIcon = styled.div<{ $isPositive: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    background: ${({ $isPositive }) => $isPositive ? "#CCF5E8" : "#FFE5E5"};
    color: ${({ $isPositive }) => $isPositive ? "#26A17B" : "#EF4444"};
`;

const TransactionInfo = styled.div`
    flex: 1;
`;

const TransactionTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${palette.textMain};
`;

const TransactionDate = styled.div`
    font-size: 12px;
    color: ${palette.textSub};
`;

const TransactionAmount = styled.div<{ $isPositive: boolean }>`
    font-size: 16px;
    font-weight: 700;
    color: ${({ $isPositive }) => $isPositive ? "#26A17B" : "#EF4444"};
`;

/* ===== Security Section ===== */
const SecuritySection = styled.div`
    background: ${palette.cardBG};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const SecurityGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const SecurityCard = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: ${palette.lightBG};
    border-radius: 10px;
    transition: background 0.2s ease;
    
    &:hover {
        background: #E8EDF3;
    }
`;

const SecurityIcon = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SecurityInfo = styled.div`
    flex: 1;
`;

const SecurityLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${palette.textMain};
`;

const SecurityStatus = styled.div`
    font-size: 12px;
    color: ${palette.textSub};
`;

const SecurityToggle = styled.div<{ $active: boolean }>`
    width: 48px;
    height: 26px;
    background: ${({ $active }) => $active ? "#26A17B" : "#D1D5DB"};
    border-radius: 13px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s ease;
`;

const SecurityToggleKnob = styled.div<{ $active: boolean }>`
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: ${({ $active }) => $active ? "24px" : "2px"};
    transition: left 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;