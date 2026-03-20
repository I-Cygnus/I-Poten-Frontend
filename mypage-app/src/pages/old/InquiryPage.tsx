import React from "react";
import styled, { keyframes } from "styled-components";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { notifySuccess } from "../../utils/toast.ts";

export default function InquiryPage() {
    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText("support@jobspoon.co.kr");
            notifySuccess("이메일 주소가 복사되었습니다 📋");
        } catch (err) {
            console.error(err);
            notifySuccess("복사 실패 — 직접 입력해주세요 😅");
        }
    };

    return (
        <Container>
            <Header>
                <IconBox>
                    <FaEnvelopeOpenText size={42} color="#2563eb" />
                </IconBox>
                <h2>문의하기</h2>
                <p>서비스 이용 중 궁금한 점이나 제안사항이 있다면 언제든 편하게 연락해주세요.</p>
            </Header>

            <ContentBox>
                <InfoCard>
                    <h3>대표 이메일</h3>

                    {/* ✅ 클릭 시 복사 기능 */}
                    <EmailLink onClick={handleCopyEmail}>
                        support@jobspoon.co.kr
                    </EmailLink>

                    <p>클릭 시 이메일 주소가 복사됩니다</p>
                    <p>평일 10:00 ~ 18:00 (점심 12:00 ~ 13:00)</p>
                </InfoCard>

                <GuideBox>
                    <h4>문의 전 확인해주세요</h4>
                    <ul>
                        <li>로그인, 결제, 회원정보 관련 문의는 빠르게 처리됩니다.</li>
                        <li>서비스 개선 제안은 내부 검토 후 반영될 수 있습니다.</li>
                        <li>문의 내용에 따라 답변까지 다소 시간이 소요될 수 있습니다.</li>
                    </ul>
                </GuideBox>
            </ContentBox>
        </Container>
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

const Container = styled.div`
    animation: ${fadeUp} 0.6s ease both;
    padding: 40px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #374151;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 36px;

    h2 {
        font-size: 20px;
        font-weight: 700;
        margin-top: 12px;
        color: #111827;
    }

    p {
        margin-top: 8px;
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
    }
`;

const IconBox = styled.div`
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
`;

const ContentBox = styled.div`
    animation: ${fadeUp} 0.6s ease both;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

/* Apple 스타일 안내 카드 */
const InfoCard = styled.div`
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #111827;
    }

    p {
        margin-top: 6px;
        font-size: 13px;
        color: #6b7280;
    }
`;

/* 클릭 시 복사되는 이메일 링크 */
const EmailLink = styled.button`
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.2);
    color: #2563eb;
    font-weight: 600;
    font-size: 15px;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-block;

    &:hover {
        background: rgba(37, 99, 235, 0.12);
        border-color: rgba(37, 99, 235, 0.3);
    }

    &:active {
        transform: scale(0.98);
    }
`;

const GuideBox = styled.div`
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px 24px;

    h4 {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 10px;
        color: #111827;
    }

    ul {
        list-style: disc;
        padding-left: 20px;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: #6b7280;
        font-size: 13px;
        line-height: 1.5;
    }
`;
