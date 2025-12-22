{/* 회원탈퇴 확인 모달 */}

import React, {useEffect, useState} from "react";
import styled from "styled-components";

interface WithdrawalConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function WithdrawalConfirmModal({
                                                   isOpen,
                                                   onClose,
                                                   onConfirm,
                                               }: WithdrawalConfirmModalProps) {
    const [inputValue, setInputValue] = useState("");
    const nickname = localStorage.getItem("nickname") ?? "사용자";
    const requiredPhrase = nickname + " 회원 탈퇴";
    const isMatch = inputValue.trim() === requiredPhrase;

    // ESC 키로 닫기
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <Overlay isOpen={isOpen}>
            <ModalContent isOpen={isOpen}>
                <Title>정말 탈퇴하시겠습니까?</Title>

                <Message>
                    탈퇴 후에는 계정과 데이터가 복구되지 않습니다. <br /> <br />
                    아래 입력창에 <br />
                    <Highlight>{requiredPhrase}</Highlight> <br />
                    를 입력해주세요 <br /> <br />
                    계속 진행하시겠습니까?
                </Message>

                <InputBox
                    type="text"
                    placeholder="문구를 정확히 입력해주세요"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />

                <ButtonGroup>
                    <DangerButton
                        onClick={onConfirm}
                        disabled={!isMatch}
                    >
                        회원탈퇴
                    </DangerButton>
                    <CancelButton onClick={onClose}>취소</CancelButton>
                </ButtonGroup>
            </ModalContent>
        </Overlay>
    );
}

/* ================== styled-components ================== */

const Overlay = styled.div<{ isOpen: boolean }>`
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;

    background: ${({ isOpen }) => (isOpen ? "rgba(0, 0, 0, 0.5)" : "transparent")};
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
    transition: all 0.3s ease-in-out;
`;

const ModalContent = styled.div<{ isOpen: boolean }>`
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 24px;
    width: 360px;
    text-align: center;

    transform: ${({ isOpen }) => (isOpen ? "scale(1)" : "scale(0.95)")};
    transition: all 0.3s ease-in-out;
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 12px;
    color: rgb(17, 24, 39);
`;

const Message = styled.p`
    font-size: 15px;
    color: rgb(75, 85, 99);
    margin-bottom: 16px;
    line-height: 1.6;
`;

const Highlight = styled.span`
    color: red;
    font-weight: bold;
`;

const InputBox = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #dc2626;
        box-shadow: 0 0 0 1px #dc2626;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: center;
    gap: 12px;
`;

const CancelButton = styled.button`
    padding: 10px 20px;
    background: #e5e7eb;
    border: none;
    color: #111827;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;


    transition: background 0.2s ease-in-out;
    &:hover {
        background: #d1d5db;
    }
`;

const DangerButton = styled.button<{ disabled: boolean }>`
  padding: 10px 20px;
  background: ${({ disabled }) => (disabled ? "#fca5a5" : "#dc2626")};
  border: none;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  &:hover {
    background: ${({ disabled }) => (disabled ? "#fca5a5" : "#b91c1c")};
  }
`;
