/* ====================== 회원가입 / 탈퇴 메일 프리뷰 (가운데 정렬 버전) ====================== */

import React from "react";
import styled from "styled-components";

const COLORS = ["#20A4AD", "#2998C5", "#13B38D"];

export default function MailTemplatePreview() {
    return (
        <Wrapper>

            <div style={{ display: "flex", gap: "8px", padding: "20px" }}>
                {COLORS.map((color) => (
                    <div
                        key={color}
                        style={{
                            width: "60px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: color,
                            boxShadow: "0 0 4px rgba(0,0,0,0.15)",
                            border: "1px solid rgba(0,0,0,0.05)",
                        }}
                        title={color}
                    />
                ))}
            </div>

            {/* ===== 회원가입 메일 ===== */}
            <MailPreview>
                <MailHeader>회원가입 완료 메일</MailHeader>
                <MailBody>
                    <Section>
                        <Intro>
                            <Brand>JobSpoon</Brand>에 오신 것을 진심으로 환영합니다
                        </Intro>
                        <Paragraph>
                            당신의 취업 준비 여정을 함께할 든든한 파트너가 되어드릴게요.<br />
                            지금 바로 아래 가이드와 함께 시작해보세요.
                        </Paragraph>

                        <GuideList>
                            <li><b>마이페이지 설정하기</b> — 프로필과 관심 분야를 등록해보세요.</li>
                            <li><b>AI 면접 체험하기</b> — 실전 대비 모의 면접으로 연습하세요.</li>
                            <li><b>신뢰점수 살펴보기</b> — 활동에 따라 성장하는 나의 신뢰 지수를 확인해보세요.</li>
                        </GuideList>

                        <HighlightBox>
                            <HighlightTitle>신뢰점수 & 레벨 시스템</HighlightTitle>
                            <p>
                                JobSpoon은 활동 기반 신뢰점수를 통해 성장 과정을 시각화합니다.<br />
                                꾸준함이 쌓일수록 레벨이 오르고, 칭호와 혜택이 함께 열립니다.
                            </p>
                        </HighlightBox>

                        <MailButton href="#">시작하기</MailButton>

                        <Footer>
                            본 메일은 발신 전용입니다. 궁금한 점은 <Brand>문의하기</Brand> 페이지를 이용해주세요.<br />
                            © 2025 JobSpoon. All rights reserved.
                        </Footer>
                    </Section>
                </MailBody>
            </MailPreview>

            {/* ===== 회원탈퇴 메일 ===== */}
            <MailPreview>
                <MailHeader>회원탈퇴 확인 메일</MailHeader>
                <MailBody>
                    <Section>
                        <Intro>그동안 <Brand>JobSpoon</Brand>을 이용해주셔서 진심으로 감사합니다.</Intro>
                        <Paragraph>
                            회원 탈퇴가 정상적으로 처리되었습니다.<br />
                            계정 정보 및 이용 기록은 <b>7일간 보관 후 완전히 삭제</b>됩니다.
                        </Paragraph>

                        <Divider />

                        <Paragraph>
                            당신의 취업 준비 여정에 함께할 수 있어 영광이었습니다.<br />
                            언제든 다시 돌아오신다면, 이전보다 더 나은 JobSpoon으로 맞이하겠습니다.
                        </Paragraph>

                        <MailButton href="#">다시 가입하기</MailButton>

                        <Footer>
                            본 메일은 발신 전용입니다.<br />
                            재가입 문의: support@jobspoon.com
                        </Footer>
                    </Section>
                </MailBody>
            </MailPreview>
        </Wrapper>
    );
}

/* ====================== styled-components ====================== */

const Wrapper = styled.section`
    padding: 40px;
    background: #f3f4f6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    min-height: 100vh;
`;

const MailPreview = styled.div`
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    max-width: 640px;
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const MailHeader = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    margin-bottom: 16px;
`;

const MailBody = styled.div`
    background: white;
    border-radius: 10px;
    padding: 32px 28px;
    color: #374151;
    line-height: 1.7;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    text-align: center; /* ✅ 전체 중앙 정렬 */
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center; /* ✅ 내부 요소 중앙 정렬 */
    gap: 20px;
`;

const Intro = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: #111827;
`;

const Paragraph = styled.p`
    font-size: 14px;
    color: #374151;
    margin: 0;
`;

const GuideList = styled.ul`
    font-size: 14px;
    color: #1f2937;
    list-style: none;
    padding-left: 0;
    display: flex;
    flex-direction: column;
    align-items: center; /* ✅ 리스트 항목 중앙 정렬 */
    gap: 6px;

    li {
        line-height: 1.6;
    }
`;

const HighlightBox = styled.div`
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 16px;
    border-radius: 10px;
    font-size: 14px;
    color: #1e3a8a;
    text-align: center; /* ✅ 가운데 정렬 */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    width: 90%;
`;

const HighlightTitle = styled.div`
    font-weight: 700;
    margin-bottom: 6px;
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 10px 0;
    width: 80%;
`;

const Brand = styled.span`
    color: #2563eb;
    font-weight: 700;
`;

const MailButton = styled.a`
    display: inline-block;
    background: #2563eb;
    color: white;
    font-weight: 600;
    padding: 10px 22px;
    border-radius: 8px;
    text-decoration: none;
    margin-top: 8px;
    transition: background 0.2s;
    text-align: center;

    &:hover {
        background: #1d4ed8;
    }
`;

const Footer = styled.div`
    margin-top: 32px;
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
`;
