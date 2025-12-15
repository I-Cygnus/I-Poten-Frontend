import React from "react";
import styled, { keyframes } from "styled-components";
import { FaCrown, FaRocket } from "react-icons/fa";

export default function MembershipPage() {
    return (
        <Section>
            <SectionHeader>
                <SectionTitle>멤버십</SectionTitle>
            </SectionHeader>

            <Card>
                <CardHeader>
                    <IconBox>
                        <FaCrown size={28} color="#2563eb" />
                    </IconBox>
                    <CardTitle>JobSpoon 멤버십</CardTitle>
                    <Tag>COMING SOON</Tag>
                </CardHeader>

                <CardBody>
                    <p>
                        학습, 면접, 스터디 등 다양한 기능을 자유롭게 이용할 수 있는
                        <strong> 구독형 서비스</strong>입니다.
                    </p>
                    <p>
                        지금은 <strong>서비스 준비 중</strong>이에요.
                        더 많은 혜택과 함께 곧 찾아올게요.
                    </p>
                </CardBody>

                <ComingSoonBox>
                    <FaRocket size={16} color="#2563eb" />
                    <span>서비스 오픈 예정</span>
                </ComingSoonBox>
            </Card>
        </Section>
    );
}

/* ================= styled-components ================= */
const fadeUp = keyframes`
  from {
    opacity: 0;
    margin-top: 16px;
  }
  to {
    opacity: 1;
    margin-top: 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const pulse = keyframes`
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
    }
    50% {
        transform: scale(1.015); /* 살짝 커졌다가 */
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15); /* 그림자 강조 */
    }
`;

const Section = styled.section`
    animation: ${fadeUp} 0.6s ease both;
    padding: 24px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: #111827;
`;

const Card = styled.div`
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
    animation: ${float} 4s ease-in-out infinite, ${pulse} 5s ease-in-out infinite;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.08);
    }
`;

const CardHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
`;

const IconBox = styled.div`
    width: 52px;
    height: 52px;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CardTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: #1e3a8a;
`;

const Tag = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: #2563eb;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 8px;
    padding: 3px 10px;
    letter-spacing: 0.5px;
`;

const CardBody = styled.div`
    font-size: 15px;
    line-height: 1.8;
    color: #374151;

    strong {
        font-weight: 600;
        color: #1e40af;
    }

    p + p {
        margin-top: 8px;
    }
`;

const ComingSoonBox = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(37, 99, 235, 0.06);
    color: #2563eb;
    font-size: 14px;
    font-weight: 500;
    margin-top: 20px;
    animation: ${fadeUp} 0.6s ease both;
`;
