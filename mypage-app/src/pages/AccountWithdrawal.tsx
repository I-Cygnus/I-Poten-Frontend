import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaRegHandshake } from "react-icons/fa"; // 🤝 따뜻한 작별 아이콘
import WithdrawalConfirmModal from "../components/modals/WithdrawalConfirmModal.tsx";
import ServiceModal from "../components/modals/ServiceModal.tsx";
// API imports removed
// import { withdrawAccount } from "../api/profileAppearanceApi.ts";
import { notifySuccess, notifyError, notifyInfo } from "../utils/toast";

export default function AccountWithdrawal() {
    const [reason, setReason] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const navigate = useNavigate();

    const toggleReason = (value: string) => {
        setReason(reason === value ? "" : value);
    };

    const handleWithdrawalClick = () => {
        if (!reason.trim()) {
            notifyInfo("탈퇴 사유를 선택하거나 입력해주세요 📝");
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        // API call removed - mock behavior
        localStorage.removeItem("isLoggedIn");
        notifySuccess("회원 탈퇴가 완료되었습니다 🙏 감사합니다");
        setShowConfirm(false);

        // 1.5초 후 홈으로 이동 (UX 완화)
        setTimeout(() => {
            navigate("/");
        }, 1500);
    };

    return (
        <Container>
            <Header>
                <IconBox>
                    <FaRegHandshake size={42} color="#ef4444" />
                </IconBox>
                <h2>회원 탈퇴</h2>
                <p>
                    JobSpoon을 이용해주셔서 감사합니다.
                    <br /> 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
            </Header>

            <ContentBox>
                <InfoCard>
                    <h3>탈퇴 전 꼭 확인해주세요</h3>
                    <ul>
                        <li>출석, 일정, 신뢰점수 등 모든 활동 데이터가 즉시 삭제됩니다.</li>
                        <li>동일 이메일로 재가입해도 기존 데이터는 복구되지 않습니다.</li>
                        <li>진행 중인 스터디가 있다면 탈퇴 전 종료를 권장합니다.</li>
                    </ul>
                </InfoCard>

                <GuideBox>
                    <h4>탈퇴 사유를 선택해주세요</h4>
                    <Form>
                        <Option
                            onClick={() => toggleReason("서비스가 기대에 미치지 못함")}
                            active={reason === "서비스가 기대에 미치지 못함"}
                        >
                            서비스가 기대에 미치지 못함
                        </Option>
                        <Option
                            onClick={() => toggleReason("사용 빈도가 낮음")}
                            active={reason === "사용 빈도가 낮음"}
                        >
                            사용 빈도가 낮음
                        </Option>
                        <Option
                            onClick={() => toggleReason("개인정보 보호 우려")}
                            active={reason === "개인정보 보호 우려"}
                        >
                            개인정보 보호 우려
                        </Option>

                        <OtherBox active={reason.startsWith("기타:")}>
                            기타:
                            <input
                                type="text"
                                placeholder="직접 입력"
                                value={reason.startsWith("기타:") ? reason.replace("기타:", "") : ""}
                                onFocus={() => {
                                    if (!reason.startsWith("기타:")) setReason("기타:");
                                }}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setReason(value ? `기타:${value}` : "");
                                }}
                            />
                        </OtherBox>
                    </Form>
                </GuideBox>

                <ButtonGroup>
                    <WithdrawButton onClick={handleWithdrawalClick}>
                        회원 탈퇴하기
                    </WithdrawButton>
                    <CancelButton onClick={() => navigate("/mypage")}>취소</CancelButton>
                </ButtonGroup>
            </ContentBox>

            <WithdrawalConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
            />

            {showServiceModal && (
                <ServiceModal
                    isOpen={showServiceModal}
                    onClose={() => setShowServiceModal(false)}
                />
            )}
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
    background: rgba(248, 113, 113, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
`;

const ContentBox = styled.div`
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: ${fadeUp} 0.6s ease both;
`;

/* Apple 스타일 안내 카드 */
const InfoCard = styled.div`
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    text-align: left;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

    h3 {
        font-size: 15px;
        font-weight: 600;
        color: #111827;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 13px;
        color: #475569;
        line-height: 1.6;

        li + li {
            margin-top: 4px;
        }
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
`;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Option = styled.div<{ active: boolean }>`
    padding: 12px 16px;
    border: 2px solid ${({ active }) => (active ? "#ef4444" : "#e5e7eb")};
    border-radius: 10px;
    cursor: pointer;
    background: ${({ active }) => (active ? "rgba(248,113,113,0.05)" : "white")};
    font-size: 15px;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s ease;

    &:hover {
        background: #f9fafb;
    }
`;

const OtherBox = styled.label<{ active?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;

    input {
        flex: 1;
        border: 2px solid ${({ active }) => (active ? "#ef4444" : "#e5e7eb")};
        border-radius: 10px;
        padding: 6px 8px;
        transition: all 0.2s ease;
        font-size: 14px;

        &:focus {
            outline: none;
            border-color: #ef4444;
        }
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
`;

const WithdrawButton = styled.button`
    background: #ef4444;
    color: white;
    padding: 10px 22px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: #dc2626;
    }
`;

const CancelButton = styled.button`
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
    padding: 10px 22px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background: #f3f4f6;
    }
`;
